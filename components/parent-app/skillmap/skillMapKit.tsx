// skillMapKit.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared visual kit for the "النتائج والتقدّم" hub. Previously the status color
// palette, the heatmap scale, formatPoints, weekday arrays, and the Tile/MiniStat
// primitives were duplicated across ~10 components. Single source now.

import React from 'react';
import type { ParentSkillStatus } from './data/parentAppSkillMapMock';

// ── Status palette (single source) ───────────────────────────────────────────

export const STATUS_COLOR: Record<ParentSkillStatus, string> = {
  mastered: '#56CF92', // emerald
  proficient: '#54B6E6', // blue
  developing: '#FFB23E', // amber
  needsHelp: '#FF6F7A', // rose
};

/** Score-ring accent set (for non-status metrics). */
export const RING = {
  coral: '#FF5A6E',
  amber: '#FFB23E',
  teal: '#3DD9C0',
  blue: '#54B6E6',
  green: '#56CF92',
  purple: '#8E7DE0',
};

/** Exam-readiness level → accent color (single source; used by the snapshot
 *  exam banner + the Tasks view exam zone). */
export const EXAM_LEVEL_COLOR: Record<'ready' | 'onTrack' | 'atRisk', string> = {
  ready: '#56CF92', // emerald
  onTrack: '#FFB23E', // amber
  atRisk: '#FF6F7A', // rose (softest — "needs focus", never "failing")
};

/** Minutes → color ramp for the activity heatmap. */
export const MINUTES_SCALE = [
  { threshold: 40, color: '#1F9D57' },
  { threshold: 25, color: '#56CF92' },
  { threshold: 10, color: '#A7E8C4' },
  { threshold: 1, color: '#D8F0E2' },
  { threshold: 0, color: '#EEF2F6' },
];

// ── Weekday labels (Sun..Sat) ────────────────────────────────────────────────

export const DAY_LETTERS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
export const DAY_LETTERS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_FULL_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const DAY_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Formatting ────────────────────────────────────────────────────────────────

/** Compact points: 120000 → "120k", 1500 → "1.5k". */
export function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

/** Arabic-aware "in N days" countdown phrase (today / tomorrow / dual / plural).
 *  Arabic grammar: 1=غداً, 2=يومين, 3–10=أيام, 11+=يوماً. */
export function inDaysPhrase(n: number, locale: 'ar' | 'en'): string {
  const ar = locale === 'ar';
  if (n <= 0) return ar ? 'اليوم' : 'Today';
  if (n === 1) return ar ? 'غداً' : 'Tomorrow';
  if (!ar) return `in ${n} days`;
  if (n === 2) return 'بعد يومين';
  if (n <= 10) return `بعد ${n} أيام`;
  return `بعد ${n} يوماً`;
}

/** Same grammar as inDaysPhrase but framed as a homework deadline ("due …").
 *  Callers pass n ≥ 0 only (overdue is handled separately as "not handed in"). */
export function dueInPhrase(n: number, locale: 'ar' | 'en'): string {
  const ar = locale === 'ar';
  if (n <= 0) return ar ? 'يُسلَّم اليوم' : 'Due today';
  if (n === 1) return ar ? 'يُسلَّم غداً' : 'Due tomorrow';
  if (!ar) return `Due in ${n} days`;
  if (n === 2) return 'يُسلَّم بعد يومين';
  if (n <= 10) return `يُسلَّم بعد ${n} أيام`;
  return `يُسلَّم بعد ${n} يوماً`;
}

// ── Shared stat primitives ───────────────────────────────────────────────────

/** Compact stat on a soft slate chip (used in calendar/heatmap headers). */
export const MiniStat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-2.5">
    <span className="text-base font-black tabular-nums leading-none" style={{ color }}>{value}</span>
    <span className="mt-1 text-[10px] font-bold text-slate-500 text-center leading-tight">{label}</span>
  </div>
);

/** Larger pastel-tinted stat tile (used in growth/day summaries). */
export const Tile: React.FC<{ label: string; value: string; bg: string; color: string }> = ({ label, value, bg, color }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl py-3" style={{ background: bg }}>
    <span className="text-lg font-black tabular-nums leading-none" style={{ color }}>{value}</span>
    <span className="mt-1 text-[10px] font-bold text-slate-500 text-center leading-tight">{label}</span>
  </div>
);
