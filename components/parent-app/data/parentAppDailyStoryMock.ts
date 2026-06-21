// parentAppDailyStoryMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seed for the Home "ملاحظات اليوم" → Daily Story section.
//
// Replaces the old 8-topic insight strip with SIX self-contained themed cards
// that together tell the story of the child's whole day:
//   1. school     — في المدرسة
//   2. home       — التعلّم في البيت
//   3. wellbeing  — كيف كان شعوره اليوم   (marquee multi-ring card)
//   4. academic   — التقدّم الأكاديمي       (single big % ring)
//   5. attendance — المواظبة والحضور      (real attendance data)
//   6. proud      — لحظة الفخر              (one celebratory moment, no scores)
//
// Design rules baked in here (the renderer owns no copy / no numbers):
//   • Per-child + per-day, DETERMINISTIC from (childId + dateIso) so any past
//     day re-renders identically. Anchored to each child's "personality" so
//     Sara always reads strong, Omar steady, Lina uneven.
//   • Summaries are ASSEMBLED FROM TEMPLATES (name + one highlight + scores) —
//     never free-form — so the copy is always warm, specific, and safe.
//   • NO student input required: every score is framed as inferred from passive
//     behavioral signals. The card renders fully even if the kid never answers.
//   • "The day completes in the evening": scores are provisional until ~7pm,
//     then finalized. See getDayCompletion / isDayComplete.
//
// AR is source-of-truth (Jordan dialect). EN mirrors. Western digits inside
// rings to match the reference screenshots (91, 1350, 10,004…).

import { getAttendanceForDay, getAttendanceStats } from './parentAppSchoolMockData';

// ============================================================================
// Types
// ============================================================================

export type DailyCardKey =
  | 'school'
  | 'home'
  | 'wellbeing'
  | 'academic'
  | 'attendance'
  | 'proud';

/** Free now; flip to 'premium' later to gate via <PremiumGate>. */
export type CardTier = 'free' | 'premium';

/** How the card renders its scores. */
export type RingMode = 'mini' | 'single' | 'multi' | 'none';

/** One score = one ring / number. value is 0-100 unless unit overrides. */
export interface StoryScore {
  key: string;
  labelAr: string;
  labelEn: string;
  value: number;
  /** Ring + number color (hex, from the fitness-ring palette). */
  color: string;
  /** Display suffix; default '%'. Pass '' for none. */
  unit?: string;
}

/** Optional standout moment. If `byAr` is set it renders an avatar+date row. */
export interface StoryHighlight {
  textAr: string;
  textEn: string;
  byAr?: string;
  byEn?: string;
  avatarInitial?: string;
  avatarColor?: string; // hex
  dateLabelAr?: string;
  dateLabelEn?: string;
}

export interface DailyStoryCard {
  key: DailyCardKey;
  tier: CardTier;
  // palette (hex — applied via inline styles in the renderer)
  bg: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  // content
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  ringMode: RingMode;
  scores: StoryScore[];
  highlight?: StoryHighlight;
  ctaLabelAr: string;
  ctaLabelEn: string;
  /** Route to navigate on CTA; '' = no navigation (e.g. the celebrate button). */
  ctaRoute: string;
}

export interface DailyStory {
  childId: string;
  dateIso: string;
  cards: DailyStoryCard[];
}

// ============================================================================
// Palette
// ============================================================================

const CARD_PALETTE: Record<
  DailyCardKey,
  { bg: string; iconBg: string; iconColor: string; accent: string }
> = {
  school:    { bg: '#DCEFFA', iconBg: '#54B6E6', iconColor: '#FFFFFF', accent: '#2E8FCB' },
  home:      { bg: '#FCEFC7', iconBg: '#FFB23E', iconColor: '#FFFFFF', accent: '#E08A00' },
  wellbeing: { bg: '#FBDDE2', iconBg: '#FF6F7A', iconColor: '#FFFFFF', accent: '#E14F5E' },
  academic:   { bg: '#CFEBD6', iconBg: '#56CF92', iconColor: '#FFFFFF', accent: '#1F9D57' },
  attendance: { bg: '#E7E2FB', iconBg: '#8E7DE0', iconColor: '#FFFFFF', accent: '#6C5BC4' },
  proud:      { bg: '#E9F4D6', iconBg: '#FFC02E', iconColor: '#FFFFFF', accent: '#C28A00' },
};

// Fitness-ring colors.
const RING = {
  coral: '#FF5A6E',
  amber: '#FFB23E',
  teal: '#3DD9C0',
  blue: '#54B6E6',
  green: '#56CF92',
  purple: '#8E7DE0',
};

// ============================================================================
// Deterministic seeding — stable per (childId, dateIso, salt)
// ============================================================================

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable pseudo-random in [0,1) for a given key. */
function rand01(seed: string): number {
  return (hashStr(seed) % 100000) / 100000;
}

/** Stable integer in [min,max] for a given key. */
function randInt(seed: string, min: number, max: number): number {
  return min + Math.floor(rand01(seed) * (max - min + 1));
}

/** Score anchored around `base`, jittered ±span, clamped to [40,99]. */
function scoreNear(seed: string, base: number, span = 8): number {
  const j = Math.round((rand01(seed) - 0.5) * 2 * span);
  return Math.max(40, Math.min(99, base + j));
}

/** Pick one item from a list deterministically. */
function pick<T>(seed: string, list: T[]): T {
  return list[hashStr(seed) % list.length];
}

// ============================================================================
// Per-child personality anchors
// ============================================================================

interface ChildAnchor {
  nameAr: string;
  nameEn: string;
  female: boolean;
  /** Base level per card (0-100). Drives all scores so children feel distinct. */
  base: Record<DailyCardKey, number>;
}

const ANCHORS: Record<string, ChildAnchor> = {
  'child-sara': {
    nameAr: 'سارة',
    nameEn: 'Sara',
    female: true,
    base: { school: 88, home: 84, wellbeing: 86, academic: 82, attendance: 96, proud: 90 },
  },
  'child-omar': {
    nameAr: 'عمر',
    nameEn: 'Omar',
    female: false,
    base: { school: 74, home: 70, wellbeing: 78, academic: 72, attendance: 90, proud: 76 },
  },
  'child-lina': {
    nameAr: 'لينا',
    nameEn: 'Lina',
    female: true,
    base: { school: 76, home: 66, wellbeing: 72, academic: 80, attendance: 86, proud: 78 },
  },
};

function anchorFor(childId: string): ChildAnchor {
  return (
    ANCHORS[childId] ?? {
      nameAr: 'طفلك',
      nameEn: 'your child',
      female: true,
      base: { school: 78, home: 74, wellbeing: 80, academic: 76, attendance: 92, proud: 80 },
    }
  );
}

// ============================================================================
// Verb-gender helper (Arabic)
// ============================================================================

function g(female: boolean, fem: string, masc: string): string {
  return female ? fem : masc;
}

// ============================================================================
// Summary + highlight template banks (assembled, never free-form)
// ============================================================================

// Each builder returns { summaryAr, summaryEn, highlight }.

function buildSchool(a: ChildAnchor, seed: string, scores: StoryScore[]) {
  const [part, , mood] = scores;
  const summaryAr = pick(seed + 'sa', [
    `حضر${g(a.female, 'ت', '')} ${a.nameAr} كل الحصص اليوم و${g(a.female, 'شاركت', 'شارك')} بفاعلية. بدا يومها هادئاً ومتوازناً داخل الصف.`,
    `يوم مدرسي جميل لـ${a.nameAr} — ${g(a.female, 'كانت', 'كان')} ${g(a.female, 'حاضرة', 'حاضراً')} ${g(a.female, 'ومنتبهة', 'ومنتبهاً')}، و${g(a.female, 'تفاعلت', 'تفاعل')} مع المعلمين بإيجابية.`,
  ]);
  const summaryEn = pick(seed + 'se', [
    `${a.nameEn} attended every class today and took part actively. A calm, balanced day in the classroom.`,
    `A lovely school day for ${a.nameEn} — present, attentive, and engaged with the teachers.`,
  ]);
  const highlight: StoryHighlight = {
    textAr: `لاحظت المعلمة مشاركة ${a.nameAr} المميزة في حصة العلوم اليوم — ${g(a.female, 'أجابت', 'أجاب')} عن سؤال صعب وساعد${g(a.female, 'ت', '')} زملاءها.`,
    textEn: `${a.nameEn}'s teacher noted a standout moment in science today — answered a hard question and helped classmates.`,
    byAr: 'الأستاذة هدى',
    byEn: 'Ms. Huda',
    avatarInitial: 'هـ',
    avatarColor: '#54B6E6',
  };
  return { summaryAr, summaryEn, highlight, _unused: { part, mood } };
}

function buildHome(a: ChildAnchor, seed: string, lessons: number, mins: number, streak: number) {
  const summaryAr = pick(seed + 'ha', [
    `${g(a.female, 'أكملت', 'أكمل')} ${a.nameAr} ${lessons} مهام في البيت خلال ${mins} دقيقة، و${g(a.female, 'حافظت', 'حافظ')} على سلسلة ${streak} أيام متواصلة.`,
    `${mins} دقيقة من المذاكرة المركّزة اليوم و${lessons} مهام مكتملة — ${g(a.female, 'مثابرة', 'مثابر')} رغم انشغال اليوم.`,
  ]);
  const summaryEn = pick(seed + 'he', [
    `${a.nameEn} finished ${lessons} tasks at home in ${mins} minutes and kept a ${streak}-day streak going.`,
    `${mins} minutes of focused study and ${lessons} tasks done today — persistent even on a busy day.`,
  ]);
  const highlight: StoryHighlight = {
    textAr: `سلسلة ${streak} أيام لم تنقطع — ${g(a.female, 'بدأت', 'بدأ')} المذاكرة دون تذكير اليوم.`,
    textEn: `${streak}-day streak unbroken — started studying without a reminder today.`,
  };
  return { summaryAr, summaryEn, highlight };
}

function buildWellbeing(a: ChildAnchor, seed: string) {
  const summaryAr = pick(seed + 'wa', [
    `بدا ${a.nameAr} ${g(a.female, 'سعيدة', 'سعيداً')} و${g(a.female, 'نشيطة', 'نشيطاً')} اليوم، و${g(a.female, 'تفاعلت', 'تفاعل')} بدفء مع أصدقائه. مزاج عام مطمئن.`,
    `يوم مريح نفسياً لـ${a.nameAr} — طاقة جيدة، تواصل اجتماعي دافئ، وهدوء واضح في المساء.`,
  ]);
  const summaryEn = pick(seed + 'we', [
    `${a.nameEn} seemed happy and energetic today, warm with friends. An overall reassuring mood.`,
    `An emotionally easy day for ${a.nameEn} — good energy, warm social connection, calm by evening.`,
  ]);
  const highlight: StoryHighlight = {
    textAr: `هذه القراءة مبنية على إشارات سلوكية (التفاعل، النشاط، المشاركة) — دون الحاجة لأي إجابة من الطالب.`,
    textEn: `This reading is inferred from behavioral signals (engagement, activity, participation) — no input needed from your child.`,
  };
  return { summaryAr, summaryEn, highlight };
}

function buildAcademic(a: ChildAnchor, seed: string, progress: number, concept: { ar: string; en: string }) {
  const summaryAr = pick(seed + 'aa', [
    `${g(a.female, 'تقدّمت', 'تقدّم')} ${a.nameAr} في ${concept.ar} اليوم وارتفع مستوى إتقانها للمفهوم. أداء ثابت ودقيق.`,
    `خطوة جديدة في ${concept.ar} — ${g(a.female, 'أتقنت', 'أتقن')} ${a.nameAr} جزءاً كان ${g(a.female, 'تجده', 'يجده')} صعباً قبل أيام.`,
  ]);
  const summaryEn = pick(seed + 'ae', [
    `${a.nameEn} progressed in ${concept.en} today, lifting mastery of the concept. Steady, accurate work.`,
    `A new step in ${concept.en} — ${a.nameEn} mastered a part that felt hard a few days ago.`,
  ]);
  const highlight: StoryHighlight = {
    textAr: `ارتفع إتقان ${concept.ar} بمقدار +${randInt(seed + 'ah', 6, 14)}% هذا الأسبوع.`,
    textEn: `${concept.en} mastery up +${randInt(seed + 'ah', 6, 14)}% this week.`,
  };
  return { summaryAr, summaryEn, highlight };
}

// Attendance & punctuality — wired to REAL attendance data the system tracks.
// Falls back to a deterministic typical school day when a date has no seeded
// attendance (weekend / holiday / outside the 30-day window).
function buildAttendance(a: ChildAnchor, childId: string, dateIso: string, seed: string) {
  const stats = getAttendanceStats(childId);
  const statTotal = stats.present + stats.absent + stats.tardy;
  const consistency =
    statTotal > 0 ? Math.round((stats.present / statTotal) * 100) : scoreNear(seed + 'att-c', a.base.attendance);

  const day = getAttendanceForDay(childId, dateIso);
  let total: number;
  let present = 0;
  let late = 0;
  let absent = 0;
  if (day && day.sessions.length > 0) {
    total = day.sessions.length;
    for (const sess of day.sessions) {
      if (sess.status === 'present') present++;
      else if (sess.status === 'late') late++;
      else absent++; // absent | excused
    }
  } else {
    // Fallback: synthesize a typical school day deterministically.
    total = 6;
    late = rand01(seed + 'att-late') < 0.22 ? 1 : 0;
    present = total - late;
  }

  const attended = present + late;
  const attendanceScore = total > 0 ? Math.round((attended / total) * 100) : 100;
  const punctualityScore = total > 0 ? Math.round((present / total) * 100) : 100;

  const scores: StoryScore[] = [
    { key: 'attendance', labelAr: 'الحضور', labelEn: 'Attendance', value: attendanceScore, color: RING.blue },
    { key: 'punctuality', labelAr: 'الالتزام بالوقت', labelEn: 'Punctuality', value: punctualityScore, color: RING.teal },
    { key: 'consistency', labelAr: 'المواظبة', labelEn: 'Consistency', value: consistency, color: RING.purple },
  ];

  let summaryAr: string;
  let summaryEn: string;
  if (absent > 0) {
    summaryAr = `${g(a.female, 'حضرت', 'حضر')} ${a.nameAr} ${attended} من ${total} حصص اليوم، مع ${absent} غياب مُسجّل. المواظبة العامة ${consistency}% هذا الشهر.`;
    summaryEn = `${a.nameEn} attended ${attended} of ${total} classes today, with ${absent} recorded absence. Overall attendance ${consistency}% this month.`;
  } else if (late > 0) {
    summaryAr = `${g(a.female, 'حضرت', 'حضر')} ${a.nameAr} كل الحصص الـ${total} اليوم مع تأخّر بسيط عن ${late}. مواظبة ممتازة ${consistency}%.`;
    summaryEn = `${a.nameEn} attended all ${total} classes today with a slight delay to ${late}. Excellent ${consistency}% attendance.`;
  } else {
    summaryAr = `حضور كامل اليوم — ${g(a.female, 'حضرت', 'حضر')} ${a.nameAr} الحصص الـ${total} في وقتها. مواظبة ثابتة ${consistency}% هذا الشهر.`;
    summaryEn = `Perfect day — ${a.nameEn} attended all ${total} classes on time. Steady ${consistency}% attendance this month.`;
  }

  let highlight: StoryHighlight;
  if (absent > 0 && day) {
    highlight = {
      textAr: `${day.reasonAr ? `السبب: ${day.reasonAr}` : 'غياب مُسجّل'}${day.unexcused ? ' (بدون إذن)' : ''}.`,
      textEn: `${day.reasonEn ? `Reason: ${day.reasonEn}` : 'Recorded absence'}${day.unexcused ? ' (unexcused)' : ''}.`,
    };
  } else if (late > 0) {
    highlight = {
      textAr: 'تأخّر بسيط هذا الصباح فقط — لا شيء يدعو للقلق.',
      textEn: 'Just a small delay this morning — nothing to worry about.',
    };
  } else {
    const streak = randInt(seed + 'att-streak', 9, 22);
    highlight = {
      textAr: `${g(a.female, 'مواظِبة', 'مواظِب')} منذ ${streak} يوماً دون تأخّر أو غياب.`,
      textEn: `On a ${streak}-day run with no lateness or absence.`,
    };
  }

  return { scores, summaryAr, summaryEn, highlight };
}

function buildProud(a: ChildAnchor, seed: string) {
  const moment = pick(seed + 'pm', [
    {
      ar: `${g(a.female, 'ساعدت', 'ساعد')} ${a.nameAr} ${g(a.female, 'زميلة', 'زميلاً')} ${g(a.female, 'متعثرة', 'متعثراً')} في الرياضيات اليوم دون أن ${g(a.female, 'يُطلب', 'يُطلب')} منها ذلك.`,
      en: `${a.nameEn} helped a struggling classmate with math today — no one asked.`,
    },
    {
      ar: `${g(a.female, 'رفعت', 'رفع')} ${a.nameAr} يدها للإجابة عن سؤال صعب أمام الصف كله — لحظة ثقة جميلة.`,
      en: `${a.nameEn} raised a hand to answer a hard question in front of the whole class — a lovely moment of confidence.`,
    },
    {
      ar: `${g(a.female, 'أنهت', 'أنهى')} ${a.nameAr} تحدّياً ${g(a.female, 'كانت', 'كان')} ${g(a.female, 'تجده', 'يجده')} ${g(a.female, 'صعباً', 'صعباً')} الأسبوع الماضي — ومضت بابتسامة.`,
      en: `${a.nameEn} finished a challenge that felt too hard last week — and walked away smiling.`,
    },
  ]);
  return {
    summaryAr: moment.ar,
    summaryEn: moment.en,
    highlight: undefined as StoryHighlight | undefined,
  };
}

// ============================================================================
// Concept bank (academic) — light, realistic per child
// ============================================================================

const CONCEPTS: Record<string, { ar: string; en: string }[]> = {
  'child-sara': [
    { ar: 'جمع الكسور', en: 'adding fractions' },
    { ar: 'الضرب الطويل', en: 'long multiplication' },
  ],
  'child-omar': [
    { ar: 'القراءة الجهرية', en: 'reading aloud' },
    { ar: 'دورة الماء', en: 'the water cycle' },
  ],
  'child-lina': [
    { ar: 'الإملاء', en: 'spelling' },
    { ar: 'الألغاز المنطقية', en: 'logic puzzles' },
  ],
};

function conceptFor(childId: string, seed: string) {
  const list = CONCEPTS[childId] ?? [{ ar: 'مهارة اليوم', en: "today's skill" }];
  return pick(seed + 'cf', list);
}

// ============================================================================
// Card builders
// ============================================================================

function buildCards(childId: string, dateIso: string): DailyStoryCard[] {
  const a = anchorFor(childId);
  const s = (salt: string) => `${childId}|${dateIso}|${salt}`;

  // ── School ──────────────────────────────────────────────────────────────
  const schoolScores: StoryScore[] = [
    { key: 'participation', labelAr: 'المشاركة', labelEn: 'Participation', value: scoreNear(s('sch-p'), a.base.school), color: RING.blue },
    { key: 'focusClass', labelAr: 'التركيز في الصف', labelEn: 'Focus in class', value: scoreNear(s('sch-f'), a.base.school - 4), color: RING.teal },
    { key: 'moodSchool', labelAr: 'المزاج', labelEn: 'Mood', value: scoreNear(s('sch-m'), a.base.wellbeing), color: RING.coral },
  ];
  const school = buildSchool(a, s('sch'), schoolScores);

  // ── Home learning ─────────────────────────────────────────────────────────
  const lessons = randInt(s('home-l'), 2, 5);
  const mins = randInt(s('home-t'), 15, 45);
  const streak = randInt(s('home-s'), 4, 16);
  const homeScores: StoryScore[] = [
    { key: 'effort', labelAr: 'الاجتهاد', labelEn: 'Effort', value: scoreNear(s('home-e'), a.base.home + 4), color: RING.amber },
    { key: 'focus', labelAr: 'التركيز', labelEn: 'Focus', value: scoreNear(s('home-f'), a.base.home), color: RING.purple },
    { key: 'consistency', labelAr: 'الانتظام', labelEn: 'Consistency', value: scoreNear(s('home-c'), a.base.home - 2), color: RING.green },
  ];
  const home = buildHome(a, s('home'), lessons, mins, streak);

  // ── Well-being (marquee multi-ring) ────────────────────────────────────────
  const wellScores: StoryScore[] = [
    { key: 'mood', labelAr: 'المزاج', labelEn: 'Mood', value: scoreNear(s('well-m'), a.base.wellbeing), color: RING.coral },
    { key: 'energy', labelAr: 'الطاقة', labelEn: 'Energy', value: scoreNear(s('well-e'), a.base.wellbeing + 3), color: RING.amber },
    { key: 'calm', labelAr: 'الهدوء', labelEn: 'Calm', value: scoreNear(s('well-c'), a.base.wellbeing - 2), color: RING.teal },
  ];
  const well = buildWellbeing(a, s('well'));

  // ── Academic (single big ring) ──────────────────────────────────────────────
  const concept = conceptFor(childId, s('acad'));
  const progress = scoreNear(s('acad-p'), a.base.academic);
  const academicScores: StoryScore[] = [
    { key: 'progress', labelAr: 'التقدّم اليوم', labelEn: 'Progress today', value: progress, color: RING.green },
    { key: 'mastery', labelAr: 'الإتقان', labelEn: 'Mastery', value: scoreNear(s('acad-m'), a.base.academic - 6), color: RING.blue },
    { key: 'accuracy', labelAr: 'الدقّة', labelEn: 'Accuracy', value: scoreNear(s('acad-a'), a.base.academic + 4), color: RING.purple },
  ];
  const academic = buildAcademic(a, s('acad'), progress, concept);

  // ── Attendance & punctuality (real attendance data) ──────────────────────────
  const attendance = buildAttendance(a, childId, dateIso, s('att'));

  // ── Proud moment (no scores) ──────────────────────────────────────────────────
  const proud = buildProud(a, s('proud'));

  const dateLabel = formatDayLabel(dateIso);

  return [
    {
      key: 'school',
      tier: 'free',
      ...CARD_PALETTE.school,
      titleAr: 'في المدرسة',
      titleEn: 'At school',
      summaryAr: school.summaryAr,
      summaryEn: school.summaryEn,
      ringMode: 'mini',
      scores: schoolScores,
      highlight: {
        ...school.highlight,
        dateLabelAr: dateLabel.ar,
        dateLabelEn: dateLabel.en,
      },
      ctaLabelAr: 'راسل المعلّم',
      ctaLabelEn: 'Message the teacher',
      ctaRoute: '/parent/messages',
    },
    {
      key: 'home',
      tier: 'free',
      ...CARD_PALETTE.home,
      titleAr: 'التعلّم في البيت',
      titleEn: 'Learning at home',
      summaryAr: home.summaryAr,
      summaryEn: home.summaryEn,
      ringMode: 'mini',
      scores: homeScores,
      highlight: home.highlight,
      ctaLabelAr: 'ساعدها على المذاكرة',
      ctaLabelEn: 'Help them study',
      ctaRoute: '/parent/skill-map',
    },
    {
      key: 'wellbeing',
      tier: 'free',
      ...CARD_PALETTE.wellbeing,
      titleAr: 'كيف كان شعوره اليوم',
      titleEn: 'How they felt today',
      summaryAr: well.summaryAr,
      summaryEn: well.summaryEn,
      ringMode: 'multi',
      scores: wellScores,
      highlight: well.highlight,
      ctaLabelAr: 'اقرأ عن شخصية طفلك',
      ctaLabelEn: 'Read about your child',
      ctaRoute: '/parent/skill-map',
    },
    {
      key: 'academic',
      tier: 'free',
      ...CARD_PALETTE.academic,
      titleAr: 'التقدّم الأكاديمي',
      titleEn: 'Academic progress',
      summaryAr: academic.summaryAr,
      summaryEn: academic.summaryEn,
      ringMode: 'single',
      scores: academicScores,
      highlight: academic.highlight,
      ctaLabelAr: 'شاهد خريطة المهارات كاملة',
      ctaLabelEn: 'See the full skill map',
      ctaRoute: '/parent/skill-map',
    },
    {
      key: 'attendance',
      tier: 'free',
      ...CARD_PALETTE.attendance,
      titleAr: 'المواظبة والحضور',
      titleEn: 'Attendance & punctuality',
      summaryAr: attendance.summaryAr,
      summaryEn: attendance.summaryEn,
      ringMode: 'mini',
      scores: attendance.scores,
      highlight: attendance.highlight,
      ctaLabelAr: 'تواصل مع المدرسة',
      ctaLabelEn: 'Contact the school',
      ctaRoute: '/parent/messages',
    },
    {
      key: 'proud',
      tier: 'free',
      ...CARD_PALETTE.proud,
      titleAr: 'لحظة الفخر',
      titleEn: 'Proud moment',
      summaryAr: proud.summaryAr,
      summaryEn: proud.summaryEn,
      ringMode: 'none',
      scores: [],
      highlight: proud.highlight,
      ctaLabelAr: 'احتفِ مع طفلك',
      ctaLabelEn: 'Celebrate together',
      ctaRoute: '',
    },
  ];
}

// ============================================================================
// Public API
// ============================================================================

/** ISO (YYYY-MM-DD) for `offset` days from today (0 = today, -1 = yesterday). */
export function isoForOffset(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return isoForOffset(0);
}

export interface DayChip {
  iso: string;
  /** Single Arabic weekday letter. */
  letterAr: string;
  letterEn: string;
  /** Day-of-month number. */
  dayNum: number;
  isToday: boolean;
}

const AR_DAY_LETTERS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']; // Sun..Sat
const EN_DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The last `count` days (oldest → newest, newest = today) for the day strip. */
export function getRecentDays(count = 7): DayChip[] {
  const out: DayChip[] = [];
  const today = todayIso();
  for (let i = count - 1; i >= 0; i--) {
    const iso = isoForOffset(-i);
    const d = new Date(iso);
    const dow = d.getDay();
    out.push({
      iso,
      letterAr: AR_DAY_LETTERS[dow],
      letterEn: EN_DAY_LETTERS[dow],
      dayNum: d.getDate(),
      isToday: iso === today,
    });
  }
  return out;
}

/** Short label like "17 يونيو" / "Jun 17" for a highlight date pill. */
export function formatDayLabel(iso: string): { ar: string; en: string } {
  const d = new Date(iso);
  const ar = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(d);
  const en = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(d);
  return { ar, en };
}

/**
 * Day completion 0-100. Drives the "completes this evening" mechanic.
 *   • future date → 0
 *   • past date   → 100
 *   • today       → ramps from school start (~7am) to evening (~7pm)
 */
export function getDayCompletion(dateIso: string): number {
  const today = todayIso();
  if (dateIso > today) return 0;
  if (dateIso < today) return 100;
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  const START = 7;
  const END = 19;
  if (hours >= END) return 100;
  if (hours <= START) return 8; // never fully empty in the morning
  return Math.round(((hours - START) / (END - START)) * 100);
}

export function isDayComplete(dateIso: string): boolean {
  return getDayCompletion(dateIso) >= 100;
}

/** Compose the full daily story for a child on a given day. */
export function getDailyStory(childId: string, dateIso: string): DailyStory {
  return {
    childId,
    dateIso,
    cards: buildCards(childId, dateIso),
  };
}
