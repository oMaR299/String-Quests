/**
 * sq-Button — primary primitive of the String-Quests design system.
 *
 * Variants:
 *   - 3d        : Duolingo-style, border-b-4 + active:translate-y. Reserved
 *                 for primary CTAs ("Confirm", "Continue", "Save"). The
 *                 visual recipe is extracted from PhoneButton.tsx.
 *   - solid     : Flat colored fill. Use for non-CTA primary actions.
 *   - outline   : Border only. Secondary actions next to a solid CTA.
 *   - ghost     : Transparent. Tertiary / inline actions.
 *   - link      : Underlined inline text. Navigation, "learn more".
 *
 * Tones: brand | success | warning | danger | neutral
 * Sizes: sm | md | lg
 *
 * Loading state: shows a spinner; the button's width is preserved via
 * an invisible label so the layout doesn't shift.
 *
 * iconOnly: collapse the label and render only the leading icon. The
 * caller is responsible for providing an aria-label.
 *
 * Tailwind v4 JIT-safe: every class is a literal in a static map.
 * Reduced-motion: scale-on-tap is disabled when the OS requests it.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, type LucideIcon } from 'lucide-react';

export type SqButtonVariant = '3d' | 'solid' | 'outline' | 'ghost' | 'link';
export type SqButtonTone    = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
export type SqButtonSize    = 'sm' | 'md' | 'lg';

export interface SqButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: SqButtonVariant;
  tone?: SqButtonTone;
  size?: SqButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  /** Leading icon (lucide component). */
  leadingIcon?: LucideIcon;
  /** Trailing icon (lucide component). */
  trailingIcon?: LucideIcon;
  children?: React.ReactNode;
}

/* ─── Static tone × variant matrices (literal classes only) ───────────── */

const TONE_3D: Record<SqButtonTone, string> = {
  brand:
    'bg-sq-brand-500 text-white border-sq-brand-700 ' +
    'hover:bg-sq-brand-600',
  success:
    'bg-sq-success-500 text-white border-sq-success-600 ' +
    'hover:bg-sq-success-600',
  warning:
    'bg-sq-warning-500 text-white border-sq-warning-600 ' +
    'hover:bg-sq-warning-600',
  danger:
    'bg-sq-danger-500 text-white border-sq-danger-600 ' +
    'hover:bg-sq-danger-600',
  neutral:
    'bg-slate-700 text-white border-slate-900 ' +
    'hover:bg-slate-800',
};

const TONE_SOLID: Record<SqButtonTone, string> = {
  brand:
    'bg-sq-brand-500 text-white hover:bg-sq-brand-600 ' +
    'shadow-sm shadow-violet-500/25',
  success:
    'bg-sq-success-500 text-white hover:bg-sq-success-600 ' +
    'shadow-sm shadow-emerald-500/25',
  warning:
    'bg-sq-warning-500 text-white hover:bg-sq-warning-600 ' +
    'shadow-sm shadow-amber-500/25',
  danger:
    'bg-sq-danger-500 text-white hover:bg-sq-danger-600 ' +
    'shadow-sm shadow-rose-500/25',
  neutral:
    'bg-slate-700 text-white hover:bg-slate-800 ' +
    'shadow-sm shadow-slate-500/25',
};

const TONE_OUTLINE: Record<SqButtonTone, string> = {
  brand:   'bg-white text-sq-brand-700 border-sq-brand-500 hover:bg-sq-brand-50',
  success: 'bg-white text-sq-success-600 border-sq-success-500 hover:bg-sq-success-50',
  warning: 'bg-white text-sq-warning-600 border-sq-warning-500 hover:bg-sq-warning-50',
  danger:  'bg-white text-sq-danger-600 border-sq-danger-500 hover:bg-sq-danger-50',
  neutral: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
};

const TONE_GHOST: Record<SqButtonTone, string> = {
  brand:   'bg-transparent text-sq-brand-700 hover:bg-sq-brand-50',
  success: 'bg-transparent text-sq-success-600 hover:bg-sq-success-50',
  warning: 'bg-transparent text-sq-warning-600 hover:bg-sq-warning-50',
  danger:  'bg-transparent text-sq-danger-600 hover:bg-sq-danger-50',
  neutral: 'bg-transparent text-slate-600 hover:bg-slate-100',
};

const TONE_LINK: Record<SqButtonTone, string> = {
  brand:   'bg-transparent text-sq-brand-700 underline underline-offset-2 hover:text-sq-brand-600',
  success: 'bg-transparent text-sq-success-600 underline underline-offset-2 hover:text-sq-success-700',
  warning: 'bg-transparent text-sq-warning-600 underline underline-offset-2 hover:text-sq-warning-700',
  danger:  'bg-transparent text-sq-danger-600 underline underline-offset-2 hover:text-sq-danger-700',
  neutral: 'bg-transparent text-slate-700 underline underline-offset-2 hover:text-slate-900',
};

const SIZE_CLASSES: Record<SqButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const SIZE_ICON_ONLY: Record<SqButtonSize, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

/** 3D variant adds border-b-4; on press it collapses + translates. */
const THREE_D_FRAME =
  'border-2 border-b-4 active:translate-y-[3px] active:border-b-2 ' +
  'transition-[transform,background-color] duration-100 ease-out';

/* ─── Resolver ────────────────────────────────────────────────────────── */

function resolveClasses(variant: SqButtonVariant, tone: SqButtonTone): string {
  switch (variant) {
    case '3d':      return `${TONE_3D[tone]} ${THREE_D_FRAME}`;
    case 'solid':   return TONE_SOLID[tone];
    case 'outline': return `${TONE_OUTLINE[tone]} border-2`;
    case 'ghost':   return TONE_GHOST[tone];
    case 'link':    return TONE_LINK[tone];
  }
}

/* ─── Component ───────────────────────────────────────────────────────── */

export const SqButton = React.forwardRef<HTMLButtonElement, SqButtonProps>(
  function SqButton(
    {
      variant = 'solid',
      tone = 'brand',
      size = 'md',
      loading = false,
      iconOnly = false,
      fullWidth = false,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const isDisabled = disabled || loading;

    const base =
      'relative inline-flex items-center justify-center gap-2 select-none ' +
      'font-cairo font-bold rounded-2xl ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-brand-500 focus-visible:ring-offset-1 ' +
      'disabled:opacity-50 disabled:pointer-events-none ' +
      'transition-colors duration-150';

    const widthCls = fullWidth ? 'w-full' : '';
    const v = variant as SqButtonVariant;
    const tn = tone as SqButtonTone;
    const sz = size as SqButtonSize;
    const sizing = iconOnly ? SIZE_ICON_ONLY[sz] : SIZE_CLASSES[sz];
    const palette = resolveClasses(v, tn);

    const tap = reduce || isDisabled ? undefined : { scale: v === '3d' ? 1 : 0.97 };

    const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

    return (
      <motion.button
        ref={ref}
        whileTap={tap}
        disabled={isDisabled}
        className={[base, sizing, widthCls, palette, className].join(' ')}
        {...rest}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className={`${iconSize} animate-spin`} />
            {!iconOnly && <span className="opacity-0">{children}</span>}
          </span>
        ) : (
          <>
            {LeadingIcon && <LeadingIcon className={iconSize} />}
            {!iconOnly && <span>{children}</span>}
            {TrailingIcon && <TrailingIcon className={iconSize} />}
          </>
        )}
      </motion.button>
    );
  },
);

export default SqButton;
