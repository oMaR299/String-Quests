// PeerComparisonBars.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ANONYMIZED peer comparison — the child against the CLASS MEDIAN and CLASS TOP,
// per subject. By design there are NO names, NO leaderboard, NO ranking: just
// two neutral reference markers on each subject's 0-100 track so a parent can
// see "where my child sits" at a glance, calmly. UI-only; reuses existing
// getters (no data is owned here).
//
// House rules: premium flat white card (rounded-3xl, hairline slate-100),
// Cairo font, Lucide icons (strokeWidth 2.5), full RTL via logical properties
// (text-start, ms-/me-). The 0-100 track itself is forced to dir="ltr" so the
// scale (and the median/top markers positioned by insetInlineStart) reads the
// same in both languages. Framer Motion stagger with useReducedMotion fallback.

import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { STATUS_COLOR } from './skillMapKit';
import { resolveSubjectStyle, subjectLabel } from './CoachingCard';
import { getChildSkillAreas } from './data/parentAppSkillMapMock';
import { getPeerStats } from './data/parentAppSkillAnalyticsMock';

// ── Tokens ────────────────────────────────────────────────────────────────────

/** Calm, non-alarming reference colors for the two class markers. */
const MEDIAN_COLOR = '#64748B'; // slate-500
const TOP_COLOR = '#E0A100'; // gold
/** Child "you" accent used in the legend dot (kept distinct from status fills). */
const YOU_ACCENT = '#54B6E6'; // duo blue

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

// ── Props ───────────────────────────────────────────────────────────────────

interface PeerComparisonBarsProps {
  childId: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export const PeerComparisonBars: React.FC<PeerComparisonBarsProps> = ({ childId }) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const areas = getChildSkillAreas(childId);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 24 }}
      className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-4"
      aria-label={t('parentApp.skillMap.peer.compareTitle')}
    >
      {/* Header — title + a calm "compared to the class" intent icon */}
      <header className="flex items-center gap-2.5">
        <span
          className="w-9 h-9 rounded-2xl inline-flex items-center justify-center shrink-0 bg-slate-100 text-slate-600"
          aria-hidden="true"
        >
          <Users className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <h3 className="text-base font-black text-slate-800 leading-snug text-start">
          {t('parentApp.skillMap.peer.compareTitle')}
        </h3>
      </header>

      {/* Legend — you (accent dot) · median (slate bar) · top (gold bar) */}
      <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
        <LegendDot color={YOU_ACCENT} label={t('parentApp.skillMap.rank.you')} />
        <LegendMarker color={MEDIAN_COLOR} label={t('parentApp.skillMap.peer.median')} />
        <LegendMarker color={TOP_COLOR} label={t('parentApp.skillMap.peer.top')} />
      </div>

      {/* One row per subject */}
      <div className="flex flex-col gap-3.5">
        {areas.map((area, i) => {
          const style = resolveSubjectStyle(area.subjectKey);
          const label = subjectLabel(area, locale);
          const { childPct, classMedianPct, classTopPct } = getPeerStats(childId, area.subjectKey);
          const fill = STATUS_COLOR[area.status];

          return (
            <motion.div
              key={area.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 240, damping: 24, delay: 0.05 * i }
              }
              className="flex flex-col gap-2"
            >
              {/* Subject glyph chip + label */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
                  aria-hidden="true"
                >
                  {style.glyph}
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-bold text-slate-700 truncate text-start">
                  {label}
                </span>
              </div>

              {/* 0-100 track (dir=ltr so scale + markers stay consistent) */}
              <div className="flex items-center gap-3">
                <div
                  dir="ltr"
                  className="relative flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden"
                  role="img"
                  aria-label={`${label}: ${childPct}%`}
                >
                  {/* Child fill 0 → childPct */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: fill }}
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${clampPct(childPct)}%` }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 240, damping: 24, delay: 0.05 * i }
                    }
                  />
                  {/* Class median marker */}
                  <span
                    className="absolute inset-y-0 w-[2px] rounded-full"
                    style={{ left: `${clampPct(classMedianPct)}%`, background: MEDIAN_COLOR }}
                    aria-hidden="true"
                  />
                  {/* Class top marker */}
                  <span
                    className="absolute inset-y-0 w-[2px] rounded-full"
                    style={{ left: `${clampPct(classTopPct)}%`, background: TOP_COLOR }}
                    aria-hidden="true"
                  />
                </div>

                {/* Child % at the end, in the status color */}
                <span
                  className="w-10 shrink-0 text-[13px] font-black tabular-nums text-start"
                  style={{ color: fill }}
                >
                  {childPct}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

// ── Legend primitives ─────────────────────────────────────────────────────────

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
    <span className="text-[11px] font-bold text-slate-500">{label}</span>
  </span>
);

const LegendMarker: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="w-[3px] h-3 rounded-full" style={{ background: color }} aria-hidden="true" />
    <span className="text-[11px] font-bold text-slate-500">{label}</span>
  </span>
);

export default PeerComparisonBars;
