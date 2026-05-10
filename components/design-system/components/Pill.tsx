/**
 * sq-Pill — small status / filter chip.
 * Variants: default | accent | soft | success | warning | danger | info
 */

import React from 'react';

export type SqPillVariant =
  | 'default'
  | 'accent'
  | 'soft'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const VARIANT_CLASSES: Record<SqPillVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  accent:  'bg-sq-brand-500 text-white border-sq-brand-600',
  soft:    'bg-sq-brand-50 text-sq-brand-700 border-sq-brand-200',
  success: 'bg-sq-success-50 text-sq-success-700 border-sq-success-200',
  warning: 'bg-sq-warning-50 text-sq-warning-700 border-sq-warning-200',
  danger:  'bg-sq-danger-50 text-sq-danger-700 border-sq-danger-200',
  info:    'bg-sq-info-50 text-sq-info-700 border-sq-info-200',
};

interface SqPillProps {
  variant?: SqPillVariant;
  /** Optional dot prefix for "indicator"-style pills. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SqPill: React.FC<SqPillProps> = ({
  variant = 'default',
  dot = false,
  className = '',
  children,
}) => {
  const palette = VARIANT_CLASSES[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold font-cairo ${palette} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
};

export default SqPill;
