// SubjectDetailScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-height per-subject "story" (replaces the cramped 4-tab bottom sheet). One
// calm scroll instead of tabs: ring + plain status → 5-point summary → vs class →
// ONE mastery trend → units → exam (if any; deep-link target) → a collapsed
// "متقدّم" drawer (accuracy/effort trends + ways-of-thinking + page grid).
//
// Reuses Ring, MiniTrend, ClassAvgBar, PageMasteryGrid, SentState, the analytics
// getters, and the status palette. Flat, Cairo, Lucide, full RTL, reduced-motion.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import { Ring } from '../cards/ScoreRing';
import PrimaryButton from '../../parent-onboarding/PrimaryButton';
import { MiniTrend } from './MiniTrend';
import { AiBrief } from './AiBrief';
import { getSubjectTabBrief } from './data/parentAppAiBriefs';
import { STATUS_CHIP, SentState } from './CoachingCard';
import { ClassAvgBar } from './ClassAvgBar';
import { PageMasteryGrid } from './PageMasteryGrid';
import { getSubjectTree, type TreeUnit } from './data/parentAppTextbookTreeMock';
import {
  getSubjectSeries,
  getSubjectPeer,
  getSubjectSummaryPoints,
  getSubjectPages,
  getUpcomingExamForSubject,
} from './data/parentAppSkillAnalyticsMock';
import { getSubjectSkillTypes } from './data/parentAppLearnProfileMock';
import { getSubjectRank } from './data/parentAppStandingMock';
import type { ParentSkillArea, ParentSkillStatus } from './data/parentAppSkillMapMock';
import { STATUS_COLOR, EXAM_LEVEL_COLOR, inDaysPhrase } from './skillMapKit';

const ACCURACY_COLOR = '#54B6E6';
const EFFORT_COLOR = '#FFB23E';

export interface SubjectDetailScreenProps {
  open: boolean;
  onClose: () => void;
  childId: string | null;
  childName: string;
  area: ParentSkillArea | null;
  sent: boolean;
  onSendPractice: (areaId: string) => void;
  /** 'exam' deep-links straight to (and scrolls to) the exam section. */
  initialFocus?: 'overview' | 'exam';
}

export const SubjectDetailScreen: React.FC<SubjectDetailScreenProps> = ({
  open,
  onClose,
  childId,
  childName,
  area,
  sent,
  onSendPractice,
  initialFocus = 'overview',
}) => {
  const { locale } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';
  const { setOverlayOpen } = useParentAppContext();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const examRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Hide the app header + bottom tab bar while this full-screen overlay is open.
  useEffect(() => {
    setOverlayOpen(open);
    return () => setOverlayOpen(false);
  }, [open, setOverlayOpen]);

  const subjectKey = area?.subjectKey ?? null;

  const tree = useMemo(
    () => (open && childId && subjectKey ? getSubjectTree(childId, subjectKey) : null),
    [open, childId, subjectKey],
  );
  const series = useMemo(
    () => (open && childId && subjectKey ? getSubjectSeries(childId, subjectKey, 30) : []),
    [open, childId, subjectKey],
  );
  const peer = useMemo(
    () => (open && childId && subjectKey ? getSubjectPeer(childId, subjectKey) : null),
    [open, childId, subjectKey],
  );
  const summary = useMemo(
    () => (open && childId && subjectKey ? getSubjectSummaryPoints(childId, subjectKey, childName, locale) : []),
    [open, childId, subjectKey, childName, locale],
  );
  const pages = useMemo(
    () => (open && childId && subjectKey ? getSubjectPages(childId, subjectKey) : []),
    [open, childId, subjectKey],
  );
  const exam = useMemo(
    () => (open && childId && subjectKey ? getUpcomingExamForSubject(childId, subjectKey) : null),
    [open, childId, subjectKey],
  );
  const skillTypes = useMemo(
    () => (open && childId && subjectKey ? getSubjectSkillTypes(childId, subjectKey) : []),
    [open, childId, subjectKey],
  );
  const rank = useMemo(
    () => (open && childId && subjectKey ? getSubjectRank(childId, subjectKey) : null),
    [open, childId, subjectKey],
  );

  const subject = tree ? (ar ? tree.subjectAr : tree.subjectEn) : '';
  const statusColor = area ? STATUS_COLOR[area.status] : '#54B6E6';

  const weakest = useMemo<TreeUnit | null>(() => {
    if (!tree || tree.units.length === 0) return null;
    return [...tree.units].sort((a, b) => a.masteryPct - b.masteryPct)[0];
  }, [tree]);
  const weakestSkillType = useMemo(
    () => (skillTypes.length ? [...skillTypes].sort((a, b) => a.value - b.value)[0] : null),
    [skillTypes],
  );
  const overviewBrief = useMemo(
    () => (open && childId && subjectKey ? getSubjectTabBrief(childId, subjectKey, childName, 'overview', locale) : ''),
    [open, childId, subjectKey, childName, locale],
  );

  // Body scroll lock + Escape-to-close + focus while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const tm = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(tm);
    };
  }, [open, onClose]);

  // Deep-link: scroll to the exam section when asked.
  useEffect(() => {
    if (open && initialFocus === 'exam' && exam) {
      const tm = window.setTimeout(() => examRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }), 220);
      return () => window.clearTimeout(tm);
    }
  }, [open, initialFocus, exam, reduce]);

  return (
    <AnimatePresence>
      {open && area && tree && (
        <>
          <motion.div
            className="fixed inset-0 z-[210] bg-slate-900/30"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="fixed inset-0 z-[211] mx-auto max-w-[430px] bg-slate-50 flex flex-col font-cairo"
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={reduce ? { duration: 0.12 } : { type: 'spring', stiffness: 240, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label={subject}
          >
            {/* Top bar */}
            <div className="relative shrink-0 px-3 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-extrabold text-slate-500 hover:bg-slate-100 active:scale-95 transition"
                aria-label={t('parentApp.skillMap.detail.back')}
              >
                <ChevronRight className="w-4 h-4 ltr:hidden" strokeWidth={2.5} aria-hidden="true" />
                <ChevronLeft className="w-4 h-4 rtl:hidden" strokeWidth={2.5} aria-hidden="true" />
                {t('parentApp.skillMap.detail.back')}
              </button>
              <h2 className="flex-1 min-w-0 text-center text-[15px] font-black text-slate-800 truncate">
                {subject} · {childName}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 active:scale-95 transition shrink-0"
                aria-label={t('parentApp.skillMap.detail.close')}
              >
                <X className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-4">
              <AiBrief text={overviewBrief} />

              {/* Header ring */}
              <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-4">
                <Ring value={tree.masteryPct} color={statusColor} size={96} stroke={11}>
                  <span className="text-[26px] font-black leading-none" style={{ color: statusColor }}>
                    {tree.masteryPct}
                    <span className="text-[12px] font-extrabold">%</span>
                  </span>
                </Ring>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold text-slate-400">
                    {t('parentApp.skillMap.tree.overallMastery')}
                  </div>
                  <div className="text-lg font-black text-slate-800 leading-tight">{subject}</div>
                  <span
                    className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${STATUS_CHIP[area.status].bg} ${STATUS_CHIP[area.status].text}`}
                  >
                    {t(STATUS_CHIP[area.status].labelKey)}
                  </span>
                </div>
              </div>

              {/* 5-point summary */}
              {summary.length > 0 && (
                <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2.5">
                  <span className="text-[12px] font-extrabold text-slate-500">
                    {t('parentApp.skillMap.quickSummary')}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusColor }} aria-hidden="true" />
                        <span className="text-[13px] font-bold text-slate-600 leading-relaxed text-start">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* vs class */}
              {peer && (
                <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-extrabold text-slate-500">
                      {t('parentApp.skillMap.peerTitle')}
                    </span>
                    {rank && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 shrink-0 tabular-nums">
                        {interpolate(t('parentApp.skillMap.rank.position'), { rank: rank.rank, n: rank.classSize })}
                      </span>
                    )}
                  </div>
                  <ClassAvgBar childPct={peer.childPct} classAvgPct={peer.classAvgPct} childColor={statusColor} childLabel={childName} />
                </div>
              )}

              {/* one mastery trend */}
              <TrendChart title={t('parentApp.skillMap.masteryOverTime')} series={series.map((p) => p.masteryPct)} color={statusColor} />

              {/* What's next + send */}
              {weakest && (
                <div className="rounded-2xl bg-duo-blue-light border border-duo-blue/20 p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-duo-blue shrink-0 mt-0.5" strokeWidth={2.5} aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-duo-blue">
                        {t('parentApp.skillMap.nextFocus')}
                      </div>
                      <p className="text-sm font-black text-slate-800 leading-snug">
                        {interpolate(t('parentApp.skillMap.focusOnUnit'), { unit: ar ? weakest.titleAr : weakest.titleEn })}
                      </p>
                    </div>
                  </div>
                  {sent ? (
                    <SentState locale={locale} childName={childName} />
                  ) : (
                    <PrimaryButton variant="primary" onClick={() => onSendPractice(area.id)}>
                      <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                      {t('parentApp.skillMap.sendPractice')}
                    </PrimaryButton>
                  )}
                </div>
              )}

              {/* Units */}
              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-extrabold text-slate-500 px-1">
                  {t('parentApp.skillMap.detail.units')}
                </span>
                {tree.units.map((unit) => (
                  <UnitRow key={unit.id} unit={unit} locale={locale} />
                ))}
              </div>

              {/* Page mastery — surfaced (was hidden in the advanced drawer) */}
              <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3">
                <span className="text-[12px] font-extrabold text-slate-500">
                  {t('parentApp.skillMap.pagesLabel')}
                </span>
                <PageMasteryGrid pages={pages} />
              </div>

              {/* Exam (deep-link target) */}
              {exam && (
                <div ref={examRef} className="flex flex-col gap-3 scroll-mt-3">
                  <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-4">
                    <Ring value={exam.readinessPct} color={EXAM_LEVEL_COLOR[exam.level]} size={84} stroke={10}>
                      <span className="text-2xl font-black leading-none" style={{ color: EXAM_LEVEL_COLOR[exam.level] }}>
                        {exam.readinessPct}
                        <span className="text-[11px] font-extrabold">%</span>
                      </span>
                    </Ring>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-extrabold text-slate-400">
                        {t('parentApp.skillMap.examReadiness')}
                      </div>
                      <div className="text-base font-black text-slate-800 leading-tight">
                        {ar ? exam.exam.titleAr : exam.exam.titleEn}
                      </div>
                      <span
                        className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                        style={{ background: `${EXAM_LEVEL_COLOR[exam.level]}22`, color: EXAM_LEVEL_COLOR[exam.level] }}
                      >
                        {t(`parentApp.skillMap.examLevel.${exam.level}`)} · {inDaysPhrase(exam.daysUntil, locale)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-1.5">
                    <span className="text-[12px] font-extrabold text-slate-500">
                      {t('parentApp.skillMap.examTopics')}
                    </span>
                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed">
                      {ar ? exam.exam.topicsAr : exam.exam.topicsEn}
                    </p>
                  </div>
                  {(ar ? exam.exam.tipsAr : exam.exam.tipsEn).length > 0 && (
                    <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2.5">
                      <span className="text-[12px] font-extrabold text-slate-500">
                        {t('parentApp.skillMap.examPlan')}
                      </span>
                      <ul className="flex flex-col gap-2">
                        {(ar ? exam.exam.tipsAr : exam.exam.tipsEn).map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CalendarClock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-duo-blue" strokeWidth={2.5} aria-hidden="true" />
                            <span className="text-[12.5px] font-bold text-slate-600 leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced (collapsed) */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  aria-expanded={advancedOpen}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-white border border-slate-100 px-4 py-3 text-start active:scale-[0.99] transition"
                >
                  <span className="text-[13px] font-black text-slate-700">{t('parentApp.skillMap.detail.advanced')}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} aria-hidden="true" />
                </button>
                {advancedOpen && (
                  <div className="flex flex-col gap-4">
                    <TrendChart title={t('parentApp.skillMap.accuracyTrend')} series={series.map((p) => p.accuracyPct)} color={ACCURACY_COLOR} />
                    <TrendChart title={t('parentApp.skillMap.effortTrend')} series={series.map((p) => p.effortScore)} color={EFFORT_COLOR} />
                    <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2">
                      <span className="text-[12px] font-extrabold text-slate-500">
                        {t('parentApp.skillMap.skillTypesTitle')}
                      </span>
                      <div className="flex flex-col gap-2">
                        {skillTypes.map((s) => {
                          const weak = s.key === weakestSkillType?.key;
                          const c = weak ? '#FF6F7A' : '#54B6E6';
                          return (
                            <div key={s.key} className="flex items-center gap-3">
                              <span className="w-16 shrink-0 text-[12px] font-bold text-slate-600 text-start">{ar ? s.labelAr : s.labelEn}</span>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: c }} />
                              </div>
                              <span className="w-9 shrink-0 text-[12px] font-black tabular-nums" style={{ color: c }}>{s.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Trend chart (titled card around MiniTrend) ───────────────────────────────

const TrendChart: React.FC<{ title: string; series: number[]; color: string }> = ({ title, series, color }) => {
  if (series.length === 0) return null;
  const current = series[series.length - 1];
  const delta = current - series[0];
  const deltaColor = delta > 1 ? '#1F9D57' : delta < -1 ? '#FF6F7A' : '#94A3B8';
  const DeltaIcon = delta > 1 ? TrendingUp : delta < -1 ? TrendingDown : Minus;
  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-extrabold text-slate-500">{title}</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold" style={{ background: `${deltaColor}1A`, color: deltaColor }}>
            <DeltaIcon className="w-3 h-3" strokeWidth={2.5} />
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
          <span className="text-xl font-black tabular-nums" style={{ color }}>
            {current}
            <span className="text-[11px] font-extrabold">%</span>
          </span>
        </div>
      </div>
      <MiniTrend values={series} color={color} />
    </div>
  );
};

// ─── Mastery bar + expandable unit row ────────────────────────────────────────

const MasteryBar: React.FC<{ pct: number; status: ParentSkillStatus; thin?: boolean }> = ({ pct, status, thin }) => (
  <div className={`${thin ? 'h-1.5' : 'h-2'} w-full rounded-full bg-slate-100 overflow-hidden`}>
    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLOR[status] }} />
  </div>
);

const UnitRow: React.FC<{ unit: TreeUnit; locale: 'ar' | 'en' }> = ({ unit, locale }) => {
  const [open, setOpen] = useState(false);
  const ar = locale === 'ar';
  const title = ar ? unit.titleAr : unit.titleEn;
  return (
    <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center gap-3 p-3 text-start">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-black text-slate-800 leading-tight truncate">{title}</span>
            <span className="text-[13px] font-black text-slate-500 shrink-0 tabular-nums">{unit.masteryPct}%</span>
          </div>
          <MasteryBar pct={unit.masteryPct} status={unit.status} />
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} aria-hidden="true" />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 flex flex-col gap-2.5 border-t border-slate-100">
          {unit.lessons.map((lesson) => (
            <div key={lesson.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold text-slate-600 leading-tight truncate">{ar ? lesson.titleAr : lesson.titleEn}</span>
                <span className="text-[11px] font-extrabold text-slate-400 shrink-0 tabular-nums">{lesson.masteryPct}%</span>
              </div>
              <MasteryBar pct={lesson.masteryPct} status={lesson.status} thin />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectDetailScreen;
