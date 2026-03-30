import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Download, Clock, CheckCircle2, XCircle, User } from 'lucide-react';
import { ProgressRing, HorizontalBarChart } from './SvgCharts';
import {
  CAMPUSES,
  EXTENDED_STUDENTS,
  EXTENDED_TEACHERS,
  TEACHER_COMPLIANCE_RECORDS,
  getTeacherActivityForDate,
  getStudentAttendance,
  getTodayString,
  ACTION_LABELS,
} from '../../../data/mockAttendanceData';
import type {
  ExtendedTeacher,
  TeacherComplianceRecord,
  TeacherDailyActivity,
  TeacherAction,
  TeacherActionType,
} from '../../../types/admin';

// ─── helpers ────────────────────────────────────────────────────
const t = (ar: string, en: string, locale: 'ar' | 'en') => (locale === 'ar' ? ar : en);

const ACTION_LABELS_EN: Record<TeacherActionType, string> = {
  login: 'Login',
  mark_attendance: 'Mark Attendance',
  open_space: 'Open Space',
  review_quiz: 'Review Quiz',
  post_content: 'Post Content',
  view_student: 'View Student',
};

const ACTION_ICONS: Record<TeacherActionType, string> = {
  login: '🔑',
  mark_attendance: '📋',
  open_space: '📂',
  review_quiz: '📝',
  post_content: '📤',
  view_student: '👤',
};

const ACTION_COLORS: Record<TeacherActionType, string> = {
  login: 'bg-blue-100 text-blue-700 border-blue-200',
  mark_attendance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  open_space: 'bg-violet-100 text-violet-700 border-violet-200',
  review_quiz: 'bg-amber-100 text-amber-700 border-amber-200',
  post_content: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  view_student: 'bg-slate-100 text-slate-700 border-slate-200',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getSchoolDaysBackward(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  // Walk back to most recent non-weekend
  while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  const end = new Date(d);
  const candidate = new Date(end);
  candidate.setDate(candidate.getDate() - 60);
  while (candidate <= end) {
    const dow = candidate.getDay();
    if (dow !== 5 && dow !== 6) {
      const y = candidate.getFullYear();
      const m = String(candidate.getMonth() + 1).padStart(2, '0');
      const day = String(candidate.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${day}`);
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return days.slice(-count);
}

// ─── types ──────────────────────────────────────────────────────
interface TeacherReportModalProps {
  teacher: ExtendedTeacher | null;
  onClose: () => void;
  locale: 'ar' | 'en';
  onStudentClick?: (studentId: string) => void;
}

// ─── sub-components ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
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
      <span className="inline-block w-1 h-4 rounded-full bg-teal-500" />
      {children}
    </h3>
  );
}

// ─── main component ─────────────────────────────────────────────
export function TeacherReportModal({
  teacher,
  onClose,
  locale,
  onStudentClick,
}: TeacherReportModalProps) {
  const todayStr = useMemo(() => getTodayString(), []);

  const data = useMemo(() => {
    if (!teacher) return null;

    const campus = CAMPUSES.find((c) => c.id === teacher.campusId);

    // ── Compliance stats (last 30 school days) ──
    const teacherCompliance = TEACHER_COMPLIANCE_RECORDS.filter(
      (r) => r.teacherId === teacher.id,
    );
    const totalSessions = teacherCompliance.length;
    const submittedSessions = teacherCompliance.filter((r) => r.submitted).length;
    const complianceRate =
      totalSessions > 0 ? Math.round((submittedSessions / totalSessions) * 100) : 0;

    // ── Today's activity ──
    const allActivities = getTeacherActivityForDate(todayStr);
    const todayActivity = allActivities.find((a) => a.teacherId === teacher.id);
    const activeHours = todayActivity
      ? Math.round((todayActivity.totalMinutes / 60) * 10) / 10
      : 0;

    // ── Weekly compliance grid (last 5 school days x periods 1-5) ──
    const last5Days = getSchoolDaysBackward(5);
    const periods = [1, 2, 3, 4, 5];
    const weeklyGrid: {
      day: string;
      dayLabel: string;
      cells: { period: number; status: 'submitted' | 'missed' | 'none' }[];
    }[] = last5Days.map((dateStr) => {
      const dayRecords = teacherCompliance.filter((r) => r.date === dateStr);
      const d = new Date(dateStr);
      const dayNames = locale === 'ar'
        ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        day: dateStr,
        dayLabel: dayNames[d.getDay()] || '',
        cells: periods.map((p) => {
          const rec = dayRecords.find((r) => r.period === p);
          if (!rec) return { period: p, status: 'none' as const };
          return { period: p, status: rec.submitted ? ('submitted' as const) : ('missed' as const) };
        }),
      };
    });

    // ── Per-space attendance rates (mock) ──
    const rand = seededRandom(parseInt(teacher.id.replace(/\D/g, '') || '1'));
    const spaceRates = teacher.spaces.slice(0, 12).map((spaceId) => {
      // Parse space ID: space-{grade}{section}-{subject}
      const parts = spaceId.split('-');
      const classInfo = parts[1] || '';
      const gradeMatch = classInfo.match(/^(\d+)([A-F])/);
      const grade = gradeMatch ? gradeMatch[1] : '?';
      const section = gradeMatch ? gradeMatch[2] : '?';
      const rate = Math.round(70 + rand() * 28); // 70-98%
      return {
        label: `${locale === 'ar' ? 'ص' : 'G'}${grade}${section}`,
        value: rate,
      };
    });
    // Sort worst to best
    spaceRates.sort((a, b) => a.value - b.value);

    // ── Today's activity timeline ──
    const timeline: TeacherAction[] = todayActivity
      ? [...todayActivity.actions].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      : [];

    // ── Students in teacher's spaces ──
    const teacherSpaceSet = new Set(teacher.spaces);
    const studentsInSpaces = EXTENDED_STUDENTS.filter((s) =>
      s.enrolledSpaces.some((sp) => teacherSpaceSet.has(sp)),
    ).slice(0, 20); // Limit for display

    // Get attendance rate for each student
    const studentRows = studentsInSpaces.map((s) => {
      const records = getStudentAttendance(s.id);
      const total = records.length;
      const presentLate = records.filter(
        (r) => r.status === 'present' || r.status === 'late',
      ).length;
      const rate = total > 0 ? Math.round((presentLate / total) * 100) : 0;

      // Today's status
      const todayRec = records.find((r) => r.date === todayStr);
      const todayStatus = todayRec ? todayRec.status : 'none';

      return { student: s, rate, todayStatus };
    });

    return {
      campus,
      complianceRate,
      totalSessions,
      submittedSessions,
      activeHours,
      weeklyGrid,
      spaceRates,
      timeline,
      studentRows,
      todayActivity,
    };
  }, [teacher, locale, todayStr]);

  return (
    <AnimatePresence>
      {teacher && data && (
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
            <div className="sticky top-0 z-10 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-t-2xl px-6 py-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shrink-0 ring-2 ring-white/30">
                {(locale === 'ar' ? teacher.name : teacher.nameEn).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {locale === 'ar' ? teacher.name : teacher.nameEn}
                </h2>
                <p className="text-teal-200 text-sm flex items-center gap-2 flex-wrap">
                  <span>{locale === 'ar' ? teacher.subject : teacher.subjectEn}</span>
                  <span className="opacity-50">&middot;</span>
                  <span>{locale === 'ar' ? data.campus?.name : data.campus?.nameEn}</span>
                  <span className="opacity-50">&middot;</span>
                  <span>
                    {teacher.spaces.length} {t('مساحة', 'spaces', locale)}
                  </span>
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
                    <ProgressRing
                      value={data.complianceRate}
                      size={64}
                      strokeWidth={6}
                      label={t('الالتزام', 'Comply', locale)}
                    />
                  </div>
                </div>
                <StatCard
                  label={t('إجمالي الحصص', 'Total Sessions', locale)}
                  value={data.totalSessions}
                  color="text-slate-700"
                />
                <StatCard
                  label={t('تم الرصد', 'Submitted', locale)}
                  value={data.submittedSessions}
                  color="text-emerald-600"
                />
                <StatCard
                  label={t('ساعات اليوم', 'Active Hours', locale)}
                  value={`${data.activeHours}h`}
                  color="text-blue-600"
                />
              </div>

              {/* ── Weekly Compliance Grid ─────────── */}
              <div>
                <SectionTitle>
                  {t('شبكة الالتزام الأسبوعية', 'Weekly Compliance Grid', locale)}
                </SectionTitle>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-start text-slate-500 font-semibold">
                          {t('اليوم', 'Day', locale)}
                        </th>
                        {[1, 2, 3, 4, 5].map((p) => (
                          <th key={p} className="px-2 py-2 text-center text-slate-500 font-semibold">
                            {t(`ح${p}`, `P${p}`, locale)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.weeklyGrid.map((row, ri) => (
                        <tr key={row.day} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-semibold text-slate-600">
                            {row.dayLabel}
                            <span className="text-[10px] text-slate-400 block">
                              {row.day.slice(5)}
                            </span>
                          </td>
                          {row.cells.map((cell, ci) => (
                            <td key={ci} className="px-2 py-2 text-center">
                              <motion.div
                                className={`mx-auto w-7 h-7 rounded-lg flex items-center justify-center ${
                                  cell.status === 'submitted'
                                    ? 'bg-emerald-500 text-white'
                                    : cell.status === 'missed'
                                      ? 'bg-rose-500 text-white'
                                      : 'bg-slate-100 text-slate-300'
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: ri * 0.05 + ci * 0.03, duration: 0.2 }}
                              >
                                {cell.status === 'submitted' ? (
                                  <CheckCircle2 size={14} />
                                ) : cell.status === 'missed' ? (
                                  <XCircle size={14} />
                                ) : (
                                  <span className="text-[10px]">&mdash;</span>
                                )}
                              </motion.div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    {t('تم الرصد', 'Submitted', locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                    {t('لم يُرصد', 'Not Submitted', locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block border border-slate-200" />
                    {t('لا حصة', 'No Session', locale)}
                  </span>
                </div>
              </div>

              {/* ── Per-Space Attendance ──────────── */}
              {data.spaceRates.length > 0 && (
                <div>
                  <SectionTitle>
                    {t('الحضور حسب المساحة', 'Attendance by Space', locale)}
                  </SectionTitle>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <HorizontalBarChart
                      data={data.spaceRates}
                      maxValue={100}
                      barHeight={18}
                      showValues={true}
                    />
                  </div>
                </div>
              )}

              {/* ── Activity Timeline ─────────────── */}
              <div>
                <SectionTitle>
                  <Clock size={14} className="text-teal-500" />
                  {t('نشاط اليوم', "Today's Activity", locale)}
                </SectionTitle>
                {data.timeline.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {t('لا يوجد نشاط اليوم', 'No activity today', locale)}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute top-0 bottom-0 left-[18px] w-0.5 bg-slate-200 rounded-full" />
                    <div className="space-y-3">
                      {data.timeline.map((action, i) => {
                        const time = action.timestamp.split('T')[1]?.slice(0, 5) || '';
                        const colorClass = ACTION_COLORS[action.type] || 'bg-slate-100 text-slate-600';
                        return (
                          <motion.div
                            key={i}
                            className="flex items-start gap-3 relative"
                            initial={{ x: -12, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.06, duration: 0.25 }}
                          >
                            {/* Dot */}
                            <div
                              className={`w-[38px] h-[38px] shrink-0 rounded-full flex items-center justify-center text-sm z-10 border ${colorClass}`}
                            >
                              {ACTION_ICONS[action.type] || '•'}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                  {locale === 'ar'
                                    ? ACTION_LABELS[action.type]
                                    : ACTION_LABELS_EN[action.type]}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {time}
                                </span>
                              </div>
                              {action.details && (
                                <p className="text-xs text-slate-500 mt-0.5">{action.details}</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Student List ───────────────────── */}
              <div>
                <SectionTitle>
                  <User size={14} className="text-teal-500" />
                  {t('طلاب المعلم', "Teacher's Students", locale)}
                </SectionTitle>
                {data.studentRows.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {t('لا يوجد طلاب', 'No students found', locale)}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="px-4 py-2.5 text-start font-semibold">
                            {t('الطالب', 'Student', locale)}
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold">
                            {t('الصف', 'Grade', locale)}
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold">
                            {t('الحضور', 'Attend.', locale)}
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold">
                            {t('اليوم', 'Today', locale)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.studentRows.map((row, i) => {
                          const statusColors: Record<string, string> = {
                            present: 'bg-emerald-100 text-emerald-700',
                            absent: 'bg-rose-100 text-rose-700',
                            late: 'bg-amber-100 text-amber-700',
                            none: 'bg-slate-100 text-slate-400',
                          };
                          const statusLabels: Record<string, string> = {
                            present: t('حاضر', 'Present', locale),
                            absent: t('غائب', 'Absent', locale),
                            late: t('متأخر', 'Late', locale),
                            none: '—',
                          };
                          return (
                            <tr
                              key={row.student.id}
                              className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                              onClick={() => onStudentClick?.(row.student.id)}
                            >
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                    {(locale === 'ar'
                                      ? row.student.name
                                      : row.student.nameEn
                                    ).charAt(0)}
                                  </div>
                                  <span className="text-slate-700 font-medium truncate">
                                    {locale === 'ar' ? row.student.name : row.student.nameEn}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center text-slate-500">
                                {row.student.grade}
                                {row.student.section}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`font-bold text-xs ${
                                    row.rate >= 90
                                      ? 'text-emerald-600'
                                      : row.rate >= 75
                                        ? 'text-amber-600'
                                        : 'text-rose-600'
                                  }`}
                                >
                                  {row.rate}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[row.todayStatus] || statusColors.none}`}
                                >
                                  {statusLabels[row.todayStatus] || '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer Actions ──────────────────── */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 rounded-b-2xl px-6 py-4 flex items-center justify-end gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
                <Send size={15} />
                {t('إرسال تذكير', 'Send Reminder', locale)}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm transition-colors">
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
