// AnalyticsTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Per-question deep-dive. Pick a question from the side list, see a larger
// chart on the right with detailed stats. Numeric/text/date/choice each
// render their type-appropriate analysis.

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Hash, Type, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import type { FormDefinition, FormResponse } from '../../../../types/notification';
import {
  summarizeField, FIELD_TYPE_LABEL_AR, FIELD_TYPE_LABEL_EN, lt, type Locale,
} from './responsesUtils';
import { HorizontalBar, Histogram, YesNoDonut, WordCloud } from './Charts';

interface AnalyticsTabProps {
  form: FormDefinition;
  responses: FormResponse[];
  locale: Locale;
}

const fieldTypeIcon = (type: FormDefinition['fields'][number]['type']) => {
  const cls = 'w-3.5 h-3.5';
  switch (type) {
    case 'yes-no': return <CheckCircle2 className={cls} />;
    case 'number': return <Hash className={cls} />;
    case 'date': return <Calendar className={cls} />;
    case 'file-upload': return <FileText className={cls} />;
    case 'single-choice':
    case 'multiple-choice': return <BarChart3 className={cls} />;
    default: return <Type className={cls} />;
  }
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ form, responses, locale }) => {
  const sortedFields = useMemo(
    () => [...form.fields].sort((a, b) => a.order - b.order),
    [form.fields],
  );
  const [activeFieldId, setActiveFieldId] = useState(sortedFields[0]?.id ?? null);

  const activeField = sortedFields.find((f) => f.id === activeFieldId) ?? sortedFields[0];
  const activeSummary = activeField ? summarizeField(activeField, responses) : null;

  if (!activeField) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-slate-400">
          {lt(locale, 'لا توجد حقول لتحليلها', 'No fields to analyze')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Field list */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1 max-h-[600px] overflow-y-auto">
          <p className="text-[11px] font-black text-slate-400 px-2 py-1 uppercase tracking-wide">
            {lt(locale, 'الأسئلة', 'Questions')}
          </p>
          {sortedFields.map((f) => {
            const isActive = f.id === activeFieldId;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFieldId(f.id)}
                className={`w-full text-start px-3 py-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isActive ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {fieldTypeIcon(f.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black leading-snug ${isActive ? 'text-violet-700' : 'text-slate-700'}`}>
                    {f.label || lt(locale, 'حقل بدون عنوان', 'Untitled')}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {locale === 'ar' ? FIELD_TYPE_LABEL_AR[f.type] : FIELD_TYPE_LABEL_EN[f.type]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-8">
        <motion.div
          key={activeField.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
        >
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-violet-500/20">
              {fieldTypeIcon(activeField.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-800">{activeField.label}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {locale === 'ar' ? FIELD_TYPE_LABEL_AR[activeField.type] : FIELD_TYPE_LABEL_EN[activeField.type]}
                {activeField.required && <span className="text-rose-500 ms-2">{lt(locale, 'مطلوب', 'Required')}</span>}
              </p>
            </div>
          </div>

          {/* Type-specific deep-dive */}
          {activeSummary && activeSummary.kind === 'yesNo' && (
            <div className="flex items-center justify-center py-6">
              <YesNoDonut yes={activeSummary.yes} no={activeSummary.no} size={140} locale={locale} />
            </div>
          )}

          {activeSummary && activeSummary.kind === 'choice' && (
            <>
              <HorizontalBar
                data={[...activeSummary.counts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => ({ label, count }))}
                total={activeSummary.total}
              />
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                  <p className="text-[10px] font-bold text-violet-500 uppercase">{lt(locale, 'الأكثر اختيارًا', 'Top answer')}</p>
                  <p className="text-sm font-black text-violet-700 mt-1 truncate">{activeSummary.topAnswer ?? '—'}</p>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                  <p className="text-[10px] font-bold text-sky-500 uppercase">{lt(locale, 'إجمالي الإجابات', 'Total answered')}</p>
                  <p className="text-sm font-black text-sky-700 mt-1">{activeSummary.total}</p>
                </div>
              </div>
            </>
          )}

          {activeSummary && activeSummary.kind === 'number' && (
            <>
              <Histogram buckets={activeSummary.histogram} />
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
                <Stat label={lt(locale, 'أقل', 'Min')} value={activeSummary.min} color="text-sky-700 bg-sky-50 border-sky-100" />
                <Stat label={lt(locale, 'المعدل', 'Avg')} value={activeSummary.avg} color="text-violet-700 bg-violet-50 border-violet-100" />
                <Stat label={lt(locale, 'الوسيط', 'Median')} value={activeSummary.median} color="text-emerald-700 bg-emerald-50 border-emerald-100" />
                <Stat label={lt(locale, 'أعلى', 'Max')} value={activeSummary.max} color="text-amber-700 bg-amber-50 border-amber-100" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 text-center pt-2">
                {lt(locale, 'مبني على', 'Based on')} {activeSummary.count} {lt(locale, 'إجابة', 'answers')}
              </p>
            </>
          )}

          {activeSummary && activeSummary.kind === 'text' && (
            <>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {lt(locale, 'الكلمات الأكثر استخدامًا', 'Most-used words')}
                </p>
                <WordCloud words={activeSummary.topWords} />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  {lt(locale, 'توزيع طول النص', 'Length distribution')}
                </p>
                <Histogram
                  buckets={activeSummary.lengthBuckets.map((b) => b.count)}
                  labels={activeSummary.lengthBuckets.map((b) => b.label)}
                />
              </div>
            </>
          )}

          {activeSummary && activeSummary.kind === 'date' && (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                {lt(locale, 'حسب يوم الأسبوع', 'By day of week')}
              </p>
              <Histogram
                buckets={activeSummary.byDow}
                labels={locale === 'ar'
                  ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
                  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
              />
              <p className="text-[11px] font-bold text-slate-400 text-center pt-2">
                {lt(locale, 'مبني على', 'Based on')} {activeSummary.total} {lt(locale, 'إجابة', 'answers')}
              </p>
            </>
          )}

          {activeSummary && activeSummary.kind === 'file' && (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="text-3xl font-black text-slate-700">
                {activeSummary.uploaded} <span className="text-sm font-bold text-slate-400">/ {activeSummary.total}</span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                {lt(locale, 'مشاركون رفعوا ملفًا', 'respondents uploaded a file')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number | string; color: string }> = ({ label, value, color }) => (
  <div className={`p-3 rounded-xl border ${color}`}>
    <p className="text-[10px] font-bold opacity-70 uppercase">{label}</p>
    <p className="text-sm font-black mt-1">{value}</p>
  </div>
);
