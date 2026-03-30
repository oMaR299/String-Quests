import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, Search, Send, ChevronRight, Users,
  CheckCircle2, XCircle, BarChart3, X, Clock,
  TrendingUp, Hash, Type, Calendar, FileUp, Check,
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { FormExporter } from './FormExporter';
import type { FormField, FormResponse, FormFieldType } from '../../../types/notification';

// --- Constants ---

const BAR_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-purple-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
];

const BAR_BG_COLORS = [
  'bg-sky-100',
  'bg-purple-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-cyan-100',
];

const ROLE_LABELS: Record<string, string> = {
  student: 'طالب',
  teacher: 'معلم',
  parent: 'ولي أمر',
  admin: 'مسؤول',
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  student: { bg: 'bg-blue-50', text: 'text-blue-600' },
  teacher: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  parent: { bg: 'bg-amber-50', text: 'text-amber-600' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

const FIELD_TYPE_COLORS: Record<string, { icon: string; bg: string; border: string }> = {
  'single-choice': { icon: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
  'multiple-choice': { icon: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  'yes-no': { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  number: { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  'short-text': { icon: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
  'long-text': { icon: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
  date: { icon: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  'file-upload': { icon: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
};

// --- Summary Types ---

interface YesNoSummary {
  field: FormField;
  type: 'yes-no';
  summary: { yes: number; no: number };
}

interface ChoiceSummary {
  field: FormField;
  type: 'single-choice' | 'multiple-choice';
  summary: Record<string, number>;
  totalAnswered: number;
}

interface NumberSummary {
  field: FormField;
  type: 'number';
  summary: { min: number; max: number; avg: number; count: number };
}

interface TextSummary {
  field: FormField;
  type: 'text';
  summary: { count: number };
}

type FieldSummary = YesNoSummary | ChoiceSummary | NumberSummary | TextSummary;

// --- Helpers ---

function formatAnswer(answer: string | string[] | number | boolean | undefined): string {
  if (answer === undefined || answer === null) return '—';
  if (typeof answer === 'boolean') return answer ? 'نعم' : 'لا';
  if (typeof answer === 'number') return answer.toString();
  if (Array.isArray(answer)) return answer.join('، ');
  return String(answer) || '—';
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 0) return 'الآن';
  if (diffSeconds < 60) return 'الآن';
  if (diffMinutes < 2) return 'قبل دقيقة';
  if (diffMinutes < 60) return `قبل ${diffMinutes} دقائق`;
  if (diffHours < 2) return 'قبل ساعة';
  if (diffHours < 24) return `قبل ${diffHours} ساعات`;
  if (diffDays < 2) return 'أمس';
  if (diffDays < 7) return `قبل ${diffDays} أيام`;
  if (diffWeeks < 2) return 'قبل أسبوع';
  if (diffWeeks < 5) return `قبل ${diffWeeks} أسابيع`;
  if (diffMonths < 2) return 'قبل شهر';
  return `قبل ${diffMonths} أشهر`;
}

// --- Sub-Component: Field Type Icon ---

const FieldTypeIcon: React.FC<{ type: FormFieldType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'single-choice':
    case 'multiple-choice':
      return <BarChart3 className={className} />;
    case 'yes-no':
      return <CheckCircle2 className={className} />;
    case 'number':
      return <Hash className={className} />;
    case 'short-text':
    case 'long-text':
      return <Type className={className} />;
    case 'date':
      return <Calendar className={className} />;
    case 'file-upload':
      return <FileUp className={className} />;
    default:
      return <BarChart3 className={className} />;
  }
};

// --- Sub-Component: Response Stats Cards ---

const ResponseStatsCards: React.FC<{
  totalResponses: number;
  estimatedTotal: number;
  responseRate: number;
  latestResponseDate: string | null;
}> = ({ totalResponses, estimatedTotal, responseRate, latestResponseDate }) => {
  const ringSize = 40;
  const ringStroke = 4;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (responseRate / 100) * ringCircumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Responses */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400">إجمالي الإجابات</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">
            {totalResponses}
            <span className="text-sm font-bold text-slate-400 mr-1">/ {estimatedTotal}</span>
          </p>
        </div>
      </motion.div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
      >
        <div className="relative shrink-0">
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={ringStroke}
            />
            <motion.circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="url(#statsRingGradient)"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              initial={{ strokeDashoffset: ringCircumference }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="statsRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400">نسبة الاستجابة</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">
            {responseRate}
            <span className="text-sm font-bold text-slate-400">%</span>
          </p>
        </div>
      </motion.div>

      {/* Latest Response */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400">آخر إجابة</p>
          <p className="text-lg font-black text-slate-800 mt-0.5">
            {latestResponseDate ? getRelativeTime(latestResponseDate) : 'لا توجد'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Sub-Component: Horizontal Bar Chart ---

const HorizontalBarChart: React.FC<{
  data: Record<string, number>;
  totalAnswered: number;
  options?: { id: string; label: string }[];
}> = ({ data, totalAnswered, options }) => {
  const entries: { label: string; count: number }[] = options
    ? options.map((opt) => ({
        label: opt.label,
        count: data[opt.label] || data[opt.id] || 0,
      }))
    : Object.entries(data).map(([label, count]) => ({ label, count }));

  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  return (
    <div className="space-y-2.5">
      {entries.map((entry, idx) => {
        const percentage = totalAnswered > 0 ? Math.round((entry.count / totalAnswered) * 100) : 0;
        const barWidth = maxCount > 0 ? Math.max((entry.count / maxCount) * 100, 2) : 2;
        const gradientClass = BAR_GRADIENTS[idx % BAR_GRADIENTS.length];
        const bgClass = BAR_BG_COLORS[idx % BAR_BG_COLORS.length];

        return (
          <div key={entry.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 truncate ml-2">{entry.label}</span>
              <span className="font-bold text-slate-400 shrink-0">
                {entry.count} ({percentage}%)
              </span>
            </div>
            <div className={`w-full h-2.5 ${bgClass} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Sub-Component: Donut Chart (Yes / No) ---

const DonutChart: React.FC<{ yes: number; no: number }> = ({ yes, no }) => {
  const total = yes + no;
  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 36;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const yesRatio = total > 0 ? yes / total : 0;
  const noRatio = total > 0 ? no / total : 0;
  const yesDash = yesRatio * circumference;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-3">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" fill="#94a3b8">
            لا توجد
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background (no) segment */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#fca5a5" strokeWidth={strokeWidth} />
          {/* Yes segment on top */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#34d399"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - yesDash }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-700">{total}</span>
          <span className="text-[10px] font-bold text-slate-400">إجابة</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm font-bold text-slate-600">نعم</span>
          <span className="text-sm font-black text-emerald-600">{yes}</span>
          <span className="text-xs font-bold text-slate-400">({Math.round(yesRatio * 100)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-300 shrink-0" />
          <span className="text-sm font-bold text-slate-600">لا</span>
          <span className="text-sm font-black text-rose-500">{no}</span>
          <span className="text-xs font-bold text-slate-400">({Math.round(noRatio * 100)}%)</span>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Number Stat Pills ---

const NumberStatPills: React.FC<{
  min: number;
  max: number;
  avg: number;
  count: number;
}> = ({ min, max, avg, count }) => {
  if (count === 0) {
    return <p className="text-sm font-bold text-slate-400 text-center py-3">لا توجد إجابات</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100">
        <span className="text-[10px] font-bold text-sky-500 mb-0.5">أقل</span>
        <span className="text-lg font-black text-sky-700">{min}</span>
      </div>
      <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-100">
        <span className="text-[10px] font-bold text-purple-500 mb-0.5">المعدل</span>
        <span className="text-lg font-black text-purple-700">{avg}</span>
      </div>
      <div className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
        <span className="text-[10px] font-bold text-amber-500 mb-0.5">أعلى</span>
        <span className="text-lg font-black text-amber-700">{max}</span>
      </div>
    </div>
  );
};

// --- Sub-Component: Field Summary Grid ---

const FieldSummaryGrid: React.FC<{ summaries: FieldSummary[] }> = ({ summaries }) => {
  if (summaries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaries.map((summary, idx) => {
        const colors = FIELD_TYPE_COLORS[summary.field.type] || FIELD_TYPE_COLORS['short-text'];

        return (
          <motion.div
            key={summary.field.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
          >
            {/* Card header */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
                <FieldTypeIcon type={summary.field.type} className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <h4 className="text-sm font-black text-slate-700 leading-snug truncate">
                {summary.field.label}
              </h4>
            </div>

            {/* Chart content by type */}
            {summary.type === 'yes-no' && (
              <DonutChart yes={summary.summary.yes} no={summary.summary.no} />
            )}

            {(summary.type === 'single-choice' || summary.type === 'multiple-choice') && (
              <HorizontalBarChart
                data={summary.summary}
                totalAnswered={summary.totalAnswered}
                options={summary.field.options}
              />
            )}

            {summary.type === 'number' && (
              <NumberStatPills
                min={summary.summary.min}
                max={summary.summary.max}
                avg={summary.summary.avg}
                count={summary.summary.count}
              />
            )}

            {summary.type === 'text' && (
              <div className="flex items-center justify-center py-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Type className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">
                    {summary.summary.count} إجابة
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// --- Sub-Component: Yes/No Badge (for modal) ---

const YesNoBadge: React.FC<{ value: boolean | undefined }> = ({ value }) => {
  if (value === undefined || value === null) {
    return <span className="text-sm font-bold text-slate-400">—</span>;
  }

  return value ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-600">
      <CheckCircle2 className="w-4 h-4" />
      نعم
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-sm font-bold text-rose-500">
      <XCircle className="w-4 h-4" />
      لا
    </span>
  );
};

// --- Sub-Component: Choice Display (for modal, with checkmarks) ---

const ChoiceDisplay: React.FC<{
  selected: string[];
  options: { id: string; label: string }[];
}> = ({ selected, options }) => {
  if (selected.length === 0) {
    return <span className="text-sm font-bold text-slate-400">—</span>;
  }

  return (
    <div className="space-y-1.5 pr-1">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.label) || selected.includes(opt.id);

        return (
          <div
            key={opt.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
              isSelected
                ? 'bg-sky-50 border border-sky-200 text-sky-700'
                : 'text-slate-300'
            }`}
          >
            {isSelected ? (
              <Check className="w-4 h-4 text-sky-500 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
            )}
            <span>{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- Sub-Component: Response Detail Modal ---

const ResponseDetailModal: React.FC<{
  response: FormResponse;
  fields: FormField[];
  isOpen: boolean;
  onClose: () => void;
}> = ({ response, fields, isOpen, onClose }) => {
  const roleColor = ROLE_COLORS[response.respondentRole] || ROLE_COLORS.student;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Header — Respondent info */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-l from-sky-50/50 to-white shrink-0">
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                  <span className="text-lg font-black text-white">
                    {response.respondentName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-slate-800 truncate">
                    {response.respondentName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${roleColor.bg} ${roleColor.text}`}>
                      {ROLE_LABELS[response.respondentRole] || response.respondentRole}
                    </span>
                    {response.respondentGrade && (
                      <span className="text-xs font-bold text-slate-400">
                        الصف {response.respondentGrade}
                        {response.respondentSection ? ` / ${response.respondentSection}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(response.submittedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-slate-300 mx-1">&middot;</span>
                <span>{getRelativeTime(response.submittedAt)}</span>
              </div>
            </div>

            {/* Body — Answers list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1">
              {fields.map((field, idx) => {
                const answer = response.answers[field.id];
                const isLast = idx === fields.length - 1;

                return (
                  <div
                    key={field.id}
                    className={`py-4 ${!isLast ? 'border-b border-slate-100' : ''}`}
                  >
                    {/* Field label */}
                    <div className="flex items-center gap-2 mb-2">
                      <FieldTypeIcon
                        type={field.type}
                        className={`w-3.5 h-3.5 ${(FIELD_TYPE_COLORS[field.type] || FIELD_TYPE_COLORS['short-text']).icon}`}
                      />
                      <span className="text-xs font-bold text-slate-400">{field.label}</span>
                    </div>

                    {/* Answer display by type */}
                    {field.type === 'yes-no' ? (
                      <YesNoBadge value={answer as boolean | undefined} />
                    ) : field.type === 'single-choice' ? (
                      <ChoiceDisplay
                        selected={answer !== undefined && answer !== null ? [String(answer)] : []}
                        options={field.options || []}
                      />
                    ) : field.type === 'multiple-choice' ? (
                      <ChoiceDisplay
                        selected={Array.isArray(answer) ? answer : []}
                        options={field.options || []}
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-700 pr-5">
                        {formatAnswer(answer)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-5 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---

interface FormResponsesViewProps {
  formId: string;
}

export const FormResponsesView: React.FC<FormResponsesViewProps> = ({ formId }) => {
  const { state } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  const form = state.forms.find((f) => f.id === formId);
  const responses = state.formResponses.filter((r) => r.formId === formId);

  const estimatedTotal = 20; // Mock: total expected responses

  // Filtered and sorted responses
  const filteredResponses = useMemo(() => {
    let result = responses;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.respondentName.toLowerCase().includes(q));
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortField === 'submittedAt') {
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
      } else if (sortField === 'respondentName') {
        aVal = a.respondentName;
        bVal = b.respondentName;
      } else if (sortField === 'respondentRole') {
        aVal = a.respondentRole;
        bVal = b.respondentRole;
      } else if (sortField === 'respondentGrade') {
        aVal = a.respondentGrade ?? 0;
        bVal = b.respondentGrade ?? 0;
      } else {
        // Sort by field answer
        aVal = formatAnswer(a.answers[sortField]);
        bVal = formatAnswer(b.answers[sortField]);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [responses, searchQuery, sortField, sortDirection]);

  // Enhanced field summaries covering ALL field types
  const fieldSummaries = useMemo((): FieldSummary[] => {
    if (!form) return [];

    return form.fields.map((field): FieldSummary => {
      const answers = responses.map((r) => r.answers[field.id]);
      const definedAnswers = answers.filter((a) => a !== undefined && a !== null);

      if (field.type === 'yes-no') {
        const yesCount = answers.filter((a) => a === true).length;
        const noCount = answers.filter((a) => a === false).length;
        return { field, type: 'yes-no', summary: { yes: yesCount, no: noCount } };
      }

      if (field.type === 'single-choice') {
        const counts: Record<string, number> = {};
        for (const a of definedAnswers) {
          const val = String(a);
          if (val) counts[val] = (counts[val] || 0) + 1;
        }
        return { field, type: 'single-choice', summary: counts, totalAnswered: definedAnswers.length };
      }

      if (field.type === 'multiple-choice') {
        const counts: Record<string, number> = {};
        for (const a of definedAnswers) {
          const vals = Array.isArray(a) ? a : [String(a)];
          for (const val of vals) {
            if (val) counts[val] = (counts[val] || 0) + 1;
          }
        }
        return { field, type: 'multiple-choice', summary: counts, totalAnswered: definedAnswers.length };
      }

      if (field.type === 'number') {
        const numbers = definedAnswers
          .map((a) => (typeof a === 'number' ? a : parseFloat(String(a))))
          .filter((n) => !isNaN(n));

        if (numbers.length === 0) {
          return { field, type: 'number', summary: { min: 0, max: 0, avg: 0, count: 0 } };
        }

        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        const avg = Math.round((numbers.reduce((s, n) => s + n, 0) / numbers.length) * 10) / 10;
        return { field, type: 'number', summary: { min, max, avg, count: numbers.length } };
      }

      // short-text, long-text, date, file-upload
      return { field, type: 'text', summary: { count: definedAnswers.length } };
    });
  }, [form, responses]);

  // Latest response date
  const latestResponseDate = useMemo(() => {
    if (responses.length === 0) return null;
    const sorted = [...responses].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    return sorted[0].submittedAt;
  }, [responses]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSendReminder = () => {
    setShowReminderConfirm(false);
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-bold text-slate-400">النموذج غير موجود</p>
      </div>
    );
  }

  const responseRate = estimatedTotal > 0
    ? Math.round((responses.length / estimatedTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. Response Stats Cards */}
      <ResponseStatsCards
        totalResponses={responses.length}
        estimatedTotal={estimatedTotal}
        responseRate={responseRate}
        latestResponseDate={latestResponseDate}
      />

      {/* 2. Visual Summary Charts */}
      {fieldSummaries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-black text-slate-800">ملخص الحقول</h3>
          </div>
          <FieldSummaryGrid summaries={fieldSummaries} />
        </div>
      )}

      {/* Response Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-black text-slate-800">تقدم الاستجابة</h3>
          </div>
          <span className="text-sm font-bold text-slate-500">
            {responses.length} من {estimatedTotal} أجابوا — {responseRate}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${responseRate}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Actions & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <FormExporter form={form} responses={responses} onExport={() => {}} />

          {!showReminderConfirm ? (
            <button
              onClick={() => setShowReminderConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-sm font-bold hover:bg-amber-100 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>إرسال تذكير</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl border border-amber-200 px-3 py-2">
              <span className="text-xs font-bold text-amber-700">إرسال تذكير؟</span>
              <button
                onClick={handleSendReminder}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                نعم
              </button>
              <button
                onClick={() => setShowReminderConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reminder toast */}
      {reminderSent && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-700">تم إرسال التذكير بنجاح</span>
        </motion.div>
      )}

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد إجابات بعد'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <SortableHeader
                    label="الاسم"
                    field="respondentName"
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="الدور"
                    field="respondentRole"
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="الصف / الشعبة"
                    field="respondentGrade"
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="تاريخ الإرسال"
                    field="submittedAt"
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  {form.fields.map((field) => (
                    <SortableHeader
                      key={field.id}
                      label={field.label}
                      field={field.id}
                      currentSort={sortField}
                      direction={sortDirection}
                      onSort={toggleSort}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response, idx) => (
                  <tr
                    key={response.id}
                    onClick={() => setSelectedResponse(response)}
                    className={`border-b border-slate-100 hover:bg-sky-50/40 transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">
                      {response.respondentName}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-500 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {ROLE_LABELS[response.respondentRole] || response.respondentRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-500 whitespace-nowrap">
                      {response.respondentGrade ? `${response.respondentGrade}` : '—'}
                      {response.respondentSection ? ` / ${response.respondentSection}` : ''}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-400 whitespace-nowrap">
                      {new Date(response.submittedAt).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    {form.fields.map((field) => (
                      <td key={field.id} className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap max-w-[200px] truncate">
                        {formatAnswer(response.answers[field.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          fields={form.fields}
          isOpen={!!selectedResponse}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};

// --- Sortable Header Sub-Component ---

const SortableHeader: React.FC<{
  label: string;
  field: string;
  currentSort: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
}> = ({ label, field, currentSort, direction, onSort }) => {
  const isActive = currentSort === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-right font-bold text-slate-500 cursor-pointer hover:text-slate-700 transition-colors whitespace-nowrap select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3.5 h-3.5 ${isActive ? 'text-sky-500' : 'text-slate-300'}`} />
        {isActive && (
          <ChevronRight
            className={`w-3 h-3 text-sky-500 transition-transform ${
              direction === 'asc' ? '-rotate-90' : 'rotate-90'
            }`}
          />
        )}
      </span>
    </th>
  );
};
