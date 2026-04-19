/**
 * Skill Model Storage
 *
 * Persists the StudentModel to localStorage with V1 migration support.
 * The old format (string-quests-attempts) stored flat AttemptRecord[].
 * The new format (string-quests-skill-model) stores the full StudentModel
 * with BKT states, FSRS parameters, and review queue.
 */

import type { StudentModel, KCState, SkillAttemptRecord } from '../models/types';
import { createEmptyStudentModel, createInitialKCState } from '../models/types';
import { updateBKT, getBKTFamily, getBKTParams } from '../models/bkt';
import { updateStability, scheduleNextReview } from '../models/fsrs';
import { getBloomLevel, getSkillForQuestion, SKILL_TO_KC_MAP } from '../data/skillTaxonomy';
import { KC_MAP } from '../data/sampleTextbook';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const MODEL_KEY = 'string-quests-skill-model';
const OLD_ATTEMPTS_KEY = 'string-quests-attempts';

// ─── Load / Save ─────────────────────────────────────────────────────────────

/** Load the student model from localStorage, migrating from V1 if needed. */
export function loadStudentModel(): StudentModel {
  try {
    const raw = localStorage.getItem(MODEL_KEY);
    if (raw) {
      const model = JSON.parse(raw) as StudentModel;
      if (model.version === 2) return model;
    }
  } catch {
    // Fall through to migration
  }

  // Try to migrate from V1
  return migrateFromV1();
}

/** Save the student model to localStorage. */
export function saveStudentModel(model: StudentModel): void {
  model.lastUpdated = new Date().toISOString();
  localStorage.setItem(MODEL_KEY, JSON.stringify(model));
}

/** Clear the student model (for testing/reset). */
export function clearStudentModel(): void {
  localStorage.removeItem(MODEL_KEY);
}

// ─── Process a Single Attempt ────────────────────────────────────────────────

/**
 * Process a quiz answer and update the student model.
 * This is the main entry point called after each student response.
 */
export function processAttempt(
  model: StudentModel,
  questionId: number,
  correct: boolean,
  responseTimeMs: number,
  lessonSlug: string,
  subjectSlug: string,
): StudentModel {
  const now = new Date();
  const kcIds = getKCsForQuestion(questionId);
  const skill = getSkillForQuestion(questionId);
  const bloomLevel = skill?.bloomLevel ?? getBloomLevel(skill?.questionType ?? 'multiple-choice');

  // Create attempt record
  const attempt: SkillAttemptRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now.toISOString(),
    questionId,
    kcIds,
    bloomLevel,
    correct,
    responseTimeMs,
    questionType: skill?.questionType ?? 'multiple-choice',
    lessonSlug,
    subjectSlug,
  };

  // Update each KC
  const updatedKCs = { ...model.kcs };
  const updatedReviewQueue = [...model.reviewQueue];

  for (const kcId of kcIds) {
    // Initialize KC if first encounter
    if (!updatedKCs[kcId]) {
      const kcData = KC_MAP[kcId];
      const family = kcData ? getBKTFamily(kcData.bloomLevel) : 'default';
      const params = getBKTParams(family);
      updatedKCs[kcId] = createInitialKCState(kcId, params.pL0);
    }

    let state = updatedKCs[kcId];
    const kcData = KC_MAP[kcId];
    const family = kcData ? getBKTFamily(kcData.bloomLevel) : 'default';
    const params = getBKTParams(family);

    // 1. BKT update
    state = updateBKT(state, correct, params);

    // 2. FSRS stability update
    state = updateStability(state, correct, now);

    // 3. Update Bloom level reached
    if (correct && bloomLevel > state.bloomLevelReached) {
      state = { ...state, bloomLevelReached: bloomLevel };
    }

    updatedKCs[kcId] = state;

    // 4. Schedule next review
    const review = scheduleNextReview(state);
    const existingIdx = updatedReviewQueue.findIndex(r => r.kcId === kcId);
    if (existingIdx >= 0) {
      updatedReviewQueue[existingIdx] = review;
    } else {
      updatedReviewQueue.push(review);
    }
  }

  // Update domain theta (IRT)
  const domain = skill?.domain ?? 'general';
  const updatedTheta = { ...model.domainTheta };
  // Simple ELO-like update
  const currentTheta = updatedTheta[domain] ?? 0;
  const K = Math.max(0.1, 0.4 * Math.exp(-0.05 * model.attempts.length));
  updatedTheta[domain] = currentTheta + K * ((correct ? 1 : 0) - 0.5);

  return {
    ...model,
    version: 2,
    lastUpdated: now.toISOString(),
    kcs: updatedKCs,
    domainTheta: updatedTheta,
    attempts: [...model.attempts, attempt],
    reviewQueue: updatedReviewQueue,
  };
}

// ─── KC Resolution ───────────────────────────────────────────────────────────

/**
 * Get KC IDs for a question. Tries:
 * 1. SKILL_TO_KC_MAP (explicit mapping from skillTaxonomy)
 * 2. Falls back to creating a synthetic KC ID from the skill code
 */
function getKCsForQuestion(questionId: number): string[] {
  const skill = getSkillForQuestion(questionId);
  if (!skill) return [`synthetic-q${questionId}`];

  // Check explicit mapping
  const mapped = SKILL_TO_KC_MAP[skill.skillCode];
  if (mapped && mapped.length > 0) return mapped;

  // Fallback: use skill code as synthetic KC
  return [`skill-${skill.skillCode}`];
}

// ─── V1 Migration ────────────────────────────────────────────────────────────

interface V1AttemptRecord {
  questionId: number;
  subject: string;
  lesson: string;
  questionType: string;
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
  confidence: 'sure' | 'unsure';
  hintUsed: boolean;
  isReviewMode: boolean;
  timestamp: number;
  kcIds?: string[];
}

/**
 * Migrate from V1 format (flat attempts array) to V2 (StudentModel).
 * Replays all old attempts through BKT to build initial mastery state.
 */
function migrateFromV1(): StudentModel {
  const model = createEmptyStudentModel();

  try {
    const raw = localStorage.getItem(OLD_ATTEMPTS_KEY);
    if (!raw) return model;

    const oldAttempts: V1AttemptRecord[] = JSON.parse(raw);
    if (!Array.isArray(oldAttempts) || oldAttempts.length === 0) return model;

    // Sort chronologically for proper BKT replay
    const sorted = oldAttempts.sort((a, b) => a.timestamp - b.timestamp);

    for (const attempt of sorted) {
      const kcIds = attempt.kcIds ?? getKCsForQuestion(attempt.questionId);
      const skill = getSkillForQuestion(attempt.questionId);
      const bloomLevel = skill?.bloomLevel ?? 1;

      for (const kcId of kcIds) {
        if (!model.kcs[kcId]) {
          const kcData = KC_MAP[kcId];
          const family = kcData ? getBKTFamily(kcData.bloomLevel) : 'default';
          const params = getBKTParams(family);
          model.kcs[kcId] = createInitialKCState(kcId, params.pL0);
        }

        let state = model.kcs[kcId];
        const kcData = KC_MAP[kcId];
        const family = kcData ? getBKTFamily(kcData.bloomLevel) : 'default';
        const params = getBKTParams(family);

        state = updateBKT(state, attempt.isCorrect, params);
        state = updateStability(state, attempt.isCorrect, new Date(attempt.timestamp));

        if (attempt.isCorrect && bloomLevel > state.bloomLevelReached) {
          state = { ...state, bloomLevelReached: bloomLevel as any };
        }

        model.kcs[kcId] = state;
      }

      // Add to new attempts log
      model.attempts.push({
        id: `migrated-${attempt.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(attempt.timestamp).toISOString(),
        questionId: attempt.questionId,
        kcIds,
        bloomLevel: bloomLevel as any,
        correct: attempt.isCorrect,
        responseTimeMs: 0,
        questionType: (attempt.questionType ?? 'multiple-choice') as any,
        lessonSlug: attempt.lesson ?? '',
        subjectSlug: attempt.subject ?? '',
      });
    }

    // Build review queue from final states
    for (const state of Object.values(model.kcs)) {
      model.reviewQueue.push(scheduleNextReview(state));
    }

    // Save migrated model
    saveStudentModel(model);
  } catch {
    // Migration failed, return empty model
  }

  return model;
}
