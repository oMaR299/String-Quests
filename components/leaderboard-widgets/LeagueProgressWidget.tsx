import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowUpCircle, Crown, Sparkles } from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  type StudentProfile,
  type League,
} from '../../data/complexLeaderboardData';

interface LeagueProgressWidgetProps {
  locale?: 'ar' | 'en';
  highlightStudentId?: string;
  className?: string;
}

const LEAGUE_CONFIG: {
  key: League;
  ar: string;
  en: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  minXp: number;
  maxXp: number;
}[] = [
  { key: 'diamond', ar: 'الماسي', en: 'Diamond', color: '#B9F2FF', bg: 'bg-cyan-50', border: 'border-cyan-200', icon: '💎', minXp: 10000, maxXp: Infinity },
  { key: 'platinum', ar: 'البلاتيني', en: 'Platinum', color: '#E5E4E2', bg: 'bg-slate-50', border: 'border-slate-200', icon: '🏆', minXp: 5000, maxXp: 9999 },
  { key: 'gold', ar: 'الذهبي', en: 'Gold', color: '#FFD700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '⭐', minXp: 2500, maxXp: 4999 },
  { key: 'silver', ar: 'الفضي', en: 'Silver', color: '#C0C0C0', bg: 'bg-gray-50', border: 'border-gray-200', icon: '🥈', minXp: 1000, maxXp: 2499 },
  { key: 'bronze', ar: 'البرونزي', en: 'Bronze', color: '#CD7F32', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🥉', minXp: 0, maxXp: 999 },
];

const LEAGUE_THRESHOLDS = [
  { label: 'Bronze', labelAr: 'البرونزي', xp: 0, color: '#CD7F32' },
  { label: 'Silver', labelAr: 'الفضي', xp: 1000, color: '#C0C0C0' },
  { label: 'Gold', labelAr: 'الذهبي', xp: 2500, color: '#FFD700' },
  { label: 'Platinum', labelAr: 'البلاتيني', xp: 5000, color: '#E5E4E2' },
  { label: 'Diamond', labelAr: 'الماسي', xp: 10000, color: '#B9F2FF' },
];

const PROMOTION_TIMES_AR = ['منذ ساعة', 'منذ 3 ساعات', 'منذ 5 ساعات', 'منذ يوم', 'منذ يومين'];
const PROMOTION_TIMES_EN = ['1 hour ago', '3 hours ago', '5 hours ago', '1 day ago', '2 days ago'];

function getLeagueFromXp(xp: number): League {
  if (xp >= 10000) return 'diamond';
  if (xp >= 5000) return 'platinum';
  if (xp >= 2500) return 'gold';
  if (xp >= 1000) return 'silver';
  return 'bronze';
}

export function LeagueProgressWidget({
  locale = 'ar',
  highlightStudentId,
  className = '',
}: LeagueProgressWidgetProps) {
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';

  const totalStudents = MOCK_SCHOOL_DATA.length;

  // League distribution
  const distribution = useMemo(() => {
    const counts: Record<League, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
    MOCK_SCHOOL_DATA.forEach((s) => counts[s.league]++);
    return LEAGUE_CONFIG.map((cfg) => ({
      ...cfg,
      count: counts[cfg.key],
      pct: Math.round((counts[cfg.key] / totalStudents) * 100),
    }));
  }, [totalStudents]);

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Highlighted student
  const highlightedStudent = useMemo(
    () => (highlightStudentId ? MOCK_SCHOOL_DATA.find((s) => s.id === highlightStudentId) : null),
    [highlightStudentId]
  );

  // Mock promotions: pick students near thresholds
  const promotions = useMemo(() => {
    const promoted: { student: StudentProfile; toLeague: League; timeAgo: string }[] = [];
    const shuffled = [...MOCK_SCHOOL_DATA].sort(() => Math.random() - 0.5);

    for (const s of shuffled) {
      if (promoted.length >= 5) break;
      const league = getLeagueFromXp(s.totalXp);
      if (league !== 'bronze') {
        promoted.push({
          student: s,
          toLeague: league,
          timeAgo: locale === 'ar'
            ? PROMOTION_TIMES_AR[promoted.length]
            : PROMOTION_TIMES_EN[promoted.length],
        });
      }
    }
    return promoted;
  }, [locale]);

  // League leaders
  const leagueLeaders = useMemo(() => {
    const grouped: Record<League, StudentProfile[]> = { bronze: [], silver: [], gold: [], platinum: [], diamond: [] };
    MOCK_SCHOOL_DATA.forEach((s) => grouped[s.league].push(s));
    Object.keys(grouped).forEach((league) => {
      grouped[league as League].sort((a, b) => b.totalXp - a.totalXp);
    });
    return grouped;
  }, []);

  // XP progress bar calculations
  const xpBarMax = 12000;
  const markerPositions = LEAGUE_THRESHOLDS.map((th) => ({
    ...th,
    pct: Math.min((th.xp / xpBarMax) * 100, 100),
  }));

  const highlightPct = highlightedStudent
    ? Math.min((highlightedStudent.totalXp / xpBarMax) * 100, 100)
    : null;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm font-['Cairo'] ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-black text-slate-900">{t('تقدم الدوريات', 'League Progress')}</h2>
      </div>

      {/* Section 1: League Distribution Funnel */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          {t('توزيع الدوريات', 'League Distribution')}
        </h3>
        <div className="space-y-2">
          {distribution.map((tier, i) => (
            <motion.div
              key={tier.key}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <span className="text-lg w-7 text-center shrink-0">{tier.icon}</span>
              <span className="text-xs font-bold text-slate-700 w-16 shrink-0">
                {locale === 'ar' ? tier.ar : tier.en}
              </span>
              <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                <motion.div
                  className="h-full rounded-lg flex items-center justify-end px-2"
                  style={{ backgroundColor: tier.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((tier.count / maxCount) * 100, 8)}%` }}
                  transition={{ delay: i * 0.12 + 0.2, duration: 0.6, ease: 'easeOut' }}
                >
                  <span className="text-[11px] font-black text-slate-800">{tier.count}</span>
                </motion.div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 w-10 text-end">{tier.pct}%</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section 2: XP Thresholds */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          {t('حدود XP للدوريات', 'XP Thresholds')}
        </h3>
        <div className="relative pt-6 pb-2">
          {/* Track */}
          <div className="h-3 bg-slate-100 rounded-full relative overflow-visible">
            {/* Gradient fill up to highlighted student or full bar */}
            <motion.div
              className="absolute inset-y-0 rounded-full"
              style={{
                background: 'linear-gradient(to right, #CD7F32, #C0C0C0, #FFD700, #E5E4E2, #B9F2FF)',
              }}
              initial={{ width: 0 }}
              animate={{ width: highlightPct != null ? `${highlightPct}%` : '100%' }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          {/* Threshold markers */}
          <div className="relative h-8 mt-1">
            {markerPositions.map((m, i) => (
              <div
                key={m.xp}
                className="absolute flex flex-col items-center"
                style={{ [isRTL ? 'right' : 'left']: `${m.pct}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm -mt-5"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-[9px] font-bold text-slate-500 mt-0.5 whitespace-nowrap">
                  {m.xp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Highlighted student marker */}
          {highlightedStudent && highlightPct != null && (
            <motion.div
              className="absolute top-0"
              style={{ [isRTL ? 'right' : 'left']: `${highlightPct}%`, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold whitespace-nowrap shadow-lg">
                  {highlightedStudent.name} — {highlightedStudent.totalXp.toLocaleString()} XP
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-indigo-600" />
              </div>
            </motion.div>
          )}
        </div>

        {/* XP range labels */}
        <div className="flex flex-wrap gap-2 mt-2">
          {LEAGUE_CONFIG.slice().reverse().map((cfg) => (
            <span
              key={cfg.key}
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.border} border`}
            >
              {cfg.icon} {locale === 'ar' ? cfg.ar : cfg.en}: {cfg.minXp.toLocaleString()}
              {cfg.maxXp === Infinity ? '+' : `–${cfg.maxXp.toLocaleString()}`} XP
            </span>
          ))}
        </div>
      </div>

      {/* Section 3: Recent Promotions */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {t('ترقيات حديثة', 'Recent Promotions')}
        </h3>
        <div className="space-y-2">
          {promotions.map((promo, i) => {
            const leagueCfg = LEAGUE_CONFIG.find((c) => c.key === promo.toLeague)!;
            return (
              <motion.div
                key={promo.student.id}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.4, duration: 0.35 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/60 to-orange-50/40"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {promo.student.name.slice(0, 2)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{promo.student.name}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <ArrowUpCircle className="w-3 h-3 text-emerald-500" />
                    {t(`ترقية إلى ${leagueCfg.ar}`, `Promoted to ${leagueCfg.en}`)}
                  </p>
                </div>
                {/* League icon + time */}
                <span className="text-base">{leagueCfg.icon}</span>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{promo.timeAgo}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 4: League Leaders */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          {t('قادة الدوريات', 'League Leaders')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEAGUE_CONFIG.map((cfg) => {
            const students = leagueLeaders[cfg.key];
            if (students.length === 0) return null;
            const isDiamond = cfg.key === 'diamond';
            const shown = isDiamond ? students : students.slice(0, 3);
            const remaining = isDiamond ? 0 : Math.max(0, students.length - 3);

            return (
              <div key={cfg.key} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className="text-xs font-bold text-slate-700">
                    {locale === 'ar' ? cfg.ar : cfg.en}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium ms-auto">
                    {students.length} {t('طالب', 'students')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {shown.map((s, si) => (
                    <div key={s.id} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 font-bold text-slate-400">{si + 1}</span>
                      <span className="font-semibold text-slate-700 truncate flex-1">{s.name}</span>
                      <span className="font-bold text-slate-500">{s.totalXp.toLocaleString()}</span>
                    </div>
                  ))}
                  {remaining > 0 && (
                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                      {t(`و${remaining} آخرون`, `and ${remaining} others`)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeagueProgressWidget;
