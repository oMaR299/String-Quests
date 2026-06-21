// activityMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE single source of per-day study activity for the parent app. Previously
// two different generators existed — `getDailyStudyMinutes` (rolling) and
// `dayMinutes` (per-date) — and they disagreed. Now everything (study-periods
// heatmap, growth streaks/points, the daily calendar) derives from one pure,
// per-date `dayMinutes`, so they always agree.

import { createRng, hashStringToSeed, parseIso, isoForOffset } from '../../data/mockKit';

export const POINTS_PER_MINUTE = 45;
export const POINTS_PER_ACTIVE_DAY = 900;

/** Points earned on a day given its study minutes. */
export function dayPoints(minutes: number): number {
  return minutes > 0 ? Math.round(minutes * POINTS_PER_MINUTE + POINTS_PER_ACTIVE_DAY) : 0;
}

/** Minutes studied on ANY date — pure per (child, date). Weekends (Fri/Sat in
 *  Jordan) are lighter; some days are zero. Stable across reloads. */
export function dayMinutes(childId: string, iso: string): number {
  const dow = parseIso(iso).getDay(); // 0=Sun … 5=Fri, 6=Sat
  const weekend = dow === 5 || dow === 6;
  const rand = createRng(hashStringToSeed(`min:${childId}:${iso}`));
  const roll = rand();
  if (weekend) return roll < 0.55 ? 0 : Math.round(8 + rand() * 22);
  return roll < 0.18 ? 0 : Math.round(12 + rand() * 38);
}

export interface DailyMinutes {
  dateIso: string;
  minutes: number;
}

/** The last `days` days (oldest → newest, today last), derived from dayMinutes. */
export function getDailyStudyMinutes(childId: string, days = 70): DailyMinutes[] {
  const out: DailyMinutes[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateIso = isoForOffset(-i);
    out.push({ dateIso, minutes: dayMinutes(childId, dateIso) });
  }
  return out;
}
