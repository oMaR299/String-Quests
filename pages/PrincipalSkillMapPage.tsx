import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, Trophy, BarChart3, Users } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import {
  MOCK_CLASSES,
  TRACKED_KCS,
  TRACKED_SUBJECTS,
  getClassAvgMastery,
  getSchoolAvgMastery,
  getKCName,
  getKCSubject,
} from '../data/mockSchoolData';

// Per-subject school average
function getSubjectSchoolAvg(subject: string): number {
  const kcsForSubject = TRACKED_KCS.filter(kc => getKCSubject(kc) === subject);
  if (kcsForSubject.length === 0) return 0;
  const classAvgs = MOCK_CLASSES.map(cls =>
    Math.round(kcsForSubject.reduce((sum, kc) => sum + getClassAvgMastery(cls.id, kc), 0) / kcsForSubject.length)
  );
  return Math.round(classAvgs.reduce((a, b) => a + b, 0) / classAvgs.length);
}

function getMasteryBg(score: number): string {
  if (score >= 90) return 'bg-green-600 text-white';
  if (score >= 70) return 'bg-green-400 text-white';
  if (score >= 40) return 'bg-amber-400 text-white';
  if (score > 0) return 'bg-red-400 text-white';
  return 'bg-slate-100 text-slate-400';
}

function getMasteryBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

const KPICard: React.FC<{ label: string; value: string; sub?: string; icon: React.ReactNode; color: string }> = ({
  label, value, sub, icon, color,
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-black text-slate-800 truncate">{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5 truncate">{sub}</div>}
    </div>
  </div>
);

const PrincipalSkillMapPage: React.FC = () => {
  const { locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  // School-wide stats
  const schoolAvg = useMemo(() => getSchoolAvgMastery(), []);

  const bestClass = useMemo(() => {
    return MOCK_CLASSES.map(cls => ({ cls, avg: getClassAvgMastery(cls.id) }))
      .sort((a, b) => b.avg - a.avg)[0];
  }, []);

  const subjectAvgs = useMemo(() =>
    TRACKED_SUBJECTS.map(subj => ({ subject: subj, avg: getSubjectSchoolAvg(subj) }))
      .sort((a, b) => a.avg - b.avg),
    []
  );

  const weakSubjects = subjectAvgs.filter(s => s.avg < 60);
  const classAvgs = useMemo(() =>
    MOCK_CLASSES.map(cls => ({ cls, avg: getClassAvgMastery(cls.id) })),
    []
  );

  // KCs at risk school-wide (avg < 50)
  const kcsAtRisk = useMemo(() =>
    TRACKED_KCS
      .map(kc => ({ kc, avg: getSchoolAvgMastery(kc) }))
      .filter(x => x.avg < 50)
      .sort((a, b) => a.avg - b.avg),
    []
  );

  return (
    <div className="p-6 md:p-8 space-y-8 pb-20 font-['Cairo']">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-emerald-500" />
          {locale === 'ar' ? 'خريطة المهارات المدرسية' : 'School-Wide Skill Map'}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          {locale === 'ar' ? 'نظرة شاملة على مستوى إتقان المهارات في المدرسة' : 'School-wide KC mastery overview across all classes'}
        </p>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={locale === 'ar' ? 'متوسط الإتقان' : 'School Avg Mastery'}
          value={`${schoolAvg}%`}
          sub={locale === 'ar' ? 'عبر جميع الفصول والمهارات' : 'Across all classes & KCs'}
          color="bg-blue-50 text-blue-600"
          icon={<BrainCircuit className="w-6 h-6" />}
        />
        <KPICard
          label={locale === 'ar' ? 'أفضل فصل' : 'Best Performing Class'}
          value={bestClass.cls.id}
          sub={`${bestClass.avg}% ${locale === 'ar' ? 'متوسط إتقان' : 'avg mastery'}`}
          color="bg-green-50 text-green-600"
          icon={<Trophy className="w-6 h-6" />}
        />
        <KPICard
          label={locale === 'ar' ? 'مواد تحتاج تدخلاً' : 'Subjects Need Attention'}
          value={weakSubjects.length.toString()}
          sub={locale === 'ar' ? 'متوسط أقل من 60%' : 'Avg mastery below 60%'}
          color="bg-amber-50 text-amber-600"
          icon={<AlertTriangle className="w-6 h-6" />}
        />
        <KPICard
          label={locale === 'ar' ? 'مهارات بخطر' : 'KCs At Risk'}
          value={kcsAtRisk.length.toString()}
          sub={locale === 'ar' ? 'متوسط مدرسي أقل من 50%' : 'School avg below 50%'}
          color="bg-rose-50 text-rose-500"
          icon={<TrendingDown className="w-6 h-6" />}
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {(['classes', 'subjects'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'classes'
              ? (locale === 'ar' ? 'مقارنة الفصول' : 'Class Comparison')
              : (locale === 'ar' ? 'أداء المواد' : 'Subject Performance')
            }
          </button>
        ))}
      </div>

      {/* Class Comparison Table */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="font-black text-slate-800">
              {locale === 'ar' ? 'مقارنة الفصول — إتقان المهارات' : 'Class vs Class — KC Mastery'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-left font-black text-slate-600 min-w-[120px] border-r border-slate-100">
                    {locale === 'ar' ? 'الفصل' : 'Class'}
                  </th>
                  {TRACKED_SUBJECTS.map(subj => (
                    <th key={subj} className="px-3 py-3 text-center font-bold text-slate-500 text-xs min-w-[90px]">
                      {subj}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center font-black text-slate-600 text-xs min-w-[80px]">
                    {locale === 'ar' ? 'الإجمالي' : 'Overall'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CLASSES.map((cls, idx) => {
                  const overall = getClassAvgMastery(cls.id);
                  return (
                    <tr key={cls.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="sticky left-0 z-10 bg-white px-5 py-3 border-r border-slate-100 font-black text-slate-700 whitespace-nowrap">
                        <div>{cls.id}</div>
                        <div className="text-[11px] font-medium text-slate-400">
                          {locale === 'ar' ? cls.teacherNameAr : cls.teacherNameEn}
                        </div>
                      </td>
                      {TRACKED_SUBJECTS.map(subj => {
                        const kcsForSubj = TRACKED_KCS.filter(kc => getKCSubject(kc) === subj);
                        const avg = kcsForSubj.length > 0
                          ? Math.round(kcsForSubj.reduce((sum, kc) => sum + getClassAvgMastery(cls.id, kc), 0) / kcsForSubj.length)
                          : 0;
                        return (
                          <td key={subj} className="px-3 py-3 text-center">
                            <span className={`inline-block w-12 py-1 rounded-lg text-xs font-black ${getMasteryBg(avg)}`}>
                              {avg}%
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block w-14 py-1.5 rounded-lg text-sm font-black ${getMasteryBg(overall)}`}>
                          {overall}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Performance Bar Chart */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-black text-slate-800 flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              {locale === 'ar' ? 'أداء المواد (متوسط المدرسة)' : 'Subject Performance — School Average'}
            </h2>
            <div className="space-y-4">
              {[...subjectAvgs].reverse().map(({ subject, avg }, idx) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-700">{subject}</span>
                    <span className="text-sm font-black text-slate-600">{avg}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avg}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${getMasteryBarColor(avg)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KCs at risk */}
          {kcsAtRisk.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
              <h2 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                {locale === 'ar' ? 'مهارات بحاجة تدخل فوري (مدرسي < 50%)' : 'KCs Needing Urgent Attention (< 50% school-wide)'}
              </h2>
              <div className="space-y-2">
                {kcsAtRisk.map(({ kc, avg }) => (
                  <div key={kc} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                    <div>
                      <span className="font-bold text-rose-800 text-sm">{getKCName(kc, locale)}</span>
                      <span className="text-xs text-rose-500 ms-2">({getKCSubject(kc)})</span>
                    </div>
                    <span className="text-sm font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      {avg}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrincipalSkillMapPage;
