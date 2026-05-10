/**
 * StardustBadge — glass pill showing the user's Stardust balance.
 *
 * Mounted in the TopBar, the shop header, the loadout modal, etc.
 * When `animateOnChange` is true, a balance increase triggers a
 * Framer-Motion bounce (guarded by `useReducedMotion()`).
 *
 * Stardust is the warm/gold currency, so we use `sq-warning-*` tokens.
 *
 * Usage:
 *   <StardustBadge balance={state.stardust} animateOnChange onClick={() => navigate('/shop')} />
 */

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

export type StardustBadgeSize = 'sm' | 'md' | 'lg';

export interface StardustBadgeProps {
  balance: number;
  size?: StardustBadgeSize;
  /** When set + balance increases, the pill bounces once (reduced-motion safe). */
  animateOnChange?: boolean;
  onClick?: () => void;
  className?: string;
  /** Localized "SD" suffix (defaults to "SD"). */
  suffix?: string;
  /** Accessible label override. */
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<StardustBadgeSize, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const ICON_SIZE: Record<StardustBadgeSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

export function StardustBadge({
  balance,
  size = 'md',
  animateOnChange = false,
  onClick,
  className,
  suffix = 'SD',
  ariaLabel,
}: StardustBadgeProps) {
  const reduce = useReducedMotion();
  const prevBalance = useRef(balance);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (!animateOnChange) {
      prevBalance.current = balance;
      return;
    }
    if (balance > prevBalance.current) {
      setPulseKey((k) => k + 1);
    }
    prevBalance.current = balance;
  }, [balance, animateOnChange]);

  const transition: Transition = reduce ? MOTION_FALLBACK : SQ_SPRING.bouncy;
  const Wrapper: typeof motion.button | typeof motion.div = onClick
    ? motion.button
    : motion.div;

  return (
    <Wrapper
      key={pulseKey}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel ?? `Stardust balance: ${balance} ${suffix}`}
      initial={animateOnChange && !reduce ? { scale: 1 } : false}
      animate={
        animateOnChange && !reduce && pulseKey > 0
          ? { scale: [1, 1.15, 1] }
          : { scale: 1 }
      }
      transition={transition}
      className={[
        // Glass pill — light theme, glassmorphism
        'inline-flex items-center rounded-full',
        'border border-white/40 bg-white/60 backdrop-blur-md',
        'shadow-sm font-semibold text-sq-warning-700',
        'transition-colors',
        onClick ? 'cursor-pointer hover:bg-white/80 active:scale-[0.97]' : '',
        SIZE_CLASSES[size],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sparkles
        size={ICON_SIZE[size]}
        className="text-sq-warning-500"
        strokeWidth={2.25}
        aria-hidden
      />
      <span className="tabular-nums leading-none">{balance}</span>
      <span className="text-sq-warning-600 leading-none opacity-80">{suffix}</span>
    </Wrapper>
  );
}

export default StardustBadge;
