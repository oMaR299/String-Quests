// parentOnboardingI18n.ts
// ─────────────────────────────────────────────────────────────────────────────
// Co-located bilingual dict for the Parent Onboarding flow. AR is source-of-
// truth (Levantine / Jordan dialect — "هاتف", not "جوال"); EN mirrors it.
// Keys are flat under the `parentOnboarding.*` namespace and the screens
// consume them through the local `t()` helper returned by
// `useParentOnboardingI18n()`.
//
// These strings are *also* mirrored into `contexts/I18nContext.tsx` so any
// other module in the app can read them through the global `useI18n().t()`.
// We keep the local dict for fast iteration during this v1 build — editing
// strings here is a single-file change and doesn't disturb the global context.
//
// Copy principles applied here:
//   • Benefit-first headlines (what does the parent get?).
//   • Anticipate anxiety in microcopy ("safe", "in seconds").
//   • Action-led, first-person CTAs where natural ("أرسل لي الرمز").
//   • Short sentences, no jargon, no filler.
//   • "هاتف" (Levantine) — Jordan is the home market.

export type Locale = 'ar' | 'en';

export const parentOnboardingI18n: Record<Locale, Record<string, string>> = {
  ar: {
    'parentOnboarding.localeToggle.ar': 'عربي',
    'parentOnboarding.localeToggle.en': 'English',
    'parentOnboarding.back': 'رجوع',

    // Step 3 — Phone
    'parentOnboarding.phone.title': 'ما رقم هاتفك؟',
    'parentOnboarding.phone.subtitle': 'نرسل لك رمز التأكيد على واتساب — يصل خلال ثوانٍ',
    'parentOnboarding.phone.viaWhatsapp': 'عبر واتساب',
    'parentOnboarding.phone.numberLabel': 'رقم الهاتف',
    'parentOnboarding.phone.countryLabel': 'الدولة',
    // Country-dynamic helper. Use interpolate() with { digits, country }.
    'parentOnboarding.phone.helperGeneric': 'أدخل {digits} أرقام لرقم هاتفك في {country}',
    'parentOnboarding.phone.cta': 'أرسل لي الرمز',
    'parentOnboarding.phone.ctaSending': 'جارٍ الإرسال...',
    'parentOnboarding.phone.reassurance':
      'رقمك آمن. نستخدمه فقط لربط حسابك بأبنائك على String.',

    // Step 4 — OTP
    'parentOnboarding.otp.title': 'أدخل الرمز',
    'parentOnboarding.otp.subtitle': 'أرسلنا رمزاً مكوناً من 6 أرقام عبر واتساب إلى',
    'parentOnboarding.otp.viaWhatsapp': 'وصلك على واتساب',
    'parentOnboarding.otp.cta': 'تأكيد',
    'parentOnboarding.otp.change': 'تغيير',
    'parentOnboarding.otp.didntGet': 'لم يصلك الرمز؟',
    'parentOnboarding.otp.resendIn': 'إعادة الإرسال خلال {seconds} ثانية',
    'parentOnboarding.otp.resendNow': 'إعادة إرسال الرمز',
    'parentOnboarding.otp.verifying': 'جارٍ التحقق...',

    // Step 5 — Connect child
    'parentOnboarding.connect.title': 'اربط حساب طفلك بـ String',
    'parentOnboarding.connect.subtitle':
      'امسح الرمز من تطبيق طفلك أو من ورقة الدعوة',
    'parentOnboarding.connect.scanLabel': 'امسح رمز QR',
    'parentOnboarding.connect.scanHint': 'وجّه الكاميرا نحو الرمز',
    'parentOnboarding.connect.scanCta': 'افتح الكاميرا',
    'parentOnboarding.connect.scanning': 'جارٍ المسح...',
    'parentOnboarding.connect.divider': 'أو',
    'parentOnboarding.connect.codeTitle': 'أو أدخل الرمز يدوياً',
    'parentOnboarding.connect.codePlaceholder': 'الرمز من ورقة الدعوة',
    'parentOnboarding.connect.codeHelper': 'الرمز مكوّن من 6 خانات على الأقل',
    'parentOnboarding.connect.codeCta': 'تابع',
    'parentOnboarding.connect.linking': 'جارٍ الربط...',
    'parentOnboarding.connect.linkedToast': 'تم ربط {name}',

    // Step 6 — Children list
    'parentOnboarding.list.title': 'أبناؤك على String',
    'parentOnboarding.list.subtitle': 'يمكنك ربط المزيد لاحقاً من الإعدادات',
    'parentOnboarding.list.linkedTag': 'مرتبط',
    'parentOnboarding.list.removeAria': 'إلغاء الربط',
    'parentOnboarding.list.addAnother': 'إضافة طفل آخر',
    'parentOnboarding.list.cta': 'ابدأ',
    'parentOnboarding.list.doneToast': 'كل شيء جاهز',
    'parentOnboarding.list.removeTitle': 'إلغاء ربط {name}؟',
    'parentOnboarding.list.removeBody': 'يمكنك ربط حسابه مرة أخرى في أي وقت.',
    'parentOnboarding.list.removeConfirm': 'إلغاء الربط',
    'parentOnboarding.list.removeCancel': 'تراجع',
  },
  en: {
    'parentOnboarding.localeToggle.ar': 'عربي',
    'parentOnboarding.localeToggle.en': 'English',
    'parentOnboarding.back': 'Back',

    // Step 3 — Phone
    'parentOnboarding.phone.title': "What's your phone number?",
    'parentOnboarding.phone.subtitle':
      "We'll send your code on WhatsApp — arrives in seconds",
    'parentOnboarding.phone.viaWhatsapp': 'via WhatsApp',
    'parentOnboarding.phone.numberLabel': 'Phone number',
    'parentOnboarding.phone.countryLabel': 'Country',
    'parentOnboarding.phone.helperGeneric':
      'Enter your {digits}-digit phone number for {country}',
    'parentOnboarding.phone.cta': 'Send my code',
    'parentOnboarding.phone.ctaSending': 'Sending...',
    'parentOnboarding.phone.reassurance':
      'Your number is safe — used only to connect you to your children.',

    // Step 4 — OTP
    'parentOnboarding.otp.title': 'Enter the code',
    'parentOnboarding.otp.subtitle': 'We sent a 6-digit code via WhatsApp to',
    'parentOnboarding.otp.viaWhatsapp': 'sent on WhatsApp',
    'parentOnboarding.otp.cta': 'Confirm',
    'parentOnboarding.otp.change': 'Change',
    'parentOnboarding.otp.didntGet': "Didn't get the code?",
    'parentOnboarding.otp.resendIn': 'Resend in {seconds}s',
    'parentOnboarding.otp.resendNow': 'Resend code',
    'parentOnboarding.otp.verifying': 'Verifying...',

    // Step 5 — Connect child
    'parentOnboarding.connect.title': 'Connect your child to String',
    'parentOnboarding.connect.subtitle':
      "Scan the code from your child's app or the school's invite paper",
    'parentOnboarding.connect.scanLabel': 'Scan QR code',
    'parentOnboarding.connect.scanHint': 'Point the camera at the code',
    'parentOnboarding.connect.scanCta': 'Open camera',
    'parentOnboarding.connect.scanning': 'Scanning...',
    'parentOnboarding.connect.divider': 'or',
    'parentOnboarding.connect.codeTitle': 'Or enter it manually',
    'parentOnboarding.connect.codePlaceholder': 'Code from the invite paper',
    'parentOnboarding.connect.codeHelper': 'Codes are at least 6 characters',
    'parentOnboarding.connect.codeCta': 'Continue',
    'parentOnboarding.connect.linking': 'Linking...',
    'parentOnboarding.connect.linkedToast': '{name} linked',

    // Step 6 — Children list
    'parentOnboarding.list.title': 'Your children on String',
    'parentOnboarding.list.subtitle': 'You can link more later from settings',
    'parentOnboarding.list.linkedTag': 'Linked',
    'parentOnboarding.list.removeAria': 'Unlink',
    'parentOnboarding.list.addAnother': 'Add another child',
    'parentOnboarding.list.cta': "Let's go",
    'parentOnboarding.list.doneToast': "You're all set",
    'parentOnboarding.list.removeTitle': 'Unlink {name}?',
    'parentOnboarding.list.removeBody': 'You can reconnect their account anytime.',
    'parentOnboarding.list.removeConfirm': 'Unlink',
    'parentOnboarding.list.removeCancel': 'Cancel',
  },
};

/**
 * Resolve a key against the active locale. If no value is found, the key
 * itself is returned (matches the global I18nContext fallback).
 */
export function getParentOnboardingString(locale: Locale, key: string): string {
  return parentOnboardingI18n[locale][key] ?? key;
}

/**
 * Tiny string-template helper. Replaces `{name}` style placeholders with the
 * matching value from `vars`. Missing placeholders are left untouched.
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}
