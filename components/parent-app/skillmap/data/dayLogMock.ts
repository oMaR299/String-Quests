// parentAppDailyMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Per-day data for the النتائج والتقدّم → اليومي (Daily) view: a month of
// completion statuses for the calendar + a full breakdown for the selected day
// (points · accuracy · completion + the items the child answered that day).
//
// Pure + deterministic PER DATE (seeded by childId + ISO date), so any month/day
// is stable across reloads and works for arbitrary dates (not just a rolling
// window). Mirrors the established createRng + hashStringToSeed pattern; points
// use the same formula as the growth tab.

import { getChildSkillAreas } from './parentAppSkillMapMock';
import { getSubjectTree } from './parentAppTextbookTreeMock';

import { createRng, hashStringToSeed, clamp, buildIso, parseIso, todayIso, isoMinusOneDay } from '../../data/mockKit';
import { dayMinutes, dayPoints, POINTS_PER_MINUTE } from './activityMock';

// Re-export so the view keeps importing date helpers from here.
export { todayIso };

// ── Types ───────────────────────────────────────────────────────────────────

export type DayStatus = 'complete' | 'partial' | 'missed' | 'none' | 'future';

export interface DayItem {
  id: string;
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  lessonAr: string;
  lessonEn: string;
  correct: number;
  total: number;
  accuracyPct: number;
  points: number;
  minutes: number;
  mastered: boolean;
}

export interface DayCell {
  iso: string;
  dayNum: number;
  status: DayStatus;
  isStreak: boolean;
  isToday: boolean;
  isFuture: boolean;
  points: number;
  accuracyPct: number;
}

export interface DayDetail {
  iso: string;
  status: DayStatus;
  points: number;
  accuracyPct: number;
  completion: { done: number; total: number };
  minutes: number;
  sessionCount: number;
  items: DayItem[];
}

export interface MonthData {
  year: number;
  month0: number; // 0-11
  cells: (DayCell | null)[]; // leading blanks = null, padded to full weeks
  activeDays: number;
  totalDays: number;
  points: number;
  accuracyPct: number;
}

// ── Pure per-date primitives ─────────────────────────────────────────────────

/** Completion + status for a date — shared by the calendar cells and the detail.
 *  Returns `minutes` too so callers don't re-derive it. A day with no study is
 *  the neutral 'none' (we never accuse a parent with a red "missed" — there's no
 *  assigned-vs-done data, so an empty day is simply "no activity"). */
function dayCompletion(
  childId: string,
  iso: string,
): { done: number; total: number; status: DayStatus; minutes: number } {
  if (iso > todayIso()) return { done: 0, total: 0, status: 'future', minutes: 0 };
  const minutes = dayMinutes(childId, iso);
  if (minutes === 0) return { done: 0, total: 0, status: 'none', minutes: 0 };
  const rand = createRng(hashStringToSeed(`comp:${childId}:${iso}`));
  const total = 2 + Math.floor(rand() * 2); // 2-3 tasks
  const partial = rand() < 0.22;
  const done = partial ? Math.max(1, total - 1) : total;
  return { done, total, status: done >= total ? 'complete' : 'partial', minutes };
}

function dayAccuracy(childId: string, iso: string): number {
  const rand = createRng(hashStringToSeed(`acc:${childId}:${iso}`));
  return clamp(Math.round(72 + rand() * 27), 55, 99);
}

// ── Month cells (calendar grid) ──────────────────────────────────────────────

function buildCell(childId: string, iso: string, dayNum: number): DayCell {
  const { status, minutes } = dayCompletion(childId, iso);
  const active = status === 'complete' || status === 'partial';
  return {
    iso,
    dayNum,
    status,
    isStreak: active && dayMinutes(childId, isoMinusOneDay(iso)) > 0,
    isToday: iso === todayIso(),
    isFuture: status === 'future',
    points: dayPoints(minutes),
    accuracyPct: active ? dayAccuracy(childId, iso) : 0,
  };
}

export function getMonthData(childId: string, year: number, month0: number): MonthData {
  const first = new Date(year, month0, 1);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (DayCell | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  let activeDays = 0;
  let points = 0;
  let accSum = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = buildCell(childId, buildIso(year, month0, d), d);
    cells.push(cell);
    if (cell.status === 'complete' || cell.status === 'partial') {
      activeDays++;
      points += cell.points;
      accSum += cell.accuracyPct;
    }
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return {
    year,
    month0,
    cells,
    activeDays,
    totalDays: daysInMonth,
    points,
    accuracyPct: activeDays ? Math.round(accSum / activeDays) : 0,
  };
}

// ── Full day detail (selected day) ───────────────────────────────────────────

export function getDayDetail(childId: string, iso: string): DayDetail {
  const { done, total, status, minutes } = dayCompletion(childId, iso);

  // No items to build for empty/future days (also guards the division below).
  if (done === 0) {
    return { iso, status, points: 0, accuracyPct: 0, completion: { done, total }, minutes: 0, sessionCount: 0, items: [] };
  }

  const areas = getChildSkillAreas(childId);
  const rand = createRng(hashStringToSeed(`day:${childId}:${iso}`));

  // Lesson pools per subject (authentic names from the textbook tree).
  const lessonPool = (subjectKey: string) => {
    const tree = getSubjectTree(childId, subjectKey);
    const lessons = tree.units.flatMap((u) => u.lessons).map((l) => ({ ar: l.titleAr, en: l.titleEn }));
    return lessons.length ? lessons : [{ ar: '', en: '' }];
  };

  const items: DayItem[] = [];
  let pointsSum = 0;
  let accSum = 0;
  const perItemMinutes = Math.max(5, Math.round(minutes / done));
  for (let i = 0; i < done; i++) {
    const a = areas[Math.floor(rand() * areas.length)];
    const pool = lessonPool(a.subjectKey);
    const lesson = pool[Math.floor(rand() * pool.length)];
    const totalQ = 5 + Math.floor(rand() * 4); // 5-8
    const correct = clamp(Math.round(totalQ * (0.6 + rand() * 0.4)), 1, totalQ);
    const accuracyPct = Math.round((correct / totalQ) * 100);
    const points = Math.round(perItemMinutes * POINTS_PER_MINUTE + 200);
    pointsSum += points;
    accSum += accuracyPct;
    items.push({
      id: `${childId}-${iso}-${i}`,
      subjectKey: a.subjectKey,
      subjectAr: a.subjectAr,
      subjectEn: a.subjectEn,
      lessonAr: lesson.ar,
      lessonEn: lesson.en,
      correct,
      total: totalQ,
      accuracyPct,
      points,
      minutes: perItemMinutes,
      mastered: accuracyPct >= 90,
    });
  }

  return {
    iso,
    status,
    points: pointsSum,
    accuracyPct: items.length ? Math.round(accSum / items.length) : 0,
    completion: { done, total },
    minutes,
    sessionCount: items.length,
    items,
  };
}

// ── Helpers exported for the view ────────────────────────────────────────────

/** Full localized date label, e.g. "الخميس ١٨ يونيو" / "Thu, Jun 18". */
export function formatFullDay(iso: string, locale: 'ar' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseIso(iso));
}

/** Month + year label, e.g. "يونيو ٢٠٢٦". */
export function formatMonthLabel(year: number, month0: number, locale: 'ar' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month0, 1));
}
