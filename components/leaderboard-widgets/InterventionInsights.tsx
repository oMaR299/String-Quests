import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, Award, Activity, ExternalLink } from 'lucide-react';
import { SUBJECT_UNITS, type StudentProfile } from '../../data/complexLeaderboardData';

interface InterventionInsightsProps {
  subject: string;
  students: StudentProfile[];
  locale?: 'ar' | 'en';
}

type InsightType = 'critical' | 'warning' | 'info' | 'success';

interface Insight {
  id: string;
  type: InsightType;
  icon: React.ElementType;
  message: string;
}

const SUBJECT_AR: Record<string, string> = {
  math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', history: 'التاريخ',
  arts: 'الفنون', islamic: 'التربية الإسلامية', social: 'الاجتماعيات',
  physics: 'الفيزياء', chemistry: 'الكيمياء', biology: 'الأحياء',
  computer: 'الحاسوب', english: 'الإنجليزي',
};

const UNIT_AR: Record<string, string> = {
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
  vocabulary: 'المفردات', reading: 'القراءة', speaking: 'المحادثة',
};

const TEACHER_NAMES = [
  'أ. أحمد المحمد', 'أ. سارة العلي', 'أ. خالد يوسف', 'أ. فاطمة حسن',
  'أ. عمر الفاروق', 'أ. ليلى سمير', 'أ. ياسر القحطاني', 'أ. نورة السعد',
];

const TYPE_STYLES: Record<InsightType, { border: string; iconColor: string; bg: string }> = {
  critical: { border: 'border-l-red-500', iconColor: 'text-red-500', bg: 'bg-red-50/40' },
  warning:  { border: 'border-l-amber-500', iconColor: 'text-amber-500', bg: 'bg-amber-50/40' },
  info:     { border: 'border-l-blue-500', iconColor: 'text-blue-500', bg: 'bg-blue-50/40' },
  success:  { border: 'border-l-emerald-500', iconColor: 'text-emerald-500', bg: 'bg-emerald-50/40' },
};

const TYPE_PRIORITY: Record<InsightType, number> = { critical: 0, warning: 1, info: 2, success: 3 };

export function InterventionInsights({
  subject,
  students,
  locale = 'ar',
}: InterventionInsightsProps) {
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const subjectName = SUBJECT_AR[subject] ?? subject;

  const units = useMemo(
    () => SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] ?? [],
    [subject],
  );

  const insights = useMemo(() => {
    const result: Insight[] = [];
    const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // 1. Declining grade — monthly vs all-time
    let biggestDeclineGrade = -1;
    let biggestDeclinePct = 0;
    for (const grade of grades) {
      const gs = students.filter(s => s.grade === grade);
      if (gs.length === 0) continue;
      const avgMonthly = gs.reduce((a, s) => a + s.timeframeScores.monthly, 0) / gs.length;
      const avgAllTime = gs.reduce((a, s) => a + s.timeframeScores['all-time'], 0) / gs.length;
      if (avgAllTime === 0) continue;
      // Normalize: monthly should be ~30% of all-time by design, so compare ratio
      const expectedMonthly = avgAllTime * 0.3;
      const diffPct = Math.round(((expectedMonthly - avgMonthly) / expectedMonthly) * 100);
      if (diffPct > 5 && diffPct > biggestDeclinePct) {
        biggestDeclinePct = diffPct;
        biggestDeclineGrade = grade;
      }
    }
    if (biggestDeclineGrade > 0) {
      result.push({
        id: 'declining',
        type: 'warning',
        icon: TrendingDown,
        message: t(
          `الصف ${biggestDeclineGrade} أظهر انخفاضاً بنسبة ${biggestDeclinePct}% في ${subjectName} مقارنة بالشهر الماضي`,
          `Grade ${biggestDeclineGrade} showed a ${biggestDeclinePct}% decline in ${subject} compared to last month`,
        ),
      });
    }

    // 2. Struggling unit — lowest avg accuracy, if < 65%
    let worstUnit = '';
    let worstAcc = 100;
    let belowThresholdCount = 0;
    let totalForWorst = 0;
    for (const unit of units) {
      const key = `${subject}-${unit}`;
      const accs = students
        .map(s => s.lessonDetails[key]?.accuracy)
        .filter((v): v is number => v !== undefined && v > 0);
      if (accs.length === 0) continue;
      const avg = accs.reduce((a, b) => a + b, 0) / accs.length;
      if (avg < worstAcc) {
        worstAcc = avg;
        worstUnit = unit;
        belowThresholdCount = accs.filter(v => v < 60).length;
        totalForWorst = accs.length;
      }
    }
    if (worstAcc < 65 && worstUnit) {
      const pct = totalForWorst > 0 ? Math.round((belowThresholdCount / totalForWorst) * 100) : 0;
      result.push({
        id: 'struggling-unit',
        type: 'critical',
        icon: AlertTriangle,
        message: t(
          `${pct}% من الطلاب يحققون أقل من 60% في وحدة ${UNIT_AR[worstUnit] ?? worstUnit}`,
          `${pct}% of students score below 60% in the ${worstUnit} unit`,
        ),
      });
    }

    // 3. Top teacher (simulated — pick grade with highest accuracy, assign teacher name)
    let topGrade = -1;
    let topAcc = 0;
    for (const grade of grades) {
      const gs = students.filter(s => s.grade === grade);
      if (gs.length === 0) continue;
      const accs = gs
        .map(s => s.subjectDetails[subject as keyof typeof s.subjectDetails]?.accuracy)
        .filter((v): v is number => v !== undefined && v > 0);
      if (accs.length === 0) continue;
      const avg = Math.round(accs.reduce((a, b) => a + b, 0) / accs.length);
      if (avg > topAcc) {
        topAcc = avg;
        topGrade = grade;
      }
    }
    if (topGrade > 0) {
      const teacherName = TEACHER_NAMES[(topGrade - 1) % TEACHER_NAMES.length];
      result.push({
        id: 'top-teacher',
        type: 'success',
        icon: Award,
        message: t(
          `${teacherName} تحقق أعلى معدل دقة (${topAcc}%) مقارنة بمعلمي ${subjectName} الآخرين`,
          `${teacherName} achieves the highest accuracy rate (${topAcc}%) compared to other ${subject} teachers`,
        ),
      });
    }

    // 4. Improving grade — biggest positive trend (most 'up' students)
    let bestImpGrade = -1;
    let bestImpScore = 0;
    for (const grade of grades) {
      const gs = students.filter(s => s.grade === grade);
      if (gs.length === 0) continue;
      const upCount = gs.filter(s => s.trend === 'up').length;
      const ratio = upCount / gs.length;
      if (ratio > bestImpScore) {
        bestImpScore = ratio;
        bestImpGrade = grade;
      }
    }
    if (bestImpGrade > 0 && bestImpScore > 0.3) {
      const improvePct = Math.round(bestImpScore * 100);
      result.push({
        id: 'improving',
        type: 'success',
        icon: TrendingUp,
        message: t(
          `الصف ${bestImpGrade} أظهر تحسناً ملحوظاً (+${improvePct}%) في ${subjectName}`,
          `Grade ${bestImpGrade} showed notable improvement (+${improvePct}%) in ${subject}`,
        ),
      });
    }

    // 5. Low engagement — grade with lowest avg XP
    let lowEngGrade = -1;
    let lowEngXp = Infinity;
    for (const grade of grades) {
      const gs = students.filter(s => s.grade === grade);
      if (gs.length === 0) continue;
      const avgXp = gs.reduce((a, s) => a + (s.subjectXp[subject as keyof typeof s.subjectXp] ?? 0), 0) / gs.length;
      if (avgXp < lowEngXp) {
        lowEngXp = avgXp;
        lowEngGrade = grade;
      }
    }
    if (lowEngGrade > 0) {
      result.push({
        id: 'low-engagement',
        type: 'info',
        icon: Activity,
        message: t(
          `الصف ${lowEngGrade} يسجل أقل معدل نشاط في ${subjectName} — قد يحتاج تحفيز إضافي`,
          `Grade ${lowEngGrade} has the lowest activity in ${subject} — may need extra motivation`,
        ),
      });
    }

    // Sort by severity
    result.sort((a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]);
    return result.slice(0, 6);
  }, [students, subject, units, subjectName, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 font-[Cairo]">
          {t('رؤى وتوصيات', 'Insights & Recommendations')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 font-[Cairo]">
          {t('تنبيهات ذكية مبنية على تحليل البيانات', 'Smart alerts generated from data analysis')}
        </p>
      </div>

      {/* Insight cards */}
      <div className="p-4 space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 font-[Cairo]">
              {t('لا توجد تنبيهات حالياً', 'No insights currently')}
            </p>
          </div>
        ) : (
          insights.map((insight, idx) => {
            const style = TYPE_STYLES[insight.type];
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: locale === 'ar' ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border border-l-4 ${style.border} border-slate-100 ${style.bg} cursor-pointer transition-shadow`}
              >
                <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-[Cairo] leading-relaxed">
                    {insight.message}
                  </p>
                  <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 font-[Cairo] transition-colors">
                    {t('عرض التفاصيل', 'View Details')}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default InterventionInsights;
