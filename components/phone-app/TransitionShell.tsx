// Slide-horizontal AnimatePresence wrapper for the onboarding screens.
// Direction depends on (a) navigation direction (forward/back) and
// (b) locale RTL flip. Spring physics; reduced motion = 50ms cross-fade.

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePhoneAppI18n } from './phoneAppI18n';

interface TransitionShellProps {
  /** A unique key per screen (the screen id / step number). */
  screenKey: string | number;
  /** Direction the user is moving — flips for RTL. */
  direction: 'forward' | 'back';
  children: React.ReactNode;
}

export const TransitionShell: React.FC<TransitionShellProps> = ({
  screenKey,
  direction,
  children,
}) => {
  const reduce = useReducedMotion();
  const { dir } = usePhoneAppI18n();

  // In LTR: forward = new screen slides in from the right.
  // In RTL: flip horizontally so forward feels like RTL reading.
  const sign = (direction === 'forward' ? 1 : -1) * (dir === 'rtl' ? -1 : 1);

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit:    { opacity: 0 },
      }
    : {
        initial: { opacity: 0, x: sign * 64 },
        animate: { opacity: 1, x: 0 },
        exit:    { opacity: 0, x: -sign * 64 },
      };

  const transition = reduce
    ? { duration: 0.05 }
    : { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.7 };

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={screenKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className="absolute inset-0 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TransitionShell;
