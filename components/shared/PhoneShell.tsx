// PhoneShell.tsx (shared)
// ─────────────────────────────────────────────────────────────────────────────
// Mobile-first wrapper. Caps content at ~430px on desktop and lets the
// surrounding viewport show a soft slate backdrop so the "phone" floats on
// larger screens. Below md, it goes full-bleed.
//
// 2026-05 visual-language refactor: dropped the inner duo-blue→duo-green
// gradient wash, the duo-color blob pseudo-elements, and the phone card's
// own backdrop-blur. Surface is now solid white inside the phone with a
// soft slate desktop backdrop — see the flat / Linear-Vercel design memo.
//
// Layout:
//   [ chrome row: topStart (start) | topCenter (centered) | topEnd (end)   ]
//   [ scrollable content                                                   ]
//   [ sticky bottom slot, w/ safe-area-inset-bottom padding (optional)     ]

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PhoneShellProps {
  /** Top-start slot (typically BackButton or avatar). */
  topStart?: React.ReactNode;
  /** Top-center slot (typically StepIndicator or scrollable child pills). */
  topCenter?: React.ReactNode;
  /** Top-end slot (typically LocaleToggle or notification bell). */
  topEnd?: React.ReactNode;
  /** Sticky bottom slot — leave undefined to omit. */
  bottom?: React.ReactNode;
  /**
   * When true, the chrome row is rendered without the default horizontal
   * padding/spacing — the consumer is rendering its own full-width sticky
   * header. Used by the Parent App where the header has its own border,
   * padding, and (after the flat refactor) solid white background.
   */
  fullBleedChrome?: boolean;
  /**
   * When true, the bottom slot is rendered without the default gradient
   * fade-to-white wrapper + horizontal padding — the consumer (e.g. a tab
   * bar) handles its own background, padding, and safe-area inset.
   */
  fullBleedBottom?: boolean;
  /** Override the body's default padding when the consumer needs custom layout. */
  bodyClassName?: string;
  /** Main scrollable body. */
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  topStart,
  topCenter,
  topEnd,
  bottom,
  fullBleedChrome = false,
  fullBleedBottom = false,
  bodyClassName,
  children,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative min-h-screen w-full font-cairo overflow-hidden flex items-stretch md:items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/60"
    >
      {/* The "phone" — capped at 430px on md+, full-bleed below.
          Height is locked to the viewport so the body scrolls INTERNALLY
          (overflow-y-auto on the body slot below); without this, long
          content makes the whole page scroll and the sticky header + tab
          bar drift out of view. `100dvh` accounts for mobile URL-bar
          collapse so the bottom tab bar sits flush against the bottom
          edge regardless of browser chrome state.

          Flat refactor: solid `bg-white` (was `bg-white/85 backdrop-blur-xl`)
          + a hairline `border-slate-200` on desktop instead of the soft
          white/60 frame. No interior gradient wash anymore. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 24 }}
        className="relative z-10 flex flex-col w-full md:max-w-[430px] md:my-8 md:rounded-[2rem] md:shadow-md md:shadow-slate-900/10 md:border md:border-slate-200 bg-white overflow-hidden h-[100dvh] md:h-auto md:min-h-[760px] md:max-h-[calc(100vh-4rem)]"
      >
        {/* Chrome row — either the standard 3-column row or full-bleed pass
            through (Parent App home renders its own sticky header). */}
        {fullBleedChrome ? (
          <div className="relative z-30 sticky top-0">
            {topCenter ?? topStart ?? topEnd}
          </div>
        ) : (topStart || topCenter || topEnd) ? (
          <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-5 pb-2">
            <div className="flex-1 flex justify-start">{topStart}</div>
            <div className="flex-1 flex justify-center">{topCenter}</div>
            <div className="flex-1 flex justify-end">{topEnd}</div>
          </div>
        ) : null}

        {/* Scrollable body */}
        <div
          className={
            bodyClassName ??
            'relative z-10 flex-1 overflow-y-auto px-5 pb-6'
          }
        >
          {children}
        </div>

        {/* Sticky CTA strip — gradient wrapper unless the consumer opts out
            (e.g. a tab bar that owns its own backdrop + safe-area). */}
        {bottom && (
          fullBleedBottom ? (
            <div className="relative z-20">{bottom}</div>
          ) : (
            <div
              className="relative z-20 px-5 pt-3 pb-5 bg-gradient-to-t from-white via-white/95 to-white/0"
              style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
            >
              {bottom}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};

export default PhoneShell;
