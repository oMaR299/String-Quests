/**
 * sq-Heatmap — library-free grid heatmap.
 * Lifted/generalised from `notification-admin/form-builder/responses/Charts.tsx`.
 *
 * Rows and columns are configurable. Intensity bins are static class strings
 * so the JIT picks them up.
 */

import React from 'react';

export interface SqHeatmapCell {
  row: number;
  col: number;
  count: number;
}

interface SqHeatmapProps {
  cells: SqHeatmapCell[];
  rows: number;
  cols: number;
  /** Optional row labels (length = rows). */
  rowLabels?: string[];
  /** Optional col labels (length = cols). */
  colLabels?: string[];
  /** Tone family for the intensity ramp. Defaults to "brand" (violet). */
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  /** Tile size in px (default 14). */
  tileSize?: number;
  className?: string;
}

const RAMP: Record<NonNullable<SqHeatmapProps['tone']>, string[]> = {
  brand:   ['bg-slate-100', 'bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600'],
  success: ['bg-slate-100', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'],
  warning: ['bg-slate-100', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-amber-500', 'bg-amber-600'],
  danger:  ['bg-slate-100', 'bg-rose-100', 'bg-rose-200', 'bg-rose-300', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600'],
  info:    ['bg-slate-100', 'bg-sky-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600'],
};

export const SqHeatmap: React.FC<SqHeatmapProps> = ({
  cells,
  rows,
  cols,
  rowLabels,
  colLabels,
  tone = 'brand',
  tileSize = 14,
  className = '',
}) => {
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  let max = 1;
  for (const c of cells) {
    matrix[c.row][c.col] = c.count;
    if (c.count > max) max = c.count;
  }
  const ramp = RAMP[tone];
  const intensity = (n: number) => {
    if (n === 0) return ramp[0];
    const r = n / max;
    if (r < 0.15) return ramp[1];
    if (r < 0.35) return ramp[2];
    if (r < 0.55) return ramp[3];
    if (r < 0.75) return ramp[4];
    if (r < 0.9) return ramp[5];
    return ramp[6];
  };
  return (
    <div className={`font-cairo ${className}`}>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-fit" dir="ltr">
          {rowLabels && (
            <div className="flex flex-col gap-0.5 me-1">
              {rowLabels.map((lab, r) => (
                <div
                  key={r}
                  className="flex items-center"
                  style={{ height: tileSize }}
                >
                  <span className="text-[9px] font-bold text-slate-400 truncate">{lab}</span>
                </div>
              ))}
            </div>
          )}
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex flex-col gap-0.5">
              {Array.from({ length: rows }).map((_, r) => {
                const n = matrix[r][c];
                return (
                  <div
                    key={r}
                    className={`rounded-sm ${intensity(n)}`}
                    style={{ width: tileSize, height: tileSize }}
                    title={`${n}`}
                  />
                );
              })}
              {colLabels && (
                <span className="text-[9px] font-bold text-slate-400 text-center mt-1">
                  {colLabels[c]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SqHeatmap;
