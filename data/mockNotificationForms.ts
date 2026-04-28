// Mock seeded form definitions for the Notifications Compose form picker.
// Frontend-only; surfaces a Notion-style template gallery to the admin.
//
// Each entry is a "summary" object with the metadata we need to render a
// pickable card: bilingual title + description, field count, estimated
// completion time, and a small set of icon hints derived from the field
// types within. Real form bodies live elsewhere — this is just the
// chooser-side seed.

import type { FormFieldType } from '../types/notification';

export interface MockNotificationForm {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  fieldCount: number;
  /** Estimated minutes to complete the form. */
  estMinutes: number;
  /**
   * Subset of field types appearing in the form. Used by the picker to
   * render a tiny icon row (text / choice / file-upload). Order is the
   * order they're shown.
   */
  fieldTypes: FormFieldType[];
  /** Optional category label for grouping later. */
  category: 'satisfaction' | 'registration' | 'permission' | 'evaluation' | 'request' | 'other';
}

// ============================================================================
// Seeded PRNG — deterministic across page loads (mirrors mockAttendanceData).
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(2024);

function pickInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ============================================================================
// Form seeds
// ============================================================================

interface FormSeed {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: MockNotificationForm['category'];
  fieldTypes: FormFieldType[];
  fieldCountRange: [number, number];
  estMinRange: [number, number];
}

const FORM_SEEDS: FormSeed[] = [
  {
    id: 'form-satisfaction',
    titleAr: 'استبيان رضا الطلاب',
    titleEn: 'Student Satisfaction Survey',
    descriptionAr: 'قس مدى رضا الطلاب عن الفصل الدراسي والمعلمين',
    descriptionEn: 'Measure student satisfaction with the term and teachers',
    category: 'satisfaction',
    fieldTypes: ['single-choice', 'long-text', 'yes-no'],
    fieldCountRange: [10, 14],
    estMinRange: [3, 4],
  },
  {
    id: 'form-trip-registration',
    titleAr: 'تسجيل في رحلة مدرسية',
    titleEn: 'School Trip Registration',
    descriptionAr: 'سجل ابنك للمشاركة في الرحلة المدرسية القادمة',
    descriptionEn: 'Register your child for the upcoming school trip',
    category: 'registration',
    fieldTypes: ['short-text', 'single-choice', 'file-upload', 'date'],
    fieldCountRange: [8, 12],
    estMinRange: [4, 6],
  },
  {
    id: 'form-absence-permission',
    titleAr: 'إذن غياب',
    titleEn: 'Absence Permission',
    descriptionAr: 'طلب إذن غياب رسمي مع توضيح الأسباب',
    descriptionEn: 'Request an official absence permission with reasons',
    category: 'permission',
    fieldTypes: ['short-text', 'date', 'long-text', 'file-upload'],
    fieldCountRange: [5, 7],
    estMinRange: [2, 3],
  },
  {
    id: 'form-teacher-evaluation',
    titleAr: 'تقييم المعلم',
    titleEn: 'Teacher Evaluation',
    descriptionAr: 'قيم أداء المعلم خلال الفصل الدراسي',
    descriptionEn: "Evaluate the teacher's performance this term",
    category: 'evaluation',
    fieldTypes: ['single-choice', 'multiple-choice', 'long-text'],
    fieldCountRange: [12, 16],
    estMinRange: [4, 5],
  },
  {
    id: 'form-parent-meeting',
    titleAr: 'طلب لقاء ولي الأمر',
    titleEn: 'Parent Meeting Request',
    descriptionAr: 'احجز موعدًا للقاء مع المعلم أو الإدارة',
    descriptionEn: 'Book a meeting with the teacher or administration',
    category: 'request',
    fieldTypes: ['short-text', 'date', 'single-choice', 'long-text'],
    fieldCountRange: [6, 8],
    estMinRange: [2, 3],
  },
  {
    id: 'form-new-book',
    titleAr: 'استمارة كتاب جديد',
    titleEn: 'New Book Request',
    descriptionAr: 'اطلب نسخة جديدة من كتاب فقد أو تلف',
    descriptionEn: 'Request a replacement copy for a lost or damaged book',
    category: 'request',
    fieldTypes: ['short-text', 'single-choice', 'yes-no', 'file-upload'],
    fieldCountRange: [4, 6],
    estMinRange: [2, 3],
  },
];

export const MOCK_NOTIFICATION_FORMS: MockNotificationForm[] = FORM_SEEDS.map((seed) => {
  const [fcMin, fcMax] = seed.fieldCountRange;
  const [emMin, emMax] = seed.estMinRange;
  return {
    id: seed.id,
    titleAr: seed.titleAr,
    titleEn: seed.titleEn,
    descriptionAr: seed.descriptionAr,
    descriptionEn: seed.descriptionEn,
    fieldCount: pickInt(fcMin, fcMax),
    estMinutes: pickInt(emMin, emMax),
    fieldTypes: seed.fieldTypes,
    category: seed.category,
  };
});

export function getMockFormById(id: string | null | undefined): MockNotificationForm | null {
  if (!id) return null;
  return MOCK_NOTIFICATION_FORMS.find((f) => f.id === id) ?? null;
}

/**
 * Sentinel deep-link scheme used for in-app form CTAs. The frontend
 * recognizes URLs starting with this prefix as "this CTA opens the
 * attached form" so it can render a special form badge / open the
 * form in-app instead of navigating away.
 */
export const FORM_DEEPLINK_SCHEME = 'forms://internal/';

export function buildFormDeepLink(formId: string): string {
  return `${FORM_DEEPLINK_SCHEME}${formId}`;
}

export function isFormDeepLink(url: string | undefined | null): boolean {
  return !!url && url.startsWith(FORM_DEEPLINK_SCHEME);
}

export function extractFormIdFromDeepLink(url: string | undefined | null): string | null {
  if (!isFormDeepLink(url)) return null;
  return url!.slice(FORM_DEEPLINK_SCHEME.length) || null;
}
