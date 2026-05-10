/**
 * sq-EmptyState — icon + title + body + optional CTA.
 * Use when a list / view has no items and the user needs guidance.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { SQ_TONES, type SqTone } from '../tokens/colors';

interface SqEmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  tone?: SqTone;
  cta?: React.ReactNode;
  className?: string;
}

export const SqEmptyState: React.FC<SqEmptyStateProps> = ({
  icon: Icon,
  title,
  body,
  tone = 'brand',
  cta,
  className = '',
}) => {
  const t = SQ_TONES[tone];
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 font-cairo ${className}`}
    >
      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center ${t.softBg} ${t.text} mb-4`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-1">{title}</h3>
      {body && <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{body}</p>}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
};

export default SqEmptyState;
