/**
 * sq-ProgressDots — the brand's "string" progress indicator.
 *
 * The product is called String, so the journey progress is a connected
 * string of dots: an SVG thread runs through N circles, drawing itself
 * up to the active step. Supports any step count + any tone color.
 *
 * Variants:
 *   - thread (default) : the iconic curved string
 *   - dots             : minimal row of dots (fallback for ultra-dense UI)
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SqProgressDotsProps {
  /** Total number of steps. */
  total: number;
  /** Active step (0-based). Negative hides the indicator. */
  active: number;
  variant?: 'thread' | 'dots';
  /** Hex color for the active fill (defaults to sq-brand-500). */
  color?: string;
  className?: string;
}

const DEFAULT_COLOR = '#8B5CF6'; // sq-brand-500

export const SqProgressDots: React.FC<SqProgressDotsProps> = ({
  total,
  active,
  variant = 'thread',
  color = DEFAULT_COLOR,
  className = '',
}) => {
  const reduce = useReducedMotion();
  if (active < 0 || total <= 0) return null;
  const activeIdx = Math.max(0, Math.min(total - 1, active));

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`} aria-label="Progress">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === activeIdx;
          const isDone = i < activeIdx;
          return (
            <motion.span
              key={i}
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 24 }}
              className="rounded-full"
              style={{
                width: isActive ? 12 : 8,
                height: isActive ? 12 : 8,
                background: isActive || isDone ? color : '#CBD5E1',
              }}
            />
          );
        })}
      </div>
    );
  }

  // thread variant
  const VB_W = 200;
  const VB_H = 28;
  const PAD = 18;
  const stride = total > 1 ? (VB_W - PAD * 2) / (total - 1) : 0;
  const dotR = 6;
  const activeR = 8;

  let d = '';
  for (let i = 0; i < total; i++) {
    const x = PAD + stride * i;
    const y = VB_H / 2;
    if (i === 0) d += `M ${x} ${y}`;
    else {
      const xPrev = PAD + stride * (i - 1);
      const cx = (x + xPrev) / 2;
      const cy = i % 2 === 1 ? y - 5 : y + 5;
      d += ` Q ${cx} ${cy} ${x} ${y}`;
    }
  }
  const completedFraction = total <= 1 ? 0 : activeIdx / (total - 1);

  return (
    <div className={`flex items-center justify-center pt-3 pb-1 ${className}`} aria-label="Progress">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="170" height="24" role="img" aria-hidden>
        <path d={d} fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          initial={false}
          animate={{ pathLength: completedFraction }}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
        />
        {Array.from({ length: total }).map((_, i) => {
          const cx = PAD + stride * i;
          const cy = VB_H / 2;
          const isActive = i === activeIdx;
          const isDone = i < activeIdx;
          if (isActive) {
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={activeR}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="2"
                initial={false}
                animate={{ scale: 1 }}
                transition={
                  reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 20 }
                }
              />
            );
          }
          if (isDone) {
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={dotR} fill={color} />
                <path
                  d={`M ${cx - 2.6} ${cy + 0.2} L ${cx - 0.6} ${cy + 2.2} L ${cx + 2.6} ${cy - 1.6}`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          }
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={dotR - 0.5}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default SqProgressDots;
