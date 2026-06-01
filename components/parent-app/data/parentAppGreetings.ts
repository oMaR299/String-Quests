// parentAppGreetings.ts
// ─────────────────────────────────────────────────────────────────────────────
// Curated phrase pools for the dynamic greeting strip on Parent Home.
//
// Why this is content (not i18n strings):
//   These aren't UI labels — they're a rotating editorial pool tuned for
//   tone (warm, parental, Levantine-friendly Arabic). Editing here is the
//   right surface; i18n is for fixed labels.
//
// Tone notes (AR is source-of-truth):
//   • Warm, parental, Levantine-Jordan colored. Address the parent
//     directly with plural-respect ("بتقدر/ي" or just inclusive plural)
//     where natural. Avoid stiff MSA flourishes.
//   • No emojis — the hero photo carries the time-of-day mood; text is
//     pure prose so it stays clean and locale-neutral.
//   • Keep each phrase ≤ ~70 chars so it fits on one line on a phone.
//
// Bands (see useTimeBand.ts):
//   morning   — fresh-start energy, lessons-of-the-day vibe
//   afternoon — mid-day check-in, after-school window
//   evening   — homework / family time
//   night     — wind-down, gentle reflection
//   late      — quiet state, minimal pool by design

export type Band = 'morning' | 'afternoon' | 'evening' | 'night' | 'late';
export type Locale = 'ar' | 'en';

/**
 * Salutation lines (line 1 of the strip).
 * Render with `{name}` placeholder; the component drops the name+comma when
 * `parentName` is empty.
 */
export const SALUTATIONS: Record<Band, Record<Locale, string>> = {
  morning: {
    ar: 'صباح الخير، {name}',
    en: 'Good morning, {name}',
  },
  afternoon: {
    ar: 'مساء النور، {name}',
    en: 'Good afternoon, {name}',
  },
  evening: {
    ar: 'مساء الخير، {name}',
    en: 'Good evening, {name}',
  },
  night: {
    ar: 'مساء الخير، {name}',
    en: 'Good evening, {name}',
  },
  late: {
    ar: 'ليلة هادئة، {name}',
    en: 'Quiet night, {name}',
  },
};

/**
 * Salutations to use when no parent name is available — same vibe, no comma.
 */
export const SALUTATIONS_NO_NAME: Record<Band, Record<Locale, string>> = {
  morning: { ar: 'صباح الخير', en: 'Good morning' },
  afternoon: { ar: 'مساء النور', en: 'Good afternoon' },
  evening: { ar: 'مساء الخير', en: 'Good evening' },
  night: { ar: 'مساء الخير', en: 'Good evening' },
  late: { ar: 'ليلة هادئة', en: 'Quiet night' },
};

/**
 * Rotating phrase pools (line 2 of the strip).
 * Each band/locale should have ≥ 8 phrases, except `late` (3 — quiet state).
 */
export const PHRASES: Record<Band, Record<Locale, string[]>> = {
  morning: {
    ar: [
      'يوم جديد وفرصة جديدة لأبنائك يتعلموا شي حلو',
      'خذ نفس عميق — اليوم بيبدأ بهدوء',
      'تابع رحلة أبنائك من هون',
      'كل صباح هو بداية صغيرة، شجّعهم اليوم',
      'شوف وين وصلوا أبناؤك بدرسهم اليوم',
      'كوب قهوة وإطلالة سريعة على تقدم العيلة',
      'يلا نشوف شو في جديد عند أبنائك اليوم',
      'بدايات الصباح بترسم باقي اليوم — جاهزين؟',
      'أبناؤك بيبدأو يومهم — كن قريب منهم',
    ],
    en: [
      "A fresh day, a fresh start for your kids' learning",
      'Take a breath — the day is just beginning',
      "Catch up on your children's progress from here",
      'Every morning is a small beginning. Cheer them on today',
      "Take a quick look at what they're tackling today",
      'Coffee in hand, a quick glance at the family',
      "Let's see what's new for your kids today",
      "How a morning starts shapes the day. Ready?",
      'Your kids are starting their day — be close',
    ],
  },
  afternoon: {
    ar: [
      'انتهى الدوام تقريباً — شوف شو أنجزوا أبناؤك',
      'لحظة هدوء وسط النهار، نطل على إنجازاتهم',
      'مدرسة، دروس، طاقة — كله يستحق متابعة سريعة',
      'هلا وقت مناسب تعرف شو صار اليوم',
      'بعد الظهر هو فرصة لتشجيعهم على الباقي',
      'كل درس بيخلصوه خطوة قدّام، شوف وين وصلوا',
      'بسطّة سريعة على يوم أبنائك — كل التفاصيل هون',
      'وقت الغداء، وقت نطل على أبناءك',
      'النهار لسه بيمشي — والتعلم كمان',
    ],
    en: [
      "School day's almost done — see what they got through",
      "A quiet midday moment to peek at their wins",
      'School, lessons, energy — worth a quick check-in',
      'A nice time to see how the day went',
      'Afternoon is a great window to cheer them on',
      "Each lesson is a step forward. See where they're at",
      "A quick map of your kids' day — all the details here",
      "Lunchtime — a moment to look in on the kids",
      'The day rolls on, and so does the learning',
    ],
  },
  evening: {
    ar: [
      'وقت الواجبات — مين بيحتاج دعم اليوم؟',
      'العيلة قاعدة سوا — حلو وقت تتابع تقدّمهم',
      'بعد العشا، جلسة قصيرة مع أبنائك بتفرق',
      'دقايق معهم اليوم بتعمل فرق كبير بكرة',
      'شوف نقاط القوة وشجّعهم عليها قبل النوم',
      'وقت ذهبي تسأل عن درس اليوم وتحتفلوا فيه',
      'مساء عيلتك يستاهل لمسة دفء — ابدأ من هون',
      'تقدّم اليوم بإيد أبنائك — وأنت بتشاركهم الفرحة',
      'لحظة بسيطة معهم اليوم تثبّت اللي تعلموه',
    ],
    en: [
      'Homework hour — who needs a hand today?',
      'Family time — a great moment to follow their progress',
      'After dinner, a short chat with your kids goes a long way',
      'A few minutes with them today makes a big difference tomorrow',
      "See their strengths and celebrate them before bed",
      'A golden window to ask about a lesson and cheer it on',
      'Your family evening deserves a warm touch. Start here',
      "Today's progress is theirs — you share the joy",
      'A small moment with them today locks in what they learned',
    ],
  },
  night: {
    ar: [
      'يوم تاني خلص بسلام — شوف ملخص إنجازاتهم',
      'قبل النوم، نظرة قصيرة على رحلة أبنائك اليوم',
      'لحظات الليل بتلم العيلة — احتفلوا بأي تقدم',
      'النوم بيرسّخ التعلم — بكرة بيقدروا أكتر',
      'كل ليلة هي فرصة شكر صغيرة لأبنائك',
      'شوف الإنجازات الحلوة قبل ما تطفي الضو',
      'يوم حلو بيستاهل ابتسامة قبل النوم',
      'دقايق هاي الليلة بتزرع ثقة بكرة',
    ],
    en: [
      "Another day done well — here's a quick summary",
      "Before bed, a short look at your kids' day",
      'Nights pull family together — celebrate any progress',
      'Sleep locks in learning — tomorrow they can do more',
      'Every night is a small thank-you to your kids',
      'A peek at the wins before lights-out',
      'A good day deserves a smile before bed',
      "Tonight's minutes plant tomorrow's confidence",
    ],
  },
  late: {
    ar: [
      'الوقت متأخر — كل شي بيستنى للصبح',
      'نوم هاني، أبناؤك بأمان',
      'استريح — التفاصيل بكرة',
    ],
    en: [
      "It's getting late — everything can wait for morning",
      'Rest well — your kids are safe',
      "Take it easy — details can wait until tomorrow",
    ],
  },
};

/** Compact helper: returns the salutation template for a band+locale, with or
 *  without name. */
export function getSalutationTemplate(
  band: Band,
  locale: Locale,
  hasName: boolean
): string {
  return hasName ? SALUTATIONS[band][locale] : SALUTATIONS_NO_NAME[band][locale];
}
