// SubjectOverviewGrid.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Section 1 of the redesigned Parent Skill Map — "نظرة عامة" (overview at a
// glance). Replaces the old garden + plants AND the deep-map bars with a single
// clean grid: one tile per subject, each a mastery RING (number inside, colored
// by status) + the subject + a trend chip. Tap a tile → the subject detail sheet.
//
// Visual language matches the new home daily-story cards: white tiles, heavy
// rounding, colored rings (reused via the shared `Ring` primitive). Flat,
// Cairo, Lucide, full RTL, reduced-motion aware.

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { Ring } from '../cards/ScoreRing';
import { isWilting } from './skillMapCoaching';
import { resolveSubjectStyle, subjectLabel, resolveTrendChip } from './CoachingCard';
import type { ParentSkillArea, ParentSkillStatus } from './data/parentAppSkillMapMock';

// Status ring color comes from the shared palette.
import { STATUS_COLOR as STATUS_RING } from './skillMapKit';

interface SubjectOverviewGridProps {
  areas: ParentSkillArea[];
  childName: string;
  onSelectSubject: (area: ParentSkillArea) => void;
}

export const SubjectOverviewGrid: React.FC<SubjectOverviewGridProps> = ({
  areas,
  childName,
  onSelectSubject,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Status headline (reuses the existing garden-summary copy + thresholds).
  const needsHelp = useMemo(() => areas.filter((a) => isWilting(a)).length, [areas]);
  const headline = useMemo(() => {
    const key =
      needsHelp <= 0
        ? 'parentApp.skillMap.gardenSummaryHealthy'
        : needsHelp === 1
          ? 'parentApp.skillMap.gardenSummary'
          : 'parentApp.skillMap.gardenSummaryMany';
    return interpolate(getParentAppString(locale, key), { name: childName, n: needsHelp });
  }, [locale, childName, needsHelp]);

  return (
    <section aria-label={t('parentApp.skillMap.overview')} className="flex flex-col gap-3">
      <header className="flex flex-col gap-0.5 px-1">
        <span className="text-[11px] font-extrabold text-slate-400">
          {t('parentApp.skillMap.overview')}
        </span>
        <h2 className="text-[15px] font-black text-slate-800 leading-snug text-start">{headline}</h2>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {areas.map((area, i) => (
          <SubjectTile
            key={area.id}
            area={area}
            locale={locale}
            index={i}
            onSelect={() => onSelectSubject(area)}
          />
        ))}
      </div>
    </section>
  );
};

// ─── One subject tile ─────────────────────────────────────────────────────────

const SubjectTile: React.FC<{
  area: ParentSkillArea;
  locale: 'ar' | 'en';
  index: number;
  onSelect: () => void;
}> = ({ area, locale, index, onSelect }) => {
  const reduceMotion = useReducedMotion() ?? false;
  const style = resolveSubjectStyle(area.subjectKey);
  const subject = subjectLabel(area, locale);
  const trend = resolveTrendChip(area, locale);
  const ringColor = STATUS_RING[area.status];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 26, delay: index * 0.04 }
      }
      className="rounded-[24px] bg-white border border-slate-100 p-4 flex flex-col items-center gap-2.5 text-center motion-safe:active:scale-[0.97] transition-transform"
      style={{ boxShadow: '0 8px 22px -14px rgba(40,30,60,0.25)' }}
      aria-label={`${subject} — ${area.masteryPct}%`}
    >
      <Ring value={area.masteryPct} color={ringColor} size={78} stroke={9}>
        <span className="text-[22px] font-black leading-none" style={{ color: ringColor }}>
          {area.masteryPct}
          <span className="text-[10px] font-extrabold">%</span>
        </span>
      </Ring>

      <div className="flex items-center gap-1.5">
        <span
          className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[11px] font-black ${style.iconBg} ${style.iconText}`}
          aria-hidden="true"
        >
          {style.glyph}
        </span>
        <span className="text-sm font-black text-slate-800 leading-tight">{subject}</span>
      </div>

      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${trend.bg} ${trend.text}`}
      >
        <trend.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
        {trend.label}
      </span>
    </motion.button>
  );
};

export default SubjectOverviewGrid;
