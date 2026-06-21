// parentAppSkillAnalyticsMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded, deterministic ANALYTICS for the Parent Skill Map enrichment:
//   • per-subject daily time series (mastery / accuracy / effort)
//   • daily study minutes (study-time trend + calendar heatmap)
//   • effort per subject
//   • peer comparison (child vs class average)
//   • timestamped study sessions (when + what was learned)
//   • a 5-point subject summary (assembled from the data, never free-form)
//   • flattened textbook pages (for the GitHub-style page grid)
//
// All values are pure functions of (childId[, subjectKey]) using the SAME PRNG
// pattern as the sibling mocks (createRng + hashStringToSeed with prefixed
// seeds). Anchored to the child's real masteryPct / trend7d from
// getChildSkillAreas so charts always agree with the rings. Dates roll with
// "today" (rolling window); the seeded values are stable across reloads.

import {
  getChildSkillAreas,
  type ParentSkillArea,
  type ParentSkillStatus,
} from './parentAppSkillMapMock';
import { getSubjectTree, type TreePage } from './parentAppTextbookTreeMock';
import { MOCK_EXAMS, type Exam } from '../../data/parentAppSchoolMockData';

// ── Shared seeding + activity (single source) ─────────────────────────────────

import { createRng, hashStringToSeed, clamp, pad2, isoForOffset } from '../../data/mockKit';
import { getDailyStudyMinutes, type DailyMinutes } from './activityMock';

/** n days ago (n ≥ 0). */
const isoDaysAgo = (n: number) => isoForOffset(-n);

// Re-export so existing consumers keep importing these from this module.
export { getDailyStudyMinutes, type DailyMinutes };

function areaFor(childId: string, subjectKey: string): ParentSkillArea | undefined {
  return getChildSkillAreas(childId).find((a) => a.subjectKey === subjectKey);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SeriesPoint {
  dateIso: string;
  masteryPct: number;
  accuracyPct: number;
  effortScore: number;
}

export interface SubjectEffort {
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  effortScore: number; // 0-100
  weeklyMinutes: number;
}

export interface SubjectPeer {
  childPct: number;
  classAvgPct: number;
}

export interface StudySession {
  id: string;
  dateTimeIso: string; // YYYY-MM-DDTHH:mm:00
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  lessonAr: string;
  lessonEn: string;
  minutes: number;
  accuracyPct: number;
}

// ── Per-subject daily series ───────────────────────────────────────────────────

/**
 * Daily mastery/accuracy/effort for a subject. The newest point lands on the
 * subject's current mastery, and the slope reflects trend7d (so "improvement
 * over time" is honest). Effort runs on its own gentle, seeded rhythm.
 */
export function getSubjectSeries(childId: string, subjectKey: string, days = 30): SeriesPoint[] {
  const area = areaFor(childId, subjectKey);
  const target = area?.masteryPct ?? 55;
  const trend7d = area?.trend7d ?? 0;
  const rand = createRng(hashStringToSeed(`series:${childId}:${subjectKey}`));

  // Total mastery change across the window, derived from the weekly trend.
  const totalChange = (trend7d * days) / 7;
  const start = clamp(target - totalChange, 5, 99);

  const effortBase = clamp(45 + rand() * 40, 30, 92); // subject's typical effort
  const effortSlope = (rand() - 0.4) * 0.8; // mild drift over the window

  const out: SeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const f = days <= 1 ? 1 : i / (days - 1);
    const base = start + (target - start) * f;
    const mastery = i === days - 1 ? target : clamp(Math.round(base + (rand() - 0.5) * 6), 3, 99);
    const accuracy = clamp(Math.round(base + 4 + (rand() - 0.5) * 16), 40, 99);
    const effort = clamp(Math.round(effortBase + effortSlope * i + (rand() - 0.5) * 22), 18, 100);
    out.push({
      dateIso: isoDaysAgo(days - 1 - i),
      masteryPct: mastery,
      accuracyPct: accuracy,
      effortScore: effort,
    });
  }
  return out;
}

// (getDailyStudyMinutes now lives in ./activityMock and is re-exported above.)

// ── Effort per subject ──────────────────────────────────────────────────────────

/** One effort reading per subject — averaged from each subject's series. */
export function getEffortPerSubject(childId: string): SubjectEffort[] {
  const areas = getChildSkillAreas(childId);
  return areas.map((a) => {
    const series = getSubjectSeries(childId, a.subjectKey, 14);
    const effortScore = Math.round(
      series.reduce((s, p) => s + p.effortScore, 0) / Math.max(series.length, 1),
    );
    const rand = createRng(hashStringToSeed(`effmins:${childId}:${a.subjectKey}`));
    const weeklyMinutes = Math.round(30 + rand() * 130);
    return {
      subjectKey: a.subjectKey,
      subjectAr: a.subjectAr,
      subjectEn: a.subjectEn,
      effortScore,
      weeklyMinutes,
    };
  });
}

// ── Peer comparison (vs class average) ──────────────────────────────────────────

/** Child mastery vs a (stable per-subject) class average. No ranking. */
export function getSubjectPeer(childId: string, subjectKey: string): SubjectPeer {
  const area = areaFor(childId, subjectKey);
  const childPct = area?.masteryPct ?? 55;
  // Class average is seeded by SUBJECT ONLY → the same class number for every
  // child (realistic: they share a class), independent of the child's score.
  const rand = createRng(hashStringToSeed(`classavg:${subjectKey}`));
  const classAvgPct = Math.round(58 + rand() * 18); // 58-76
  return { childPct, classAvgPct };
}

/** Anonymized peer reference points for a subject: the child vs the class
 *  median + the class top (no names, no rank). Seeded per subject (shared class). */
export interface PeerStats extends SubjectPeer {
  classMedianPct: number;
  classTopPct: number;
}

export function getPeerStats(childId: string, subjectKey: string): PeerStats {
  const peer = getSubjectPeer(childId, subjectKey);
  const rand = createRng(hashStringToSeed(`peerstats:${subjectKey}`));
  const classMedianPct = clamp(peer.classAvgPct - Math.round(rand() * 4), 30, 98); // ~avg, slightly below
  const classTopPct = clamp(peer.classAvgPct + 13 + Math.round(rand() * 10), peer.classAvgPct + 8, 99);
  return { ...peer, classMedianPct, classTopPct };
}

// ── Study sessions (when + what was learned) ────────────────────────────────────

/** Most-recent-first study sessions over the last ~14 days. Lessons are pulled
 *  from the real textbook tree so "what was learned" is authentic. */
export function getStudySessions(childId: string, count = 12): StudySession[] {
  const areas = getChildSkillAreas(childId);
  if (areas.length === 0) return [];
  const rand = createRng(hashStringToSeed(`sessions:${childId}`));

  // Pre-flatten one lesson pool per subject for quick authentic picks.
  const lessonsBySubject = new Map<string, { ar: string; en: string }[]>();
  for (const a of areas) {
    const tree = getSubjectTree(childId, a.subjectKey);
    const lessons = tree.units.flatMap((u) => u.lessons).map((l) => ({ ar: l.titleAr, en: l.titleEn }));
    lessonsBySubject.set(a.subjectKey, lessons.length ? lessons : [{ ar: a.subjectAr, en: a.subjectEn }]);
  }

  const out: StudySession[] = [];
  for (let day = 0; day < 14 && out.length < count; day++) {
    const dateIso = isoDaysAgo(day);
    const dow = new Date(dateIso).getDay();
    const isWeekend = dow === 5 || dow === 6;
    // 0-2 sessions per day (fewer on weekends, some empty days).
    const sessions = isWeekend ? (rand() < 0.6 ? 0 : 1) : rand() < 0.25 ? 0 : rand() < 0.7 ? 1 : 2;
    for (let s = 0; s < sessions && out.length < count; s++) {
      const a = areas[Math.floor(rand() * areas.length)];
      const pool = lessonsBySubject.get(a.subjectKey)!;
      const lesson = pool[Math.floor(rand() * pool.length)];
      const hour = 15 + Math.floor(rand() * 5); // 3pm – 7pm
      const minute = Math.floor(rand() * 12) * 5;
      out.push({
        id: `${childId}-sess-${day}-${s}`,
        dateTimeIso: `${dateIso}T${pad2(hour)}:${pad2(minute)}:00`,
        subjectKey: a.subjectKey,
        subjectAr: a.subjectAr,
        subjectEn: a.subjectEn,
        lessonAr: lesson.ar,
        lessonEn: lesson.en,
        minutes: Math.round(8 + rand() * 27),
        accuracyPct: Math.round(55 + rand() * 43),
      });
    }
  }
  return out;
}

// ── 5-point subject summary (assembled, never free-form) ────────────────────────

const STATUS_WORD: Record<ParentSkillStatus, { ar: string; en: string }> = {
  needsHelp: { ar: 'يحتاج دعماً', en: 'needs support' },
  developing: { ar: 'قيد التطوّر', en: 'developing' },
  proficient: { ar: 'جيّد', en: 'proficient' },
  mastered: { ar: 'متقَن', en: 'mastered' },
};

/** Five short, data-backed bullets summarizing a subject for the parent. */
export function getSubjectSummaryPoints(
  childId: string,
  subjectKey: string,
  name: string,
  locale: 'ar' | 'en',
): string[] {
  const ar = locale === 'ar';
  const area = areaFor(childId, subjectKey);
  if (!area) return [];
  const subject = ar ? area.subjectAr : area.subjectEn;
  const peer = getSubjectPeer(childId, subjectKey);
  const tree = getSubjectTree(childId, subjectKey);
  const weakestUnit = [...tree.units].sort((a, b) => a.masteryPct - b.masteryPct)[0];
  const recentSubjectSessions = getStudySessions(childId, 30).filter((s) => s.subjectKey === subjectKey);
  const word = STATUS_WORD[area.status];

  // ① standing
  const p1 = ar
    ? `${name} في ${subject}: ${word.ar} بإتقان ${area.masteryPct}%.`
    : `${name} in ${subject}: ${word.en} at ${area.masteryPct}% mastery.`;

  // ② trend
  const p2 =
    area.trend7d > 2
      ? ar
        ? `في تحسّن مستمر (+${area.trend7d}% هذا الأسبوع).`
        : `Improving steadily (+${area.trend7d}% this week).`
      : area.trend7d < -2
        ? ar
          ? `تراجع بسيط هذا الأسبوع (${area.trend7d}%) — يستحق المتابعة.`
          : `A slight dip this week (${area.trend7d}%) — worth a look.`
        : ar
          ? `مستقرّ هذا الأسبوع.`
          : `Holding steady this week.`;

  // ③ study habit
  const p3 = ar
    ? `${recentSubjectSessions.length} جلسة مذاكرة في آخر شهر لهذه المادة.`
    : `${recentSubjectSessions.length} study sessions in this subject last month.`;

  // ④ vs class average
  const diff = peer.childPct - peer.classAvgPct;
  const p4 =
    diff >= 4
      ? ar
        ? `أعلى من متوسط الصف بـ ${diff}% (متوسط الصف ${peer.classAvgPct}%).`
        : `${diff}% above the class average (class ${peer.classAvgPct}%).`
      : diff <= -4
        ? ar
          ? `أقل من متوسط الصف بـ ${Math.abs(diff)}% (متوسط الصف ${peer.classAvgPct}%).`
          : `${Math.abs(diff)}% below the class average (class ${peer.classAvgPct}%).`
        : ar
          ? `قريب من متوسط الصف (${peer.classAvgPct}%).`
          : `Right around the class average (${peer.classAvgPct}%).`;

  // ⑤ what's next
  const p5 = weakestUnit
    ? ar
      ? `التالي: ركّزوا على «${weakestUnit.titleAr}».`
      : `Next: focus on "${weakestUnit.titleEn}".`
    : ar
      ? `استمرّوا في الروتين الحالي.`
      : `Keep the current routine going.`;

  return [p1, p2, p3, p4, p5];
}

// ── Flattened pages (for the page grid) ─────────────────────────────────────────

/** All textbook pages of a subject, in reading order, for the GitHub-style grid. */
export function getSubjectPages(childId: string, subjectKey: string): TreePage[] {
  const tree = getSubjectTree(childId, subjectKey);
  return tree.units.flatMap((u) => u.lessons).flatMap((l) => l.pages);
}

// ── Snapshot derivations: strengths + risks (Phase 1) ───────────────────────────

/** Top strengths (proficient/mastered), strongest first. */
export function getStrengths(childId: string, limit = 3): ParentSkillArea[] {
  return getChildSkillAreas(childId)
    .filter((a) => a.status === 'proficient' || a.status === 'mastered')
    .sort((a, b) => b.masteryPct - a.masteryPct)
    .slice(0, limit);
}

export type RiskKind =
  | 'noProgress' // working hard but not improving → needs another strategy
  | 'needsHelp' // low mastery
  | 'declining'; // slipping this week

export interface RiskFlag {
  area: ParentSkillArea;
  kind: RiskKind;
  reasonAr: string;
  reasonEn: string;
}

/**
 * Watch-area flags, most actionable first. The signature signal is
 * "noProgress": high effort + flat/negative trend = the child is putting in
 * time without moving → a different strategy is needed.
 */
export function getRiskFlags(childId: string, limit = 3): RiskFlag[] {
  const areas = getChildSkillAreas(childId);
  const effortByKey = new Map(getEffortPerSubject(childId).map((e) => [e.subjectKey, e.effortScore]));
  const flags: RiskFlag[] = [];

  for (const a of areas) {
    const effort = effortByKey.get(a.subjectKey) ?? 50;
    if (effort >= 65 && a.trend7d <= 1 && a.masteryPct < 75) {
      flags.push({
        area: a,
        kind: 'noProgress',
        reasonAr: `يبذل جهداً كبيراً في ${a.subjectAr} لكن دون تقدّم واضح — قد تساعده طريقة مختلفة.`,
        reasonEn: `Putting in real effort in ${a.subjectEn} but not improving — a different approach may help.`,
      });
    } else if (a.status === 'needsHelp') {
      flags.push({
        area: a,
        kind: 'needsHelp',
        reasonAr: `${a.subjectAr} تحتاج إلى دعم (${a.masteryPct}%).`,
        reasonEn: `${a.subjectEn} needs support (${a.masteryPct}%).`,
      });
    } else if (a.trend7d <= -5) {
      flags.push({
        area: a,
        kind: 'declining',
        reasonAr: `${a.subjectAr} تتراجع هذا الأسبوع (${a.trend7d}%).`,
        reasonEn: `${a.subjectEn} slipped this week (${a.trend7d}%).`,
      });
    }
  }

  const order: Record<RiskKind, number> = { noProgress: 0, needsHelp: 1, declining: 2 };
  return flags.sort((x, y) => order[x.kind] - order[y.kind]).slice(0, limit);
}

// ── Exam prep + forecasting ─────────────────────────────────────────────────────

export type ExamReadinessLevel = 'ready' | 'onTrack' | 'atRisk';

export interface ExamForecast {
  exam: Exam;
  daysUntil: number;
  /** Projected mastery by exam day (0-100). */
  readinessPct: number;
  level: ExamReadinessLevel;
}

function daysFromToday(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function buildForecast(area: ParentSkillArea | undefined, exam: Exam): ExamForecast {
  const daysUntil = Math.max(0, daysFromToday(exam.dateIso));
  const mastery = area?.masteryPct ?? 55;
  const trend = area?.trend7d ?? 0;
  // Project mastery forward to exam day along the current weekly trend.
  const projected = clampN(Math.round(mastery + (trend * daysUntil) / 7), 5, 99);
  const level: ExamReadinessLevel = projected >= 80 ? 'ready' : projected >= 60 ? 'onTrack' : 'atRisk';
  return { exam, daysUntil, readinessPct: projected, level };
}

function clampN(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** The soonest upcoming exam for a subject (or null). */
export function getUpcomingExamForSubject(childId: string, subjectKey: string): ExamForecast | null {
  const areas = getChildSkillAreas(childId);
  const area = areas.find((a) => a.subjectKey === subjectKey);
  const exam = MOCK_EXAMS.filter((e) => e.childId === childId && e.subject === subjectKey && daysFromToday(e.dateIso) >= 0)
    .sort((a, b) => daysFromToday(a.dateIso) - daysFromToday(b.dateIso))[0];
  if (!exam) return null;
  return buildForecast(area, exam);
}

/** The soonest upcoming exam across all subjects (for the skill-map banner). */
export function getNextExam(childId: string): ExamForecast | null {
  const areas = getChildSkillAreas(childId);
  const exam = MOCK_EXAMS.filter((e) => e.childId === childId && daysFromToday(e.dateIso) >= 0)
    .sort((a, b) => daysFromToday(a.dateIso) - daysFromToday(b.dateIso))[0];
  if (!exam) return null;
  const area = areas.find((a) => a.subjectKey === exam.subject);
  return buildForecast(area, exam);
}

/** Every upcoming exam for the child (soonest first), each with its forecast.
 *  The cross-subject roll-up behind the Tasks view exam zone. */
export function getUpcomingExams(childId: string): ExamForecast[] {
  const areas = getChildSkillAreas(childId);
  return MOCK_EXAMS.filter((e) => e.childId === childId && daysFromToday(e.dateIso) >= 0)
    .sort((a, b) => daysFromToday(a.dateIso) - daysFromToday(b.dateIso))
    .map((exam) => buildForecast(areas.find((a) => a.subjectKey === exam.subject), exam));
}
