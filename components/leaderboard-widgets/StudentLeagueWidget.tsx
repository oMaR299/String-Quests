import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calculator, FlaskConical, Languages, Landmark,
  Palette, Moon, Globe, Monitor, Atom, Beaker, Leaf, Users,
  ChevronLeft, ChevronRight, Crown, Sparkles, RotateCcw,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  type Subject,
  type StudentProfile,
  type League,
} from '../../data/complexLeaderboardData';

/* ─── Types ────────────────────────────────────────────────────── */

type SubjectKey = Exclude<Subject, 'all'>;

interface StudentLeagueWidgetProps {
  subject: string;
  grade: number;
  currentStudentId?: string;
  locale?: 'ar' | 'en';
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

/* ─── Constants ────────────────────────────────────────────────── */

const LEAGUE_CONFIG: {
  key: League;
  ar: string;
  en: string;
  color: string;
  emoji: string;
  minXp: number;
}[] = [
  { key: 'diamond',  ar: 'الماسي',    en: 'Diamond',  color: '#38bdf8', emoji: '💎', minXp: 400 },
  { key: 'platinum', ar: 'البلاتيني', en: 'Platinum', color: '#a78bfa', emoji: '🏆', minXp: 300 },
  { key: 'gold',     ar: 'الذهبي',    en: 'Gold',     color: '#fbbf24', emoji: '🥇', minXp: 200 },
  { key: 'silver',   ar: 'الفضي',     en: 'Silver',   color: '#94a3b8', emoji: '🥈', minXp: 100 },
  { key: 'bronze',   ar: 'البرونزي',  en: 'Bronze',   color: '#d97706', emoji: '🥉', minXp: 0   },
];

const SUBJECT_AR: Record<string, string> = {
  math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', history: 'التاريخ',
  arts: 'الفنون', islamic: 'التربية الإسلامية', english: 'الإنجليزية',
  computer: 'الحاسب', physics: 'الفيزياء', chemistry: 'الكيمياء',
  biology: 'الأحياء', social: 'الاجتماعيات',
};

const SUBJECT_EN: Record<string, string> = {
  math: 'Math', science: 'Science', languages: 'Languages', history: 'History',
  arts: 'Arts', islamic: 'Islamic Studies', english: 'English',
  computer: 'Computer Science', physics: 'Physics', chemistry: 'Chemistry',
  biology: 'Biology', social: 'Social Studies',
};

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  math: Calculator, science: FlaskConical, languages: Languages, history: Landmark,
  arts: Palette, islamic: Moon, english: Globe, computer: Monitor,
  physics: Atom, chemistry: Beaker, biology: Leaf, social: Users,
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-emerald-600',
];

const MONTH_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── Helpers ──────────────────────────────────────────────────── */

function getLeagueFromXp(xp: number): typeof LEAGUE_CONFIG[number] {
  for (const league of LEAGUE_CONFIG) {
    if (xp >= league.minXp) return league;
  }
  return LEAGUE_CONFIG[LEAGUE_CONFIG.length - 1];
}

function getNextLeague(current: typeof LEAGUE_CONFIG[number]): typeof LEAGUE_CONFIG[number] | null {
  const idx = LEAGUE_CONFIG.findIndex(l => l.key === current.key);
  return idx > 0 ? LEAGUE_CONFIG[idx - 1] : null;
}

function getWeeklyXp(student: StudentProfile, subject: string, weekOffset: number): number {
  const base = student.timeframeScores.weekly || ((student.subjectXp as any)[subject] ?? student.totalXp) / 4;
  if (weekOffset === 0) return Math.round(base);
  const seed = (student.id.charCodeAt(3) || 0) + weekOffset * 7;
  const factor = 0.6 + (((seed * 9301 + 49297) % 233280) / 233280) * 0.8;
  return Math.round(base * factor);
}

function getStudentAccuracy(student: StudentProfile, subject: string): number {
  const details = student.subjectDetails as any;
  if (details[subject]?.accuracy) return details[subject].accuracy;
  return 70 + Math.floor(((student.id.charCodeAt(4) || 0) * 17) % 30);
}

function getAvatarGradient(id: string): string {
  const idx = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function getWeekRange(offset: number, locale: 'ar' | 'en'): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek + (offset * 7));
  sunday.setHours(0, 0, 0, 0);
  const thursday = new Date(sunday);
  thursday.setDate(sunday.getDate() + 4);

  const months = locale === 'ar' ? MONTH_AR : MONTH_EN;
  const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
  const label = locale === 'ar'
    ? `${fmt(sunday)} - ${fmt(thursday)}`
    : `${fmt(sunday)} - ${fmt(thursday)}`;
  return { start: sunday, end: thursday, label };
}

/* ─── Shimmer CSS ──────────────────────────────────────────────── */

const shimmerStyle: React.CSSProperties = {
  backgroundSize: '200% 100%',
  animation: 'shimmer 2.5s linear infinite',
};

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(56,189,248,0.25); }
  50% { box-shadow: 0 0 16px 6px rgba(56,189,248,0.45); }
}
`;

/* ─── Component ────────────────────────────────────────────────── */

export function StudentLeagueWidget({
  subject,
  grade,
  currentStudentId,
  locale = 'ar',
  onStudentClick,
  className = '',
}: StudentLeagueWidgetProps) {
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';
  const listRef = useRef<HTMLDivElement>(null);

  const [weekOffset, setWeekOffset] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');

  const subjectKey = subject as SubjectKey;
  const SubjectIcon = SUBJECT_ICONS[subjectKey] || BookOpen;
  const subjectName = locale === 'ar' ? (SUBJECT_AR[subjectKey] || subject) : (SUBJECT_EN[subjectKey] || subject);
  const weekRange = getWeekRange(weekOffset, locale);
  const isCurrentWeek = weekOffset === 0;

  // Filter students by grade, compute weekly XP, sort descending
  const rankedStudents = useMemo(() => {
    const filtered = MOCK_SCHOOL_DATA.filter(s => s.grade === grade);
    const withXp = filtered.map(s => ({
      student: s,
      weeklyXp: getWeeklyXp(s, subjectKey, weekOffset),
      accuracy: getStudentAccuracy(s, subjectKey),
    }));
    withXp.sort((a, b) => b.weeklyXp - a.weeklyXp);
    return withXp.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      league: getLeagueFromXp(item.weeklyXp),
    }));
  }, [grade, subjectKey, weekOffset]);

  const currentStudentEntry = useMemo(
    () => rankedStudents.find(r => r.student.id === currentStudentId),
    [rankedStudents, currentStudentId],
  );

  const top3 = rankedStudents.slice(0, 3);

  // Auto-scroll to current student
  useEffect(() => {
    if (!currentStudentId || !listRef.current) return;
    const timer = setTimeout(() => {
      const el = listRef.current?.querySelector(`[data-student-id="${currentStudentId}"]`);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 400);
    return () => clearTimeout(timer);
  }, [currentStudentId, weekOffset]);

  const goWeek = useCallback((dir: -1 | 1) => {
    const next = weekOffset + dir;
    if (next > 0) return;
    setSlideDir(dir < 0 ? 'right' : 'left');
    setWeekOffset(next);
  }, [weekOffset]);

  /* ─── Render helpers ──────────────────────────────────── */

  const renderLeagueBadgePill = (league: typeof LEAGUE_CONFIG[number], size: 'sm' | 'md' = 'sm') => (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-semibold font-['Cairo'] ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
      style={{ background: `${league.color}18`, color: league.color, border: `1px solid ${league.color}30` }}
    >
      {league.emoji} {locale === 'ar' ? league.ar : league.en}
    </span>
  );

  const renderAvatar = (name: string, id: string, size: number) => {
    const letter = name.charAt(0);
    const grad = getAvatarGradient(id);
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold font-['Cairo'] shrink-0`}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {letter}
      </div>
    );
  };

  const accuracyDot = (acc: number) => {
    const color = acc >= 80 ? '#22c55e' : acc >= 60 ? '#f59e0b' : '#ef4444';
    return (
      <span
        title={`${acc}%`}
        className="inline-block rounded-full shrink-0"
        style={{ width: 8, height: 8, backgroundColor: color }}
      />
    );
  };

  /* ─── Week navigator slide variants ─────────────────── */
  const slideVariants = {
    enter: (dir: string) => ({ x: dir === 'left' ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({ x: dir === 'left' ? -60 : 60, opacity: 0 }),
  };

  /* ─── Main render ───────────────────────────────────── */

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-['Cairo'] ${className}`}
    >
      <style>{shimmerKeyframes}</style>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
            <SubjectIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {t(`ترتيب ${subjectName}`, `${subjectName} Ranking`)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t(`الصف ${grade}`, `Grade ${grade}`)} &middot; {rankedStudents.length} {t('طالب', 'students')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Week Navigator ───────────────────────────────── */}
      <div className="px-5 pb-3 flex items-center justify-center gap-3">
        <button
          onClick={() => goWeek(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="relative overflow-hidden h-6 min-w-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={slideDir}>
            <motion.span
              key={weekOffset}
              custom={slideDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute text-xs font-semibold text-slate-600"
            >
              {weekRange.label}
            </motion.span>
          </AnimatePresence>
        </div>

        <button
          onClick={() => goWeek(1)}
          disabled={isCurrentWeek}
          className={`p-1.5 rounded-lg transition-colors ${
            isCurrentWeek
              ? 'text-slate-200 cursor-not-allowed'
              : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
          }`}
        >
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Past week banner ─────────────────────────────── */}
      {!isCurrentWeek && (
        <div className="mx-5 mb-3 flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
          {currentStudentEntry && (
            <span className="text-[11px] text-slate-500">
              {t('انتهيت في ', 'You finished in ')}
              {renderLeagueBadgePill(currentStudentEntry.league, 'sm')}
            </span>
          )}
          <button
            onClick={() => { setSlideDir('left'); setWeekOffset(0); }}
            className="flex items-center gap-1 text-[11px] text-sky-500 font-semibold hover:text-sky-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t('العودة لهذا الأسبوع', 'Back to this week')}
          </button>
        </div>
      )}

      {/* ── Current student league badge ─────────────────── */}
      {currentStudentEntry && (
        <div className="mx-5 mb-4 rounded-xl p-4 text-center relative overflow-hidden"
          style={{ background: `${currentStudentEntry.league.color}08`, border: `1px solid ${currentStudentEntry.league.color}20` }}
        >
          {/* Diamond sparkle overlay */}
          {currentStudentEntry.league.key === 'diamond' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${15 + i * 14}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: currentStudentEntry.league.color }} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-3xl mb-1">{currentStudentEntry.league.emoji}</div>
          <p className="text-sm font-bold text-slate-800 mb-0.5">
            {locale === 'ar' ? currentStudentEntry.league.ar : currentStudentEntry.league.en}
          </p>
          <p className="text-[11px] text-slate-500 mb-2">
            {t(
              `المرتبة ${currentStudentEntry.rank} من ${rankedStudents.length}`,
              `Rank ${currentStudentEntry.rank} of ${rankedStudents.length}`
            )}
          </p>
          <p className="text-xs font-semibold mb-2" style={{ color: currentStudentEntry.league.color }}>
            {currentStudentEntry.weeklyXp} XP {t('هذا الأسبوع', 'this week')}
          </p>

          {/* Progress bar to next league */}
          {(() => {
            const next = getNextLeague(currentStudentEntry.league);
            if (!next) return (
              <p className="text-[10px] text-slate-400">{t('أعلى دوري!', 'Top league!')}</p>
            );
            const progressPct = Math.min(100, (currentStudentEntry.weeklyXp / next.minXp) * 100);
            return (
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>{currentStudentEntry.weeklyXp}/{next.minXp} XP</span>
                  <span>
                    {t(`لل${next.ar}`, `to ${next.en}`)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: next.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Top 3 Podium ─────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={slideDir}>
        <motion.div
          key={`podium-${weekOffset}`}
          custom={slideDir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="px-5 pb-4"
        >
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-1">
              {/* #2 — Left */}
              <PodiumSlot entry={top3[1]} position={2} renderAvatar={renderAvatar} renderLeagueBadgePill={renderLeagueBadgePill} locale={locale} t={t} />
              {/* #1 — Center */}
              <PodiumSlot entry={top3[0]} position={1} renderAvatar={renderAvatar} renderLeagueBadgePill={renderLeagueBadgePill} locale={locale} t={t} />
              {/* #3 — Right */}
              <PodiumSlot entry={top3[2]} position={3} renderAvatar={renderAvatar} renderLeagueBadgePill={renderLeagueBadgePill} locale={locale} t={t} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Full Ranking List ────────────────────────────── */}
      <div
        ref={listRef}
        className="max-h-[350px] overflow-y-auto border-t border-slate-50"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={`list-${weekOffset}`}
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {rankedStudents.map((entry, idx) => {
              const isCurrent = entry.student.id === currentStudentId;
              return (
                <motion.div
                  key={entry.student.id}
                  data-student-id={entry.student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.6), duration: 0.25 }}
                  onClick={() => onStudentClick?.(entry.student.id)}
                  className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-sky-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                  style={isCurrent ? {
                    borderInlineStart: '4px solid #38bdf8',
                    animation: 'pulse-glow 2.5s ease-in-out infinite',
                  } : { borderInlineStart: '4px solid transparent' }}
                >
                  {/* Rank */}
                  <span className={`text-sm font-bold w-6 text-center shrink-0 ${
                    entry.rank <= 3 ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {entry.rank}
                  </span>

                  {/* Avatar */}
                  {renderAvatar(entry.student.name, entry.student.id, 32)}

                  {/* Name + league */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {entry.student.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-sky-100 text-sky-600 rounded px-1.5 py-0.5 font-bold shrink-0">
                          {t('أنت', 'You')}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">{renderLeagueBadgePill(entry.league, 'sm')}</div>
                  </div>

                  {/* XP + accuracy */}
                  <div className="flex items-center gap-2 shrink-0">
                    {accuracyDot(entry.accuracy)}
                    <span className="text-xs font-bold text-slate-600 tabular-nums">
                      {entry.weeklyXp.toLocaleString()} <span className="text-slate-300 font-normal">XP</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {rankedStudents.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">
                {t('لا توجد بيانات لهذا الأسبوع', 'No data for this week')}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Podium Slot Sub-component ────────────────────────────────── */

interface PodiumSlotProps {
  entry: {
    student: StudentProfile;
    weeklyXp: number;
    rank: number;
    league: typeof LEAGUE_CONFIG[number];
  };
  position: 1 | 2 | 3;
  renderAvatar: (name: string, id: string, size: number) => React.ReactNode;
  renderLeagueBadgePill: (league: typeof LEAGUE_CONFIG[number], size?: 'sm' | 'md') => React.ReactNode;
  locale: 'ar' | 'en';
  t: (ar: string, en: string) => string;
}

function PodiumSlot({ entry, position, renderAvatar, renderLeagueBadgePill, locale, t }: PodiumSlotProps) {
  const isFirst = position === 1;
  const podiumHeight = position === 1 ? 72 : position === 2 ? 52 : 40;
  const avatarSize = isFirst ? 44 : 36;

  const podiumGradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    2: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
    3: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)',
  };

  return (
    <motion.div
      className="flex flex-col items-center w-[100px]"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: position === 1 ? 0.1 : position === 2 ? 0.2 : 0.3, type: 'spring', stiffness: 200 }}
    >
      {/* Crown for #1 */}
      {isFirst && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mb-1"
        >
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className="relative mb-1.5">
        {renderAvatar(entry.student.name, entry.student.id, avatarSize)}
      </div>

      {/* Name */}
      <p className={`text-center truncate w-full font-semibold text-slate-700 ${isFirst ? 'text-xs' : 'text-[11px]'}`}>
        {entry.student.name.split(' ')[0]}
      </p>

      {/* XP */}
      <p className="text-[10px] font-bold text-slate-500 mb-1.5">{entry.weeklyXp} XP</p>

      {/* League badge */}
      <div className="mb-1.5 scale-90">{renderLeagueBadgePill(entry.league, 'sm')}</div>

      {/* Podium bar */}
      <div
        className="w-full rounded-t-lg relative overflow-hidden"
        style={{
          height: podiumHeight,
          background: podiumGradients[position],
        }}
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            ...shimmerStyle,
            backgroundImage: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/90 font-bold text-lg">{position}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default StudentLeagueWidget;
