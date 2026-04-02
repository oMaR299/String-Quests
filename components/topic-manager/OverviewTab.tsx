import React, { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Users, Target, Trophy,
  BookOpen, Layers, BarChart3, Crown, GraduationCap,
  ArrowUpDown, Eye, ChevronDown, Building2, X,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA, SUBJECT_UNITS,
  type StudentProfile, type Subject,
} from '../../data/complexLeaderboardData';
import {
  ProgressRing, Sparkline, VerticalBarChart,
} from '../admin-hub/attendance/SvgCharts';
import { GradeUnitHeatmap } from '../leaderboard-widgets/GradeUnitHeatmap';
import { TeacherEffectivenessTable } from '../leaderboard-widgets/TeacherEffectivenessTable';
import { InterventionInsights } from '../leaderboard-widgets/InterventionInsights';
import { AccuracyVsXpScatter } from '../leaderboard-widgets/AccuracyVsXpScatter';
import { StudentProfileModal } from '../StudentProfileModal';
import { CAMPUSES } from './TopicManagerLayout';

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const SUBJECT_NAMES: Record<string, { ar: string; en: string; emoji: string; gradient: string }> = {
  math:      { ar: 'الرياضيات', en: 'Mathematics', emoji: '📐', gradient: 'from-blue-500 to-indigo-600' },
  science:   { ar: 'العلوم', en: 'Science', emoji: '🔬', gradient: 'from-emerald-500 to-teal-600' },
  languages: { ar: 'اللغات', en: 'Languages', emoji: '📝', gradient: 'from-violet-500 to-purple-600' },
  history:   { ar: 'التاريخ', en: 'History', emoji: '🏛️', gradient: 'from-amber-500 to-orange-600' },
  arts:      { ar: 'الفنون', en: 'Arts', emoji: '🎨', gradient: 'from-pink-500 to-rose-600' },
  islamic:   { ar: 'التربية الإسلامية', en: 'Islamic Studies', emoji: '🕌', gradient: 'from-green-600 to-emerald-700' },
  english:   { ar: 'اللغة الإنجليزية', en: 'English', emoji: '🔤', gradient: 'from-sky-500 to-blue-600' },
  computer:  { ar: 'الحاسب الآلي', en: 'Computer Science', emoji: '💻', gradient: 'from-cyan-500 to-teal-600' },
  physics:   { ar: 'الفيزياء', en: 'Physics', emoji: '⚛️', gradient: 'from-indigo-500 to-blue-700' },
  chemistry: { ar: 'الكيمياء', en: 'Chemistry', emoji: '🧪', gradient: 'from-red-500 to-pink-600' },
  biology:   { ar: 'الأحياء', en: 'Biology', emoji: '🧬', gradient: 'from-lime-500 to-green-600' },
  social:    { ar: 'الاجتماعيات', en: 'Social Studies', emoji: '🌍', gradient: 'from-teal-500 to-cyan-600' },
};

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

const UNIT_EMOJIS: Record<string, string> = {
  arithmetic: '🔢', algebra: '📊', geometry: '📐', calculus: '∫', statistics: '📈',
  matter: '🧊', energy: '⚡', forces: '💪', ecosystems: '🌿',
  grammar: '📖', literature: '📚', poetry: '🎭', writing: '✍️',
  ancient: '🏺', islamic_history: '🕌', modern: '🌐', geography: '🗺️',
  drawing: '✏️', colors: '🎨', history_of_art: '🖼️',
  quran: '📖', hadith: '📜', fiqh: '⚖️', tafsir: '🔍',
  citizenship: '🏛️', economics: '💰', sociology: '👥',
  mechanics: '⚙️', thermodynamics: '🌡️', optics: '🔦', quantum: '⚛️',
  periodic_table: '📋', reactions: '🧪', organic: '🧬', acids: '💧',
  cells: '🔬', genetics: '🧬', anatomy: '🫁', ecology: '🌍',
  coding: '💻', hardware: '🖥️', networks: '🌐', ai: '🤖',
  vocabulary: '📝', reading: '📖', speaking: '🗣️',
};

const LEAGUE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bronze:   { bg: 'bg-amber-900/20',   text: 'text-amber-700',  label: 'برونزي' },
  silver:   { bg: 'bg-slate-200/30',   text: 'text-slate-500',  label: 'فضي' },
  gold:     { bg: 'bg-yellow-100/40',  text: 'text-yellow-600', label: 'ذهبي' },
  platinum: { bg: 'bg-violet-100/30',  text: 'text-violet-500', label: 'بلاتيني' },
  diamond:  { bg: 'bg-sky-100/30',     text: 'text-sky-500',    label: 'ماسي' },
};

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function trendIcon(t: 'up' | 'down' | 'stable') {
  if (t === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (t === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function accuracyColor(v: number): string {
  if (v >= 85) return '#10b981';
  if (v >= 70) return '#f59e0b';
  return '#ef4444';
}

function accuracyBg(v: number): string {
  if (v >= 85) return 'bg-emerald-50 border-emerald-200';
  if (v >= 70) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

/** Catmull-Rom smooth SVG path through points */
function smoothSvgPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;
  const d: string[] = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(' ');
}

/* ═══════════════════════════════════════════════════════════════
   Section wrapper
   ═══════════════════════════════════════════════════════════════ */

function SectionBlock({
  icon: Icon, title, subtitle, idx, children, accentGradient,
}: {
  icon: React.ElementType; title: string; subtitle?: string;
  idx: number; children: React.ReactNode; accentGradient?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 * idx, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient || 'from-slate-500 to-slate-600'} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 -mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════════════════════ */

interface OverviewTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function OverviewTab({ subject, locale }: OverviewTabProps) {
  const [campusFilter, setCampusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedUnitForPopup, setSelectedUnitForPopup] = useState<string | null>(null);
  const [gradeSortKey, setGradeSortKey] = useState<'accuracy' | 'xp'>('accuracy');
  const [gradeSortDir, setGradeSortDir] = useState<'asc' | 'desc'>('desc');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [top10GradeFilter, setTop10GradeFilter] = useState<string>('all');
  const [top10SectionFilter, setTop10SectionFilter] = useState<string>('all');
  const [unitGradeFilter, setUnitGradeFilter] = useState<string>('all');
  const [leaderboardGrade, setLeaderboardGrade] = useState<number>(1);
  const [trendGrade, setTrendGrade] = useState<number>(1);
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set(['A', 'B', 'C', 'D', 'E', 'F']));
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const isRTL = locale === 'ar';
  const t = useCallback((ar: string, en: string) => (locale === 'ar' ? ar : en), [locale]);

  const subjectMeta = SUBJECT_NAMES[subject] || SUBJECT_NAMES.math;
  const subjectKey = subject as Exclude<Subject, 'all'>;
  const units = (SUBJECT_UNITS[subjectKey] || []) as string[];

  /* ── Filtered students (campus-aware) ──────────── */
  const filteredStudents = useMemo(() => {
    let list = MOCK_SCHOOL_DATA.filter(s => (s.subjectDetails[subjectKey]?.accuracy ?? 0) > 0);
    if (campusFilter !== 'all') {
      list = list.filter(s => s.campusId === campusFilter);
    }
    return list;
  }, [subjectKey, campusFilter]);

  /* ── Executive Summary ─────────────────────────── */
  const summary = useMemo(() => {
    const students = filteredStudents;
    const total = students.length;
    if (total === 0)
      return { total: 0, engagement: 0, avgAccuracy: 0, hardestUnit: '-', hardestUnitAcc: 0, bestCampus: CAMPUSES[0], bestCampusAcc: 0, sparklineData: [] as number[] };

    const avgAccuracy = Math.round(students.reduce((s, st) => s + (st.subjectDetails[subjectKey]?.accuracy ?? 0), 0) / total);
    const engaged = students.filter(s => (s.subjectDetails[subjectKey]?.accuracy ?? 0) > 60).length;
    const engagement = Math.round((engaged / total) * 100);

    let hardestUnit = units[0] || '-';
    let hardestUnitAcc = 100;
    for (const u of units) {
      const key = `${subject}-${u}`;
      const uStudents = students.filter(s => s.lessonDetails[key]);
      if (uStudents.length === 0) continue;
      const avg = Math.round(uStudents.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / uStudents.length);
      if (avg < hardestUnitAcc) { hardestUnitAcc = avg; hardestUnit = u; }
    }

    // Best campus using campusId
    let bestCampus = CAMPUSES[0];
    let bestCampusAcc = 0;
    for (const campus of CAMPUSES) {
      const cs = students.filter(s => s.campusId === campus.id);
      if (cs.length === 0) continue;
      const avg = Math.round(cs.reduce((s, st) => s + (st.subjectDetails[subjectKey]?.accuracy ?? 0), 0) / cs.length);
      if (avg > bestCampusAcc) { bestCampusAcc = avg; bestCampus = campus; }
    }

    const sparklineData = Array.from({ length: 8 }, (_, i) => Math.max(50, avgAccuracy - 15 + Math.floor(Math.random() * 30) + i * 2));

    return { total, engagement, avgAccuracy, hardestUnit, hardestUnitAcc, bestCampus, bestCampusAcc, sparklineData };
  }, [filteredStudents, subjectKey, subject, units]);

  /* ── Section leaderboard (grade pills → section rows) ── */
  const CAMPUS_SHORT: Record<string, { ar: string; en: string }> = {
    'camp-1': { ar: 'بنين', en: 'Boys' },
    'camp-2': { ar: 'بنات', en: 'Girls' },
    'camp-3': { ar: 'المستقبل', en: 'Future' },
  };
  const SECTION_COLORS: Record<string, string> = {
    A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#8b5cf6', E: '#ec4899', F: '#06b6d4',
  };
  const SECTION_BADGE_CLASSES: Record<string, string> = {
    A: 'bg-blue-100 text-blue-700', B: 'bg-emerald-100 text-emerald-700', C: 'bg-amber-100 text-amber-700',
    D: 'bg-purple-100 text-purple-700', E: 'bg-pink-100 text-pink-700', F: 'bg-cyan-100 text-cyan-700',
  };

  const sectionLeaderboard = useMemo(() => {
    const gradeStudents = filteredStudents.filter(s => s.grade === leaderboardGrade);
    const sectionMap = new Map<string, StudentProfile[]>();

    for (const s of gradeStudents) {
      const key = `${s.section || '?'}-${s.campusId}`;
      if (!sectionMap.has(key)) sectionMap.set(key, []);
      sectionMap.get(key)!.push(s);
    }

    const list: { section: string; campusId: string; avgXp: number; avgAccuracy: number; count: number; trend: 'up' | 'down' | 'stable'; topStudent: string }[] = [];

    for (const [, students] of sectionMap) {
      const sec = students[0].section || '?';
      const campusId = students[0].campusId;
      const avgAcc = Math.round(students.reduce((sum, st) => sum + (st.subjectDetails[subjectKey]?.accuracy ?? 0), 0) / students.length);
      const avgXp = Math.round(students.reduce((sum, st) => sum + (st.subjectXp[subjectKey] || 0), 0) / students.length);
      const topSt = [...students].sort((a, b) => (b.subjectDetails[subjectKey]?.accuracy ?? 0) - (a.subjectDetails[subjectKey]?.accuracy ?? 0))[0];
      const ups = students.filter(s => s.trend === 'up').length;
      const downs = students.filter(s => s.trend === 'down').length;
      const trend: 'up' | 'down' | 'stable' = ups > downs + 1 ? 'up' : downs > ups + 1 ? 'down' : 'stable';

      list.push({ section: sec, campusId, avgXp, avgAccuracy: avgAcc, count: students.length, trend, topStudent: topSt?.name || '-' });
    }

    list.sort((a, b) => gradeSortDir === 'desc' ? b[gradeSortKey] - a[gradeSortKey] : a[gradeSortKey] - b[gradeSortKey]);
    return list;
  }, [filteredStudents, subjectKey, leaderboardGrade, gradeSortKey, gradeSortDir]);

  /* ── Unit stats ────────────────────────────────── */
  const unitStats = useMemo(() => {
    let students = filteredStudents;
    if (unitGradeFilter !== 'all') students = students.filter(s => String(s.grade) === unitGradeFilter);
    return units.map(u => {
      const key = `${subject}-${u}`;
      const attempted = students.filter(s => s.lessonDetails[key]);
      const total = students.length;
      const avgAcc = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length) : 0;
      const topStudent = [...attempted].sort((a, b) => (b.lessonDetails[key]?.accuracy ?? 0) - (a.lessonDetails[key]?.accuracy ?? 0))[0];
      return { unit: u, avgAccuracy: avgAcc, completion: total > 0 ? Math.round((attempted.length / total) * 100) : 0, studentCount: attempted.length, topStudent: topStudent?.name || '-' };
    });
  }, [units, subject, filteredStudents, unitGradeFilter]);

  /* ── Top 10 students ───────────────────────────── */
  const top10Students = useMemo(() => {
    let students = filteredStudents;
    if (top10GradeFilter !== 'all') students = students.filter(s => String(s.grade) === top10GradeFilter);
    if (top10SectionFilter !== 'all') students = students.filter(s => s.section === top10SectionFilter);
    return [...students].sort((a, b) => (b.subjectXp[subjectKey] || 0) - (a.subjectXp[subjectKey] || 0)).slice(0, 10);
  }, [filteredStudents, subjectKey, top10GradeFilter, top10SectionFilter]);


  /* ── Section-based trend data (per grade) ──────── */
  const trendChartId = useId();
  const sectionTrendData = useMemo(() => {
    const SEC_COLORS: Record<string, string> = {
      A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#8b5cf6', E: '#ec4899', F: '#06b6d4',
    };
    const CAMP_SHORT: Record<string, string> = { 'camp-1': 'بنين', 'camp-2': 'بنات', 'camp-3': 'المستقبل' };
    const CAMP_SHORT_EN: Record<string, string> = { 'camp-1': 'Boys', 'camp-2': 'Girls', 'camp-3': 'Future' };

    const gradeStudents = filteredStudents.filter(s => s.grade === trendGrade);
    const sectionKeys = Array.from(new Set(gradeStudents.map(s => `${s.section}-${s.campusId}`)));

    return sectionKeys.map((key: string) => {
      const dashIdx = key.indexOf('-');
      const section = key.substring(0, dashIdx);
      const campusId = key.substring(dashIdx + 1);
      const sectionStudents = gradeStudents.filter(s => s.section === section && s.campusId === campusId);
      const campusLabel = locale === 'ar' ? (CAMP_SHORT[campusId] || campusId) : (CAMP_SHORT_EN[campusId] || campusId);
      const label = `${section} - ${campusLabel}`;

      // Generate 8 weeks of mock accuracy data seeded from section identity
      const baseAcc = sectionStudents.length > 0
        ? sectionStudents.reduce((s, st) => s + (st.subjectDetails[subjectKey]?.accuracy || 0), 0) / sectionStudents.length
        : 75;
      const seed = section.charCodeAt(0) + (campusId.charCodeAt(5) || 0);
      const points = Array.from({ length: 8 }, (_, wi) => {
        const noise = ((seed * (wi + 1) * 9301 + 49297) % 233280) / 233280 * 12 - 6;
        return Math.max(50, Math.min(100, Math.round(baseAcc + noise + wi * 0.8)));
      });

      return { key, section, campusId, label, color: SEC_COLORS[section] || '#64748b', points };
    });
  }, [filteredStudents, trendGrade, subjectKey, locale]);

  /* ── Unit detail modal data ────────────────────── */
  const unitModalData = useMemo(() => {
    if (!selectedUnitForPopup) return null;
    const key = `${subject}-${selectedUnitForPopup}`;
    const attempted = filteredStudents.filter(s => s.lessonDetails[key]);
    const avgAcc = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length) : 0;
    const avgXp = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.xp ?? 0), 0) / attempted.length) : 0;

    const sectionGroups = new Map<string, { accuracies: number[]; campusId: string }>();
    for (const s of attempted) {
      const sKey = `${s.section}-${s.campusId}`;
      if (!sectionGroups.has(sKey)) sectionGroups.set(sKey, { accuracies: [], campusId: s.campusId });
      sectionGroups.get(sKey)!.accuracies.push(s.lessonDetails[key]?.accuracy ?? 0);
    }
    const sectionComparison = Array.from(sectionGroups.entries()).map(([sKey, { accuracies, campusId }]) => {
      const section = sKey.split('-')[0];
      const avg = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);
      const campusShort = campusId === 'camp-1' ? 'بنين' : campusId === 'camp-2' ? 'بنات' : 'المستقبل';
      const label = locale === 'ar' ? `${section} - ${campusShort}` : `${section} - ${campusId === 'camp-1' ? 'Boys' : campusId === 'camp-2' ? 'Girls' : 'Future'}`;
      const sectionColors: Record<string, string> = { A: '#3b82f6', B: '#10b981', C: '#f59e0b', D: '#8b5cf6', E: '#ec4899', F: '#06b6d4' };
      return { label, value: avg, color: sectionColors[section] || '#64748b' };
    }).sort((a, b) => b.value - a.value);

    const top5 = [...attempted].sort((a, b) => (b.lessonDetails[key]?.accuracy ?? 0) - (a.lessonDetails[key]?.accuracy ?? 0)).slice(0, 5);
    return { avgAcc, avgXp, studentCount: attempted.length, sectionComparison, top5 };
  }, [selectedUnitForPopup, subject, filteredStudents, locale]);

  /* ── Handlers ──────────────────────────────────── */
  const toggleGradeSort = (key: 'accuracy' | 'xp') => {
    if (gradeSortKey === key) setGradeSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setGradeSortKey(key); setGradeSortDir('desc'); }
  };

  const openGradeUnitPopup = useCallback((_grade: number, _unit: string) => {}, []);

  const getCampusName = (campusId: string) => {
    const campus = CAMPUSES.find(c => c.id === campusId);
    return campus ? t(campus.name, campus.nameEn) : campusId;
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* ── Campus filter bar ─────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{campusFilter === 'all' ? t('جميع المباني', 'All Campuses') : getCampusName(campusFilter)}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <AnimatePresence>
            {campusDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 min-w-[220px]"
              >
                <button
                  onClick={() => { setCampusFilter('all'); setCampusDropdownOpen(false); }}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-start transition-colors ${campusFilter === 'all' ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {t('جميع المباني', 'All Campuses')}
                </button>
                {CAMPUSES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCampusFilter(c.id); setCampusDropdownOpen(false); }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-start transition-colors ${campusFilter === c.id ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {t(c.name, c.nameEn)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          {filteredStudents.length} {t('طالب', 'students')} — {units.length} {t('وحدات', 'units')}
        </span>
      </div>

      {/* Click-outside dismiss for campus dropdown */}
      {campusDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setCampusDropdownOpen(false)} />}

      {/* ═══════════════════════════════════════════════
          SECTION 1: Executive Summary
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={BarChart3} title={t('الملخص التنفيذي', 'Executive Summary')} subtitle={t('نظرة عامة على أداء المادة', 'Subject performance overview')} idx={1} accentGradient={subjectMeta.gradient}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <motion.div whileHover={{ y: -2 }} className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-3xl font-extrabold text-slate-800">{summary.total}</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{t('إجمالي الطلاب', 'Total Students')}</p>
              <div className="mt-2 w-16"><ProgressRing value={summary.engagement} size={52} strokeWidth={5} color="#6366f1" label={t('مشاركة', 'Engagement')} /></div>
            </div>
          </motion.div>

          {/* Average Accuracy */}
          <motion.div whileHover={{ y: -2 }} className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-800">{summary.avgAccuracy}%</p>
                {summary.avgAccuracy >= 75 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{t('متوسط الدقة', 'Average Accuracy')}</p>
              <div className="mt-2"><Sparkline data={summary.sparklineData} color={accuracyColor(summary.avgAccuracy)} width={90} height={24} /></div>
            </div>
          </motion.div>

          {/* Hardest Unit */}
          <motion.div whileHover={{ y: -2 }} className="bg-white/80 backdrop-blur-sm border border-red-100/60 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0"><span className="text-lg">{UNIT_EMOJIS[summary.hardestUnit] || '⚠️'}</span></div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold text-slate-800 truncate">{t(UNIT_LABELS_AR[summary.hardestUnit] || summary.hardestUnit, summary.hardestUnit)}</p>
              <p className="text-xs font-semibold text-red-400 mt-0.5">{t('أصعب وحدة', 'Hardest Unit')} — {summary.hardestUnitAcc}%</p>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-2 rounded-full bg-red-100 flex-1"><div className="h-2 rounded-full bg-red-500 transition-all" style={{ width: `${summary.hardestUnitAcc}%` }} /></div>
                <span className="text-[10px] font-bold text-red-500">{summary.hardestUnitAcc}%</span>
              </div>
            </div>
          </motion.div>

          {/* Best Campus */}
          <motion.div whileHover={{ y: -2 }} className="bg-white/80 backdrop-blur-sm border border-emerald-100/60 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0"><Trophy className="w-5 h-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold text-slate-800">{t(summary.bestCampus.name, summary.bestCampus.nameEn)}</p>
              <p className="text-xs font-semibold text-emerald-500 mt-0.5">{t('أفضل مبنى', 'Best Campus')} — {summary.bestCampusAcc}%</p>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-2 rounded-full bg-emerald-100 flex-1"><div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${summary.bestCampusAcc}%` }} /></div>
                <span className="text-[10px] font-bold text-emerald-600">{summary.bestCampusAcc}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 2: Grade Performance Heatmap
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={Layers} title={t('خريطة الأداء الحرارية', 'Grade Performance Heatmap')} subtitle={t('مقارنة الوحدات عبر الصفوف', 'Compare units across grades')} idx={2} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
          <GradeUnitHeatmap subject={subject} students={filteredStudents} locale={locale} onCellClick={openGradeUnitPopup} />
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 3: Section Ranking (grade pills → section rows)
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={Trophy} title={t('ترتيب الشعب', 'Section Ranking')} subtitle={t(`الصف ${leaderboardGrade} — مقارنة أداء الشعب`, `Grade ${leaderboardGrade} — Compare section performance`)} idx={3} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Grade selector pills (identical to heatmap) */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => {
                const isActive = leaderboardGrade === grade;
                return (
                  <motion.button
                    key={grade}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setLeaderboardGrade(grade)}
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

          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_100px_80px_1fr_100px_48px_1fr] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 items-center">
            <span>#</span>
            <span>{t('الشعبة', 'Section')}</span>
            <span>{t('المبنى', 'Campus')}</span>
            <span>{t('طلاب', 'Students')}</span>
            <button onClick={() => toggleGradeSort('accuracy')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">{t('متوسط الدقة', 'Avg Accuracy')}<ArrowUpDown className="w-3 h-3" /></button>
            <button onClick={() => toggleGradeSort('xp')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">{t('متوسط XP', 'Avg XP')}<ArrowUpDown className="w-3 h-3" /></button>
            <span>{t('اتجاه', 'Trend')}</span>
            <span>{t('أفضل طالب', 'Top Student')}</span>
          </div>

          {/* Section rows */}
          {sectionLeaderboard.map((row, i) => {
            const badgeClass = SECTION_BADGE_CLASSES[row.section] || 'bg-slate-100 text-slate-600';
            const sectionColor = SECTION_COLORS[row.section] || '#64748b';
            const campusShort = CAMPUS_SHORT[row.campusId];
            const campusLabel = campusShort ? t(campusShort.ar, campusShort.en) : getCampusName(row.campusId);

            return (
              <motion.div
                key={`${row.section}-${row.campusId}`}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`grid grid-cols-[48px_1fr_100px_80px_1fr_100px_48px_1fr] gap-2 px-5 py-3 items-center border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i < 3 ? 'bg-gradient-to-r from-amber-50/40 to-transparent' : ''}`}
              >
                {/* Rank */}
                <span className="text-sm font-extrabold text-slate-700">
                  {i < 3 ? MEDAL_EMOJIS[i] : i + 1}
                </span>

                {/* Section badge */}
                <span className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                    style={{ backgroundColor: sectionColor }}
                  >
                    {row.section}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${badgeClass}`}>
                    {t(`شعبة ${row.section}`, `Section ${row.section}`)}
                  </span>
                </span>

                {/* Campus */}
                <span className="text-xs font-semibold text-slate-500">{campusLabel}</span>

                {/* Student count */}
                <span className="text-xs font-semibold text-slate-500">{row.count}</span>

                {/* Accuracy bar */}
                <div className="flex items-center gap-2">
                  <div className="h-2.5 rounded-full bg-slate-100 flex-1 max-w-[120px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.avgAccuracy}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className="h-2.5 rounded-full"
                      style={{ backgroundColor: accuracyColor(row.avgAccuracy) }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{ color: accuracyColor(row.avgAccuracy) }}>{row.avgAccuracy}%</span>
                </div>

                {/* Avg XP */}
                <span className="text-sm font-bold text-slate-700">{row.avgXp.toLocaleString()}</span>

                {/* Trend */}
                {trendIcon(row.trend)}

                {/* Top student */}
                <span className="text-xs font-semibold text-slate-600 truncate">{row.topStudent || '-'}</span>
              </motion.div>
            );
          })}

          {sectionLeaderboard.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm">{t('لا توجد بيانات لهذا الصف', 'No data for this grade')}</p>
            </div>
          )}
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 4: Teacher Effectiveness
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={GraduationCap} title={t('فعالية المعلمين', 'Teacher Effectiveness')} subtitle={t('أداء المعلمين عبر الوحدات', 'Teacher performance across units')} idx={4} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
          <TeacherEffectivenessTable subject={subject} students={filteredStudents} locale={locale} onStudentClick={(st: StudentProfile) => setSelectedStudent(st)} />
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 5: Unit Deep Dive
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={BookOpen} title={t('تفاصيل الوحدات', 'Unit Deep Dive')} subtitle={t('استكشف أداء كل وحدة', "Explore each unit's performance")} idx={5} accentGradient={subjectMeta.gradient}>
        {/* Grade filter for units */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-bold text-slate-500">{t('الصف:', 'Grade:')}</span>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setUnitGradeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${unitGradeFilter === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {t('الكل', 'All')}
            </button>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
              <button key={g} onClick={() => setUnitGradeFilter(String(g))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${unitGradeFilter === String(g) ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unitStats.map((u, i) => (
            <motion.button key={u.unit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }} onClick={() => setSelectedUnitForPopup(u.unit)}
              className={`text-start rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${accuracyBg(u.avgAccuracy)}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{UNIT_EMOJIS[u.unit] || '📘'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{t(UNIT_LABELS_AR[u.unit] || u.unit, u.unit)}</p>
                  <p className="text-[10px] font-semibold text-slate-400">{u.studentCount} {t('طالب', 'students')}</p>
                </div>
                <span className="text-lg font-extrabold" style={{ color: accuracyColor(u.avgAccuracy) }}>{u.avgAccuracy}%</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>{t('نسبة الإكمال', 'Completion')}</span><span>{u.completion}%</span></div>
                <div className="h-1.5 rounded-full bg-white/60"><div className="h-1.5 rounded-full transition-all bg-slate-400/50" style={{ width: `${u.completion}%` }} /></div>
              </div>
              <p className="mt-3 text-[10px] font-semibold text-slate-500">{t('أفضل طالب:', 'Top student:')} {u.topStudent}</p>
            </motion.button>
          ))}
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 6: Charts (2-column)
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={BarChart3} title={t('الرسوم البيانية', 'Analytics Charts')} subtitle={t('اتجاهات وتوزيعات الأداء', 'Performance trends and distributions')} idx={6} accentGradient={subjectMeta.gradient}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart A: Section-based Growth Trajectory */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            {/* Header with grade pills */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-sm font-bold text-slate-700">{t('اتجاه الشعب الأسبوعي', 'Weekly Section Trend')}</h3>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-200">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => {
                const isActive = trendGrade === grade;
                return (
                  <motion.button
                    key={grade}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setTrendGrade(grade)}
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

            {/* SVG Chart */}
            {(() => {
              const activeTrends = sectionTrendData.filter(s => activeSections.has(s.section));
              const W = 700, H = 300;
              const pad = { top: 20, right: 30, bottom: 35, left: 45 };
              const cw = W - pad.left - pad.right;
              const ch = H - pad.top - pad.bottom;

              const allValues = activeTrends.flatMap(s => s.points);
              const dataMin = allValues.length > 0 ? Math.min(...allValues) : 50;
              const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
              const margin = Math.max(5, (dataMax - dataMin) * 0.1);
              const yMin = Math.max(0, Math.floor(dataMin - margin));
              const yMax = Math.min(100, Math.ceil(dataMax + margin));
              const yRange = yMax - yMin || 1;

              const weeks = 8;
              const xStep = cw / (weeks - 1);

              // Y ticks
              const yTicks: number[] = [];
              const yStep = Math.ceil(yRange / 5);
              for (let v = yMin; v <= yMax; v += yStep) yTicks.push(v);

              return (
                <div className="relative" onMouseLeave={() => setHoveredWeek(null)}>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {/* Defs: gradient fills per section */}
                    <defs>
                      {activeTrends.map((sec, si) => (
                        <linearGradient key={sec.key} id={`sec-trend-g-${trendChartId}-${si}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sec.color} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={sec.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>

                    {/* Horizontal grid lines */}
                    {yTicks.map(v => {
                      const y = pad.top + ch - ((v - yMin) / yRange) * ch;
                      return (
                        <g key={v}>
                          <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="4,4" />
                          <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{v}%</text>
                        </g>
                      );
                    })}

                    {/* X-axis labels */}
                    {Array.from({ length: weeks }, (_, i) => (
                      <text
                        key={i}
                        x={pad.left + i * xStep}
                        y={H - 8}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#94a3b8"
                      >
                        {t(`أسبوع ${i + 1}`, `Week ${i + 1}`)}
                      </text>
                    ))}

                    {/* Lines + areas + dots */}
                    {activeTrends.map((sec, si) => {
                      const pts: [number, number][] = sec.points.map((v, i) => [
                        pad.left + i * xStep,
                        pad.top + ch - ((v - yMin) / yRange) * ch,
                      ]);
                      const linePath = smoothSvgPath(pts);
                      const areaPath = `${linePath} L${pts[pts.length - 1][0]},${pad.top + ch} L${pts[0][0]},${pad.top + ch} Z`;

                      return (
                        <g key={sec.key}>
                          <path d={areaPath} fill={`url(#sec-trend-g-${trendChartId}-${si})`} />
                          <motion.path
                            d={linePath}
                            fill="none"
                            stroke={sec.color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: si * 0.15 }}
                          />
                          {/* Dot markers */}
                          {pts.map(([x, y], di) => (
                            <motion.circle
                              key={di}
                              cx={x} cy={y} r={3}
                              fill="white"
                              stroke={sec.color}
                              strokeWidth={2}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + di * 0.05 }}
                            />
                          ))}
                        </g>
                      );
                    })}

                    {/* Hover crosshair */}
                    {hoveredWeek !== null && (
                      <g>
                        <line
                          x1={pad.left + hoveredWeek * xStep}
                          y1={pad.top}
                          x2={pad.left + hoveredWeek * xStep}
                          y2={pad.top + ch}
                          stroke="#8b5cf6"
                          strokeWidth={1}
                          strokeDasharray="4,4"
                          opacity={0.5}
                        />
                        {activeTrends.map((sec, ti) => {
                          const v = sec.points[hoveredWeek];
                          const x = pad.left + hoveredWeek * xStep;
                          const y = pad.top + ch - ((v - yMin) / yRange) * ch;
                          return (
                            <g key={sec.key}>
                              <circle cx={x} cy={y} r={5} fill={sec.color} stroke="white" strokeWidth={2} />
                              <rect x={x + 8} y={y - 10 + ti * 18} width={55} height={16} rx={4} fill="white" stroke={sec.color} strokeWidth={0.5} />
                              <text x={x + 14} y={y + 2 + ti * 18} fontSize={10} fill={sec.color} fontWeight={700}>{v}%</text>
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* Invisible hover zones */}
                    {Array.from({ length: weeks }, (_, i) => (
                      <rect
                        key={i}
                        x={pad.left + i * xStep - xStep / 2}
                        y={pad.top}
                        width={xStep}
                        height={ch}
                        fill="transparent"
                        onMouseEnter={() => setHoveredWeek(i)}
                      />
                    ))}
                  </svg>
                </div>
              );
            })()}

            {/* Legend with toggle checkboxes */}
            <div className="flex flex-wrap gap-2.5 mt-4 px-1">
              {sectionTrendData.map(sec => {
                const active = activeSections.has(sec.section);
                // Determine trend arrow from first to last point
                const trendDir = sec.points[7] > sec.points[0] ? 'up' : sec.points[7] < sec.points[0] ? 'down' : 'stable';
                return (
                  <button
                    key={sec.key}
                    onClick={() => {
                      const next = new Set(activeSections);
                      if (next.has(sec.section)) next.delete(sec.section);
                      else next.add(sec.section);
                      setActiveSections(next);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-50 border-transparent opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sec.color }} />
                    <span className="text-slate-700">{sec.label}</span>
                    {trendDir === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {trendDir === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                    {trendDir === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
            </div>

            {/* Empty state */}
            {sectionTrendData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm">{t('لا توجد بيانات لهذا الصف', 'No data for this grade')}</p>
              </div>
            )}
          </div>

          {/* Chart B: Accuracy vs XP Scatter */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{t('الدقة مقابل نقاط الخبرة', 'Accuracy vs XP')}</h3>
            <AccuracyVsXpScatter
              students={filteredStudents.map(s => ({ id: s.id, name: s.name, xp: s.subjectXp[subjectKey] || 0, accuracy: s.subjectDetails[subjectKey]?.accuracy || 0, league: s.league, grade: typeof s.grade === 'number' ? s.grade : undefined, section: s.section }))}
              locale={locale}
              onStudentClick={(id) => { const st = filteredStudents.find(s => s.id === id); if (st) setSelectedStudent(st); }}
            />
          </div>
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 7: Intervention Insights
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={Eye} title={t('رؤى التدخل', 'Intervention Insights')} subtitle={t('توصيات لتحسين الأداء', 'Recommendations for improvement')} idx={7} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <InterventionInsights subject={subject} students={filteredStudents} locale={locale} />
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          SECTION 8: Top 10 Students
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={Crown} title={t('أفضل 10 طلاب', 'Top 10 Students')} subtitle={t('ترتيب الطلاب حسب نقاط الخبرة', 'Student ranking by XP in this subject')} idx={8} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 flex-wrap">
            <span className="text-xs font-bold text-slate-500">{t('تصفية:', 'Filter:')}</span>

            {/* Grade filter */}
            <select value={top10GradeFilter} onChange={e => setTop10GradeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white">
              <option value="all">{t('كل الصفوف', 'All Grades')}</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                <option key={g} value={g}>{t(`الصف ${g}`, `Grade ${g}`)}</option>
              ))}
            </select>

            {/* Section filter */}
            <select value={top10SectionFilter} onChange={e => setTop10SectionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white">
              <option value="all">{t('كل الشعب', 'All Sections')}</option>
              {['A','B','C','D','E','F'].map(s => (
                <option key={s} value={s}>{t(`شعبة ${s}`, `Section ${s}`)}</option>
              ))}
            </select>
          </div>
          {top10Students.map((st, i) => {
            const acc = st.subjectDetails[subjectKey]?.accuracy || 0;
            const xp = st.subjectXp[subjectKey] || 0;
            const leagueStyle = LEAGUE_STYLES[st.league] || LEAGUE_STYLES.bronze;
            return (
              <motion.button key={st.id} initial={{ opacity: 0, x: isRTL ? 24 : -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelectedStudent(st)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/60 transition-colors text-start ${i < 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''}`}>
                <span className="w-8 text-center text-sm font-extrabold text-slate-700 shrink-0">{i < 3 ? MEDAL_EMOJIS[i] : i + 1}</span>
                <div className={`w-9 h-9 rounded-full ${st.avatar || 'bg-blue-100'} flex items-center justify-center text-sm font-bold text-slate-600 shrink-0`}>{st.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{st.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">{t(`الصف ${st.grade}`, `Grade ${st.grade}`)} / {st.section}</span>
                    <span className="text-[10px] font-semibold text-slate-300">|</span>
                    <span className="text-[10px] font-semibold text-slate-400">{getCampusName(st.campusId)}</span>
                  </div>
                </div>
                <div className="text-center shrink-0"><p className="text-sm font-extrabold text-slate-700">{xp.toLocaleString()}</p><p className="text-[9px] font-semibold text-slate-400">XP</p></div>
                <div className="w-20 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="h-2 rounded-full bg-slate-100 flex-1"><div className="h-2 rounded-full transition-all" style={{ width: `${acc}%`, backgroundColor: accuracyColor(acc) }} /></div>
                    <span className="text-[10px] font-bold" style={{ color: accuracyColor(acc) }}>{acc}%</span>
                  </div>
                </div>
                <span className="shrink-0">{trendIcon(st.trend)}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${leagueStyle.bg} ${leagueStyle.text}`}>{t(leagueStyle.label, st.league)}</span>
              </motion.button>
            );
          })}
          {top10Students.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{t('لا توجد بيانات', 'No data available')}</div>}
        </div>
      </SectionBlock>

      {/* ═══════════════════════════════════════════════
          UNIT DETAIL MODAL
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedUnitForPopup && unitModalData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedUnitForPopup(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className={`bg-gradient-to-r ${subjectMeta.gradient} rounded-t-2xl px-6 py-5 relative`}>
                <button onClick={() => setSelectedUnitForPopup(null)} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{UNIT_EMOJIS[selectedUnitForPopup] || '📘'}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{t(UNIT_LABELS_AR[selectedUnitForPopup] || selectedUnitForPopup, selectedUnitForPopup)}</h2>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/20 text-white">{subjectMeta.emoji} {t(subjectMeta.ar, subjectMeta.en)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center"><p className="text-2xl font-extrabold text-emerald-600">{unitModalData.avgAcc}%</p><p className="text-[10px] font-semibold text-emerald-500 mt-0.5">{t('متوسط الدقة', 'Avg Accuracy')}</p></div>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-center"><p className="text-2xl font-extrabold text-sky-600">{unitModalData.avgXp.toLocaleString()}</p><p className="text-[10px] font-semibold text-sky-500 mt-0.5">{t('متوسط XP', 'Avg XP')}</p></div>
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 text-center"><p className="text-2xl font-extrabold text-violet-600">{unitModalData.studentCount}</p><p className="text-[10px] font-semibold text-violet-500 mt-0.5">{t('طلاب', 'Students')}</p></div>
                </div>
                {unitModalData.sectionComparison.length > 0 && (
                  <div><h3 className="text-sm font-bold text-slate-700 mb-3">{t('مقارنة الشعب', 'Section Comparison')}</h3><VerticalBarChart data={unitModalData.sectionComparison} maxValue={100} showValues /></div>
                )}
                {unitModalData.top5.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">{t('أفضل 5 طلاب', 'Top 5 Students')}</h3>
                    <div className="space-y-2">
                      {unitModalData.top5.map((st, i) => {
                        const key = `${subject}-${selectedUnitForPopup}`;
                        const stAcc = st.lessonDetails[key]?.accuracy ?? 0;
                        return (
                          <div key={st.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-100 ${i < 3 ? 'bg-amber-50/40' : 'bg-slate-50/40'}`}>
                            <span className="text-sm font-extrabold text-slate-600 w-6 text-center">{i < 3 ? MEDAL_EMOJIS[i] : i + 1}</span>
                            <div className={`w-8 h-8 rounded-full ${st.avatar || 'bg-blue-100'} flex items-center justify-center text-xs font-bold text-slate-600`}>{st.name.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{st.name}</p>
                              <p className="text-[10px] text-slate-400">{t(`الصف ${st.grade}`, `Grade ${st.grade}`)} / {st.section}</p>
                            </div>
                            <span className="text-sm font-extrabold" style={{ color: accuracyColor(stAcc) }}>{stAcc}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          STUDENT PROFILE MODAL
          ═══════════════════════════════════════════════ */}
      {selectedStudent && <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
}

export default OverviewTab;
