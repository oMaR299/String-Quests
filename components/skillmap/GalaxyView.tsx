'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Textbook } from '../../data/sampleTextbook';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UnitScore {
  unitId: string;
  nameAr: string;
  nameEn: string;
  score: number; // 0-100
}

interface Props {
  unitScores: UnitScore[];
  locale: string;
  activeTextbook: Textbook;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Deterministic pseudo-random from a seed number */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Map score to a mastery color */
function getMasteryColor(score: number): string {
  if (score === 0) return '#64748b';
  if (score < 40) return '#ef4444';
  if (score < 70) return '#f59e0b';
  if (score < 90) return '#22c55e';
  return '#eab308';
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const W = 800;
const H = 600;
const CX = W / 2;     // 400
const CY = H / 2;     // 300
const MAX_RADIUS = 200;
const RING_LEVELS = [0.25, 0.50, 0.75, 1.0];
const NUM_BG_STARS = 80;

const LEGEND_ITEMS = [
  { label: 'Weak', labelAr: 'ضعيف', range: '<40%', color: '#ef4444' },
  { label: 'Developing', labelAr: 'نامٍ', range: '40-69%', color: '#f59e0b' },
  { label: 'Proficient', labelAr: 'متقدم', range: '70-89%', color: '#22c55e' },
  { label: 'Mastered', labelAr: 'مُتقَن', range: '90%+', color: '#eab308' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export const GalaxyView: React.FC<Props> = ({ unitScores, locale, activeTextbook }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const n = unitScores.length;

  // Compute spoke angles (evenly distributed, starting from top)
  const angles = useMemo(
    () =>
      unitScores.map(
        (_, i) => (i / n) * Math.PI * 2 - Math.PI / 2
      ),
    [n, unitScores]
  );

  // Helper: point on a spoke at a given fraction (0-1) of MAX_RADIUS
  const spokePoint = (angleIdx: number, fraction: number) => {
    const a = angles[angleIdx];
    return {
      x: CX + Math.cos(a) * MAX_RADIUS * fraction,
      y: CY + Math.sin(a) * MAX_RADIUS * fraction,
    };
  };

  // Build polygon points string for a given set of fractions per spoke
  const polygonPoints = (fractions: number[]) =>
    fractions
      .map((f, i) => {
        const p = spokePoint(i, f);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  // Ring polygon points (all spokes at same level)
  const ringPolygonPoints = (level: number) =>
    polygonPoints(unitScores.map(() => level));

  // Score fractions (0-1)
  const scoreFractions = useMemo(
    () => unitScores.map((u) => u.score / 100),
    [unitScores]
  );

  // Average score
  const avgScore = useMemo(() => {
    if (unitScores.length === 0) return 0;
    return Math.round(
      unitScores.reduce((sum, u) => sum + u.score, 0) / unitScores.length
    );
  }, [unitScores]);

  // Score polygon path for Framer Motion animation (from all-zeros to actual)
  const zeroPolygon = polygonPoints(unitScores.map(() => 0));
  const scorePolygon = polygonPoints(scoreFractions);

  // Data point positions
  const dataPoints = useMemo(
    () =>
      unitScores.map((u, i) => {
        const p = spokePoint(i, u.score / 100);
        return { ...p, score: u.score, color: getMasteryColor(u.score) };
      }),
    [unitScores, angles]
  );

  // Label positions (slightly beyond spoke tips)
  const labelPositions = useMemo(
    () =>
      unitScores.map((_, i) => {
        const a = angles[i];
        const labelRadius = MAX_RADIUS + 30;
        return {
          x: CX + Math.cos(a) * labelRadius,
          y: CY + Math.sin(a) * labelRadius,
        };
      }),
    [unitScores, angles]
  );

  // Background stars
  const bgStars = useMemo(
    () =>
      Array.from({ length: NUM_BG_STARS }, (_, i) => ({
        cx: seededRandom(i * 7 + 3) * W,
        cy: seededRandom(i * 13 + 11) * H,
        r: seededRandom(i * 3 + 1) < 0.5 ? 0.6 : 1.1,
        baseOpacity: 0.08 + seededRandom(i * 5 + 17) * 0.12,
        twinkleDur: 2 + seededRandom(i * 9 + 7) * 5,
        twinkleMin: 0.05 + seededRandom(i * 5) * 0.08,
        twinkleMax: 0.18 + seededRandom(i * 5) * 0.14,
      })),
    []
  );

  // Nebula positions: near high-mastery axes (>75%)
  const nebulae = useMemo(
    () =>
      unitScores
        .map((u, i) => ({ unit: u, idx: i }))
        .filter((item) => item.unit.score > 75)
        .map((item) => {
          const a = angles[item.idx];
          const dist = MAX_RADIUS * (item.unit.score / 100) * 0.65;
          return {
            cx: CX + Math.cos(a) * dist,
            cy: CY + Math.sin(a) * dist,
            baseR: 30 + (item.unit.score - 75) * 1.2,
            color: getMasteryColor(item.unit.score),
            seed: item.idx,
          };
        }),
    [unitScores, angles]
  );

  // Ring label positions (placed on the first spoke, slightly offset)
  const ringLabelPositions = useMemo(
    () =>
      RING_LEVELS.map((level) => {
        // Place along the first spoke direction but offset slightly to the right
        const a = angles[0] ?? -Math.PI / 2;
        const offset = 12;
        return {
          x: CX + Math.cos(a) * MAX_RADIUS * level + offset,
          y: CY + Math.sin(a) * MAX_RADIUS * level - 4,
          label: `${Math.round(level * 100)}%`,
        };
      }),
    [angles]
  );

  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950 min-h-[500px] rounded-2xl overflow-hidden relative">
      {/* Main SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full min-h-[500px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Neon glow filter for score polygon edge */}
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for data point stars */}
          <filter id="star-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mastered pulse glow filter */}
          <filter id="mastered-pulse" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="bigBlur" />
            <feMerge>
              <feMergeNode in="bigBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Score polygon fill: radial gradient */}
          <radialGradient id="score-fill-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {/* ── Layer 1: Background Stars ────────────────────────────────────── */}
        {bgStars.map((star, i) => (
          <circle
            key={`bg-star-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="white"
            opacity={star.baseOpacity}
          >
            <animate
              attributeName="opacity"
              values={`${star.twinkleMin};${star.twinkleMax};${star.twinkleMin}`}
              dur={`${star.twinkleDur}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Layer 2: Grid Rings ──────────────────────────────────────────── */}
        {RING_LEVELS.map((level) => (
          <polygon
            key={`ring-${level}`}
            points={ringPolygonPoints(level)}
            fill="none"
            stroke="white"
            strokeWidth={0.5}
            opacity={0.15}
          />
        ))}

        {/* ── Layer 3: Ring Labels ─────────────────────────────────────────── */}
        {ringLabelPositions.map((rl) => (
          <text
            key={`ring-label-${rl.label}`}
            x={rl.x}
            y={rl.y}
            fill="white"
            fontSize={9}
            opacity={0.2}
            textAnchor="start"
            dominantBaseline="middle"
          >
            {rl.label}
          </text>
        ))}

        {/* ── Layer 4: Spoke Lines ─────────────────────────────────────────── */}
        {angles.map((a, i) => {
          const tip = spokePoint(i, 1);
          return (
            <line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              stroke="white"
              strokeWidth={0.5}
              opacity={0.1}
            />
          );
        })}

        {/* ── Layer 5: Nebula Clouds ───────────────────────────────────────── */}
        {nebulae.map((neb, i) => (
          <circle
            key={`nebula-${i}`}
            cx={neb.cx}
            cy={neb.cy}
            r={neb.baseR}
            fill={neb.color}
            opacity={0.06}
            style={{ mixBlendMode: 'screen' }}
          >
            {/* Breathing animation (radius oscillation) */}
            <animate
              attributeName="r"
              values={`${neb.baseR * 0.85};${neb.baseR * 1.15};${neb.baseR * 0.85}`}
              dur={`${4 + seededRandom(neb.seed * 17) * 3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.04;0.08;0.04"
              dur={`${4 + seededRandom(neb.seed * 17) * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Layer 6: Score Polygon Fill ───────────────────────────────────── */}
        <motion.polygon
          points={scorePolygon}
          fill="url(#score-fill-gradient)"
          initial={{ points: zeroPolygon } as any}
          animate={{ points: scorePolygon } as any}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* ── Layer 7: Score Polygon Edge (Neon Glow) ──────────────────────── */}
        <motion.polygon
          points={scorePolygon}
          fill="none"
          stroke="#818cf8"
          strokeWidth={2}
          filter="url(#neon-glow)"
          initial={{ points: zeroPolygon } as any}
          animate={{ points: scorePolygon } as any}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* ── Layer 8: Data Point Stars ────────────────────────────────────── */}
        {dataPoints.map((dp, i) => {
          const isMastered = unitScores[i].score >= 90;
          const isHovered = hoveredIndex === i;
          const pointRadius = isHovered ? 7 : 5;

          return (
            <g
              key={`dp-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* ── Layer 9: Mastered Pulsing ──────────────────────────────── */}
              {isMastered && (
                <circle
                  cx={dp.x}
                  cy={dp.y}
                  r={10}
                  fill={dp.color}
                  opacity={0.25}
                  filter="url(#mastered-pulse)"
                >
                  <animate
                    attributeName="r"
                    values="8;14;8"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.15;0.35;0.15"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Actual data point circle */}
              <motion.circle
                cx={dp.x}
                cy={dp.y}
                r={pointRadius}
                fill={dp.color}
                filter="url(#star-glow)"
                initial={{ cx: CX, cy: CY, r: 0 }}
                animate={{ cx: dp.x, cy: dp.y, r: pointRadius }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* Bright core */}
              <motion.circle
                cx={dp.x}
                cy={dp.y}
                r={pointRadius * 0.4}
                fill="white"
                opacity={0.7}
                initial={{ cx: CX, cy: CY, r: 0 }}
                animate={{ cx: dp.x, cy: dp.y, r: pointRadius * 0.4 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* Invisible larger hit area */}
              <circle
                cx={dp.x}
                cy={dp.y}
                r={20}
                fill="transparent"
              />

              {/* ── Layer 10: Hover Tooltip ─────────────────────────────────── */}
              {isHovered && (
                <g>
                  <rect
                    x={dp.x - 24}
                    y={dp.y - 30}
                    width={48}
                    height={20}
                    rx={10}
                    fill="rgba(0,0,0,0.75)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={dp.x}
                    y={dp.y - 17}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight={600}
                  >
                    {dp.score}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Layer 11: Unit Labels at Spoke Tips ──────────────────────────── */}
        {unitScores.map((u, i) => {
          const lp = labelPositions[i];
          const a = angles[i];
          const isHovered = hoveredIndex === i;

          // Determine text-anchor based on angle position
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          const aDeg = ((a + Math.PI / 2) / Math.PI) * 180; // normalize so 0 = top
          if (aDeg > 30 && aDeg < 150) textAnchor = 'start';
          if (aDeg > 210 && aDeg < 330) textAnchor = 'end';

          const label = locale === 'ar' ? u.nameAr : u.nameEn;

          return (
            <text
              key={`label-${u.unitId}`}
              x={lp.x}
              y={lp.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fill="white"
              fontSize={11}
              fontWeight={isHovered ? 700 : 500}
              opacity={hoveredIndex === null || isHovered ? 0.85 : 0.35}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s, font-weight 0.2s' }}
            >
              {label}
            </text>
          );
        })}

        {/* ── Layer 12: Center Score ───────────────────────────────────────── */}
        <text
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={36}
          fontWeight={700}
          opacity={0.95}
        >
          {avgScore}%
        </text>
        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={11}
          fontWeight={500}
          opacity={0.5}
        >
          {locale === 'ar' ? 'الإتقان الكلي' : 'Overall Mastery'}
        </text>
      </svg>

      {/* ── Legend Bar ──────────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-x-5 gap-y-1 px-4 py-2.5 bg-black/30 backdrop-blur-sm rounded-xl">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] font-medium text-slate-300">
              {locale === 'ar' ? item.labelAr : item.label}{' '}
              <span className="text-slate-500">{item.range}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
