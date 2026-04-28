// StringMotif — the String mascot. A friendly mochi/jellybean character.
//
// Design notes:
//   - The body is a chubby, asymmetric blob — coral on top, slightly darker
//     coral cast on the bottom for a soft 3D feel. Looks like a soft pillow,
//     NOT a logo or geometric knot.
//   - Big rounded white eyes with positioned dark pupils + a small white
//     "shine" highlight on each pupil. Pupils gently track the cursor on
//     desktop and drift on a sin/cos timer when there's no pointer.
//   - Eyebrows (thin slate strokes) animate per mood — raise on welcoming,
//     furrow slightly on thinking.
//   - Tiny rounded arms and feet poke out from the body. Arms wave on
//     welcoming, raise overhead on celebrating, hand-on-chin on thinking.
//   - Mouth path is mood-dependent: smile curve, neutral line, small "o",
//     wide grin.
//   - Whole character breathes (subtle scale 0.985..1.015) and blinks every
//     4-7s. All continuous animation guarded by useReducedMotion.
//
// Sizes: hero (~180px) for screen 1, lg/md (~110px) for corner companions,
// sm (~64px) for compact placements.

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

export type MascotMood = 'idle' | 'welcoming' | 'celebrating' | 'thinking' | 'proud';
export type MascotSize = 'sm' | 'md' | 'lg' | 'hero';

interface StringMotifProps {
  mood?: MascotMood;
  size?: MascotSize;
  className?: string;
  trackPointer?: boolean;
}

const SIZE_MAP: Record<MascotSize, number> = {
  sm:   64,
  md:   110,
  lg:   140,
  hero: 180,
};

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// Per-mood geometry — eyes, brows, mouth, arms.
// All coordinates are in a 200×200 viewBox so scaling is uniform.
// ---------------------------------------------------------------------------
//
// Body center: (100, 105). Eyes sit around y≈92, mouth around y≈122.
// Arms extend out from x≈40 (left) and x≈160 (right), at y≈115.

interface MoodGeometry {
  // Eye scale-Y (1=open, <1=squinty, ~0=closed). Smile curves use ~0.55.
  eyeScaleY: number;
  // Pupil vertical bias for thinking poses (e.g. looking up).
  pupilOffsetY: number;
  // Brow path — two SVG strings, one per brow.
  browLeft: string;
  browRight: string;
  // Mouth path.
  mouth: string;
  // Arm rotations (degrees).
  armLeftRotate: number;
  armRightRotate: number;
  // Optional left/right hand offsets (for "hand to chin" thinking pose).
  handLeftDx?: number;
  handLeftDy?: number;
  handRightDx?: number;
  handRightDy?: number;
}

const IDLE: MoodGeometry = {
  eyeScaleY: 1,
  pupilOffsetY: 0,
  browLeft:  'M 70 78 Q 78 76 86 78',
  browRight: 'M 114 78 Q 122 76 130 78',
  mouth:     'M 86 122 Q 100 130 114 122',
  armLeftRotate: 18,
  armRightRotate: -18,
};

const WELCOMING: MoodGeometry = {
  eyeScaleY: 0.85,
  pupilOffsetY: 0,
  browLeft:  'M 70 76 Q 78 71 86 75',
  browRight: 'M 114 75 Q 122 71 130 76',
  mouth:     'M 84 120 Q 100 134 116 120',
  // Arms slightly out, like a friendly "hi"
  armLeftRotate: 38,
  armRightRotate: -38,
};

const THINKING: MoodGeometry = {
  eyeScaleY: 0.95,
  pupilOffsetY: -2.5,
  // Brows angled inward — pondering
  browLeft:  'M 70 80 Q 78 74 86 78',
  browRight: 'M 114 78 Q 122 74 130 80',
  // Small "o" mouth — using an ellipse-like curve
  mouth:     'M 95 122 Q 100 128 105 122 Q 100 116 95 122 Z',
  // Right arm raised "to chin"
  armLeftRotate: 14,
  armRightRotate: -120,
  handRightDx: 2,
  handRightDy: -16,
};

const CELEBRATING: MoodGeometry = {
  eyeScaleY: 0.55,
  pupilOffsetY: 0,
  // Brows raised — happy surprise
  browLeft:  'M 70 73 Q 78 68 86 73',
  browRight: 'M 114 73 Q 122 68 130 73',
  // Wide open grin
  mouth:     'M 80 118 Q 100 138 120 118 Q 100 132 80 118 Z',
  // Arms straight up overhead
  armLeftRotate: 145,
  armRightRotate: -145,
};

const PROUD: MoodGeometry = {
  eyeScaleY: 0.9,
  pupilOffsetY: 0,
  browLeft:  'M 70 76 Q 78 73 86 76',
  browRight: 'M 114 76 Q 122 73 130 76',
  mouth:     'M 88 122 Q 100 128 112 122',
  // Hands on hips (arms angled in)
  armLeftRotate: 70,
  armRightRotate: -70,
};

const MOOD_TABLE: Record<MascotMood, MoodGeometry> = {
  idle: IDLE,
  welcoming: WELCOMING,
  thinking: THINKING,
  celebrating: CELEBRATING,
  proud: PROUD,
};

export const StringMotif: React.FC<StringMotifProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
  trackPointer = true,
}) => {
  const reduce = useReducedMotion();
  const px = SIZE_MAP[size];
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // ---------- Pupil tracking (springs) -------------------------------------
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const sx = useSpring(pupilX, { stiffness: 130, damping: 18, mass: 0.4 });
  const sy = useSpring(pupilY, { stiffness: 130, damping: 18, mass: 0.4 });
  // Convert to viewBox-unit translations for the pupil <g>.
  const pupilTx = useTransform(sx, v => v);
  const pupilTy = useTransform(sy, v => v);

  // Small range — pupils never leave the eye whites.
  const trackRange = 2.4;

  useEffect(() => {
    if (reduce || !trackPointer) return;
    const handler = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / Math.max(1, window.innerWidth / 2);
      const dy = (e.clientY - cy) / Math.max(1, window.innerHeight / 2);
      pupilX.set(Math.max(-1, Math.min(1, dx)) * trackRange);
      pupilY.set(Math.max(-1, Math.min(1, dy)) * trackRange);
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, [reduce, trackPointer, pupilX, pupilY]);

  useEffect(() => {
    if (reduce || trackPointer) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const phase = (t - start) / 1000;
      pupilX.set(Math.sin(phase * 0.6) * trackRange * 0.45);
      pupilY.set(Math.cos(phase * 0.8) * trackRange * 0.45);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, trackPointer, pupilX, pupilY]);

  // ---------- Blink timer --------------------------------------------------
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 130);
        schedule();
      }, randBetween(4000, 7000));
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [reduce]);

  // ---------- Mood geometry ------------------------------------------------
  const m = MOOD_TABLE[mood];
  const eyeScaleY = blinking ? 0.06 : m.eyeScaleY;

  // Pulses on celebrating
  const breathing = reduce
    ? { scale: 1 }
    : mood === 'celebrating'
    ? { scale: [1, 1.04, 1] }
    : { scale: [0.985, 1.015, 0.985] };
  const breathingTransition = reduce
    ? { duration: 0 }
    : mood === 'celebrating'
    ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const }
    : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' as const };

  // Soft cushiony glow underneath
  const filter =
    mood === 'celebrating' ? 'drop-shadow(0 6px 14px rgba(248,113,113,0.45))'
  : mood === 'welcoming'   ? 'drop-shadow(0 6px 12px rgba(248,113,113,0.30))'
  :                          'drop-shadow(0 4px 10px rgba(15,23,42,0.18))';

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block ${className}`}
      style={{ width: px, height: px, filter }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        animate={breathing}
        transition={breathingTransition}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full" role="img">
          <defs>
            <radialGradient id="phone-mascot-body" cx="42%" cy="38%" r="70%">
              <stop offset="0%"  stopColor="#FCA5A5" />
              <stop offset="55%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#EF4444" />
            </radialGradient>
            <radialGradient id="phone-mascot-cheek" cx="50%" cy="50%" r="55%">
              <stop offset="0%"  stopColor="rgba(244, 114, 182, 0.55)" />
              <stop offset="100%" stopColor="rgba(244, 114, 182, 0)" />
            </radialGradient>
            <radialGradient id="phone-mascot-eye" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </radialGradient>
          </defs>

          {/* --- Soft oval "shadow" beneath body --- */}
          <ellipse
            cx="100" cy="180" rx="50" ry="6"
            fill="rgba(15,23,42,0.10)"
          />

          {/* --- Tiny feet poking out at the bottom --- */}
          <ellipse cx="80"  cy="175" rx="11" ry="7" fill="#DC2626" />
          <ellipse cx="120" cy="175" rx="11" ry="7" fill="#DC2626" />

          {/* --- Arms (rotate around shoulder pivots) ---
              Left arm pivots at (54, 118), right arm at (146, 118). */}
          <motion.g
            animate={{ rotate: m.armLeftRotate }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18 }}
            style={{ originX: '54px', originY: '118px' }}
          >
            <line
              x1="54" y1="118"
              x2={54 + (m.handLeftDx ?? 0)}
              y2={150 + (m.handLeftDy ?? 0)}
              stroke="#EF4444" strokeWidth="11" strokeLinecap="round"
            />
            <circle
              cx={54 + (m.handLeftDx ?? 0)}
              cy={150 + (m.handLeftDy ?? 0)}
              r="8" fill="#F87171"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: m.armRightRotate }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18 }}
            style={{ originX: '146px', originY: '118px' }}
          >
            <line
              x1="146" y1="118"
              x2={146 + (m.handRightDx ?? 0)}
              y2={150 + (m.handRightDy ?? 0)}
              stroke="#EF4444" strokeWidth="11" strokeLinecap="round"
            />
            <circle
              cx={146 + (m.handRightDx ?? 0)}
              cy={150 + (m.handRightDy ?? 0)}
              r="8" fill="#F87171"
            />
          </motion.g>

          {/* --- Body — chubby asymmetric blob ---
              Slightly wider at the bottom, softly rounded all around. */}
          <path
            d="
              M 100 22
              C 144 22 168 50 168 92
              C 168 132 152 168 100 168
              C 48 168 32 132 32 92
              C 32 50 56 22 100 22
              Z
            "
            fill="url(#phone-mascot-body)"
            stroke="#DC2626"
            strokeWidth="2.5"
          />

          {/* Belly highlight — top-left soft sheen */}
          <ellipse
            cx="78" cy="62" rx="22" ry="14"
            fill="rgba(255,255,255,0.35)"
          />

          {/* Cheeks — soft pink blushes */}
          <ellipse cx="62"  cy="112" rx="10" ry="6" fill="url(#phone-mascot-cheek)" />
          <ellipse cx="138" cy="112" rx="10" ry="6" fill="url(#phone-mascot-cheek)" />

          {/* --- Eyebrows (above the eye whites) --- */}
          <motion.path
            d={m.browLeft}
            fill="none"
            stroke="#1E293B"
            strokeWidth="3.4"
            strokeLinecap="round"
            initial={false}
            animate={{ d: m.browLeft }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          />
          <motion.path
            d={m.browRight}
            fill="none"
            stroke="#1E293B"
            strokeWidth="3.4"
            strokeLinecap="round"
            initial={false}
            animate={{ d: m.browRight }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          />

          {/* --- Eye whites (centred at 78,93 and 122,93) --- */}
          <motion.ellipse
            cx="78" cy="93" rx="14" ry="14"
            fill="url(#phone-mascot-eye)"
            stroke="#1E293B"
            strokeWidth="2"
            animate={{ scaleY: eyeScaleY }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ originX: '78px', originY: '93px' }}
          />
          <motion.ellipse
            cx="122" cy="93" rx="14" ry="14"
            fill="url(#phone-mascot-eye)"
            stroke="#1E293B"
            strokeWidth="2"
            animate={{ scaleY: eyeScaleY }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ originX: '122px', originY: '93px' }}
          />

          {/* --- Pupils (tracked via spring values) --- */}
          <motion.g
            style={{ x: pupilTx, y: pupilTy, opacity: blinking ? 0 : 1 }}
            transition={{ opacity: { duration: 0.08 } }}
          >
            <circle cx="78"  cy={93 + m.pupilOffsetY} r="5.6" fill="#0F172A" />
            <circle cx="122" cy={93 + m.pupilOffsetY} r="5.6" fill="#0F172A" />
            {/* Eye highlights */}
            <circle cx="80"  cy={91 + m.pupilOffsetY} r="1.7" fill="#FFFFFF" />
            <circle cx="124" cy={91 + m.pupilOffsetY} r="1.7" fill="#FFFFFF" />
          </motion.g>

          {/* --- Mouth (mood-dependent path) --- */}
          <motion.path
            d={m.mouth}
            fill={mood === 'celebrating' || mood === 'welcoming' ? '#7F1D1D' : 'none'}
            stroke="#1E293B"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ d: m.mouth }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
          />

          {/* Tiny tongue dot for celebrating */}
          {mood === 'celebrating' && (
            <ellipse cx="100" cy="130" rx="6" ry="3" fill="#FB7185" />
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default StringMotif;
