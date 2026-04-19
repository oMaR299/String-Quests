/**
 * Skill Model - Science-backed learning analytics
 *
 * Re-exports all model functions for convenient imports.
 */

// Types
export type {
  BKTParams,
  BKTFamily,
  KCState,
  MasteryLevel,
  ReviewItem,
  SkillAttemptRecord,
  StudentModel,
  KCNode,
  PrerequisiteEdge,
  KCGraph,
} from './types';

export {
  MASTERY_COLORS,
  createInitialKCState,
  createEmptyStudentModel,
} from './types';

// BKT
export {
  BKT_PARAM_FAMILIES,
  getBKTFamily,
  getBKTParams,
  updateBKT,
  isMastered,
  predictCorrect,
} from './bkt';

// FSRS
export {
  getRetrievability,
  getEffectiveMastery,
  updateStability,
  scheduleNextReview,
  getDailyReviewQueue,
  flagDecayingKCs,
  daysSince,
} from './fsrs';

// IRT
export {
  BLOOM_TO_IRT_DIFFICULTY,
  irtProbability,
  updateTheta,
  getAppropriateBloomLevel,
  getItemDifficulty,
} from './irt';

// Mastery Classifier
export {
  classifyMastery,
  getMasteryScore,
  getMasterySummary,
  getDomainMastery,
  getRecommendedAction,
} from './masteryClassifier';
