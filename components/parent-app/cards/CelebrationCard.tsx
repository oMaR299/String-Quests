// CelebrationCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Yellow-cream tinted card that surfaces an active celebration moment
// (streak / mastery / teacher praise). Hides cleanly when there's nothing to
// celebrate — the parent doesn't see filler.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useParentAppContext } from '../useParentAppContext';

export const CelebrationCard: React.FC = () => {
  const { locale } = useI18n();
  const { state, activeChildId } = useParentAppContext();
  const reduceMotion = useReducedMotion();

  // Single-child mode: show only celebrations belonging to the active child.
  const candidates = state.celebrations.filter((c) => c.childId === activeChildId);
  if (candidates.length === 0) return null;
  const top = candidates[0];

  const copy = locale === 'ar' ? top.copyAr : top.copyEn;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3"
    >
      <motion.div
        animate={
          reduceMotion
            ? { scale: 1 }
            : { scale: [1, 1.08, 1], rotate: [0, 4, 0] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 2.4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
        }
        className="w-11 h-11 rounded-full bg-duo-gold-light inline-flex items-center justify-center shrink-0"
      >
        <Sparkles className="w-5 h-5 text-duo-orange" />
      </motion.div>
      <p className="flex-1 text-sm font-extrabold text-slate-800 leading-snug">{copy}</p>
    </motion.section>
  );
};

export default CelebrationCard;
