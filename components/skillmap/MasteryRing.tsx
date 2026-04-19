/**
 * MasteryRing - Animated SVG ring showing mastery level
 *
 * Displays P(L) as a circular progress ring with color
 * from the mastery color scale. Used in detail panels and path nodes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { MasteryLevel } from '../../models/types';
import { MASTERY_COLORS } from '../../models/types';

interface MasteryRingProps {
  /** Mastery score 0-100 */
  score: number;
  /** Mastery level for color */
  level: MasteryLevel;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show percentage text in center */
  showLabel?: boolean;
  /** Optional children to render in center */
  children?: React.ReactNode;
}

export const MasteryRing: React.FC<MasteryRingProps> = ({
  score,
  level,
  size = 80,
  strokeWidth = 6,
  showLabel = true,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const color = MASTERY_COLORS[level];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (showLabel && (
          <span className="text-sm font-bold text-slate-700" style={{ color }}>
            {Math.round(score)}%
          </span>
        ))}
      </div>
    </div>
  );
};
