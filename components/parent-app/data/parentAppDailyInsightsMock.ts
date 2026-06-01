// parentAppDailyInsightsMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seed for the Home "Daily Insights" section — a collection of cool AI-styled
// cards that surface behavioral / learning patterns about the active child.
//
// Two surfaces:
//   • Weekly card — a single hero card per week with a multi-paragraph
//     summary of the child's week. Distinct gradient + larger typography.
//   • Topic cards — one per "insight topic" (focus, mood, sleep, social,
//     activity, reading, curiosity, screen time). Each carries a 1-2 sentence
//     headline + a quick trend (up / steady / down).
//
// AR is source-of-truth dialect (Levantine / Jordan). EN mirrors. No real
// data — all hand-crafted but realistic enough for demos.
//
// Tailwind v4 JIT: this file holds NO class strings. The per-topic palette
// lives in the renderer (DailyInsightCard) which maps a topic key onto a
// literal class set so the JIT picks every gradient + tone at build time.

// ============================================================================
// Types
// ============================================================================

/**
 * The 8 daily-insight topics. Stable closed enum so the renderer's style
 * map stays exhaustive.
 *
 * Why these eight: they cover the holistic "how is my kid doing?" question
 * a parent asks daily without overlapping the existing report-card subjects.
 * Each maps to a distinct vibe/color so the section feels varied.
 */
export type InsightTopic =
  | 'momentum'   // academic momentum / streak
  | 'focus'      // attention + concentration today
  | 'mood'       // emotional tone observed
  | 'sleep'      // sleep / energy baseline
  | 'social'     // peer / classroom social signals
  | 'activity'   // physical activity / play
  | 'reading'    // reading habit
  | 'curiosity'; // questions asked / topics explored

/** Direction of recent change for the topic. Drives a tiny chip on the card. */
export type InsightTrend = 'up' | 'steady' | 'down';

/** One topic card. Headlines stay short (≤4 words). Insights ≤2 sentences. */
export interface DailyInsight {
  topic: InsightTopic;
  /** Short headline — appears under the topic name as the card's main beat. */
  headlineAr: string;
  headlineEn: string;
  /** Body insight — 1-2 sentences explaining the headline + a soft suggestion. */
  bodyAr: string;
  bodyEn: string;
  trend: InsightTrend;
  /** Tiny "based on…" line — the data source the AI used. */
  sourceAr: string;
  sourceEn: string;
  childId: string;
}

/** Weekly hero card — one per (childId, week). */
export interface WeeklyInsight {
  childId: string;
  /** Headline line — short, declarative. */
  headlineAr: string;
  headlineEn: string;
  /** Paragraph 1 — narrative summary of the week. */
  paragraphAr: string;
  paragraphEn: string;
  /** 3 short bullet "highlights" — momentum, struggle, suggestion. */
  highlightsAr: string[];
  highlightsEn: string[];
}

// ============================================================================
// Per-topic seed builder — handcrafted insights per child.
// ============================================================================

const SARA_INSIGHTS: DailyInsight[] = [
  {
    childId: 'child-sara',
    topic: 'momentum',
    headlineAr: 'سلسلة تعلّم قوية',
    headlineEn: 'Strong learning streak',
    bodyAr:
      'سارة أكملت 5 أيام متواصلة من النشاط على التطبيق — تجاوزت متوسط أسبوعها بنسبة 18%.',
    bodyEn:
      'Sara has kept a 5-day learning streak — 18% above her weekly average.',
    trend: 'up',
    sourceAr: 'بناءً على نشاط آخر 7 أيام',
    sourceEn: 'Based on the last 7 days of activity',
  },
  {
    childId: 'child-sara',
    topic: 'focus',
    headlineAr: 'تركيزها أعلى صباحاً',
    headlineEn: 'Best focus in the morning',
    bodyAr:
      'متوسط مدة جلستها صباحاً 18 دقيقة، مقابل 7 دقائق مساءً — جدول الدراسة المسائي يستحق المراجعة.',
    bodyEn:
      'She averages 18-minute morning sessions vs 7 minutes in the evening — worth shifting study time earlier.',
    trend: 'steady',
    sourceAr: 'تحليل جلسات الدراسة',
    sourceEn: 'Study-session analytics',
  },
  {
    childId: 'child-sara',
    topic: 'mood',
    headlineAr: 'مزاج إيجابي اليوم',
    headlineEn: 'Positive mood today',
    bodyAr:
      'المعلمة لاحظت طاقة عالية ومشاركة فعّالة هذا الصباح. تستجيب جيداً للمدح الفوري.',
    bodyEn:
      'Her teacher noted high energy and active participation this morning. She responds well to immediate praise.',
    trend: 'up',
    sourceAr: 'ملاحظات أ. هدى',
    sourceEn: "From Ms. Huda's notes",
  },
  {
    childId: 'child-sara',
    topic: 'sleep',
    headlineAr: 'النوم متأخر قليلاً',
    headlineEn: 'Sleep is running late',
    bodyAr:
      'متوسط ساعة النوم هذا الأسبوع 10:45 مساءً — أبكر بـ 45 دقيقة كان سيرفع تركيزها الصباحي.',
    bodyEn:
      'Average bedtime this week is 10:45 PM — 45 min earlier would boost her morning focus.',
    trend: 'down',
    sourceAr: 'بيانات النوم من الجهاز',
    sourceEn: 'Sleep data from the device',
  },
  {
    childId: 'child-sara',
    topic: 'social',
    headlineAr: 'تتعاون أكثر في الصف',
    headlineEn: 'More collaborative this week',
    bodyAr:
      'انضمّت لمشروع جماعي ولعبت دور القائدة الصغيرة — علامة جيدة على ثقتها بنفسها.',
    bodyEn:
      'Joined a group project and took the lead — a good sign of growing confidence.',
    trend: 'up',
    sourceAr: 'تقرير المرشد الأكاديمي',
    sourceEn: 'From her academic mentor',
  },
  {
    childId: 'child-sara',
    topic: 'activity',
    headlineAr: 'نشاطها البدني ممتاز',
    headlineEn: 'Active body, active brain',
    bodyAr:
      'تتجاوز 45 دقيقة لعب بدني يومياً — مرتبط مباشرة بأدائها الجيد في الرياضيات.',
    bodyEn:
      'Over 45 minutes of active play daily — directly linked to her strong math results.',
    trend: 'up',
    sourceAr: 'بيانات النشاط',
    sourceEn: 'Activity data',
  },
  {
    childId: 'child-sara',
    topic: 'reading',
    headlineAr: 'قراءة يومية متواصلة',
    headlineEn: 'Daily reading is sticking',
    bodyAr:
      'قرأت 6 أيام من أصل 7 هذا الأسبوع — مزاج المفردات تحسّن بشكل ملحوظ.',
    bodyEn:
      'Read 6 of 7 days this week — vocabulary growth is noticeable.',
    trend: 'up',
    sourceAr: 'دفتر القراءة اليومي',
    sourceEn: 'Daily reading journal',
  },
  {
    childId: 'child-sara',
    topic: 'curiosity',
    headlineAr: 'فضولها في صعود',
    headlineEn: 'Curiosity on the rise',
    bodyAr:
      'سألت 14 سؤالاً مفتوحاً هذا الأسبوع عن الفلك والحيوانات — اقترحوا كتاب علوم خفيف.',
    bodyEn:
      'Asked 14 open-ended questions this week about space and animals — try a light science book.',
    trend: 'up',
    sourceAr: 'تحليل المحادثات',
    sourceEn: 'Conversation analysis',
  },
];

const OMAR_INSIGHTS: DailyInsight[] = [
  {
    childId: 'child-omar',
    topic: 'momentum',
    headlineAr: 'إيقاع تعلّم ثابت',
    headlineEn: 'Steady learning pace',
    bodyAr: 'عمر يحافظ على نشاط منتظم بدون فجوات — نمط جيد للأطفال في عمره.',
    bodyEn: "Omar keeps a steady, gap-free pace — a great pattern at his age.",
    trend: 'steady',
    sourceAr: 'بناءً على نشاط آخر 7 أيام',
    sourceEn: 'Based on the last 7 days of activity',
  },
  {
    childId: 'child-omar',
    topic: 'focus',
    headlineAr: 'مدى انتباهه يتحسّن',
    headlineEn: 'Attention span growing',
    bodyAr:
      'استمرّ في جلسة دراسة لمدة 22 دقيقة دون توقف — أعلى رقم له حتى الآن.',
    bodyEn:
      'Held a 22-minute study session without breaks — a personal best.',
    trend: 'up',
    sourceAr: 'تحليل جلسات الدراسة',
    sourceEn: 'Study-session analytics',
  },
  {
    childId: 'child-omar',
    topic: 'mood',
    headlineAr: 'يومه هادئ',
    headlineEn: 'Calm day overall',
    bodyAr:
      'لا توجد ملاحظات سلوكية، تفاعله متوازن. استمرّوا في الروتين الحالي.',
    bodyEn:
      'No behavioral flags, balanced engagement. Keep the current routine.',
    trend: 'steady',
    sourceAr: 'ملاحظات المعلمين',
    sourceEn: 'Teacher notes',
  },
  {
    childId: 'child-omar',
    topic: 'social',
    headlineAr: 'صديق جديد',
    headlineEn: 'New friend in class',
    bodyAr:
      'بدأ يلعب مع طالب جديد خلال الفسحة — علامة على انفتاح اجتماعي صحّي.',
    bodyEn:
      'Started playing with a new student at break — a healthy sign of openness.',
    trend: 'up',
    sourceAr: 'مراقبة المرشد',
    sourceEn: 'Mentor observation',
  },
  {
    childId: 'child-omar',
    topic: 'sleep',
    headlineAr: 'نوم منتظم',
    headlineEn: 'Sleep on track',
    bodyAr: 'متوسط 9.5 ساعة من النوم ليلياً — ضمن المعدل المثالي لعمره.',
    bodyEn:
      'Averaging 9.5 hours of sleep — within the ideal range for his age.',
    trend: 'steady',
    sourceAr: 'بيانات النوم',
    sourceEn: 'Sleep data',
  },
  {
    childId: 'child-omar',
    topic: 'reading',
    headlineAr: 'يحب القصص المصوّرة',
    headlineEn: 'Loves illustrated stories',
    bodyAr:
      'القصص المصوّرة تأخذ معظم وقت قراءته — وقت لتجربة قصة طويلة بدون صور.',
    bodyEn:
      "Picture books dominate his reading time — try a short chapter book next.",
    trend: 'steady',
    sourceAr: 'دفتر القراءة',
    sourceEn: 'Reading journal',
  },
];

const LINA_INSIGHTS: DailyInsight[] = [
  {
    childId: 'child-lina',
    topic: 'momentum',
    headlineAr: 'نشاط متذبذب',
    headlineEn: 'Uneven momentum',
    bodyAr:
      'نشاط لينا غير منتظم هذا الأسبوع — 3 أيام نشطة و 4 خاملة. روتين بسيط سيساعد.',
    bodyEn:
      "Lina's activity is uneven — 3 active and 4 quiet days. A simple routine would help.",
    trend: 'down',
    sourceAr: 'بناءً على نشاط آخر 7 أيام',
    sourceEn: 'Based on the last 7 days of activity',
  },
  {
    childId: 'child-lina',
    topic: 'curiosity',
    headlineAr: 'تحبّ الألغاز',
    headlineEn: 'Drawn to puzzles',
    bodyAr:
      'تقضي وقتاً أطول مع ألعاب الألغاز مقارنة بالأنشطة الأخرى. جرّبوا ألغازاً منطقية أصعب.',
    bodyEn:
      'Spends more time on puzzles than other activities. Try harder logic puzzles.',
    trend: 'up',
    sourceAr: 'تحليل اللعب',
    sourceEn: 'Play analytics',
  },
  {
    childId: 'child-lina',
    topic: 'mood',
    headlineAr: 'مزاج متذبذب',
    headlineEn: 'Mixed mood today',
    bodyAr:
      'المعلمة لاحظت أنها أكثر هدوءاً صباحاً، أكثر تفاعلاً مساءً. عكس الجدول العادي.',
    bodyEn:
      "Her teacher saw her quieter in the morning, more engaged later. Opposite of the usual pattern.",
    trend: 'steady',
    sourceAr: 'ملاحظات المعلمة',
    sourceEn: "Teacher's notes",
  },
];

export const MOCK_DAILY_INSIGHTS: DailyInsight[] = [
  ...SARA_INSIGHTS,
  ...OMAR_INSIGHTS,
  ...LINA_INSIGHTS,
];

/**
 * Stable topic order — the renderer iterates this map so the cards always
 * appear in the same sequence per child (less jarring than seed order).
 */
const TOPIC_ORDER: InsightTopic[] = [
  'momentum',
  'focus',
  'mood',
  'sleep',
  'social',
  'activity',
  'reading',
  'curiosity',
];

/** All daily insights for the active child, in stable topic order. */
export function getDailyInsightsForChild(childId: string): DailyInsight[] {
  const own = MOCK_DAILY_INSIGHTS.filter((i) => i.childId === childId);
  return TOPIC_ORDER
    .map((t) => own.find((i) => i.topic === t))
    .filter((i): i is DailyInsight => !!i);
}

// ============================================================================
// Weekly hero — one per child
// ============================================================================

const WEEKLY: Record<string, WeeklyInsight> = {
  'child-sara': {
    childId: 'child-sara',
    headlineAr: 'أسبوع قوي — سلسلة 5 أيام',
    headlineEn: 'Strong week — 5-day streak',
    paragraphAr:
      'سارة بدأت الأسبوع متعبة قليلاً لكنها استعادت إيقاعها سريعاً. التركيز ارتفع، المشاركة في الصف فوق المتوسط، والمزاج إيجابي طوال 4 من 5 أيام.',
    paragraphEn:
      "Sara started slow but found her rhythm fast. Focus is up, classroom participation is above average, and mood was positive on 4 of 5 days.",
    highlightsAr: [
      'أكملت 5 أيام تعلّم متواصلة (+18% عن متوسطها).',
      'قراءة يومية ثابتة — 6 من 7 أيام.',
      'النوم متأخر قليلاً — جرّبوا 10:00 مساءً.',
    ],
    highlightsEn: [
      'Completed a 5-day learning streak (+18% vs her average).',
      'Daily reading sticking — 6 of 7 days.',
      'Sleep running late — try a 10 PM lights-out.',
    ],
  },
  'child-omar': {
    childId: 'child-omar',
    headlineAr: 'أسبوع متوازن',
    headlineEn: 'A balanced week',
    paragraphAr:
      'عمر يحافظ على وتيرة هادئة وثابتة. لا توجد علامات تحذيرية، وانتباهه يتحسّن تدريجياً. صديقه الجديد إضافة جيدة لروتينه.',
    paragraphEn:
      "Omar is keeping a calm, steady rhythm. No red flags, attention is gradually improving. The new friend is a nice addition to his routine.",
    highlightsAr: [
      'جلسة دراسة بأطول مدة حتى الآن (22 دقيقة).',
      'تواصل اجتماعي صحّي مع زميل جديد.',
      'نوم منتظم — 9.5 ساعة يومياً.',
    ],
    highlightsEn: [
      'Longest study session yet (22 minutes).',
      'Healthy new friendship in class.',
      'Sleep on point — 9.5 hours nightly.',
    ],
  },
  'child-lina': {
    childId: 'child-lina',
    headlineAr: 'أسبوع متذبذب',
    headlineEn: 'An uneven week',
    paragraphAr:
      'لينا أظهرت طاقة عالية في الأنشطة التي تحبّها (الألغاز، القراءة بصوت عالٍ) لكن نشاطها العام غير منتظم. روتين أسبوعي بسيط سيساعد كثيراً.',
    paragraphEn:
      'Lina lit up on activities she loves (puzzles, read-aloud) but her overall activity is uneven. A light weekly routine would help.',
    highlightsAr: [
      'وقت الألغاز تضاعف هذا الأسبوع.',
      'ثلاثة أيام بدون نشاط — حاولوا تثبيت موعد بعد العشاء.',
      'مزاجها أهدأ صباحاً من المعتاد — جدير بالمتابعة.',
    ],
    highlightsEn: [
      'Puzzle time doubled this week.',
      'Three blank-activity days — try a fixed after-dinner slot.',
      'Calmer-than-usual mornings — worth keeping an eye on.',
    ],
  },
};

/** Weekly hero card for the active child. Returns null if not seeded. */
export function getWeeklyInsightForChild(childId: string): WeeklyInsight | null {
  return WEEKLY[childId] ?? null;
}
