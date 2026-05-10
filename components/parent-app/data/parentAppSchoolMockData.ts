// parentAppSchoolMockData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded mock data for the school-logistics shortcuts (calendar, assignments,
// exams, tomorrow's books). Mirrors the createRng pattern in
// `data/mockAttendanceData.ts` and `parentAppMockData.ts`. No backend, no
// localStorage — refresh resets everything.
//
// Subjects use a static AR/EN-keyed lookup so Tailwind v4 JIT picks up every
// class literal at build time. New subjects must be added here AND to the
// SUBJECT_STYLES map in `subjectStyles.ts`.

import { MOCK_PARENT_APP_STATE } from '../parentAppMockData';

// ============================================================================
// Seeded PRNG (mirrors data/mockAttendanceData.ts)
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(7777);

// ============================================================================
// Subject keys (closed enum — every subject has a row in SUBJECT_STYLES)
// ============================================================================

export type SubjectKey =
  | 'math'
  | 'arabic'
  | 'english'
  | 'science'
  | 'reading'
  | 'pe'
  | 'art';

export interface SubjectStyle {
  /** AR display label (used in row headers / tooltips). */
  labelAr: string;
  labelEn: string;
  /** Static Tailwind classes — JIT-safe literals. */
  iconBg: string;
  iconText: string;
  /** Tiny dot used in the calendar grid. */
  dot: string;
  /** Soft pill background for chips/pills. */
  pillBg: string;
  pillText: string;
  /** Single-letter glyph for the subject icon circle (locale-agnostic). */
  glyph: string;
}

/**
 * Master subject → color/glyph map. THE source of truth shared across the
 * 4 drawers. Math = duo-blue, Reading = duo-green, Arabic = duo-gold,
 * English = duo-purple, Science = duo-blue (sky variant), PE = duo-orange,
 * Art = duo-purple (rose variant).
 */
export const SUBJECT_STYLES: Record<SubjectKey, SubjectStyle> = {
  math: {
    labelAr: 'رياضيات',
    labelEn: 'Math',
    iconBg: 'bg-duo-blue',
    iconText: 'text-white',
    dot: 'bg-duo-blue',
    pillBg: 'bg-duo-blue-light',
    pillText: 'text-duo-blue',
    glyph: '×',
  },
  arabic: {
    labelAr: 'عربي',
    labelEn: 'Arabic',
    iconBg: 'bg-duo-gold',
    iconText: 'text-white',
    dot: 'bg-duo-gold',
    pillBg: 'bg-duo-gold-light',
    pillText: 'text-amber-700',
    glyph: 'ع',
  },
  english: {
    labelAr: 'إنجليزي',
    labelEn: 'English',
    iconBg: 'bg-duo-purple',
    iconText: 'text-white',
    dot: 'bg-duo-purple',
    pillBg: 'bg-duo-purple-light',
    pillText: 'text-purple-700',
    glyph: 'A',
  },
  science: {
    labelAr: 'علوم',
    labelEn: 'Science',
    iconBg: 'bg-sky-500',
    iconText: 'text-white',
    dot: 'bg-sky-500',
    pillBg: 'bg-sky-100',
    pillText: 'text-sky-700',
    glyph: '∿',
  },
  reading: {
    labelAr: 'قراءة',
    labelEn: 'Reading',
    iconBg: 'bg-duo-green',
    iconText: 'text-white',
    dot: 'bg-duo-green',
    pillBg: 'bg-duo-green-light',
    pillText: 'text-[#4CAD00]',
    glyph: 'ق',
  },
  pe: {
    labelAr: 'تربية رياضية',
    labelEn: 'PE',
    iconBg: 'bg-duo-orange',
    iconText: 'text-white',
    dot: 'bg-duo-orange',
    pillBg: 'bg-duo-orange-light',
    pillText: 'text-orange-700',
    glyph: '⚽',
  },
  art: {
    labelAr: 'فنون',
    labelEn: 'Art',
    iconBg: 'bg-rose-500',
    iconText: 'text-white',
    dot: 'bg-rose-500',
    pillBg: 'bg-rose-100',
    pillText: 'text-rose-700',
    glyph: '✎',
  },
};

// ============================================================================
// Date helpers
// ============================================================================

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO YYYY-MM-DD (no time). */
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ============================================================================
// School Calendar Events
// ============================================================================

export type SchoolEventKind =
  | 'holiday'
  | 'trip'
  | 'exam'
  | 'meeting'
  | 'sports'
  | 'celebration';

export interface SchoolEvent {
  id: string;
  /** ISO YYYY-MM-DD. */
  dateIso: string;
  titleAr: string;
  titleEn: string;
  kind: SchoolEventKind;
  /** Optional subject color hint for exam/quiz events. */
  subject?: SubjectKey;
  /** Optional child scoping. */
  childId?: string;
}

const CHILD_IDS = MOCK_PARENT_APP_STATE.children.map((c) => c.id);

/**
 * Pool of events spread across this and next month. Anchored to today so the
 * calendar always shows live "in N days" copy.
 */
const RAW_EVENTS: SchoolEvent[] = [
  {
    id: 'ev-1',
    dateIso: isoDaysFromNow(1),
    titleAr: 'اختبار رياضيات قصير',
    titleEn: 'Math quick quiz',
    kind: 'exam',
    subject: 'math',
    childId: CHILD_IDS[0],
  },
  {
    id: 'ev-2',
    dateIso: isoDaysFromNow(3),
    titleAr: 'يوم رياضي مدرسي',
    titleEn: 'School sports day',
    kind: 'sports',
  },
  {
    id: 'ev-3',
    dateIso: isoDaysFromNow(5),
    titleAr: 'رحلة لمتحف الأطفال',
    titleEn: 'Trip to Children’s Museum',
    kind: 'trip',
    childId: CHILD_IDS[1],
  },
  {
    id: 'ev-4',
    dateIso: isoDaysFromNow(7),
    titleAr: 'اجتماع أولياء الأمور',
    titleEn: 'Parent-teacher meeting',
    kind: 'meeting',
  },
  {
    id: 'ev-5',
    dateIso: isoDaysFromNow(10),
    titleAr: 'اختبار قراءة الفصل الرابع',
    titleEn: 'Reading exam — Chapter 4',
    kind: 'exam',
    subject: 'reading',
    childId: CHILD_IDS[0],
  },
  {
    id: 'ev-6',
    dateIso: isoDaysFromNow(14),
    titleAr: 'عطلة المولد النبوي',
    titleEn: 'Mawlid holiday',
    kind: 'holiday',
  },
  {
    id: 'ev-7',
    dateIso: isoDaysFromNow(18),
    titleAr: 'حفل ختام مهارات اللغة',
    titleEn: 'Language skills celebration',
    kind: 'celebration',
    childId: CHILD_IDS[2],
  },
  {
    id: 'ev-8',
    dateIso: isoDaysFromNow(22),
    titleAr: 'اختبار علوم — الفصل الثاني',
    titleEn: 'Science exam — Chapter 2',
    kind: 'exam',
    subject: 'science',
    childId: CHILD_IDS[1],
  },
];

export const SCHOOL_EVENTS: SchoolEvent[] = RAW_EVENTS;

/**
 * Get every event whose date falls inside the given month (year, month-index
 * 0-11). Useful for the calendar grid.
 */
export function getSchoolEventsForMonth(year: number, month: number): SchoolEvent[] {
  return SCHOOL_EVENTS.filter((ev) => {
    const d = new Date(ev.dateIso);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/** Quick lookup of all events on a single ISO date. */
export function getSchoolEventsForDate(dateIso: string): SchoolEvent[] {
  return SCHOOL_EVENTS.filter((ev) => ev.dateIso === dateIso);
}

// ============================================================================
// Assignments
// ============================================================================

/**
 * Stored progress flag — what the kid/parent has done so far. The DISPLAY
 * status (5 states) is derived at render time from this + the deadline.
 */
export type AssignmentProgress = 'not-started' | 'started' | 'done';

/**
 * Display status taxonomy — derived at render time from `progress + dueIso`.
 * - `not-started` → progress is 'not-started' and deadline > 24h away.
 * - `started`     → progress is 'started' and deadline > 24h away.
 * - `in-danger`   → not done and deadline ≤ 24h away (still in the future).
 * - `late`        → not done and deadline already passed.
 * - `done`        → progress is 'done' (regardless of deadline).
 */
export type AssignmentDisplayStatus =
  | 'not-started'
  | 'started'
  | 'in-danger'
  | 'late'
  | 'done';

/** @deprecated Kept as an alias for back-compat; new code should use AssignmentDisplayStatus. */
export type AssignmentStatus = AssignmentDisplayStatus;

export interface Assignment {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: SubjectKey;
  /** ISO YYYY-MM-DD or full ISO timestamp (deadline). */
  dueIso: string;
  /** Stored user progress flag (NOT the display status). */
  progress: AssignmentProgress;
  childId: string;
  descriptionAr: string;
  descriptionEn: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure derivation — never mutates. Given a stored progress flag and a
 * deadline ISO, returns the display-time status. Called per-row inside the
 * AssignmentsDrawer at render time.
 */
export function deriveAssignmentStatus(
  progress: AssignmentProgress,
  dueIso: string,
  now: number = Date.now()
): AssignmentDisplayStatus {
  if (progress === 'done') return 'done';
  const due = new Date(dueIso).getTime();
  if (due < now) return 'late';
  if (due - now <= ONE_DAY_MS) return 'in-danger';
  if (progress === 'started') return 'started';
  return 'not-started';
}

/**
 * Seeded mock — handcrafted to demonstrate every one of the 5 derived states:
 *   1× done, 1× late, 1× in-danger, 2× started, 2× not-started = 7 rows.
 *
 * Note: deadlines are scheduled relative to "now" so the demo always shows
 * live status. We use ISO with a time component for the "in-danger" entry
 * so the within-24h test fires regardless of the local clock-of-day.
 */
function isoHoursFromNow(hours: number): string {
  const d = new Date();
  d.setMilliseconds(0);
  d.setSeconds(0);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

export const MOCK_ASSIGNMENTS: Assignment[] = [
  // 1. DONE — completed, deadline already passed (still shows as done).
  {
    id: 'asg-1',
    titleAr: 'حل تمارين الكسور صفحة 42',
    titleEn: 'Fractions worksheet — page 42',
    subject: 'math',
    dueIso: isoDaysFromNow(-1),
    progress: 'done',
    childId: CHILD_IDS[0],
    descriptionAr: 'حل التمارين من 1 إلى 8 على الكسور المتكافئة. أحضر دفتر الرياضيات وقلم رصاص.',
    descriptionEn: 'Solve problems 1–8 on equivalent fractions. Bring math notebook and pencil.',
  },
  // 2. LATE — deadline already passed and not done.
  {
    id: 'asg-2',
    titleAr: 'قراءة قصة "العصفور الذكي"',
    titleEn: 'Read "The Clever Sparrow"',
    subject: 'reading',
    dueIso: isoDaysFromNow(-2),
    progress: 'started',
    childId: CHILD_IDS[0],
    descriptionAr: 'قراءة القصة بصوت عالٍ مرتين، ثم تلخيصها في 3 جمل.',
    descriptionEn: 'Read the story aloud twice, then summarize in 3 sentences.',
  },
  // 3. IN-DANGER — due within 24h (~12h from now), not done.
  {
    id: 'asg-3',
    titleAr: 'حل تمارين الجدول 6',
    titleEn: 'Times table 6 worksheet',
    subject: 'math',
    dueIso: isoHoursFromNow(12),
    progress: 'not-started',
    childId: CHILD_IDS[0],
    descriptionAr: 'حل التمارين من 1 إلى 12 على جدول الضرب رقم 6.',
    descriptionEn: 'Solve problems 1–12 on the 6× times table.',
  },
  // 4. STARTED — in progress, deadline a few days out.
  {
    id: 'asg-4',
    titleAr: 'كتابة 5 جمل عن العائلة',
    titleEn: 'Write 5 sentences about family',
    subject: 'english',
    dueIso: isoDaysFromNow(3),
    progress: 'started',
    childId: CHILD_IDS[0],
    descriptionAr: 'استخدم الفعل "have" في كل جملة. اكتب على دفتر الإنجليزي.',
    descriptionEn: 'Use the verb "have" in each sentence. Write in your English notebook.',
  },
  // 5. STARTED — second one for variety.
  {
    id: 'asg-5',
    titleAr: 'حفظ سورة الفلق',
    titleEn: 'Memorize Surat Al-Falaq',
    subject: 'arabic',
    dueIso: isoDaysFromNow(4),
    progress: 'started',
    childId: CHILD_IDS[0],
    descriptionAr: 'حفظ السورة كاملة وكتابتها مرة واحدة في دفتر العربي.',
    descriptionEn: 'Memorize the full surah and write it once in the Arabic notebook.',
  },
  // 6. NOT-STARTED — deadline far out.
  {
    id: 'asg-6',
    titleAr: 'تجربة الذوبان في الماء',
    titleEn: 'Dissolving experiment',
    subject: 'science',
    dueIso: isoDaysFromNow(5),
    progress: 'not-started',
    childId: CHILD_IDS[0],
    descriptionAr: 'اختبر 3 مواد (سكر، ملح، رمل) واكتب أيهم يذوب في الماء.',
    descriptionEn: 'Test 3 materials (sugar, salt, sand) and record which dissolve in water.',
  },
  // 7. NOT-STARTED — second one for variety.
  {
    id: 'asg-7',
    titleAr: 'رسم منظر طبيعي',
    titleEn: 'Draw a landscape',
    subject: 'art',
    dueIso: isoDaysFromNow(6),
    progress: 'not-started',
    childId: CHILD_IDS[0],
    descriptionAr: 'رسم منظر طبيعي باستخدام أقلام التلوين الخشبية.',
    descriptionEn: 'Draw a landscape using colored pencils.',
  },
];

// Reference rng so the unused-import lint doesn't trip — the seeded RNG is
// reserved for future per-child variations.
void rng;

// ============================================================================
// Exams
// ============================================================================

export interface Exam {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: SubjectKey;
  /** ISO YYYY-MM-DD. */
  dateIso: string;
  topicsAr: string;
  topicsEn: string;
  tipsAr: string[];
  tipsEn: string[];
  childId: string;
}

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    titleAr: 'اختبار رياضيات قصير',
    titleEn: 'Math quick quiz',
    subject: 'math',
    dateIso: isoDaysFromNow(1),
    topicsAr: 'الكسور المتكافئة، جمع وطرح الكسور',
    topicsEn: 'Equivalent fractions, adding & subtracting fractions',
    tipsAr: [
      'مراجعة الفصل 3 من كتاب الرياضيات',
      'حل 5 تمارين عملية كل يوم',
      'مراجعة الأمثلة المحلولة قبل النوم',
    ],
    tipsEn: [
      'Review chapter 3 of the math textbook',
      'Practice 5 problems daily',
      'Go over solved examples before bedtime',
    ],
    childId: CHILD_IDS[0],
  },
  {
    id: 'exam-2',
    titleAr: 'اختبار قراءة — الفصل الرابع',
    titleEn: 'Reading exam — Chapter 4',
    subject: 'reading',
    dateIso: isoDaysFromNow(10),
    topicsAr: 'الفهم القرائي، استخراج الفكرة الرئيسية',
    topicsEn: 'Reading comprehension, identifying main ideas',
    tipsAr: [
      'قراءة الفصل بصوت عالٍ',
      'مناقشة القصة مع أحد الوالدين',
      'كتابة ملخص قصير لكل قسم',
    ],
    tipsEn: [
      'Read the chapter aloud',
      'Discuss the story with a parent',
      'Write a short summary for each section',
    ],
    childId: CHILD_IDS[0],
  },
  {
    id: 'exam-3',
    titleAr: 'اختبار علوم — الفصل الثاني',
    titleEn: 'Science exam — Chapter 2',
    subject: 'science',
    dateIso: isoDaysFromNow(22),
    topicsAr: 'حالات المادة، تجارب الذوبان والتبخر',
    topicsEn: 'States of matter, dissolving & evaporation experiments',
    tipsAr: [
      'مشاهدة فيديو تجريبي قصير',
      'حفظ المصطلحات الأساسية',
      'تنفيذ تجربة بسيطة في البيت',
    ],
    tipsEn: [
      'Watch a short experiment video',
      'Memorize the key vocabulary',
      'Try a simple experiment at home',
    ],
    childId: CHILD_IDS[1],
  },
  {
    id: 'exam-4',
    titleAr: 'اختبار إنجليزي — المفردات',
    titleEn: 'English vocab test',
    subject: 'english',
    dateIso: isoDaysFromNow(6),
    topicsAr: '20 كلمة جديدة من الوحدة الثالثة',
    topicsEn: '20 new words from Unit 3',
    tipsAr: [
      'مراجعة الكلمات بالبطاقات',
      'استخدام كل كلمة في جملة',
      'الاستماع إلى الكلمات على التطبيق',
    ],
    tipsEn: [
      'Review words with flashcards',
      'Use each word in a sentence',
      'Listen to the words on the app',
    ],
    childId: CHILD_IDS[2],
  },
];

// ============================================================================
// Tomorrow's Books
// ============================================================================

export type PackItemKind = 'book' | 'supply' | 'clothes' | 'food';

export interface PackItem {
  id: string;
  titleAr: string;
  titleEn: string;
  kind: PackItemKind;
  /** Optional emoji-style hint glyph (legacy — books now prefer subject icon). */
  glyph: string;
  /** Subject hint — drives the colored subject icon on book rows. */
  subject?: SubjectKey;
}

/**
 * Compute "tomorrow" as a real Date object that respects Jordan's Fri-Sat
 * weekend. If today is Friday (getDay() === 5), the next school day is
 * Sunday (skip Saturday). Saturday (getDay() === 6) → Sunday. All other
 * days → next calendar day.
 *
 * Returns the Date so the drawer can also display "Sunday's books" on Friday.
 */
export function getNextSchoolDay(today: Date = new Date()): Date {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (dow === 4) {
    // Thursday → Sunday (skip Fri+Sat weekend)
    d.setDate(d.getDate() + 3);
  } else if (dow === 5) {
    // Friday → Sunday
    d.setDate(d.getDate() + 2);
  } else if (dow === 6) {
    // Saturday → Sunday
    d.setDate(d.getDate() + 1);
  } else {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/**
 * Day-of-week in AR/EN for headers like "غداً (الأحد) سارة بحاجة إلى…"
 */
export function getDayOfWeekLabel(date: Date, locale: 'ar' | 'en'): string {
  const dow = date.getDay();
  const ar = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return locale === 'ar' ? ar[dow] : en[dow];
}

/**
 * Per-child book list — books ONLY (no water bottle, no lunch box, no
 * pencils, no PE clothes). Subjects rotate by Jordan-school weekday:
 *   Sun    → Math, Arabic, Science
 *   Mon    → Math, English, Social Studies (rendered as 'reading' subject)
 *   Tue    → Arabic, Science, Art
 *   Wed    → Math, English, PE
 *   Thu    → Arabic, Science, Music (rendered as 'art' subject)
 *
 * Each entry maps to a SUBJECT_STYLES key so the row renders the colored
 * subject icon (math = blue ×, arabic = gold ع, etc.). Items unique to a
 * subject still appear once even if the same book exists across days; the
 * `id` is composed of subject + day to avoid React-key collisions.
 *
 * Reference: spec — drop everything except books, 3-5 books per day.
 */
export function getTomorrowBooks(_childId: string, today: Date = new Date()): PackItem[] {
  const target = getNextSchoolDay(today);
  const targetDow = target.getDay();

  // Static pool of book templates (closed enum so Tailwind JIT picks every class).
  const M: PackItem = {
    id: 'book-math',
    titleAr: 'كتاب الرياضيات',
    titleEn: 'Math book',
    kind: 'book',
    glyph: '📘',
    subject: 'math',
  };
  const A: PackItem = {
    id: 'book-arabic',
    titleAr: 'كتاب اللغة العربية',
    titleEn: 'Arabic book',
    kind: 'book',
    glyph: '📕',
    subject: 'arabic',
  };
  const E: PackItem = {
    id: 'book-english',
    titleAr: 'كتاب الإنجليزية',
    titleEn: 'English book',
    kind: 'book',
    glyph: '📕',
    subject: 'english',
  };
  const S: PackItem = {
    id: 'book-science',
    titleAr: 'كتاب العلوم',
    titleEn: 'Science book',
    kind: 'book',
    glyph: '🔬',
    subject: 'science',
  };
  const Soc: PackItem = {
    id: 'book-social',
    titleAr: 'كتاب الدراسات الاجتماعية',
    titleEn: 'Social Studies book',
    kind: 'book',
    glyph: '🌍',
    // 'reading' subject used here for green tone — matches the social-studies
    // identity in our limited subject palette.
    subject: 'reading',
  };
  const Art: PackItem = {
    id: 'book-art',
    titleAr: 'كتاب الفن',
    titleEn: 'Art book',
    kind: 'book',
    glyph: '🎨',
    subject: 'art',
  };
  const PE: PackItem = {
    id: 'book-pe',
    titleAr: 'كتاب التربية البدنية',
    titleEn: 'PE book',
    kind: 'book',
    glyph: '🏃',
    subject: 'pe',
  };
  const Music: PackItem = {
    id: 'book-music',
    titleAr: 'كتاب الموسيقى',
    titleEn: 'Music book',
    kind: 'book',
    glyph: '🎵',
    // Use the rose 'art' tone for music — closest fit in the existing palette.
    subject: 'art',
  };

  switch (targetDow) {
    case 0: // Sunday
      return [M, A, S];
    case 1: // Monday
      return [M, E, Soc];
    case 2: // Tuesday
      return [A, S, Art];
    case 3: // Wednesday
      return [M, E, PE];
    case 4: // Thursday
      return [A, S, Music];
    default:
      // Fri/Sat shouldn't reach this — getNextSchoolDay skips weekends — but
      // fall back to a sensible Sunday-style list just in case.
      return [M, A, S];
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Count of assignments that are NOT yet done for the active child. Includes
 * everything in {not-started, started, in-danger, late} — i.e. anything
 * whose derived status isn't 'done'. Drives the strip card badge.
 */
export function getPendingAssignmentCount(activeChildId: string): number {
  return MOCK_ASSIGNMENTS.filter(
    (a) => a.progress !== 'done' && a.childId === activeChildId
  ).length;
}

/** Days until the soonest exam for the given active child. */
export function getSoonestExamDays(activeChildId: string): number | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const candidates = MOCK_EXAMS.filter((e) => e.childId === activeChildId)
    .map((e) => {
      const d = new Date(e.dateIso);
      d.setHours(0, 0, 0, 0);
      return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    })
    .filter((n) => n >= 0)
    .sort((a, b) => a - b);
  return candidates.length > 0 ? candidates[0] : null;
}

/** All ISO dates referenced by SCHOOL_EVENTS (Set for O(1) lookup). */
export const EVENT_DATES_SET: Set<string> = new Set(SCHOOL_EVENTS.map((e) => e.dateIso));

// Reference toIsoDate so the helper isn't pruned by tree-shaking — we may
// need to expose it in a future patch.
export { toIsoDate };

// ============================================================================
// School Forms
// ============================================================================

export type FormStatus = 'pending' | 'completed' | 'signed';

/** Field types supported by the parent-side form fill mode. */
export type FormFieldType =
  | 'text'
  | 'long-text'
  | 'multiple-choice'
  | 'yes-no'
  | 'date'
  | 'signature'
  | 'file';

/**
 * One field on a school form. AR/EN labels are paired so the renderer can
 * pick by locale. For 'multiple-choice', `optionsAr` / `optionsEn` MUST
 * have matching length — index alignment is how we map AR ↔ EN.
 *
 * `prefilledAnswer` carries the saved mock answer for completed/signed
 * forms — the renderer shows the field disabled with this value plugged in.
 */
export interface FormField {
  id: string;
  type: FormFieldType;
  questionAr: string;
  questionEn: string;
  required?: boolean;
  optionsAr?: string[];
  optionsEn?: string[];
  helpAr?: string;
  helpEn?: string;
  /** For completed/signed forms — the saved answer the parent already submitted. */
  prefilledAnswer?: string;
}

export interface SchoolForm {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: FormStatus;
  /** ISO YYYY-MM-DD. Optional — some forms have no deadline. */
  dueIso?: string;
  childId: string;
  /** Field definitions rendered in the parent-side fill view. */
  fields: FormField[];
  /** Display-only badge — "~3 min" hint shown next to the question count. */
  estimatedMinutes: number;
}

/**
 * Mock forms — varied subjects/topics that feel real for a Jordanian school.
 * 4 entries: 2 pending (school trip permission, beginning-of-year survey),
 * 1 completed (medical info), 1 signed (sports day permission).
 *
 * Note: per the spec, the active child for v1.1 is `child-sara` (CHILD_IDS[0]).
 * We seed all 4 forms to that child so the badge count matches drawer content.
 */
export const MOCK_FORMS: SchoolForm[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 1. Dead Sea field trip permission — pending, 6 fields.
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'form-1',
    titleAr: 'إذن الرحلة المدرسية إلى البحر الميت',
    titleEn: 'Field trip permission — Dead Sea',
    descriptionAr:
      'رحلة الصف إلى البحر الميت يوم الأربعاء القادم. الرجاء التوقيع على نموذج الإذن وإرفاق رقم الطوارئ. مدة الرحلة من الساعة 8 صباحاً حتى 3 عصراً.',
    descriptionEn:
      "Class field trip to the Dead Sea next Wednesday. Please sign the permission slip and add an emergency contact. Trip runs 8 AM to 3 PM.",
    status: 'pending',
    dueIso: isoDaysFromNow(3),
    childId: CHILD_IDS[0],
    estimatedMinutes: 3,
    fields: [
      {
        id: 'f1-1',
        type: 'text',
        questionAr: 'اسم ولي الأمر الكامل',
        questionEn: 'Parent / guardian full name',
        required: true,
      },
      {
        id: 'f1-2',
        type: 'text',
        questionAr: 'صلة القرابة',
        questionEn: 'Relation to the student',
        helpAr: 'مثال: الأب، الأم، الجد',
        helpEn: 'e.g. Father, Mother, Grandfather',
        required: true,
      },
      {
        id: 'f1-3',
        type: 'yes-no',
        questionAr: 'هل توافق على مشاركة الطالب في الرحلة؟',
        questionEn: 'Do you give permission for the trip?',
        required: true,
      },
      {
        id: 'f1-4',
        type: 'long-text',
        questionAr: 'ملاحظات طبية (حساسية، أدوية، أمور خاصة)',
        questionEn: 'Medical notes (allergies, medications, anything special)',
        helpAr: 'اتركها فارغة إذا لم تكن هناك ملاحظات',
        helpEn: 'Leave empty if there is nothing to note',
      },
      {
        id: 'f1-5',
        type: 'date',
        questionAr: 'تاريخ التوقيع',
        questionEn: 'Date of signature',
        required: true,
      },
      {
        id: 'f1-6',
        type: 'signature',
        questionAr: 'توقيع ولي الأمر',
        questionEn: 'Parent / guardian signature',
        required: true,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 2. Beginning-of-year survey — pending, 5 fields.
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'form-2',
    titleAr: 'استبيان بداية العام الدراسي',
    titleEn: 'Beginning-of-year survey',
    descriptionAr:
      'استبيان قصير عن اهتمامات الطفل، الأنشطة المفضلة، وأي ملاحظات صحية أو سلوكية تودّون مشاركتها مع المعلمة.',
    descriptionEn:
      'A short survey about your child\'s interests, favorite activities, and any health or behavioral notes you\'d like to share with the teacher.',
    status: 'pending',
    dueIso: isoDaysFromNow(7),
    childId: CHILD_IDS[1],
    estimatedMinutes: 4,
    fields: [
      {
        id: 'f2-1',
        type: 'multiple-choice',
        questionAr: 'الوسيلة المفضّلة للتواصل معكم',
        questionEn: 'Preferred contact method',
        optionsAr: ['اتصال هاتفي', 'رسالة نصّية', 'بريد إلكتروني', 'تطبيق المدرسة'],
        optionsEn: ['Phone call', 'Text message', 'Email', 'School app'],
        required: true,
      },
      {
        id: 'f2-2',
        type: 'text',
        questionAr: 'اسم جهة الاتصال في الطوارئ',
        questionEn: 'Emergency contact name',
        required: true,
      },
      {
        id: 'f2-3',
        type: 'text',
        questionAr: 'رقم هاتف جهة الطوارئ',
        questionEn: 'Emergency contact phone',
        helpAr: 'مثال: 0791234567',
        helpEn: 'e.g. 0791234567',
        required: true,
      },
      {
        id: 'f2-4',
        type: 'multiple-choice',
        questionAr: 'النشاط المفضّل لطفلكم',
        questionEn: "Child's favorite activity",
        optionsAr: ['الرياضة', 'القراءة', 'الفنون', 'العلوم', 'الموسيقى'],
        optionsEn: ['Sports', 'Reading', 'Arts', 'Science', 'Music'],
      },
      {
        id: 'f2-5',
        type: 'long-text',
        questionAr: 'هل لديكم أي مخاوف أو ملاحظات تودّون مشاركتها؟',
        questionEn: 'Any concerns or notes you\'d like to share?',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 3. Medical info form — completed, 4 fields with prefilled answers.
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'form-3',
    titleAr: 'نموذج المعلومات الطبية',
    titleEn: 'Medical information form',
    descriptionAr:
      'تم تعبئة المعلومات الطبية الأساسية. شكراً لكم — يمكنكم مراجعة الإجابات في أي وقت.',
    descriptionEn:
      'Basic medical info has been completed. You can review your responses anytime.',
    status: 'completed',
    childId: CHILD_IDS[2],
    estimatedMinutes: 2,
    fields: [
      {
        id: 'f3-1',
        type: 'text',
        questionAr: 'اسم طبيب العائلة',
        questionEn: 'Family doctor name',
        required: true,
        prefilledAnswer: 'Dr. Mohammed Khouri',
      },
      {
        id: 'f3-2',
        type: 'long-text',
        questionAr: 'الحساسيات (إن وجدت)',
        questionEn: 'Allergies (if any)',
        prefilledAnswer: 'حساسية خفيفة من الفول السوداني / Mild peanut allergy',
      },
      {
        id: 'f3-3',
        type: 'long-text',
        questionAr: 'الأدوية المنتظمة',
        questionEn: 'Regular medications',
        prefilledAnswer: 'لا يوجد / None',
      },
      {
        id: 'f3-4',
        type: 'yes-no',
        questionAr: 'هل تأذن بإعطاء الإسعاف الأولي عند الحاجة؟',
        questionEn: 'Do you authorize first aid when needed?',
        required: true,
        prefilledAnswer: 'yes',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 4. Sports day permission — signed, 5 fields prefilled (incl. signature).
  // ───────────────────────────────────────────────────────────────────────
  {
    id: 'form-4',
    titleAr: 'إذن المشاركة في اليوم الرياضي',
    titleEn: 'Sports Day participation permission',
    descriptionAr:
      'تم التوقيع على إذن مشاركة سارة في اليوم الرياضي يوم الخميس.',
    descriptionEn:
      "Sara's permission to take part in Sports Day on Thursday has been signed.",
    status: 'signed',
    dueIso: isoDaysFromNow(-2),
    childId: CHILD_IDS[0],
    estimatedMinutes: 2,
    fields: [
      {
        id: 'f4-1',
        type: 'text',
        questionAr: 'اسم ولي الأمر الكامل',
        questionEn: 'Parent / guardian full name',
        required: true,
        prefilledAnswer: 'Ahmad Al-Khouri',
      },
      {
        id: 'f4-2',
        type: 'yes-no',
        questionAr: 'هل توافق على مشاركة الطالب في اليوم الرياضي؟',
        questionEn: 'Do you give permission for Sports Day?',
        required: true,
        prefilledAnswer: 'yes',
      },
      {
        id: 'f4-3',
        type: 'long-text',
        questionAr: 'ملاحظات طبية',
        questionEn: 'Medical notes',
        prefilledAnswer: 'لا يوجد / None',
      },
      {
        id: 'f4-4',
        type: 'date',
        questionAr: 'تاريخ التوقيع',
        questionEn: 'Date of signature',
        required: true,
        prefilledAnswer: '2026-05-08',
      },
      {
        id: 'f4-5',
        type: 'signature',
        questionAr: 'توقيع ولي الأمر',
        questionEn: 'Parent / guardian signature',
        required: true,
        prefilledAnswer: 'signed',
      },
    ],
  },
];

/** Pending-fill forms count for the active child (drives the strip badge). */
export function getPendingFormsCount(activeChildId: string): number {
  return MOCK_FORMS.filter(
    (f) => f.status === 'pending' && f.childId === activeChildId
  ).length;
}

// ============================================================================
// Attendance
// ============================================================================

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'tardy'
  | 'weekend'
  | 'holiday'
  | 'future';

/** Per-class-period attendance status — 4 states inside a single school day. */
export type SessionStatus = 'present' | 'late' | 'absent' | 'excused';

/** One class period within a school day. */
export interface AttendanceSession {
  id: string;
  subjectAr: string;
  subjectEn: string;
  /** "HH:mm" 24h. */
  startTime: string;
  endTime: string;
  status: SessionStatus;
  /** Optional teacher / system note. */
  noteAr?: string;
  noteEn?: string;
}

export interface AttendanceDay {
  /** ISO YYYY-MM-DD. */
  iso: string;
  /** Day-level status — derived from the worst-case session status. */
  status: AttendanceStatus;
  /** Per-period sessions for this school day (empty for weekend/holiday/future). */
  sessions: AttendanceSession[];
  /** Reason for an absence/tardy (optional). */
  reasonAr?: string;
  reasonEn?: string;
  /** True if absence is unexcused — drives a small red dot in the strip badge. */
  unexcused?: boolean;
  childId: string;
}

// Local seeded RNG so attendance is deterministic and independent of the
// assignment-status RNG above.
const attendanceRng = createRng(7777);

interface ReasonPair {
  ar: string;
  en: string;
}

const ABSENCE_REASONS: ReasonPair[] = [
  { ar: 'إجازة مرضية', en: 'Sick leave' },
  { ar: 'موعد طبي', en: 'Doctor appointment' },
  { ar: 'ظرف عائلي', en: 'Family matter' },
];

const TARDY_REASONS: ReasonPair[] = [
  { ar: 'ازدحام مروري', en: 'Traffic delay' },
  { ar: 'وصول متأخر', en: 'Late arrival' },
];

/** Subtract `days` from `from` and return a Date (clean local-time). */
function dateMinusDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Static class-period schedule for a typical Jordanian primary school day.
 * Periods are 45 min with a 5-min break, plus a 20-min recess between P3 & P4.
 * We pick 6 periods so the seeded sessions feel real:
 *   P1 07:30-08:15
 *   P2 08:20-09:05
 *   P3 09:10-09:55
 *   (recess 09:55-10:15)
 *   P4 10:15-11:00
 *   P5 11:05-11:50
 *   P6 11:55-12:40
 *
 * Subjects rotate by day-of-week so each school day has its own flavor. Sun
 * is "academic-heavy", Wed is the PE day, etc.
 */
const PERIOD_TIMES: ReadonlyArray<{ start: string; end: string }> = [
  { start: '07:30', end: '08:15' },
  { start: '08:20', end: '09:05' },
  { start: '09:10', end: '09:55' },
  { start: '10:15', end: '11:00' },
  { start: '11:05', end: '11:50' },
  { start: '11:55', end: '12:40' },
];

interface SubjectPair {
  ar: string;
  en: string;
}

const SUBJECT_LABELS = {
  math: { ar: 'الرياضيات', en: 'Math' },
  arabic: { ar: 'اللغة العربية', en: 'Arabic' },
  english: { ar: 'اللغة الإنجليزية', en: 'English' },
  science: { ar: 'العلوم', en: 'Science' },
  pe: { ar: 'التربية البدنية', en: 'PE' },
  art: { ar: 'الفن', en: 'Art' },
  religious: { ar: 'التربية الإسلامية', en: 'Religious Studies' },
} as const satisfies Record<string, SubjectPair>;

/**
 * Day-of-week → ordered list of subjects per period (6 entries each). Closed
 * static map — keeps subjects sensible (Math first thing in the morning,
 * PE just before dismissal on PE days, religious studies on Sun & Thu, etc.)
 */
const DAY_SCHEDULE: Record<number, ReadonlyArray<keyof typeof SUBJECT_LABELS>> = {
  0: ['math', 'arabic', 'science', 'english', 'religious', 'art'],
  1: ['math', 'english', 'arabic', 'science', 'art', 'pe'],
  2: ['arabic', 'math', 'science', 'english', 'art', 'religious'],
  3: ['math', 'science', 'english', 'arabic', 'pe', 'art'],
  4: ['arabic', 'english', 'math', 'religious', 'science', 'pe'],
};

const SESSION_NOTES: ReadonlyArray<SubjectPair> = [
  { ar: 'موعد طبي', en: "Doctor's appointment" },
  { ar: 'وصل متأخراً 10 دقائق', en: 'Arrived 10 min late' },
  { ar: 'بإذن من ولي الأمر', en: 'Excused by parent' },
  { ar: 'حضور كامل وممتاز', en: 'Excellent attendance' },
];

/**
 * Build the per-period sessions for one school day. We seed each period's
 * status independently from the day-level expected status:
 *   - day 'present' → all sessions present, with ~5% chance of one note.
 *   - day 'tardy'   → first 1-2 sessions late, rest present.
 *   - day 'absent'  → all sessions absent (or excused if the absence is
 *                     marked excused).
 */
function buildSessionsForDay(
  dayStatus: AttendanceStatus,
  dow: number,
  unexcused: boolean
): AttendanceSession[] {
  if (dayStatus !== 'present' && dayStatus !== 'absent' && dayStatus !== 'tardy') {
    return [];
  }
  const subjectsToday = DAY_SCHEDULE[dow] ?? DAY_SCHEDULE[0];
  const sessions: AttendanceSession[] = [];
  // Seeded number of late periods (1-2) when the day is tardy.
  const tardyCount = dayStatus === 'tardy' ? Math.floor(attendanceRng() * 2) + 1 : 0;

  for (let i = 0; i < PERIOD_TIMES.length; i++) {
    const subjectKey = subjectsToday[i % subjectsToday.length];
    const subjectLabel = SUBJECT_LABELS[subjectKey];
    const period = PERIOD_TIMES[i];

    let status: SessionStatus;
    if (dayStatus === 'absent') {
      status = unexcused ? 'absent' : 'excused';
    } else if (dayStatus === 'tardy') {
      status = i < tardyCount ? 'late' : 'present';
    } else {
      status = 'present';
    }

    // ~10% chance to attach a note on a non-present session, ~5% on present.
    let noteAr: string | undefined;
    let noteEn: string | undefined;
    const shouldNote =
      (status !== 'present' && attendanceRng() < 0.35) ||
      (status === 'present' && attendanceRng() < 0.04);
    if (shouldNote) {
      const noteIdx =
        status === 'absent' || status === 'excused'
          ? 0
          : status === 'late'
            ? 1
            : 3;
      const note = SESSION_NOTES[Math.min(noteIdx, SESSION_NOTES.length - 1)];
      noteAr = note.ar;
      noteEn = note.en;
    }

    sessions.push({
      id: `s-${i}`,
      subjectAr: subjectLabel.ar,
      subjectEn: subjectLabel.en,
      startTime: period.start,
      endTime: period.end,
      status,
      noteAr,
      noteEn,
    });
  }
  return sessions;
}

/**
 * Roll the per-session statuses up into a single day-level AttendanceStatus.
 * Worst-case wins: any absent → day absent; any late but no absent → tardy;
 * everything present → present.
 */
function deriveDayStatusFromSessions(
  sessions: AttendanceSession[]
): AttendanceStatus | null {
  if (sessions.length === 0) return null;
  let hasAbsent = false;
  let hasLate = false;
  for (const s of sessions) {
    if (s.status === 'absent') hasAbsent = true;
    else if (s.status === 'late') hasLate = true;
  }
  if (hasAbsent) return 'absent';
  if (hasLate) return 'tardy';
  return 'present';
}

/**
 * Build a 30-day window ending today for one child. Weekends (Fri = 5,
 * Sat = 6 in Jordan) are auto-marked. We seed ~80% present, 1-2 absences,
 * and 1 tardy across the school days. Each school day also gets 5-7 (here:
 * 6) per-period sessions whose statuses ladder up to the day-level status.
 */
function buildChildAttendance(childId: string, today: Date): AttendanceDay[] {
  const days: AttendanceDay[] = [];

  // Walk forward through the past 30 days (oldest -> newest)
  for (let i = 29; i >= 0; i--) {
    const d = dateMinusDays(today, i);
    const iso = toIsoDate(d);
    const dow = d.getDay();

    // Jordanian weekend
    if (dow === 5 || dow === 6) {
      days.push({ iso, status: 'weekend', sessions: [], childId });
      continue;
    }

    // School day — pick a status from a seeded distribution.
    const r = attendanceRng();
    if (r < 0.07) {
      // ~7% absent
      const reason = ABSENCE_REASONS[Math.floor(attendanceRng() * ABSENCE_REASONS.length)];
      const unexcused = attendanceRng() < 0.25; // ~25% of absences unexcused
      const sessions = buildSessionsForDay('absent', dow, unexcused);
      days.push({
        iso,
        status: 'absent',
        sessions,
        reasonAr: reason.ar,
        reasonEn: reason.en,
        unexcused,
        childId,
      });
    } else if (r < 0.12) {
      // ~5% tardy
      const reason = TARDY_REASONS[Math.floor(attendanceRng() * TARDY_REASONS.length)];
      const sessions = buildSessionsForDay('tardy', dow, false);
      days.push({
        iso,
        status: 'tardy',
        sessions,
        reasonAr: reason.ar,
        reasonEn: reason.en,
        childId,
      });
    } else {
      const sessions = buildSessionsForDay('present', dow, false);
      // Re-derive in case the noise added any "late" via SESSION_NOTES path.
      const derived = deriveDayStatusFromSessions(sessions) ?? 'present';
      days.push({ iso, status: derived, sessions, childId });
    }
  }

  return days;
}

/**
 * Build attendance for every mock child (3 children × 30 days = 90 entries).
 * Uses today's date at module-load time so the calendar always shows live
 * data anchored to "right now".
 */
function buildAllAttendance(): AttendanceDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const all: AttendanceDay[] = [];
  for (const cid of CHILD_IDS) {
    all.push(...buildChildAttendance(cid, today));
  }
  return all;
}

export const MOCK_ATTENDANCE: AttendanceDay[] = buildAllAttendance();

/** Lookup map: `${childId}|${iso}` -> AttendanceDay. */
const ATTENDANCE_BY_KEY: Record<string, AttendanceDay> = (() => {
  const m: Record<string, AttendanceDay> = {};
  for (const a of MOCK_ATTENDANCE) {
    m[`${a.childId}|${a.iso}`] = a;
  }
  return m;
})();

/** Get attendance for a specific child + ISO date. Returns null if not seeded. */
export function getAttendanceForDay(
  childId: string,
  iso: string
): AttendanceDay | null {
  return ATTENDANCE_BY_KEY[`${childId}|${iso}`] ?? null;
}

/**
 * Number of absences in the last `days` days (default 7) for the active
 * child. Drives the attendance strip badge.
 */
export function getRecentAbsenceCount(activeChildId: string, days = 7): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = dateMinusDays(today, days - 1);
  return MOCK_ATTENDANCE.filter(
    (a) =>
      a.childId === activeChildId &&
      a.status === 'absent' &&
      new Date(a.iso) >= cutoff &&
      new Date(a.iso) <= today
  ).length;
}

/** True if any absence in the last `days` days is unexcused. */
export function hasRecentUnexcusedAbsence(activeChildId: string, days = 7): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = dateMinusDays(today, days - 1);
  return MOCK_ATTENDANCE.some(
    (a) =>
      a.childId === activeChildId &&
      a.status === 'absent' &&
      a.unexcused === true &&
      new Date(a.iso) >= cutoff &&
      new Date(a.iso) <= today
  );
}

/**
 * Aggregate counts (present, absent, tardy) across the seeded 30-day window
 * for the given child. Used by the drawer's stat tiles.
 */
export function getAttendanceStats(
  activeChildId: string
): { present: number; absent: number; tardy: number } {
  let present = 0;
  let absent = 0;
  let tardy = 0;
  for (const a of MOCK_ATTENDANCE) {
    if (a.childId !== activeChildId) continue;
    if (a.status === 'present') present++;
    else if (a.status === 'absent') absent++;
    else if (a.status === 'tardy') tardy++;
  }
  return { present, absent, tardy };
}
