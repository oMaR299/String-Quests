import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Star, Users, TrendingUp, TrendingDown, Minus,
  GraduationCap, Building2, Clock, BookOpen, Activity, Eye,
  Heart, BarChart3, Calendar, Target, UserCheck, FileText,
  Monitor, PenTool, SearchCheck, ClipboardList, Zap,
  CheckCircle2, XCircle, AlertTriangle, Mail, MapPin, Award,
  ChevronDown, ChevronUp, BrainCircuit,
} from 'lucide-react';
import {
  Sparkline, ProgressRing, AreaLineChart, HorizontalBarChart,
  VerticalBarChart, CalendarHeatmap, RadarChart, DonutChart,
} from '../admin-hub/attendance/SvgCharts';
import {
  MOCK_SCHOOL_DATA, SUBJECT_UNITS,
  type StudentProfile, type Subject, type ClassSection,
} from '../../data/complexLeaderboardData';
import {
  TEACHER_ACTIVITIES, EXTENDED_TEACHERS,
  ACTION_LABELS,
} from '../../data/mockAttendanceData';
import type { TeacherProfileData } from './TeacherProfileModal';

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى الزهراء (بنات)', nameEn: 'Al-Zahra (Girls)' },
  { id: 'camp-3', name: 'المبنى الدولي', nameEn: 'International' },
];

const SUBJECT_AR: Record<string, string> = {
  math: 'رياضيات', science: 'علوم', languages: 'لغات', history: 'تاريخ', arts: 'فنون',
  physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء',
};

type TabId = 'overview' | 'academic' | 'activity' | 'impact' | 'info';

const TABS: { id: TabId; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
  { id: 'overview',  labelAr: 'نظرة عامة',         labelEn: 'Overview',            icon: Eye },
  { id: 'academic',  labelAr: 'الأداء الأكاديمي',   labelEn: 'Academic Performance', icon: BarChart3 },
  { id: 'activity',  labelAr: 'نشاط المنصة',       labelEn: 'Platform Activity',    icon: Monitor },
  { id: 'impact',    labelAr: 'تأثير الطلاب',       labelEn: 'Student Impact',       icon: Heart },
  { id: 'info',      labelAr: 'المعلومات الشخصية',  labelEn: 'Personal Info',        icon: FileText },
];

interface TeacherProfilePageProps {
  teacher: TeacherProfileData;
  locale: 'ar' | 'en';
  subject?: string;
  onExit: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function TeacherAvatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-xl border-4 border-white"
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

const signalColor = (s: 'green' | 'amber' | 'red') =>
  s === 'green' ? 'bg-emerald-400' : s === 'amber' ? 'bg-amber-400' : 'bg-rose-400';

const accColor = (v: number) =>
  v >= 85 ? 'text-emerald-600' : v >= 70 ? 'text-sky-600' : v >= 55 ? 'text-amber-600' : 'text-rose-600';

const accBg = (v: number) =>
  v >= 85 ? 'bg-emerald-50 border-emerald-100' : v >= 70 ? 'bg-sky-50 border-sky-100' : v >= 55 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';

function seededRandom(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function getContentStats(teacherId: string) {
  const seed = teacherId.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
  return {
    lessonsCreated: Math.floor(rng(1) * 15) + 2,
    assignmentsGiven: Math.floor(rng(2) * 20) + 5,
    examsCreated: Math.floor(rng(3) * 5) + 1,
    quizzesReviewed: Math.floor(rng(4) * 30) + 10,
    activeStudentRate: Math.round(60 + rng(5) * 35),
    contentScore: Math.round(50 + rng(6) * 45),
    aiUsage: Math.round(rng(7) * 80),
    loginStreak: Math.floor(rng(8) * 14) + 1,
  };
}

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}>
      <h3 className="text-sm font-bold text-slate-700 mb-4 font-['Cairo']">{title}</h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({
  teacher,
  locale,
  subject = 'math',
  onExit,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const ar = locale === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  const campusName = useMemo(() => {
    const c = CAMPUSES.find(c => c.id === teacher.campusId);
    return ar ? c?.name ?? '' : c?.nameEn ?? '';
  }, [teacher.campusId, ar]);

  const contentStats = useMemo(() => getContentStats(teacher.id), [teacher.id]);

  const healthComposite = useMemo(() => {
    const vals = Object.values(teacher.healthSignals) as string[];
    const score = vals.reduce((s: number, v) => s + (v === 'green' ? 3 : v === 'amber' ? 2 : 1), 0);
    return Math.round((score / (vals.length * 3)) * 100);
  }, [teacher.healthSignals]);

  // Get matching ExtendedTeacher for activity data
  const extTeacher = useMemo(() => {
    return EXTENDED_TEACHERS.find(et =>
      et.campusId === teacher.campusId &&
      et.grades.includes(teacher.grade)
    );
  }, [teacher]);

  const teacherActivities = useMemo(() => {
    if (!extTeacher) return [];
    return TEACHER_ACTIVITIES.filter(a => a.teacherId === extTeacher.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [extTeacher]);

  // Student accuracy distribution
  const accuracyBrackets = useMemo(() => {
    const brackets = [
      { label: ar ? '٩٠%+' : '90%+', min: 90, max: 101, color: '#10b981', count: 0 },
      { label: ar ? '٨٠-٨٩%' : '80-89%', min: 80, max: 90, color: '#0ea5e9', count: 0 },
      { label: ar ? '٧٠-٧٩%' : '70-79%', min: 70, max: 80, color: '#f59e0b', count: 0 },
      { label: ar ? '٦٠-٦٩%' : '60-69%', min: 60, max: 70, color: '#f97316', count: 0 },
      { label: ar ? '<٦٠%' : '<60%', min: 0, max: 60, color: '#ef4444', count: 0 },
    ];
    const sub = subject as Exclude<Subject, 'all'>;
    for (const st of teacher.students) {
      const acc = st.subjectDetails[sub]?.accuracy ?? 0;
      const bracket = brackets.find(b => acc >= b.min && acc < b.max);
      if (bracket) bracket.count++;
    }
    return brackets;
  }, [teacher.students, subject, ar]);

  // Adoption features checklist
  const adoptionFeatures = useMemo(() => {
    const seed = teacher.id.charCodeAt(4) || 0;
    const rng = (n: number) => ((seed * 9301 + 49297 + n * 17) % 233280) / 233280;
    return [
      { label: ar ? 'إنشاء دروس' : 'Create Lessons', done: rng(100) > 0.2, icon: PenTool },
      { label: ar ? 'إنشاء واجبات' : 'Create Assignments', done: rng(101) > 0.25, icon: ClipboardList },
      { label: ar ? 'مراجعة اختبارات' : 'Review Quizzes', done: rng(102) > 0.15, icon: SearchCheck },
      { label: ar ? 'عرض تقارير' : 'View Reports', done: rng(103) > 0.3, icon: BarChart3 },
      { label: ar ? 'تسجيل حضور' : 'Mark Attendance', done: teacher.attendanceMarked, icon: UserCheck },
      { label: ar ? 'استخدام AI' : 'Use AI Features', done: rng(105) > 0.4, icon: BrainCircuit },
      { label: ar ? 'عرض بيانات الطلاب' : 'View Student Data', done: rng(106) > 0.1, icon: Users },
      { label: ar ? 'نشر محتوى' : 'Post Content', done: rng(107) > 0.35, icon: BookOpen },
    ];
  }, [teacher, ar]);

  const adoptionCount = adoptionFeatures.filter(f => f.done).length;

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-5 py-4">
            <button
              onClick={onExit}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {ar ? <ArrowRight className="w-5 h-5 text-slate-600" /> : <ArrowLeft className="w-5 h-5 text-slate-600" />}
            </button>

            <TeacherAvatar name={teacher.name} size={56} />

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-slate-800 truncate font-['Cairo']">{teacher.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg font-['Cairo']">
                  {ar ? SUBJECT_AR[subject] || subject : subject}
                </span>
                <span className="text-xs text-slate-500 font-['Cairo']">{campusName}</span>
                <span className="text-xs text-slate-400">|</span>
                <StarRating rating={teacher.starRating} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0 -mb-px scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors font-['Cairo'] ${
                    active
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {ar ? tab.labelAr : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab teacher={teacher} locale={locale} subject={subject} contentStats={contentStats} healthComposite={healthComposite} />
            )}
            {activeTab === 'academic' && (
              <AcademicTab teacher={teacher} locale={locale} subject={subject} accuracyBrackets={accuracyBrackets} />
            )}
            {activeTab === 'activity' && (
              <ActivityTab teacher={teacher} locale={locale} contentStats={contentStats} activities={teacherActivities} adoptionFeatures={adoptionFeatures} adoptionCount={adoptionCount} />
            )}
            {activeTab === 'impact' && (
              <ImpactTab teacher={teacher} locale={locale} subject={subject} contentStats={contentStats} />
            )}
            {activeTab === 'info' && (
              <InfoTab teacher={teacher} locale={locale} subject={subject} campusName={campusName} contentStats={contentStats} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Tab 1: Overview
   ═══════════════════════════════════════════════════════════════ */

function OverviewTab({ teacher, locale, subject, contentStats, healthComposite }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en'; subject: string;
  contentStats: ReturnType<typeof getContentStats>; healthComposite: number;
}) {
  const ar = locale === 'ar';

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: <Users className="w-5 h-5 text-sky-500" />, label: ar ? 'الطلاب' : 'Students', value: teacher.studentCount },
          { icon: <Activity className="w-5 h-5 text-emerald-500" />, label: ar ? 'متوسط الدقة' : 'Avg Accuracy', value: `${teacher.avgAccuracy}%`, color: accColor(teacher.avgAccuracy) },
          { icon: <Clock className="w-5 h-5 text-violet-500" />, label: ar ? 'ساعات أسبوعية' : 'Weekly Hours', value: `${teacher.engagementHours}` },
          { icon: <BookOpen className="w-5 h-5 text-amber-500" />, label: ar ? 'دروس منشأة' : 'Lessons', value: contentStats.lessonsCreated },
          { icon: <Heart className="w-5 h-5 text-rose-500" />, label: ar ? 'نشاط الطلاب' : 'Student Active', value: `${contentStats.activeStudentRate}%` },
          { icon: <Zap className="w-5 h-5 text-cyan-500" />, label: ar ? 'نقاط المحتوى' : 'Content Score', value: contentStats.contentScore },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:shadow-sm transition-shadow">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className={`text-xl font-black font-['Cairo'] ${stat.color ?? 'text-slate-800'}`}>{stat.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 font-['Cairo'] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <SectionCard title={ar ? 'اتجاه الأداء الأسبوعي' : 'Weekly Performance Trend'}>
          <AreaLineChart
            data={teacher.weeklyTrend.map((v, i) => ({ label: `${ar ? 'أسبوع' : 'W'}${i + 1}`, value: v }))}
            color="#0ea5e9"
            height={200}
            showDots
            showGrid
          />
        </SectionCard>

        {/* Health Dashboard */}
        <SectionCard title={ar ? 'لوحة الصحة' : 'Health Dashboard'}>
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing value={healthComposite} size={64} strokeWidth={5} color={healthComposite >= 80 ? '#10b981' : healthComposite >= 60 ? '#f59e0b' : '#ef4444'} animate />
            <div>
              <p className={`text-2xl font-black font-['Cairo'] ${healthComposite >= 80 ? 'text-emerald-600' : healthComposite >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                {healthComposite}%
              </p>
              <p className="text-xs text-slate-500 font-['Cairo']">{ar ? 'النقاط الصحية الإجمالية' : 'Overall Health Score'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {([
              ['academic', ar ? 'أكاديمي' : 'Academic', ar ? 'أداء الطلاب الأكاديمي' : 'Student academic performance'],
              ['engagement', ar ? 'التفاعل' : 'Engagement', ar ? 'ساعات استخدام المنصة' : 'Platform usage hours'],
              ['trend', ar ? 'الاتجاه' : 'Trend', ar ? 'اتجاه الأداء' : 'Performance direction'],
              ['retention', ar ? 'الاستمرارية' : 'Retention', ar ? 'نشاط الطلاب المستمر' : 'Ongoing student activity'],
              ['studentPush', ar ? 'دفع الطلاب' : 'Student Push', ar ? 'هل المعلم يحفز طلابه؟' : 'Is teacher pushing students?'],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                <div className={`w-3 h-3 rounded-full shrink-0 ${signalColor(teacher.healthSignals[key])}`} />
                <span className="text-sm font-bold text-slate-700 font-['Cairo'] flex-1">{label}</span>
                <span className="text-xs text-slate-400 font-['Cairo']">{desc}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Unit Mastery Grid */}
      <SectionCard title={ar ? 'أداء الطلاب حسب الوحدة' : 'Student Performance by Unit'}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {teacher.unitAccuracies.map(ua => (
            <div key={ua.unit} className={`rounded-xl border p-3 text-center ${accBg(ua.accuracy)}`}>
              <p className="text-lg font-black font-['Cairo']">
                <span className={accColor(ua.accuracy)}>{ua.accuracy}%</span>
              </p>
              <p className="text-xs font-semibold text-slate-600 font-['Cairo'] mt-1 truncate">{ua.unit}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab 2: Academic Performance
   ═══════════════════════════════════════════════════════════════ */

function AcademicTab({ teacher, locale, subject, accuracyBrackets }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en'; subject: string;
  accuracyBrackets: { label: string; min: number; max: number; color: string; count: number }[];
}) {
  const ar = locale === 'ar';
  const sub = subject as Exclude<Subject, 'all'>;

  // Best & worst students
  const sortedStudents = useMemo(() => {
    return [...teacher.students].sort((a, b) => (b.subjectDetails[sub]?.accuracy ?? 0) - (a.subjectDetails[sub]?.accuracy ?? 0));
  }, [teacher.students, sub]);

  const bestStudents = sortedStudents.slice(0, 5);
  const worstStudents = [...sortedStudents].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Accuracy Trend */}
      <SectionCard title={ar ? 'اتجاه الدقة (٨ أسابيع)' : 'Accuracy Trend (8 weeks)'}>
        <AreaLineChart
          data={teacher.weeklyTrend.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
          color="#0ea5e9"
          height={220}
          showDots
          showGrid
        />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-unit accuracy */}
        <SectionCard title={ar ? 'الدقة حسب الوحدة' : 'Accuracy by Unit'}>
          <HorizontalBarChart
            data={teacher.unitAccuracies.map(ua => ({
              label: ua.unit,
              value: ua.accuracy,
              color: ua.accuracy >= 85 ? '#10b981' : ua.accuracy >= 70 ? '#0ea5e9' : ua.accuracy >= 55 ? '#f59e0b' : '#ef4444',
            }))}
            maxValue={100}
            showValues
            valueSuffix="%"
          />
        </SectionCard>

        {/* Student distribution */}
        <SectionCard title={ar ? 'توزيع الطلاب حسب الدقة' : 'Student Accuracy Distribution'}>
          <VerticalBarChart
            data={accuracyBrackets.map(b => ({
              label: b.label,
              value: b.count,
              color: b.color,
            }))}
            showValues
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best students */}
        <SectionCard title={ar ? 'أفضل الطلاب' : 'Top Students'}>
          <div className="space-y-2">
            {bestStudents.map((st, i) => {
              const acc = st.subjectDetails[sub]?.accuracy ?? 0;
              return (
                <div key={st.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="flex-1 text-sm font-bold text-slate-700 font-['Cairo'] truncate">{st.name}</span>
                  <span className={`text-sm font-black font-['Cairo'] ${accColor(acc)}`}>{acc}%</span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Weakest students */}
        <SectionCard title={ar ? 'الطلاب الأضعف' : 'Weakest Students'}>
          <div className="space-y-2">
            {worstStudents.map((st, i) => {
              const acc = st.subjectDetails[sub]?.accuracy ?? 0;
              return (
                <div key={st.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">{teacher.studentCount - i}</span>
                  <span className="flex-1 text-sm font-bold text-slate-700 font-['Cairo'] truncate">{st.name}</span>
                  <span className={`text-sm font-black font-['Cairo'] ${accColor(acc)}`}>{acc}%</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Campus comparison */}
      <SectionCard title={ar ? 'مقارنة بمتوسط المبنى' : 'vs Campus Average'}>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-['Cairo'] mb-1">{ar ? 'المعلم' : 'Teacher'}</p>
            <p className={`text-3xl font-black font-['Cairo'] ${accColor(teacher.avgAccuracy)}`}>{teacher.avgAccuracy}%</p>
          </div>
          <div className={`px-4 py-2 rounded-xl ${teacher.campusDelta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className={`text-2xl font-black font-['Cairo'] ${teacher.campusDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {teacher.campusDelta >= 0 ? '+' : ''}{teacher.campusDelta}%
            </p>
            <p className="text-xs text-slate-500 font-['Cairo']">{ar ? 'الفرق' : 'Delta'}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-slate-500 font-['Cairo'] mb-1">{ar ? 'متوسط المبنى' : 'Campus Avg'}</p>
            <p className="text-3xl font-black text-slate-600 font-['Cairo']">{teacher.avgAccuracy - teacher.campusDelta}%</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab 3: Platform Activity
   ═══════════════════════════════════════════════════════════════ */

function ActivityTab({ teacher, locale, contentStats, activities, adoptionFeatures, adoptionCount }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en';
  contentStats: ReturnType<typeof getContentStats>;
  activities: { teacherId: string; date: string; firstLogin?: string; totalMinutes: number; actions: { type: string; timestamp: string; details?: string }[]; sessionsCount: number }[];
  adoptionFeatures: { label: string; done: boolean; icon: React.ElementType }[];
  adoptionCount: number;
}) {
  const ar = locale === 'ar';

  // Login heatmap data (last 30 days)
  const heatmapData = useMemo(() => {
    return activities.slice(0, 30).map(a => ({
      date: a.date,
      value: Math.min(a.totalMinutes / 60, 5) * 20, // normalize to 0-100
    }));
  }, [activities]);

  // Weekly hours trend
  const weeklyHoursTrend = useMemo(() => {
    const weeks: number[] = [];
    for (let w = 0; w < 8; w++) {
      const weekActivities = activities.slice(w * 7, (w + 1) * 7);
      const totalMins = weekActivities.reduce((s, a) => s + a.totalMinutes, 0);
      weeks.push(Math.round(totalMins / 60 * 10) / 10);
    }
    return weeks.reverse();
  }, [activities]);

  // Recent actions
  const recentActions = useMemo(() => {
    const allActions: { type: string; timestamp: string; details?: string; date: string }[] = [];
    for (const day of activities.slice(0, 7)) {
      for (const action of day.actions) {
        allActions.push({ ...action, date: day.date });
      }
    }
    return allActions.slice(0, 20);
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Login Heatmap */}
      <SectionCard title={ar ? 'سجل الدخول (آخر ٣٠ يوم)' : 'Login History (Last 30 Days)'}>
        {heatmapData.length > 0 ? (
          <CalendarHeatmap data={heatmapData} weeksToShow={5} locale={locale} />
        ) : (
          <p className="text-sm text-slate-400 font-['Cairo']">{ar ? 'لا توجد بيانات' : 'No data'}</p>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action timeline */}
        <SectionCard title={ar ? 'آخر الأنشطة' : 'Recent Actions'}>
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {recentActions.length > 0 ? recentActions.map((action, i) => {
              const label = ACTION_LABELS[action.type as keyof typeof ACTION_LABELS];
              return (
                <div key={i} className="flex items-start gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 font-['Cairo']">
                      {label ?? action.type}
                    </p>
                    {action.details && <p className="text-xs text-slate-400 font-['Cairo']">{action.details}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{action.timestamp}</span>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-400 font-['Cairo']">{ar ? 'لا توجد أنشطة' : 'No activities'}</p>
            )}
          </div>
        </SectionCard>

        {/* Weekly hours trend */}
        <SectionCard title={ar ? 'الساعات الأسبوعية' : 'Weekly Hours Trend'}>
          <AreaLineChart
            data={weeklyHoursTrend.map((v, i) => ({ label: `${ar ? 'أ' : 'W'}${i + 1}`, value: v }))}
            color="#8b5cf6"
            height={200}
            showDots
            showGrid
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content creation stats */}
        <SectionCard title={ar ? 'إحصائيات المحتوى' : 'Content Creation Stats'}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: ar ? 'دروس منشأة' : 'Lessons', value: contentStats.lessonsCreated, icon: <BookOpen className="w-4 h-4 text-sky-500" /> },
              { label: ar ? 'واجبات' : 'Assignments', value: contentStats.assignmentsGiven, icon: <ClipboardList className="w-4 h-4 text-violet-500" /> },
              { label: ar ? 'اختبارات' : 'Exams', value: contentStats.examsCreated, icon: <FileText className="w-4 h-4 text-amber-500" /> },
              { label: ar ? 'اختبارات مراجعة' : 'Quizzes Reviewed', value: contentStats.quizzesReviewed, icon: <SearchCheck className="w-4 h-4 text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-lg font-black text-slate-800 font-['Cairo']">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-['Cairo']">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Adoption checklist */}
        <SectionCard title={`${ar ? 'قائمة التبني' : 'Feature Adoption'} (${adoptionCount}/${adoptionFeatures.length})`}>
          <div className="space-y-2">
            {adoptionFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-slate-700 font-['Cairo']">{f.label}</span>
                  {f.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* AI Usage & Login Streak */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
          <BrainCircuit className="w-8 h-8 text-violet-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-800 font-['Cairo']">{contentStats.aiUsage}%</p>
          <p className="text-xs text-slate-500 font-['Cairo']">{ar ? 'استخدام AI' : 'AI Usage Rate'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
          <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-800 font-['Cairo']">{contentStats.loginStreak}</p>
          <p className="text-xs text-slate-500 font-['Cairo']">{ar ? 'سلسلة الدخول (أيام)' : 'Login Streak (days)'}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab 4: Student Impact
   ═══════════════════════════════════════════════════════════════ */

function ImpactTab({ teacher, locale, subject, contentStats }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en'; subject: string;
  contentStats: ReturnType<typeof getContentStats>;
}) {
  const ar = locale === 'ar';
  const sub = subject as Exclude<Subject, 'all'>;

  // Student improvement
  const improvementData = useMemo(() => {
    let improving = 0;
    let declining = 0;
    let stable = 0;
    for (const st of teacher.students) {
      const wa = st.weeklyActivity ?? [];
      if (wa.length >= 2) {
        const recent = wa.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const earlier = wa.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        if (recent > earlier * 1.1) improving++;
        else if (recent < earlier * 0.9) declining++;
        else stable++;
      } else {
        stable++;
      }
    }
    return { improving, declining, stable };
  }, [teacher.students]);

  const improvementRate = teacher.studentCount > 0
    ? Math.round((improvementData.improving / teacher.studentCount) * 100)
    : 0;

  // XP vs Accuracy scatter data
  const scatterStudents = useMemo(() => {
    return teacher.students.map(st => ({
      id: st.id,
      name: st.name,
      xp: st.subjectXp[sub] ?? st.totalXp,
      accuracy: st.subjectDetails[sub]?.accuracy ?? 0,
      league: st.league,
      grade: st.grade,
      section: st.section,
    }));
  }, [teacher.students, sub]);

  // Composite "push" score
  const pushScore = useMemo(() => {
    return Math.round(
      teacher.studentEngagementScore * 0.3 +
      teacher.studentWeeklyLoginRate * 0.25 +
      improvementRate * 0.25 +
      (teacher.attendanceMarked ? 20 : 0)
    );
  }, [teacher, improvementRate]);

  return (
    <div className="space-y-6">
      {/* Impact Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-sky-600 font-['Cairo']">{teacher.studentWeeklyLoginRate}%</p>
          <p className="text-xs text-slate-500 font-['Cairo'] mt-1">{ar ? 'معدل الدخول الأسبوعي' : 'Weekly Login Rate'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-black text-emerald-600 font-['Cairo']">{improvementRate}%</p>
          <p className="text-xs text-slate-500 font-['Cairo'] mt-1">{ar ? 'معدل التحسن' : 'Improvement Rate'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className={`text-2xl font-black font-['Cairo'] ${teacher.attendanceMarked ? 'text-emerald-600' : 'text-rose-500'}`}>
            {teacher.attendanceMarked ? (ar ? 'نعم' : 'Yes') : (ar ? 'لا' : 'No')}
          </p>
          <p className="text-xs text-slate-500 font-['Cairo'] mt-1">{ar ? 'تسجيل الحضور' : 'Attendance Marked'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className={`text-2xl font-black font-['Cairo'] ${pushScore >= 70 ? 'text-emerald-600' : pushScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
            {pushScore}
          </p>
          <p className="text-xs text-slate-500 font-['Cairo'] mt-1">{ar ? 'نقاط الدفع' : 'Push Score'}</p>
        </div>
      </div>

      {/* Student Improvement Breakdown */}
      <SectionCard title={ar ? 'توزيع تحسن الطلاب' : 'Student Improvement Breakdown'}>
        <div className="flex items-center gap-6">
          <DonutChart
            segments={[
              { value: improvementData.improving, color: '#10b981', label: ar ? 'يتحسنون' : 'Improving' },
              { value: improvementData.stable, color: '#94a3b8', label: ar ? 'مستقرون' : 'Stable' },
              { value: improvementData.declining, color: '#ef4444', label: ar ? 'يتراجعون' : 'Declining' },
            ]}
            size={140}
            strokeWidth={20}
            centerValue={`${improvementRate}%`}
            centerLabel={ar ? 'تحسن' : 'Improve'}
          />
          <div className="flex-1 space-y-3">
            {[
              { label: ar ? 'يتحسنون' : 'Improving', count: improvementData.improving, color: 'bg-emerald-400', textColor: 'text-emerald-600' },
              { label: ar ? 'مستقرون' : 'Stable', count: improvementData.stable, color: 'bg-slate-400', textColor: 'text-slate-600' },
              { label: ar ? 'يتراجعون' : 'Declining', count: improvementData.declining, color: 'bg-rose-400', textColor: 'text-rose-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-semibold text-slate-700 font-['Cairo'] flex-1">{item.label}</span>
                <span className={`text-sm font-black font-['Cairo'] ${item.textColor}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Student Engagement Metrics */}
      <SectionCard title={ar ? 'مقاييس تفاعل الطلاب' : 'Student Engagement Metrics'}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: ar ? 'وقت النشاط' : 'Active Time', value: `${teacher.studentAvgActiveTime}h`, color: '#0ea5e9' },
            { label: ar ? 'الدخول الأسبوعي' : 'Weekly Login', value: `${teacher.studentWeeklyLoginRate}%`, color: '#8b5cf6' },
            { label: ar ? 'الدخول اليومي' : 'Daily Login', value: `${teacher.studentDailyLoginRate}%`, color: '#f59e0b' },
            { label: ar ? 'نقاط التفاعل' : 'Engagement', value: `${teacher.studentEngagementScore}`, color: '#10b981' },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <ProgressRing value={parseInt(m.value) || 0} max={100} size={56} strokeWidth={5} color={m.color} animate />
              <p className="text-sm font-black text-slate-800 font-['Cairo'] mt-2">{m.value}</p>
              <p className="text-[10px] text-slate-500 font-['Cairo']">{m.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Push assessment */}
      <SectionCard title={ar ? 'هل المعلم يدفع طلابه؟' : 'Is This Teacher Pushing Students?'}>
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white ${
            pushScore >= 70 ? 'bg-emerald-500' : pushScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
          }`}>
            {pushScore}
          </div>
          <div className="flex-1">
            <p className={`text-lg font-bold font-['Cairo'] ${
              pushScore >= 70 ? 'text-emerald-700' : pushScore >= 50 ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {pushScore >= 70
                ? (ar ? 'المعلم يدفع طلابه بفعالية' : 'Teacher is effectively pushing students')
                : pushScore >= 50
                ? (ar ? 'المعلم يحتاج لزيادة التفاعل' : 'Teacher needs to increase engagement')
                : (ar ? 'المعلم يحتاج تدخل عاجل' : 'Teacher needs urgent intervention')
              }
            </p>
            <p className="text-sm text-slate-500 font-['Cairo'] mt-1">
              {ar ? 'يعتمد على: معدل تفاعل الطلاب، معدل الدخول، نسبة التحسن، تسجيل الحضور' : 'Based on: engagement rate, login rate, improvement rate, attendance compliance'}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab 5: Personal Info
   ═══════════════════════════════════════════════════════════════ */

function InfoTab({ teacher, locale, subject, campusName, contentStats }: {
  teacher: TeacherProfileData; locale: 'ar' | 'en'; subject: string; campusName: string;
  contentStats: ReturnType<typeof getContentStats>;
}) {
  const ar = locale === 'ar';
  const subjectAr = SUBJECT_AR[subject] || subject;

  // Generate mock personal data from seed
  const seed = teacher.id.charCodeAt(4) || 0;
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 7) % 233280) / 233280;
  const startYear = 2019 + Math.floor(rng(200) * 5);
  const mockEmail = teacher.name.split(' ').join('.').toLowerCase() + '@alkhadr.edu.sa';
  const yearsExp = 2026 - startYear;

  const qualifications = [
    ar ? 'بكالوريوس تربية' : 'Bachelor of Education',
    ...(rng(201) > 0.5 ? [ar ? 'ماجستير مناهج وطرق تدريس' : 'Master of Curriculum & Teaching'] : []),
    ...(rng(202) > 0.7 ? [ar ? 'دبلوم تقنيات التعليم' : 'EdTech Diploma'] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <SectionCard title={ar ? 'المعلومات الأساسية' : 'Basic Information'}>
          <div className="space-y-4">
            {[
              { icon: <Users className="w-4 h-4 text-sky-500" />, label: ar ? 'الاسم الكامل' : 'Full Name', value: teacher.name },
              { icon: <BookOpen className="w-4 h-4 text-violet-500" />, label: ar ? 'المادة' : 'Subject', value: ar ? subjectAr : subject },
              { icon: <Building2 className="w-4 h-4 text-emerald-500" />, label: ar ? 'المبنى' : 'Campus', value: campusName },
              { icon: <GraduationCap className="w-4 h-4 text-amber-500" />, label: ar ? 'الصف والشعبة' : 'Grade & Section', value: `${ar ? 'الصف' : 'Grade'} ${teacher.grade} - ${teacher.section}` },
              { icon: <Mail className="w-4 h-4 text-rose-500" />, label: ar ? 'البريد الإلكتروني' : 'Email', value: mockEmail },
              { icon: <Calendar className="w-4 h-4 text-cyan-500" />, label: ar ? 'تاريخ البدء' : 'Start Date', value: `${startYear}` },
              { icon: <Award className="w-4 h-4 text-amber-500" />, label: ar ? 'سنوات الخبرة' : 'Years of Experience', value: `${yearsExp} ${ar ? 'سنوات' : 'years'}` },
            ].map((field, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                {field.icon}
                <span className="text-sm text-slate-500 font-['Cairo'] w-32">{field.label}</span>
                <span className="text-sm font-bold text-slate-800 font-['Cairo']">{field.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Qualifications & Spaces */}
        <div className="space-y-6">
          <SectionCard title={ar ? 'المؤهلات' : 'Qualifications'}>
            <div className="space-y-2">
              {qualifications.map((q, i) => (
                <div key={i} className="flex items-center gap-2 py-2 px-3 bg-sky-50 rounded-xl">
                  <Award className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-semibold text-slate-700 font-['Cairo']">{q}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={ar ? 'ملخص الأداء' : 'Performance Summary'}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-['Cairo']">{ar ? 'التقييم العام' : 'Overall Rating'}</span>
                <StarRating rating={teacher.starRating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-['Cairo']">{ar ? 'متوسط الدقة' : 'Avg Accuracy'}</span>
                <span className={`text-sm font-black font-['Cairo'] ${accColor(teacher.avgAccuracy)}`}>{teacher.avgAccuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-['Cairo']">{ar ? 'الاتجاه' : 'Trend'}</span>
                <span className="flex items-center gap-1 text-sm font-bold font-['Cairo']">
                  {teacher.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : teacher.trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                  {teacher.trend === 'up' ? (ar ? 'صاعد' : 'Up') : teacher.trend === 'down' ? (ar ? 'هابط' : 'Down') : (ar ? 'مستقر' : 'Stable')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-['Cairo']">{ar ? 'عدد الطلاب' : 'Students'}</span>
                <span className="text-sm font-black text-slate-800 font-['Cairo']">{teacher.studentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-['Cairo']">{ar ? 'المحتوى المنشأ' : 'Content Created'}</span>
                <span className="text-sm font-black text-slate-800 font-['Cairo']">
                  {contentStats.lessonsCreated + contentStats.assignmentsGiven + contentStats.examsCreated}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfilePage;
