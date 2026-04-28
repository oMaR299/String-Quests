// Co-located AR+EN dictionary for the Phone App onboarding flow.
// Mirrors keys in contexts/I18nContext.tsx but kept here for fast iteration —
// helpers `tp()` lookup keys with a stable shape, falling back to the I18nContext.

import { useI18n } from '../../contexts/I18nContext';

export type PhoneAppLocale = 'ar' | 'en';

export const phoneAppDict: Record<PhoneAppLocale, Record<string, string>> = {
  ar: {
    'brand.headline': 'أهلاً بك في String',
    'brand.subhead': 'نتعلم معاً، خطوة بخطوة',
    'brand.cta': 'ابدأ',

    'role.headline': 'من أنت؟',
    'role.subhead': 'اختر دورك لنخصص لك التجربة',
    'role.parent.title': 'ولي أمر',
    'role.parent.sub': 'أتابع رحلة طفلي',
    'role.student.title': 'طالب',
    'role.student.sub': 'أتعلم وأتطور',
    'role.teacher.title': 'معلم',
    'role.teacher.sub': 'أرافق طلابي',
    'role.soon': 'قريباً',

    'pain.headline': 'ما الذي يهمك أكثر؟',
    'pain.subhead': 'اختر كل ما ينطبق عليك',
    'pain.cta': 'متابعة',

    'biggest.headline': 'ما الأكثر إزعاجاً لك؟',
    'biggest.subhead': 'سنبدأ بحل هذه أولاً',
    'biggest.cta': 'هذه هي',

    'aha.headline': 'ملخص أسبوعي يصلك كل أحد',
    'aha.subhead': 'كل ما تحتاج معرفته عن رحلة طفلك في 60 ثانية',
    'aha.banner.title': 'String — الملخص الأسبوعي',
    'aha.banner.body': 'الأحد ٧:٠٠ مساءً — ملخص هذا الأسبوع لطفلك جاهز',
    'aha.topicLabel': 'موضوع للسؤال عنه',
    'aha.winLabel': 'إنجاز للاحتفال به',
    'aha.cta': 'متابعة (قريباً)',
    'aha.toast': 'بقية الخطوات قادمة قريباً',

    'back': 'رجوع',
    'mute.on': 'إلغاء كتم الصوت',
    'mute.off': 'كتم الصوت',
  },
  en: {
    'brand.headline': 'Welcome to String',
    'brand.subhead': 'We learn together, step by step',
    'brand.cta': 'Start',

    'role.headline': 'Who are you?',
    'role.subhead': 'Pick your role to personalize your experience',
    'role.parent.title': 'Parent',
    'role.parent.sub': "Following my child's journey",
    'role.student.title': 'Student',
    'role.student.sub': 'Learning and growing',
    'role.teacher.title': 'Teacher',
    'role.teacher.sub': 'Guiding my students',
    'role.soon': 'Soon',

    'pain.headline': 'What matters most to you?',
    'pain.subhead': 'Pick all that apply',
    'pain.cta': 'Continue',

    'biggest.headline': 'Which one bothers you the most?',
    'biggest.subhead': "We'll start fixing this one first",
    'biggest.cta': 'This is the one',

    'aha.headline': 'A weekly summary, every Sunday',
    'aha.subhead': 'Everything you need to know about your child in 60 seconds',
    'aha.banner.title': 'String — Weekly Summary',
    'aha.banner.body': "Sunday 7pm — Your child's weekly summary is ready",
    'aha.topicLabel': 'Topic to ask about',
    'aha.winLabel': 'Win to celebrate',
    'aha.cta': 'Continue (coming soon)',
    'aha.toast': 'The rest is on the way',

    'back': 'Back',
    'mute.on': 'Unmute',
    'mute.off': 'Mute',
  },
};

/** Hook that returns a `tp(key)` translator scoped to phoneAppOnboarding. */
export function usePhoneAppI18n() {
  const { locale, dir, toggleLocale } = useI18n();
  const tp = (key: string): string => phoneAppDict[locale][key] ?? key;
  return { locale, dir, toggleLocale, tp };
}
