// PhoneButton — the iconic Duolingo-style 3D button.
//
// Visual recipe:
//   - Solid color top, darker color bottom-shadow (border-b-4) → reads as a
//     stacked button card with depth.
//   - On `:active`, the bottom shadow collapses (`border-b-0`) and the button
//     translates down by 1px → satisfying press-in feel.
//   - Three tones (mint, coral, sky) and three variants (primary, secondary,
//     ghost). All class strings are static literals so Tailwind JIT picks them
//     up reliably (no template-built class names).
//
// Usage:
//   <PhoneButton tone="mint" variant="primary" onClick={...}>Start</PhoneButton>

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type PhoneButtonTone = 'mint' | 'coral' | 'sky';
export type PhoneButtonVariant = 'primary' | 'secondary' | 'ghost';
export type PhoneButtonSize = 'lg' | 'md';

interface PhoneButtonProps {
  tone?: PhoneButtonTone;
  variant?: PhoneButtonVariant;
  size?: PhoneButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Static class maps — Tailwind JIT can scan these literal strings.
const PRIMARY_CLASSES: Record<PhoneButtonTone, string> = {
  mint:
    'bg-phone-mint-500 text-white border-phone-mint-600 ' +
    'hover:bg-phone-mint-500/95 active:bg-phone-mint-500',
  coral:
    'bg-phone-coral-500 text-white border-phone-coral-600 ' +
    'hover:bg-phone-coral-500/95 active:bg-phone-coral-500',
  sky:
    'bg-phone-sky-500 text-white border-phone-sky-600 ' +
    'hover:bg-phone-sky-500/95 active:bg-phone-sky-500',
};

const SECONDARY_CLASSES: Record<PhoneButtonTone, string> = {
  mint:
    'bg-white text-phone-mint-600 border-phone-mint-500 ' +
    'hover:bg-phone-mint-50',
  coral:
    'bg-white text-phone-coral-600 border-phone-coral-500 ' +
    'hover:bg-phone-cream-50',
  sky:
    'bg-white text-phone-sky-600 border-phone-sky-500 ' +
    'hover:bg-phone-sky-50',
};

const GHOST_CLASSES: Record<PhoneButtonTone, string> = {
  mint: 'bg-transparent text-phone-mint-600 border-transparent hover:text-phone-mint-600/80',
  coral:'bg-transparent text-phone-coral-600 border-transparent hover:text-phone-coral-600/80',
  sky:  'bg-transparent text-phone-sky-600 border-transparent hover:text-phone-sky-600/80',
};

const SIZE_CLASSES: Record<PhoneButtonSize, string> = {
  lg: 'px-6 py-4 text-base',
  md: 'px-5 py-3 text-sm',
};

export const PhoneButton: React.FC<PhoneButtonProps> = ({
  tone = 'mint',
  variant = 'primary',
  size = 'lg',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = true,
  children,
}) => {
  const reduce = useReducedMotion();

  const palette =
    variant === 'primary'   ? PRIMARY_CLASSES[tone]
  : variant === 'secondary' ? SECONDARY_CLASSES[tone]
  :                           GHOST_CLASSES[tone];

  const sizing = SIZE_CLASSES[size];

  // Disabled gets a flat slate look — keeps the 3D outline so the layout
  // doesn't shift when toggling enabled/disabled.
  const disabledClasses =
    'bg-phone-stone text-white border-slate-400 cursor-not-allowed pointer-events-none';

  const widthCls = fullWidth ? 'w-full' : '';

  // The `border-b-4 active:border-b-0 active:translate-y-1` combo is what
  // creates the "press-in" — the bottom shadow collapses while the button
  // moves down to fill the missing space, so total height stays constant.
  const baseClasses =
    'relative select-none inline-flex items-center justify-center gap-2 ' +
    'font-extrabold uppercase tracking-wide rounded-2xl ' +
    'border-2 border-b-4 ' +
    'transition-[transform,background-color] duration-100 ease-out ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 ' +
    'focus-visible:ring-phone-stone-light/60 ' +
    'active:translate-y-[3px] active:border-b-2';

  return (
    <motion.button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.985 }}
      className={[
        baseClasses,
        sizing,
        widthCls,
        disabled ? disabledClasses : palette,
        className,
      ].join(' ')}
    >
      <span className="relative inline-flex items-center justify-center gap-2 leading-none">
        {children}
      </span>
    </motion.button>
  );
};

export default PhoneButton;
