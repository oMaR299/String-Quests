// AssignmentsDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// List of upcoming assignments grouped by child. Each row expands inline to
// show description + child it belongs to. The status pill is now driven by
// a 5-state taxonomy that's DERIVED at render time from the assignment's
// stored progress + its deadline:
//
//   not-started → slate    (nothing started, deadline > 24h out)
//   started     → duo-blue (in progress, deadline > 24h out)
//   in-danger   → amber    (not done, deadline ≤ 24h)
//   late        → rose     (not done, deadline already passed)
//   done        → emerald  (with a small check icon)
//
// All Tailwind classes are static literals so the v4 JIT picks every one of
// them at build time.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, ClipboardList, Check, MessageSquare } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  MOCK_ASSIGNMENTS,
  SUBJECT_STYLES,
  deriveAssignmentStatus,
  type Assignment,
  type AssignmentDisplayStatus,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';
import { daysUntilIso } from '../parentAppMockData';
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
  assignment: Assignment;
  expanded: boolean;
  onToggle: () => void;
  /** Tick that causes time-derived status to refresh once a minute. */
  nowTick: number;
  /** Fired when the expanded row's "Message teacher" CTA is tapped. */
  onMessageTeacher: (assignment: Assignment) => void;
}

// Static Tailwind v4 JIT-safe class map for the 5 derived states.
const STATUS_STYLES: Record<
  AssignmentDisplayStatus,
  { bg: string; text: string; labelKey: string }
> = {
  'not-started': {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    labelKey: 'parentApp.school.assignments.statusNotStarted',
  },
  started: {
    bg: 'bg-duo-blue-light',
    text: 'text-duo-blue',
    labelKey: 'parentApp.school.assignments.statusStarted',
  },
  'in-danger': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    labelKey: 'parentApp.school.assignments.statusInDanger',
  },
  late: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    labelKey: 'parentApp.school.assignments.statusLate',
  },
  done: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    labelKey: 'parentApp.school.assignments.statusDone',
  },
};

const AssignmentRow: React.FC<RowProps> = ({
  assignment,
  expanded,
  onToggle,
  nowTick,
  onMessageTeacher,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const subjectStyle = SUBJECT_STYLES[assignment.subject];
  const title = locale === 'ar' ? assignment.titleAr : assignment.titleEn;
  const description =
    locale === 'ar' ? assignment.descriptionAr : assignment.descriptionEn;
  const days = daysUntilIso(assignment.dueIso);

  // Derived display status — recomputed whenever `nowTick` advances so the
  // "in-danger" state can flip to "late" once the deadline passes without
  // a full re-render of the strip.
  const displayStatus = useMemo(
    () => deriveAssignmentStatus(assignment.progress, assignment.dueIso, nowTick),
    [assignment.progress, assignment.dueIso, nowTick]
  );
  const statusStyle = STATUS_STYLES[displayStatus];

  let dueLabel: string;
  if (displayStatus === 'late') {
    dueLabel = t('parentApp.school.assignments.dueOverdue');
  } else if (days <= 0) {
    dueLabel = t('parentApp.school.assignments.dueToday');
  } else if (days === 1) {
    dueLabel = t('parentApp.school.assignments.dueTomorrow');
  } else {
    dueLabel = interpolate(t('parentApp.school.assignments.dueInDays'), { n: days });
  }

  // Grade rendering — pill in the row header + breakdown panel in the expand.
  const grade = assignment.grade;
  const gradeTone = grade ? getGradeTone(grade) : null;
  const gradeClasses = gradeTone ? GRADE_TONE_CLASSES[gradeTone] : null;
  const gradeComment = grade
    ? locale === 'ar'
      ? grade.teacherCommentAr
      : grade.teacherCommentEn
    : undefined;

  return (
    <div
      className="rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors"
      aria-expanded={expanded}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-start active:scale-[0.99] transition-transform"
        aria-expanded={expanded}
      >
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
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subjectStyle.pillBg} ${subjectStyle.pillText}`}
              >
                {locale === 'ar' ? subjectStyle.labelAr : subjectStyle.labelEn}
              </span>
              <span className="text-[11px] font-bold text-slate-500">{dueLabel}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusStyle.bg} ${statusStyle.text}`}
              >
                {displayStatus === 'done' && (
                  <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
                )}
                {t(statusStyle.labelKey)}
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
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </div>
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
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-3">
              {/* Description (always present) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t('parentApp.school.assignments.descriptionLabel')}
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Grade panel — only when scored */}
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

              {/* "Not graded yet" hint when work is done but no grade */}
              {!grade && assignment.progress === 'done' && (
                <p className="text-[11px] font-bold italic text-slate-400">
                  {t('parentApp.school.grade.notGradedYet')}
                </p>
              )}

              {/* Message teacher CTA — appears whenever the row is expanded
                  (whether graded or not — parent might want to comment
                  before grading too). */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessageTeacher(assignment);
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
  );
};

/**
 * Body-only renderer, no BottomSheet wrapper — used by SchoolLogisticsStrip
 * which hosts a single shared BottomSheet that swaps body content as the
 * user swipes between the 6 logistics drawers (Fix 2).
 */
export const AssignmentsDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const { activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Tick once per minute so the "in-danger" → "late" transition happens
  // without a manual refresh. Lightweight: a single setInterval per mount.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // MessageTeacherSheet target — null when the sheet is closed.
  const [messageTarget, setMessageTarget] = useState<Assignment | null>(null);
  const handleMessageTeacher = useCallback((a: Assignment) => {
    setMessageTarget(a);
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

  // Filtered (single active child only) + sorted: late first, then in-danger,
  // then started, then not-started, then done. Within each bucket, soonest
  // deadline first.
  const filtered = useMemo(() => {
    const order: Record<AssignmentDisplayStatus, number> = {
      late: 0,
      'in-danger': 1,
      started: 2,
      'not-started': 3,
      done: 4,
    };
    return MOCK_ASSIGNMENTS.filter((a) => a.childId === activeChildId)
      .map((a) => ({
        a,
        ds: deriveAssignmentStatus(a.progress, a.dueIso, nowTick),
      }))
      .sort((x, y) => {
        const oDiff = order[x.ds] - order[y.ds];
        if (oDiff !== 0) return oDiff;
        return daysUntilIso(x.a.dueIso) - daysUntilIso(y.a.dueIso);
      })
      .map((x) => x.a);
  }, [activeChildId, nowTick]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
        <ClipboardList className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-500">
          {t('parentApp.school.assignments.empty')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map((a) => (
          <AssignmentRow
            key={a.id}
            assignment={a}
            expanded={expandedId === a.id}
            nowTick={nowTick}
            onToggle={() =>
              setExpandedId((prev) => (prev === a.id ? null : a.id))
            }
            onMessageTeacher={handleMessageTeacher}
          />
        ))}
      </div>

      {/* Message-teacher sheet — opens over the drawer, closes itself on send.
          We render it conditionally on `messageTarget` so re-opening for a
          different assignment freshly mounts the textarea. */}
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
 * Standalone wrapper — kept for back-compat / standalone use cases. Not used
 * by SchoolLogisticsStrip anymore (the strip composes a single shared
 * BottomSheet around the content components above).
 */
export const AssignmentsDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.assignments.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.assignments.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="assignments"
    >
      <AssignmentsDrawerContent />
    </BottomSheet>
  );
};

export default AssignmentsDrawer;
