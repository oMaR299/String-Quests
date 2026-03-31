import React, { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, GraduationCap, ArrowUpDown,
  X, ChevronRight, ChevronLeft, Users, Target, BookOpen,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA, SUBJECT_UNITS,
  type StudentProfile, type Subject, type ClassSection,
} from '../../data/complexLeaderboardData';
import {
  ProgressRing, HorizontalBarChart, RadarChart,
} from '../admin-hub/attendance/SvgCharts';
import { StudentProfileModal } from '../StudentProfileModal';
import { CAMPUSES, formatSectionLabel } from './TopicManagerLayout';

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const CAMPUS_COLORS: Record<string, { bar: string; radar: string; badge: string }> = {
  'camp-1': { bar: '#3b82f6', radar: '#3b82f6', badge: 'bg-blue-100 text-blue-700' },
  'camp-2': { bar: '#10b981', radar: '#10b981', badge: 'bg-emerald-100 text-emerald-700' },
  'camp-3': { bar: '#8b5cf6', radar: '#8b5cf6', badge: 'bg-violet-100 text-violet-700' },
};

const MOCK_TEACHERS = [
  'أ. سليمان العتيبي', 'أ. فهد القحطاني', 'أ. نورة المنصور', 'أ. هند الشمري',
  'أ. خالد الحربي', 'أ. سارة الدوسري', 'أ. عبدالله الزهراني', 'أ. ليلى الغامدي',
  'أ. محمد المطيري', 'أ. فاطمة الشهري', 'أ. أحمد العنزي', 'أ. مريم السالم',
];

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

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

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function accuracyColor(v: number): string {
  if (v >= 85) return '#10b981';
  if (v >= 70) return '#f59e0b';
  return '#ef4444';
}

function trendIcon(t: 'up' | 'down' | 'stable') {
  if (t === 'up') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (t === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

function mockTeacher(section: string, campusId: string): string {
  const hash = (section.charCodeAt(0) * 31 + campusId.charCodeAt(campusId.length - 1)) % MOCK_TEACHERS.length;
  return MOCK_TEACHERS[hash];
}

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface SectionRow {
  section: ClassSection;
  campusId: string;
  label: string;
  teacher: string;
  studentCount: number;
  avgXp: number;
  avgAccuracy: number;
  trend: 'up' | 'down' | 'stable';
  topStudent: string;
  topStudentProfile: StudentProfile | null;
  students: StudentProfile[];
}

interface GradesTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function GradesTab({ subject, locale }: GradesTabProps) {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [sortKey, setSortKey] = useState<'avgAccuracy' | 'avgXp'>('avgAccuracy');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedSection, setSelectedSection] = useState<SectionRow | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const isRTL = locale === 'ar';
  const t = useCallback((ar: string, en: string) => (locale === 'ar' ? ar : en), [locale]);
  const subjectKey = subject as Exclude<Subject, 'all'>;
  const units = (SUBJECT_UNITS[subjectKey] || []) as string[];
  const chartId = useId();

  /* ── Build section rows for selected grade ────── */
  const sectionRows = useMemo(() => {
    const gradeStudents = MOCK_SCHOOL_DATA.filter(
      s => s.grade === selectedGrade && (s.subjectDetails[subjectKey]?.accuracy ?? 0) > 0,
    );

    const groupMap = new Map<string, StudentProfile[]>();
    for (const s of gradeStudents) {
      const key = `${s.section}-${s.campusId}`;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(s);
    }

    const rows: SectionRow[] = [];
    for (const [key, students] of groupMap) {
      const [section, campusId] = key.split('-') as [ClassSection, string];
      const fullCampusId = `camp-${campusId.split('camp-')[1] || campusId}`;
      const realCampusId = students[0].campusId;

      const avgXp = Math.round(students.reduce((s, st) => s + (st.subjectXp[subjectKey] || 0), 0) / students.length);
      const avgAccuracy = Math.round(students.reduce((s, st) => s + (st.subjectDetails[subjectKey]?.accuracy ?? 0), 0) / students.length);

      const sorted = [...students].sort((a, b) => (b.subjectDetails[subjectKey]?.accuracy ?? 0) - (a.subjectDetails[subjectKey]?.accuracy ?? 0));
      const topStudent = sorted[0];

      const trend: 'up' | 'down' | 'stable' = avgAccuracy >= 80 ? 'up' : avgAccuracy < 70 ? 'down' : 'stable';

      rows.push({
        section,
        campusId: realCampusId,
        label: formatSectionLabel(section, realCampusId, locale),
        teacher: mockTeacher(section, realCampusId),
        studentCount: students.length,
        avgXp,
        avgAccuracy,
        trend,
        topStudent: topStudent?.name || '-',
        topStudentProfile: topStudent || null,
        students,
      });
    }

    rows.sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);
    return rows;
  }, [selectedGrade, subjectKey, locale, sortKey, sortDir]);

  /* ── Toggle sort ───────────────────────────────── */
  const toggleSort = (key: 'avgAccuracy' | 'avgXp') => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  /* ── Bar chart data ────────────────────────────── */
  const barChartData = useMemo(() => {
    return sectionRows.map(r => ({
      label: r.label,
      value: r.avgAccuracy,
      color: CAMPUS_COLORS[r.campusId]?.bar || '#94a3b8',
    }));
  }, [sectionRows]);

  /* ── Radar chart data ──────────────────────────── */
  const radarData = useMemo(() => {
    if (sectionRows.length === 0 || sectionRows.length > 6) return null;

    const axes = [
      { label: t('الدقة', 'Accuracy'), maxValue: 100 },
      { label: t('XP', 'XP'), maxValue: Math.max(...sectionRows.map(r => r.avgXp), 1) },
      { label: t('الطلاب', 'Students'), maxValue: Math.max(...sectionRows.map(r => r.studentCount), 1) },
      { label: t('الإكمال', 'Completion'), maxValue: 100 },
      { label: t('المشاركة', 'Engagement'), maxValue: 100 },
    ];

    const datasets = sectionRows.map(r => {
      // mock completion and engagement
      const completion = Math.min(100, r.avgAccuracy + Math.floor(Math.random() * 15));
      const engagement = Math.min(100, Math.round((r.students.filter(s => (s.subjectDetails[subjectKey]?.accuracy ?? 0) > 60).length / Math.max(r.studentCount, 1)) * 100));

      return {
        name: r.label,
        values: [r.avgAccuracy, r.avgXp, r.studentCount, completion, engagement],
        color: CAMPUS_COLORS[r.campusId]?.radar || '#94a3b8',
      };
    });

    return { axes, datasets };
  }, [sectionRows, subjectKey, t]);

  /* ── Section detail panel data ─────────────────── */
  const sectionDetail = useMemo(() => {
    if (!selectedSection) return null;

    const unitBreakdown = units.map(u => {
      const key = `${subject}-${u}`;
      const attempted = selectedSection.students.filter(s => s.lessonDetails[key]);
      const avg = attempted.length > 0 ? Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length) : 0;
      return { unit: u, label: t(UNIT_LABELS_AR[u] || u, u), avgAccuracy: avg, studentCount: attempted.length };
    });

    const studentList = [...selectedSection.students].sort(
      (a, b) => (b.subjectDetails[subjectKey]?.accuracy ?? 0) - (a.subjectDetails[subjectKey]?.accuracy ?? 0),
    );

    const worstUnit = [...unitBreakdown].sort((a, b) => a.avgAccuracy - b.avgAccuracy)[0];

    return { unitBreakdown, studentList, worstUnit };
  }, [selectedSection, units, subject, subjectKey, t]);

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ── Grade Selector Pills ─────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold text-slate-700">{t('اختر الصف', 'Select Grade')}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {GRADES.map(g => (
            <motion.button
              key={g}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedGrade(g); setSelectedSection(null); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedGrade === g
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t(`الصف ${g}`, `Grade ${g}`)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Section Comparison Table ─────────────── */}
      <motion.div
        key={selectedGrade}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            {t(`مقارنة شعب الصف ${selectedGrade}`, `Grade ${selectedGrade} Section Comparison`)}
          </h3>
          <span className="text-xs font-semibold text-slate-400">{sectionRows.length} {t('شعبة', 'sections')}</span>
        </div>

        {sectionRows.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-semibold">{t('لا توجد بيانات لهذا الصف', 'No data for this grade')}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_140px_60px_80px_140px_40px_120px] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 items-center">
              <span>{t('الشعبة + المبنى', 'Section + Campus')}</span>
              <span>{t('المعلم', 'Teacher')}</span>
              <span className="text-center">{t('طلاب', 'Count')}</span>
              <button onClick={() => toggleSort('avgXp')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                {t('XP', 'XP')}<ArrowUpDown className="w-3 h-3" />
              </button>
              <button onClick={() => toggleSort('avgAccuracy')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                {t('الدقة', 'Accuracy')}<ArrowUpDown className="w-3 h-3" />
              </button>
              <span className="text-center">{t('اتجاه', 'Trend')}</span>
              <span>{t('أفضل طالب', 'Top Student')}</span>
            </div>

            {/* Rows */}
            {sectionRows.map((row, i) => {
              const isTop3 = i < 3;
              const isBottom3 = i >= sectionRows.length - 3 && sectionRows.length > 3;
              const campusStyle = CAMPUS_COLORS[row.campusId] || CAMPUS_COLORS['camp-1'];

              return (
                <motion.button
                  key={`${row.section}-${row.campusId}`}
                  initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => setSelectedSection(row)}
                  className={`w-full grid grid-cols-[1fr_140px_60px_80px_140px_40px_120px] gap-2 px-5 py-3.5 items-center border-b border-slate-50 hover:bg-slate-50/60 transition-colors text-start ${
                    isTop3 && sortDir === 'desc' ? 'bg-emerald-50/30' : isBottom3 && sortDir === 'desc' ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Section + Campus label */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 text-center text-sm font-extrabold text-slate-600 shrink-0">
                      {i < 3 && sortDir === 'desc' ? MEDAL_EMOJIS[i] : i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{row.label}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${campusStyle.badge}`}>
                        {t(CAMPUSES.find(c => c.id === row.campusId)?.name || '', CAMPUSES.find(c => c.id === row.campusId)?.nameEn || '')}
                      </span>
                    </div>
                  </div>

                  {/* Teacher */}
                  <span className="text-xs font-semibold text-slate-500 truncate">{row.teacher}</span>

                  {/* Student count */}
                  <span className="text-xs font-bold text-slate-600 text-center">{row.studentCount}</span>

                  {/* XP */}
                  <span className="text-sm font-bold text-slate-700">{row.avgXp.toLocaleString()}</span>

                  {/* Accuracy mini progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 rounded-full bg-slate-100 flex-1 max-w-[100px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.avgAccuracy}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03 }}
                        className="h-2.5 rounded-full"
                        style={{ backgroundColor: accuracyColor(row.avgAccuracy) }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: accuracyColor(row.avgAccuracy) }}>
                      {row.avgAccuracy}%
                    </span>
                  </div>

                  {/* Trend */}
                  <div className="flex justify-center">{trendIcon(row.trend)}</div>

                  {/* Top student */}
                  <span className="text-xs font-semibold text-slate-600 truncate">{row.topStudent}</span>
                </motion.button>
              );
            })}
          </>
        )}
      </motion.div>

      {/* ── Charts (2 columns) ───────────────────── */}
      {sectionRows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart A: Horizontal Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-4">
              {t('مقارنة الشعب (الدقة)', 'Section Comparison (Accuracy)')}
            </h3>
            <HorizontalBarChart
              data={barChartData}
              maxValue={100}
              showValues
              valueSuffix="%"
            />
            {/* Campus color legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100">
              {CAMPUSES.map(c => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CAMPUS_COLORS[c.id]?.bar || '#94a3b8' }} />
                  <span className="text-[10px] font-semibold text-slate-500">{t(c.name, c.nameEn)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart B: Radar Chart (max 6 sections) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-4">
              {t('مقارنة الشعب (متعددة الأبعاد)', 'Section Radar Overlay')}
            </h3>
            {radarData ? (
              <>
                <div className="flex justify-center">
                  <RadarChart axes={radarData.axes} datasets={radarData.datasets} size={260} />
                </div>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {radarData.datasets.map(ds => (
                    <div key={ds.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: ds.color }} />
                      <span className="text-[10px] font-semibold text-slate-500 max-w-[120px] truncate">{ds.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs font-semibold">{t('الرسم البياني الشبكي متاح لـ 6 شعب أو أقل', 'Radar chart available for 6 or fewer sections')}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Section Detail Cards ─────────────────── */}
      {sectionRows.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-4">{t('بطاقات الشعب', 'Section Cards')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionRows.map((row, i) => {
              const worstUnit = units.reduce((worst, u) => {
                const key = `${subject}-${u}`;
                const attempted = row.students.filter(s => s.lessonDetails[key]);
                if (attempted.length === 0) return worst;
                const avg = Math.round(attempted.reduce((s, st) => s + (st.lessonDetails[key]?.accuracy ?? 0), 0) / attempted.length);
                return avg < worst.acc ? { unit: u, acc: avg } : worst;
              }, { unit: '-', acc: 101 });

              const campusStyle = CAMPUS_COLORS[row.campusId] || CAMPUS_COLORS['camp-1'];

              return (
                <motion.button
                  key={`card-${row.section}-${row.campusId}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => setSelectedSection(row)}
                  className="text-start bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{row.label}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${campusStyle.badge}`}>
                        {t(CAMPUSES.find(c => c.id === row.campusId)?.name || '', CAMPUSES.find(c => c.id === row.campusId)?.nameEn || '')}
                      </span>
                    </div>
                    <div className="w-14">
                      <ProgressRing value={row.avgAccuracy} size={56} strokeWidth={5} color={accuracyColor(row.avgAccuracy)} />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-slate-400">{t('طلاب', 'Students')}</p>
                      <p className="text-sm font-bold text-slate-700">{row.studentCount}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold text-slate-400">{t('متوسط XP', 'Avg XP')}</p>
                      <p className="text-sm font-bold text-slate-700">{row.avgXp.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">{t('أفضل طالب', 'Top Student')}</span>
                      <span className="font-bold text-slate-600 truncate max-w-[140px]">{row.topStudent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400">{t('أضعف وحدة', 'Worst Unit')}</span>
                      <span className="font-bold text-red-500">
                        {worstUnit.unit !== '-' ? `${t(UNIT_LABELS_AR[worstUnit.unit] || worstUnit.unit, worstUnit.unit)} (${worstUnit.acc}%)` : '-'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SLIDE-IN SECTION DETAIL PANEL
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedSection && sectionDetail && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setSelectedSection(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: isRTL ? -480 : 480, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRTL ? -480 : 480, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} z-[100] h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto`}
            >
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5 sticky top-0 z-10">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-extrabold text-white">{selectedSection.label}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-white/70">{selectedSection.teacher}</span>
                  <span className="text-white/40">|</span>
                  <span className="text-xs font-bold text-white/70">{selectedSection.studentCount} {t('طالب', 'students')}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
                    <p className="text-xl font-extrabold text-emerald-600">{selectedSection.avgAccuracy}%</p>
                    <p className="text-[9px] font-semibold text-emerald-500">{t('الدقة', 'Accuracy')}</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-center">
                    <p className="text-xl font-extrabold text-sky-600">{selectedSection.avgXp.toLocaleString()}</p>
                    <p className="text-[9px] font-semibold text-sky-500">{t('XP', 'XP')}</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 text-center">
                    <p className="text-xl font-extrabold text-violet-600">{selectedSection.studentCount}</p>
                    <p className="text-[9px] font-semibold text-violet-500">{t('طلاب', 'Students')}</p>
                  </div>
                </div>

                {/* Unit Breakdown Bar Chart */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">{t('أداء الوحدات', 'Unit Performance')}</h3>
                  <HorizontalBarChart
                    data={sectionDetail.unitBreakdown.map(u => ({
                      label: u.label,
                      value: u.avgAccuracy,
                      color: accuracyColor(u.avgAccuracy),
                    }))}
                    maxValue={100}
                    showValues
                    valueSuffix="%"
                  />
                </div>

                {/* Student list */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">{t('قائمة الطلاب', 'Student List')}</h3>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {sectionDetail.studentList.map((st, i) => {
                      const acc = st.subjectDetails[subjectKey]?.accuracy ?? 0;
                      return (
                        <button
                          key={st.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedStudent(st); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-start ${
                            i < 3 ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <span className="w-5 text-center text-xs font-extrabold text-slate-500">
                            {i < 3 ? MEDAL_EMOJIS[i] : i + 1}
                          </span>
                          <div className={`w-7 h-7 rounded-full ${st.avatar || 'bg-blue-100'} flex items-center justify-center text-xs font-bold text-slate-600 shrink-0`}>
                            {st.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{st.name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-16">
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 rounded-full bg-slate-100 flex-1">
                                  <div className="h-1.5 rounded-full" style={{ width: `${acc}%`, backgroundColor: accuracyColor(acc) }} />
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold w-10 text-end" style={{ color: accuracyColor(acc) }}>{acc}%</span>
                            <span className="shrink-0">{trendIcon(st.trend)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          STUDENT PROFILE MODAL
          ═══════════════════════════════════════════════ */}
      {selectedStudent && <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
}

export default GradesTab;
