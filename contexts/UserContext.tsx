import React, { createContext, useContext, useEffect } from 'react';
import { usePersistedReducer } from '../hooks/usePersistedReducer';
import { getLevelForXP, DailyGoalTier, DAILY_GOALS } from '../data/levelThresholds';
import {
  POWERUP_CATALOG,
  POWERUP_CAP,
  MOCK_STARDUST_BALANCE,
  MOCK_INITIAL_INVENTORY,
  type PowerupSlug,
} from '../data/mockPowerupsData';
import { setSfxMuted } from '../utils/sfx';

// ---- State Interface ----

export interface UserState {
  xp: number;
  stats: { correct: number; total: number };
  totalBoosts: number;
  dailyCorrectAnswers: number;
  dailyXP: number;
  dailyGoalTier: DailyGoalTier;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  globalHistory: Record<number, number>; // questionId -> bestScore
  hearts: number;
  maxHearts: number;
  lastHeartLostAt: string | null; // ISO timestamp
  gems: number;
  streakFreezes: number;
  completedLessons: string[]; // "subjectSlug::lessonSlug"
  language: 'ar' | 'en';
  achievements: Record<string, { unlocked: boolean; unlockedAt: string | null }>;
  // ---- Stardust economy + power-ups (Wave A foundation) ----
  /** Current Stardust balance (premium learning currency, distinct from gems). */
  stardust: number;
  /** Owned counts per power-up slug. Capped at POWERUP_CAP per slug (silent clip). */
  powerups: Record<PowerupSlug, number>;
  /** Whether a Streak Shield is active (auto-consumed on missed-day). v2 stub. */
  streakShieldActive: boolean;
  /** Master SFX toggle for in-question power-up signature sounds. Default true. */
  sfxEnabled: boolean;
}

const getToday = () => new Date().toISOString().split('T')[0];

// Demo mid-semester data: student has completed Foundation + Reading + most of Exploration
const DEMO_GLOBAL_HISTORY: Record<number, number> = {
  // ── Foundation (all perfect) ──
  1: 10, 35: 10,   // math-addition (الجمع)
  5: 15, 36: 15,   // math-subtraction (الطرح)
  12: 10, 37: 10,  // math-numbers (الأعداد)
  46: 10, 47: 15,  // math-multiplication (الضرب)
  48: 15, 49: 15,  // math-division (القسمة)
  2: 20, 38: 10,   // lang-vocab (مفردات عامة)
  7: 20, 39: 10,   // lang-colors (الألوان)
  50: 20, 51: 10,  // lang-verbs (الأفعال)
  4: 15,           // ordering-sentences (الجمل المفيدة)
  // ── Reading (completed, mixed scores) ──
  31: 15, 32: 15, 33: 20, 34: 15,  // reading-languages → 87%
  26: 10, 27: 15, 28: 18, 29: 15, 30: 15, // reading-coffee → 97%
  52: 15,          // lang-sentences → 100%
  // ── Exploration (partially done) ──
  3: 10, 40: 10,   // general-culture → 100%
  53: 10, 54: 10,  // general-space → 100%
  6: 10, 41: 10,   // info-time → 100%
  55: 8,           // info-science-facts → 80%
  8: 15, 42: 10,   // animals-forest → 83%
  56: 10, 57: 15,  // animals-sea → 83%
  9: 10, 44: 7,    // science-env → 85%
  59: 12,          // science-water → in progress (48%, current node)
};

const DEMO_COMPLETED_LESSONS = [
  'math::addition', 'math::subtraction', 'math::numbers',
  'math::multiplication', 'math::division',
  'languages::general-vocab', 'languages::colors', 'languages::verbs',
  'ordering::useful-sentences',
  'languages::reading-languages', 'languages::reading-coffee', 'languages::sentences',
  'general-knowledge::nature', 'general-knowledge::space',
  'info::time', 'info::science-facts',
  'animals::jungle-animals', 'animals::sea-animals',
  'science::environment',
];

const DEFAULT_USER_STATE: UserState = {
  xp: 530,
  stats: { correct: 35, total: 41 },
  totalBoosts: 1,
  dailyCorrectAnswers: 3,
  dailyXP: 45,
  dailyGoalTier: 'regular',
  currentStreak: 7,
  longestStreak: 12,
  lastActiveDate: getToday(),
  globalHistory: DEMO_GLOBAL_HISTORY,
  hearts: 4,
  maxHearts: 5,
  lastHeartLostAt: null,
  gems: 210,
  streakFreezes: 1,
  completedLessons: DEMO_COMPLETED_LESSONS,
  language: 'ar',
  achievements: {
    'first-lesson': { unlocked: true, unlockedAt: '2026-02-01T10:00:00Z' },
    'streak-7': { unlocked: true, unlockedAt: '2026-03-15T14:00:00Z' },
  },
  stardust: MOCK_STARDUST_BALANCE,
  powerups: { ...MOCK_INITIAL_INVENTORY },
  streakShieldActive: false,
  sfxEnabled: true,
};

// ---- Actions ----

export type UserAction =
  | { type: 'RECORD_ANSWER'; payload: { questionId: number; points: number; maxPoints: number; correct: boolean } }
  | { type: 'LOSE_HEART' }
  | { type: 'REFILL_HEARTS' }
  | { type: 'REGEN_HEART' }
  | { type: 'COMPLETE_LESSON'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: 'ar' | 'en' }
  | { type: 'SET_DAILY_GOAL'; payload: DailyGoalTier }
  | { type: 'USE_STREAK_FREEZE' }
  | { type: 'BUY_STREAK_FREEZE' }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_GEMS'; payload: number }
  | { type: 'SPEND_GEMS'; payload: number }
  | { type: 'DAILY_RESET' }
  // ---- Stardust + power-ups (Wave A) ----
  | { type: 'BUY_POWERUP'; payload: { slug: PowerupSlug } }
  | { type: 'CONSUME_POWERUP'; payload: { slug: PowerupSlug } }
  | { type: 'EARN_STARDUST'; payload: { amount: number } }
  | { type: 'SPEND_STARDUST'; payload: { amount: number } }
  | { type: 'RESTORE_STREAK' }
  | { type: 'TOGGLE_SFX' };

// ---- Reducer ----

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'RECORD_ANSWER': {
      const { questionId, points, correct } = action.payload;
      const today = getToday();
      const oldBest = state.globalHistory[questionId] || 0;

      // Update streak if first action today
      let newStreak = state.currentStreak;
      let lastActive = state.lastActiveDate;
      if (state.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (state.lastActiveDate === yesterday) {
          newStreak = state.currentStreak + 1;
        } else if (state.lastActiveDate === '') {
          newStreak = 1;
        } else {
          // Missed days - check for freeze
          newStreak = 1; // Reset (freeze logic handled in DAILY_RESET)
        }
        lastActive = today;
      }

      // Stardust earn rate: 1 SD per 10 XP (rounded), only on correct answers.
      const sdEarned = correct ? Math.round(points / 10) : 0;

      return {
        ...state,
        xp: state.xp + points,
        dailyXP: state.dailyXP + points,
        stats: {
          correct: correct ? state.stats.correct + 1 : state.stats.correct,
          total: state.stats.total + 1,
        },
        dailyCorrectAnswers: correct ? state.dailyCorrectAnswers + 1 : state.dailyCorrectAnswers,
        globalHistory: {
          ...state.globalHistory,
          [questionId]: Math.max(oldBest, points),
        },
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        lastActiveDate: lastActive,
        totalBoosts: (state.dailyCorrectAnswers + (correct ? 1 : 0)) === 25
          ? state.totalBoosts + 1
          : state.totalBoosts,
        stardust: state.stardust + sdEarned,
      };
    }

    case 'LOSE_HEART':
      return {
        ...state,
        hearts: Math.max(0, state.hearts - 1),
        lastHeartLostAt: new Date().toISOString(),
      };

    case 'REFILL_HEARTS':
      if (state.gems < 350) return state;
      return {
        ...state,
        hearts: state.maxHearts,
        lastHeartLostAt: null,
        gems: state.gems - 350,
      };

    case 'REGEN_HEART':
      if (state.hearts >= state.maxHearts) return state;
      return {
        ...state,
        hearts: Math.min(state.maxHearts, state.hearts + 1),
      };

    case 'COMPLETE_LESSON': {
      const lessonKey = action.payload;
      if (state.completedLessons.includes(lessonKey)) return state;
      return {
        ...state,
        completedLessons: [...state.completedLessons, lessonKey],
        gems: state.gems + 10, // Completion bonus
      };
    }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_DAILY_GOAL':
      return { ...state, dailyGoalTier: action.payload };

    case 'USE_STREAK_FREEZE':
      if (state.streakFreezes <= 0) return state;
      return { ...state, streakFreezes: state.streakFreezes - 1 };

    case 'BUY_STREAK_FREEZE':
      if (state.gems < 200) return state;
      return {
        ...state,
        gems: state.gems - 200,
        streakFreezes: state.streakFreezes + 1,
      };

    case 'UNLOCK_ACHIEVEMENT': {
      const id = action.payload;
      if (state.achievements[id]?.unlocked) return state;
      return {
        ...state,
        achievements: {
          ...state.achievements,
          [id]: { unlocked: true, unlockedAt: new Date().toISOString() },
        },
      };
    }

    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.payload };

    case 'SPEND_GEMS':
      return { ...state, gems: Math.max(0, state.gems - action.payload) };

    case 'DAILY_RESET':
      return {
        ...state,
        dailyCorrectAnswers: 0,
        dailyXP: 0,
      };

    // ---- Stardust + power-ups ----

    case 'BUY_POWERUP': {
      const { slug } = action.payload;
      const entry = POWERUP_CATALOG[slug];
      if (!entry) return state;
      // Insufficient Stardust → no-op (UI guards this too).
      if (state.stardust < entry.costSD) return state;
      const owned = state.powerups[slug] ?? 0;
      // Silent cap-clip: debit Stardust regardless, but inventory capped at POWERUP_CAP.
      const nextOwned = Math.min(POWERUP_CAP, owned + 1);
      return {
        ...state,
        stardust: state.stardust - entry.costSD,
        powerups: {
          ...state.powerups,
          [slug]: nextOwned,
        },
      };
    }

    case 'CONSUME_POWERUP': {
      const { slug } = action.payload;
      const owned = state.powerups[slug] ?? 0;
      if (owned <= 0) return state;
      return {
        ...state,
        powerups: {
          ...state.powerups,
          [slug]: Math.max(0, owned - 1),
        },
      };
    }

    case 'EARN_STARDUST': {
      const amount = Math.max(0, action.payload.amount);
      if (amount === 0) return state;
      return { ...state, stardust: state.stardust + amount };
    }

    case 'SPEND_STARDUST': {
      const amount = Math.max(0, action.payload.amount);
      return { ...state, stardust: Math.max(0, state.stardust - amount) };
    }

    case 'RESTORE_STREAK': {
      // Phoenix consume stub — bridges to "yesterday" so the next correct answer increments the streak.
      const owned = state.powerups.streak_revive ?? 0;
      if (owned <= 0) return state;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      return {
        ...state,
        powerups: {
          ...state.powerups,
          streak_revive: owned - 1,
        },
        // +1 to the broken streak (rebuilds yesterday's lost day) and bridge lastActiveDate.
        currentStreak: state.currentStreak + 1,
        longestStreak: Math.max(state.longestStreak, state.currentStreak + 1),
        lastActiveDate: yesterday,
      };
    }

    case 'TOGGLE_SFX':
      return { ...state, sfxEnabled: !state.sfxEnabled };

    default:
      return state;
  }
}

// ---- Context ----

interface UserContextValue {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  // Derived values
  level: number;
  levelTitleAr: string;
  levelTitleEn: string;
  xpInLevel: number;
  xpForNextLevel: number;
  accuracy: number;
  dailyGoalTarget: number;
  dailyGoalMet: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = usePersistedReducer(
    'string-quests-user-progress',
    userReducer,
    DEFAULT_USER_STATE
  );

  // Daily reset check
  useEffect(() => {
    const today = getToday();
    const lastReset = state.lastActiveDate;
    // If the stored date is not today and dailyXP > 0, we need a reset
    if (lastReset && lastReset !== today && state.dailyXP > 0) {
      dispatch({ type: 'DAILY_RESET' });
    }
  }, []);

  // Heart regeneration timer
  useEffect(() => {
    if (state.hearts >= state.maxHearts) return;

    const interval = setInterval(() => {
      dispatch({ type: 'REGEN_HEART' });
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [state.hearts, state.maxHearts]);

  // Update document language/direction
  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  }, [state.language]);

  // Sync the SFX mute flag to the synth singleton whenever the user toggles it.
  useEffect(() => {
    setSfxMuted(!state.sfxEnabled);
  }, [state.sfxEnabled]);

  const levelInfo = getLevelForXP(state.xp);
  const accuracy = state.stats.total > 0
    ? Math.round((state.stats.correct / state.stats.total) * 100)
    : 0;
  const dailyGoalTarget = DAILY_GOALS[state.dailyGoalTier];

  const value: UserContextValue = {
    state,
    dispatch,
    level: levelInfo.level,
    levelTitleAr: levelInfo.titleAr,
    levelTitleEn: levelInfo.titleEn,
    xpInLevel: levelInfo.xpInLevel,
    xpForNextLevel: levelInfo.xpForNextLevel,
    accuracy,
    dailyGoalTarget,
    dailyGoalMet: state.dailyXP >= dailyGoalTarget,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
