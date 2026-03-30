import { useMemo } from 'react';
import type {
  AttendanceFilters, DailyAttendanceSummary, ClassAttendance,
  ExtendedStudent, Campus, TeacherDailyActivity,
} from '../types/admin';
import {
  CAMPUSES, EXTENDED_STUDENTS, EXTENDED_TEACHERS,
  getDailySummary, getClassAttendance, getAttendanceForDate,
  getStudentAttendance, getTeacherActivityForDate, getTodayString,
} from '../data/mockAttendanceData';

export interface AttendanceComputedData {
  summary: DailyAttendanceSummary;
  previousDaySummary: DailyAttendanceSummary;
  heatmapCells: ClassAttendance[];
  dailyTrend: { date: string; rate: number; present: number; absent: number; late: number; total: number }[];
  gradeBreakdown: { grade: number; rate: number; count: number }[];
  dayOfWeekPattern: { day: number; label: string; labelEn: string; rate: number }[];
  absentStudents: (ExtendedStudent & { absentDays: number })[];
  lateStudents: (ExtendedStudent & { arrivalTime: string })[];
  chronicAbsent: (ExtendedStudent & { rate: number; streak: number; trend: 'improving' | 'declining' | 'stable' })[];
  teacherActivity: TeacherDailyActivity[];
  campusComparison: { campus: Campus; rate: number; previousRate: number }[];
  riskDistribution: { low: number; medium: number; high: number; critical: number };
  totalStudents: number;
  totalTeachers: number;
  bestGrade: { grade: number; rate: number } | null;
  worstGrade: { grade: number; rate: number } | null;
}

function getSchoolDays(from: string, to: string): string[] {
  const days: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const d = new Date(start);
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 5 && dow !== 6) { // Skip Fri/Sat
      days.push(d.toISOString().split('T')[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getPreviousDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const DAY_LABELS: { ar: string; en: string }[] = [
  { ar: 'الأحد', en: 'Sun' },
  { ar: 'الإثنين', en: 'Mon' },
  { ar: 'الثلاثاء', en: 'Tue' },
  { ar: 'الأربعاء', en: 'Wed' },
  { ar: 'الخميس', en: 'Thu' },
];

export function useAttendanceData(filters: AttendanceFilters): AttendanceComputedData {
  return useMemo(() => {
    const { campusId, grade, section, dateFrom, dateTo } = filters;
    const campus = campusId === 'all' ? undefined : campusId;
    const today = dateTo || getTodayString();
    const previousDay = getPreviousDay(today);

    // Summary
    const summary = getDailySummary(today, campus);
    const previousDaySummary = getDailySummary(previousDay, campus);

    // Filter students
    let students = EXTENDED_STUDENTS;
    if (campus) students = students.filter(s => s.campusId === campus);
    if (grade) students = students.filter(s => s.grade === grade);
    if (section) students = students.filter(s => s.section === section);

    // Heatmap cells
    const grades = [...new Set(students.map(s => s.grade))].sort((a, b) => a - b);
    const sections = [...new Set(students.map(s => s.section))].sort();
    const heatmapCells: ClassAttendance[] = [];
    for (const g of grades) {
      for (const sec of sections) {
        const cell = getClassAttendance(today, g, sec, campus);
        if (cell.totalStudents > 0) heatmapCells.push(cell);
      }
    }

    // Daily trend — use last 30 days if no dateFrom specified
    const thirtyDaysAgo = (() => { const d = new Date(today); d.setDate(d.getDate() - 35); return d.toISOString().split('T')[0]; })();
    const schoolDays = getSchoolDays(dateFrom || thirtyDaysAgo, today);
    const last14 = schoolDays.slice(-14);
    const dailyTrend = last14.map(date => {
      const s = getDailySummary(date, campus);
      return { date, rate: s.rate, present: s.present, absent: s.absent, late: s.late, total: s.totalStudents };
    });

    // Grade breakdown
    const gradeBreakdown = grades.map(g => {
      const gradeStudents = students.filter(s => s.grade === g);
      const records = getAttendanceForDate(today, campus, g);
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
      return { grade: g, rate: records.length > 0 ? Math.round(present / records.length * 1000) / 10 : 0, count: gradeStudents.length };
    });

    // Day-of-week pattern
    const dowBuckets: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    for (const date of schoolDays) {
      const dow = new Date(date).getDay();
      if (dow >= 0 && dow <= 4) {
        const s = getDailySummary(date, campus);
        dowBuckets[dow].push(s.rate);
      }
    }
    const dayOfWeekPattern = [0, 1, 2, 3, 4].map(day => ({
      day,
      label: DAY_LABELS[day].ar,
      labelEn: DAY_LABELS[day].en,
      rate: dowBuckets[day].length > 0
        ? Math.round(dowBuckets[day].reduce((a, b) => a + b, 0) / dowBuckets[day].length * 10) / 10
        : 0,
    }));

    // Absent students today
    const todayRecords = getAttendanceForDate(today, campus);
    const absentIds = new Set(todayRecords.filter(r => r.status === 'absent').map(r => r.studentId));
    const absentStudents = students
      .filter(s => absentIds.has(s.id))
      .map(s => {
        const studentRecords = getStudentAttendance(s.id);
        const absentDays = studentRecords.filter(r => r.status === 'absent').length;
        return { ...s, absentDays };
      });

    // Late students today
    const lateRecords = todayRecords.filter(r => r.status === 'late');
    const lateStudents = lateRecords.map(r => {
      const student = students.find(s => s.id === r.studentId);
      return student ? { ...student, arrivalTime: r.lateTime || '07:30' } : null;
    }).filter(Boolean) as (ExtendedStudent & { arrivalTime: string })[];

    // Chronic absent (below 85% in last 30 days)
    const chronicAbsent = students.map(s => {
      const records = getStudentAttendance(s.id);
      if (records.length === 0) return null;
      const presentOrLate = records.filter(r => r.status !== 'absent').length;
      const rate = Math.round(presentOrLate / records.length * 1000) / 10;
      if (rate >= 85) return null;

      // Consecutive absence streak
      let streak = 0;
      for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].status === 'absent') streak++;
        else break;
      }

      // Trend: compare first half vs second half
      const mid = Math.floor(records.length / 2);
      const firstHalf = records.slice(0, mid);
      const secondHalf = records.slice(mid);
      const firstRate = firstHalf.filter(r => r.status !== 'absent').length / (firstHalf.length || 1);
      const secondRate = secondHalf.filter(r => r.status !== 'absent').length / (secondHalf.length || 1);
      const trend: 'improving' | 'declining' | 'stable' = secondRate > firstRate + 0.05 ? 'improving' : secondRate < firstRate - 0.05 ? 'declining' : 'stable';

      return { ...s, rate, streak, trend };
    }).filter(Boolean) as (ExtendedStudent & { rate: number; streak: number; trend: 'improving' | 'declining' | 'stable' })[];
    chronicAbsent.sort((a, b) => a.rate - b.rate);

    // Teacher activity
    const teacherActivity = getTeacherActivityForDate(today, campus);

    // Campus comparison
    const campusComparison = CAMPUSES.map(c => {
      const rate = getDailySummary(today, c.id).rate;
      const previousRate = getDailySummary(previousDay, c.id).rate;
      return { campus: c, rate, previousRate };
    });

    // Risk distribution
    const allStudentRates = students.map(s => {
      const records = getStudentAttendance(s.id);
      if (records.length === 0) return 100;
      return records.filter(r => r.status !== 'absent').length / records.length * 100;
    });
    const riskDistribution = {
      low: allStudentRates.filter(r => r >= 90).length,
      medium: allStudentRates.filter(r => r >= 75 && r < 90).length,
      high: allStudentRates.filter(r => r >= 50 && r < 75).length,
      critical: allStudentRates.filter(r => r < 50).length,
    };

    // Best/worst grade
    const sortedGrades = [...gradeBreakdown].sort((a, b) => b.rate - a.rate);
    const bestGrade = sortedGrades[0] || null;
    const worstGrade = sortedGrades[sortedGrades.length - 1] || null;

    return {
      summary,
      previousDaySummary,
      heatmapCells,
      dailyTrend,
      gradeBreakdown,
      dayOfWeekPattern,
      absentStudents,
      lateStudents,
      chronicAbsent,
      teacherActivity,
      campusComparison,
      riskDistribution,
      totalStudents: students.length,
      totalTeachers: EXTENDED_TEACHERS.filter(t => !campus || t.campusId === campus).length,
      bestGrade,
      worstGrade,
    };
  }, [filters.campusId, filters.grade, filters.section, filters.dateFrom, filters.dateTo]);
}
