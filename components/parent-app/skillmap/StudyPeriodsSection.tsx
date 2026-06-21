// StudyPeriodsSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "When + what" of the child's learning: a calendar heatmap of study minutes
// (when they studied, GitHub-style) and a recent-sessions list (what they
// learned each session — subject, lesson, duration, accuracy).
//
// Reuses CalendarHeatmap from SvgCharts + the seeded analytics mock. The
// subject glyph/colors come from the shared SUBJECT_STYLES helper.

import React, { useCallback, useMemo } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { CalendarHeatmap } from '../../admin-hub/attendance/SvgCharts';
import { resolveSubjectStyle } from './CoachingCard';
import { getDailyStudyMinutes, getStudySessions } from './data/parentAppSkillAnalyticsMock';

import { MINUTES_SCALE } from './skillMapKit';

interface StudyPeriodsSectionProps {
  childId: string;
}

export const StudyPeriodsSection: React.FC<StudyPeriodsSectionProps> = ({ childId }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';

  const heatData = useMemo(
    () => getDailyStudyMinutes(childId, 98).map((d) => ({ date: d.dateIso, value: d.minutes })),
    [childId],
  );
  const sessions = useMemo(() => getStudySessions(childId, 10), [childId]);

  const fmt = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(ar ? 'ar' : 'en', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(iso)),
    [ar],
  );

  return (
    <section aria-label={t('parentApp.skillMap.studyPeriods')} className="flex flex-col gap-3">
      <h2 className="text-lg font-black text-slate-800 leading-tight text-start px-1">
        {t('parentApp.skillMap.studyPeriods')}
      </h2>

      {/* When — calendar heatmap */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-2">
        <span className="text-[12px] font-extrabold text-slate-500">
          {t('parentApp.skillMap.whenStudied')}
        </span>
        <div dir="ltr">
          <CalendarHeatmap data={heatData} colorScale={MINUTES_SCALE} weeksToShow={14} cellSize={16} locale={locale} />
        </div>
      </div>

      {/* What — recent sessions list */}
      <div className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3">
        <span className="text-[12px] font-extrabold text-slate-500">
          {t('parentApp.skillMap.recentSessions')}
        </span>
        <div className="flex flex-col gap-2.5">
          {sessions.map((s) => {
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
                  <div className="text-[11px] font-bold text-slate-400 leading-tight">{fmt(s.dateTimeIso)}</div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[12px] font-black text-slate-700 tabular-nums">
                    {s.minutes} {t('parentApp.skillMap.minutesShort')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">{s.accuracyPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudyPeriodsSection;
