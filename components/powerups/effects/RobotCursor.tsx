/**
 * RobotCursor — cinematic effect for the Auto-Complete power-up (`auto_complete`).
 *
 * The user said it best: "I want a mouse to go to the question and answer it."
 * That's literally what this does. An animated arrow cursor flies in from the
 * top corner along a curved Bezier path, lands on the correct-answer tile,
 * "clicks" it (mousedown squish + ripple ring), and then a glass "🤖
 * Auto-solved" pill flashes briefly before the quiz advances.
 *
 * Plays out in 3 phases over ~1.5 s wall-clock:
 *   pre   (≈250 ms): cursor fades in at the top corner with 3 small "+"
 *                    particles popping outward (announces the cursor's arrival).
 *   cast  (≈850 ms): cursor walks along a 3-point Bezier curve (start → mid →
 *                    target) using Framer Motion's keyframed `x`/`y` props.
 *                    At ~700 ms in (when cursor is on target) it scales
 *                    1 → 0.85 → 1 (mousedown squish), a violet ripple ring
 *                    expands outward, and `click_success` SFX fires.
 *   post  (≈600 ms): glass "🤖 Auto-solved" pill renders at the click point.
 *                    Dispatches AUTO_COMPLETE_QUESTION (sets perfect-bonus
 *                    disqualified) → consume('auto_complete') → ANSWER (with
 *                    points: 0 — answer recorded as a synthetic) →
 *                    onComplete() (overlay dequeues).
 *
 * Spatial targeting:
 *   - `correctAnswerRect` (forwarded by PowerupCastOverlay) is the centre point
 *     the cursor walks to. For non-multi-choice questions the rect is null and
 *     we fall back to viewport centre.
 *
 * RTL:
 *   - In Arabic the cursor STARTS at the top-start corner (which in RTL is
 *     the visual left edge). LTR starts at top-end (right edge).
 *
 * Reduced-motion path:
 *   - Skip cursor walk + ripple + particles + SFX. Just flash the pill at the
 *     click point for 200 ms, then run the same dispatch pipeline.
 *
 * Robustness:
 *   - Missing `entry.questionId` → still dispatch AUTO_COMPLETE_QUESTION +
 *     consume + onComplete, skip the ANSWER (caller has no question to advance).
 *   - Off-screen / weird rects → start/target are clamped to viewport bounds.
 *   - All timers tracked in a ref array, drained on unmount.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { useI18n } from '../../../contexts/I18nContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';
import type { EffectComponentProps } from './types';

interface Point {
  x: number;
  y: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const RobotCursor: React.FC<EffectComponentProps> = ({
  entry,
  onComplete,
  correctAnswerRect,
}) => {
  const { dispatch: quizDispatch } = useQuizSession();
  const { consume } = usePowerups();
  const { locale } = useI18n();
  const reduce = useReducedMotion();

  const timersRef = useRef<number[]>([]);
  // Idempotency guard against StrictMode double-mount double-dispatch.
  const completedRef = useRef(false);
  const [showCursor, setShowCursor] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showPill, setShowPill] = useState(false);

  // Resolve start + target points once per cast. `useMemo` so the Bezier
  // keyframes don't churn between renders (Framer would otherwise restart
  // the tween).
  const { start, mid, target } = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

    // Target = correct-answer tile centre, or viewport centre as fallback.
    const rawTarget: Point = correctAnswerRect
      ? {
          x: correctAnswerRect.left + correctAnswerRect.width / 2,
          y: correctAnswerRect.top + correctAnswerRect.height / 2,
        }
      : { x: vw / 2, y: vh / 2 };

    const t: Point = {
      x: clamp(rawTarget.x, 20, vw - 20),
      y: clamp(rawTarget.y, 20, vh - 20),
    };

    // RTL: cursor starts at top-start (visual left). LTR: top-end (visual right).
    const s: Point =
      locale === 'ar'
        ? { x: clamp(60, 20, vw - 20), y: 60 }
        : { x: clamp(vw - 60, 20, vw - 20), y: 60 };

    // Mid control point — arc upward over both endpoints.
    const m: Point = {
      x: (s.x + t.x) / 2,
      y: clamp(Math.min(s.y, t.y) - 80, 0, vh),
    };

    return { start: s, mid: m, target: t };
  }, [correctAnswerRect, locale]);

  // Single mount-effect orchestrates all 3 phases.
  // Empty deps: this fires exactly once per cast (overlay remounts via
  // key=entry.id).
  useEffect(() => {
    const schedule = (cb: () => void, ms: number) => {
      const id = window.setTimeout(cb, ms);
      timersRef.current.push(id);
      return id;
    };

    // Order matters: AUTO_COMPLETE_QUESTION sets the perfect-bonus
    // disqualified flag and pushes 'auto_complete' into
    // powerupsUsedThisArtifact BEFORE the synthetic ANSWER advances the
    // quiz. Reordering would let ANSWER fire on a question that hasn't yet
    // been marked auto-completed, breaking the end-screen tally.
    const finalize = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      quizDispatch({ type: 'AUTO_COMPLETE_QUESTION' });
      consume('auto_complete');
      if (entry.questionId !== undefined) {
        quizDispatch({
          type: 'ANSWER',
          payload: { points: 0, questionId: entry.questionId },
        });
      }
      onComplete();
    };

    // ---- Reduced-motion path ----
    if (reduce) {
      setShowPill(true);
      schedule(() => {
        setShowPill(false);
        finalize();
      }, 200);
      return;
    }

    // ---- Phase: pre — 0 → 250 ms ----
    setShowCursor(true);
    setShowParticles(true);
    schedule(() => setShowParticles(false), 260);

    // ---- Phase: cast — 250 → 1100 ms ----
    // Framer Motion handles the Bezier walk via the cursor's `animate` prop
    // (see JSX). We just schedule the click moment side-effects.
    const CAST_START = 250;
    const CLICK_AT = CAST_START + 700; // ≈950 ms in — cursor reaches target.

    schedule(() => {
      playSfx('click_success');
      setShowRipple(true);
    }, CLICK_AT);

    // Ripple lifetime ~350 ms, then unmount it.
    schedule(() => setShowRipple(false), CLICK_AT + 360);

    // ---- Phase: post — 1100 → 1500 ms ----
    schedule(() => {
      setShowPill(true);
    }, CLICK_AT + 50);

    // Pill linger ~600 ms, then dispatch + complete.
    schedule(() => {
      setShowPill(false);
      finalize();
    }, CLICK_AT + 550);

    // (cleanup is in the next, separate effect to keep the orchestration
    // self-contained.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dedicated cleanup — runs on unmount, drains timers so a fast re-cast
  // can't fire stale callbacks against an unmounted tree.
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  // Reduced-motion render path: pill only, no cursor/ripple/particles.
  if (reduce) {
    if (!showPill) return null;
    return (
      <div
        aria-hidden
        className="fixed pointer-events-none rounded-full bg-white/85 backdrop-blur-sm border border-white/70 px-3 py-1 text-xs font-bold text-violet-700 shadow-lg"
        style={{
          left: target.x,
          top: target.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        🤖 Auto-solved
      </div>
    );
  }

  return (
    <>
      {/* Cursor — animated SVG arrow walking the Bezier curve. */}
      {showCursor && (
        <motion.svg
          aria-hidden
          width={16}
          height={24}
          viewBox="0 0 16 24"
          className="fixed pointer-events-none"
          style={{
            left: 0,
            top: 0,
            // Hotspot (the SVG tip) sits at (1, 1) in viewBox coords. The
            // x/y animation positions the SVG's top-left, so to land the tip
            // exactly on `target` we offset by the hotspot.
            transformOrigin: '1px 1px',
            filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))',
          }}
          initial={{ x: start.x - 1, y: start.y - 1, opacity: 0, scale: 0.6 }}
          animate={{
            x: [start.x - 1, mid.x - 1, target.x - 1, target.x - 1, target.x - 1],
            y: [start.y - 1, mid.y - 1, target.y - 1, target.y - 1, target.y - 1],
            opacity: [0, 1, 1, 1, 1],
            scale: [0.6, 1, 1, 0.85, 1],
          }}
          transition={{
            // First 3 keyframes spread across the 700 ms walk; last 2
            // perform the click squish at the very end.
            x: { duration: 0.7, times: [0, 0.5, 1, 1, 1], ease: [0.4, 0, 0.2, 1] },
            y: { duration: 0.7, times: [0, 0.5, 1, 1, 1], ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.7, times: [0, 0.2, 0.5, 1, 1] },
            scale: {
              duration: 0.78,
              times: [0, 0.25, 0.9, 0.95, 1],
              ease: 'easeOut',
            },
          }}
        >
          {/* Classic mouse-cursor arrow — black outline, white fill. */}
          <path
            d="M1 1 L1 18 L5 14 L8 22 L11 21 L8 13 L14 13 Z"
            fill="#FFFFFF"
            stroke="#0A0A0B"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </motion.svg>
      )}

      {/* Pre-phase particles — 3 small "+" pops outward from the cursor's
          start position. */}
      {showParticles &&
        [-1, 0, 1].map((i) => (
          <motion.div
            key={`p-${entry.id}-${i}`}
            aria-hidden
            className="fixed pointer-events-none flex items-center justify-center text-white font-bold"
            style={{
              left: start.x - 3,
              top: start.y - 3,
              width: 6,
              height: 6,
              fontSize: 8,
              lineHeight: 1,
              color: '#FFFFFF',
              textShadow: '0 0 4px rgba(139, 92, 246, 0.9)',
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: i * 14,
              y: -8 + Math.abs(i) * 4,
              opacity: [0, 1, 0],
              scale: [0.4, 1.2, 0.6],
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            +
          </motion.div>
        ))}

      {/* Click ripple — violet ring expanding outward at the click point. */}
      {showRipple && (
        <motion.div
          aria-hidden
          className="fixed pointer-events-none rounded-full"
          style={{
            left: target.x - 6,
            top: target.y - 6,
            width: 12,
            height: 12,
            border: '2px solid rgba(139, 92, 246, 0.7)',
            boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)',
          }}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      )}

      {/* Post-phase pill — glass "🤖 Auto-solved" chip at the click point. */}
      {showPill && (
        <motion.div
          aria-hidden
          className="fixed pointer-events-none rounded-full bg-white/85 backdrop-blur-sm border border-white/70 px-3 py-1 text-xs font-bold text-violet-700 shadow-lg whitespace-nowrap"
          style={{
            left: target.x,
            top: target.y,
          }}
          initial={{ x: '-50%', y: '-50%', opacity: 0, scale: 0.8 }}
          animate={{ x: '-50%', y: '-50%', opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          🤖 Auto-solved
        </motion.div>
      )}
    </>
  );
};

export default RobotCursor;
