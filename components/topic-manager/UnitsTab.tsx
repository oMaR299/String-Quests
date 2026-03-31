import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BookOpen, Users, Target, Trophy, TrendingUp, Star,
  ChevronDown, BarChart3, Layers, Award, Zap, GraduationCap,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  SUBJECT_UNITS,
  type StudentProfile,
  type Subject,
} from '../../data/complexLeaderboardData';
import { VerticalBarChart, HorizontalBarChart, ProgressRing } from '../admin-hub/attendance/SvgCharts';
import { StudentProfileModal } from '../StudentProfileModal';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

interface UnitsTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

const UNIT_LABELS_AR: Record<string, string> = {
  arithmetic: 'الحساب', algebra: 'الجبر', geometry: 'الهندسة', calculus: 'التفاضل', statistics: 'الإحصاء',
  matter: 'المادة', energy: 'الطاقة', forces: 'القوى', ecosystems: 'النظم البيئية',
  grammar: 'القواعد', literature: 'الأدب', poetry: 'الشعر', writing: 'الكتابة',
  ancient: 'القديم', islamic_history: 'التاريخ الإسلامي', modern: 'الحديث', geography: 'الجغرافيا',
  drawing: 'الرسم', colors: 'الألوان', history_of_art: 'تاريخ الفن',
  quran: 'القرآن', hadith: 'الحديث', fiqh: 'الفقه', tafsir: 'التفسير',
  citizenship: 'المواطنة', economics: 'الاقتصاد', sociology: 'علم الاجتماع',
  mechanics: 'الميكانيكا', thermodynamics: 'الديناميكا الحرارية', optics: 'البصريات', quantum: 'الكم',
  periodic_table: 'الجدول الدوري', reactions: 'التفاعلات', organic: 'العضوية', acids: 'الأحماض',
  cells: 'الخلايا', genetics: 'الوراثة', anatomy: 'التشريح', ecology: 'البيئة',
  coding: 'البرمجة', hardware: 'العتاد', networks: 'الشبكات', ai: 'الذكاء الاصطناعي',
  vocabulary: 'المفردات', reading: 'القراءة', speaking: 'التحدث',
};

const UNIT_EMOJIS: Record<string, string> = {
  arithmetic: '🔢', algebra: '📊', geometry: '📐', calculus: '∫', statistics: '📈',
  matter: '🧊', energy: '⚡', forces: '💪', ecosystems: '🌿',
  grammar: '📖', literature: '📚', poetry: '🎭', writing: '✍️',
  ancient: '🏺', islamic_history: '🕌', modern: '🌐', geography: '🗺️',
  drawing: '✏️', colors: '🎨', history_of_art: '🖼️',
  quran: '📖', hadith: '📜', fiqh: '⚖️', tafsir: '🔍',
  citizenship: '🏛️', economics: '💰', sociology: '👥',
  mechanics: '⚙️', thermodynamics: '🌡️', optics: '🔦', quantum: '⚛️',
  periodic_table: '📋', reactions: '🧪', organic: '🧬', acids: '💧',
  cells: '🔬', genetics: '🧬', anatomy: '🫁', ecology: '🌍',
  coding: '💻', hardware: '🖥️', networks: '🌐', ai: '🤖',
  vocabulary: '📝', reading: '📖', speaking: '🗣️',
};

const SUBJECT_NAMES: Record<string, { ar: string; en: string }> = {
  math: { ar: 'الرياضيات', en: 'Mathematics' },
  science: { ar: 'العلوم', en: 'Science' },
  languages: { ar: 'اللغات', en: 'Languages' },
  history: { ar: 'التاريخ', en: 'History' },
  arts: { ar: 'الفنون', en: 'Arts' },
  islamic: { ar: 'التربية الإسلامية', en: 'Islamic Studies' },
  english: { ar: 'اللغة الإنجليزية', en: 'English' },
  computer: { ar: 'الحاسب الآلي', en: 'Computer Science' },
  physics: { ar: 'الفيزياء', en: 'Physics' },
  chemistry: { ar: 'الكيمياء', en: 'Chemistry' },
  biology: { ar: 'الأحياء', en: 'Biology' },
  social: { ar: 'الاجتماعيات', en: 'Social Studies' },
};

interface UnitStats {
  unit: string;
  key: string;
  avgAccuracy: number;
  avgXp: number;
  studentCount: number;
  completionPct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topStudents: { student: StudentProfile; accuracy: number; xp: number }[];
  gradeBreakdown: { grade: number; accuracy: number; count: number }[];
  sectionBreakdown: Record<number, { section: string; accuracy: number; count: number }[]>;
  accuracyBrackets: { label: string; count: number; color: string }[];
}

/* ═══════════════════════════════════════════════════════════════
   Data Computation
   ═══════════════════════════════════════════════════════════════ */

function computeUnitStats(subject: string, students: StudentProfile[]): UnitStats[] {
  const subj = subject as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[subj] || [];

  return units.map(unit => {
    const key = `${subj}-${unit}`;
    const withData = students.filter(st => st.lessonDetails[key] && st.lessonDetails[key].accuracy > 0);
    const totalStudents = students.length;

    const avgAccuracy = withData.length > 0
      ? Math.round(withData.reduce((s, st) => s + st.lessonDetails[key].accuracy, 0) / withData.length)
      : 0;
    const avgXp = withData.length > 0
      ? Math.round(withData.reduce((s, st) => s + st.lessonDetails[key].xp, 0) / withData.length)
      : 0;
    const completionPct = totalStudents > 0 ? Math.round((withData.length / totalStudents) * 100) : 0;

    const difficulty: 'easy' | 'medium' | 'hard' =
      avgAccuracy >= 80 ? 'easy' : avgAccuracy >= 65 ? 'medium' : 'hard';

    // Top 10 students
    const topStudents = withData
      .map(st => ({ student: st, accuracy: st.lessonDetails[key].accuracy, xp: st.lessonDetails[key].xp }))
      .sort((a, b) => b.accuracy - a.accuracy || b.xp - a.xp)
      .slice(0, 10);

    // Grade breakdown
    const gradeMap: Record<number, { sum: number; count: number }> = {};
    withData.forEach(st => {
      const g = typeof st.grade === 'number' ? st.grade : 0;
      if (!gradeMap[g]) gradeMap[g] = { sum: 0, count: 0 };
      gradeMap[g].sum += st.lessonDetails[key].accuracy;
      gradeMap[g].count++;
    });
    const gradeBreakdown = Object.entries(gradeMap)
      .map(([g, d]) => ({ grade: Number(g), accuracy: Math.round(d.sum / d.count), count: d.count }))
      .sort((a, b) => a.grade - b.grade);

    // Section breakdown per grade
    const sectionBreakdown: Record<number, { section: string; accuracy: number; count: number }[]> = {};
    gradeBreakdown.forEach(gb => {
      const gradeStudents = withData.filter(st => st.grade === gb.grade);
      const secMap: Record<string, { sum: number; count: number }> = {};
      gradeStudents.forEach(st => {
        if (!secMap[st.section]) secMap[st.section] = { sum: 0, count: 0 };
        secMap[st.section].sum += st.lessonDetails[key].accuracy;
        secMap[st.section].count++;
      });
      sectionBreakdown[gb.grade] = Object.entries(secMap)
        .map(([sec, d]) => ({ section: sec, accuracy: Math.round(d.sum / d.count), count: d.count }))
        .sort((a, b) => a.section.localeCompare(b.section));
    });

    // Accuracy brackets
    const brackets = [
      { label: '90-100%', min: 90, max: 100, color: '#10b981' },
      { label: '80-89%', min: 80, max: 89, color: '#3b82f6' },
      { label: '70-79%', min: 70, max: 79, color: '#f59e0b' },
      { label: '60-69%', min: 60, max: 69, color: '#f97316' },
      { label: '<60%', min: 0, max: 59, color: '#f43f5e' },
    ].map(b => ({
      label: b.label,
      count: withData.filter(st => st.lessonDetails[key].accuracy >= b.min && st.lessonDetails[key].accuracy <= b.max).length,
      color: b.color,
    }));

    return {
      unit,
      key,
      avgAccuracy,
      avgXp,
      studentCount: withData.length,
      completionPct,
      difficulty,
      topStudents,
      gradeBreakdown,
      sectionBreakdown,
      accuracyBrackets: brackets,
    };
  });
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function UnitsTab({ subject, locale }: UnitsTabProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [modalGrade, setModalGrade] = useState<number>(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const unitStats = useMemo(() => computeUnitStats(subject, MOCK_SCHOOL_DATA), [subject]);

  const totalUnits = unitStats.length;
  const avgCompletion = totalUnits > 0
    ? Math.round(unitStats.reduce((s, u) => s + u.completionPct, 0) / totalUnits)
    : 0;
  const hardestUnit = unitStats.length > 0
    ? unitStats.reduce((a, b) => a.avgAccuracy < b.avgAccuracy ? a : b)
    : null;
  const easiestUnit = unitStats.length > 0
    ? unitStats.reduce((a, b) => a.avgAccuracy > b.avgAccuracy ? a : b)
    : null;

  const unitLabel = (u: string) => isRtl ? (UNIT_LABELS_AR[u] || u) : u;
  const unitEmoji = (u: string) => UNIT_EMOJIS[u] || '📘';

  const diffBadge = (d: 'easy' | 'medium' | 'hard') => {
    const styles = {
      easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      hard: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    const labels = {
      easy: t('سهل', 'Easy'),
      medium: t('متوسط', 'Medium'),
      hard: t('صعب', 'Hard'),
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded-lg border text-[10px] font-bold ${styles[d]}`}>
        {labels[d]}
      </span>
    );
  };

  const currentUnitData = useMemo(
    () => unitStats.find(u => u.unit === selectedUnit) || null,
    [unitStats, selectedUnit]
  );

  const medalEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-5" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ─── Stats Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('عدد الوحدات', 'Total Units'), value: String(totalUnits), icon: Layers, color: 'text-blue-600 bg-blue-50' },
          { label: t('متوسط الإكمال', 'Avg Completion'), value: `${avgCompletion}%`, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
          { label: t('أصعب وحدة', 'Hardest Unit'), value: hardestUnit ? unitLabel(hardestUnit.unit) : '-', icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
          { label: t('أسهل وحدة', 'Easiest Unit'), value: easiestUnit ? unitLabel(easiestUnit.unit) : '-', icon: Award, color: 'text-amber-600 bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-medium text-slate-500">{stat.label}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── Unit Card Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unitStats.map((unit, idx) => (
          <motion.button
            key={unit.unit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => { setSelectedUnit(unit.unit); setModalGrade(unit.gradeBreakdown[0]?.grade || 1); }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all text-start group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{unitEmoji(unit.unit)}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {unitLabel(unit.unit)}
                  </h3>
                  <p className="text-[10px] text-slate-400">{unit.studentCount} {t('طالب', 'students')}</p>
                </div>
              </div>
              {diffBadge(unit.difficulty)}
            </div>

            {/* Accuracy Ring */}
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 shrink-0">
                <ProgressRing
                  value={unit.avgAccuracy}
                  max={100}
                  size={64}
                  strokeWidth={6}
                  label={t('دقة', 'Acc')}
                />
              </div>
              <div className="flex-1 space-y-2">
                {/* Completion bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-500">{t('الإكمال', 'Completion')}</span>
                    <span className="font-bold text-slate-700">{unit.completionPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${unit.completionPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                    />
                  </div>
                </div>
                {/* Avg XP */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{t('متوسط XP', 'Avg XP')}</span>
                  <span className="font-bold text-slate-700">{unit.avgXp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ─── Unit Detail Modal ─── */}
      <AnimatePresence>
        {selectedUnit && currentUnitData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white relative">
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{unitEmoji(currentUnitData.unit)}</span>
                  <div>
                    <h2 className="text-xl font-bold">{unitLabel(currentUnitData.unit)}</h2>
                    <p className="text-sm text-white/80">
                      {SUBJECT_NAMES[subject]?.[isRtl ? 'ar' : 'en'] || subject}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 3 Stat Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t('متوسط الدقة', 'Avg Accuracy'), value: `${currentUnitData.avgAccuracy}%`, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
                    { label: t('متوسط XP', 'Avg XP'), value: currentUnitData.avgXp.toLocaleString(), icon: Zap, color: 'text-blue-600 bg-blue-50' },
                    { label: t('الطلاب', 'Students'), value: String(currentUnitData.studentCount), icon: Users, color: 'text-violet-600 bg-violet-50' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-800">{s.value}</p>
                      <p className="text-[10px] text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Grade Comparison Chart */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    {t('أداء الصفوف', 'Grade Performance')}
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <VerticalBarChart
                      data={currentUnitData.gradeBreakdown.map(gb => ({
                        label: t(`${gb.grade}`, `G${gb.grade}`),
                        value: gb.accuracy,
                        color: gb.accuracy >= 80 ? '#10b981' : gb.accuracy >= 65 ? '#f59e0b' : '#f43f5e',
                      }))}
                      maxValue={100}
                      height={180}
                    />
                  </div>
                </div>

                {/* Section Comparison for selected grade */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-violet-500" />
                      {t('مقارنة الشعب', 'Section Comparison')}
                    </h3>
                    <select
                      value={modalGrade}
                      onChange={e => setModalGrade(Number(e.target.value))}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      {currentUnitData.gradeBreakdown.map(gb => (
                        <option key={gb.grade} value={gb.grade}>{t(`الصف ${gb.grade}`, `Grade ${gb.grade}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    {currentUnitData.sectionBreakdown[modalGrade]?.length ? (
                      <HorizontalBarChart
                        data={currentUnitData.sectionBreakdown[modalGrade].map(sb => ({
                          label: `${t('شعبة', 'Section')} ${sb.section}`,
                          value: sb.accuracy,
                          meta: `${sb.count} ${t('طالب', 'students')}`,
                        }))}
                        maxValue={100}
                        valueSuffix="%"
                      />
                    ) : (
                      <p className="text-center text-sm text-slate-400 py-4">
                        {t('لا توجد بيانات لهذا الصف', 'No data for this grade')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Top 10 Students */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    {t('أفضل 10 طلاب', 'Top 10 Students')}
                  </h3>
                  <div className="space-y-1.5">
                    {currentUnitData.topStudents.map((entry, i) => (
                      <motion.button
                        key={entry.student.id}
                        initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedStudent(entry.student)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-start"
                      >
                        <span className="w-6 text-center text-xs font-bold text-slate-400">
                          {medalEmoji(i + 1) || `${i + 1}`}
                        </span>
                        <div className={`w-7 h-7 rounded-full ${entry.student.avatar} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                          {entry.student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{entry.student.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {t(`صف ${entry.student.grade}`, `Grade ${entry.student.grade}`)} - {entry.student.section}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className={`text-xs font-bold ${entry.accuracy >= 80 ? 'text-emerald-600' : entry.accuracy >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {entry.accuracy}%
                          </p>
                          <p className="text-[10px] text-slate-400">{entry.xp} XP</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Accuracy Distribution */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    {t('توزيع الدقة', 'Accuracy Distribution')}
                  </h3>
                  <div className="flex gap-2.5">
                    {currentUnitData.accuracyBrackets.map((bracket, i) => {
                      const maxCount = Math.max(...currentUnitData.accuracyBrackets.map(b => b.count), 1);
                      const pct = (bracket.count / maxCount) * 100;
                      return (
                        <div key={bracket.label} className="flex-1 text-center">
                          <div className="h-24 bg-slate-50 rounded-xl relative overflow-hidden flex items-end justify-center px-1">
                            <motion.div
                              className="w-full rounded-t-lg"
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                              style={{ backgroundColor: bracket.color, minHeight: bracket.count > 0 ? 4 : 0 }}
                            />
                          </div>
                          <p className="text-[10px] font-semibold text-slate-500 mt-1.5">{bracket.label}</p>
                          <p className="text-xs font-bold text-slate-700">{bracket.count}</p>
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

export default UnitsTab;
