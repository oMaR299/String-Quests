import React, { createContext, useContext, useReducer } from 'react';
import { Question } from '../types';

// ---- State ----

export type QuizPhase = 'playing' | 'break' | 'pre-review' | 'reviewing' | 'ended';

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
};

// ---- Actions ----

export type QuizSessionAction =
  | { type: 'START_SESSION'; payload: { subjectSlug: string; lessonSlug: string | null; questions: Question[] } }
  | { type: 'ANSWER'; payload: { points: number; questionId: number } }
  | { type: 'CONTINUE_BREAK' }
  | { type: 'START_REVIEW' }
  | { type: 'REVIEW_ANSWER'; payload: { points: number } }
  | { type: 'END_SESSION' }
  | { type: 'RESTART' };

// ---- Reducer ----

function quizSessionReducer(state: QuizSessionState, action: QuizSessionAction): QuizSessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        active: true,
        subjectSlug: action.payload.subjectSlug,
        lessonSlug: action.payload.lessonSlug,
        questions: action.payload.questions,
        currentQuestionIndex: 0,
        score: 0,
        incorrectQuestionIds: [],
        currentReviewIndex: 0,
        phase: 'playing',
      };

    case 'ANSWER': {
      const { points, questionId } = action.payload;
      const newScore = state.score + points;
      const newIncorrect = points === 0
        ? [...state.incorrectQuestionIds, questionId]
        : state.incorrectQuestionIds;
      const nextIndex = state.currentQuestionIndex + 1;

      if (nextIndex < state.questions.length) {
        // Check for break every 4 questions
        if (nextIndex % 4 === 0) {
          return {
            ...state,
            score: newScore,
            incorrectQuestionIds: newIncorrect,
            currentQuestionIndex: nextIndex,
            phase: 'break',
          };
        }
        return {
          ...state,
          score: newScore,
          incorrectQuestionIds: newIncorrect,
          currentQuestionIndex: nextIndex,
        };
      }

      // All questions answered
      if (newIncorrect.length > 0) {
        return {
          ...state,
          score: newScore,
          incorrectQuestionIds: newIncorrect,
          phase: 'pre-review',
        };
      }
      return {
        ...state,
        score: newScore,
        incorrectQuestionIds: newIncorrect,
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
        ...state,
        currentQuestionIndex: 0,
        score: 0,
        incorrectQuestionIds: [],
        currentReviewIndex: 0,
        phase: 'playing',
      };

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
