/**
 * Skill Model Type Definitions
 *
 * Science-backed student model using:
 * - Bayesian Knowledge Tracing (BKT) for mastery estimation
 * - FSRS for spaced repetition and forgetting curves
 * - IRT for adaptive difficulty
 * - Bloom's Taxonomy for cognitive level progression
 */

import type { BloomLevel } from '../data/skillTaxonomy';
import type { QuestionType } from '../types';

// ─── BKT Parameters ──────────────────────────────────────────────────────────

export interface BKTParams {
  /** P(L0): Probability student already knows the skill before any practice */
  pL0: number;
  /** P(T): Probability of transitioning from unmastered to mastered on each opportunity */
  pT: number;
  /** P(G): Probability of answering correctly despite NOT knowing */
  pG: number;
  /** P(S): Probability of answering incorrectly despite KNOWING */
  pS: number;
}

/** BKT parameter family identifier, keyed by Bloom level + knowledge type */
export type BKTFamily =
  | 'remember-factual'
  | 'understand-conceptual'
  | 'apply-procedural'
  | 'analyze-evaluate'
  | 'create'
  | 'default';

// ─── KC State (per knowledge component per student) ──────────────────────────

export interface KCState {
  kcId: string;

  // BKT state
  /** P(L) - probability skill is mastered [0,1] */
  pLearned: number;

  // FSRS state
  /** S - memory stability in days (time for R to drop to 0.9) */
  stability: number;
  /** D - FSRS difficulty [1,10] */
  difficulty: number;
  /** ISO timestamp of last practice */
  lastPractice: string;

  // PFA counts (supplementary)
  /** Count of prior successes on this KC */
  successCount: number;
  /** Count of prior failures on this KC */
  failureCount: number;

  // Bloom progression
  /** Highest Bloom level demonstrated (1-6) */
  bloomLevelReached: BloomLevel;
}

// ─── Mastery Classification ──────────────────────────────────────────────────

export type MasteryLevel =
  | 'not-started'   // no attempts
  | 'struggling'    // P(L) < 0.4 or effective < 0.3
  | 'developing'    // P(L) 0.4-0.7
  | 'proficient'    // P(L) 0.7-0.95
  | 'mastered'      // P(L) >= 0.95 AND R > 0.7
  | 'decaying';     // P(L) >= 0.7 BUT R < 0.5 (needs review)

// ─── Review Queue ────────────────────────────────────────────────────────────

export interface ReviewItem {
  kcId: string;
  /** ISO date string for next scheduled review */
  nextReviewDate: string;
  /** Computed interval in days */
  intervalDays: number;
}

// ─── Attempt Record (new format) ─────────────────────────────────────────────

export interface SkillAttemptRecord {
  id: string;
  timestamp: string;        // ISO timestamp
  questionId: number;
  kcIds: string[];           // which KCs this question tests
  bloomLevel: BloomLevel;
  correct: boolean;
  responseTimeMs: number;
  questionType: QuestionType;

  // Context
  lessonSlug: string;
  subjectSlug: string;
}

// ─── Student Model (top-level persisted state) ───────────────────────────────

export interface StudentModel {
  version: 2;
  lastUpdated: string;      // ISO timestamp

  /** Per-KC mastery state */
  kcs: Record<string, KCState>;

  /** Global ability estimate per domain (IRT theta) */
  domainTheta: Record<string, number>;

  /** Raw attempt log for analytics/visualization */
  attempts: SkillAttemptRecord[];

  /** Spaced repetition schedule */
  reviewQueue: ReviewItem[];
}

// ─── Prerequisite Graph ──────────────────────────────────────────────────────

export interface KCNode {
  id: string;
  nameAr: string;
  nameEn: string;
  domain: string;
  unit: string;
  bloomLevels: BloomLevel[];
  bktFamily: BKTFamily;
}

export interface PrerequisiteEdge {
  from: string;   // prerequisite KC id
  to: string;     // dependent KC id
  strength: 'hard' | 'soft';
}

export interface KCGraph {
  nodes: KCNode[];
  edges: PrerequisiteEdge[];
}

// ─── Mastery Color Scheme ────────────────────────────────────────────────────

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  'not-started': '#E0E0E0',
  'struggling':  '#BDD7E7',
  'developing':  '#6BAED6',
  'proficient':  '#2171B5',
  'mastered':    '#08306B',
  'decaying':    '#E6550D',
};

// ─── Factory Functions ───────────────────────────────────────────────────────

export function createInitialKCState(kcId: string, pL0 = 0.1): KCState {
  return {
    kcId,
    pLearned: pL0,
    stability: 1.0,     // 1 day initial stability
    difficulty: 5.0,     // mid-range
    lastPractice: new Date().toISOString(),
    successCount: 0,
    failureCount: 0,
    bloomLevelReached: 1,
  };
}

export function createEmptyStudentModel(): StudentModel {
  return {
    version: 2,
    lastUpdated: new Date().toISOString(),
    kcs: {},
    domainTheta: {},
    attempts: [],
    reviewQueue: [],
  };
}
