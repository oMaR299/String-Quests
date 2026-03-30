import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
  FileText, UserCheck, Bell, ChevronDown, X, Check, AlertTriangle,
  CalendarDays, Activity, Phone, Mail, ShieldAlert, BarChart3,
} from 'lucide-react';
import {
  CAMPUSES, EXTENDED_STUDENTS, EXTENDED_TEACHERS,
  ATTENDANCE_RECORDS, getDailySummary, getClassAttendance,
  getTeacherActivityForDate, getStudentAttendance, getTodayString,
  ACTION_LABELS,
} from '../../../data/mockAttendanceData';
import type { AttendanceStatus, ExtendedStudent } from '../../../types/admin';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface AttendanceDashboardProps {
  locale: 'ar' | 'en';
  onNavigateToReport: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 5 || day === 6;
}

function getRecentWeekdays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (days.length < count) {
    if (!isWeekend(d)) days.push(formatDate(d));
    d.setDate(d.getDate() - 1);
  }
  return days;
}

function getStudentById(id: string): ExtendedStudent | undefined {
  return EXTENDED_STUDENTS.find(s => s.id === id);
}

// ─────────────────────────────────────────────
// Tiny sub-components (internal)
// ─────────────────────────────────────────────

const RingChart: React.FC<{ value: number; max: number; color: string; size?: number }> = ({ value, max, color, size = 48 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-slate-100" strokeWidth={4} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold text-sm flex items-center gap-2"
  >
    <Check className="w-4 h-4" />
    {message}
    <button onClick={onClose} className="ms-3 hover:bg-white/20 rounded p-0.5"><X className="w-3.5 h-3.5" /></button>
  </motion.div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ locale, onNavigateToReport }) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRTL = locale === 'ar';
  const today = getTodayString();

  // ── State ──
  const [campusFilter, setCampusFilter] = useState<string>('all');
  const [expandedCell, setExpandedCell] = useState<{ grade: number; section: string } | null>(null);
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [markGrade, setMarkGrade] = useState<number | null>(null);
  const [markSection, setMarkSection] = useState<string>('A');
  const [markStatuses, setMarkStatuses] = useState<Record<string, { status: AttendanceStatus; lateTime?: string }>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [excuseDropdown, setExcuseDropdown] = useState<string | null>(null);
  const [studentModal, setStudentModal] = useState<string | null>(null);
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  // ── Derived Data ──
  const todaySummary = useMemo(() => getDailySummary(today, campusFilter !== 'all' ? campusFilter : undefined), [today, campusFilter]);

  const yesterdayStr = useMemo(() => {
    const days = getRecentWeekdays(2);
    return days[1] || days[0];
  }, []);
  const yesterdaySummary = useMemo(() => getDailySummary(yesterdayStr, campusFilter !== 'all' ? campusFilter : undefined), [yesterdayStr, campusFilter]);

  const filteredStudents = useMemo(() => {
    if (campusFilter === 'all') return EXTENDED_STUDENTS;
    return EXTENDED_STUDENTS.filter(s => s.campusId === campusFilter);
  }, [campusFilter]);

  const filteredTeachers = useMemo(() => {
    if (campusFilter === 'all') return EXTENDED_TEACHERS;
    return EXTENDED_TEACHERS.filter(t => t.campusId === campusFilter);
  }, [campusFilter]);

  // Grades and sections available for selected campus
  const gradesAvailable = useMemo((): number[] => {
    const grades = filteredStudents.map(s => s.grade);
    const set = new Set<number>(grades);
    return Array.from(set).sort((a: number, b: number) => a - b);
  }, [filteredStudents]);

  const sectionsAvailable = useMemo((): string[] => {
    const secs = filteredStudents.map(s => s.section);
    const set = new Set<string>(secs);
    return Array.from(set).sort();
  }, [filteredStudents]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    return gradesAvailable.map(grade =>
      sectionsAvailable.map(section => {
        const ca = getClassAttendance(today, grade, section, campusFilter !== 'all' ? campusFilter : undefined);
        return ca;
      })
    );
  }, [today, gradesAvailable, sectionsAvailable, campusFilter]);

  // Absent students today
  const absentStudents = useMemo(() => {
    const records = ATTENDANCE_RECORDS.filter(r => r.date === today && r.status === 'absent');
    const studentIds = new Set(filteredStudents.map(s => s.id));
    return records
      .filter(r => studentIds.has(r.studentId))
      .map(r => {
        const student = getStudentById(r.studentId);
        if (!student) return null;
        // Count absent days this month
        const monthStart = today.slice(0, 7) + '-01';
        const monthRecords = ATTENDANCE_RECORDS.filter(mr => mr.studentId === r.studentId && mr.date >= monthStart && mr.date <= today && mr.status === 'absent');
        return { ...student, absentDaysThisMonth: monthRecords.length, record: r };
      })
      .filter(Boolean) as (ExtendedStudent & { absentDaysThisMonth: number; record: typeof ATTENDANCE_RECORDS[0] })[];
  }, [today, filteredStudents]);

  // Teacher activity today
  const teacherActivities = useMemo(() => getTeacherActivityForDate(today, campusFilter !== 'all' ? campusFilter : undefined), [today, campusFilter]);

  const activeTeacherCount = useMemo(() => teacherActivities.filter(a => a.totalMinutes > 0).length, [teacherActivities]);

  // Chronic absence (last 30 days, <85%)
  const chronicAbsent = useMemo(() => {
    const last30 = getRecentWeekdays(22); // ~22 school days in 30 calendar days
    return filteredStudents
      .map(student => {
        const records = ATTENDANCE_RECORDS.filter(r => r.studentId === student.id && last30.includes(r.date));
        const total = records.length;
        if (total === 0) return null;
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        const rate = Math.round((present / total) * 100);
        return rate < 85 ? { student, rate, total, present } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.rate - b!.rate) as { student: ExtendedStudent; rate: number; total: number; present: number }[];
  }, [filteredStudents]);

  // Day-of-week pattern (last 30 days)
  const dayOfWeekPattern = useMemo(() => {
    const dayNames = locale === 'ar'
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    // Map JS day: 0=Sun,1=Mon,...4=Thu
    const dayIndices = [0, 1, 2, 3, 4];
    const daySums: { total: number; present: number; count: number }[] = dayIndices.map(() => ({ total: 0, present: 0, count: 0 }));

    const last30 = getRecentWeekdays(22);
    for (const dateStr of last30) {
      const d = new Date(dateStr + 'T00:00:00');
      const jsDay = d.getDay(); // 0=Sun
      const idx = dayIndices.indexOf(jsDay);
      if (idx === -1) continue;
      const summary = getDailySummary(dateStr, campusFilter !== 'all' ? campusFilter : undefined);
      daySums[idx].total += summary.totalStudents;
      daySums[idx].present += summary.present + summary.late;
      daySums[idx].count += 1;
    }

    return dayIndices.map((_, i) => ({
      name: dayNames[i],
      rate: daySums[i].total > 0 ? Math.round((daySums[i].present / daySums[i].total) * 100) : 0,
    }));
  }, [campusFilter, locale]);

  const worstDay = useMemo(() => {
    if (dayOfWeekPattern.length === 0) return -1;
    let minIdx = 0;
    for (let i = 1; i < dayOfWeekPattern.length; i++) {
      if (dayOfWeekPattern[i].rate < dayOfWeekPattern[minIdx].rate) minIdx = i;
    }
    return minIdx;
  }, [dayOfWeekPattern]);

  // Campus comparison cards
  const campusCards = useMemo(() => {
    return CAMPUSES.map(campus => {
      const summary = getDailySummary(today, campus.id);
      const students = EXTENDED_STUDENTS.filter(s => s.campusId === campus.id).length;
      const teachers = EXTENDED_TEACHERS.filter(t => t.campusId === campus.id).length;
      return { ...campus, summary, studentCount: students, teacherCount: teachers };
    });
  }, [today]);

  // ── Handlers ──
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const handleExcuse = useCallback((studentId: string, reason: string) => {
    setExcuseDropdown(null);
    showToast(t(`تم إعفاء الطالب - ${reason}`, `Student excused - ${reason}`));
  }, [showToast, t]);

  const initMarkAttendance = useCallback(() => {
    const grade = gradesAvailable[0] || 1;
    setMarkGrade(grade);
    setMarkSection('A');
    const students = filteredStudents.filter(s => s.grade === grade && s.section === 'A');
    const statuses: Record<string, { status: AttendanceStatus; lateTime?: string }> = {};
    students.forEach(s => { statuses[s.id] = { status: 'present' }; });
    setMarkStatuses(statuses);
    setShowMarkPanel(true);
  }, [gradesAvailable, filteredStudents]);

  const updateMarkClass = useCallback((grade: number, section: string) => {
    setMarkGrade(grade);
    setMarkSection(section);
    const students = filteredStudents.filter(s => s.grade === grade && s.section === section);
    const statuses: Record<string, { status: AttendanceStatus; lateTime?: string }> = {};
    students.forEach(s => { statuses[s.id] = { status: 'present' }; });
    setMarkStatuses(statuses);
  }, [filteredStudents]);

  // ── Trend ──
  const trendDiff = todaySummary.rate - yesterdaySummary.rate;
  const trendUp = trendDiff >= 0;

  // ── Avg late arrival time ──
  const avgLateTime = useMemo(() => {
    const lateRecords = ATTENDANCE_RECORDS.filter(r => r.date === today && r.status === 'late' && r.lateTime);
    if (lateRecords.length === 0) return '--:--';
    const totalMin = lateRecords.reduce((sum, r) => {
      const [h, m] = (r.lateTime || '07:30').split(':').map(Number);
      return sum + h * 60 + m;
    }, 0);
    const avg = Math.round(totalMin / lateRecords.length);
    const hh = Math.floor(avg / 60).toString().padStart(2, '0');
    const mm = (avg % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }, [today]);

  // ── Heatmap color helper ──
  const cellColor = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (rate >= 85) return 'bg-lime-100 text-lime-800 border-lime-200';
    if (rate >= 75) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };
  const cellColorDot = (rate: number) => {
    if (rate >= 95) return 'bg-emerald-500';
    if (rate >= 85) return 'bg-lime-500';
    if (rate >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // ── Student Modal Data ──
  const modalStudent = useMemo(() => {
    if (!studentModal) return null;
    const student = getStudentById(studentModal);
    if (!student) return null;
    const last30 = getRecentWeekdays(22);
    const records = getStudentAttendance(student.id);
    const recentRecords = records.filter(r => last30.includes(r.date));
    const totalDays = recentRecords.length;
    const presentDays = recentRecords.filter(r => r.status === 'present').length;
    const absentDays = recentRecords.filter(r => r.status === 'absent').length;
    const lateDays = recentRecords.filter(r => r.status === 'late').length;
    const rate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;
    const campus = CAMPUSES.find(c => c.id === student.campusId);
    // Build calendar grid of last 30 actual days
    const calendarDays: { date: string; status: AttendanceStatus | 'weekend' | 'none' }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      if (isWeekend(d)) {
        calendarDays.push({ date: ds, status: 'weekend' });
      } else {
        const rec = records.find(r => r.date === ds);
        calendarDays.push({ date: ds, status: rec ? rec.status : 'none' });
      }
    }
    return { student, presentDays, absentDays, lateDays, rate, totalDays, campus, calendarDays };
  }, [studentModal]);

  // ── Render ──
  return (
    <div className="p-4 lg:p-8 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{t('الحضور والغياب', 'Attendance')}</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">{t('متابعة يومية شاملة', 'Comprehensive daily monitoring')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all text-sm font-bold text-slate-700"
          >
            <FileText className="w-4 h-4" />
            {t('التقارير', 'Reports')}
          </button>
          <button
            onClick={initMarkAttendance}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all text-sm font-bold"
          >
            <UserCheck className="w-4 h-4" />
            {t('تسجيل الحضور', 'Mark Attendance')}
          </button>
        </div>
      </div>

      {/* ═══ CAMPUS FILTER BAR ═══ */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-500">{t('المبنى', 'Campus')}</label>
          <div className="relative">
            <select
              value={campusFilter}
              onChange={e => { setCampusFilter(e.target.value); setExpandedCell(null); }}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pe-9 text-sm font-bold text-slate-700 hover:border-sky-300 focus:ring-2 focus:ring-sky-200 focus:border-sky-400 outline-none transition-all cursor-pointer"
            >
              <option value="all">{t('جميع المباني', 'All Campuses')}</option>
              {CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{locale === 'ar' ? c.name : c.nameEn}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
          </div>
        </div>

        {/* Campus comparison cards (only when "all") */}
        <AnimatePresence>
          {campusFilter === 'all' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {campusCards.map((campus, i) => {
                const borderColor = campus.type === 'boys' ? 'border-s-blue-500' : campus.type === 'girls' ? 'border-s-pink-500' : 'border-s-violet-500';
                return (
                  <motion.div
                    key={campus.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    onClick={() => setCampusFilter(campus.id)}
                    className={`bg-white rounded-2xl border border-slate-100 border-s-4 ${borderColor} p-4 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-slate-900">{locale === 'ar' ? campus.name : campus.nameEn}</h3>
                      <div className={`w-2.5 h-2.5 rounded-full ${campus.summary.rate >= 90 ? 'bg-emerald-400' : campus.summary.rate >= 80 ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-black text-slate-900">{campus.studentCount}</div>
                        <div className="text-[10px] font-bold text-slate-400">{t('طالب', 'Students')}</div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900">{campus.teacherCount}</div>
                        <div className="text-[10px] font-bold text-slate-400">{t('معلم', 'Teachers')}</div>
                      </div>
                      <div>
                        <div className={`text-lg font-black ${campus.summary.rate >= 90 ? 'text-emerald-600' : campus.summary.rate >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {campus.summary.rate}%
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">{t('الحضور', 'Rate')}</div>
                      </div>
                    </div>
                    <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${campus.summary.rate}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full ${campus.summary.rate >= 90 ? 'bg-emerald-500' : campus.summary.rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ STATS BAR ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">{t('الحاضرون', 'Present')}</div>
              <div className="text-2xl font-black text-emerald-600">{todaySummary.present + todaySummary.late}</div>
              <div className="text-[11px] font-medium text-slate-400">{t(`من ${todaySummary.totalStudents} طالب`, `of ${todaySummary.totalStudents} students`)}</div>
            </div>
            <RingChart value={todaySummary.present + todaySummary.late} max={todaySummary.totalStudents} color="#10b981" />
          </div>
        </motion.div>

        {/* Absent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">{t('الغائبون', 'Absent')}</div>
              <div className="text-2xl font-black text-rose-600">{todaySummary.absent}</div>
              <div className="text-[11px] font-medium text-slate-400">{t('طالب غائب اليوم', 'absent today')}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-rose-500" />
            </div>
          </div>
        </motion.div>

        {/* Late */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">{t('المتأخرون', 'Late')}</div>
              <div className="text-2xl font-black text-amber-600">{todaySummary.late}</div>
              <div className="text-[11px] font-medium text-slate-400">{t(`متوسط الوصول ${avgLateTime}`, `Avg arrival ${avgLateTime}`)}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </motion.div>

        {/* Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">{t('الاتجاه', 'Trend')}</div>
              <div className={`text-2xl font-black ${trendUp ? 'text-sky-600' : 'text-rose-600'}`}>
                {todaySummary.rate}%
              </div>
              <div className={`text-[11px] font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trendDiff >= 0 ? '+' : ''}{trendDiff.toFixed(1)}% {t('عن الأمس', 'vs yesterday')}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-sky-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ HEATMAP (HERO WIDGET) ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('خريطة الحضور حسب الصف', 'Attendance Heatmap by Grade')}</h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">{t('اضغط على خلية لعرض التفاصيل', 'Click a cell to view details')}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200" /> 95%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-200" /> 85-95%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200" /> 75-85%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-200" /> &lt;75%</span>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="text-xs font-bold text-slate-400 text-start px-2 pb-2 w-24">{t('الصف', 'Grade')}</th>
                {sectionsAvailable.map(sec => (
                  <th key={sec} className="text-xs font-bold text-slate-400 pb-2">{t(`شعبة ${sec}`, `Section ${sec}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gradesAvailable.map((grade, gi) => (
                <React.Fragment key={grade}>
                  <tr>
                    <td className="text-sm font-black text-slate-700 px-2">{t(`الصف ${grade}`, `Grade ${grade}`)}</td>
                    {sectionsAvailable.map((section, si) => {
                      const ca = heatmapData[gi]?.[si];
                      if (!ca || ca.totalStudents === 0) {
                        return <td key={section} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center text-xs text-slate-300">—</td>;
                      }
                      const isExpanded = expandedCell?.grade === grade && expandedCell?.section === section;
                      return (
                        <td key={section}>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setExpandedCell(isExpanded ? null : { grade, section })}
                            className={`w-full rounded-xl border p-3 text-center transition-all cursor-pointer ${cellColor(ca.rate)} ${isExpanded ? 'ring-2 ring-sky-400 shadow-md' : 'hover:shadow-sm'}`}
                          >
                            <div className="text-lg font-black">{ca.rate}%</div>
                            <div className="text-[11px] font-bold opacity-70">{ca.present + ca.late}/{ca.totalStudents}</div>
                          </motion.button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded detail row */}
                  <AnimatePresence>
                    {expandedCell?.grade === grade && (
                      <tr>
                        <td colSpan={1 + sectionsAvailable.length}>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-1"
                          >
                            {(() => {
                              const sec = expandedCell.section;
                              const ca = getClassAttendance(today, grade, sec, campusFilter !== 'all' ? campusFilter : undefined);
                              const classStudents = filteredStudents.filter(s => s.grade === grade && s.section === sec);
                              const recordsMap = new Map(
                                ATTENDANCE_RECORDS.filter(r => r.date === today && classStudents.some(s => s.id === r.studentId))
                                  .map(r => [r.studentId, r])
                              );
                              // Find teacher for this class
                              const classTeacher = filteredTeachers.find(t => t.grades.includes(grade));

                              return (
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-black text-slate-800">
                                      {t(`الصف ${grade} - شعبة ${sec}`, `Grade ${grade} - Section ${sec}`)}
                                      {classTeacher && <span className="text-slate-400 font-medium ms-2">({classTeacher.name})</span>}
                                    </h3>
                                    <button onClick={() => setExpandedCell(null)} className="text-slate-400 hover:text-slate-600">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex gap-4 mb-3 text-xs font-bold">
                                    <span className="text-emerald-600">{t(`${ca.present} حاضر`, `${ca.present} present`)}</span>
                                    <span className="text-rose-600">{t(`${ca.absent} غائب`, `${ca.absent} absent`)}</span>
                                    <span className="text-amber-600">{t(`${ca.late} متأخر`, `${ca.late} late`)}</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {classStudents.map(student => {
                                      const rec = recordsMap.get(student.id);
                                      const status = rec?.status || 'present';
                                      const statusIcon = status === 'present'
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        : status === 'absent'
                                          ? <XCircle className="w-4 h-4 text-rose-500" />
                                          : <Clock className="w-4 h-4 text-amber-500" />;
                                      return (
                                        <div key={student.id}
                                          className="flex items-center gap-2 bg-white rounded-lg border border-slate-100 px-3 py-2 hover:border-sky-200 transition-all"
                                        >
                                          {statusIcon}
                                          <button onClick={() => setStudentModal(student.id)} className="text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors text-start">
                                            {student.name}
                                          </button>
                                          {status === 'late' && rec?.lateTime && (
                                            <span className="text-[10px] font-medium text-amber-500 ms-auto">{rec.lateTime}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══ BOTTOM ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Absent Students List ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              {t('الغائبون اليوم', 'Absent Today')}
              <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[11px] font-black">{absentStudents.length}</span>
            </h2>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 pe-1 scrollbar-thin">
            {absentStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">{t('لا يوجد غياب اليوم', 'No absences today')}</div>
            ) : (
              absentStudents.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-rose-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <button onClick={() => setStudentModal(item.id)} className="text-sm font-bold text-slate-800 hover:text-sky-600 transition-colors truncate block">
                      {item.name}
                    </button>
                    <div className="text-[11px] font-medium text-slate-400">
                      {t(`الصف ${item.grade}${item.section}`, `Grade ${item.grade}${item.section}`)}
                      {item.parentName && <> · {item.parentName}</>}
                    </div>
                    <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                      {t(`${item.absentDaysThisMonth} أيام غياب هذا الشهر`, `${item.absentDaysThisMonth} absent days this month`)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ms-2">
                    <button
                      onClick={() => showToast(t('تم إخطار ولي الأمر', 'Parent notified'))}
                      className="text-[10px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Bell className="w-3 h-3 inline-block me-0.5" />
                      {t('إخطار', 'Notify')}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setExcuseDropdown(excuseDropdown === item.id ? null : item.id)}
                        className="text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        {t('إعفاء', 'Excuse')}
                      </button>
                      <AnimatePresence>
                        {excuseDropdown === item.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute end-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 min-w-[140px] py-1"
                          >
                            {[
                              { key: 'مرض', en: 'Illness' },
                              { key: 'عائلي', en: 'Family' },
                              { key: 'موعد طبي', en: 'Medical' },
                              { key: 'أخرى', en: 'Other' },
                            ].map(reason => (
                              <button
                                key={reason.key}
                                onClick={() => handleExcuse(item.id, t(reason.key, reason.en))}
                                className="block w-full text-start px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                {t(reason.key, reason.en)}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ── Teacher Activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              {t('نشاط المعلمين', 'Teacher Activity')}
            </h2>
            <span className="text-xs font-black text-sky-600">
              {activeTeacherCount} / {filteredTeachers.length} {t('نشطون اليوم', 'active today')}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 pe-1 scrollbar-thin">
            {filteredTeachers.map(teacher => {
              const activity = teacherActivities.find(a => a.teacherId === teacher.id);
              const mins = activity?.totalMinutes || 0;
              const barColor = mins >= 120 ? 'bg-emerald-500' : mins >= 30 ? 'bg-amber-500' : 'bg-rose-400';
              const barPct = Math.min((mins / 300) * 100, 100);
              const isExpTch = expandedTeacher === teacher.id;
              return (
                <div key={teacher.id}>
                  <button
                    onClick={() => setExpandedTeacher(isExpTch ? null : teacher.id)}
                    className={`w-full flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-sky-50/50 transition-all text-start ${isExpTch ? 'ring-1 ring-sky-300' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{teacher.name}</div>
                      <div className="text-[10px] font-medium text-slate-400">{teacher.subject}</div>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }} transition={{ duration: 0.6 }}
                          className={`h-full rounded-full ${barColor}`} />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 text-end">
                        {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpTch && activity && activity.actions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-sky-50/50 rounded-lg border border-sky-100 mx-2 mt-1 mb-1 px-3 py-2 space-y-1"
                      >
                        <div className="text-[10px] font-black text-slate-500 mb-1">{t('سجل النشاط', 'Activity Timeline')}</div>
                        {activity.actions.slice(0, 6).map((action, ai) => (
                          <div key={ai} className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono text-slate-400 w-12 shrink-0">{action.timestamp.split('T')[1]?.slice(0, 5)}</span>
                            <span className="font-bold text-slate-700">{ACTION_LABELS[action.type]}</span>
                            {action.details && <span className="text-slate-400 truncate">{action.details}</span>}
                          </div>
                        ))}
                        {activity.actions.length > 6 && (
                          <div className="text-[10px] text-slate-400 font-medium">+{activity.actions.length - 6} {t('إجراءات أخرى', 'more')}</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Chronic Absence Alert ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              {t('تنبيه الغياب المزمن', 'Chronic Absence Alert')}
            </h2>
            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[11px] font-black">{chronicAbsent.length}</span>
          </div>
          {chronicAbsent.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm font-medium">{t('لا يوجد تنبيهات', 'No alerts')}</div>
          ) : (
            <div className="space-y-2">
              {chronicAbsent.slice(0, 5).map(item => (
                <div key={item.student.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <button onClick={() => setStudentModal(item.student.id)} className="text-xs font-bold text-slate-800 hover:text-sky-600 transition-colors truncate block">
                      {item.student.name}
                    </button>
                    <div className="text-[10px] font-medium text-slate-400">
                      {t(`الصف ${item.student.grade}${item.student.section}`, `Grade ${item.student.grade}${item.student.section}`)}
                    </div>
                  </div>
                  <div className={`text-sm font-black ${item.rate < 70 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {item.rate}%
                  </div>
                  <div className={`w-1.5 h-8 rounded-full ms-2 ${item.rate < 70 ? 'bg-rose-400' : 'bg-amber-400'}`} />
                </div>
              ))}
              {chronicAbsent.length > 5 && (
                <div className="text-center text-[11px] font-bold text-slate-400 pt-1">
                  +{chronicAbsent.length - 5} {t('طلاب آخرون', 'more students')}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Day of Week Pattern ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-500" />
              {t('نمط أيام الأسبوع', 'Day-of-Week Pattern')}
            </h2>
            <span className="text-[10px] font-bold text-slate-400">{t('آخر ٣٠ يوم', 'Last 30 days')}</span>
          </div>
          <div className="flex items-end justify-around gap-2 h-36 pt-4">
            {dayOfWeekPattern.map((day, i) => {
              const isWorst = i === worstDay;
              const barH = Math.max((day.rate / 100) * 100, 8);
              const barCol = isWorst ? 'bg-rose-400' : day.rate >= 90 ? 'bg-emerald-400' : 'bg-amber-400';
              return (
                <div key={day.name} className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-[11px] font-black text-slate-700">{day.rate}%</div>
                  <div className="w-full flex justify-center">
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: `${barH}px` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                      className={`w-8 rounded-t-lg ${barCol}`}
                    />
                  </div>
                  <div className={`text-[10px] font-bold ${isWorst ? 'text-rose-600' : 'text-slate-500'}`}>
                    {day.name}
                    {isWorst && <AlertTriangle className="w-3 h-3 inline-block ms-0.5 text-rose-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══ MARK ATTENDANCE PANEL ═══ */}
      <AnimatePresence>
        {showMarkPanel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center"
            onClick={() => setShowMarkPanel(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">{t('تسجيل الحضور', 'Mark Attendance')}</h2>
                <button onClick={() => setShowMarkPanel(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Grade + Section selectors */}
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('الصف', 'Grade')}</label>
                  <select
                    value={markGrade || ''}
                    onChange={e => updateMarkClass(Number(e.target.value), markSection)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {gradesAvailable.map(g => <option key={g} value={g}>{t(`الصف ${g}`, `Grade ${g}`)}</option>)}
                  </select>
                </div>
                <div className="w-28">
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('الشعبة', 'Section')}</label>
                  <select
                    value={markSection}
                    onChange={e => updateMarkClass(markGrade || gradesAvailable[0], e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {sectionsAvailable.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Student list */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                {filteredStudents
                  .filter(s => s.grade === markGrade && s.section === markSection)
                  .map(student => {
                    const st = markStatuses[student.id] || { status: 'present' as AttendanceStatus };
                    return (
                      <div key={student.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                        <span className="text-sm font-bold text-slate-800 truncate flex-1 min-w-0">{student.name}</span>
                        <div className="flex items-center gap-1 shrink-0 ms-2">
                          {/* Present */}
                          <button
                            onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: { status: 'present' } }))}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-black ${
                              st.status === 'present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50'
                            }`}
                          >
                            ✓
                          </button>
                          {/* Absent */}
                          <button
                            onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: { status: 'absent' } }))}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-black ${
                              st.status === 'absent' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-rose-50'
                            }`}
                          >
                            ✗
                          </button>
                          {/* Late */}
                          <button
                            onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: { status: 'late', lateTime: '07:30' } }))}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
                              st.status === 'late' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-amber-50'
                            }`}
                          >
                            ⏰
                          </button>
                          {/* Late time picker */}
                          {st.status === 'late' && (
                            <input
                              type="time"
                              value={st.lateTime || '07:30'}
                              onChange={e => setMarkStatuses(prev => ({ ...prev, [student.id]: { status: 'late', lateTime: e.target.value } }))}
                              className="text-[11px] font-mono bg-white border border-amber-200 rounded-lg px-1.5 py-1 w-[70px] outline-none focus:ring-1 focus:ring-amber-300"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Save button */}
              <div className="p-5 border-t border-slate-100 bg-white">
                {(() => {
                  const entries = Object.values(markStatuses) as { status: AttendanceStatus; lateTime?: string }[];
                  const presentCount = entries.filter(e => e.status === 'present').length;
                  const absentCount = entries.filter(e => e.status === 'absent').length;
                  const lateCount = entries.filter(e => e.status === 'late').length;
                  return (
                    <div>
                      <div className="flex justify-center gap-4 text-[11px] font-bold mb-3">
                        <span className="text-emerald-600">{t(`${presentCount} حاضر`, `${presentCount} present`)}</span>
                        <span className="text-rose-600">{t(`${absentCount} غائب`, `${absentCount} absent`)}</span>
                        <span className="text-amber-600">{t(`${lateCount} متأخر`, `${lateCount} late`)}</span>
                      </div>
                      <button
                        onClick={() => { setShowMarkPanel(false); showToast(t('تم حفظ الحضور بنجاح', 'Attendance saved successfully')); }}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all"
                      >
                        {t('حفظ', 'Save')}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ STUDENT ATTENDANCE MODAL ═══ */}
      <AnimatePresence>
        {studentModal && modalStudent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setStudentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Modal header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{modalStudent.student.name}</h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      {t(`الصف ${modalStudent.student.grade}${modalStudent.student.section}`, `Grade ${modalStudent.student.grade}${modalStudent.student.section}`)}
                      {modalStudent.campus && <> · {locale === 'ar' ? modalStudent.campus.name : modalStudent.campus.nameEn}</>}
                    </p>
                  </div>
                  <button onClick={() => setStudentModal(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 p-5 border-b border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-black text-emerald-600">{modalStudent.presentDays}</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('حاضر', 'Present')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-rose-600">{modalStudent.absentDays}</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('غائب', 'Absent')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-amber-600">{modalStudent.lateDays}</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('متأخر', 'Late')}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-black ${modalStudent.rate >= 85 ? 'text-sky-600' : 'text-rose-600'}`}>{modalStudent.rate}%</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('النسبة', 'Rate')}</div>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="p-5">
                <h3 className="text-xs font-black text-slate-700 mb-3">{t('آخر ٣٠ يوم', 'Last 30 Days')}</h3>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {(locale === 'ar'
                    ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
                    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  ).map(d => (
                    <div key={d} className="text-[9px] font-bold text-slate-400 text-center">{d}</div>
                  ))}
                  {/* Fill empty cells for alignment */}
                  {(() => {
                    const firstDate = new Date(modalStudent.calendarDays[0].date + 'T00:00:00');
                    const startDay = firstDate.getDay(); // 0=Sun
                    const empties = [];
                    for (let i = 0; i < startDay; i++) empties.push(<div key={`e-${i}`} />);
                    return empties;
                  })()}
                  {modalStudent.calendarDays.map(day => {
                    const dayNum = new Date(day.date + 'T00:00:00').getDate();
                    const bg =
                      day.status === 'present' ? 'bg-emerald-400 text-white' :
                      day.status === 'absent' ? 'bg-rose-400 text-white' :
                      day.status === 'late' ? 'bg-amber-400 text-white' :
                      day.status === 'weekend' ? 'bg-slate-100 text-slate-300' :
                      'bg-slate-50 text-slate-300';
                    return (
                      <div
                        key={day.date}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${bg}`}
                        title={`${day.date}: ${day.status}`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-3 mt-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" />{t('حاضر', 'Present')}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-400" />{t('غائب', 'Absent')}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" />{t('متأخر', 'Late')}</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100" />{t('عطلة', 'Weekend')}</span>
                </div>
              </div>

              {/* Parent info + actions */}
              <div className="p-5 border-t border-slate-100 space-y-3">
                {modalStudent.student.parentName && (
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700">{modalStudent.student.parentName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { showToast(t('تم إرسال الإشعار', 'Notification sent')); setStudentModal(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:shadow-xl transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    {t('إرسال إشعار', 'Send Notification')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOAST ═══ */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>
    </div>
  );
};
