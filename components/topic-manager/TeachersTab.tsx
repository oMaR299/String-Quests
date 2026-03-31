import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, Users, Star, Trophy,
  ArrowUpDown, GitCompareArrows, Check, X, Crown, Medal,
  Building2, GraduationCap, Award, TrendingUp, TrendingDown,
  Minus, Eye, ChevronRight,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  SUBJECT_UNITS,
  type StudentProfile,
  type Subject,
  type ClassSection,
  type GradeLevel,
} from '../../data/complexLeaderboardData';
import { ProgressRing, HorizontalBarChart } from '../admin-hub/attendance/SvgCharts';
import { StudentProfileModal } from '../StudentProfileModal';

/* ═══════════════════════════════════════════════════════════════
   Constants & Types
   ═══════════════════════════════════════════════════════════════ */

interface TeachersTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor (Girls)' },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy' },
];

const TEACHER_FIRST_NAMES = [
  'أحمد', 'محمد', 'إبراهيم', 'خالد', 'عبدالله', 'يوسف', 'عمر', 'سعيد',
  'فهد', 'سلطان', 'ناصر', 'بندر', 'تركي', 'مشعل', 'عادل', 'وليد',
  'سارة', 'نورة', 'فاطمة', 'هند', 'ريم', 'لمياء', 'منى', 'أمل',
  'عبير', 'هيفاء', 'دلال', 'وفاء', 'سلمى', 'مها', 'نجلاء', 'جميلة',
  'رقية', 'خديجة', 'زينب', 'ليلى',
];

const TEACHER_LAST_NAMES = [
  'المنصور', 'العبدالله', 'السالم', 'الخالدي', 'العمري', 'القحطاني',
  'الشمري', 'العتيبي', 'الزهراني', 'الغامدي', 'الدوسري', 'المطيري',
  'الشهري', 'الحربي', 'العنزي', 'الرشيدي', 'البلوي', 'الجهني',
  'السبيعي', 'الهاجري', 'المالكي', 'الثقفي', 'الحارثي', 'الزهراني',
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-pink-500', 'bg-sky-500', 'bg-lime-500', 'bg-fuchsia-500',
];

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

const COMPARE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

interface TeacherData {
  id: string;
  name: string;
  campusId: string;
  grade: number;
  section: ClassSection;
  avatarColor: string;
  students: StudentProfile[];
  studentCount: number;
  avgAccuracy: number;
  avgXp: number;
  bestUnit: string;
  worstUnit: string;
  starRating: number;
  campusAvgDelta: number;
  unitBreakdown: { unit: string; accuracy: number }[];
}

type SortKey = 'rank' | 'name' | 'campus' | 'grade' | 'students' | 'accuracy' | 'xp' | 'stars';

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTeachers(subject: string, allStudents: StudentProfile[]): TeacherData[] {
  const subj = subject as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[subj] || [];
  const teachers: TeacherData[] = [];
  const rand = seededRandom(subj.charCodeAt(0) * 1000);

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const sections: ClassSection[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  // campus avg accuracy per grade for delta calculation
  const campusGradeAvg: Record<string, Record<number, number>> = {};

  for (const g of grades) {
    for (const s of sections) {
      const students = allStudents.filter(
        st => st.grade === g && st.section === s
      );
      if (students.length === 0) continue;

      const nameIdx = Math.floor(rand() * TEACHER_FIRST_NAMES.length);
      const lastIdx = Math.floor(rand() * TEACHER_LAST_NAMES.length);
      const name = `${TEACHER_FIRST_NAMES[nameIdx]} ${TEACHER_LAST_NAMES[lastIdx]}`;
      const campusId = students[0].campusId;
      const avatarColor = AVATAR_COLORS[Math.floor(rand() * AVATAR_COLORS.length)];

      // Calculate per-unit breakdown
      const unitBreakdown = units.map(unit => {
        const key = `${subj}-${unit}`;
        const accs = students
          .filter(st => st.lessonDetails[key])
          .map(st => st.lessonDetails[key].accuracy);
        const avg = accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;
        return { unit, accuracy: avg };
      });

      const validUnits = unitBreakdown.filter(u => u.accuracy > 0);
      const avgAccuracy = students.length > 0
        ? Math.round(students.reduce((sum, st) => sum + (st.subjectDetails[subj]?.accuracy || 0), 0) / students.length)
        : 0;
      const avgXp = students.length > 0
        ? Math.round(students.reduce((sum, st) => sum + (st.subjectDetails[subj]?.xp || 0), 0) / students.length)
        : 0;

      const bestUnit = validUnits.length > 0
        ? validUnits.reduce((a, b) => a.accuracy > b.accuracy ? a : b).unit
        : units[0] || '';
      const worstUnit = validUnits.length > 0
        ? validUnits.reduce((a, b) => a.accuracy < b.accuracy ? a : b).unit
        : units[0] || '';

      const starRating = avgAccuracy >= 90 ? 5 : avgAccuracy >= 80 ? 4 : avgAccuracy >= 70 ? 3 : avgAccuracy >= 60 ? 2 : 1;

      // Track campus-grade averages
      if (!campusGradeAvg[campusId]) campusGradeAvg[campusId] = {};
      if (!campusGradeAvg[campusId][g]) campusGradeAvg[campusId][g] = 0;

      teachers.push({
        id: `teacher-${g}-${s}`,
        name,
        campusId,
        grade: g,
        section: s,
        avatarColor,
        students,
        studentCount: students.length,
        avgAccuracy,
        avgXp,
        bestUnit,
        worstUnit,
        starRating,
        campusAvgDelta: 0, // computed below
        unitBreakdown,
      });
    }
  }

  // Compute campus avg deltas
  for (const campusId of Object.keys(campusGradeAvg)) {
    const campusTeachers = teachers.filter(t => t.campusId === campusId);
    const campusAvg = campusTeachers.length > 0
      ? campusTeachers.reduce((s, t) => s + t.avgAccuracy, 0) / campusTeachers.length
      : 0;
    campusTeachers.forEach(t => {
      t.campusAvgDelta = Math.round(t.avgAccuracy - campusAvg);
    });
  }

  return teachers;
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function TeachersTab({ subject, locale }: TeachersTabProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [campusFilter, setCampusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('accuracy');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const allTeachers = useMemo(
    () => generateTeachers(subject, MOCK_SCHOOL_DATA),
    [subject]
  );

  const filtered = useMemo(() => {
    let list = allTeachers;
    if (campusFilter !== 'all') list = list.filter(t => t.campusId === campusFilter);
    if (gradeFilter !== 'all') list = list.filter(t => t.grade === gradeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [allTeachers, campusFilter, gradeFilter, searchQuery]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ar'); break;
        case 'campus': cmp = a.campusId.localeCompare(b.campusId); break;
        case 'grade': cmp = a.grade - b.grade; break;
        case 'students': cmp = a.studentCount - b.studentCount; break;
        case 'accuracy': cmp = a.avgAccuracy - b.avgAccuracy; break;
        case 'xp': cmp = a.avgXp - b.avgXp; break;
        case 'stars': cmp = a.starRating - b.starRating; break;
        default: cmp = a.avgAccuracy - b.avgAccuracy;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  // Ranked list (by accuracy descending for medal assignment)
  const ranked = useMemo(() => {
    const byAcc = [...filtered].sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    const rankMap = new Map<string, number>();
    byAcc.forEach((t, i) => rankMap.set(t.id, i + 1));
    return rankMap;
  }, [filtered]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }, [sortKey]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 3 ? prev : [...prev, id]
    );
  }, []);

  const selectedTeachers = useMemo(
    () => selectedIds.map(id => sorted.find(t => t.id === id)).filter(Boolean) as TeacherData[],
    [selectedIds, sorted]
  );

  const campusName = (id: string) => {
    const c = CAMPUSES.find(c => c.id === id);
    return c ? (isRtl ? c.name : c.nameEn) : id;
  };

  const unitLabel = (u: string) => isRtl ? (UNIT_LABELS_AR[u] || u) : u;

  const medalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const SortHeader = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <button
      onClick={() => toggleSort(sKey)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap"
    >
      {label}
      {sortKey === sKey && (
        sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      )}
    </button>
  );

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-5" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ─── Filters ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('بحث بالاسم...', 'Search by name...')}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Campus */}
        <select
          value={campusFilter}
          onChange={e => setCampusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">{t('جميع المباني', 'All Campuses')}</option>
          {CAMPUSES.map(c => (
            <option key={c.id} value={c.id}>{isRtl ? c.name : c.nameEn}</option>
          ))}
        </select>

        {/* Grade */}
        <select
          value={gradeFilter === 'all' ? 'all' : String(gradeFilter)}
          onChange={e => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">{t('جميع الصفوف', 'All Grades')}</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
            <option key={g} value={g}>{t(`الصف ${g}`, `Grade ${g}`)}</option>
          ))}
        </select>

        {/* Compare Toggle */}
        <button
          onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
            compareMode
              ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <GitCompareArrows className="w-4 h-4" />
          {t('وضع المقارنة', 'Compare Mode')}
        </button>

        {compareMode && selectedIds.length > 0 && (
          <button
            onClick={() => setSelectedIds([])}
            className="px-3 py-2 text-xs rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-3.5 h-3.5 inline-block me-1" />
            {t('مسح الاختيار', 'Clear')}
          </button>
        )}
      </div>

      {compareMode && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium"
        >
          {t(
            `اختر 2-3 معلمين للمقارنة (${selectedIds.length}/3 مختار)`,
            `Select 2-3 teachers to compare (${selectedIds.length}/3 selected)`
          )}
        </motion.div>
      )}

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {compareMode && <th className="px-3 py-3 w-10" />}
                <th className="px-3 py-3 text-start"><SortHeader label="#" sKey="rank" /></th>
                <th className="px-4 py-3 text-start"><SortHeader label={t('المعلم', 'Teacher')} sKey="name" /></th>
                <th className="px-3 py-3 text-start"><SortHeader label={t('المبنى', 'Campus')} sKey="campus" /></th>
                <th className="px-3 py-3 text-center"><SortHeader label={t('الصف', 'Grade')} sKey="grade" /></th>
                <th className="px-3 py-3 text-center">{t('الشعبة', 'Section')}</th>
                <th className="px-3 py-3 text-center"><SortHeader label={t('الطلاب', 'Students')} sKey="students" /></th>
                <th className="px-3 py-3 text-center min-w-[160px]"><SortHeader label={t('الدقة %', 'Accuracy %')} sKey="accuracy" /></th>
                <th className="px-3 py-3 text-center"><SortHeader label={t('متوسط XP', 'Avg XP')} sKey="xp" /></th>
                <th className="px-3 py-3 text-center">{t('أفضل وحدة', 'Best Unit')}</th>
                <th className="px-3 py-3 text-center">{t('أضعف وحدة', 'Worst Unit')}</th>
                <th className="px-3 py-3 text-center"><SortHeader label={t('التقييم', 'Rating')} sKey="stars" /></th>
                <th className="px-3 py-3 text-center">{t('مقارنة بالمبنى', 'vs Campus')}</th>
                <th className="px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {sorted.map((teacher, idx) => {
                  const rank = ranked.get(teacher.id) || idx + 1;
                  const isExpanded = expandedRow === teacher.id;
                  const isSelected = selectedIds.includes(teacher.id);
                  const colorIdx = selectedIds.indexOf(teacher.id);

                  return (
                    <motion.tr
                      key={teacher.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer ${
                        isSelected ? 'ring-2 ring-inset' : ''
                      }`}
                      style={isSelected ? { boxShadow: `inset 4px 0 0 ${COMPARE_COLORS[colorIdx]}` } : {}}
                      onClick={() => {
                        if (compareMode) toggleSelect(teacher.id);
                        else setExpandedRow(isExpanded ? null : teacher.id);
                      }}
                    >
                      {/* Checkbox */}
                      {compareMode && (
                        <td className="px-3 py-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </td>
                      )}

                      {/* Rank */}
                      <td className="px-3 py-3 font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          {medalEmoji(rank) && <span className="text-base">{medalEmoji(rank)}</span>}
                          <span className={rank <= 3 ? 'text-amber-600' : ''}>{rank}</span>
                        </span>
                      </td>

                      {/* Teacher Name + Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${teacher.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {teacher.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">{teacher.name}</span>
                        </div>
                      </td>

                      {/* Campus */}
                      <td className="px-3 py-3 text-slate-600 text-xs whitespace-nowrap">
                        {campusName(teacher.campusId)}
                      </td>

                      {/* Grade */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                          {teacher.grade}
                        </span>
                      </td>

                      {/* Section */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold">
                          {teacher.section}
                        </span>
                      </td>

                      {/* Students */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Users className="w-3.5 h-3.5" />
                          {teacher.studentCount}
                        </span>
                      </td>

                      {/* Accuracy with progress bar */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-[80px]">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${teacher.avgAccuracy}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.03 }}
                              style={{
                                background: teacher.avgAccuracy >= 80
                                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                                  : teacher.avgAccuracy >= 65
                                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                    : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700 w-9 text-end">{teacher.avgAccuracy}%</span>
                        </div>
                      </td>

                      {/* Avg XP */}
                      <td className="px-3 py-3 text-center font-semibold text-slate-700 text-xs">
                        {teacher.avgXp.toLocaleString()}
                      </td>

                      {/* Best Unit */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium whitespace-nowrap">
                          {unitLabel(teacher.bestUnit)}
                        </span>
                      </td>

                      {/* Worst Unit */}
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium whitespace-nowrap">
                          {unitLabel(teacher.worstUnit)}
                        </span>
                      </td>

                      {/* Star Rating */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < teacher.starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* vs Campus Avg */}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                          teacher.campusAvgDelta > 0 ? 'text-emerald-600' : teacher.campusAvgDelta < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {teacher.campusAvgDelta > 0 ? (
                            <><TrendingUp className="w-3 h-3" />+{teacher.campusAvgDelta}%</>
                          ) : teacher.campusAvgDelta < 0 ? (
                            <><TrendingDown className="w-3 h-3" />{teacher.campusAvgDelta}%</>
                          ) : (
                            <><Minus className="w-3 h-3" />0%</>
                          )}
                        </span>
                      </td>

                      {/* Expand icon */}
                      <td className="px-3 py-3">
                        {!compareMode && (
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t('لا توجد نتائج', 'No results found')}
          </div>
        )}
      </div>

      {/* ─── Expanded Row Details ─── */}
      <AnimatePresence>
        {expandedRow && !compareMode && (() => {
          const teacher = sorted.find(t => t.id === expandedRow);
          if (!teacher) return null;

          return (
            <motion.div
              key={`expand-${expandedRow}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-5 space-y-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  {t(`تفاصيل ${teacher.name}`, `${teacher.name} Details`)}
                </h3>

                {/* Unit Breakdown */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">{t('أداء الوحدات', 'Unit Performance')}</h4>
                  <div className="max-w-xl">
                    <HorizontalBarChart
                      data={teacher.unitBreakdown.filter(u => u.accuracy > 0).map(u => ({
                        label: unitLabel(u.unit),
                        value: u.accuracy,
                      }))}
                      maxValue={100}
                      valueSuffix="%"
                    />
                  </div>
                </div>

                {/* Accuracy Distribution */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">{t('توزيع الدقة', 'Accuracy Distribution')}</h4>
                  <div className="flex gap-2">
                    {[
                      { label: '90-100%', range: [90, 100], color: 'bg-emerald-500' },
                      { label: '80-89%', range: [80, 89], color: 'bg-blue-500' },
                      { label: '70-79%', range: [70, 79], color: 'bg-amber-500' },
                      { label: '60-69%', range: [60, 69], color: 'bg-orange-500' },
                      { label: '<60%', range: [0, 59], color: 'bg-rose-500' },
                    ].map(bracket => {
                      const subj = subject as Exclude<Subject, 'all'>;
                      const count = teacher.students.filter(st => {
                        const acc = st.subjectDetails[subj]?.accuracy || 0;
                        return acc >= bracket.range[0] && acc <= bracket.range[1];
                      }).length;
                      const pct = teacher.studentCount > 0 ? Math.round((count / teacher.studentCount) * 100) : 0;
                      return (
                        <div key={bracket.label} className="flex-1 text-center">
                          <div className="h-20 bg-slate-50 rounded-lg relative overflow-hidden flex items-end justify-center">
                            <motion.div
                              className={`w-full ${bracket.color} rounded-t-md`}
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <p className="text-[10px] font-semibold text-slate-500 mt-1">{bracket.label}</p>
                          <p className="text-xs font-bold text-slate-700">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Student List */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">
                    {t('قائمة الطلاب', 'Student List')} ({teacher.studentCount})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {teacher.students
                      .sort((a, b) => (b.subjectDetails[subject as Exclude<Subject, 'all'>]?.accuracy || 0) - (a.subjectDetails[subject as Exclude<Subject, 'all'>]?.accuracy || 0))
                      .map((st, i) => {
                        const subj = subject as Exclude<Subject, 'all'>;
                        const acc = st.subjectDetails[subj]?.accuracy || 0;
                        return (
                          <motion.button
                            key={st.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(st); }}
                            className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-start"
                          >
                            <div className={`w-7 h-7 rounded-full ${st.avatar} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                              {st.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{st.name}</p>
                              <p className={`text-[10px] font-bold ${acc >= 80 ? 'text-emerald-600' : acc >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {acc}%
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ─── Head-to-Head Comparison ─── */}
      <AnimatePresence>
        {compareMode && selectedTeachers.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              {t('المقارنة المباشرة', 'Head-to-Head Comparison')}
            </h3>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedTeachers.map((teacher, idx) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl border-2 p-5 space-y-4"
                  style={{
                    borderColor: COMPARE_COLORS[idx],
                    background: `linear-gradient(135deg, ${COMPARE_COLORS[idx]}08, ${COMPARE_COLORS[idx]}03)`,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: COMPARE_COLORS[idx] }}
                    >
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{teacher.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {campusName(teacher.campusId)} - {t(`صف ${teacher.grade}`, `Grade ${teacher.grade}`)} ({teacher.section})
                      </p>
                    </div>
                  </div>

                  {/* Accuracy Ring */}
                  <div className="flex justify-center">
                    <div className="w-24">
                      <ProgressRing
                        value={teacher.avgAccuracy}
                        max={100}
                        size={96}
                        strokeWidth={8}
                        color={COMPARE_COLORS[idx]}
                        label={t('الدقة', 'Accuracy')}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{t('متوسط XP', 'Avg XP')}</span>
                      <span className="font-bold text-slate-700">{teacher.avgXp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{t('الطلاب', 'Students')}</span>
                      <span className="font-bold text-slate-700">{teacher.studentCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{t('التقييم', 'Rating')}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < teacher.starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Metric Comparison Bars */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-3">{t('مقارنة المقاييس', 'Metric Comparison')}</h4>

              {[
                { label: t('الدقة', 'Accuracy'), key: 'avgAccuracy' as const, max: 100, suffix: '%' },
                { label: t('متوسط XP', 'Avg XP'), key: 'avgXp' as const, max: Math.max(...selectedTeachers.map(t => t.avgXp)) * 1.1, suffix: '' },
                { label: t('عدد الطلاب', 'Students'), key: 'studentCount' as const, max: Math.max(...selectedTeachers.map(t => t.studentCount)) * 1.2, suffix: '' },
                { label: t('التقييم', 'Rating'), key: 'starRating' as const, max: 5, suffix: '/5' },
              ].map(metric => {
                const vals = selectedTeachers.map(t => t[metric.key]);
                const best = Math.max(...vals);
                return (
                  <div key={metric.key} className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-600">{metric.label}</p>
                    <div className="space-y-1">
                      {selectedTeachers.map((teacher, idx) => {
                        const val = teacher[metric.key];
                        const pct = metric.max > 0 ? (val / metric.max) * 100 : 0;
                        const isWinner = val === best;
                        return (
                          <div key={teacher.id} className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-500 w-20 truncate">{teacher.name.split(' ')[0]}</span>
                            <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden relative">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(pct, 100)}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                style={{ backgroundColor: COMPARE_COLORS[idx] }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-14 text-end">
                              {typeof val === 'number' && val > 999 ? val.toLocaleString() : val}{metric.suffix}
                            </span>
                            {isWinner && selectedTeachers.length > 1 && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-200 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

export default TeachersTab;
