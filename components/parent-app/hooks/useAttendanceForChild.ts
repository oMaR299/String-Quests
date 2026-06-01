// useAttendanceForChild.ts
// ─────────────────────────────────────────────────────────────────────────────
// Per-child attendance hook that overlays parent-saved absence reasons on
// top of the seeded MOCK_ATTENDANCE. The seed is the source of truth for
// every day's status + sessions; the overlay only adds/clears reason text.
//
// Persistence: `usePersistedReducer` shared with the rest of the app, keyed
// `parent-app-attendance-reasons-v1`. Wiping localStorage resets to seed.
//
// Shape of the persisted blob:
//   {
//     version: 1,
//     reasonsByKey: {
//       "child-sara|2026-05-12": { reasonAr, reasonEn },
//       …
//     }
//   }
//
// Lookup key is `${childId}|${iso}` (matches the in-memory lookup used by
// getAttendanceForDay in parentAppSchoolMockData.ts).

import type { Dispatch } from 'react';
import { useCallback, useMemo, useReducer, useEffect } from 'react';
import {
  getAttendanceForDay,
  type AttendanceDay,
} from '../data/parentAppSchoolMockData';

const STORAGE_KEY = 'parent-app-attendance-reasons-v1';

interface ReasonOverride {
  reasonAr?: string;
  reasonEn?: string;
}

interface PersistedState {
  version: 1;
  reasonsByKey: Record<string, ReasonOverride>;
}

type Action =
  | {
      type: 'set';
      key: string;
      reasonAr?: string;
      reasonEn?: string;
    }
  | { type: 'clear'; key: string };

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'set': {
      const next: ReasonOverride = {};
      if (action.reasonAr) next.reasonAr = action.reasonAr;
      if (action.reasonEn) next.reasonEn = action.reasonEn;
      return {
        ...state,
        reasonsByKey: {
          ...state.reasonsByKey,
          [action.key]: next,
        },
      };
    }
    case 'clear': {
      const next = { ...state.reasonsByKey };
      delete next[action.key];
      return { ...state, reasonsByKey: next };
    }
  }
}

const INITIAL: PersistedState = { version: 1, reasonsByKey: {} };

// Inline `usePersistedReducer`-equivalent. We don't import the shared helper
// because it `{ ...initial, ...parsed }` shallow-merges, which would replace
// `reasonsByKey` outright on rehydrate — that's fine, but we want the same
// semantics either way. Re-implemented here for self-containment.
function usePersisted(): [PersistedState, Dispatch<Action>] {
  const [state, dispatch] = useReducer(reducer, INITIAL, (initial) => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedState>;
        if (parsed && parsed.version === 1 && parsed.reasonsByKey) {
          return { version: 1, reasonsByKey: parsed.reasonsByKey };
        }
      }
    } catch (e) {
      console.warn('useAttendanceForChild: failed to load persisted state', e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('useAttendanceForChild: failed to persist state', e);
    }
  }, [state]);

  return [state, dispatch];
}

export interface UseAttendanceForChildReturn {
  /** Lookup a day with parent-saved reason overrides merged in. */
  getDay: (iso: string) => AttendanceDay | null;
  /**
   * Persist a parent-saved reason for a single day. Use both AR + EN so the
   * reason renders correctly across locales. Empty strings clear that side.
   */
  setAbsenceReason: (iso: string, reasonAr: string, reasonEn: string) => void;
  /** Drop any parent-saved reason on this day (returns to the seed value). */
  clearAbsenceReason: (iso: string) => void;
  /** True if this day has a parent override (vs seed). Useful for "edited" badges. */
  hasOverride: (iso: string) => boolean;
}

/**
 * Per-child attendance hook with parent reason overlay. The hook is keyed on
 * `childId` so switching active child reads the right slice without manual
 * filtering on the consumer side.
 */
export function useAttendanceForChild(childId: string): UseAttendanceForChildReturn {
  const [state, dispatch] = usePersisted();

  const keyFor = useCallback((iso: string) => `${childId}|${iso}`, [childId]);

  const getDay = useCallback(
    (iso: string): AttendanceDay | null => {
      const seed = getAttendanceForDay(childId, iso);
      if (!seed) return null;
      const override = state.reasonsByKey[keyFor(iso)];
      if (!override) return seed;
      // Merge override onto the seed — only `reasonAr` / `reasonEn` are
      // affected. The seed's status, sessions, etc. stay intact.
      return {
        ...seed,
        reasonAr: override.reasonAr ?? seed.reasonAr,
        reasonEn: override.reasonEn ?? seed.reasonEn,
      };
    },
    [childId, state.reasonsByKey, keyFor]
  );

  const setAbsenceReason = useCallback(
    (iso: string, reasonAr: string, reasonEn: string) => {
      dispatch({
        type: 'set',
        key: keyFor(iso),
        reasonAr,
        reasonEn,
      });
    },
    [dispatch, keyFor]
  );

  const clearAbsenceReason = useCallback(
    (iso: string) => {
      dispatch({ type: 'clear', key: keyFor(iso) });
    },
    [dispatch, keyFor]
  );

  const hasOverride = useCallback(
    (iso: string) => !!state.reasonsByKey[keyFor(iso)],
    [state.reasonsByKey, keyFor]
  );

  return useMemo(
    () => ({ getDay, setAbsenceReason, clearAbsenceReason, hasOverride }),
    [getDay, setAbsenceReason, clearAbsenceReason, hasOverride]
  );
}
