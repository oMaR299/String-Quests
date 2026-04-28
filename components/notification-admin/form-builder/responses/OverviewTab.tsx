// OverviewTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "At-a-glance" tab. Stat tiles + per-question mini charts + a heatmap of
// responses-over-time. Optimized for the admin who wants to know at a
// glance how the form is performing.

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Users, TrendingUp, Clock, CheckCircle2, AlertCircle, Calendar,
} from 'lucide-react';
import type { FormDefinition, FormResponse } from '../../../../types/notification';
import {
  buildSummaryStats, summarizeField, buildResponseHeatmap,
  formatDuration, getRelativeTime,
  FIELD_TYPE_LABEL_AR, FIELD_TYPE_LABEL_EN,
  type Locale, lt,
} from './responsesUtils';
import { HorizontalBar, YesNoDonut, Histogram, ResponseHeatmap, WordCloud } from './Charts';

interface OverviewTabProps {
  form: FormDefinition;
  responses: FormResponse[];
  estimatedTotal: number;
  locale: Locale;
}

const StatTile: React.FC<{
  icon: React.ReactNode;
  labelAr: string;
  labelEn: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  gradient: string;
  locale: Locale;
  delay?: number;
}> = ({ icon, labelAr, labelEn, value, sub, gradient, locale, delay = 0 }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : delay }}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-400">{lt(locale, labelAr, labelEn)}</p>
        <div className="text-xl font-black text-slate-800 mt-0.5 truncate">{value}</div>
        {sub && <p className="text-[11px] font-bold text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ form, responses, estimatedTotal, locale }) => {
  const stats = useMemo(() => buildSummaryStats(responses, estimatedTotal), [responses, estimatedTotal]);

  const fieldSummaries = useMemo(
    () => form.fields.map((f) => summarizeField(f, responses)),
    [form, responses],
  );

  const heatmap = useMemo(() => buildResponseHeatmap(responses, 14), [responses]);

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<Users className="w-6 h-6 text-white" />}
          labelAr="إجمالي الإجابات"
          labelEn="Total responses"
          value={
            <>
              {stats.totalResponses}
              <span className="text-sm font-bold text-slate-400 ms-1">/ {stats.estimatedTotal}</span>
            </>
          }
          gradient="from-sky-400 to-blue-500 shadow-sky-500/20"
          locale={locale}
          delay={0.05}
        />
        <StatTile
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          labelAr="نسبة الاستجابة"
          labelEn="Response rate"
          value={`${stats.responseRate}%`}
          gradient="from-violet-400 to-purple-500 shadow-violet-500/20"
          locale={locale}
          delay={0.1}
        />
        <StatTile
          icon={<Clock className="w-6 h-6 text-white" />}
          labelAr="متوسط الإكمال"
          labelEn="Avg completion"
          value={formatDuration(stats.avgDurationSec, locale)}
          gradient="from-emerald-400 to-teal-500 shadow-emerald-500/20"
          locale={locale}
          delay={0.15}
        />
        <StatTile
          icon={<Calendar className="w-6 h-6 text-white" />}
          labelAr="آخر إجابة"
          labelEn="Last response"
          value={
            <span className="text-base">
              {stats.latestResponseAt ? getRelativeTime(stats.latestResponseAt, locale) : lt(locale, 'لا توجد', 'None')}
            </span>
          }
          gradient="from-amber-400 to-orange-500 shadow-amber-500/20"
          locale={locale}
          delay={0.2}
        />
      </div>

      {/* Complete vs partial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">{lt(locale, 'إجابات مكتملة', 'Complete')}</p>
            <p className="text-xl font-black text-slate-800">{stats.completeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">{lt(locale, 'إجابات جزئية', 'Partial')}</p>
            <p className="text-xl font-black text-slate-800">{stats.partialCount}</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-800">
            {lt(locale, 'توقيت الإجابات', 'Response timing')}
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {lt(locale, 'آخر 14 يومًا · ساعة × يوم', 'Last 14 days · hour × day')}
          </span>
        </div>
        <ResponseHeatmap cells={heatmap} locale={locale} />
      </div>

      {/* Per-question summaries */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-800 px-1">
          {lt(locale, 'ملخص لكل سؤال', 'Per-question summary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldSummaries.map((summary, idx) => (
            <motion.div
              key={summary.field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-black text-slate-700 leading-snug flex-1 min-w-0">
                  {summary.field.label}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 shrink-0">
                  {locale === 'ar' ? FIELD_TYPE_LABEL_AR[summary.field.type] : FIELD_TYPE_LABEL_EN[summary.field.type]}
                </span>
              </div>

              {summary.kind === 'yesNo' && (
                <YesNoDonut yes={summary.yes} no={summary.no} locale={locale} />
              )}
              {summary.kind === 'choice' && (
                <>
                  <HorizontalBar
                    data={[...summary.counts.entries()].map(([label, count]) => ({ label, count }))}
                    total={summary.total}
                    compact
                  />
                  {summary.topAnswer && (
                    <p className="text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-100">
                      {lt(locale, 'الأكثر اختيارًا:', 'Top answer:')}{' '}
                      <span className="text-violet-600">{summary.topAnswer}</span>
                    </p>
                  )}
                </>
              )}
              {summary.kind === 'number' && (
                <>
                  <Histogram buckets={summary.histogram} />
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400">{lt(locale, 'أقل', 'Min')}</p>
                      <p className="text-sm font-black text-sky-600">{summary.min}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400">{lt(locale, 'المعدل', 'Avg')}</p>
                      <p className="text-sm font-black text-violet-600">{summary.avg}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400">{lt(locale, 'أعلى', 'Max')}</p>
                      <p className="text-sm font-black text-amber-600">{summary.max}</p>
                    </div>
                  </div>
                </>
              )}
              {summary.kind === 'text' && (
                <>
                  {summary.topWords.length > 0 ? (
                    <WordCloud words={summary.topWords.slice(0, 8)} />
                  ) : (
                    <p className="text-xs font-bold text-slate-400 text-center py-3">
                      {lt(locale, 'لا توجد إجابات نصية', 'No text answers')}
                    </p>
                  )}
                  <p className="text-[11px] font-bold text-slate-400 text-center pt-1 border-t border-slate-100">
                    {summary.total} {lt(locale, 'إجابة نصية', 'text answers')}
                  </p>
                </>
              )}
              {summary.kind === 'date' && (
                <>
                  <Histogram
                    buckets={summary.byDow}
                    labels={locale === 'ar'
                      ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
                      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                  />
                </>
              )}
              {summary.kind === 'file' && (
                <div className="flex items-center justify-center py-3">
                  <span className="text-sm font-bold text-slate-600">
                    {summary.uploaded} / {summary.total}{' '}
                    <span className="text-slate-400">{lt(locale, 'رفعوا ملفًا', 'uploaded files')}</span>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
