/**
 * Annihilate — cinematic effect for the 50/50 power-up (`fifty_fifty`).
 *
 * Plays out in 3 phases over ~1.0–1.2 s wall-clock:
 *   pre   (≈250 ms): brief jitter on the 2 wrong-option tiles the bar pre-
 *                    selected via `entry.hiddenIndices`.
 *   cast  (≈600 ms): canvas-confetti burst from each tile centre + a CSS
 *                    shockwave ring + the tile dissolves (opacity → 0,
 *                    scale → 0.92). Shatter SFX fires ~50 ms in.
 *   post  (≈100 ms): dispatch APPLY_5050 (canonical hide), consume the
 *                    inventory item, call onComplete (overlay dequeues).
 *
 * Reduced-motion path: skip jitter/confetti/shockwave/SFX. Just fade the
 * 2 tiles to 0 opacity over 200 ms via inline style, then dispatch.
 *
 * Robustness:
 *   - Missing/empty `entry.hiddenIndices` → dispatch + complete, no visuals.
 *   - DOM tiles not found (question changed mid-cast) → same fail-safe.
 *   - All timers tracked in a ref array & cleared on unmount.
 *   - Confetti instance is `confetti.reset()`-ed before unmount.
 */

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';
import type { EffectComponentProps } from './types';

interface ShockwaveSpec {
  key: string;
  cx: number;
  cy: number;
}

const PARTICLE_COLORS = ['#8B5CF6', '#A78BFA', '#F87171', '#94A3B8', '#FBBF24'];

const Annihilate: React.FC<EffectComponentProps> = ({ entry, onComplete }) => {
  const { dispatch: quizDispatch, currentQuestion } = useQuizSession();
  const { consume } = usePowerups();
  const reduce = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstanceRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const timersRef = useRef<number[]>([]);
  // Idempotency guard against StrictMode double-mount double-dispatch.
  const completedRef = useRef(false);
  // Track tiles whose inline styles we mutated so cleanup can clear them
  // even if we unmount before the post-phase tick (queue drain, parent unmount).
  const mutatedTargetsRef = useRef<HTMLElement[]>([]);
  const [shockwaves, setShockwaves] = React.useState<ShockwaveSpec[]>([]);

  // Single mount-effect orchestrates all 3 phases.
  // Intentional empty-deps: this fires exactly once per cast (the overlay
  // remounts via key=entry.id).
  useEffect(() => {
    const schedule = (cb: () => void, ms: number) => {
      const id = window.setTimeout(cb, ms);
      timersRef.current.push(id);
      return id;
    };

    const finalize = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      // Belt-and-braces: only apply hidden indices if we're still on the same
      // question. The bar serializes activations behind the confirm dialog so
      // this should never be false in practice, but guards us against a future
      // change that lets multiple casts queue across question boundaries.
      const sameQuestion =
        entry.questionId === undefined ||
        currentQuestion?.id === entry.questionId;
      if (
        sameQuestion &&
        entry.hiddenIndices &&
        entry.hiddenIndices.length > 0
      ) {
        quizDispatch({
          type: 'APPLY_5050',
          payload: { hiddenIndices: entry.hiddenIndices },
        });
      }
      consume('fifty_fifty');
      onComplete();
    };

    const indices = entry.hiddenIndices ?? [];

    // Fail-safe: nothing to annihilate.
    if (indices.length === 0) {
      finalize();
      return;
    }

    // Resolve the 2 target tiles from the DOM.
    const allTiles = Array.from(
      document.querySelectorAll<HTMLElement>('[data-option-index]')
    );
    const targets: HTMLElement[] = [];
    for (const idx of indices) {
      const el = allTiles.find(
        (n) => Number(n.getAttribute('data-option-index')) === idx
      );
      if (el) targets.push(el);
    }

    // Fail-safe: question swapped under us — just commit & complete.
    if (targets.length === 0) {
      finalize();
      return;
    }

    // ---- Reduced-motion path ----
    if (reduce) {
      mutatedTargetsRef.current = targets;
      for (const el of targets) {
        el.style.transition = 'opacity 200ms ease-out';
        el.style.opacity = '0';
      }
      schedule(() => {
        // Restore inline styles so the canonical APPLY_5050 styling can take
        // over without leftover overrides.
        for (const el of targets) {
          el.style.transition = '';
          el.style.opacity = '';
        }
        finalize();
      }, 220);
      return;
    }

    // Capture rects once — used for both confetti origins and shockwaves.
    const rects = targets.map((el) => el.getBoundingClientRect());

    // Pre-create the confetti instance bound to our overlay canvas.
    if (canvasRef.current) {
      confettiInstanceRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: false,
      });
    }

    // ---- Phase: pre (jitter) — 0 → 250 ms ----
    mutatedTargetsRef.current = targets;
    for (const el of targets) {
      el.style.transition = 'transform 60ms ease-in-out';
    }
    const jitter = [-4, 4, -3, 3, 0];
    jitter.forEach((dx, i) => {
      schedule(() => {
        for (const el of targets) {
          el.style.transform = `translateX(${dx}px)`;
        }
      }, 50 * (i + 1));
    });

    // ---- Phase: cast — 250 → 850 ms ----
    const CAST_START = 250;

    // Shatter SFX ~50 ms into cast.
    schedule(() => playSfx('shatter'), CAST_START + 50);

    // Mount the shockwave rings and fire confetti bursts.
    schedule(() => {
      const waves: ShockwaveSpec[] = rects.map((r, i) => ({
        key: `${entry.id}-${i}`,
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
      }));
      setShockwaves(waves);

      const inst = confettiInstanceRef.current;
      if (inst) {
        for (const r of rects) {
          const x = (r.left + r.width / 2) / window.innerWidth;
          const y = (r.top + r.height / 2) / window.innerHeight;
          inst({
            particleCount: 18,
            startVelocity: 25,
            scalar: 0.6,
            spread: 60,
            ticks: 60,
            origin: { x, y },
            colors: PARTICLE_COLORS,
            disableForReducedMotion: true,
          });
        }
      }
    }, CAST_START);

    // Tile dissolve starts 100 ms into cast (so the burst leads visually).
    schedule(() => {
      for (const el of targets) {
        el.style.transition = 'opacity 250ms ease-out, transform 250ms ease-out';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.92)';
      }
    }, CAST_START + 100);

    // ---- Phase: post — 850 → 950 ms ----
    schedule(() => {
      // Reset inline overrides BEFORE APPLY_5050 so QuizCard's own animation
      // (opacity 1 → 0.3 for hidden tiles) can take over cleanly.
      for (const el of targets) {
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
      }
      finalize();
    }, 950);

    // (cleanup is in the next, separate effect to keep the orchestration
    // self-contained.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dedicated cleanup — runs on unmount, drains timers + tears down the
  // confetti instance so a fast re-cast can't leak particles. Also clears
  // any inline-style overrides left on target tiles if we unmounted before
  // the post-phase tick had a chance to restore them (queue drain, parent
  // unmount), so APPLY_5050's canonical styling isn't double-stamped.
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      for (const el of mutatedTargetsRef.current) {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
      }
      mutatedTargetsRef.current = [];
      const inst = confettiInstanceRef.current;
      if (inst) {
        try {
          inst.reset();
        } catch {
          /* never break the UI on confetti teardown */
        }
        confettiInstanceRef.current = null;
      }
    };
  }, []);

  // No DOM at all when reduced-motion (we just mutate target tiles directly).
  if (reduce) return null;

  return (
    <>
      {/* Full-viewport confetti canvas. Pointer-events disabled (overlay is
          already pointer-events-none, but explicit is safer). */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
        aria-hidden
      />

      {/* Per-tile shockwave rings — animated via Framer Motion. */}
      {shockwaves.map((w) => (
        <motion.div
          key={w.key}
          aria-hidden
          className="fixed pointer-events-none rounded-full"
          style={{
            left: w.cx - 4,
            top: w.cy - 4,
            width: 8,
            height: 8,
            border: '2px solid rgba(167, 139, 250, 0.85)',
            boxShadow: '0 0 12px rgba(167, 139, 250, 0.55)',
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      ))}
    </>
  );
};

export default Annihilate;
