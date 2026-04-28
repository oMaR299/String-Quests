/**
 * Shared preview-focus utilities for the live notification preview panel.
 *
 * The compose form (ContentEditor) reports which field is focused; the preview
 * channels react with a soft pulse on the matching line, a mirrored caret, and
 * live character-count badges. All values here are static so Tailwind's JIT
 * picks them up.
 */

import type * as React from 'react';

export type FocusField =
  | 'title'
  | 'shortMessage'
  | 'body'
  | 'imageUrl'
  | 'ctaButton'
  | null;

/** Recommended lengths per channel/field, in characters. */
export const RECOMMENDED_LENGTHS = {
  bell: { title: 40, shortMessage: 80 },
  popup: { title: 60, body: 240 },
  banner: { shortMessage: 50 },
  email: { title: 70, shortMessage: 120 },
} as const;

/**
 * Static color map for character-count badges.
 * Tailwind v4 JIT requires literal class strings, so all combinations live here.
 *
 *   - safe   (< 80% of limit): green
 *   - near   (80–100%):       amber
 *   - over   (> 100%):        red
 */
export const COUNT_BADGE_CLASS: Record<'safe' | 'near' | 'over', string> = {
  safe: 'bg-emerald-50/95 text-emerald-700 ring-1 ring-emerald-200',
  near: 'bg-amber-50/95 text-amber-700 ring-1 ring-amber-200',
  over: 'bg-red-50/95 text-red-700 ring-1 ring-red-200',
};

export function getCountTone(length: number, limit: number): 'safe' | 'near' | 'over' {
  if (length > limit) return 'over';
  if (length >= Math.floor(limit * 0.8)) return 'near';
  return 'safe';
}

/**
 * Stable swap key for content blocks.
 *
 * We don't want to remount on every keystroke (jittery), but we do want a
 * subtle cross-fade when the user pastes or clears a field. Strategy:
 *
 *   - empty / non-empty boundary always re-keys (placeholder ↔ live value)
 *   - meaningful chunked changes re-key (every 8-char tier or first/last 8 char delta)
 *
 * Within the same chunk-tier, only the text node updates — no remount.
 */
export function getSwapKey(value: string): string {
  if (!value) return 'empty';
  // Chunk by tens — re-keys when length crosses a 10-char boundary.
  const tier = Math.floor(value.length / 10);
  // Capture first/last 4 chars so meaningful edits (not just appends) re-key too.
  const head = value.slice(0, 4);
  const tail = value.slice(-4);
  return `f:${head}|t:${tail}|n:${tier}`;
}

/* ─── Channel-aware focus pulse ────────────────────────────────────────
 *
 * The heartbeat pulse on the focused field used to be hard-coded violet on
 * every channel preview. We now key the pulse colour to the channel so the
 * focal point reads as "you're touching the channel that uses this colour":
 *
 *   - bell    → sky (matches the bell badge / topbar accent)
 *   - banner  → derived from the live banner gradient
 *   - popup   → derived from the live banner gradient (popup uses the
 *               banner gradient for its top stripe + CTA, so it tracks)
 *   - email   → indigo (matches a generic mail-client accent that doesn't
 *               clash with the inbox row's sky tint)
 *
 * Each entry is a literal RGBA so we can interpolate it into the box-shadow
 * keyframe. The static-ring fallback (reduced motion) uses the same colour.
 * ──────────────────────────────────────────────────────────────────── */

interface PulseColors {
  /** RGBA used inside box-shadow keyframes (must include alpha). */
  rgba: string;
  /** Caret-mirror & static-ring colour (Tailwind class for the caret bar). */
  caretClass: string;
}

const PULSE_COLOR_BY_TONE: Record<string, PulseColors> = {
  // Default: the original violet.
  violet: { rgba: '139,92,246', caretClass: 'bg-purple-500' },
  sky: { rgba: '14,165,233', caretClass: 'bg-sky-500' },
  blue: { rgba: '59,130,246', caretClass: 'bg-blue-500' },
  emerald: { rgba: '16,185,129', caretClass: 'bg-emerald-500' },
  amber: { rgba: '245,158,11', caretClass: 'bg-amber-500' },
  rose: { rgba: '244,63,94', caretClass: 'bg-rose-500' },
  pink: { rgba: '236,72,153', caretClass: 'bg-pink-500' },
  red: { rgba: '239,68,68', caretClass: 'bg-red-500' },
  indigo: { rgba: '99,102,241', caretClass: 'bg-indigo-500' },
  fuchsia: { rgba: '217,70,239', caretClass: 'bg-fuchsia-500' },
  teal: { rgba: '20,184,166', caretClass: 'bg-teal-500' },
  cyan: { rgba: '6,182,212', caretClass: 'bg-cyan-500' },
  slate: { rgba: '100,116,139', caretClass: 'bg-slate-500' },
};

/**
 * Best-effort: pick the dominant colour out of a Tailwind banner gradient
 * class string like `from-sky-400 to-blue-500`. Returns the matching tone
 * key (or 'violet' as a soft fallback). The match is by simple substring
 * because the input strings are admin-picked Tailwind literals, not
 * arbitrary text.
 */
function tonefromGradient(gradient?: string): keyof typeof PULSE_COLOR_BY_TONE {
  if (!gradient) return 'violet';
  const g = gradient.toLowerCase();
  // Order matters: prefer the rarer/more saturated colour.
  if (g.includes('rose')) return 'rose';
  if (g.includes('pink')) return 'pink';
  if (g.includes('fuchsia')) return 'fuchsia';
  if (g.includes('red')) return 'red';
  if (g.includes('amber')) return 'amber';
  if (g.includes('orange')) return 'amber';
  if (g.includes('emerald')) return 'emerald';
  if (g.includes('teal')) return 'teal';
  if (g.includes('cyan')) return 'cyan';
  if (g.includes('sky')) return 'sky';
  if (g.includes('blue')) return 'blue';
  if (g.includes('indigo')) return 'indigo';
  if (g.includes('purple') || g.includes('violet')) return 'violet';
  if (g.includes('slate')) return 'slate';
  return 'violet';
}

/**
 * Returns the pulse colour for a given channel context. Each channel
 * preview calls this once per render so the pulse matches the live
 * appearance.
 */
export function getPulseColors(
  channel: 'bell' | 'popup' | 'banner' | 'email',
  bannerGradient?: string,
): PulseColors {
  switch (channel) {
    case 'bell':
      // Bell topbar uses sky — keep the pulse aligned.
      return PULSE_COLOR_BY_TONE.sky;
    case 'banner':
      return PULSE_COLOR_BY_TONE[tonefromGradient(bannerGradient)];
    case 'popup':
      // Popup tracks the banner gradient for its top stripe + CTA.
      return PULSE_COLOR_BY_TONE[tonefromGradient(bannerGradient)];
    case 'email':
      // Email chrome is neutral; indigo reads as "attention" without
      // fighting the sky-tinted inbox row.
      return PULSE_COLOR_BY_TONE.indigo;
    default:
      return PULSE_COLOR_BY_TONE.violet;
  }
}

/**
 * Soft "heartbeat" pulse used on the focused element.
 * Safe to apply to any block — uses box-shadow only.
 *
 * Default (no args) returns the original violet pulse so existing callers
 * stay backwards-compatible. Pass `rgba` to colour the pulse to match the
 * channel/field context.
 */
export const FOCUS_PULSE_ANIMATE = {
  boxShadow: [
    '0 0 0 0 rgba(139,92,246,0)',
    '0 0 0 6px rgba(139,92,246,0.18)',
    '0 0 0 0 rgba(139,92,246,0)',
  ],
};

export function buildFocusPulseAnimate(rgba: string) {
  return {
    boxShadow: [
      `0 0 0 0 rgba(${rgba},0)`,
      `0 0 0 6px rgba(${rgba},0.18)`,
      `0 0 0 0 rgba(${rgba},0)`,
    ],
  };
}

export const FOCUS_PULSE_TRANSITION = {
  duration: 1.6,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

/** Reduced-motion fallback: a static violet ring instead of a continuous pulse. */
export const FOCUS_STATIC_RING_STYLE: React.CSSProperties = {
  boxShadow: '0 0 0 2px rgba(139,92,246,0.45)',
};

export function buildFocusStaticRingStyle(rgba: string): React.CSSProperties {
  return { boxShadow: `0 0 0 2px rgba(${rgba},0.45)` };
}
