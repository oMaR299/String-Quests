/**
 * sq-color tokens — String-Quests design system.
 *
 * Brand: violet (mapped to Tailwind `sq-brand-*`). The `sq-*` prefix
 * coexists with `duo-*`, `phone-*`, and `pastel-*` — it does NOT
 * replace them. New modules opt in by importing from this file.
 *
 * Every value here is a hex literal AND a literal Tailwind class
 * string. Static lookup maps only — never composed at runtime.
 */

export type SqColorScale = '50' | '100' | '500' | '600' | '700';
export type SqSemantic = 'success' | 'warning' | 'danger' | 'info';

/* ─── Hex literals (for swatches, chart inks, raw color refs) ─────────── */

export const SQ_COLOR_HEX = {
  brand: {
    '50':  '#F5F3FF',
    '100': '#EDE9FE',
    '500': '#8B5CF6',
    '600': '#7C3AED',
    '700': '#6D28D9',
  },
  success: {
    '50':  '#ECFDF5',
    '500': '#10B981',
    '600': '#059669',
  },
  warning: {
    '50':  '#FFFBEB',
    '500': '#F59E0B',
    '600': '#D97706',
  },
  danger: {
    '50':  '#FFF1F2',
    '500': '#F43F5E',
    '600': '#E11D48',
  },
  info: {
    '50':  '#F0F9FF',
    '500': '#0EA5E9',
    '600': '#0284C7',
  },
  neutral: {
    ink:    '#0F172A', // slate-900 — body text
    stone:  '#94A3B8', // slate-400 — secondary text
    cloud:  '#F8FAFC', // slate-50 — page wash
    fog:    '#E2E8F0', // slate-200 — hairline borders
    pearl:  '#F1F5F9', // slate-100 — chip / soft fill
  },
} as const;

/* ─── Tailwind class lookup maps (literal strings — JIT-safe) ─────────── */

export const SQ_BG_CLASS = {
  'brand-50':   'bg-sq-brand-50',
  'brand-100':  'bg-sq-brand-100',
  'brand-500':  'bg-sq-brand-500',
  'brand-600':  'bg-sq-brand-600',
  'brand-700':  'bg-sq-brand-700',
  'success-50':  'bg-sq-success-50',
  'success-500': 'bg-sq-success-500',
  'success-600': 'bg-sq-success-600',
  'warning-50':  'bg-sq-warning-50',
  'warning-500': 'bg-sq-warning-500',
  'warning-600': 'bg-sq-warning-600',
  'danger-50':   'bg-sq-danger-50',
  'danger-500':  'bg-sq-danger-500',
  'danger-600':  'bg-sq-danger-600',
  'info-50':     'bg-sq-info-50',
  'info-500':    'bg-sq-info-500',
  'info-600':    'bg-sq-info-600',
  ink:    'bg-sq-ink',
  stone:  'bg-sq-stone',
  cloud:  'bg-sq-cloud',
} as const;

export const SQ_TEXT_CLASS = {
  'brand-500':  'text-sq-brand-500',
  'brand-600':  'text-sq-brand-600',
  'brand-700':  'text-sq-brand-700',
  'success-600': 'text-sq-success-600',
  'success-700': 'text-sq-success-700',
  'warning-600': 'text-sq-warning-600',
  'warning-700': 'text-sq-warning-700',
  'danger-600':  'text-sq-danger-600',
  'danger-700':  'text-sq-danger-700',
  'info-600':    'text-sq-info-600',
  'info-700':    'text-sq-info-700',
  ink:   'text-sq-ink',
  stone: 'text-sq-stone',
} as const;

export const SQ_BORDER_CLASS = {
  'brand-200':   'border-sq-brand-200',
  'brand-500':   'border-sq-brand-500',
  'success-200': 'border-sq-success-200',
  'warning-200': 'border-sq-warning-200',
  'danger-200':  'border-sq-danger-200',
  'info-200':    'border-sq-info-200',
} as const;

/* ─── Gradient pairs ──────────────────────────────────────────────────── */

export interface SqGradient {
  id: string;
  /** Display name */
  name: string;
  /** Tailwind class string (literal) */
  className: string;
  /** Two-stop hex pair (for SVG / canvas / direct CSS) */
  stops: [string, string];
}

/**
 * Curated gradient pairs. Tailwind class strings are static literals so
 * the JIT scans them — DO NOT compose with template literals.
 */
export const SQ_GRADIENTS: SqGradient[] = [
  {
    id: 'brand',
    name: 'Brand',
    className: 'bg-gradient-to-br from-violet-500 to-purple-600',
    stops: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 'sky',
    name: 'Sky',
    className: 'bg-gradient-to-br from-sky-500 to-blue-600',
    stops: ['#0EA5E9', '#2563EB'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    className: 'bg-gradient-to-br from-amber-400 to-orange-500',
    stops: ['#FBBF24', '#F97316'],
  },
  {
    id: 'mint',
    name: 'Mint',
    className: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    stops: ['#10B981', '#0D9488'],
  },
  {
    id: 'rose',
    name: 'Rose',
    className: 'bg-gradient-to-br from-rose-500 to-pink-600',
    stops: ['#F43F5E', '#DB2777'],
  },
  {
    id: 'graphite',
    name: 'Graphite',
    className: 'bg-gradient-to-br from-slate-500 to-slate-700',
    stops: ['#64748B', '#334155'],
  },
];

/* ─── Tone tokens (informational accents — NOT role-based) ────────────── */
/**
 * A neutral "accent palette" — these are simply the tone names that the
 * existing `sectionTones.ts` already proves useful. The design system
 * surfaces them so new components can adopt the same hue language without
 * re-inventing the SectionCard tone map.
 *
 * NOTE: This is NOT role-based theming — every consumer can pick any tone.
 */
export const SQ_TONE_IDS = ['brand', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
export type SqTone = (typeof SQ_TONE_IDS)[number];

export interface SqToneTokens {
  /** Soft background (50) */
  softBg: string;
  /** Solid fill (500) */
  solidBg: string;
  /** Border (200) */
  border: string;
  /** Strong text (700) */
  text: string;
  /** Eyebrow text (500) — small uppercase label */
  eyebrow: string;
  /** Gradient (br) */
  gradient: string;
  /** Drop shadow color (matches the tone) */
  shadow: string;
}

export const SQ_TONES: Record<SqTone, SqToneTokens> = {
  brand: {
    softBg:   'bg-sq-brand-50',
    solidBg:  'bg-sq-brand-500',
    border:   'border-sq-brand-200',
    text:     'text-sq-brand-700',
    eyebrow:  'text-sq-brand-500',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    shadow:   'shadow-md shadow-violet-500/25',
  },
  success: {
    softBg:   'bg-sq-success-50',
    solidBg:  'bg-sq-success-500',
    border:   'border-sq-success-200',
    text:     'text-sq-success-700',
    eyebrow:  'text-sq-success-600',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    shadow:   'shadow-md shadow-emerald-500/25',
  },
  warning: {
    softBg:   'bg-sq-warning-50',
    solidBg:  'bg-sq-warning-500',
    border:   'border-sq-warning-200',
    text:     'text-sq-warning-700',
    eyebrow:  'text-sq-warning-600',
    gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    shadow:   'shadow-md shadow-amber-500/25',
  },
  danger: {
    softBg:   'bg-sq-danger-50',
    solidBg:  'bg-sq-danger-500',
    border:   'border-sq-danger-200',
    text:     'text-sq-danger-700',
    eyebrow:  'text-sq-danger-600',
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    shadow:   'shadow-md shadow-rose-500/25',
  },
  info: {
    softBg:   'bg-sq-info-50',
    solidBg:  'bg-sq-info-500',
    border:   'border-sq-info-200',
    text:     'text-sq-info-700',
    eyebrow:  'text-sq-info-600',
    gradient: 'bg-gradient-to-br from-sky-500 to-blue-600',
    shadow:   'shadow-md shadow-sky-500/25',
  },
  neutral: {
    softBg:   'bg-slate-100',
    solidBg:  'bg-slate-600',
    border:   'border-slate-200',
    text:     'text-slate-700',
    eyebrow:  'text-slate-500',
    gradient: 'bg-gradient-to-br from-slate-500 to-slate-700',
    shadow:   'shadow-md shadow-slate-500/25',
  },
};

/** Convenience: full hex listing for the showcase swatch grid. */
export const SQ_SWATCH_GROUPS: Array<{
  id: string;
  label: string;
  swatches: Array<{ token: string; hex: string; bgClass: string; textOnLight?: boolean }>;
}> = [
  {
    id: 'brand',
    label: 'Brand',
    swatches: [
      { token: 'sq-brand-50',  hex: '#F5F3FF', bgClass: 'bg-sq-brand-50',  textOnLight: true },
      { token: 'sq-brand-100', hex: '#EDE9FE', bgClass: 'bg-sq-brand-100', textOnLight: true },
      { token: 'sq-brand-500', hex: '#8B5CF6', bgClass: 'bg-sq-brand-500' },
      { token: 'sq-brand-600', hex: '#7C3AED', bgClass: 'bg-sq-brand-600' },
      { token: 'sq-brand-700', hex: '#6D28D9', bgClass: 'bg-sq-brand-700' },
    ],
  },
  {
    id: 'semantic',
    label: 'Semantic',
    swatches: [
      { token: 'sq-success-500', hex: '#10B981', bgClass: 'bg-sq-success-500' },
      { token: 'sq-success-600', hex: '#059669', bgClass: 'bg-sq-success-600' },
      { token: 'sq-warning-500', hex: '#F59E0B', bgClass: 'bg-sq-warning-500' },
      { token: 'sq-warning-600', hex: '#D97706', bgClass: 'bg-sq-warning-600' },
      { token: 'sq-danger-500',  hex: '#F43F5E', bgClass: 'bg-sq-danger-500'  },
      { token: 'sq-danger-600',  hex: '#E11D48', bgClass: 'bg-sq-danger-600'  },
      { token: 'sq-info-500',    hex: '#0EA5E9', bgClass: 'bg-sq-info-500'    },
      { token: 'sq-info-600',    hex: '#0284C7', bgClass: 'bg-sq-info-600'    },
    ],
  },
  {
    id: 'neutral',
    label: 'Neutral',
    swatches: [
      { token: 'sq-cloud',  hex: '#F8FAFC', bgClass: 'bg-sq-cloud',  textOnLight: true },
      { token: 'slate-100', hex: '#F1F5F9', bgClass: 'bg-slate-100', textOnLight: true },
      { token: 'slate-200', hex: '#E2E8F0', bgClass: 'bg-slate-200', textOnLight: true },
      { token: 'sq-stone',  hex: '#94A3B8', bgClass: 'bg-sq-stone' },
      { token: 'slate-500', hex: '#64748B', bgClass: 'bg-slate-500' },
      { token: 'slate-700', hex: '#334155', bgClass: 'bg-slate-700' },
      { token: 'sq-ink',    hex: '#0F172A', bgClass: 'bg-sq-ink'    },
    ],
  },
];
