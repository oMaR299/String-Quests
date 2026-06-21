// ClassAvgBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "Child vs class average" — two stacked bars, no ranking (per the design
// decision). The child's bar is colored; the class-average bar is neutral, with
// a marker line so the comparison is obvious at a glance.
//
// Reused in the subject detail sheet (per-subject) and the insights section.

import React, { useCallback } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';

export interface ClassAvgBarProps {
  childPct: number;
  classAvgPct: number;
  /** Child bar color (status hex). */
  childColor: string;
  /** Optional localized child name for the child row label. */
  childLabel?: string;
}

const Bar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
  </div>
);

export const ClassAvgBar: React.FC<ClassAvgBarProps> = ({ childPct, classAvgPct, childColor, childLabel }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  return (
    <div className="flex flex-col gap-2.5">
      <Row label={childLabel ?? t('parentApp.skillMap.childLabel')} pct={childPct} color={childColor} />
      <Row label={t('parentApp.skillMap.classAverage')} pct={classAvgPct} color="#94A3B8" />
    </div>
  );
};

const Row: React.FC<{ label: string; pct: number; color: string }> = ({ label, pct, color }) => (
  <div className="flex items-center gap-3">
    <span className="w-20 shrink-0 text-[12px] font-bold text-slate-600 truncate text-start">{label}</span>
    <div className="flex-1 min-w-0">
      <Bar pct={pct} color={color} />
    </div>
    <span className="w-10 shrink-0 text-[13px] font-black tabular-nums text-start" style={{ color }}>
      {pct}%
    </span>
  </div>
);

export default ClassAvgBar;
