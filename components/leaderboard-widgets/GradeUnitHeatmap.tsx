import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { SUBJECT_UNITS, type StudentProfile, type ClassSection } from '../../data/complexLeaderboardData';

interface GradeUnitHeatmapProps {
  subject: string;
  students: StudentProfile[];
  locale?: 'ar' | 'en';
  onCellClick?: (grade: number, unit: string) => void;
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

const CAMPUS_SHORT: Record<string, { ar: string; en: string }> = {
  'camp-1': { ar: 'بنين', en: 'Boys' },
  'camp-2': { ar: 'بنات', en: 'Girls' },
  'camp-3': { ar: 'المستقبل', en: 'Future' },
};

const ALL_SECTIONS: ClassSection[] = ['A', 'B', 'C', 'D', 'E', 'F'];
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

function computeSectionOverall(students: StudentProfile[], subject: string, units: string[]): number | null {
  const allValues: number[] = [];
  for (const unit of units) {
    const key = `${subject}-${unit}`;
    for (const s of students) {
      const acc = s.lessonDetails[key]?.accuracy;
      if (acc !== undefined && acc > 0) allValues.push(acc);
    }
  }
  if (allValues.length === 0) return null;
  return Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
}

function getSectionTrend(students: StudentProfile[]): 'up' | 'down' | 'stable' {
  const ups = students.filter(s => s.trend === 'up').length;
  const downs = students.filter(s => s.trend === 'down').length;
  if (ups > downs + 1) return 'up';
  if (downs > ups + 1) return 'down';
  return 'stable';
}

function getTopStudent(students: StudentProfile[], subject: string, unit: string): string | null {
  const key = `${subject}-${unit}`;
  let best: { name: string; acc: number } | null = null;
  for (const s of students) {
    const acc = s.lessonDetails[key]?.accuracy;
    if (acc !== undefined && (best === null || acc > best.acc)) {
      best = { name: s.name, acc };
    }
  }
  return best ? best.name : null;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-rose-500" />;
  return <Minus className="w-3 h-3 text-slate-400" />;
};

export function GradeUnitHeatmap({
  subject,
  students,
  locale = 'ar',
  onCellClick,
}: GradeUnitHeatmapProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  const units = useMemo(
    () => SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] ?? [],
    [subject],
  );

  const gradeStudents = useMemo(
    () => students.filter(s => s.grade === selectedGrade),
    [students, selectedGrade],
  );

  const sectionRows = useMemo(() => {
    return ALL_SECTIONS
      .map(section => {
        const secStudents = gradeStudents.filter(s => s.section === section);
        if (secStudents.length === 0) return null;

        const campusId = secStudents[0]?.campusId ?? 'camp-1';
        const campusLabel = CAMPUS_SHORT[campusId]
          ? (locale === 'ar' ? CAMPUS_SHORT[campusId].ar : CAMPUS_SHORT[campusId].en)
          : campusId;

        const unitAccuracies = units.map(unit => ({
          accuracy: computeAvgAccuracy(secStudents, subject, unit),
          studentCount: secStudents.filter(s => {
            const key = `${subject}-${unit}`;
            return s.lessonDetails[key]?.accuracy !== undefined;
          }).length,
          topStudent: getTopStudent(secStudents, subject, unit),
        }));

        const overall = computeSectionOverall(secStudents, subject, units);
        const trend = getSectionTrend(secStudents);

        return {
          section,
          campusId,
          campusLabel,
          studentCount: secStudents.length,
          unitAccuracies,
          overall,
          trend,
        };
      })
      .filter(Boolean) as Array<{
        section: ClassSection;
        campusId: string;
        campusLabel: string;
        studentCount: number;
        unitAccuracies: Array<{ accuracy: number | null; studentCount: number; topStudent: string | null }>;
        overall: number | null;
        trend: 'up' | 'down' | 'stable';
      }>;
  }, [gradeStudents, subject, units, locale]);

  const unitOveralls = useMemo(() => {
    return units.map(unit => computeAvgAccuracy(gradeStudents, subject, unit));
  }, [gradeStudents, subject, units]);

  const gradeStudentCount = gradeStudents.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-[Cairo]">
              {t('خريطة الدقة حسب الشعبة والوحدة', 'Accuracy by Section & Unit')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-[Cairo]">
              {t(`الصف ${selectedGrade}`, `Grade ${selectedGrade}`)}
              {' · '}
              {gradeStudentCount} {t('طالب', 'students')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 rounded-full px-2.5 py-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 font-[Cairo]">
              {students.length} {t('طالب', 'total')}
            </span>
          </div>
        </div>

        {/* Grade selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          {ALL_GRADES.map(grade => {
            const isActive = selectedGrade === grade;
            return (
              <motion.button
                key={grade}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedGrade(grade)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold font-[Cairo]
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {grade}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Heatmap table */}
      <div className="overflow-x-auto">
        {sectionRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Users className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-sm font-[Cairo]">
              {t('لا يوجد طلاب في هذا الصف', 'No students in this grade')}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm w-[160px] min-w-[160px] px-3 py-3 text-right border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 font-[Cairo]">
                    {t('الشعبة', 'Section')}
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
              {sectionRows.map((row, rowIdx) => {
                const badge = SECTION_BADGES[row.section] ?? SECTION_BADGES.A;
                const overallStyle = getCellStyle(row.overall);

                return (
                  <motion.tr
                    key={row.section}
                    initial={{ opacity: 0, x: locale === 'ar' ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIdx * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                    className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Section label cell */}
                    <td className="sticky right-0 z-10 bg-white hover:bg-slate-50/90 backdrop-blur-sm px-3 py-2.5 border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${badge.bg} ${badge.border}`}
                          style={{ color: badge.color }}
                        >
                          {row.section}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-700 font-[Cairo] truncate">
                              {row.campusLabel}
                            </span>
                            <TrendIcon trend={row.trend} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold font-[Cairo] ${overallStyle.text}`}>
                              {row.overall !== null ? `${row.overall}%` : '—'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-[Cairo]">
                              · {row.studentCount} {t('ط', 'st')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Accuracy cells */}
                    {row.unitAccuracies.map((cell, colIdx) => {
                      const style = getCellStyle(cell.accuracy);
                      return (
                        <td key={units[colIdx]} className="px-1 py-1.5">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: rowIdx * 0.04 + colIdx * 0.02 }}
                            whileHover={{ scale: 1.08, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            onClick={() => onCellClick?.(selectedGrade, units[colIdx])}
                            title={
                              cell.accuracy !== null
                                ? `${cell.studentCount} ${t('طالب', 'students')}${cell.topStudent ? ` · ${t('الأول', 'Top')}: ${cell.topStudent}` : ''}`
                                : t('لا بيانات', 'No data')
                            }
                            className={`${style.bg} rounded-lg px-2 py-2 text-center cursor-pointer transition-shadow`}
                          >
                            <span className={`text-xs font-bold font-[Cairo] ${style.text}`}>
                              {cell.accuracy !== null ? `${cell.accuracy}%` : '—'}
                            </span>
                          </motion.div>
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Color legend */}
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
