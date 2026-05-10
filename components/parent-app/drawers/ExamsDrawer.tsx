// ExamsDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// List of upcoming exams. Each row shows subject icon + title + date +
// countdown chip (urgency-colored, mirrors DeadlineCard pattern) + topics
// preview. A toggleable "Study tips" section per row.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lightbulb, GraduationCap, ChevronDown } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  MOCK_EXAMS,
  SUBJECT_STYLES,
  type Exam,
} from '../data/parentAppSchoolMockData';
import {
  daysUntilIso,
  urgencyTone,
  URGENCY_STYLES,
} from '../parentAppMockData';
import { useParentAppContext } from '../useParentAppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Forwarded to BottomSheet — enables horizontal swipe between drawers. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

interface RowProps {
  exam: Exam;
  expanded: boolean;
  onToggle: () => void;
}

const ExamRow: React.FC<RowProps> = ({ exam, expanded, onToggle }) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const subjectStyle = SUBJECT_STYLES[exam.subject];
  const title = locale === 'ar' ? exam.titleAr : exam.titleEn;
  const topics = locale === 'ar' ? exam.topicsAr : exam.topicsEn;
  const tips = locale === 'ar' ? exam.tipsAr : exam.tipsEn;

  const days = daysUntilIso(exam.dateIso);
  const tone = urgencyTone(days);
  const toneStyles = URGENCY_STYLES[tone];

  let countdown: string;
  if (days <= 0) countdown = t('parentApp.school.exams.today');
  else if (days === 1) countdown = t('parentApp.school.exams.tomorrow');
  else countdown = interpolate(t('parentApp.school.exams.inDays'), { n: days });

  return (
    <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden flex">
      <div className={`w-1.5 shrink-0 ${toneStyles.band}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="p-3 flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 text-base font-black ${subjectStyle.iconBg} ${subjectStyle.iconText}`}
            aria-hidden="true"
          >
            {subjectStyle.glyph}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-sm font-extrabold text-slate-800 leading-snug">{title}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${toneStyles.pill} ${toneStyles.pillText}`}
              >
                {countdown}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subjectStyle.pillBg} ${subjectStyle.pillText}`}
              >
                {locale === 'ar' ? subjectStyle.labelAr : subjectStyle.labelEn}
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">
              <span className="text-slate-400">
                {t('parentApp.school.exams.topicsLabel')}:
              </span>{' '}
              {topics}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={t('parentApp.school.exams.toggleTipsAria')}
          className="w-full px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 active:scale-[0.99] transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
            {t('parentApp.school.exams.tipsLabel')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0.1 } : { duration: 0.22 }}
              className="overflow-hidden"
            >
              <ul className="px-3 pb-3 pt-1 space-y-1.5">
                {tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-xs font-bold text-slate-600 flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Body-only renderer used by SchoolLogisticsStrip's shared BottomSheet (Fix 2).
 */
export const ExamsDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const { activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter (single active child only) & sort by soonest.
  const filtered = useMemo(() => {
    return MOCK_EXAMS.filter((e) => e.childId === activeChildId).sort(
      (a, b) => daysUntilIso(a.dateIso) - daysUntilIso(b.dateIso)
    );
  }, [activeChildId]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
        <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-500">
          {t('parentApp.school.exams.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((exam) => (
        <ExamRow
          key={exam.id}
          exam={exam}
          expanded={expandedId === exam.id}
          onToggle={() =>
            setExpandedId((prev) => (prev === exam.id ? null : exam.id))
          }
        />
      ))}
    </div>
  );
};

/**
 * Standalone wrapper — kept for back-compat. SchoolLogisticsStrip uses
 * `ExamsDrawerContent` inside its shared BottomSheet.
 */
export const ExamsDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.exams.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.exams.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="exams"
    >
      <ExamsDrawerContent />
    </BottomSheet>
  );
};

export default ExamsDrawer;
