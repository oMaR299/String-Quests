import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus, Pencil, Check } from 'lucide-react';
import { ProgressRing } from './SvgCharts';
import { getDailySummary, getTodayString } from '../../../data/mockAttendanceData';

const STORAGE_KEY = 'string-quests-attendance-target';

function loadTarget(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const v = parseFloat(raw); if (!isNaN(v) && v > 0 && v <= 100) return v; }
  } catch { /* ignore */ }
  return 96;
}

function getSchoolDaysForMonth(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  while (days.length < count) {
    if (d.getDay() !== 5 && d.getDay() !== 6) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.unshift(`${y}-${m}-${day}`);
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
}

interface AttendanceTargetsProps {
  locale: 'ar' | 'en';
  currentRate: number;
  previousRate: number;
}

export function AttendanceTargets({ locale, currentRate, previousRate }: AttendanceTargetsProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [target, setTarget] = useState(loadTarget);
  const [editValue, setEditValue] = useState(String(target));
  const [isEditing, setIsEditing] = useState(false);

  const gap = currentRate - target;
  const trendDiff = currentRate - previousRate;

  // Determine status
  const status: 'green' | 'amber' | 'red' =
    currentRate >= target ? 'green' :
    currentRate >= target - 2 ? 'amber' : 'red';

  const ringColor =
    status === 'green' ? '#10b981' :
    status === 'amber' ? '#f59e0b' : '#f43f5e';

  // Days on/off track this month
  const trackData = useMemo(() => {
    const days = getSchoolDaysForMonth(22);
    let onTrack = 0;
    let belowTarget = 0;
    for (const day of days) {
      const summary = getDailySummary(day);
      if (summary.totalStudents > 0) {
        if (summary.rate >= target) onTrack++;
        else belowTarget++;
      }
    }
    return { onTrack, belowTarget, total: onTrack + belowTarget };
  }, [target]);

  const handleSetTarget = () => {
    const v = parseFloat(editValue);
    if (!isNaN(v) && v > 0 && v <= 100) {
      setTarget(v);
      localStorage.setItem(STORAGE_KEY, String(v));
    } else {
      setEditValue(String(target));
    }
    setIsEditing(false);
  };

  const TrendIcon = trendDiff > 0 ? TrendingUp : trendDiff < 0 ? TrendingDown : Minus;
  const trendColor = trendDiff > 0 ? 'text-emerald-600' : trendDiff < 0 ? 'text-red-500' : 'text-slate-400';

  const trackPct = trackData.total > 0 ? Math.round((trackData.onTrack / trackData.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full font-[Cairo] rounded-xl border border-slate-200 bg-white p-5"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header with target editor */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-800">{t('هدف الحضور', 'Attendance Target')}</h3>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={50}
              max={100}
              step={0.1}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSetTarget(); if (e.key === 'Escape') { setIsEditing(false); setEditValue(String(target)); } }}
              className="w-20 px-2 py-1 rounded-lg border border-purple-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/40 text-center"
              autoFocus
            />
            <button
              onClick={handleSetTarget}
              className="p-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditValue(String(target)); setIsEditing(true); }}
            className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors px-2 py-1 rounded-lg hover:bg-purple-50"
          >
            <Pencil className="w-3 h-3" />
            {t('تعديل الهدف', 'Set Target')}
          </button>
        )}
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center mb-4">
        <div className="w-36 h-36">
          <ProgressRing
            value={currentRate}
            max={100}
            size={144}
            strokeWidth={12}
            color={ringColor}
            label={t('الحالي', 'Current')}
          />
        </div>
      </div>

      {/* Stats line */}
      <div className="text-center mb-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="text-slate-400">{t('الهدف:', 'Target:')}</span>{' '}
          <span className="font-bold">{target}%</span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-slate-400">{t('الحالي:', 'Current:')}</span>{' '}
          <span className="font-bold">{currentRate}%</span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-slate-400">{t('الفرق:', 'Gap:')}</span>{' '}
          <span className={`font-bold ${gap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {gap >= 0 ? '+' : ''}{gap.toFixed(1)}%
          </span>
        </p>
      </div>

      {/* Trend vs previous */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
        <span className={`text-xs font-semibold ${trendColor}`}>
          {trendDiff > 0 ? '+' : ''}{trendDiff.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">
          {t('مقارنة بالفترة السابقة', 'vs previous period')}
        </span>
      </div>

      {/* Days on track bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{t('أيام على المسار', 'Days on track')}</span>
          <span>{trackData.onTrack} / {trackData.total}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trackPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-emerald-500"
          />
          <div className="h-full flex-1 bg-slate-200" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {t('على المسار', 'On track')} ({trackData.onTrack})
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            {t('أقل من الهدف', 'Below target')} ({trackData.belowTarget})
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center py-2.5 px-4 rounded-lg text-sm font-semibold ${
          status === 'green'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : status === 'amber'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {status === 'green' && t('على المسار الصحيح! \uD83C\uDFAF', 'On track! \uD83C\uDFAF')}
        {status === 'amber' && t('قريب من الهدف', 'Close to target')}
        {status === 'red' && t('يحتاج تحسين', 'Needs improvement')}
      </motion.div>
    </motion.div>
  );
}
