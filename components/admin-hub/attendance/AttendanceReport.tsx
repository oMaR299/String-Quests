import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Download, FileSpreadsheet, FileText,
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Filter, BarChart3, Clock, AlertTriangle, Users,
} from 'lucide-react';
import {
  CAMPUSES, EXTENDED_STUDENTS, EXTENDED_TEACHERS,
  ATTENDANCE_RECORDS, TEACHER_ACTIVITIES, getTodayString,
} from '../../../data/mockAttendanceData';
import type { AttendanceRecord } from '../../../types/admin';

// ─── Props ─────────────────────────────────────────────────────────

interface AttendanceReportProps {
  locale: 'ar' | 'en';
  onBack: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────

function t(locale: 'ar' | 'en', ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 5 || day === 6;
}

function getSchoolDaysInRange(from: string, to: string): string[] {
  const days: string[] = [];
  const start = parseDate(from);
  const end = parseDate(to);
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur)) days.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function getStudentMap() {
  const map = new Map<string, typeof EXTENDED_STUDENTS[0]>();
  for (const s of EXTENDED_STUDENTS) map.set(s.id, s);
  return map;
}

function getTeacherMap() {
  const map = new Map<string, typeof EXTENDED_TEACHERS[0]>();
  for (const t of EXTENDED_TEACHERS) map.set(t.id, t);
  return map;
}

const STUDENT_MAP = getStudentMap();
const TEACHER_MAP = getTeacherMap();

function getAttendanceInRange(
  from: string, to: string,
  campusId?: string, grade?: number | null, section?: string | null,
): AttendanceRecord[] {
  const studentIds = new Set<string>();
  for (const s of EXTENDED_STUDENTS) {
    if (campusId && campusId !== 'all' && s.campusId !== campusId) continue;
    if (grade && s.grade !== grade) continue;
    if (section && s.section !== section) continue;
    studentIds.add(s.id);
  }
  return ATTENDANCE_RECORDS.filter(
    r => r.date >= from && r.date <= to && studentIds.has(r.studentId),
  );
}

function rateColor(rate: number) {
  if (rate >= 95) return 'bg-emerald-500';
  if (rate >= 85) return 'bg-amber-400';
  return 'bg-rose-500';
}

function rateTextColor(rate: number) {
  if (rate >= 95) return 'text-emerald-600';
  if (rate >= 85) return 'text-amber-600';
  return 'text-rose-600';
}

function shortDate(d: string, locale: 'ar' | 'en') {
  const dt = parseDate(d);
  return dt.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
}

const DAY_NAMES_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

function getDayOfWeekStats(records: AttendanceRecord[], schoolDays: string[]) {
  const byDay: Record<number, { total: number; attended: number }> = {};
  for (let i = 0; i <= 4; i++) byDay[i] = { total: 0, attended: 0 };
  for (const day of schoolDays) {
    const dt = parseDate(day);
    const dow = dt.getDay(); // 0=Sun..4=Thu
    if (dow > 4) continue;
    const dayRecords = records.filter(r => r.date === day);
    byDay[dow].total += dayRecords.length;
    byDay[dow].attended += dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  }
  return Array.from({ length: 5 }, (_, i) => ({
    day: i,
    rate: byDay[i].total > 0 ? Math.round((byDay[i].attended / byDay[i].total) * 1000) / 10 : 0,
  }));
}

// ─── Sub-Components ────────────────────────────────────────────────

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ locale, onBack }) => {
  const isRtl = locale === 'ar';
  const today = getTodayString();

  // ── Date Range ─────────────────────────────────────────────────
  const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { dateFrom, dateTo } = useMemo(() => {
    const todayDate = parseDate(today);
    if (preset === 'today') return { dateFrom: today, dateTo: today };
    if (preset === 'week') {
      const start = new Date(todayDate);
      start.setDate(todayDate.getDate() - todayDate.getDay());
      return { dateFrom: formatDate(start), dateTo: today };
    }
    if (preset === 'custom' && customFrom && customTo) {
      return { dateFrom: customFrom, dateTo: customTo };
    }
    // month (default)
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - 29);
    return { dateFrom: formatDate(start), dateTo: today };
  }, [preset, today, customFrom, customTo]);

  // ── Filters ────────────────────────────────────────────────────
  const [campusId, setCampusId] = useState('all');
  const [grade, setGrade] = useState<number | null>(null);
  const [section, setSection] = useState<string | null>(null);

  // ── Tab State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [minRateFilter, setMinRateFilter] = useState<number>(0);
  const PAGE_SIZE = 20;

  // ── Computed Data ──────────────────────────────────────────────
  const schoolDays = useMemo(() => getSchoolDaysInRange(dateFrom, dateTo), [dateFrom, dateTo]);

  const filteredRecords = useMemo(
    () => getAttendanceInRange(dateFrom, dateTo, campusId, grade, section),
    [dateFrom, dateTo, campusId, grade, section],
  );

  // Available grades based on campus
  const availableGrades = useMemo(() => {
    const grades = new Set<number>();
    for (const s of EXTENDED_STUDENTS) {
      if (campusId === 'all' || s.campusId === campusId) grades.add(s.grade);
    }
    return Array.from(grades).sort((a, b) => a - b);
  }, [campusId]);

  // ── Chart 1: Daily Attendance Trend ────────────────────────────
  const dailyTrend = useMemo(() => {
    return schoolDays.map(day => {
      const dayRecs = filteredRecords.filter(r => r.date === day);
      const total = dayRecs.length;
      const attended = dayRecs.filter(r => r.status === 'present' || r.status === 'late').length;
      const rate = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
      return { date: day, total, attended, absent: total - attended, rate };
    });
  }, [schoolDays, filteredRecords]);

  // ── Chart 2: Attendance by Grade ───────────────────────────────
  const gradeStats = useMemo(() => {
    const stats: { grade: number; rate: number; total: number; attended: number }[] = [];
    const gradesSet = new Set<number>();
    for (const s of EXTENDED_STUDENTS) {
      if (campusId !== 'all' && s.campusId !== campusId) continue;
      if (section && s.section !== section) continue;
      gradesSet.add(s.grade);
    }
    for (const g of Array.from(gradesSet).sort((a, b) => a - b)) {
      const recs = getAttendanceInRange(dateFrom, dateTo, campusId, g, section);
      const total = recs.length;
      const attended = recs.filter(r => r.status === 'present' || r.status === 'late').length;
      stats.push({ grade: g, rate: total > 0 ? Math.round((attended / total) * 1000) / 10 : 0, total, attended });
    }
    return stats;
  }, [dateFrom, dateTo, campusId, section]);

  // ── Chart 3: Day of Week Pattern ──────────────────────────────
  const dayOfWeekStats = useMemo(
    () => getDayOfWeekStats(filteredRecords, schoolDays),
    [filteredRecords, schoolDays],
  );

  // ── Chart 4: Late Arrivals Distribution ───────────────────────
  const lateDistribution = useMemo(() => {
    const buckets = [
      { label: '7:00-7:15', min: 0, max: 15, count: 0 },
      { label: '7:15-7:30', min: 15, max: 30, count: 0 },
      { label: '7:30-7:45', min: 30, max: 45, count: 0 },
      { label: '7:45-8:00', min: 45, max: 60, count: 0 },
      { label: '8:00+', min: 60, max: 999, count: 0 },
    ];
    const lateRecs = filteredRecords.filter(r => r.status === 'late' && r.lateTime);
    for (const r of lateRecs) {
      const [h, m] = r.lateTime!.split(':').map(Number);
      const mins = (h - 7) * 60 + m;
      for (const b of buckets) {
        if (mins >= b.min && mins < b.max) { b.count++; break; }
      }
    }
    return buckets;
  }, [filteredRecords]);

  // ── Chart 5: Campus Comparison ────────────────────────────────
  const campusComparison = useMemo(() => {
    if (campusId !== 'all') return [];
    return CAMPUSES.map(c => {
      const recs = getAttendanceInRange(dateFrom, dateTo, c.id, grade, section);
      const total = recs.length;
      const attended = recs.filter(r => r.status === 'present' || r.status === 'late').length;
      return {
        id: c.id,
        name: locale === 'ar' ? c.name : c.nameEn,
        rate: total > 0 ? Math.round((attended / total) * 1000) / 10 : 0,
        total, attended,
      };
    });
  }, [dateFrom, dateTo, campusId, grade, section, locale]);

  // ── Chart 6: Chronic Absence Top 10 ───────────────────────────
  const chronicAbsent = useMemo(() => {
    const studentAbsence = new Map<string, { absent: number; total: number; lastAbsent: string }>();
    for (const r of filteredRecords) {
      const stu = STUDENT_MAP.get(r.studentId);
      if (!stu) continue;
      if (!studentAbsence.has(r.studentId)) {
        studentAbsence.set(r.studentId, { absent: 0, total: 0, lastAbsent: '' });
      }
      const s = studentAbsence.get(r.studentId)!;
      s.total++;
      if (r.status === 'absent') {
        s.absent++;
        if (r.date > s.lastAbsent) s.lastAbsent = r.date;
      }
    }
    return Array.from(studentAbsence.entries())
      .map(([id, d]) => ({
        id,
        student: STUDENT_MAP.get(id)!,
        ...d,
        rate: d.total > 0 ? Math.round(((d.total - d.absent) / d.total) * 1000) / 10 : 100,
      }))
      .sort((a, b) => b.absent - a.absent)
      .slice(0, 10);
  }, [filteredRecords]);

  // ── Student Table Data ─────────────────────────────────────────
  const studentTableData = useMemo(() => {
    const studentStats = new Map<string, { present: number; absent: number; late: number; total: number; lastAbsent: string }>();
    for (const r of filteredRecords) {
      if (!studentStats.has(r.studentId)) {
        studentStats.set(r.studentId, { present: 0, absent: 0, late: 0, total: 0, lastAbsent: '' });
      }
      const s = studentStats.get(r.studentId)!;
      s.total++;
      if (r.status === 'present') s.present++;
      if (r.status === 'absent') {
        s.absent++;
        if (r.date > s.lastAbsent) s.lastAbsent = r.date;
      }
      if (r.status === 'late') s.late++;
    }
    return Array.from(studentStats.entries()).map(([id, stats]) => {
      const stu = STUDENT_MAP.get(id);
      if (!stu) return null;
      const campus = CAMPUSES.find(c => c.id === stu.campusId);
      return {
        id,
        name: locale === 'ar' ? stu.name : stu.nameEn,
        grade: stu.grade,
        section: stu.section,
        campus: campus ? (locale === 'ar' ? campus.name : campus.nameEn) : '',
        campusId: stu.campusId,
        totalDays: stats.total,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        rate: stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 1000) / 10 : 0,
        lastAbsent: stats.lastAbsent,
      };
    }).filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.map>[number]>[];
  }, [filteredRecords, locale]);

  // Filter + sort + paginate student table
  const processedStudentData = useMemo(() => {
    let data = [...studentTableData] as typeof studentTableData;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter(d => (d as any).name.toLowerCase().includes(q));
    }
    // Min rate filter
    if (minRateFilter > 0) {
      data = data.filter(d => (d as any).rate < minRateFilter);
    }
    // Sort
    data.sort((a: any, b: any) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [studentTableData, searchQuery, minRateFilter, sortCol, sortDir]);

  const totalStudentPages = Math.max(1, Math.ceil(processedStudentData.length / PAGE_SIZE));
  const pagedStudentData = processedStudentData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Teacher Table Data ────────────────────────────────────────
  const teacherTableData = useMemo(() => {
    const teacherStats = new Map<string, { totalMinutes: number; daysActive: number; actionsCount: number; lastActive: string }>();
    const activities = TEACHER_ACTIVITIES.filter(a => a.date >= dateFrom && a.date <= dateTo);
    for (const a of activities) {
      const teacher = TEACHER_MAP.get(a.teacherId);
      if (!teacher) continue;
      if (campusId !== 'all' && teacher.campusId !== campusId) continue;
      if (!teacherStats.has(a.teacherId)) {
        teacherStats.set(a.teacherId, { totalMinutes: 0, daysActive: 0, actionsCount: 0, lastActive: '' });
      }
      const s = teacherStats.get(a.teacherId)!;
      s.totalMinutes += a.totalMinutes;
      if (a.totalMinutes > 0) s.daysActive++;
      s.actionsCount += a.actions.length;
      if (a.date > s.lastActive) s.lastActive = a.date;
    }
    return Array.from(teacherStats.entries()).map(([id, stats]) => {
      const teacher = TEACHER_MAP.get(id);
      if (!teacher) return null;
      const campus = CAMPUSES.find(c => c.id === teacher.campusId);
      const totalHours = Math.round((stats.totalMinutes / 60) * 10) / 10;
      const avgDaily = stats.daysActive > 0 ? Math.round((totalHours / stats.daysActive) * 10) / 10 : 0;
      return {
        id,
        name: locale === 'ar' ? teacher.name : teacher.nameEn,
        subject: locale === 'ar' ? teacher.subject : teacher.subjectEn,
        campus: campus ? (locale === 'ar' ? campus.name : campus.nameEn) : '',
        spaces: teacher.spaces.length,
        totalHours,
        avgDailyHours: avgDaily,
        actionsCount: stats.actionsCount,
        lastActive: stats.lastActive,
        inactive: totalHours === 0,
      };
    }).filter(Boolean) as NonNullable<any>[];
  }, [dateFrom, dateTo, campusId, locale]);

  // Teacher sort
  const [teacherSortCol, setTeacherSortCol] = useState('name');
  const [teacherSortDir, setTeacherSortDir] = useState<'asc' | 'desc'>('asc');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);

  const processedTeacherData = useMemo(() => {
    let data = [...teacherTableData];
    if (teacherSearch.trim()) {
      const q = teacherSearch.trim().toLowerCase();
      data = data.filter((d: any) => d.name.toLowerCase().includes(q));
    }
    data.sort((a: any, b: any) => {
      let va = a[teacherSortCol];
      let vb = b[teacherSortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return teacherSortDir === 'asc' ? -1 : 1;
      if (va > vb) return teacherSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [teacherTableData, teacherSearch, teacherSortCol, teacherSortDir]);

  const totalTeacherPages = Math.max(1, Math.ceil(processedTeacherData.length / PAGE_SIZE));
  const pagedTeacherData = processedTeacherData.slice((teacherPage - 1) * PAGE_SIZE, teacherPage * PAGE_SIZE);

  // ── Sort Handler ──────────────────────────────────────────────
  const handleSort = useCallback((col: string) => {
    if (activeTab === 'students') {
      setSortCol(prev => { if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setSortDir('asc'); return col; });
    } else {
      setTeacherSortCol(prev => { if (prev === col) { setTeacherSortDir(d => d === 'asc' ? 'desc' : 'asc'); return prev; } setTeacherSortDir('asc'); return col; });
    }
    if (activeTab === 'students') setPage(1);
    else setTeacherPage(1);
  }, [activeTab]);

  // ── Download CSV ──────────────────────────────────────────────
  const downloadCSV = useCallback(() => {
    const BOM = '\ufeff';
    const schoolName = t(locale, 'مدارس سترنج', 'String Schools');
    const rangeLabel = `${dateFrom} - ${dateTo}`;
    const filterLabel = [
      campusId !== 'all' ? CAMPUSES.find(c => c.id === campusId)?.[locale === 'ar' ? 'name' : 'nameEn'] : '',
      grade ? `${t(locale, 'الصف', 'Grade')} ${grade}` : '',
      section ? `${t(locale, 'الشعبة', 'Section')} ${section}` : '',
    ].filter(Boolean).join(' | ');

    const headers = [
      t(locale, 'الاسم', 'Name'),
      t(locale, 'الصف', 'Grade'),
      t(locale, 'الشعبة', 'Section'),
      t(locale, 'المبنى', 'Campus'),
      t(locale, 'أيام', 'Days'),
      t(locale, 'حضور', 'Present'),
      t(locale, 'غياب', 'Absent'),
      t(locale, 'تأخر', 'Late'),
      t(locale, 'النسبة', 'Rate%'),
      t(locale, 'آخر غياب', 'Last Absent'),
    ];
    const rows = processedStudentData.map((d: any) =>
      [d.name, d.grade, d.section, d.campus, d.totalDays, d.present, d.absent, d.late, d.rate + '%', d.lastAbsent].join(','),
    );
    const csv = BOM + `${schoolName}\n${rangeLabel}\n${filterLabel}\n\n` + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [locale, dateFrom, dateTo, campusId, grade, section, processedStudentData]);

  // ── Print PDF ─────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Render Helpers ────────────────────────────────────────────
  const SortIcon: React.FC<{ col: string; isTeacher?: boolean }> = ({ col, isTeacher }) => {
    const sc = isTeacher ? teacherSortCol : sortCol;
    const sd = isTeacher ? teacherSortDir : sortDir;
    if (sc !== col) return <ChevronDown className="w-3 h-3 text-slate-300" />;
    return sd === 'asc' ? <ChevronUp className="w-3 h-3 text-sky-500" /> : <ChevronDown className="w-3 h-3 text-sky-500" />;
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Max late count for bar scaling
  const maxLate = Math.max(...lateDistribution.map(b => b.count), 1);

  return (
    <div className="p-4 lg:p-8 space-y-6 print:p-4 print:space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:border-sky-200 transition-all print:hidden"
          >
            <BackIcon className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
              {t(locale, 'تقرير الحضور والغياب', 'Attendance Report')}
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-0.5">
              {t(locale, 'تحليل شامل للحضور والانضباط', 'Comprehensive attendance and discipline analysis')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-600 hover:border-sky-200 hover:bg-sky-50 transition-all"
          >
            <FileText className="w-4 h-4" />
            {t(locale, 'تحميل كـ PDF', 'Download PDF')}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t(locale, 'تحميل كـ Excel', 'Download Excel')}
          </button>
        </div>
      </motion.div>

      {/* ─── Date Range Picker ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 print:border-slate-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-black text-slate-700">{t(locale, 'الفترة الزمنية', 'Date Range')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'today' as const, ar: 'اليوم', en: 'Today' },
            { key: 'week' as const, ar: 'هذا الأسبوع', en: 'This Week' },
            { key: 'month' as const, ar: 'هذا الشهر', en: 'This Month' },
            { key: 'custom' as const, ar: 'مخصص', en: 'Custom' },
          ]).map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                preset === p.key
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t(locale, p.ar, p.en)}
            </button>
          ))}

          <AnimatePresence>
            {preset === 'custom' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
                <span className="text-slate-400 text-sm font-bold">{t(locale, 'إلى', 'to')}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2 text-xs font-medium text-slate-400">
          {dateFrom} &mdash; {dateTo} &middot; {schoolDays.length} {t(locale, 'يوم دراسي', 'school days')}
        </div>
      </motion.div>

      {/* ─── Filter Bar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 print:border-slate-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-black text-slate-700">{t(locale, 'التصفية', 'Filters')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Campus */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'المبنى', 'Campus')}</label>
            <select
              value={campusId}
              onChange={e => { setCampusId(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 min-w-[140px]"
            >
              <option value="all">{t(locale, 'الكل', 'All')}</option>
              {CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{locale === 'ar' ? c.name : c.nameEn}</option>
              ))}
            </select>
          </div>
          {/* Grade */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'الصف', 'Grade')}</label>
            <select
              value={grade ?? ''}
              onChange={e => { setGrade(e.target.value ? Number(e.target.value) : null); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 min-w-[100px]"
            >
              <option value="">{t(locale, 'الكل', 'All')}</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          {/* Section */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'الشعبة', 'Section')}</label>
            <select
              value={section ?? ''}
              onChange={e => { setSection(e.target.value || null); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 min-w-[100px]"
            >
              <option value="">{t(locale, 'الكل', 'All')}</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ─── Charts Dashboard ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Chart 1: Daily Attendance Trend (full width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-black text-slate-700">{t(locale, 'اتجاه الحضور اليومي', 'Daily Attendance Trend')}</h3>
          </div>
          <div className="flex items-end gap-[3px] h-48 overflow-x-auto pb-6 relative">
            {/* Y-axis labels */}
            <div className="absolute top-0 bottom-6 flex flex-col justify-between text-[9px] font-bold text-slate-300 pointer-events-none" style={{ [isRtl ? 'right' : 'left']: 0 }}>
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
            </div>
            <div className={`flex items-end gap-[3px] flex-1 ${isRtl ? 'pr-8' : 'pl-8'}`}>
              {dailyTrend.map((d, i) => {
                const barHeight = Math.max(2, ((d.rate - 60) / 40) * 100);
                const showLabel = dailyTrend.length <= 10 || i % Math.ceil(dailyTrend.length / 10) === 0;
                return (
                  <Tooltip key={d.date} text={`${shortDate(d.date, locale)}: ${d.rate}% (${d.attended}/${d.total})`}>
                    <div className="flex flex-col items-center flex-1 min-w-[18px]">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ delay: 0.2 + i * 0.02, duration: 0.5 }}
                        className={`w-full max-w-[28px] rounded-t-lg ${rateColor(d.rate)} cursor-pointer hover:opacity-80 transition-opacity`}
                        style={{ minHeight: 4 }}
                      />
                      {showLabel && (
                        <span className="text-[8px] font-bold text-slate-400 mt-1 whitespace-nowrap rotate-0 block text-center">
                          {shortDate(d.date, locale)}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Chart 2: Attendance by Grade (half) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-black text-slate-700">{t(locale, 'الحضور حسب الصف', 'Attendance by Grade')}</h3>
          </div>
          <div className="space-y-2.5">
            {gradeStats.map((g, i) => (
              <div key={g.grade} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-14 shrink-0">
                  {t(locale, `الصف ${g.grade}`, `Grade ${g.grade}`)}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.rate}%` }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.6 }}
                    className={`h-full rounded-full ${rateColor(g.rate)}`}
                  />
                </div>
                <span className={`text-xs font-black w-12 text-end ${rateTextColor(g.rate)}`}>{g.rate}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 3: Day of Week Pattern (half) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-black text-slate-700">{t(locale, 'نمط الأيام', 'Day of Week Pattern')}</h3>
          </div>
          <div className="flex items-end justify-around h-40 pt-6">
            {dayOfWeekStats.map((d, i) => {
              const minRate = Math.min(...dayOfWeekStats.map(x => x.rate));
              const isWeakest = d.rate === minRate && d.rate < 95;
              const barH = Math.max(8, ((d.rate - 60) / 40) * 100);
              const dayNames = locale === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;
              return (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-[10px] font-black ${isWeakest ? 'text-rose-500' : rateTextColor(d.rate)}`}>
                    {d.rate}%
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barH}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
                    className={`w-10 rounded-t-xl ${isWeakest ? 'bg-rose-400' : d.rate >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ minHeight: 8 }}
                  />
                  <span className={`text-[10px] font-bold mt-1 ${isWeakest ? 'text-rose-500' : 'text-slate-500'}`}>
                    {dayNames[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Chart 4: Late Arrivals Distribution (half) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-black text-slate-700">{t(locale, 'توزيع التأخر', 'Late Arrivals Distribution')}</h3>
          </div>
          <div className="space-y-2.5">
            {lateDistribution.map((b, i) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-20 shrink-0 font-mono">{b.label}</span>
                <div className="flex-1 bg-violet-50 rounded-full h-5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.count / maxLate) * 100}%` }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                    style={{ minWidth: b.count > 0 ? 8 : 0 }}
                  />
                </div>
                <span className="text-xs font-black text-violet-600 w-8 text-end">{b.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart 5: Campus Comparison (half — only when campus = all) */}
        {campusId === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-black text-slate-700">{t(locale, 'مقارنة المباني', 'Campus Comparison')}</h3>
            </div>
            <div className="space-y-3">
              {campusComparison.map((c, i) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{c.name}</span>
                    <span className={`text-xs font-black ${rateTextColor(c.rate)}`}>{c.rate}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.rate}%` }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                      className={`h-full rounded-full ${rateColor(c.rate)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chart 6: Chronic Absence Top 10 (full width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-slate-700">{t(locale, 'أكثر 10 طلاب غياباً', 'Top 10 Most Absent Students')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-start py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="text-start py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'الطالب', 'Student')}</th>
                  <th className="text-start py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'الصف', 'Grade')}</th>
                  <th className="text-center py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'أيام الغياب', 'Days Absent')}</th>
                  <th className="text-center py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(locale, 'النسبة', 'Rate')}</th>
                  <th className="text-start py-2 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-48">{t(locale, 'المؤشر', 'Indicator')}</th>
                </tr>
              </thead>
              <tbody>
                {chronicAbsent.map((row, i) => {
                  const severity = row.rate < 80 ? 'bg-rose-50' : row.rate < 90 ? 'bg-amber-50' : '';
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.03 }}
                      className={`border-b border-slate-50 ${severity}`}
                    >
                      <td className="py-2.5 px-2 font-black text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-2 font-bold text-slate-800">
                        {locale === 'ar' ? row.student.name : row.student.nameEn}
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 font-medium">
                        {row.student.grade}{row.student.section}
                      </td>
                      <td className="py-2.5 px-2 text-center font-black text-rose-600">{row.absent}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black ${
                          row.rate < 80 ? 'bg-rose-100 text-rose-700' :
                          row.rate < 90 ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {row.rate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.rate}%` }}
                            transition={{ delay: 0.5 + i * 0.03, duration: 0.5 }}
                            className={`h-full rounded-full ${row.rate < 80 ? 'bg-rose-400' : row.rate < 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ─── Data Table Section ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      >
        {/* Tab Header */}
        <div className="flex items-center border-b border-slate-100 print:hidden">
          <button
            onClick={() => { setActiveTab('students'); setPage(1); }}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-sm font-black transition-all border-b-2 ${
              activeTab === 'students'
                ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {t(locale, 'بيانات الطلاب', 'Student Data')}
          </button>
          <button
            onClick={() => { setActiveTab('teachers'); setTeacherPage(1); }}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-sm font-black transition-all border-b-2 ${
              activeTab === 'teachers'
                ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            {t(locale, 'نشاط المعلمين', 'Teacher Activity')}
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50 print:hidden">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t(locale, 'بحث بالاسم...', 'Search by name...')}
              value={activeTab === 'students' ? searchQuery : teacherSearch}
              onChange={e => {
                if (activeTab === 'students') { setSearchQuery(e.target.value); setPage(1); }
                else { setTeacherSearch(e.target.value); setTeacherPage(1); }
              }}
              className={`w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
          {activeTab === 'students' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400">{t(locale, 'أقل من', 'Below')}</label>
              <select
                value={minRateFilter}
                onChange={e => { setMinRateFilter(Number(e.target.value)); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                <option value={0}>{t(locale, 'الكل', 'All')}</option>
                <option value={95}>95%</option>
                <option value={90}>90%</option>
                <option value={85}>85%</option>
                <option value={80}>80%</option>
              </select>
            </div>
          )}
          <div className="text-xs font-bold text-slate-400">
            {activeTab === 'students'
              ? `${processedStudentData.length} ${t(locale, 'طالب', 'students')}`
              : `${processedTeacherData.length} ${t(locale, 'معلم', 'teachers')}`
            }
          </div>
        </div>

        {/* ── Student Table ──────────────────────────────────────── */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  {([
                    { key: 'name', label: t(locale, 'الاسم', 'Name'), w: '' },
                    { key: 'grade', label: t(locale, 'الصف', 'Grade'), w: 'w-16' },
                    { key: 'section', label: t(locale, 'الشعبة', 'Sec'), w: 'w-14' },
                    { key: 'campus', label: t(locale, 'المبنى', 'Campus'), w: '' },
                    { key: 'totalDays', label: t(locale, 'أيام', 'Days'), w: 'w-14' },
                    { key: 'present', label: t(locale, 'حضور', 'Present'), w: 'w-16' },
                    { key: 'absent', label: t(locale, 'غياب', 'Absent'), w: 'w-14' },
                    { key: 'late', label: t(locale, 'تأخر', 'Late'), w: 'w-14' },
                    { key: 'rate', label: t(locale, 'النسبة', 'Rate'), w: 'w-16' },
                    { key: 'lastAbsent', label: t(locale, 'آخر غياب', 'Last Absent'), w: 'w-24' },
                  ] as const).map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`text-start py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-sky-500 transition-colors select-none ${col.w}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedStudentData.map((row: any, i) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{row.grade}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{row.section}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium text-xs truncate max-w-[140px]">{row.campus}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold text-center">{row.totalDays}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold text-center">{row.present}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-bold text-center">{row.absent}</td>
                    <td className="py-2.5 px-3 text-amber-600 font-bold text-center">{row.late}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black ${
                        row.rate >= 95 ? 'bg-emerald-100 text-emerald-700' :
                        row.rate >= 85 ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {row.rate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-medium text-xs">{row.lastAbsent || '—'}</td>
                  </tr>
                ))}
                {pagedStudentData.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                      {t(locale, 'لا توجد بيانات', 'No data found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Teacher Table ──────────────────────────────────────── */}
        {activeTab === 'teachers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  {([
                    { key: 'name', label: t(locale, 'الاسم', 'Name') },
                    { key: 'subject', label: t(locale, 'المادة', 'Subject') },
                    { key: 'campus', label: t(locale, 'المبنى', 'Campus') },
                    { key: 'spaces', label: t(locale, 'المساحات', 'Spaces') },
                    { key: 'totalHours', label: t(locale, 'إجمالي الساعات', 'Total Hours') },
                    { key: 'avgDailyHours', label: t(locale, 'متوسط يومي', 'Avg Daily') },
                    { key: 'actionsCount', label: t(locale, 'الإجراءات', 'Actions') },
                    { key: 'lastActive', label: t(locale, 'آخر نشاط', 'Last Active') },
                  ] as const).map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="text-start py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-sky-500 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        <SortIcon col={col.key} isTeacher />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedTeacherData.map((row: any) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${row.inactive ? 'bg-rose-50/60' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{row.subject}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium text-xs truncate max-w-[140px]">{row.campus}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold text-center">{row.spaces}</td>
                    <td className="py-2.5 px-3 font-bold text-center">
                      <span className={row.inactive ? 'text-rose-500' : 'text-sky-600'}>{row.totalHours}h</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold text-center">{row.avgDailyHours}h</td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold text-center">{row.actionsCount}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-medium text-xs">{row.lastActive || '—'}</td>
                  </tr>
                ))}
                {pagedTeacherData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      {t(locale, 'لا توجد بيانات', 'No data found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-400">
            {t(locale, 'صفحة', 'Page')} {activeTab === 'students' ? page : teacherPage} {t(locale, 'من', 'of')} {activeTab === 'students' ? totalStudentPages : totalTeacherPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={activeTab === 'students' ? page <= 1 : teacherPage <= 1}
              onClick={() => activeTab === 'students' ? setPage(p => p - 1) : setTeacherPage(p => p - 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isRtl ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
            </button>
            {(() => {
              const totalPages = activeTab === 'students' ? totalStudentPages : totalTeacherPages;
              const currentPage = activeTab === 'students' ? page : teacherPage;
              const setCurrentPage = activeTab === 'students' ? setPage : setTeacherPage;
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }
              return pages.map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      p === currentPage
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}
            <button
              disabled={activeTab === 'students' ? page >= totalStudentPages : teacherPage >= totalTeacherPages}
              onClick={() => activeTab === 'students' ? setPage(p => p + 1) : setTeacherPage(p => p + 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── Download Section (bottom) ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-3 pb-4 print:hidden"
      >
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-sky-300 hover:shadow-md transition-all"
        >
          <Download className="w-4 h-4" />
          {t(locale, 'تحميل كـ PDF', 'Download as PDF')}
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {t(locale, 'تحميل كـ Excel', 'Download as Excel')}
        </button>
      </motion.div>
    </div>
  );
};
