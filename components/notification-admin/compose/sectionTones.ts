/**
 * sectionTones
 *
 * Single source of truth for the per-section color identity that ties the
 * three integrated features together (SectionCard, AnchoringRail, click-flash).
 *
 * Each section id (e.g. 'section-content') maps to a `SectionTone` token
 * (e.g. 'violet') and exposes the literal Tailwind class strings for every
 * surface where that tone is rendered:
 *
 *   - card flash ring (when the rail jumps the form to that section)
 *   - rail active dot bg + halo (vertical desktop rail)
 *   - rail active pill bg + shadow (horizontal mobile pill bar)
 *   - completion check icon for the rail
 *   - SectionCard "complete" status pill
 *
 * Every class string is a complete literal so Tailwind v4's JIT picks them up.
 * DO NOT compose them with template literals or runtime concatenation.
 */
import type { SectionTone } from './SectionCard';

export type { SectionTone };

interface SectionToneTokens {
  /** The tone token (mirrors the SectionCard `tone` prop). */
  tone: SectionTone;
  /** Card flash ring class — applied while the section is "landing" after a jump. */
  flashRing: string;
  /** Vertical rail: active dot fill + soft halo (full literal, no concat). */
  railDot: string;
  /** Vertical rail: morphing halo behind the active dot. */
  railDotHalo: string;
  /** Vertical rail: tiny icon color when active. */
  railIconActive: string;
  /** Horizontal pill bar: pill background + shadow when active. */
  pillBg: string;
  /** Horizontal pill bar: completion check inset chip on a non-active pill. */
  pillCheckBg: string;
  /** Rail completion check (vertical rail) — bg of the small circle. */
  checkBg: string;
  /** Card complete-pill background. */
  completePillBg: string;
  /** Card complete-pill border. */
  completePillBorder: string;
  /** Card complete-pill text. */
  completePillText: string;
  /** Card complete-pill check circle bg. */
  completePillCheckBg: string;
}

/**
 * Section id → tone mapping.
 * The id strings match the `id` attribute on each SectionCard wrapper in
 * ComposeNotification.tsx, and the `id` field on each AnchoringRailSection.
 */
export const SECTION_TONE_BY_ID: Record<string, SectionTone> = {
  'section-content': 'violet',
  'section-channels': 'blue',
  'section-priority': 'amber',
  'section-audience': 'emerald',
  'section-schedule': 'rose',
  'section-form': 'slate',
};

/**
 * Tone token → literal class strings.
 * Tailwind v4 JIT-safe: every value is a complete literal.
 */
export const SECTION_TONE_TOKENS: Record<SectionTone, SectionToneTokens> = {
  violet: {
    tone: 'violet',
    flashRing: 'ring-2 ring-violet-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-violet-500 shadow-[0_0_0_3px_rgba(167,139,250,0.22)]',
    railDotHalo: 'bg-violet-500/15',
    railIconActive: 'text-violet-600',
    pillBg: 'bg-violet-500 shadow-sm shadow-violet-500/30',
    pillCheckBg: 'bg-violet-500',
    checkBg: 'bg-violet-500 shadow-sm shadow-violet-500/30',
    completePillBg: 'bg-violet-50',
    completePillBorder: 'border-violet-200',
    completePillText: 'text-violet-700',
    completePillCheckBg: 'bg-violet-500',
  },
  blue: {
    tone: 'blue',
    flashRing: 'ring-2 ring-sky-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-sky-500 shadow-[0_0_0_3px_rgba(125,211,252,0.28)]',
    railDotHalo: 'bg-sky-500/15',
    railIconActive: 'text-sky-600',
    pillBg: 'bg-sky-500 shadow-sm shadow-sky-500/30',
    pillCheckBg: 'bg-sky-500',
    checkBg: 'bg-sky-500 shadow-sm shadow-sky-500/30',
    completePillBg: 'bg-sky-50',
    completePillBorder: 'border-sky-200',
    completePillText: 'text-sky-700',
    completePillCheckBg: 'bg-sky-500',
  },
  amber: {
    tone: 'amber',
    flashRing: 'ring-2 ring-amber-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-amber-500 shadow-[0_0_0_3px_rgba(252,211,77,0.30)]',
    railDotHalo: 'bg-amber-500/15',
    railIconActive: 'text-amber-600',
    pillBg: 'bg-amber-500 shadow-sm shadow-amber-500/30',
    pillCheckBg: 'bg-amber-500',
    checkBg: 'bg-amber-500 shadow-sm shadow-amber-500/30',
    completePillBg: 'bg-amber-50',
    completePillBorder: 'border-amber-200',
    completePillText: 'text-amber-700',
    completePillCheckBg: 'bg-amber-500',
  },
  emerald: {
    tone: 'emerald',
    flashRing: 'ring-2 ring-emerald-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(110,231,183,0.28)]',
    railDotHalo: 'bg-emerald-500/15',
    railIconActive: 'text-emerald-600',
    pillBg: 'bg-emerald-500 shadow-sm shadow-emerald-500/30',
    pillCheckBg: 'bg-emerald-500',
    checkBg: 'bg-emerald-500 shadow-sm shadow-emerald-500/30',
    completePillBg: 'bg-emerald-50',
    completePillBorder: 'border-emerald-200',
    completePillText: 'text-emerald-700',
    completePillCheckBg: 'bg-emerald-500',
  },
  rose: {
    tone: 'rose',
    flashRing: 'ring-2 ring-rose-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-rose-500 shadow-[0_0_0_3px_rgba(251,113,133,0.28)]',
    railDotHalo: 'bg-rose-500/15',
    railIconActive: 'text-rose-600',
    pillBg: 'bg-rose-500 shadow-sm shadow-rose-500/30',
    pillCheckBg: 'bg-rose-500',
    checkBg: 'bg-rose-500 shadow-sm shadow-rose-500/30',
    completePillBg: 'bg-rose-50',
    completePillBorder: 'border-rose-200',
    completePillText: 'text-rose-700',
    completePillCheckBg: 'bg-rose-500',
  },
  slate: {
    tone: 'slate',
    flashRing: 'ring-2 ring-slate-400/45 ring-offset-2 ring-offset-slate-50',
    railDot: 'bg-slate-600 shadow-[0_0_0_3px_rgba(148,163,184,0.28)]',
    railDotHalo: 'bg-slate-500/15',
    railIconActive: 'text-slate-700',
    pillBg: 'bg-slate-600 shadow-sm shadow-slate-500/30',
    pillCheckBg: 'bg-slate-600',
    checkBg: 'bg-slate-600 shadow-sm shadow-slate-500/30',
    completePillBg: 'bg-slate-100',
    completePillBorder: 'border-slate-200',
    completePillText: 'text-slate-700',
    completePillCheckBg: 'bg-slate-600',
  },
};

/** Returns the tone tokens for a given section id (falls back to violet). */
export function getSectionToneTokens(sectionId: string): SectionToneTokens {
  const tone = SECTION_TONE_BY_ID[sectionId] ?? 'violet';
  return SECTION_TONE_TOKENS[tone];
}

/** Returns just the tone token (e.g. 'violet') for a given section id. */
export function getSectionTone(sectionId: string): SectionTone {
  return SECTION_TONE_BY_ID[sectionId] ?? 'violet';
}
