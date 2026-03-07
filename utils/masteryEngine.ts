import { AttemptRecord, loadAttempts } from './skillMapStorage';
import { SKILL_TAXONOMY, SkillDef, BloomLevel, SUBJECT_CATEGORIES, getSkillsBySubject } from '../data/skillTaxonomy';

// Mastery status labels
export type MasteryStatus = 'unstarted' | 'attempted' | 'developing' | 'proficient' | 'mastered';

export function getMasteryStatus(score: number, attemptCount: number): MasteryStatus {
  if (attemptCount === 0) return 'unstarted';
  if (score < 40) return 'attempted';
  if (score < 70) return 'developing';
  if (score < 90) return 'proficient';
  return 'mastered';
}

export const MASTERY_COLORS: Record<MasteryStatus, string> = {
  unstarted: '#94a3b8',   // slate-400
  attempted: '#ef4444',    // red-500
  developing: '#f59e0b',   // amber-500
  proficient: '#22c55e',   // green-500
  mastered: '#eab308',     // gold/yellow-500
};

// Per-skill mastery result
export interface SkillMastery {
  skill: SkillDef;
  masteryScore: number;       // 0-100
  status: MasteryStatus;
  attemptCount: number;
  metrics: {
    accuracy: number;           // 0-100
    consistency: number;        // 0-100
    retention: number;          // 0-100
    confidenceCalibration: number; // 0-100
    growthVelocity: number;     // 0-100
    cognitiveDepth: number;     // 0-100
  };
  lastAttemptAt: number | null;
  attempts: AttemptRecord[];
}

// Compute mastery for a single skill
export function computeSkillMastery(skill: SkillDef, allAttempts: AttemptRecord[]): SkillMastery {
  const attempts = allAttempts.filter(a => a.questionId === skill.questionId);
  const count = attempts.length;

  if (count === 0) {
    return {
      skill,
      masteryScore: 0,
      status: 'unstarted',
      attemptCount: 0,
      metrics: { accuracy: 0, consistency: 0, retention: 0, confidenceCalibration: 0, growthVelocity: 0, cognitiveDepth: 0 },
      lastAttemptAt: null,
      attempts: [],
    };
  }

  // 1. Accuracy (35%) - percentage of correct answers
  const correctCount = attempts.filter(a => a.isCorrect).length;
  const accuracy = (correctCount / count) * 100;

  // 2. Consistency (15%) - inverse of performance variance
  const scores = attempts.map(a => a.maxPoints > 0 ? (a.pointsAwarded / a.maxPoints) * 100 : 0);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.length > 1
    ? scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / (scores.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  // Max stdDev for 0-100 range is ~50, normalize
  const consistency = Math.max(0, 100 - stdDev * 2);

  // 3. Retention (15%) - review mode score vs first attempt
  const reviewAttempts = attempts.filter(a => a.isReviewMode);
  const nonReviewAttempts = attempts.filter(a => !a.isReviewMode);
  let retention = 50; // neutral default
  if (reviewAttempts.length > 0 && nonReviewAttempts.length > 0) {
    const reviewCorrectRate = reviewAttempts.filter(a => a.isCorrect).length / reviewAttempts.length;
    retention = reviewCorrectRate * 100;
  } else if (nonReviewAttempts.length > 0) {
    // No review needed means good retention
    const latestCorrect = nonReviewAttempts[nonReviewAttempts.length - 1]?.isCorrect;
    retention = latestCorrect ? 80 : 30;
  }

  // 4. Confidence Calibration (10%) - alignment between confidence and correctness
  let confidenceCalibration = 50;
  if (count > 0) {
    let calibrationScore = 0;
    for (const a of attempts) {
      if (a.confidence === 'sure' && a.isCorrect) calibrationScore += 1;       // Good calibration
      else if (a.confidence === 'unsure' && !a.isCorrect) calibrationScore += 0.5; // Knows limits
      else if (a.confidence === 'sure' && !a.isCorrect) calibrationScore -= 0.5;   // Overconfident
      else if (a.confidence === 'unsure' && a.isCorrect) calibrationScore += 0.3;  // Underconfident (mild)
    }
    confidenceCalibration = Math.max(0, Math.min(100, (calibrationScore / count) * 100 + 50));
  }

  // 5. Growth Velocity (10%) - rate of improvement over time
  let growthVelocity = 50;
  if (count >= 2) {
    const sortedByTime = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedByTime.slice(0, Math.ceil(count / 2));
    const secondHalf = sortedByTime.slice(Math.ceil(count / 2));
    const firstRate = firstHalf.filter(a => a.isCorrect).length / firstHalf.length;
    const secondRate = secondHalf.filter(a => a.isCorrect).length / secondHalf.length;
    const improvement = secondRate - firstRate;
    // Map [-1, 1] to [0, 100]
    growthVelocity = Math.max(0, Math.min(100, improvement * 100 + 50));
  }

  // 6. Cognitive Depth (15%) - based on the Bloom's level of the skill
  // Higher Bloom's level = higher cognitive depth if mastered
  const bloomNorm = (skill.bloomLevel / 6) * 100;
  const cognitiveDepth = accuracy > 50 ? bloomNorm : bloomNorm * (accuracy / 100);

  // Weighted average
  const masteryScore = Math.round(
    accuracy * 0.35 +
    consistency * 0.15 +
    retention * 0.15 +
    confidenceCalibration * 0.10 +
    growthVelocity * 0.10 +
    cognitiveDepth * 0.15
  );

  return {
    skill,
    masteryScore: Math.max(0, Math.min(100, masteryScore)),
    status: getMasteryStatus(masteryScore, count),
    attemptCount: count,
    metrics: { accuracy, consistency, retention, confidenceCalibration, growthVelocity, cognitiveDepth },
    lastAttemptAt: attempts[attempts.length - 1]?.timestamp ?? null,
    attempts,
  };
}

// Compute all skill masteries
export function computeAllSkillMasteries(attempts?: AttemptRecord[]): SkillMastery[] {
  const allAttempts = attempts ?? loadAttempts();
  return SKILL_TAXONOMY.map(skill => computeSkillMastery(skill, allAttempts));
}

// Compute subject-level mastery (average of skills in subject)
export function computeSubjectMastery(subject: string, allMasteries?: SkillMastery[]): number {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const subjectMasteries = masteries.filter(m => m.skill.subject === subject);
  if (subjectMasteries.length === 0) return 0;
  return Math.round(subjectMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / subjectMasteries.length);
}

// Compute category-level mastery (for radar chart)
export function computeCategoryMasteries(allMasteries?: SkillMastery[]): { categoryId: string; score: number }[] {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  return SUBJECT_CATEGORIES.map(cat => {
    const catMasteries = masteries.filter(m => cat.subjects.includes(m.skill.subject));
    if (catMasteries.length === 0) return { categoryId: cat.id, score: 0 };
    const avg = catMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / catMasteries.length;
    return { categoryId: cat.id, score: Math.round(avg) };
  });
}

// Overall knowledge score (0-100)
export function computeOverallScore(allMasteries?: SkillMastery[]): number {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  if (masteries.length === 0) return 0;
  return Math.round(masteries.reduce((sum, m) => sum + m.masteryScore, 0) / masteries.length);
}

// Strongest subject
export function getStrongestSubject(allMasteries?: SkillMastery[]): { subject: string; score: number } | null {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const bySubject = getSkillsBySubject();
  let best: { subject: string; score: number } | null = null;

  for (const subject of Object.keys(bySubject)) {
    const score = computeSubjectMastery(subject, masteries);
    if (!best || score > best.score) {
      best = { subject, score };
    }
  }
  return best;
}

// Weakest subject (with at least 1 attempt)
export function getWeakestSubject(allMasteries?: SkillMastery[]): { subject: string; score: number } | null {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const bySubject = getSkillsBySubject();
  let worst: { subject: string; score: number } | null = null;

  for (const subject of Object.keys(bySubject)) {
    const subMasteries = masteries.filter(m => m.skill.subject === subject);
    const hasAttempts = subMasteries.some(m => m.attemptCount > 0);
    if (!hasAttempts) continue;
    const score = computeSubjectMastery(subject, masteries);
    if (!worst || score < worst.score) {
      worst = { subject, score };
    }
  }
  return worst;
}

// Highest Bloom's level achieved (with correct answer)
export function getHighestBloomAchieved(allMasteries?: SkillMastery[]): BloomLevel {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  let highest: BloomLevel = 1;
  for (const m of masteries) {
    if (m.metrics.accuracy > 0 && m.skill.bloomLevel > highest) {
      highest = m.skill.bloomLevel;
    }
  }
  return highest;
}

// Bloom's coverage: for each level, how many skills achieved vs total
export function getBloomCoverage(allMasteries?: SkillMastery[]): { level: BloomLevel; achieved: number; total: number }[] {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const result: { level: BloomLevel; achieved: number; total: number }[] = [];

  for (let lvl = 1; lvl <= 6; lvl++) {
    const atLevel = masteries.filter(m => m.skill.bloomLevel === lvl);
    const achieved = atLevel.filter(m => m.metrics.accuracy > 50).length;
    result.push({ level: lvl as BloomLevel, achieved, total: atLevel.length });
  }
  return result;
}

// Skills by mastery status counts
export function getMasteryDistribution(allMasteries?: SkillMastery[]): Record<MasteryStatus, number> {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const dist: Record<MasteryStatus, number> = {
    unstarted: 0, attempted: 0, developing: 0, proficient: 0, mastered: 0,
  };
  for (const m of masteries) {
    dist[m.status]++;
  }
  return dist;
}

// Knowledge age label
export function getKnowledgeAge(score: number, locale: string): string {
  if (locale === 'ar') {
    if (score < 20) return 'مبتدئ';
    if (score < 40) return 'مستكشف';
    if (score < 60) return 'دارس';
    if (score < 80) return 'عالم صغير';
    if (score < 95) return 'خبير';
    return 'عبقري';
  }
  if (score < 20) return 'Beginner';
  if (score < 40) return 'Explorer';
  if (score < 60) return 'Learner';
  if (score < 80) return 'Scholar';
  if (score < 95) return 'Expert';
  return 'Genius';
}

// Gap analysis: skills that need attention
export interface GapItem {
  skill: SkillDef;
  reason: 'never_attempted' | 'low_accuracy' | 'declining' | 'bloom_ceiling';
  detail: string;
  mastery: SkillMastery;
}

export function getGapAnalysis(allMasteries?: SkillMastery[]): GapItem[] {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const gaps: GapItem[] = [];

  for (const m of masteries) {
    if (m.attemptCount === 0) {
      gaps.push({
        skill: m.skill,
        reason: 'never_attempted',
        detail: 'No attempts yet',
        mastery: m,
      });
    } else if (m.metrics.accuracy < 50 && m.attemptCount >= 2) {
      gaps.push({
        skill: m.skill,
        reason: 'low_accuracy',
        detail: `${Math.round(m.metrics.accuracy)}% accuracy`,
        mastery: m,
      });
    } else if (m.metrics.growthVelocity < 30 && m.attemptCount >= 3) {
      gaps.push({
        skill: m.skill,
        reason: 'declining',
        detail: 'Performance declining',
        mastery: m,
      });
    }
  }

  return gaps;
}

// Strength analysis: top performing skills
export interface StrengthItem {
  skill: SkillDef;
  reason: 'consistently_strong' | 'fast_improving' | 'natural_affinity' | 'cognitive_champion';
  detail: string;
  mastery: SkillMastery;
}

export function getStrengthAnalysis(allMasteries?: SkillMastery[]): StrengthItem[] {
  const masteries = allMasteries ?? computeAllSkillMasteries();
  const strengths: StrengthItem[] = [];

  for (const m of masteries) {
    if (m.attemptCount === 0) continue;

    if (m.metrics.accuracy >= 85 && m.attemptCount >= 2) {
      strengths.push({
        skill: m.skill,
        reason: 'consistently_strong',
        detail: `${Math.round(m.metrics.accuracy)}% accuracy`,
        mastery: m,
      });
    }
    if (m.metrics.growthVelocity >= 75 && m.attemptCount >= 2) {
      strengths.push({
        skill: m.skill,
        reason: 'fast_improving',
        detail: 'Rapid improvement',
        mastery: m,
      });
    }
    if (m.metrics.confidenceCalibration >= 80 && m.metrics.accuracy >= 75) {
      strengths.push({
        skill: m.skill,
        reason: 'natural_affinity',
        detail: 'High confidence + accuracy',
        mastery: m,
      });
    }
    if (m.skill.bloomLevel >= 5 && m.metrics.accuracy >= 60) {
      strengths.push({
        skill: m.skill,
        reason: 'cognitive_champion',
        detail: `Bloom's level ${m.skill.bloomLevel}`,
        mastery: m,
      });
    }
  }

  return strengths;
}

// ─── KC-level mastery & Ebbinghaus forgetting curve ─────────────────────────

import { KC_MAP, PAGE_MAP, LESSON_MAP, UNIT_MAP } from '../data/sampleTextbook';

const MS_PER_DAY = 86_400_000;

/**
 * Ebbinghaus retention: R = e^(-t/S)
 * @param lastAttemptMs timestamp of last attempt
 * @param stability    memory stability in days
 * @returns retention 0-1
 */
export function calculateRetention(lastAttemptMs: number, stability: number): number {
  const elapsedDays = (Date.now() - lastAttemptMs) / MS_PER_DAY;
  return Math.exp(-elapsedDays / stability);
}

/**
 * Calculate memory stability from attempt history.
 * Starts at 1 day, doubles on success, halves on failure.
 * Clamped to [0.5, 365] days.
 */
export function calculateStability(attempts: AttemptRecord[]): number {
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  let stability = 1;
  for (const a of sorted) {
    stability = a.isCorrect ? stability * 2 : stability / 2;
    stability = Math.max(0.5, Math.min(365, stability));
  }
  return stability;
}

/**
 * Predict when retention drops below 70%.
 * Solves 0.7 = e^(-t/S) => t = -S * ln(0.7)
 * @returns future timestamp, or null if no attempts
 */
export function predictForgettingDate(kcId: string, attempts: AttemptRecord[]): number | null {
  const kcAttempts = attempts.filter(a => a.kcIds?.includes(kcId));
  if (kcAttempts.length === 0) return null;

  const sorted = [...kcAttempts].sort((a, b) => a.timestamp - b.timestamp);
  const lastTimestamp = sorted[sorted.length - 1].timestamp;
  const stability = calculateStability(kcAttempts);
  const daysUntilForgotten = -stability * Math.log(0.7);
  return lastTimestamp + daysUntilForgotten * MS_PER_DAY;
}

/**
 * Mastery score for a single KC (0-100).
 * Combines weighted accuracy with recency via retention.
 */
export function calculateKCMastery(kcId: string, attempts: AttemptRecord[]): number {
  const kcAttempts = attempts.filter(a => a.kcIds?.includes(kcId));
  if (kcAttempts.length === 0) return 0;

  const correctCount = kcAttempts.filter(a => a.isCorrect).length;
  const accuracy = (correctCount / kcAttempts.length) * 100;

  const sorted = [...kcAttempts].sort((a, b) => a.timestamp - b.timestamp);
  const lastTimestamp = sorted[sorted.length - 1].timestamp;
  const stability = calculateStability(kcAttempts);
  const retention = calculateRetention(lastTimestamp, stability);

  // 70% accuracy weight, 30% retention weight
  return Math.max(0, Math.min(100, Math.round(accuracy * 0.7 + retention * 100 * 0.3)));
}

/** Average KC mastery across all KCs on a page. */
export function calculatePageMastery(pageId: string, attempts: AttemptRecord[]): number {
  const page = PAGE_MAP[pageId];
  if (!page || page.kcIds.length === 0) return 0;
  const total = page.kcIds.reduce((sum, id) => sum + calculateKCMastery(id, attempts), 0);
  return Math.round(total / page.kcIds.length);
}

/** Average page mastery across all pages in a lesson. */
export function calculateLessonMastery(lessonId: string, attempts: AttemptRecord[]): number {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson || lesson.pageIds.length === 0) return 0;
  const total = lesson.pageIds.reduce((sum, id) => sum + calculatePageMastery(id, attempts), 0);
  return Math.round(total / lesson.pageIds.length);
}

/** Average lesson mastery across all lessons in a unit. */
export function calculateUnitMastery(unitId: string, attempts: AttemptRecord[]): number {
  const unit = UNIT_MAP[unitId];
  if (!unit || unit.lessonIds.length === 0) return 0;
  const total = unit.lessonIds.reduce((sum, id) => sum + calculateLessonMastery(id, attempts), 0);
  return Math.round(total / unit.lessonIds.length);
}

/**
 * Check prerequisites for a KC.
 * @returns array of prerequisite KC IDs whose mastery is below 70%
 */
export function checkPrerequisites(kcId: string, attempts: AttemptRecord[]): string[] {
  const kc = KC_MAP[kcId];
  if (!kc) return [];
  return kc.prerequisiteKcIds.filter(preId => calculateKCMastery(preId, attempts) < 70);
}

// ─── Spaced-repetition review schedule ──────────────────────────────────────

export interface ReviewItem {
  kcId: string;
  predictedRetention: number;
  urgency: number;
  predictedForgettingDate: number | null;
}

/**
 * Build a review schedule sorted by urgency (lowest retention first).
 * Only includes KCs that have been attempted at least once.
 */
export function getReviewSchedule(allKCIds: string[], attempts: AttemptRecord[]): ReviewItem[] {
  const items: ReviewItem[] = [];

  for (const kcId of allKCIds) {
    const kcAttempts = attempts.filter(a => a.kcIds?.includes(kcId));
    if (kcAttempts.length === 0) continue;

    const sorted = [...kcAttempts].sort((a, b) => a.timestamp - b.timestamp);
    const lastTimestamp = sorted[sorted.length - 1].timestamp;
    const stability = calculateStability(kcAttempts);
    const retention = calculateRetention(lastTimestamp, stability);
    const forgettingDate = predictForgettingDate(kcId, attempts);

    items.push({
      kcId,
      predictedRetention: Math.round(retention * 100) / 100,
      urgency: 1 - retention, // higher urgency = lower retention
      predictedForgettingDate: forgettingDate,
    });
  }

  return items.sort((a, b) => b.urgency - a.urgency);
}
