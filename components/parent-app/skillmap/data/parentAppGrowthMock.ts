// parentAppGrowthMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Growth-engine data for the "النتائج والتقدّم" hub → النمو tab. Streaks, points,
// activity calendar, and a progress series per timeframe. Derived from the
// existing daily study-minutes (so it agrees with the study-periods heatmap),
// plus a small seeded points/accuracy model. Deterministic per child.

import { getChildSkillAreas } from './parentAppSkillMapMock';
import { createRng, hashStringToSeed, clamp, buildIso, todayIso } from '../../data/mockKit';
import {
  getDailyStudyMinutes,
  dayPoints,
  POINTS_PER_MINUTE,
  POINTS_PER_ACTIVE_DAY,
} from './activityMock';

// ── Streak / summary ──────────────────────────────────────────────────────────

export interface GrowthSummary {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  points: number;
  accuracyPct: number;
  /** This week's 7 days (Sun→Sat): was the child active that day? */
  weekActive: { dateIso: string; active: boolean; isToday: boolean }[];
}

export function getGrowthSummary(childId: string): GrowthSummary {
  const days = getDailyStudyMinutes(childId, 120); // oldest → newest (today last)
  const active = days.map((d) => d.minutes > 0);

  // current streak: consecutive active days counting back from today
  let currentStreak = 0;
  for (let i = active.length - 1; i >= 0; i--) {
    if (active[i]) currentStreak++;
    else break;
  }
  // longest streak
  let longestStreak = 0;
  let run = 0;
  for (const a of active) {
    if (a) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else run = 0;
  }
  const totalActiveDays = active.filter(Boolean).length;
  const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);
  const points = Math.round(totalMinutes * POINTS_PER_MINUTE + totalActiveDays * POINTS_PER_ACTIVE_DAY);

  const areas = getChildSkillAreas(childId);
  const avgMastery = areas.length ? areas.reduce((s, a) => s + a.masteryPct, 0) / areas.length : 70;
  const rand = createRng(hashStringToSeed(`growthacc:${childId}`));
  const accuracyPct = clamp(Math.round(avgMastery * 0.3 + 70 + (rand() - 0.5) * 6), 80, 99);

  // This week's active flags (Sunday → Saturday of the current week)
  const minutesByIso = new Map(days.map((d) => [d.dateIso, d.minutes]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = todayIso();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const weekActive = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const iso = buildIso(d.getFullYear(), d.getMonth(), d.getDate());
    return { dateIso: iso, active: (minutesByIso.get(iso) ?? 0) > 0, isToday: iso === todayStr };
  });

  return { currentStreak, longestStreak, totalActiveDays, points, accuracyPct, weekActive };
}

// ── Activity calendar (for the heatmap) ───────────────────────────────────────

export interface ActivityDay {
  dateIso: string;
  minutes: number;
}

export function getActivityCalendar(childId: string, days = 98): ActivityDay[] {
  return getDailyStudyMinutes(childId, days);
}

// ── Progress series (curve) ───────────────────────────────────────────────────

export type Timeframe = 'monthly' | 'weekly' | 'daily';
export type TrendDir = 'up' | 'steady' | 'down';

export interface ProgressSeries {
  values: number[];
  trend: TrendDir;
}

function bucketSum(values: number[], buckets: number): number[] {
  const size = values.length / buckets;
  const out: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const start = Math.floor(i * size);
    const end = Math.max(start + 1, Math.floor((i + 1) * size));
    out.push(values.slice(start, end).reduce((s, v) => s + v, 0));
  }
  return out;
}

export function getProgressSeries(childId: string, timeframe: Timeframe): ProgressSeries {
  const span = timeframe === 'monthly' ? 180 : timeframe === 'weekly' ? 56 : 14;
  const daily = getActivityCalendar(childId, span).map((d) => dayPoints(d.minutes));
  const values =
    timeframe === 'daily' ? daily : timeframe === 'weekly' ? bucketSum(daily, 8) : bucketSum(daily, 6);

  const first = values.find((v) => v > 0) ?? values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const trend: TrendDir = last > first * 1.08 ? 'up' : last < first * 0.92 ? 'down' : 'steady';
  return { values, trend };
}
