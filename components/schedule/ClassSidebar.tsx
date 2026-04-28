// ClassSidebar.tsx
// Left rail, restructured into three distinct regions so "Break" reads as
// structural UI, not a subject:
//   1. Title block     — module icon + "My Classes"
//   2. Classes section — list of draggable class chips (no break here)
//   3. Breaks region   — separate labeled block below a divider; break lives here
//   4. Weekly summary  — demoted footer with overall + per-class progress

import React from 'react';
import { type PanInfo } from 'framer-motion';
import { CalendarDays, Trash2, Coffee } from 'lucide-react';
import type { ClassItem } from './scheduleTypes';
import { SUBJECT_COLOR_CLASSES } from './scheduleTypes';
import { ClassChip } from './ClassChip';
import { BreakChip } from './BreakChip';
import {
  clearWeekButtonLabel,
  weeklySummaryTitle,
  weeklySummaryFilledLabel,
  sidebarSectionClassesLabel,
  sidebarSectionPausesLabel,
  sidebarSectionPausesHint,
  sidebarSectionPausesDropHint,
  sidebarTitleLabel,
  sidebarTitleSubLabel,
  subjectLabel,
  classGradeSectionLabel,
  perClassProgressLabel,
  type Locale,
} from './scheduleI18n';

interface ClassSidebarProps {
  classes: ClassItem[];
  placedCountByClass: Map<string, number>;
  filled: number;
  total: number;
  locale: Locale;
  onRequestClearWeek: () => void;
  onChipDragStart: (classId: string) => void;
  onChipDrag: (classId: string, info: PanInfo) => void;
  onChipDragEnd: (classId: string, info: PanInfo) => void;
  onBreakDragStart: () => void;
  onBreakDrag: (info: PanInfo) => void;
  onBreakDragEnd: (info: PanInfo) => void;
}

export const ClassSidebar: React.FC<ClassSidebarProps> = ({
  classes,
  placedCountByClass,
  filled,
  total,
  locale,
  onRequestClearWeek,
  onChipDragStart,
  onChipDrag,
  onChipDragEnd,
  onBreakDragStart,
  onBreakDrag,
  onBreakDragEnd,
}) => {
  const progress = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;

  return (
    <aside className="h-full flex flex-col rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm overflow-hidden">
      {/* ── Title block ──────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 leading-none tracking-tight truncate">
                {sidebarTitleLabel(locale)}
              </h2>
              <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {sidebarTitleSubLabel(locale)}
              </p>
            </div>
          </div>
          <button
            onClick={onRequestClearWeek}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
            title={clearWeekButtonLabel(locale)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{clearWeekButtonLabel(locale)}</span>
          </button>
        </div>
      </div>

      {/* ── Classes section ─────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {sidebarSectionClassesLabel(locale)}
          </span>
          <span className="text-[10px] font-black text-slate-400 tabular-nums">
            {classes.length}
          </span>
        </div>
        <div className="space-y-2">
          {classes.map(c => (
            <ClassChip
              key={c.id}
              item={c}
              placedCount={placedCountByClass.get(c.id) ?? 0}
              locale={locale}
              onDragStart={onChipDragStart}
              onDrag={onChipDrag}
              onDragEnd={onChipDragEnd}
            />
          ))}
        </div>
      </div>

      {/* ── Breaks & Pauses region (distinct from classes) ── */}
      <div className="px-4 pt-3 pb-4 border-t border-slate-200/70 bg-gradient-to-b from-slate-50/60 to-transparent">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Coffee className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {sidebarSectionPausesLabel(locale)}
          </span>
          <span
            aria-hidden
            className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ms-1"
          />
        </div>
        <BreakChip
          locale={locale}
          onDragStart={onBreakDragStart}
          onDrag={onBreakDrag}
          onDragEnd={onBreakDragEnd}
        />
        <p className="mt-2 text-[10px] font-medium text-slate-400 leading-snug px-1">
          {sidebarSectionPausesHint(locale)}
        </p>
        <p className="mt-1 text-[10px] font-bold text-violet-500/80 leading-snug px-1">
          {sidebarSectionPausesDropHint(locale)}
        </p>
      </div>

      {/* ── Weekly summary footer (demoted) ─────────────── */}
      <div className="border-t border-slate-100 bg-white/60 px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {weeklySummaryTitle(locale)}
          </div>
          <div className="text-[11px] font-black text-slate-600 tabular-nums">
            {weeklySummaryFilledLabel(filled, total, locale)}
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Per-class progress */}
        <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pe-1">
          {classes.map(c => {
            const placed = placedCountByClass.get(c.id) ?? 0;
            const pct = c.weeklyTarget > 0
              ? Math.min(100, Math.round((placed / c.weeklyTarget) * 100))
              : 0;
            const palette = SUBJECT_COLOR_CLASSES[c.colorToken];
            return (
              <div key={c.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {classGradeSectionLabel(c.grade, c.section, locale)} · {subjectLabel(c.subject, locale)}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 shrink-0 tabular-nums">
                      {perClassProgressLabel(placed, c.weeklyTarget, locale)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-200/70 overflow-hidden mt-0.5">
                    <div
                      className={`h-full ${palette.accent} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ClassSidebar;
