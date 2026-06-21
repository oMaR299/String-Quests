// ProgressView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// النتائج والتقدّم → التقدّم tab. A pastel WIDGET dashboard answering the parent's
// core question "is my child improving?" at a glance:
//   • Widget grid (streak / points / focus / effectiveness)  — big bold numbers
//   • منحنى التقدّم card (trend chip + MiniTrend + warm verdict)
//   • سلوك المذاكرة card (when · sessions this week · avg per session)
//   • آخر الجلسات (3 most-recent sessions) + an "all sessions" button
//   • Primary "learn more" CTA
//
// UI-only & prop-driven: owns NO state and NO data writes. Reuses widgetKit /
// skillMapKit / MiniTrend / CoachingCard helpers + the seeded mocks. House rules:
// pastel fills are DECORATION (status meaning lives in rings), Cairo, full RTL via
// logical properties (ms-/me-/text-start), Lucide strokeWidth={2.5}, Framer Motion
// + useReducedMotion fallbacks.

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Target,
  Zap,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { PASTEL, StatWidget } from './widgetKit';
import { formatPoints, MiniStat } from './skillMapKit';
import { MiniTrend } from './MiniTrend';
import { resolveSubjectStyle } from './CoachingCard';
import { getGrowthSummary, getProgressSeries, type TrendDir } from './data/parentAppGrowthMock';
import { getStudySessions } from './data/parentAppSkillAnalyticsMock';
import { getDnaProfile } from './data/parentAppLearnProfileMock';

interface ProgressViewProps {
  childId: string;
  onOpenLearnMore: () => void;
}

const SPRING = { type: 'spring', stiffness: 240, damping: 24 } as const;

export const ProgressView: React.FC<ProgressViewProps> = ({ childId, onOpenLearnMore }) => {
  const { locale } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const ar = locale === 'ar';
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // ── Data (read-only getters) ───────────────────────────────────────────────
  const summary = useMemo(() => getGrowthSummary(childId), [childId]);
  const progress = useMemo(() => getProgressSeries(childId, 'weekly'), [childId]);
  const sessions14 = useMemo(() => getStudySessions(childId, 14), [childId]);
  const dna = useMemo(() => getDnaProfile(childId), [childId]);

  // ── Derived display metrics (computed in-view; no backend) ──────────────────
  const focusScore = useMemo(() => {
    const trait = dna.traits.find((tr) => tr.labelEn === 'Focus' || tr.labelAr === 'التركيز');
    return (trait ?? dna.traits[0])?.value ?? 0;
  }, [dna]);

  const effectivenessScore = useMemo(() => {
    const accs = sessions14.map((s) => s.accuracyPct);
    const avgSessionAccuracy = accs.length
      ? accs.reduce((sum, v) => sum + v, 0) / accs.length
      : summary.accuracyPct;
    return Math.round(0.6 * avgSessionAccuracy + 0.4 * summary.accuracyPct);
  }, [sessions14, summary.accuracyPct]);

  // ── Study-behavior line (this week / avg minutes / modal time bucket) ───────
  const behavior = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6); // current week window (last 7 days incl. today)

    const thisWeek = sessions14.filter((s) => {
      const d = new Date(s.dateTimeIso);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= weekAgo.getTime();
    });

    const avgMinutes = sessions14.length
      ? Math.round(sessions14.reduce((sum, s) => sum + s.minutes, 0) / sessions14.length)
      : 0;

    // Modal time bucket from the hour of each session.
    const buckets: Record<'morning' | 'afternoon' | 'evening', number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };
    for (const s of sessions14) {
      const hour = new Date(s.dateTimeIso).getHours();
      const key = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      buckets[key] += 1;
    }
    const modal = (Object.keys(buckets) as Array<keyof typeof buckets>).reduce((a, b) =>
      buckets[b] > buckets[a] ? b : a,
    );

    return {
      sessionsThisWeek: thisWeek.length,
      avgMinutes,
      whenLabel: t(`parentApp.skillMap.when.${modal}`),
    };
  }, [sessions14, t]);

  // ── Verdict (warm, one line; mirrors the weekly trend) ──────────────────────
  const verdict = useMemo(() => {
    if (progress.trend === 'up') {
      return ar
        ? 'نعم — في تحسّن واضح، استمرّوا في التشجيع!'
        : 'Yes — clearly improving. Keep cheering them on!';
    }
    if (progress.trend === 'down') {
      return ar
        ? 'تباطأ قليلاً هذا الأسبوع — لحظة لطيفة لدعمه.'
        : 'A little slower this week — a kind moment to support them.';
    }
    return ar
      ? 'ثابت ومستقرّ — أساس متين يُبنى عليه.'
      : 'Steady and consistent — a solid base to build on.';
  }, [progress.trend, ar]);

  // ── Recent sessions (3 most recent; reuse the already-fetched 14) ───────────
  const recent = useMemo(() => sessions14.slice(0, 3), [sessions14]);
  const fmtSessionTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(ar ? 'ar' : 'en', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(iso)),
    [ar],
  );

  const showTrophy = summary.currentStreak >= summary.longestStreak && summary.currentStreak > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1 · Widget grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatWidget
          icon={Flame}
          label={t('parentApp.skillMap.progress.streak')}
          value={String(summary.currentStreak)}
          unit={t('parentApp.skillMap.growth.dayUnit')}
          tone={PASTEL.butter}
          index={0}
          badge={
            showTrophy ? (
              <Trophy className="w-4 h-4 shrink-0" strokeWidth={2.5} style={{ color: '#E0A100' }} aria-hidden="true" />
            ) : undefined
          }
        />
        <StatWidget
          icon={Sparkles}
          label={t('parentApp.skillMap.growth.points')}
          value={formatPoints(summary.points)}
          unit={t('parentApp.skillMap.daily.pointsUnit')}
          tone={PASTEL.lavender}
          index={1}
        />
        <StatWidget
          icon={Target}
          label={t('parentApp.skillMap.progress.focus')}
          value={String(focusScore)}
          unit="%"
          sublabel={t('parentApp.skillMap.focusHint')}
          tone={PASTEL.sky}
          index={2}
        />
        <StatWidget
          icon={Zap}
          label={t('parentApp.skillMap.progress.effectiveness')}
          value={String(effectivenessScore)}
          unit="%"
          sublabel={t('parentApp.skillMap.effectivenessHint')}
          tone={PASTEL.mint}
          index={3}
        />
      </div>

      {/* ── 2 · منحنى التقدّم ─────────────────────────────────────────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.05 }}
        className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-slate-800 leading-tight text-start">
            {t('parentApp.skillMap.growth.progressCurve')}
          </h3>
          <TrendChip dir={progress.trend} label={t(`parentApp.skillMap.growth.trend.${progress.trend}`)} />
        </div>

        <MiniTrend values={progress.values} color="#3DD9C0" />

        <p className="text-[13px] font-extrabold text-slate-700 leading-relaxed text-start">
          <span className="text-slate-400 me-1">{t('parentApp.skillMap.progress.improving')}</span>
          {verdict}
        </p>
      </motion.div>

      {/* ── 3 · سلوك المذاكرة ─────────────────────────────────────────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.1 }}
        className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3"
      >
        <h3 className="text-base font-black text-slate-800 leading-tight text-start">
          {t('parentApp.skillMap.progress.studyBehavior')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label={ar ? 'وقت المذاكرة' : 'Study time'} value={behavior.whenLabel} color="#3E97D6" />
          <MiniStat
            label={ar ? 'جلسات الأسبوع' : 'Sessions'}
            value={String(behavior.sessionsThisWeek)}
            color="#8E7DE0"
          />
          <MiniStat
            label={ar ? 'دقيقة/جلسة' : 'Min/session'}
            value={String(behavior.avgMinutes)}
            color="#1FA992"
          />
        </div>
        <p className="text-[12px] font-bold text-slate-500 leading-relaxed text-start">
          {interpolate(t('parentApp.skillMap.progress.usuallyStudies'), { when: behavior.whenLabel })}
          {' · '}
          {interpolate(t('parentApp.skillMap.progress.sessionsThisWeek'), { n: behavior.sessionsThisWeek })}
          {' · '}
          {interpolate(t('parentApp.skillMap.progress.avgPerSession'), { min: behavior.avgMinutes })}
        </p>
      </motion.div>

      {/* ── 4 · آخر الجلسات ───────────────────────────────────────────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { ...SPRING, delay: 0.15 }}
        className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3"
      >
        <h3 className="text-base font-black text-slate-800 leading-tight text-start">
          {t('parentApp.skillMap.progress.recentSessions')}
        </h3>
        <div className="flex flex-col gap-2.5">
          {recent.map((s) => {
            const style = resolveSubjectStyle(s.subjectKey);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
                  aria-hidden="true"
                >
                  {style.glyph}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-800 leading-tight truncate">
                    {(ar ? s.subjectAr : s.subjectEn) + ' · ' + (ar ? s.lessonAr : s.lessonEn)}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 leading-tight">{fmtSessionTime(s.dateTimeIso)}</div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[12px] font-black text-slate-700 tabular-nums">
                    {s.minutes} {t('parentApp.skillMap.progress.minShort')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">{s.accuracyPct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenLearnMore}
          className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors py-2.5 text-[13px] font-extrabold text-slate-600"
        >
          {t('parentApp.skillMap.progress.allSessions')}
          <ChevronLeft className="w-4 h-4 ltr:rotate-180" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </motion.div>

      {/* ── 5 · Primary CTA ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onOpenLearnMore}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-duo-purple-light hover:brightness-95 transition py-3.5 text-[14px] font-black text-purple-700"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {t('parentApp.skillMap.progress.learnMoreCta')}
      </button>
    </div>
  );
};

// ─── Trend chip (up=emerald / steady=slate / down=rose) ──────────────────────

const TrendChip: React.FC<{ dir: TrendDir; label: string }> = ({ dir, label }) => {
  const map = {
    up: { c: '#1F9D57', Icon: TrendingUp },
    steady: { c: '#94A3B8', Icon: Minus },
    down: { c: '#E14F5E', Icon: TrendingDown },
  } as const;
  const { c, Icon } = map[dir];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0"
      style={{ background: `${c}1A`, color: c }}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
};

export default ProgressView;
