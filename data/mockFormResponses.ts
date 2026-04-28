// mockFormResponses.ts
// ─────────────────────────────────────────────────────────────────────────────
// Frontend-only seeded form-response generator. For each form we produce
// 30–150 responses varying:
//   - completion state (complete vs partial — answers map omits some fields)
//   - submitted-at timestamps spread across the past 21 days, with a
//     daily/hourly pattern that gives the heatmap something to chart
//   - completion duration (seconds spent filling) — surface as "completed in"
//   - role mix (mostly parents, with a sprinkle of teachers/admins)
//
// Mirrors `mockAttendanceData.ts`'s `createRng` LCG so the seed is stable
// across reloads: same data on every page-load. No back-end calls.
//
// Backward compat: extends FormResponse with optional fields the existing
// table view will simply ignore (`durationSeconds`, `isPartial`).
//
// Exposes builder functions instead of top-level data to dodge a circular-
// import hazard with `notificationData.ts` (which both *defines* MOCK_FORMS
// and *consumes* this module).

import type { FormResponse, FormDefinition, UserRole } from '../types/notification';

// ============================================================================
// Seeded PRNG — deterministic LCG; same algorithm as mockAttendanceData.ts
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================================================
// Respondent pool
// ============================================================================

interface RespondentSeed {
  id: string;
  name: string;
  role: UserRole;
  grade?: number;
  section?: string;
}

const RESPONDENT_POOL: RespondentSeed[] = [
  // Parents (most common)
  { id: 'p-1', name: 'سالم السالم', role: 'parent', grade: 3, section: 'A' },
  { id: 'p-2', name: 'مريم العمر', role: 'parent', grade: 3, section: 'A' },
  { id: 'p-3', name: 'عبدالرحمن الرشيد', role: 'parent', grade: 3, section: 'A' },
  { id: 'p-4', name: 'هيا الزهراني', role: 'parent', grade: 3, section: 'B' },
  { id: 'p-5', name: 'ناصر القحطاني', role: 'parent', grade: 3, section: 'B' },
  { id: 'p-6', name: 'أمينة الحربي', role: 'parent', grade: 3, section: 'C' },
  { id: 'p-7', name: 'فهد الغامدي', role: 'parent', grade: 3, section: 'C' },
  { id: 'p-8', name: 'نجلاء الصالح', role: 'parent', grade: 4, section: 'A' },
  { id: 'p-9', name: 'ماجد العتيبي', role: 'parent', grade: 4, section: 'A' },
  { id: 'p-10', name: 'سميرة الحسن', role: 'parent', grade: 4, section: 'B' },
  { id: 'p-11', name: 'عادل الجبر', role: 'parent', grade: 4, section: 'B' },
  { id: 'p-12', name: 'لولوة المنصور', role: 'parent', grade: 5, section: 'A' },
  { id: 'p-13', name: 'بدر الشمري', role: 'parent', grade: 6, section: 'A' },
  { id: 'p-14', name: 'عائشة الدوسري', role: 'parent', grade: 7, section: 'A' },
  { id: 'p-15', name: 'خالد المالكي', role: 'parent', grade: 8, section: 'A' },
  { id: 'p-16', name: 'نوال السبيعي', role: 'parent', grade: 9, section: 'A' },
  { id: 'p-17', name: 'تركي الحارثي', role: 'parent', grade: 10, section: 'A' },
  { id: 'p-18', name: 'وفاء الجعفري', role: 'parent', grade: 11, section: 'A' },
  { id: 'p-19', name: 'سعد الفيفي', role: 'parent', grade: 5, section: 'B' },
  { id: 'p-20', name: 'ابتسام البلوي', role: 'parent', grade: 6, section: 'B' },
  // Students
  { id: 's-1', name: 'علي الحربي', role: 'student', grade: 5, section: 'A' },
  { id: 's-2', name: 'يارا الصبيحي', role: 'student', grade: 6, section: 'A' },
  { id: 's-3', name: 'بسام الكثيري', role: 'student', grade: 7, section: 'A' },
  { id: 's-4', name: 'جنى السعيد', role: 'student', grade: 8, section: 'B' },
  { id: 's-5', name: 'فيصل الزهراني', role: 'student', grade: 9, section: 'A' },
  { id: 's-6', name: 'ريم البشري', role: 'student', grade: 10, section: 'A' },
  // Teachers
  { id: 't-1', name: 'أحمد المحمد', role: 'teacher', grade: 3, section: 'A' },
  { id: 't-2', name: 'سارة العلي', role: 'teacher', grade: 3, section: 'B' },
  { id: 't-5', name: 'عمر الفاروق', role: 'teacher', grade: 5, section: 'A' },
  { id: 't-9', name: 'محمود عباس', role: 'teacher', grade: 8, section: 'A' },
];

// ============================================================================
// Per-form response counts — bigger forms get more responses
// ============================================================================

const FORM_RESPONSE_COUNTS: Record<string, [number, number]> = {
  // Existing seeded forms in notificationData
  'form-1': [60, 90],
  'form-2': [80, 120],
};

const DEFAULT_RESPONSE_RANGE: [number, number] = [30, 80];

// ============================================================================
// Generator — closes over a single RNG so calls are seeded together
// ============================================================================

interface ExtendedFormResponse extends FormResponse {
  /** Seconds spent filling. Optional; existing UI ignores. */
  durationSeconds?: number;
  /** True when respondent skipped some optional fields. */
  isPartial?: boolean;
}

function generateAnswerForField(
  field: FormDefinition['fields'][number],
  isPartial: boolean,
  rng: () => number,
): unknown {
  const pickInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const chance = (p: number) => rng() < p;

  // Partials skip ~30-40% of optional fields
  if (isPartial && !field.required && chance(0.4)) return undefined;

  switch (field.type) {
    case 'yes-no':
      return chance(0.72);
    case 'single-choice': {
      const opts = field.options ?? [];
      if (opts.length === 0) return undefined;
      const idx = chance(0.55) ? 0 : chance(0.5) ? 1 : pickInt(0, opts.length - 1);
      return opts[Math.min(idx, opts.length - 1)].label;
    }
    case 'multiple-choice': {
      const opts = field.options ?? [];
      if (opts.length === 0) return [];
      const count = pickInt(1, Math.min(3, opts.length));
      const picked: string[] = [];
      const pool = [...opts];
      for (let i = 0; i < count; i++) {
        const j = pickInt(0, pool.length - 1);
        picked.push(pool[j].label);
        pool.splice(j, 1);
      }
      return picked;
    }
    case 'number': {
      const min = field.validation?.min ?? 1;
      const max = field.validation?.max ?? 100;
      return pickInt(min, max);
    }
    case 'date': {
      const offset = pickInt(-30, 30);
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    }
    case 'short-text': {
      const SHORT_TEXTS = [
        'أحمد محمد', 'فاطمة علي', 'محمد العتيبي', 'نورا السالم', 'يوسف الحربي',
        '0501234567', '0556789012', '0531122334',
        'ahmed@example.com', 'sara@email.com',
      ];
      return pick(SHORT_TEXTS);
    }
    case 'long-text': {
      const LONG_TEXTS = [
        'يرجى الانتباه لحساسية المكسرات لدى الطالب وعدم تقديم أي طعام يحتوي عليها.',
        'الطالب يحتاج إلى رعاية إضافية خلال الرحلة بسبب وضعه الصحي.',
        'أتمنى أن تتم زيادة عدد الأنشطة الخارجية في الفصل الدراسي القادم.',
        'لا يوجد ملاحظات إضافية. شكرًا لكم على جهودكم.',
        'هل يمكن تغيير موعد الاجتماع ليكون مساءً بدلًا من الصباح؟',
        'المعلم متعاون جدًا ويقدم شرحًا واضحًا. ابني يحب حصته كثيرًا.',
        'المستوى الأكاديمي للطالبة ممتاز ولكن تحتاج إلى تحفيز أكبر في النشاطات.',
        'أشكركم على هذه الفرصة الرائعة للأبناء.',
        'الجو العام داخل الفصل يحتاج إلى تحسين، أتمنى توفير تدفئة أفضل.',
        '',
      ];
      return pick(LONG_TEXTS);
    }
    case 'file-upload':
      return chance(0.4) ? `attachment-${pickInt(1000, 9999)}.pdf` : undefined;
    default:
      return undefined;
  }
}

function pickSubmittedAt(daysWindow: number, rng: () => number): { iso: string; durationSec: number } {
  const pickInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const chance = (p: number) => rng() < p;

  // Bias toward recent days (last week gets more responses)
  const daysAgo = Math.floor(Math.pow(rng(), 1.6) * daysWindow);
  // Hour-of-day pattern: peaks around 8-10, 13-15, 19-21
  const buckets = [
    { h: 8, w: 5 }, { h: 9, w: 6 }, { h: 10, w: 4 },
    { h: 13, w: 4 }, { h: 14, w: 5 }, { h: 15, w: 4 },
    { h: 19, w: 5 }, { h: 20, w: 6 }, { h: 21, w: 5 },
    { h: 7, w: 2 }, { h: 11, w: 2 }, { h: 12, w: 2 },
    { h: 16, w: 2 }, { h: 17, w: 2 }, { h: 18, w: 2 },
    { h: 22, w: 2 }, { h: 23, w: 1 },
  ];
  const total = buckets.reduce((s, b) => s + b.w, 0);
  let r = rng() * total;
  let hour = 14;
  for (const b of buckets) {
    r -= b.w;
    if (r <= 0) { hour = b.h; break; }
  }
  const minute = pickInt(0, 59);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);

  const durationSec = chance(0.85) ? pickInt(45, 300) : pickInt(300, 900);
  return { iso: d.toISOString(), durationSec };
}

function generateOneResponse(
  form: FormDefinition,
  index: number,
  rng: () => number,
): ExtendedFormResponse {
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const chance = (p: number) => rng() < p;

  const respondent = pick(RESPONDENT_POOL);
  const isPartial = chance(0.18);
  const { iso, durationSec } = pickSubmittedAt(21, rng);

  const answers: Record<string, string | string[] | number | boolean> = {};
  for (const field of form.fields) {
    const ans = generateAnswerForField(field, isPartial, rng);
    if (ans !== undefined) {
      answers[field.id] = ans as string | string[] | number | boolean;
    }
  }

  return {
    id: `gen-${form.id}-${index}`,
    formId: form.id,
    respondentId: `${respondent.id}-${index}`,
    respondentName: respondent.name,
    respondentRole: respondent.role,
    respondentGrade: respondent.grade,
    respondentSection: respondent.section,
    answers,
    submittedAt: iso,
    durationSeconds: durationSec,
    isPartial,
  };
}

// ============================================================================
// Public builders
// ============================================================================

/**
 * Build the seeded large set of responses for the given forms. Called once
 * by `notificationData.ts` after MOCK_FORMS finishes initializing.
 */
export function buildGeneratedFormResponses(
  forms: FormDefinition[],
): ExtendedFormResponse[] {
  const rng = createRng(7331);
  const pickInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  const out: ExtendedFormResponse[] = [];
  for (const form of forms) {
    const [min, max] = FORM_RESPONSE_COUNTS[form.id] ?? DEFAULT_RESPONSE_RANGE;
    const count = pickInt(min, max);
    for (let i = 0; i < count; i++) {
      out.push(generateOneResponse(form, i, rng));
    }
  }
  out.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return out;
}

/**
 * For a given response set, estimate total recipients (denominator for the
 * "response rate" stat). Uses a stable RNG-derived rate per form.
 */
export function getFormEstimatedRecipients(
  responses: ExtendedFormResponse[],
): Record<string, number> {
  const rng = createRng(909);
  const map: Record<string, number> = {};
  // Group response counts by formId
  const byForm = new Map<string, number>();
  for (const r of responses) {
    byForm.set(r.formId, (byForm.get(r.formId) ?? 0) + 1);
  }
  for (const [formId, count] of byForm) {
    const rate = 0.45 + rng() * 0.2;
    map[formId] = Math.round(count / rate);
  }
  return map;
}

export type { ExtendedFormResponse };
