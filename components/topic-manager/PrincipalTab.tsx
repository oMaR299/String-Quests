import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, GraduationCap, Building2, Trophy, Star,
  ChevronDown, ChevronUp, BookOpen, AlertTriangle,
  Sparkles, UserCheck, School, X, BarChart3,
  Flame, TrendingUp, TrendingDown, Info, Target, Activity,
  Zap, Heart, ClipboardList, PenTool, CheckCircle2,
  Lock, FileText, ArrowRight,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA, SUBJECT_UNITS,
  type Subject, type ClassSection,
} from '../../data/complexLeaderboardData';
import { SUBJECT_META, CAMPUSES } from './TopicManagerLayout';
import { TeacherProfileModal, type TeacherProfileData } from '../teacher-profile/TeacherProfileModal';
import { LoginPresenceModal, ContentProductionModal, buildPulseData, ACTIVITIES, type PopupTeacher } from './principal-popups';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

interface PrincipalTabProps {
  subject: string;
  locale: 'ar' | 'en';
  onNavigate?: (tab: 'overview' | 'grades' | 'teachers' | 'units' | 'skills' | 'reports' | 'principal' | 'pulse') => void;
}

type SortKey = 'name' | 'accuracy' | 'xp' | 'impact' | 'classes';
type FilterChip =
  | 'all'
  | 'status-top' | 'status-good' | 'status-atrisk' | 'status-critical'
  | 'top10' | 'declining' | 'belowavg' | 'rising';

const TEACHER_NAMES = [
  'أحمد المنصور', 'محمد الخالدي', 'يوسف العمري', 'عمر القحطاني', 'خالد الشمري', 'إبراهيم العتيبي',
  'سعيد الزهراني', 'حسن الغامدي', 'فهد الدوسري', 'ماجد المطيري', 'عبدالله الشهري', 'سلطان الحربي',
  'فيصل العنزي', 'بندر السالم', 'ناصر الرشيدي', 'تركي المالكي', 'عادل الجهني', 'سامي البلوي',
  'سارة المنصور', 'ليلى الخالدي', 'نورة العمري', 'فاطمة القحطاني', 'مريم الشمري', 'زينب العتيبي',
  'هند الزهراني', 'سلمى الغامدي', 'آية الدوسري', 'جود المطيري', 'ريم الشهري', 'دانة الحربي',
  'لمى العنزي', 'غادة السالم', 'منى الرشيدي', 'هيا المالكي', 'عبير الجهني', 'نوف البلوي',
];

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function seededRandom(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function getAccuracyColor(v: number) {
  if (v >= 85) return '#10b981';
  if (v >= 70) return '#0ea5e9';
  if (v >= 55) return '#f59e0b';
  return '#ef4444';
}

function campusName(id: string, locale: 'ar' | 'en') {
  const c = CAMPUSES.find(c => c.id === id);
  return locale === 'ar' ? (c?.name ?? '') : (c?.nameEn ?? '');
}

function TeacherAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 65%, 45%))`,
      }}
    >
      {initials}
    </div>
  );
}

/** FilterPill — beautiful dropdown pill for header filters.
 *  Uses an invisible native <select> on top for keyboard / a11y, with a styled visual.
 *  Active state (value !== default) gets the violet treatment. */
export function FilterPill<T extends string | number>({
  icon, label, value, defaultValue, options, onChange, locale,
}: {
  icon: React.ReactNode;
  label: string;
  value: T;
  defaultValue: T;
  options: { value: T; label: string; emoji?: string }[];
  onChange: (v: T) => void;
  locale: 'ar' | 'en';
}) {
  const active = value !== defaultValue;
  const current = options.find(o => o.value === value);
  const display = current?.label ?? String(value);
  return (
    <div
      className={`relative group flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border transition-all cursor-pointer font-['Cairo'] shadow-sm hover:shadow ${
        active
          ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400 text-white'
          : 'bg-white/80 backdrop-blur border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-white'
      }`}
      title={label}
    >
      <span className={`shrink-0 ${active ? 'text-white/90' : 'text-violet-500'}`}>{icon}</span>
      <span className="flex flex-col items-start leading-tight min-w-0">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-white/70' : 'text-slate-400'}`}>
          {label}
        </span>
        <span className="text-xs font-black truncate max-w-[110px]">{display}</span>
      </span>
      <ChevronDown className={`w-3 h-3 shrink-0 ms-0.5 ${active ? 'text-white/80' : 'text-slate-400'} group-hover:translate-y-0.5 transition-transform`} />
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const matched = options.find(o => String(o.value) === raw);
          if (matched) onChange(matched.value);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.emoji ? `${o.emoji} ` : ''}{o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** StreakFlame — multi-tier SVG flame whose color, size, and detail intensify with value.
 *  Tiers (by ratio of value to max):
 *   0  (<20%) ember          — muted slate/blue
 *   1  (<40%) small flame    — yellow-orange
 *   2  (<60%) medium flame   — orange
 *   3  (<80%) strong flame   — red-orange + inner yellow
 *   4  (>=80%) blazing       — deep red + inner yellow + spark
 */
function StreakFlame({ value, max = 20, size = 28, hueOverride }: {
  value: number; max?: number; size?: number;
  hueOverride?: { outer: string; inner?: string; ember?: string };
}) {
  const ratio = Math.min(1, Math.max(0, value / Math.max(1, max)));
  const tier = ratio < 0.2 ? 0 : ratio < 0.4 ? 1 : ratio < 0.6 ? 2 : ratio < 0.8 ? 3 : 4;
  const palettes = [
    { outer: '#94a3b8', inner: '#cbd5e1', ember: '#cbd5e1' }, // ember/cool
    { outer: '#fbbf24', inner: '#fde68a', ember: '#fde68a' }, // yellow
    { outer: '#fb923c', inner: '#fed7aa', ember: '#fed7aa' }, // orange
    { outer: '#f97316', inner: '#fbbf24', ember: '#fed7aa' }, // red-orange
    { outer: '#dc2626', inner: '#fbbf24', ember: '#fde047' }, // blazing
  ];
  const p = hueOverride ?? palettes[tier];

  // Outer flame path — classic teardrop with curl. Size 24x24 viewBox.
  const outerPath = 'M12 2 C 9 6, 6 8.5, 6 13 a 6 6 0 0 0 12 0 c 0 -3 -2 -5.5 -3 -7.5 c -1 1.5 -2.5 1.5 -3 0.5 c 0.5 -1.5 0 -3 0 -4 z';
  // Inner flame
  const innerPath = 'M12 9 C 10.5 11, 9.5 12, 9.5 14 a 2.5 2.5 0 0 0 5 0 c 0 -1.5 -1 -2.5 -1.5 -3.5 c -0.5 0.5 -1.2 0.5 -1.5 -0.5 z';
  // Ember (tier 0 only)
  const emberPath = 'M12 5 C 10 8, 9 10, 9 12.5 a 3 3 0 0 0 6 0 c 0 -2 -1.5 -4 -2 -5 c -0.5 0.5 -1 0.5 -1.5 -0.5 z';

  const sparkOpacity = tier >= 4 ? 1 : 0;
  const innerOpacity = tier >= 1 ? (tier === 1 ? 0.55 : 1) : 0;
  const glowOpacity = tier >= 2 ? Math.min(0.55, 0.2 + tier * 0.12) : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      {/* Soft glow halo for tier ≥2 */}
      {glowOpacity > 0 && (
        <circle cx="12" cy="14" r="9" fill={p.outer} opacity={glowOpacity * 0.35}>
          <animate attributeName="r" values="8.5;9.5;8.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Spark above flame for blazing tier */}
      {sparkOpacity > 0 && (
        <g opacity={sparkOpacity}>
          <circle cx="16" cy="3" r="0.9" fill={p.ember}>
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="cy" values="3;1.5;3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="8" cy="4" r="0.6" fill={p.ember}>
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.6s" repeatCount="indefinite" />
            <animate attributeName="cy" values="4;2.5;4" dur="2.2s" begin="0.6s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {/* Outer flame body — for tier 0 use the simpler ember path */}
      <path
        d={tier === 0 ? emberPath : outerPath}
        fill={p.outer}
      />
      {/* Inner flame */}
      {innerOpacity > 0 && (
        <path d={innerPath} fill={p.inner} opacity={innerOpacity} />
      )}
    </svg>
  );
}

/** FlameMedallion — circle badge with a number, decorated with a tier-scaled flame.
 *  Visual interest scales with `value` relative to `max`. */
function FlameMedallion({ value, max, accent }: {
  value: number; max: number; accent: 'sky' | 'violet' | 'amber' | 'emerald';
}) {
  const ratio = Math.min(1, value / Math.max(1, max));
  const tier = ratio < 0.2 ? 0 : ratio < 0.4 ? 1 : ratio < 0.6 ? 2 : ratio < 0.8 ? 3 : 4;
  const accentClasses: Record<typeof accent, string> = {
    sky: 'from-sky-100 to-sky-50 border-sky-200 text-sky-700',
    violet: 'from-violet-100 to-violet-50 border-violet-200 text-violet-700',
    amber: 'from-amber-100 to-amber-50 border-amber-200 text-amber-700',
    emerald: 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className="relative inline-flex items-center justify-center">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${accentClasses[accent]} border flex items-center justify-center text-sm font-black shadow-sm hover:scale-110 transition-transform`}>
        {value}
      </div>
      {tier >= 1 && (
        <div className="absolute -top-1.5 -end-1.5">
          <StreakFlame value={value} max={max} size={tier <= 1 ? 12 : tier === 2 ? 14 : tier === 3 ? 16 : 18} />
        </div>
      )}
    </div>
  );
}

/** ImpactRing — progressive SVG ring showing impact score 0-100 with number inside */
function ImpactRing({ value, delay = 0, size = 44 }: { value: number; delay?: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 70 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444';
  const trackColor = v >= 70 ? '#d1fae5' : v >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v / 100) }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </svg>
      <span
        className="absolute text-xs font-black tabular-nums"
        style={{ color }}
      >
        {v}
      </span>
    </div>
  );
}

/** InfoTip — info icon with a portaled tooltip that escapes overflow:hidden parents.
 *  Smart vertical flip near viewport edges. Readable text-xs size. */
export function InfoTip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({ top: 0, left: 0, placement: 'top' });

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const TIP_W = 240, TIP_H_EST = 80, GAP = 8;
    // flip below if not enough room above
    const placement: 'top' | 'bottom' = r.top > TIP_H_EST + GAP ? 'top' : 'bottom';
    let left = r.left + r.width / 2 - TIP_W / 2;
    // clamp horizontally inside viewport
    left = Math.max(8, Math.min(left, window.innerWidth - TIP_W - 8));
    const top = placement === 'top' ? r.top - GAP : r.bottom + GAP;
    setPos({ top, left, placement });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
      >
        <Info className={`w-3.5 h-3.5 transition-colors ${open ? 'text-violet-500' : 'text-slate-300'}`} />
      </span>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: 240,
            transform: pos.placement === 'top' ? 'translateY(-100%)' : 'none',
            zIndex: 9999,
          }}
          className="pointer-events-none"
        >
          <div className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-2xl leading-relaxed font-['Cairo'] text-center">
            {children}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Teacher generation (same model as TeachersTab)
   ═══════════════════════════════════════════════════════════════ */

export interface EnhancedTeacher extends TeacherProfileData {
  classes: { grade: number; section: string; campusId: string; studentCount: number }[];
  exams: number;
  assignments: number;
  lessons: number;
  attStreak: number;
  impactScore: number;
  improvementRate: number;
}

export function generateTeachers(subjectKey: string): EnhancedTeacher[] {
  const sub = (subjectKey === 'all' ? 'math' : subjectKey) as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;
  const teachers: EnhancedTeacher[] = [];
  let nameIdx = 0;
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const sections: ClassSection[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (const g of grades) {
    for (const s of sections) {
      const campusId = g <= 6 ? (s <= 'C' ? 'camp-1' : 'camp-2') : 'camp-3';
      const students = MOCK_SCHOOL_DATA.filter(st => st.grade === g && st.section === s);
      if (students.length === 0) continue;

      const teacher = TEACHER_NAMES[nameIdx % TEACHER_NAMES.length];
      nameIdx++;

      const accuracies = students.map(st => st.subjectDetails[sub]?.accuracy ?? 0).filter(a => a > 0);
      const avgAcc = accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0;
      const avgXp = Math.round(students.reduce((s, st) => s + (st.subjectXp[sub] ?? 0), 0) / students.length);

      const unitAccuracies = units.map(unit => {
        const key = `${sub}-${unit}`;
        const accs = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
        return { unit, accuracy: accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0 };
      });
      const sortedUnits = [...unitAccuracies].sort((a, b) => b.accuracy - a.accuracy);
      const bestUnit = sortedUnits[0]?.unit ?? units[0];
      const worstUnit = sortedUnits[sortedUnits.length - 1]?.unit ?? units[units.length - 1];
      const starRating = avgAcc >= 90 ? 5 : avgAcc >= 82 ? 4 : avgAcc >= 74 ? 3 : avgAcc >= 66 ? 2 : 1;

      const seed = g * 100 + s.charCodeAt(0);
      const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
        const base = avgAcc - 10 + i * 1.5;
        return Math.round(Math.max(40, Math.min(99, base + (seededRandom(seed + i * 13) * 12 - 6))));
      });
      const trendSlope = weeklyTrend[7] - weeklyTrend[0];
      const trend: 'up' | 'down' | 'stable' = trendSlope > 3 ? 'up' : trendSlope < -3 ? 'down' : 'stable';
      const engagementHours = Math.round((0.5 + seededRandom(seed + 999) * 4.5) * 10) / 10;

      const rng = (n: number) => seededRandom(seed + 5000 + n);
      const studentAvgActiveTime = Math.round((1.5 + rng(10) * 3.5) * 10) / 10;
      const studentWeeklyLoginRate = Math.round(55 + rng(11) * 40);
      const studentDailyLoginRate = Math.round(30 + rng(12) * 55);
      const attendanceMarked = rng(13) > 0.15;
      const studentEngagementScore = Math.round(
        studentWeeklyLoginRate * 0.3 + avgAcc * 0.25 + studentDailyLoginRate * 0.25 + (attendanceMarked ? 20 : 0)
      );

      const academic: 'green' | 'amber' | 'red' = avgAcc >= 80 ? 'green' : avgAcc >= 65 ? 'amber' : 'red';
      const engSignal: 'green' | 'amber' | 'red' = engagementHours >= 3 ? 'green' : engagementHours >= 1.5 ? 'amber' : 'red';
      const trendSignal: 'green' | 'amber' | 'red' = trend === 'up' ? 'green' : trend === 'stable' ? 'amber' : 'red';
      const avgStreak = students.reduce((s, st) => s + (st.weeklyActivity?.reduce((a, b) => a + b, 0) ?? 0), 0) / students.length;
      const retentionSignal: 'green' | 'amber' | 'red' = avgStreak > 350 ? 'green' : avgStreak > 200 ? 'amber' : 'red';
      const studentPushSignal: 'green' | 'amber' | 'red' = studentEngagementScore > 75 ? 'green' : studentEngagementScore >= 50 ? 'amber' : 'red';

      // Content stats (seeded like the modal)
      const cs = teacher.charCodeAt(0) + g + s.charCodeAt(0);
      const cRng = (n: number) => seededRandom(cs + n * 13);
      const exams = Math.floor(cRng(3) * 5) + 1;
      const assignments = Math.floor(cRng(2) * 20) + 5;
      const lessons = Math.floor(cRng(1) * 15) + 2;
      const attStreak = Math.floor(cRng(22) * 18) + 3;

      const improvementRate = Math.round(40 + rng(14) * 50);
      // Placeholder — final teacherScore is computed at the end of generateTeachers
      // (50% daily-activity commitment + 50% student active-time normalized to max×1.15)
      const impactScore = 0;

      teachers.push({
        id: `teacher-${g}-${s}`,
        name: teacher, campusId, grade: g, section: s,
        students, studentCount: students.length,
        avgAccuracy: avgAcc, avgXp, bestUnit, worstUnit, starRating,
        campusDelta: 0, trend, engagementHours,
        unitAccuracies, weeklyTrend,
        healthSignals: { academic, engagement: engSignal, trend: trendSignal, retention: retentionSignal, studentPush: studentPushSignal },
        studentAvgActiveTime, studentAvgXp: avgXp, studentAvgAccuracy: avgAcc,
        studentWeeklyLoginRate, studentDailyLoginRate, attendanceMarked, studentEngagementScore,
        classes: [{ grade: g, section: s, campusId, studentCount: students.length }],
        exams, assignments, lessons, attStreak,
        impactScore, improvementRate,
      });
    }
  }

  // Merge: one teacher can teach multiple sections/grades
  // Group by name and combine classes
  const byName = new Map<string, EnhancedTeacher>();
  for (const t of teachers) {
    if (byName.has(t.name)) {
      const existing = byName.get(t.name)!;
      existing.classes.push(...t.classes);
      existing.studentCount += t.studentCount;
    } else {
      byName.set(t.name, t);
    }
  }
  const merged = Array.from(byName.values());

  const campusAvgs: Record<string, number> = {};
  for (const c of CAMPUSES) {
    const ct = merged.filter(t => t.campusId === c.id);
    campusAvgs[c.id] = ct.length > 0 ? Math.round(ct.reduce((s, t) => s + t.avgAccuracy, 0) / ct.length) : 0;
  }
  for (const t of merged) {
    t.campusDelta = t.avgAccuracy - (campusAvgs[t.campusId] ?? 0);
  }

  // ── Teacher Score (replaces old "Impact Score") ──
  // 50% daily-activity commitment (avg of 7 activities' completion %)
  // 50% student weekly active time, normalized to (max teacher value × 1.15) so the leader sits ~87%
  const pulses = buildPulseData(merged as unknown as PopupTeacher[]);
  const maxActive = Math.max(...merged.map(t => t.studentAvgActiveTime), 0.01) * 1.15;
  merged.forEach((t, i) => {
    const p = pulses[i];
    const dailyCommitPct = p
      ? Math.round(ACTIVITIES.reduce((s, a) => s + p.perActivity[a.key].pct, 0) / ACTIVITIES.length)
      : 0;
    const activePct = Math.max(0, Math.min(100, Math.round((t.studentAvgActiveTime / maxActive) * 100)));
    t.impactScore = Math.max(0, Math.min(100, Math.round(0.5 * dailyCommitPct + 0.5 * activePct)));
  });

  return merged;
}

/** Compute relative status based on percentile within the current filtered pool */
function getStatus(
  teacher: EnhancedTeacher,
  accRank: number, // 0 = best
  total: number
): { key: 'top' | 'good' | 'atrisk' | 'critical'; label: string; labelEn: string; color: string; bg: string; icon: string } {
  const pct = accRank / total;
  if (pct <= 0.1) return { key: 'top', label: 'متميز', labelEn: 'Top', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '🔥' };
  if (pct <= 0.5) return { key: 'good', label: 'جيد', labelEn: 'Good', color: 'text-sky-700', bg: 'bg-sky-100', icon: '✅' };
  if (pct < 0.8) return { key: 'atrisk', label: 'مراقبة', labelEn: 'Watch', color: 'text-amber-700', bg: 'bg-amber-100', icon: '⚠️' };
  return { key: 'critical', label: 'حرج', labelEn: 'Critical', color: 'text-rose-700', bg: 'bg-rose-100', icon: '🚨' };
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function PrincipalTab({ subject, locale, onNavigate }: PrincipalTabProps) {
  const t = useCallback((ar: string, en: string) => (locale === 'ar' ? ar : en), [locale]);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(subject);
  const [filterChip, setFilterChip] = useState<FilterChip>('all');
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'term' | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('impact');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedTeacher, setSelectedTeacher] = useState<EnhancedTeacher | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [activePopup, setActivePopup] = useState<null | 'login' | 'content' | 'pulse'>(null);

  const subjectMeta = SUBJECT_META[selectedSubject] || SUBJECT_META.math;
  const teachers = useMemo(() => generateTeachers(selectedSubject), [selectedSubject]);

  // Campus filter
  const campusScoped = useMemo(() => {
    return selectedCampus === 'all' ? teachers : teachers.filter(t => t.campusId === selectedCampus);
  }, [teachers, selectedCampus]);

  // Status ranking (by accuracy, relative)
  const statusMap = useMemo(() => {
    const sorted = [...campusScoped].sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    const map = new Map<string, ReturnType<typeof getStatus>>();
    sorted.forEach((tch, idx) => {
      map.set(tch.id, getStatus(tch, idx, sorted.length));
    });
    return map;
  }, [campusScoped]);

  // School health stats
  const schoolStats = useMemo(() => {
    const n = campusScoped.length || 1;
    const avgAcc = Math.round(campusScoped.reduce((s, t) => s + t.avgAccuracy, 0) / n);
    const avgImpact = Math.round(campusScoped.reduce((s, t) => s + t.impactScore, 0) / n);
    const atRiskCount = campusScoped.filter(t => {
      const st = statusMap.get(t.id);
      return st?.key === 'atrisk' || st?.key === 'critical';
    }).length;
    const topCount = campusScoped.filter(t => statusMap.get(t.id)?.key === 'top').length;
    const totalStudents = campusScoped.reduce((s, t) => s + t.studentCount, 0);
    const avgWeeklyHours = Math.round((campusScoped.reduce((s, t) => s + t.engagementHours, 0) / n) * 10) / 10;
    const totalLessons = campusScoped.reduce((s, t) => s + t.lessons, 0);
    const avgStudentActivity = Math.round(campusScoped.reduce((s, t) => s + t.studentWeeklyLoginRate, 0) / n);
    // Content score = lessons * 3 + assignments * 2 + exams * 5 (normalized per teacher, then avg)
    const avgContentScore = Math.round(
      campusScoped.reduce((s, t) => s + Math.min(100, t.lessons * 3 + t.assignments * 2 + t.exams * 5), 0) / n
    );
    // Health composite for the green banner
    const healthyPct = Math.round(((topCount + campusScoped.filter(t => statusMap.get(t.id)?.key === 'good').length) / n) * 100);
    return {
      avgAcc, avgImpact, atRiskCount, topCount, totalStudents, totalTeachers: n,
      avgWeeklyHours, totalLessons, avgStudentActivity, avgContentScore, healthyPct,
    };
  }, [campusScoped, statusMap]);

  const availableGrades = useMemo(
    () => Array.from(new Set(campusScoped.flatMap(tch => tch.classes.map(c => c.grade)))).sort((a: number, b: number) => a - b),
    [campusScoped]
  );

  // Maxes for flame-medallion intensity scaling
  const colMax = useMemo(() => {
    return {
      exams: Math.max(...campusScoped.map(t => t.exams), 5),
      assignments: Math.max(...campusScoped.map(t => t.assignments), 10),
      lessons: Math.max(...campusScoped.map(t => t.lessons), 10),
      attStreak: Math.max(...campusScoped.map(t => t.attStreak), 15),
    };
  }, [campusScoped]);

  // Apply chip + search + grade filters
  const filteredTeachers = useMemo(() => {
    let list = [...campusScoped];

    // Chip
    if (filterChip !== 'all') {
      const sortedByAcc = [...campusScoped].sort((a, b) => b.avgAccuracy - a.avgAccuracy);
      if (filterChip === 'top10')            list = sortedByAcc.slice(0, 10);
      else if (filterChip === 'status-top')       list = list.filter(t => statusMap.get(t.id)?.key === 'top');
      else if (filterChip === 'status-good')      list = list.filter(t => statusMap.get(t.id)?.key === 'good');
      else if (filterChip === 'status-atrisk')    list = list.filter(t => statusMap.get(t.id)?.key === 'atrisk');
      else if (filterChip === 'status-critical')  list = list.filter(t => statusMap.get(t.id)?.key === 'critical');
      else if (filterChip === 'declining')   list = list.filter(t => t.trend === 'down');
      else if (filterChip === 'belowavg')    list = list.filter(t => t.avgAccuracy < schoolStats.avgAcc);
      else if (filterChip === 'rising')      list = list.filter(t => t.trend === 'up' && t.avgAccuracy < 80);
    }

    if (search) list = list.filter(t => t.name.includes(search));
    if (gradeFilter !== 'all') list = list.filter(t => t.classes.some(c => c.grade === gradeFilter));

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ar'); break;
        case 'accuracy': cmp = a.avgAccuracy - b.avgAccuracy; break;
        case 'xp': cmp = a.avgXp - b.avgXp; break;
        case 'impact': cmp = a.impactScore - b.impactScore; break;
        case 'classes': cmp = a.classes.length - b.classes.length; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [campusScoped, filterChip, search, gradeFilter, sortKey, sortDir, statusMap, schoolStats.avgAcc]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(k); setSortDir('desc'); }
  };

  /** Click a chip: toggle off if already active, otherwise set */
  const toggleChip = useCallback((chip: FilterChip) => {
    setFilterChip(prev => (prev === chip ? 'all' : chip));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 10) next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedTeachers = useMemo(
    () => teachers.filter(tch => selectedIds.has(tch.id)),
    [teachers, selectedIds]
  );

  // Top 3 performers (for hero card)
  const top3 = useMemo(
    () => [...campusScoped].sort((a, b) => b.impactScore - a.impactScore).slice(0, 3),
    [campusScoped]
  );

  return (
    <div className="p-4 lg:p-8 space-y-5 pb-24" dir={dir}>
      {/* ═══════ HEADER: Compact title + 4 inline filter pills ═══════ */}
      {(() => {
        const anyActive =
          selectedCampus !== 'all' || selectedSubject !== 'all' ||
          gradeFilter !== 'all' || timeRange !== 'all';
        const allGrades: (number | 'all')[] = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 flex-wrap p-2.5 rounded-2xl bg-gradient-to-r from-white via-violet-50/40 to-white border border-slate-200/80 shadow-sm backdrop-blur"
          >
            <div className="flex items-center gap-2 ps-1 pe-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                <School className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-['Cairo'] font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5 truncate">
                {t('لوحة قيادة المدير', 'Principal Dashboard')}
                <InfoTip>
                  {t('قارن بين المعلمين، اكتشف من يحتاج دعم، وراقب صحة المدرسة', 'Compare teachers, spot who needs support, monitor school health')}
                </InfoTip>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <FilterPill
                icon={<Building2 className="w-3.5 h-3.5" />}
                label={t('المبنى', 'Campus')}
                value={selectedCampus}
                defaultValue="all"
                onChange={setSelectedCampus}
                locale={locale}
                options={[
                  { value: 'all', label: t('كل المباني', 'All') },
                  ...CAMPUSES.map(c => ({ value: c.id, label: locale === 'ar' ? c.name : c.nameEn })),
                ]}
              />
              <FilterPill
                icon={<BookOpen className="w-3.5 h-3.5" />}
                label={t('المادة', 'Subject')}
                value={selectedSubject}
                defaultValue="all"
                onChange={setSelectedSubject}
                locale={locale}
                options={[
                  { value: 'all', label: t('كل المواد', 'All') },
                  ...Object.entries(SUBJECT_META).map(([key, val]) => ({
                    value: key, label: locale === 'ar' ? val.ar : val.en, emoji: val.emoji,
                  })),
                ]}
              />
              <FilterPill<number | 'all'>
                icon={<GraduationCap className="w-3.5 h-3.5" />}
                label={t('الصف', 'Grade')}
                value={gradeFilter}
                defaultValue="all"
                onChange={setGradeFilter}
                locale={locale}
                options={allGrades.map(g => ({
                  value: g,
                  label: g === 'all' ? t('كل الصفوف', 'All') : `${t('الصف', 'Grade')} ${g}`,
                }))}
              />
              <FilterPill
                icon={<Activity className="w-3.5 h-3.5" />}
                label={t('الفترة', 'Time')}
                value={timeRange}
                defaultValue="all"
                onChange={setTimeRange}
                locale={locale}
                options={[
                  { value: 'all', label: t('كل الوقت', 'All Time') },
                  { value: '7d', label: t('آخر ٧ أيام', 'Last 7 days') },
                  { value: '30d', label: t('آخر ٣٠ يوم', 'Last 30 days') },
                  { value: '90d', label: t('آخر ٣ شهور', 'Last 3 months') },
                  { value: 'term', label: t('هذا الفصل', 'This Term') },
                ]}
              />
              {anyActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setSelectedCampus('all');
                    setSelectedSubject('all');
                    setGradeFilter('all');
                    setTimeRange('all');
                  }}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 text-xs font-black font-['Cairo'] shadow-sm transition-all"
                  title={t('مسح كل الفلاتر', 'Clear all filters')}
                >
                  <X className="w-3 h-3" />
                  {t('مسح', 'Clear')}
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* ═══════ HERO: School-wide Teacher Score ═══════ */}
      <TeacherScoreHero
        score={schoolStats.avgImpact}
        topScore={Math.max(...campusScoped.map(t => t.impactScore), 0)}
        teacherCount={schoolStats.totalTeachers}
        locale={locale}
      />

      {/* ═══════ 6-Card School Overview Strip ═══════ */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 font-['Cairo']">
            <Trophy className="w-4 h-4" />
            {t('نظرة عامة (كل المدرسة)', 'Overview (Whole School)')}
          </h3>
          <span className="text-[10px] text-slate-400 font-bold font-['Cairo']">
            {t(`يُدرّس ${schoolStats.totalTeachers} معلم`, `${schoolStats.totalTeachers} teachers`)}
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <SchoolOverviewStat
            icon={<Users className="w-4 h-4 text-sky-500" />}
            value={schoolStats.totalStudents.toLocaleString()}
            label={t('الطلاب', 'Students')}
          />
          <SchoolOverviewStat
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            value={`${schoolStats.avgAcc}%`}
            label={t('متوسط الدقة', 'Avg Accuracy')}
            tip={t('متوسط دقة إجابات الطلاب عبر كل المعلمين والفصول الظاهرة', 'Average answer accuracy across all visible teachers & classes')}
          />
          <SchoolOverviewStat
            icon={<span className="text-violet-500 text-lg leading-none">⏱</span>}
            value={`${schoolStats.avgWeeklyHours}`}
            label={t('ساعات أسبوعية', 'Weekly Hours')}
          />
          <SchoolOverviewStat
            icon={<BookOpen className="w-4 h-4 text-amber-500" />}
            value={schoolStats.totalLessons.toLocaleString()}
            label={t('دروس منشأة', 'Lessons Created')}
            tip={t('إجمالي الدروس (سترنغز) المنشأة من قبل المعلمين على المنصة', 'Total lessons (Strings) created by teachers on the platform')}
          />
          <SchoolOverviewStat
            icon={<Heart className="w-4 h-4 text-rose-500" />}
            value={`${schoolStats.avgStudentActivity}%`}
            label={t('نشاط الطلاب', 'Student Activity')}
            tip={t('نسبة الطلاب الذين سجّلوا دخولاً وأكملوا نشاطاً خلال الأسبوع', 'Share of students who logged in and completed activity this week')}
          />
          <SchoolOverviewStat
            icon={<Zap className="w-4 h-4 text-cyan-500" />}
            value={String(schoolStats.avgContentScore)}
            label={t('نقاط المحتوى', 'Content Score')}
            tip={t('تقييم جودة وكمية المحتوى المنشأ: دروس + واجبات + اختبارات + مراجعة', 'Quality & quantity of content created: lessons + assignments + exams + reviews')}
          />
        </div>

        {/* Green "all indicators healthy" banner — shows when school is mostly healthy */}
        {schoolStats.healthyPct >= 70 && schoolStats.atRiskCount === 0 && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 font-['Cairo']">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('جميع المؤشرات صحية — أداء ممتاز', 'All indicators healthy — great performance')}</span>
          </div>
        )}
      </div>

      {/* ═══════ Quick-Insight Cards (open detailed pop-ups) ═══════ */}
      {(() => {
        const totalHours = Math.round(campusScoped.reduce((s, tc) => s + tc.engagementHours, 0) * 10) / 10;
        const inactiveCount = campusScoped.filter(tc => tc.engagementHours < 0.5).length;
        const totalContent = campusScoped.reduce((s, tc) => s + tc.lessons + tc.assignments + tc.exams, 0);

        // Today's Pulse: deterministic estimate of completion across teachers
        const pulseTotalTeachers = campusScoped.length;
        const pulseCompleted = Math.round(pulseTotalTeachers * 0.62); // ~62% on track
        const pulseBehind = Math.round(pulseTotalTeachers * 0.18);    // ~18% behind

        const cards = [
          {
            key: 'login' as const, color: '#0ea5e9',
            icon: <Lock className="w-5 h-5" />,
            title: t('متابعة الحضور والدخول', 'Login & Presence'),
            sub: t('تسجيل الدخول، الساعات الأسبوعية، وسلاسل النشاط', 'Logins, weekly hours, and activity streaks'),
            stat: `${totalHours}h`,
            statLabel: t('ساعات هذا الأسبوع', 'hours this week'),
            extra: inactiveCount > 0 ? t(`${inactiveCount} غير نشط`, `${inactiveCount} inactive`) : null,
            extraTone: 'rose' as const,
          },
          {
            key: 'content' as const, color: '#10b981',
            icon: <FileText className="w-5 h-5" />,
            title: t('إنتاج المحتوى', 'Content Production'),
            sub: t('الدروس، الواجبات، الاختبارات، ونشاط الطلاب', 'Lessons, assignments, exams, and student activity'),
            stat: String(totalContent),
            statLabel: t('عناصر منشأة', 'items created'),
            extra: t('+15% مقابل الأسبوع الماضي', '+15% vs last week'),
            extraTone: 'emerald' as const,
          },
          {
            key: 'pulse' as const, color: '#8b5cf6',
            icon: <Activity className="w-5 h-5" />,
            title: t('نبض اليوم', "Today's Pulse"),
            sub: t('نظرة سريعة على روتين كل معلم اليوم — عبر كل الفصول', 'Quick read on each teacher\'s daily routine — across all classes'),
            stat: `${pulseCompleted}/${pulseTotalTeachers}`,
            statLabel: t('أكملوا روتينهم', 'on track today'),
            extra: pulseBehind > 0 ? t(`${pulseBehind} متأخر`, `${pulseBehind} behind`) : null,
            extraTone: 'rose' as const,
          },
        ];
        const toneClass = (tone: 'rose' | 'emerald' | 'violet') =>
          tone === 'rose' ? 'bg-rose-50 text-rose-600' :
          tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
          'bg-violet-50 text-violet-600';
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cards.map((c, i) => (
              <motion.button
                key={c.key}
                onClick={() => {
                  if (c.key === 'pulse') {
                    if (onNavigate) onNavigate('pulse');
                  } else {
                    setActivePopup(c.key);
                  }
                }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="group relative text-start p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg overflow-hidden transition-shadow font-['Cairo']"
              >
                {/* Decorative blob */}
                <div className="absolute top-0 end-0 w-32 h-32 rounded-full opacity-[0.06] pointer-events-none"
                  style={{ background: c.color, transform: 'translate(35%, -35%)' }} />
                {/* Top row: icon + open arrow */}
                <div className="flex items-center justify-between mb-3 relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}dd)` }}
                  >
                    {c.icon}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 group-hover:text-slate-700 transition-colors">
                    {t('فتح', 'Open')}
                    <ArrowRight className="w-3 h-3 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </div>
                {/* Title */}
                <h3 className="text-sm font-black text-slate-800 mb-1">{c.title}</h3>
                <p className="text-[11px] text-slate-500 leading-snug mb-3 line-clamp-2">{c.sub}</p>
                {/* Stat row */}
                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black" style={{ color: c.color }}>{c.stat}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{c.statLabel}</span>
                  </div>
                  {c.extra && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${toneClass(c.extraTone)}`}>
                      {c.extra}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );
      })()}

      {/* ═══════ UNIFIED: Status Distribution + Smart Filters + Top 3 ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Merged Status & Filter widget — takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-black text-slate-800 font-['Cairo']">
                {t('توزيع المعلمين والفلاتر الذكية', 'Teacher Status & Smart Filters')}
              </h3>
              <InfoTip>{t('انقر على أي فئة أو فلتر لتصفية الجدول أدناه', 'Click any segment or filter to narrow the table below')}</InfoTip>
            </div>
            {filterChip !== 'all' && (
              <button
                onClick={() => setFilterChip('all')}
                className="text-xs text-rose-600 hover:text-white font-['Cairo'] font-black flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 border border-rose-200 hover:border-rose-500 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> {t('مسح الفلتر', 'Clear Filter')}
              </button>
            )}
          </div>

          {/* Donut + legend (acts as status filter) */}
          <StatusDistribution
            teachers={campusScoped}
            statusMap={statusMap}
            locale={locale}
            onChipClick={toggleChip}
            activeChip={filterChip}
          />

          {/* Divider */}
          <div className="border-t border-slate-100 my-4" />

          {/* Additional filter chips (trend-based, not status-based) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-['Cairo'] flex items-center gap-1 me-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              {t('فلاتر إضافية:', 'More Filters:')}
            </span>
            {([
              { key: 'all',       icon: '👥', ar: 'الكل',           en: 'All'        },
              { key: 'top10',     icon: '🔥', ar: 'الأفضل ١٠',       en: 'Top 10'    },
              { key: 'declining', icon: '📉', ar: 'أداء هابط',       en: 'Declining' },
              { key: 'belowavg',  icon: '📊', ar: 'تحت المتوسط',     en: 'Below Avg' },
              { key: 'rising',    icon: '✨', ar: 'نجوم صاعدة',      en: 'Rising'    },
            ] as const).map(chip => {
              const active = filterChip === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => chip.key === 'all' ? setFilterChip('all') : toggleChip(chip.key as FilterChip)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all border font-['Cairo'] ${
                    active
                      ? 'bg-violet-500 text-white border-violet-500 shadow-sm scale-105'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{t(chip.ar, chip.en)}</span>
                  {active && chip.key !== 'all' && <X className="w-3 h-3 ms-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top 3 Performers — 1 column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 font-['Cairo']">
                {t('أفضل ٣ معلمين', 'Top 3 Teachers')}
              </h3>
              <InfoTip>{t('ترتيب حسب نتيجة المعلم', 'Ranked by Teacher Score')}</InfoTip>
            </div>
          </div>
          <div className="space-y-2">
            {top3.map((tch, i) => (
              <button
                key={tch.id}
                onClick={() => setSelectedTeacher(tch)}
                className="w-full flex items-center gap-3 bg-slate-50 hover:bg-amber-50 rounded-xl p-3 transition-colors"
              >
                <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <TeacherAvatar name={tch.name} size={32} />
                <div className="flex-1 text-start min-w-0">
                  <div className="text-sm font-black text-slate-800 truncate font-['Cairo']">{tch.name}</div>
                  <div className="text-[10px] text-slate-500 font-['Cairo']">
                    {campusName(tch.campusId, locale)}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-lg font-black text-amber-600">{tch.impactScore}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ TEACHER TABLE ═══════ */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-['Cairo'] font-black text-slate-800 text-lg flex items-center gap-2">
              {t('قائمة المعلمين', 'Teacher Roster')}
              <InfoTip>{t('انقر على اسم المعلم لرؤية التفاصيل الكاملة', 'Click a teacher name to see full details')}</InfoTip>
            </h3>
            <p className="font-['Cairo'] text-xs text-slate-500">
              {t('حدد حتى ١٠ معلمين لمقارنتهم جنباً إلى جنب', 'Select up to 10 teachers to compare side-by-side')}
            </p>
          </div>
          {/* Avg Teacher Score chip */}
          {(() => {
            const tone = schoolStats.avgImpact >= 75 ? 'emerald' : schoolStats.avgImpact >= 55 ? 'amber' : 'rose';
            const cls = {
              emerald: 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200',
              amber:   'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200',
              rose:    'from-rose-500 to-red-600 text-rose-700 bg-rose-50 border-rose-200',
            }[tone].split(' ');
            const textBgBorder = cls.slice(2).join(' ');
            return (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm font-['Cairo'] ${textBgBorder}`}>
                <Trophy className="w-4 h-4" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-80">
                    {t('متوسط نتيجة المعلم', 'Avg Teacher Score')}
                  </span>
                  <span className="text-base font-black tabular-nums">{schoolStats.avgImpact}<span className="text-xs opacity-60">/100</span></span>
                </div>
                <InfoTip>
                  <div className="text-start space-y-1">
                    <div className="font-black">{t('نتيجة المعلم', 'Teacher Score')}</div>
                    <div>• ٥٠٪ {t('التزام يومي', 'daily commitment')}</div>
                    <div>• ٥٠٪ {t('نشاط الطلاب الأسبوعي', 'student weekly active time')}</div>
                  </div>
                </InfoTip>
              </div>
            );
          })()}
        </div>

        {/* Search only — grade & other filters live in the page header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('ابحث بالاسم...', 'Search by name...')}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-['Cairo'] focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
          </div>
          <span className="text-xs text-slate-400 font-['Cairo'] ms-auto">
            {filteredTeachers.length} {t('معلم', 'teachers')}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                      checked={filteredTeachers.length > 0 && filteredTeachers.every(tch => selectedIds.has(tch.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const next = new Set(selectedIds);
                          filteredTeachers.slice(0, 10).forEach(tch => next.add(tch.id));
                          setSelectedIds(next);
                        } else clearSelection();
                      }}
                    />
                  </th>
                  {[
                    { key: 'name' as SortKey,     label: '# ' + t('الاسم', 'Name'),           w: 'min-w-[200px]', tip: t('اسم المعلم — انقر لرؤية التفاصيل', 'Teacher name — click to view details') },
                    { key: 'name' as SortKey,     label: t('الحالة', 'Status'),                w: 'min-w-[100px]', tip: t('الحالة النسبية بناءً على دقة طلابه', 'Relative status based on student accuracy') },
                    { key: 'classes' as SortKey,  label: t('الفصول', 'Classes'),               w: 'min-w-[140px]', tip: t('الفصول التي يُدرسها المعلم', 'Classes the teacher teaches') },
                    { key: 'impact' as SortKey,   label: t('نتيجة المعلم', 'Teacher Score'),  w: 'min-w-[130px]', tip: t('٥٠٪ التزام بالأنشطة اليومية + ٥٠٪ متوسط نشاط الطلاب أسبوعياً (مُعاير على أعلى معلم × ١.١٥)', '50% daily-activity commitment + 50% avg student weekly active time (scaled to top teacher × 1.15)') },
                    { key: 'accuracy' as SortKey, label: t('الدقة', 'Accuracy'),               w: 'min-w-[160px]', tip: t('متوسط دقة إجابات الطلاب', 'Student answer accuracy') },
                    { key: 'xp' as SortKey,       label: 'XP',                                  w: 'min-w-[80px]',  tip: t('متوسط نقاط الخبرة للطالب', 'Avg XP per student') },
                    { key: 'accuracy' as SortKey, label: t('ساعات أسبوعية', 'Weekly Hours'),   w: 'min-w-[130px]', tip: t('ساعات استخدام المعلم للمنصة أسبوعياً', 'Teacher weekly platform usage hours') },
                    { key: 'accuracy' as SortKey, label: t('اختبارات', 'Exams'),                w: 'min-w-[80px]',  tip: t('عدد الاختبارات المنشأة', 'Exams created') },
                    { key: 'accuracy' as SortKey, label: t('واجبات', 'Assignments'),            w: 'min-w-[90px]',  tip: t('عدد الواجبات المعطاة', 'Assignments given') },
                    { key: 'accuracy' as SortKey, label: t('دروس', 'Lessons'),                  w: 'min-w-[80px]',  tip: t('عدد الدروس المنشأة', 'Lessons created') },
                    { key: 'accuracy' as SortKey, label: t('سلسلة حضور', 'Attend. Streak'),    w: 'min-w-[100px]', tip: t('أيام متتالية من تسجيل الحضور', 'Consecutive days of marking attendance') },
                  ].map((col, ci) => (
                    <th
                      key={ci}
                      className={`px-3 py-3 text-start text-xs font-bold text-slate-500 hover:text-slate-800 transition font-['Cairo'] ${col.w}`}
                      onClick={() => handleSort(col.key)}
                      title={col.tip}
                    >
                      <span className="flex items-center gap-1 cursor-pointer select-none">
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                        )}
                        <Info className="w-3 h-3 text-slate-300 hover:text-violet-500 transition-colors" />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-12 text-center">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-['Cairo'] font-bold">
                        {t('لا يوجد معلمون مطابقون', 'No matching teachers')}
                      </p>
                    </td>
                  </tr>
                ) : filteredTeachers.map((teacher, idx) => {
                  const rank = idx + 1;
                  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                  const status = statusMap.get(teacher.id)!;
                  const isSelected = selectedIds.has(teacher.id);

                  return (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.015 }}
                      className={`border-b border-slate-50 transition-colors group ${
                        isSelected ? 'bg-violet-50/40' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelect(teacher.id)}
                          disabled={!isSelected && selectedIds.size >= 10}
                        />
                      </td>
                      {/* Name */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-slate-400 w-6 text-center font-mono font-bold">{medal ?? rank}</span>
                          <TeacherAvatar name={teacher.name} size={32} />
                          <button
                            className="font-semibold text-slate-700 truncate hover:text-violet-600 hover:underline transition-colors font-['Cairo'] text-start"
                            onClick={() => setSelectedTeacher(teacher)}
                          >
                            {teacher.name}
                          </button>
                        </div>
                      </td>
                      {/* Status pill */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black font-['Cairo'] ${status.bg} ${status.color}`}>
                          <span>{status.icon}</span>
                          <span>{locale === 'ar' ? status.label : status.labelEn}</span>
                        </span>
                      </td>
                      {/* Classes (combined) */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {teacher.classes.slice(0, 3).map((cls, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black font-mono ${
                                cls.campusId === 'camp-1' ? 'bg-sky-100 text-sky-700' :
                                cls.campusId === 'camp-2' ? 'bg-pink-100 text-pink-700' :
                                'bg-amber-100 text-amber-700'
                              }`}
                              title={`${cls.grade}${cls.section} · ${campusName(cls.campusId, locale)} · ${cls.studentCount} ${t('طلاب', 'students')}`}
                            >
                              {cls.grade}{cls.section}
                            </span>
                          ))}
                          {teacher.classes.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">+{teacher.classes.length - 3}</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-['Cairo'] ms-1">
                            ({teacher.studentCount} {t('ط', 'st')})
                          </span>
                        </div>
                      </td>
                      {/* Impact Score — progressive ring */}
                      <td className="px-3 py-3">
                        <ImpactRing value={teacher.impactScore} delay={idx * 0.015} />
                      </td>
                      {/* Accuracy */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: getAccuracyColor(teacher.avgAccuracy) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${teacher.avgAccuracy}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.015 }}
                            />
                          </div>
                          <span className="text-xs font-bold" style={{ color: getAccuracyColor(teacher.avgAccuracy) }}>
                            {teacher.avgAccuracy}%
                          </span>
                        </div>
                      </td>
                      {/* XP */}
                      <td className="px-3 py-3 text-slate-600 font-mono text-xs">{teacher.avgXp.toLocaleString()}</td>
                      {/* Weekly Hours (teacher platform usage) */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-7 rounded-full shadow-sm ${
                            teacher.engagementHours >= 3 ? 'bg-gradient-to-b from-emerald-300 to-emerald-500' :
                            teacher.engagementHours >= 1.5 ? 'bg-gradient-to-b from-amber-300 to-amber-500' :
                            'bg-gradient-to-b from-rose-300 to-rose-500'
                          }`} />
                          <div>
                            <div className={`text-sm font-black font-['Cairo'] leading-none ${
                              teacher.engagementHours >= 3 ? 'text-emerald-600' :
                              teacher.engagementHours >= 1.5 ? 'text-amber-600' :
                              'text-rose-600'
                            }`}>
                              {teacher.engagementHours}
                              <span className="text-[10px] font-bold text-slate-400 ms-0.5">{t('س/أ', 'h/w')}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-['Cairo'] mt-0.5">
                              {teacher.engagementHours >= 3 ? t('نشط', 'active') :
                                teacher.engagementHours >= 1.5 ? t('متوسط', 'moderate') :
                                t('ضعيف', 'low')}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Exams — plain amber circle */}
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-sm font-black shadow-sm hover:scale-110 transition-transform">
                          {teacher.exams}
                        </div>
                      </td>
                      {/* Assignments — plain violet circle */}
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center text-sm font-black shadow-sm hover:scale-110 transition-transform">
                          {teacher.assignments}
                        </div>
                      </td>
                      {/* Lessons — plain sky circle */}
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-sm font-black shadow-sm hover:scale-110 transition-transform">
                          {teacher.lessons}
                        </div>
                      </td>
                      {/* Attendance streak — fixed-width pill with tiered SVG flame */}
                      <td className="px-3 py-3">
                        <div className={`inline-flex items-center justify-center gap-1.5 w-20 px-2 py-1 rounded-full text-sm font-black border shadow-sm tabular-nums ${
                          teacher.attStreak >= 10 ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700' :
                          teacher.attStreak >= 5 ? 'bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200 text-amber-700' :
                          'bg-gradient-to-br from-rose-100 to-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          <StreakFlame value={teacher.attStreak} max={colMax.attStreak} size={18} />
                          <span>{teacher.attStreak}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* ═══════ FLOATING COMPARE BAR ═══════ */}
      <AnimatePresence>
        {selectedIds.size >= 1 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3"
          >
            <div className="flex -space-s-2">
              {selectedTeachers.slice(0, 4).map(tch => (
                <div key={tch.id} className="border-2 border-slate-900 rounded-full"><TeacherAvatar name={tch.name} size={28} /></div>
              ))}
            </div>
            <span className="text-sm font-bold font-['Cairo']">
              {selectedIds.size} {t('معلم محدد', 'selected')}
            </span>
            <button
              onClick={() => setShowCompare(true)}
              disabled={selectedIds.size < 2}
              className="bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors font-['Cairo']"
            >
              {t('مقارنة', 'Compare')}
            </button>
            <button
              onClick={clearSelection}
              className="p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ COMPARE MODAL ═══════ */}
      <AnimatePresence>
        {showCompare && selectedTeachers.length >= 2 && (
          <CompareModal
            teachers={selectedTeachers}
            locale={locale}
            subject={selectedSubject}
            onClose={() => setShowCompare(false)}
            statusMap={statusMap}
          />
        )}
      </AnimatePresence>

      {/* ═══════ Teacher Profile Modal ═══════ */}
      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          teacherScore={selectedTeacher.impactScore}
          onClose={() => setSelectedTeacher(null)}
          locale={locale}
          subject={selectedSubject}
          onViewFull={(tch) => {
            setSelectedTeacher(null);
            window.location.href = `/teacher-profile?id=${tch.id}&subject=${selectedSubject}`;
          }}
        />
      )}

      {/* ═══════ Quick-Insight Pop-ups ═══════ */}
      <AnimatePresence>
        {activePopup === 'login' && (
          <LoginPresenceModal
            teachers={campusScoped as unknown as PopupTeacher[]}
            locale={locale}
            onClose={() => setActivePopup(null)}
          />
        )}
        {activePopup === 'content' && (
          <ContentProductionModal
            teachers={campusScoped as unknown as PopupTeacher[]}
            locale={locale}
            onClose={() => setActivePopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SchoolOverviewStat — matches OverviewStat from the modal
   ═══════════════════════════════════════════════════════════════ */

/** TeacherScoreHero — featured KPI banner for the school-wide Teacher Score.
 *  Documents the formula via a rich InfoTip and visually emphasises the number. */
function TeacherScoreHero({
  score, topScore, teacherCount, locale,
}: { score: number; topScore: number; teacherCount: number; locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const tone = score >= 75 ? 'emerald' : score >= 55 ? 'amber' : 'rose';
  const palette = {
    emerald: { from: 'from-emerald-500', to: 'to-teal-600', tint: 'from-emerald-50 via-white to-teal-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    amber:   { from: 'from-amber-500',   to: 'to-orange-600',  tint: 'from-amber-50 via-white to-orange-50',   text: 'text-amber-700',   ring: 'ring-amber-200' },
    rose:    { from: 'from-rose-500',    to: 'to-red-600',     tint: 'from-rose-50 via-white to-red-50',       text: 'text-rose-700',    ring: 'ring-rose-200' },
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border border-slate-200 bg-gradient-to-br ${palette.tint} shadow-sm p-3 overflow-hidden font-['Cairo']`}
    >
      <div className={`absolute top-0 end-0 w-24 h-24 rounded-full opacity-[0.08] pointer-events-none bg-gradient-to-br ${palette.from} ${palette.to}`}
        style={{ transform: 'translate(35%, -35%)' }} />

      <div className="relative flex items-center gap-3 flex-wrap">
        {/* Badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow bg-gradient-to-br ${palette.from} ${palette.to} shrink-0`}>
          <Trophy className="w-4 h-4" />
        </div>
        {/* Label + score */}
        <div className="flex items-baseline gap-2 flex-1 min-w-0">
          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {t('متوسط نتيجة المعلم', 'Avg Teacher Score')}
              <InfoTip>
                <div className="text-start space-y-1">
                  <div className="font-black mb-1">{t('كيف نحسب نتيجة المعلم؟', 'How is the Teacher Score calculated?')}</div>
                  <div>• <b>٥٠٪</b> {t('التزام المعلم بالأنشطة اليومية (متوسط إنجاز ٧ أنشطة عبر فصوله)', 'daily-activity commitment (avg of 7 activities completed across all classes)')}</div>
                  <div>• <b>٥٠٪</b> {t('متوسط نشاط الطلاب أسبوعياً (الساعات النشطة)', 'student weekly active time')}</div>
                  <div className="opacity-80 mt-1">{t('المعاير: أعلى معلم في المدرسة × ١.١٥ يساوي ١٠٠٪', 'Scale: top teacher × 1.15 maps to 100%')}</div>
                </div>
              </InfoTip>
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {t(`عبر ${teacherCount} معلم — الأعلى: ${topScore}`, `Across ${teacherCount} teachers — top: ${topScore}`)}
            </span>
          </div>
          <div className="flex items-baseline gap-0.5 ms-auto">
            <span className={`text-3xl font-black tabular-nums ${palette.text}`}>{score}</span>
            <span className="text-xs font-black text-slate-300">/100</span>
          </div>
        </div>
        {/* Formula chips — compact */}
        <div className="flex items-center gap-1.5 text-[10px] font-black">
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-violet-600">50% {t('التزام', 'Commit')}</span>
          <span className="text-slate-300">+</span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-sky-600">50% {t('نشاط', 'Active')}</span>
        </div>
      </div>
    </motion.div>
  );
}

function SchoolOverviewStat({ icon, value, label, tip }: { icon: React.ReactNode; value: string; label: string; tip?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col items-center text-center gap-1 hover:shadow-md hover:border-slate-200 transition font-['Cairo']">
      {icon}
      <div className="text-xl font-black text-slate-800 leading-none mt-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 leading-tight inline-flex items-center gap-1 justify-center">
        {label}
        {tip && <InfoTip>{tip}</InfoTip>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StatCard
   ═══════════════════════════════════════════════════════════════ */

function StatCard({
  icon, gradient, bg, value, label, tooltip,
}: {
  icon: React.ReactNode;
  gradient: string;
  bg: string;
  value: string;
  label: string;
  tooltip: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl border border-white shadow-sm p-4 relative overflow-hidden`}>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md text-white shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black text-slate-800 font-['Cairo'] leading-none">{value}</p>
          <p className="text-[11px] font-bold text-slate-500 font-['Cairo'] mt-1 flex items-center gap-1">
            {label}
            <InfoTip>{tooltip}</InfoTip>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StatusDistribution — visual chart of teacher counts per status
   ═══════════════════════════════════════════════════════════════ */

function StatusDistribution({
  teachers, statusMap, locale, onChipClick, activeChip,
}: {
  teachers: EnhancedTeacher[];
  statusMap: Map<string, ReturnType<typeof getStatus>>;
  locale: 'ar' | 'en';
  onChipClick: (chip: FilterChip) => void;
  activeChip?: FilterChip;
}) {
  const ar = locale === 'ar';
  const [hovered, setHovered] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { top: 0, good: 0, atrisk: 0, critical: 0 };
    for (const t of teachers) {
      const s = statusMap.get(t.id);
      if (s) c[s.key]++;
    }
    return c;
  }, [teachers, statusMap]);

  const total = teachers.length || 1;

  const segments: {
    key: string;
    label: string;
    icon: string;
    count: number;
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    chip: FilterChip;
  }[] = [
    { key: 'top',      label: ar ? 'متميز'  : 'Top',      icon: '🔥', count: counts.top,      color: '#10b981', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', chip: 'status-top' },
    { key: 'good',     label: ar ? 'جيد'    : 'Good',     icon: '✅', count: counts.good,     color: '#0ea5e9', textColor: 'text-sky-600',     bgColor: 'bg-sky-50',     borderColor: 'border-sky-200',     chip: 'status-good' },
    { key: 'atrisk',   label: ar ? 'مراقبة' : 'Watch',    icon: '⚠️', count: counts.atrisk,   color: '#f59e0b', textColor: 'text-amber-600',   bgColor: 'bg-amber-50',   borderColor: 'border-amber-200',   chip: 'status-atrisk' },
    { key: 'critical', label: ar ? 'حرج'    : 'Critical', icon: '🚨', count: counts.critical, color: '#ef4444', textColor: 'text-rose-600',    bgColor: 'bg-rose-50',    borderColor: 'border-rose-200',    chip: 'status-critical' },
  ];

  // Donut math
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex items-center gap-5 flex-wrap justify-center" dir="ltr">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            if (seg.count === 0) return null;
            const pct = seg.count / total;
            const dashLen = pct * circumference;
            const dashArr = `${dashLen} ${circumference}`;
            const offset = -accumulated;
            accumulated += dashLen;
            const isHovered = hovered === seg.key;
            return (
              <motion.circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={dashArr}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="cursor-pointer transition-all"
                style={{ transformOrigin: 'center' }}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: dashArr }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onChipClick(seg.chip)}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hovered ? (
            (() => {
              const seg = segments.find(s => s.key === hovered)!;
              const pct = Math.round((seg.count / total) * 100);
              return (
                <>
                  <span className="text-2xl">{seg.icon}</span>
                  <span className="text-3xl font-black" style={{ color: seg.color }}>{seg.count}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-['Cairo']">
                    {pct}% · {seg.label}
                  </span>
                </>
              );
            })()
          ) : (
            <>
              <span className="text-4xl font-black text-slate-800 font-['Cairo']">{total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-['Cairo'] mt-1">
                {ar ? 'إجمالي المعلمين' : 'Total Teachers'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend / clickable rows */}
      <div className="flex-1 min-w-[180px] space-y-1.5" dir={ar ? 'rtl' : 'ltr'}>
        {segments.map(seg => {
          const pct = Math.round((seg.count / total) * 100);
          const isHovered = hovered === seg.key;
          const isActive = activeChip === seg.chip;
          return (
            <button
              key={seg.key}
              onMouseEnter={() => setHovered(seg.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChipClick(seg.chip)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border-2 transition-all font-['Cairo'] ${
                isActive
                  ? `${seg.bgColor} ${seg.borderColor} shadow-md ring-2 ring-offset-1`
                  : isHovered
                  ? `${seg.bgColor} ${seg.borderColor} scale-[1.02] shadow-sm`
                  : 'bg-white border-transparent hover:bg-slate-50'
              }`}
              style={isActive ? { '--tw-ring-color': seg.color } as React.CSSProperties : undefined}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-base">{seg.icon}</span>
              <span className={`text-xs font-bold flex-1 text-start ${seg.textColor}`}>{seg.label}</span>
              <span className="text-sm font-black text-slate-800 font-mono w-8 text-end">{seg.count}</span>
              <span className="text-[10px] font-bold text-slate-400 w-10 text-end">{pct}%</span>
              {isActive && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: seg.color }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CompareModal — side-by-side teacher comparison
   ═══════════════════════════════════════════════════════════════ */

/* ── Per-teacher palette: stable, distinct colors keyed by teacher id ── */
const TEACHER_PALETTE = [
  '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#ef4444',
];
function teacherColor(id: string, idx: number): string {
  return TEACHER_PALETTE[idx % TEACHER_PALETTE.length];
}

/* ── Helper: build a smooth Catmull-Rom-ish path through points ── */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ═══════════════════════════════════════════════════════════════
   TrendChart — multi-line 8-week accuracy comparison
   ═══════════════════════════════════════════════════════════════ */
function TrendChart({ teachers, locale }: { teachers: EnhancedTeacher[]; locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';
  const W = 900, H = 380, padL = 50, padR = 24, padT = 24, padB = 40;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const allVals = teachers.flatMap(t => t.weeklyTrend);
  const yMinRaw = Math.min(...allVals), yMaxRaw = Math.max(...allVals);
  const yMin = Math.max(0, Math.floor((yMinRaw - 4) / 8) * 8);
  const yMax = Math.min(100, Math.ceil((yMaxRaw + 4) / 8) * 8);
  const ySpan = yMax - yMin || 1;
  const weeks = teachers[0]?.weeklyTrend.length ?? 8;
  const yTicks = 6;

  const xScale = (i: number) => padL + (i / (weeks - 1)) * innerW;
  const yScale = (v: number) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-end mb-3" dir={ar ? 'rtl' : 'ltr'}>
        {teachers.map((tch, i) => {
          const color = teacherColor(tch.id, i);
          return (
            <div key={tch.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[11px] font-bold text-slate-700 font-['Cairo']">{tch.name.split(' ')[0]}</span>
              <TrendingUp className="w-3 h-3" style={{ color }} />
            </div>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          {teachers.map((tch, i) => {
            const color = teacherColor(tch.id, i);
            return (
              <linearGradient key={tch.id} id={`trend-grad-${tch.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Y grid + labels */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = Math.round(yMin + (i / yTicks) * ySpan);
          const y = yScale(v);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="700">{v}%</text>
            </g>
          );
        })}

        {/* Hover guide */}
        {hoverIdx !== null && (
          <line x1={xScale(hoverIdx)} y1={padT} x2={xScale(hoverIdx)} y2={H - padB} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
        )}

        {/* Lines + areas */}
        {teachers.map((tch, i) => {
          const color = teacherColor(tch.id, i);
          const pts = tch.weeklyTrend.map((v, x) => ({ x: xScale(x), y: yScale(v) }));
          const linePath = smoothPath(pts);
          const areaPath = `${linePath} L ${xScale(weeks - 1)} ${H - padB} L ${xScale(0)} ${H - padB} Z`;
          return (
            <g key={tch.id}>
              <motion.path
                d={areaPath} fill={`url(#trend-grad-${tch.id})`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: i * 0.05 }}
              />
              <motion.path
                d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
              />
              {pts.map((p, k) => (
                <circle key={k} cx={p.x} cy={p.y} r={hoverIdx === k ? 5 : 3.5} fill="white" stroke={color} strokeWidth="2"
                  onMouseEnter={() => setHoverIdx(k)} style={{ cursor: 'pointer', transition: 'r 0.15s' }} />
              ))}
            </g>
          );
        })}

        {/* X labels (weeks) */}
        {Array.from({ length: weeks }).map((_, i) => (
          <text key={i} x={xScale(i)} y={H - padB + 22} fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="700"
            fontFamily="Cairo, sans-serif">
            {ar ? `أسبوع ${i + 1}` : `W${i + 1}`}
          </text>
        ))}

        {/* Tooltip */}
        {hoverIdx !== null && (() => {
          const tipX = xScale(hoverIdx);
          const onRight = tipX > W - 200;
          const tx = onRight ? tipX - 180 : tipX + 12;
          const th = 24 + teachers.length * 18;
          return (
            <g pointerEvents="none">
              <rect x={tx} y={padT} width="170" height={th} rx="10" fill="white" stroke="#e2e8f0" />
              <text x={tx + 10} y={padT + 16} fontSize="11" fontWeight="800" fill="#475569" fontFamily="Cairo, sans-serif">
                {ar ? `أسبوع ${hoverIdx + 1}` : `Week ${hoverIdx + 1}`}
              </text>
              {teachers.map((tch, i) => (
                <g key={tch.id}>
                  <circle cx={tx + 14} cy={padT + 32 + i * 18} r="4" fill={teacherColor(tch.id, i)} />
                  <text x={tx + 24} y={padT + 36 + i * 18} fontSize="11" fill="#334155" fontFamily="Cairo, sans-serif">
                    {tch.name.split(' ')[0]}
                  </text>
                  <text x={tx + 158} y={padT + 36 + i * 18} fontSize="11" fontWeight="800" fill="#0f172a" textAnchor="end">
                    {tch.weeklyTrend[hoverIdx]}%
                  </text>
                </g>
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RadarChart — 5-axis multi-teacher shape comparison
   ═══════════════════════════════════════════════════════════════ */
function RadarChart({ teachers, locale }: { teachers: EnhancedTeacher[]; locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';
  const size = 460, cx = size / 2, cy = size / 2 + 10, R = 170;
  const axes = [
    { key: 'impact', labelAr: 'التأثير', labelEn: 'Impact' },
    { key: 'accuracy', labelAr: 'الدقة', labelEn: 'Accuracy' },
    { key: 'engagement', labelAr: 'التفاعل', labelEn: 'Engagement' },
    { key: 'hours', labelAr: 'الساعات', labelEn: 'Hours' },
    { key: 'improvement', labelAr: 'التحسن', labelEn: 'Improvement' },
  ];
  const getAxisVal = (tch: EnhancedTeacher, key: string): number => {
    switch (key) {
      case 'impact': return tch.impactScore;
      case 'accuracy': return tch.avgAccuracy;
      case 'engagement': return tch.studentEngagementScore;
      case 'hours': return Math.min(100, (tch.engagementHours / 5) * 100);
      case 'improvement': return tch.improvementRate;
      default: return 0;
    }
  };
  const angle = (i: number) => -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
  const point = (i: number, v: number) => ({
    x: cx + Math.cos(angle(i)) * R * (v / 100),
    y: cy + Math.sin(angle(i)) * R * (v / 100),
  });
  const rings = [20, 40, 60, 80, 100];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap gap-2 justify-end mb-3" dir={ar ? 'rtl' : 'ltr'}>
        {teachers.map((tch, i) => (
          <div key={tch.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="w-2 h-2 rounded-full" style={{ background: teacherColor(tch.id, i) }} />
            <span className="text-[11px] font-bold text-slate-700 font-['Cairo']">{tch.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${size} ${size + 20}`} className="w-full h-auto max-w-[520px] mx-auto block">
        {/* Rings */}
        {rings.map(r => (
          <polygon key={r}
            points={axes.map((_, i) => {
              const p = point(i, r);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none" stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* Axis lines + labels */}
        {axes.map((a, i) => {
          const end = point(i, 100);
          const labelP = point(i, 118);
          return (
            <g key={a.key}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={labelP.x} y={labelP.y} fontSize="12" fontWeight="800" fill="#475569" textAnchor="middle"
                dominantBaseline="middle" fontFamily="Cairo, sans-serif">
                {ar ? a.labelAr : a.labelEn}
              </text>
            </g>
          );
        })}
        {/* Teacher polygons */}
        {teachers.map((tch, ti) => {
          const color = teacherColor(tch.id, ti);
          const pts = axes.map((a, i) => point(i, getAxisVal(tch, a.key)));
          const path = pts.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <g key={tch.id}>
              <motion.polygon points={path} fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2"
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: ti * 0.08 }} style={{ transformOrigin: `${cx}px ${cy}px` }} />
              {pts.map((p, k) => (
                <circle key={k} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ScatterChart — Accuracy × Impact, bubble size = student count
   ═══════════════════════════════════════════════════════════════ */
function ScatterChart({ teachers, locale }: { teachers: EnhancedTeacher[]; locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';
  const W = 760, H = 420, padL = 56, padR = 24, padT = 24, padB = 50;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xScale = (v: number) => padL + (v / 100) * innerW;
  const yScale = (v: number) => padT + (1 - v / 100) * innerH;
  const maxStudents = Math.max(...teachers.map(t => t.studentCount), 1);
  const rScale = (s: number) => 8 + (s / maxStudents) * 22;
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs text-slate-500 font-bold font-['Cairo']">
          {ar ? 'حجم الدائرة = عدد الطلاب' : 'Bubble size = student count'}
        </div>
        <div className="flex flex-wrap gap-2 justify-end" dir={ar ? 'rtl' : 'ltr'}>
          {teachers.map((tch, i) => (
            <div key={tch.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="w-2 h-2 rounded-full" style={{ background: teacherColor(tch.id, i) }} />
              <span className="text-[11px] font-bold text-slate-700 font-['Cairo']">{tch.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Quadrant tints */}
        <rect x={xScale(50)} y={padT} width={xScale(100) - xScale(50)} height={yScale(50) - padT} fill="#10b98108" />
        <rect x={padL} y={yScale(50)} width={xScale(50) - padL} height={(H - padB) - yScale(50)} fill="#ef444408" />
        {/* Quadrant divider lines */}
        <line x1={xScale(50)} y1={padT} x2={xScale(50)} y2={H - padB} stroke="#e2e8f0" strokeDasharray="4 4" />
        <line x1={padL} y1={yScale(50)} x2={W - padR} y2={yScale(50)} stroke="#e2e8f0" strokeDasharray="4 4" />
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={`x${v}`}>
            <text x={xScale(v)} y={H - padB + 18} fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="700">{v}</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={`y${v}`}>
            <text x={padL - 8} y={yScale(v) + 4} fontSize="11" fill="#94a3b8" textAnchor="end" fontWeight="700">{v}</text>
          </g>
        ))}
        {/* Axes labels */}
        <text x={W / 2} y={H - 8} fontSize="12" fontWeight="800" fill="#475569" textAnchor="middle" fontFamily="Cairo, sans-serif">
          {ar ? 'الدقة %' : 'Accuracy %'}
        </text>
        <text x={14} y={H / 2} fontSize="12" fontWeight="800" fill="#475569" textAnchor="middle" fontFamily="Cairo, sans-serif"
          transform={`rotate(-90 14 ${H / 2})`}>
          {ar ? 'نتيجة المعلم' : 'Teacher Score'}
        </text>
        {/* Quadrant labels */}
        <text x={xScale(75)} y={padT + 16} fontSize="10" fontWeight="800" fill="#10b981" textAnchor="middle" fontFamily="Cairo, sans-serif">
          {ar ? '⭐ نجوم' : '⭐ Stars'}
        </text>
        <text x={xScale(25)} y={H - padB - 6} fontSize="10" fontWeight="800" fill="#ef4444" textAnchor="middle" fontFamily="Cairo, sans-serif">
          {ar ? '⚠ يحتاج دعم' : '⚠ Needs Support'}
        </text>
        {/* Bubbles */}
        {teachers.map((tch, i) => {
          const color = teacherColor(tch.id, i);
          const cxv = xScale(tch.avgAccuracy), cyv = yScale(tch.impactScore), rv = rScale(tch.studentCount);
          const isHover = hoverId === tch.id;
          return (
            <g key={tch.id} onMouseEnter={() => setHoverId(tch.id)} onMouseLeave={() => setHoverId(null)} style={{ cursor: 'pointer' }}>
              <motion.circle cx={cxv} cy={cyv} r={rv} fill={color} fillOpacity={isHover ? 0.85 : 0.55} stroke={color} strokeWidth={isHover ? 3 : 2}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.06, type: 'spring', stiffness: 200 }}
                style={{ transformOrigin: `${cxv}px ${cyv}px` }} />
              <text x={cxv} y={cyv + 4} fontSize="11" fontWeight="900" fill="white" textAnchor="middle" pointerEvents="none">
                {tch.name.split(' ')[0].slice(0, 4)}
              </text>
            </g>
          );
        })}
        {/* Tooltip */}
        {hoverId && (() => {
          const tch = teachers.find(t => t.id === hoverId)!;
          const tx = Math.min(W - 190, xScale(tch.avgAccuracy) + 14);
          const ty = Math.max(padT, yScale(tch.impactScore) - 60);
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width="180" height="74" rx="10" fill="white" stroke="#e2e8f0" />
              <text x={tx + 10} y={ty + 18} fontSize="12" fontWeight="900" fill="#0f172a" fontFamily="Cairo, sans-serif">{tch.name}</text>
              <text x={tx + 10} y={ty + 36} fontSize="11" fill="#475569" fontFamily="Cairo, sans-serif">
                {ar ? `الدقة: ${tch.avgAccuracy}%` : `Accuracy: ${tch.avgAccuracy}%`}
              </text>
              <text x={tx + 10} y={ty + 52} fontSize="11" fill="#475569" fontFamily="Cairo, sans-serif">
                {ar ? `النتيجة: ${tch.impactScore}` : `Score: ${tch.impactScore}`}
              </text>
              <text x={tx + 10} y={ty + 68} fontSize="11" fill="#475569" fontFamily="Cairo, sans-serif">
                {ar ? `الطلاب: ${tch.studentCount}` : `Students: ${tch.studentCount}`}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function CompareModal({
  teachers, locale, subject, onClose, statusMap,
}: {
  teachers: EnhancedTeacher[];
  locale: 'ar' | 'en';
  subject: string;
  onClose: () => void;
  statusMap: Map<string, ReturnType<typeof getStatus>>;
}) {
  const ar = locale === 'ar';
  type CompareView = 'metrics' | 'trend' | 'radar' | 'scatter';
  const [view, setView] = useState<CompareView>('metrics');

  const metrics = [
    { key: 'impact', labelAr: 'نتيجة المعلم', labelEn: 'Teacher Score', suffix: '', higherBetter: true },
    { key: 'accuracy', labelAr: 'الدقة', labelEn: 'Accuracy', suffix: '%', higherBetter: true },
    { key: 'avgXp', labelAr: 'XP', labelEn: 'XP', suffix: '', higherBetter: true, format: (v: number) => v.toLocaleString() },
    { key: 'engagement', labelAr: 'تفاعل الطلاب', labelEn: 'Engagement', suffix: '', higherBetter: true },
    { key: 'hours', labelAr: 'ساعات/أسبوع', labelEn: 'Hours/week', suffix: 'h', higherBetter: true },
    { key: 'exams', labelAr: 'اختبارات', labelEn: 'Exams', suffix: '', higherBetter: true },
    { key: 'assignments', labelAr: 'واجبات', labelEn: 'Assignments', suffix: '', higherBetter: true },
    { key: 'lessons', labelAr: 'دروس', labelEn: 'Lessons', suffix: '', higherBetter: true },
    { key: 'attStreak', labelAr: 'سلسلة حضور', labelEn: 'Att. Streak', suffix: '', higherBetter: true },
    { key: 'improvement', labelAr: 'معدل التحسن', labelEn: 'Improvement', suffix: '%', higherBetter: true },
  ];

  const getVal = (tch: EnhancedTeacher, key: string): number => {
    switch (key) {
      case 'impact': return tch.impactScore;
      case 'accuracy': return tch.avgAccuracy;
      case 'avgXp': return tch.avgXp;
      case 'engagement': return tch.studentEngagementScore;
      case 'hours': return tch.engagementHours;
      case 'exams': return tch.exams;
      case 'assignments': return tch.assignments;
      case 'lessons': return tch.lessons;
      case 'attStreak': return tch.attStreak;
      case 'improvement': return tch.improvementRate;
      default: return 0;
    }
  };

  const tabs: { key: CompareView; ar: string; en: string; icon: React.ReactNode }[] = [
    { key: 'metrics', ar: 'المؤشرات', en: 'Metrics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'trend', ar: 'الاتجاه (٨ أسابيع)', en: 'Trend (8 weeks)', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'radar', ar: 'الرادار', en: 'Radar', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'scatter', ar: 'الدقة × التأثير', en: 'Accuracy × Impact', icon: <Target className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
      dir={ar ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl border border-white flex flex-col font-['Cairo']"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              {ar ? `مقارنة ${teachers.length} معلمين` : `Compare ${teachers.length} Teachers`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {view === 'metrics' && (ar ? 'الأفضل في كل مؤشر مُميّز باللون الأخضر' : 'Best on each metric highlighted in green')}
              {view === 'trend' && (ar ? 'دقة كل معلم على مدار آخر ٨ أسابيع' : 'Each teacher\'s accuracy over the last 8 weeks')}
              {view === 'radar' && (ar ? 'شكل الأداء عبر ٥ محاور — الأكبر = الأقوى' : 'Performance shape across 5 axes — bigger = stronger')}
              {view === 'scatter' && (ar ? 'الربع العلوي الأيمن = نجوم، السفلي الأيسر = يحتاجون دعم' : 'Top-right = stars, bottom-left = needs support')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 border-b border-slate-100 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-black transition-all ${
                view === tab.key
                  ? 'bg-violet-50 text-violet-700 border-x border-t border-violet-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {ar ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {view === 'metrics' && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-start text-xs font-black text-slate-500 min-w-[140px] sticky start-0 bg-white z-10">
                    {ar ? 'المؤشر' : 'Metric'}
                  </th>
                  {teachers.map((tch, ti) => {
                    const st = statusMap.get(tch.id);
                    const color = teacherColor(tch.id, ti);
                    return (
                      <th key={tch.id} className="p-3 min-w-[150px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <TeacherAvatar name={tch.name} size={44} />
                            <span className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full border-2 border-white" style={{ background: color }} />
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-black text-slate-800 truncate max-w-[140px]">{tch.name}</div>
                            <div className="text-[10px] text-slate-400">{campusName(tch.campusId, locale)}</div>
                          </div>
                          {st && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${st.bg} ${st.color}`}>
                              {st.icon} {locale === 'ar' ? st.label : st.labelEn}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, mi) => {
                  const values = teachers.map(tch => getVal(tch, m.key));
                  const max = Math.max(...values);
                  const min = Math.min(...values);
                  return (
                    <tr key={m.key} className={`border-t border-slate-100 ${mi % 2 === 0 ? 'bg-slate-50/40' : ''}`}>
                      <td className="p-3 text-xs font-bold text-slate-600 sticky start-0 bg-inherit z-10">
                        {ar ? m.labelAr : m.labelEn}
                      </td>
                      {teachers.map((tch, ti) => {
                        const v = values[ti];
                        const isBest = v === max && max !== min;
                        const isWorst = v === min && max !== min;
                        return (
                          <td key={tch.id} className="p-3 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-black ${
                              isBest ? 'bg-emerald-100 text-emerald-700' :
                              isWorst ? 'bg-rose-50 text-rose-600' :
                              'text-slate-700'
                            }`}>
                              {m.format ? m.format(v) : v}{m.suffix}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {view === 'trend' && <TrendChart teachers={teachers} locale={locale} />}
          {view === 'radar' && <RadarChart teachers={teachers} locale={locale} />}
          {view === 'scatter' && <ScatterChart teachers={teachers} locale={locale} />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            {ar ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PrincipalTab;
