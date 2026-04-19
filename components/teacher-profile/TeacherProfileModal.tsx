import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Users, TrendingUp, TrendingDown, Minus, Trophy, Target,
  GraduationCap, Building2, Clock, BookOpen, Activity, Zap,
  Heart, Calendar, Award, Info, ChevronDown, ChevronUp,
  BarChart3, Monitor, UserCheck, ClipboardList, PenTool,
  SearchCheck, BrainCircuit, CheckCircle2, XCircle, Sparkles,
  School, Flame, AlertTriangle, ArrowUp, ArrowDown, Share2,
} from 'lucide-react';
import {
  Sparkline, ProgressRing, CalendarHeatmap,
  AreaLineChart, HorizontalBarChart, VerticalBarChart, RadarChart, DonutChart,
} from '../admin-hub/attendance/SvgCharts';
import type { StudentProfile, Subject } from '../../data/complexLeaderboardData';
import { MOCK_SCHOOL_DATA, SUBJECT_UNITS } from '../../data/complexLeaderboardData';
import { SUBJECT_META } from '../topic-manager/TopicManagerLayout';
import { InfoTip } from '../topic-manager/PrincipalTab';

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

export interface TeacherProfileData {
  id: string;
  name: string;
  campusId: string;
  grade: number;
  section: string;
  students: StudentProfile[];
  studentCount: number;
  avgAccuracy: number;
  avgXp: number;
  bestUnit: string;
  worstUnit: string;
  starRating: number;
  campusDelta: number;
  trend: 'up' | 'down' | 'stable';
  engagementHours: number;
  unitAccuracies: { unit: string; accuracy: number }[];
  weeklyTrend: number[];
  healthSignals: {
    academic: 'green' | 'amber' | 'red';
    engagement: 'green' | 'amber' | 'red';
    trend: 'green' | 'amber' | 'red';
    retention: 'green' | 'amber' | 'red';
    studentPush: 'green' | 'amber' | 'red';
  };
  studentAvgActiveTime: number;
  studentAvgXp: number;
  studentAvgAccuracy: number;
  studentWeeklyLoginRate: number;
  studentDailyLoginRate: number;
  attendanceMarked: boolean;
  studentEngagementScore: number;
}

interface TeacherProfileModalProps {
  teacher: TeacherProfileData | null;
  onClose: () => void;
  locale: 'ar' | 'en';
  subject?: string;
  onViewFull?: (teacher: TeacherProfileData) => void;
  /** Composite Teacher Score (0-100): 50% daily-activity commitment + 50% student weekly active time */
  teacherScore?: number;
}

/* ═══════════════════════════════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════════════════════════════ */

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor (Girls)' },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy' },
];

// Arabic unit display mapping (emoji + lessons + subject pill)
const UNIT_DISPLAY: Record<string, { nameAr: string; emoji: string; lessons: number; timeMin: number }> = {
  'math-arithmetic':  { nameAr: 'العمليات الحسابية', emoji: '🔢', lessons: 3, timeMin: 19 },
  'math-algebra':     { nameAr: 'الجبر',             emoji: '📐', lessons: 3, timeMin: 45 },
  'math-geometry':    { nameAr: 'الهندسة',           emoji: '📏', lessons: 3, timeMin: 10 },
  'math-calculus':    { nameAr: 'التفاضل والتكامل',   emoji: '📈', lessons: 3, timeMin: 124 },
  'math-statistics':  { nameAr: 'الإحصاء',           emoji: '📊', lessons: 3, timeMin: 55 },
  'science-matter':   { nameAr: 'المادة',            emoji: '🧪', lessons: 2, timeMin: 0 },
  'science-energy':   { nameAr: 'الطاقة',            emoji: '☀️', lessons: 2, timeMin: 0 },
  'science-forces':   { nameAr: 'القوى',             emoji: '⚡', lessons: 2, timeMin: 0 },
  'science-ecosystems': { nameAr: 'الأنظمة البيئية',  emoji: '🌿', lessons: 2, timeMin: 0 },
  'languages-grammar': { nameAr: 'القواعد',          emoji: '✏️', lessons: 3, timeMin: 30 },
  'languages-literature': { nameAr: 'الأدب',         emoji: '📖', lessons: 3, timeMin: 25 },
  'languages-poetry': { nameAr: 'الشعر',             emoji: '🎭', lessons: 3, timeMin: 20 },
  'languages-writing': { nameAr: 'الكتابة',          emoji: '📝', lessons: 3, timeMin: 15 },
  'history-ancient':  { nameAr: 'الحضارات القديمة',   emoji: '🏛️', lessons: 3, timeMin: 40 },
  'history-islamic_history': { nameAr: 'التاريخ الإسلامي', emoji: '🕌', lessons: 3, timeMin: 35 },
  'history-modern':   { nameAr: 'التاريخ الحديث',    emoji: '🏗️', lessons: 3, timeMin: 30 },
  'history-geography': { nameAr: 'الجغرافيا',        emoji: '🗺️', lessons: 3, timeMin: 25 },
  'arts-drawing':     { nameAr: 'الرسم',             emoji: '🎨', lessons: 2, timeMin: 20 },
  'arts-colors':      { nameAr: 'الألوان',           emoji: '🖌️', lessons: 2, timeMin: 15 },
  'arts-history_of_art': { nameAr: 'تاريخ الفن',     emoji: '🖼️', lessons: 2, timeMin: 10 },
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}س ${m}د`;
};

function TeacherAvatar({ name, size = 96 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 border-[6px] border-slate-50 shadow-xl"
      style={{
        width: size, height: size, fontSize: size * 0.34,
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 65%, 45%))`,
      }}
    >
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

const signalDot = (s: 'green' | 'amber' | 'red') =>
  s === 'green' ? 'bg-emerald-400' : s === 'amber' ? 'bg-amber-400' : 'bg-rose-400';

const accColor = (v: number) =>
  v >= 85 ? '#10b981' : v >= 70 ? '#0ea5e9' : v >= 55 ? '#f59e0b' : '#ef4444';

const accTextColor = (v: number) =>
  v >= 85 ? 'text-emerald-600' : v >= 70 ? 'text-sky-600' : v >= 55 ? 'text-amber-600' : 'text-rose-600';

function getContentStats(teacherId: string) {
  const seed = teacherId.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
  return {
    lessonsCreated: Math.floor(rng(1) * 15) + 2,
    assignmentsGiven: Math.floor(rng(2) * 20) + 5,
    examsCreated: Math.floor(rng(3) * 5) + 1,
    quizzesReviewed: Math.floor(rng(4) * 30) + 10, // legacy field, displayed as "Strings"
    activeStudentRate: Math.round(60 + rng(5) * 35),
    contentScore: Math.round(50 + rng(6) * 45),
    aiUsage: Math.round(rng(7) * 80), // deprecated — see classUsage below
    classUsageTotal: (() => {
      const t = Math.max(2, Math.floor(rng(8) * 4) + 2);
      return t;
    })(),
    classUsageActive: (() => {
      const t = Math.max(2, Math.floor(rng(8) * 4) + 2);
      const a = Math.max(0, Math.min(t, Math.floor(rng(7) * (t + 1))));
      return a;
    })(),
    loginStreak: Math.floor(rng(8) * 14) + 1,
    peerAvgLessons: 8,
    peerAvgAssignments: 12,
    peerAvgExams: 3,
    peerAvgQuizzes: 18,
  };
}

function getSubjectForTeacher(teacher: TeacherProfileData, primarySubject: string): string[] {
  // Younger grades (≤6): elementary teachers usually cover multiple subjects.
  // Middle (7-9): one or two related subjects. High (≥10): specialist, may add an advanced strand.
  const seed = teacher.id.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
  const subjects: string[] = [primarySubject];
  const add = (s: string) => { if (!subjects.includes(s)) subjects.push(s); };

  if (teacher.grade <= 6) {
    // Elementary — pick 2-3 of the core/co-taught subjects
    const elementaryPool = ['math', 'arabic', 'english', 'science', 'islamic', 'arts'];
    const filtered = elementaryPool.filter(s => s !== primarySubject);
    const extraCount = 1 + Math.floor(rng(1) * 2); // 1 or 2 extras → 2-3 total
    for (let i = 0; i < extraCount && i < filtered.length; i++) {
      const idx = Math.floor(rng(10 + i) * filtered.length);
      add(filtered[idx]);
    }
  } else if (teacher.grade >= 10 && primarySubject === 'science') {
    add(seed % 3 === 0 ? 'physics' : seed % 3 === 1 ? 'chemistry' : 'biology');
  } else if (teacher.grade >= 7 && rng(2) > 0.6) {
    // Middle school — sometimes a related secondary
    if (primarySubject === 'math') add('computer');
    else if (primarySubject === 'languages' || primarySubject === 'arabic') add('english');
    else if (primarySubject === 'history') add('social');
  }
  return subjects;
}

/** Teacher teaches multiple grades. Generate the full list (2-3 grades incl. primary). */
function getTeacherGrades(teacher: TeacherProfileData): number[] {
  const seed = teacher.id.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
  const count = Math.floor(rng(100) * 3) + 1; // 1-3 grades
  const grades = new Set<number>([teacher.grade]);
  // Add nearby grades (within 3 range, same school level)
  const isHighSchool = teacher.grade >= 10;
  const rangeMin = isHighSchool ? 10 : teacher.grade <= 6 ? 1 : 7;
  const rangeMax = isHighSchool ? 12 : teacher.grade <= 6 ? 6 : 9;
  let attempts = 0;
  while (grades.size < count + 1 && attempts < 10) {
    const offset = Math.floor(rng(200 + attempts) * (rangeMax - rangeMin + 1)) + rangeMin;
    if (offset !== teacher.grade) grades.add(offset);
    attempts++;
  }
  return Array.from(grades).sort((a, b) => a - b);
}

/** Compute teacher metrics for a specific grade (using MOCK_SCHOOL_DATA) */
function getMetricsForGrade(
  teacher: TeacherProfileData,
  grade: number,
  subjectKey: string
): {
  students: StudentProfile[];
  studentCount: number;
  avgAccuracy: number;
  avgXp: number;
  unitAccuracies: { unit: string; accuracy: number }[];
  weeklyTrend: number[];
} {
  const sub = (subjectKey === 'all' ? 'math' : subjectKey) as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;

  // If this is the teacher's primary grade, use the existing data
  if (grade === teacher.grade) {
    return {
      students: teacher.students,
      studentCount: teacher.studentCount,
      avgAccuracy: teacher.avgAccuracy,
      avgXp: teacher.avgXp,
      unitAccuracies: teacher.unitAccuracies,
      weeklyTrend: teacher.weeklyTrend,
    };
  }

  // Otherwise, pick a seeded section for this teacher in the new grade
  const seedBase = (teacher.id.charCodeAt(4) || 0) + grade * 31;
  const sectionIdx = seedBase % 6;
  const section = ['A', 'B', 'C', 'D', 'E', 'F'][sectionIdx];
  const students = MOCK_SCHOOL_DATA.filter(st => st.grade === grade && st.section === section);

  const accs = students.map(st => st.subjectDetails[sub]?.accuracy ?? 0).filter(a => a > 0);
  const avgAcc = accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;
  const avgXp = students.length > 0
    ? Math.round(students.reduce((s, st) => s + (st.subjectXp[sub] ?? 0), 0) / students.length)
    : 0;

  const unitAccuracies = units.map(unit => {
    const key = `${sub}-${unit}`;
    const accList = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
    return {
      unit,
      accuracy: accList.length > 0 ? Math.round(accList.reduce((a, b) => a + b, 0) / accList.length) : 0,
    };
  });

  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const base = avgAcc - 10 + i * 1.5;
    const r = ((seedBase * 9301 + 49297 + i * 13) % 233280) / 233280;
    return Math.round(Math.max(40, Math.min(99, base + (r * 12 - 6))));
  });

  return { students, studentCount: students.length, avgAccuracy: avgAcc, avgXp, unitAccuracies, weeklyTrend };
}

type TabId = 'performance' | 'heatmap' | 'trends' | 'platform' | 'impact' | 'attendance';

/** Aggregated metrics across ALL grades the teacher teaches */
function getAggregatedMetrics(teacher: TeacherProfileData, grades: number[], subjectKey: string) {
  let allStudents: StudentProfile[] = [];
  let totalAcc = 0;
  let totalXp = 0;
  let accCount = 0;
  const weeklyTrendSum = Array(8).fill(0);

  for (const g of grades) {
    const m = getMetricsForGrade(teacher, g, subjectKey);
    allStudents = allStudents.concat(m.students);
    if (m.avgAccuracy > 0) {
      totalAcc += m.avgAccuracy;
      accCount++;
    }
    totalXp += m.avgXp * m.studentCount;
    m.weeklyTrend.forEach((v, i) => { weeklyTrendSum[i] += v; });
  }

  const avgAccuracy = accCount > 0 ? Math.round(totalAcc / accCount) : 0;
  const avgXp = allStudents.length > 0 ? Math.round(totalXp / allStudents.length) : 0;
  const weeklyTrend = weeklyTrendSum.map(v => Math.round(v / grades.length));

  return {
    students: allStudents,
    studentCount: allStudents.length,
    avgAccuracy,
    avgXp,
    weeklyTrend,
    gradesCount: grades.length,
  };
}

/* ═══════════════════════════════════════════════════════════════
   Modal
   ═══════════════════════════════════════════════════════════════ */

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  teacher, onClose, locale, subject = 'math', onViewFull, teacherScore,
}) => {
  const ar = locale === 'ar';
  const [activeTab, setActiveTab] = useState<TabId>('performance');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const contentStats = useMemo(() => teacher ? getContentStats(teacher.id) : null, [teacher]);

  const teacherSubjects = useMemo(
    () => teacher ? getSubjectForTeacher(teacher, subject) : [],
    [teacher, subject]
  );

  const teacherGrades = useMemo(
    () => teacher ? getTeacherGrades(teacher) : [],
    [teacher]
  );

  const activeGrade = selectedGrade ?? teacher?.grade ?? 0;

  const gradeMetrics = useMemo(
    () => teacher ? getMetricsForGrade(teacher, activeGrade, subject) : null,
    [teacher, activeGrade, subject]
  );

  const aggregated = useMemo(
    () => teacher && teacherGrades.length > 0 ? getAggregatedMetrics(teacher, teacherGrades, subject) : null,
    [teacher, teacherGrades, subject]
  );

  const campusName = useMemo(() => {
    if (!teacher) return '';
    const c = CAMPUSES.find(c => c.id === teacher.campusId);
    return ar ? c?.name ?? '' : c?.nameEn ?? '';
  }, [teacher, ar]);

  // Composite Teacher Impact Score (0-100)
  const impactScore = useMemo(() => {
    if (!teacher) return 0;
    const vals = Object.values(teacher.healthSignals) as string[];
    const health = vals.reduce((s: number, v) => s + (v === 'green' ? 3 : v === 'amber' ? 2 : 1), 0);
    const healthPct = (health / (vals.length * 3)) * 100;
    return Math.round(healthPct * 0.35 + teacher.avgAccuracy * 0.25 + teacher.studentEngagementScore * 0.25 + (teacher.engagementHours / 5) * 15);
  }, [teacher]);

  // Rankings (computed against MOCK_SCHOOL_DATA)
  const rankings = useMemo(() => {
    if (!teacher) return { subject: 0, campus: 0, school: 0, totalSubject: 0, totalCampus: 0, totalSchool: 0 };
    // Build all "teacher rankings" by subject accuracy proxy for this modal
    const allTeachers = Array.from({ length: 72 }, (_, i) => 50 + ((i * 7 + 13) % 45));
    allTeachers.sort((a, b) => b - a);
    const rank = allTeachers.findIndex(a => a <= teacher.avgAccuracy) + 1;
    return {
      subject: Math.max(1, Math.min(rank, 18)),
      campus: Math.max(1, Math.min(Math.floor(rank / 2), 24)),
      school: Math.max(1, rank),
      totalSubject: 18,
      totalCampus: 24,
      totalSchool: 72,
    };
  }, [teacher]);

  if (!teacher) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-50 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-white flex flex-col font-['Cairo']"
          dir={ar ? 'rtl' : 'ltr'}
        >
          {/* ═══════ HEADER ═══════ */}
          <div className="bg-white p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />

            {/* Right: Avatar + Name + Pills */}
            <div className="flex items-center gap-6 relative z-10">
              <TeacherAvatar name={teacher.name} size={96} />
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{teacher.name}</h2>
                  <StarRating rating={teacher.starRating} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Subject pills */}
                  {teacherSubjects.map((subj, idx) => {
                    const meta = SUBJECT_META[subj] || SUBJECT_META.math;
                    return (
                      <span
                        key={subj}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm bg-gradient-to-r ${meta.gradient}`}
                      >
                        <span>{meta.emoji}</span>
                        <span>{ar ? meta.ar : meta.en}</span>
                      </span>
                    );
                  })}
                  <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {ar ? `الصف ${teacher.grade} — شعبة ${teacher.section}` : `Grade ${teacher.grade}${teacher.section}`}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
                    <Building2 className="w-3.5 h-3.5" /> {campusName}
                  </span>
                </div>
                {/* Ranking + Avg XP — moved into the header */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <School className="w-3 h-3" /> {ar ? 'الترتيب' : 'Rank'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg text-[11px] font-black text-indigo-700">
                    {ar ? 'المدرسة' : 'School'} #{rankings.school}
                    {rankings.school <= 10 && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </span>
                  <span className="bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-lg text-[11px] font-black text-violet-700">
                    {ar ? 'المبنى' : 'Campus'} #{rankings.campus}
                  </span>
                  <span className="bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-lg text-[11px] font-black text-sky-700">
                    {ar ? 'المادة' : 'Subject'} #{rankings.subject}
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-[11px] font-black text-emerald-700">
                    <Zap className="w-3 h-3" />
                    {ar ? 'متوسط XP' : 'Avg XP'} {aggregated.avgXp.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Left: Floating Stat Pills */}
            <div className="flex gap-3 relative z-10 self-end md:self-center items-stretch">
              {/* HERO: Teacher Score — the most important number */}
              {typeof teacherScore === 'number' && (() => {
                const tone = teacherScore >= 75 ? 'emerald' : teacherScore >= 55 ? 'amber' : 'rose';
                const palette = {
                  emerald: { from: 'from-emerald-500', to: 'to-teal-600', text: 'text-emerald-600', tint: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', soft: 'text-emerald-400' },
                  amber:   { from: 'from-amber-500',   to: 'to-orange-600',  text: 'text-amber-600',   tint: 'from-amber-50 to-orange-50',  border: 'border-amber-200',  soft: 'text-amber-400' },
                  rose:    { from: 'from-rose-500',    to: 'to-red-600',     text: 'text-rose-600',    tint: 'from-rose-50 to-red-50',      border: 'border-rose-200',   soft: 'text-rose-400' },
                }[tone];
                return (
                  <div className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${palette.tint} px-5 py-2 rounded-2xl border-2 ${palette.border} shadow-md min-w-[120px]`}>
                    <span className={`text-[10px] uppercase font-black mb-0.5 flex items-center gap-1 ${palette.soft}`}>
                      <Trophy className="w-3 h-3" /> {ar ? 'نتيجة المعلم' : 'Teacher Score'}
                      <InfoTip>
                        <div className="text-start space-y-1">
                          <div className="font-black mb-1">{ar ? 'كيف نحسبها؟' : 'How is it computed?'}</div>
                          <div>• <b>٥٠٪</b> {ar ? 'التزام المعلم بالأنشطة اليومية' : 'daily-activity commitment'}</div>
                          <div>• <b>٥٠٪</b> {ar ? 'متوسط نشاط الطلاب أسبوعياً' : 'student weekly active time'}</div>
                          <div className="opacity-80 mt-1">{ar ? 'المعاير: أعلى معلم في المدرسة × ١.١٥ = ١٠٠٪' : 'Scale: top teacher × 1.15 = 100%'}</div>
                        </div>
                      </InfoTip>
                    </span>
                    <span className={`text-3xl font-black tabular-nums ${palette.text}`}>{teacherScore}<span className="text-sm text-slate-300">/100</span></span>
                  </div>
                );
              })()}
              <div className="flex flex-col items-center bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {ar ? 'وقت الاستخدام' : 'Platform Time'}
                </span>
                <span className="text-2xl font-black text-amber-600" dir="ltr">
                  {teacher.engagementHours}h
                </span>
              </div>
              <div className="flex flex-col items-center bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-500 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {ar ? 'متوسط XP' : 'Avg XP'}
                </span>
                <span className="text-2xl font-black text-emerald-600 tabular-nums" dir="ltr">
                  {aggregated.avgXp.toLocaleString()}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* ═══════ TABS ═══════ */}
          <div className="flex gap-2 px-6 pt-4 bg-white border-b border-slate-100 shrink-0 overflow-x-auto">
            {([
              { id: 'performance', labelAr: 'الأداء والتأثير', labelEn: 'Performance & Impact', icon: Trophy },
              { id: 'heatmap',     labelAr: 'أداء الوحدات',    labelEn: 'Unit Performance',    icon: BarChart3 },
              { id: 'trends',      labelAr: 'اتجاهات زمنية',   labelEn: 'Trends Over Time',    icon: TrendingUp },
              { id: 'platform',    labelAr: 'الاستخدام الشخصي', labelEn: 'Platform Usage',     icon: Monitor },
              { id: 'impact',      labelAr: 'تأثير الطلاب',    labelEn: 'Student Impact',      icon: Heart },
              { id: 'attendance',  labelAr: 'الحضور والالتزام', labelEn: 'Attendance',          icon: UserCheck },
            ] as const).map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-bold text-sm transition-all border-t border-x whitespace-nowrap ${
                    active
                      ? 'bg-slate-50 text-slate-800 border-slate-200 -mb-px relative z-10'
                      : 'bg-white text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {ar ? tab.labelAr : tab.labelEn}
                </button>
              );
            })}
          </div>

          {/* ═══════ TAB BODY ═══════ */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'performance' && gradeMetrics && aggregated && (
                  <PerformanceTab
                    teacher={teacher}
                    locale={locale}
                    subject={subject}
                    rankings={rankings}
                    expandedUnit={expandedUnit}
                    setExpandedUnit={setExpandedUnit}
                    teacherGrades={teacherGrades}
                    activeGrade={activeGrade}
                    setSelectedGrade={setSelectedGrade}
                    gradeMetrics={gradeMetrics}
                    aggregated={aggregated}
                    contentStats={contentStats!}
                  />
                )}
                {activeTab === 'heatmap' && (
                  <HeatmapTab
                    teacher={teacher}
                    locale={locale}
                    subject={subject}
                    teacherGrades={teacherGrades}
                  />
                )}
                {activeTab === 'trends' && (
                  <TrendsTab teacher={teacher} locale={locale} />
                )}
                {activeTab === 'platform' && (
                  <PlatformTab teacher={teacher} locale={locale} contentStats={contentStats!} />
                )}
                {activeTab === 'impact' && (
                  <ImpactTab teacher={teacher} locale={locale} subject={subject} />
                )}
                {activeTab === 'attendance' && (
                  <AttendanceTab teacher={teacher} locale={locale} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(`${window.location.origin}/teacher-profile?id=${teacher.id}&subject=${subject}`);
                }
              }}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-5 rounded-2xl transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              {ar ? 'مشاركة مع المعلم' : 'Share with Teacher'}
            </button>
            {onViewFull && (
              <button
                onClick={() => onViewFull(teacher)}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-sm min-w-[160px]"
              >
                {ar ? 'عرض الملف الكامل' : 'View Full Profile'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
            >
              {ar ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 1: Performance & Impact
   ═══════════════════════════════════════════════════════════════ */

function PerformanceTab({
  teacher, locale, subject, rankings, expandedUnit, setExpandedUnit,
  teacherGrades, activeGrade, setSelectedGrade, gradeMetrics, aggregated, contentStats,
}: {
  teacher: TeacherProfileData;
  locale: 'ar' | 'en';
  subject: string;
  rankings: { subject: number; campus: number; school: number; totalSubject: number; totalCampus: number; totalSchool: number };
  expandedUnit: string | null;
  setExpandedUnit: (k: string | null) => void;
  teacherGrades: number[];
  activeGrade: number;
  setSelectedGrade: (g: number | null) => void;
  gradeMetrics: {
    students: StudentProfile[];
    studentCount: number;
    avgAccuracy: number;
    avgXp: number;
    unitAccuracies: { unit: string; accuracy: number }[];
    weeklyTrend: number[];
  };
  aggregated: {
    students: StudentProfile[];
    studentCount: number;
    avgAccuracy: number;
    avgXp: number;
    weeklyTrend: number[];
    gradesCount: number;
  };
  contentStats: ReturnType<typeof getContentStats>;
}) {
  const ar = locale === 'ar';

  // Verdict auto-generated (uses grade-scoped metrics)
  const verdict = useMemo(() => {
    const rankPct = (rankings.school / rankings.totalSchool) * 100;
    if (rankPct <= 25 && teacher.trend === 'up') return { text: ar ? 'أداء ممتاز 🚀' : 'Top Performer 🚀', desc: ar ? 'من أفضل المعلمين في المدرسة — طلابه يتفوقون والمنصة مستخدمة بفعالية.' : 'Among the best — students excel and platform is well used.' };
    if (rankPct <= 50) return { text: ar ? 'مستقر ⚡' : 'Steady ⚡', desc: ar ? 'أداء جيد ومتوازن — استمرار الاستخدام سيعزز النتائج أكثر.' : 'Solid and balanced performance — continued usage will elevate results.' };
    if (teacher.trend === 'down') return { text: ar ? 'يحتاج دعم ⚠️' : 'Needs Support ⚠️', desc: ar ? 'الأداء في تراجع — يحتاج جلسة توجيه وخطة لزيادة استخدام المنصة.' : 'Declining performance — needs coaching and platform engagement plan.' };
    return { text: ar ? 'يتطور 📊' : 'Developing 📊', desc: ar ? 'هناك فرصة لتحسين استخدام المنصة وتأثيره على الطلاب.' : 'Opportunity to improve platform engagement and student impact.' };
  }, [rankings, teacher, ar]);

  // Weekly activity — ALL grades aggregated (non-unit widget)
  const weeklyActivity = aggregated.weeklyTrend;

  // Subject unit list
  const sub = (subject === 'all' ? 'math' : subject) as keyof typeof SUBJECT_UNITS;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;

  // Best & worst 3 students — aggregated across ALL grades
  const sortedStudents = useMemo(() => {
    const subKey = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
    return [...aggregated.students].sort(
      (a, b) => (b.subjectDetails[subKey]?.accuracy ?? 0) - (a.subjectDetails[subKey]?.accuracy ?? 0)
    );
  }, [aggregated.students, subject]);
  const topStudents = sortedStudents.slice(0, 3);
  const weakStudents = [...sortedStudents].reverse().slice(0, 3);

  // Student accuracy distribution — UNIT-SCOPED (per selected grade, since classes differ)
  const accuracyBrackets = useMemo(() => {
    const subKey = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
    const brackets = [
      { label: ar ? '<٥٥%' : '<55%', min: 0, max: 55, color: '#ef4444', count: 0 },
      { label: ar ? '٥٥-٦٩%' : '55-69%', min: 55, max: 70, color: '#f59e0b', count: 0 },
      { label: ar ? '٧٠-٨٤%' : '70-84%', min: 70, max: 85, color: '#0ea5e9', count: 0 },
      { label: ar ? '٨٥-٩٤%' : '85-94%', min: 85, max: 95, color: '#10b981', count: 0 },
      { label: ar ? '٩٥%+' : '95%+', min: 95, max: 101, color: '#059669', count: 0 },
    ];
    for (const st of gradeMetrics.students) {
      const a = st.subjectDetails[subKey]?.accuracy ?? 0;
      const b = brackets.find(br => a >= br.min && a < br.max);
      if (b) b.count++;
    }
    return brackets;
  }, [gradeMetrics.students, subject, ar]);

  // Week-over-week — aggregated
  const wow = useMemo(() => {
    const thisWeek = weeklyActivity[weeklyActivity.length - 1] ?? 0;
    const lastWeek = weeklyActivity[weeklyActivity.length - 2] ?? 0;
    const delta = thisWeek - lastWeek;
    return { thisWeek, lastWeek, delta };
  }, [weeklyActivity]);

  // Smart alerts — uses aggregated data
  const alerts = useMemo(() => {
    const arr: { severity: 'red' | 'amber' | 'green'; text: string }[] = [];
    if (aggregated.avgAccuracy < 60) {
      arr.push({ severity: 'red', text: ar ? `دقة الطلاب منخفضة (${aggregated.avgAccuracy}%) — تدخل فوري مطلوب` : `Low student accuracy (${aggregated.avgAccuracy}%) — immediate intervention needed` });
    }
    if (teacher.healthSignals.studentPush === 'red') {
      arr.push({ severity: 'red', text: ar ? 'الطلاب لا يستخدمون المنصة بفعالية — راجع استراتيجية التحفيز' : 'Students not engaging — review push strategy' });
    }
    if (teacher.trend === 'down') {
      arr.push({ severity: 'amber', text: ar ? 'اتجاه الأداء هابط في الأسابيع الأخيرة' : 'Performance trending down in recent weeks' });
    }
    if (!teacher.attendanceMarked) {
      arr.push({ severity: 'amber', text: ar ? 'لم يتم تسجيل الحضور اليوم' : 'Attendance not marked today' });
    }
    if (teacher.engagementHours < 1.5) {
      arr.push({ severity: 'red', text: ar ? `استخدام المعلم للمنصة ضعيف (${teacher.engagementHours}س/أسبوع)` : `Low platform usage (${teacher.engagementHours}h/wk)` });
    }
    if (arr.length === 0) {
      arr.push({ severity: 'green', text: ar ? 'جميع المؤشرات صحية — أداء ممتاز' : 'All indicators healthy — great performance' });
    }
    return arr;
  }, [gradeMetrics, teacher, ar]);

  // Month navigator — last 6 months incl current
  const monthOptions = useMemo(() => {
    const months: { key: string; label: string; labelEn: string }[] = [];
    const now = new Date();
    const arMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const enMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: i === 0 ? 'هذا الشهر' : arMonths[d.getMonth()],
        labelEn: i === 0 ? 'This Month' : enMonths[d.getMonth()],
      });
    }
    return months;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0].key);

  return (
    <div>
      {/* ═══════ Month Navigator ═══════ */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {ar ? 'الفترة:' : 'Period:'}
        </span>
        {monthOptions.map(m => {
          const active = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMonth(m.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                active
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
              }`}
            >
              {ar ? m.label : m.labelEn}
            </button>
          );
        })}
      </div>

      {/* ═══════ 6-Card Overview Strip (ALL grades) ═══════ */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" /> {ar ? 'نظرة عامة (كل الصفوف)' : 'Overview (All Grades)'}
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">
            {ar ? `يُدرّس ${aggregated.gradesCount} صفوف` : `Teaching ${aggregated.gradesCount} grades`}
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <OverviewStat icon={<Zap className="w-4 h-4 text-cyan-500" />} value={String(contentStats.contentScore)} label={ar ? 'نقاط المحتوى' : 'Content Score'} />
          <OverviewStat icon={<Heart className="w-4 h-4 text-rose-500" />} value={`${contentStats.activeStudentRate}%`} label={ar ? 'نشاط الطلاب' : 'Student Activity'} />
          <OverviewStat icon={<BookOpen className="w-4 h-4 text-amber-500" />} value={String(contentStats.lessonsCreated)} label={ar ? 'دروس منشأة' : 'Lessons Created'} />
          <OverviewStat icon={<Clock className="w-4 h-4 text-violet-500" />} value={`${teacher.engagementHours}`} label={ar ? 'ساعات أسبوعية' : 'Weekly Hours'} />
          <OverviewStat icon={<Activity className="w-4 h-4 text-emerald-500" />} value={`${aggregated.avgAccuracy}%`} label={ar ? 'متوسط الدقة' : 'Avg Accuracy'} />
          <OverviewStat icon={<Users className="w-4 h-4 text-sky-500" />} value={String(aggregated.studentCount)} label={ar ? 'الطلاب' : 'Students'} />
        </div>
      </div>

      {/* Smart Alerts Strip (shows green checkmark when healthy) */}
      {alerts.length > 0 && (
        <div className="mb-5 space-y-2">
          {alerts.slice(0, 3).map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                alert.severity === 'red' ? 'bg-rose-50 border-rose-200 text-rose-700'
                : alert.severity === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {alert.severity === 'green'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Weekly trend + WoW comparison (ALL grades) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" /> {ar ? 'اتجاه الدقة (٨ أسابيع)' : 'Accuracy Trend (8 weeks)'}
          </h3>
          <AreaLineChart
            data={weeklyActivity.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
            color="#0ea5e9"
            height={180}
            showDots
            showGrid
          />
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 rounded-[2rem] text-white shadow-lg shadow-violet-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <h3 className="text-xs font-black uppercase tracking-wider text-violet-100 mb-4 relative z-10">
            {ar ? 'هذا الأسبوع vs الأسبوع الماضي' : 'This Week vs Last Week'}
          </h3>
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-violet-100 mb-1">{ar ? 'هذا الأسبوع' : 'This Week'}</div>
              <div className="text-2xl font-black">{wow.thisWeek}%</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-xs text-violet-100 mb-1">{ar ? 'الأسبوع الماضي' : 'Last Week'}</div>
              <div className="text-2xl font-black">{wow.lastWeek}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            {wow.delta > 0 ? <ArrowUp className="w-5 h-5 text-emerald-200" />
              : wow.delta < 0 ? <ArrowDown className="w-5 h-5 text-rose-200" />
              : <Minus className="w-5 h-5 text-violet-200" />}
            <span className={`text-lg font-black ${wow.delta > 0 ? 'text-emerald-200' : wow.delta < 0 ? 'text-rose-200' : 'text-violet-200'}`}>
              {wow.delta > 0 ? '+' : ''}{wow.delta}%
            </span>
            <span className="text-xs text-violet-100">{ar ? 'التغيير' : 'change'}</span>
          </div>
        </div>
      </div>

      {/* Verdict + Best/Worst Students Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Verdict Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div>
              <span className="text-indigo-100 text-xs font-bold uppercase mb-1 block">{ar ? 'مؤشر الأداء' : 'Performance Verdict'}</span>
              <div className="text-2xl font-black tracking-tight">{verdict.text}</div>
            </div>
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-indigo-100/90 text-sm font-medium leading-relaxed relative z-10">
            {verdict.desc}
          </p>
        </div>

        {/* Top Students */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" /> {ar ? 'أفضل ٣ طلاب' : 'Top 3 Students'}
          </h3>
          <div className="space-y-2">
            {topStudents.map((st, i) => {
              const subKey = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
              const acc = st.subjectDetails[subKey]?.accuracy ?? 0;
              return (
                <div key={st.id} className="flex items-center gap-2 py-2 px-3 bg-emerald-50/50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="flex-1 text-xs font-bold text-slate-700 truncate">{st.name}</span>
                  <span className="text-xs font-black" style={{ color: accColor(acc) }}>{acc}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weakest Students */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> {ar ? 'الأضعف أداءً' : 'Needs Support'}
          </h3>
          <div className="space-y-2">
            {weakStudents.map((st, i) => {
              const subKey = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
              const acc = st.subjectDetails[subKey]?.accuracy ?? 0;
              return (
                <div key={st.id} className="flex items-center gap-2 py-2 px-3 bg-rose-50/50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="flex-1 text-xs font-bold text-slate-700 truncate">{st.name}</span>
                  <span className="text-xs font-black" style={{ color: accColor(acc) }}>{acc}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: Platform Usage (Teacher's Own)
   ═══════════════════════════════════════════════════════════════ */

function PlatformTab({ teacher, locale, contentStats }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en';
  contentStats: ReturnType<typeof getContentStats>;
}) {
  const ar = locale === 'ar';

  const adoptionFeatures = [
    { label: ar ? 'إنشاء دروس' : 'Create Lessons', done: contentStats.lessonsCreated > 3, icon: PenTool },
    { label: ar ? 'إنشاء واجبات' : 'Create Assignments', done: contentStats.assignmentsGiven > 8, icon: ClipboardList },
    { label: ar ? 'استخدام String في كل فصل' : 'Uses String in every class', done: contentStats.classUsageActive >= contentStats.classUsageTotal, icon: BookOpen },
    { label: ar ? 'عرض تقارير' : 'View Reports', done: true, icon: BarChart3 },
    { label: ar ? 'تسجيل حضور' : 'Mark Attendance', done: teacher.attendanceMarked, icon: UserCheck },
    { label: ar ? 'تفعيل المنصة بانتظام' : 'Active on platform regularly', done: contentStats.classUsageActive >= Math.ceil(contentStats.classUsageTotal / 2), icon: Activity },
    { label: ar ? 'عرض بيانات الطلاب' : 'View Student Data', done: true, icon: Users },
    { label: ar ? 'نشر محتوى' : 'Post Content', done: contentStats.lessonsCreated > 5, icon: BookOpen },
  ];
  const adoptionCount = adoptionFeatures.filter(f => f.done).length;

  // Generate 30-day heatmap data (seeded)
  // Full-year daily activity (365 days) — GitHub-style contribution map
  const yearActivity = useMemo(() => {
    const seed = teacher.id.charCodeAt(4) || 0;
    let r = seed + 1;
    const today = new Date();
    return Array.from({ length: 365 }, (_, i) => {
      r = (r * 9301 + 49297) % 233280;
      const rand = r / 233280;
      const d = new Date(today);
      d.setDate(d.getDate() - (364 - i));
      const dow = d.getDay();
      // Low weekend activity, higher on school days
      const baseChance = dow === 5 || dow === 6 ? 0.25 : 0.75;
      const active = rand < baseChance;
      const intensity = active ? Math.ceil((rand / baseChance) * 4) : 0; // 0..4
      return { date: d.toISOString().slice(0, 10), level: Math.min(4, intensity), dow };
    });
  }, [teacher]);

  // Stats for header
  const yearStats = useMemo(() => {
    const activeDays = yearActivity.filter(d => d.level > 0).length;
    let maxStreak = 0, currentRun = 0;
    for (const d of yearActivity) {
      if (d.level > 0) { currentRun++; maxStreak = Math.max(maxStreak, currentRun); }
      else currentRun = 0;
    }
    // Current streak = trailing run from end
    let curStreak = 0;
    for (let i = yearActivity.length - 1; i >= 0; i--) {
      if (yearActivity[i].level > 0) curStreak++;
      else break;
    }
    const totalMinutes = yearActivity.reduce((s, d) => s + d.level * 12, 0);
    return { activeDays, maxStreak, curStreak, totalMinutes };
  }, [yearActivity]);

  // Peer percentile for engagement hours
  const peerPercentile = Math.min(99, Math.max(5, Math.round((teacher.engagementHours / 5) * 100)));

  return (
    <div className="space-y-5">
      {/* Hero Stat Cards — platform-specific metrics only (no duplicates with Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-800 tabular-nums">
            {contentStats.classUsageActive}<span className="text-slate-300">/{contentStats.classUsageTotal}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 inline-flex items-center gap-1 justify-center">
            {ar ? 'فصول تستخدم String' : 'Classes Using String'}
            <InfoTip>
              {ar
                ? 'عدد الفصول التي يستخدم فيها المعلم منصة String بانتظام (نشاط أسبوعي مستمر)'
                : 'Number of classes where the teacher actively uses the String platform (sustained weekly activity)'}
            </InfoTip>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-800">{contentStats.loginStreak}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{ar ? 'سلسلة الدخول (أيام)' : 'Login Streak (days)'}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <Zap className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-800">{contentStats.contentScore}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{ar ? 'نقاط المحتوى' : 'Content Score'}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <Activity className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <div className="text-2xl font-black text-slate-800">{contentStats.activeStudentRate}%</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{ar ? 'الطلاب النشطون' : 'Active Students'}</div>
        </div>
      </div>

      {/* Year Activity — GitHub-style */}
      <YearActivityWidget
        yearActivity={yearActivity}
        yearStats={yearStats}
        locale={locale}
      />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Content Creation Breakdown */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-sky-500" /> {ar ? 'إنشاء المحتوى' : 'Content Creation'}
          </h3>
          <div className="space-y-3">
            {([
              ['lessons', ar ? 'دروس' : 'Lessons', contentStats.lessonsCreated, contentStats.peerAvgLessons, 'bg-sky-500', undefined],
              ['assignments', ar ? 'واجبات' : 'Assignments', contentStats.assignmentsGiven, contentStats.peerAvgAssignments, 'bg-violet-500', undefined],
              ['exams', ar ? 'اختبارات' : 'Exams', contentStats.examsCreated, contentStats.peerAvgExams, 'bg-amber-500', undefined],
              ['strings', ar ? 'سترنغز' : 'Strings', contentStats.quizzesReviewed, contentStats.peerAvgQuizzes, 'bg-emerald-500', ar ? 'وحدات الدروس التفاعلية في منصتنا — البديل الحديث للدرس التقليدي' : 'Interactive lesson units in our platform — modern replacement for traditional lessons'],
            ] as const).map(([key, label, val, avg, color, tip]) => {
              const max = Math.max(val, avg, 1) * 1.2;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 inline-flex items-center gap-1">
                      {label}
                      {tip && <InfoTip>{tip}</InfoTip>}
                    </span>
                    <span className="text-slate-400">
                      <span className="text-slate-700 font-black">{val}</span> / {ar ? 'متوسط' : 'avg'} {avg}
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className={`absolute inset-y-0 start-0 rounded-full ${color}`}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-500"
                      style={{ insetInlineStart: `${(avg / max) * 100}%` }}
                      title={`${ar ? 'متوسط الأقران' : 'Peer avg'}: ${avg}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {ar ? 'تبني المزايا' : 'Feature Adoption'}
            </h3>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {adoptionCount}/{adoptionFeatures.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {adoptionFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold ${f.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 truncate">{f.label}</span>
                  {f.done ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Peer Comparison — teacher vs subject avg vs campus avg */}
      {(() => {
        // Synthetic benchmarks (stable per teacher)
        const benchSeed = teacher.id.charCodeAt(4) || 17;
        const bench = (offset: number) => ((benchSeed * 9301 + 49297 + offset * 31) % 233280) / 233280;

        // Normalize all to 0-100 scale for radar
        const teacherHoursN = Math.min(100, (teacher.engagementHours / 5) * 100);
        const subjectHoursN = 40 + bench(1) * 35;
        const campusHoursN = 38 + bench(2) * 38;

        const teacherAcc = teacher.avgAccuracy;
        const subjectAcc = 65 + bench(3) * 20;
        const campusAcc = 63 + bench(4) * 22;

        const teacherEng = teacher.studentEngagementScore;
        const subjectEng = 55 + bench(5) * 25;
        const campusEng = 52 + bench(6) * 28;

        const teacherLessons = Math.min(100, contentStats.lessonsCreated * 6);
        const subjectLessons = 40 + bench(7) * 30;
        const campusLessons = 35 + bench(8) * 35;

        const teacherClassUse = Math.round((contentStats.classUsageActive / Math.max(1, contentStats.classUsageTotal)) * 100);
        const subjectClassUse = 55 + bench(9) * 30;
        const campusClassUse = 50 + bench(10) * 35;

        const axes = [
          { label: ar ? 'الساعات' : 'Hours', maxValue: 100 },
          { label: ar ? 'الدقة' : 'Accuracy', maxValue: 100 },
          { label: ar ? 'التفاعل' : 'Engage', maxValue: 100 },
          { label: ar ? 'الدروس' : 'Lessons', maxValue: 100 },
          { label: ar ? 'تبني المنصة' : 'Adoption', maxValue: 100 },
        ];

        return (
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
            {/* Header + percentile banner */}
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  {ar ? 'مقارنة المعلم بالمتوسطات' : 'Teacher vs Peer Averages'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {ar ? 'المعلم مقابل متوسط المادة ومتوسط المبنى' : 'Teacher vs subject & campus averages'}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${peerPercentile >= 70 ? 'bg-emerald-50 text-emerald-700' : peerPercentile >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {ar ? `أعلى ${100 - peerPercentile}٪` : `Top ${100 - peerPercentile}%`}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radar comparison */}
              <div className="flex items-center justify-center" dir="ltr">
                <RadarChart
                  axes={axes}
                  datasets={[
                    { name: ar ? 'المعلم' : 'Teacher', values: [teacherHoursN, teacherAcc, teacherEng, teacherLessons, teacherClassUse], color: '#8b5cf6' },
                    { name: ar ? 'متوسط المادة' : 'Subject Avg', values: [subjectHoursN, subjectAcc, subjectEng, subjectLessons, subjectClassUse], color: '#0ea5e9' },
                    { name: ar ? 'متوسط المبنى' : 'Campus Avg', values: [campusHoursN, campusAcc, campusEng, campusLessons, campusClassUse], color: '#f59e0b' },
                  ]}
                  size={260}
                  fillOpacity={0.15}
                />
              </div>

              {/* Comparison table */}
              <div className="space-y-2">
                {([
                  [ar ? 'ساعات أسبوعية' : 'Weekly Hours', `${teacher.engagementHours}h`, `${((subjectHoursN/100)*5).toFixed(1)}h`, `${((campusHoursN/100)*5).toFixed(1)}h`, teacherHoursN, subjectHoursN, campusHoursN],
                  [ar ? 'دقة الطلاب' : 'Student Accuracy', `${teacherAcc}%`, `${Math.round(subjectAcc)}%`, `${Math.round(campusAcc)}%`, teacherAcc, subjectAcc, campusAcc],
                  [ar ? 'تفاعل الطلاب' : 'Student Engagement', `${teacherEng}`, `${Math.round(subjectEng)}`, `${Math.round(campusEng)}`, teacherEng, subjectEng, campusEng],
                  [ar ? 'دروس منشأة' : 'Lessons Created', `${contentStats.lessonsCreated}`, `${Math.round(subjectLessons/6)}`, `${Math.round(campusLessons/6)}`, teacherLessons, subjectLessons, campusLessons],
                  [ar ? 'تبني المنصة' : 'Platform Adoption', `${teacherClassUse}%`, `${Math.round(subjectClassUse)}%`, `${Math.round(campusClassUse)}%`, teacherClassUse, subjectClassUse, campusClassUse],
                ] as const).map((row, i) => {
                  const teacherVal = row[4] as number;
                  const subjectVal = row[5] as number;
                  const vsSubject = teacherVal - subjectVal;
                  return (
                    <div key={i} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700">{row[0]}</span>
                        <span className={`text-xs font-black flex items-center gap-0.5 ${
                          vsSubject > 0 ? 'text-emerald-600' : vsSubject < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {vsSubject > 0 ? <ArrowUp className="w-3 h-3" /> : vsSubject < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {vsSubject > 0 ? '+' : ''}{Math.round(vsSubject)}{typeof row[1] === 'string' && (row[1] as string).includes('%') ? '%' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-violet-100 rounded-lg py-1">
                          <div className="text-[9px] text-violet-600 font-bold">{ar ? 'المعلم' : 'Teacher'}</div>
                          <div className="text-sm font-black text-violet-700">{row[1]}</div>
                        </div>
                        <div className="bg-sky-100 rounded-lg py-1">
                          <div className="text-[9px] text-sky-600 font-bold">{ar ? 'المادة' : 'Subject'}</div>
                          <div className="text-sm font-black text-sky-700">{row[2]}</div>
                        </div>
                        <div className="bg-amber-100 rounded-lg py-1">
                          <div className="text-[9px] text-amber-600 font-bold">{ar ? 'المبنى' : 'Campus'}</div>
                          <div className="text-sm font-black text-amber-700">{row[3]}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-slate-600 font-bold">{ar ? 'المعلم' : 'Teacher'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-slate-600 font-bold">{ar ? 'متوسط المادة' : 'Subject Avg'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-bold">{ar ? 'متوسط المبنى' : 'Campus Avg'}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Correlation Insight Card — moved from Impact tab */}
      <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider text-blue-100">
              {ar ? 'الرابط بين استخدام المعلم وأداء الطلاب' : 'Teacher Usage ↔ Student Performance Link'}
            </span>
          </div>
          <p className="text-lg font-bold leading-relaxed mb-4">
            {ar
              ? 'المعلمون الذين يستخدمون String أكثر من ٣ ساعات أسبوعياً — متوسط دقة طلابهم ٧٨٪.'
              : 'Teachers using String >3h/week see an average 78% student accuracy.'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-xs text-blue-100 mb-1">{ar ? 'هذا المعلم' : 'This teacher'}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black" dir="ltr">{teacher.engagementHours}h</span>
                <span className="text-sm text-blue-100">{ar ? '/ أسبوع' : '/ week'}</span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-xs text-blue-100 mb-1">{ar ? 'طلابه يحققون' : 'His students achieve'}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{teacher.avgAccuracy}%</span>
                <span className={`text-sm ${teacher.avgAccuracy >= 78 ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {teacher.avgAccuracy >= 78
                    ? (ar ? '▲ فوق المتوسط' : '▲ above avg')
                    : (ar ? '▼ تحت المتوسط' : '▼ below avg')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3: Student Impact
   ═══════════════════════════════════════════════════════════════ */

function ImpactTab({ teacher, locale, subject }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en'; subject: string;
}) {
  const ar = locale === 'ar';

  // Improvement counts
  const improvement = useMemo(() => {
    let improving = 0, declining = 0, stable = 0;
    for (const st of teacher.students) {
      const wa = st.weeklyActivity ?? [];
      if (wa.length >= 6) {
        const recent = wa.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const earlier = wa.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        if (recent > earlier * 1.1) improving++;
        else if (recent < earlier * 0.9) declining++;
        else stable++;
      } else stable++;
    }
    return { improving, declining, stable };
  }, [teacher.students]);

  const improvementPct = teacher.studentCount > 0
    ? Math.round((improvement.improving / teacher.studentCount) * 100)
    : 0;

  // Teacher Impact Score — composite (unified formula)
  const impactScore = Math.round(
    teacher.studentEngagementScore * 0.3
    + teacher.studentWeeklyLoginRate * 0.25
    + improvementPct * 0.25
    + (teacher.attendanceMarked ? 20 : 0)
  );

  return (
    <div className="space-y-5">
      {/* 4 Student-Behavior Cards — unique metrics only (no overlap with overview/ranking/verdict) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{ar ? 'معدل التحسن' : 'Improvement Rate'}</div>
          <div className="text-3xl font-black text-emerald-600">{improvementPct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{ar ? 'طلاب يتحسنون' : 'improving students'}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{ar ? 'نشاط يومي' : 'Daily Login'}</div>
          <div className="text-3xl font-black text-sky-600">{teacher.studentDailyLoginRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{ar ? 'دخول الطلاب يومياً' : 'student daily login'}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{ar ? 'وقت الاستخدام' : 'Active Time'}</div>
          <div className="text-3xl font-black text-violet-600" dir="ltr">{teacher.studentAvgActiveTime}h</div>
          <div className="text-[10px] text-slate-400 mt-1">{ar ? 'أسبوعي/طالب' : 'weekly/student'}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{ar ? 'نقاط التفاعل' : 'Engagement Score'}</div>
          <div className={`text-3xl font-black ${accTextColor(teacher.studentEngagementScore)}`}>{teacher.studentEngagementScore}</div>
          <div className="text-[10px] text-slate-400 mt-1">{ar ? 'تفاعل الطلاب' : 'student engagement'}</div>
        </div>
      </div>

      {/* Improvement Donut (full-width now since radar is moved below) */}
      <div className="grid grid-cols-1 gap-5">
        {/* Improvement Breakdown */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> {ar ? 'توزيع تطور الطلاب' : 'Student Progress Breakdown'}
          </h3>
          <div className="flex items-center gap-5">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                {(() => {
                  const total = teacher.studentCount;
                  if (total === 0) return null;
                  const circ = 2 * Math.PI * 56;
                  const imp = improvement.improving / total;
                  const stb = improvement.stable / total;
                  let offset = 0;
                  return (
                    <>
                      <circle cx="70" cy="70" r="56" fill="none" stroke="#10b981" strokeWidth="16"
                        strokeDasharray={`${imp * circ} ${circ}`}
                        strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
                      <circle cx="70" cy="70" r="56" fill="none" stroke="#94a3b8" strokeWidth="16"
                        strokeDasharray={`${stb * circ} ${circ}`}
                        strokeDashoffset={-(imp * circ)} transform="rotate(-90 70 70)" />
                      <circle cx="70" cy="70" r="56" fill="none" stroke="#ef4444" strokeWidth="16"
                        strokeDasharray={`${(improvement.declining / total) * circ} ${circ}`}
                        strokeDashoffset={-((imp + stb) * circ)} transform="rotate(-90 70 70)" />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-emerald-600">{improvementPct}%</span>
                <span className="text-[10px] text-slate-400 font-bold">{ar ? 'يتحسنون' : 'improving'}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-bold">{ar ? 'يتحسنون' : 'Improving'}</span>
                <span className="ml-auto text-emerald-600 font-black">{improvement.improving}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-slate-700 font-bold">{ar ? 'مستقرون' : 'Stable'}</span>
                <span className="ml-auto text-slate-600 font-black">{improvement.stable}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-700 font-bold">{ar ? 'يتراجعون' : 'Declining'}</span>
                <span className="ml-auto text-rose-600 font-black">{improvement.declining}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══════ Peer Benchmark Radar — Teacher vs Subject Avg vs Campus Avg ═══════ */}
      {(() => {
        // Synthetic but stable benchmarks per teacher
        const benchSeed = teacher.id.charCodeAt(4) || 23;
        const bench = (offset: number) => ((benchSeed * 9301 + 49297 + offset * 31) % 233280) / 233280;

        // Normalize everything to 0-100 scale
        const teacherTime = Math.min(100, (teacher.engagementHours / 5) * 100);
        const subjectTime = 45 + bench(1) * 30;
        const campusTime = 40 + bench(2) * 35;

        const teacherAcc = teacher.avgAccuracy;
        const subjectAcc = 65 + bench(3) * 20;
        const campusAcc = 62 + bench(4) * 23;

        // Normalize XP (avg XP is often 2000-3500 → 0-100)
        const teacherXpN = Math.min(100, (teacher.avgXp / 4000) * 100);
        const subjectXpN = 50 + bench(5) * 25;
        const campusXpN = 45 + bench(6) * 28;

        const teacherEng = teacher.studentEngagementScore;
        const subjectEng = 55 + bench(7) * 25;
        const campusEng = 52 + bench(8) * 28;

        const compRows = [
          { label: ar ? 'الوقت (س/أسبوع)' : 'Time (h/week)', t: teacher.engagementHours.toFixed(1), s: ((subjectTime/100)*5).toFixed(1), c: ((campusTime/100)*5).toFixed(1), tn: teacherTime, sn: subjectTime, cn: campusTime, unit: 'h' },
          { label: ar ? 'الدقة' : 'Accuracy', t: `${teacherAcc}%`, s: `${Math.round(subjectAcc)}%`, c: `${Math.round(campusAcc)}%`, tn: teacherAcc, sn: subjectAcc, cn: campusAcc, unit: '%' },
          { label: 'XP', t: teacher.avgXp.toLocaleString(), s: Math.round((subjectXpN/100)*4000).toLocaleString(), c: Math.round((campusXpN/100)*4000).toLocaleString(), tn: teacherXpN, sn: subjectXpN, cn: campusXpN, unit: '' },
          { label: ar ? 'التفاعل' : 'Engagement', t: `${teacherEng}`, s: `${Math.round(subjectEng)}`, c: `${Math.round(campusEng)}`, tn: teacherEng, sn: subjectEng, cn: campusEng, unit: '' },
        ];

        return (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-500" />
                  {ar ? 'مقارنة المعلم بالمتوسطات' : 'Benchmark Comparison'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {ar ? 'الوقت · الدقة · XP · التفاعل — مقابل متوسط المادة ومتوسط المبنى' : 'Time · Accuracy · XP · Engagement — vs subject & campus averages'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              {/* BIG Radar — 2/5 cols */}
              <div className="lg:col-span-2 flex items-center justify-center" dir="ltr">
                <RadarChart
                  axes={[
                    { label: ar ? 'الوقت' : 'Time', maxValue: 100 },
                    { label: ar ? 'الدقة' : 'Accuracy', maxValue: 100 },
                    { label: 'XP', maxValue: 100 },
                    { label: ar ? 'التفاعل' : 'Engagement', maxValue: 100 },
                  ]}
                  datasets={[
                    { name: ar ? 'المعلم' : 'Teacher', values: [teacherTime, teacherAcc, teacherXpN, teacherEng], color: '#8b5cf6' },
                    { name: ar ? 'متوسط المادة' : 'Subject Avg', values: [subjectTime, subjectAcc, subjectXpN, subjectEng], color: '#0ea5e9' },
                    { name: ar ? 'متوسط المبنى' : 'Campus Avg', values: [campusTime, campusAcc, campusXpN, campusEng], color: '#f59e0b' },
                  ]}
                  size={340}
                  fillOpacity={0.2}
                />
              </div>

              {/* Comparison rows — 3/5 cols */}
              <div className="lg:col-span-3 space-y-3">
                {compRows.map((row, i) => {
                  const vsSubject = row.tn - row.sn;
                  const vsCampus = row.tn - row.cn;
                  return (
                    <div key={i} className="bg-slate-50 rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-700">{row.label}</span>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className={`flex items-center gap-0.5 font-black ${vsSubject > 0 ? 'text-emerald-600' : vsSubject < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {vsSubject > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : vsSubject < 0 ? <ArrowDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                            {ar ? 'م.المادة' : 'vs Subj'}: {vsSubject > 0 ? '+' : ''}{Math.round(vsSubject)}
                          </span>
                          <span className={`flex items-center gap-0.5 font-black ${vsCampus > 0 ? 'text-emerald-600' : vsCampus < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {vsCampus > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : vsCampus < 0 ? <ArrowDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                            {ar ? 'م.المبنى' : 'vs Camp'}: {vsCampus > 0 ? '+' : ''}{Math.round(vsCampus)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-violet-100 rounded-xl py-2 border border-violet-200">
                          <div className="text-[9px] text-violet-600 font-bold uppercase">{ar ? 'المعلم' : 'Teacher'}</div>
                          <div className="text-base font-black text-violet-700 mt-0.5">{row.t}{row.unit === 'h' ? 'h' : ''}</div>
                        </div>
                        <div className="bg-sky-100 rounded-xl py-2 border border-sky-200">
                          <div className="text-[9px] text-sky-600 font-bold uppercase">{ar ? 'المادة' : 'Subject'}</div>
                          <div className="text-base font-black text-sky-700 mt-0.5">{row.s}{row.unit === 'h' ? 'h' : ''}</div>
                        </div>
                        <div className="bg-amber-100 rounded-xl py-2 border border-amber-200">
                          <div className="text-[9px] text-amber-600 font-bold uppercase">{ar ? 'المبنى' : 'Campus'}</div>
                          <div className="text-base font-black text-amber-700 mt-0.5">{row.c}{row.unit === 'h' ? 'h' : ''}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-slate-100 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-slate-600 font-bold">{ar ? 'المعلم' : 'Teacher'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-slate-600 font-bold">{ar ? 'متوسط المادة' : 'Subject Avg'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-bold">{ar ? 'متوسط المبنى' : 'Campus Avg'}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Teacher Impact Score — unified with formula breakdown */}
      <div className={`p-5 rounded-[2rem] border-2 ${impactScore >= 70 ? 'bg-emerald-50 border-emerald-200' : impactScore >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black ${impactScore >= 70 ? 'bg-emerald-500' : impactScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}>
            {impactScore}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">{ar ? 'مؤشر تأثير المعلم' : 'Teacher Impact Score'}</div>
            <div className={`text-lg font-black ${impactScore >= 70 ? 'text-emerald-700' : impactScore >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
              {impactScore >= 70
                ? (ar ? 'المعلم يدفع طلابه بفعالية' : 'Effectively pushing students')
                : impactScore >= 50
                ? (ar ? 'المعلم يحتاج لزيادة التفاعل' : 'Needs to increase engagement')
                : (ar ? 'المعلم يحتاج تدخل عاجل' : 'Needs urgent intervention')}
            </div>
          </div>
        </div>
        {/* Formula breakdown */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/60">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">{ar ? 'تركيبة المؤشر' : 'Score Breakdown'}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <ScorePart label={ar ? 'تفاعل الطلاب' : 'Engagement'} weight="30%" contribution={Math.round(teacher.studentEngagementScore * 0.3)} />
            <ScorePart label={ar ? 'دخول أسبوعي' : 'Weekly Login'} weight="25%" contribution={Math.round(teacher.studentWeeklyLoginRate * 0.25)} />
            <ScorePart label={ar ? 'التحسن' : 'Improvement'} weight="25%" contribution={Math.round(improvementPct * 0.25)} />
            <ScorePart label={ar ? 'الحضور' : 'Attendance'} weight="20%" contribution={teacher.attendanceMarked ? 20 : 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScorePart({ label, weight, contribution }: { label: string; weight: string; contribution: number }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2 text-center">
      <div className="text-[10px] text-slate-400 font-bold">{label}</div>
      <div className="text-sm font-black text-slate-700">+{contribution}</div>
      <div className="text-[9px] text-slate-400">{weight}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4: Attendance & Commitment
   ═══════════════════════════════════════════════════════════════ */

function AttendanceTab({ teacher, locale }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en';
}) {
  const ar = locale === 'ar';

  // Seeded metrics
  const seed = teacher.id.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;

  /* ─── Teacher's own attendance (did teacher show up to work) ─── */
  const teacherPresentDays = 20 + Math.floor(rng(20) * 7); // out of 22 working days
  const teacherWorkDays = 22;
  const teacherAbsences = teacherWorkDays - teacherPresentDays;
  const teacherLates = Math.floor(rng(21) * 5);
  const teacherPresentPct = Math.round((teacherPresentDays / teacherWorkDays) * 100);
  const teacherStreak = Math.floor(rng(22) * 18) + 3;
  const teacherShowedToday = rng(23) > 0.1;
  const teacherFirstIn = rng(24) > 0.3 ? '07:45' : '08:12';

  // 30-day teacher attendance trend (proper LCG)
  const teacherAttTrend = (() => {
    let r = seed + 101;
    return Array.from({ length: 30 }, () => {
      r = (r * 9301 + 49297) % 233280;
      return (r / 233280) > 0.12 ? 100 : 0; // 100 = present, 0 = absent
    });
  })();

  /* ─── Per-class attendance marking (teacher takes attendance in each class separately) ─── */
  const teacherGrades = getTeacherGrades(teacher);
  const classes = teacherGrades.map((g, i) => {
    const cSeed = seed + g * 31 + i * 7;
    const cRng = (n: number) => ((cSeed * 9301 + 49297 + n * 11) % 233280) / 233280;
    // Derive section deterministically per grade (same approach as getMetricsForGrade)
    const sectionIdx = (cSeed) % 6;
    const section = g === teacher.grade ? teacher.section : ['A', 'B', 'C', 'D', 'E', 'F'][sectionIdx];
    const total = 22 + Math.floor(cRng(1) * 12); // 22-33 students per class
    const presentPct = Math.round(78 + cRng(2) * 20);
    const present = Math.round(total * (presentPct / 100));
    const absent = total - present;
    const late = Math.floor(cRng(3) * 4);
    // Marking status today: more likely marked for earlier classes in the day
    const marked = cRng(4) > (i === 0 ? 0.05 : i === 1 ? 0.15 : 0.30);
    const markedAt = marked
      ? `${(8 + i).toString().padStart(2, '0')}:${Math.floor(cRng(5) * 50 + 5).toString().padStart(2, '0')}`
      : null;
    const markedDaysLast30 = Math.round(18 + cRng(6) * 11);
    const chronicAbsent = Math.floor(cRng(7) * 3);
    return {
      key: `${g}-${section}`, grade: g, section, total,
      present, absent, late, presentPct,
      marked, markedAt, markedDaysLast30, chronicAbsent,
    };
  });

  const classesMarkedToday = classes.filter(c => c.marked).length;
  const totalClasses = classes.length;
  const totalStudentsAcrossClasses = classes.reduce((s, c) => s + c.total, 0);
  const totalPresentAcrossClasses = classes.reduce((s, c) => s + c.present, 0);
  const overallPresentPct = totalStudentsAcrossClasses > 0
    ? Math.round((totalPresentAcrossClasses / totalStudentsAcrossClasses) * 100) : 0;
  const totalChronicAbsent = classes.reduce((s, c) => s + c.chronicAbsent, 0);
  const markStreak = Math.floor(rng(2) * 12) + 1;
  const markingAvgMinutesLate = Math.floor(rng(25) * 12);
  const avgMarkedDays = Math.round(classes.reduce((s, c) => s + c.markedDaysLast30, 0) / Math.max(1, classes.length));

  const markingTrend = (() => {
    let r = seed + 59;
    return Array.from({ length: 30 }, () => {
      r = (r * 9301 + 49297) % 233280;
      return Math.round(75 + (r / 233280) * 20);
    });
  })();

  // Per-class recent events
  const recentEvents = classes.slice(0, 4).map((c, i) => {
    if (c.marked) {
      const isWarn = c.absent >= 3;
      return {
        time: c.markedAt!,
        ar: isWarn
          ? `${c.absent} غيابات في الصف ${c.grade} — شعبة ${c.section}`
          : `تم تسجيل الحضور للصف ${c.grade} — شعبة ${c.section}`,
        en: isWarn
          ? `${c.absent} absences in Grade ${c.grade}${c.section}`
          : `Attendance marked for Grade ${c.grade}${c.section}`,
        type: isWarn ? 'warning' : 'success' as const,
      };
    }
    return {
      time: ar ? 'لم يُسجَّل بعد' : 'Not yet marked',
      ar: `الصف ${c.grade} — شعبة ${c.section} لم يُسجَّل`,
      en: `Grade ${c.grade}${c.section} pending`,
      type: 'warning' as const,
    };
  });

  return (
    <div className="space-y-6">
      {/* ═══════ SECTION 1: TEACHER'S OWN ATTENDANCE ═══════ */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">
              {ar ? 'حضور المعلم الشخصي' : "Teacher's Own Attendance"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {ar ? 'هل حضر المعلم إلى المدرسة؟' : 'Did the teacher show up to work?'}
            </p>
          </div>
        </div>

        {/* Row 1: Today + 30-day rate + streak + first-in */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className={`p-4 rounded-2xl border-2 shadow-sm flex items-center gap-3 ${teacherShowedToday ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${teacherShowedToday ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {teacherShowedToday ? <CheckCircle2 className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'حضور اليوم' : 'Today'}</div>
              <div className={`text-base font-black ${teacherShowedToday ? 'text-emerald-700' : 'text-rose-700'}`}>
                {teacherShowedToday ? (ar ? 'حاضر' : 'Present') : (ar ? 'غائب' : 'Absent')}
              </div>
              {teacherShowedToday && <div className="text-[10px] text-slate-400" dir="ltr">{teacherFirstIn}</div>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <ProgressRing value={teacherPresentPct} max={100} size={44} strokeWidth={5} color={teacherPresentPct >= 90 ? '#10b981' : teacherPresentPct >= 75 ? '#f59e0b' : '#ef4444'} animate />
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'نسبة الحضور' : 'Attendance Rate'}</div>
              <div className="text-base font-black text-slate-800">{teacherPresentPct}%</div>
              <div className="text-[10px] text-slate-400">{teacherPresentDays}/{teacherWorkDays} {ar ? 'يوم' : 'days'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'سلسلة حضور' : 'Present Streak'}</div>
              <div className="text-base font-black text-slate-800">{teacherStreak}</div>
              <div className="text-[10px] text-slate-400">{ar ? 'أيام متتالية' : 'days in a row'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'غياب وتأخير' : 'Absences & Lates'}</div>
              <div className="text-base font-black text-slate-800">{teacherAbsences}<span className="text-xs text-slate-400 font-bold"> / {teacherLates} {ar ? 'تأخير' : 'late'}</span></div>
              <div className="text-[10px] text-slate-400">{ar ? 'خلال ٣٠ يوم' : 'last 30 days'}</div>
            </div>
          </div>
        </div>

        {/* Presence timeline (last 30 days) */}
        <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500" /> {ar ? 'سجل الحضور الشخصي (٣٠ يوم)' : 'Personal Presence (30 days)'}
          </h4>
          <div className="flex items-end gap-1">
            {teacherAttTrend.map((v, i) => (
              <div
                key={i}
                className={`flex-1 h-5 rounded ${v === 100 ? 'bg-emerald-400' : 'bg-rose-300'} hover:scale-y-125 transition-transform`}
                title={`${ar ? 'يوم' : 'Day'} ${i + 1}: ${v === 100 ? (ar ? 'حاضر' : 'Present') : (ar ? 'غائب' : 'Absent')}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>{ar ? 'قبل ٣٠ يوم' : '30 days ago'}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {ar ? 'حاضر' : 'Present'}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-300" /> {ar ? 'غائب' : 'Absent'}</span>
            </div>
            <span>{ar ? 'اليوم' : 'today'}</span>
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: PER-CLASS ATTENDANCE MARKING ═══════ */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">
              {ar ? 'تسجيل الحضور لكل فصل' : 'Per-Class Attendance Marking'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {ar ? 'يسجّل المعلم حضور طلابه في كل فصل على حدة' : 'Teacher marks attendance in each class separately'}
            </p>
          </div>
        </div>

        {/* Summary row across all classes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className={`p-4 rounded-2xl border-2 shadow-sm flex items-center gap-3 ${
            classesMarkedToday === totalClasses ? 'bg-emerald-50 border-emerald-200' :
            classesMarkedToday === 0 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${
              classesMarkedToday === totalClasses ? 'bg-emerald-500' :
              classesMarkedToday === 0 ? 'bg-rose-500' : 'bg-amber-500'
            }`}>
              {classesMarkedToday === totalClasses ? <CheckCircle2 className="w-6 h-6" /> :
                classesMarkedToday === 0 ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'تسجيل اليوم' : "Today's Marking"}</div>
              <div className="text-base font-black text-slate-800 tabular-nums">
                {classesMarkedToday}<span className="text-slate-300">/{totalClasses}</span>
                <span className="text-[10px] font-bold text-slate-500 ms-1">{ar ? 'فصل' : 'classes'}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {classesMarkedToday === totalClasses ? (ar ? 'الكل مكتمل' : 'all done')
                  : classesMarkedToday === 0 ? (ar ? 'لم يبدأ بعد' : 'not started')
                  : (ar ? `${totalClasses - classesMarkedToday} متبقي` : `${totalClasses - classesMarkedToday} remaining`)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <ProgressRing value={avgMarkedDays} max={30} size={44} strokeWidth={5} color="#8b5cf6" animate />
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'متوسط نسبة التسجيل' : 'Avg Marking Rate'}</div>
              <div className="text-base font-black text-slate-800">{avgMarkedDays}/30</div>
              <div className="text-[10px] text-slate-400">{ar ? 'يوم/فصل' : 'days/class'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'سلسلة تسجيل' : 'Marking Streak'}</div>
              <div className="text-base font-black text-slate-800">{markStreak}</div>
              <div className="text-[10px] text-slate-400">{ar ? 'أيام متتالية' : 'consecutive days'}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${markingAvgMinutesLate <= 5 ? 'bg-gradient-to-br from-emerald-400 to-green-600' : markingAvgMinutesLate <= 10 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-rose-400 to-red-600'}`}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">{ar ? 'متوسط التأخر' : 'Avg Delay'}</div>
              <div className="text-base font-black text-slate-800">{markingAvgMinutesLate} {ar ? 'د' : 'min'}</div>
              <div className="text-[10px] text-slate-400">{ar ? 'عن بداية الحصة' : 'after class start'}</div>
            </div>
          </div>
        </div>

        {/* Per-class breakdown grid */}
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-500" /> {ar ? 'حضور كل فصل اليوم' : "Each Class — Today"}
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {ar ? 'تم التسجيل' : 'Marked'}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> {ar ? 'لم يُسجَّل' : 'Pending'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {classes.map((c, idx) => {
              const pctColor = c.presentPct >= 90 ? '#10b981' : c.presentPct >= 75 ? '#f59e0b' : '#ef4444';
              return (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className={`p-4 rounded-2xl border ${c.marked ? 'bg-white border-slate-200' : 'bg-rose-50/40 border-rose-200'} shadow-sm`}
                >
                  {/* Class header + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xs font-black text-violet-700">
                        {c.grade}{c.section}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">
                          {ar ? `الصف ${c.grade} — شعبة ${c.section}` : `Grade ${c.grade}${c.section}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{c.total} {ar ? 'طالب' : 'students'}</div>
                      </div>
                    </div>
                    {c.marked ? (
                      <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        <span dir="ltr">{c.markedAt}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        {ar ? 'معلّق' : 'Pending'}
                      </span>
                    )}
                  </div>
                  {/* Stats only when marked */}
                  {c.marked ? (
                    <>
                      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                        <div className="text-center p-1.5 bg-emerald-50 rounded-lg">
                          <div className="text-sm font-black text-emerald-600 tabular-nums">{c.present}</div>
                          <div className="text-[9px] text-slate-500 font-bold">{ar ? 'حضور' : 'Pres'}</div>
                        </div>
                        <div className="text-center p-1.5 bg-rose-50 rounded-lg">
                          <div className="text-sm font-black text-rose-600 tabular-nums">{c.absent}</div>
                          <div className="text-[9px] text-slate-500 font-bold">{ar ? 'غياب' : 'Abs'}</div>
                        </div>
                        <div className="text-center p-1.5 bg-amber-50 rounded-lg">
                          <div className="text-sm font-black text-amber-600 tabular-nums">{c.late}</div>
                          <div className="text-[9px] text-slate-500 font-bold">{ar ? 'تأخر' : 'Late'}</div>
                        </div>
                      </div>
                      {/* Attendance bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full" style={{ background: pctColor }}
                            initial={{ width: 0 }} animate={{ width: `${c.presentPct}%` }} transition={{ duration: 0.7, delay: idx * 0.04 }}
                          />
                        </div>
                        <span className="text-xs font-black tabular-nums" style={{ color: pctColor }}>{c.presentPct}%</span>
                      </div>
                      {c.chronicAbsent > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          {ar ? `${c.chronicAbsent} متكرر الغياب` : `${c.chronicAbsent} chronic`}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[11px] text-rose-600 font-bold py-2">
                      {ar ? 'يجب تسجيل الحضور لهذا الفصل' : 'Attendance not yet marked'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* School-wide summary chip */}
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-bold">
              {ar ? 'الإجمالي اليوم' : 'Today Total'}:
              <span className="text-slate-800 font-black ms-1 tabular-nums">{totalPresentAcrossClasses}/{totalStudentsAcrossClasses}</span>
              <span className="text-slate-400 ms-1">({overallPresentPct}%)</span>
            </span>
            {totalChronicAbsent > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                {ar ? `${totalChronicAbsent} طلاب متكررو الغياب (>٢٠٪)` : `${totalChronicAbsent} chronic absentees (>20%)`}
              </span>
            )}
          </div>
        </div>

        {/* Marking trend + Recent events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-violet-500" /> {ar ? 'اتجاه تسجيل الحضور (٣٠ يوم)' : 'Marking Trend (30 days)'}
            </h4>
            <div dir="ltr">
              <Sparkline data={markingTrend} color="#8b5cf6" width={400} height={50} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-bold">
              <span>{ar ? 'قبل ٣٠ يوم' : '30 days ago'}</span>
              <span className="text-slate-700">{ar ? `متوسط: ${Math.round(markingTrend.reduce((a, b) => a + b, 0) / 30)}%` : `avg: ${Math.round(markingTrend.reduce((a, b) => a + b, 0) / 30)}%`}</span>
              <span>{ar ? 'اليوم' : 'today'}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-500" /> {ar ? 'آخر أحداث الحضور' : 'Recent Events'}
            </h4>
            <div className="space-y-1">
              {recentEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    ev.type === 'success' ? 'bg-emerald-400' : ev.type === 'warning' ? 'bg-amber-400' : 'bg-sky-400'
                  }`} />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-700">{ar ? ev.ar : ev.en}</div>
                    <div className="text-[10px] text-slate-400">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deep-link */}
      <button
        onClick={() => { window.location.href = `/admin-hub/attendance?teacher=${teacher.id}`; }}
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
      >
        <BarChart3 className="w-5 h-5" />
        {ar ? 'عرض كامل التفاصيل في لوحة الحضور' : 'View Full Attendance Dashboard'}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OverviewStat helper card
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   GitHub-style Year Activity Widget
   ═══════════════════════════════════════════════════════════════ */

function YearActivityWidget({
  yearActivity, yearStats, locale,
}: {
  yearActivity: { date: string; level: number; dow: number }[];
  yearStats: { activeDays: number; maxStreak: number; curStreak: number; totalMinutes: number };
  locale: 'ar' | 'en';
}) {
  const ar = locale === 'ar';

  // Build grid: weeks × 7 days. Align so each column is a week starting Sunday.
  const { weeks, monthLabels } = useMemo(() => {
    // Pad the start so week 0 starts on Sunday
    const first = new Date(yearActivity[0].date);
    const firstDow = first.getDay();
    const padded: ({ date: string; level: number; dow: number } | null)[] = [];
    for (let i = 0; i < firstDow; i++) padded.push(null);
    padded.push(...yearActivity);

    const weeks: (typeof padded)[] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    // Month labels: for each week, what month does the first non-null cell fall in?
    const monthNames = ar
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, ci) => {
      const firstCell = w.find(c => c !== null);
      if (!firstCell) return;
      const m = new Date(firstCell.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ col: ci, label: monthNames[m] });
        lastMonth = m;
      }
    });
    return { weeks, monthLabels: labels };
  }, [yearActivity, ar]);

  // Color scale
  const levelColor = (level: number) => {
    switch (level) {
      case 0: return '#e2e8f0'; // slate-200
      case 1: return '#a7f3d0'; // emerald-200
      case 2: return '#6ee7b7'; // emerald-300
      case 3: return '#34d399'; // emerald-400
      case 4: return '#10b981'; // emerald-500
      default: return '#e2e8f0';
    }
  };

  const cellSize = 11;
  const gap = 3;
  const labelColW = 28;
  const headerH = 20;
  const vWidth = labelColW + weeks.length * (cellSize + gap) + 8;
  const vHeight = headerH + 7 * (cellSize + gap) + 8;

  const formatMinutes = (m: number) => {
    if (m < 60) return `${m}${ar ? 'د' : 'm'}`;
    const h = Math.floor(m / 60);
    return `${h}${ar ? 'س' : 'h'}`;
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-black text-slate-800">
            {ar ? 'نشاط المعلم السنوي' : 'Teacher Yearly Activity'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {ar ? 'سجل الدخول والنشاط اليومي' : 'Daily login & activity streak'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600">
          <Calendar className="w-3.5 h-3.5" />
          {ar ? 'السنة الماضية' : 'Last Year'}
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sm font-black text-slate-800">{yearStats.activeDays}</span>
          <span className="text-xs text-slate-400">{ar ? 'يوم' : 'days'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-sm font-black text-slate-800">{yearStats.maxStreak}</span>
          <span className="text-xs text-slate-400">{ar ? 'أعلى' : 'max'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-sm font-black text-slate-800">{yearStats.curStreak}</span>
          <span className="text-xs text-slate-400">{ar ? 'سلسلة' : 'streak'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-violet-50 px-3 py-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-sm font-black text-slate-800">{formatMinutes(yearStats.totalMinutes)}</span>
          <span className="text-xs text-slate-400">{ar ? 'إجمالي' : 'total'}</span>
        </div>
      </div>

      {/* Grid */}
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${vWidth} ${vHeight}`} className="w-full" style={{ maxWidth: vWidth, minWidth: 600 }}>
          {/* Month labels */}
          {monthLabels.map((ml, i) => (
            <text
              key={i}
              x={labelColW + ml.col * (cellSize + gap)}
              y={12}
              fill="#94a3b8"
              fontSize={10}
              fontWeight={500}
            >
              {ml.label}
            </text>
          ))}

          {/* Day labels (Mon, Wed, Fri) */}
          {[
            { idx: 1, label: ar ? 'اث' : 'Mon' },
            { idx: 3, label: ar ? 'ربع' : 'Wed' },
            { idx: 5, label: ar ? 'جم' : 'Fri' },
          ].map(({ idx, label }) => (
            <text
              key={idx}
              x={0}
              y={headerH + idx * (cellSize + gap) + cellSize - 1}
              fill="#94a3b8"
              fontSize={9}
              fontWeight={500}
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((w, ci) =>
            w.map((cell, ri) => {
              if (!cell) return null;
              const x = labelColW + ci * (cellSize + gap);
              const y = headerH + ri * (cellSize + gap);
              return (
                <rect
                  key={`${ci}-${ri}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={levelColor(cell.level)}
                >
                  <title>
                    {cell.date} — {cell.level === 0 ? (ar ? 'لا نشاط' : 'No activity') : `${cell.level * 12} ${ar ? 'دقيقة' : 'min'}`}
                  </title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold">
          <Info className="w-3 h-3" />
          {ar ? 'كيف تُحسب المساهمات؟' : 'How are contributions counted?'}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase">{ar ? 'أقل' : 'Less'}</span>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className="w-3 h-3 rounded-sm" style={{ background: levelColor(l) }} />
          ))}
          <span className="text-[10px] text-slate-400 font-bold uppercase">{ar ? 'أكثر' : 'More'}</span>
        </div>
      </div>
    </div>
  );
}

function OverviewStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col items-center text-center gap-1 hover:shadow-md hover:border-slate-200 transition">
      {icon}
      <div className="text-xl font-black text-slate-800 leading-none mt-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 leading-tight">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Heatmap Tab — Section × Unit accuracy matrix
   ═══════════════════════════════════════════════════════════════ */

function HeatmapTab({ teacher, locale, subject, teacherGrades }: {
  teacher: TeacherProfileData;
  locale: 'ar' | 'en';
  subject: string;
  teacherGrades: number[];
}) {
  const ar = locale === 'ar';
  const [gradeFilter, setGradeFilter] = useState<number>(teacherGrades[0] ?? teacher.grade);

  const sub = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
  const subjectMeta = SUBJECT_META[sub] ?? SUBJECT_META.math;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;
  const allSections: Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F'> = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Teacher teaches 1-2 sections per grade (seeded)
  const teacherSectionsForGrade = useMemo(() => {
    const seed = (teacher.id.charCodeAt(4) || 0) + gradeFilter * 31;
    const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
    const count = rng(1) > 0.5 ? 2 : 1;
    const firstIdx = Math.floor(rng(2) * 6);
    const sections = [allSections[firstIdx]];
    if (count === 2) {
      const secondIdx = (firstIdx + Math.floor(rng(3) * 5) + 1) % 6;
      if (!sections.includes(allSections[secondIdx])) sections.push(allSections[secondIdx]);
    }
    return sections.sort();
  }, [teacher.id, gradeFilter, allSections]);

  // Build the matrix — only for teacher's sections
  const matrix = useMemo(() => {
    return teacherSectionsForGrade.map(sec => {
      const students = MOCK_SCHOOL_DATA.filter(st => st.grade === gradeFilter && st.section === sec);
      const campusId = gradeFilter <= 6 ? (sec <= 'C' ? 'camp-1' : 'camp-2') : 'camp-3';

      const accs = students.map(st => st.subjectDetails[sub]?.accuracy ?? 0).filter(a => a > 0);
      const rowAvg = accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;

      const unitCells = units.map(unit => {
        const key = `${sub}-${unit}`;
        const list = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
        return list.length > 0 ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0;
      });

      const seed = gradeFilter * 100 + sec.charCodeAt(0);
      const r = (seed * 9301 + 49297) % 233280 / 233280;
      const trend: 'up' | 'down' | 'stable' = r > 0.6 ? 'up' : r < 0.3 ? 'down' : 'stable';

      // Clean class name: "Math (Grade 6) - A"
      const className = ar
        ? `${subjectMeta.ar} (الصف ${gradeFilter}) - ${sec}`
        : `${subjectMeta.en} (Grade ${gradeFilter}) - ${sec}`;

      return {
        section: sec,
        campusId,
        className,
        studentCount: students.length,
        rowAvg,
        unitCells,
        trend,
      };
    }).filter(r => r.studentCount > 0);
  }, [gradeFilter, sub, units, ar, teacherSectionsForGrade, subjectMeta]);

  // Column totals (per-unit avg across sections)
  const colAvgs = useMemo(() => {
    return units.map((_, ci) => {
      const vals = matrix.map(r => r.unitCells[ci]).filter(v => v > 0);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    });
  }, [matrix, units]);

  const totalStudents = matrix.reduce((s, r) => s + r.studentCount, 0);

  // Color scale
  const cellBg = (v: number) => {
    if (v === 0) return 'bg-slate-50 text-slate-300';
    if (v >= 80) return 'bg-emerald-100 text-emerald-800';
    if (v >= 70) return 'bg-sky-100 text-sky-800';
    if (v >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            {ar ? 'خريطة الأداء الحرارية' : 'Performance Heatmap'}
          </h3>
          <p className="text-xs text-slate-400 font-bold">
            {ar ? 'مقارنة الوحدات عبر الشعب' : 'Unit accuracy across sections'}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Row */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-base font-black text-slate-800">
              {ar ? 'خريطة الدقة حسب الشعبة والوحدة' : 'Accuracy by Section & Unit'}
            </h4>
            <p className="text-xs text-slate-400">
              {ar ? `الصف ${gradeFilter} · ${totalStudents} طالب` : `Grade ${gradeFilter} · ${totalStudents} students`}
            </p>
          </div>

          {/* Student count pill */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-black text-slate-700">
              {totalStudents} {ar ? 'طالب' : 'students'}
            </span>
          </div>
        </div>

        {/* Grade chips */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase">{ar ? 'الصف' : 'Grade'}</span>
          {teacherGrades.map(g => (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`w-9 h-9 rounded-full text-xs font-black transition-all ${
                g === gradeFilter
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Matrix */}
        <div className="p-5 overflow-x-auto">
          {matrix.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">
              {ar ? 'لا بيانات' : 'No data'}
            </div>
          ) : (
            <table className="w-full">
              {/* Column headers */}
              <thead>
                <tr>
                  <th className="text-start p-3 text-xs font-black text-slate-500 min-w-[200px]">
                    {ar ? 'الفصل' : 'Class'}
                  </th>
                  {units.map((u, i) => {
                    const key = `${sub}-${u}`;
                    const info = UNIT_DISPLAY[key];
                    return (
                      <th key={u} className="text-center p-3 min-w-[110px]">
                        <div className="text-xs font-black text-slate-700">{info?.nameAr ?? u}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {colAvgs[i]}%
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <motion.tr
                    key={row.section}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-t border-slate-50"
                  >
                    {/* Row header */}
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          row.campusId === 'camp-1' ? 'bg-sky-100 text-sky-700' :
                          row.campusId === 'camp-2' ? 'bg-pink-100 text-pink-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {row.section}
                        </div>
                        <div className="text-xs min-w-0">
                          <div className="flex items-center gap-1 font-bold text-slate-700 truncate">
                            <span className="truncate">{row.className}</span>
                            {row.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                              : row.trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                              : <Minus className="w-3 h-3 text-slate-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ar ? `${row.studentCount} طالب` : `${row.studentCount} students`} · {row.rowAvg}%
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Cells */}
                    {row.unitCells.map((v, ci) => {
                      const unitKey = `${sub}-${units[ci]}`;
                      const unitInfo = UNIT_DISPLAY[unitKey];
                      const tooltipText = ar
                        ? `${unitInfo?.nameAr ?? units[ci]} · ${row.className} · ${v > 0 ? v + '٪ دقة، ' + row.studentCount + ' طلاب' : 'لا بيانات'}`
                        : `${unitInfo?.nameAr ?? units[ci]} · ${row.className} · ${v > 0 ? v + '% accuracy, ' + row.studentCount + ' students' : 'No data'}`;
                      return (
                        <td key={ci} className="p-1.5">
                          <div
                            className={`w-full py-3 rounded-xl text-center text-sm font-black transition-all hover:scale-105 cursor-help ${cellBg(v)}`}
                            title={tooltipText}
                          >
                            {v > 0 ? `${v}%` : '—'}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-4 flex-wrap text-xs">
          <span className="text-slate-400 font-bold">{ar ? 'مفتاح الألوان:' : 'Legend:'}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-100" />
            <span className="text-slate-600 font-semibold">80%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-sky-100" />
            <span className="text-slate-600 font-semibold">70-80%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-100" />
            <span className="text-slate-600 font-semibold">60-70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-100" />
            <span className="text-slate-600 font-semibold">&lt;60%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
            <span className="text-slate-600 font-semibold">{ar ? 'لا بيانات' : 'No data'}</span>
          </div>
        </div>
      </div>

      {/* ═══════ Per-Unit Accuracy Bar + Student Distribution (grade-scoped) ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            {ar ? `الدقة حسب الوحدة — الصف ${gradeFilter}` : `Accuracy by Unit — Grade ${gradeFilter}`}
          </h3>
          <div dir="ltr">
            <HorizontalBarChart
              data={units.map((u, ci) => {
                const info = UNIT_DISPLAY[`${sub}-${u}`];
                return {
                  label: info?.nameAr ?? u,
                  value: colAvgs[ci],
                  color: colAvgs[ci] >= 85 ? '#10b981' : colAvgs[ci] >= 70 ? '#0ea5e9' : colAvgs[ci] >= 55 ? '#f59e0b' : '#ef4444',
                };
              })}
              maxValue={100}
              showValues
              valueSuffix="%"
            />
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            {ar ? `توزيع الطلاب حسب الدقة — الصف ${gradeFilter}` : `Student Distribution — Grade ${gradeFilter}`}
          </h3>
          {(() => {
            const brackets = [
              { label: ar ? '<٥٥%' : '<55%', min: 0, max: 55, color: '#ef4444', count: 0 },
              { label: ar ? '٥٥-٦٩%' : '55-69%', min: 55, max: 70, color: '#f59e0b', count: 0 },
              { label: ar ? '٧٠-٨٤%' : '70-84%', min: 70, max: 85, color: '#0ea5e9', count: 0 },
              { label: ar ? '٨٥-٩٤%' : '85-94%', min: 85, max: 95, color: '#10b981', count: 0 },
              { label: ar ? '٩٥%+' : '95%+', min: 95, max: 101, color: '#059669', count: 0 },
            ];
            const allStudents = MOCK_SCHOOL_DATA.filter(st =>
              st.grade === gradeFilter && teacherSectionsForGrade.includes(st.section as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')
            );
            for (const st of allStudents) {
              const a = st.subjectDetails[sub]?.accuracy ?? 0;
              const b = brackets.find(br => a >= br.min && a < br.max);
              if (b) b.count++;
            }
            return (
              <VerticalBarChart
                data={brackets.map(b => ({ label: b.label, value: b.count, color: b.color }))}
                showValues
              />
            );
          })()}
        </div>
      </div>

      {/* ═══════ Unit Details (expandable) ═══════ */}
      <UnitDetailsSection
        sub={sub}
        units={units}
        gradeFilter={gradeFilter}
        teacherSectionsForGrade={teacherSectionsForGrade}
        locale={locale}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Unit Details expandable section (used in Unit Performance tab)
   ═══════════════════════════════════════════════════════════════ */
function UnitDetailsSection({
  sub, units, gradeFilter, teacherSectionsForGrade, locale,
}: {
  sub: string;
  units: string[];
  gradeFilter: number;
  teacherSectionsForGrade: Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>;
  locale: 'ar' | 'en';
}) {
  const ar = locale === 'ar';
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const meta = SUBJECT_META[sub] ?? SUBJECT_META.math;

  const students = useMemo(() =>
    MOCK_SCHOOL_DATA.filter(st => st.grade === gradeFilter && teacherSectionsForGrade.includes(st.section as 'A' | 'B' | 'C' | 'D' | 'E' | 'F'))
  , [gradeFilter, teacherSectionsForGrade]);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
        <BookOpen className="w-4 h-4" />
        {ar ? `تفاصيل الوحدات — الصف ${gradeFilter}` : `Unit Details — Grade ${gradeFilter}`}
      </h3>
      <div className="space-y-3">
        {units.map((unitId) => {
          const key = `${sub}-${unitId}`;
          const info = UNIT_DISPLAY[key] ?? { nameAr: unitId, emoji: '📚', lessons: 3, timeMin: 30 };
          const accList = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
          const unitAcc = accList.length > 0 ? Math.round(accList.reduce((a, b) => a + b, 0) / accList.length) : 0;
          const unitXp = Math.round(students.reduce((s, st) => s + (st.lessonDetails[key]?.xp ?? 0), 0));
          const isExpanded = expandedUnit === key;
          const studentCount = students.length;

          return (
            <motion.div
              layout
              key={key}
              className={`bg-white rounded-[1.5rem] border transition-all overflow-hidden ${
                isExpanded ? 'border-blue-200 shadow-lg ring-4 ring-blue-50 z-10' : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => setExpandedUnit(isExpanded ? null : key)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-xl">
                    {info.emoji}
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-black text-slate-800">{info.nameAr}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${meta.gradient}`}>
                        {ar ? meta.ar : meta.en}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span>{info.lessons} {ar ? 'دروس' : 'lessons'}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {info.timeMin}{ar ? ' د' : 'm'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <div className="text-base font-black" style={{ color: unitAcc >= 85 ? '#10b981' : unitAcc >= 70 ? '#0ea5e9' : unitAcc >= 55 ? '#f59e0b' : '#ef4444' }}>{unitAcc}%</div>
                    <div className="text-[10px] text-slate-400 font-bold">{ar ? 'الدقة' : 'Accuracy'}</div>
                  </div>
                  <div className="text-end hidden sm:block">
                    <div className="text-base font-black text-slate-700">{unitXp.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold">XP {ar ? 'مكتسب' : 'earned'}</div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="p-4 bg-slate-50/50 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">{ar ? 'طلاب أتموا الوحدة' : 'Students Completed'}</div>
                        <div className="text-lg font-black text-slate-700">{Math.round(studentCount * (unitAcc / 100))}/{studentCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">{ar ? 'متوسط الوقت' : 'Avg Time'}</div>
                        <div className="text-lg font-black text-slate-700" dir="ltr">{formatTime(info.timeMin)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">{ar ? 'نسبة النجاح' : 'Pass Rate'}</div>
                        <div className="text-lg font-black" style={{ color: unitAcc >= 85 ? '#10b981' : unitAcc >= 70 ? '#0ea5e9' : unitAcc >= 55 ? '#f59e0b' : '#ef4444' }}>{unitAcc >= 60 ? unitAcc : 0}%</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Trends Over Time Tab (multi-period trends)
   ═══════════════════════════════════════════════════════════════ */
function TrendsTab({ teacher, locale }: { teacher: TeacherProfileData; locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';

  // Generate 12 weeks of data from seed (proper LCG iteration so values vary)
  const seed = teacher.id.charCodeAt(4) || 13;
  const makeSeries = (s0: number, base: number, range: number) => {
    let r = s0 + 1;
    return Array.from({ length: 12 }, () => {
      r = (r * 9301 + 49297) % 233280;
      return Math.round(base + (r / 233280) * range);
    });
  };
  const makeSeriesFloat = (s0: number, base: number, range: number) => {
    let r = s0 + 1;
    return Array.from({ length: 12 }, () => {
      r = (r * 9301 + 49297) % 233280;
      return Math.round((base + (r / 233280) * range) * 10) / 10;
    });
  };
  const weeks12 = makeSeries(seed + 7, 55, 40);
  const teacherHours = makeSeriesFloat(seed + 131, 1, 4);
  const studentActivity = makeSeries(seed + 257, 45, 45);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-500" />
          {ar ? 'اتجاه الدقة (١٢ أسبوع)' : 'Accuracy Trend (12 weeks)'}
        </h3>
        <AreaLineChart
          data={weeks12.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
          color="#0ea5e9" height={200} showDots showGrid
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            {ar ? 'ساعات المعلم (١٢ أسبوع)' : 'Teacher Hours (12 weeks)'}
          </h3>
          <AreaLineChart
            data={teacherHours.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
            color="#8b5cf6" height={180} showDots showGrid
          />
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            {ar ? 'نشاط الطلاب (١٢ أسبوع)' : 'Student Activity (12 weeks)'}
          </h3>
          <AreaLineChart
            data={studentActivity.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
            color="#f43f5e" height={180} showDots showGrid
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-sky-500 to-violet-600 p-5 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <h3 className="text-sm font-black uppercase tracking-wider text-sky-100 mb-2 relative z-10">
          {ar ? 'ملاحظة' : 'Insight'}
        </h3>
        <p className="text-base font-bold leading-relaxed relative z-10">
          {ar
            ? 'هذا الشريط يعرض الأداء الشهري والأسبوعي على مدار ١٢ أسبوعاً. استخدمه لتتبع الاتجاه الموسمي وتقييم التقدم على المدى الطويل.'
            : 'This tab shows monthly and weekly performance across 12 weeks. Use it to track seasonal trends and evaluate long-term progress.'}
        </p>
      </div>
    </div>
  );
}

export default TeacherProfileModal;
