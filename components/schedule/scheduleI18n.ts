// scheduleI18n.ts
// All user-facing strings for the Schedule module, in AR + EN.
// Importers pass `locale: 'ar' | 'en'` and pluck the right field.

import type { PendingAction, SubjectKey } from './scheduleTypes';
import type {
  ClassSizeComfort,
  LanguageOption,
  TeachingStyleTag,
} from './profileTypes';

export type Locale = 'ar' | 'en';

function pick(locale: Locale, ar: string, en: string): string {
  return locale === 'ar' ? ar : en;
}

// ─── Module chrome ──────────────────────────────────────────────────────────

export const scheduleModuleTitle = (locale: Locale) =>
  pick(locale, 'الجدول الأسبوعي', 'Weekly Schedule');

export const scheduleModuleSubtitle = (locale: Locale) =>
  pick(
    locale,
    'اسحب الحصص من القائمة إلى المربعات لبناء جدولك',
    'Drag classes from the sidebar into slots to build your week',
  );

export const backToHomeLabel = (locale: Locale) =>
  pick(locale, 'رجوع', 'Back');

export const clearWeekButtonLabel = (locale: Locale) =>
  pick(locale, 'مسح الأسبوع', 'Clear Week');

export const switchTeacherLabel = (locale: Locale) =>
  pick(locale, 'المعلم', 'Teacher');

export const localeToggleLabel = (locale: Locale) =>
  pick(locale, 'EN', 'عربي');

// ─── Day + period labels ────────────────────────────────────────────────────

export function dayLabel(day: number, locale: Locale): string {
  const ar = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const en = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  return locale === 'ar' ? ar[day] ?? '' : en[day] ?? '';
}

export function periodLabel(slot: number, locale: Locale): string {
  // P1…P7 / الحصة 1…7
  return locale === 'ar' ? `الحصة ${slot + 1}` : `P${slot + 1}`;
}

/** Tiny period label rendered in the top-start corner of each SlotCell. */
export function periodLabelShort(slot: number, locale: Locale): string {
  return locale === 'ar' ? `الحصة ${slot + 1}` : `P${slot + 1}`;
}

// ─── Subject labels ─────────────────────────────────────────────────────────

export const SUBJECT_LABELS: Record<SubjectKey, { ar: string; en: string }> = {
  math: { ar: 'الرياضيات', en: 'Math' },
  physics: { ar: 'الفيزياء', en: 'Physics' },
  chemistry: { ar: 'الكيمياء', en: 'Chemistry' },
  biology: { ar: 'الأحياء', en: 'Biology' },
  arabic: { ar: 'اللغة العربية', en: 'Arabic' },
  english: { ar: 'اللغة الإنجليزية', en: 'English' },
  history: { ar: 'التاريخ', en: 'History' },
  geography: { ar: 'الجغرافيا', en: 'Geography' },
};

export function subjectLabel(subject: SubjectKey, locale: Locale): string {
  return locale === 'ar' ? SUBJECT_LABELS[subject].ar : SUBJECT_LABELS[subject].en;
}

// ─── Chip labels ────────────────────────────────────────────────────────────

export const breakChipLabel = (locale: Locale) =>
  pick(locale, 'استراحة', 'Break');

export const classGradeSectionLabel = (
  grade: number,
  section: string,
  locale: Locale,
) => pick(locale, `الصف ${grade} - ${section}`, `G${grade}-${section}`);

// ─── Sidebar chrome ─────────────────────────────────────────────────────────

export const sidebarSectionBreakLabel = (locale: Locale) =>
  pick(locale, 'العناصر القابلة للسحب', 'Drag items');

export const sidebarSectionClassesLabel = (locale: Locale) =>
  pick(locale, 'الحصص المخصصة', 'Assigned classes');

/** Header label for the sidebar title block ("My Classes"). */
export const sidebarTitleLabel = (locale: Locale) =>
  pick(locale, 'فصولي', 'My Classes');

export const sidebarTitleSubLabel = (locale: Locale) =>
  pick(locale, 'اسحب إلى خانة في الجدول', 'Drag a chip into a slot');

/** Label for the separate "Breaks & Pauses" region. */
export const sidebarSectionPausesLabel = (locale: Locale) =>
  pick(locale, 'الاستراحات', 'Breaks & Pauses');

export const sidebarSectionPausesHint = (locale: Locale) =>
  pick(locale, 'ليست حصة — فاصل بين الحصص', 'Not a class — a gap between classes');

export const sidebarSectionPausesDropHint = (locale: Locale) =>
  pick(locale, 'اسحب بين الحصص', 'Drag between classes');

export const weeklySummaryTitle = (locale: Locale) =>
  pick(locale, 'ملخص الأسبوع', 'Weekly summary');

export const weeklySummaryFilledLabel = (
  filled: number,
  total: number,
  locale: Locale,
) => pick(locale, `${filled} من ${total} خانة`, `${filled} / ${total} slots`);

export const perClassProgressLabel = (
  placed: number,
  target: number,
  locale: Locale,
) => pick(locale, `${placed} من ${target}`, `${placed}/${target}`);

// ─── Generic button labels ──────────────────────────────────────────────────

export const confirmButtonLabel = (locale: Locale) =>
  pick(locale, 'تأكيد', 'Confirm');

export const cancelButtonLabel = (locale: Locale) =>
  pick(locale, 'إلغاء', 'Cancel');

// ─── ARIA / accessibility labels ────────────────────────────────────────────

export const weeklyQuotaAria = (locale: Locale) =>
  pick(locale, 'الحصة الأسبوعية', 'weekly quota');

export const removeSlotAria = (locale: Locale) =>
  pick(locale, 'إزالة', 'remove');

export const timeColumnHeader = (locale: Locale) =>
  pick(locale, 'الوقت', 'Time');

// ─── Confirm dialog copy per intent ─────────────────────────────────────────

export interface ConfirmCopy {
  title: string;
  body: string;
  destructive: boolean;
}

export function confirmCopyFor(
  action: PendingAction,
  locale: Locale,
  ctx: {
    className?: string;       // e.g. "Math · G5-B"
    outgoingClassName?: string;
    dayName?: string;
    periodName?: string;
    target?: number;
  } = {},
): ConfirmCopy {
  switch (action.kind) {
    case 'clearWeek':
      return {
        title: pick(locale, 'مسح كامل الأسبوع؟', 'Clear the entire week?'),
        body: pick(
          locale,
          'سيؤدي هذا إلى إزالة كل الحصص والاستراحات من الجدول. لا يمكن التراجع.',
          'This removes every class and every break from the schedule. This cannot be undone.',
        ),
        destructive: true,
      };

    case 'removeSlot':
      return {
        title: pick(locale, 'إزالة هذه الحصة؟', 'Remove this slot?'),
        body: pick(
          locale,
          `سيتم إفراغ خانة ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''}.`,
          `Slot ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''} will be emptied.`,
        ),
        destructive: true,
      };

    case 'overwriteSlot': {
      const alsoExceeds =
        'alsoExceedsQuota' in action && action.alsoExceedsQuota;
      if (alsoExceeds) {
        return {
          title: pick(
            locale,
            'استبدال وتجاوز الحصة الأسبوعية؟',
            'Overwrite and exceed weekly target?',
          ),
          body: pick(
            locale,
            `ستُستبدل ${ctx.outgoingClassName ?? 'الحصة الحالية'} بـ ${ctx.className ?? ''} في ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''}، وسيتجاوز هذا الهدف الأسبوعي (${ctx.target ?? ''}).`,
            `${ctx.outgoingClassName ?? 'Current class'} will be replaced with ${ctx.className ?? ''} at ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''}, and this exceeds the weekly target (${ctx.target ?? ''}).`,
          ),
          destructive: true,
        };
      }
      return {
        title: pick(locale, 'استبدال الحصة؟', 'Overwrite slot?'),
        body: pick(
          locale,
          `سيتم استبدال ${ctx.outgoingClassName ?? 'الحصة الحالية'} بـ ${ctx.className ?? ''} في ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''}.`,
          `${ctx.outgoingClassName ?? 'Current class'} will be replaced with ${ctx.className ?? ''} at ${ctx.dayName ?? ''} · ${ctx.periodName ?? ''}.`,
        ),
        destructive: true,
      };
    }

    case 'exceedQuota': {
      // Note: combined overwrite+quota uses the `overwriteSlot` branch with
      // `alsoExceedsQuota: true`; this branch only fires on empty slots.
      return {
        title: pick(
          locale,
          'تجاوز الحصة الأسبوعية؟',
          'Exceed weekly target?',
        ),
        body: pick(
          locale,
          `وضع ${ctx.className ?? ''} هنا سيتجاوز هدفها الأسبوعي (${ctx.target ?? ''}).`,
          `Placing ${ctx.className ?? ''} here will exceed its weekly target (${ctx.target ?? ''}).`,
        ),
        destructive: false,
      };
    }

    case 'switchTeacher':
      return {
        title: pick(locale, 'تبديل المعلم؟', 'Switch teacher?'),
        body: pick(
          locale,
          'سيتم مسح الجدول الحالي، والملف الشخصي، وقائمة المهام، واستبدال قائمة الحصص بحصص المعلم الجديد.',
          'The current week, profile, and to-do list will be cleared, and classes will be replaced with the new teacher’s classes.',
        ),
        destructive: true,
      };
  }
}

// ─── Tab labels ─────────────────────────────────────────────────────────────

export const tabScheduleLabel = (locale: Locale) =>
  pick(locale, 'الجدول', 'Schedule');

export const tabProfileLabel = (locale: Locale) =>
  pick(locale, 'الملف الشخصي', 'Profile');

export const tabTodoLabel = (locale: Locale) =>
  pick(locale, 'قائمة المهام', 'To-Do');

// ─── Profile section headers ────────────────────────────────────────────────

export const profileSectionBasicLabel = (locale: Locale) =>
  pick(locale, 'المعلومات الأساسية', 'Basic Info');

export const profileSectionContactLabel = (locale: Locale) =>
  pick(locale, 'التواصل', 'Contact');

export const profileSectionCredentialsLabel = (locale: Locale) =>
  pick(locale, 'المؤهلات', 'Credentials');

export const profileSectionPreferencesLabel = (locale: Locale) =>
  pick(locale, 'تفضيلات التدريس', 'Teaching Preferences');

export const profileSectionBasicSubtitle = (locale: Locale) =>
  pick(locale, 'صورتك ومعلوماتك الأساسية', 'Your photo and core details');

export const profileSectionContactSubtitle = (locale: Locale) =>
  pick(locale, 'كيف يمكن التواصل معك', 'How to reach you');

export const profileSectionCredentialsSubtitle = (locale: Locale) =>
  pick(locale, 'الشهادات واللغات وتاريخ التوظيف', 'Certifications, languages, and hire date');

export const profileSectionPreferencesSubtitle = (locale: Locale) =>
  pick(locale, 'أسلوبك في التدريس', 'Your teaching style');

// ─── Profile field labels ───────────────────────────────────────────────────

export const profileFieldPhotoLabel = (locale: Locale) =>
  pick(locale, 'الصورة الشخصية', 'Profile photo');

export const profileFieldChangePhotoLabel = (locale: Locale) =>
  pick(locale, 'تغيير الصورة', 'Change photo');

export const profileFieldDisplayNameArLabel = (locale: Locale) =>
  pick(locale, 'الاسم بالعربية', 'Display name (AR)');

export const profileFieldDisplayNameEnLabel = (locale: Locale) =>
  pick(locale, 'الاسم بالإنجليزية', 'Display name (EN)');

export const profileFieldExperienceLabel = (locale: Locale) =>
  pick(locale, 'سنوات الخبرة', 'Years of experience');

export const profileFieldUniversityLabel = (locale: Locale) =>
  pick(locale, 'الجامعة', 'University');

export const profileFieldMajorLabel = (locale: Locale) =>
  pick(locale, 'التخصص', 'Major');

export const profileFieldSubjectsLabel = (locale: Locale) =>
  pick(locale, 'المواد التي تدرسها', 'Subjects taught');

export const profileFieldBioLabel = (locale: Locale) =>
  pick(locale, 'نبذة عنك', 'About you');

export const profileFieldPhoneLabel = (locale: Locale) =>
  pick(locale, 'الهاتف', 'Phone');

export const profileFieldEmailLabel = (locale: Locale) =>
  pick(locale, 'البريد الإلكتروني', 'Email');

export const profileFieldOfficeHoursLabel = (locale: Locale) =>
  pick(locale, 'ساعات المكتب', 'Office hours');

export const profileFieldCertificationsLabel = (locale: Locale) =>
  pick(locale, 'الشهادات', 'Certifications');

export const profileFieldCertificationsHint = (locale: Locale) =>
  pick(locale, 'اكتب واضغط Enter للإضافة', 'Type and press Enter to add');

export const profileFieldLanguagesLabel = (locale: Locale) =>
  pick(locale, 'اللغات', 'Languages spoken');

export const profileFieldHireDateLabel = (locale: Locale) =>
  pick(locale, 'تاريخ التوظيف', 'Hire date');

export const profileFieldPreferredPeriodsLabel = (locale: Locale) =>
  pick(locale, 'الحصص المفضلة', 'Preferred periods');

export const profileFieldClassSizeLabel = (locale: Locale) =>
  pick(locale, 'حجم الفصل المفضل', 'Class size comfort');

export const profileFieldTeachingStylesLabel = (locale: Locale) =>
  pick(locale, 'أسلوب التدريس', 'Teaching style');

export const profileEditLabel = (locale: Locale) =>
  pick(locale, 'تعديل', 'Edit');

export const profileDoneLabel = (locale: Locale) =>
  pick(locale, 'تم', 'Done');

export const profilePlaceholderText = (locale: Locale, field: 'bio' | 'phone' | 'email' | 'officeHours' | 'university' | 'major' | 'addCert') => {
  const map: Record<typeof field, [string, string]> = {
    bio: ['اكتب نبذة قصيرة عن نفسك…', 'Tell us about yourself…'],
    phone: ['05xxxxxxxx', '05xxxxxxxx'],
    email: ['name@school.edu', 'name@school.edu'],
    officeHours: ['الأحد/الثلاثاء 10-12', 'Sun/Tue 10-12'],
    university: ['جامعة…', 'University…'],
    major: ['تخصص…', 'Major…'],
    addCert: ['أضف شهادة…', 'Add a certification…'],
  };
  return pick(locale, map[field][0], map[field][1]);
};

// ─── Language option labels ─────────────────────────────────────────────────

export const LANGUAGE_LABELS: Record<LanguageOption, { ar: string; en: string }> = {
  ar: { ar: 'العربية', en: 'Arabic' },
  en: { ar: 'الإنجليزية', en: 'English' },
  fr: { ar: 'الفرنسية', en: 'French' },
  es: { ar: 'الإسبانية', en: 'Spanish' },
  de: { ar: 'الألمانية', en: 'German' },
};

export function languageLabel(lang: LanguageOption, locale: Locale): string {
  return locale === 'ar' ? LANGUAGE_LABELS[lang].ar : LANGUAGE_LABELS[lang].en;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = ['ar', 'en', 'fr', 'es', 'de'];

// ─── Class-size comfort labels ──────────────────────────────────────────────

export const CLASS_SIZE_LABELS: Record<ClassSizeComfort, { ar: string; en: string }> = {
  small: { ar: 'صغير', en: 'Small' },
  medium: { ar: 'متوسط', en: 'Medium' },
  large: { ar: 'كبير', en: 'Large' },
};

export function classSizeLabel(size: ClassSizeComfort, locale: Locale): string {
  return locale === 'ar' ? CLASS_SIZE_LABELS[size].ar : CLASS_SIZE_LABELS[size].en;
}

export const CLASS_SIZE_OPTIONS: ClassSizeComfort[] = ['small', 'medium', 'large'];

// ─── Teaching-style tag labels ──────────────────────────────────────────────

export const TEACHING_STYLE_LABELS: Record<TeachingStyleTag, { ar: string; en: string }> = {
  collaborative: { ar: 'تعاوني', en: 'Collaborative' },
  lecture: { ar: 'محاضرة', en: 'Lecture-based' },
  project: { ar: 'قائم على مشاريع', en: 'Project-based' },
  flipped: { ar: 'فصل معكوس', en: 'Flipped' },
  inquiry: { ar: 'استقصائي', en: 'Inquiry-based' },
};

export function teachingStyleLabel(style: TeachingStyleTag, locale: Locale): string {
  return locale === 'ar' ? TEACHING_STYLE_LABELS[style].ar : TEACHING_STYLE_LABELS[style].en;
}

export const TEACHING_STYLE_OPTIONS: TeachingStyleTag[] = [
  'collaborative',
  'lecture',
  'project',
  'flipped',
  'inquiry',
];

// ─── To-Do copy ─────────────────────────────────────────────────────────────

export const todoTodayLabel = (locale: Locale) =>
  pick(locale, 'اليوم', 'Today');

export const todoFromScheduleLabel = (locale: Locale) =>
  pick(locale, 'من جدول اليوم', "From today's schedule");

export const todoMyTasksLabel = (locale: Locale) =>
  pick(locale, 'مهامي الخاصة', 'My tasks');

export const todoAddPlaceholder = (locale: Locale) =>
  pick(locale, 'أضف مهمة…', 'Add a to-do…');

export const todoAddButtonLabel = (locale: Locale) =>
  pick(locale, 'إضافة', 'Add');

export const todoNoClassesTodayLabel = (locale: Locale) =>
  pick(locale, 'لا حصص اليوم — استمتع بيوم إجازة', 'No classes today — enjoy your day off');

export const todoNoManualLabel = (locale: Locale) =>
  pick(locale, 'أضف مهمتك الأولى', 'Add your first task');

export const todoAutoBadgeLabel = (locale: Locale) =>
  pick(locale, 'تلقائي', 'Auto');

export const todoPrepPrefix = (locale: Locale) =>
  pick(locale, 'تحضير', 'Prep');

/** Long-form day label used by the To-Do tab header (Sun..Sat, 0..6). */
export function longDayLabel(jsDay: number, locale: Locale): string {
  const ar = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return locale === 'ar' ? ar[jsDay] ?? '' : en[jsDay] ?? '';
}
