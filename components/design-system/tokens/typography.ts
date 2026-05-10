/**
 * sq-typography tokens.
 *
 * Cairo is the brand font (already configured at root). The scale below is
 * a curated set of recipes covering display → micro. AR and EN have
 * separate leading maps because Cairo at the same size needs slightly
 * tighter leading in EN and more breathing room in AR.
 *
 * Every value is a literal Tailwind class string — JIT-safe.
 */

export type SqTypeRecipe =
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'caption'
  | 'micro'
  | 'eyebrow';

interface TypeRecipe {
  /** What this is for (designer note) */
  description: string;
  /** Size + weight (literal) */
  size: string;
  /** Tracking (letter-spacing) */
  tracking: string;
  /** Default tone color class */
  color: string;
}

export const SQ_TYPE_RECIPES: Record<SqTypeRecipe, TypeRecipe> = {
  hero: {
    description: 'Marketing-grade headline. Max once per screen.',
    size: 'text-4xl md:text-5xl font-black',
    tracking: 'tracking-tight',
    color: 'text-sq-ink',
  },
  h1: {
    description: 'Page title. One per page.',
    size: 'text-2xl md:text-3xl font-black',
    tracking: 'tracking-tight',
    color: 'text-sq-ink',
  },
  h2: {
    description: 'Section header inside a page.',
    size: 'text-xl font-black',
    tracking: 'tracking-tight',
    color: 'text-slate-900',
  },
  h3: {
    description: 'Subsection / card title.',
    size: 'text-base font-bold',
    tracking: 'tracking-normal',
    color: 'text-slate-800',
  },
  body: {
    description: 'Default reading copy.',
    size: 'text-sm font-medium',
    tracking: 'tracking-normal',
    color: 'text-slate-600',
  },
  caption: {
    description: 'Helper text under inputs, secondary descriptions.',
    size: 'text-xs font-bold',
    tracking: 'tracking-normal',
    color: 'text-slate-500',
  },
  micro: {
    description: 'Smallest reasonable text — counters, footnotes.',
    size: 'text-[10px] font-bold',
    tracking: 'tracking-wide',
    color: 'text-slate-400',
  },
  eyebrow: {
    description: 'Uppercase eyebrow label above titles.',
    size: 'text-[10px] font-bold uppercase',
    tracking: 'tracking-widest',
    color: 'text-sq-brand-500',
  },
};

/**
 * Locale-aware leading map. Cairo at smaller sizes in Arabic needs a
 * touch more breathing room because Arabic glyphs have taller diacritics.
 */
export const SQ_LEADING: Record<'ar' | 'en', Record<SqTypeRecipe, string>> = {
  ar: {
    hero:    'leading-[1.25]',
    h1:      'leading-[1.3]',
    h2:      'leading-[1.35]',
    h3:      'leading-[1.45]',
    body:    'leading-[1.7]',
    caption: 'leading-[1.6]',
    micro:   'leading-[1.5]',
    eyebrow: 'leading-[1.3]',
  },
  en: {
    hero:    'leading-[1.1]',
    h1:      'leading-[1.2]',
    h2:      'leading-[1.25]',
    h3:      'leading-[1.35]',
    body:    'leading-[1.55]',
    caption: 'leading-[1.5]',
    micro:   'leading-[1.4]',
    eyebrow: 'leading-[1.2]',
  },
};

/**
 * Compose the full class string for a recipe + locale.
 * Static-input only — pass exact recipe + 'ar'|'en' values.
 */
export function typeClass(recipe: SqTypeRecipe, locale: 'ar' | 'en'): string {
  const r = SQ_TYPE_RECIPES[recipe];
  const lead = SQ_LEADING[locale][recipe];
  return `${r.size} ${r.tracking} ${r.color} ${lead} font-cairo`;
}

/** Live-preview text the showcase uses to demonstrate each recipe. */
export const SHOWCASE_TYPE_SAMPLES: Record<'ar' | 'en', Record<SqTypeRecipe, string>> = {
  ar: {
    hero:    'أهلاً بك في String',
    h1:      'لوحة قيادة المعلم',
    h2:      'تقدّم الفصل هذا الأسبوع',
    h3:      'الوحدة الثالثة — المعادلات',
    body:    'تصميم نظام واضح يُشعر فريقك بأن كل قرار صغير قد فُكِّر فيه. ليست هذه نصاً عشوائياً — بل عينة لقياس راحة القراءة الفعلية.',
    caption: 'يُحدَّث آلياً كل ساعة',
    micro:   'آخر تحديث 09:42',
    eyebrow: 'بطاقة أساسية',
  },
  en: {
    hero:    'Welcome to String',
    h1:      'Teacher Dashboard',
    h2:      "This Week's Class Progress",
    h3:      'Unit 3 — Equations',
    body:    'A design system reads as clear when every small decision feels considered. This is not lorem — it is a real sample so you can judge the actual reading comfort.',
    caption: 'Refreshes every hour',
    micro:   'Last update 09:42',
    eyebrow: 'Primary Card',
  },
};
