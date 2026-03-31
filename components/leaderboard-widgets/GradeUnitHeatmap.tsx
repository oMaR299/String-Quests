import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SUBJECT_UNITS, type StudentProfile, type ClassSection } from '../../data/complexLeaderboardData';

interface GradeUnitHeatmapProps {
  subject: string;
  students: StudentProfile[];
  locale?: 'ar' | 'en';
  onCellClick?: (grade: number, unit: string) => void;
}

const UNIT_LABELS_AR: Record<string, string> = {
  // math
  arithmetic: 'الحساب', algebra: 'الجبر', geometry: 'الهندسة', calculus: 'التفاضل', statistics: 'الإحصاء',
  // science
  matter: 'المادة', energy: 'الطاقة', forces: 'القوى', ecosystems: 'النظم البيئية',
  // languages
  grammar: 'القواعد', literature: 'الأدب', poetry: 'الشعر', writing: 'الكتابة',
  // history
  ancient: 'القديم', islamic_history: 'التاريخ الإسلامي', modern: 'الحديث', geography: 'الجغرافيا',
  // arts
  drawing: 'الرسم', colors: 'الألوان', history_of_art: 'تاريخ الفن',
  // islamic
  quran: 'القرآن', hadith: 'الحديث', fiqh: 'الفقه', tafsir: 'التفسير',
  // social
  citizenship: 'المواطنة', economics: 'الاقتصاد', sociology: 'علم الاجتماع',
  // physics
  mechanics: 'الميكانيكا', thermodynamics: 'الديناميكا الحرارية', optics: 'البصريات', quantum: 'الكم',
  // chemistry
  periodic_table: 'الجدول الدوري', reactions: 'التفاعلات', organic: 'العضوية', acids: 'الأحماض',
  // biology
  cells: 'الخلايا', genetics: 'الوراثة', anatomy: 'التشريح', ecology: 'البيئة',
  // computer
  coding: 'البرمجة', hardware: 'العتاد', networks: 'الشبكات', ai: 'الذكاء الاصطناعي',
  // english
  vocabulary: 'المفردات', reading: 'القراءة', speaking: 'المحادثة',
};

const SECTION_BADGES: Record<string, { color: string; bg: string; border: string }> = {
  A: { color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200' },
  B: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  C: { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200' },
  D: { color: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-200' },
  E: { color: '#ec4899', bg: 'bg-pink-50', border: 'border-pink-200' },
  F: { color: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-200' },
};

const SECTIONS: ClassSection[] = ['A', 'B', 'C', 'D'];

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function getCellStyle(accuracy: number | null): { bg: string; text: string } {
  if (accuracy === null) return { bg: 'bg-slate-50', text: 'text-slate-400' };
  if (accuracy >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  if (accuracy >= 70) return { bg: 'bg-sky-100', text: 'text-sky-700' };
  if (accuracy >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-rose-100', text: 'text-rose-700' };
}

function computeAvgAccuracy(students: StudentProfile[], subject: string, unit: string): number | null {
  const key = `${subject}-${unit}`;
  const values = students
    .map(s => s.lessonDetails[key]?.accuracy)
    .filter((v): v is number => v !== undefined && v > 0);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function computeOverallAccuracy(students: StudentProfile[], subject: string): number | null {
  const vals = students
    .map(s => s.subjectDetails[subject as keyof typeof s.subjectDetails]?.accuracy)
    .filter((v): v is number => v !== undefined && v > 0);
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getGradeTrend(students: StudentProfile[]): 'up' | 'down' | 'stable' {
  const ups = students.filter(s => s.trend === 'up').length;
  const downs = students.filter(s => s.trend === 'down').length;
  if (ups > downs + 1) return 'up';
  if (downs > ups + 1) return 'down';
  return 'stable';
}

export function GradeUnitHeatmap({
  subject,
  students,
  locale = 'ar',
  onCellClick,
}: GradeUnitHeatmapProps) {
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  const units = useMemo(
    () => SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] ?? [],
    [subject],
  );

  const gradeData = useMemo(() => {
    return ALL_GRADES.map(grade => {
      const gradeStudents = students.filter(s => s.grade === grade);
      const overall = computeOverallAccuracy(gradeStudents, subject);
      const trend = getGradeTrend(gradeStudents);
      const unitAccuracies = units.map(unit => computeAvgAccuracy(gradeStudents, subject, unit));

      const sections = SECTIONS.map(sec => {
        const secStudents = gradeStudents.filter(s => s.section === sec);
        if (secStudents.length === 0) return null;
        return {
          section: sec,
          unitAccuracies: units.map(unit => computeAvgAccuracy(secStudents, subject, unit)),
        };
      }).filter(Boolean) as { section: ClassSection; unitAccuracies: (number | null)[] }[];

      return { grade, overall, trend, unitAccuracies, studentCount: gradeStudents.length, sections };
    });
  }, [students, subject, units]);

  const unitOveralls = useMemo(() => {
    return units.map(unit => computeAvgAccuracy(students, subject, unit));
  }, [students, subject, units]);

  const handleGradeToggle = useCallback((grade: number) => {
    setExpandedGrade(prev => (prev === grade ? null : grade));
  }, []);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-[Cairo]">
            {t('خريطة الدقة حسب الصف والوحدة', 'Grade × Unit Accuracy Heatmap')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-[Cairo]">
            {t('اضغط على الصف للتوسيع حسب الشعبة', 'Click a grade row to expand by section')}
          </p>
        </div>
        <span className="text-xs text-slate-400 font-[Cairo]">
          {students.length} {t('طالب', 'students')}
        </span>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          {/* Column headers */}
          <thead>
            <tr className="bg-slate-50/80">
              <th className="sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm w-[140px] min-w-[140px] px-3 py-3 text-right border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 font-[Cairo]">
                  {t('الصف', 'Grade')}
                </span>
              </th>
              {units.map((unit, i) => (
                <th key={unit} className="px-2 py-3 text-center border-b border-slate-100 min-w-[80px]">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="text-xs font-bold text-slate-700 font-[Cairo] leading-tight">
                      {UNIT_LABELS_AR[unit] ?? unit}
                    </div>
                    <div className={`text-[10px] mt-0.5 font-medium font-[Cairo] ${
                      unitOveralls[i] !== null ? getCellStyle(unitOveralls[i]).text : 'text-slate-400'
                    }`}>
                      {unitOveralls[i] !== null ? `${unitOveralls[i]}%` : '—'}
                    </div>
                  </motion.div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {gradeData.map((row, rowIdx) => {
              const isExpanded = expandedGrade === row.grade;
              return (
                <AnimatePresence key={row.grade} initial={false}>
                  {/* Main grade row */}
                  <motion.tr
                    layout
                    className="group cursor-pointer border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    onClick={() => handleGradeToggle(row.grade)}
                  >
                    <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/90 backdrop-blur-sm px-3 py-2.5 border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </motion.div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700 font-[Cairo]">
                              {t(`الصف ${row.grade}`, `Grade ${row.grade}`)}
                            </span>
                            <TrendIcon trend={row.trend} />
                          </div>
                          <span className={`text-[10px] font-semibold font-[Cairo] ${
                            row.overall !== null ? getCellStyle(row.overall).text : 'text-slate-400'
                          }`}>
                            {row.overall !== null ? `${row.overall}%` : '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {row.unitAccuracies.map((acc, colIdx) => {
                      const style = getCellStyle(acc);
                      return (
                        <td key={units[colIdx]} className="px-1 py-1.5">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: rowIdx * 0.02 + colIdx * 0.015 }}
                            whileHover={{ scale: 1.08, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCellClick?.(row.grade, units[colIdx]);
                            }}
                            className={`${style.bg} rounded-lg px-2 py-2 text-center cursor-pointer transition-shadow`}
                          >
                            <span className={`text-xs font-bold font-[Cairo] ${style.text}`}>
                              {acc !== null ? `${acc}%` : '—'}
                            </span>
                          </motion.div>
                        </td>
                      );
                    })}
                  </motion.tr>

                  {/* Expanded section sub-rows */}
                  {isExpanded &&
                    row.sections.map((sec, secIdx) => {
                      const badge = SECTION_BADGES[sec.section] ?? SECTION_BADGES.A;
                      return (
                        <motion.tr
                          key={`${row.grade}-${sec.section}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: secIdx * 0.04 }}
                          className="bg-slate-50/50 border-b border-slate-50"
                        >
                          <td className="sticky right-0 z-10 bg-slate-50/90 backdrop-blur-sm px-3 py-2 border-l border-slate-100">
                            <div className="flex items-center gap-2 pr-6">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.border} font-[Cairo]`}
                                style={{ color: badge.color }}
                              >
                                {sec.section}
                              </span>
                              <span className="text-xs text-slate-500 font-[Cairo]">
                                {t(`شعبة ${sec.section}`, `Section ${sec.section}`)}
                              </span>
                            </div>
                          </td>

                          {sec.unitAccuracies.map((acc, colIdx) => {
                            const style = getCellStyle(acc);
                            return (
                              <td key={units[colIdx]} className="px-1 py-1">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: secIdx * 0.03 + colIdx * 0.02 }}
                                  whileHover={{ scale: 1.08, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                  onClick={() => onCellClick?.(row.grade, units[colIdx])}
                                  className={`${style.bg} bg-opacity-70 rounded-md px-2 py-1.5 text-center cursor-pointer`}
                                >
                                  <span className={`text-[11px] font-semibold font-[Cairo] ${style.text}`}>
                                    {acc !== null ? `${acc}%` : '—'}
                                  </span>
                                </motion.div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                </AnimatePresence>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
        <span className="text-[10px] text-slate-400 font-[Cairo]">{t('مفتاح الألوان:', 'Legend:')}</span>
        {[
          { label: '≥80%', bg: 'bg-emerald-100', text: 'text-emerald-700' },
          { label: '70-80%', bg: 'bg-sky-100', text: 'text-sky-700' },
          { label: '60-70%', bg: 'bg-amber-100', text: 'text-amber-700' },
          { label: '<60%', bg: 'bg-rose-100', text: 'text-rose-700' },
          { label: t('لا بيانات', 'No data'), bg: 'bg-slate-50', text: 'text-slate-400' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-3 rounded ${item.bg}`} />
            <span className={`text-[10px] font-medium font-[Cairo] ${item.text}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default GradeUnitHeatmap;
