// GardenPlant.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 0 of the Parent Skill Map — a single flat-SVG plant whose growth stage
// encodes a subject's mastery. CLEAN FLAT aesthetic: geometric vector shapes,
// 2–3 colors per plant (the subject's brand color + two derived shades), no
// gradients-on-everything, no drop-shadow stacks, no 3D, no emoji.
//
//   stage  = masteryToStage(area.masteryPct)
//     seed   → small soil mound + a single sprout nub
//     sprout → short stem + 2 small leaves
//     young  → taller stem + several leaves
//     bloom  → full plant / small tree with flower + fruit accents
//
// Wilting (isWilting(area)) plants visibly DROOP — stem/leaves angle downward
// and the whole plant desaturates — and GENTLY SWAY (subtle infinite rotate).
// Healthy plants stand upright with at most a barely-there idle breath.
//
// Motion (Framer Motion, reduced-motion aware):
//   • Entrance — a spring "grow up from the ground", scaled from the y-bottom
//     anchor, staggered by `index`. Reduced motion → instant, no scale.
//   • Idle     — healthy plants do a faint breathing skew; wilting plants sway.
//     Reduced motion → no idle/sway at all.
//
// The plant SVG is authored LTR in a 100×120 viewBox with the ground baseline
// at y≈112. The whole plant is a single tappable <button> (role/aria from the
// subject name); a small subject glyph + label sits beneath it. RTL is handled
// by the document root `dir="rtl"` from the parent — the plant art is
// near-symmetric so it needs no mirroring; the label row uses logical flow.

import React, { useMemo } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import {
  SUBJECT_STYLES,
  type SubjectKey,
} from '../data/parentAppSchoolMockData';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';
import { masteryToStage, isWilting, type PlantStage } from './skillMapCoaching';

// ─────────────────────────────────────────────────────────────────────────────
// Subject → flat hex palette. The garden art needs raw hex fills (SVG), so we
// map each subject key to the SAME brand hue used by its `SUBJECT_STYLES`
// `iconBg` Tailwind class. This keeps every plant distinguishable yet cohesive.
// `leaf` is the primary plant body, `accent` the flower/fruit pop, `soil` a
// neutral warm mound shared across all plants.
// ─────────────────────────────────────────────────────────────────────────────

interface PlantPalette {
  /** Stem + leaf primary (the subject brand hue). */
  leaf: string;
  /** A darker leaf shade for depth (one tone down). */
  leafDark: string;
  /** Flower / fruit accent — a warm complementary pop. */
  accent: string;
}

const SUBJECT_PLANT_PALETTE: Record<SubjectKey, PlantPalette> = {
  // math = duo-blue
  math: { leaf: '#1CB0F6', leafDark: '#1899D6', accent: '#FFC800' },
  // arabic = duo-gold
  arabic: { leaf: '#FFC800', leafDark: '#E5A500', accent: '#FF9600' },
  // english = duo-purple
  english: { leaf: '#CE82FF', leafDark: '#B45CF0', accent: '#FFC800' },
  // science = sky-500
  science: { leaf: '#0EA5E9', leafDark: '#0284C7', accent: '#FACC15' },
  // reading = duo-green (not in the 6 skill subjects, but keep the map total)
  reading: { leaf: '#58CC02', leafDark: '#4CAD00', accent: '#FFC800' },
  // pe = duo-orange
  pe: { leaf: '#FF9600', leafDark: '#E07F00', accent: '#FF4B4B' },
  // art = rose-500
  art: { leaf: '#F43F5E', leafDark: '#E11D48', accent: '#FFC800' },
};

/** Soil mound — warm neutral, shared by every plant. */
const SOIL = '#C9A27A';
const SOIL_DARK = '#A87E55';

/** Fallback palette for any unexpected subject key (keeps types honest). */
const FALLBACK_PALETTE: PlantPalette = {
  leaf: '#58CC02',
  leafDark: '#4CAD00',
  accent: '#FFC800',
};

function getPalette(subjectKey: string): PlantPalette {
  return (
    SUBJECT_PLANT_PALETTE[subjectKey as SubjectKey] ?? FALLBACK_PALETTE
  );
}

/** Resolve the subject style row (label + glyph) with a safe fallback. */
function getSubjectStyle(subjectKey: string) {
  return (
    SUBJECT_STYLES[subjectKey as SubjectKey] ?? {
      labelAr: subjectKey,
      labelEn: subjectKey,
      glyph: '•',
      iconBg: 'bg-slate-400',
      iconText: 'text-white',
      dot: 'bg-slate-400',
      pillBg: 'bg-slate-100',
      pillText: 'text-slate-700',
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf — a single flat almond/teardrop leaf, drawn from an origin point and
// rotated. Reused across stages. A `wilt` flag pushes the angle downward so a
// drooping plant's leaves visibly sag.
// ─────────────────────────────────────────────────────────────────────────────

interface LeafProps {
  /** Origin x (the point where the leaf joins the stem). */
  x: number;
  /** Origin y. */
  y: number;
  /** Length of the leaf (px in viewBox units). */
  size: number;
  /** Rotation in degrees; negative = up-left, positive = up-right. */
  angle: number;
  fill: string;
}

const Leaf: React.FC<LeafProps> = ({ x, y, size, angle, fill }) => {
  // Almond leaf authored pointing right along +x from the origin, then rotated.
  const w = size * 0.5;
  const path = `M 0 0 Q ${size * 0.55} ${-w} ${size} 0 Q ${size * 0.55} ${w} 0 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={path} fill={fill} />
      {/* Faint center vein — one flat hairline, no gradient. */}
      <path
        d={`M ${size * 0.08} 0 L ${size * 0.82} 0`}
        stroke="#FFFFFF"
        strokeOpacity={0.28}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-stage plant body. Each returns the inner SVG content (excluding soil),
// authored upright in the 100×120 viewBox with the stem base at (50, 108).
// `wilt` bends the composition downward (sad droop) and `p` is the palette.
// ─────────────────────────────────────────────────────────────────────────────

interface StageBodyProps {
  p: PlantPalette;
  wilt: boolean;
}

/** seed — a small mound is drawn by the caller; here just a tiny sprout nub. */
const SeedBody: React.FC<StageBodyProps> = ({ p, wilt }) => (
  <g>
    {/* Short nub stem. */}
    <path
      d="M 50 108 L 50 96"
      stroke={p.leafDark}
      strokeWidth={4}
      strokeLinecap="round"
    />
    {/* Two tiny cotyledon leaves — first life. Droop if wilting. */}
    <Leaf x={50} y={96} size={14} angle={wilt ? 35 : -28} fill={p.leaf} />
    <Leaf x={50} y={96} size={14} angle={wilt ? 145 : 208} fill={p.leaf} />
  </g>
);

/** sprout — short stem + 2 small leaves. */
const SproutBody: React.FC<StageBodyProps> = ({ p, wilt }) => (
  <g>
    <path
      d={wilt ? 'M 50 108 Q 50 86 58 78' : 'M 50 108 L 50 74'}
      stroke={p.leafDark}
      strokeWidth={4.5}
      strokeLinecap="round"
      fill="none"
    />
    <Leaf x={50} y={88} size={20} angle={wilt ? 28 : -22} fill={p.leaf} />
    <Leaf x={50} y={82} size={20} angle={wilt ? 152 : 202} fill={p.leafDark} />
  </g>
);

/** young — taller stem + several leaves up its length. */
const YoungBody: React.FC<StageBodyProps> = ({ p, wilt }) => (
  <g>
    <path
      d={wilt ? 'M 50 108 Q 50 70 62 56' : 'M 50 108 L 50 50'}
      stroke={p.leafDark}
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
    {/* Lower pair. */}
    <Leaf x={50} y={92} size={22} angle={wilt ? 30 : -18} fill={p.leaf} />
    <Leaf x={50} y={88} size={22} angle={wilt ? 150 : 200} fill={p.leafDark} />
    {/* Mid pair. */}
    <Leaf x={50} y={74} size={24} angle={wilt ? 22 : -26} fill={p.leaf} />
    <Leaf x={50} y={70} size={24} angle={wilt ? 158 : 210} fill={p.leaf} />
    {/* Top leaf. */}
    <Leaf x={50} y={54} size={20} angle={wilt ? 70 : -70} fill={p.leafDark} />
  </g>
);

/** bloom — full plant / small tree with a leafy crown + flower & fruit pops. */
const BloomBody: React.FC<StageBodyProps> = ({ p, wilt }) => (
  <g>
    {/* Trunk / main stem. */}
    <path
      d={wilt ? 'M 50 108 Q 50 64 60 50' : 'M 50 108 L 50 44'}
      stroke={p.leafDark}
      strokeWidth={6}
      strokeLinecap="round"
      fill="none"
    />
    {/* Side branches. */}
    <path
      d={wilt ? 'M 50 78 Q 40 74 34 82' : 'M 50 78 Q 40 70 32 64'}
      stroke={p.leafDark}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
    <path
      d={wilt ? 'M 50 70 Q 60 66 66 74' : 'M 50 70 Q 60 62 68 56'}
      stroke={p.leafDark}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
    {/* Leafy crown — three overlapping flat blobs. */}
    <circle cx={50} cy={36} r={20} fill={p.leaf} />
    <circle cx={34} cy={46} r={14} fill={p.leafDark} />
    <circle cx={66} cy={46} r={14} fill={p.leafDark} />
    <circle cx={50} cy={48} r={15} fill={p.leaf} />
    {/* Flower + fruit accents on the crown (hidden when wilting — a sad plant
        keeps no blossoms). */}
    {!wilt && (
      <>
        <g transform="translate(42 30)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-5}
              rx={3}
              ry={5}
              fill={p.accent}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx={0} cy={0} r={2.4} fill="#FFFFFF" />
        </g>
        <circle cx={62} cy={40} r={3.6} fill={p.accent} />
        <circle cx={54} cy={56} r={3} fill={p.accent} />
      </>
    )}
  </g>
);

const STAGE_BODY: Record<PlantStage, React.FC<StageBodyProps>> = {
  seed: SeedBody,
  sprout: SproutBody,
  young: YoungBody,
  bloom: BloomBody,
};

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

export interface GardenPlantProps {
  area: ParentSkillArea;
  /** For staggered entrance — each plant springs up slightly after the last. */
  index: number;
  onTap?: () => void;
}

export const GardenPlant: React.FC<GardenPlantProps> = ({
  area,
  index,
  onTap,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();

  const stage = masteryToStage(area.masteryPct);
  const wilt = isWilting(area);
  const palette = getPalette(area.subjectKey);
  const style = getSubjectStyle(area.subjectKey);
  const label = locale === 'ar' ? style.labelAr : style.labelEn;

  const Body = STAGE_BODY[stage];

  // Entrance: spring "grow up from the ground". We scale from the bottom-center
  // origin so the plant appears to sprout out of the soil. Staggered by index.
  const entrance = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: false as const,
        animate: { opacity: 1, scaleY: 1, scaleX: 1 },
        transition: { duration: 0 } as Transition,
      };
    }
    return {
      initial: { opacity: 0, scaleY: 0.15, scaleX: 0.6 },
      animate: { opacity: 1, scaleY: 1, scaleX: 1 },
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 18,
        delay: 0.08 + index * 0.09,
      } as Transition,
    };
  }, [reduceMotion, index]);

  // Idle motion: wilting plants sway sadly (slow infinite rotate around the
  // base); healthy plants do a near-imperceptible breathing skew. Both off
  // under reduced motion.
  const idle = useMemo(() => {
    if (reduceMotion) return undefined;
    if (wilt) {
      return {
        animate: { rotate: [0, -3.5, 0, 3.5, 0] },
        transition: {
          duration: 4.2,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: index * 0.15,
        } as Transition,
      };
    }
    return {
      animate: { rotate: [0, -1.1, 0, 1.1, 0] },
      transition: {
        duration: 6.5,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: index * 0.2,
      } as Transition,
    };
  }, [reduceMotion, wilt, index]);

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={label}
      className="group flex flex-col items-center gap-1.5 rounded-2xl px-1.5 pb-1.5 pt-2 outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-duo-blue/60 focus-visible:ring-offset-white active:scale-[0.97]"
    >
      {/* Plant canvas. The wrapper applies the grow-in spring; an inner motion
          group carries the perpetual idle/sway so the two never fight. We pin
          the transform origin to the bottom-center so every transform reads as
          "rooted in the soil". */}
      <motion.div
        initial={entrance.initial}
        animate={entrance.animate}
        transition={entrance.transition}
        style={{ transformOrigin: '50% 100%' }}
        className="relative h-[88px] w-[68px] sm:h-[100px] sm:w-[76px]"
      >
        <svg
          viewBox="0 0 100 120"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {/* Soft ground shadow ellipse — flat, single tone, grounds the plant. */}
          <ellipse
            cx={50}
            cy={113}
            rx={26}
            ry={5}
            fill={SOIL_DARK}
            opacity={0.28}
          />
          {/* Soil mound. */}
          <path
            d="M 26 112 Q 50 98 74 112 Z"
            fill={SOIL}
          />
          <path
            d="M 30 112 Q 50 104 70 112 Z"
            fill={SOIL_DARK}
            opacity={0.55}
          />

          {/* Living body — swaying group, desaturated when wilting. */}
          <motion.g
            animate={idle?.animate}
            transition={idle?.transition}
            style={{ transformOrigin: '50px 108px' }}
            opacity={wilt ? 0.78 : 1}
          >
            <Body p={palette} wilt={wilt} />
          </motion.g>
        </svg>
      </motion.div>

      {/* Subject label + glyph chip beneath the plant. Logical flow → mirrors
          correctly in RTL automatically. */}
      <span className="flex items-center gap-1.5">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold leading-none text-white"
          style={{ backgroundColor: palette.leaf }}
          aria-hidden="true"
        >
          {style.glyph}
        </span>
        <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
          {label}
        </span>
      </span>
    </button>
  );
};

export default GardenPlant;
