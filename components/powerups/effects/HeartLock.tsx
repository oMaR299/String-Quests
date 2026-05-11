/**
 * HeartLock — cinematic effect for the Second Chance power-up (`second_chance`).
 *
 * Second Chance arms the next wrong answer to be absorbed (heart-loss
 * suppressed, see `interceptWrongAnswer` in QuizSessionPage). The effect
 * communicates "your question is now protected by a heart-shaped shield"
 * across three phases (~1.0 s wall-clock):
 *
 *   pre  (≈250 ms): a small Heart icon (rose-500) appears centered above
 *                   the QuizCard region (~30% viewport y), scaling 0.6 → 1.4
 *                   with a soft pink glow.
 *   cast (≈500 ms): a translucent heart-shaped force-field (inline SVG path
 *                   with a radial pink-to-transparent gradient) bubbles
 *                   outward to ~40 vw, scale 0 → 1.2 → 1.05. Heartbeat SFX
 *                   fires ~50 ms in.
 *   post (≈250 ms): the bubble shrinks down to a corner indicator (top-end
 *                   relative to the QuizCard area). Then the cinematic
 *                   continuity is handed off to the persistent
 *                   `<HeartLockBadge />` mounted in QuizSessionPage which
 *                   stays visible while `secondChanceArmedQId` matches the
 *                   current question. State mutations dispatched in this
 *                   order: ARM_SECOND_CHANCE, consume('second_chance'),
 *                   onComplete (overlay dequeues).
 *
 * Reduced-motion path: render the corner heart-lock indicator in place with
 * a 200 ms fade-in, dispatch the same actions, no bubble, no SFX.
 *
 * RTL: corner placement flips via useI18n().locale === 'ar'.
 *
 * Robustness:
 *   - Missing `entry.questionId` → still consume + complete, skip ARM_SECOND_CHANCE.
 *   - All timers tracked in a ref array & cleared on unmount.
 *   - completedRef guard against StrictMode double-mount double-dispatch.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { useI18n } from '../../../contexts/I18nContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';
import type { EffectComponentProps } from './types';

type Phase = 'pre' | 'cast' | 'post' | 'done';

// Phase boundaries in ms from mount.
const PRE_MS = 250;
const SFX_DELAY_MS = 50;     // into cast
const CAST_MS = 500;
const POST_MS = 250;
const REDUCED_DELAY_MS = 200;

// Stylized heart SVG path (200×200 viewBox, centered around 100,100).
// Two cubic-bezier lobes sweeping down to a point.
const HEART_PATH =
  'M100 170 C 30 120, 10 70, 40 40 C 65 18, 92 30, 100 55 C 108 30, 135 18, 160 40 C 190 70, 170 120, 100 170 Z';

const HeartLock: React.FC<EffectComponentProps> = ({ entry, onComplete }) => {
  const { dispatch: quizDispatch } = useQuizSession();
  const { consume: consumePowerup } = usePowerups();
  const { locale } = useI18n();
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('pre');
  const timersRef = useRef<number[]>([]);
  // Idempotency guard against StrictMode double-mount double-dispatch.
  const completedRef = useRef(false);

  const isRtl = locale === 'ar';

  useEffect(() => {
    const schedule = (cb: () => void, ms: number) => {
      const id = window.setTimeout(cb, ms);
      timersRef.current.push(id);
    };

    const finalize = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      // 1. Mutation dispatches FIRST (per the established convention).
      if (typeof entry.questionId === 'number') {
        quizDispatch({
          type: 'ARM_SECOND_CHANCE',
          payload: { questionId: entry.questionId },
        });
      }
      // 2. Decrement inventory.
      consumePowerup('second_chance');
      // 3. Hand control back to the overlay (which DEQUEUE_CASTs).
      onComplete();
    };

    // ---- Reduced-motion path ----
    if (reduce) {
      // Single-state render of the corner indicator + 200 ms hold.
      setPhase('post');
      schedule(() => {
        setPhase('done');
        finalize();
      }, REDUCED_DELAY_MS);
      return;
    }

    // ---- Phase: pre — 0 → 250 ms ----
    // (already in 'pre' on mount)

    // ---- Phase: cast — 250 → 750 ms ----
    schedule(() => {
      setPhase('cast');
      schedule(() => playSfx('heartbeat'), SFX_DELAY_MS);
    }, PRE_MS);

    // ---- Phase: post — 750 → 1000 ms (shrink-to-corner, then dispatch) ----
    schedule(() => {
      setPhase('post');
    }, PRE_MS + CAST_MS);

    schedule(() => {
      setPhase('done');
      finalize();
    }, PRE_MS + CAST_MS + POST_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dedicated cleanup — drains timers on unmount so a fast re-cast can't
  // fire stale callbacks against an unmounted tree.
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  // Reduced-motion: render the corner indicator only (a soft fade-in chip).
  if (reduce) {
    if (phase === 'done') return null;
    return (
      <motion.div
        aria-hidden
        className="fixed pointer-events-none rounded-full bg-white/85 backdrop-blur-sm border border-rose-200 shadow-lg p-1.5"
        style={{
          top: '18%',
          ...(isRtl ? { left: '12%' } : { right: '12%' }),
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Heart size={16} className="text-rose-500 fill-rose-500" />
      </motion.div>
    );
  }

  return (
    <>
      {/* PRE — small centered Heart icon scaling up over the card area. */}
      {phase === 'pre' && (
        <motion.div
          key={`pre-${entry.id}`}
          aria-hidden
          className="fixed pointer-events-none"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 0 24px rgba(244, 63, 94, 0.6))',
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 1 }}
          transition={{ duration: PRE_MS / 1000, ease: 'easeOut' }}
        >
          <Heart size={48} className="text-rose-500 fill-rose-500" strokeWidth={2.5} />
        </motion.div>
      )}

      {/* CAST — translucent heart-shaped force field bubbling outward. */}
      {phase === 'cast' && (
        <motion.svg
          key={`cast-${entry.id}`}
          aria-hidden
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
          className="fixed pointer-events-none"
          style={{
            // ~40% viewport-min, centered; using min(40vw, 40vh) avoids
            // an oversized heart on portrait phones.
            width: 'min(40vw, 40vh)',
            height: 'min(40vw, 40vh)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(0 0 32px rgba(244, 63, 94, 0.4))',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1.05], opacity: [0, 1, 0.85] }}
          transition={{
            duration: CAST_MS / 1000,
            ease: 'easeOut',
            times: [0, 0.6, 1],
          }}
        >
          <defs>
            <radialGradient id={`heart-fill-${entry.id}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
              <stop offset="70%" stopColor="rgba(244, 63, 94, 0.18)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
            </radialGradient>
          </defs>
          <path
            d={HEART_PATH}
            fill={`url(#heart-fill-${entry.id})`}
            stroke="rgba(244, 63, 94, 0.7)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      {/* POST — shrink-to-corner indicator. Visual continuity bridge before
          the persistent <HeartLockBadge /> takes over rendering. */}
      {phase === 'post' && (
        <motion.div
          key={`post-${entry.id}`}
          aria-hidden
          className="fixed pointer-events-none rounded-full bg-white/85 backdrop-blur-sm border border-rose-200 shadow-lg p-1.5"
          // Animate from screen-center (where the bubble was) to the
          // corner indicator position. We use top/left percentages and
          // let Framer interpolate them.
          initial={{
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%',
            scale: 1.1,
            opacity: 0.95,
          }}
          animate={{
            top: '18%',
            left: isRtl ? '12%' : 'auto',
            right: isRtl ? 'auto' : '12%',
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{ duration: POST_MS / 1000, ease: 'easeInOut' }}
        >
          <Heart size={16} className="text-rose-500 fill-rose-500" />
        </motion.div>
      )}
    </>
  );
};

export default HeartLock;
