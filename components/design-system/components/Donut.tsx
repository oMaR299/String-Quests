/**
 * sq-Donut — library-free SVG donut chart.
 * Generalised from the YesNoDonut + reused by skill-map gauges.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SQ_COLOR_HEX } from '../tokens/colors';

export interface SqDonutSegment {
  /** 0..100 — what fraction of the donut this segment represents. */
  value: number;
  /** Hex color or static class color. The renderer uses this as stroke. */
  color: string;
  label?: string;
}

interface SqDonutProps {
  segments: SqDonutSegment[];
  size?: number;
  stroke?: number;
  /** Center label (e.g. "76%"). */
  centerLabel?: string;
  centerSubLabel?: string;
  className?: string;
}

export const SqDonut: React.FC<SqDonutProps> = ({
  segments,
  size = 120,
  stroke = 14,
  centerLabel,
  centerSubLabel,
  className = '',
}) => {
  const reduce = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - stroke / 2 - 1;
  const circ = 2 * Math.PI * radius;

  let cumulative = 0;
  const segs = segments.map((s) => {
    const start = cumulative;
    cumulative += s.value;
    return {
      ...s,
      dasharray: `${(s.value / 100) * circ} ${circ - (s.value / 100) * circ}`,
      offset: -((start / 100) * circ),
    };
  });

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={SQ_COLOR_HEX.neutral.fog} strokeWidth={stroke} />
        {segs.map((s, i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={reduce ? false : { strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: s.dasharray, strokeDashoffset: s.offset }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : i * 0.08 }}
          />
        ))}
      </svg>
      {(centerLabel || centerSubLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center font-cairo">
          {centerLabel && <span className="text-lg font-black text-slate-700">{centerLabel}</span>}
          {centerSubLabel && <span className="text-[10px] font-bold text-slate-400">{centerSubLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default SqDonut;
