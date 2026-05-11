/**
 * EraserSweep — cinematic effect for the Eraser power-up.
 *
 * The metaphor: a chalkboard eraser swipes across the hearts row in the
 * lesson header, dust scatters, and the next-to-restore heart slot pops back
 * in with a small sparkle ring. Three phases (~1.4 s wall-clock):
 *
 *   pre  (≈200 ms): a stylized eraser sprite (small SVG rectangle with a
 *                   yellow holder stripe) drops in from below the viewport and
 *                   arcs up to one edge of the hearts row.
 *   cast (≈800 ms): the eraser sweeps across the row (right→left in LTR,
 *                   left→right in RTL — it's "erasing" the gap left by the
 *                   lost heart). Behind it, ~10 small grey "chalk dust"
 *                   particles fall and fade. Eraser SFX fires ~50 ms in.
 *                   At ~600 ms in (sweep complete) a 6-dot white sparkle ring
 *                   blooms at the next-to-restore slot, and a Heart icon
 *                   pops in with scale 0 → 1.2 → 1.0.
 *   post (≈100 ms): dispatches REGEN_HEART (UserContext, caps at maxHearts),
 *                   consume('eraser'), onComplete (overlay dequeues).
 *
 * Spatial targeting:
 *   - Reads the hearts-row bounding rect via
 *     `document.querySelector('[data-hearts-row]')?.getBoundingClientRect()`.
 *     QuizSessionPage attaches that data-attr to the `renderHearts()` div.
 *   - Computes the next-to-restore slot index = userState.hearts (the slot
 *     about to be regenerated, 0-indexed). Slot center = rect.left +
 *     rect.width * (slot + 0.5) / maxHearts.
 *
 * Reduced-motion path: skip eraser sprite + sweep + dust + sparkle. Just pop
 * the Heart icon at the right slot for 200 ms, dispatch + complete, no SFX.
 *
 * RTL: sweep direction flips via useI18n().locale === 'ar'.
 *
 * Robustness:
 *   - Hearts-row not found in DOM → still dispatch + consume + complete, no
 *     visuals. (Defensive against header re-renders.)
 *   - hearts === maxHearts already → still dispatch (REGEN_HEART caps at max),
 *     skip the sparkle ring + heart pop (nothing to restore visually).
 *   - All timers tracked in a ref array & cleared on unmount.
 *   - completedRef guard against StrictMode double-mount double-dispatch.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { useUser } from '../../../contexts/UserContext';
import { useI18n } from '../../../contexts/I18nContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';
import type { EffectComponentProps } from './types';

interface Point { x: number; y: number; }

interface DustSpec {
  key: string;
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
}

// Phase boundaries (ms from mount).
const PRE_MS = 200;
const SFX_DELAY_MS = 50;     // into cast
const SWEEP_MS = 600;
const RESTORE_AT_MS = SWEEP_MS; // ms into cast — sparkle + heart pop fires here
const CAST_MS = 800;
const POST_MS = 100;
const REDUCED_DELAY_MS = 200;

// Eraser sprite dimensions (viewport-pixel units).
const ERASER_W = 40;
const ERASER_H = 24;

// Sparkle ring geometry (6 dots in a circle around the heart slot).
const SPARKLE_DOTS = 6;
const SPARKLE_RADIUS = 24;

// Chalk-dust particle count.
const DUST_COUNT = 10;

// We don't have direct access to entry.questionId here, but for unique React
// keys across multiple casts we use the entry id via props.

// correctAnswerRect intentionally unused — only RobotCursor needs it.
const EraserSweep: React.FC<EffectComponentProps> = ({ entry, onComplete }) => {
  const { dispatch: quizDispatch } = useQuizSession();
  const { state: userState, dispatch: userDispatch } = useUser();
  const { consume: consumePowerup } = usePowerups();
  const { locale } = useI18n();
  const reduce = useReducedMotion();

  const isRtl = locale === 'ar';
  const timersRef = useRef<number[]>([]);
  // Idempotency guard against StrictMode double-mount double-dispatch.
  const completedRef = useRef(false);

  const [phase, setPhase] = useState<'pre' | 'cast' | 'post' | 'done'>('pre');
  // Toggled at RESTORE_AT into cast — gates the sparkle + heart pop.
  const [showRestore, setShowRestore] = useState(false);

  // Resolve hearts-row geometry & target slot center exactly once per cast.
  // Reading layout in a useMemo is safe here because the cast queue always
  // mounts during a paint where the playing UI (and the hearts row) is
  // already in the DOM. If not found, we degrade gracefully.
  const geometry = useMemo<{
    rect: DOMRect | null;
    slotCenter: Point | null;
    sweepStart: Point | null;
    sweepEnd: Point | null;
    eraserStart: Point | null;
    canRestore: boolean;
  }>(() => {
    if (typeof document === 'undefined') {
      return { rect: null, slotCenter: null, sweepStart: null, sweepEnd: null, eraserStart: null, canRestore: false };
    }
    const node = document.querySelector('[data-hearts-row]') as HTMLElement | null;
    if (!node) {
      return { rect: null, slotCenter: null, sweepStart: null, sweepEnd: null, eraserStart: null, canRestore: false };
    }
    const rect = node.getBoundingClientRect();
    const cy = rect.top + rect.height / 2;
    // The next-to-restore slot. If hearts === maxHearts (already full), we
    // can't visually restore but REGEN_HEART caps cleanly.
    const slot = Math.min(userState.hearts, userState.maxHearts - 1);
    const canRestore = userState.hearts < userState.maxHearts;
    const slotX = rect.left + rect.width * ((slot + 0.5) / userState.maxHearts);

    // Sweep direction: LTR sweeps right→left ("erases" toward the gap on
    // the left); RTL flips. The eraser starts at the trailing edge.
    const sweepStart: Point = isRtl
      ? { x: rect.left, y: cy }
      : { x: rect.right, y: cy };
    const sweepEnd: Point = isRtl
      ? { x: rect.right, y: cy }
      : { x: rect.left, y: cy };

    // Pre-phase eraser arrival point: from below the viewport, arcing up.
    const eraserStart: Point = {
      x: sweepStart.x,
      y: typeof window !== 'undefined' ? window.innerHeight + ERASER_H : cy + 200,
    };

    return {
      rect,
      slotCenter: { x: slotX, y: cy },
      sweepStart,
      sweepEnd,
      eraserStart,
      canRestore,
    };
  // userState.hearts/maxHearts are values at mount-time; cast lifetime is short
  // and we want a stable target — intentionally omit deps to avoid re-running.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-compute chalk-dust offsets so they stay stable across re-renders.
  const dust = useMemo<DustSpec[]>(() => {
    if (!geometry.rect) return [];
    const out: DustSpec[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      out.push({
        key: `dust-${entry.id}-${i}`,
        // Distribute spawn x evenly across the sweep span.
        baseX: 0,
        baseY: 0,
        dx: (Math.random() - 0.5) * 18,
        dy: 8 + Math.random() * 22,
        delay: Math.random() * (SWEEP_MS / 1000) * 0.85,
        size: 2 + Math.floor(Math.random() * 2), // 2 or 3 px
      });
    }
    return out;
  }, [entry.id, geometry.rect]);

  useEffect(() => {
    const schedule = (cb: () => void, ms: number) => {
      const id = window.setTimeout(cb, ms);
      timersRef.current.push(id);
    };

    const finalize = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      // 1. Mutation: REGEN_HEART (UserContext caps at maxHearts).
      userDispatch({ type: 'REGEN_HEART' });
      // 2. Decrement inventory.
      consumePowerup('eraser');
      // 3. Hand control back to the overlay (which DEQUEUE_CASTs).
      onComplete();
    };

    // ---- Reduced-motion path ----
    if (reduce) {
      // Render heart pop only (no sweep, no dust, no SFX).
      if (geometry.canRestore && geometry.slotCenter) {
        setShowRestore(true);
      }
      schedule(() => {
        setPhase('done');
        finalize();
      }, REDUCED_DELAY_MS);
      return;
    }

    // ---- Fail-safe: hearts row not findable → dispatch + complete cleanly ----
    if (!geometry.rect || !geometry.sweepStart) {
      schedule(finalize, REDUCED_DELAY_MS);
      return;
    }

    // ---- Phase: pre — 0 → 200 ms ----
    // (eraser sprite renders via JSX while phase === 'pre')

    // ---- Phase: cast — 200 → 1000 ms ----
    schedule(() => {
      setPhase('cast');
      schedule(() => playSfx('eraser'), SFX_DELAY_MS);
      // Trigger the restore visuals at the end of the sweep.
      if (geometry.canRestore) {
        schedule(() => setShowRestore(true), RESTORE_AT_MS);
      }
    }, PRE_MS);

    // ---- Phase: post — 1000 → 1100 ms (dispatch + complete) ----
    schedule(() => {
      setPhase('post');
    }, PRE_MS + CAST_MS);

    schedule(() => {
      setPhase('done');
      finalize();
    }, PRE_MS + CAST_MS + POST_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dedicated cleanup — drains timers on unmount.
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  // ─── Reduced-motion render: heart pop only ────────────────────────────
  if (reduce) {
    if (!showRestore || !geometry.slotCenter) return null;
    return (
      <motion.div
        aria-hidden
        className="fixed pointer-events-none"
        style={{
          left: geometry.slotCenter.x,
          top: geometry.slotCenter.y,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <Heart size={20} className="text-red-500 fill-red-500" />
      </motion.div>
    );
  }

  // ─── Full cinematic render ────────────────────────────────────────────
  if (phase === 'done' || !geometry.rect || !geometry.sweepStart || !geometry.sweepEnd || !geometry.eraserStart) {
    return null;
  }

  // Eraser current position over the cast: animated via Framer's keyframes.
  // pre: rises from below to sweepStart; cast: traverses sweepStart → sweepEnd.
  const eraserAnim =
    phase === 'pre'
      ? {
          x: [geometry.eraserStart.x - ERASER_W / 2, geometry.sweepStart.x - ERASER_W / 2],
          y: [geometry.eraserStart.y - ERASER_H / 2, geometry.sweepStart.y - ERASER_H / 2 - 30, geometry.sweepStart.y - ERASER_H / 2],
          opacity: [0, 1, 1],
        }
      : phase === 'cast'
      ? {
          x: [geometry.sweepStart.x - ERASER_W / 2, geometry.sweepEnd.x - ERASER_W / 2],
          y: [geometry.sweepStart.y - ERASER_H / 2, geometry.sweepEnd.y - ERASER_H / 2],
          opacity: [1, 1, 0],
        }
      : { x: 0, y: 0, opacity: 0 };

  const eraserTransition =
    phase === 'pre'
      ? { duration: PRE_MS / 1000, ease: 'easeOut' as const, times: [0, 0.6, 1] }
      : phase === 'cast'
      ? { duration: SWEEP_MS / 1000, ease: 'easeInOut' as const, opacity: { duration: CAST_MS / 1000, times: [0, SWEEP_MS / CAST_MS, 1] } }
      : { duration: 0 };

  return (
    <>
      {/* Eraser sprite — small SVG rectangle with a yellow holder stripe. */}
      {(phase === 'pre' || phase === 'cast') && (
        <motion.svg
          key={`eraser-${entry.id}`}
          aria-hidden
          width={ERASER_W}
          height={ERASER_H}
          viewBox="0 0 40 24"
          className="fixed pointer-events-none"
          style={{
            left: 0,
            top: 0,
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.18))',
          }}
          initial={{
            x: geometry.eraserStart.x - ERASER_W / 2,
            y: geometry.eraserStart.y - ERASER_H / 2,
            opacity: 0,
          }}
          animate={eraserAnim}
          transition={eraserTransition}
        >
          {/* Body: light slate eraser. */}
          <rect
            x={0.75}
            y={0.75}
            width={38.5}
            height={22.5}
            rx={4}
            fill="#94A3B8"
            stroke="#64748B"
            strokeWidth={1.5}
          />
          {/* Holder stripe across the top. */}
          <rect x={2} y={2} width={36} height={6} rx={2} fill="#FBBF24" />
        </motion.svg>
      )}

      {/* Chalk dust — small grey particles trailing the sweep. */}
      {phase === 'cast' && geometry.sweepStart && geometry.sweepEnd && (
        <>
          {dust.map((d, i) => {
            // Spawn x interpolates evenly across the sweep span; spawn y is
            // the row centerline.
            const t = i / Math.max(1, dust.length - 1);
            const spawnX = geometry.sweepStart!.x + (geometry.sweepEnd!.x - geometry.sweepStart!.x) * t;
            const spawnY = geometry.sweepStart!.y;
            return (
              <motion.div
                key={d.key}
                aria-hidden
                className="fixed pointer-events-none rounded-full bg-slate-300"
                style={{
                  left: spawnX - d.size / 2,
                  top: spawnY - d.size / 2,
                  width: d.size,
                  height: d.size,
                  boxShadow: '0 0 2px rgba(148, 163, 184, 0.5)',
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: d.dx, y: d.dy, opacity: [0, 0.8, 0] }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: d.delay,
                  times: [0, 0.3, 1],
                }}
              />
            );
          })}
        </>
      )}

      {/* Sparkle ring + heart pop at the restore slot. */}
      {showRestore && geometry.slotCenter && (
        <>
          {/* 6-dot sparkle ring blooming outward. */}
          {Array.from({ length: SPARKLE_DOTS }).map((_, i) => {
            const angle = (i / SPARKLE_DOTS) * Math.PI * 2;
            const dx = Math.cos(angle) * SPARKLE_RADIUS;
            const dy = Math.sin(angle) * SPARKLE_RADIUS;
            return (
              <motion.div
                key={`sparkle-${entry.id}-${i}`}
                aria-hidden
                className="fixed pointer-events-none rounded-full bg-white"
                style={{
                  left: geometry.slotCenter!.x - 2,
                  top: geometry.slotCenter!.y - 2,
                  width: 4,
                  height: 4,
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(252, 211, 77, 0.6)',
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0.9 }}
                animate={{ x: dx, y: dy, scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            );
          })}

          {/* Heart pop — matches the existing red hearts UI. */}
          <motion.div
            key={`heart-${entry.id}`}
            aria-hidden
            className="fixed pointer-events-none"
            style={{
              left: geometry.slotCenter.x,
              top: geometry.slotCenter.y,
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.55))',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 0.3, ease: 'easeOut', times: [0, 0.6, 1] }}
          >
            <Heart size={20} className="text-red-500 fill-red-500" />
          </motion.div>
        </>
      )}
    </>
  );
};

export default EraserSweep;
