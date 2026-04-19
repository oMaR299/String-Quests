/**
 * FSRS - Free Spaced Repetition Scheduler
 *
 * Based on the DSR (Difficulty, Stability, Retrievability) model of memory.
 * Integrated into Anki 23.10+ (Jarrett Ye, 2023).
 *
 * Key concepts:
 * - Stability (S): days for retrievability R to drop from 1.0 to 0.9
 * - Retrievability (R): probability of recall at time t since last review
 * - Difficulty (D): inherent difficulty of the card [1, 10]
 *
 * Uses a power forgetting curve (better empirical fit than pure exponential):
 *   R(t) = (1 + F * t / S) ^ C
 *   where F = 19/81, C = -0.5
 */

import type { KCState, ReviewItem } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

/** FSRS forgetting curve factor */
const F = 19 / 81;

/** FSRS forgetting curve exponent */
const C = -0.5;

/** Minimum allowed stability in days */
const MIN_STABILITY = 0.4;

/** Maximum allowed stability in days */
const MAX_STABILITY = 365;

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Compute retrievability (probability of recall) at time t since last review.
 *
 * R(t, S) = (1 + F * t / S) ^ C
 *
 * At t = 0: R = 1.0 (just reviewed)
 * At t = S: R = 0.9 (90% recall)
 * At t = 4S: R ~ 0.78
 * At t = 16S: R ~ 0.63
 */
export function getRetrievability(state: KCState, now: Date): number {
  const elapsed = daysSince(state.lastPractice, now);
  if (elapsed <= 0) return 1.0;

  const S = Math.max(state.stability, MIN_STABILITY);
  return Math.pow(1 + F * elapsed / S, C);
}

/**
 * Compute effective mastery: P(learned) * P(can recall right now).
 *
 * P(L) captures whether the student ever properly understood the concept.
 * R(t, S) captures whether they can currently access that knowledge.
 */
export function getEffectiveMastery(state: KCState, now: Date): number {
  return state.pLearned * getRetrievability(state, now);
}

/**
 * Update FSRS stability and difficulty after a review.
 *
 * Simplified from the full FSRS v5 formulas to avoid the 19-parameter model,
 * while preserving the core dynamics:
 * - Success: stability grows (more for hard items, less for already-stable items)
 * - Failure: stability drops (post-lapse stability)
 */
export function updateStability(
  state: KCState,
  correct: boolean,
  now: Date,
): KCState {
  const elapsed = daysSince(state.lastPractice, now);
  const R = elapsed > 0 ? getRetrievability(state, now) : 1.0;
  const S = state.stability;
  const D = state.difficulty;

  let newS: number;
  let newD: number;

  if (correct) {
    // Stability growth after successful recall
    const difficultyFactor = 11 - D;                       // Easier items grow faster
    const stabilityDecay = Math.pow(S, -0.2);              // Already-stable items grow slower
    const retrievabilityBonus = Math.exp(0.9 * (1 - R)) - 1; // Reviewing at lower R yields more growth

    const growthFactor = 1 + Math.exp(1.5) * difficultyFactor * stabilityDecay * retrievabilityBonus;
    newS = clamp(S * Math.max(growthFactor, 1.1), MIN_STABILITY, MAX_STABILITY);

    // Difficulty decreases slightly on success
    newD = clamp(D - 0.3, 1, 10);
  } else {
    // Post-lapse stability: significant drop
    newS = clamp(S * 0.5, MIN_STABILITY, MAX_STABILITY);

    // Difficulty increases on failure
    newD = clamp(D + 0.5, 1, 10);
  }

  return {
    ...state,
    stability: newS,
    difficulty: newD,
    lastPractice: now.toISOString(),
  };
}

// ─── Review Scheduling ───────────────────────────────────────────────────────

/**
 * Compute the optimal review interval for a target retention rate.
 *
 * I(R_target, S) = (S / F) * (R_target^(1/C) - 1)
 *
 * When targetRetention = 0.9 and interval = S, R drops to exactly 0.9.
 */
export function scheduleNextReview(
  state: KCState,
  targetRetention = 0.9,
): ReviewItem {
  const S = Math.max(state.stability, MIN_STABILITY);

  // FSRS optimal interval formula
  const interval = (S / F) * (Math.pow(targetRetention, 1 / C) - 1);
  const days = Math.max(1, Math.round(interval));

  const nextDate = new Date(state.lastPractice);
  nextDate.setDate(nextDate.getDate() + days);

  return {
    kcId: state.kcId,
    nextReviewDate: nextDate.toISOString(),
    intervalDays: days,
  };
}

/**
 * Get KCs that are due for review, sorted by urgency.
 * Most overdue (relative to their interval) come first.
 */
export function getDailyReviewQueue(
  reviewQueue: ReviewItem[],
  now: Date,
): string[] {
  const nowMs = now.getTime();

  return reviewQueue
    .filter(item => new Date(item.nextReviewDate).getTime() <= nowMs)
    .sort((a, b) => {
      // Urgency = how overdue relative to interval
      const aOverdue = daysSince(a.nextReviewDate, now) / Math.max(a.intervalDays, 1);
      const bOverdue = daysSince(b.nextReviewDate, now) / Math.max(b.intervalDays, 1);
      return bOverdue - aOverdue; // Most overdue first
    })
    .map(item => item.kcId);
}

/**
 * Check all KCs for decay and ensure decaying ones are in the review queue.
 * Called on app load.
 */
export function flagDecayingKCs(
  kcs: Record<string, KCState>,
  reviewQueue: ReviewItem[],
  now: Date,
): ReviewItem[] {
  const queueSet = new Set(reviewQueue.map(r => r.kcId));
  const newItems: ReviewItem[] = [];

  for (const kc of Object.values(kcs)) {
    if (queueSet.has(kc.kcId)) continue;

    const R = getRetrievability(kc, now);
    // Decaying: was learned (P(L) > 0.5) but recall is fading (R < 0.7)
    if (R < 0.7 && kc.pLearned > 0.5) {
      newItems.push({
        kcId: kc.kcId,
        nextReviewDate: now.toISOString(), // Due now
        intervalDays: 1,
      });
    }
  }

  return [...reviewQueue, ...newItems];
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Calculate days elapsed between two dates/timestamps */
export function daysSince(from: string | Date, to: Date): number {
  const fromMs = typeof from === 'string' ? new Date(from).getTime() : from.getTime();
  const toMs = to.getTime();
  return Math.max(0, (toMs - fromMs) / (1000 * 60 * 60 * 24));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
