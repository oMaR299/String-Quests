/**
 * sq-Bar — horizontal progress bar with optional label + percentage.
 * Used for KPIs, completion meters, mastery scores.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SQ_TONES, type SqTone } from '../tokens/colors';

interface SqBarProps {
  /** 0..100 */
  value: number;
  label?: string;
  /** Show the right-side percentage (defaults true). */
  showPercent?: boolean;
  tone?: SqTone;
  /** Compact (h-1.5) vs default (h-2.5). */
  compact?: boolean;
  className?: string;
}

export const SqBar: React.FC<SqBarProps> = ({
  value,
  label,
  showPercent = true,
  tone = 'brand',
  compact = false,
  className = '',
}) => {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  const t = SQ_TONES[tone];
  return (
    <div className={`font-cairo ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-bold">
          {label ? <span className="text-slate-700 truncate">{label}</span> : <span />}
          {showPercent && <span className="text-slate-400 tabular-nums">{Math.round(v)}%</span>}
        </div>
      )}
      <div
        className={`w-full ${compact ? 'h-1.5' : 'h-2.5'} ${t.softBg.replace(
          'bg-',
          'bg-',
        )} rounded-full overflow-hidden`}
      >
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: reduce ? 0 : 0.55, ease: 'easeOut' }}
          className={`h-full ${t.solidBg} rounded-full`}
        />
      </div>
    </div>
  );
};

export default SqBar;
