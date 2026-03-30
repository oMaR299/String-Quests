import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, Bell, Download, BookOpen } from 'lucide-react';
import { ProgressRing, AreaLineChart, HorizontalBarChart } from './SvgCharts';
import {
  getStudentAttendance,
  CAMPUSES,
  EXTENDED_STUDENTS,
  getTodayString,
} from '../../../data/mockAttendanceData';
import type { ExtendedStudent, AttendanceRecord, AttendanceStatus } from '../../../types/admin';

// ─── helpers ────────────────────────────────────────────────────
const t = (ar: string, en: string, locale: 'ar' | 'en') => (locale === 'ar' ? ar : en);

function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)}/${parseInt(m)}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── types ──────────────────────────────────────────────────────
interface StudentReportModalProps {
  student: ExtendedStudent | null;
  onClose: () => void;
  locale: 'ar' | 'en';
}

// ─── sub-components ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {icon && <div className="mb-0.5">{icon}</div>}
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
      <span className="text-[11px] font-medium text-slate-500 text-center leading-tight">
        {label}
      </span>
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
      <span className="inline-block w-1 h-4 rounded-full bg-violet-500" />
      {children}
    </h3>
  );
}

// ─── main component ─────────────────────────────────────────────
export function StudentReportModal({ student, onClose, locale }: StudentReportModalProps) {
  const [sortAsc, setSortAsc] = useState(false);

  // Compute all derived data
  const data = useMemo(() => {
    if (!student) return null;

    const records = getStudentAttendance(student.id);
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const total = records.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const campus = CAMPUSES.find((c) => c.id === student.campusId);

    // 30-day calendar grid data
    const last30: { date: string; day: number; status: AttendanceStatus | 'weekend' | 'none' }[] =
      [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayNum = d.getDate();
      const dow = d.getDay();
      if (dow === 5 || dow === 6) {
        last30.push({ date: ds, day: dayNum, status: 'weekend' });
      } else {
        const rec = records.find((r) => r.date === ds);
        last30.push({ date: ds, day: dayNum, status: rec ? rec.status : 'none' });
      }
    }

    // Trend data — daily attendance (1 = present/late, 0 = absent) over school days in the last 30
    const schoolDayRecords = last30.filter(
      (d) => d.status !== 'weekend' && d.status !== 'none',
    );
    const trendData = schoolDayRecords.map((d) => ({
      label: formatDateShort(d.date),
      value: d.status === 'present' || d.status === 'late' ? 100 : 0,
    }));

    // Subject breakdown (mock per-subject attendance based on enrolled spaces)
    const rand = seededRandom(parseInt(student.id.replace(/\D/g, '') || '1'));
    const subjectNames: Record<string, { ar: string; en: string }> = {
      'رياضيات': { ar: 'رياضيات', en: 'Math' },
      'علوم': { ar: 'علوم', en: 'Science' },
      'لغة عربية': { ar: 'لغة عربية', en: 'Arabic' },
      'لغة إنجليزية': { ar: 'لغة إنجليزية', en: 'English' },
      'تاريخ': { ar: 'تاريخ', en: 'History' },
      'تربية إسلامية': { ar: 'تربية إسلامية', en: 'Islamic Studies' },
      'حاسب آلي': { ar: 'حاسب آلي', en: 'Computer Science' },
      'تربية بدنية': { ar: 'تربية بدنية', en: 'Physical Education' },
    };

    // Extract subject names from space IDs
    const studentSubjects = new Set<string>();
    for (const spaceId of student.enrolledSpaces) {
      // space-{grade}{section}-{subject}
      const parts = spaceId.split('-');
      if (parts.length >= 3) {
        const subjectPart = parts.slice(2).join('-');
        studentSubjects.add(subjectPart);
      }
    }

    const subjectBreakdown = Array.from(studentSubjects).map((subKey) => {
      const offset = (rand() - 0.5) * 10; // +/- 5%
      const subRate = Math.min(100, Math.max(50, Math.round(rate + offset)));
      const nameObj = subjectNames[subKey];
      return {
        label: nameObj ? (locale === 'ar' ? nameObj.ar : nameObj.en) : subKey,
        value: subRate,
      };
    });

    // Absences log
    const absences = records
      .filter((r) => r.status === 'absent' || r.status === 'late')
      .sort((a, b) => b.date.localeCompare(a.date));

    return { records, present, absent, late, total, rate, campus, last30, trendData, subjectBreakdown, absences };
  }, [student, locale]);

  return (
    <AnimatePresence>
      {student && data && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {/* ── Header ──────────────────────────── */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-t-2xl px-6 py-5 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shrink-0 ring-2 ring-white/30">
                {(locale === 'ar' ? student.name : student.nameEn).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {locale === 'ar' ? student.name : student.nameEn}
                </h2>
                <p className="text-violet-200 text-sm">
                  {t('الصف', 'Grade', locale)} {student.grade}
                  {student.section} &middot;{' '}
                  {locale === 'ar' ? data.campus?.name : data.campus?.nameEn}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* ── Stats Row ─────────────────────── */}
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-3 shadow-sm">
                  <div className="w-16 h-16">
                    <ProgressRing value={data.rate} size={64} strokeWidth={6} label={t('الحضور', 'Attend.', locale)} />
                  </div>
                </div>
                <StatCard
                  label={t('حاضر', 'Present', locale)}
                  value={data.present}
                  color="text-emerald-600"
                />
                <StatCard
                  label={t('غائب', 'Absent', locale)}
                  value={data.absent}
                  color="text-rose-600"
                />
                <StatCard
                  label={t('متأخر', 'Late', locale)}
                  value={data.late}
                  color="text-amber-600"
                />
              </div>

              {/* ── 30-Day Calendar Grid ──────────── */}
              <div>
                <SectionTitle>{t('تقويم آخر 30 يوم', '30-Day Calendar', locale)}</SectionTitle>
                <div className="grid grid-cols-6 gap-1.5">
                  {data.last30.map((d, i) => {
                    const bgMap: Record<string, string> = {
                      present: 'bg-emerald-500 text-white',
                      absent: 'bg-rose-500 text-white',
                      late: 'bg-amber-500 text-white',
                      weekend: 'bg-slate-100 text-slate-400',
                      none: 'bg-slate-50 text-slate-300',
                    };
                    return (
                      <motion.div
                        key={i}
                        className={`rounded-lg flex items-center justify-center text-xs font-bold h-9 ${bgMap[d.status]}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.012, duration: 0.2 }}
                        title={`${d.date} — ${d.status}`}
                      >
                        {d.day}
                      </motion.div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    {t('حاضر', 'Present', locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                    {t('غائب', 'Absent', locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                    {t('متأخر', 'Late', locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block border border-slate-200" />
                    {t('عطلة', 'Weekend', locale)}
                  </span>
                </div>
              </div>

              {/* ── Attendance Trend ──────────────── */}
              {data.trendData.length > 2 && (
                <div>
                  <SectionTitle>{t('اتجاه الحضور', 'Attendance Trend', locale)}</SectionTitle>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <AreaLineChart
                      data={data.trendData}
                      height={180}
                      color="#8b5cf6"
                      yMin={0}
                      yMax={100}
                      showDots={true}
                      showGrid={true}
                    />
                  </div>
                </div>
              )}

              {/* ── Subject Breakdown ─────────────── */}
              {data.subjectBreakdown.length > 0 && (
                <div>
                  <SectionTitle>
                    <BookOpen size={14} className="text-violet-500" />
                    {t('الحضور حسب المادة', 'Attendance by Subject', locale)}
                  </SectionTitle>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <HorizontalBarChart
                      data={data.subjectBreakdown}
                      maxValue={100}
                      barHeight={20}
                      showValues={true}
                    />
                  </div>
                </div>
              )}

              {/* ── Absence Log Table ─────────────── */}
              <div>
                <SectionTitle>{t('سجل الغياب والتأخير', 'Absence & Late Log', locale)}</SectionTitle>
                {data.absences.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {t('لا يوجد غياب مسجّل', 'No absences recorded', locale)}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th
                            className="px-4 py-2.5 text-start font-semibold cursor-pointer select-none"
                            onClick={() => setSortAsc(!sortAsc)}
                          >
                            <span className="inline-flex items-center gap-1">
                              {t('التاريخ', 'Date', locale)}
                              <ArrowUpDown size={12} className="text-slate-400" />
                            </span>
                          </th>
                          <th className="px-4 py-2.5 text-start font-semibold">
                            {t('الحالة', 'Status', locale)}
                          </th>
                          <th className="px-4 py-2.5 text-start font-semibold">
                            {t('العذر', 'Reason', locale)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sortAsc
                          ? [...data.absences].sort((a, b) => a.date.localeCompare(b.date))
                          : data.absences
                        )
                          .slice(0, 20)
                          .map((rec, i) => (
                            <tr
                              key={rec.date + i}
                              className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-4 py-2 text-slate-700 font-medium">{rec.date}</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    rec.status === 'absent'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {rec.status === 'absent'
                                    ? t('غائب', 'Absent', locale)
                                    : t('متأخر', 'Late', locale)}
                                  {rec.status === 'late' && rec.lateTime && ` (${rec.lateTime})`}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-slate-500 text-xs">
                                {rec.excuseReason || t('بدون عذر', 'No excuse', locale)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer Actions ──────────────────── */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 rounded-b-2xl px-6 py-4 flex items-center justify-end gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
                <Bell size={15} />
                {t('إخطار ولي الأمر', 'Notify Parent', locale)}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-sm transition-colors">
                <Download size={15} />
                {t('تصدير التقرير', 'Export Report', locale)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
