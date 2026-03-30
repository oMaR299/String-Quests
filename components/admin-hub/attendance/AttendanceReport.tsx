import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Download, FileSpreadsheet,
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Clock, XCircle, CheckCircle,
  TrendingUp, TrendingDown, Filter,
} from 'lucide-react';
import {
  CAMPUSES, EXTENDED_STUDENTS, EXTENDED_TEACHERS,
  getDailySummary, getAttendanceForDate, getClassAttendance,
  getStudentAttendance, getTeacherActivityForDate,
  getTeacherComplianceForDate, getTodayString,
  TEACHER_COMPLIANCE_RECORDS,
} from '../../../data/mockAttendanceData';
import {
  AreaLineChart, HorizontalBarChart, VerticalBarChart,
  DonutChart, CalendarHeatmap, RadarChart, Sparkline,
} from './SvgCharts';
import { SmartFilterBuilder } from './SmartFilterBuilder';
import type { FilterGroup } from './SmartFilterBuilder';

// ═══════════════════════════════════════════════════════════════
//  Props
// ═══════════════════════════════════════════════════════════════

interface AttendanceReportProps {
  locale: 'ar' | 'en';
  onBack: () => void;
}

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

function t(locale: 'ar' | 'en', ar: string, en: string) {
  return locale === 'ar' ? ar : en;
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getSchoolDays(from: string, to: string): string[] {
  const days: string[] = [];
  const d = new Date(from);
  const end = new Date(to);
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 5 && dow !== 6) days.push(fmtDate(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function rateColorClass(v: number) {
  if (v >= 90) return 'text-emerald-600';
  if (v >= 75) return 'text-amber-500';
  return 'text-rose-500';
}

function rateBgClass(v: number) {
  if (v >= 90) return 'bg-emerald-50';
  if (v >= 75) return 'bg-amber-50';
  return 'bg-rose-50';
}

function rateHex(v: number) {
  if (v >= 90) return '#10b981';
  if (v >= 75) return '#f59e0b';
  return '#f43f5e';
}

const SUBJECTS = [
  { ar: 'رياضيات', en: 'Math' },
  { ar: 'علوم', en: 'Science' },
  { ar: 'لغة عربية', en: 'Arabic' },
  { ar: 'لغة إنجليزية', en: 'English' },
  { ar: 'تاريخ', en: 'History' },
  { ar: 'تربية إسلامية', en: 'Islamic Studies' },
  { ar: 'حاسب آلي', en: 'Computer Science' },
  { ar: 'تربية بدنية', en: 'Physical Education' },
];

const DAY_LABELS = [
  { ar: 'الأحد', en: 'Sun' },
  { ar: 'الإثنين', en: 'Mon' },
  { ar: 'الثلاثاء', en: 'Tue' },
  { ar: 'الأربعاء', en: 'Wed' },
  { ar: 'الخميس', en: 'Thu' },
];

type DatePreset = 'today' | 'week' | 'month' | 'custom';

// ═══════════════════════════════════════════════════════════════
//  Stat Card
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon, iconBg, value, label, sparkData, sparkColor }: {
  icon: React.ReactNode; iconBg: string; value: string; label: string;
  sparkData?: number[]; sparkColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow print:shadow-none"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-black text-slate-800 leading-tight">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
      </div>
      {sparkData && sparkData.length > 2 && (
        <Sparkline data={sparkData} color={sparkColor || '#10b981'} width={56} height={22} />
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Chart Card wrapper
// ═══════════════════════════════════════════════════════════════

function ChartCard({ title, subtitle, children, className = '' }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 print:break-inside-avoid ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-black text-slate-700">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function AttendanceReport({ locale, onBack }: AttendanceReportProps) {
  const isRTL = locale === 'ar';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── Date range state ──
  const todayStr = getTodayString();
  const [preset, setPreset] = useState<DatePreset>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const dateRange = useMemo(() => {
    const today = new Date(todayStr);
    if (preset === 'today') return { from: todayStr, to: todayStr };
    if (preset === 'week') {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: fmtDate(d), to: todayStr };
    }
    if (preset === 'custom' && customFrom && customTo) return { from: customFrom, to: customTo };
    // default: month
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return { from: fmtDate(d), to: todayStr };
  }, [preset, customFrom, customTo, todayStr]);

  const schoolDays = useMemo(() => getSchoolDays(dateRange.from, dateRange.to), [dateRange]);

  // ── Filter state ──
  const [campusFilter, setCampusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState<number | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);

  // ── Tab state for tables ──
  const [tableTab, setTableTab] = useState<'student' | 'teacher'>('student');

  // ── Filtered students ──
  const filteredStudents = useMemo(() => {
    let s = EXTENDED_STUDENTS;
    if (campusFilter !== 'all') s = s.filter(st => st.campusId === campusFilter);
    if (gradeFilter) s = s.filter(st => st.grade === gradeFilter);
    if (sectionFilter) s = s.filter(st => st.section === sectionFilter);
    return s;
  }, [campusFilter, gradeFilter, sectionFilter]);

  // Available grades/sections for filters
  const availableGrades = useMemo(() => {
    let s = EXTENDED_STUDENTS;
    if (campusFilter !== 'all') s = s.filter(st => st.campusId === campusFilter);
    return [...new Set(s.map(st => st.grade))].sort((a, b) => a - b);
  }, [campusFilter]);

  const availableSections = useMemo(() => {
    let s = EXTENDED_STUDENTS;
    if (campusFilter !== 'all') s = s.filter(st => st.campusId === campusFilter);
    if (gradeFilter) s = s.filter(st => st.grade === gradeFilter);
    return [...new Set(s.map(st => st.section))].sort();
  }, [campusFilter, gradeFilter]);

  // ── Computed data (memoized) ──
  const campus = campusFilter === 'all' ? undefined : campusFilter;

  // Daily trend data
  const dailyTrend = useMemo(() => {
    return schoolDays.map(date => {
      const s = getDailySummary(date, campus);
      return { date, rate: s.rate, present: s.present, absent: s.absent, late: s.late, total: s.totalStudents };
    });
  }, [schoolDays, campus]);

  // Overall stats for the period
  const periodStats = useMemo(() => {
    if (dailyTrend.length === 0) return { avgRate: 0, totalAbsent: 0, totalLate: 0 };
    const avgRate = Math.round(dailyTrend.reduce((s, d) => s + d.rate, 0) / dailyTrend.length * 10) / 10;
    const totalAbsent = dailyTrend.reduce((s, d) => s + d.absent, 0);
    const totalLate = dailyTrend.reduce((s, d) => s + d.late, 0);
    return { avgRate, totalAbsent, totalLate };
  }, [dailyTrend]);

  // Grade breakdown
  const gradeBreakdown = useMemo(() => {
    const grades = [...new Set(filteredStudents.map(s => s.grade))].sort((a: number, b: number) => a - b);
    return grades.map((g: number) => {
      const records = getAttendanceForDate(todayStr, campus, g);
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const rate = records.length > 0 ? Math.round(present / records.length * 1000) / 10 : 0;
      return { grade: g, rate, count: records.length };
    });
  }, [filteredStudents, campus, todayStr]);

  const bestGrade = useMemo(() => {
    if (gradeBreakdown.length === 0) return null;
    return [...gradeBreakdown].sort((a, b) => b.rate - a.rate)[0];
  }, [gradeBreakdown]);

  const worstGrade = useMemo(() => {
    if (gradeBreakdown.length === 0) return null;
    return [...gradeBreakdown].sort((a, b) => a.rate - b.rate)[0];
  }, [gradeBreakdown]);

  // Day-of-week pattern
  const dayOfWeekData = useMemo(() => {
    const buckets: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    for (const date of schoolDays) {
      const dow = new Date(date).getDay();
      if (dow >= 0 && dow <= 4) {
        const s = getDailySummary(date, campus);
        buckets[dow].push(s.rate);
      }
    }
    return [0, 1, 2, 3, 4].map(day => {
      const rates = buckets[day];
      const avg = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length * 10) / 10 : 0;
      return { day, label: t(locale, DAY_LABELS[day].ar, DAY_LABELS[day].en), rate: avg };
    });
  }, [schoolDays, campus, locale]);

  // Late arrivals distribution
  const lateDistribution = useMemo(() => {
    const buckets: Record<string, number> = {
      '7:00-7:15': 0, '7:15-7:30': 0, '7:30-7:45': 0, '7:45-8:00': 0, '8:00+': 0,
    };
    for (const date of schoolDays) {
      const records = getAttendanceForDate(date, campus);
      for (const r of records) {
        if (r.status === 'late' && r.lateTime) {
          const [h, m] = r.lateTime.split(':').map(Number);
          const mins = h * 60 + m;
          if (mins < 435) buckets['7:00-7:15']++;
          else if (mins < 450) buckets['7:15-7:30']++;
          else if (mins < 465) buckets['7:30-7:45']++;
          else if (mins < 480) buckets['7:45-8:00']++;
          else buckets['8:00+']++;
        }
      }
    }
    return Object.entries(buckets).map(([label, value]) => ({ label, value, color: '#8b5cf6' }));
  }, [schoolDays, campus]);

  // Section comparison (when grade filter active)
  const sectionComparison = useMemo(() => {
    if (!gradeFilter) return null;
    const sections = availableSections;
    return sections.map(sec => {
      const records = getAttendanceForDate(todayStr, campus, gradeFilter, sec);
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const rate = records.length > 0 ? Math.round(present / records.length * 1000) / 10 : 0;
      return { label: `${t(locale, 'شعبة', 'Section')} ${sec}`, value: rate };
    });
  }, [gradeFilter, availableSections, todayStr, campus, locale]);

  // Campus comparison
  const campusComparison = useMemo(() => {
    return CAMPUSES.map(c => {
      const s = getDailySummary(todayStr, c.id);
      // Compute additional metrics
      const records = getAttendanceForDate(todayStr, c.id);
      const lateCount = records.filter(r => r.status === 'late').length;
      const lateRate = records.length > 0 ? Math.round(lateCount / records.length * 100) : 0;
      // Compliance
      const comp = getTeacherComplianceForDate(todayStr, c.id);
      const compRate = comp.length > 0 ? Math.round(comp.filter(r => r.submitted).length / comp.length * 100) : 0;
      // Chronic absent students in this campus
      const campusStudents = EXTENDED_STUDENTS.filter(st => st.campusId === c.id);
      let chronicCount = 0;
      for (const st of campusStudents.slice(0, 100)) { // sample for perf
        const recs = getStudentAttendance(st.id);
        if (recs.length > 0) {
          const r = recs.filter(r2 => r2.status !== 'absent').length / recs.length * 100;
          if (r < 85) chronicCount++;
        }
      }
      return {
        campus: c,
        rate: s.rate,
        lateRate,
        compRate,
        chronicPct: Math.round(chronicCount / Math.min(campusStudents.length, 100) * 100),
      };
    });
  }, [todayStr]);

  // Subject breakdown (simulated from per-space data)
  const subjectBreakdown = useMemo(() => {
    return SUBJECTS.map(sub => {
      // Find teachers of this subject in filtered campus
      const teachers = EXTENDED_TEACHERS.filter(
        tc => tc.subject === sub.ar && (!campus || tc.campusId === campus)
      );
      if (teachers.length === 0) return { label: t(locale, sub.ar, sub.en), value: 0 };
      // Simulate per-subject attendance rate (based on grades they teach)
      let totalPresent = 0, totalRecords = 0;
      for (const tc of teachers) {
        for (const g of tc.grades) {
          const records = getAttendanceForDate(todayStr, tc.campusId, g);
          totalPresent += records.filter(r => r.status === 'present' || r.status === 'late').length;
          totalRecords += records.length;
        }
      }
      const rate = totalRecords > 0 ? Math.round(totalPresent / totalRecords * 1000) / 10 : 0;
      return { label: t(locale, sub.ar, sub.en), value: rate };
    }).filter(d => d.value > 0);
  }, [todayStr, campus, locale]);

  // Calendar heatmap data
  const heatmapData = useMemo(() => {
    return schoolDays.map(date => {
      const s = getDailySummary(date, campus);
      return { date, value: s.rate };
    });
  }, [schoolDays, campus]);

  // Chronic absence trend (count of students below 85% per day — approximate)
  const chronicTrend = useMemo(() => {
    // Sample 200 students for performance
    const sampleStudents = filteredStudents.slice(0, 200);
    return schoolDays.slice(-14).map(date => {
      let belowThreshold = 0;
      for (const st of sampleStudents) {
        const recs = getStudentAttendance(st.id, undefined, date);
        if (recs.length >= 3) {
          const r = recs.filter(r2 => r2.status !== 'absent').length / recs.length * 100;
          if (r < 85) belowThreshold++;
        }
      }
      // Scale to full population
      const scale = filteredStudents.length / Math.max(sampleStudents.length, 1);
      return { label: date.slice(5), value: Math.round(belowThreshold * scale), meta: date };
    });
  }, [schoolDays, filteredStudents]);

  // Risk distribution
  const riskDistribution = useMemo(() => {
    const sampleStudents = filteredStudents.slice(0, 300);
    let low = 0, medium = 0, high = 0, critical = 0;
    for (const st of sampleStudents) {
      const recs = getStudentAttendance(st.id);
      if (recs.length === 0) { low++; continue; }
      const rate = recs.filter(r => r.status !== 'absent').length / recs.length * 100;
      if (rate >= 90) low++;
      else if (rate >= 75) medium++;
      else if (rate >= 50) high++;
      else critical++;
    }
    const scale = filteredStudents.length / Math.max(sampleStudents.length, 1);
    return {
      low: Math.round(low * scale),
      medium: Math.round(medium * scale),
      high: Math.round(high * scale),
      critical: Math.round(critical * scale),
    };
  }, [filteredStudents]);

  // Teacher compliance trend (14 days)
  const complianceTrend = useMemo(() => {
    const last14 = schoolDays.slice(-14);
    return last14.map(date => {
      const recs = getTeacherComplianceForDate(date, campus);
      const rate = recs.length > 0 ? Math.round(recs.filter(r => r.submitted).length / recs.length * 1000) / 10 : 0;
      return { label: date.slice(5), value: rate, meta: `${recs.filter(r => r.submitted).length}/${recs.length}` };
    });
  }, [schoolDays, campus]);

  // Teacher ranking
  const teacherRanking = useMemo(() => {
    let teachers = EXTENDED_TEACHERS;
    if (campus) teachers = teachers.filter(tc => tc.campusId === campus);
    return teachers.map(tc => {
      const allRecs = TEACHER_COMPLIANCE_RECORDS.filter(r => r.teacherId === tc.id);
      const rate = allRecs.length > 0 ? Math.round(allRecs.filter(r => r.submitted).length / allRecs.length * 1000) / 10 : 0;
      return { label: t(locale, tc.name, tc.nameEn), value: rate, meta: t(locale, tc.subject, tc.subjectEn) };
    }).sort((a, b) => b.value - a.value);
  }, [campus, locale]);

  // Sparkline data for stats
  const rateSparkData = useMemo(() => dailyTrend.map(d => d.rate), [dailyTrend]);
  const absentSparkData = useMemo(() => dailyTrend.map(d => d.absent), [dailyTrend]);
  const lateSparkData = useMemo(() => dailyTrend.map(d => d.late), [dailyTrend]);

  // ═══════════════════════════════════════════════════════════════
  //  Student table data
  // ═══════════════════════════════════════════════════════════════

  const [studentSearch, setStudentSearch] = useState('');
  const [studentRateFilter, setStudentRateFilter] = useState('all');
  const [studentSort, setStudentSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'rate', dir: 'asc' });
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 20;

  const studentTableData = useMemo(() => {
    // Sample for performance — compute stats for each filtered student
    const data = filteredStudents.map(st => {
      const recs = getStudentAttendance(st.id, dateRange.from, dateRange.to);
      const present = recs.filter(r => r.status === 'present').length;
      const absent = recs.filter(r => r.status === 'absent').length;
      const late = recs.filter(r => r.status === 'late').length;
      const total = recs.length;
      const rate = total > 0 ? Math.round((present + late) / total * 1000) / 10 : 100;
      // Last 14 days sparkline
      const last14 = recs.slice(-14).map(r => r.status === 'absent' ? 0 : 1);
      const sparkVals: number[] = [];
      for (let i = 0; i < last14.length; i += 1) {
        sparkVals.push(last14.slice(Math.max(0, i - 2), i + 1).reduce((a, b) => a + b, 0) / Math.min(i + 1, 3) * 100);
      }
      const campusObj = CAMPUSES.find(c => c.id === st.campusId);
      return {
        ...st,
        campusName: t(locale, campusObj?.name || '', campusObj?.nameEn || ''),
        days: total,
        present,
        absent,
        late,
        rate,
        sparkVals,
      };
    });
    return data;
  }, [filteredStudents, dateRange, locale]);

  const sortedFilteredStudents = useMemo(() => {
    let data = studentTableData;
    // Search
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q));
    }
    // Rate filter
    if (studentRateFilter === 'below90') data = data.filter(s => s.rate < 90);
    else if (studentRateFilter === 'below80') data = data.filter(s => s.rate < 80);
    else if (studentRateFilter === 'below70') data = data.filter(s => s.rate < 70);
    // Sort
    const { key, dir } = studentSort;
    data = [...data].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [studentTableData, studentSearch, studentRateFilter, studentSort]);

  const studentTotalPages = Math.max(1, Math.ceil(sortedFilteredStudents.length / PAGE_SIZE));
  const studentPageData = sortedFilteredStudents.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);

  const toggleStudentSort = useCallback((key: string) => {
    setStudentSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
    setStudentPage(1);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  Teacher table data
  // ═══════════════════════════════════════════════════════════════

  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSort, setTeacherSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'compliance', dir: 'desc' });
  const [teacherPage, setTeacherPage] = useState(1);

  const teacherTableData = useMemo(() => {
    let teachers = EXTENDED_TEACHERS;
    if (campus) teachers = teachers.filter(tc => tc.campusId === campus);

    return teachers.map(tc => {
      // Activity across all days in range
      const activities = schoolDays.map(date => {
        const dayActs = getTeacherActivityForDate(date, tc.campusId);
        return dayActs.find(a => a.teacherId === tc.id);
      }).filter(Boolean);

      const totalMinutes = activities.reduce((s, a) => s + (a?.totalMinutes || 0), 0);
      const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
      const activeDays = activities.filter(a => (a?.totalMinutes || 0) > 0).length;
      const avgDaily = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

      // Compliance
      const compRecs = TEACHER_COMPLIANCE_RECORDS.filter(r => r.teacherId === tc.id);
      const compliance = compRecs.length > 0 ? Math.round(compRecs.filter(r => r.submitted).length / compRecs.length * 1000) / 10 : 0;

      // Last active
      let lastActive = '';
      for (let i = schoolDays.length - 1; i >= 0; i--) {
        const dayActs = getTeacherActivityForDate(schoolDays[i], tc.campusId);
        const act = dayActs.find(a => a.teacherId === tc.id && a.totalMinutes > 0);
        if (act) { lastActive = schoolDays[i]; break; }
      }

      const campusObj = CAMPUSES.find(c => c.id === tc.campusId);

      return {
        ...tc,
        campusName: t(locale, campusObj?.name || '', campusObj?.nameEn || ''),
        spacesCount: tc.spaces.length,
        totalHours,
        avgDaily,
        compliance,
        lastActive,
        totalActions: activities.reduce((s, a) => s + (a?.actions.length || 0), 0),
      };
    });
  }, [campus, schoolDays, locale]);

  const sortedFilteredTeachers = useMemo(() => {
    let data = teacherTableData;
    if (teacherSearch) {
      const q = teacherSearch.toLowerCase();
      data = data.filter(tc => tc.name.toLowerCase().includes(q) || tc.nameEn.toLowerCase().includes(q));
    }
    const { key, dir } = teacherSort;
    data = [...data].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [teacherTableData, teacherSearch, teacherSort]);

  const teacherTotalPages = Math.max(1, Math.ceil(sortedFilteredTeachers.length / PAGE_SIZE));
  const teacherPageData = sortedFilteredTeachers.slice((teacherPage - 1) * PAGE_SIZE, teacherPage * PAGE_SIZE);

  const toggleTeacherSort = useCallback((key: string) => {
    setTeacherSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
    setTeacherPage(1);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  Download handlers
  // ═══════════════════════════════════════════════════════════════

  const handlePDF = useCallback(() => { window.print(); }, []);

  const handleCSV = useCallback(() => {
    const BOM = '\ufeff';
    const schoolName = t(locale, 'مدارس الخضر الحديثة', 'Al-Khadr Modern Schools');
    const rangeLabel = `${dateRange.from} → ${dateRange.to}`;
    const filterLabel = [
      campusFilter !== 'all' ? CAMPUSES.find(c => c.id === campusFilter)?.name : '',
      gradeFilter ? `Grade ${gradeFilter}` : '',
      sectionFilter ? `Section ${sectionFilter}` : '',
    ].filter(Boolean).join(' | ') || t(locale, 'الكل', 'All');

    const headers = [
      t(locale, 'الاسم', 'Name'),
      t(locale, 'الصف', 'Grade'),
      t(locale, 'الشعبة', 'Section'),
      t(locale, 'المبنى', 'Campus'),
      t(locale, 'الأيام', 'Days'),
      t(locale, 'حاضر', 'Present'),
      t(locale, 'غائب', 'Absent'),
      t(locale, 'متأخر', 'Late'),
      t(locale, 'النسبة%', 'Rate%'),
    ];

    const rows = sortedFilteredStudents.map(s => [
      s.name, s.grade, s.section, s.campusName, s.days, s.present, s.absent, s.late, s.rate,
    ]);

    const csv = BOM + [
      schoolName,
      rangeLabel,
      filterLabel,
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateRange.from}-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedFilteredStudents, dateRange, campusFilter, gradeFilter, sectionFilter, locale]);

  // ═══════════════════════════════════════════════════════════════
  //  Sort icon helper
  // ═══════════════════════════════════════════════════════════════

  function SortIcon({ field, sort }: { field: string; sort: { key: string; dir: 'asc' | 'desc' } }) {
    if (sort.key !== field) return <ChevronDown className="w-3 h-3 text-slate-300 inline ml-0.5" />;
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-sky-500 inline ml-0.5" />
      : <ChevronDown className="w-3 h-3 text-sky-500 inline ml-0.5" />;
  }

  // ═══════════════════════════════════════════════════════════════
  //  Weakest day for highlight
  // ═══════════════════════════════════════════════════════════════

  const weakestDay = useMemo(() => {
    if (dayOfWeekData.length === 0) return -1;
    let min = Infinity, idx = 0;
    dayOfWeekData.forEach((d, i) => { if (d.rate > 0 && d.rate < min) { min = d.rate; idx = i; } });
    return idx;
  }, [dayOfWeekData]);

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 pb-12">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 print:static print:bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors print:hidden"
            >
              <BackArrow className="w-4 h-4 text-slate-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-black text-slate-800">
              {t(locale, 'تقرير الحضور والغياب', 'Attendance Report')}
            </h1>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handleCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-600 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 space-y-6">
        {/* ─── DATE RANGE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'today', ar: 'اليوم', en: 'Today' },
              { key: 'week', ar: 'هذا الأسبوع', en: 'This Week' },
              { key: 'month', ar: 'هذا الشهر', en: 'This Month' },
              { key: 'custom', ar: 'مخصص', en: 'Custom' },
            ] as { key: DatePreset; ar: string; en: string }[]).map(p => (
              <button
                key={p.key}
                onClick={() => { setPreset(p.key); setStudentPage(1); setTeacherPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  preset === p.key
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t(locale, p.ar, p.en)}
              </button>
            ))}
            {preset === 'custom' && (
              <div className="flex items-center gap-2 mr-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-600"
                />
                <span className="text-slate-400 text-xs">→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-600"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t(locale, `${schoolDays.length} يوم دراسي`, `${schoolDays.length} school days`)}
            {' · '}
            {dateRange.from} → {dateRange.to}
          </p>
        </div>

        {/* ─── FILTER BAR ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 print:hidden">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" /> {t(locale, 'تصفية', 'Filters')}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Campus */}
            <select
              value={campusFilter}
              onChange={e => { setCampusFilter(e.target.value); setGradeFilter(null); setSectionFilter(null); setStudentPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white min-w-[140px]"
            >
              <option value="all">{t(locale, 'كل المباني', 'All Campuses')}</option>
              {CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{t(locale, c.name, c.nameEn)}</option>
              ))}
            </select>
            {/* Grade */}
            <select
              value={gradeFilter ?? ''}
              onChange={e => { setGradeFilter(e.target.value ? Number(e.target.value) : null); setSectionFilter(null); setStudentPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white min-w-[120px]"
            >
              <option value="">{t(locale, 'كل الصفوف', 'All Grades')}</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{t(locale, `الصف ${g}`, `Grade ${g}`)}</option>
              ))}
            </select>
            {/* Section */}
            <select
              value={sectionFilter ?? ''}
              onChange={e => { setSectionFilter(e.target.value || null); setStudentPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white min-w-[110px]"
            >
              <option value="">{t(locale, 'كل الشعب', 'All Sections')}</option>
              {availableSections.map(s => (
                <option key={s} value={s}>{t(locale, `شعبة ${s}`, `Section ${s}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── SMART FILTER BUILDER ─── */}
        <SmartFilterBuilder
          locale={locale}
          activeFilter={null}
          onFilterChange={(fg) => { /* TODO: wire into data filtering */ }}
        />

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  SECTION 1: Executive Summary                         */}
        {/* ═══════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Calendar className="w-5 h-5 text-sky-600" />}
            iconBg="bg-gradient-to-br from-sky-100 to-sky-50"
            value={`${schoolDays.length}`}
            label={t(locale, 'أيام دراسية', 'School Days')}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            iconBg={`bg-gradient-to-br ${periodStats.avgRate >= 90 ? 'from-emerald-100 to-emerald-50' : periodStats.avgRate >= 75 ? 'from-amber-100 to-amber-50' : 'from-rose-100 to-rose-50'}`}
            value={`${periodStats.avgRate}%`}
            label={t(locale, 'متوسط الحضور', 'Average Rate')}
            sparkData={rateSparkData}
            sparkColor={rateHex(periodStats.avgRate)}
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-rose-500" />}
            iconBg="bg-gradient-to-br from-rose-100 to-rose-50"
            value={periodStats.totalAbsent.toLocaleString()}
            label={t(locale, 'إجمالي الغياب', 'Total Absences')}
            sparkData={absentSparkData}
            sparkColor="#f43f5e"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            iconBg="bg-gradient-to-br from-amber-100 to-amber-50"
            value={periodStats.totalLate.toLocaleString()}
            label={t(locale, 'إجمالي التأخر', 'Total Late')}
            sparkData={lateSparkData}
            sparkColor="#f59e0b"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-gradient-to-br from-emerald-100 to-emerald-50"
            value={bestGrade ? `${t(locale, `الصف ${bestGrade.grade}`, `Grade ${bestGrade.grade}`)} — ${bestGrade.rate}%` : '—'}
            label={t(locale, 'أفضل صف', 'Best Grade')}
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
            iconBg="bg-gradient-to-br from-rose-100 to-rose-50"
            value={worstGrade ? `${t(locale, `الصف ${worstGrade.grade}`, `Grade ${worstGrade.grade}`)} — ${worstGrade.rate}%` : '—'}
            label={t(locale, 'أسوأ صف', 'Worst Grade')}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  SECTION 2: Charts Dashboard                          */}
        {/* ═══════════════════════════════════════════════════════ */}

        <div className="space-y-4">
          {/* Chart 1: Daily Attendance Trend (full width) */}
          <ChartCard
            title={t(locale, 'اتجاه الحضور اليومي', 'Daily Attendance Trend')}
            subtitle={t(locale, `آخر ${dailyTrend.length} يوم دراسي`, `Last ${dailyTrend.length} school days`)}
            className="col-span-full"
          >
            <AreaLineChart
              data={dailyTrend.map(d => ({ label: d.date.slice(5), value: d.rate, meta: `${d.present}/${d.total}` }))}
              color="#0ea5e9"
              yMin={80}
              yMax={100}
              height={240}
            />
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 2: Grade Comparison */}
            <ChartCard
              title={t(locale, 'مقارنة الصفوف', 'Grade Comparison')}
              subtitle={t(locale, 'نسبة الحضور لكل صف', 'Attendance rate per grade')}
            >
              <HorizontalBarChart
                data={gradeBreakdown.map(g => ({
                  label: t(locale, `الصف ${g.grade}`, `Grade ${g.grade}`),
                  value: g.rate,
                  meta: `${g.count} ${t(locale, 'طالب', 'students')}`,
                }))}
                maxValue={100}
              />
            </ChartCard>

            {/* Chart 3: Section Comparison (when grade selected) */}
            {sectionComparison && sectionComparison.length > 0 ? (
              <ChartCard
                title={t(locale, `مقارنة شعب الصف ${gradeFilter}`, `Grade ${gradeFilter} Section Comparison`)}
                subtitle={t(locale, 'نسبة الحضور لكل شعبة', 'Attendance rate per section')}
              >
                <HorizontalBarChart data={sectionComparison} maxValue={100} />
              </ChartCard>
            ) : (
              /* Chart 7: Subject Breakdown (default when no grade filter) */
              <ChartCard
                title={t(locale, 'حضور حسب المادة', 'Subject Breakdown')}
                subtitle={t(locale, 'نسبة الحضور في كل مادة', 'Attendance rate by subject')}
              >
                <HorizontalBarChart data={subjectBreakdown} maxValue={100} />
              </ChartCard>
            )}

            {/* Chart 4: Day-of-Week Pattern */}
            <ChartCard
              title={t(locale, 'نمط الحضور الأسبوعي', 'Day-of-Week Pattern')}
              subtitle={t(locale, 'متوسط الحضور لكل يوم', 'Average attendance per day')}
            >
              <VerticalBarChart
                data={dayOfWeekData.map((d, i) => ({
                  label: d.label,
                  value: d.rate,
                  color: i === weakestDay ? '#f43f5e' : '#0ea5e9',
                  highlight: i === weakestDay,
                }))}
                maxValue={100}
                height={200}
              />
            </ChartCard>

            {/* Chart 5: Late Arrivals Distribution */}
            <ChartCard
              title={t(locale, 'توزيع أوقات التأخر', 'Late Arrivals Distribution')}
              subtitle={t(locale, 'عدد حالات التأخر حسب الوقت', 'Late count by time bucket')}
            >
              <HorizontalBarChart
                data={lateDistribution}
                maxValue={Math.max(...lateDistribution.map(d => d.value), 1)}
                showValues={true}
                valueSuffix=""
              />
            </ChartCard>

            {/* Chart 6: Campus Comparison (when campus = all) */}
            {campusFilter === 'all' && (
              <ChartCard
                title={t(locale, 'مقارنة المباني', 'Campus Comparison')}
                subtitle={t(locale, 'رادار مقارنة 4 محاور', '4-axis radar comparison')}
              >
                <div className="flex justify-center py-4">
                  <RadarChart
                    size={240}
                    axes={[
                      {
                        label: t(locale, 'الحضور', 'Attendance'),
                        value: Math.round(campusComparison.reduce((s, c) => s + c.rate, 0) / campusComparison.length),
                        maxValue: 100,
                      },
                      {
                        label: t(locale, 'التأخر', 'Late Rate'),
                        value: 100 - Math.round(campusComparison.reduce((s, c) => s + c.lateRate, 0) / campusComparison.length),
                        maxValue: 100,
                      },
                      {
                        label: t(locale, 'الامتثال', 'Compliance'),
                        value: Math.round(campusComparison.reduce((s, c) => s + c.compRate, 0) / campusComparison.length),
                        maxValue: 100,
                      },
                      {
                        label: t(locale, 'عدم الغياب المزمن', 'No Chronic'),
                        value: 100 - Math.round(campusComparison.reduce((s, c) => s + c.chronicPct, 0) / campusComparison.length),
                        maxValue: 100,
                      },
                    ]}
                    color="#8b5cf6"
                  />
                </div>
                {/* Mini comparison table under radar */}
                <div className="mt-3 text-xs">
                  <div className="grid grid-cols-5 gap-1 text-slate-400 font-bold mb-1">
                    <span>{t(locale, 'المبنى', 'Campus')}</span>
                    <span className="text-center">{t(locale, 'حضور', 'Att.')}</span>
                    <span className="text-center">{t(locale, 'تأخر', 'Late')}</span>
                    <span className="text-center">{t(locale, 'امتثال', 'Comp.')}</span>
                    <span className="text-center">{t(locale, 'مزمن', 'Chron.')}</span>
                  </div>
                  {campusComparison.map(cc => (
                    <div key={cc.campus.id} className="grid grid-cols-5 gap-1 py-0.5 text-slate-600">
                      <span className="truncate">{t(locale, cc.campus.name, cc.campus.nameEn).split('(')[0].trim()}</span>
                      <span className={`text-center font-bold ${rateColorClass(cc.rate)}`}>{cc.rate}%</span>
                      <span className="text-center text-amber-500 font-bold">{cc.lateRate}%</span>
                      <span className={`text-center font-bold ${rateColorClass(cc.compRate)}`}>{cc.compRate}%</span>
                      <span className={`text-center font-bold ${cc.chronicPct > 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{cc.chronicPct}%</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {/* Chart 7 (alt): Subject Breakdown — shown alongside section comparison */}
            {sectionComparison && sectionComparison.length > 0 && (
              <ChartCard
                title={t(locale, 'حضور حسب المادة', 'Subject Breakdown')}
                subtitle={t(locale, 'نسبة الحضور في كل مادة', 'Attendance rate by subject')}
              >
                <HorizontalBarChart data={subjectBreakdown} maxValue={100} />
              </ChartCard>
            )}
          </div>

          {/* Chart 8: Calendar Heatmap (full width) */}
          <ChartCard
            title={t(locale, 'خريطة الحضور الحرارية', 'Calendar Heatmap')}
            subtitle={t(locale, 'نسبة الحضور اليومية على شكل شبكة', 'Daily attendance rate as a grid')}
            className="col-span-full"
          >
            <CalendarHeatmap data={heatmapData} weeksToShow={Math.min(Math.ceil(schoolDays.length / 5) + 1, 10)} locale={locale} />
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 9: Chronic Absence Trend */}
            <ChartCard
              title={t(locale, 'اتجاه الغياب المزمن', 'Chronic Absence Trend')}
              subtitle={t(locale, 'عدد الطلاب تحت 85% حضور', 'Students below 85% attendance')}
            >
              <AreaLineChart
                data={chronicTrend}
                color="#f43f5e"
                height={200}
              />
            </ChartCard>

            {/* Chart 10: Risk Distribution */}
            <ChartCard
              title={t(locale, 'توزيع المخاطر', 'Risk Distribution')}
              subtitle={t(locale, 'تصنيف الطلاب حسب نسبة الحضور', 'Student classification by attendance rate')}
            >
              <div className="flex justify-center">
                <DonutChart
                  segments={[
                    { value: riskDistribution.low, color: '#10b981', label: t(locale, 'منخفض الخطورة (≥90%)', 'Low Risk (≥90%)') },
                    { value: riskDistribution.medium, color: '#f59e0b', label: t(locale, 'متوسط (75-90%)', 'Medium (75-90%)') },
                    { value: riskDistribution.high, color: '#f43f5e', label: t(locale, 'مرتفع (50-75%)', 'High (50-75%)') },
                    { value: riskDistribution.critical, color: '#881337', label: t(locale, 'حرج (<50%)', 'Critical (<50%)') },
                  ]}
                  size={180}
                  centerValue={`${filteredStudents.length}`}
                  centerLabel={t(locale, 'طالب', 'students')}
                />
              </div>
            </ChartCard>
          </div>

          {/* Charts 11 & 12: Teacher charts (in teacher tab context, but shown here as section) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-black text-slate-700 mb-1">
              {t(locale, 'بيانات المعلمين', 'Teacher Data')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{t(locale, 'الامتثال والنشاط', 'Compliance & Activity')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart 11: Teacher Compliance Trend */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">{t(locale, 'اتجاه الامتثال', 'Compliance Trend')}</p>
                <AreaLineChart
                  data={complianceTrend}
                  color="#8b5cf6"
                  yMin={60}
                  yMax={100}
                  height={200}
                />
              </div>

              {/* Chart 12: Teacher Ranking */}
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2">{t(locale, 'ترتيب المعلمين', 'Teacher Ranking')}</p>
                <HorizontalBarChart
                  data={teacherRanking.slice(0, 10).map(d => ({
                    ...d,
                    color: d.value >= 95 ? '#10b981' : d.value >= 85 ? '#f59e0b' : '#f43f5e',
                  }))}
                  maxValue={100}
                  barHeight={18}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  SECTION 3: Data Tables                               */}
        {/* ═══════════════════════════════════════════════════════ */}

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-100 print:hidden">
            <button
              onClick={() => setTableTab('student')}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tableTab === 'student'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t(locale, 'بيانات الطلاب', 'Student Data')}
            </button>
            <button
              onClick={() => setTableTab('teacher')}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tableTab === 'teacher'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t(locale, 'نشاط المعلمين', 'Teacher Activity')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tableTab === 'student' ? (
              <motion.div
                key="student"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Student controls */}
                <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50 print:hidden">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-2.5" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }}
                      placeholder={t(locale, 'بحث بالاسم...', 'Search by name...')}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 w-48"
                    />
                  </div>
                  <select
                    value={studentRateFilter}
                    onChange={e => { setStudentRateFilter(e.target.value); setStudentPage(1); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-white"
                  >
                    <option value="all">{t(locale, 'عرض الكل', 'Show all')}</option>
                    <option value="below90">{t(locale, 'أقل من 90%', 'Below 90%')}</option>
                    <option value="below80">{t(locale, 'أقل من 80%', 'Below 80%')}</option>
                    <option value="below70">{t(locale, 'أقل من 70%', 'Below 70%')}</option>
                  </select>
                  <span className="text-xs text-slate-400 ml-auto">
                    {sortedFilteredStudents.length} {t(locale, 'طالب', 'students')}
                  </span>
                </div>

                {/* Student table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-bold">
                        {[
                          { key: 'name', label: t(locale, 'الاسم', 'Name'), w: 'min-w-[140px]' },
                          { key: 'grade', label: t(locale, 'الصف', 'Grade'), w: 'w-16' },
                          { key: 'section', label: t(locale, 'الشعبة', 'Sec.'), w: 'w-14' },
                          { key: 'campusName', label: t(locale, 'المبنى', 'Campus'), w: 'min-w-[100px]' },
                          { key: 'days', label: t(locale, 'الأيام', 'Days'), w: 'w-14' },
                          { key: 'present', label: t(locale, 'حاضر', 'Pres.'), w: 'w-14' },
                          { key: 'absent', label: t(locale, 'غائب', 'Abs.'), w: 'w-14' },
                          { key: 'late', label: t(locale, 'متأخر', 'Late'), w: 'w-14' },
                          { key: 'rate', label: t(locale, 'النسبة%', 'Rate%'), w: 'w-24' },
                          { key: 'sparkline', label: t(locale, 'الاتجاه', 'Trend'), w: 'w-16' },
                        ].map(col => (
                          <th
                            key={col.key}
                            onClick={col.key !== 'sparkline' ? () => toggleStudentSort(col.key) : undefined}
                            className={`py-2.5 px-3 text-start ${col.w} ${col.key !== 'sparkline' ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                          >
                            {col.label}
                            {col.key !== 'sparkline' && <SortIcon field={col.key} sort={studentSort} />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {studentPageData.map(s => (
                        <tr key={s.id} className="border-t border-slate-50 hover:bg-sky-50/30 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-700">{s.name}</td>
                          <td className="py-2 px-3 text-slate-500">{s.grade}</td>
                          <td className="py-2 px-3 text-slate-500">{s.section}</td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[120px]">{s.campusName}</td>
                          <td className="py-2 px-3 text-slate-500">{s.days}</td>
                          <td className="py-2 px-3 text-emerald-600 font-bold">{s.present}</td>
                          <td className="py-2 px-3 text-rose-500 font-bold">{s.absent}</td>
                          <td className="py-2 px-3 text-amber-500 font-bold">{s.late}</td>
                          <td className="py-2 px-3">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${rateBgClass(s.rate)} ${rateColorClass(s.rate)}`}>
                              {s.rate}%
                              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(s.rate, 100)}%`, backgroundColor: rateHex(s.rate) }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            {s.sparkVals.length > 2 && (
                              <Sparkline data={s.sparkVals} color={rateHex(s.rate)} width={50} height={16} />
                            )}
                          </td>
                        </tr>
                      ))}
                      {studentPageData.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400 text-sm">
                            {t(locale, 'لا توجد بيانات', 'No data found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {studentTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 py-3 border-t border-slate-50 print:hidden">
                    <button
                      onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                      disabled={studentPage === 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: Math.min(studentTotalPages, 7) }, (_, i) => {
                      let page: number;
                      if (studentTotalPages <= 7) {
                        page = i + 1;
                      } else if (studentPage <= 4) {
                        page = i + 1;
                      } else if (studentPage >= studentTotalPages - 3) {
                        page = studentTotalPages - 6 + i;
                      } else {
                        page = studentPage - 3 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setStudentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            page === studentPage
                              ? 'bg-sky-500 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setStudentPage(p => Math.min(studentTotalPages, p + 1))}
                      disabled={studentPage === studentTotalPages}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="teacher"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Teacher controls */}
                <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50 print:hidden">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-2.5" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={e => { setTeacherSearch(e.target.value); setTeacherPage(1); }}
                      placeholder={t(locale, 'بحث بالاسم...', 'Search by name...')}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 w-48"
                    />
                  </div>
                  <span className="text-xs text-slate-400 ml-auto">
                    {sortedFilteredTeachers.length} {t(locale, 'معلم', 'teachers')}
                  </span>
                </div>

                {/* Teacher table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-bold">
                        {[
                          { key: 'name', label: t(locale, 'الاسم', 'Name'), w: 'min-w-[130px]' },
                          { key: 'subject', label: t(locale, 'المادة', 'Subject'), w: 'min-w-[90px]' },
                          { key: 'campusName', label: t(locale, 'المبنى', 'Campus'), w: 'min-w-[100px]' },
                          { key: 'spacesCount', label: t(locale, 'المساحات', 'Spaces'), w: 'w-16' },
                          { key: 'totalHours', label: t(locale, 'الساعات', 'Hours'), w: 'w-16' },
                          { key: 'avgDaily', label: t(locale, 'المعدل اليومي', 'Avg Daily'), w: 'w-20' },
                          { key: 'compliance', label: t(locale, 'الامتثال%', 'Compliance%'), w: 'w-24' },
                          { key: 'totalActions', label: t(locale, 'الإجراءات', 'Actions'), w: 'w-18' },
                          { key: 'lastActive', label: t(locale, 'آخر نشاط', 'Last Active'), w: 'min-w-[90px]' },
                        ].map(col => (
                          <th
                            key={col.key}
                            onClick={() => toggleTeacherSort(col.key)}
                            className={`py-2.5 px-3 text-start ${col.w} cursor-pointer hover:text-slate-700 select-none`}
                          >
                            {col.label}
                            <SortIcon field={col.key} sort={teacherSort} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teacherPageData.map(tc => {
                        const isInactive = tc.totalHours === 0;
                        return (
                          <tr key={tc.id} className={`border-t border-slate-50 transition-colors ${isInactive ? 'bg-rose-50/40' : 'hover:bg-sky-50/30'}`}>
                            <td className="py-2 px-3 font-semibold text-slate-700">{t(locale, tc.name, tc.nameEn)}</td>
                            <td className="py-2 px-3 text-slate-500">{t(locale, tc.subject, tc.subjectEn)}</td>
                            <td className="py-2 px-3 text-slate-500 truncate max-w-[120px]">{tc.campusName}</td>
                            <td className="py-2 px-3 text-slate-500">{tc.spacesCount}</td>
                            <td className="py-2 px-3 text-slate-600 font-bold">{tc.totalHours}h</td>
                            <td className="py-2 px-3 text-slate-500">{tc.avgDaily}m</td>
                            <td className="py-2 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                tc.compliance >= 90
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : tc.compliance >= 70
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-rose-50 text-rose-600'
                              }`}>
                                {tc.compliance}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500">{tc.totalActions}</td>
                            <td className="py-2 px-3 text-slate-400">{tc.lastActive || '—'}</td>
                          </tr>
                        );
                      })}
                      {teacherPageData.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                            {t(locale, 'لا توجد بيانات', 'No data found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Teacher Pagination */}
                {teacherTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 py-3 border-t border-slate-50 print:hidden">
                    <button
                      onClick={() => setTeacherPage(p => Math.max(1, p - 1))}
                      disabled={teacherPage === 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: Math.min(teacherTotalPages, 7) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setTeacherPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            page === teacherPage
                              ? 'bg-sky-500 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setTeacherPage(p => Math.min(teacherTotalPages, p + 1))}
                      disabled={teacherPage === teacherTotalPages}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  Download Section                                     */}
        {/* ═══════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
          <button
            onClick={handlePDF}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold text-sm hover:from-slate-800 hover:to-slate-900 transition-all shadow-lg shadow-slate-300/30"
          >
            <Download className="w-5 h-5" />
            {t(locale, 'تحميل كـ PDF', 'Download as PDF')}
          </button>
          <button
            onClick={handleCSV}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-300/30"
          >
            <FileSpreadsheet className="w-5 h-5" />
            {t(locale, 'تحميل كـ Excel', 'Download as Excel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceReport;
