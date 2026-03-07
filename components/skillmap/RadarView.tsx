import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface CategoryScore {
  categoryId: string;
  nameAr: string;
  nameEn: string;
  color: string;
  score: number;
}

interface Props {
  categoryScores: CategoryScore[];
  locale: string;
}

// --- Geometry helpers ---

const CENTER_X = 200;
const CENTER_Y = 200;
const MAX_RADIUS = 160;
const RING_COUNT = 6; // Bloom's taxonomy levels
const LABEL_OFFSET = 22;

/** Convert a fraction (0..1) and axis index to SVG coordinates. */
function polarToCart(fraction: number, axisIndex: number, totalAxes: number): { x: number; y: number } {
  const angleRad = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2; // start from top
  const r = fraction * MAX_RADIUS;
  return {
    x: CENTER_X + r * Math.cos(angleRad),
    y: CENTER_Y + r * Math.sin(angleRad),
  };
}

/** Build an SVG polygon points string for a regular polygon at a given radius fraction. */
function ringPoints(fraction: number, totalAxes: number): string {
  return Array.from({ length: totalAxes })
    .map((_, i) => {
      const { x, y } = polarToCart(fraction, i, totalAxes);
      return `${x},${y}`;
    })
    .join(' ');
}

/** Build the polygon points string from score values (0-100). */
function scorePoints(scores: number[], totalAxes: number): string {
  return scores
    .map((score, i) => {
      const fraction = Math.max(0, Math.min(100, score)) / 100;
      const { x, y } = polarToCart(fraction, i, totalAxes);
      return `${x},${y}`;
    })
    .join(' ');
}

/** Compute label anchor position slightly beyond the outer ring. */
function labelPosition(axisIndex: number, totalAxes: number): { x: number; y: number; anchor: string } {
  const angleRad = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
  const r = MAX_RADIUS + LABEL_OFFSET;
  const x = CENTER_X + r * Math.cos(angleRad);
  const y = CENTER_Y + r * Math.sin(angleRad);

  // Determine text-anchor based on horizontal position
  const cos = Math.cos(angleRad);
  let anchor = 'middle';
  if (cos > 0.3) anchor = 'start';
  else if (cos < -0.3) anchor = 'end';

  return { x, y, anchor };
}

// --- Sub-components ---

/** Concentric hexagonal rings */
const ConcentricRings: React.FC<{ axes: number }> = ({ axes }) => {
  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }).map((_, i) => {
        const fraction = (i + 1) / RING_COUNT;
        return ringPoints(fraction, axes);
      }),
    [axes],
  );

  return (
    <>
      {rings.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={i === RING_COUNT - 1 ? 1.2 : 0.6}
          strokeOpacity={i === RING_COUNT - 1 ? 0.5 : 0.25}
        />
      ))}
    </>
  );
};

/** Axis lines radiating from center */
const AxisLines: React.FC<{ axes: number }> = ({ axes }) => {
  const lines = useMemo(
    () =>
      Array.from({ length: axes }).map((_, i) => {
        const { x, y } = polarToCart(1, i, axes);
        return { x, y };
      }),
    [axes],
  );

  return (
    <>
      {lines.map((end, i) => (
        <line
          key={i}
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={end.x}
          y2={end.y}
          stroke="#cbd5e1"
          strokeWidth={0.6}
          strokeOpacity={0.35}
        />
      ))}
    </>
  );
};

/** The ideal (100%) outline polygon */
const IdealPolygon: React.FC<{ axes: number }> = ({ axes }) => {
  const points = useMemo(() => ringPoints(1, axes), [axes]);

  return (
    <polygon
      points={points}
      fill="none"
      stroke="#a78bfa"
      strokeWidth={1.5}
      strokeDasharray="6 4"
      strokeOpacity={0.25}
    />
  );
};

/** Bloom level numbers in faint text near each ring */
const BloomLabels: React.FC = () => {
  const labels = useMemo(
    () =>
      Array.from({ length: RING_COUNT }).map((_, i) => {
        const fraction = (i + 1) / RING_COUNT;
        const r = fraction * MAX_RADIUS;
        return { level: i + 1, y: CENTER_Y - r + 12 };
      }),
    [],
  );

  return (
    <>
      {labels.map(({ level, y }) => (
        <text
          key={level}
          x={CENTER_X + 5}
          y={y}
          fontSize={8}
          fill="#94a3b8"
          fillOpacity={0.6}
          fontWeight={600}
          textAnchor="start"
        >
          L{level}
        </text>
      ))}
    </>
  );
};

// --- Main component ---

export const RadarView: React.FC<Props> = ({ categoryScores, locale }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const axes = categoryScores.length;

  // Derive the score polygon points string (target for animation)
  const filledPoints = useMemo(() => scorePoints(categoryScores.map((c) => c.score), axes), [categoryScores, axes]);

  // Zero-state polygon (all scores 0 = collapsed to center)
  const zeroPoints = useMemo(() => scorePoints(categoryScores.map(() => 0), axes), [categoryScores, axes]);

  // Compute vertex positions for hover dots
  const vertices = useMemo(
    () =>
      categoryScores.map((cat, i) => {
        const fraction = Math.max(0, Math.min(100, cat.score)) / 100;
        return { ...polarToCart(fraction, i, axes), score: cat.score };
      }),
    [categoryScores, axes],
  );

  // Compute label positions
  const labels = useMemo(
    () =>
      categoryScores.map((cat, i) => ({
        ...labelPosition(i, axes),
        name: locale === 'ar' ? cat.nameAr : cat.nameEn,
        color: cat.color,
        score: cat.score,
      })),
    [categoryScores, axes, locale],
  );

  // Average gradient color for the filled polygon
  const gradientId = 'radar-gradient';

  return (
    <div className="relative w-full max-w-lg mx-auto select-none flex justify-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto" role="img" aria-label="Skill radar chart">
        <defs>
          {/* Radial gradient for the score polygon */}
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.35} />
          </radialGradient>

          {/* Glow filter for the score polygon */}
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background subtle fill */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={MAX_RADIUS + 4}
          fill="#f8fafc"
          fillOpacity={0.5}
        />

        {/* Concentric rings */}
        <ConcentricRings axes={axes} />

        {/* Axis lines */}
        <AxisLines axes={axes} />

        {/* Bloom level annotations */}
        <BloomLabels />

        {/* Ideal 100% outline */}
        <IdealPolygon axes={axes} />

        {/* Score polygon (animated) */}
        <motion.polygon
          points={filledPoints}
          fill={`url(#${gradientId})`}
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#radar-glow)"
          initial={{ points: zeroPoints, opacity: 0 }}
          animate={{ points: filledPoints, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Category labels */}
        {labels.map((label, i) => (
          <text
            key={categoryScores[i].categoryId}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={label.color}
            className="transition-opacity duration-150"
            opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1}
          >
            {label.name}
          </text>
        ))}

        {/* Vertex dots with hover interaction */}
        {vertices.map((v, i) => (
          <g key={categoryScores[i].categoryId}>
            {/* Title for native tooltip on hover */}
            <title>
              {locale === 'ar' ? categoryScores[i].nameAr : categoryScores[i].nameEn}: {categoryScores[i].score}%
            </title>

            {/* Invisible hit area for easier hover */}
            <circle
              cx={v.x}
              cy={v.y}
              r={12}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {/* Visible dot */}
            <motion.circle
              cx={v.x}
              cy={v.y}
              r={hoveredIndex === i ? 5.5 : 3.5}
              fill="#fff"
              stroke={categoryScores[i].color}
              strokeWidth={2}
              initial={{ r: 0, opacity: 0 }}
              animate={{
                r: hoveredIndex === i ? 5.5 : 3.5,
                opacity: 1,
              }}
              transition={{
                r: { duration: 0.15 },
                opacity: { duration: 0.6, delay: 0.6 + i * 0.06 },
              }}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {/* Score tooltip shown on hover */}
            {hoveredIndex === i && (
              <motion.g
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <rect
                  x={v.x - 18}
                  y={v.y - 28}
                  width={36}
                  height={20}
                  rx={6}
                  fill="#1e1b4b"
                  fillOpacity={0.9}
                />
                <text
                  x={v.x}
                  y={v.y - 15}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill="#fff"
                >
                  {v.score}%
                </text>
              </motion.g>
            )}
          </g>
        ))}

        {/* Center dot accent */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={3}
          fill="#8b5cf6"
          fillOpacity={0.4}
        />
      </svg>
    </div>
  );
};
