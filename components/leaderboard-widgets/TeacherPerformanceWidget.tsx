import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronDown, Users, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  type StudentProfile,
  type League,
  type Subject,
} from '../../data/complexLeaderboardData';

interface TeacherPerformanceWidgetProps {
  locale?: 'ar' | 'en';
  className?: string;
}

const TEACHER_NAMES = [
  'أ. أحمد المحمد', 'أ. سارة العلي', 'أ. خالد يوسف', 'أ. فاطمة حسن', 'أ. عمر الفاروق',
  'أ. ليلى سمير', 'أ. ياسر القحطاني', 'أ. نورة السعد', 'أ. محمود عباس', 'أ. رنا البيطار',
  'أ. سعيد الغامدي', 'أ. هدى العمري',
];

const SUBJECT_LABELS: Record<string, { ar: string; en: string }> = {
  math: { ar: 'رياضيات', en: 'Math' },
  science: { ar: 'علوم', en: 'Science' },
  languages: { ar: 'لغات', en: 'Languages' },
  history: { ar: 'تاريخ', en: 'History' },
  arts: { ar: 'فنون', en: 'Arts' },
  islamic: { ar: 'تربية إسلامية', en: 'Islamic' },
  social: { ar: 'اجتماعيات', en: 'Social' },
  physics: { ar: 'فيزياء', en: 'Physics' },
  chemistry: { ar: 'كيمياء', en: 'Chemistry' },
  biology: { ar: 'أحياء', en: 'Biology' },
  computer: { ar: 'حاسوب', en: 'Computer' },
  english: { ar: 'إنجليزي', en: 'English' },
};

const SECTION_AR: Record<string, string> = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };
const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
  'from-red-500 to-orange-500',
  'from-teal-500 to-emerald-500',
  'from-amber-500 to-yellow-500',
];

const LEAGUE_ORDER: League[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

interface TeacherData {
  id: string;
  name: string;
  className: string;
  classNameEn: string;
  grade: number | string;
  section: string;
  subject: Exclude<Subject, 'all'>;
  students: StudentProfile[];
  studentCount: number;
  avgXp: number;
  avgAccuracy: number;
  topStudent: StudentProfile;
  bottomStudents: StudentProfile[];
  topStudents: StudentProfile[];
  leagueDistribution: Record<League, number>;
  starRating: number;
  gradientIdx: number;
}

function getAvgAccuracy(students: StudentProfile[]): number {
  if (students.length === 0) return 0;
  const allSubjects = Object.keys(SUBJECT_LABELS) as Exclude<Subject, 'all'>[];
  const accs = students.map((s) => {
    let total = 0;
    let count = 0;
    allSubjects.forEach((subj) => {
      if (s.subjectDetails[subj] && s.subjectDetails[subj].accuracy > 0) {
        total += s.subjectDetails[subj].accuracy;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  });
  return Math.round(accs.reduce((a, b) => a + b, 0) / accs.length);
}

function starRating(accuracy: number): number {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 4;
  if (accuracy >= 70) return 3;
  if (accuracy >= 60) return 2;
  return 1;
}

export function TeacherPerformanceWidget({
  locale = 'ar',
  className = '',
}: TeacherPerformanceWidgetProps) {
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';

  const teachers = useMemo<TeacherData[]>(() => {
    const grouped: Record<string, StudentProfile[]> = {};
    MOCK_SCHOOL_DATA.forEach((s) => {
      const key = `${s.grade}-${s.section}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    const subjectKeys = Object.keys(SUBJECT_LABELS) as Exclude<Subject, 'all'>[];
    let idx = 0;

    return Object.entries(grouped)
      .map(([key, students]) => {
        const [gradeStr, section] = key.split('-');
        const grade = isNaN(Number(gradeStr)) ? gradeStr : Number(gradeStr);
        const sorted = [...students].sort((a, b) => b.totalXp - a.totalXp);
        const avgXp = Math.round(students.reduce((s, st) => s + st.totalXp, 0) / students.length);
        const avgAcc = getAvgAccuracy(students);
        const leagueDist: Record<League, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
        students.forEach((s) => leagueDist[s.league]++);

        const teacherIdx = idx % TEACHER_NAMES.length;
        const subjectIdx = idx % subjectKeys.length;
        const gradIdx = idx % AVATAR_GRADIENTS.length;
        idx++;

        const sectionAr = SECTION_AR[section] || section;

        return {
          id: key,
          name: TEACHER_NAMES[teacherIdx],
          className: `الصف ${grade}${sectionAr}`,
          classNameEn: `Grade ${grade}${section}`,
          grade,
          section,
          subject: subjectKeys[subjectIdx],
          students,
          studentCount: students.length,
          avgXp,
          avgAccuracy: avgAcc,
          topStudent: sorted[0],
          topStudents: sorted.slice(0, 3),
          bottomStudents: sorted.slice(-3).reverse(),
          leagueDistribution: leagueDist,
          starRating: starRating(avgAcc),
          gradientIdx: gradIdx,
        };
      })
      .sort((a, b) => {
        const scoreA = a.avgXp * 0.5 + a.avgAccuracy * 100;
        const scoreB = b.avgXp * 0.5 + b.avgAccuracy * 100;
        return scoreB - scoreA;
      });
  }, []);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const maxAvgXp = Math.max(...teachers.map((t) => t.avgXp), 1);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm font-['Cairo'] ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-black text-slate-900">{t('أداء المعلمين', 'Teacher Performance')}</h2>
        <span className="text-xs text-slate-400 mr-auto">{teachers.length} {t('معلم', 'teachers')}</span>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[2.5rem_1fr_6rem_5rem_8rem_5rem_5.5rem] gap-2 px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100">
        <span>#</span>
        <span>{t('المعلم', 'Teacher')}</span>
        <span>{t('الصف', 'Class')}</span>
        <span>{t('طلاب', 'Students')}</span>
        <span>{t('متوسط XP', 'Avg XP')}</span>
        <span>{t('الدقة', 'Accuracy')}</span>
        <span>{t('التقييم', 'Rating')}</span>
      </div>

      {/* Teacher rows */}
      <div className="divide-y divide-slate-50">
        {teachers.map((teacher, i) => {
          const isExpanded = expandedId === teacher.id;
          const initials = teacher.name.replace('أ. ', '').slice(0, 2);

          return (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : teacher.id)}
                className="w-full grid grid-cols-1 md:grid-cols-[2.5rem_1fr_6rem_5rem_8rem_5rem_5.5rem] gap-2 items-center px-3 py-3 hover:bg-slate-50/70 transition-colors rounded-lg text-start"
              >
                {/* Rank */}
                <span className={`text-sm font-black ${i < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {i + 1}
                </span>

                {/* Teacher info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[teacher.gradientIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{teacher.name}</p>
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-semibold">
                      {SUBJECT_LABELS[teacher.subject]?.[locale] || teacher.subject}
                    </span>
                  </div>
                </div>

                {/* Class */}
                <span className="text-xs font-semibold text-slate-600">
                  {isRTL ? teacher.className : teacher.classNameEn}
                </span>

                {/* Student count */}
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{teacher.studentCount}</span>
                </div>

                {/* Avg XP bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(teacher.avgXp / maxAvgXp) * 100}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 w-12 text-end">
                    {teacher.avgXp.toLocaleString()}
                  </span>
                </div>

                {/* Accuracy circle */}
                <div className="flex items-center justify-center">
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={teacher.avgAccuracy >= 80 ? '#22c55e' : teacher.avgAccuracy >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 14 * (1 - teacher.avgAccuracy / 100) }}
                      transition={{ delay: i * 0.04 + 0.3, duration: 0.6 }}
                      transform="rotate(-90 18 18)"
                    />
                    <text x="18" y="20" textAnchor="middle" className="text-[9px] font-bold fill-slate-700">
                      {teacher.avgAccuracy}%
                    </text>
                  </svg>
                </div>

                {/* Star rating + expand arrow */}
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3.5 h-3.5 ${si < teacher.starRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Top 3 students */}
                      <div className="bg-emerald-50/60 rounded-xl p-3">
                        <h4 className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {t('أفضل 3 طلاب', 'Top 3 Students')}
                        </h4>
                        <div className="space-y-1.5">
                          {teacher.topStudents.map((s, si) => (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              <span className="w-4 text-emerald-500 font-bold">{si + 1}</span>
                              <span className="font-semibold text-slate-700 truncate flex-1">{s.name}</span>
                              <span className="text-emerald-600 font-bold">{s.totalXp.toLocaleString()} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom 3 students */}
                      <div className="bg-red-50/60 rounded-xl p-3">
                        <h4 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {t('أقل 3 طلاب', 'Bottom 3 Students')}
                        </h4>
                        <div className="space-y-1.5">
                          {teacher.bottomStudents.map((s, si) => (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              <span className="w-4 text-red-400 font-bold">{si + 1}</span>
                              <span className="font-semibold text-slate-700 truncate flex-1">{s.name}</span>
                              <span className="text-red-500 font-bold">{s.totalXp.toLocaleString()} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* League distribution */}
                      <div className="bg-slate-50/80 rounded-xl p-3">
                        <h4 className="text-xs font-bold text-slate-600 mb-2">
                          {t('توزيع الدوريات', 'League Distribution')}
                        </h4>
                        <div className="space-y-1">
                          {LEAGUE_ORDER.map((league) => {
                            const count = teacher.leagueDistribution[league];
                            if (count === 0) return null;
                            const leagueColors: Record<League, string> = {
                              diamond: 'bg-cyan-400',
                              platinum: 'bg-slate-400',
                              gold: 'bg-amber-400',
                              silver: 'bg-gray-300',
                              bronze: 'bg-orange-400',
                            };
                            const leagueNames: Record<League, { ar: string; en: string }> = {
                              diamond: { ar: 'الماسي', en: 'Diamond' },
                              platinum: { ar: 'البلاتيني', en: 'Platinum' },
                              gold: { ar: 'الذهبي', en: 'Gold' },
                              silver: { ar: 'الفضي', en: 'Silver' },
                              bronze: { ar: 'البرونزي', en: 'Bronze' },
                            };
                            return (
                              <div key={league} className="flex items-center gap-2 text-[11px]">
                                <div className={`w-2.5 h-2.5 rounded-full ${leagueColors[league]}`} />
                                <span className="text-slate-600 flex-1">{leagueNames[league][locale]}</span>
                                <span className="font-bold text-slate-700">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subject breakdown */}
                      <div className="md:col-span-3 bg-blue-50/40 rounded-xl p-3">
                        <h4 className="text-xs font-bold text-blue-700 mb-2">
                          {t('أداء المواد', 'Subject Breakdown')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(SUBJECT_LABELS) as Exclude<Subject, 'all'>[]).map((subj) => {
                            const studentsWithSubj = teacher.students.filter(
                              (s) => s.subjectDetails[subj] && s.subjectDetails[subj].accuracy > 0
                            );
                            if (studentsWithSubj.length === 0) return null;
                            const avgAcc = Math.round(
                              studentsWithSubj.reduce((sum, s) => sum + s.subjectDetails[subj].accuracy, 0) /
                                studentsWithSubj.length
                            );
                            const color =
                              avgAcc >= 80 ? 'text-emerald-600 bg-emerald-50' : avgAcc >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
                            return (
                              <span key={subj} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${color}`}>
                                {SUBJECT_LABELS[subj][locale]} {avgAcc}%
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherPerformanceWidget;
