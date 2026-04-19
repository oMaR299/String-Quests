/**
 * Bayesian Knowledge Tracing (BKT)
 *
 * Corbett & Anderson, 1995. Models learning as a hidden Markov process
 * with two latent states: "mastered" and "not mastered."
 *
 * Four parameters per skill family:
 * - P(L0): prior knowledge
 * - P(T):  learn rate (transition probability)
 * - P(G):  guess probability
 * - P(S):  slip probability
 */

import type { BKTFamily, BKTParams, KCState } from './types';
import type { BloomLevel } from '../data/skillTaxonomy';

// ─── Parameter Families ──────────────────────────────────────────────────────
// Instead of fitting per-KC (requires large datasets), we use parameter families
// based on Bloom level + knowledge type. Research shows this works nearly as well
// as individually fitted parameters for small-dataset scenarios.

export const BKT_PARAM_FAMILIES: Record<BKTFamily, BKTParams> = {
  // Factual recall (MCQ, definitions) - higher guess rate for MCQ
  'remember-factual':      { pL0: 0.10, pT: 0.20, pG: 0.25, pS: 0.10 },

  // Conceptual understanding - moderate guess, moderate learn
  'understand-conceptual': { pL0: 0.05, pT: 0.15, pG: 0.20, pS: 0.10 },

  // Procedural application (math problems) - lower guess, slower learn
  'apply-procedural':      { pL0: 0.05, pT: 0.10, pG: 0.15, pS: 0.12 },

  // Analysis and evaluation - hard to guess, slow to learn
  'analyze-evaluate':      { pL0: 0.02, pT: 0.08, pG: 0.10, pS: 0.15 },

  // Open-ended / creation - very hard to guess
  'create':                { pL0: 0.01, pT: 0.05, pG: 0.05, pS: 0.10 },

  // Default fallback
  'default':               { pL0: 0.10, pT: 0.15, pG: 0.20, pS: 0.10 },
};

/** Map a Bloom level to its BKT parameter family */
export function getBKTFamily(bloomLevel: BloomLevel): BKTFamily {
  switch (bloomLevel) {
    case 1: return 'remember-factual';
    case 2: return 'understand-conceptual';
    case 3: return 'apply-procedural';
    case 4:
    case 5: return 'analyze-evaluate';
    case 6: return 'create';
    default: return 'default';
  }
}

/** Get BKT parameters for a given family */
export function getBKTParams(family: BKTFamily): BKTParams {
  return BKT_PARAM_FAMILIES[family] ?? BKT_PARAM_FAMILIES['default'];
}

// ─── Core BKT Update ─────────────────────────────────────────────────────────

/**
 * Update BKT mastery estimate after a single student response.
 *
 * Algorithm:
 * 1. Predict P(correct) given current P(L)
 * 2. Bayesian posterior update based on observed response
 * 3. Account for learning transition
 *
 * @returns Updated KCState with new pLearned
 */
export function updateBKT(
  state: KCState,
  correct: boolean,
  params: BKTParams,
): KCState {
  const pL = state.pLearned;
  const { pT, pG, pS } = params;

  // Step 1: Predicted probability of correct response
  const pCorrect = pL * (1 - pS) + (1 - pL) * pG;

  // Guard against division by zero
  const safeCorrect = Math.max(pCorrect, 0.001);
  const safeIncorrect = Math.max(1 - pCorrect, 0.001);

  // Step 2: Bayesian posterior update
  let pLGivenObs: number;
  if (correct) {
    pLGivenObs = (pL * (1 - pS)) / safeCorrect;
  } else {
    pLGivenObs = (pL * pS) / safeIncorrect;
  }

  // Step 3: Learning transition (can only learn, not unlearn in standard BKT)
  const pLNew = pLGivenObs + (1 - pLGivenObs) * pT;

  // Clamp to [0, 1]
  const clamped = Math.max(0, Math.min(1, pLNew));

  return {
    ...state,
    pLearned: clamped,
    successCount: state.successCount + (correct ? 1 : 0),
    failureCount: state.failureCount + (correct ? 0 : 1),
  };
}

/**
 * Check if a KC is considered "mastered" by BKT standards.
 * Standard threshold from Cognitive Tutor research: P(L) >= 0.95
 */
export function isMastered(pLearned: number, threshold = 0.95): boolean {
  return pLearned >= threshold;
}

/**
 * Predict probability of correct response given current mastery state.
 */
export function predictCorrect(pLearned: number, params: BKTParams): number {
  return pLearned * (1 - params.pS) + (1 - pLearned) * params.pG;
}
