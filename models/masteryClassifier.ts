/**
 * Mastery Classifier
 *
 * Combines BKT's P(L) with FSRS retrievability to classify
 * each knowledge component into one of 6 mastery levels.
 *
 * Decision rules:
 * - P_effective = P(L) * R(t, S)
 * - Mastered: P(L) >= 0.95 AND R > 0.7
 * - Decaying: P(L) >= 0.7 BUT R < 0.5 (was learned, needs review)
 * - Proficient: P(L) 0.7-0.95
 * - Developing: P(L) 0.4-0.7
 * - Struggling: P(L) < 0.4
 * - Not Started: no attempts
 */

import type { KCState, MasteryLevel } from './types';
import { getRetrievability, getEffectiveMastery } from './fsrs';

// ─── Classification ──────────────────────────────────────────────────────────

/**
 * Classify a KC's mastery level based on BKT state and current retrievability.
 */
export function classifyMastery(state: KCState, now: Date): MasteryLevel {
  // No attempts = not started
  if (state.successCount === 0 && state.failureCount === 0) {
    return 'not-started';
  }

  const R = getRetrievability(state, now);
  const pL = state.pLearned;

  // Mastered: high confidence + still accessible in memory
  if (pL >= 0.95 && R > 0.7) return 'mastered';

  // Decaying: was learned but memory is fading
  if (pL >= 0.7 && R < 0.5) return 'decaying';

  // Proficient: good understanding, recall OK
  if (pL >= 0.7) return 'proficient';

  // Developing: some understanding
  if (pL >= 0.4) return 'developing';

  // Struggling: low mastery
  return 'struggling';
}

/**
 * Get a numeric mastery score (0-100) for display purposes.
 * This is the effective mastery (P(L) * R) mapped to a percentage.
 */
export function getMasteryScore(state: KCState, now: Date): number {
  return Math.round(getEffectiveMastery(state, now) * 100);
}

/**
 * Classify all KCs and return summary counts.
 */
export function getMasterySummary(
  kcs: Record<string, KCState>,
  now: Date,
): Record<MasteryLevel, number> {
  const counts: Record<MasteryLevel, number> = {
    'not-started': 0,
    'struggling': 0,
    'developing': 0,
    'proficient': 0,
    'mastered': 0,
    'decaying': 0,
  };

  for (const kc of Object.values(kcs)) {
    const level = classifyMastery(kc, now);
    counts[level]++;
  }

  return counts;
}

/**
 * Get domain-level mastery by averaging effective mastery of all KCs in a domain.
 */
export function getDomainMastery(
  kcs: Record<string, KCState>,
  kcDomainMap: Record<string, string>, // kcId -> domain
  now: Date,
): Record<string, { score: number; total: number; attempted: number }> {
  const domains: Record<string, { sum: number; total: number; attempted: number }> = {};

  for (const [kcId, domain] of Object.entries(kcDomainMap)) {
    if (!domains[domain]) {
      domains[domain] = { sum: 0, total: 0, attempted: 0 };
    }
    domains[domain].total++;

    const state = kcs[kcId];
    if (state && (state.successCount > 0 || state.failureCount > 0)) {
      domains[domain].sum += getEffectiveMastery(state, now);
      domains[domain].attempted++;
    }
  }

  const result: Record<string, { score: number; total: number; attempted: number }> = {};
  for (const [domain, data] of Object.entries(domains)) {
    result[domain] = {
      score: data.attempted > 0 ? Math.round((data.sum / data.attempted) * 100) : 0,
      total: data.total,
      attempted: data.attempted,
    };
  }

  return result;
}

/**
 * Determine action recommendations based on mastery level.
 */
export function getRecommendedAction(level: MasteryLevel): {
  actionEn: string;
  actionAr: string;
  priority: 'high' | 'medium' | 'low' | 'none';
} {
  switch (level) {
    case 'not-started':
      return { actionEn: 'Start learning', actionAr: 'ابدأ التعلم', priority: 'medium' };
    case 'struggling':
      return { actionEn: 'Practice more', actionAr: 'تدرب أكثر', priority: 'high' };
    case 'developing':
      return { actionEn: 'Keep practicing', actionAr: 'واصل التدريب', priority: 'medium' };
    case 'proficient':
      return { actionEn: 'Almost there!', actionAr: 'أوشكت!', priority: 'low' };
    case 'mastered':
      return { actionEn: 'Well done!', actionAr: 'أحسنت!', priority: 'none' };
    case 'decaying':
      return { actionEn: 'Review needed', actionAr: 'يحتاج مراجعة', priority: 'high' };
  }
}
