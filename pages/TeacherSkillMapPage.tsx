import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, CheckCircle2, TrendingDown, BrainCircuit, ChevronDown } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import {
  MOCK_STUDENTS,
  MOCK_CLASSES,
  TRACKED_KCS,
  TRACKED_SUBJECTS,
  getStudentsInClass,
  getClassAlerts,
  getKCName,
  getKCSubject,
} from '../data/mockSchoolData';

// Mastery score -> color classes
function getMasteryColor(score: number): string {
  if (score === 0) return 'bg-slate-200 text-slate-400';
  if (score < 40) return 'bg-red-400 text-white';
  if (score < 70) return 'bg-amber-400 text-white';
  if (score < 90) return 'bg-green-400 text-white';
  return 'bg-green-600 text-white';
}

function getMasteryLabel(score: number, locale: 'ar' | 'en'): string {
  if (score === 0) return locale === 'ar' ? 'لم يبدأ' : 'Not started';
  if (score < 40) return locale === 'ar' ? 'ضعيف' : 'Weak';
  if (score < 70) return locale === 'ar' ? 'نامٍ' : 'Developing';
  if (score < 90) return locale === 'ar' ? 'جيد' : 'Proficient';
  return locale === 'ar' ? 'متقن' : 'Mastered';
}

const SummaryCard: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }> = ({
  label, value, sub, color, icon,
}) => (
  <div className={`flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

export const TeacherSkillMapPage: React.FC = () => {
  const { locale, dir } = useI18n();
  const [selectedClass, setSelectedClass] = useState('3A');
  const [filterSubject, setFilterSubject] = useState('all');

  const students = useMemo(() => getStudentsInClass(selectedClass), [selectedClass]);
  const alerts = useMemo(() => getClassAlerts(selectedClass), [selectedClass]);

  // Filter KCs by subject if selected
  const visibleKCs = useMemo(() => {
    if (filterSubject === 'all') return TRACKED_KCS;
    return TRACKED_KCS.filter(kc => getKCSubject(kc) === filterSubject);
  }, [filterSubject]);

  // Summary stats
  const stats = useMemo(() => {
    if (students.length === 0) return { avg: 0, struggling: 0, mastered: 0 };
    const allScores = students.flatMap(s => TRACKED_KCS.map(kc => s.masteries[kc] ?? 0));
    const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    const struggling = students.filter(s =>
      TRACKED_KCS.filter(kc => (s.masteries[kc] ?? 0) < 40).length > TRACKED_KCS.length * 0.4
    ).length;
    const mastered = students.filter(s =>
      TRACKED_KCS.filter(kc => (s.masteries[kc] ?? 0) >= 90).length >= 3
    ).length;
    return { avg, struggling, mastered };
  }, [students]);

  const isRtl = dir === 'rtl';

  return (
    <div className="p-6 md:p-8 space-y-6 pb-20 font-['Cairo']">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-500" />
          {locale === 'ar' ? 'خريطة مهارات الفصل' : 'Class Skill Map'}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          {locale === 'ar' ? 'عرض إتقان كل طالب لكل مهارة (KC)' : 'Per-student KC mastery heatmap'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Class selector */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm cursor-pointer"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            {MOCK_CLASSES.map(cls => (
              <option key={cls.id} value={cls.id}>
                {locale === 'ar' ? cls.nameAr : cls.nameEn}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Subject filter */}
        <div className="relative">
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm cursor-pointer"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            <option value="all">{locale === 'ar' ? 'كل المواد' : 'All Subjects'}</option>
            {TRACKED_SUBJECTS.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 ml-auto text-xs font-bold text-slate-500">
          {[
            { color: 'bg-green-600', label: locale === 'ar' ? 'متقن' : 'Mastered' },
            { color: 'bg-green-400', label: locale === 'ar' ? 'جيد' : 'Proficient' },
            { color: 'bg-amber-400', label: locale === 'ar' ? 'نامٍ' : 'Developing' },
            { color: 'bg-red-400',   label: locale === 'ar' ? 'ضعيف' : 'Weak' },
            { color: 'bg-slate-200', label: locale === 'ar' ? 'لم يبدأ' : 'Not started' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label={locale === 'ar' ? 'متوسط الإتقان' : 'Class Avg Mastery'}
          value={`${stats.avg}%`}
          color="bg-blue-50 text-blue-600"
          icon={<BrainCircuit className="w-6 h-6" />}
        />
        <SummaryCard
          label={locale === 'ar' ? 'طلاب يحتاجون مساعدة' : 'Need Support'}
          value={stats.struggling}
          sub={locale === 'ar' ? 'أداء ضعيف في +40% من المهارات' : 'Weak in 40%+ of KCs'}
          color="bg-rose-50 text-rose-500"
          icon={<TrendingDown className="w-6 h-6" />}
        />
        <SummaryCard
          label={locale === 'ar' ? 'مهارات مكتملة' : 'KCs Mastered (≥3)'}
          value={stats.mastered}
          sub={locale === 'ar' ? 'أتقنوا 3+ مهارات' : 'Students with 3+ mastered KCs'}
          color="bg-green-50 text-green-600"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
      </div>

      {/* Alert Banners */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <motion.div
              key={alert.kcCode}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-800">
                {locale === 'ar'
                  ? `تنبيه: ${alert.pct}% من الطلاب لديهم ضعف في مهارة "${getKCName(alert.kcCode, 'ar')}"`
                  : `Alert: ${alert.pct}% of students are struggling with "${getKCName(alert.kcCode, 'en')}"`
                }
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Heatmap Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {/* Sticky student name column */}
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left font-black text-slate-600 min-w-[160px] border-r border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {locale === 'ar' ? 'الطالب' : 'Student'}
                  </div>
                </th>
                {visibleKCs.map(kc => (
                  <th key={kc} className="px-2 py-3 text-center font-bold text-slate-500 text-xs min-w-[80px]">
                    <div className="truncate max-w-[76px] mx-auto" title={getKCName(kc, locale)}>
                      {getKCName(kc, locale)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[76px] mx-auto">
                      {getKCSubject(kc)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                >
                  {/* Student name (sticky) */}
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-slate-100 font-bold text-slate-700 text-xs whitespace-nowrap">
                    {locale === 'ar' ? student.nameAr : student.nameEn}
                  </td>

                  {/* KC mastery cells */}
                  {visibleKCs.map(kc => {
                    const score = student.masteries[kc] ?? 0;
                    const colorClass = getMasteryColor(score);
                    const label = getMasteryLabel(score, locale);
                    return (
                      <td key={kc} className="px-2 py-2 text-center">
                        <div
                          className={`group relative w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-xs font-black cursor-default transition-transform hover:scale-110 ${colorClass}`}
                          title={`${locale === 'ar' ? student.nameAr : student.nameEn} — ${getKCName(kc, locale)}: ${score}% (${label})`}
                        >
                          {score > 0 ? score : '–'}
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {score}% — {label}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-bold">{locale === 'ar' ? 'لا يوجد طلاب في هذا الفصل' : 'No students in this class'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSkillMapPage;
