import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ChevronDown,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  Star,
} from 'lucide-react';
import {
  SUBJECT_UNITS,
  type StudentProfile,
  type Subject,
} from '../../data/complexLeaderboardData';

/* ────────────────────────── Props ────────────────────────── */

interface TeacherEffectivenessTableProps {
  subject: string;
  students: StudentProfile[];
  locale?: 'ar' | 'en';
  onStudentClick?: (student: StudentProfile) => void;
}

/* ────────────────────────── Constants ────────────────────── */

const TEACHER_NAMES = [
  'أ. أحمد المحمد', 'أ. سارة العلي', 'أ. خالد يوسف', 'أ. فاطمة حسن',
  'أ. عمر الفاروق', 'أ. ليلى سمير', 'أ. ياسر القحطاني', 'أ. نورة السعد',
  'أ. محمود عباس', 'أ. رنا البيطار', 'أ. سعيد الغامدي', 'أ. هدى العمري',
];

const SUBJECT_LABELS: Record<string, { ar: string; en: string }> = {
  math: { ar: 'رياضيات', en: 'Math' },
  science: { ar: 'علوم', en: 'Science' },
  languages: { ar: 'لغات', en: 'Languages' },
  history: { ar: 'تاريخ', en: 'History' },
  arts: { ar: 'فنون', en: 'Arts' },
  islamic: { ar: 'تربية إسلامية', en: 'Islamic' },
  social: { ar: 'اجتماعيات', en: 'Social' },
  physics: { ar: 'فيزياء', en: 'Physics' },
  chemistry: { ar: 'كيمياء', en: 'Chemistry' },
  biology: { ar: 'أحياء', en: 'Biology' },
  computer: { ar: 'حاسوب', en: 'Computer' },
  english: { ar: 'إنجليزي', en: 'English' },
};

const UNIT_LABELS: Record<string, { ar: string; en: string }> = {
  arithmetic: { ar: 'حساب', en: 'Arithmetic' },
  algebra: { ar: 'جبر', en: 'Algebra' },
  geometry: { ar: 'هندسة', en: 'Geometry' },
  calculus: { ar: 'تفاضل', en: 'Calculus' },
  statistics: { ar: 'إحصاء', en: 'Statistics' },
  matter: { ar: 'مادة', en: 'Matter' },
  energy: { ar: 'طاقة', en: 'Energy' },
  forces: { ar: 'قوى', en: 'Forces' },
  ecosystems: { ar: 'أنظمة بيئية', en: 'Ecosystems' },
  grammar: { ar: 'قواعد', en: 'Grammar' },
  literature: { ar: 'أدب', en: 'Literature' },
  poetry: { ar: 'شعر', en: 'Poetry' },
  writing: { ar: 'كتابة', en: 'Writing' },
  ancient: { ar: 'قديم', en: 'Ancient' },
  islamic_history: { ar: 'تاريخ إسلامي', en: 'Islamic History' },
  modern: { ar: 'حديث', en: 'Modern' },
  geography: { ar: 'جغرافيا', en: 'Geography' },
  drawing: { ar: 'رسم', en: 'Drawing' },
  colors: { ar: 'ألوان', en: 'Colors' },
  history_of_art: { ar: 'تاريخ الفن', en: 'Art History' },
  quran: { ar: 'قرآن', en: 'Quran' },
  hadith: { ar: 'حديث', en: 'Hadith' },
  fiqh: { ar: 'فقه', en: 'Fiqh' },
  tafsir: { ar: 'تفسير', en: 'Tafsir' },
  citizenship: { ar: 'مواطنة', en: 'Citizenship' },
  economics: { ar: 'اقتصاد', en: 'Economics' },
  sociology: { ar: 'علم اجتماع', en: 'Sociology' },
  mechanics: { ar: 'ميكانيكا', en: 'Mechanics' },
  thermodynamics: { ar: 'ديناميكا حرارية', en: 'Thermodynamics' },
  optics: { ar: 'بصريات', en: 'Optics' },
  quantum: { ar: 'كم', en: 'Quantum' },
  periodic_table: { ar: 'جدول دوري', en: 'Periodic Table' },
  reactions: { ar: 'تفاعلات', en: 'Reactions' },
  organic: { ar: 'عضوية', en: 'Organic' },
  acids: { ar: 'أحماض', en: 'Acids' },
  cells: { ar: 'خلايا', en: 'Cells' },
  genetics: { ar: 'وراثة', en: 'Genetics' },
  anatomy: { ar: 'تشريح', en: 'Anatomy' },
  ecology: { ar: 'بيئة', en: 'Ecology' },
  coding: { ar: 'برمجة', en: 'Coding' },
  hardware: { ar: 'عتاد', en: 'Hardware' },
  networks: { ar: 'شبكات', en: 'Networks' },
  ai: { ar: 'ذكاء اصطناعي', en: 'AI' },
  vocabulary: { ar: 'مفردات', en: 'Vocabulary' },
  reading: { ar: 'قراءة', en: 'Reading' },
  speaking: { ar: 'محادثة', en: 'Speaking' },
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
  'from-red-500 to-orange-500',
  'from-teal-500 to-emerald-500',
  'from-amber-500 to-yellow-500',
];

const MEDAL = ['🥇', '🥈', '🥉'];

/* ────────────────────────── Types ────────────────────────── */

interface TeacherRecord {
  id: string;
  name: string;
  campus: string;
  grades: number[];
  students: StudentProfile[];
  studentCount: number;
  avgAccuracy: number;
  avgXp: number;
  bestUnit: string;
  worstUnit: string;
  trend: 'up' | 'down' | 'stable';
  performanceVsCampusAvg: number;
  gradientIdx: number;
}

type SortKey = 'name' | 'campus' | 'grades' | 'avgAccuracy' | 'avgXp' | 'bestUnit' | 'worstUnit' | 'studentCount' | 'performanceVsCampusAvg';

/* ────────────────────────── Helpers ────────────────────────── */

function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 4;
  if (accuracy >= 70) return 3;
  if (accuracy >= 60) return 2;
  return 1;
}

function accuracyColor(acc: number): string {
  if (acc >= 85) return 'bg-emerald-500';
  if (acc >= 70) return 'bg-blue-500';
  if (acc >= 55) return 'bg-amber-500';
  return 'bg-red-500';
}

function buildTeachers(students: StudentProfile[], subject: string): TeacherRecord[] {
  const subj = subject as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[subj] ?? [];

  // Group students by numeric grade
  const byGrade: Record<number, StudentProfile[]> = {};
  for (const s of students) {
    const g = typeof s.grade === 'number' ? s.grade : 0;
    if (g < 1 || g > 12) continue;
    if (!byGrade[g]) byGrade[g] = [];
    byGrade[g].push(s);
  }

  // Assign teachers – one per grade, they teach 1-2 grades
  const gradeNums = Object.keys(byGrade).map(Number).sort((a, b) => a - b);
  const teachers: TeacherRecord[] = [];
  let teacherIdx = 0;

  for (let i = 0; i < gradeNums.length; i++) {
    const primaryGrade = gradeNums[i];
    const secondaryGrade = (i + 1 < gradeNums.length && Math.random() > 0.5) ? gradeNums[i + 1] : null;
    const grades = secondaryGrade ? [primaryGrade, secondaryGrade] : [primaryGrade];
    const teacherStudents = grades.flatMap(g => byGrade[g] ?? []);
    if (teacherStudents.length === 0) continue;

    const campus = primaryGrade <= 6 ? (teacherIdx % 2 === 0 ? 'camp-1' : 'camp-2') : 'camp-3';

    // Avg accuracy & XP
    const accs = teacherStudents.map(s => s.subjectDetails[subj]?.accuracy ?? 0);
    const xps = teacherStudents.map(s => s.subjectXp[subj] ?? 0);
    const avgAcc = accs.reduce((a, b) => a + b, 0) / accs.length;
    const avgXp = xps.reduce((a, b) => a + b, 0) / xps.length;

    // Best / worst unit
    let bestUnit = units[0] ?? '';
    let worstUnit = units[0] ?? '';
    let bestAvg = -1;
    let worstAvg = 101;
    for (const unit of units) {
      const key = `${subj}-${unit}`;
      const unitAccs = teacherStudents
        .map(s => s.lessonDetails[key]?.accuracy ?? null)
        .filter((v): v is number => v !== null);
      if (unitAccs.length === 0) continue;
      const avg = unitAccs.reduce((a, b) => a + b, 0) / unitAccs.length;
      if (avg > bestAvg) { bestAvg = avg; bestUnit = unit; }
      if (avg < worstAvg) { worstAvg = avg; worstUnit = unit; }
    }

    // Trend (mock)
    const r = Math.random();
    const trend: 'up' | 'down' | 'stable' = r > 0.6 ? 'up' : r > 0.3 ? 'stable' : 'down';

    teachers.push({
      id: `teacher-${teacherIdx}`,
      name: TEACHER_NAMES[teacherIdx % TEACHER_NAMES.length],
      campus,
      grades,
      students: teacherStudents,
      studentCount: teacherStudents.length,
      avgAccuracy: Math.round(avgAcc * 10) / 10,
      avgXp: Math.round(avgXp),
      bestUnit,
      worstUnit,
      trend,
      performanceVsCampusAvg: 0, // computed below
      gradientIdx: teacherIdx % AVATAR_GRADIENTS.length,
    });
    teacherIdx++;
  }

  // Compute campus averages then delta
  const campusAvgs: Record<string, number> = {};
  const campusCounts: Record<string, { sum: number; n: number }> = {};
  for (const t of teachers) {
    if (!campusCounts[t.campus]) campusCounts[t.campus] = { sum: 0, n: 0 };
    campusCounts[t.campus].sum += t.avgAccuracy;
    campusCounts[t.campus].n += 1;
  }
  for (const c of Object.keys(campusCounts)) {
    campusAvgs[c] = campusCounts[c].sum / campusCounts[c].n;
  }
  for (const t of teachers) {
    t.performanceVsCampusAvg = Math.round((t.avgAccuracy - (campusAvgs[t.campus] ?? 0)) * 10) / 10;
  }

  return teachers;
}

/* ────────────────────────── Component ────────────────────────── */

export function TeacherEffectivenessTable({
  subject,
  students,
  locale = 'ar',
  onStudentClick,
}: TeacherEffectivenessTableProps) {
  const isAr = locale === 'ar';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('avgAccuracy');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const subj = subject as Exclude<Subject, 'all'>;

  const teachers = useMemo(() => buildTeachers(students, subject), [students, subject]);

  const filtered = useMemo(() => {
    let list = teachers;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case 'name': va = a.name; vb = b.name; break;
        case 'campus': va = a.campus; vb = b.campus; break;
        case 'grades': va = a.grades[0]; vb = b.grades[0]; break;
        case 'avgAccuracy': va = a.avgAccuracy; vb = b.avgAccuracy; break;
        case 'avgXp': va = a.avgXp; vb = b.avgXp; break;
        case 'bestUnit': va = a.bestUnit; vb = b.bestUnit; break;
        case 'worstUnit': va = a.worstUnit; vb = b.worstUnit; break;
        case 'studentCount': va = a.studentCount; vb = b.studentCount; break;
        case 'performanceVsCampusAvg': va = a.performanceVsCampusAvg; vb = b.performanceVsCampusAvg; break;
      }
      if (typeof va === 'string') {
        const cmp = va.localeCompare(vb as string, 'ar');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return list;
  }, [teachers, searchQuery, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Performance tier boundaries
  const tierSize = Math.ceil(filtered.length / 3);

  const subjectLabel = SUBJECT_LABELS[subject]?.[isAr ? 'ar' : 'en'] ?? subject;

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: isAr ? 'المعلم' : 'Teacher' },
    { key: 'campus', label: isAr ? 'الحرم' : 'Campus' },
    { key: 'grades', label: isAr ? 'الصفوف' : 'Grades' },
    { key: 'avgAccuracy', label: isAr ? 'متوسط الدقة' : 'Avg Accuracy' },
    { key: 'avgXp', label: isAr ? 'متوسط XP' : 'Avg XP' },
    { key: 'bestUnit', label: isAr ? 'أفضل وحدة' : 'Best Unit' },
    { key: 'worstUnit', label: isAr ? 'أضعف وحدة' : 'Worst Unit' },
    { key: 'studentCount', label: isAr ? 'الطلاب' : 'Students' },
    { key: 'performanceVsCampusAvg', label: isAr ? 'مقابل المعدل' : 'vs Campus' },
  ];

  return (
    <div
      className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden"
      style={{ fontFamily: "'Cairo', sans-serif" }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">
              {isAr ? 'فعالية المعلمين' : 'Teacher Effectiveness'}
            </h3>
            <span className="text-xs text-slate-400">
              {subjectLabel} · {teachers.length} {isAr ? 'معلم' : 'teachers'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
            style={isAr ? { right: 10 } : { left: 10 }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث...' : 'Search...'}
            className="h-8 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/20 w-40"
            style={isAr ? { paddingRight: 30, paddingLeft: 10 } : { paddingLeft: 30, paddingRight: 10 }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2.5 text-slate-600 font-semibold whitespace-nowrap cursor-pointer hover:text-slate-800 transition-colors select-none"
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <ArrowUpDown className="w-3 h-3 text-violet-500" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((teacher, idx) => {
                const isExpanded = expandedId === teacher.id;
                const tierBg = idx < tierSize
                  ? 'bg-emerald-500/[0.04]'
                  : idx >= filtered.length - tierSize
                    ? 'bg-rose-500/[0.04]'
                    : '';

                return (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.03, type: 'spring', stiffness: 300, damping: 30 }}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${tierBg}`}
                    onClick={() => setExpandedId(isExpanded ? null : teacher.id)}
                    style={{ display: 'table-row' }}
                  >
                    {/* Name */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {/* Rank badge */}
                        {idx < 3 && <span className="text-sm">{MEDAL[idx]}</span>}
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[teacher.gradientIdx]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                          {teacher.name.charAt(teacher.name.indexOf(' ') + 1) || teacher.name[0]}
                        </div>
                        <div>
                          <span className="text-slate-900 font-semibold">{teacher.name}</span>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <Star
                                key={si}
                                className={`w-2.5 h-2.5 ${si < getStarRating(teacher.avgAccuracy) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </td>
                    {/* Campus */}
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium">
                        {teacher.campus}
                      </span>
                    </td>
                    {/* Grades */}
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {teacher.grades.map(g => (
                        <span key={g} className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium mr-1">{g}</span>
                      ))}
                    </td>
                    {/* Avg Accuracy + mini bar */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${accuracyColor(teacher.avgAccuracy)}`}
                            style={{ width: `${teacher.avgAccuracy}%` }}
                          />
                        </div>
                        <span className="text-slate-700 font-semibold tabular-nums">{teacher.avgAccuracy}%</span>
                      </div>
                    </td>
                    {/* Avg XP */}
                    <td className="px-3 py-2.5 text-slate-600 font-medium tabular-nums whitespace-nowrap">
                      {teacher.avgXp.toLocaleString()}
                    </td>
                    {/* Best Unit */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                        {UNIT_LABELS[teacher.bestUnit]?.[isAr ? 'ar' : 'en'] ?? teacher.bestUnit}
                      </span>
                    </td>
                    {/* Worst Unit */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-medium">
                        {UNIT_LABELS[teacher.worstUnit]?.[isAr ? 'ar' : 'en'] ?? teacher.worstUnit}
                      </span>
                    </td>
                    {/* Students */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{teacher.studentCount}</span>
                      </div>
                    </td>
                    {/* vs Campus Avg */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {teacher.performanceVsCampusAvg > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          <TrendingUp className="w-3 h-3" />+{teacher.performanceVsCampusAvg}%
                        </span>
                      ) : teacher.performanceVsCampusAvg < 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                          <TrendingDown className="w-3 h-3" />{teacher.performanceVsCampusAvg}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold">
                          <Minus className="w-3 h-3" />0%
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Expanded Row Panel ── */}
      <AnimatePresence>
        {expandedId && (() => {
          const teacher = filtered.find(t => t.id === expandedId);
          if (!teacher) return null;

          const campusTeachers = teachers.filter(t => t.campus === teacher.campus);
          const campusAvg = campusTeachers.length
            ? Math.round(campusTeachers.reduce((s, t) => s + t.avgAccuracy, 0) / campusTeachers.length * 10) / 10
            : 0;
          const delta = Math.round((teacher.avgAccuracy - campusAvg) * 10) / 10;

          // Student accuracy brackets
          const brackets = { s90: 0, s80: 0, s70: 0, sBelow: 0 };
          for (const s of teacher.students) {
            const acc = s.subjectDetails[subj]?.accuracy ?? 0;
            if (acc >= 90) brackets.s90++;
            else if (acc >= 80) brackets.s80++;
            else if (acc >= 70) brackets.s70++;
            else brackets.sBelow++;
          }
          const maxBracket = Math.max(brackets.s90, brackets.s80, brackets.s70, brackets.sBelow, 1);

          // Per-grade breakdown
          const gradeData = teacher.grades.map(g => {
            const gradeStudents = teacher.students.filter(s => s.grade === g);
            const accs = gradeStudents.map(s => s.subjectDetails[subj]?.accuracy ?? 0);
            const xps = gradeStudents.map(s => s.subjectXp[subj] ?? 0);
            return {
              grade: g,
              accuracy: accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length * 10) / 10 : 0,
              xp: xps.length ? Math.round(xps.reduce((a, b) => a + b, 0) / xps.length) : 0,
              count: gradeStudents.length,
            };
          });

          return (
            <motion.div
              key={`expand-${expandedId}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="overflow-hidden border-b border-slate-200"
            >
              <div className="grid grid-cols-3 gap-5 px-5 py-4 bg-slate-50">
                {/* Col 1: Per-Grade Breakdown */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {isAr ? 'تفصيل حسب الصف' : 'Per-Grade Breakdown'}
                  </h4>
                  <div className="space-y-2.5">
                    {gradeData.map(gd => (
                      <div key={gd.grade} className="flex items-center gap-3">
                        <span className="w-8 h-6 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {isAr ? `ص${gd.grade}` : `G${gd.grade}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${gd.accuracy}%` }}
                              transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
                              className={`h-full rounded-full ${accuracyColor(gd.accuracy)}`}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 font-semibold tabular-nums w-10 text-center">{gd.accuracy}%</span>
                        <span className="text-[10px] text-slate-400 tabular-nums w-14 text-center">{gd.xp.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 2: Campus Comparison */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {isAr ? 'مقارنة بمعدل الحرم' : 'vs Campus Average'}
                  </h4>
                  <div className="space-y-3">
                    {/* Teacher bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">{isAr ? 'المعلم' : 'Teacher'}</span>
                        <span className="text-[10px] text-blue-500 font-bold tabular-nums">{teacher.avgAccuracy}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${teacher.avgAccuracy}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
                          className="h-full rounded-full bg-blue-500"
                        />
                      </div>
                    </div>
                    {/* Campus bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">{isAr ? 'معدل الحرم' : 'Campus Avg'}</span>
                        <span className="text-[10px] text-slate-400 font-bold tabular-nums">{campusAvg}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${campusAvg}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
                          className="h-full rounded-full bg-slate-400"
                        />
                      </div>
                    </div>
                    {/* Delta badge */}
                    <div className="pt-1">
                      {delta > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{delta}% {isAr ? 'أفضل من المعدل' : 'above average'}
                        </span>
                      ) : delta < 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[11px] font-bold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {delta}% {isAr ? 'أقل من المعدل' : 'below average'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold">
                          <Minus className="w-3.5 h-3.5" />
                          {isAr ? 'يساوي المعدل' : 'At average'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Col 3: Student Distribution */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {isAr ? 'توزيع الطلاب' : 'Student Distribution'}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: '90-100%', count: brackets.s90, color: 'bg-emerald-500', pill: 'bg-emerald-500/15 text-emerald-400' },
                      { label: '80-90%', count: brackets.s80, color: 'bg-blue-500', pill: 'bg-blue-500/15 text-blue-400' },
                      { label: '70-80%', count: brackets.s70, color: 'bg-amber-500', pill: 'bg-amber-500/15 text-amber-400' },
                      { label: '<70%', count: brackets.sBelow, color: 'bg-red-500', pill: 'bg-red-500/15 text-red-400' },
                    ].map(b => (
                      <div key={b.label} className="flex items-center gap-2.5">
                        <span className="text-[10px] text-slate-400 w-12 shrink-0 tabular-nums">{b.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(b.count / maxBracket) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
                            className={`h-full rounded-full ${b.color}`}
                          />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.pill} tabular-nums`}>
                          {b.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export default TeacherEffectivenessTable;
