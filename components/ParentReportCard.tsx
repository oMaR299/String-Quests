import React from 'react';
import { Printer, Star, TrendingUp, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { MockStudent, TRACKED_KCS, getKCName, getKCSubject } from '../data/mockSchoolData';
import { MOCK_CLASSES } from '../data/mockSchoolData';

interface ParentReportCardProps {
  student: MockStudent;
  locale: 'ar' | 'en';
}

// Group KCs by subject and compute subject avg
function getSubjectProgress(student: MockStudent, locale: 'ar' | 'en'): { subject: string; avg: number; kcCount: number }[] {
  const bySubject: Record<string, number[]> = {};
  for (const kc of TRACKED_KCS) {
    const subj = getKCSubject(kc);
    if (!subj) continue;
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(student.masteries[kc] ?? 0);
  }
  return Object.entries(bySubject).map(([subject, scores]) => ({
    subject,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    kcCount: scores.length,
  })).sort((a, b) => b.avg - a.avg);
}

// Top 5 strongest and weakest KCs
function getTopBottom(student: MockStudent, locale: 'ar' | 'en') {
  const sorted = TRACKED_KCS
    .filter(kc => (student.masteries[kc] ?? 0) > 0)
    .map(kc => ({ kc, score: student.masteries[kc] ?? 0, name: getKCName(kc, locale) }))
    .sort((a, b) => b.score - a.score);
  return {
    top: sorted.slice(0, 5),
    bottom: sorted.slice(-5).reverse(),
  };
}

function getProgressBarColor(avg: number): string {
  if (avg >= 90) return 'bg-green-500';
  if (avg >= 70) return 'bg-green-400';
  if (avg >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function getOverallGrade(avg: number, locale: 'ar' | 'en'): string {
  if (avg >= 90) return locale === 'ar' ? 'ممتاز' : 'Excellent';
  if (avg >= 75) return locale === 'ar' ? 'جيد جداً' : 'Very Good';
  if (avg >= 60) return locale === 'ar' ? 'جيد' : 'Good';
  if (avg >= 40) return locale === 'ar' ? 'مقبول' : 'Acceptable';
  return locale === 'ar' ? 'يحتاج دعماً' : 'Needs Support';
}

export const ParentReportCard: React.FC<ParentReportCardProps> = ({ student, locale }) => {
  const isRtl = locale === 'ar';
  const cls = MOCK_CLASSES.find(c => c.id === student.classId);
  const subjectProgress = getSubjectProgress(student, locale);
  const { top, bottom } = getTopBottom(student, locale);
  const allScores = Object.values(student.masteries) as number[];
  const overallAvg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="bg-white min-h-screen font-['Cairo'] text-slate-800"
      style={{ maxWidth: '794px', margin: '0 auto' }}
    >
      {/* Print Button (hidden in print) */}
      <div className="flex justify-end p-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
        >
          <Printer className="w-4 h-4" />
          {locale === 'ar' ? 'طباعة التقرير' : 'Print Report'}
        </button>
      </div>

      <div className="px-8 pb-12 space-y-8">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-100 pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">
            {locale === 'ar' ? 'مدارس الخضر الحديثة' : 'Al-Khadr Modern Schools'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {locale === 'ar' ? 'تقرير أداء الطالب' : 'Student Progress Report'}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                {locale === 'ar' ? 'اسم الطالب' : 'Student'}
              </p>
              <p className="font-black text-slate-800 text-sm">
                {locale === 'ar' ? student.nameAr : student.nameEn}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                {locale === 'ar' ? 'الفصل' : 'Class'}
              </p>
              <p className="font-black text-slate-800 text-sm">
                {cls ? (locale === 'ar' ? cls.nameAr : cls.nameEn) : student.classId}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                {locale === 'ar' ? 'التاريخ' : 'Date'}
              </p>
              <p className="font-black text-slate-800 text-sm">{today}</p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="flex items-center gap-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100">
          {/* Ring */}
          <div className="shrink-0 relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={overallAvg >= 70 ? '#22c55e' : overallAvg >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                strokeDasharray={`${overallAvg * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-slate-800">{overallAvg}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              {locale === 'ar' ? 'التقدير العام' : 'Overall Grade'}
            </p>
            <p className="text-3xl font-black text-slate-800">{getOverallGrade(overallAvg, locale)}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {locale === 'ar'
                ? `إتقان ${overallAvg}% من المهارات المقيّمة`
                : `${overallAvg}% mastery across assessed skills`}
            </p>
          </div>
        </div>

        {/* This Week Section */}
        {student.weeklySkills.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              {locale === 'ar' ? 'هذا الأسبوع تعلم ابنك/ابنتك:' : 'This week your child learned:'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {student.weeklySkills.map(kc => (
                <span
                  key={kc}
                  className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold px-3 py-1.5 rounded-full"
                >
                  {getKCName(kc, locale)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subject Progress */}
        <div>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {locale === 'ar' ? 'التقدم في المواد الدراسية' : 'Progress by Subject'}
          </h2>
          <div className="space-y-4">
            {subjectProgress.map(({ subject, avg, kcCount }) => (
              <div key={subject}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-700">{subject}</span>
                  <span className="text-sm font-black text-slate-600">
                    {avg}%
                    <span className="text-xs font-medium text-slate-400 ml-1">
                      ({kcCount} {locale === 'ar' ? 'مهارة' : 'skills'})
                    </span>
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressBarColor(avg)}`}
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {locale === 'ar' ? 'نقاط القوة (أفضل 5 مهارات)' : 'Strengths (Top 5 Skills)'}
            </h2>
            <div className="space-y-2">
              {top.map(({ kc, score, name }) => (
                <div key={kc} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-bold text-green-800">{name}</span>
                  <span className="text-sm font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 Needs Practice */}
          <div>
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {locale === 'ar' ? 'يحتاج إلى تدريب (5 مهارات)' : 'Needs Practice (5 Skills)'}
            </h2>
            <div className="space-y-2">
              {bottom.map(({ kc, score, name }) => (
                <div key={kc} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-bold text-amber-800">{name}</span>
                  <span className="text-sm font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Encouragement Footer */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white text-center print:bg-slate-100 print:text-slate-800">
          <p className="font-black text-lg mb-1">
            {locale === 'ar' ? 'رسالة للمعلم والوالدين' : 'A Note to Parents & Teacher'}
          </p>
          <p className="text-sm font-medium opacity-90">
            {locale === 'ar'
              ? 'هذا التقرير يعكس أداء ابنك/ابنتك في الألعاب التعليمية. استخدموه كمحادثة مفتوحة عن التعلم — وليس كحكم نهائي.'
              : "This report reflects your child's performance in educational quests. Use it to open conversations about learning — not as a final judgment."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentReportCard;
