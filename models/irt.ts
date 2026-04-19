/**
 * Item Response Theory (IRT) - Adaptive Difficulty
 *
 * Uses a simplified 3PL model with ELO-like theta updates.
 * Theta = student ability estimate per domain.
 * Each item has difficulty (b), discrimination (a), and guessing (c) parameters.
 *
 * Bloom levels map to default difficulty values.
 * Theta updates use an adaptive learning rate that decreases with more data.
 */

import type { BloomLevel } from '../data/skillTaxonomy';
import type { KCState } from './types';

// ─── Bloom Level to IRT Difficulty Mapping ───────────────────────────────────

export const BLOOM_TO_IRT_DIFFICULTY: Record<BloomLevel, number> = {
  1: -1.5,  // Remember: easy recall
  2: -0.5,  // Understand: basic comprehension
  3:  0.0,  // Apply: standard application
  4:  0.8,  // Analyze: requires decomposition
  5:  1.5,  // Evaluate: requires judgment
  6:  2.0,  // Create: hardest, generative
};

// ─── Default item parameters ─────────────────────────────────────────────────

/** Default discrimination parameter */
const DEFAULT_DISCRIMINATION = 1.0;

/** Default guessing parameter for 4-option MCQ */
const DEFAULT_GUESSING_MCQ = 0.25;

/** Default guessing for non-MCQ */
const DEFAULT_GUESSING_OPEN = 0.05;

// ─── 3PL Probability ─────────────────────────────────────────────────────────

/**
 * 3PL Item Response Theory probability.
 *
 * P(correct | theta) = c + (1 - c) / (1 + e^(-a * (theta - b)))
 *
 * @param theta - Student ability estimate
 * @param difficulty - Item difficulty (b)
 * @param discrimination - Item discrimination (a), default 1.0
 * @param guessing - Pseudo-guessing parameter (c), default 0.25 for MCQ
 */
export function iртProbability(
  theta: number,
  difficulty: number,
  discrimination = DEFAULT_DISCRIMINATION,
  guessing = DEFAULT_GUESSING_MCQ,
): number {
  const exponent = -discrimination * (theta - difficulty);
  return guessing + (1 - guessing) / (1 + Math.exp(exponent));
}

// Alias with ASCII-safe name
export const irtProbability = iртProbability;

// ─── Theta Update (ELO-like) ─────────────────────────────────────────────────

/**
 * Update student ability estimate after a response.
 *
 * Uses adaptive learning rate K that starts high (0.4) and decays
 * with more data, stabilizing at 0.1. This matches ELO rating systems
 * and is used in practice by many adaptive learning platforms.
 *
 * theta_new = theta_old + K * (observed - expected)
 *
 * @param currentTheta - Current ability estimate
 * @param itemDifficulty - Item difficulty (from Bloom level or calibrated)
 * @param correct - Whether the student answered correctly
 * @param attemptCount - Total number of attempts in this domain
 * @param isMCQ - Whether the question is multiple-choice (affects guessing param)
 */
export function updateTheta(
  currentTheta: number,
  itemDifficulty: number,
  correct: boolean,
  attemptCount: number,
  isMCQ = true,
): number {
  // Adaptive learning rate: high early, decreasing with more data
  const K = Math.max(0.1, 0.4 * Math.exp(-0.05 * attemptCount));

  const guessing = isMCQ ? DEFAULT_GUESSING_MCQ : DEFAULT_GUESSING_OPEN;
  const expected = irtProbability(currentTheta, itemDifficulty, DEFAULT_DISCRIMINATION, guessing);

  const observed = correct ? 1 : 0;
  return currentTheta + K * (observed - expected);
}

// ─── Bloom Level Gating ──────────────────────────────────────────────────────

/**
 * Determine the appropriate Bloom level for the next question on a KC.
 *
 * Students must demonstrate mastery at lower Bloom levels before
 * receiving higher-level questions. Requires P(L) >= 0.7 at current
 * level to progress.
 *
 * @param kcState - Current KC state
 * @param maxBloomAvailable - Highest Bloom level available for this KC
 */
export function getAppropriateBloomLevel(
  kcState: KCState,
  maxBloomAvailable: BloomLevel = 6,
): BloomLevel {
  const current = kcState.bloomLevelReached || 1;

  // Must have P(L) >= 0.7 at current level to attempt next level
  if (kcState.pLearned >= 0.7 && current < maxBloomAvailable) {
    return Math.min(current + 1, 6) as BloomLevel;
  }

  return current as BloomLevel;
}

/**
 * Get the IRT difficulty for a question based on its Bloom level.
 */
export function getItemDifficulty(bloomLevel: BloomLevel): number {
  return BLOOM_TO_IRT_DIFFICULTY[bloomLevel] ?? 0;
}
