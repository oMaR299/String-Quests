// MapView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Tab "المواد" — the main view of the rebuilt parent hub. A calm, positive-first
// map of where the child stands, top → bottom:
//   1. StatusLegend          — the colour key (status is the language)
//   2. Overall progress ring — the hero card (big mastery ring, banded colour)
//   3. Subject overview grid  — one mastery-ring tile per subject (reused)
//   4. "Help {name} today"   — up to 3 coaching cards, or an all-good card
//   5. "Needs your attention" — near exam + soonest homework (rendered only when
//                                relevant; the whole section is omitted otherwise)
//   6. Strengths             — what the child is great at, celebrated (emerald)
//
// UI-only: every value comes from the existing read-only getters. Flat/white +
// pastel decoration, STATUS palette for ring meaning, Cairo, full RTL via logical
// properties, Lucide icons, Framer Motion + reduced-motion fallbacks.

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sprout, TrendingUp, TrendingDown, Minus, CalendarClock, ChevronLeft, BookOpen, Heart } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { SectionHeader, PASTEL } from './widgetKit';
import { SubjectFlower } from './SubjectFlower';
import { StatusLegend } from './StatusLegend';
import { EXAM_LEVEL_COLOR, dueInPhrase } from './skillMapKit';
import { CoachingCard, resolveSubjectStyle, subjectLabel, skillHead } from './CoachingCard';
import { SubjectOverviewGrid } from './SubjectOverviewGrid';
import { getStrengths, getNextExam } from './data/parentAppSkillAnalyticsMock';
import { getHomeworkForChild } from '../data/parentAppSchoolMockData';
import { getDailyInsightsForChild } from '../data/parentAppDailyInsightsMock';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';

interface MapViewProps {
  childId: string;
  childName: string;
  /** All subjects. */
  areas: ParentSkillArea[];
  /** Today's 0-3 focus areas (already selected upstream). */
  focus: ParentSkillArea[];
  sentAreaIds: string[];
  onSendPractice: (areaId: string) => void;
  /** Opens the subject detail sheet. */
  onSelectSubject: (area: ParentSkillArea) => void;
  /** Opens the subject detail sheet straight on its exam tab. */
  onOpenExam: (area: ParentSkillArea) => void;
}

const SPRING = { type: 'spring', stiffness: 240, damping: 24 } as const;

export const MapView: React.FC<MapViewProps> = ({
  childId,
  childName,
  areas,
  focus,
  sentAreaIds,
  onSendPractice,
  onSelectSubject,
  onOpenExam,
}) => {
  const { locale } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';

  const sentSet = useMemo(() => new Set(sentAreaIds), [sentAreaIds]);

  // ── Strengths (top proficient/mastered subjects) ──
  const strengths = useMemo(() => getStrengths(childId), [childId]);

  // ── Wellbeing / mood (answers "is my child happy or stressed?") ──
  const mood = useMemo(
    () => getDailyInsightsForChild(childId).find((d) => d.topic === 'mood') ?? null,
    [childId],
  );
  const MoodTrend = mood ? (mood.trend === 'up' ? TrendingUp : mood.trend === 'down' ? TrendingDown : Minus) : Minus;
  const moodTrendColor = mood?.trend === 'up' ? '#1FA992' : mood?.trend === 'down' ? '#E0A100' : '#94A3B8';

  // ── Needs-attention sources ──
  const nextExam = useMemo(() => getNextExam(childId), [childId]);
  const examArea = nextExam ? areas.find((a) => a.subjectKey === nextExam.exam.subject) ?? null : null;
  const showExam = !!(nextExam && examArea && nextExam.daysUntil <= 7);

  const dueHomework = useMemo(
    () =>
      getHomeworkForChild(childId)
        .filter((h) => h.calmStatus === 'pending' || h.calmStatus === 'pastDue')
        .slice(0, 2),
    [childId],
  );
  const showAttention = showExam || dueHomework.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Status legend ── */}
      <StatusLegend />

      {/* ── 1b. Wellbeing / mood (whole-child, calm) ── */}
      {mood && (
        <div className="rounded-2xl p-3 flex items-center gap-2.5" style={{ background: PASTEL.pink.bg }}>
          <span
            className="w-9 h-9 rounded-2xl inline-flex items-center justify-center shrink-0 bg-white/70"
            style={{ color: PASTEL.pink.icon }}
            aria-hidden="true"
          >
            <Heart className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {ar ? 'كيف يشعر اليوم' : 'How they feel today'}
            </div>
            <div className="text-[13px] font-black text-slate-800 leading-tight truncate">
              {ar ? mood.headlineAr : mood.headlineEn}
            </div>
          </div>
          <MoodTrend className="w-4 h-4 shrink-0" strokeWidth={2.5} style={{ color: moodTrendColor }} aria-hidden="true" />
        </div>
      )}

      {/* ── 2. Centerpiece: subject performance flower (petal per subject) ── */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : SPRING}
        className="rounded-[28px] bg-white px-6 py-6 flex flex-col items-center gap-2"
        style={{ boxShadow: '0 14px 36px -22px rgba(40,30,60,0.30)' }}
      >
        <SubjectFlower areas={areas} />
        <p className="text-[15px] font-black text-slate-800 leading-snug text-center">
          {interpolate(t('parentApp.skillMap.map.overall'), { name: childName })}
        </p>
      </motion.section>

      {/* ── 3. Subject overview grid (brings its own header) ── */}
      <SubjectOverviewGrid areas={areas} childName={childName} onSelectSubject={onSelectSubject} />

      {/* ── 4. Help {name} today ── */}
      <section className="flex flex-col gap-3">
        <SectionHeader title={interpolate(t('parentApp.skillMap.map.helpToday'), { name: childName })} />
        {focus.length > 0 ? (
          <div className="flex flex-col gap-3">
            {focus.slice(0, 3).map((area) => (
              <CoachingCard
                key={area.id}
                area={area}
                childName={childName}
                sent={sentSet.has(area.id)}
                onSendPractice={onSendPractice}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : SPRING}
            className="rounded-2xl bg-duo-green-light border border-duo-green/25 p-5 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl inline-flex items-center justify-center bg-duo-green text-white shrink-0">
              <Sprout className="w-6 h-6" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-800 leading-snug">
                {interpolate(t('parentApp.skillMap.allHealthyTitle'), { name: childName })}
              </h3>
              <p className="text-[13px] font-bold text-slate-600 leading-relaxed">
                {t('parentApp.skillMap.allHealthyBody')}
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── 5. Needs your attention (only when relevant) ── */}
      {showAttention && (
        <section className="flex flex-col gap-3">
          <SectionHeader title={t('parentApp.skillMap.map.needsAttention')} />
          <div className="flex flex-col gap-2.5">
            {/* (a) Near exam */}
            {showExam && nextExam && examArea && (
              <motion.button
                type="button"
                onClick={() => onOpenExam(examArea)}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : SPRING}
                className="rounded-2xl p-4 flex items-center gap-3 text-start motion-safe:active:scale-[0.99] transition-transform"
                style={{
                  background: `${EXAM_LEVEL_COLOR[nextExam.level]}1A`,
                  border: `1px solid ${EXAM_LEVEL_COLOR[nextExam.level]}55`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-2xl inline-flex items-center justify-center shrink-0 text-white"
                  style={{ background: EXAM_LEVEL_COLOR[nextExam.level] }}
                  aria-hidden="true"
                >
                  <CalendarClock className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-800 leading-tight">
                    {interpolate(t('parentApp.skillMap.examBanner'), {
                      subject: ar ? examArea.subjectAr : examArea.subjectEn,
                      n: nextExam.daysUntil,
                    })}
                  </div>
                  <div className="text-[12px] font-bold text-slate-500 leading-tight">
                    {interpolate(t('parentApp.skillMap.examBannerReadiness'), { pct: nextExam.readinessPct })}
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0 ltr:rotate-180" strokeWidth={2.5} aria-hidden="true" />
              </motion.button>
            )}

            {/* (b) Soonest 1-2 pending/pastDue homework items */}
            {dueHomework.map((hw, i) => {
              const area = areas.find((a) => a.subjectKey === hw.subject);
              const style = resolveSubjectStyle(hw.subject);
              const dueText =
                hw.calmStatus === 'pastDue'
                  ? ar
                    ? 'لم يُسلَّم بعد'
                    : 'Not handed in yet'
                  : dueInPhrase(hw.daysUntilDue, locale);
              return (
                <motion.button
                  key={hw.id}
                  type="button"
                  onClick={() => area && onSelectSubject(area)}
                  disabled={!area}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26, delay: i * 0.03 }
                  }
                  className="rounded-2xl bg-white border border-slate-100 p-3 flex items-center gap-3 text-start motion-safe:active:scale-[0.98] transition-transform disabled:active:scale-100"
                >
                  <div
                    className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
                    aria-hidden="true"
                  >
                    {style.glyph}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400">
                      <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                      {ar ? 'واجب' : 'Homework'}
                    </div>
                    <div className="text-[13px] font-black text-slate-800 leading-snug truncate">
                      {ar ? hw.titleAr : hw.titleEn}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                      hw.calmStatus === 'pastDue' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dueText}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 6. Strengths ── */}
      {strengths.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title={interpolate(t('parentApp.skillMap.strengthsTitle'), { name: childName })} />
          <div className="flex flex-col gap-2">
            {strengths.map((a, i) => (
              <StrengthRow key={a.id} area={a} locale={locale} index={i} onTap={() => onSelectSubject(a)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ─── Strength row (celebrated, emerald) — modelled on SnapshotView's StrengthRow ─

const StrengthRow: React.FC<{
  area: ParentSkillArea;
  locale: 'ar' | 'en';
  index: number;
  onTap: () => void;
}> = ({ area, locale, index, onTap }) => {
  const reduce = useReducedMotion() ?? false;
  const style = resolveSubjectStyle(area.subjectKey);
  return (
    <motion.button
      type="button"
      onClick={onTap}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26, delay: index * 0.03 }}
      className="rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3 flex items-center gap-3 text-start motion-safe:active:scale-[0.98] transition-transform"
    >
      <div
        className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
        aria-hidden="true"
      >
        {style.glyph}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-slate-800 leading-tight truncate">{subjectLabel(area, locale)}</div>
        <div className="text-[11px] font-bold text-slate-500 leading-tight truncate">{skillHead(area, locale)}</div>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700 shrink-0">
        <TrendingUp className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {area.masteryPct}%
      </span>
    </motion.button>
  );
};

export default MapView;
