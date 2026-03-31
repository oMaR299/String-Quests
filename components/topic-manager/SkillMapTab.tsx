import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Users, TrendingUp, TrendingDown, BarChart3,
  GraduationCap, Building2, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  SUBJECT_UNITS,
  type StudentProfile,
  type Subject,
  type ClassSection,
} from '../../data/complexLeaderboardData';
import { ProgressRing, HorizontalBarChart } from '../admin-hub/attendance/SvgCharts';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

interface SkillMapTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)', color: '#3b82f6' },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor (Girls)', color: '#10b981' },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy', color: '#8b5cf6' },
];

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

const CAMPUS_SHORT: Record<string, { ar: string; en: string }> = {
  'camp-1': { ar: 'النور (بنين)', en: 'Noor (B)' },
  'camp-2': { ar: 'النور (بنات)', en: 'Noor (G)' },
  'camp-3': { ar: 'المستقبل', en: 'Future' },
};

interface SectionRow {
  section: ClassSection;
  campusId: string;
  label: string;
  studentCount: number;
  overallAccuracy: number;
  unitAccuracies: Record<string, number>;
}

/* ═══════════════════════════════════════════════════════════════
   Heatmap cell color
   ═══════════════════════════════════════════════════════════════ */

function cellColor(accuracy: number | null): { bg: string; text: string } {
  if (accuracy === null || accuracy === 0) return { bg: 'bg-slate-50', text: 'text-slate-400' };
  if (accuracy >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  if (accuracy >= 70) return { bg: 'bg-sky-100', text: 'text-sky-700' };
  if (accuracy >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-rose-100', text: 'text-rose-700' };
}

function campusColor(id: string): string {
  return CAMPUSES.find(c => c.id === id)?.color || '#94a3b8';
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function SkillMapTab({ subject, locale }: SkillMapTabProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [selectedGrade, setSelectedGrade] = useState<number>(1);

  const subj = subject as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[subj] || [];
  const unitLabel = (u: string) => isRtl ? (UNIT_LABELS_AR[u] || u) : u;

  /* ─── Compute section rows for the selected grade ─── */
  const sectionRows = useMemo((): SectionRow[] => {
    const gradeStudents = MOCK_SCHOOL_DATA.filter(st => st.grade === selectedGrade);
    const groups: Record<string, StudentProfile[]> = {};

    gradeStudents.forEach(st => {
      const key = `${st.section}-${st.campusId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(st);
    });

    return Object.entries(groups).map(([key, students]) => {
      const [section, campusId] = key.split('-') as [ClassSection, string];
      const campusShort = isRtl ? (CAMPUS_SHORT[campusId]?.ar || campusId) : (CAMPUS_SHORT[campusId]?.en || campusId);
      const label = isRtl ? `شعبة ${section} - ${campusShort}` : `Section ${section} - ${campusShort}`;

      const unitAccuracies: Record<string, number> = {};
      let totalAcc = 0;
      let unitCount = 0;

      units.forEach(unit => {
        const unitKey = `${subj}-${unit}`;
        const withData = students.filter(st => st.lessonDetails[unitKey]?.accuracy > 0);
        if (withData.length > 0) {
          const avg = Math.round(withData.reduce((s, st) => s + st.lessonDetails[unitKey].accuracy, 0) / withData.length);
          unitAccuracies[unit] = avg;
          totalAcc += avg;
          unitCount++;
        } else {
          unitAccuracies[unit] = 0;
        }
      });

      const overallAccuracy = unitCount > 0 ? Math.round(totalAcc / unitCount) : 0;

      return { section, campusId, label, studentCount: students.length, overallAccuracy, unitAccuracies };
    }).sort((a, b) => a.section.localeCompare(b.section) || a.campusId.localeCompare(b.campusId));
  }, [selectedGrade, subj, units, isRtl]);

  /* ─── Auto-generated insights ─── */
  const insights = useMemo(() => {
    if (sectionRows.length < 2) return [];
    const results: { type: 'success' | 'warning' | 'info'; text: string }[] = [];

    // Find best and worst section overall
    const best = sectionRows.reduce((a, b) => a.overallAccuracy > b.overallAccuracy ? a : b);
    const worst = sectionRows.reduce((a, b) => a.overallAccuracy < b.overallAccuracy ? a : b);

    if (best.overallAccuracy - worst.overallAccuracy > 5) {
      results.push({
        type: 'success',
        text: isRtl
          ? `${best.label} تتفوق بنسبة ${best.overallAccuracy - worst.overallAccuracy}% عن ${worst.label}`
          : `${best.label} leads by ${best.overallAccuracy - worst.overallAccuracy}% over ${worst.label}`,
      });
    }

    // Find unit where all sections struggle
    units.forEach(unit => {
      const accs = sectionRows.map(r => r.unitAccuracies[unit]).filter(a => a > 0);
      if (accs.length > 0) {
        const avg = Math.round(accs.reduce((s, a) => s + a, 0) / accs.length);
        if (avg < 68) {
          results.push({
            type: 'warning',
            text: isRtl
              ? `جميع الشعب تعاني في ${unitLabel(unit)} — المعدل العام ${avg}%`
              : `All sections struggle with ${unitLabel(unit)} — overall avg ${avg}%`,
          });
        }
      }
    });

    // Find standout: one section much better than others in a unit
    units.forEach(unit => {
      const entries = sectionRows.filter(r => r.unitAccuracies[unit] > 0);
      if (entries.length >= 2) {
        const unitBest = entries.reduce((a, b) => a.unitAccuracies[unit] > b.unitAccuracies[unit] ? a : b);
        const unitWorst = entries.reduce((a, b) => a.unitAccuracies[unit] < b.unitAccuracies[unit] ? a : b);
        const delta = unitBest.unitAccuracies[unit] - unitWorst.unitAccuracies[unit];
        if (delta >= 15) {
          results.push({
            type: 'info',
            text: isRtl
              ? `${unitBest.label} تتفوق في ${unitLabel(unit)} بفارق ${delta}% عن ${unitWorst.label}`
              : `${unitBest.label} excels at ${unitLabel(unit)} by ${delta}% over ${unitWorst.label}`,
          });
        }
      }
    });

    return results.slice(0, 5);
  }, [sectionRows, units, isRtl]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ─── Grade Selector Pills ─── */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
          <motion.button
            key={g}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedGrade(g)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedGrade === g
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {t(`الصف ${g}`, `Grade ${g}`)}
          </motion.button>
        ))}
      </div>

      {/* ─── Section x Unit Heatmap ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          {t(`خريطة المهارات — الصف ${selectedGrade}`, `Skill Map — Grade ${selectedGrade}`)}
        </h3>

        {sectionRows.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            {t('لا توجد بيانات لهذا الصف', 'No data for this grade')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-3 py-2 text-start text-slate-500 font-semibold whitespace-nowrap min-w-[160px]">
                    {t('الشعبة', 'Section')}
                  </th>
                  {units.map(unit => (
                    <th key={unit} className="px-2 py-2 text-center text-slate-500 font-semibold whitespace-nowrap">
                      {unitLabel(unit)}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-slate-500 font-semibold whitespace-nowrap">
                    {t('المعدل', 'Avg')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sectionRows.map((row, idx) => (
                    <motion.tr
                      key={row.label}
                      initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: campusColor(row.campusId) }}
                          />
                          <span className="font-semibold text-slate-700 whitespace-nowrap">{row.label}</span>
                          <span className="text-slate-400 text-[10px]">({row.studentCount})</span>
                        </div>
                      </td>
                      {units.map(unit => {
                        const acc = row.unitAccuracies[unit];
                        const style = cellColor(acc || null);
                        return (
                          <td key={unit} className="px-2 py-2.5 text-center">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.03 + 0.1 }}
                              className={`inline-flex items-center justify-center w-11 h-7 rounded-lg font-bold ${style.bg} ${style.text}`}
                            >
                              {acc > 0 ? `${acc}%` : '-'}
                            </motion.div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        <span className={`font-bold ${
                          row.overallAccuracy >= 80 ? 'text-emerald-600' : row.overallAccuracy >= 65 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {row.overallAccuracy > 0 ? `${row.overallAccuracy}%` : '-'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
          {[
            { label: '80%+', bg: 'bg-emerald-100', text: 'text-emerald-700' },
            { label: '70-79%', bg: 'bg-sky-100', text: 'text-sky-700' },
            { label: '60-69%', bg: 'bg-amber-100', text: 'text-amber-700' },
            { label: '<60%', bg: 'bg-rose-100', text: 'text-rose-700' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
              <div className={`w-4 h-3 rounded ${item.bg}`} />
              <span className="text-slate-500 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section Mastery Comparison (Progress Rings) ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-violet-500" />
          {t('إتقان الشعب', 'Section Mastery')}
        </h3>

        {sectionRows.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            {t('لا توجد بيانات', 'No data')}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {sectionRows.map((row, idx) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20">
                  <ProgressRing
                    value={row.overallAccuracy}
                    max={100}
                    size={80}
                    strokeWidth={7}
                    color={campusColor(row.campusId)}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-700 max-w-[100px] leading-tight">{row.label}</p>
                  <p className="text-[10px] text-slate-400">{row.studentCount} {t('طالب', 'students')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Unit Comparison Bars ─── */}
      {units.length > 0 && sectionRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {t('مقارنة الوحدات حسب الشعبة', 'Unit Comparison by Section')}
          </h3>

          <div className="space-y-5">
            {units.map((unit, uIdx) => {
              const entries = sectionRows.filter(r => r.unitAccuracies[unit] > 0);
              if (entries.length === 0) return null;
              return (
                <motion.div
                  key={unit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: uIdx * 0.06 }}
                >
                  <p className="text-xs font-semibold text-slate-600 mb-2">{unitLabel(unit)}</p>
                  <div className="space-y-1.5">
                    {entries.map(row => {
                      const acc = row.unitAccuracies[unit];
                      const color = campusColor(row.campusId);
                      return (
                        <div key={row.label} className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-500 w-32 truncate whitespace-nowrap">{row.label}</span>
                          <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${acc}%` }}
                              transition={{ duration: 0.6, delay: uIdx * 0.04 }}
                              style={{ backgroundColor: color }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-10 text-end">{acc}%</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Campus Legend */}
          <div className="flex items-center gap-4 mt-5 pt-3 border-t border-slate-100">
            {CAMPUSES.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-500 font-medium">{isRtl ? c.name : c.nameEn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Insights Panel ─── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {t('تحليلات ذكية', 'Smart Insights')}
          </h3>

          <div className="space-y-2.5">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  insight.type === 'success' ? 'bg-emerald-50 border border-emerald-100' :
                  insight.type === 'warning' ? 'bg-amber-50 border border-amber-100' :
                  'bg-blue-50 border border-blue-100'
                }`}
              >
                {insight.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                )}
                <p className={`text-xs font-medium leading-relaxed ${
                  insight.type === 'success' ? 'text-emerald-700' :
                  insight.type === 'warning' ? 'text-amber-700' :
                  'text-blue-700'
                }`}>
                  {insight.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SkillMapTab;
