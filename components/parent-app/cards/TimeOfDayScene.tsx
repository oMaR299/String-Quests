// TimeOfDayScene.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Pure-SVG decorative scene used by GreetingStrip. Renders one of five
// per-band scenes — sun, moon, mountains, trees, clouds, stars — composed
// with layered <path>, <circle>, <linearGradient>, <radialGradient>.
//
// Bands → scenes (matches the user's reference cards):
//   morning    rising sun + 2 clouds + low hills + 2 distant trees
//   afternoon  full sun w/ rays + clouds drifting + rolling hills + trees
//   evening    setting sun + layered mountain silhouettes (warm haze)
//   night      crescent moon + tree silhouettes + 12 stars (twinkle)
//   late       full moon w/ craters + mountain silhouettes + 20 stars
//
// All ambient motion is via Framer Motion `animate` keyframes; reduced-motion
// renders an identical static composition.
//
// The SVG sits BEHIND the foreground content; viewBox is 400×220 and is
// stretched to the card via `w-full h-full`. The decorative weight (sun /
// moon / mountains) lives in the BOTTOM-RIGHT (LTR) of the canvas. In RTL
// the parent flips us with `scale-x-[-1]` so the celestial body lands at the
// bottom-START — the foreground content (avatar + text) keeps logical
// start-alignment naturally.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { TimeBand } from '../hooks/useTimeBand';

// ─────────────────────────────────────────────────────────────────────────────
// Stars — pseudo-random scatter, deterministic per `seed`
// ─────────────────────────────────────────────────────────────────────────────

interface Star {
  cx: number;
  cy: number;
  r: number;
  /** 0–1 base opacity (brighter stars get bigger r AND higher base). */
  o: number;
  /** seconds — twinkle period. */
  period: number;
  /** seconds — phase offset so the field doesn't pulse in unison. */
  delay: number;
}

function generateStars(seed: number, count: number, bright: number): Star[] {
  // Mulberry32 — deterministic, lightweight.
  let s = seed >>> 0;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    const isBright = i < bright;
    out.push({
      cx: Math.round(rand() * 400),
      cy: Math.round(rand() * 130 + 8), // upper 60% of canvas
      r: isBright ? 1.6 + rand() * 0.8 : 0.7 + rand() * 0.6,
      o: isBright ? 0.85 + rand() * 0.15 : 0.45 + rand() * 0.35,
      period: 2.2 + rand() * 2.4,
      delay: rand() * 3,
    });
  }
  return out;
}

const NIGHT_STARS = generateStars(42, 14, 2);
const LATE_STARS = generateStars(1337, 22, 3);

// ─────────────────────────────────────────────────────────────────────────────
// StarField — twinkling dots, reduced-motion safe
// ─────────────────────────────────────────────────────────────────────────────

const StarField: React.FC<{ stars: Star[]; reduceMotion: boolean }> = ({
  stars,
  reduceMotion,
}) => (
  <g>
    {stars.map((s, i) =>
      reduceMotion ? (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity={s.o} />
      ) : (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#FFFFFF"
          initial={{ opacity: s.o }}
          animate={{ opacity: [s.o, s.o * 0.35, s.o] }}
          transition={{
            duration: s.period,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      )
    )}
  </g>
);

// ─────────────────────────────────────────────────────────────────────────────
// Cloud — soft rounded blob, drifts horizontally on the morning + afternoon scenes
// ─────────────────────────────────────────────────────────────────────────────

const Cloud: React.FC<{
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  drift?: number; // px range to drift; 0 = static
  duration?: number;
  reduceMotion: boolean;
}> = ({ x, y, scale = 1, opacity = 0.85, drift = 0, duration = 60, reduceMotion }) => {
  const path =
    'M 0 14 Q 0 0 16 0 Q 22 -8 34 -2 Q 48 -10 58 0 Q 72 0 72 14 Q 72 22 60 22 L 12 22 Q 0 22 0 14 Z';
  const inner = (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <path d={path} fill="#FFFFFF" />
    </g>
  );
  if (reduceMotion || drift === 0) return inner;
  return (
    <motion.g
      animate={{ x: [0, drift, 0] }}
      transition={{ duration, ease: 'easeInOut', repeat: Infinity }}
    >
      {inner}
    </motion.g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-band scenes
// ─────────────────────────────────────────────────────────────────────────────

const MorningScene: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <>
    <defs>
      <radialGradient id="tod-morning-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF7E6" />
        <stop offset="55%" stopColor="#FFD89B" />
        <stop offset="100%" stopColor="#FFB36B" />
      </radialGradient>
      <linearGradient id="tod-morning-hill-back" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#F472B6" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#9F1239" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="tod-morning-hill-front" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#BE185D" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#7C2D12" stopOpacity="0.55" />
      </linearGradient>
    </defs>

    {/* Sun glow halo (softest outer) */}
    <circle cx="310" cy="138" r="78" fill="url(#tod-morning-sun)" opacity="0.18" />
    <circle cx="310" cy="138" r="58" fill="url(#tod-morning-sun)" opacity="0.32" />
    <circle cx="310" cy="138" r="40" fill="url(#tod-morning-sun)" opacity="0.95" />

    {/* Distant hills */}
    <path
      d="M 0 175 Q 60 150 120 162 T 240 158 T 400 168 L 400 220 L 0 220 Z"
      fill="url(#tod-morning-hill-back)"
    />
    {/* Front hill */}
    <path
      d="M 0 195 Q 80 170 160 188 T 320 184 T 400 192 L 400 220 L 0 220 Z"
      fill="url(#tod-morning-hill-front)"
    />

    {/* Distant tree silhouettes */}
    <g opacity="0.5" fill="#7F1D1D">
      <path d="M 70 188 L 76 174 L 82 188 Z" />
      <path d="M 90 190 L 96 178 L 102 190 Z" />
      <path d="M 250 184 L 258 168 L 266 184 Z" />
    </g>

    {/* Wispy clouds */}
    <Cloud x={40} y={50} scale={0.9} opacity={0.7} drift={20} duration={48} reduceMotion={reduceMotion} />
    <Cloud x={170} y={32} scale={0.55} opacity={0.55} drift={26} duration={62} reduceMotion={reduceMotion} />
  </>
);

const AfternoonScene: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <>
    <defs>
      <radialGradient id="tod-afternoon-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="60%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </radialGradient>
      <linearGradient id="tod-afternoon-hill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#FB923C" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#C2410C" stopOpacity="0.4" />
      </linearGradient>
    </defs>

    {/* Sun rays — 8 thin triangles, very subtle */}
    <g opacity="0.32" stroke="#FEF3C7" strokeWidth="2.4" strokeLinecap="round">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 310;
        const cy = 110;
        const r1 = 50;
        const r2 = 64;
        const x1 = cx + Math.cos(rad) * r1;
        const y1 = cy + Math.sin(rad) * r1;
        const x2 = cx + Math.cos(rad) * r2;
        const y2 = cy + Math.sin(rad) * r2;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>

    {/* Sun halo + body */}
    <circle cx="310" cy="110" r="62" fill="url(#tod-afternoon-sun)" opacity="0.2" />
    <circle cx="310" cy="110" r="46" fill="url(#tod-afternoon-sun)" opacity="0.42" />
    <circle cx="310" cy="110" r="34" fill="url(#tod-afternoon-sun)" opacity="1" />

    {/* Rolling hills */}
    <path
      d="M 0 188 Q 70 168 150 184 T 300 178 T 400 184 L 400 220 L 0 220 Z"
      fill="url(#tod-afternoon-hill)"
    />

    {/* Tree silhouettes on hills */}
    <g opacity="0.42" fill="#9A3412">
      <path d="M 60 186 L 67 170 L 74 186 Z" />
      <path d="M 200 182 L 209 164 L 218 182 Z" />
      <path d="M 220 184 L 227 170 L 234 184 Z" />
    </g>

    {/* Drifting clouds — both directions for parallax feel */}
    <Cloud x={30} y={44} scale={0.8} opacity={0.85} drift={22} duration={52} reduceMotion={reduceMotion} />
    <Cloud x={130} y={70} scale={0.5} opacity={0.6} drift={-18} duration={68} reduceMotion={reduceMotion} />
  </>
);

const EveningScene: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <>
    <defs>
      <radialGradient id="tod-evening-sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFEDD5" />
        <stop offset="55%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#DB2777" />
      </radialGradient>
      <linearGradient id="tod-evening-haze" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#FBA74C" stopOpacity="0" />
        <stop offset="100%" stopColor="#FB923C" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id="tod-evening-mtn-back" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="tod-evening-mtn-mid" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#5B21B6" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="tod-evening-mtn-front" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#3B0764" />
        <stop offset="100%" stopColor="#0F0726" />
      </linearGradient>
    </defs>

    {/* Sun haze across mid-canvas */}
    <rect x="0" y="80" width="400" height="100" fill="url(#tod-evening-haze)" />

    {/* Setting sun — slowly descends behind mountains */}
    {reduceMotion ? (
      <g>
        <circle cx="290" cy="140" r="50" fill="url(#tod-evening-sun)" opacity="0.25" />
        <circle cx="290" cy="140" r="38" fill="url(#tod-evening-sun)" opacity="0.5" />
        <circle cx="290" cy="140" r="28" fill="url(#tod-evening-sun)" />
      </g>
    ) : (
      <motion.g
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      >
        <circle cx="290" cy="140" r="50" fill="url(#tod-evening-sun)" opacity="0.25" />
        <circle cx="290" cy="140" r="38" fill="url(#tod-evening-sun)" opacity="0.5" />
        <circle cx="290" cy="140" r="28" fill="url(#tod-evening-sun)" />
      </motion.g>
    )}

    {/* Far mountain layer */}
    <path
      d="M 0 175 L 50 145 L 90 165 L 140 130 L 200 158 L 260 138 L 320 160 L 400 142 L 400 220 L 0 220 Z"
      fill="url(#tod-evening-mtn-back)"
    />
    {/* Mid mountain layer */}
    <path
      d="M 0 195 L 40 170 L 100 188 L 160 158 L 220 184 L 280 162 L 340 188 L 400 172 L 400 220 L 0 220 Z"
      fill="url(#tod-evening-mtn-mid)"
    />
    {/* Front mountain layer */}
    <path
      d="M 0 210 L 50 192 L 110 206 L 170 186 L 230 204 L 300 190 L 360 208 L 400 196 L 400 220 L 0 220 Z"
      fill="url(#tod-evening-mtn-front)"
    />
  </>
);

const NightScene: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <>
    <defs>
      <radialGradient id="tod-night-moon-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tod-night-mtn" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#0F0726" stopOpacity="1" />
      </linearGradient>
    </defs>

    {/* Stars BEHIND the moon */}
    <StarField stars={NIGHT_STARS} reduceMotion={reduceMotion} />

    {/* Crescent moon — solid disk with offset cutout */}
    <g>
      <circle cx="310" cy="92" r="62" fill="url(#tod-night-moon-glow)" />
      <g>
        <circle cx="310" cy="92" r="34" fill="#F5F3FF" />
        {/* The cutout disk overlaps to create the crescent. Color matches
            the night gradient blue so the carved area blends back into sky. */}
        <circle cx="322" cy="86" r="30" fill="#5B21B6" />
      </g>
    </g>

    {/* Mountain ridges */}
    <path
      d="M 0 188 L 60 158 L 120 178 L 200 150 L 260 175 L 340 148 L 400 168 L 400 220 L 0 220 Z"
      fill="url(#tod-night-mtn)"
    />

    {/* Tree silhouettes — pine triangles */}
    <g fill="#0F0726">
      <path d="M 30 200 L 36 178 L 42 200 Z" />
      <path d="M 48 202 L 56 174 L 64 202 Z" />
      <path d="M 70 200 L 76 184 L 82 200 Z" />
      <path d="M 158 198 L 168 170 L 178 198 Z" />
      <path d="M 180 200 L 188 178 L 196 200 Z" />
    </g>
  </>
);

const LateScene: React.FC<{ reduceMotion: boolean }> = ({ reduceMotion }) => (
  <>
    <defs>
      <radialGradient id="tod-late-moon-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="tod-late-moon-body" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="60%" stopColor="#E0E7FF" />
        <stop offset="100%" stopColor="#A5B4FC" />
      </radialGradient>
      <linearGradient id="tod-late-mtn" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#0F172A" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1" />
      </linearGradient>
    </defs>

    {/* Star field */}
    <StarField stars={LATE_STARS} reduceMotion={reduceMotion} />

    {/* Full moon with subtle craters and outer glow */}
    <circle cx="305" cy="82" r="76" fill="url(#tod-late-moon-glow)" />
    <circle cx="305" cy="82" r="38" fill="url(#tod-late-moon-body)" />
    {/* craters */}
    <g fill="#A5B4FC" opacity="0.45">
      <circle cx="296" cy="74" r="3.5" />
      <circle cx="316" cy="86" r="2.4" />
      <circle cx="302" cy="96" r="2" />
      <circle cx="320" cy="70" r="1.6" />
    </g>

    {/* Distant mountain silhouettes */}
    <path
      d="M 0 200 L 40 170 L 90 192 L 150 162 L 210 188 L 270 168 L 330 192 L 400 174 L 400 220 L 0 220 Z"
      fill="url(#tod-late-mtn)"
    />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Public scene component
// ─────────────────────────────────────────────────────────────────────────────

export interface TimeOfDaySceneProps {
  band: TimeBand;
  /** Optional override (used for cross-fade tests). */
  reduceMotion?: boolean;
}

export const TimeOfDayScene: React.FC<TimeOfDaySceneProps> = ({ band, reduceMotion }) => {
  const prefersReduce = useReducedMotion();
  const reduce = reduceMotion ?? !!prefersReduce;

  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {band === 'morning' && <MorningScene reduceMotion={reduce} />}
      {band === 'afternoon' && <AfternoonScene reduceMotion={reduce} />}
      {band === 'evening' && <EveningScene reduceMotion={reduce} />}
      {band === 'night' && <NightScene reduceMotion={reduce} />}
      {band === 'late' && <LateScene reduceMotion={reduce} />}
    </svg>
  );
};

export default TimeOfDayScene;
