import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Search, Users, Zap, Target, Clock,
  TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown,
  X, Flame, Award, BookOpen,
} from 'lucide-react';
import { MOCK_SCHOOL_DATA, SUBJECT_UNITS as COMPLEX_UNITS } from '../../data/complexLeaderboardData';
import type { Subject, StudentProfile, League } from '../../data/complexLeaderboardData';
import { SUBJECT_UNITS as DETAIL_UNITS } from '../../data/subjectUnits';
import type { SubjectUnit } from '../../data/subjectUnits';

// ─── Types ───────────────────────────────────────────────────────────────────

type SubjectKey = Exclude<Subject, 'all'>;
type Timeframe = 'weekly' | 'monthly' | 'all-time';
type SortField = 'xp' | 'accuracy' | 'time';
type SortDir = 'asc' | 'desc';
type ChartToggle = 'weekly' | 'monthly';

interface SpaceLeaderboardDashboardProps {
  spaceSubject: string;
  spaceGrade: number;
  spaceSection: string;
  locale?: 'ar' | 'en';
  onBack?: () => void;
  onStudentClick?: (studentId: string) => void;
}

// ─── Mappings ────────────────────────────────────────────────────────────────

const SUBJECT_AR: Record<SubjectKey, string> = {
  math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', history: 'التاريخ',
  arts: 'الفنون', islamic: 'التربية الإسلامية', english: 'الإنجليزية',
  computer: 'الحاسوب', physics: 'الفيزياء', chemistry: 'الكيمياء',
  biology: 'الأحياء', social: 'الاجتماعيات',
};

const SUBJECT_EN: Record<SubjectKey, string> = {
  math: 'Mathematics', science: 'Science', languages: 'Languages', history: 'History',
  arts: 'Arts', islamic: 'Islamic Studies', english: 'English',
  computer: 'Computer Science', physics: 'Physics', chemistry: 'Chemistry',
  biology: 'Biology', social: 'Social Studies',
};

const SUBJECT_TO_DETAIL_KEY: Record<SubjectKey, string> = {
  math: 'رياضيات', science: 'علوم', languages: 'لغات', history: 'تاريخ',
  arts: 'فنون', islamic: 'تربية إسلامية', english: 'لغة إنجليزية',
  computer: 'حاسوب', physics: 'فيزياء', chemistry: 'كيمياء',
  biology: 'أحياء', social: 'ثقافة عامة',
};

const LEAGUE_COLORS: Record<League, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700',
  platinum: '#E5E4E2', diamond: '#B9F2FF',
};

const LEAGUE_AR: Record<League, string> = {
  bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي',
  platinum: 'بلاتيني', diamond: 'ماسي',
};

const LEAGUE_EN: Record<League, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold',
  platinum: 'Platinum', diamond: 'Diamond',
};

const GRADE_AR = (g: number) => `الصف ${g}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}س ${m}د` : `${h}س`;
}

function formatTimeEn(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SpaceLeaderboardDashboard({
  spaceSubject,
  spaceGrade,
  spaceSection,
  locale = 'ar',
  onBack,
  onStudentClick,
}: SpaceLeaderboardDashboardProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRTL = locale === 'ar';
  const subject = spaceSubject as SubjectKey;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [timeframe, setTimeframe] = useState<Timeframe>('all-time');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('xp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedUnit, setSelectedUnit] = useState<SubjectUnit | null>(null);
  const [chartToggle, setChartToggle] = useState<ChartToggle>('weekly');

  // ─── Data ──────────────────────────────────────────────────────────────────
  const students = useMemo(() =>
    MOCK_SCHOOL_DATA.filter(s =>
      s.grade === spaceGrade && s.section === spaceSection
    ), [spaceGrade, spaceSection]
  );

  const getXp = useCallback((s: StudentProfile) => {
    if (timeframe === 'weekly') return s.timeframeScores.weekly;
    if (timeframe === 'monthly') return s.timeframeScores.monthly;
    return s.subjectXp[subject] || 0;
  }, [timeframe, subject]);

  const getAccuracy = useCallback((s: StudentProfile) =>
    s.subjectDetails[subject]?.accuracy || 0, [subject]);

  const getTime = useCallback((s: StudentProfile) =>
    s.subjectDetails[subject]?.timeSpent || 0, [subject]);

  const sortedStudents = useMemo(() => {
    let filtered = students.filter(s =>
      search ? s.name.includes(search) : true
    );
    filtered.sort((a, b) => {
      let va: number, vb: number;
      if (sortField === 'xp') { va = getXp(a); vb = getXp(b); }
      else if (sortField === 'accuracy') { va = getAccuracy(a); vb = getAccuracy(b); }
      else { va = getTime(a); vb = getTime(b); }
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return filtered;
  }, [students, search, sortField, sortDir, getXp, getAccuracy, getTime]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const count = students.length;
    const avgXp = count > 0 ? Math.round(students.reduce((s, st) => s + (st.subjectXp[subject] || 0), 0) / count) : 0;
    const avgAcc = count > 0 ? Math.round(students.reduce((s, st) => s + (st.subjectDetails[subject]?.accuracy || 0), 0) / count) : 0;
    const totalTime = students.reduce((s, st) => s + (st.subjectDetails[subject]?.timeSpent || 0), 0);
    return { count, avgXp, avgAcc, totalTime };
  }, [students, subject]);

  // ─── Units ─────────────────────────────────────────────────────────────────
  const detailKey = SUBJECT_TO_DETAIL_KEY[subject] || '';
  const units: SubjectUnit[] = useMemo(() => {
    if (DETAIL_UNITS[detailKey]) return DETAIL_UNITS[detailKey];
    const complexUnits = COMPLEX_UNITS[subject] || [];
    return complexUnits.map((u, i) => ({
      id: `${subject}-${u}`,
      nameAr: u,
      nameEn: u,
      emoji: ['📐', '🔬', '📚', '🧪', '🔢'][i % 5],
      lessons: [u],
    }));
  }, [subject, detailKey]);

  const unitStats = useMemo(() => {
    return units.map(unit => {
      const lessonKeys = unit.lessons.map(l => `${subject}-${unit.id.split('-').slice(1).join('-')}`);
      const allKeys = Object.keys(students[0]?.lessonScores || {}).filter(k => k.startsWith(`${subject}-`));
      const unitKey = unit.id;

      let totalAcc = 0, attempted = 0, topScore = 0, topName = '';
      students.forEach(st => {
        let hasData = false;
        let stAcc = 0, stCount = 0;
        allKeys.forEach(k => {
          if (k.includes(unitKey.replace(`${subject}-`, '').replace(subject, '')) || unit.lessons.some(l => k.includes(l))) {
            // Fallback: match by any unit-related key
          }
        });
        // Use lessonDetails keyed by subject-unitSlug
        const complexUnitKeys = (COMPLEX_UNITS[subject] || []);
        complexUnitKeys.forEach(cu => {
          const key = `${subject}-${cu}`;
          if (st.lessonDetails[key] && (unit.nameEn.toLowerCase().includes(cu) || unit.id.includes(cu) || cu === unit.lessons[0]?.toLowerCase())) {
            hasData = true;
            stAcc += st.lessonDetails[key].accuracy;
            stCount++;
          }
        });
        // Broader match: use all lesson detail keys for this subject
        Object.keys(st.lessonDetails).forEach(k => {
          if (k.startsWith(`${subject}-`)) {
            // Just count all subject-level data per student for unit approximation
          }
        });

        if (!hasData) {
          // Approximate from subject-level accuracy with slight per-unit variation
          const rng = seededRandom(st.id.charCodeAt(3) + unit.id.charCodeAt(0));
          const baseAcc = st.subjectDetails[subject]?.accuracy || 0;
          stAcc = Math.max(40, Math.min(100, baseAcc + Math.floor((rng() - 0.5) * 20)));
          stCount = 1;
          hasData = rng() > 0.15; // 85% attempt rate
        }

        if (hasData) {
          const avg = stCount > 0 ? stAcc / stCount : 0;
          totalAcc += avg;
          attempted++;
          if (avg > topScore) { topScore = avg; topName = st.name; }
        }
      });
      const avgAccuracy = attempted > 0 ? Math.round(totalAcc / attempted) : 0;
      return { unit, avgAccuracy, attempted, total: students.length, topName };
    });
  }, [units, students, subject]);

  // ─── Chart Data (mock trends) ──────────────────────────────────────────────
  const trendData = useMemo(() => {
    const points = 8;
    const rng = seededRandom(42 + spaceGrade * 7);
    const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
    const monthLabels = ['سبت', 'أكت', 'نوف', 'ديس', 'ينا', 'فبر', 'مار', 'أبر'];
    const baseXp = stats.avgXp * 0.6;
    const baseAcc = stats.avgAcc * 0.85;

    const buildData = (labels: string[]) => labels.map((label, i) => ({
      label,
      xp: Math.round(baseXp + (baseXp * 0.5 * (i / points)) + (rng() - 0.4) * baseXp * 0.15),
      accuracy: Math.min(100, Math.round(baseAcc + (i * 1.5) + (rng() - 0.5) * 8)),
    }));

    return { weekly: buildData(weekLabels), monthly: buildData(monthLabels) };
  }, [stats.avgXp, stats.avgAcc, spaceGrade]);

  // ─── Scatter Data ──────────────────────────────────────────────────────────
  const scatterData = useMemo(() => {
    const maxXp = Math.max(...students.map(s => s.subjectXp[subject] || 0), 1);
    const medianXp = students.length > 0
      ? [...students].sort((a, b) => (a.subjectXp[subject] || 0) - (b.subjectXp[subject] || 0))[Math.floor(students.length / 2)].subjectXp[subject] || maxXp / 2
      : maxXp / 2;
    return { maxXp, medianXp, students };
  }, [students, subject]);

  // ─── Improvers / Champions / Streaks ───────────────────────────────────────
  const improvers = useMemo(() => {
    return [...students]
      .map(s => {
        const rng = seededRandom(s.id.charCodeAt(4) * 3);
        const gain = Math.round(50 + rng() * 200);
        return { ...s, gain };
      })
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 3);
  }, [students]);

  const accuracyChampions = useMemo(() =>
    [...students].sort((a, b) => getAccuracy(b) - getAccuracy(a)).slice(0, 5),
    [students, getAccuracy]
  );

  const streakStudents = useMemo(() => {
    return [...students]
      .map(s => {
        const rng = seededRandom(s.id.charCodeAt(5) * 11);
        return { ...s, streak: 3 + Math.floor(rng() * 13) };
      })
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3);
  }, [students]);

  const unitTimeData = useMemo(() => {
    const complexUnits = COMPLEX_UNITS[subject] || [];
    return complexUnits.map(u => {
      const key = `${subject}-${u}`;
      const total = students.reduce((sum, st) => sum + (st.lessonDetails[key]?.timeSpent || 0), 0);
      return { name: u, time: total };
    }).sort((a, b) => b.time - a.time);
  }, [students, subject]);

  // ─── Unit Modal Data ───────────────────────────────────────────────────────
  const unitModalData = useMemo(() => {
    if (!selectedUnit) return null;
    const complexUnits = COMPLEX_UNITS[subject] || [];
    // Find matching complex unit keys
    const matchingKeys = complexUnits.filter(cu =>
      selectedUnit.id.includes(cu) || selectedUnit.lessons.some(l => l.toLowerCase() === cu)
    );
    // If no match, use first available for demo
    const keys = matchingKeys.length > 0 ? matchingKeys : complexUnits.slice(0, 2);

    const lessonBreakdown = keys.map(k => {
      const fullKey = `${subject}-${k}`;
      let totalAcc = 0, count = 0, topScore = 0, topName = '', attempts = 0;
      students.forEach(st => {
        const d = st.lessonDetails[fullKey];
        if (d) {
          totalAcc += d.accuracy;
          count++;
          attempts++;
          if (d.accuracy > topScore) { topScore = d.accuracy; topName = st.name; }
        }
      });
      return {
        name: k,
        avgScore: count > 0 ? Math.round(totalAcc / count) : 0,
        topStudent: topName || '-',
        attempts,
      };
    });

    // Top 5 for this unit
    const top5 = [...students]
      .map(st => {
        const score = keys.reduce((s, k) => s + (st.lessonScores[`${subject}-${k}`] || 0), 0);
        return { ...st, unitScore: score };
      })
      .sort((a, b) => b.unitScore - a.unitScore)
      .slice(0, 5);

    // Accuracy distribution
    const brackets = [0, 0, 0, 0, 0]; // <60, 60-70, 70-80, 80-90, 90-100
    students.forEach(st => {
      const acc = keys.reduce((s, k) => {
        const d = st.lessonDetails[`${subject}-${k}`];
        return d ? s + d.accuracy : s;
      }, 0);
      const avg = keys.length > 0 ? acc / keys.length : 0;
      const effective = avg > 0 ? avg : (st.subjectDetails[subject]?.accuracy || 0);
      if (effective < 60) brackets[0]++;
      else if (effective < 70) brackets[1]++;
      else if (effective < 80) brackets[2]++;
      else if (effective < 90) brackets[3]++;
      else brackets[4]++;
    });

    return { lessonBreakdown, top5, brackets };
  }, [selectedUnit, students, subject]);

  // ─── Sort handler ──────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'desc'
      ? <ChevronDown className="w-3 h-3 text-violet-500" />
      : <ChevronUp className="w-3 h-3 text-violet-500" />;
  };

  // ─── Animation variants ────────────────────────────────────────────────────
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } };

  // ─── Render ────────────────────────────────────────────────────────────────
  const subjectName = locale === 'ar' ? (SUBJECT_AR[subject] || subject) : (SUBJECT_EN[subject] || subject);
  const sectionLabel = locale === 'ar' ? `${GRADE_AR(spaceGrade)}${spaceSection}` : `Grade ${spaceGrade}${spaceSection}`;
  const currentTrend = chartToggle === 'weekly' ? trendData.weekly : trendData.monthly;
  const maxTrendXp = Math.max(...currentTrend.map(d => d.xp), 1);

  return (
    <div
      className="min-h-screen bg-slate-50 font-['Cairo']"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ═══ A) Header ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              {isRTL ? <ArrowRight className="w-5 h-5 text-slate-600" /> : <ArrowLeft className="w-5 h-5 text-slate-600" />}
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">
              {subjectName} - {sectionLabel}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('أ. سارة العلي', 'Ms. Sarah Al-Ali')}
            </p>
          </div>
          <div className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
            {t(`${stats.count} طالب`, `${stats.count} Students`)}
          </div>
        </motion.div>

        {/* ═══ B) Stats Cards ═══ */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Users, label: t('الطلاب', 'Students'), value: stats.count,
              gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50',
            },
            {
              icon: Zap, label: t('متوسط XP', 'Avg XP'), value: stats.avgXp.toLocaleString(),
              gradient: 'from-violet-500 to-purple-400', bg: 'bg-violet-50',
            },
            {
              icon: Target, label: t('متوسط الدقة', 'Avg Accuracy'), value: `${stats.avgAcc}%`,
              gradient: 'from-emerald-500 to-green-400', bg: 'bg-emerald-50',
            },
            {
              icon: Clock, label: t('إجمالي الوقت', 'Total Time'),
              value: locale === 'ar' ? formatTime(stats.totalTime) : formatTimeEn(stats.totalTime),
              gradient: 'from-amber-500 to-orange-400', bg: 'bg-amber-50',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ C) Ranking Table ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
        >
          <h2 className="text-lg font-black text-slate-900 mb-4">
            {t('ترتيب الطلاب', 'Student Rankings')}
          </h2>

          {/* Timeframe Tabs + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {([
                { key: 'weekly' as Timeframe, ar: 'هذا الأسبوع', en: 'Weekly' },
                { key: 'monthly' as Timeframe, ar: 'هذا الشهر', en: 'Monthly' },
                { key: 'all-time' as Timeframe, ar: 'الكل', en: 'All Time' },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTimeframe(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeframe === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t(tab.ar, tab.en)}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('بحث عن طالب...', 'Search student...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2 px-2 text-start font-semibold">#</th>
                  <th className="py-2 px-2 text-start font-semibold">{t('الطالب', 'Student')}</th>
                  <th className="py-2 px-2 text-start font-semibold cursor-pointer select-none" onClick={() => handleSort('xp')}>
                    <span className="flex items-center gap-1">XP <SortIcon field="xp" /></span>
                  </th>
                  <th className="py-2 px-2 text-start font-semibold cursor-pointer select-none" onClick={() => handleSort('accuracy')}>
                    <span className="flex items-center gap-1">{t('الدقة', 'Accuracy')} <SortIcon field="accuracy" /></span>
                  </th>
                  <th className="py-2 px-2 text-start font-semibold cursor-pointer select-none" onClick={() => handleSort('time')}>
                    <span className="flex items-center gap-1">{t('الوقت', 'Time')} <SortIcon field="time" /></span>
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">{t('الاتجاه', 'Trend')}</th>
                  <th className="py-2 px-2 text-center font-semibold">{t('الرتبة', 'League')}</th>
                </tr>
              </thead>
              <motion.tbody variants={stagger} initial="hidden" animate="visible">
                {sortedStudents.map((st, i) => {
                  const rank = i + 1;
                  const acc = getAccuracy(st);
                  const xp = getXp(st);
                  const time = getTime(st);
                  const medalBg = rank === 1 ? 'bg-amber-50' : rank === 2 ? 'bg-slate-50' : rank === 3 ? 'bg-orange-50' : '';
                  const medalText = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

                  return (
                    <motion.tr
                      key={st.id}
                      variants={fadeUp}
                      className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer ${medalBg}`}
                      onClick={() => onStudentClick?.(st.id)}
                    >
                      <td className="py-3 px-2 font-bold text-slate-600">{medalText}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${st.avatar} flex items-center justify-center text-xs font-bold text-slate-700`}>
                            {st.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-700">{xp.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${acc >= 80 ? 'bg-emerald-500' : acc >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${acc}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">{acc}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {locale === 'ar' ? formatTime(time) : formatTimeEn(time)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {st.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 inline" />}
                        {st.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400 inline" />}
                        {st.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400 inline" />}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${LEAGUE_COLORS[st.league]}22`,
                            color: LEAGUE_COLORS[st.league],
                            border: `1px solid ${LEAGUE_COLORS[st.league]}44`,
                          }}
                        >
                          {locale === 'ar' ? LEAGUE_AR[st.league] : LEAGUE_EN[st.league]}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        {/* ═══ D) Units Grid ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-black text-slate-900 mb-4">
            {t('الوحدات الدراسية', 'Units')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unitStats.map((us, i) => {
              const colorClass = us.avgAccuracy >= 80
                ? 'border-emerald-200 bg-emerald-50/50'
                : us.avgAccuracy >= 60
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-red-200 bg-red-50/50';
              const accColor = us.avgAccuracy >= 80 ? 'text-emerald-600' : us.avgAccuracy >= 60 ? 'text-amber-600' : 'text-red-600';

              return (
                <motion.button
                  key={us.unit.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => setSelectedUnit(us.unit)}
                  className={`rounded-2xl border p-5 shadow-sm text-start hover:shadow-md transition-all ${colorClass}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{us.unit.emoji}</span>
                    <span className="font-bold text-slate-800">
                      {locale === 'ar' ? us.unit.nameAr : us.unit.nameEn}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('متوسط الدقة', 'Avg Accuracy')}</span>
                      <span className={`font-bold ${accColor}`}>{us.avgAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('المشاركة', 'Participation')}</span>
                      <span className="font-semibold text-slate-700">{us.attempted}/{us.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('الأفضل', 'Top Student')}</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[100px]">{us.topName || '-'}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ E) Charts ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Trend Lines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">
                {t('اتجاه الأداء', 'Performance Trend')}
              </h3>
              <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                {([
                  { key: 'weekly' as ChartToggle, ar: 'أسبوعي', en: 'Weekly' },
                  { key: 'monthly' as ChartToggle, ar: 'شهري', en: 'Monthly' },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setChartToggle(opt.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      chartToggle === opt.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {t(opt.ar, opt.en)}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="relative h-52">
              <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="40" y1={20 + i * 35} x2="390" y2={20 + i * 35} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {/* XP Line (blue) */}
                <motion.polyline
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={currentTrend.map((d, i) => {
                    const x = 50 + (i * (340 / (currentTrend.length - 1)));
                    const y = 155 - ((d.xp / maxTrendXp) * 130);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Accuracy Line (green) */}
                <motion.polyline
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={currentTrend.map((d, i) => {
                    const x = 50 + (i * (340 / (currentTrend.length - 1)));
                    const y = 155 - ((d.accuracy / 100) * 130);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Data point dots */}
                {currentTrend.map((d, i) => {
                  const x = 50 + (i * (340 / (currentTrend.length - 1)));
                  const yXp = 155 - ((d.xp / maxTrendXp) * 130);
                  const yAcc = 155 - ((d.accuracy / 100) * 130);
                  return (
                    <g key={i}>
                      <motion.circle
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.05 }}
                        cx={x} cy={yXp} r="4" fill="#3b82f6"
                      >
                        <title>{`${d.label}: XP ${d.xp}`}</title>
                      </motion.circle>
                      <motion.circle
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.05 }}
                        cx={x} cy={yAcc} r="4" fill="#10b981"
                      >
                        <title>{`${d.label}: ${t('دقة', 'Acc')} ${d.accuracy}%`}</title>
                      </motion.circle>
                      {/* X label */}
                      <text x={x} y="175" textAnchor="middle" className="text-[9px] fill-slate-400 font-['Cairo']">{d.label}</text>
                    </g>
                  );
                })}
              </svg>
              {/* Legend */}
              <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} flex gap-3 text-[10px]`}>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> {t('متوسط XP', 'Avg XP')}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {t('الدقة', 'Accuracy')}</span>
              </div>
            </div>
          </motion.div>

          {/* Chart 2: Scatter Plot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-900 mb-4">
              {t('الدقة مقابل النقاط', 'Accuracy vs XP')}
            </h3>
            <div className="relative h-64">
              <svg viewBox="0 0 400 240" className="w-full h-full">
                {/* Axes */}
                <line x1="45" y1="10" x2="45" y2="210" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="45" y1="210" x2="390" y2="210" stroke="#e2e8f0" strokeWidth="1" />

                {/* Quadrant dividers */}
                <line x1="45" y1={210 - (70 / 100) * 200} x2="390" y2={210 - (70 / 100) * 200}
                  stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
                {(() => {
                  const medX = 45 + (scatterData.medianXp / scatterData.maxXp) * 345;
                  return <line x1={medX} y1="10" x2={medX} y2="210" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />;
                })()}

                {/* Quadrant labels */}
                {(() => {
                  const medX = 45 + (scatterData.medianXp / scatterData.maxXp) * 345;
                  const accY = 210 - (70 / 100) * 200;
                  return (
                    <>
                      {/* Top-right: Star Performer */}
                      <rect x={Math.min(medX + 5, 300)} y="15" width="80" height="18" rx="4" fill="#dcfce7" />
                      <text x={Math.min(medX + 45, 340)} y="28" textAnchor="middle" className="text-[8px] fill-emerald-700 font-['Cairo'] font-bold">
                        {t('⭐ متفوق', '⭐ Star')}
                      </text>
                      {/* Top-left: Accurate */}
                      <rect x="50" y="15" width="70" height="18" rx="4" fill="#dbeafe" />
                      <text x="85" y="28" textAnchor="middle" className="text-[8px] fill-blue-700 font-['Cairo'] font-bold">
                        {t('🎯 دقيق', '🎯 Accurate')}
                      </text>
                      {/* Bottom-right: Active */}
                      <rect x={Math.min(medX + 5, 300)} y={accY + 5} width="72" height="18" rx="4" fill="#fef3c7" />
                      <text x={Math.min(medX + 41, 336)} y={accY + 17} textAnchor="middle" className="text-[8px] fill-amber-700 font-['Cairo'] font-bold">
                        {t('⚡ نشيط', '⚡ Active')}
                      </text>
                      {/* Bottom-left: Needs Support */}
                      <rect x="50" y={accY + 5} width="82" height="18" rx="4" fill="#fee2e2" />
                      <text x="91" y={accY + 17} textAnchor="middle" className="text-[8px] fill-red-700 font-['Cairo'] font-bold">
                        {t('🆘 يحتاج دعم', '🆘 Support')}
                      </text>
                    </>
                  );
                })()}

                {/* Axis labels */}
                <text x="220" y="232" textAnchor="middle" className="text-[9px] fill-slate-400 font-['Cairo']">XP</text>
                <text x="12" y="110" textAnchor="middle" className="text-[9px] fill-slate-400 font-['Cairo']"
                  transform="rotate(-90, 12, 110)">{t('الدقة', 'Acc')}%</text>

                {/* Student dots */}
                {scatterData.students.map((st, i) => {
                  const xp = st.subjectXp[subject] || 0;
                  const acc = st.subjectDetails[subject]?.accuracy || 0;
                  const cx = 45 + (xp / scatterData.maxXp) * 345;
                  const cy = 210 - (acc / 100) * 200;
                  return (
                    <motion.circle
                      key={st.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.85, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      cx={cx} cy={cy} r="6"
                      fill={LEAGUE_COLORS[st.league]}
                      stroke="white" strokeWidth="1.5"
                      className="cursor-pointer hover:opacity-100"
                    >
                      <title>{`${st.name}\nXP: ${xp}\n${t('دقة', 'Acc')}: ${acc}%`}</title>
                    </motion.circle>
                  );
                })}
              </svg>
            </div>
          </motion.div>
        </div>

        {/* ═══ F) Bonus Widgets ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top Improvers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              {t('أكثر تحسناً هذا الأسبوع', 'Top Improvers This Week')}
            </h3>
            <div className="space-y-3">
              {improvers.map((st, i) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-green-50/30"
                >
                  <div className={`w-10 h-10 rounded-full ${st.avatar} flex items-center justify-center text-sm font-bold text-slate-700`}>
                    {st.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{st.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +{st.gain} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Accuracy Champions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              {t('أبطال الدقة', 'Accuracy Champions')}
            </h3>
            <div className="space-y-2.5">
              {accuracyChampions.map((st, i) => {
                const acc = getAccuracy(st);
                return (
                  <motion.div
                    key={st.id}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full ${st.avatar} flex items-center justify-center text-xs font-bold text-slate-700`}>
                      {st.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{st.name}</p>
                    </div>
                    <div className="flex items-center gap-2 w-32">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${acc >= 90 ? 'bg-blue-500' : acc >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${acc}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-9 text-end">{acc}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Study Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {t('توزيع وقت الدراسة', 'Study Time Distribution')}
            </h3>
            <div className="space-y-3">
              {unitTimeData.slice(0, 5).map((ut, i) => {
                const maxTime = unitTimeData[0]?.time || 1;
                const pct = Math.round((ut.time / maxTime) * 100);
                return (
                  <motion.div
                    key={ut.name}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                    style={{ transformOrigin: isRTL ? 'right' : 'left' }}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 capitalize">{ut.name}</span>
                      <span className="text-slate-500">{locale === 'ar' ? formatTime(ut.time) : formatTimeEn(ut.time)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Class Streaks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              {t('أطول سلسلة متواصلة', 'Longest Streaks')}
            </h3>
            <div className="space-y-3">
              {streakStudents.map((st, i) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/30 border border-orange-100"
                >
                  <div className={`w-10 h-10 rounded-full ${st.avatar} flex items-center justify-center text-sm font-bold text-slate-700`}>
                    {st.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{st.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-orange-600 text-sm">
                    <span className="text-base">🔥</span>
                    {st.streak} {t('يوم', 'days')}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Unit Detail Modal ═══ */}
      <AnimatePresence>
        {selectedUnit && unitModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto font-['Cairo']"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedUnit.emoji}</span>
                  <h3 className="text-lg font-black text-slate-900">
                    {locale === 'ar' ? selectedUnit.nameAr : selectedUnit.nameEn}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Lesson Breakdown Table */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3">
                    {t('تفصيل الدروس', 'Lesson Breakdown')}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-100">
                          <th className="py-2 px-2 text-start font-semibold">{t('الدرس', 'Lesson')}</th>
                          <th className="py-2 px-2 text-start font-semibold">{t('متوسط النتيجة', 'Avg Score')}</th>
                          <th className="py-2 px-2 text-start font-semibold">{t('الأفضل', 'Top Student')}</th>
                          <th className="py-2 px-2 text-center font-semibold">{t('المحاولات', 'Attempts')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unitModalData.lessonBreakdown.map((lesson, i) => (
                          <tr key={i} className="border-b border-slate-50">
                            <td className="py-2.5 px-2 font-semibold text-slate-700 capitalize">{lesson.name}</td>
                            <td className="py-2.5 px-2">
                              <span className={`font-bold ${
                                lesson.avgScore >= 80 ? 'text-emerald-600' : lesson.avgScore >= 60 ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {lesson.avgScore}%
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-slate-600 truncate max-w-[120px]">{lesson.topStudent}</td>
                            <td className="py-2.5 px-2 text-center text-slate-500">{lesson.attempts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mini Top 5 */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3">
                    {t('أفضل 5 طلاب في هذه الوحدة', 'Top 5 in This Unit')}
                  </h4>
                  <div className="space-y-2">
                    {unitModalData.top5.map((st, i) => {
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
                      return (
                        <div key={st.id} className="flex items-center gap-3 py-2">
                          <span className="w-6 text-center font-bold text-sm">{medal}</span>
                          <div className={`w-7 h-7 rounded-full ${st.avatar} flex items-center justify-center text-[10px] font-bold text-slate-700`}>
                            {st.name.charAt(0)}
                          </div>
                          <span className="flex-1 font-semibold text-slate-800 text-sm truncate">{st.name}</span>
                          <span className="font-bold text-violet-600 text-sm">{st.unitScore.toLocaleString()} XP</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accuracy Distribution */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-3">
                    {t('توزيع الدقة', 'Accuracy Distribution')}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: '90-100%', color: 'bg-emerald-500', count: unitModalData.brackets[4] },
                      { label: '80-90%', color: 'bg-green-400', count: unitModalData.brackets[3] },
                      { label: '70-80%', color: 'bg-amber-400', count: unitModalData.brackets[2] },
                      { label: '60-70%', color: 'bg-orange-400', count: unitModalData.brackets[1] },
                      { label: '<60%', color: 'bg-red-400', count: unitModalData.brackets[0] },
                    ].map((bracket, i) => {
                      const maxCount = Math.max(...unitModalData.brackets, 1);
                      const pct = Math.round((bracket.count / maxCount) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-16 text-end font-mono">{bracket.label}</span>
                          <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                              className={`h-full rounded-md ${bracket.color}`}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-6">{bracket.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpaceLeaderboardDashboard;
