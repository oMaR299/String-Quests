import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
  FileText, UserCheck, Bell, ChevronDown, X, Check, AlertTriangle,
  CalendarDays, Activity, Building2, Eye, Send, ShieldAlert,
  Minus, ArrowRight, ChevronRight, BookOpen,
} from 'lucide-react';
import {
  CAMPUSES, EXTENDED_STUDENTS, getStudentAttendance, getTodayString,
} from '../../../data/mockAttendanceData';
import { useAttendanceData } from '../../../hooks/useAttendanceData';
import type { AttendanceFilters, AttendanceStatus, ExtendedStudent, ClassAttendance } from '../../../types/admin';
import {
  Sparkline, ProgressRing, DonutChart, VerticalBarChart, AreaLineChart,
} from './SvgCharts';
import { TeacherComplianceDashboard } from './TeacherComplianceDashboard';
import { TeacherPresenceGrid } from './TeacherPresenceGrid';
import { StudentReportModal } from './StudentReportModal';
import { TeacherReportModal } from './TeacherReportModal';

// ─────────────────────────────────────────────
// Props & Helpers
// ─────────────────────────────────────────────

interface AttendanceDashboardProps {
  locale: 'ar' | 'en';
  onNavigateToReport: () => void;
}

const t = (locale: 'ar' | 'en', ar: string, en: string) => locale === 'ar' ? ar : en;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function rateColorClass(rate: number): string {
  if (rate >= 95) return 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30';
  if (rate >= 90) return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
  if (rate >= 75) return 'bg-amber-500/15 text-amber-400 ring-amber-500/25';
  return 'bg-rose-500/15 text-rose-400 ring-rose-500/25';
}

function rateBgFull(rate: number): string {
  if (rate >= 95) return 'bg-emerald-500';
  if (rate >= 90) return 'bg-emerald-400';
  if (rate >= 75) return 'bg-amber-400';
  return 'bg-rose-400';
}

function rateHex(rate: number): string {
  if (rate >= 90) return '#10b981';
  if (rate >= 75) return '#f59e0b';
  return '#f43f5e';
}

function avatarGradient(name: string): string {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

/** Animated count-up number */
function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return <>{display}</>;
}

// ─────────────────────────────────────────────
// Avatar Circle
// ─────────────────────────────────────────────

function AvatarCircle({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const letter = name.charAt(0);
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${avatarGradient(name)} flex items-center justify-center text-white font-bold shrink-0 shadow-md`}>
      {letter}
    </div>
  );
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium"
    >
      <Check className="w-4 h-4" />
      {message}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ locale, onNavigateToReport }) => {
  const l = (ar: string, en: string) => t(locale, ar, en);
  const isRtl = locale === 'ar';

  // ── State ──
  const [mainTab, setMainTab] = useState<'students' | 'teachers'>('students');
  const [teacherSubTab, setTeacherSubTab] = useState<'compliance' | 'presence'>('compliance');
  const [campusFilter, setCampusFilter] = useState('all');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<ClassAttendance | null>(null);
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [studentModal, setStudentModal] = useState<ExtendedStudent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Mark attendance panel state
  const [markGrade, setMarkGrade] = useState(1);
  const [markSection, setMarkSection] = useState('A');
  const [markStatuses, setMarkStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [markLateTimes, setMarkLateTimes] = useState<Record<string, string>>({});

  const today = getTodayString();

  const filters: AttendanceFilters = useMemo(() => ({
    campusId: campusFilter,
    grade: null,
    section: null,
    dateFrom: '',
    dateTo: today,
  }), [campusFilter, today]);

  const data = useAttendanceData(filters);

  // Derived
  const avgLateTime = useMemo(() => {
    if (data.lateStudents.length === 0) return '--:--';
    const minutes = data.lateStudents.map(s => {
      const [h, m] = s.arrivalTime.split(':').map(Number);
      return h * 60 + m;
    });
    const avg = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`;
  }, [data.lateStudents]);

  const trendDiff = data.summary.rate - data.previousDaySummary.rate;

  // Heatmap organization
  const heatmapData = useMemo(() => {
    const grades = [...new Set(data.heatmapCells.map(c => c.grade))].sort((a, b) => a - b);
    const sections = [...new Set(data.heatmapCells.map(c => c.section))].sort();
    return { grades, sections, cells: data.heatmapCells };
  }, [data.heatmapCells]);

  // Mark panel students
  const markStudents = useMemo(() => {
    return EXTENDED_STUDENTS.filter(s =>
      s.grade === markGrade && s.section === markSection &&
      (campusFilter === 'all' || s.campusId === campusFilter)
    );
  }, [markGrade, markSection, campusFilter]);

  // Init mark statuses when students change
  useEffect(() => {
    const init: Record<string, AttendanceStatus> = {};
    markStudents.forEach(s => { init[s.id] = 'present'; });
    setMarkStatuses(init);
    setMarkLateTimes({});
  }, [markStudents]);

  const handleNotify = useCallback((name: string) => {
    setToastMsg(l(`تم إرسال إشعار لولي أمر ${name}`, `Notification sent to ${name}'s parent`));
  }, [locale]);

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {l('الحضور والغياب', 'Attendance')}
          </h1>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
            {(['students', 'teachers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mainTab === tab
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mainTab === tab && (
                  <motion.div
                    layoutId="mainTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg shadow-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab === 'students' ? <Users className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {tab === 'students' ? l('الطلاب', 'Students') : l('المعلمون', 'Teachers')}
                </span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all"
            >
              <FileText className="w-4 h-4" />
              {l('التقارير', 'Reports')}
            </button>
            <button
              onClick={() => setShowMarkPanel(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-violet-200 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              {l('تسجيل الحضور', 'Mark Attendance')}
            </button>
          </div>
        </div>
      </div>

      {/* ── CAMPUS FILTER BAR ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Campus dropdown */}
          <div className="relative">
            <button
              onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-violet-300 text-sm font-semibold text-gray-700 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-violet-500" />
              {campusFilter === 'all'
                ? l('جميع المباني', 'All Campuses')
                : CAMPUSES.find(c => c.id === campusFilter)?.[locale === 'ar' ? 'name' : 'nameEn']
              }
              <ChevronDown className={`w-4 h-4 transition-transform ${campusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {campusDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[220px] py-1 overflow-hidden"
                >
                  <button
                    onClick={() => { setCampusFilter('all'); setCampusDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 text-start text-sm hover:bg-violet-50 transition-colors flex items-center gap-2 ${campusFilter === 'all' ? 'text-violet-700 font-bold bg-violet-50' : 'text-gray-700'}`}
                  >
                    {l('جميع المباني', 'All Campuses')}
                  </button>
                  {CAMPUSES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCampusFilter(c.id); setCampusDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-start text-sm hover:bg-violet-50 transition-colors flex items-center gap-2 ${campusFilter === c.id ? 'text-violet-700 font-bold bg-violet-50' : 'text-gray-700'}`}
                    >
                      {locale === 'ar' ? c.name : c.nameEn}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Campus Comparison Cards (when "all") */}
        <AnimatePresence>
          {campusFilter === 'all' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 overflow-hidden"
            >
              {data.campusComparison.map((cc, i) => (
                <motion.button
                  key={cc.campus.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setCampusFilter(cc.campus.id)}
                  className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 text-start group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {locale === 'ar' ? cc.campus.name : cc.campus.nameEn}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {cc.campus.studentCount} {l('طالب', 'students')}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {cc.campus.teacherCount} {l('معلم', 'teachers')}
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 shrink-0">
                      <ProgressRing value={cc.rate} size={56} strokeWidth={5} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {cc.rate > cc.previousRate ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : cc.rate < cc.previousRate ? (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={cc.rate >= cc.previousRate ? 'text-emerald-600' : 'text-rose-600'}>
                      {cc.rate > cc.previousRate ? '+' : ''}{(cc.rate - cc.previousRate).toFixed(1)}%
                    </span>
                    <span className="text-gray-400">{l('عن أمس', 'vs yesterday')}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-6 pb-12">
        <AnimatePresence mode="wait">
          {mainTab === 'students' ? (
            <motion.div key="students" {...fadeUp} transition={{ duration: 0.3 }}>
              <StudentsContent
                data={data}
                locale={locale}
                l={l}
                isRtl={isRtl}
                avgLateTime={avgLateTime}
                trendDiff={trendDiff}
                heatmapData={heatmapData}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                setStudentModal={setStudentModal}
                handleNotify={handleNotify}
                onNavigateToReport={onNavigateToReport}
              />
            </motion.div>
          ) : (
            <motion.div key="teachers" {...fadeUp} transition={{ duration: 0.3 }}>
              <TeachersContent
                locale={locale}
                l={l}
                campusFilter={campusFilter}
                teacherSubTab={teacherSubTab}
                setTeacherSubTab={setTeacherSubTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MARK ATTENDANCE PANEL ── */}
      <AnimatePresence>
        {showMarkPanel && (
          <MarkAttendancePanel
            locale={locale}
            l={l}
            isRtl={isRtl}
            markGrade={markGrade}
            setMarkGrade={setMarkGrade}
            markSection={markSection}
            setMarkSection={setMarkSection}
            markStudents={markStudents}
            markStatuses={markStatuses}
            setMarkStatuses={setMarkStatuses}
            markLateTimes={markLateTimes}
            setMarkLateTimes={setMarkLateTimes}
            onClose={() => setShowMarkPanel(false)}
            onSave={() => {
              setShowMarkPanel(false);
              setToastMsg(l('تم حفظ الحضور بنجاح', 'Attendance saved successfully'));
            }}
          />
        )}
      </AnimatePresence>

      {/* ── STUDENT MODAL ── */}
      <StudentReportModal
        student={studentModal}
        onClose={() => setStudentModal(null)}
        locale={locale}
      />

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  STUDENTS CONTENT
// ═══════════════════════════════════════════════════════════════

interface StudentsContentProps {
  data: ReturnType<typeof useAttendanceData>;
  locale: 'ar' | 'en';
  l: (ar: string, en: string) => string;
  isRtl: boolean;
  avgLateTime: string;
  trendDiff: number;
  heatmapData: { grades: number[]; sections: string[]; cells: ClassAttendance[] };
  selectedCell: ClassAttendance | null;
  setSelectedCell: (c: ClassAttendance | null) => void;
  setStudentModal: (s: ExtendedStudent | null) => void;
  handleNotify: (name: string) => void;
  onNavigateToReport: () => void;
}

function StudentsContent({
  data, locale, l, isRtl, avgLateTime, trendDiff,
  heatmapData, selectedCell, setSelectedCell, setStudentModal, handleNotify, onNavigateToReport,
}: StudentsContentProps) {

  // ── STATS BAR ──
  const statsCards = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      label: l('حاضر', 'Present'),
      value: data.summary.present,
      sub: `/ ${data.summary.totalStudents}`,
      ring: <ProgressRing value={data.summary.rate} size={60} strokeWidth={5} color="#10b981" />,
      accent: 'emerald',
    },
    {
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      label: l('غائب', 'Absent'),
      value: data.summary.absent,
      sub: '',
      accent: 'rose',
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      label: l('متأخر', 'Late'),
      value: data.summary.late,
      sub: avgLateTime !== '--:--' ? `${l('متوسط', 'Avg')} ${avgLateTime}` : '',
      accent: 'amber',
    },
    {
      icon: trendDiff >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />,
      label: l('الاتجاه', 'Trend'),
      value: data.summary.rate,
      sub: `${trendDiff >= 0 ? '+' : ''}${trendDiff.toFixed(1)}% ${l('عن أمس', 'vs yesterday')}`,
      spark: data.dailyTrend.map(d => d.rate),
      accent: trendDiff >= 0 ? 'emerald' : 'rose',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((card, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {card.icon}
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  <CountUp value={card.value} />
                  {card.sub && <span className="text-sm font-medium text-gray-400 ms-1">{card.sub}</span>}
                </p>
              </div>
              {card.ring && <div className="w-[60px] h-[60px] shrink-0">{card.ring}</div>}
              {card.spark && (
                <div className="shrink-0">
                  <Sparkline data={card.spark} color={card.accent === 'emerald' ? '#10b981' : '#f43f5e'} width={80} height={28} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── HEATMAP (HERO WIDGET) ── */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-500" />
              {l('خريطة الفصول الحرارية', 'Classroom Heatmap')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{l('اضغط على أي خلية لعرض التفاصيل', 'Click any cell for details')}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> {'>'}90%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> 75-90%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-400 inline-block" /> {'<'}75%</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="w-full border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="text-xs font-semibold text-gray-400 py-2 px-2 text-start w-20">
                  {l('الصف', 'Grade')}
                </th>
                {heatmapData.sections.map(sec => (
                  <th key={sec} className="text-xs font-semibold text-gray-400 py-2 px-1 text-center min-w-[90px]">
                    {l('شعبة', 'Sec')} {sec}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.grades.map(grade => (
                <tr key={grade}>
                  <td className="text-sm font-bold text-gray-700 py-1 px-2">{grade}</td>
                  {heatmapData.sections.map(sec => {
                    const cell = heatmapData.cells.find(c => c.grade === grade && c.section === sec);
                    if (!cell || cell.totalStudents === 0) {
                      return (
                        <td key={sec} className="py-1 px-1">
                          <div className="min-h-[4rem] rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                            —
                          </div>
                        </td>
                      );
                    }
                    const isSelected = selectedCell?.grade === grade && selectedCell?.section === sec;
                    return (
                      <td key={sec} className="py-1 px-1">
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedCell(isSelected ? null : cell)}
                          className={`
                            w-full min-h-[4rem] rounded-xl p-2.5 text-center cursor-pointer
                            transition-all duration-200 ring-1 ring-inset
                            ${rateColorClass(cell.rate)}
                            ${isSelected ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-100' : 'hover:shadow-md'}
                          `}
                        >
                          <p className="text-base font-extrabold">{cell.rate}%</p>
                          <p className="text-[10px] mt-0.5 opacity-80">{cell.present}/{cell.totalStudents}</p>
                        </motion.button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded Class Detail Panel */}
        <AnimatePresence>
          {selectedCell && (
            <ClassDetailPanel
              cell={selectedCell}
              data={data}
              locale={locale}
              l={l}
              setStudentModal={setStudentModal}
              onClose={() => setSelectedCell(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── BOTTOM WIDGETS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Absent Students List */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <XCircle className="w-4 h-4 text-rose-500" />
                {l('الطلاب الغائبون اليوم', 'Absent Students Today')}
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{data.absentStudents.length}</span>
              </h3>
            </div>
            <div className="px-3 pb-3 max-h-96 overflow-y-auto">
              {data.absentStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">{l('لا يوجد غائبون', 'No absences')}</div>
              ) : (
                data.absentStudents.map((student, i) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: isRtl ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <AvatarCircle name={locale === 'ar' ? student.name : student.nameEn} />
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setStudentModal(student)}
                        className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors truncate block"
                      >
                        {locale === 'ar' ? student.name : student.nameEn}
                      </button>
                      <p className="text-[11px] text-gray-400">
                        {l('صف', 'G')}{student.grade}{student.section}
                        {student.parentName && <> · {student.parentName}</>}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg shrink-0">
                      {student.absentDays} {l('يوم', 'days')}
                    </span>
                    <button
                      onClick={() => handleNotify(locale === 'ar' ? student.name : student.nameEn)}
                      className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg hover:bg-violet-100 transition-all shrink-0 flex items-center gap-1"
                    >
                      <Bell className="w-3 h-3" />
                      {l('إخطار', 'Notify')}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Chronic Absence Alert Card */}
          <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                {l('تنبيه الغياب المزمن', 'Chronic Absence Alert')}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  data.chronicAbsent.length > 10 ? 'bg-rose-100 text-rose-700' :
                  data.chronicAbsent.length > 5 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {data.chronicAbsent.length}
                </span>
              </h3>
            </div>
            <div className="px-3 pb-3">
              {data.chronicAbsent.slice(0, 5).map((student, i) => (
                <div key={student.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <AvatarCircle name={locale === 'ar' ? student.name : student.nameEn} />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setStudentModal(student)}
                      className="text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors truncate block"
                    >
                      {locale === 'ar' ? student.name : student.nameEn}
                    </button>
                    <p className="text-[11px] text-gray-400">
                      {l('صف', 'G')}{student.grade}{student.section}
                    </p>
                  </div>
                  <div className="text-end shrink-0 me-1">
                    <span className={`text-sm font-bold ${student.rate < 60 ? 'text-rose-500' : 'text-amber-500'}`}>
                      {student.rate}%
                    </span>
                    <div className="flex items-center gap-1 justify-end">
                      {student.trend === 'declining' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                      {student.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                      {student.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                      <span className="text-[10px] text-gray-400">
                        {student.trend === 'declining' ? l('تراجع', 'Declining') :
                         student.trend === 'improving' ? l('تحسن', 'Improving') : l('مستقر', 'Stable')}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 shrink-0">
                    <Sparkline
                      data={Array.from({ length: 7 }, (_, j) => student.rate + (student.trend === 'declining' ? j * -2 : student.trend === 'improving' ? j * 1.5 : 0))}
                      color={student.trend === 'declining' ? '#f43f5e' : student.trend === 'improving' ? '#10b981' : '#94a3b8'}
                      width={60}
                      height={20}
                    />
                  </div>
                </div>
              ))}
              {data.chronicAbsent.length > 5 && (
                <button
                  onClick={onNavigateToReport}
                  className="w-full mt-2 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  {l('عرض الكل', 'View All')} ({data.chronicAbsent.length})
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Day-of-Week Pattern */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-3">
              <CalendarDays className="w-4 h-4 text-sky-500" />
              {l('نمط أيام الأسبوع', 'Day-of-Week Pattern')}
            </h3>
            <VerticalBarChart
              data={data.dayOfWeekPattern.map(d => ({
                label: locale === 'ar' ? d.label : d.labelEn,
                value: Math.round(d.rate),
                color: rateHex(d.rate),
              }))}
              height={180}
              maxValue={100}
            />
          </motion.div>

          {/* Attendance Trend (14 days) */}
          <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-3">
              <Activity className="w-4 h-4 text-violet-500" />
              {l('اتجاه الحضور (14 يوم)', 'Attendance Trend (14 days)')}
            </h3>
            <AreaLineChart
              data={data.dailyTrend.map(d => ({
                label: d.date.slice(5), // MM-DD
                value: Math.round(d.rate),
                meta: `${d.present}/${d.total}`,
              }))}
              height={160}
              color="#8b5cf6"
              yMin={60}
              yMax={100}
            />
          </motion.div>

          {/* Risk Distribution */}
          <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {l('توزيع المخاطر', 'Risk Distribution')}
            </h3>
            <div className="flex justify-center">
              <DonutChart
                segments={[
                  { value: data.riskDistribution.low, color: '#10b981', label: l('منخفض (≥90%)', 'Low (≥90%)') },
                  { value: data.riskDistribution.medium, color: '#f59e0b', label: l('متوسط (75-90%)', 'Medium (75-90%)') },
                  { value: data.riskDistribution.high, color: '#f97316', label: l('مرتفع (50-75%)', 'High (50-75%)') },
                  { value: data.riskDistribution.critical, color: '#f43f5e', label: l('حرج (<50%)', 'Critical (<50%)') },
                ]}
                size={150}
                strokeWidth={18}
                centerValue={`${data.totalStudents}`}
                centerLabel={l('طالب', 'Students')}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CLASS DETAIL PANEL (expanded from heatmap cell)
// ═══════════════════════════════════════════════════════════════

interface ClassDetailPanelProps {
  cell: ClassAttendance;
  data: ReturnType<typeof useAttendanceData>;
  locale: 'ar' | 'en';
  l: (ar: string, en: string) => string;
  setStudentModal: (s: ExtendedStudent | null) => void;
  onClose: () => void;
}

function ClassDetailPanel({ cell, data, locale, l, setStudentModal, onClose }: ClassDetailPanelProps) {
  const students = useMemo(() =>
    EXTENDED_STUDENTS.filter(s => s.grade === cell.grade && s.section === cell.section &&
      (cell.campusId ? s.campusId === cell.campusId : true)),
    [cell]
  );

  const absentSet = new Set(cell.absentStudents);
  const lateMap = new Map(cell.lateStudents.map(ls => [ls.id, ls.time]));
  const presentStudents = students.filter(s => !absentSet.has(s.id) && !lateMap.has(s.id));
  const absentStudentsList = students.filter(s => absentSet.has(s.id));
  const lateStudentsList = students.filter(s => lateMap.has(s.id));

  // Grade avg for comparison
  const gradeAvg = data.gradeBreakdown.find(g => g.grade === cell.grade)?.rate ?? cell.rate;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              {l('الصف', 'Grade')} {cell.grade} - {l('شعبة', 'Section')} {cell.section}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {cell.totalStudents} {l('طالب', 'students')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Donut */}
          <div className="flex justify-center">
            <DonutChart
              segments={[
                { value: cell.present - cell.late, color: '#10b981', label: l('حاضر', 'Present') },
                { value: cell.absent, color: '#f43f5e', label: l('غائب', 'Absent') },
                { value: cell.late, color: '#f59e0b', label: l('متأخر', 'Late') },
              ]}
              size={130}
              strokeWidth={16}
              centerValue={`${cell.rate}%`}
              centerLabel={l('حضور', 'Rate')}
            />
          </div>

          {/* Student list */}
          <div className="md:col-span-2 max-h-48 overflow-y-auto">
            {/* Absent */}
            {absentStudentsList.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <button onClick={() => setStudentModal(s)} className="text-sm text-gray-800 hover:text-violet-600 font-medium truncate">
                  {locale === 'ar' ? s.name : s.nameEn}
                </button>
                <span className="text-[10px] text-gray-400 ms-auto">{l('غائب', 'Absent')}</span>
              </div>
            ))}
            {/* Late */}
            {lateStudentsList.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <button onClick={() => setStudentModal(s)} className="text-sm text-gray-800 hover:text-violet-600 font-medium truncate">
                  {locale === 'ar' ? s.name : s.nameEn}
                </button>
                <span className="text-[10px] text-amber-500 ms-auto">{lateMap.get(s.id)}</span>
              </div>
            ))}
            {/* Present */}
            {presentStudents.slice(0, 8).map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <button onClick={() => setStudentModal(s)} className="text-sm text-gray-800 hover:text-violet-600 font-medium truncate">
                  {locale === 'ar' ? s.name : s.nameEn}
                </button>
              </div>
            ))}
            {presentStudents.length > 8 && (
              <p className="text-xs text-gray-400 px-2 py-1">+{presentStudents.length - 8} {l('آخرون', 'more')}</p>
            )}
          </div>
        </div>

        {/* Comparison Bar */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">{l('مقارنة بمتوسط الصف', 'vs Grade Average')}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cell.rate}%` }}
                transition={{ duration: 0.6 }}
                className={`absolute inset-y-0 start-0 rounded-full ${rateBgFull(cell.rate)}`}
              />
            </div>
            <span className="text-xs font-bold text-gray-700">{cell.rate}%</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gradeAvg}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="absolute inset-y-0 start-0 rounded-full bg-sky-400"
              />
            </div>
            <span className="text-xs font-bold text-gray-500">{gradeAvg}%</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${rateBgFull(cell.rate)}`} />{l('هذا الفصل', 'This Class')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" />{l('متوسط الصف', 'Grade Avg')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TEACHERS CONTENT
// ═══════════════════════════════════════════════════════════════

interface TeachersContentProps {
  locale: 'ar' | 'en';
  l: (ar: string, en: string) => string;
  campusFilter: string;
  teacherSubTab: 'compliance' | 'presence';
  setTeacherSubTab: (t: 'compliance' | 'presence') => void;
}

function TeachersContent({ locale, l, campusFilter, teacherSubTab, setTeacherSubTab }: TeachersContentProps) {
  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5 w-fit">
        {(['compliance', 'presence'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTeacherSubTab(tab)}
            className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              teacherSubTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {teacherSubTab === tab && (
              <motion.div
                layoutId="teacherSubTab"
                className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-600 rounded-lg shadow-md"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">
              {tab === 'compliance' ? l('الالتزام', 'Compliance') : l('الحضور', 'Presence')}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {teacherSubTab === 'compliance' ? (
          <motion.div key="compliance" {...fadeUp} transition={{ duration: 0.25 }}>
            <TeacherComplianceDashboard locale={locale} campusId={campusFilter} />
          </motion.div>
        ) : (
          <motion.div key="presence" {...fadeUp} transition={{ duration: 0.25 }}>
            <TeacherPresenceGrid locale={locale} campusId={campusFilter} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MARK ATTENDANCE PANEL
// ═══════════════════════════════════════════════════════════════

interface MarkAttendancePanelProps {
  locale: 'ar' | 'en';
  l: (ar: string, en: string) => string;
  isRtl: boolean;
  markGrade: number;
  setMarkGrade: (g: number) => void;
  markSection: string;
  setMarkSection: (s: string) => void;
  markStudents: ExtendedStudent[];
  markStatuses: Record<string, AttendanceStatus>;
  setMarkStatuses: React.Dispatch<React.SetStateAction<Record<string, AttendanceStatus>>>;
  markLateTimes: Record<string, string>;
  setMarkLateTimes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onClose: () => void;
  onSave: () => void;
}

function MarkAttendancePanel({
  locale, l, isRtl, markGrade, setMarkGrade, markSection, setMarkSection,
  markStudents, markStatuses, setMarkStatuses, markLateTimes, setMarkLateTimes,
  onClose, onSave,
}: MarkAttendancePanelProps) {
  const presentCount = Object.values(markStatuses).filter(s => s === 'present').length;
  const absentCount = Object.values(markStatuses).filter(s => s === 'absent').length;
  const lateCount = Object.values(markStatuses).filter(s => s === 'late').length;
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: isRtl ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isRtl ? '-100%' : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={`fixed top-0 ${isRtl ? 'start-0' : 'end-0'} h-full w-full max-w-lg bg-white shadow-2xl z-[90] flex flex-col`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-500" />
            {l('تسجيل الحضور', 'Mark Attendance')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Grade & Section selectors */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{l('الصف', 'Grade')}</label>
            <select
              value={markGrade}
              onChange={e => setMarkGrade(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
            >
              {[1, 2, 3, 4, 5, 6].map(g => (
                <option key={g} value={g}>{l('الصف', 'Grade')} {g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{l('الشعبة', 'Section')}</label>
            <div className="flex gap-1">
              {sections.map(sec => (
                <button
                  key={sec}
                  onClick={() => setMarkSection(sec)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    markSection === sec
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {markStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">{l('لا يوجد طلاب', 'No students found')}</div>
          ) : (
            markStudents.map((student, i) => {
              const status = markStatuses[student.id] || 'present';
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
                >
                  <AvatarCircle name={locale === 'ar' ? student.name : student.nameEn} />
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {locale === 'ar' ? student.name : student.nameEn}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    {/* Present */}
                    <button
                      onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: 'present' }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-base ${
                        status === 'present'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                      }`}
                    >
                      ✓
                    </button>
                    {/* Absent */}
                    <button
                      onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: 'absent' }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-base ${
                        status === 'absent'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500'
                      }`}
                    >
                      ✗
                    </button>
                    {/* Late */}
                    <button
                      onClick={() => setMarkStatuses(prev => ({ ...prev, [student.id]: 'late' }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-sm ${
                        status === 'late'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                      }`}
                    >
                      ⏰
                    </button>
                  </div>
                  {/* Inline time for late */}
                  <AnimatePresence>
                    {status === 'late' && (
                      <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 80, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        type="time"
                        value={markLateTimes[student.id] || '07:30'}
                        onChange={e => setMarkLateTimes(prev => ({ ...prev, [student.id]: e.target.value }))}
                        className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 font-mono focus:ring-2 focus:ring-amber-300"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-600">✓ {presentCount}</span>
              <span className="text-rose-600">✗ {absentCount}</span>
              <span className="text-amber-600">⏰ {lateCount}</span>
            </div>
            <span className="text-xs text-gray-400">{markStudents.length} {l('طالب', 'students')}</span>
          </div>
          <button
            onClick={onSave}
            disabled={markStudents.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {l('حفظ الحضور', 'Save Attendance')}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STUDENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════════

interface StudentDetailModalProps {
  student: ExtendedStudent;
  locale: 'ar' | 'en';
  l: (ar: string, en: string) => string;
  isRtl: boolean;
  onClose: () => void;
  onNotify: () => void;
}

function StudentDetailModal({ student, locale, l, isRtl, onClose, onNotify }: StudentDetailModalProps) {
  const records = useMemo(() => getStudentAttendance(student.id), [student.id]);
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const rate = records.length > 0 ? Math.round((presentCount + lateCount) / records.length * 100) : 0;

  const campus = CAMPUSES.find(c => c.id === student.campusId);

  // 30-day calendar grid
  const calendarDays = useMemo(() => {
    const days: { date: string; status: AttendanceStatus | 'weekend' | 'none'; dayNum: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dow = d.getDay();
      if (dow === 5 || dow === 6) {
        days.push({ date: dateStr, status: 'weekend', dayNum: d.getDate() });
      } else {
        const record = records.find(r => r.date === dateStr);
        days.push({ date: dateStr, status: record?.status || 'none', dayNum: d.getDate() });
      }
    }
    return days;
  }, [records]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-500 text-white';
      case 'absent': return 'bg-rose-500 text-white';
      case 'late': return 'bg-amber-400 text-white';
      case 'weekend': return 'bg-gray-200 text-gray-400';
      default: return 'bg-gray-100 text-gray-300';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <AvatarCircle name={locale === 'ar' ? student.name : student.nameEn} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 truncate">
                {locale === 'ar' ? student.name : student.nameEn}
              </h2>
              <p className="text-sm text-gray-400">
                {l('صف', 'Grade')} {student.grade}{student.section}
                {campus && <> · {locale === 'ar' ? campus.name : campus.nameEn}</>}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24">
            <ProgressRing value={rate} size={96} strokeWidth={7} label={l('حضور', 'Rate')} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-5 mb-4">
          {[
            { label: l('حاضر', 'Present'), value: presentCount, color: 'text-emerald-600 bg-emerald-50' },
            { label: l('غائب', 'Absent'), value: absentCount, color: 'text-rose-600 bg-rose-50' },
            { label: l('متأخر', 'Late'), value: lateCount, color: 'text-amber-600 bg-amber-50' },
            { label: l('النسبة', 'Rate'), value: `${rate}%`, color: 'text-violet-600 bg-violet-50' },
          ].map((s, i) => (
            <div key={i} className={`text-center py-2 px-1 rounded-xl ${s.color}`}>
              <p className="text-lg font-extrabold">{s.value}</p>
              <p className="text-[10px] font-semibold opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 30-day Calendar Grid */}
        <div className="px-5 mb-4">
          <h4 className="text-xs font-bold text-gray-500 mb-2">{l('آخر 30 يوم', 'Last 30 Days')}</h4>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${statusColor(day.status)}`}
                title={`${day.date}: ${day.status}`}
              >
                {day.dayNum}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" />{l('حاضر', 'Present')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" />{l('غائب', 'Absent')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" />{l('متأخر', 'Late')}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-200" />{l('عطلة', 'Weekend')}</span>
          </div>
        </div>

        {/* Parent Info & Notify */}
        <div className="px-5 pb-5">
          {student.parentName && (
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-gray-500">{l('ولي الأمر', 'Parent')}</p>
              <p className="text-sm font-bold text-gray-800">{student.parentName}</p>
            </div>
          )}
          <button
            onClick={() => { onNotify(); onClose(); }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-violet-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {l('إرسال إشعار لولي الأمر', 'Send Notification to Parent')}
          </button>
        </div>
      </motion.div>
    </>
  );
}
