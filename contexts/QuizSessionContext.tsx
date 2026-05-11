import React, { createContext, useContext, useReducer } from 'react';
import { Question } from '../types';
import type { PowerupSlug } from '../data/mockPowerupsData';

// ---- State ----

export type QuizPhase = 'playing' | 'break' | 'pre-review' | 'reviewing' | 'ended';

/**
 * Pre-artifact loadout flags (locked at session START_SESSION).
 * Each flag mirrors an inventory consumption that happened in UserContext
 * when the user equipped the item via LoadoutModal.
 */
export interface QuizLoadout {
  freeze: boolean;
  restart_shield: boolean;
  xp_double: boolean;
  lucky_dice: boolean;
  combo_lock: boolean;
}

const EMPTY_LOADOUT: QuizLoadout = {
  freeze: false,
  restart_shield: false,
  xp_double: false,
  lucky_dice: false,
  combo_lock: false,
};

/**
 * One cinematic-cast entry — produced by the in-question HUD bar when the
 * user confirms a power-up, consumed by `<PowerupCastOverlay />` which renders
 * the matching effect component (Annihilate, Illuminate, Warp, etc.) for ~1.2 s
 * before dispatching the actual reducer mutation in its post phase.
 *
 *  - `id` is monotonic per session (used as React key on the overlay child)
 *  - `slug` selects the effect component
 *  - `questionId` carries forward to actions like ARM_SECOND_CHANCE
 *  - `hiddenIndices` is pre-computed by the bar for 50/50 (so the effect
 *    knows which option tiles to shatter)
 */
export interface CastEntry {
  id: number;
  slug: PowerupSlug;
  questionId?: number;
  hiddenIndices?: number[];
}

export interface QuizSessionState {
  active: boolean;
  subjectSlug: string;
  lessonSlug: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  incorrectQuestionIds: number[];
  currentReviewIndex: number;
  phase: QuizPhase;
  // ---- Power-ups (Wave A) ----
  /** Pre-artifact loadout — frozen at session start. */
  loadout: QuizLoadout;
  /** Freeze is armed and will absorb the next wrong answer. */
  freezeArmed: boolean;
  /** XP Doubler will trigger on the next correct answer, then auto-clear. */
  xpDoublerPending: boolean;
  /** Question id Second Chance is currently armed on (null = not armed). */
  secondChanceArmedQId: number | null;
  /** Indices of choice tiles to grey-out for the current question (50/50). */
  hiddenOptionIndices: number[];
  /** Hint reveal was used → suppress the usual XP penalty for hint usage. */
  hintRevealedNoPenalty: boolean;
  /** Total questions answered this session (gates loadout edits). */
  questionsAnswered: number;
  /** Slugs of every power-up consumed during this artifact (for end-screen summary). */
  powerupsUsedThisArtifact: PowerupSlug[];
  /** Skip / Auto-Complete trip this — perfect-bonus chip is hidden when true. */
  perfectBonusDisqualified: boolean;
  /** Last Lucky Dice multiplier rolled (for HUD readout). */
  luckyDiceLastRoll: number | null;
  /**
   * In-flight cinematic cast queue. The HUD bar enqueues; the overlay
   * renders the head; the effect's post-phase dispatches DEQUEUE_CAST.
   * FIFO; usually has 0 or 1 entries (taps are rate-limited by the
   * confirm dialog).
   */
  powerupCastQueue: CastEntry[];
  /** Monotonic id source for `CastEntry.id` (used as React key). */
  nextCastId: number;
}

const INITIAL_STATE: QuizSessionState = {
  active: false,
  subjectSlug: '',
  lessonSlug: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  incorrectQuestionIds: [],
  currentReviewIndex: 0,
  phase: 'playing',
  loadout: { ...EMPTY_LOADOUT },
  freezeArmed: false,
  xpDoublerPending: false,
  secondChanceArmedQId: null,
  hiddenOptionIndices: [],
  hintRevealedNoPenalty: false,
  questionsAnswered: 0,
  powerupsUsedThisArtifact: [],
  perfectBonusDisqualified: false,
  luckyDiceLastRoll: null,
  powerupCastQueue: [],
  nextCastId: 1,
};

// ---- Actions ----

export type QuizSessionAction =
  | { type: 'START_SESSION'; payload: { subjectSlug: string; lessonSlug: string | null; questions: Question[] } }
  | { type: 'ANSWER'; payload: { points: number; questionId: number } }
  | { type: 'CONTINUE_BREAK' }
  | { type: 'START_REVIEW' }
  | { type: 'REVIEW_ANSWER'; payload: { points: number } }
  | { type: 'END_SESSION' }
  | { type: 'RESTART' }
  // ---- Power-ups (Wave A) ----
  | { type: 'APPLY_LOADOUT'; payload: { loadout: QuizLoadout } }
  | { type: 'CONSUME_FREEZE' }
  | { type: 'CONSUME_XP_DOUBLER' }
  | { type: 'ARM_SECOND_CHANCE'; payload: { questionId: number } }
  | { type: 'CLEAR_SECOND_CHANCE' }
  | { type: 'APPLY_5050'; payload: { hiddenIndices: number[] } }
  | { type: 'CLEAR_5050' }
  | { type: 'REVEAL_HINT_FREE' }
  | { type: 'CLEAR_HINT_FREE' }
  | { type: 'SKIP_QUESTION' }
  | { type: 'AUTO_COMPLETE_QUESTION' }
  | { type: 'ROLL_LUCKY_DICE'; payload: { multiplier: number } }
  | { type: 'INC_QUESTIONS_ANSWERED' }
  // Cinematic-cast queue (Foundation chunk for in-question power-up moments).
  // ENQUEUE auto-assigns a monotonic id; DEQUEUE pops the head FIFO.
  | { type: 'ENQUEUE_CAST'; payload: { entry: Omit<CastEntry, 'id'> } }
  | { type: 'DEQUEUE_CAST' };

// ---- Reducer ----

function quizSessionReducer(state: QuizSessionState, action: QuizSessionAction): QuizSessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...INITIAL_STATE,
        active: true,
        subjectSlug: action.payload.subjectSlug,
        lessonSlug: action.payload.lessonSlug,
        questions: action.payload.questions,
        currentQuestionIndex: 0,
        score: 0,
        incorrectQuestionIds: [],
        currentReviewIndex: 0,
        phase: 'playing',
        // Drain any leftover casts from a prior session.
        powerupCastQueue: [],
        nextCastId: 1,
      };

    case 'ANSWER': {
      const { points, questionId } = action.payload;
      const newScore = state.score + points;
      const newIncorrect = points === 0
        ? [...state.incorrectQuestionIds, questionId]
        : state.incorrectQuestionIds;
      const nextIndex = state.currentQuestionIndex + 1;

      // Per-question ephemeral flags clear on every answer (next question is fresh).
      const clearPerQuestion = {
        hiddenOptionIndices: [] as number[],
        hintRevealedNoPenalty: false,
        // Second Chance auto-clears: if it was armed on this question, the wrong absorption
        // is handled by the caller (which suppresses heart-loss); we just drop the flag.
        secondChanceArmedQId:
          state.secondChanceArmedQId === questionId ? null : state.secondChanceArmedQId,
      };

      const baseAnswered = {
        ...state,
        ...clearPerQuestion,
        score: newScore,
        incorrectQuestionIds: newIncorrect,
        questionsAnswered: state.questionsAnswered + 1,
      };

      if (nextIndex < state.questions.length) {
        // Check for break every 4 questions
        if (nextIndex % 4 === 0) {
          return {
            ...baseAnswered,
            currentQuestionIndex: nextIndex,
            phase: 'break',
          };
        }
        return {
          ...baseAnswered,
          currentQuestionIndex: nextIndex,
        };
      }

      // All questions answered
      if (newIncorrect.length > 0) {
        return {
          ...baseAnswered,
          phase: 'pre-review',
        };
      }
      return {
        ...baseAnswered,
        phase: 'ended',
      };
    }

    case 'CONTINUE_BREAK':
      return { ...state, phase: 'playing' };

    case 'START_REVIEW':
      return { ...state, phase: 'reviewing', currentReviewIndex: 0 };

    case 'REVIEW_ANSWER': {
      const newScore = state.score + action.payload.points;
      if (state.currentReviewIndex < state.incorrectQuestionIds.length - 1) {
        return {
          ...state,
          score: newScore,
          currentReviewIndex: state.currentReviewIndex + 1,
        };
      }
      return {
        ...state,
        score: newScore,
        phase: 'ended',
      };
    }

    case 'END_SESSION':
      return { ...INITIAL_STATE };

    case 'RESTART':
      return {
        ...INITIAL_STATE,
        // Preserve the artifact identity + question list so /restart works without re-mount.
        active: state.active,
        subjectSlug: state.subjectSlug,
        lessonSlug: state.lessonSlug,
        questions: state.questions,
        // Drain any leftover casts on restart.
        powerupCastQueue: [],
        nextCastId: 1,
      };

    // ---- Power-ups ----

    case 'APPLY_LOADOUT': {
      const { loadout } = action.payload;
      return {
        ...state,
        loadout,
        freezeArmed: loadout.freeze,
        xpDoublerPending: loadout.xp_double,
      };
    }

    case 'CONSUME_FREEZE':
      if (!state.freezeArmed) return state;
      return {
        ...state,
        freezeArmed: false,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'freeze'],
      };

    case 'CONSUME_XP_DOUBLER':
      if (!state.xpDoublerPending) return state;
      return {
        ...state,
        xpDoublerPending: false,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'xp_double'],
      };

    case 'ARM_SECOND_CHANCE':
      return {
        ...state,
        secondChanceArmedQId: action.payload.questionId,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'second_chance'],
      };

    case 'CLEAR_SECOND_CHANCE':
      return { ...state, secondChanceArmedQId: null };

    case 'APPLY_5050':
      return {
        ...state,
        hiddenOptionIndices: action.payload.hiddenIndices,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'fifty_fifty'],
      };

    case 'CLEAR_5050':
      return { ...state, hiddenOptionIndices: [] };

    case 'REVEAL_HINT_FREE':
      return {
        ...state,
        hintRevealedNoPenalty: true,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'hint_reveal'],
      };

    case 'CLEAR_HINT_FREE':
      return { ...state, hintRevealedNoPenalty: false };

    case 'SKIP_QUESTION':
      return {
        ...state,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'skip'],
        perfectBonusDisqualified: true,
      };

    case 'AUTO_COMPLETE_QUESTION':
      return {
        ...state,
        powerupsUsedThisArtifact: [...state.powerupsUsedThisArtifact, 'auto_complete'],
        perfectBonusDisqualified: true,
      };

    case 'ROLL_LUCKY_DICE':
      return { ...state, luckyDiceLastRoll: action.payload.multiplier };

    case 'INC_QUESTIONS_ANSWERED':
      return { ...state, questionsAnswered: state.questionsAnswered + 1 };

    case 'ENQUEUE_CAST': {
      const entry: CastEntry = {
        ...action.payload.entry,
        id: state.nextCastId,
      };
      return {
        ...state,
        powerupCastQueue: [...state.powerupCastQueue, entry],
        nextCastId: state.nextCastId + 1,
      };
    }

    case 'DEQUEUE_CAST':
      // Early-return on empty saves a fresh `[]` allocation. Overlay won't
      // dispatch when empty, but defending here keeps the reducer total.
      if (state.powerupCastQueue.length === 0) return state;
      return { ...state, powerupCastQueue: state.powerupCastQueue.slice(1) };

    default:
      return state;
  }
}

// ---- Context ----

interface QuizSessionContextValue {
  state: QuizSessionState;
  dispatch: React.Dispatch<QuizSessionAction>;
  currentQuestion: Question | null;
  maxScore: number;
}

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null);

export function QuizSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizSessionReducer, INITIAL_STATE);

  const currentQuestion = state.active
    ? state.phase === 'reviewing'
      ? state.questions.find(q => q.id === state.incorrectQuestionIds[state.currentReviewIndex]) || null
      : state.questions[state.currentQuestionIndex] || null
    : null;

  const maxScore = state.questions.reduce((acc, q) => acc + q.points, 0);

  return (
    <QuizSessionContext.Provider value={{ state, dispatch, currentQuestion, maxScore }}>
      {children}
    </QuizSessionContext.Provider>
  );
}

export function useQuizSession() {
  const ctx = useContext(QuizSessionContext);
  if (!ctx) throw new Error('useQuizSession must be used within QuizSessionProvider');
  return ctx;
}
