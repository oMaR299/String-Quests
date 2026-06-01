// ReportCardRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// One subject row of the Home Report Card section. Cards stack vertically;
// each card represents one "row" of the conceptual table (subject + 6
// grade-category cells + final grade pill + AI summary line).
//
// Multi-item cells (Quizzes, Assignments) show the average score + a tiny
// caret + the item count, and become tappable to open the breakdown popover.
// Single-item cells (1st exam, 2nd exam, Project, Final exam) show the
// score directly with the same tone palette.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import {
  SUBJECT_STYLES,
} from '../data/parentAppSchoolMockData';
import {
  averageScore,
  type ReportCardSubject,
  type ReportItem,
} from '../data/parentAppReportCardMock';
import {
  GRADE_TONE_CLASSES,
  formatGradeShort,
  getGradeTone,
} from '../utils/gradeUtils';
import { ReportCardCellPopover, type ReportCellKind } from './ReportCardCellPopover';

interface CellSpec {
  key: 'firstExam' | 'secondExam' | 'project' | 'quizzes' | 'assignments' | 'finalExam';
  labelKey: string;
  /** When true the cell renders an average + caret and tap opens the popover. */
  multi: boolean;
}

const CELLS: CellSpec[] = [
  { key: 'firstExam', labelKey: 'parentApp.reportCard.col.firstExam', multi: false },
  { key: 'secondExam', labelKey: 'parentApp.reportCard.col.secondExam', multi: false },
  { key: 'project', labelKey: 'parentApp.reportCard.col.project', multi: false },
  { key: 'quizzes', labelKey: 'parentApp.reportCard.col.quizzes', multi: true },
  { key: 'assignments', labelKey: 'parentApp.reportCard.col.assignments', multi: true },
  { key: 'finalExam', labelKey: 'parentApp.reportCard.col.finalExam', multi: false },
];

export interface ReportCardRowProps {
  row: ReportCardSubject;
  /** Stagger index for the entry animation. */
  index: number;
}

export const ReportCardRow: React.FC<ReportCardRowProps> = ({ row, index }) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const subjectStyle = SUBJECT_STYLES[row.subject];
  const subjectLabel =
    locale === 'ar' ? subjectStyle.labelAr : subjectStyle.labelEn;

  // Final grade pill — uses the same emerald/amber/rose tone as everywhere
  // else in the parent-app for consistency.
  const finalAsItem: ReportItem = useMemo(
    () => ({
      id: `${row.subject}-final-aggregate`,
      titleAr: '',
      titleEn: '',
      score: row.finalGrade.score,
      outOf: row.finalGrade.outOf,
      dateIso: '',
    }),
    [row.subject, row.finalGrade]
  );
  const finalTone = getGradeTone(finalAsItem);
  const finalClasses = GRADE_TONE_CLASSES[finalTone];

  // Popover state for the two multi-item cells.
  const [popoverKind, setPopoverKind] = useState<ReportCellKind | null>(null);

  const aiSummary = locale === 'ar' ? row.aiSummaryAr : row.aiSummaryEn;

  // Resolve a single cell's display + tone + click handler.
  const resolveCell = (
    spec: CellSpec
  ): {
    label: string;
    value: string;
    tone: { bg: string; text: string; border: string };
    onClick?: () => void;
    items?: number;
  } => {
    const colLabel = t(spec.labelKey);
    if (spec.multi) {
      const items = spec.key === 'quizzes' ? row.quizzes : row.assignments;
      const avg = averageScore(items);
      if (!avg) {
        return {
          label: colLabel,
          value: t('parentApp.reportCard.notScored'),
          tone: {
            bg: 'bg-slate-50',
            text: 'text-slate-400',
            border: 'border-slate-100',
          },
        };
      }
      const asItem: ReportItem = {
        id: spec.key,
        titleAr: '',
        titleEn: '',
        score: avg.score,
        outOf: avg.outOf,
        dateIso: '',
      };
      const tone = GRADE_TONE_CLASSES[getGradeTone(asItem)];
      return {
        label: colLabel,
        value: `${avg.score}%`,
        tone,
        items: items.length,
        onClick: () => setPopoverKind(spec.key as ReportCellKind),
      };
    }
    const item = row[spec.key] as ReportItem | null;
    if (!item) {
      return {
        label: colLabel,
        value: t('parentApp.reportCard.notScored'),
        tone: {
          bg: 'bg-slate-50',
          text: 'text-slate-400',
          border: 'border-slate-100',
        },
      };
    }
    return {
      label: colLabel,
      value: formatGradeShort(item),
      tone: GRADE_TONE_CLASSES[getGradeTone(item)],
    };
  };

  return (
    <>
      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 240, damping: 24, delay: index * 0.04 }
        }
        className="rounded-2xl bg-white border border-slate-200 p-3 space-y-3"
        aria-label={subjectLabel}
      >
        {/* Header — subject icon + name + final-grade pill */}
        <header className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 text-base font-black ${subjectStyle.iconBg} ${subjectStyle.iconText}`}
            aria-hidden="true"
          >
            {subjectStyle.glyph}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-800 leading-tight truncate">
              {subjectLabel}
            </h3>
            <div className="text-[11px] font-bold text-slate-500 leading-tight">
              {t('parentApp.reportCard.col.finalGrade')}
            </div>
          </div>
          <div
            className={`inline-flex flex-col items-center px-2.5 py-1 rounded-2xl border-2 ${finalClasses.bg} ${finalClasses.text} ${finalClasses.border}`}
          >
            <span className="text-base font-black tabular-nums leading-none">
              {formatGradeShort(finalAsItem)}
            </span>
          </div>
        </header>

        {/* Grade grid — 3 cols × 2 rows of category cells. */}
        <div className="grid grid-cols-3 gap-1.5">
          {CELLS.map((spec) => {
            const c = resolveCell(spec);
            const isTappable = !!c.onClick;
            const InnerWrapper = isTappable ? 'button' : 'div';
            return (
              <InnerWrapper
                key={spec.key}
                type={isTappable ? 'button' : undefined}
                onClick={isTappable ? c.onClick : undefined}
                className={`rounded-xl border ${c.tone.bg} ${c.tone.border} p-2 flex flex-col items-center text-center transition-all ${
                  isTappable ? 'hover:brightness-95 active:scale-[0.97] cursor-pointer' : ''
                }`}
                aria-label={
                  isTappable
                    ? `${c.label} ${c.value} — ${interpolate(
                        t('parentApp.reportCard.itemCount'),
                        { n: c.items ?? 0 }
                      )}`
                    : `${c.label} ${c.value}`
                }
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                  {c.label}
                </span>
                <span
                  className={`text-sm font-black tabular-nums leading-tight ${c.tone.text}`}
                >
                  {c.value}
                </span>
                {isTappable && (
                  <span className="inline-flex items-center gap-0.5 mt-0.5 text-[9px] font-bold text-slate-500 tabular-nums">
                    <span>
                      {interpolate(t('parentApp.reportCard.itemCount'), {
                        n: c.items ?? 0,
                      })}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </span>
                )}
              </InnerWrapper>
            );
          })}
        </div>

        {/* AI summary line — sparkle icon + 1-sentence insight. */}
        <div className="rounded-xl bg-duo-purple-light border border-duo-purple/20 p-2.5 flex items-start gap-2">
          <Sparkles
            className="w-3.5 h-3.5 text-duo-purple mt-0.5 shrink-0"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-duo-purple">
              {t('parentApp.reportCard.aiSummaryLabel')}
            </div>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </motion.article>

      {/* Multi-item popover — single instance, kind switches based on tap. */}
      <ReportCardCellPopover
        open={popoverKind !== null}
        onClose={() => setPopoverKind(null)}
        kind={popoverKind ?? 'quizzes'}
        items={popoverKind === 'assignments' ? row.assignments : row.quizzes}
        subjectLabel={subjectLabel}
      />
    </>
  );
};

export default ReportCardRow;
