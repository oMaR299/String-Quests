// PhoneShell.tsx (shared)
// ─────────────────────────────────────────────────────────────────────────────
// Mobile-first wrapper. Caps content at ~430px on desktop and lets the
// surrounding viewport show a soft duo-blue/duo-green gradient backdrop so
// the "phone" floats on larger screens. Below md, it goes full-bleed.
//
// Lifted from `components/parent-onboarding/PhoneShell.tsx` to be shared
// between the Parent Onboarding flow AND the Parent App home shell so we
// don't drift two copies. The recipe is unchanged from the onboarding
// version — onboarding now re-exports from here.
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
   * header. Used by the Parent App where the header has a backdrop blur,
   * border, and own padding.
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
      className="relative min-h-screen w-full font-cairo overflow-hidden flex items-stretch md:items-center justify-center bg-gradient-to-br from-duo-blue-light via-white to-duo-green-light"
    >
      {/* Soft pastel blobs in the desktop backdrop only — invisible behind the
          phone shell on mobile because the shell goes full-bleed. */}
      <div className="hidden md:block pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -start-32 w-[420px] h-[420px] rounded-full bg-duo-blue/15 blur-[100px]" />
        <div className="absolute -bottom-32 -end-32 w-[420px] h-[420px] rounded-full bg-duo-green/15 blur-[100px]" />
      </div>

      {/* The "phone" — capped at 430px on md+, full-bleed below.
          Height is locked to the viewport so the body scrolls INTERNALLY
          (overflow-y-auto on the body slot below); without this, long
          content makes the whole page scroll and the sticky header + tab
          bar drift out of view. `100dvh` accounts for mobile URL-bar
          collapse so the bottom tab bar sits flush against the bottom
          edge regardless of browser chrome state. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 24 }}
        className="relative z-10 flex flex-col w-full md:max-w-[430px] md:my-8 md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:border md:border-white/60 bg-white/85 backdrop-blur-xl overflow-hidden h-[100dvh] md:h-auto md:min-h-[760px] md:max-h-[calc(100vh-4rem)]"
      >
        {/* Inner gradient wash so the cards feel embedded in a duo-themed
            surface rather than a plain white card. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-duo-blue-light/40 via-white/0 to-duo-green-light/30 md:rounded-[2rem]" />

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
