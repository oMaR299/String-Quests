// ScoreRing.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Apple-Fitness-style score rings for the Daily Story cards. Three render
// modes, all driven by the same StoryScore[] shape:
//
//   • mini    — a row of small rings (value inside, label under). 2-3 scores.
//   • single  — one big ring with the number in the center, plus the remaining
//               scores as compact stat pills beside it.
//   • multi   — concentric rings (one arc per score) + a colored legend.
//
// Colors come from the data (hex), applied inline — Tailwind v4 JIT can't see
// runtime color classes and these intentionally sit outside the theme palette.
// Arcs animate in (strokeDashoffset) unless the user prefers reduced motion.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TRACK = 'rgba(15, 23, 42, 0.08)'; // faint slate track under every arc

// ─── One animated arc (track + progress) ─────────────────────────────────────

interface ArcProps {
  size: number;
  radius: number;
  stroke: number;
  value: number; // 0-100
  color: string;
  reduceMotion: boolean;
  delay?: number;
}

const Arc: React.FC<ArcProps> = ({ size, radius, stroke, value, color, reduceMotion, delay = 0 }) => {
  const c = 2 * Math.PI * radius;
  const target = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const center = size / 2;
  return (
    <>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={TRACK} strokeWidth={stroke} />
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={reduceMotion ? { strokeDashoffset: target } : { strokeDashoffset: c }}
        animate={{ strokeDashoffset: target }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18, delay }}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </>
  );
};

// ─── Reusable single ring with optional centered content ──────────────────────
// Exported so other surfaces (e.g. the skill-map subject tiles + detail header)
// can drop in a mastery ring without re-implementing the SVG geometry.
export const Ring: React.FC<{
  value: number;
  color: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}> = ({ value, color, size = 64, stroke = 7, children }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const radius = (size - stroke) / 2;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <Arc size={size} radius={radius} stroke={stroke} value={value} color={color} reduceMotion={reduceMotion} />
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
};

// ─── Mini ring (value inside, label below) ────────────────────────────────────

const MiniRing: React.FC<{ score: ResolvedScore; index: number; reduceMotion: boolean }> = ({
  score,
  index,
  reduceMotion,
}) => {
  const size = 60;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const unit = score.unit ?? '%';
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <Arc
            size={size}
            radius={radius}
            stroke={stroke}
            value={score.value}
            color={score.color}
            reduceMotion={reduceMotion}
            delay={index * 0.08}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-black leading-none" style={{ color: score.color }}>
            {score.value}
            <span className="text-[9px] font-extrabold">{unit}</span>
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 text-center leading-tight truncate w-full">
        {score.label}
      </span>
    </div>
  );
};

// ─── Single big ring + side stat pills ────────────────────────────────────────

const SingleRing: React.FC<{ scores: ResolvedScore[]; reduceMotion: boolean }> = ({
  scores,
  reduceMotion,
}) => {
  const [hero, ...rest] = scores;
  const size = 116;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const unit = hero.unit ?? '%';
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <Arc
            size={size}
            radius={radius}
            stroke={stroke}
            value={hero.value}
            color={hero.color}
            reduceMotion={reduceMotion}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[34px] font-black leading-none" style={{ color: hero.color }}>
            {hero.value}
            <span className="text-sm font-extrabold align-top">{unit}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-0.5 text-center px-1 leading-tight">
            {hero.label}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {rest.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-600 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="text-[15px] font-black tabular-nums shrink-0" style={{ color: s.color }}>
              {s.value}
              <span className="text-[9px] font-extrabold">{s.unit ?? '%'}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Multi concentric rings + legend ──────────────────────────────────────────

const MultiRing: React.FC<{ scores: ResolvedScore[]; reduceMotion: boolean }> = ({
  scores,
  reduceMotion,
}) => {
  const size = 116;
  const stroke = 10;
  const gap = 5;
  const center = size / 2;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          {scores.map((s, i) => {
            const radius = (size - stroke) / 2 - i * (stroke + gap);
            if (radius <= stroke) return null;
            return (
              <Arc
                key={s.key}
                size={size}
                radius={radius}
                stroke={stroke}
                value={s.value}
                color={s.color}
                reduceMotion={reduceMotion}
                delay={i * 0.1}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {scores.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-600 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="text-[16px] font-black tabular-nums shrink-0" style={{ color: s.color }}>
              {s.value}
              <span className="text-[9px] font-extrabold">{s.unit ?? '%'}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────

/** A score with its display label already resolved for the active locale. */
export interface ResolvedScore {
  key: string;
  label: string;
  value: number;
  color: string;
  unit?: string;
}

export interface ScoreRingProps {
  mode: 'mini' | 'single' | 'multi';
  scores: ResolvedScore[];
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ mode, scores }) => {
  const reduceMotion = useReducedMotion() ?? false;
  if (scores.length === 0) return null;

  if (mode === 'single') return <SingleRing scores={scores} reduceMotion={reduceMotion} />;
  if (mode === 'multi') return <MultiRing scores={scores} reduceMotion={reduceMotion} />;

  // mini — row of rings
  return (
    <div className="flex items-start justify-around gap-2">
      {scores.map((s, i) => (
        <MiniRing key={s.key} score={{ ...s }} index={i} reduceMotion={reduceMotion} />
      ))}
    </div>
  );
};

export default ScoreRing;
