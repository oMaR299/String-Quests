/**
 * SkillMapMain - Premium Skill Map View
 *
 * A beautiful, color-coded grid of ALL units across ALL subjects showing
 * the student's mastery at a glance. Features glassmorphism header, gradient
 * unit tiles, staggered Framer Motion entrance, and sticky action bar.
 */

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, Lock, BookOpen, AlertTriangle, ArrowLeft } from 'lucide-react';
import {
  SUBJECT_UNITS,
  MOCK_SCHOOL_DATA,
  type StudentProfile,
  type Subject,
} from '../../data/complexLeaderboardData';
import { MasteryRing } from '../skillmap/MasteryRing';
import { MasteryBadge } from './MasteryBadge';
import { DecayWarning } from './DecayWarning';

// ---------------------------------------------------------------------------
// Subject metadata
// ---------------------------------------------------------------------------

const SUBJECTS: { key: string; emoji: string; nameAr: string; nameEn: string }[] = [
  { key: 'math', emoji: '📐', nameAr: 'الرياضيات', nameEn: 'Mathematics' },
  { key: 'science', emoji: '🔬', nameAr: 'العلوم', nameEn: 'Science' },
  { key: 'languages', emoji: '📝', nameAr: 'اللغات', nameEn: 'Languages' },
  { key: 'history', emoji: '🏛️', nameAr: 'التاريخ', nameEn: 'History' },
  { key: 'arts', emoji: '🎨', nameAr: 'الفنون', nameEn: 'Arts' },
  { key: 'islamic', emoji: '🕌', nameAr: 'التربية الإسلامية', nameEn: 'Islamic Studies' },
  { key: 'english', emoji: '🔤', nameAr: 'الإنجليزية', nameEn: 'English' },
  { key: 'computer', emoji: '💻', nameAr: 'الحاسب', nameEn: 'Computer' },
  { key: 'social', emoji: '🌍', nameAr: 'الاجتماعيات', nameEn: 'Social Studies' },
  { key: 'physics', emoji: '⚛️', nameAr: 'الفيزياء', nameEn: 'Physics' },
  { key: 'chemistry', emoji: '🧪', nameAr: 'الكيمياء', nameEn: 'Chemistry' },
  { key: 'biology', emoji: '🧬', nameAr: 'الأحياء', nameEn: 'Biology' },
];

const UNIT_LABELS: Record<string, string> = {
  // Math
  arithmetic: 'الحساب',
  algebra: 'الجبر',
  geometry: 'الهندسة',
  calculus: 'التفاضل',
  statistics: 'الإحصاء',
  // Science
  matter: 'المادة',
  energy: 'الطاقة',
  forces: 'القوى',
  ecosystems: 'النظم البيئية',
  // Languages
  grammar: 'القواعد',
  literature: 'الأدب',
  poetry: 'الشعر',
  writing: 'الكتابة',
  // History
  ancient: 'التاريخ القديم',
  islamic_history: 'التاريخ الإسلامي',
  modern: 'التاريخ الحديث',
  geography: 'الجغرافيا',
  // Arts
  drawing: 'الرسم',
  colors: 'الألوان',
  history_of_art: 'تاريخ الفن',
  // Islamic
  quran: 'القرآن',
  hadith: 'الحديث',
  fiqh: 'الفقه',
  tafsir: 'التفسير',
  // Social
  citizenship: 'المواطنة',
  economics: 'الاقتصاد',
  sociology: 'علم الاجتماع',
  // Physics
  mechanics: 'الميكانيكا',
  thermodynamics: 'الديناميكا الحرارية',
  optics: 'البصريات',
  quantum: 'الكم',
  // Chemistry
  periodic_table: 'الجدول الدوري',
  reactions: 'التفاعلات',
  organic: 'العضوية',
  acids: 'الأحماض',
  // Biology
  cells: 'الخلايا',
  genetics: 'الوراثة',
  anatomy: 'التشريح',
  ecology: 'علم البيئة',
  // Computer
  coding: 'البرمجة',
  hardware: 'العتاد',
  networks: 'الشبكات',
  ai: 'الذكاء الاصطناعي',
  // English
  vocabulary: 'المفردات',
  reading: 'القراءة',
  speaking: 'المحادثة',
};

const LEAGUE_CONFIG: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  bronze:   { label: 'برونزي', labelEn: 'Bronze',   color: 'text-amber-700',   bg: 'bg-amber-100' },
  silver:   { label: 'فضي',   labelEn: 'Silver',   color: 'text-slate-500',   bg: 'bg-slate-100' },
  gold:     { label: 'ذهبي',  labelEn: 'Gold',     color: 'text-yellow-600',  bg: 'bg-yellow-100' },
  platinum: { label: 'بلاتيني', labelEn: 'Platinum', color: 'text-cyan-600',    bg: 'bg-cyan-100' },
  diamond:  { label: 'ماسي',  labelEn: 'Diamond',  color: 'text-purple-600',  bg: 'bg-purple-100' },
};

const LEAGUE_EMOJI: Record<string, string> = {
  bronze: '🥉',
  silver: '⭐',
  gold: '🏆',
  platinum: '💠',
  diamond: '💎',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UnitStatus = 'mastered' | 'developing' | 'struggling' | 'not-started' | 'decaying';

interface ComputedUnit {
  subject: string;
  unit: string;
  accuracy: number;
  status: UnitStatus;
  badgeLevel: 'none' | 'bronze' | 'silver' | 'gold';
  decayDays: number; // 0 = not decaying, 1-7 = days until critical
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple seeded pseudo-random for deterministic "decay" flags */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function classifyUnit(accuracy: number, hasDecayed: boolean): UnitStatus {
  if (accuracy <= 0) return 'not-started';
  if (hasDecayed) return 'decaying';
  if (accuracy >= 85) return 'mastered';
  if (accuracy >= 60) return 'developing';
  return 'struggling';
}

function badgeForAccuracy(accuracy: number): 'none' | 'bronze' | 'silver' | 'gold' {
  if (accuracy >= 95) return 'gold';
  if (accuracy >= 85) return 'silver';
  if (accuracy >= 75) return 'bronze';
  return 'none';
}

function masteryLevelForRing(accuracy: number): 'not-started' | 'struggling' | 'developing' | 'proficient' | 'mastered' {
  if (accuracy <= 0) return 'not-started';
  if (accuracy < 40) return 'struggling';
  if (accuracy < 70) return 'developing';
  if (accuracy < 90) return 'proficient';
  return 'mastered';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SkillMapMainProps {
  studentId?: string;
  locale?: 'ar' | 'en';
  onUnitClick?: (subject: string, unit: string) => void;
  onStudyToday?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SkillMapMain({
  studentId,
  locale = 'ar',
  onUnitClick,
  onStudyToday,
}: SkillMapMainProps) {
  const isRTL = locale === 'ar';

  // Translation helper
  const t = useCallback(
    (ar: string, en: string) => (locale === 'ar' ? ar : en),
    [locale],
  );

  // Pick student
  const student: StudentProfile | undefined = useMemo(() => {
    if (studentId) {
      return MOCK_SCHOOL_DATA.find((s) => s.id === studentId) ?? MOCK_SCHOOL_DATA[0];
    }
    return MOCK_SCHOOL_DATA[0];
  }, [studentId]);

  // Compute per-unit data
  const { units, overallMastery, decayingCount, streakDays } = useMemo(() => {
    if (!student) {
      return { units: [] as ComputedUnit[], overallMastery: 0, decayingCount: 0, streakDays: 0 };
    }

    const allUnits: ComputedUnit[] = [];
    let totalAcc = 0;
    let totalCount = 0;
    let decaying = 0;

    // Iterate every subject that exists in SUBJECT_UNITS
    const subjectKeys = Object.keys(SUBJECT_UNITS) as Exclude<Subject, 'all'>[];

    for (const subjectKey of subjectKeys) {
      const unitList = SUBJECT_UNITS[subjectKey];

      for (let ui = 0; ui < unitList.length; ui++) {
        const unitKey = unitList[ui];
        // Build the lookup key used in lessonDetails: "subject-unit"
        const detailKey = `${subjectKey}-${unitKey}`;
        const detail = student.lessonDetails[detailKey];

        let accuracy = 0;
        if (detail) {
          accuracy = detail.accuracy;
        }

        // Deterministic decay check: seeded by hashing student id + unit
        const seed = (student.id + detailKey).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const hasDecayed = accuracy >= 70 && seededRandom(seed) < 0.18; // ~18% of qualifying units decay
        const decayDays = hasDecayed ? Math.max(1, Math.min(7, Math.floor(seededRandom(seed + 1) * 7) + 1)) : 0;

        const status = classifyUnit(accuracy, hasDecayed);
        if (status === 'decaying') decaying++;

        allUnits.push({
          subject: subjectKey,
          unit: unitKey,
          accuracy,
          status,
          badgeLevel: badgeForAccuracy(accuracy),
          decayDays,
        });

        if (accuracy > 0) {
          totalAcc += accuracy;
          totalCount++;
        }
      }
    }

    const overall = totalCount > 0 ? Math.round(totalAcc / totalCount) : 0;

    // Streak: sum recent weekly activity days that are >0
    const streak = student.weeklyActivity.filter((v) => v > 0).length;

    return {
      units: allUnits,
      overallMastery: overall,
      decayingCount: decaying,
      streakDays: streak,
    };
  }, [student]);

  // Group units by subject for rendering
  const subjectGroups = useMemo(() => {
    const groups: { meta: (typeof SUBJECTS)[0]; items: ComputedUnit[] }[] = [];

    for (const meta of SUBJECTS) {
      const items = units.filter((u) => u.subject === meta.key);
      if (items.length > 0) {
        groups.push({ meta, items });
      }
    }

    return groups;
  }, [units]);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-[Cairo]">
        {t('لا يوجد بيانات طالب', 'No student data available')}
      </div>
    );
  }

  const league = student.league;
  const leagueConf = LEAGUE_CONFIG[league] ?? LEAGUE_CONFIG.bronze;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="font-[Cairo] max-w-4xl mx-auto px-4 pb-28 relative"
    >
      {/* ================================================================ */}
      {/*  GLASSMORPHISM HEADER                                            */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden"
      >
        {/* Subtle gradient accent */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          {/* Left: Streak */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-orange-400">
              <Flame className="w-5 h-5" />
              <span className="text-lg font-bold">{streakDays}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {t('يوم', 'days')}
            </span>
          </div>

          {/* Center: Mastery Ring + Title */}
          <div className="flex flex-col items-center gap-2">
            <MasteryRing
              score={overallMastery}
              level={masteryLevelForRing(overallMastery)}
              size={100}
              strokeWidth={8}
              showLabel
            />
            <h1 className="text-lg font-black text-slate-900 tracking-wide">
              {t('خريطة المعرفة', 'Knowledge Map')}
            </h1>
            <p className="text-xs font-medium text-slate-400">{student.name}</p>
          </div>

          {/* Right: League */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-xl ${leagueConf.bg} flex items-center justify-center`}>
              <span className="text-xl">{LEAGUE_EMOJI[league] ?? '🏅'}</span>
            </div>
            <span className={`text-[11px] font-semibold ${leagueConf.color}`}>
              {t(leagueConf.label, leagueConf.labelEn)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/*  SUBJECT GRID                                                    */}
      {/* ================================================================ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-7">
        {subjectGroups.map((group, gi) => (
          <motion.section
            key={group.meta.key}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: gi * 0.12 } },
            }}
          >
            {/* Subject header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{group.meta.emoji}</span>
              <h2 className="text-sm font-bold text-slate-800">
                {t(group.meta.nameAr, group.meta.nameEn)}
              </h2>
              <div className="flex-1 border-t border-slate-100 mx-2" />
            </div>

            {/* Unit tiles */}
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <UnitTile
                  key={`${item.subject}-${item.unit}`}
                  item={item}
                  locale={locale}
                  onClick={() => onUnitClick?.(item.subject, item.unit)}
                  t={t}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* ================================================================ */}
      {/*  STICKY BOTTOM ACTION BAR                                        */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="fixed bottom-0 inset-x-0 z-30"
      >
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-xl px-5 py-3.5 flex items-center justify-between gap-3">
            {/* Left: decay warning */}
            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium min-w-0">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {decayingCount > 0
                  ? t(
                      `${decayingCount} وحدات تحتاج مراجعة`,
                      `${decayingCount} units need review`,
                    )
                  : t('جميع الوحدات محدثة', 'All units up to date')}
              </span>
            </div>

            {/* Right: Study today CTA */}
            <button
              type="button"
              onClick={onStudyToday}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.97] transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('ادرس اليوم', 'Study Today')}</span>
              <span>{isRTL ? '←' : '→'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UnitTile sub-component
// ---------------------------------------------------------------------------

interface UnitTileProps {
  item: ComputedUnit;
  locale: 'ar' | 'en';
  onClick: () => void;
  t: (ar: string, en: string) => string;
}

const TILE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const UnitTile: React.FC<UnitTileProps> = ({ item, locale, onClick, t }) => {
  const { status, accuracy, unit, badgeLevel, decayDays } = item;

  // Tile style by status
  const tileStyle = (() => {
    switch (status) {
      case 'mastered':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20 shadow-md text-white';
      case 'developing':
        return 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-amber-400/20 shadow-md text-white';
      case 'struggling':
        return 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20 shadow-md text-white';
      case 'decaying':
        return 'bg-gradient-to-br from-orange-300 to-amber-500 shadow-orange-400/20 shadow-md text-white';
      case 'not-started':
      default:
        return 'bg-slate-50 border border-slate-200 text-slate-400';
    }
  })();

  const unitLabel = UNIT_LABELS[unit] ?? unit;
  const isNotStarted = status === 'not-started';

  return (
    <motion.button
      variants={TILE_VARIANTS}
      whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center rounded-xl w-[110px] sm:w-[120px] h-[76px] sm:h-[80px] cursor-pointer transition-shadow duration-200 ${tileStyle}`}
    >
      {/* Decay overlay */}
      {status === 'decaying' && <DecayWarning daysUntilCritical={decayDays} />}

      {/* Lock icon for not-started */}
      {isNotStarted ? (
        <Lock className="w-5 h-5 text-slate-300" />
      ) : (
        <>
          {/* Accuracy number */}
          <span className="text-xl sm:text-2xl font-extrabold leading-none">
            {Math.round(accuracy)}
            <span className="text-[11px] font-bold opacity-80">%</span>
          </span>
        </>
      )}

      {/* Unit name */}
      <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 leading-tight text-center px-1 truncate max-w-full ${isNotStarted ? 'text-slate-400' : 'text-white/90'}`}>
        {locale === 'ar' ? unitLabel : unit.replace(/_/g, ' ')}
      </span>

      {/* Mastery badge (top-end corner) */}
      {badgeLevel !== 'none' && (
        <div className="absolute top-1 end-1">
          <MasteryBadge level={badgeLevel} size="sm" />
        </div>
      )}
    </motion.button>
  );
};

export default SkillMapMain;
