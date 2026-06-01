// parentAppReportCardMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Per-child report-card seed for the Home page "Report Card" section. This is
// the term-end consolidated grades view, distinct from the per-day
// MOCK_ASSIGNMENTS / MOCK_EXAMS catalog (which drives the drawer surfaces).
//
// Shape: one ReportCardSubject per (childId, subject). Each subject carries
// the seven grade categories from the user spec — 1st exam, 2nd exam,
// project, quizzes (multiple items), assignments (multiple items), final
// exam, final grade — plus an AI summary paragraph.
//
// Multi-item categories (quizzes, assignments) hold an array of ReportItem
// rows so the Report Card UI can show a per-cell popover when the parent
// taps that cell.
//
// AI summaries are hand-crafted Levantine Arabic + English mirrors. They
// stay short on the row (1 sentence) and the "Generate full report" sheet
// composes a longer narrative across all subjects.
//
// Tailwind v4 JIT: this file has no class strings — colors are looked up
// per-subject in SUBJECT_STYLES at render time.

import type { SubjectKey } from './parentAppSchoolMockData';

// ============================================================================
// Types
// ============================================================================

/** One scored item — single exam, single quiz, single assignment, etc. */
export interface ReportItem {
  id: string;
  titleAr: string;
  titleEn: string;
  score: number;
  outOf: number;
  /** ISO YYYY-MM-DD — drives sort + display in the popover. */
  dateIso: string;
  /** Optional short teacher note attached to this item. */
  teacherNoteAr?: string;
  teacherNoteEn?: string;
}

/** Computed (or pre-baked) final-grade summary for a subject. */
export interface FinalGrade {
  score: number;
  outOf: number;
}

/** One row of the report-card "table" — one subject per row. */
export interface ReportCardSubject {
  childId: string;
  subject: SubjectKey;
  /** Single-item cells — null when no score yet for the term. */
  firstExam: ReportItem | null;
  secondExam: ReportItem | null;
  project: ReportItem | null;
  finalExam: ReportItem | null;
  /** Multi-item cells. Each becomes a tap-to-popover in the UI. */
  quizzes: ReportItem[];
  assignments: ReportItem[];
  /** Weighted final grade — pre-baked here so the UI stays purely presentational. */
  finalGrade: FinalGrade;
  /** Short AI insight — 1 sentence, rendered as the bottom line of the row card. */
  aiSummaryAr: string;
  aiSummaryEn: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert a same-scale (0..100 by default, but works with any outOf) score
 * into a fraction. Helper for the UI tone calculations.
 */
export function reportItemPercent(item: ReportItem): number {
  if (item.outOf <= 0) return 0;
  return item.score / item.outOf;
}

/** Average across multiple ReportItem entries — for the multi-item cell label. */
export function averageScore(items: ReportItem[]): { score: number; outOf: number } | null {
  if (items.length === 0) return null;
  // Average percent then scale to 100 so the cell label always reads /100,
  // regardless of mixed outOf values across items.
  const pct =
    items.reduce((sum, it) => sum + reportItemPercent(it), 0) / items.length;
  return { score: Math.round(pct * 100), outOf: 100 };
}

// ============================================================================
// Seed — current term for the 3 mock children. Sara is the demo target
// (active child by default) and gets the richest data; Omar + Lina get
// lighter seed so the per-child filter has variety.
// ============================================================================

function iso(month: number, day: number): string {
  const year = new Date().getFullYear();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const SARA_REPORT: ReportCardSubject[] = [
  {
    childId: 'child-sara',
    subject: 'math',
    firstExam: {
      id: 'sara-math-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 92,
      outOf: 100,
      dateIso: iso(2, 14),
    },
    secondExam: {
      id: 'sara-math-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 88,
      outOf: 100,
      dateIso: iso(3, 18),
    },
    project: {
      id: 'sara-math-proj',
      titleAr: 'مشروع الكسور',
      titleEn: 'Fractions project',
      score: 95,
      outOf: 100,
      dateIso: iso(3, 25),
      teacherNoteAr: 'مشروع رائع ومُنظَّم.',
      teacherNoteEn: 'Excellent and well-organized project.',
    },
    quizzes: [
      {
        id: 'sara-math-q1',
        titleAr: 'كويز الجمع',
        titleEn: 'Addition quiz',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 3),
      },
      {
        id: 'sara-math-q2',
        titleAr: 'كويز الكسور المتكافئة',
        titleEn: 'Equivalent fractions quiz',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 20),
        teacherNoteAr: 'راجعي مفهوم الكسور غير الكاملة.',
        teacherNoteEn: 'Review improper fractions.',
      },
      {
        id: 'sara-math-q3',
        titleAr: 'كويز الضرب',
        titleEn: 'Multiplication quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 5),
      },
      {
        id: 'sara-math-q4',
        titleAr: 'كويز القسمة',
        titleEn: 'Division quiz',
        score: 7,
        outOf: 10,
        dateIso: iso(3, 22),
        teacherNoteAr: 'القسمة الطويلة تحتاج تدريباً إضافياً.',
        teacherNoteEn: 'Long division needs more practice.',
      },
    ],
    assignments: [
      {
        id: 'sara-math-a1',
        titleAr: 'ورقة عمل الجدول 6',
        titleEn: 'Times-table 6 worksheet',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 8),
      },
      {
        id: 'sara-math-a2',
        titleAr: 'ورقة عمل المضاعفات',
        titleEn: 'Multiples worksheet',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 24),
      },
      {
        id: 'sara-math-a3',
        titleAr: 'تمارين الكسور',
        titleEn: 'Fractions practice',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 11),
      },
    ],
    finalExam: {
      id: 'sara-math-final',
      titleAr: 'الامتحان النهائي',
      titleEn: 'Final exam',
      score: 90,
      outOf: 100,
      dateIso: iso(4, 28),
      teacherNoteAr: 'أداء ثابت ومميز طوال الفصل.',
      teacherNoteEn: 'Consistent and strong performance all term.',
    },
    finalGrade: { score: 91, outOf: 100 },
    aiSummaryAr:
      'سارة تتقن الكسور والضرب — التركيز التالي يجب أن يكون على القسمة الطويلة.',
    aiSummaryEn:
      'Sara has mastered fractions and multiplication — next focus area is long division.',
  },
  {
    childId: 'child-sara',
    subject: 'arabic',
    firstExam: {
      id: 'sara-ar-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 85,
      outOf: 100,
      dateIso: iso(2, 16),
    },
    secondExam: {
      id: 'sara-ar-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 90,
      outOf: 100,
      dateIso: iso(3, 20),
    },
    project: {
      id: 'sara-ar-proj',
      titleAr: 'مشروع القصة المصوّرة',
      titleEn: 'Illustrated story project',
      score: 92,
      outOf: 100,
      dateIso: iso(4, 2),
    },
    quizzes: [
      {
        id: 'sara-ar-q1',
        titleAr: 'كويز الإملاء 1',
        titleEn: 'Spelling quiz 1',
        score: 9,
        outOf: 10,
        dateIso: iso(2, 7),
      },
      {
        id: 'sara-ar-q2',
        titleAr: 'كويز القراءة',
        titleEn: 'Reading quiz',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 1),
      },
      {
        id: 'sara-ar-q3',
        titleAr: 'كويز التشكيل',
        titleEn: 'Diacritics quiz',
        score: 7,
        outOf: 10,
        dateIso: iso(3, 18),
        teacherNoteAr: 'تحتاج لمزيد من التركيز على الفتحة والكسرة.',
        teacherNoteEn: 'Needs more focus on fatha and kasra.',
      },
    ],
    assignments: [
      {
        id: 'sara-ar-a1',
        titleAr: 'حفظ سورة الفلق',
        titleEn: 'Memorize Surat Al-Falaq',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 12),
      },
      {
        id: 'sara-ar-a2',
        titleAr: 'فقرة عن الربيع',
        titleEn: 'Paragraph about spring',
        score: 7,
        outOf: 10,
        dateIso: iso(3, 15),
        teacherNoteAr: 'أفكار جميلة، ركّزي على التشكيل.',
        teacherNoteEn: 'Nice ideas — focus on the diacritics.',
      },
    ],
    finalExam: {
      id: 'sara-ar-final',
      titleAr: 'الامتحان النهائي',
      titleEn: 'Final exam',
      score: 88,
      outOf: 100,
      dateIso: iso(4, 30),
    },
    finalGrade: { score: 88, outOf: 100 },
    aiSummaryAr: 'قراءة قوية جداً — التشكيل هو التحدّي الرئيسي.',
    aiSummaryEn: 'Very strong reading — diacritics are the main challenge.',
  },
  {
    childId: 'child-sara',
    subject: 'english',
    firstExam: {
      id: 'sara-en-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 78,
      outOf: 100,
      dateIso: iso(2, 17),
    },
    secondExam: {
      id: 'sara-en-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 82,
      outOf: 100,
      dateIso: iso(3, 21),
    },
    project: null,
    quizzes: [
      {
        id: 'sara-en-q1',
        titleAr: 'كويز المفردات 1',
        titleEn: 'Vocab quiz 1',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 9),
      },
      {
        id: 'sara-en-q2',
        titleAr: 'كويز المفردات 2',
        titleEn: 'Vocab quiz 2',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 8),
      },
    ],
    assignments: [
      {
        id: 'sara-en-a1',
        titleAr: 'جمل عن العائلة',
        titleEn: 'Sentences about family',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 26),
      },
      {
        id: 'sara-en-a2',
        titleAr: 'حوار قصير',
        titleEn: 'Short dialogue',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 24),
      },
    ],
    finalExam: {
      id: 'sara-en-final',
      titleAr: 'الامتحان النهائي',
      titleEn: 'Final exam',
      score: 80,
      outOf: 100,
      dateIso: iso(5, 2),
    },
    finalGrade: { score: 81, outOf: 100 },
    aiSummaryAr:
      'تقدّم جيد في المفردات — التركيز التالي على بناء الجمل الكاملة.',
    aiSummaryEn:
      'Good vocabulary progress — next focus: building complete sentences.',
  },
  {
    childId: 'child-sara',
    subject: 'science',
    firstExam: {
      id: 'sara-sci-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 70,
      outOf: 100,
      dateIso: iso(2, 19),
    },
    secondExam: {
      id: 'sara-sci-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 75,
      outOf: 100,
      dateIso: iso(3, 22),
      teacherNoteAr: 'تحسّن واضح في فهم حالات المادة.',
      teacherNoteEn: 'Clear improvement on states of matter.',
    },
    project: {
      id: 'sara-sci-proj',
      titleAr: 'مشروع دورة الماء',
      titleEn: 'Water cycle project',
      score: 65,
      outOf: 100,
      dateIso: iso(3, 28),
      teacherNoteAr: 'يحتاج مراجعة لمرحلتي التكثف والهطول.',
      teacherNoteEn: 'Review condensation and precipitation.',
    },
    quizzes: [
      {
        id: 'sara-sci-q1',
        titleAr: 'كويز حالات المادة',
        titleEn: 'States of matter quiz',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 28),
      },
    ],
    assignments: [
      {
        id: 'sara-sci-a1',
        titleAr: 'تجربة الذوبان',
        titleEn: 'Dissolving experiment',
        score: 7,
        outOf: 10,
        dateIso: iso(3, 6),
      },
      {
        id: 'sara-sci-a2',
        titleAr: 'تجربة دورة الماء',
        titleEn: 'Water cycle diagram',
        score: 5,
        outOf: 10,
        dateIso: iso(3, 20),
      },
    ],
    finalExam: null, // Not yet taken
    finalGrade: { score: 72, outOf: 100 },
    aiSummaryAr:
      'العلوم تحتاج دعماً إضافياً — تركيز على دورة الماء والذوبان قبل الامتحان النهائي.',
    aiSummaryEn:
      'Science needs extra support — focus on the water cycle and dissolving before the final.',
  },
  {
    childId: 'child-sara',
    subject: 'reading',
    firstExam: {
      id: 'sara-rd-1st',
      titleAr: 'تقييم القراءة الأول',
      titleEn: 'First reading assessment',
      score: 90,
      outOf: 100,
      dateIso: iso(2, 15),
    },
    secondExam: {
      id: 'sara-rd-2nd',
      titleAr: 'تقييم القراءة الثاني',
      titleEn: 'Second reading assessment',
      score: 94,
      outOf: 100,
      dateIso: iso(3, 19),
      teacherNoteAr: 'قراءة بطلاقة وفهم عميق للنص.',
      teacherNoteEn: 'Fluent reading with deep comprehension.',
    },
    project: {
      id: 'sara-rd-proj',
      titleAr: 'مشروع قصة من تأليفي',
      titleEn: 'My-own-story project',
      score: 96,
      outOf: 100,
      dateIso: iso(4, 5),
    },
    quizzes: [
      {
        id: 'sara-rd-q1',
        titleAr: 'كويز فهم النص 1',
        titleEn: 'Comprehension quiz 1',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 24),
      },
      {
        id: 'sara-rd-q2',
        titleAr: 'كويز المفردات',
        titleEn: 'Vocabulary quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 12),
      },
    ],
    assignments: [
      {
        id: 'sara-rd-a1',
        titleAr: 'تلخيص قصة "العصفور الذكي"',
        titleEn: 'Summarize "The Clever Sparrow"',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 18),
      },
      {
        id: 'sara-rd-a2',
        titleAr: 'قراءة جهرية مسجلة',
        titleEn: 'Recorded read-aloud',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 8),
      },
      {
        id: 'sara-rd-a3',
        titleAr: 'دفتر القراءة الأسبوعي',
        titleEn: 'Weekly reading journal',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 25),
      },
    ],
    finalExam: {
      id: 'sara-rd-final',
      titleAr: 'التقييم النهائي',
      titleEn: 'Final assessment',
      score: 95,
      outOf: 100,
      dateIso: iso(5, 4),
    },
    finalGrade: { score: 94, outOf: 100 },
    aiSummaryAr:
      'سارة قارئة متميزة — تحبّ القصص الطويلة، شجعوها على نوادي القراءة.',
    aiSummaryEn:
      'Sara is a standout reader — she loves longer stories; nudge her toward book clubs.',
  },
  {
    childId: 'child-sara',
    subject: 'art',
    firstExam: null,
    secondExam: null,
    project: {
      id: 'sara-art-proj1',
      titleAr: 'مشروع منظر طبيعي بألوان الخريف',
      titleEn: 'Autumn landscape project',
      score: 88,
      outOf: 100,
      dateIso: iso(3, 2),
      teacherNoteAr: 'إحساس جميل بالألوان والتناغم.',
      teacherNoteEn: 'Lovely sense of color and harmony.',
    },
    quizzes: [],
    assignments: [
      {
        id: 'sara-art-a1',
        titleAr: 'رسم منظر طبيعي',
        titleEn: 'Landscape sketch',
        score: 9,
        outOf: 10,
        dateIso: iso(2, 11),
      },
      {
        id: 'sara-art-a2',
        titleAr: 'كولاج ورقي',
        titleEn: 'Paper collage',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 9),
      },
      {
        id: 'sara-art-a3',
        titleAr: 'بورتريه ذاتي',
        titleEn: 'Self portrait',
        score: 9,
        outOf: 10,
        dateIso: iso(4, 1),
      },
    ],
    finalExam: {
      id: 'sara-art-final',
      titleAr: 'معرض نهاية الفصل',
      titleEn: 'End-of-term exhibition',
      score: 92,
      outOf: 100,
      dateIso: iso(5, 6),
    },
    finalGrade: { score: 91, outOf: 100 },
    aiSummaryAr:
      'موهبة فنية واضحة — جرّبوا تسجيلها في ورشة فنية صيفية.',
    aiSummaryEn:
      'Clear artistic talent — consider a summer art workshop.',
  },
  {
    childId: 'child-sara',
    subject: 'pe',
    firstExam: null,
    secondExam: null,
    project: null,
    quizzes: [
      {
        id: 'sara-pe-q1',
        titleAr: 'اختبار اللياقة 1',
        titleEn: 'Fitness test 1',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 21),
      },
      {
        id: 'sara-pe-q2',
        titleAr: 'اختبار اللياقة 2',
        titleEn: 'Fitness test 2',
        score: 9,
        outOf: 10,
        dateIso: iso(4, 10),
      },
    ],
    assignments: [
      {
        id: 'sara-pe-a1',
        titleAr: 'مهارة كرة السلة',
        titleEn: 'Basketball skill',
        score: 8,
        outOf: 10,
        dateIso: iso(3, 4),
      },
      {
        id: 'sara-pe-a2',
        titleAr: 'سباق التتابع',
        titleEn: 'Relay race',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 25),
      },
    ],
    finalExam: {
      id: 'sara-pe-final',
      titleAr: 'يوم الرياضة',
      titleEn: 'Sports day',
      score: 9,
      outOf: 10,
      dateIso: iso(5, 8),
      teacherNoteAr: 'روح رياضية رائعة وتعاون مع الفريق.',
      teacherNoteEn: 'Excellent sportsmanship and teamwork.',
    },
    finalGrade: { score: 88, outOf: 100 },
    aiSummaryAr:
      'نشاطها العالي يفيد تركيزها في المواد الأخرى — حافظوا على 30 دقيقة لعب يومياً.',
    aiSummaryEn:
      'Her energy boosts focus in other subjects — keep 30 min of active play daily.',
  },
];

// Lighter seed for the other two kids — same structure, less detail.
const OMAR_REPORT: ReportCardSubject[] = [
  {
    childId: 'child-omar',
    subject: 'math',
    firstExam: {
      id: 'omar-math-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 80,
      outOf: 100,
      dateIso: iso(2, 14),
    },
    secondExam: {
      id: 'omar-math-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 85,
      outOf: 100,
      dateIso: iso(3, 18),
    },
    project: null,
    quizzes: [
      {
        id: 'omar-math-q1',
        titleAr: 'كويز الجمع',
        titleEn: 'Addition quiz',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 3),
      },
      {
        id: 'omar-math-q2',
        titleAr: 'كويز الضرب',
        titleEn: 'Multiplication quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 5),
      },
    ],
    assignments: [
      {
        id: 'omar-math-a1',
        titleAr: 'تمارين القسمة',
        titleEn: 'Division practice',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 1),
      },
    ],
    finalExam: null,
    finalGrade: { score: 84, outOf: 100 },
    aiSummaryAr: 'تقدّم ثابت في الحساب — جاهز للقسمة الطويلة.',
    aiSummaryEn: 'Steady progress in arithmetic — ready for long division.',
  },
  {
    childId: 'child-omar',
    subject: 'arabic',
    firstExam: {
      id: 'omar-ar-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 88,
      outOf: 100,
      dateIso: iso(2, 16),
    },
    secondExam: null,
    project: null,
    quizzes: [
      {
        id: 'omar-ar-q1',
        titleAr: 'كويز الإملاء',
        titleEn: 'Spelling quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(2, 7),
      },
    ],
    assignments: [],
    finalExam: null,
    finalGrade: { score: 88, outOf: 100 },
    aiSummaryAr: 'إملاء ممتاز — تابعوا القراءة اليومية.',
    aiSummaryEn: 'Excellent spelling — keep up the daily reading.',
  },
  {
    childId: 'child-omar',
    subject: 'english',
    firstExam: {
      id: 'omar-en-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 76,
      outOf: 100,
      dateIso: iso(2, 17),
    },
    secondExam: {
      id: 'omar-en-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 81,
      outOf: 100,
      dateIso: iso(3, 21),
    },
    project: null,
    quizzes: [
      {
        id: 'omar-en-q1',
        titleAr: 'كويز المفردات',
        titleEn: 'Vocab quiz',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 28),
      },
      {
        id: 'omar-en-q2',
        titleAr: 'كويز الاستماع',
        titleEn: 'Listening quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 15),
      },
    ],
    assignments: [
      {
        id: 'omar-en-a1',
        titleAr: 'كتابة فقرة قصيرة',
        titleEn: 'Short paragraph',
        score: 8,
        outOf: 10,
        dateIso: iso(3, 3),
      },
    ],
    finalExam: null,
    finalGrade: { score: 80, outOf: 100 },
    aiSummaryAr: 'تقدّم جميل في الاستماع — جرّبوا قصصاً صوتية باللغة الإنجليزية.',
    aiSummaryEn: 'Nice listening progress — try English audiobooks together.',
  },
  {
    childId: 'child-omar',
    subject: 'science',
    firstExam: {
      id: 'omar-sci-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 82,
      outOf: 100,
      dateIso: iso(2, 19),
    },
    secondExam: null,
    project: {
      id: 'omar-sci-proj',
      titleAr: 'مشروع البراكين',
      titleEn: 'Volcano project',
      score: 90,
      outOf: 100,
      dateIso: iso(3, 26),
      teacherNoteAr: 'إبداع وحماس في العرض.',
      teacherNoteEn: 'Creative and energetic presentation.',
    },
    quizzes: [],
    assignments: [
      {
        id: 'omar-sci-a1',
        titleAr: 'تجربة المغناطيس',
        titleEn: 'Magnet experiment',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 11),
      },
    ],
    finalExam: null,
    finalGrade: { score: 85, outOf: 100 },
    aiSummaryAr: 'فضول علمي عالي — وفّروا له تجارب بسيطة في المطبخ.',
    aiSummaryEn: 'High scientific curiosity — try simple kitchen experiments.',
  },
];

const LINA_REPORT: ReportCardSubject[] = [
  {
    childId: 'child-lina',
    subject: 'english',
    firstExam: {
      id: 'lina-en-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 95,
      outOf: 100,
      dateIso: iso(2, 17),
    },
    secondExam: null,
    project: null,
    quizzes: [
      {
        id: 'lina-en-q1',
        titleAr: 'كويز المفردات',
        titleEn: 'Vocab quiz',
        score: 10,
        outOf: 10,
        dateIso: iso(2, 9),
      },
      {
        id: 'lina-en-q2',
        titleAr: 'كويز القراءة',
        titleEn: 'Reading quiz',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 8),
      },
    ],
    assignments: [
      {
        id: 'lina-en-a1',
        titleAr: 'مقالة قصيرة',
        titleEn: 'Short essay',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 2),
      },
    ],
    finalExam: null,
    finalGrade: { score: 96, outOf: 100 },
    aiSummaryAr: 'لينا تتفوّق في الإنجليزية — حافظوا على ممارسة المحادثة.',
    aiSummaryEn: 'Lina is excelling in English — keep up the speaking practice.',
  },
  {
    childId: 'child-lina',
    subject: 'arabic',
    firstExam: {
      id: 'lina-ar-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 82,
      outOf: 100,
      dateIso: iso(2, 16),
    },
    secondExam: {
      id: 'lina-ar-2nd',
      titleAr: 'الامتحان الثاني',
      titleEn: 'Second exam',
      score: 86,
      outOf: 100,
      dateIso: iso(3, 19),
    },
    project: null,
    quizzes: [
      {
        id: 'lina-ar-q1',
        titleAr: 'كويز الإملاء',
        titleEn: 'Spelling quiz',
        score: 9,
        outOf: 10,
        dateIso: iso(2, 27),
      },
    ],
    assignments: [
      {
        id: 'lina-ar-a1',
        titleAr: 'حفظ سورة الإخلاص',
        titleEn: 'Memorize Surat Al-Ikhlas',
        score: 10,
        outOf: 10,
        dateIso: iso(3, 7),
      },
    ],
    finalExam: null,
    finalGrade: { score: 87, outOf: 100 },
    aiSummaryAr: 'تطوّر منتظم — ركّزوا على القراءة الجهرية اليومية.',
    aiSummaryEn: 'Steady progress — keep up daily read-aloud practice.',
  },
  {
    childId: 'child-lina',
    subject: 'math',
    firstExam: {
      id: 'lina-math-1st',
      titleAr: 'الامتحان الأول',
      titleEn: 'First exam',
      score: 78,
      outOf: 100,
      dateIso: iso(2, 14),
    },
    secondExam: null,
    project: null,
    quizzes: [
      {
        id: 'lina-math-q1',
        titleAr: 'كويز الجمع',
        titleEn: 'Addition quiz',
        score: 8,
        outOf: 10,
        dateIso: iso(2, 24),
      },
      {
        id: 'lina-math-q2',
        titleAr: 'كويز الطرح',
        titleEn: 'Subtraction quiz',
        score: 7,
        outOf: 10,
        dateIso: iso(3, 12),
      },
    ],
    assignments: [
      {
        id: 'lina-math-a1',
        titleAr: 'ورقة عمل الجمع',
        titleEn: 'Addition worksheet',
        score: 9,
        outOf: 10,
        dateIso: iso(3, 1),
      },
    ],
    finalExam: null,
    finalGrade: { score: 78, outOf: 100 },
    aiSummaryAr: 'الطرح يحتاج تدريباً إضافياً — جرّبوا الألعاب الحسابية.',
    aiSummaryEn: 'Subtraction needs more practice — try math games together.',
  },
];

export const MOCK_REPORT_CARD: ReportCardSubject[] = [
  ...SARA_REPORT,
  ...OMAR_REPORT,
  ...LINA_REPORT,
];

/** All report-card rows for a single child. Stable subject order. */
export function getReportCardForChild(childId: string): ReportCardSubject[] {
  return MOCK_REPORT_CARD.filter((r) => r.childId === childId);
}

// ============================================================================
// "Generate full report" — multi-paragraph AI narrative
// ============================================================================

/** A multi-paragraph "narrative" block. Each entry renders as a section. */
export interface FullReportSection {
  /** AR + EN section heading. */
  titleAr: string;
  titleEn: string;
  /** AR + EN body paragraphs (each is a separate <p>). */
  bodyAr: string[];
  bodyEn: string[];
}

/**
 * Compose a richer multi-section "AI" report for a child. Mocked — in v2 a
 * real LLM call replaces this, but the shape stays the same.
 *
 * The narrative is deterministic per (childName, subjects[]) so the same
 * child always produces the same report — easier for screenshots + demos.
 */
export function generateFullReport(
  childId: string,
  childNameAr: string,
  childNameEn: string
): { sectionsAr: FullReportSection[]; sectionsEn: FullReportSection[] } {
  const rows = getReportCardForChild(childId);
  if (rows.length === 0) {
    return {
      sectionsAr: [],
      sectionsEn: [],
    };
  }

  // Aggregate snapshot.
  const finalAvg =
    rows.reduce((sum, r) => sum + r.finalGrade.score / r.finalGrade.outOf, 0) /
    rows.length;
  const finalPct = Math.round(finalAvg * 100);

  const strongest = [...rows].sort(
    (a, b) =>
      b.finalGrade.score / b.finalGrade.outOf -
      a.finalGrade.score / a.finalGrade.outOf
  )[0];
  const weakest = [...rows].sort(
    (a, b) =>
      a.finalGrade.score / a.finalGrade.outOf -
      b.finalGrade.score / b.finalGrade.outOf
  )[0];

  const subjectLabelMap: Record<SubjectKey, { ar: string; en: string }> = {
    math: { ar: 'الرياضيات', en: 'Math' },
    arabic: { ar: 'اللغة العربية', en: 'Arabic' },
    english: { ar: 'اللغة الإنجليزية', en: 'English' },
    science: { ar: 'العلوم', en: 'Science' },
    reading: { ar: 'القراءة', en: 'Reading' },
    pe: { ar: 'التربية الرياضية', en: 'PE' },
    art: { ar: 'الفن', en: 'Art' },
  };

  return {
    sectionsAr: [
      {
        titleAr: 'نظرة عامة',
        titleEn: 'Overview',
        bodyAr: [
          `أكمل/ت ${childNameAr} الفصل بمعدّل عام قدره ${finalPct}%، وهو معدّل ${finalPct >= 85 ? 'ممتاز' : finalPct >= 70 ? 'جيد جداً' : 'مقبول مع مجال للتحسين'}.`,
          `الأداء الأقوى ظهر في مادة ${subjectLabelMap[strongest.subject].ar}، بينما تظهر مادة ${subjectLabelMap[weakest.subject].ar} الحاجة إلى دعم إضافي قبل الفصل القادم.`,
        ],
        bodyEn: [],
      },
      ...rows.map((r) => ({
        titleAr: subjectLabelMap[r.subject].ar,
        titleEn: subjectLabelMap[r.subject].en,
        bodyAr: [r.aiSummaryAr],
        bodyEn: [],
      })),
      {
        titleAr: 'التوصيات للأسبوع القادم',
        titleEn: 'Recommendations for next week',
        bodyAr: [
          `ركّزوا مع ${childNameAr} على ${subjectLabelMap[weakest.subject].ar} لمدة 15 دقيقة يومياً قبل النوم.`,
          'ادعموا نقاط القوّة بتحديات صغيرة في المنزل (ألعاب، قراءة قصص قصيرة، تجارب علمية بسيطة).',
          'استمرّوا في التواصل مع المعلمين عبر تطبيق String — يستجيبون عادة خلال ساعتين.',
        ],
        bodyEn: [],
      },
    ],
    sectionsEn: [
      {
        titleAr: 'Overview',
        titleEn: 'Overview',
        bodyAr: [],
        bodyEn: [
          `${childNameEn} finished the term with an overall average of ${finalPct}%, which is ${finalPct >= 85 ? 'excellent' : finalPct >= 70 ? 'very good' : 'acceptable with room to grow'}.`,
          `The strongest performance was in ${subjectLabelMap[strongest.subject].en}, while ${subjectLabelMap[weakest.subject].en} could use extra support before the next term.`,
        ],
      },
      ...rows.map((r) => ({
        titleAr: subjectLabelMap[r.subject].ar,
        titleEn: subjectLabelMap[r.subject].en,
        bodyAr: [],
        bodyEn: [r.aiSummaryEn],
      })),
      {
        titleAr: 'Recommendations for next week',
        titleEn: 'Recommendations for next week',
        bodyAr: [],
        bodyEn: [
          `Spend 15 minutes a day on ${subjectLabelMap[weakest.subject].en} with ${childNameEn} before bedtime.`,
          'Reinforce strengths with small home challenges (games, short stories, simple science experiments).',
          'Keep talking to teachers through String — they typically reply within 2 hours.',
        ],
      },
    ],
  };
}
