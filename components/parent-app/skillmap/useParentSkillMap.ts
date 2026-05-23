// useParentSkillMap.ts
// ─────────────────────────────────────────────────────────────────────────────
// Owns the runtime state for the Parent Skill Map screen. Pulls the active
// child's seeded skill areas, computes "today's focus" via the pure coaching
// engine, and tracks which areas have had practice "sent."
//
// Sent state is kept PER CHILD and IN-MEMORY only (matches the parent app's v1
// no-persistence pattern — see useParentAppContext). Keying by childId means
// switching the active header pill preserves each child's sent/cooldown state
// instead of bleeding across children or resetting unexpectedly.

import { useCallback, useMemo, useState } from 'react';
import {
  getChildSkillAreas,
  type ParentSkillArea,
} from './data/parentAppSkillMapMock';
import { selectTodaysFocus, type TodaysFocus } from './skillMapCoaching';

/** Shared empty array so `sentAreaIds` is referentially stable when none sent. */
const EMPTY: string[] = [];

export interface UseParentSkillMapResult {
  /** Full 6-area list for the active child (fixed subject order). */
  areas: ParentSkillArea[];
  /** Today's 1-3 focus areas + 1 shining strength. */
  today: TodaysFocus;
  /** Ids of areas whose practice has been sent (cooldown) for this child. */
  sentAreaIds: string[];
  /** Mark an area's practice as sent (no-op if already sent). */
  sendPractice: (areaId: string) => void;
}

export function useParentSkillMap(childId: string): UseParentSkillMapResult {
  // Record<childId, sentAreaIds[]> — per-child so the active-child switch is safe.
  const [sentByChild, setSentByChild] = useState<Record<string, string[]>>({});

  const areas = useMemo(() => getChildSkillAreas(childId), [childId]);

  // Stable per-day seed (local ISO date) — fixes the focus ordering for the day.
  const daySeed = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const sentAreaIds = sentByChild[childId] ?? EMPTY;

  // Today's focus is computed WITHOUT the live in-session sent set, so sending
  // practice flips a card to its "Sent ✓" state *in place* (satisfying feedback)
  // rather than making it vanish. The engine's cooldown is a CROSS-DAY concept —
  // a real build would pass yesterday's persisted sent ids here; with no
  // persistence (v1) that prior-day set is empty.
  const today = useMemo(
    () => selectTodaysFocus(areas, EMPTY, daySeed),
    [areas, daySeed],
  );

  const sendPractice = useCallback(
    (areaId: string) => {
      setSentByChild((prev) => {
        const current = prev[childId] ?? [];
        if (current.includes(areaId)) return prev;
        return { ...prev, [childId]: [...current, areaId] };
      });
    },
    [childId],
  );

  return { areas, today, sentAreaIds, sendPractice };
}

export default useParentSkillMap;
