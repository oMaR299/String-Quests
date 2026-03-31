import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Crown, ChevronDown } from 'lucide-react';
import { MOCK_SCHOOL_DATA } from '../../data/complexLeaderboardData';
import type { ClassSection, League, StudentProfile } from '../../data/complexLeaderboardData';

interface ClassComparisonWidgetProps {
  locale?: 'ar' | 'en';
  grade?: number;
  className?: string;
}

const SECTION_COLORS: Record<ClassSection, { bg: string; bar: string; text: string; light: string }> = {
  A: { bg: 'bg-blue-500', bar: 'from-blue-400 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
  B: { bg: 'bg-emerald-500', bar: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' },
  C: { bg: 'bg-amber-500', bar: 'from-amber-400 to-amber-600', text: 'text-amber-600', light: 'bg-amber-50' },
  D: { bg: 'bg-violet-500', bar: 'from-violet-400 to-violet-600', text: 'text-violet-600', light: 'bg-violet-50' },
  E: { bg: 'bg-pink-500', bar: 'from-pink-400 to-pink-600', text: 'text-pink-600', light: 'bg-pink-50' },
  F: { bg: 'bg-cyan-500', bar: 'from-cyan-400 to-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50' },
};

const LEAGUE_DOT_COLORS: Record<League, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

const LEAGUE_ORDER: League[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

interface SectionStats {
  section: ClassSection;
  students: StudentProfile[];
  count: number;
  avgXp: number;
  avgAccuracy: number;
  topStudent: string;
  leagueDistribution: Record<League, number>;
}

export default function ClassComparisonWidget({
  locale = 'ar',
  grade: initialGrade = 4,
  className = '',
}: ClassComparisonWidgetProps) {
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [showDropdown, setShowDropdown] = useState(false);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';

  const sectionStats = useMemo((): SectionStats[] => {
    const gradeStudents = MOCK_SCHOOL_DATA.filter((s) => s.grade === selectedGrade);
    const sections = new Map<ClassSection, StudentProfile[]>();

    gradeStudents.forEach((s) => {
      const list = sections.get(s.section) || [];
      list.push(s);
      sections.set(s.section, list);
    });

    const stats: SectionStats[] = [];
    sections.forEach((students, section) => {
      const totalXp = students.reduce((sum, s) => sum + s.totalXp, 0);
      // Average accuracy across all subjects per student, then average across students
      const totalAcc = students.reduce((sum, s) => {
        const subjects = Object.values(s.subjectDetails).filter((d) => d.xp > 0);
        const studentAvg = subjects.length > 0
          ? subjects.reduce((a, d) => a + d.accuracy, 0) / subjects.length
          : 0;
        return sum + studentAvg;
      }, 0);

      const leagueDistribution: Record<League, number> = {
        bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0,
      };
      students.forEach((s) => { leagueDistribution[s.league]++; });

      const topStudent = [...students].sort((a, b) => b.totalXp - a.totalXp)[0];

      stats.push({
        section,
        students,
        count: students.length,
        avgXp: Math.round(totalXp / students.length),
        avgAccuracy: Math.round(totalAcc / students.length),
        topStudent: topStudent?.name || '-',
        leagueDistribution,
      });
    });

    return stats.sort((a, b) => b.avgXp - a.avgXp);
  }, [selectedGrade]);

  const maxAvgXp = Math.max(...sectionStats.map((s) => s.avgXp), 1);
  const winnerSection = sectionStats[0]?.section;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm font-['Cairo'] ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900">{t('مقارنة الفصول', 'Class Comparison')}</h2>
        </div>

        {/* Grade Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {t(`الصف ${selectedGrade}`, `Grade ${selectedGrade}`)}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full mt-1 end-0 z-20 bg-white rounded-xl border border-slate-100 shadow-lg py-1 min-w-[120px]">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGrade(g);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-sm font-bold text-start transition-colors ${
                      selectedGrade === g
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t(`الصف ${g}`, `Grade ${g}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGrade}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {sectionStats.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              {t('لا توجد بيانات لهذا الصف', 'No data for this grade')}
            </div>
          ) : (
            <>
              {/* Bar Chart */}
              <div className="space-y-3 mb-6">
                {sectionStats.map((stat, idx) => {
                  const barWidth = (stat.avgXp / maxAvgXp) * 100;
                  const colors = SECTION_COLORS[stat.section];
                  const isWinner = stat.section === winnerSection;

                  return (
                    <motion.div
                      key={stat.section}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.35 }}
                      className="flex items-center gap-3"
                    >
                      {/* Section Label */}
                      <div className="w-16 flex items-center gap-1 flex-shrink-0">
                        <div className={`w-6 h-6 rounded-md ${colors.light} flex items-center justify-center`}>
                          <span className={`text-xs font-black ${colors.text}`}>{stat.section}</span>
                        </div>
                        {isWinner && (
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>

                      {/* Bar */}
                      <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${colors.bar} rounded-lg flex items-center justify-end px-2`}
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ delay: idx * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
                        >
                          <span className="text-[11px] font-black text-white drop-shadow-sm">
                            {stat.avgXp.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Stats Table */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-1 px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div>{t('الفصل', 'Section')}</div>
                  <div className="text-center">{t('الطلاب', 'Students')}</div>
                  <div className="text-center">{t('معدل XP', 'Avg XP')}</div>
                  <div className="text-center">{t('الدقة', 'Accuracy')}</div>
                  <div>{t('الأفضل', 'Top')}</div>
                  <div className="text-center">{t('التصنيف', 'Leagues')}</div>
                </div>

                {/* Table Rows */}
                {sectionStats.map((stat, idx) => {
                  const colors = SECTION_COLORS[stat.section];
                  const isWinner = stat.section === winnerSection;

                  return (
                    <motion.div
                      key={stat.section}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06 + 0.4, duration: 0.3 }}
                      className={`grid grid-cols-6 gap-1 px-3 py-2.5 border-t border-slate-50 items-center ${
                        isWinner ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Section */}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                        <span className="text-sm font-bold text-slate-700">
                          {t(`فصل ${stat.section}`, `Section ${stat.section}`)}
                        </span>
                        {isWinner && <Crown className="w-3 h-3 text-amber-500" />}
                      </div>

                      {/* Student Count */}
                      <div className="text-center text-sm font-bold text-slate-600">{stat.count}</div>

                      {/* Avg XP */}
                      <div className="text-center text-sm font-black text-slate-700 tabular-nums">
                        {stat.avgXp.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>

                      {/* Avg Accuracy */}
                      <div className="text-center">
                        <span
                          className={`text-sm font-bold ${
                            stat.avgAccuracy >= 80
                              ? 'text-emerald-600'
                              : stat.avgAccuracy >= 60
                              ? 'text-amber-600'
                              : 'text-red-500'
                          }`}
                        >
                          {stat.avgAccuracy}%
                        </span>
                      </div>

                      {/* Top Student */}
                      <div className="text-xs font-bold text-slate-600 truncate">{stat.topStudent}</div>

                      {/* League Distribution */}
                      <div className="flex items-center justify-center gap-0.5 flex-wrap">
                        {LEAGUE_ORDER.map((league) => {
                          const count = stat.leagueDistribution[league];
                          if (count === 0) return null;
                          return Array.from({ length: count }).map((_, i) => (
                            <div
                              key={`${league}-${i}`}
                              className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: LEAGUE_DOT_COLORS[league] }}
                              title={`${league}: ${count}`}
                            />
                          ));
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
