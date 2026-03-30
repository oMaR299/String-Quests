import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MOCK_SCHOOL_DATA } from '../../data/complexLeaderboardData';
import type { Timeframe, League, StudentProfile } from '../../data/complexLeaderboardData';

interface TopStudentsWidgetProps {
  locale?: 'ar' | 'en';
  timeframe?: Timeframe;
  limit?: number;
  grade?: number | 'all';
  className?: string;
}

const LEAGUE_COLORS: Record<League, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

const LEAGUE_LABELS: Record<League, { ar: string; en: string }> = {
  bronze: { ar: 'برونز', en: 'Bronze' },
  silver: { ar: 'فضي', en: 'Silver' },
  gold: { ar: 'ذهبي', en: 'Gold' },
  platinum: { ar: 'بلاتين', en: 'Platinum' },
  diamond: { ar: 'ماسي', en: 'Diamond' },
};

const TIMEFRAME_LABELS: Record<Timeframe, { ar: string; en: string }> = {
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  'all-time': { ar: 'الكل', en: 'All Time' },
};

const MEDAL_GRADIENTS = [
  'from-yellow-400 to-amber-500',
  'from-slate-300 to-slate-400',
  'from-amber-600 to-orange-700',
];

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
];

function AnimatedXP({ value, locale }: { value: number; locale: 'ar' | 'en' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 900;
    const step = Math.max(1, Math.floor(value / 60));
    const interval = duration / (value / step);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>;
}

export default function TopStudentsWidget({
  locale = 'ar',
  timeframe: initialTimeframe = 'all-time',
  limit = 10,
  grade = 'all',
  className = '',
}: TopStudentsWidgetProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>(initialTimeframe);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';

  const students = useMemo(() => {
    let filtered: StudentProfile[] = [...MOCK_SCHOOL_DATA];
    if (grade !== 'all') {
      filtered = filtered.filter((s) => s.grade === grade);
    }
    filtered.sort((a, b) => b.timeframeScores[activeTimeframe] - a.timeframeScores[activeTimeframe]);
    return filtered.slice(0, limit);
  }, [activeTimeframe, grade, limit]);

  const getAvatarGradient = (id: string) => {
    const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm font-['Cairo'] ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900">{t('أفضل الطلاب', 'Top Students')}</h2>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {(Object.keys(TIMEFRAME_LABELS) as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTimeframe === tf
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t(TIMEFRAME_LABELS[tf].ar, TIMEFRAME_LABELS[tf].en)}
          </button>
        ))}
      </div>

      {/* Student List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTimeframe}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-1"
        >
          {students.map((student, idx) => {
            const rank = idx + 1;
            const isTopThree = rank <= 3;
            const avatarSize = isTopThree ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-default ${
                  isTopThree
                    ? 'hover:bg-amber-50/60 hover:shadow-[0_0_15px_rgba(251,191,36,0.08)]'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Rank */}
                <div className="w-7 flex-shrink-0 text-center">
                  {isTopThree ? (
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${MEDAL_GRADIENTS[rank - 1]} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-[11px] font-black text-white">{rank}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`${avatarSize} rounded-full bg-gradient-to-br ${getAvatarGradient(
                    student.id
                  )} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm`}
                >
                  {student.name.charAt(0)}
                </div>

                {/* Name & Grade */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {t(`الصف ${student.grade} - ${student.section}`, `Grade ${student.grade} - ${student.section}`)}
                  </p>
                </div>

                {/* XP */}
                <div className="text-sm font-black text-slate-700 tabular-nums flex-shrink-0">
                  <AnimatedXP value={student.timeframeScores[activeTimeframe]} locale={locale} />
                  <span className="text-[10px] font-bold text-slate-400 ms-0.5">XP</span>
                </div>

                {/* League Badge */}
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `${LEAGUE_COLORS[student.league]}18`,
                    color: LEAGUE_COLORS[student.league],
                    border: `1px solid ${LEAGUE_COLORS[student.league]}30`,
                  }}
                >
                  {t(LEAGUE_LABELS[student.league].ar, LEAGUE_LABELS[student.league].en)}
                </div>

                {/* Trend */}
                <div className="flex-shrink-0">
                  <TrendIcon trend={student.trend} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
