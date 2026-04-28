// PhoneCard — solid (NOT glass) option card for the Phone App onboarding.
//
// Visual recipe — replaces the glassmorphic cards used in the previous
// iteration with the iconic Duolingo "solid white card with thick borders +
// crisp bottom shadow" pattern:
//
//   - Idle:     bg-white, slate-200 border, soft drop shadow.
//   - Selected: bg-{tone}-50, {tone}-500 border, "pressed" 4px bottom-shadow
//               in the tone color → reads as a real, tactile card.
//   - Disabled: opacity-60, no hover affordance.
//
// All class strings are static literals so Tailwind JIT can scan them.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type PhoneCardTone = 'mint' | 'coral' | 'sky';

interface PhoneCardProps {
  tone?: PhoneCardTone;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  /** Set to false to disable the hover lift (e.g. when the card is purely
   *  decorative or already animating in the background). */
  interactive?: boolean;
  children: React.ReactNode;
}

// Static class lookups so JIT picks them up.
const SELECTED_CLASSES: Record<PhoneCardTone, string> = {
  mint:
    'bg-phone-mint-50 border-phone-mint-500 ' +
    'shadow-[0_4px_0_0_#10B981]',
  coral:
    'bg-phone-cream-50 border-phone-coral-500 ' +
    'shadow-[0_4px_0_0_#F87171]',
  sky:
    'bg-phone-sky-50 border-phone-sky-500 ' +
    'shadow-[0_4px_0_0_#0EA5E9]',
};

const HOVER_CLASSES: Record<PhoneCardTone, string> = {
  mint: 'hover:border-phone-mint-500/60',
  coral:'hover:border-phone-coral-500/60',
  sky:  'hover:border-phone-sky-500/60',
};

export const PhoneCard: React.FC<PhoneCardProps> = ({
  tone = 'mint',
  selected = false,
  disabled = false,
  onClick,
  className = '',
  interactive = true,
  children,
}) => {
  const reduce = useReducedMotion();

  const base =
    'relative w-full text-start rounded-2xl border-2 transition-colors duration-150 p-4';

  // Idle vs selected vs disabled — every class is a literal here.
  const stateClasses =
    disabled
      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
    : selected
      ? SELECTED_CLASSES[tone]
      : 'bg-white border-slate-200 ' + HOVER_CLASSES[tone];

  // The press-in motion is small — Duolingo card "bumps" to selected state
  // rather than pressing down like a CTA button.
  const tapAnim = reduce || disabled || !interactive
    ? undefined
    : { scale: 0.985 };

  const hoverAnim = reduce || disabled || !interactive
    ? undefined
    : { y: -1 };

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={tapAnim}
      whileHover={hoverAnim}
      className={[base, stateClasses, className].join(' ')}
    >
      {children}
    </motion.button>
  );
};

export default PhoneCard;
