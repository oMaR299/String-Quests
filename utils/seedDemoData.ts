/**
 * Seed Demo Data - Simulates a student ~3 weeks into Grade 3 Math
 *
 * Creates realistic BKT/FSRS states so the skill map looks populated.
 * The student has:
 *   - Unit 1 (Operations): Mostly mastered, some proficient
 *   - Unit 2 (Base Ten): Proficient/developing mix
 *   - Unit 3 (Fractions): Developing/struggling, some decaying
 *   - Unit 4 (Measurement): Early developing, many not started
 *   - Unit 5 (Geometry): Mostly not started, a few attempts
 */

import type { StudentModel, KCState, SkillAttemptRecord, ReviewItem } from '../models/types';
import type { BloomLevel } from '../data/skillTaxonomy';
import { scheduleNextReview } from '../models/fsrs';

const MODEL_KEY = 'string-quests-skill-model';

// Seeded random for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

interface KCSeed {
  kcId: string;
  pLearned: number;
  stability: number;
  difficulty: number;
  successCount: number;
  failureCount: number;
  bloomLevelReached: BloomLevel;
  daysAgo: number;        // when last practiced
  domain: string;
}

export function seedDemoData(): StudentModel {
  const rand = seededRandom(42);
  const now = new Date();

  // Helper to make a date N days ago
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  // ── Unit 1: Operations & Algebraic Thinking ─────────────────────
  // Student has studied this well - mostly mastered/proficient
  const unit1Seeds: KCSeed[] = [
    { kcId: 'kc-3m-001', pLearned: 0.97, stability: 21, difficulty: 2.5, successCount: 8, failureCount: 1, bloomLevelReached: 2, daysAgo: 18, domain: 'multiplication' },
    { kcId: 'kc-3m-002', pLearned: 0.95, stability: 18, difficulty: 3.0, successCount: 7, failureCount: 2, bloomLevelReached: 3, daysAgo: 16, domain: 'multiplication' },
    { kcId: 'kc-3m-003', pLearned: 0.96, stability: 16, difficulty: 3.5, successCount: 6, failureCount: 1, bloomLevelReached: 3, daysAgo: 15, domain: 'multiplication' },
    { kcId: 'kc-3m-004', pLearned: 0.94, stability: 15, difficulty: 3.0, successCount: 6, failureCount: 2, bloomLevelReached: 3, daysAgo: 14, domain: 'multiplication' },
    { kcId: 'kc-3m-005', pLearned: 0.92, stability: 14, difficulty: 3.5, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 14, domain: 'multiplication' },
    { kcId: 'kc-3m-006', pLearned: 0.91, stability: 13, difficulty: 3.5, successCount: 5, failureCount: 1, bloomLevelReached: 3, daysAgo: 13, domain: 'multiplication' },
    { kcId: 'kc-3m-007', pLearned: 0.85, stability: 10, difficulty: 4.5, successCount: 4, failureCount: 2, bloomLevelReached: 3, daysAgo: 12, domain: 'multiplication' },
    { kcId: 'kc-3m-008', pLearned: 0.98, stability: 20, difficulty: 2.0, successCount: 9, failureCount: 0, bloomLevelReached: 2, daysAgo: 17, domain: 'multiplication' },
    { kcId: 'kc-3m-009', pLearned: 0.97, stability: 19, difficulty: 2.0, successCount: 8, failureCount: 1, bloomLevelReached: 2, daysAgo: 17, domain: 'multiplication' },
    { kcId: 'kc-3m-010', pLearned: 0.98, stability: 20, difficulty: 2.0, successCount: 9, failureCount: 0, bloomLevelReached: 2, daysAgo: 16, domain: 'multiplication' },
    { kcId: 'kc-3m-011', pLearned: 0.93, stability: 14, difficulty: 3.0, successCount: 6, failureCount: 2, bloomLevelReached: 2, daysAgo: 15, domain: 'multiplication' },
    { kcId: 'kc-3m-012', pLearned: 0.90, stability: 12, difficulty: 3.5, successCount: 5, failureCount: 2, bloomLevelReached: 2, daysAgo: 14, domain: 'multiplication' },
    { kcId: 'kc-3m-013', pLearned: 0.88, stability: 11, difficulty: 4.0, successCount: 5, failureCount: 3, bloomLevelReached: 2, daysAgo: 13, domain: 'multiplication' },
    { kcId: 'kc-3m-014', pLearned: 0.82, stability: 9, difficulty: 5.0, successCount: 4, failureCount: 3, bloomLevelReached: 2, daysAgo: 12, domain: 'multiplication' },
    { kcId: 'kc-3m-015', pLearned: 0.78, stability: 8, difficulty: 5.5, successCount: 3, failureCount: 3, bloomLevelReached: 1, daysAgo: 11, domain: 'multiplication' },
    { kcId: 'kc-3m-016', pLearned: 0.80, stability: 8, difficulty: 5.0, successCount: 4, failureCount: 3, bloomLevelReached: 2, daysAgo: 11, domain: 'multiplication' },
    { kcId: 'kc-3m-017', pLearned: 0.93, stability: 15, difficulty: 3.5, successCount: 6, failureCount: 1, bloomLevelReached: 3, daysAgo: 13, domain: 'division' },
    { kcId: 'kc-3m-018', pLearned: 0.90, stability: 12, difficulty: 4.0, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 12, domain: 'division' },
    { kcId: 'kc-3m-019', pLearned: 0.88, stability: 11, difficulty: 4.0, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 12, domain: 'division' },
    { kcId: 'kc-3m-020', pLearned: 0.83, stability: 9, difficulty: 4.5, successCount: 4, failureCount: 3, bloomLevelReached: 3, daysAgo: 11, domain: 'division' },
    { kcId: 'kc-3m-021', pLearned: 0.86, stability: 10, difficulty: 4.5, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 10, domain: 'division' },
    { kcId: 'kc-3m-022', pLearned: 0.80, stability: 8, difficulty: 5.0, successCount: 4, failureCount: 3, bloomLevelReached: 3, daysAgo: 10, domain: 'division' },
    { kcId: 'kc-3m-023', pLearned: 0.75, stability: 7, difficulty: 5.5, successCount: 3, failureCount: 3, bloomLevelReached: 3, daysAgo: 9, domain: 'word-problems' },
    { kcId: 'kc-3m-024', pLearned: 0.72, stability: 6, difficulty: 5.5, successCount: 3, failureCount: 3, bloomLevelReached: 3, daysAgo: 9, domain: 'word-problems' },
    { kcId: 'kc-3m-025', pLearned: 0.60, stability: 5, difficulty: 6.5, successCount: 2, failureCount: 4, bloomLevelReached: 4, daysAgo: 8, domain: 'word-problems' },
    { kcId: 'kc-3m-026', pLearned: 0.50, stability: 4, difficulty: 7.0, successCount: 2, failureCount: 4, bloomLevelReached: 4, daysAgo: 7, domain: 'word-problems' },
    { kcId: 'kc-3m-027', pLearned: 0.70, stability: 6, difficulty: 5.0, successCount: 3, failureCount: 2, bloomLevelReached: 4, daysAgo: 8, domain: 'patterns' },
    { kcId: 'kc-3m-028', pLearned: 0.72, stability: 6, difficulty: 5.0, successCount: 3, failureCount: 2, bloomLevelReached: 4, daysAgo: 8, domain: 'patterns' },
    { kcId: 'kc-3m-029', pLearned: 0.45, stability: 3, difficulty: 7.0, successCount: 1, failureCount: 3, bloomLevelReached: 4, daysAgo: 7, domain: 'patterns' },
  ];

  // ── Unit 2: Number & Operations in Base Ten ────────────────────
  // Proficient/developing mix
  const unit2Seeds: KCSeed[] = [
    { kcId: 'kc-3m-030', pLearned: 0.95, stability: 14, difficulty: 2.5, successCount: 7, failureCount: 1, bloomLevelReached: 2, daysAgo: 10, domain: 'place-value' },
    { kcId: 'kc-3m-031', pLearned: 0.88, stability: 10, difficulty: 3.5, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 9, domain: 'place-value' },
    { kcId: 'kc-3m-032', pLearned: 0.85, stability: 9, difficulty: 3.5, successCount: 5, failureCount: 2, bloomLevelReached: 3, daysAgo: 9, domain: 'place-value' },
    { kcId: 'kc-3m-033', pLearned: 0.82, stability: 8, difficulty: 4.0, successCount: 4, failureCount: 2, bloomLevelReached: 3, daysAgo: 8, domain: 'place-value' },
    { kcId: 'kc-3m-034', pLearned: 0.80, stability: 8, difficulty: 4.0, successCount: 4, failureCount: 2, bloomLevelReached: 3, daysAgo: 8, domain: 'rounding' },
    { kcId: 'kc-3m-035', pLearned: 0.75, stability: 7, difficulty: 4.5, successCount: 3, failureCount: 2, bloomLevelReached: 2, daysAgo: 7, domain: 'rounding' },
    { kcId: 'kc-3m-036', pLearned: 0.68, stability: 6, difficulty: 5.0, successCount: 3, failureCount: 3, bloomLevelReached: 3, daysAgo: 7, domain: 'rounding' },
    { kcId: 'kc-3m-037', pLearned: 0.55, stability: 4, difficulty: 5.5, successCount: 2, failureCount: 3, bloomLevelReached: 3, daysAgo: 6, domain: 'rounding' },
    { kcId: 'kc-3m-038', pLearned: 0.78, stability: 7, difficulty: 4.0, successCount: 4, failureCount: 2, bloomLevelReached: 3, daysAgo: 6, domain: 'addition' },
    { kcId: 'kc-3m-039', pLearned: 0.65, stability: 5, difficulty: 5.0, successCount: 3, failureCount: 3, bloomLevelReached: 3, daysAgo: 5, domain: 'addition' },
    { kcId: 'kc-3m-040', pLearned: 0.72, stability: 6, difficulty: 4.5, successCount: 3, failureCount: 2, bloomLevelReached: 3, daysAgo: 6, domain: 'subtraction' },
    { kcId: 'kc-3m-041', pLearned: 0.58, stability: 4, difficulty: 5.5, successCount: 2, failureCount: 3, bloomLevelReached: 3, daysAgo: 5, domain: 'subtraction' },
    { kcId: 'kc-3m-042', pLearned: 0.62, stability: 5, difficulty: 5.0, successCount: 3, failureCount: 3, bloomLevelReached: 3, daysAgo: 5, domain: 'multiplication' },
    { kcId: 'kc-3m-043', pLearned: 0.48, stability: 3, difficulty: 6.0, successCount: 2, failureCount: 3, bloomLevelReached: 3, daysAgo: 4, domain: 'multiplication' },
  ];

  // ── Unit 3: Fractions ──────────────────────────────────────────
  // Developing/struggling, some older ones decaying
  const unit3Seeds: KCSeed[] = [
    { kcId: 'kc-3m-044', pLearned: 0.82, stability: 5, difficulty: 3.5, successCount: 4, failureCount: 2, bloomLevelReached: 3, daysAgo: 12, domain: 'fractions' },  // studied early, now decaying
    { kcId: 'kc-3m-045', pLearned: 0.88, stability: 4, difficulty: 2.5, successCount: 5, failureCount: 1, bloomLevelReached: 2, daysAgo: 12, domain: 'fractions' },  // decaying
    { kcId: 'kc-3m-046', pLearned: 0.78, stability: 4, difficulty: 3.5, successCount: 3, failureCount: 2, bloomLevelReached: 2, daysAgo: 11, domain: 'fractions' },  // decaying
    { kcId: 'kc-3m-047', pLearned: 0.65, stability: 4, difficulty: 4.5, successCount: 3, failureCount: 3, bloomLevelReached: 2, daysAgo: 4, domain: 'fractions' },
    { kcId: 'kc-3m-048', pLearned: 0.55, stability: 3, difficulty: 5.0, successCount: 2, failureCount: 3, bloomLevelReached: 2, daysAgo: 3, domain: 'fractions' },
    { kcId: 'kc-3m-049', pLearned: 0.42, stability: 2, difficulty: 5.5, successCount: 2, failureCount: 4, bloomLevelReached: 3, daysAgo: 3, domain: 'fractions' },
    { kcId: 'kc-3m-050', pLearned: 0.60, stability: 4, difficulty: 4.0, successCount: 3, failureCount: 2, bloomLevelReached: 2, daysAgo: 3, domain: 'fractions' },
    { kcId: 'kc-3m-051', pLearned: 0.50, stability: 3, difficulty: 5.0, successCount: 2, failureCount: 3, bloomLevelReached: 2, daysAgo: 2, domain: 'fractions' },
    { kcId: 'kc-3m-052', pLearned: 0.38, stability: 2, difficulty: 5.5, successCount: 1, failureCount: 3, bloomLevelReached: 2, daysAgo: 2, domain: 'fractions' },
    { kcId: 'kc-3m-053', pLearned: 0.30, stability: 2, difficulty: 6.0, successCount: 1, failureCount: 4, bloomLevelReached: 2, daysAgo: 1, domain: 'fractions' },
    { kcId: 'kc-3m-054', pLearned: 0.35, stability: 2, difficulty: 5.5, successCount: 1, failureCount: 3, bloomLevelReached: 2, daysAgo: 1, domain: 'fractions' },
    { kcId: 'kc-3m-055', pLearned: 0.25, stability: 1.5, difficulty: 6.0, successCount: 1, failureCount: 4, bloomLevelReached: 1, daysAgo: 1, domain: 'fractions' },
  ];

  // ── Unit 4: Measurement & Data ─────────────────────────────────
  // Early developing, many not attempted
  const unit4Seeds: KCSeed[] = [
    { kcId: 'kc-3m-061', pLearned: 0.55, stability: 3, difficulty: 4.0, successCount: 2, failureCount: 2, bloomLevelReached: 3, daysAgo: 2, domain: 'time' },
    { kcId: 'kc-3m-062', pLearned: 0.35, stability: 2, difficulty: 5.5, successCount: 1, failureCount: 3, bloomLevelReached: 2, daysAgo: 1, domain: 'time' },
    { kcId: 'kc-3m-067', pLearned: 0.60, stability: 3, difficulty: 3.0, successCount: 3, failureCount: 1, bloomLevelReached: 2, daysAgo: 2, domain: 'area' },
    { kcId: 'kc-3m-068', pLearned: 0.45, stability: 2, difficulty: 4.5, successCount: 2, failureCount: 3, bloomLevelReached: 2, daysAgo: 1, domain: 'area' },
    { kcId: 'kc-3m-074', pLearned: 0.58, stability: 3, difficulty: 3.0, successCount: 3, failureCount: 1, bloomLevelReached: 2, daysAgo: 2, domain: 'perimeter' },
    { kcId: 'kc-3m-080', pLearned: 0.50, stability: 2, difficulty: 4.0, successCount: 2, failureCount: 2, bloomLevelReached: 2, daysAgo: 1, domain: 'data' },
  ];

  // ── Unit 5: Geometry ───────────────────────────────────────────
  // Just started, 2 attempts
  const unit5Seeds: KCSeed[] = [
    { kcId: 'kc-3m-085', pLearned: 0.30, stability: 1.5, difficulty: 4.0, successCount: 1, failureCount: 2, bloomLevelReached: 1, daysAgo: 0, domain: 'geometry' },
    { kcId: 'kc-3m-087', pLearned: 0.25, stability: 1, difficulty: 4.5, successCount: 1, failureCount: 2, bloomLevelReached: 1, daysAgo: 0, domain: 'geometry' },
  ];

  const allSeeds = [...unit1Seeds, ...unit2Seeds, ...unit3Seeds, ...unit4Seeds, ...unit5Seeds];

  // Build KCState records
  const kcs: Record<string, KCState> = {};
  for (const seed of allSeeds) {
    kcs[seed.kcId] = {
      kcId: seed.kcId,
      pLearned: seed.pLearned,
      stability: seed.stability,
      difficulty: seed.difficulty,
      lastPractice: daysAgo(seed.daysAgo).toISOString(),
      successCount: seed.successCount,
      failureCount: seed.failureCount,
      bloomLevelReached: seed.bloomLevelReached,
    };
  }

  // Build attempt history (synthetic but realistic)
  const attempts: SkillAttemptRecord[] = [];
  for (const seed of allSeeds) {
    const totalAttempts = seed.successCount + seed.failureCount;
    // Spread attempts over the period from daysAgo to now
    for (let i = 0; i < totalAttempts; i++) {
      const attemptDaysAgo = seed.daysAgo + (totalAttempts - i) * 0.8;
      const isCorrect = i >= seed.failureCount; // failures first, then successes (learning curve)
      attempts.push({
        id: `demo-${seed.kcId}-${i}`,
        timestamp: daysAgo(attemptDaysAgo).toISOString(),
        questionId: parseInt(seed.kcId.replace('kc-3m-', '')) || 1,
        kcIds: [seed.kcId],
        bloomLevel: seed.bloomLevelReached,
        correct: isCorrect,
        responseTimeMs: Math.round(3000 + rand() * 12000),
        questionType: 'multiple-choice',
        lessonSlug: `lesson-3m-${String(Math.ceil(parseInt(seed.kcId.replace('kc-3m-', '')) / 7)).padStart(2, '0')}`,
        subjectSlug: seed.domain,
      });
    }
  }

  // Sort attempts chronologically
  attempts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Build review queue from KC states
  const reviewQueue: ReviewItem[] = [];
  for (const state of Object.values(kcs)) {
    reviewQueue.push(scheduleNextReview(state));
  }

  // Build domain theta from performance
  const domainTheta: Record<string, number> = {
    'multiplication': 1.2,
    'division': 0.8,
    'word-problems': 0.2,
    'patterns': 0.3,
    'place-value': 0.9,
    'rounding': 0.4,
    'addition': 0.5,
    'subtraction': 0.3,
    'fractions': -0.1,
    'time': 0.1,
    'area': 0.2,
    'perimeter': 0.2,
    'data': 0.1,
    'geometry': -0.3,
  };

  const model: StudentModel = {
    version: 2,
    lastUpdated: now.toISOString(),
    kcs,
    domainTheta,
    attempts,
    reviewQueue,
  };

  // Save to localStorage
  localStorage.setItem(MODEL_KEY, JSON.stringify(model));

  return model;
}

/** Check if demo data should be seeded (model is empty) */
export function shouldSeedDemo(): boolean {
  try {
    const raw = localStorage.getItem(MODEL_KEY);
    if (!raw) return true;
    const model = JSON.parse(raw) as StudentModel;
    return Object.keys(model.kcs).length === 0;
  } catch {
    return true;
  }
}
