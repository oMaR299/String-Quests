// LearnMoreView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The quiet "تعرّف أكثر" (Learn more) full-screen overlay of the rebuilt parent
// hub. This is where the DEEP insights live — relocated out of the daily flow
// and rewritten in plain parent language (NO jargon: no "DNA", no "Bloom's",
// no "mastery %", no "readiness index"). UI-only, prop-driven, reuses existing
// getters + section components.
//
// Shell models on ../drawers/BottomSheet.tsx but is FULL-HEIGHT (fixed inset-0):
//   • AnimatePresence backdrop fade + panel slide-up (reduced-motion → fade)
//   • Top bar with a back button (RTL-aware chevron) + centered title
//   • Scrollable body, Escape-to-close, focus the back button on open
//
// Sections (top → bottom):
//   1. How {name} learns      — archetype + 4 trait bars + style-alignment ring
//   2. Strategies that work    — green working rows + amber "try instead" rows
//   3. Life skills             — daily-insight headlines + calm trend icons
//   4. Standing in String      — narrative summary + tag chips (NO numeric rank)
//   5. Teachers & impact       — subject glyph + teacher + note (star top rapport)
//   6. Study rhythm            — existing <StudyPeriodsSection />
//   7. Comparison & time       — existing <SkillInsightsSection />
//
// House rules: flat white cards w/ hairline borders + occasional pastel accents,
// Cairo, FULL RTL via logical props (text-start, ms-/me-), Lucide strokeWidth
// 2.5, Framer Motion + useReducedMotion fallback.

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  MessageCircle,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import { Ring } from '../cards/ScoreRing';
import { RING } from './skillMapKit';
import { resolveSubjectStyle } from './CoachingCard';
import { SectionHeader, PASTEL } from './widgetKit';
import { SkillInsightsSection } from './SkillInsightsSection';
import { StudyPeriodsSection } from './StudyPeriodsSection';
import { ClassRankCard } from './ClassRankCard';
import { PeerComparisonBars } from './PeerComparisonBars';
import { TrendsPanel } from './TrendsPanel';
import {
  getDnaProfile,
  getStrategies,
} from './data/parentAppLearnProfileMock';
import {
  getStringStanding,
  getTeacherImpact,
} from './data/parentAppStandingMock';
import {
  getDailyInsightsForChild,
  type InsightTrend,
} from '../data/parentAppDailyInsightsMock';

// ─── Local presentation helpers ───────────────────────────────────────────────

/** One filled-bar row (label · track+fill · value%) — the trait bar pattern. */
const TraitBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex items-center gap-3">
    <span className="w-16 shrink-0 text-[12px] font-bold text-slate-600 text-start">
      {label}
    </span>
    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </div>
    <span className="w-9 shrink-0 text-[12px] font-black tabular-nums text-start" style={{ color }}>
      {value}
      <span className="text-[9px] font-extrabold">%</span>
    </span>
  </div>
);

/** A white rounded-3xl hairline section card with a SectionHeader on top. */
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="flex flex-col gap-3">
    <SectionHeader title={title} />
    <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3.5">
      {children}
    </div>
  </section>
);

// ─── Props ─────────────────────────────────────────────────────────────────────

interface LearnMoreViewProps {
  open: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const LearnMoreView: React.FC<LearnMoreViewProps> = ({
  open,
  onClose,
  childId,
  childName,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion() ?? false;
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';
  const backBtnRef = useRef<HTMLButtonElement | null>(null);

  // ── Data (read-only getters) ────────────────────────────────────────────────
  const dna = useMemo(() => getDnaProfile(childId), [childId]);
  const strategies = useMemo(() => getStrategies(childId), [childId]);
  const lifeSkills = useMemo(() => getDailyInsightsForChild(childId), [childId]);
  const standing = useMemo(
    () => getStringStanding(childId, childName, locale),
    [childId, childName, locale],
  );
  const teachers = useMemo(() => getTeacherImpact(childId), [childId]);

  // ── Escape-to-close + focus the back button on open ─────────────────────────
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    // Defer focus so the panel is mounted/painted first.
    const id = window.setTimeout(() => backBtnRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
    };
  }, [open, onClose]);

  // ── Body scroll lock while open ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ── Hide the app header + bottom tab bar while this full-screen overlay is open ──
  const { setOverlayOpen } = useParentAppContext();
  useEffect(() => {
    setOverlayOpen(open);
    return () => setOverlayOpen(false);
  }, [open, setOverlayOpen]);

  // ── Calm trend glyph + color (never red — amber is the strongest down-tone) ──
  const trendIcon = (tr: InsightTrend) =>
    tr === 'up' ? TrendingUp : tr === 'down' ? TrendingDown : Minus;
  const trendColor = (tr: InsightTrend) =>
    tr === 'up' ? '#1FA992' : tr === 'down' ? '#E0A100' : '#94A3B8';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — fade. Tap closes. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="fixed inset-0 z-[199] bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Full-height panel — slide-up (reduced motion → fade) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('parentApp.skillMap.segLearnMore')}
            dir={dir}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 220, damping: 26 }
            }
            className="fixed inset-0 z-[200] mx-auto max-w-[430px] bg-white flex flex-col font-cairo"
          >
            {/* Top bar */}
            <div className="shrink-0 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <button
                ref={backBtnRef}
                type="button"
                onClick={onClose}
                aria-label={t('parentApp.skillMap.detail.back')}
                className="inline-flex items-center gap-1 px-2 py-1 -ms-2 rounded-full text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                {/* RTL: chevron points right (back = forward in reading flow).
                    LTR: chevron points left. */}
                <ChevronRight className="w-5 h-5 ltr:hidden" strokeWidth={2.5} />
                <ChevronLeft className="w-5 h-5 rtl:hidden" strokeWidth={2.5} />
                <span className="text-[13px] font-extrabold">
                  {t('parentApp.skillMap.detail.back')}
                </span>
              </button>
              <h1 className="flex-1 text-center text-base font-black text-slate-800 leading-tight truncate">
                {t('parentApp.skillMap.segLearnMore')}
              </h1>
              {/* Spacer balances the back button so the title stays centered. */}
              <span className="w-[68px] shrink-0" aria-hidden="true" />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 flex flex-col gap-5">
              {/* 1 · How {name} learns */}
              <SectionCard
                title={interpolate(t('parentApp.skillMap.learn.howLearns'), {
                  name: childName,
                })}
              >
                {/* Archetype + tagline */}
                <div className="flex flex-col gap-0.5">
                  <div className="text-base font-black text-slate-800 leading-tight text-start">
                    {ar ? dna.typeAr : dna.typeEn}
                  </div>
                  <div className="text-[12px] font-bold text-slate-500 leading-snug text-start">
                    {ar ? dna.taglineAr : dna.taglineEn}
                  </div>
                </div>

                {/* 4 trait bars */}
                <div className="flex flex-col gap-2">
                  {dna.traits.map((tr) => (
                    <TraitBar
                      key={tr.labelEn}
                      label={ar ? tr.labelAr : tr.labelEn}
                      value={tr.value}
                      color={RING.purple}
                    />
                  ))}
                </div>

                {/* Style-alignment row — small ring + label + note */}
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <Ring value={dna.alignmentPct} color={RING.purple} size={48} stroke={6}>
                    <span
                      className="text-[13px] font-black leading-none"
                      style={{ color: RING.purple }}
                    >
                      {dna.alignmentPct}
                    </span>
                  </Ring>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="text-[12px] font-extrabold text-slate-700 text-start">
                      {t('parentApp.skillMap.learn.alignment')}
                    </span>
                    <span className="text-[12px] font-bold text-slate-500 leading-snug text-start">
                      {ar ? dna.alignmentNoteAr : dna.alignmentNoteEn}
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* 2 · Strategies that work */}
              <SectionCard title={t('parentApp.skillMap.strategiesTitle')}>
                <div className="flex flex-col gap-2.5">
                  {strategies.working.map((s) => (
                    <div key={s.titleEn} className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg inline-flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-slate-800 leading-tight text-start">
                          {ar ? s.titleAr : s.titleEn}
                        </div>
                        <div className="text-[12px] font-bold text-slate-500 leading-snug text-start">
                          {ar ? s.noteAr : s.noteEn}
                        </div>
                      </div>
                    </div>
                  ))}
                  {strategies.tryInstead.map((s) => (
                    <div key={s.titleEn} className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg inline-flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                        <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-black text-slate-800 leading-tight text-start">
                          {t('parentApp.skillMap.tryLabel')}: {ar ? s.titleAr : s.titleEn}
                        </div>
                        <div className="text-[12px] font-bold text-slate-500 leading-snug text-start">
                          {ar ? s.noteAr : s.noteEn}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* 3 · Life skills */}
              {lifeSkills.length > 0 && (
                <SectionCard title={t('parentApp.skillMap.lifeSkillsTitle')}>
                  <div className="flex flex-col gap-2.5">
                    {lifeSkills.map((ins) => {
                      const Icon = trendIcon(ins.trend);
                      return (
                        <div key={ins.topic} className="flex items-center gap-3">
                          <span className="flex-1 min-w-0">
                            <span className="block text-[13px] font-black text-slate-800 leading-tight text-start">
                              {ar ? ins.headlineAr : ins.headlineEn}
                            </span>
                            <span className="block text-[11px] font-bold text-slate-500 leading-snug text-start">
                              {ar ? ins.bodyAr : ins.bodyEn}
                            </span>
                          </span>
                          <Icon
                            className="w-4 h-4 shrink-0"
                            strokeWidth={2.5}
                            style={{ color: trendColor(ins.trend) }}
                            aria-hidden="true"
                          />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* 4 · Standing in String — narrative, NO numeric rank */}
              <SectionCard title={t('parentApp.skillMap.stringStandingTitle')}>
                <p className="text-[13px] font-bold text-slate-700 leading-relaxed text-start">
                  {ar ? standing.summaryAr : standing.summaryEn}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {standing.tags.map((tag) => (
                    <span
                      key={tag.labelEn}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold"
                      style={{ background: PASTEL.sky.bg, color: PASTEL.sky.icon }}
                    >
                      {ar ? tag.labelAr : tag.labelEn}
                    </span>
                  ))}
                </div>
              </SectionCard>

              {/* 4b · Class ranking (position among classmates) */}
              <ClassRankCard childId={childId} childName={childName} />

              {/* 4c · Anonymized peer comparison (child vs class median vs top) */}
              <PeerComparisonBars childId={childId} />

              {/* 5 · Teachers & impact */}
              {teachers.length > 0 && (
                <SectionCard title={t('parentApp.skillMap.teacherImpactTitle')}>
                  <div className="flex flex-col gap-2.5">
                    {teachers.map((tch, i) => {
                      const style = resolveSubjectStyle(tch.subjectKey);
                      const top = tch.rapport >= 80;
                      return (
                        <div
                          key={`${tch.subjectKey}-${i}`}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
                            aria-hidden="true"
                          >
                            {style.glyph}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-slate-800 leading-tight truncate text-start">
                                {(ar ? tch.nameAr : tch.nameEn) +
                                  ' · ' +
                                  (ar ? tch.subjectAr : tch.subjectEn)}
                              </span>
                              {top && (
                                <Star
                                  className="w-3.5 h-3.5 text-amber-500 shrink-0"
                                  strokeWidth={2.5}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <p className="text-[12px] font-bold text-slate-500 leading-snug text-start">
                              {ar ? tch.noteAr : tch.noteEn}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-duo-blue-light px-3 py-1.5 text-[11px] font-extrabold text-duo-blue active:scale-95 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                            {ar ? 'راسل' : 'Message'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* 6 · Study rhythm — existing section (when-heatmap + sessions) */}
              <section className="flex flex-col gap-3">
                <SectionHeader title={t('parentApp.skillMap.learn.studyRhythm')} />
                <StudyPeriodsSection childId={childId} />
              </section>

              {/* 7 · Trends over time (charts) */}
              <TrendsPanel childId={childId} />

              {/* 8 · Comparison & time — existing section (study-time + effort + vs-class) */}
              <SkillInsightsSection childId={childId} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LearnMoreView;
