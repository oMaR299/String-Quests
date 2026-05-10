// TransitionShell.tsx
// ─────────────────────────────────────────────────────────────────────────────
// AnimatePresence wrapper for screen transitions. Slide is direction-aware so
// "next" pushes content from the trailing edge (end → start) and "back"
// reverses. Reduced-motion users get a 50ms cross-fade instead of motion.

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';

interface TransitionShellProps {
  /** A stable key per screen — drives AnimatePresence. */
  screenKey: string;
  children: React.ReactNode;
}

export const TransitionShell: React.FC<TransitionShellProps> = ({ screenKey, children }) => {
  const { dir } = useI18n();
  const reduceMotion = useReducedMotion();

  // Track the previously-rendered screen key to infer direction. We can't
  // perfectly know "forward vs back" from a key alone, but we can infer it
  // for a linear flow: phone → otp → connect → list. We keep an ordered
  // history list and compare positions.
  const [history, setHistory] = useState<string[]>([screenKey]);

  useEffect(() => {
    setHistory((prev) => {
      if (prev[prev.length - 1] === screenKey) return prev;
      return [...prev, screenKey];
    });
  }, [screenKey]);

  // Determine direction: if the new key already appears earlier in history,
  // the user went back — slide in from the start side. Otherwise forward.
  const lastIdx = history.lastIndexOf(screenKey);
  const isBack = lastIdx >= 0 && lastIdx < history.length - 1;
  const slideSign = isBack ? -1 : 1;
  const rtl = dir === 'rtl';

  // In RTL, "forward" visually slides from the start (right) edge. We invert
  // the sign so the motion always reads as "next pushes content out", regardless
  // of locale.
  const offset = (rtl ? -slideSign : slideSign) * 24;

  if (reduceMotion) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screenKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={screenKey}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.6 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default TransitionShell;
