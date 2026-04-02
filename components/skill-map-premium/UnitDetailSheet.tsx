// UnitDetailSheet.tsx — Premium bottom-sheet for unit detail / lesson breakdown

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { ProgressRing } from '../admin-hub/attendance/SvgCharts';
import type { StudentProfile } from '../../data/complexLeaderboardData';
import { SUBJECT_UNITS } from '../../data/complexLeaderboardData';

// ─── Arabic lookup tables ────────────────────────────────────────

const UNIT_ARABIC: Record<string, { name: string; emoji: string }> = {
  arithmetic: { name: 'الحساب', emoji: '🔢' },
  algebra: { name: 'الجبر', emoji: '📐' },
  geometry: { name: 'الهندسة', emoji: '📏' },
  calculus: { name: 'التفاضل والتكامل', emoji: '∫' },
  statistics: { name: 'الإحصاء', emoji: '📊' },
  matter: { name: 'المادة', emoji: '🧪' },
  energy: { name: 'الطاقة', emoji: '⚡' },
  forces: { name: 'القوى', emoji: '💪' },
  ecosystems: { name: 'النظم البيئية', emoji: '🌿' },
  grammar: { name: 'النحو', emoji: '✍️' },
  literature: { name: 'الأدب', emoji: '📖' },
  poetry: { name: 'الشعر', emoji: '🎭' },
  writing: { name: 'الكتابة', emoji: '🖊️' },
  ancient: { name: 'التاريخ القديم', emoji: '🏛️' },
  islamic_history: { name: 'التاريخ الإسلامي', emoji: '🕌' },
  modern: { name: 'التاريخ الحديث', emoji: '🌍' },
  geography: { name: 'الجغرافيا', emoji: '🗺️' },
  drawing: { name: 'الرسم', emoji: '🎨' },
  colors: { name: 'الألوان', emoji: '🌈' },
  history_of_art: { name: 'تاريخ الفن', emoji: '🖼️' },
  quran: { name: 'القرآن الكريم', emoji: '📗' },
  hadith: { name: 'الحديث', emoji: '📜' },
  fiqh: { name: 'الفقه', emoji: '⚖️' },
  tafsir: { name: 'التفسير', emoji: '🔍' },
  citizenship: { name: 'المواطنة', emoji: '🏛️' },
  economics: { name: 'الاقتصاد', emoji: '💰' },
  sociology: { name: 'علم الاجتماع', emoji: '👥' },
  mechanics: { name: 'الميكانيكا', emoji: '⚙️' },
  thermodynamics: { name: 'الديناميكا الحرارية', emoji: '🌡️' },
  optics: { name: 'البصريات', emoji: '🔬' },
  quantum: { name: 'فيزياء الكم', emoji: '⚛️' },
  periodic_table: { name: 'الجدول الدوري', emoji: '🧫' },
  reactions: { name: 'التفاعلات', emoji: '💥' },
  organic: { name: 'الكيمياء العضوية', emoji: '🧬' },
  acids: { name: 'الأحماض والقواعد', emoji: '🧪' },
  cells: { name: 'الخلايا', emoji: '🔬' },
  genetics: { name: 'الوراثة', emoji: '🧬' },
  anatomy: { name: 'التشريح', emoji: '🫀' },
  ecology: { name: 'علم البيئة', emoji: '🌱' },
  coding: { name: 'البرمجة', emoji: '💻' },
  hardware: { name: 'العتاد', emoji: '🖥️' },
  networks: { name: 'الشبكات', emoji: '🌐' },
  ai: { name: 'الذكاء الاصطناعي', emoji: '🤖' },
  vocabulary: { name: 'المفردات', emoji: '📝' },
  reading: { name: 'القراءة', emoji: '📚' },
  speaking: { name: 'المحادثة', emoji: '🗣️' },
};

const SUBJECT_COLORS: Record<string, string> = {
  math: '#8B5CF6',
  science: '#10b981',
  languages: '#f59e0b',
  history: '#ef4444',
  arts: '#ec4899',
  islamic: '#14b8a6',
  social: '#6366f1',
  physics: '#3b82f6',
  chemistry: '#f97316',
  biology: '#22c55e',
  computer: '#06b6d4',
  english: '#a855f7',
};

const SUBJECT_ARABIC: Record<string, string> = {
  math: 'الرياضيات',
  science: 'العلوم',
  languages: 'اللغات',
  history: 'التاريخ',
  arts: 'الفنون',
  islamic: 'التربية الإسلامية',
  social: 'الاجتماعيات',
  physics: 'الفيزياء',
  chemistry: 'الكيمياء',
  biology: 'الأحياء',
  computer: 'الحاسب',
  english: 'الإنجليزية',
};

// ─── Lesson-level mock data builder ──────────────────────────────

interface LessonData {
  id: string;
  name: string;
  accuracy: number;
  status: 'mastered' | 'developing' | 'struggling' | 'locked';
  daysSincePractice: number;
  isFading: boolean;
  isRecommended: boolean;
}

type BadgeLevel = 'gold' | 'silver' | 'bronze' | 'none';

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 0xffffffff;
  };
}

function buildLessons(
  subject: string,
  unit: string,
  unitAccuracy: number,
): LessonData[] {
  // Generate 4-6 lessons per unit based on name seeding
  const rand = seededRandom(`${subject}-${unit}`);
  const lessonSlugs = [
    `${unit}_intro`,
    `${unit}_basics`,
    `${unit}_practice`,
    `${unit}_advanced`,
    `${unit}_mastery`,
  ];

  const lessonArabicSuffix = ['مقدمة', 'أساسيات', 'تطبيقات', 'متقدم', 'إتقان'];
  const unitInfo = UNIT_ARABIC[unit] || { name: unit, emoji: '📘' };

  return lessonSlugs.map((slug, i) => {
    const variation = (rand() - 0.5) * 30;
    const rawAcc = Math.round(Math.max(0, Math.min(100, unitAccuracy + variation)));
    const daysSince = Math.round(rand() * 10);
    const wasFading = rawAcc > 70 && daysSince > 5;

    let status: LessonData['status'];
    if (rawAcc === 0 || (i >= 3 && unitAccuracy < 50)) {
      status = 'locked';
    } else if (rawAcc >= 85) {
      status = 'mastered';
    } else if (rawAcc >= 60) {
      status = 'developing';
    } else {
      status = 'struggling';
    }

    return {
      id: slug,
      name: `${unitInfo.name} — ${lessonArabicSuffix[i]}`,
      accuracy: status === 'locked' ? 0 : rawAcc,
      status,
      daysSincePractice: status === 'locked' ? 0 : daysSince,
      isFading: status !== 'locked' && wasFading,
      isRecommended: status === 'developing' || status === 'struggling',
    };
  });
}

function getBadgeLevel(accuracy: number): BadgeLevel {
  if (accuracy >= 95) return 'gold';
  if (accuracy >= 85) return 'silver';
  if (accuracy >= 70) return 'bronze';
  return 'none';
}

const BADGE_CONFIG: Record<BadgeLevel, { label: string; emoji: string; color: string }> = {
  gold: { label: 'ذهبية', emoji: '🥇', color: '#eab308' },
  silver: { label: 'فضية', emoji: '🥈', color: '#94a3b8' },
  bronze: { label: 'برونزية', emoji: '🥉', color: '#d97706' },
  none: { label: 'لا شارة بعد', emoji: '🔘', color: '#71717a' },
};

function getNextBadgeHint(badge: BadgeLevel): string {
  switch (badge) {
    case 'none':
      return 'تحتاج 70% دقة + 3 محاولات للحصول على البرونزية';
    case 'bronze':
      return 'تحتاج 85% دقة + 5 محاولات للحصول على الفضية';
    case 'silver':
      return 'تحتاج 95% دقة + 8 محاولات للحصول على الذهبية';
    case 'gold':
      return 'أحسنت! لقد حققت أعلى شارة 🎉';
  }
}

// ─── Status icon component ──────────────────────────────────────

function StatusIcon({ status }: { status: LessonData['status'] }) {
  switch (status) {
    case 'mastered':
      return <CheckCircle2 size={18} className="text-emerald-400" />;
    case 'developing':
      return <AlertTriangle size={18} className="text-amber-400" />;
    case 'struggling':
      return <XCircle size={18} className="text-rose-400" />;
    case 'locked':
      return <Lock size={14} className="text-zinc-500" />;
  }
}

function accuracyColor(acc: number) {
  if (acc >= 85) return 'text-emerald-400';
  if (acc >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

// ─── Props ───────────────────────────────────────────────────────

interface UnitDetailSheetProps {
  subject: string;
  unit: string;
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: (lesson: string) => void;
  locale?: 'ar' | 'en';
}

// ─── Main Component ─────────────────────────────────────────────

export function UnitDetailSheet({
  subject,
  unit,
  student,
  isOpen,
  onClose,
  onStartPractice,
  locale = 'ar',
}: UnitDetailSheetProps) {
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const subjectColor = SUBJECT_COLORS[subject] || '#8B5CF6';
  const unitInfo = UNIT_ARABIC[unit] || { name: unit, emoji: '📘' };

  // Compute unit-level accuracy from student data
  const unitKey = `${subject}-${unit}`;
  const unitDetail = student.lessonDetails?.[unitKey];
  const unitAccuracy = unitDetail?.accuracy ?? Math.round(seededRandom(unitKey)() * 60 + 30);

  const lessons = useMemo(() => {
    const raw = buildLessons(subject, unit, unitAccuracy);
    // Sort: struggling → developing → mastered → locked
    const order: Record<string, number> = { struggling: 0, developing: 1, mastered: 2, locked: 3 };
    return raw.sort((a, b) => order[a.status] - order[b.status]);
  }, [subject, unit, unitAccuracy]);

  const fadingLessons = useMemo(() => lessons.filter((l) => l.isFading), [lessons]);

  const badge = getBadgeLevel(unitAccuracy);
  const badgeInfo = BADGE_CONFIG[badge];
  const nextHint = getNextBadgeHint(badge);

  // Badge progress bar %
  const badgeProgress = useMemo(() => {
    if (badge === 'gold') return 100;
    const thresholds = { none: [0, 70], bronze: [70, 85], silver: [85, 95] } as const;
    const [lo, hi] = thresholds[badge as 'none' | 'bronze' | 'silver'];
    return Math.round(Math.min(100, ((unitAccuracy - lo) / (hi - lo)) * 100));
  }, [badge, unitAccuracy]);

  // AI tip: find weakest lesson that blocks others
  const aiTip = useMemo(() => {
    const weakest = lessons.find((l) => l.status === 'struggling' || l.status === 'developing');
    if (!weakest) return null;
    const blocked = lessons.find((l) => l.status === 'locked');
    if (blocked) {
      return t(
        `💡 ادرس "${weakest.name}" أولاً — إنها متطلب سابق لـ "${blocked.name}"`,
        `💡 Practice "${weakest.name}" first — it's a prerequisite for "${blocked.name}"`,
      );
    }
    return t(
      `💡 ركّز على "${weakest.name}" لرفع مستواك الإجمالي`,
      `💡 Focus on "${weakest.name}" to boost your overall mastery`,
    );
  }, [lessons, isAr]);

  // Recommended lesson for action button
  const recommended = useMemo(
    () =>
      lessons.find((l) => l.status === 'struggling') ||
      lessons.find((l) => l.status === 'developing') ||
      lessons[0],
    [lessons],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[101] flex flex-col rounded-t-2xl border-t border-white/10 bg-[#111113] shadow-2xl"
            style={{ maxHeight: '88vh', fontFamily: "'Cairo', sans-serif" }}
            dir={isAr ? 'rtl' : 'ltr'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Color strip */}
            <div className="h-[2px] w-full rounded-t-2xl" style={{ background: subjectColor }} />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-28">
              {/* Header */}
              <div className="flex items-start justify-between pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{unitInfo.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{unitInfo.name}</h2>
                    <span
                      className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: `${subjectColor}22`, color: subjectColor }}
                    >
                      {SUBJECT_ARABIC[subject] || subject}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mastery ring */}
              <div className="mb-6 flex items-center gap-5">
                <div className="w-20">
                  <ProgressRing value={unitAccuracy} size={80} strokeWidth={7} />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">{unitAccuracy}%</p>
                  <p className="text-sm text-zinc-400">{t('نسبة الإتقان', 'Mastery')}</p>
                </div>
              </div>

              {/* Badge progress */}
              <motion.div
                className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">{badgeInfo.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: badgeInfo.color }}>
                    {badgeInfo.label}
                  </span>
                </div>
                <p className="mb-2 text-xs text-zinc-400">{nextHint}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: badgeInfo.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${badgeProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>

              {/* Lesson list */}
              <h3 className="mb-3 text-sm font-bold text-zinc-300">{t('الدروس', 'Lessons')}</h3>
              <div className="space-y-2">
                {lessons.map((lesson, i) => (
                  <motion.div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]"
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={lesson.status} />
                      <span
                        className={`text-sm font-medium ${
                          lesson.status === 'locked' ? 'text-zinc-500' : 'text-zinc-200'
                        }`}
                      >
                        {lesson.name}
                      </span>
                      {lesson.isRecommended && (
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                          ← {t('ادرس', 'Study')}
                        </span>
                      )}
                    </div>
                    {lesson.status !== 'locked' && (
                      <span className={`text-sm font-bold ${accuracyColor(lesson.accuracy)}`}>
                        {lesson.accuracy}%
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Decay warning */}
              {fadingLessons.length > 0 && (
                <motion.div
                  className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/[0.06] p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {fadingLessons.map((fl) => (
                    <p key={fl.id} className="mb-1 text-sm text-orange-300">
                      📉{' '}
                      {t(
                        `${fl.name} تتلاشى (آخر تمرين منذ ${fl.daysSincePractice} أيام)`,
                        `${fl.name} is fading (last practiced ${fl.daysSincePractice} days ago)`,
                      )}
                    </p>
                  ))}
                  <button
                    className="mt-2 rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-300 transition hover:bg-orange-500/30"
                    onClick={() => onStartPractice?.(fadingLessons[0].id)}
                  >
                    {t('راجع الآن', 'Review Now')}
                  </button>
                </motion.div>
              )}

              {/* AI tip */}
              {aiTip && (
                <motion.div
                  className="mt-5 rounded-xl p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(59,130,246,0.12))',
                    border: '1px solid rgba(56,189,248,0.15)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm leading-relaxed text-sky-300">{aiTip}</p>
                </motion.div>
              )}
            </div>

            {/* Sticky action button */}
            <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-[#111113]/90 px-5 py-4 backdrop-blur-md">
              <motion.button
                className="w-full rounded-xl py-3.5 text-base font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${subjectColor}, ${subjectColor}cc)`,
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => recommended && onStartPractice?.(recommended.id)}
              >
                🚀 {t('ابدأ التمرين', 'Start Practicing')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UnitDetailSheet;
