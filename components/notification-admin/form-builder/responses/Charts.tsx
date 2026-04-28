// Charts.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Library-free chart primitives. Pure divs + percentages so Tailwind v4
// JIT picks every class up at build time. Each chart accepts:
//   - data: array of { label, count } or numeric histogram
//   - reduceMotion: when true, skip Framer animations
//
// Color palette uses static class names from the palette so JIT sees them.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Static palette — JIT sees each class literally
const BAR_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-purple-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
  'from-violet-400 to-fuchsia-500',
  'from-lime-400 to-emerald-500',
];

const BAR_BGS = [
  'bg-sky-50',
  'bg-purple-50',
  'bg-emerald-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-cyan-50',
  'bg-violet-50',
  'bg-lime-50',
];

// ─────────────────────────────────────────────
// Horizontal bar chart
// ─────────────────────────────────────────────

export interface BarDatum { label: string; count: number }

export const HorizontalBar: React.FC<{ data: BarDatum[]; total: number; compact?: boolean }> = ({ data, total, compact = false }) => {
  const reduceMotion = useReducedMotion();
  if (data.length === 0) {
    return <p className="text-xs font-bold text-slate-400 text-center py-3">—</p>;
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
      {data.map((d, idx) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        const barWidth = maxCount > 0 ? Math.max((d.count / maxCount) * 100, 2) : 2;
        const grad = BAR_GRADIENTS[idx % BAR_GRADIENTS.length];
        const bg = BAR_BGS[idx % BAR_BGS.length];
        return (
          <div key={d.label + idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 truncate">{d.label}</span>
              <span className="font-bold text-slate-400 shrink-0 ms-2">
                {d.count} <span className="text-slate-300">({pct}%)</span>
              </span>
            </div>
            <div className={`w-full ${compact ? 'h-2' : 'h-2.5'} ${bg} rounded-full overflow-hidden`}>
              <motion.div
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : idx * 0.04, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${grad} rounded-full`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Histogram (vertical bars)
// ─────────────────────────────────────────────

export const Histogram: React.FC<{ buckets: number[]; labels?: string[] }> = ({ buckets, labels }) => {
  const reduceMotion = useReducedMotion();
  if (buckets.length === 0) return <p className="text-xs font-bold text-slate-400 text-center py-3">—</p>;
  const max = Math.max(...buckets, 1);
  return (
    <div className="flex items-end gap-1.5 h-32">
      {buckets.map((count, idx) => {
        const heightPct = max > 0 ? Math.max((count / max) * 100, 2) : 2;
        const grad = BAR_GRADIENTS[idx % BAR_GRADIENTS.length];
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 justify-end">
            <span className="text-[10px] font-bold text-slate-400">{count > 0 ? count : ''}</span>
            <motion.div
              initial={reduceMotion ? false : { height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : idx * 0.03 }}
              className={`w-full bg-gradient-to-t ${grad} rounded-t-lg min-h-[4px]`}
            />
            {labels && (
              <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">
                {labels[idx]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Yes/No donut
// ─────────────────────────────────────────────

export const YesNoDonut: React.FC<{ yes: number; no: number; size?: number; locale: 'ar' | 'en' }> = ({
  yes, no, size = 96, locale,
}) => {
  const reduceMotion = useReducedMotion();
  const total = yes + no;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 7;
  const stroke = 12;
  const circ = 2 * Math.PI * radius;
  const yesRatio = total > 0 ? yes / total : 0;
  const yesDash = yesRatio * circ;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-3">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#fca5a5" strokeWidth={stroke} />
          <motion.circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke="#34d399" strokeWidth={stroke}
            strokeDasharray={circ}
            initial={reduceMotion ? false : { strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - yesDash }}
            transition={{ duration: reduceMotion ? 0 : 0.7 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-slate-700">{total}</span>
          <span className="text-[10px] font-bold text-slate-400">{locale === 'ar' ? 'إجمالي' : 'total'}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-slate-600">{locale === 'ar' ? 'نعم' : 'Yes'}</span>
          <span className="text-sm font-black text-emerald-600">{yes}</span>
          <span className="text-xs font-bold text-slate-400">({Math.round(yesRatio * 100)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-300" />
          <span className="text-xs font-bold text-slate-600">{locale === 'ar' ? 'لا' : 'No'}</span>
          <span className="text-sm font-black text-rose-500">{no}</span>
          <span className="text-xs font-bold text-slate-400">({Math.round((1 - yesRatio) * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Heatmap of responses by day x hour
// ─────────────────────────────────────────────

export interface HeatmapCell { dayOffset: number; hour: number; count: number }

export const ResponseHeatmap: React.FC<{ cells: HeatmapCell[]; locale: 'ar' | 'en' }> = ({ cells, locale }) => {
  const max = Math.max(...cells.map((c) => c.count), 1);
  const days = Math.max(...cells.map((c) => c.dayOffset)) + 1;
  // Build a 24-row x N-col grid
  const matrix = Array.from({ length: 24 }, () => Array(days).fill(0));
  for (const c of cells) matrix[c.hour][c.dayOffset] = c.count;

  // Static color stops so Tailwind JIT registers them
  const intensity = (n: number) => {
    if (n === 0) return 'bg-slate-100';
    const ratio = n / max;
    if (ratio < 0.15) return 'bg-sky-100';
    if (ratio < 0.35) return 'bg-sky-200';
    if (ratio < 0.55) return 'bg-sky-300';
    if (ratio < 0.75) return 'bg-sky-400';
    if (ratio < 0.9) return 'bg-sky-500';
    return 'bg-sky-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-slate-400">{locale === 'ar' ? 'أقل' : 'Less'}</span>
        <div className="flex gap-0.5">
          {['bg-slate-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600'].map((c) => (
            <div key={c} className={`w-3 h-3 rounded ${c}`} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-400">{locale === 'ar' ? 'أكثر' : 'More'}</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-fit" dir="ltr">
          {/* Hour labels */}
          <div className="flex flex-col gap-0.5 me-1">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="h-3 flex items-center">
                {h % 3 === 0 && (
                  <span className="text-[9px] font-bold text-slate-400">
                    {h.toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            ))}
          </div>
          {Array.from({ length: days }).map((_, dayOffset) => (
            <div key={dayOffset} className="flex flex-col gap-0.5">
              {matrix.map((row, hour) => {
                const count = row[dayOffset];
                return (
                  <div
                    key={hour}
                    className={`w-3 h-3 rounded-sm ${intensity(count)}`}
                    title={`${count} ${locale === 'ar' ? 'إجابة' : 'responses'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Word cloud (just a sized list — no wrap library)
// ─────────────────────────────────────────────

export const WordCloud: React.FC<{ words: { word: string; count: number }[] }> = ({ words }) => {
  if (words.length === 0) return <p className="text-xs font-bold text-slate-400 text-center py-3">—</p>;
  const max = Math.max(...words.map((w) => w.count), 1);
  // Static size buckets so JIT picks them up
  const sizeFor = (count: number): string => {
    const ratio = count / max;
    if (ratio > 0.8) return 'text-2xl font-black text-violet-700';
    if (ratio > 0.6) return 'text-xl font-black text-purple-600';
    if (ratio > 0.4) return 'text-lg font-bold text-indigo-600';
    if (ratio > 0.2) return 'text-base font-bold text-sky-600';
    return 'text-sm font-bold text-slate-500';
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 py-2">
      {words.map((w, i) => (
        <span key={w.word + i} className={sizeFor(w.count)} title={`${w.count}`}>
          {w.word}
        </span>
      ))}
    </div>
  );
};
