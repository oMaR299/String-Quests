// ReportCardCellPopover.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Compact item-breakdown popover for multi-item Report Card cells (Quizzes,
// Assignments). Rendered as a centred overlay sheet (NOT a full BottomSheet
// — it sits over Home, not over a drawer, so the lighter pattern is enough).
//
// Each item shows: title (locale-aware), date pill, raw score with the same
// tone palette as the row pill (emerald / amber / rose). Tap outside or the
// X to dismiss. Escape also closes.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type { ReportItem } from '../data/parentAppReportCardMock';
import {
  GRADE_TONE_CLASSES,
  formatGradeShort,
  getGradeTone,
  gradePercent,
} from '../utils/gradeUtils';

export type ReportCellKind = 'quizzes' | 'assignments';

export interface ReportCardCellPopoverProps {
  open: boolean;
  onClose: () => void;
  kind: ReportCellKind;
  items: ReportItem[];
  /** Optional — passed through to the ARIA label so screen readers anchor the
   *  popover correctly (e.g. "Quiz breakdown for Math"). */
  subjectLabel?: string;
}

export const ReportCardCellPopover: React.FC<ReportCardCellPopoverProps> = ({
  open,
  onClose,
  kind,
  items,
  subjectLabel,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const title =
    kind === 'quizzes'
      ? t('parentApp.reportCard.popover.titleQuizzes')
      : t('parentApp.reportCard.popover.titleAssignments');

  // Newest first.
  const sorted = [...items].sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — same z layering as MessageTeacherSheet so it sits
              cleanly above any open drawer / sheet on Home. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="fixed inset-0 z-[299] bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Centered card. On mobile it pins to the bottom 85vh; on desktop
              it floats centered. Same max-w as the BottomSheet for visual
              consistency with the rest of the parent-app. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={subjectLabel ? `${title} — ${subjectLabel}` : title}
            dir={dir}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 220, damping: 22 }
            }
            className="fixed inset-x-0 bottom-0 z-[300] mx-auto max-w-[430px] bg-white rounded-t-3xl max-h-[70vh] flex flex-col shadow-lg font-cairo border-t border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1 rounded-full bg-slate-300" aria-hidden="true" />
            </div>

            <div className="relative px-4 pt-2 pb-3 shrink-0">
              <h2 className="text-center text-base font-black text-slate-800 px-8 truncate">
                {title}
                {subjectLabel && (
                  <span className="text-slate-400 font-bold"> · {subjectLabel}</span>
                )}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('parentApp.reportCard.popover.closeAria')}
                className="absolute end-3 top-1.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5 space-y-2">
              {sorted.map((item) => {
                const tone = getGradeTone(item);
                const c = GRADE_TONE_CLASSES[tone];
                const title = locale === 'ar' ? item.titleAr : item.titleEn;
                const note =
                  locale === 'ar' ? item.teacherNoteAr : item.teacherNoteEn;
                return (
                  <li
                    key={item.id}
                    className={`rounded-2xl border ${c.bg} ${c.border} p-3 space-y-1`}
                  >
                    <div className="flex items-baseline gap-2">
                      <div className="flex-1 min-w-0 text-sm font-extrabold text-slate-800 truncate">
                        {title}
                      </div>
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums ${c.bg} ${c.text} border ${c.border}`}
                      >
                        {formatGradeShort(item)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 tabular-nums">
                      <span>{item.dateIso}</span>
                      <span>·</span>
                      <span>{gradePercent(item)}%</span>
                    </div>
                    {note && (
                      <p className="text-xs font-bold italic text-slate-600 leading-relaxed pt-1 border-t border-white/60">
                        ❝ {note} ❞
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportCardCellPopover;
