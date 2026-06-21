// MiniTrend.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A clear, parent-friendly trend chart. Unlike the generic 0-100 area chart
// (which flattened every line into the middle band), this:
//   • downsamples noisy daily data to ~12 smooth points
//   • AUTO-SCALES to the data's own range (with padding) so the shape is visible
//   • draws a thick smooth line + soft fill + an emphasized end dot
// The magnitude is shown honestly by the caller's value + delta badge, while
// this chart shows the SHAPE clearly. Reduced-motion aware.

import React, { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  const d: string[] = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(' ');
}

/** Bucket-average down to at most `target` points so the line reads smoothly. */
function downsample(values: number[], target = 12): number[] {
  if (values.length <= target) return values;
  const out: number[] = [];
  const size = values.length / target;
  for (let i = 0; i < target; i++) {
    const start = Math.floor(i * size);
    const end = Math.max(start + 1, Math.floor((i + 1) * size));
    const slice = values.slice(start, end);
    out.push(Math.round(slice.reduce((s, v) => s + v, 0) / slice.length));
  }
  return out;
}

export interface MiniTrendProps {
  values: number[]; // chronological
  color: string;
  height?: number;
}

export const MiniTrend: React.FC<MiniTrendProps> = ({ values, color, height = 132 }) => {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();

  const pts = useMemo(() => {
    const data = downsample(values);
    if (data.length < 2) return [];
    const W = 320;
    const padX = 6;
    const padTop = 14;
    const padBottom = 12;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const lo = min - range * 0.18;
    const hi = max + range * 0.18;
    const span = hi - lo || 1;
    const innerH = height - padTop - padBottom;
    return data.map<[number, number]>((v, i) => [
      padX + (i / (data.length - 1)) * (W - padX * 2),
      padTop + (1 - (v - lo) / span) * innerH,
    ]);
  }, [values, height]);

  if (pts.length < 2) return null;

  const W = 320;
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`;
  const end = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`mt-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#mt-${uid})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={end[0]} cy={end[1]} r={4.5} fill="#fff" stroke={color} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export default MiniTrend;
