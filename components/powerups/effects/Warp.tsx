/**
 * Warp — cinematic effect for the Skip power-up.
 *
 * Phase timing (~1.3 s total):
 *   pre  (0–200 ms)   — faint brand-violet glow + edge blur over the QuizCard
 *   cast (200–1100 ms) — wormhole vortex (concentric circles + radial particles)
 *                         scaled + rotated, finishing with a thin vertical seam
 *   post (1100–1300 ms) — dispatches SKIP_QUESTION → consume('skip')
 *                         → ANSWER(0, qId) → onComplete()
 *
 * Reduced-motion path: skip the vortex/particles/sound; just hold a 200 ms
 * blank tick so the existing AnimatePresence card-swap can play, then dispatch
 * the same 4 actions in the same order.
 *
 * Conventions:
 *   - Light theme + glassmorphism (no dark backdrops).
 *   - Stroke gradient brand → indigo (#8B5CF6 → #6366F1).
 *   - All Framer Motion animations gated behind useReducedMotion().
 *   - Pointer-events: none — overlay never eats taps.
 *   - No QuizCard mutation; the next-question swap is owned by the existing
 *     AnimatePresence in QuizSessionPage.
 */

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { EffectComponentProps } from './types';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';

// Phase boundaries (ms from mount).
const PRE_END = 200;
const SFX_AT = PRE_END + 50;     // ~250 ms — vortex audible cue
const SEAM_AT = PRE_END + 700;   // ~900 ms — vertical seam appears
const CAST_END = PRE_END + 900;  // ~1100 ms — vortex fades
const POST_END = CAST_END + 200; // ~1300 ms — dispatch + dequeue
const REDUCED_DELAY = 200;       // reduced-motion path: short hold then dispatch

// Wormhole composition.
const RING_COUNT = 5;
const PARTICLE_COUNT = 12;
const RING_BASE_RADIUS = 90;     // SVG units; viewBox is 0 0 200 200
const RING_RADIUS_STEP = 12;

const Warp: React.FC<EffectComponentProps> = ({ entry, onComplete }) => {
  const reduce = useReducedMotion();
  const { dispatch: quizDispatch } = useQuizSession();
  const { consume: consumePowerup } = usePowerups();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Guard against StrictMode double-effect or any race where the post phase
  // tries to fire twice — the overlay's DEQUEUE is idempotent but the quiz
  // dispatches are not (double SKIP_QUESTION would push two slugs into
  // powerupsUsedThisArtifact and double-advance the quiz).
  const completedRef = useRef(false);

  useEffect(() => {
    const schedule = (delay: number, fn: () => void) => {
      timersRef.current.push(setTimeout(fn, delay));
    };

    const runPostPhase = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      // 1. Mark perfect-bonus disqualified + record slug.
      quizDispatch({ type: 'SKIP_QUESTION' });
      // 2. Decrement inventory.
      consumePowerup('skip');
      // 3. Advance the quiz pipeline through the wrong-answer path
      //    (zero points, original question id). Only when we know the qId —
      //    otherwise the quiz can't safely advance and we leave it alone.
      if (typeof entry.questionId === 'number') {
        quizDispatch({
          type: 'ANSWER',
          payload: { points: 0, questionId: entry.questionId },
        });
      }
      // 4. Dequeue the cast — overlay tears us down.
      onComplete();
    };

    if (reduce) {
      // Reduced-motion: brief hold so the AnimatePresence card-swap looks
      // intentional, then fire all four dispatches in order.
      schedule(REDUCED_DELAY, runPostPhase);
    } else {
      // Full cinematic path.
      schedule(SFX_AT, () => playSfx('whoosh'));
      schedule(POST_END, runPostPhase);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reduced-motion: render nothing — no glow, no vortex, no seam.
  if (reduce) return null;

  return (
    <>
      {/* ── Pre phase: faint glow + edge blur over the QuizCard area. ── */}
      <motion.div
        className="fixed bg-violet-50/30 backdrop-blur-[4px] rounded-2xl"
        style={{ inset: '12% 8%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: (CAST_END + 100) / 1000,
          times: [0, PRE_END / (CAST_END + 100), 0.85, 1],
          ease: 'easeOut',
        }}
        aria-hidden
      />

      {/* ── Cast phase: the wormhole vortex (SVG). ── */}
      <motion.svg
        className="fixed"
        style={{ inset: '12% 8%' }}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.95, 1, 1.2, 1.25],
          rotate: [0, 30, 90, 110],
        }}
        transition={{
          duration: (CAST_END + 100) / 1000,
          times: [0, PRE_END / (CAST_END + 100), 0.85, 1],
          ease: 'easeInOut',
          delay: PRE_END / 1000 - 0.05,
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id="warp-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <radialGradient id="warp-particle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
          <filter id="warp-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Concentric rings — each shrinks inward + rotates at its own rate. */}
        {Array.from({ length: RING_COUNT }).map((_, i) => {
          const r = RING_BASE_RADIUS - i * RING_RADIUS_STEP;
          const rotateTo = i % 2 === 0 ? 360 : -360;
          const rotateScale = 1 + (i % 3) * 0.5; // 1x, 1.5x, 2x
          const dash = `${4 + i * 2} ${3 + i}`;
          return (
            <motion.circle
              key={`ring-${i}`}
              cx={100}
              cy={100}
              r={r}
              fill="none"
              stroke="url(#warp-stroke)"
              strokeWidth={1.4 - i * 0.15}
              strokeDasharray={dash}
              strokeLinecap="round"
              opacity={0.85 - i * 0.1}
              style={{ transformOrigin: '100px 100px' }}
              animate={{
                rotate: rotateTo * rotateScale,
                scale: [1, 0.55, 0.2],
              }}
              transition={{
                rotate: {
                  duration: 0.9,
                  ease: 'linear',
                  delay: PRE_END / 1000 + i * 0.04,
                },
                scale: {
                  duration: 0.9,
                  ease: 'easeIn',
                  delay: PRE_END / 1000 + i * 0.04,
                  times: [0, 0.7, 1],
                },
              }}
            />
          );
        })}

        {/* 12 radial particles — born at the periphery, sucked into center. */}
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
          const startR = RING_BASE_RADIUS + 8;
          const x0 = 100 + Math.cos(angle) * startR;
          const y0 = 100 + Math.sin(angle) * startR;
          const stagger = (i % 4) * 0.05;
          return (
            <motion.circle
              key={`p-${i}`}
              r={1.6}
              fill="url(#warp-particle)"
              filter="url(#warp-blur)"
              initial={{ cx: x0, cy: y0, opacity: 0 }}
              animate={{
                cx: [x0, 100],
                cy: [y0, 100],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.75,
                ease: 'easeIn',
                delay: PRE_END / 1000 + 0.05 + stagger,
                times: [0, 0.15, 0.85, 1],
              }}
            />
          );
        })}
      </motion.svg>

      {/* ── Cast tail: thin vertical seam — the "warp out" beat. ── */}
      <motion.div
        className="fixed bg-violet-500"
        style={{
          left: '50%',
          top: '20%',
          width: '1px',
          height: '60%',
          marginLeft: '-0.5px',
          boxShadow: '0 0 12px rgba(139,92,246,0.85)',
        }}
        initial={{ opacity: 0, scaleY: 0, scaleX: 1 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scaleY: [0, 1, 1, 1],
          scaleX: [1, 1, 3, 6],
        }}
        transition={{
          duration: (POST_END - SEAM_AT) / 1000 + 0.1,
          delay: SEAM_AT / 1000,
          ease: 'easeOut',
          times: [0, 0.25, 0.6, 1],
        }}
        aria-hidden
      />
    </>
  );
};

export default Warp;
