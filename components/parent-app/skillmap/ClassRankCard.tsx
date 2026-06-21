// ClassRankCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Real class ranking (user-requested): the child's position among classmates +
// a "top N%" chip + a calm distribution bar showing where they sit, plus a
// per-subject rank list. Presented warmly (no harsh red, no named peers) so it
// stays premium rather than stressful. Data is deterministic (getClassRank /
// getSubjectRank). Cairo, RTL, reuses the subject glyphs.

import React, { useCallback, useMemo } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { clamp } from '../data/mockKit';
import { resolveSubjectStyle, subjectLabel } from './CoachingCard';
import { getClassRank, getSubjectRank } from './data/parentAppStandingMock';
import { getChildSkillAreas } from './data/parentAppSkillMapMock';

const ACCENT = '#8E7DE0'; // calm purple — celebratory, never alarming

export const ClassRankCard: React.FC<{ childId: string; childName: string }> = ({ childId }) => {
  const { locale } = useI18n();
  const t = useCallback((k: string) => getParentAppString(locale, k), [locale]);

  const rank = useMemo(() => getClassRank(childId), [childId]);
  const areas = useMemo(() => getChildSkillAreas(childId), [childId]);
  const subjectRanks = useMemo(
    () => areas.map((a) => ({ area: a, r: getSubjectRank(childId, a.subjectKey) })),
    [areas, childId],
  );
  const topShare = clamp(100 - rank.percentile, 1, 99);

  return (
    <section className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-4">
      <span className="text-[12px] font-extrabold text-slate-500">
        {t('parentApp.skillMap.rank.title')}
      </span>

      {/* Headline: rank N / classSize + "top X%" chip */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-black text-slate-800 leading-none tabular-nums">{rank.rank}</span>
          <span className="text-[14px] font-bold text-slate-400">/ {rank.classSize}</span>
          <span className="text-[12px] font-bold text-slate-500 ms-1">{t('parentApp.skillMap.rank.inClass')}</span>
        </div>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-black text-white shrink-0"
          style={{ background: ACCENT }}
        >
          {interpolate(t('parentApp.skillMap.rank.topPct'), { pct: topShare })}
        </span>
      </div>

      {/* Distribution: where the child sits among peers (weaker → stronger, LTR) */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-500">{t('parentApp.skillMap.rank.distribution')}</span>
        <div dir="ltr" className="relative h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#E9EDF3 0%,#D9D2F4 60%,#C7BEF0 100%)' }}>
          <div
            className="absolute -top-1 w-5 h-5 rounded-full bg-white shadow-sm"
            style={{ border: `3px solid ${ACCENT}`, left: `calc(${rank.percentile}% - 10px)` }}
            aria-label={t('parentApp.skillMap.rank.you')}
          />
        </div>
      </div>

      {/* Per-subject ranks */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-slate-500">{t('parentApp.skillMap.rank.bySubject')}</span>
        {subjectRanks.map(({ area, r }) => {
          const style = resolveSubjectStyle(area.subjectKey);
          return (
            <div key={area.id} className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-xl inline-flex items-center justify-center shrink-0 text-[13px] font-black ${style.iconBg} ${style.iconText}`}
                aria-hidden="true"
              >
                {style.glyph}
              </span>
              <span className="flex-1 min-w-0 text-[13px] font-bold text-slate-700 truncate text-start">
                {subjectLabel(area, locale)}
              </span>
              <span className="text-[12px] font-black text-slate-600 shrink-0 tabular-nums">
                {interpolate(t('parentApp.skillMap.rank.position'), { rank: r.rank, n: r.classSize })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ClassRankCard;
