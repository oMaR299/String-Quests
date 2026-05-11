/**
 * HeartLockBadge — persistent "Second Chance armed" indicator pinned to the
 * top-end corner of the QuizCard area while `quizState.secondChanceArmedQId`
 * matches the current question's id.
 *
 * Renders nothing when:
 *   - no question is armed (secondChanceArmedQId is null), OR
 *   - the armed question id no longer matches the current question (the
 *     ANSWER reducer auto-clears the flag on the matching question, so this
 *     check is mostly belt-and-braces — moving on without using the chance
 *     simply mismatches and we hide).
 *
 * Mount target: inside QuizSessionPage's `phase === 'playing'` block. Position
 * is `position: fixed` at top:80px / right:16px (LTR) or left:16px (RTL) so
 * it sits below the lesson-header pill but stays visible regardless of QuizCard
 * scroll. Bilingual tooltip via `title=` attr.
 *
 * Mount/unmount uses a Framer Motion scale spring (SQ_SPRING.snappy) guarded
 * by useReducedMotion(). The HeartLock effect renders its own shrink-to-corner
 * indicator at this same approximate location for ~250 ms before this badge
 * mounts, so the two read as a continuous animation.
 */

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useQuizSession } from '../../contexts/QuizSessionContext';
import { useI18n } from '../../contexts/I18nContext';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

const DEFAULT_TOP = 80;

const HeartLockBadge: React.FC = () => {
  const { state: quizState, currentQuestion } = useQuizSession();
  const { locale } = useI18n();
  const reduce = useReducedMotion();

  const isRtl = locale === 'ar';
  const armed =
    quizState.secondChanceArmedQId !== null &&
    currentQuestion !== null &&
    quizState.secondChanceArmedQId === currentQuestion.id;

  const tooltip = locale === 'ar' ? 'فرصة ثانية مُجهّزة' : 'Second Chance armed';
  const transition = reduce ? MOTION_FALLBACK : SQ_SPRING.snappy;

  // Position the badge below the live hearts row when present so it doesn't
  // overlap on mobile portrait (where the platform navbar + lesson header
  // take more vertical space). Falls back to a fixed 80 px otherwise.
  const [topPx, setTopPx] = useState<number>(DEFAULT_TOP);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const measure = () => {
      const node = document.querySelector('[data-hearts-row]') as HTMLElement | null;
      if (node) {
        const rect = node.getBoundingClientRect();
        setTopPx(rect.bottom + 12);
      } else {
        setTopPx(DEFAULT_TOP);
      }
    };

    measure();

    let raf = 0;
    const onResize = () => {
      // Debounce via rAF so rapid resize events coalesce into one measure.
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AnimatePresence>
      {armed && (
        <motion.div
          key="heartlock-badge"
          role="status"
          aria-label={tooltip}
          title={tooltip}
          className="fixed z-[80] pointer-events-none rounded-full bg-white/85 backdrop-blur-sm border border-rose-200 shadow-lg px-2 py-1 flex items-center gap-1 text-xs font-bold text-rose-600"
          style={{
            top: topPx,
            ...(isRtl ? { left: 16 } : { right: 16 }),
          }}
          initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
          transition={transition}
        >
          <Heart size={12} className="text-rose-500 fill-rose-500" aria-hidden />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeartLockBadge;
