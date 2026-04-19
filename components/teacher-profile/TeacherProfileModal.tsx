import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Users, TrendingUp, TrendingDown, Minus,
  GraduationCap, Building2, Clock, BookOpen, Activity,
  Heart, Eye, ArrowRight,
} from 'lucide-react';
import { Sparkline, ProgressRing } from '../admin-hub/attendance/SvgCharts';
import type { StudentProfile, ClassSection } from '../../data/complexLeaderboardData';
import { MOCK_SCHOOL_DATA, SUBJECT_UNITS } from '../../data/complexLeaderboardData';

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
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
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

function TeacherAvatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg border-4 border-white"
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
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

const signalColor = (s: 'green' | 'amber' | 'red') =>
  s === 'green' ? 'bg-emerald-400' : s === 'amber' ? 'bg-amber-400' : 'bg-rose-400';

const signalLabel = (s: 'green' | 'amber' | 'red', locale: 'ar' | 'en') =>
  s === 'green' ? (locale === 'ar' ? 'جيد' : 'Good')
    : s === 'amber' ? (locale === 'ar' ? 'متوسط' : 'Fair')
    : (locale === 'ar' ? 'ضعيف' : 'Poor');

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) =>
  trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" />
    : trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-500" />
    : <Minus className="w-4 h-4 text-slate-400" />;

/* ═══════════════════════════════════════════════════════════════
   Content stats (seeded random, same logic as TeachersTab)
   ═══════════════════════════════════════════════════════════════ */

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
  };
}

/* ═══════════════════════════════════════════════════════════════
   Modal Component
   ═══════════════════════════════════════════════════════════════ */

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  teacher,
  onClose,
  locale,
  subject = 'math',
  onViewFull,
}) => {
  const t = locale === 'ar';

  const contentStats = useMemo(() => {
    if (!teacher) return null;
    return getContentStats(teacher.id);
  }, [teacher]);

  const campusName = useMemo(() => {
    if (!teacher) return '';
    const c = CAMPUSES.find(c => c.id === teacher.campusId);
    return t ? c?.name ?? '' : c?.nameEn ?? '';
  }, [teacher, t]);

  const healthComposite = useMemo(() => {
    if (!teacher) return 0;
    const vals = Object.values(teacher.healthSignals) as string[];
    const score = vals.reduce((s: number, v) => s + (v === 'green' ? 3 : v === 'amber' ? 2 : 1), 0);
    return Math.round((score / (vals.length * 3)) * 100);
  }, [teacher]);

  if (!teacher) return null;

  const subjectAr = SUBJECT_AR[subject] || subject;

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
          className="bg-slate-50 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white flex flex-col"
        >
          {/* ── Header ── */}
          <div className="bg-white p-6 md:p-8 border-b border-slate-200 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="flex items-center gap-5 relative z-10">
              <TeacherAvatar name={teacher.name} size={80} />
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight truncate font-['Cairo']">
                  {teacher.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 bg-sky-50 text-sky-700 px-3 py-1 rounded-xl text-xs font-bold border border-sky-100 font-['Cairo']">
                    <BookOpen className="w-3.5 h-3.5" /> {t ? subjectAr : subject}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200 font-['Cairo']">
                    <Building2 className="w-3.5 h-3.5" /> {campusName}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-bold border border-slate-200 font-['Cairo']">
                    <GraduationCap className="w-3.5 h-3.5" /> {t ? `الصف ${teacher.grade} - ${teacher.section}` : `Grade ${teacher.grade} - ${teacher.section}`}
                  </span>
                </div>
                <div className="mt-2">
                  <StarRating rating={teacher.starRating} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Scrollable Content ── */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Quick Stats — 6 cards in 2 rows */}
            <div className="grid grid-cols-3 gap-3">
              {/* Row 1 */}
              <StatCard
                icon={<Users className="w-5 h-5 text-sky-500" />}
                label={t ? 'الطلاب' : 'Students'}
                value={String(teacher.studentCount)}
              />
              <StatCard
                icon={<Activity className="w-5 h-5 text-emerald-500" />}
                label={t ? 'متوسط الدقة' : 'Avg Accuracy'}
                value={`${teacher.avgAccuracy}%`}
                valueColor={teacher.avgAccuracy >= 80 ? 'text-emerald-600' : teacher.avgAccuracy >= 65 ? 'text-amber-600' : 'text-rose-600'}
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-violet-500" />}
                label={t ? 'ساعات الاستخدام' : 'Weekly Hours'}
                value={`${teacher.engagementHours}`}
                suffix={t ? ' س' : 'h'}
              />
              {/* Row 2 */}
              <StatCard
                icon={<Heart className="w-5 h-5 text-rose-500" />}
                label={t ? 'نشاط الطلاب' : 'Student Active'}
                value={`${contentStats?.activeStudentRate ?? 0}%`}
                ring={contentStats?.activeStudentRate}
              />
              <StatCard
                icon={<BookOpen className="w-5 h-5 text-amber-500" />}
                label={t ? 'الدروس المنشأة' : 'Lessons Created'}
                value={String(contentStats?.lessonsCreated ?? 0)}
              />
              <StatCard
                icon={<Activity className="w-5 h-5 text-cyan-500" />}
                label={t ? 'الصحة العامة' : 'Health Score'}
                value={`${healthComposite}%`}
                valueColor={healthComposite >= 80 ? 'text-emerald-600' : healthComposite >= 60 ? 'text-amber-600' : 'text-rose-600'}
              />
            </div>

            {/* Health Signals */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3 font-['Cairo']">
                {t ? 'مؤشرات الصحة' : 'Health Signals'}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                {([
                  ['academic', t ? 'أكاديمي' : 'Academic'],
                  ['engagement', t ? 'التفاعل' : 'Engagement'],
                  ['trend', t ? 'الاتجاه' : 'Trend'],
                  ['retention', t ? 'الاستمرارية' : 'Retention'],
                  ['studentPush', t ? 'دفع الطلاب' : 'Student Push'],
                ] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <div className={`w-3 h-3 rounded-full ${signalColor(teacher.healthSignals[key])}`} />
                    <span className="text-xs font-semibold text-slate-600 font-['Cairo']">{label}</span>
                    <span className="text-[10px] text-slate-400 font-['Cairo']">
                      {signalLabel(teacher.healthSignals[key], locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Trend Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-700 font-['Cairo']">
                  {t ? 'اتجاه الأداء (٨ أسابيع)' : 'Performance Trend (8 weeks)'}
                </h3>
                <TrendIcon trend={teacher.trend} />
              </div>
              <Sparkline data={teacher.weeklyTrend} color="#0ea5e9" width={400} height={60} />
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-['Cairo']">
                <span>{t ? 'قبل ٨ أسابيع' : '8 weeks ago'}</span>
                <span>{t ? 'الآن' : 'Now'}</span>
              </div>
            </div>

            {/* Trend + Delta */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 rounded-xl px-4 py-3 border ${
                teacher.campusDelta >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
              }`}>
                <span className="text-xs text-slate-500 font-['Cairo']">{t ? 'مقارنة بالمبنى' : 'vs Campus Avg'}</span>
                <p className={`text-lg font-black font-['Cairo'] ${
                  teacher.campusDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {teacher.campusDelta >= 0 ? '+' : ''}{teacher.campusDelta}%
                </p>
              </div>
              <div className="flex-1 rounded-xl px-4 py-3 bg-sky-50 border border-sky-100">
                <span className="text-xs text-slate-500 font-['Cairo']">{t ? 'أفضل وحدة' : 'Best Unit'}</span>
                <p className="text-sm font-bold text-sky-700 font-['Cairo'] truncate">{teacher.bestUnit}</p>
              </div>
              <div className="flex-1 rounded-xl px-4 py-3 bg-amber-50 border border-amber-100">
                <span className="text-xs text-slate-500 font-['Cairo']">{t ? 'أضعف وحدة' : 'Weakest Unit'}</span>
                <p className="text-sm font-bold text-amber-700 font-['Cairo'] truncate">{teacher.worstUnit}</p>
              </div>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="p-4 md:p-6 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
            {onViewFull && (
              <button
                onClick={() => onViewFull(teacher)}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-sm font-['Cairo']"
              >
                <Eye className="w-4 h-4" />
                {t ? 'عرض الملف الكامل' : 'View Full Profile'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors font-['Cairo']"
            >
              {t ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   StatCard sub-component
   ═══════════════════════════════════════════════════════════════ */

function StatCard({
  icon,
  label,
  value,
  suffix = '',
  valueColor = 'text-slate-800',
  ring,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  valueColor?: string;
  ring?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center text-center gap-1.5 hover:shadow-sm transition-shadow">
      {icon}
      {ring != null ? (
        <ProgressRing value={ring} size={44} strokeWidth={4} color="#0ea5e9" animate />
      ) : (
        <span className={`text-xl font-black ${valueColor} font-['Cairo']`}>
          {value}{suffix}
        </span>
      )}
      <span className="text-[11px] font-semibold text-slate-500 font-['Cairo'] leading-tight">{label}</span>
    </div>
  );
}

export default TeacherProfileModal;
