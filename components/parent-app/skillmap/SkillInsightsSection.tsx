// SkillInsightsSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Whole-child analytics under the subject overview: study-time trend, effort
// per subject, and a compact "compared to the class" view. Reuses the
// self-contained SvgCharts primitives + the seeded analytics mock.

import React, { useCallback, useMemo } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { HorizontalBarChart } from '../../admin-hub/attendance/SvgCharts';
import { MiniTrend } from './MiniTrend';
import { getChildSkillAreas, type ParentSkillStatus } from './data/parentAppSkillMapMock';
import {
  getDailyStudyMinutes,
  getEffortPerSubject,
  getSubjectPeer,
} from './data/parentAppSkillAnalyticsMock';

import { STATUS_COLOR } from './skillMapKit';

interface SkillInsightsSectionProps {
  childId: string;
}

export const SkillInsightsSection: React.FC<SkillInsightsSectionProps> = ({ childId }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';

  const areas = useMemo(() => getChildSkillAreas(childId), [childId]);
  const statusByKey = useMemo(() => {
    const m = new Map<string, ParentSkillStatus>();
    areas.forEach((a) => m.set(a.subjectKey, a.status));
    return m;
  }, [areas]);

  const dailyMinutes = useMemo(() => getDailyStudyMinutes(childId, 30), [childId]);
  const weekMinutes = useMemo(
    () => dailyMinutes.slice(-7).reduce((s, d) => s + d.minutes, 0),
    [dailyMinutes],
  );
  const effort = useMemo(() => getEffortPerSubject(childId), [childId]);

  const effortData = effort.map((e) => ({
    label: ar ? e.subjectAr : e.subjectEn,
    value: e.effortScore,
    color: STATUS_COLOR[statusByKey.get(e.subjectKey) ?? 'developing'],
  }));

  return (
    <section aria-label={t('parentApp.skillMap.insights')} className="flex flex-col gap-3">
      <h2 className="text-lg font-black text-slate-800 leading-tight text-start px-1">
        {t('parentApp.skillMap.insights')}
      </h2>

      {/* Study time trend */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-slate-500">
            {t('parentApp.skillMap.studyTime')}
          </span>
          <span className="text-[12px] font-bold text-slate-500">
            {t('parentApp.skillMap.thisWeek')}:{' '}
            <span className="font-black text-slate-800">
              {weekMinutes} {t('parentApp.skillMap.minutesShort')}
            </span>
          </span>
        </div>
        <MiniTrend values={dailyMinutes.map((d) => d.minutes)} color="#3DD9C0" />
      </div>

      {/* Effort per subject */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2">
        <span className="text-[12px] font-extrabold text-slate-500">
          {t('parentApp.skillMap.effortPerSubject')}
        </span>
        <div dir={ar ? 'rtl' : 'ltr'}>
          <HorizontalBarChart data={effortData} maxValue={100} barHeight={20} valueSuffix="" />
        </div>
      </div>

      {/* Compared to the class — per subject, compact */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3">
        <span className="text-[12px] font-extrabold text-slate-500">
          {t('parentApp.skillMap.peerTitle')}
        </span>
        <div className="flex flex-col gap-2.5">
          {areas.map((a) => (
            <PeerRow
              key={a.id}
              label={ar ? a.subjectAr : a.subjectEn}
              color={STATUS_COLOR[a.status]}
              peer={getSubjectPeer(childId, a.subjectKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── One compact peer row: child fill + class-average marker ────────────────────

const PeerRow: React.FC<{
  label: string;
  color: string;
  peer: { childPct: number; classAvgPct: number };
}> = ({ label, color, peer }) => {
  const diff = peer.childPct - peer.classAvgPct;
  const diffColor = diff >= 0 ? '#1F9D57' : '#E14F5E';
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[12px] font-bold text-slate-600 truncate text-start">{label}</span>
      <div className="relative flex-1 min-w-0 h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${peer.childPct}%`, background: color }} />
        {/* class-average marker */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-slate-500"
          style={{ insetInlineStart: `${peer.classAvgPct}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="w-10 shrink-0 text-[12px] font-black tabular-nums text-start" style={{ color: diffColor }}>
        {diff >= 0 ? '+' : ''}
        {diff}
      </span>
    </div>
  );
};

export default SkillInsightsSection;
