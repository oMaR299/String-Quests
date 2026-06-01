// ExamsDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// List of upcoming exams. Each row shows subject icon + title + date +
// countdown chip (urgency-colored, mirrors DeadlineCard pattern) + topics
// preview. A toggleable "Study tips" section per row.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Lightbulb,
  GraduationCap,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
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
import { MessageTeacherSheet } from '../messages/MessageTeacherSheet';
import { getTeacherForSubject } from '../messages/data/parentAppContactsMock';
import {
  GRADE_TONE_CLASSES,
  formatGradeShort,
  getGradeTone,
  gradePercent,
} from '../utils/gradeUtils';

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
  /** Fired when the row's "Message teacher" CTA is tapped. */
  onMessageTeacher: (exam: Exam) => void;
}

const ExamRow: React.FC<RowProps> = ({
  exam,
  expanded,
  onToggle,
  onMessageTeacher,
}) => {
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

  // Grade panel — only when scored. Pill renders inline in the header row.
  const grade = exam.grade;
  const gradeTone = grade ? getGradeTone(grade) : null;
  const gradeClasses = gradeTone ? GRADE_TONE_CLASSES[gradeTone] : null;
  const gradeComment = grade
    ? locale === 'ar'
      ? grade.teacherCommentAr
      : grade.teacherCommentEn
    : undefined;

  // Past exam = the date is behind us. We collapse the countdown chip when
  // a grade exists so we don't show stale "in -9 days" text.
  const isPast = days < 0;
  const hasTips = tips.length > 0;

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
              {!isPast && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${toneStyles.pill} ${toneStyles.pillText}`}
                >
                  {countdown}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subjectStyle.pillBg} ${subjectStyle.pillText}`}
              >
                {locale === 'ar' ? subjectStyle.labelAr : subjectStyle.labelEn}
              </span>
              {grade && gradeClasses && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums ms-auto ${gradeClasses.bg} ${gradeClasses.text}`}
                  aria-label={interpolate(t('parentApp.school.grade.gradePillAria'), {
                    score: grade.score,
                    outOf: grade.outOf,
                  })}
                >
                  {formatGradeShort(grade)}
                </span>
              )}
            </div>
            {topics && (
              <div className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">
                <span className="text-slate-400">
                  {t('parentApp.school.exams.topicsLabel')}:
                </span>{' '}
                {topics}
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle — label switches between "Study tips" (upcoming) and
            "Details" (past + graded). Always shows when there's something
            useful behind it. */}
        {(hasTips || grade) && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={t('parentApp.school.exams.toggleTipsAria')}
            className="w-full px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 active:scale-[0.99] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
              {grade
                ? t('parentApp.school.grade.scoreLabel')
                : t('parentApp.school.exams.tipsLabel')}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </button>
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0.1 } : { duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 space-y-3">
                {/* Grade panel — score, class average, percentile, teacher comment. */}
                {grade && gradeClasses && (
                  <div className={`rounded-2xl border ${gradeClasses.bg} ${gradeClasses.border} p-3 space-y-2`}>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <div className={`text-2xl font-black tabular-nums ${gradeClasses.text}`}>
                        {formatGradeShort(grade)}
                      </div>
                      <div className={`text-xs font-extrabold tabular-nums ${gradeClasses.text}`}>
                        ({gradePercent(grade)}%)
                      </div>
                      {typeof grade.classAverage === 'number' && (
                        <div className="text-[11px] font-bold text-slate-500 ms-auto tabular-nums">
                          {t('parentApp.school.grade.classAverageLabel')}: {grade.classAverage}/{grade.outOf}
                        </div>
                      )}
                    </div>
                    {gradeComment && (
                      <div className="rounded-xl bg-white/70 border border-white p-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          {t('parentApp.school.grade.teacherCommentLabel')}
                        </div>
                        <p className="text-xs font-bold italic text-slate-700 leading-relaxed">
                          ❝ {gradeComment} ❞
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Study tips — only for upcoming exams with tips. */}
                {hasTips && (
                  <ul className="space-y-1.5">
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
                )}

                {/* Message-teacher CTA — applies in both past+graded AND
                    upcoming flows (parent might ask a study question too). */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageTeacher(exam);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-duo-blue-light text-duo-blue text-[11px] font-extrabold hover:bg-duo-blue/15 active:scale-[0.97] transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 rtl:scale-x-[-1]" strokeWidth={2.5} />
                    {t('parentApp.school.grade.messageTeacherCta')}
                  </button>
                </div>
              </div>
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

  // Filter (single active child only) & sort:
  //  • upcoming (closest first), then
  //  • past graded (most recent first)
  // so the parent's "what's next?" view stays at the top.
  const filtered = useMemo(() => {
    const own = MOCK_EXAMS.filter((e) => e.childId === activeChildId);
    const upcoming = own
      .filter((e) => daysUntilIso(e.dateIso) >= 0)
      .sort((a, b) => daysUntilIso(a.dateIso) - daysUntilIso(b.dateIso));
    const past = own
      .filter((e) => daysUntilIso(e.dateIso) < 0)
      .sort((a, b) => daysUntilIso(b.dateIso) - daysUntilIso(a.dateIso));
    return [...upcoming, ...past];
  }, [activeChildId]);

  // MessageTeacherSheet target — null when sheet is closed.
  const [messageTarget, setMessageTarget] = useState<Exam | null>(null);
  const handleMessageTeacher = useCallback((e: Exam) => {
    setMessageTarget(e);
  }, []);
  const targetContact = useMemo(() => {
    if (!messageTarget) return null;
    return getTeacherForSubject(messageTarget.subject, messageTarget.childId);
  }, [messageTarget]);
  const targetContextLabel = useMemo(() => {
    if (!messageTarget) return undefined;
    const titleLine =
      locale === 'ar' ? messageTarget.titleAr : messageTarget.titleEn;
    if (messageTarget.grade) {
      return `${titleLine} — ${formatGradeShort(messageTarget.grade)}`;
    }
    return titleLine;
  }, [messageTarget, locale]);

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
    <>
      <div className="space-y-2">
        {filtered.map((exam) => (
          <ExamRow
            key={exam.id}
            exam={exam}
            expanded={expandedId === exam.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === exam.id ? null : exam.id))
            }
            onMessageTeacher={handleMessageTeacher}
          />
        ))}
      </div>

      {messageTarget && targetContact && (
        <MessageTeacherSheet
          open={!!messageTarget}
          onClose={() => setMessageTarget(null)}
          contactId={targetContact.id}
          childId={messageTarget.childId}
          contextLabel={targetContextLabel}
        />
      )}
    </>
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
