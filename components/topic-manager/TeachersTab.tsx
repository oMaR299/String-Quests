import { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, Users, Star, Trophy,
  ArrowUpDown, Crown, Building2, GraduationCap, Award,
  TrendingUp, TrendingDown, Minus, Eye, ChevronRight,
  Heart, Activity, Flame, BookOpen, Sparkles, Lightbulb,
  AlertTriangle, CheckCircle2, XCircle, BarChart3,
  Swords, Shield, Zap, Target, CalendarHeart, UserCheck,
  ArrowRight, MessageCircle, Clock,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  SUBJECT_UNITS,
  type StudentProfile,
  type Subject,
  type ClassSection,
  type GradeLevel,
} from '../../data/complexLeaderboardData';
import { ProgressRing, Sparkline, HorizontalBarChart } from '../admin-hub/attendance/SvgCharts';
import AccuracyVsXpScatter from '../leaderboard-widgets/AccuracyVsXpScatter';
import { StudentProfileModal } from '../StudentProfileModal';

/* ═══════════════════════════════════════════════════════════════
   Constants & Types
   ═══════════════════════════════════════════════════════════════ */

interface TeachersTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)', short: 'النور', shortEn: 'Noor' },
  { id: 'camp-2', name: 'مبنى الزهراء (بنات)', nameEn: 'Al-Zahra (Girls)', short: 'الزهراء', shortEn: 'Zahra' },
  { id: 'camp-3', name: 'المبنى الدولي', nameEn: 'International', short: 'دولي', shortEn: 'Intl' },
];

const TEACHER_NAMES = [
  'أحمد المنصور', 'محمد الخالدي', 'يوسف العمري', 'عمر القحطاني', 'خالد الشمري', 'إبراهيم العتيبي',
  'سعيد الزهراني', 'حسن الغامدي', 'فهد الدوسري', 'ماجد المطيري', 'عبدالله الشهري', 'سلطان الحربي',
  'فيصل العنزي', 'بندر السالم', 'ناصر الرشيدي', 'تركي المالكي', 'عادل الجهني', 'سامي البلوي',
  'سارة المنصور', 'ليلى الخالدي', 'نورة العمري', 'فاطمة القحطاني', 'مريم الشمري', 'زينب العتيبي',
  'هند الزهراني', 'سلمى الغامدي', 'آية الدوسري', 'جود المطيري', 'ريم الشهري', 'دانة الحربي',
  'لمى العنزي', 'غادة السالم', 'منى الرشيدي', 'هيا المالكي', 'عبير الجهني', 'نوف البلوي',
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string; ring: string }> = {
  math: { bg: 'bg-blue-50', text: 'text-blue-700', accent: '#3b82f6', ring: 'ring-blue-200' },
  science: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: '#10b981', ring: 'ring-emerald-200' },
  languages: { bg: 'bg-amber-50', text: 'text-amber-700', accent: '#f59e0b', ring: 'ring-amber-200' },
  history: { bg: 'bg-orange-50', text: 'text-orange-700', accent: '#f97316', ring: 'ring-orange-200' },
  arts: { bg: 'bg-pink-50', text: 'text-pink-700', accent: '#ec4899', ring: 'ring-pink-200' },
  islamic: { bg: 'bg-teal-50', text: 'text-teal-700', accent: '#14b8a6', ring: 'ring-teal-200' },
  social: { bg: 'bg-indigo-50', text: 'text-indigo-700', accent: '#6366f1', ring: 'ring-indigo-200' },
  physics: { bg: 'bg-cyan-50', text: 'text-cyan-700', accent: '#06b6d4', ring: 'ring-cyan-200' },
  chemistry: { bg: 'bg-violet-50', text: 'text-violet-700', accent: '#8b5cf6', ring: 'ring-violet-200' },
  biology: { bg: 'bg-lime-50', text: 'text-lime-700', accent: '#84cc16', ring: 'ring-lime-200' },
  computer: { bg: 'bg-sky-50', text: 'text-sky-700', accent: '#0ea5e9', ring: 'ring-sky-200' },
  english: { bg: 'bg-rose-50', text: 'text-rose-700', accent: '#f43f5e', ring: 'ring-rose-200' },
};

interface TeacherData {
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
  };
}

type SortKey = 'name' | 'campus' | 'grade' | 'students' | 'accuracy' | 'xp' | 'stars' | 'trend';

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

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

function getAccuracyColor(v: number): string {
  if (v >= 85) return '#10b981';
  if (v >= 70) return '#0ea5e9';
  if (v >= 55) return '#f59e0b';
  return '#f43f5e';
}

function getAccuracyBg(v: number): string {
  if (v >= 85) return 'bg-emerald-100 text-emerald-700';
  if (v >= 70) return 'bg-sky-100 text-sky-700';
  if (v >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

function signalDot(signal: 'green' | 'amber' | 'red'): string {
  if (signal === 'green') return 'bg-emerald-400';
  if (signal === 'amber') return 'bg-amber-400';
  return 'bg-rose-400';
}

const campusName = (id: string, locale: 'ar' | 'en') => {
  const c = CAMPUSES.find(c => c.id === id);
  return locale === 'ar' ? c?.short ?? id : c?.shortEn ?? id;
};

const campusFullName = (id: string, locale: 'ar' | 'en') => {
  const c = CAMPUSES.find(c => c.id === id);
  return locale === 'ar' ? c?.name ?? id : c?.nameEn ?? id;
};

/* ═══════════════════════════════════════════════════════════════
   Translation Helper
   ═══════════════════════════════════════════════════════════════ */

const translations: Record<string, { ar: string; en: string }> = {
  teachersDashboard: { ar: 'لوحة المعلمين', en: 'Teachers Dashboard' },
  teachersDashboardSub: { ar: 'نظرة شاملة على أداء المعلمين وتأثيرهم', en: 'Comprehensive overview of teacher performance & impact' },
  totalTeachers: { ar: 'إجمالي المعلمين', en: 'Total Teachers' },
  avgAccuracy: { ar: 'متوسط دقة الطلاب', en: 'Avg Student Accuracy' },
  improving: { ar: 'معلمون يتحسنون', en: 'Teachers Improving' },
  unitsNeedSupport: { ar: 'وحدات تحتاج دعم', en: 'Units Needing Support' },
  teacherRanking: { ar: 'ترتيب المعلمين', en: 'Teacher Ranking' },
  teacherRankingSub: { ar: 'مقارنة أداء المعلمين عبر الحرم الجامعي', en: 'Compare teacher performance across campuses' },
  searchTeacher: { ar: 'ابحث عن معلم...', en: 'Search teacher...' },
  allCampuses: { ar: 'كل المباني', en: 'All Campuses' },
  allGrades: { ar: 'كل الصفوف', en: 'All Grades' },
  grade: { ar: 'صف', en: 'Grade' },
  section: { ar: 'شعبة', en: 'Section' },
  students: { ar: 'طلاب', en: 'Students' },
  accuracy: { ar: 'الدقة', en: 'Accuracy' },
  xp: { ar: 'XP', en: 'XP' },
  stars: { ar: 'النجوم', en: 'Stars' },
  health: { ar: 'الصحة', en: 'Health' },
  trendLabel: { ar: 'الاتجاه', en: 'Trend' },
  units: { ar: 'الوحدات', en: 'Units' },
  campus: { ar: 'المبنى', en: 'Campus' },
  name: { ar: 'الاسم', en: 'Name' },
  matchupArena: { ar: 'ساحة المقارنة', en: 'Teacher Matchup Arena' },
  matchupArenaSub: { ar: 'قارن بين معلمين وجهاً لوجه', en: 'Compare two teachers head-to-head' },
  selectTeacher: { ar: 'اختر معلماً', en: 'Select a teacher' },
  vs: { ar: 'ضد', en: 'VS' },
  winner: { ar: 'الفائز', en: 'Winner' },
  engagementHours: { ar: 'ساعات التفاعل', en: 'Engagement Hours' },
  growthRate: { ar: 'معدل النمو', en: 'Growth Rate' },
  growthTrajectory: { ar: 'مسار النمو', en: 'Growth Trajectory' },
  growthTrajectorySub: { ar: 'تتبع تطور الدقة على مدار 8 أسابيع', en: 'Track accuracy evolution over 8 weeks' },
  week: { ar: 'أسبوع', en: 'Week' },
  unitMastery: { ar: 'خريطة إتقان الوحدات', en: 'Unit Mastery Heatmap' },
  unitMasterySub: { ar: 'نقاط القوة والضعف لكل معلم في كل وحدة', en: 'Teacher strengths & weaknesses by unit' },
  healthDashboard: { ar: 'لوحة الصحة', en: 'Teacher Health Dashboard' },
  healthDashboardSub: { ar: 'مراقبة الحالة العامة لكل معلم', en: 'Monitor overall health signals per teacher' },
  academic: { ar: 'أكاديمي', en: 'Academic' },
  engagement: { ar: 'التفاعل', en: 'Engagement' },
  retention: { ar: 'الاحتفاظ', en: 'Retention' },
  needsSupport: { ar: 'يحتاج دعم', en: 'Needs Support' },
  healthy: { ar: 'صحي', en: 'Healthy' },
  engagementImpact: { ar: 'التفاعل مقابل التأثير', en: 'Engagement vs Impact' },
  engagementImpactSub: { ar: 'اكتشف أنماط المعلمين: فعّال، متفاعل، أو يحتاج متابعة', en: 'Discover teacher patterns: effective, engaged, or needs follow-up' },
  spotlight: { ar: 'الأضواء والتعلم بين الأقران', en: 'Spotlight & Peer Learning' },
  spotlightSub: { ar: 'تكريم المتميزين واقتراحات التعاون', en: 'Celebrate top performers & collaboration suggestions' },
  teacherOfMonth: { ar: 'معلم الشهر', en: 'Teacher of the Month' },
  topImprover: { ar: 'أكبر تحسن', en: 'Top Improver' },
  peerLearning: { ar: 'اقتراحات التعلم بين الأقران', en: 'Peer Learning Suggestions' },
  helps: { ar: 'يساعد', en: 'helps' },
  inUnit: { ar: 'في', en: 'in' },
  scheduleMeeting: { ar: 'جدولة اجتماع', en: 'Schedule Meeting' },
  reason1: { ar: 'أعلى نسبة دقة هذا الشهر', en: 'Highest accuracy this month' },
  reason2: { ar: 'أكبر تحسن في الأسابيع الأخيرة', en: 'Biggest improvement in recent weeks' },
  unitBreakdown: { ar: 'تفصيل الوحدات', en: 'Unit Breakdown' },
  studentDist: { ar: 'توزيع دقة الطلاب', en: 'Student Accuracy Distribution' },
  campusComparison: { ar: 'مقارنة بالمبنى', en: 'Campus Comparison' },
  below70: { ar: 'أقل من 70%', en: 'Below 70%' },
  meetingScheduled: { ar: 'تم جدولة الاجتماع بنجاح!', en: 'Meeting scheduled successfully!' },
  recommendation: { ar: 'توصية', en: 'Recommendation' },
};

/* ═══════════════════════════════════════════════════════════════
   Teacher Data Generation (memoized)
   ═══════════════════════════════════════════════════════════════ */

function generateTeachers(subjectKey: string): TeacherData[] {
  const sub = (subjectKey === 'all' ? 'math' : subjectKey) as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;
  const teachers: TeacherData[] = [];
  let nameIdx = 0;

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const sections: ClassSection[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Check which grades should include this subject
  const isAdvancedScience = ['physics', 'chemistry', 'biology'].includes(sub);
  const isGeneralScience = sub === 'science';

  for (const g of grades) {
    const isHighSchool = g >= 10;
    if (isHighSchool && isGeneralScience) continue;
    if (!isHighSchool && isAdvancedScience) continue;

    for (const s of sections) {
      const campusId = g <= 6 ? (s <= 'C' ? 'camp-1' : 'camp-2') : 'camp-3';
      const students = MOCK_SCHOOL_DATA.filter(
        st => st.grade === g && st.section === s
      );
      if (students.length === 0) continue;

      const teacher = TEACHER_NAMES[nameIdx % TEACHER_NAMES.length];
      nameIdx++;

      // Compute accuracy from student subject details
      const accuracies = students.map(st => st.subjectDetails[sub]?.accuracy ?? 0).filter(a => a > 0);
      const avgAcc = accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0;
      const avgXp = Math.round(students.reduce((s, st) => s + (st.subjectXp[sub] ?? 0), 0) / students.length);

      // Unit accuracies
      const unitAccuracies = units.map(unit => {
        const key = `${sub}-${unit}`;
        const accs = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
        return {
          unit,
          accuracy: accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0,
        };
      });

      const sortedUnits = [...unitAccuracies].sort((a, b) => b.accuracy - a.accuracy);
      const bestUnit = sortedUnits[0]?.unit ?? units[0];
      const worstUnit = sortedUnits[sortedUnits.length - 1]?.unit ?? units[units.length - 1];

      // Star rating based on accuracy
      const starRating = avgAcc >= 90 ? 5 : avgAcc >= 82 ? 4 : avgAcc >= 74 ? 3 : avgAcc >= 66 ? 2 : 1;

      // Weekly trend (8 weeks) - seeded from teacher index for stability
      const seed = g * 100 + s.charCodeAt(0);
      const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
        const base = avgAcc - 10 + i * 1.5;
        return Math.round(Math.max(40, Math.min(99, base + (seededRandom(seed + i * 13) * 12 - 6))));
      });

      const trendSlope = weeklyTrend[7] - weeklyTrend[0];
      const trend: 'up' | 'down' | 'stable' = trendSlope > 3 ? 'up' : trendSlope < -3 ? 'down' : 'stable';

      const engagementHours = Math.round((0.5 + seededRandom(seed + 999) * 4.5) * 10) / 10;

      // Health signals
      const academic: 'green' | 'amber' | 'red' = avgAcc >= 80 ? 'green' : avgAcc >= 65 ? 'amber' : 'red';
      const engSignal: 'green' | 'amber' | 'red' = engagementHours >= 3 ? 'green' : engagementHours >= 1.5 ? 'amber' : 'red';
      const trendSignal: 'green' | 'amber' | 'red' = trend === 'up' ? 'green' : trend === 'stable' ? 'amber' : 'red';
      const avgStreak = students.reduce((s, st) => s + (st.weeklyActivity?.reduce((a, b) => a + b, 0) ?? 0), 0) / students.length;
      const retentionSignal: 'green' | 'amber' | 'red' = avgStreak > 350 ? 'green' : avgStreak > 200 ? 'amber' : 'red';

      teachers.push({
        id: `teacher-${g}-${s}`,
        name: teacher,
        campusId,
        grade: g,
        section: s,
        students,
        studentCount: students.length,
        avgAccuracy: avgAcc,
        avgXp,
        bestUnit,
        worstUnit,
        starRating,
        campusDelta: 0, // computed below
        trend,
        engagementHours,
        unitAccuracies,
        weeklyTrend,
        healthSignals: { academic, engagement: engSignal, trend: trendSignal, retention: retentionSignal },
      });
    }
  }

  // Compute campus deltas
  const campusAvgs: Record<string, number> = {};
  for (const c of CAMPUSES) {
    const ct = teachers.filter(t => t.campusId === c.id);
    campusAvgs[c.id] = ct.length > 0 ? Math.round(ct.reduce((s, t) => s + t.avgAccuracy, 0) / ct.length) : 0;
  }
  for (const t of teachers) {
    t.campusDelta = t.avgAccuracy - (campusAvgs[t.campusId] ?? 0);
  }

  return teachers;
}

/* ═══════════════════════════════════════════════════════════════
   Motion Variants
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, type: 'spring', stiffness: 120 } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: 'spring', stiffness: 150 } },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

function TeacherAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 65%, 45%))`,
      }}
    >
      {initials}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, locale }: { icon: any; title: string; subtitle: string; locale: 'ar' | 'en' }) {
  return (
    <div className="flex items-start gap-3 mb-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800 font-['Cairo']">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5 font-['Cairo']">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniSparkline({ data, color = '#10b981', width = 64, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    2 + (1 - (v - min) / range) * (height - 4),
  ]);
  const path = smoothSvgPath(pts);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl font-['Cairo'] flex items-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5" />
      {message}
      <button onClick={onClose} className="ml-2 hover:bg-emerald-700 rounded-full p-1 transition">
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function TeachersTab({ subject, locale }: TeachersTabProps) {
  const uid = useId();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useCallback((key: string) => translations[key]?.[locale] ?? key, [locale]);
  const subjectColor = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.math;
  const sub = (subject === 'all' ? 'math' : subject) as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;

  // Data
  const teachers = useMemo(() => generateTeachers(subject), [subject]);

  // State
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('accuracy');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [matchA, setMatchA] = useState('');
  const [matchB, setMatchB] = useState('');
  const [heatmapGrade, setHeatmapGrade] = useState<number | null>(null);
  const [growthSelection, setGrowthSelection] = useState<Set<string>>(new Set());
  const [growthHover, setGrowthHover] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Initialize heatmap grade
  const availableGrades = useMemo(() => [...new Set(teachers.map(t => t.grade))].sort((a, b) => Number(a) - Number(b)), [teachers]);
  const activeHeatmapGrade = heatmapGrade ?? availableGrades[0] ?? 1;

  // Initialize growth chart with top 3 + bottom 1
  const sortedByAccuracy = useMemo(() => [...teachers].sort((a, b) => b.avgAccuracy - a.avgAccuracy), [teachers]);
  const initialGrowth = useMemo(() => {
    const ids = new Set<string>();
    sortedByAccuracy.slice(0, 3).forEach(t => ids.add(t.id));
    if (sortedByAccuracy.length > 3) ids.add(sortedByAccuracy[sortedByAccuracy.length - 1].id);
    return ids;
  }, [sortedByAccuracy]);
  const activeGrowthIds = growthSelection.size > 0 ? growthSelection : initialGrowth;

  // Filtered & sorted teachers
  const filteredTeachers = useMemo(() => {
    let list = [...teachers];
    if (search) list = list.filter(t => t.name.includes(search));
    if (campusFilter !== 'all') list = list.filter(t => t.campusId === campusFilter);
    if (gradeFilter !== 'all') list = list.filter(t => t.grade === gradeFilter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ar'); break;
        case 'campus': cmp = a.campusId.localeCompare(b.campusId); break;
        case 'grade': cmp = a.grade - b.grade; break;
        case 'students': cmp = a.studentCount - b.studentCount; break;
        case 'accuracy': cmp = a.avgAccuracy - b.avgAccuracy; break;
        case 'xp': cmp = a.avgXp - b.avgXp; break;
        case 'stars': cmp = a.starRating - b.starRating; break;
        case 'trend': cmp = (a.weeklyTrend[7] - a.weeklyTrend[0]) - (b.weeklyTrend[7] - b.weeklyTrend[0]); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [teachers, search, campusFilter, gradeFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Quick stats
  const totalTeachers = teachers.length;
  const globalAvgAccuracy = Math.round(teachers.reduce((s, t) => s + t.avgAccuracy, 0) / (totalTeachers || 1));
  const teachersImproving = teachers.filter(t => t.trend === 'up').length;
  const unitsNeedSupport = teachers.reduce((s, t) => s + t.unitAccuracies.filter(u => u.accuracy < 70 && u.accuracy > 0).length, 0);

  // Matchup
  const teacherA = teachers.find(t => t.id === matchA);
  const teacherB = teachers.find(t => t.id === matchB);

  // Teacher of Month / Top Improver
  const teacherOfMonth = sortedByAccuracy[0];
  const topImprover = useMemo(() => {
    return [...teachers].sort((a, b) => {
      const aGrowth = a.weeklyTrend[7] - a.weeklyTrend[0];
      const bGrowth = b.weeklyTrend[7] - b.weeklyTrend[0];
      return bGrowth - aGrowth;
    })[0];
  }, [teachers]);

  // Peer suggestions
  const peerSuggestions = useMemo(() => {
    const suggestions: { high: TeacherData; low: TeacherData; unit: string }[] = [];
    for (const unit of units) {
      const withUnit = teachers.filter(t => t.unitAccuracies.find(u => u.unit === unit && u.accuracy > 0));
      if (withUnit.length < 2) continue;
      const sorted = [...withUnit].sort((a, b) => {
        const aAcc = a.unitAccuracies.find(u => u.unit === unit)?.accuracy ?? 0;
        const bAcc = b.unitAccuracies.find(u => u.unit === unit)?.accuracy ?? 0;
        return bAcc - aAcc;
      });
      const high = sorted[0];
      const low = sorted[sorted.length - 1];
      const highAcc = high.unitAccuracies.find(u => u.unit === unit)?.accuracy ?? 0;
      const lowAcc = low.unitAccuracies.find(u => u.unit === unit)?.accuracy ?? 0;
      if (highAcc - lowAcc >= 15 && high.id !== low.id) {
        suggestions.push({ high, low, unit });
      }
    }
    return suggestions.slice(0, 3);
  }, [teachers, units]);

  // Scatter data for section 7
  const scatterData = useMemo(() => {
    return teachers.map(t => ({
      id: t.id,
      name: t.name,
      xp: Math.round(t.engagementHours * 100),
      accuracy: t.avgAccuracy,
      league: t.avgAccuracy > 85 ? 'diamond' : t.avgAccuracy > 80 ? 'platinum' : t.avgAccuracy > 75 ? 'gold' : t.avgAccuracy > 70 ? 'silver' : 'bronze',
      grade: t.grade,
      section: t.section,
    }));
  }, [teachers]);

  // Growth chart data
  const growthTeachers = useMemo(() => teachers.filter(t => activeGrowthIds.has(t.id)), [teachers, activeGrowthIds]);
  const GROWTH_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#ec4899'];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-10 font-['Cairo']" dir={dir}>

      {/* ─── SECTION 1: Quick Stats ─── */}
      <motion.section variants={staggerContainer} initial="hidden" animate="visible">
        <SectionHeader icon={BarChart3} title={t('teachersDashboard')} subtitle={t('teachersDashboardSub')} locale={locale} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: t('totalTeachers'),
              value: totalTeachers,
              icon: Users,
              color: '#8b5cf6',
              ring: true,
            },
            {
              label: t('avgAccuracy'),
              value: `${globalAvgAccuracy}%`,
              icon: Target,
              color: getAccuracyColor(globalAvgAccuracy),
              sparkline: teachers.slice(0, 10).map(t => t.avgAccuracy),
              trend: globalAvgAccuracy >= 75 ? 'up' : 'down',
            },
            {
              label: t('improving'),
              value: teachersImproving,
              icon: TrendingUp,
              color: '#10b981',
              badge: { text: `${Math.round(teachersImproving / (totalTeachers || 1) * 100)}%`, bg: 'bg-emerald-100 text-emerald-700' },
            },
            {
              label: t('unitsNeedSupport'),
              value: unitsNeedSupport,
              icon: AlertTriangle,
              color: '#f43f5e',
              badge: { text: t('below70'), bg: 'bg-rose-100 text-rose-700' },
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="relative bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-shadow duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.04]" style={{ background: stat.color, transform: 'translate(30%, -30%)' }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                </div>
                {stat.ring ? (
                  <div className="w-12 h-12">
                    <ProgressRing value={totalTeachers} max={72} size={48} strokeWidth={5} color={stat.color} />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                )}
              </div>
              {stat.sparkline && (
                <div className="mt-3 flex items-center gap-2">
                  <Sparkline data={stat.sparkline} color={stat.color} width={80} height={24} />
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              )}
              {stat.badge && (
                <div className="mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stat.badge.bg}`}>{stat.badge.text}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── SECTION 2: Teacher Ranking Table ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionHeader icon={Trophy} title={t('teacherRanking')} subtitle={t('teacherRankingSub')} locale={locale} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4" dir={dir}>
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchTeacher')}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition font-['Cairo']"
            />
          </div>
          <select
            value={campusFilter}
            onChange={e => setCampusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-sm font-['Cairo'] focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="all">{t('allCampuses')}</option>
            {CAMPUSES.map(c => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.name : c.nameEn}</option>
            ))}
          </select>
          <select
            value={gradeFilter === 'all' ? 'all' : String(gradeFilter)}
            onChange={e => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-sm font-['Cairo'] focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="all">{t('allGrades')}</option>
            {availableGrades.map(g => (
              <option key={g} value={g}>{t('grade')} {g}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {[
                    { key: 'name' as SortKey, label: '#  ' + t('name'), w: 'min-w-[180px]' },
                    { key: 'campus' as SortKey, label: t('campus'), w: 'min-w-[80px]' },
                    { key: 'grade' as SortKey, label: t('grade'), w: 'min-w-[60px]' },
                    { key: 'students' as SortKey, label: t('students'), w: 'min-w-[70px]' },
                    { key: 'accuracy' as SortKey, label: t('accuracy'), w: 'min-w-[140px]' },
                    { key: 'xp' as SortKey, label: t('xp'), w: 'min-w-[70px]' },
                    { key: 'stars' as SortKey, label: t('stars'), w: 'min-w-[80px]' },
                    { key: 'trend' as SortKey, label: t('health'), w: 'min-w-[60px]' },
                    { key: 'trend' as SortKey, label: t('trendLabel'), w: 'min-w-[80px]' },
                    { key: 'accuracy' as SortKey, label: t('units'), w: 'min-w-[100px]' },
                  ].map((col, ci) => (
                    <th
                      key={ci}
                      className={`px-3 py-3 text-start text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700 transition ${col.w}`}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {filteredTeachers.map((teacher, idx) => {
                  const rank = idx + 1;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                  const isExpanded = expandedRow === teacher.id;
                  const healthCount = Object.values(teacher.healthSignals).filter(s => s === 'green').length;

                  return (
                    <motion.tr
                      key={teacher.id}
                      custom={idx}
                      variants={fadeUp}
                      className="group"
                    >
                      <td colSpan={10} className="p-0">
                        {/* Main row */}
                        <div
                          className={`flex items-center w-full px-3 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-purple-50/30' : ''}`}
                          onClick={() => setExpandedRow(isExpanded ? null : teacher.id)}
                        >
                          {/* # + Name */}
                          <div className="flex items-center gap-2.5 min-w-[180px] flex-1">
                            <span className="text-xs text-slate-400 w-5 text-center font-mono">{medal ?? rank}</span>
                            <TeacherAvatar name={teacher.name} size={32} />
                            <span className="font-semibold text-slate-700 truncate">{teacher.name}</span>
                          </div>
                          {/* Campus */}
                          <div className="min-w-[80px] px-3">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{campusName(teacher.campusId, locale)}</span>
                          </div>
                          {/* Grade */}
                          <div className="min-w-[60px] px-3 text-slate-600">{teacher.grade}</div>
                          {/* Students */}
                          <div className="min-w-[70px] px-3 text-slate-600">{teacher.studentCount}</div>
                          {/* Accuracy bar */}
                          <div className="min-w-[140px] px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: getAccuracyColor(teacher.avgAccuracy) }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${teacher.avgAccuracy}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.03 }}
                                />
                              </div>
                              <span className="text-xs font-bold" style={{ color: getAccuracyColor(teacher.avgAccuracy) }}>{teacher.avgAccuracy}%</span>
                            </div>
                          </div>
                          {/* XP */}
                          <div className="min-w-[70px] px-3 text-slate-600 font-mono text-xs">{teacher.avgXp.toLocaleString()}</div>
                          {/* Stars */}
                          <div className="min-w-[80px] px-3 flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < teacher.starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                          {/* Health dots */}
                          <div className="min-w-[60px] px-3 flex items-center gap-1">
                            {(['academic', 'engagement', 'trend'] as const).map(key => (
                              <div key={key} className={`w-2.5 h-2.5 rounded-full ${signalDot(teacher.healthSignals[key])}`} title={key} />
                            ))}
                          </div>
                          {/* Trend sparkline */}
                          <div className="min-w-[80px] px-3">
                            <MiniSparkline data={teacher.weeklyTrend} color={teacher.trend === 'up' ? '#10b981' : teacher.trend === 'down' ? '#f43f5e' : '#94a3b8'} />
                          </div>
                          {/* Unit heatmap squares */}
                          <div className="min-w-[100px] px-3 flex items-center gap-1">
                            {teacher.unitAccuracies.slice(0, 5).map((u, ui) => (
                              <div
                                key={ui}
                                className="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center"
                                style={{
                                  background: `${getAccuracyColor(u.accuracy)}20`,
                                  color: getAccuracyColor(u.accuracy),
                                }}
                                title={`${u.unit}: ${u.accuracy}%`}
                              >
                                {u.accuracy > 0 ? u.accuracy : '-'}
                              </div>
                            ))}
                            <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-5 bg-gradient-to-b from-purple-50/30 to-white border-b border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Unit breakdown */}
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">{t('unitBreakdown')}</p>
                                    <HorizontalBarChart
                                      data={teacher.unitAccuracies.filter(u => u.accuracy > 0).map(u => ({
                                        label: u.unit,
                                        value: u.accuracy,
                                      }))}
                                      maxValue={100}
                                      barHeight={18}
                                      valueSuffix="%"
                                    />
                                  </div>
                                  {/* Student distribution */}
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">{t('studentDist')}</p>
                                    {(() => {
                                      const brackets = [
                                        { label: '90-100%', min: 90, max: 100, color: '#10b981' },
                                        { label: '75-89%', min: 75, max: 89, color: '#0ea5e9' },
                                        { label: '60-74%', min: 60, max: 74, color: '#f59e0b' },
                                        { label: '<60%', min: 0, max: 59, color: '#f43f5e' },
                                      ];
                                      return (
                                        <div className="space-y-2">
                                          {brackets.map(b => {
                                            const count = teacher.students.filter(st => {
                                              const acc = st.subjectDetails[sub]?.accuracy ?? 0;
                                              return acc >= b.min && acc <= b.max;
                                            }).length;
                                            const pct = teacher.studentCount > 0 ? (count / teacher.studentCount) * 100 : 0;
                                            return (
                                              <div key={b.label} className="flex items-center gap-2 text-xs">
                                                <span className="w-14 text-slate-500">{b.label}</span>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                  <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ background: b.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.6 }}
                                                  />
                                                </div>
                                                <span className="w-8 text-end font-bold" style={{ color: b.color }}>{count}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {/* Campus comparison */}
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">{t('campusComparison')}</p>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <TeacherAvatar name={teacher.name} size={28} />
                                        <div className="flex-1">
                                          <p className="text-xs font-semibold text-slate-700">{teacher.name}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div className="h-full rounded-full bg-purple-500" style={{ width: `${teacher.avgAccuracy}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-purple-600">{teacher.avgAccuracy}%</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-xs text-slate-500">{campusFullName(teacher.campusId, locale)} {t('avgAccuracy')}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div className="h-full rounded-full bg-slate-400" style={{ width: `${teacher.avgAccuracy - teacher.campusDelta}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500">{teacher.avgAccuracy - teacher.campusDelta}%</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs mt-1">
                                        <span className={`font-bold ${teacher.campusDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {teacher.campusDelta >= 0 ? '+' : ''}{teacher.campusDelta}%
                                        </span>
                                        <span className="text-slate-400">
                                          {teacher.campusDelta >= 0
                                            ? (locale === 'ar' ? 'فوق المتوسط' : 'above average')
                                            : (locale === 'ar' ? 'تحت المتوسط' : 'below average')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              {locale === 'ar' ? 'لا يوجد معلمون مطابقون' : 'No matching teachers'}
            </div>
          )}
        </div>
      </motion.section>

      {/* ─── SECTION 3: Teacher Matchup Arena ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionHeader icon={Swords} title={t('matchupArena')} subtitle={t('matchupArenaSub')} locale={locale} />

        <div className="flex flex-wrap items-center gap-4 mb-6" dir={dir}>
          <select
            value={matchA}
            onChange={e => setMatchA(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50/50 text-sm font-['Cairo'] focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">{t('selectTeacher')}</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.grade}{t.section})</option>)}
          </select>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs shadow-lg">
            {t('vs')}
          </div>
          <select
            value={matchB}
            onChange={e => setMatchB(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-sm font-['Cairo'] focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">{t('selectTeacher')}</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.grade}{t.section})</option>)}
          </select>
        </div>

        <AnimatePresence mode="wait">
          {teacherA && teacherB && (
            <motion.div
              key={`${matchA}-${matchB}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-stretch"
            >
              {/* Teacher A */}
              {(() => {
                const metrics = [
                  { key: 'accuracy', labelAr: 'الدقة', labelEn: 'Accuracy', a: teacherA.avgAccuracy, b: teacherB.avgAccuracy, suffix: '%' },
                  { key: 'xp', labelAr: 'XP', labelEn: 'XP', a: teacherA.avgXp, b: teacherB.avgXp, suffix: '' },
                  { key: 'students', labelAr: 'الطلاب', labelEn: 'Students', a: teacherA.studentCount, b: teacherB.studentCount, suffix: '' },
                  { key: 'engagement', labelAr: 'ساعات التفاعل', labelEn: 'Engagement', a: teacherA.engagementHours, b: teacherB.engagementHours, suffix: 'h' },
                  { key: 'growth', labelAr: 'معدل النمو', labelEn: 'Growth', a: teacherA.weeklyTrend[7] - teacherA.weeklyTrend[0], b: teacherB.weeklyTrend[7] - teacherB.weeklyTrend[0], suffix: '' },
                ];
                const aWins = metrics.filter(m => m.a > m.b).length;
                const bWins = metrics.filter(m => m.b > m.a).length;
                const overallWinner = aWins > bWins ? 'a' : bWins > aWins ? 'b' : 'tie';

                return (
                  <>
                    {/* Card A */}
                    <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${overallWinner === 'a' ? 'border-amber-300 shadow-amber-100' : 'border-blue-100'}`}>
                      {overallWinner === 'a' && (
                        <div className="flex justify-center mb-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" /> {t('winner')}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center mb-5">
                        <TeacherAvatar name={teacherA.name} size={56} />
                        <p className="mt-2 font-bold text-slate-800">{teacherA.name}</p>
                        <p className="text-xs text-slate-500">{t('grade')} {teacherA.grade}{teacherA.section} · {campusName(teacherA.campusId, locale)}</p>
                      </div>
                      <div className="space-y-3">
                        {metrics.map(m => {
                          const aWin = m.a > m.b;
                          const total = m.a + m.b || 1;
                          const aPct = (m.a / total) * 100;
                          return (
                            <div key={m.key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-blue-600 flex items-center gap-1">
                                  {aWin && <Crown className="w-3 h-3 text-amber-500" />}
                                  {m.a}{m.suffix}
                                </span>
                                <span className="text-slate-400">{locale === 'ar' ? m.labelAr : m.labelEn}</span>
                              </div>
                              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                                <motion.div
                                  className="h-full rounded-s-full bg-blue-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${aPct}%` }}
                                  transition={{ duration: 0.6 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* VS center */}
                    <div className="hidden md:flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-extrabold text-lg shadow-xl"
                      >
                        VS
                      </motion.div>
                    </div>

                    {/* Card B */}
                    <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${overallWinner === 'b' ? 'border-amber-300 shadow-amber-100' : 'border-emerald-100'}`}>
                      {overallWinner === 'b' && (
                        <div className="flex justify-center mb-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5" /> {t('winner')}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center mb-5">
                        <TeacherAvatar name={teacherB.name} size={56} />
                        <p className="mt-2 font-bold text-slate-800">{teacherB.name}</p>
                        <p className="text-xs text-slate-500">{t('grade')} {teacherB.grade}{teacherB.section} · {campusName(teacherB.campusId, locale)}</p>
                      </div>
                      <div className="space-y-3">
                        {metrics.map(m => {
                          const bWin = m.b > m.a;
                          const total = m.a + m.b || 1;
                          const bPct = (m.b / total) * 100;
                          return (
                            <div key={m.key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">{locale === 'ar' ? m.labelAr : m.labelEn}</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                  {m.b}{m.suffix}
                                  {bWin && <Crown className="w-3 h-3 text-amber-500" />}
                                </span>
                              </div>
                              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex justify-end">
                                <motion.div
                                  className="h-full rounded-e-full bg-emerald-400"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${bPct}%` }}
                                  transition={{ duration: 0.6 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ─── SECTION 4: Growth Trajectory Chart ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <SectionHeader icon={Activity} title={t('growthTrajectory')} subtitle={t('growthTrajectorySub')} locale={locale} />

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          {/* Teacher toggles */}
          <div className="flex flex-wrap gap-2 mb-5">
            {sortedByAccuracy.slice(0, 8).map((teacher, i) => {
              const color = GROWTH_COLORS[i % GROWTH_COLORS.length];
              const active = activeGrowthIds.has(teacher.id);
              return (
                <button
                  key={teacher.id}
                  onClick={() => {
                    const next = new Set(activeGrowthIds);
                    if (next.has(teacher.id)) next.delete(teacher.id);
                    else next.add(teacher.id);
                    setGrowthSelection(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    active ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-50 border-transparent opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-slate-700">{teacher.name.split(' ')[0]}</span>
                  {teacher.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                  {teacher.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                  {teacher.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
          </div>

          {/* SVG Chart */}
          {(() => {
            const W = 700, H = 300;
            const pad = { top: 20, right: 30, bottom: 35, left: 45 };
            const cw = W - pad.left - pad.right;
            const ch = H - pad.top - pad.bottom;

            const allValues = growthTeachers.flatMap(t => t.weeklyTrend);
            const dataMin = allValues.length > 0 ? Math.min(...allValues) : 40;
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
              <div className="relative" onMouseLeave={() => setGrowthHover(null)}>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {/* Grid */}
                  {yTicks.map(v => {
                    const y = pad.top + ch - ((v - yMin) / yRange) * ch;
                    return (
                      <g key={v}>
                        <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
                        <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{v}%</text>
                      </g>
                    );
                  })}

                  {/* X labels */}
                  {Array.from({ length: weeks }, (_, i) => (
                    <text
                      key={i}
                      x={pad.left + i * xStep}
                      y={H - 8}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#94a3b8"
                    >
                      {t('week')} {i + 1}
                    </text>
                  ))}

                  {/* Lines */}
                  {growthTeachers.map((teacher, ti) => {
                    const color = GROWTH_COLORS[sortedByAccuracy.findIndex(t => t.id === teacher.id) % GROWTH_COLORS.length];
                    const pts: [number, number][] = teacher.weeklyTrend.map((v, i) => [
                      pad.left + i * xStep,
                      pad.top + ch - ((v - yMin) / yRange) * ch,
                    ]);
                    const linePath = smoothSvgPath(pts);
                    const areaPath = `${linePath} L${pts[pts.length - 1][0]},${pad.top + ch} L${pts[0][0]},${pad.top + ch} Z`;

                    return (
                      <g key={teacher.id}>
                        <defs>
                          <linearGradient id={`growth-g-${uid}-${ti}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#growth-g-${uid}-${ti})`} />
                        <motion.path
                          d={linePath}
                          fill="none"
                          stroke={color}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: ti * 0.15 }}
                        />
                        {/* Dots */}
                        {pts.map(([x, y], di) => (
                          <motion.circle
                            key={di}
                            cx={x} cy={y} r={3}
                            fill="white"
                            stroke={color}
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
                  {growthHover !== null && (
                    <g>
                      <line
                        x1={pad.left + growthHover * xStep}
                        y1={pad.top}
                        x2={pad.left + growthHover * xStep}
                        y2={pad.top + ch}
                        stroke="#8b5cf6"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                        opacity={0.5}
                      />
                      {growthTeachers.map((teacher, ti) => {
                        const color = GROWTH_COLORS[sortedByAccuracy.findIndex(t => t.id === teacher.id) % GROWTH_COLORS.length];
                        const v = teacher.weeklyTrend[growthHover];
                        const x = pad.left + growthHover * xStep;
                        const y = pad.top + ch - ((v - yMin) / yRange) * ch;
                        return (
                          <g key={teacher.id}>
                            <circle cx={x} cy={y} r={5} fill={color} stroke="white" strokeWidth={2} />
                            <rect x={x + 8} y={y - 10 + ti * 18} width={50} height={16} rx={4} fill="white" stroke={color} strokeWidth={0.5} />
                            <text x={x + 14} y={y + 2 + ti * 18} fontSize={10} fill={color} fontWeight={700}>{v}%</text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Hover zones */}
                  {Array.from({ length: weeks }, (_, i) => (
                    <rect
                      key={i}
                      x={pad.left + i * xStep - xStep / 2}
                      y={pad.top}
                      width={xStep}
                      height={ch}
                      fill="transparent"
                      onMouseEnter={() => setGrowthHover(i)}
                    />
                  ))}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-3 px-2">
                  {growthTeachers.map((teacher, ti) => {
                    const color = GROWTH_COLORS[sortedByAccuracy.findIndex(t => t.id === teacher.id) % GROWTH_COLORS.length];
                    return (
                      <div key={teacher.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                        <span className="font-semibold">{teacher.name.split(' ')[0]}</span>
                        {teacher.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                        {teacher.trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </motion.section>

      {/* ─── SECTION 5: Unit Mastery Heatmap ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <SectionHeader icon={BookOpen} title={t('unitMastery')} subtitle={t('unitMasterySub')} locale={locale} />

        {/* Grade pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {availableGrades.map(g => (
            <button
              key={g}
              onClick={() => setHeatmapGrade(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeHeatmapGrade === g
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('grade')} {g}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
          {(() => {
            const gradeTeachers = teachers.filter(t => t.grade === activeHeatmapGrade);
            if (gradeTeachers.length === 0) return <p className="text-slate-400 text-sm text-center py-8">{locale === 'ar' ? 'لا يوجد معلمون لهذا الصف' : 'No teachers for this grade'}</p>;

            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-start px-3 py-2 text-xs text-slate-500 font-semibold min-w-[140px]">{t('name')}</th>
                    {units.map(u => (
                      <th key={u} className="px-2 py-2 text-xs text-slate-500 font-semibold text-center min-w-[70px]">{u}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                  {gradeTeachers.map((teacher, ti) => (
                    <motion.tr key={teacher.id} custom={ti} variants={fadeUp} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <TeacherAvatar name={teacher.name} size={26} />
                          <span className="font-semibold text-slate-700 text-xs truncate">{teacher.name}</span>
                        </div>
                      </td>
                      {units.map(unit => {
                        const ua = teacher.unitAccuracies.find(u => u.unit === unit);
                        const acc = ua?.accuracy ?? 0;
                        if (acc === 0) return <td key={unit} className="px-2 py-2 text-center text-xs text-slate-300">-</td>;
                        return (
                          <td key={unit} className="px-2 py-2 text-center">
                            <div
                              className="inline-flex items-center justify-center w-11 h-8 rounded-lg text-xs font-bold transition-transform hover:scale-110 cursor-default"
                              style={{
                                background: `${getAccuracyColor(acc)}15`,
                                color: getAccuracyColor(acc),
                              }}
                              title={`${teacher.name}: ${unit} = ${acc}%`}
                            >
                              {acc}%
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            );
          })()}
        </div>
      </motion.section>

      {/* ─── SECTION 6: Teacher Health Dashboard ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <SectionHeader icon={Heart} title={t('healthDashboard')} subtitle={t('healthDashboardSub')} locale={locale} />

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
          {filteredTeachers.slice(0, 18).map((teacher, i) => {
            const signals = teacher.healthSignals;
            const healthyCount = Object.values(signals).filter(s => s === 'green').length;
            const needsHelp = healthyCount <= 1;
            const signalLabels = [
              { key: 'academic' as const, label: t('academic'), icon: GraduationCap },
              { key: 'engagement' as const, label: t('engagement'), icon: Activity },
              { key: 'trend' as const, label: t('trendLabel'), icon: TrendingUp },
              { key: 'retention' as const, label: t('retention'), icon: UserCheck },
            ];

            return (
              <motion.div
                key={teacher.id}
                custom={i}
                variants={fadeUp}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
                  needsHelp ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <TeacherAvatar name={teacher.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-800 truncate">{teacher.name}</p>
                      {needsHelp && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold shrink-0">
                          {t('needsSupport')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{t('grade')} {teacher.grade}{teacher.section} · {campusName(teacher.campusId, locale)}</p>
                  </div>
                </div>

                {/* Traffic lights */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {signalLabels.map(({ key, label, icon: SIcon }) => (
                    <div key={key} className="flex flex-col items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-full ${signalDot(signals[key])} shadow-sm`} />
                      <SIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] text-slate-500 text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Health ring */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="w-10 h-10">
                    <ProgressRing
                      value={healthyCount}
                      max={4}
                      size={40}
                      strokeWidth={4}
                      color={healthyCount >= 3 ? '#10b981' : healthyCount >= 2 ? '#f59e0b' : '#f43f5e'}
                    />
                  </div>
                  <span className="text-xs text-slate-600">
                    <span className="font-bold">{healthyCount}/4</span> {t('healthy')}
                  </span>
                </div>

                {/* Recommendation for struggling */}
                {needsHelp && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="text-[11px] text-rose-700 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        {locale === 'ar'
                          ? `${t('recommendation')}: التركيز على تحسين ${signals.academic === 'red' ? t('academic') : t('engagement')} من خلال التدريب المستهدف`
                          : `${t('recommendation')}: Focus on improving ${signals.academic === 'red' ? 'academics' : 'engagement'} through targeted coaching`}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ─── SECTION 7: Engagement vs Impact Scatter ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <SectionHeader icon={Target} title={t('engagementImpact')} subtitle={t('engagementImpactSub')} locale={locale} />

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          {/* Quadrant labels */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              <span>{locale === 'ar' ? '🎯 فعّال بكفاءة (أعلى يسار)' : '🎯 Efficient & Effective (top-left)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{locale === 'ar' ? '⭐ فعّال ومتفاعل (أعلى يمين)' : '⭐ Effective & Engaged (top-right)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{locale === 'ar' ? '🆘 يحتاج متابعة (أسفل يسار)' : '🆘 Needs Follow-up (bottom-left)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>{locale === 'ar' ? '⚡ متفاعل يحتاج دعم (أسفل يمين)' : '⚡ Engaged, Needs Support (bottom-right)'}</span>
            </div>
          </div>

          <AccuracyVsXpScatter
            students={scatterData}
            locale={locale}
            className="w-full"
          />
        </div>
      </motion.section>

      {/* ─── SECTION 8: Spotlight & Peer Learning ─── */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <SectionHeader icon={Award} title={t('spotlight')} subtitle={t('spotlightSub')} locale={locale} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Teacher of the Month */}
          {teacherOfMonth && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="relative bg-white rounded-2xl p-6 shadow-sm overflow-hidden"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #f59e0b, #f97316, #ef4444)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-[100%] opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-amber-700">{t('teacherOfMonth')}</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <TeacherAvatar name={teacherOfMonth.name} size={56} />
                  <p className="mt-3 font-bold text-slate-800">{teacherOfMonth.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('grade')} {teacherOfMonth.grade}{teacherOfMonth.section}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-emerald-600">{teacherOfMonth.avgAccuracy}%</p>
                    <p className="text-[10px] text-slate-500">{t('accuracy')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-purple-600">{teacherOfMonth.studentCount}</p>
                    <p className="text-[10px] text-slate-500">{t('students')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-amber-600">{teacherOfMonth.starRating}/5</p>
                    <p className="text-[10px] text-slate-500">{t('stars')}</p>
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-4 text-center bg-amber-50 rounded-lg px-3 py-2">{t('reason1')}</p>
              </div>
            </motion.div>
          )}

          {/* Top Improver */}
          {topImprover && (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="relative bg-white rounded-2xl p-6 shadow-sm overflow-hidden"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #10b981, #059669, #047857)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-[100%] opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-emerald-700">{t('topImprover')}</h3>
                </div>
                <div className="flex flex-col items-center text-center">
                  <TeacherAvatar name={topImprover.name} size={56} />
                  <p className="mt-3 font-bold text-slate-800">{topImprover.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('grade')} {topImprover.grade}{topImprover.section}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-emerald-600">+{topImprover.weeklyTrend[7] - topImprover.weeklyTrend[0]}%</p>
                    <p className="text-[10px] text-slate-500">{t('growthRate')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-sky-600">{topImprover.avgAccuracy}%</p>
                    <p className="text-[10px] text-slate-500">{t('accuracy')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-purple-600">{topImprover.engagementHours}h</p>
                    <p className="text-[10px] text-slate-500">{t('engagementHours')}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-4 text-center bg-emerald-50 rounded-lg px-3 py-2">{t('reason2')}</p>
              </div>
              {/* Sparkline */}
              <div className="mt-3 flex justify-center">
                <Sparkline data={topImprover.weeklyTrend} color="#10b981" width={120} height={30} />
              </div>
            </motion.div>
          )}

          {/* Peer Learning Suggestions */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-indigo-700">{t('peerLearning')}</h3>
            </div>

            <div className="space-y-4">
              {peerSuggestions.length > 0 ? peerSuggestions.map((suggestion, si) => {
                const highAcc = suggestion.high.unitAccuracies.find(u => u.unit === suggestion.unit)?.accuracy ?? 0;
                const lowAcc = suggestion.low.unitAccuracies.find(u => u.unit === suggestion.unit)?.accuracy ?? 0;
                return (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + si * 0.1 }}
                    className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-bold text-emerald-700">{locale === 'ar' ? 'أ.' : 'T.'} {suggestion.high.name.split(' ')[0]} ({highAcc}%)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-indigo-500 font-semibold">{t('helps')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-rose-600">{locale === 'ar' ? 'أ.' : 'T.'} {suggestion.low.name.split(' ')[0]} ({lowAcc}%)</span>
                      <span className="text-slate-500">{t('inUnit')}</span>
                      <span className="font-bold text-slate-700">{suggestion.unit}</span>
                    </div>
                    <button
                      onClick={() => showToast(t('meetingScheduled'))}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
                    >
                      <CalendarHeart className="w-3.5 h-3.5" />
                      {t('scheduleMeeting')}
                    </button>
                  </motion.div>
                );
              }) : (
                <p className="text-sm text-slate-400 text-center py-6">
                  {locale === 'ar' ? 'لا توجد اقتراحات حالياً' : 'No suggestions currently'}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          locale={locale}
        />
      )}
    </div>
  );
}

export default TeachersTab;
