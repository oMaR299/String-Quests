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

  /* ── Grade leaderboard (with campus column) ────── */
  const gradeLeaderboard = useMemo(() => {
    const map = new Map<string, { grade: string; campusId: string; avgXp: number; avgAccuracy: number; count: number; trend: 'up' | 'down' | 'stable'; topStudent: string }>();

    for (const s of filteredStudents) {
      const key = `${s.grade}-${s.campusId}`;
      const entry = map.get(key) || { grade: String(s.grade), campusId: s.campusId, avgXp: 0, avgAccuracy: 0, count: 0, trend: 'stable' as const, topStudent: '' };
      entry.avgXp += s.subjectXp[subjectKey] || 0;
      entry.avgAccuracy += s.subjectDetails[subjectKey]?.accuracy || 0;
      entry.count += 1;

      const curTopAcc = map.get(key)
        ? filteredStudents.find(st => st.name === map.get(key)!.topStudent)?.subjectDetails[subjectKey]?.accuracy ?? 0
        : 0;
      if ((s.subjectDetails[subjectKey]?.accuracy ?? 0) > curTopAcc) entry.topStudent = s.name;
      map.set(key, entry);
    }

    const list = Array.from(map.values()).map(e => ({
      ...e,
      avgXp: Math.round(e.avgXp / e.count),
      avgAccuracy: Math.round(e.avgAccuracy / e.count),
      trend: (e.avgAccuracy / e.count > 78 ? 'up' : e.avgAccuracy / e.count < 70 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    }));

    list.sort((a, b) => gradeSortDir === 'desc' ? b[gradeSortKey] - a[gradeSortKey] : a[gradeSortKey] - b[gradeSortKey]);
    return list;
  }, [filteredStudents, subjectKey, gradeSortKey, gradeSortDir]);

  /* ── Unit stats ────────────────────────────────── */
  const unitStats = useMemo(() => {
    return units.map(u => {
      const key = `${subject}-${u}`;
      const attempted = filteredStudents.filter(s => s.lessonDetails[key]);
      const total = filteredStudents.length;
      const avgAcc = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length) : 0;
      const topStudent = [...attempted].sort((a, b) => (b.lessonDetails[key]?.accuracy ?? 0) - (a.lessonDetails[key]?.accuracy ?? 0))[0];
      return { unit: u, avgAccuracy: avgAcc, completion: total > 0 ? Math.round((attempted.length / total) * 100) : 0, studentCount: attempted.length, topStudent: topStudent?.name || '-' };
    });
  }, [units, subject, filteredStudents]);

  /* ── Top 10 students ───────────────────────────── */
  const top10Students = useMemo(() => {
    return [...filteredStudents].sort((a, b) => (b.subjectXp[subjectKey] || 0) - (a.subjectXp[subjectKey] || 0)).slice(0, 10);
  }, [filteredStudents, subjectKey]);

  /* ── Multi-grade trend data ────────────────────── */
  const trendChartId = useId();
  const trendData = useMemo(() => {
    const grades = ['3', '6', '9', '10', '12'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
    return grades.map((g, gi) => {
      const base = 60 + Math.floor(Math.random() * 20);
      return { grade: g, color: colors[gi], points: weeks.map((_, wi) => Math.max(40, Math.min(100, base + Math.floor(Math.random() * 15) - 5 + wi * 2))) };
    });
  }, []);

  /* ── Unit detail modal data ────────────────────── */
  const unitModalData = useMemo(() => {
    if (!selectedUnitForPopup) return null;
    const key = `${subject}-${selectedUnitForPopup}`;
    const attempted = filteredStudents.filter(s => s.lessonDetails[key]);
    const avgAcc = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length) : 0;
    const avgXp = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.xp ?? 0), 0) / attempted.length) : 0;

    const gradeGroups = new Map<string, number[]>();
    for (const s of attempted) { const g = String(s.grade); if (!gradeGroups.has(g)) gradeGroups.set(g, []); gradeGroups.get(g)!.push(s.lessonDetails[key]?.accuracy ?? 0); }
    const gradeComparison: { label: string; value: number; color: string }[] = [];
    for (const [g, vals] of gradeGroups) {
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      gradeComparison.push({ label: `${locale === 'ar' ? 'الصف ' : 'G'}${g}`, value: avg, color: accuracyColor(avg) });
    }
    gradeComparison.sort((a, b) => parseInt(a.label.replace(/\D/g, '')) - parseInt(b.label.replace(/\D/g, '')));

    const top5 = [...attempted].sort((a, b) => (b.lessonDetails[key]?.accuracy ?? 0) - (a.lessonDetails[key]?.accuracy ?? 0)).slice(0, 5);
    return { avgAcc, avgXp, studentCount: attempted.length, gradeComparison, top5 };
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
          SECTION 3: Grade Leaderboard
          ═══════════════════════════════════════════════ */}
      <SectionBlock icon={Trophy} title={t('ترتيب الصفوف', 'Grade Leaderboard')} subtitle={t('مقارنة أداء الصفوف في المادة', 'Compare grade performance in this subject')} idx={3} accentGradient={subjectMeta.gradient}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_1fr_100px_1fr_80px_48px_1fr] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 items-center">
            <span>#</span>
            <span>{t('الصف', 'Grade')}</span>
            <span>{t('المبنى', 'Campus')}</span>
            <button onClick={() => toggleGradeSort('xp')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">{t('متوسط XP', 'Avg XP')}<ArrowUpDown className="w-3 h-3" /></button>
            <button onClick={() => toggleGradeSort('accuracy')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">{t('متوسط الدقة', 'Avg Accuracy')}<ArrowUpDown className="w-3 h-3" /></button>
            <span>{t('طلاب', 'Students')}</span>
            <span>{t('اتجاه', 'Trend')}</span>
            <span>{t('أفضل طالب', 'Top Student')}</span>
          </div>
          {gradeLeaderboard.map((row, i) => (
            <motion.div key={`${row.grade}-${row.campusId}`} initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`grid grid-cols-[48px_1fr_1fr_100px_1fr_80px_48px_1fr] gap-2 px-5 py-3 items-center border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i < 3 ? 'bg-gradient-to-r from-amber-50/40 to-transparent' : ''}`}>
              <span className="text-sm font-extrabold text-slate-700">{i < 3 ? MEDAL_EMOJIS[i] : i + 1}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold w-fit bg-gradient-to-r ${subjectMeta.gradient} text-white`}>
                <GraduationCap className="w-3 h-3" />{t(`الصف ${row.grade}`, `Grade ${row.grade}`)}
              </span>
              <span className="text-xs font-semibold text-slate-500">{getCampusName(row.campusId)}</span>
              <span className="text-sm font-bold text-slate-700">{row.avgXp.toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <div className="h-2.5 rounded-full bg-slate-100 flex-1 max-w-[120px]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${row.avgAccuracy}%` }} transition={{ duration: 0.6, delay: i * 0.04 }} className="h-2.5 rounded-full" style={{ backgroundColor: accuracyColor(row.avgAccuracy) }} />
                </div>
                <span className="text-xs font-bold" style={{ color: accuracyColor(row.avgAccuracy) }}>{row.avgAccuracy}%</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">{row.count}</span>
              {trendIcon(row.trend)}
              <span className="text-xs font-semibold text-slate-600 truncate">{row.topStudent || '-'}</span>
            </motion.div>
          ))}
          {gradeLeaderboard.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{t('لا توجد بيانات', 'No data available')}</div>}
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
          {/* Chart A: Multi-Grade Accuracy Trend */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{t('اتجاه الدقة متعدد الصفوف', 'Multi-Grade Accuracy Trend')}</h3>
            <svg viewBox="0 0 400 220" className="w-full" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <defs>
                {trendData.map(line => (
                  <linearGradient key={line.grade} id={`trend-area-${trendChartId}-${line.grade}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={line.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {[40, 60, 80, 100].map(v => { const y = 180 - ((v - 30) / 80) * 170; return (
                <g key={v}><line x1={40} x2={380} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={0.5} /><text x={35} y={y + 3} textAnchor="end" fontSize={9} fill="#94a3b8">{v}%</text></g>
              ); })}
              {trendData[0].points.map((_, wi) => { const x = 40 + (wi / 7) * 340; return <text key={wi} x={x} y={198} textAnchor="middle" fontSize={9} fill="#94a3b8">{t(`أ${wi + 1}`, `W${wi + 1}`)}</text>; })}
              {trendData.map(line => {
                const pts = line.points.map((v, i) => { const x = 40 + (i / 7) * 340; const y = 180 - ((v - 30) / 80) * 170; return `${x},${y}`; });
                const pathD = `M${pts.join(' L')}`;
                const areaD = `${pathD} L${40 + 340},${180} L${40},${180} Z`;
                return (
                  <g key={line.grade}>
                    <path d={areaD} fill={`url(#trend-area-${trendChartId}-${line.grade})`} />
                    <motion.path d={pathD} fill="none" stroke={line.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
                    <circle cx={40 + 340} cy={180 - ((line.points[7] - 30) / 80) * 170} r={3} fill={line.color} />
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {trendData.map(line => (
                <div key={line.grade} className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: line.color }} />
                  <span className="text-[10px] font-semibold text-slate-500">{t(`الصف ${line.grade}`, `Grade ${line.grade}`)}</span>
                </div>
              ))}
            </div>
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
                {unitModalData.gradeComparison.length > 0 && (
                  <div><h3 className="text-sm font-bold text-slate-700 mb-3">{t('مقارنة الصفوف', 'Grade Comparison')}</h3><VerticalBarChart data={unitModalData.gradeComparison} maxValue={100} showValues /></div>
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
