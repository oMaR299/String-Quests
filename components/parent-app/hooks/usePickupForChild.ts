// usePickupForChild.ts
// ─────────────────────────────────────────────────────────────────────────────
// Per-child pickup hook. Wraps the seeded MOCK_PICKUP catalog with a thin
// persistence layer that lets the parent:
//
//   • set a new default method (applies to every future day),
//   • override TODAY only (one-shot),
//   • read today's resolved pickup (seed + override merged).
//
// Live status (`not-yet → boarded → en-route → arrived`) auto-advances on a
// mocked clock inside the active pickup window (13:30–15:30). The advance is
// gated by `useReducedMotion()` so users with reduced motion get the static
// snapshot rather than a moving timeline.
//
// Persistence: `parent-app-pickup-v1` localStorage key. Shape:
//   {
//     version: 1,
//     defaultsByChild: { [childId]: PickupMethodDetails },
//     todayOverridesByKey: { [`${childId}|${iso}`]: { details, status, events } },
//   }

import type { Dispatch } from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  getPickupForChild,
  type ChildPickupConfig,
  type PickupDay,
  type PickupEvent,
  type PickupMethodDetails,
  type PickupStatus,
} from '../data/parentAppSchoolMockData';

const STORAGE_KEY = 'parent-app-pickup-v1';

interface TodayOverride {
  details?: PickupMethodDetails;
  status?: PickupStatus;
  events?: PickupEvent[];
}

interface PersistedState {
  version: 1;
  defaultsByChild: Record<string, PickupMethodDetails>;
  todayOverridesByKey: Record<string, TodayOverride>;
}

type Action =
  | { type: 'setDefault'; childId: string; details: PickupMethodDetails }
  | {
      type: 'overrideToday';
      key: string;
      details?: PickupMethodDetails;
      status?: PickupStatus;
      events?: PickupEvent[];
    }
  | { type: 'clearToday'; key: string };

const INITIAL: PersistedState = {
  version: 1,
  defaultsByChild: {},
  todayOverridesByKey: {},
};

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'setDefault':
      return {
        ...state,
        defaultsByChild: {
          ...state.defaultsByChild,
          [action.childId]: action.details,
        },
      };
    case 'overrideToday': {
      const prev = state.todayOverridesByKey[action.key] ?? {};
      return {
        ...state,
        todayOverridesByKey: {
          ...state.todayOverridesByKey,
          [action.key]: {
            details: action.details ?? prev.details,
            status: action.status ?? prev.status,
            events: action.events ?? prev.events,
          },
        },
      };
    }
    case 'clearToday': {
      const next = { ...state.todayOverridesByKey };
      delete next[action.key];
      return { ...state, todayOverridesByKey: next };
    }
  }
}

function usePersisted(): [PersistedState, Dispatch<Action>] {
  const [state, dispatch] = useReducer(reducer, INITIAL, (initial) => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedState>;
        if (parsed && parsed.version === 1) {
          return {
            version: 1,
            defaultsByChild: parsed.defaultsByChild ?? {},
            todayOverridesByKey: parsed.todayOverridesByKey ?? {},
          };
        }
      }
    } catch (e) {
      console.warn('usePickupForChild: failed to load persisted state', e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('usePickupForChild: failed to persist state', e);
    }
  }, [state]);

  return [state, dispatch];
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowIsoTimestamp(): string {
  return new Date().toISOString();
}

function withinPickupWindow(now: Date = new Date()): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 13 * 60 + 30 && minutes <= 15 * 60 + 30;
}

export interface UsePickupForChildReturn {
  /** Default method (after merging parent's saved default on top of the seed). */
  defaultMethod: PickupMethodDetails;
  /** Today's resolved record — seed + any override applied. */
  todayPickup: PickupDay | null;
  /** Last ~7 days, today included (newest last). */
  history7d: PickupDay[];
  /** Persist a new default method (applies from tomorrow forward + replaces today's method). */
  setDefaultMethod: (details: PickupMethodDetails) => void;
  /** Apply a one-day override (today only — tomorrow reverts to default). */
  overrideTodayMethod: (details: PickupMethodDetails) => void;
  /** Push a new event onto today's timeline and update the status accordingly. */
  pushTodayEvent: (kind: PickupEvent['kind']) => void;
  /** True when the live auto-advance is active. */
  isLive: boolean;
}

/**
 * Per-child pickup hook. The hook is keyed on `childId` so switching active
 * child reads/writes the right slice without manual filtering.
 */
export function usePickupForChild(childId: string): UsePickupForChildReturn {
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = usePersisted();

  const seed: ChildPickupConfig | null = useMemo(
    () => getPickupForChild(childId),
    [childId]
  );

  const persistedDefault: PickupMethodDetails | undefined =
    state.defaultsByChild[childId];

  const defaultMethod: PickupMethodDetails = useMemo(() => {
    return persistedDefault ?? seed?.defaultMethod ?? { method: 'walk' };
  }, [persistedDefault, seed]);

  const isoToday = useMemo(() => todayIso(), []);
  const todayKey = `${childId}|${isoToday}`;
  const todayOverride: TodayOverride | undefined = state.todayOverridesByKey[todayKey];

  // Today's resolved record: start from seed's today, apply default override
  // (if no parent default lives in seed), then apply parent override.
  const todayPickup: PickupDay | null = useMemo(() => {
    const seedToday = seed?.history.find((d) => d.dateIso === isoToday) ?? null;
    if (!seedToday) {
      // No seed for today (e.g. weekend) — return null. Consumers handle this.
      return null;
    }
    const details = todayOverride?.details ?? persistedDefault ?? seedToday.details;
    const status = todayOverride?.status ?? seedToday.status;
    const events = todayOverride?.events ?? seedToday.events;
    return {
      ...seedToday,
      details,
      status,
      events,
    };
  }, [seed, isoToday, todayOverride, persistedDefault]);

  const history7d: PickupDay[] = useMemo(() => {
    if (!seed) return [];
    return seed.history.map((d) => {
      if (d.dateIso === isoToday && todayPickup) return todayPickup;
      return d;
    });
  }, [seed, isoToday, todayPickup]);

  const setDefaultMethod = useCallback(
    (details: PickupMethodDetails) => {
      dispatch({ type: 'setDefault', childId, details });
      // Reset today's override so the new default takes immediate effect.
      dispatch({ type: 'clearToday', key: todayKey });
    },
    [dispatch, childId, todayKey]
  );

  const overrideTodayMethod = useCallback(
    (details: PickupMethodDetails) => {
      dispatch({
        type: 'overrideToday',
        key: todayKey,
        details,
        // Reset status to not-yet since the method changed — live progression
        // re-runs against the new method.
        status: 'not-yet',
        events: [],
      });
    },
    [dispatch, todayKey]
  );

  const pushTodayEvent = useCallback(
    (kind: PickupEvent['kind']) => {
      const existing = todayPickup?.events ?? [];
      const newEvent: PickupEvent = { kind, timeIso: nowIsoTimestamp() };
      const events = [...existing, newEvent];
      const status: PickupStatus =
        kind === 'arrived'
          ? 'arrived'
          : kind === 'en-route'
            ? 'en-route'
            : kind === 'boarded'
              ? 'boarded'
              : 'cancelled';
      dispatch({
        type: 'overrideToday',
        key: todayKey,
        details: todayPickup?.details ?? defaultMethod,
        status,
        events,
      });
    },
    [dispatch, todayKey, todayPickup, defaultMethod]
  );

  // ── Live auto-advance (mocked clock) ──────────────────────────────────────
  // When we're inside the pickup window and the status hasn't reached
  // 'arrived' / 'cancelled' yet, tick every 5s and bump to the next state.
  // Reduced motion: skip — parent gets the static current state instead of a
  // moving timeline.
  const status = todayPickup?.status;
  const isLive =
    !reduceMotion &&
    !!todayPickup &&
    status !== 'arrived' &&
    status !== 'cancelled' &&
    withinPickupWindow();

  useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      const current = todayPickup?.status;
      if (current === 'not-yet') {
        pushTodayEvent('boarded');
      } else if (current === 'boarded') {
        pushTodayEvent('en-route');
      } else if (current === 'en-route') {
        pushTodayEvent('arrived');
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [isLive, todayPickup, pushTodayEvent]);

  return useMemo(
    () => ({
      defaultMethod,
      todayPickup,
      history7d,
      setDefaultMethod,
      overrideTodayMethod,
      pushTodayEvent,
      isLive,
    }),
    [
      defaultMethod,
      todayPickup,
      history7d,
      setDefaultMethod,
      overrideTodayMethod,
      pushTodayEvent,
      isLive,
    ]
  );
}

/**
 * Format an ISO timestamp into "HH:mm" (24h) for the timeline. We use locale-
 * agnostic digits so the same digits render in both AR and EN (the rest of
 * the parent-app uses `tabular-nums` Western digits — staying consistent).
 */
export function formatTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
