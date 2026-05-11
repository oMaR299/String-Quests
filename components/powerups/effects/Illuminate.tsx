/**
 * Illuminate — Hint Reveal power-up's signature beam-of-light moment.
 *
 * Three phases (pre → cast → post), all orchestrated from a single mount-effect
 * with a timer-array ref for cleanup:
 *
 *   pre  (≈250 ms): 8 amber dots (4 corners + 4 mid-edges) glide inward toward
 *                   viewport center.
 *   cast (≈700 ms): a horizontal amber-gradient beam sweeps across the screen
 *                   (LTR or RTL based on `useI18n().locale`); ~200 ms in, a
 *                   short amber underline scales in & fades out below the card
 *                   area; ~50 ms in, `playSfx('chime')` fires.
 *   post (≈100 ms): dispatches REVEAL_HINT_FREE (which sets the flag the
 *                   QuizCard reads to auto-open the existing hint UI without
 *                   the 20% penalty), consumes the inventory item, then calls
 *                   `onComplete()`.
 *
 * Reduced-motion path: skip particles/beam/underline/sound, just dispatch
 * REVEAL_HINT_FREE + consume + onComplete after a 200 ms paint delay.
 *
 * The overlay container is `pointer-events: none`, and every motion element
 * here keeps it that way, so the visual never blocks taps on the QuizCard.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { EffectComponentProps } from './types';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import { useI18n } from '../../../contexts/I18nContext';
import { usePowerups } from '../../../hooks/usePowerups';
import { playSfx } from '../../../utils/sfx';

type Phase = 'pre' | 'cast' | 'post' | 'done';

// Pre-phase particle origins — 4 corners + 4 mid-edges, expressed as vw/vh
// percentages so they read correctly at any viewport size and don't need a
// resize listener. Each particle animates from its origin toward (50%, 50%).
const PARTICLE_ORIGINS: Array<{ x: string; y: string }> = [
  { x: '6%',  y: '8%'  },  // top-left
  { x: '50%', y: '4%'  },  // top-mid
  { x: '94%', y: '8%'  },  // top-right
  { x: '96%', y: '50%' },  // right-mid
  { x: '94%', y: '92%' },  // bottom-right
  { x: '50%', y: '96%' },  // bottom-mid
  { x: '6%',  y: '92%' },  // bottom-left
  { x: '4%',  y: '50%' },  // left-mid
];

const PRE_MS = 250;
const SFX_DELAY_MS = 50;     // into cast
const UNDERLINE_DELAY_MS = 200; // into cast
const BEAM_SWEEP_MS = 350;
const UNDERLINE_SCALE_MS = 200;
const UNDERLINE_FADE_MS = 200;
const CAST_MS = 700;
const POST_MS = 100;
const REDUCED_DELAY_MS = 200;

const Illuminate: React.FC<EffectComponentProps> = ({ entry, onComplete }) => {
  const { dispatch: quizDispatch } = useQuizSession();
  const { consume: consumePowerup } = usePowerups();
  const { locale } = useI18n();
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('pre');
  // Underline mounts ~200 ms into cast — separate flag so it can scale in
  // independently of the beam sweep without relying on staggered framer keys.
  const [showUnderline, setShowUnderline] = useState(false);

  const isRtl = locale === 'ar';

  // All timeouts captured here so the cleanup in the unmount path can clear
  // every pending tick — guards StrictMode double-invoke + early unmount on
  // queue drain.
  const timersRef = useRef<number[]>([]);
  // Idempotency guard — a second StrictMode-induced effect run must not
  // double-dispatch REVEAL_HINT_FREE / consume / onComplete.
  const completedRef = useRef(false);

  useEffect(() => {
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timersRef.current.push(id);
    };

    const finalize = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      // 1. Set the flag QuizCard reads to auto-open the hint card (no penalty).
      quizDispatch({ type: 'REVEAL_HINT_FREE' });
      // 2. Decrement inventory.
      consumePowerup('hint_reveal');
      // 3. Hand control back to the overlay (which will DEQUEUE_CAST).
      onComplete();
    };

    if (reduce) {
      // Reduced-motion: no theatrics, no SFX. Just a tiny paint delay so the
      // hint card opening lands on a fresh render instead of mid-mount.
      setPhase('cast');
      schedule(() => {
        setPhase('done');
        finalize();
      }, REDUCED_DELAY_MS);
      return () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }

    // pre → cast
    schedule(() => {
      setPhase('cast');
      // SFX shortly after the beam appears.
      schedule(() => {
        playSfx('chime');
      }, SFX_DELAY_MS);
      // Underline mounts ~200 ms into cast.
      schedule(() => setShowUnderline(true), UNDERLINE_DELAY_MS);
    }, PRE_MS);

    // cast → post → finalize
    schedule(() => {
      setPhase('post');
      schedule(() => {
        setPhase('done');
        finalize();
      }, POST_MS);
    }, PRE_MS + CAST_MS);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // Mount-only — entry.id keys the parent boundary, so identity here is
    // stable for the component's lifetime; deps are intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reduced-motion render: nothing visible (overlay is pointer-events-none
  // and aria-hidden, so silent is fine).
  if (reduce) return null;

  return (
    <>
      {/* PRE — converging amber dots (also stay visible into the cast phase
          briefly; they fade out as the beam fires). */}
      {(phase === 'pre' || phase === 'cast') && (
        <div className="pointer-events-none fixed inset-0">
          {PARTICLE_ORIGINS.map((origin, i) => (
            <motion.div
              key={`particle-${entry.id}-${i}`}
              initial={{
                left: origin.x,
                top: origin.y,
                opacity: 0,
                scale: 0.6,
              }}
              animate={
                phase === 'pre'
                  ? { left: '50%', top: '50%', opacity: 1, scale: 1 }
                  : { left: '50%', top: '50%', opacity: 0, scale: 1.2 }
              }
              transition={{
                duration: phase === 'pre' ? PRE_MS / 1000 : 0.18,
                ease: 'easeOut',
              }}
              // 6×6 px amber dot with a soft warm halo. Translate offsets the
              // dot so its center sits on the (left, top) anchor.
              style={{
                position: 'absolute',
                width: 6,
                height: 6,
                marginLeft: -3,
                marginTop: -3,
                borderRadius: 9999,
                boxShadow:
                  '0 0 12px 2px rgba(252, 211, 77, 0.65), 0 0 24px 6px rgba(251, 191, 36, 0.35)',
              }}
              className="bg-amber-300"
            />
          ))}
        </div>
      )}

      {/* CAST — horizontal amber-gradient beam sweeping across the viewport.
          Vertically centered (top: 50%, translateY(-50%)). RTL reverses the
          sweep direction. */}
      {phase === 'cast' && (
        <motion.div
          key={`beam-${entry.id}`}
          initial={{ x: isRtl ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: isRtl ? '-100%' : '100%', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: BEAM_SWEEP_MS / 1000,
            ease: 'easeInOut',
            opacity: { duration: BEAM_SWEEP_MS / 1000, times: [0, 0.15, 0.85, 1] },
          }}
          className="pointer-events-none fixed left-0 w-screen bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
          style={{
            top: '50%',
            height: 80,
            transform: 'translateY(-50%)',
            // A faint warm bloom outside the gradient strip.
            filter: 'drop-shadow(0 0 24px rgba(252, 211, 77, 0.5))',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* CAST — short amber underline beneath the card area. Positioned at
          ~60% viewport height so it reads as "under the question" without
          measuring the QuizCard. Scales-x in, then fades out. */}
      {phase === 'cast' && showUnderline && (
        <motion.div
          key={`underline-${entry.id}`}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: [1, 1, 0] }}
          transition={{
            scaleX: { duration: UNDERLINE_SCALE_MS / 1000, ease: 'easeOut' },
            opacity: {
              duration: (UNDERLINE_SCALE_MS + UNDERLINE_FADE_MS) / 1000,
              times: [0, UNDERLINE_SCALE_MS / (UNDERLINE_SCALE_MS + UNDERLINE_FADE_MS), 1],
            },
          }}
          className="pointer-events-none fixed bg-amber-200"
          style={{
            top: '60%',
            left: '15%',
            right: '15%',
            height: 4,
            borderRadius: 2,
            transformOrigin: isRtl ? 'right center' : 'left center',
            boxShadow: '0 0 10px 1px rgba(253, 230, 138, 0.85)',
          }}
        />
      )}
    </>
  );
};

export default Illuminate;
