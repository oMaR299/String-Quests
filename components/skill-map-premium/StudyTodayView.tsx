// StudyTodayView.tsx — Personalized daily study plan bottom-sheet

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, BookOpen, Dumbbell, Target } from 'lucide-react';
import type { StudentProfile, Subject } from '../../data/complexLeaderboardData';
import { SUBJECT_UNITS } from '../../data/complexLeaderboardData';

// ─── Types ───────────────────────────────────────────────────────

type StudyItemType = 'review' | 'learn' | 'practice';

interface StudyItem {
  id: string;
  type: StudyItemType;
  subject: string;
  unit: string;
  title: string;
  description: string;
  timeMinutes: number;
  accuracy?: number;
  targetAccuracy?: number;
  daysSince?: number;
}

interface StudyTodayViewProps {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onStartItem?: (type: string, subject: string, unit: string) => void;
  locale?: 'ar' | 'en';
}

// ─── Arabic lookup ───────────────────────────────────────────────

const UNIT_ARABIC: Record<string, string> = {
  arithmetic: 'الحساب', algebra: 'الجبر', geometry: 'الهندسة',
  calculus: 'التفاضل والتكامل', statistics: 'الإحصاء',
  matter: 'المادة', energy: 'الطاقة', forces: 'القوى', ecosystems: 'النظم البيئية',
  grammar: 'النحو', literature: 'الأدب', poetry: 'الشعر', writing: 'الكتابة',
  ancient: 'التاريخ القديم', islamic_history: 'التاريخ الإسلامي',
  modern: 'التاريخ الحديث', geography: 'الجغرافيا',
  drawing: 'الرسم', colors: 'الألوان', history_of_art: 'تاريخ الفن',
  quran: 'القرآن الكريم', hadith: 'الحديث', fiqh: 'الفقه', tafsir: 'التفسير',
  citizenship: 'المواطنة', economics: 'الاقتصاد', sociology: 'علم الاجتماع',
  mechanics: 'الميكانيكا', thermodynamics: 'الديناميكا الحرارية',
  optics: 'البصريات', quantum: 'فيزياء الكم',
  periodic_table: 'الجدول الدوري', reactions: 'التفاعلات',
  organic: 'الكيمياء العضوية', acids: 'الأحماض والقواعد',
  cells: 'الخلايا', genetics: 'الوراثة', anatomy: 'التشريح', ecology: 'علم البيئة',
  coding: 'البرمجة', hardware: 'العتاد', networks: 'الشبكات', ai: 'الذكاء الاصطناعي',
  vocabulary: 'المفردات', reading: 'القراءة', speaking: 'المحادثة',
};

const SUBJECT_ARABIC: Record<string, string> = {
  math: 'الرياضيات', science: 'العلوم', languages: 'اللغات',
  history: 'التاريخ', arts: 'الفنون', islamic: 'التربية الإسلامية',
  social: 'الاجتماعيات', physics: 'الفيزياء', chemistry: 'الكيمياء',
  biology: 'الأحياء', computer: 'الحاسب', english: 'الإنجليزية',
};

// ─── Seeded random (deterministic per student) ───────────────────

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

// ─── Study item generation ───────────────────────────────────────

function generateStudyItems(student: StudentProfile, isAr: boolean): StudyItem[] {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const rand = seededRandom(student.id + new Date().toDateString());
  const items: StudyItem[] = [];

  const allSubjects = Object.keys(SUBJECT_UNITS) as Exclude<Subject, 'all'>[];

  // Gather all subject-unit pairs with their accuracy
  const unitData: { subject: string; unit: string; accuracy: number; daysSince: number }[] = [];

  for (const subj of allSubjects) {
    const units = SUBJECT_UNITS[subj];
    for (const unit of units) {
      const key = `${subj}-${unit}`;
      const detail = student.lessonDetails?.[key];
      const accuracy = detail?.accuracy ?? -1; // -1 = not started
      const daysSince = accuracy >= 0 ? Math.round(rand() * 12) : 0;
      unitData.push({ subject: subj, unit, accuracy, daysSince });
    }
  }

  // 1) REVIEW: high accuracy (>80) but practiced >4 days ago
  const reviewCandidates = unitData
    .filter((u) => u.accuracy > 80 && u.daysSince > 4)
    .sort((a, b) => b.daysSince - a.daysSince);

  for (const c of reviewCandidates.slice(0, 2)) {
    const unitName = UNIT_ARABIC[c.unit] || c.unit;
    items.push({
      id: `review-${c.subject}-${c.unit}`,
      type: 'review',
      subject: c.subject,
      unit: c.unit,
      title: t(`🔄 مراجعة: ${unitName}`, `🔄 Review: ${unitName}`),
      description: t(
        `آخر تمرين منذ ${c.daysSince} أيام — المعرفة تتلاشى`,
        `Last practiced ${c.daysSince} days ago — knowledge fading`,
      ),
      timeMinutes: 5,
      daysSince: c.daysSince,
      accuracy: c.accuracy,
    });
  }

  // 2) LEARN: not started (-1) where earlier units in same subject are mastered
  const learnCandidates: typeof unitData = [];
  for (const subj of allSubjects) {
    const units = SUBJECT_UNITS[subj];
    let allPrevMastered = true;
    for (const unit of units) {
      const key = `${subj}-${unit}`;
      const detail = student.lessonDetails?.[key];
      const acc = detail?.accuracy ?? -1;
      if (acc < 0 && allPrevMastered) {
        learnCandidates.push({ subject: subj, unit, accuracy: -1, daysSince: 0 });
        break; // only pick first unlocked per subject
      }
      if (acc < 70) allPrevMastered = false;
    }
  }

  for (const c of learnCandidates.slice(0, 1)) {
    const unitName = UNIT_ARABIC[c.unit] || c.unit;
    items.push({
      id: `learn-${c.subject}-${c.unit}`,
      type: 'learn',
      subject: c.subject,
      unit: c.unit,
      title: t(`📖 تعلم: ${unitName}`, `📖 Learn: ${unitName}`),
      description: t(
        'جاهز — المتطلبات السابقة مكتملة',
        'Ready — prerequisites complete',
      ),
      timeMinutes: 10,
    });
  }

  // 3) PRACTICE: accuracy < 70 (struggling)
  const practiceCandidates = unitData
    .filter((u) => u.accuracy >= 0 && u.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  for (const c of practiceCandidates.slice(0, 2)) {
    const unitName = UNIT_ARABIC[c.unit] || c.unit;
    items.push({
      id: `practice-${c.subject}-${c.unit}`,
      type: 'practice',
      subject: c.subject,
      unit: c.unit,
      title: t(`💪 تمرين: ${unitName}`, `💪 Practice: ${unitName}`),
      description: t(
        `النتيجة: ${c.accuracy}% — الهدف: 70%`,
        `Score: ${c.accuracy}% → aim: 70%`,
      ),
      timeMinutes: 7,
      accuracy: c.accuracy,
      targetAccuracy: 70,
    });
  }

  // If we have nothing (unlikely), add a generic item
  if (items.length === 0) {
    const subj = allSubjects[Math.floor(rand() * allSubjects.length)];
    const unit = SUBJECT_UNITS[subj][0];
    items.push({
      id: `learn-${subj}-${unit}`,
      type: 'learn',
      subject: subj,
      unit,
      title: t(`📖 تعلم: ${UNIT_ARABIC[unit] || unit}`, `📖 Learn: ${UNIT_ARABIC[unit] || unit}`),
      description: t('ابدأ رحلة التعلم!', 'Start your learning journey!'),
      timeMinutes: 10,
    });
  }

  return items.slice(0, 5);
}

// ─── Styling per type ────────────────────────────────────────────

const TYPE_STYLES: Record<StudyItemType, {
  borderColor: string;
  bgHover: string;
  btnBg: string;
  btnText: string;
  icon: typeof RotateCcw;
}> = {
  review: {
    borderColor: 'border-l-orange-400',
    bgHover: 'hover:bg-orange-500/[0.04]',
    btnBg: 'bg-orange-500/15 hover:bg-orange-500/25',
    btnText: 'text-orange-400',
    icon: RotateCcw,
  },
  learn: {
    borderColor: 'border-l-blue-400',
    bgHover: 'hover:bg-blue-500/[0.04]',
    btnBg: 'bg-blue-500/15 hover:bg-blue-500/25',
    btnText: 'text-blue-400',
    icon: BookOpen,
  },
  practice: {
    borderColor: 'border-l-rose-400',
    bgHover: 'hover:bg-rose-500/[0.04]',
    btnBg: 'bg-rose-500/15 hover:bg-rose-500/25',
    btnText: 'text-rose-400',
    icon: Dumbbell,
  },
};

const TYPE_LABELS: Record<StudyItemType, { ar: string; en: string }> = {
  review: { ar: 'ابدأ المراجعة', en: 'Start Review' },
  learn: { ar: 'ابدأ التعلم', en: 'Start Learning' },
  practice: { ar: 'ابدأ التمرين', en: 'Start Practice' },
};

// ─── Main Component ─────────────────────────────────────────────

export function StudyTodayView({
  student,
  isOpen,
  onClose,
  onStartItem,
  locale = 'ar',
}: StudyTodayViewProps) {
  const isAr = locale === 'ar';
  const t = (ar: string, en: string) => (isAr ? ar : en);

  const items = useMemo(() => generateStudyItems(student, isAr), [student, isAr]);

  const totalMinutes = useMemo(() => items.reduce((s, i) => s + i.timeMinutes, 0), [items]);

  // Daily challenge — seeded from student
  const challengeRand = seededRandom(student.id + 'challenge');
  const challengeProgress = Math.min(3, Math.floor(challengeRand() * 4));
  const challengeTotal = 3;
  const challengeReward = 50;

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
            <div
              className="h-[2px] w-full rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, #8B5CF6, #ec4899)' }}
            />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {/* Header */}
              <div className="flex items-start justify-between pt-5 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    📚 {t('خطة اليوم', "Today's Plan")}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {items.length} {t('عناصر', 'items')} · ~{totalMinutes}{' '}
                    {t('دقيقة', 'min')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Study items */}
              <div className="space-y-3">
                {items.map((item, i) => {
                  const style = TYPE_STYLES[item.type];
                  const Icon = style.icon;

                  return (
                    <motion.div
                      key={item.id}
                      className={`
                        rounded-xl border border-white/[0.06] bg-white/[0.02]
                        border-l-[3px] ${style.borderColor} ${style.bgHover}
                        p-4 transition-colors
                      `}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Icon size={16} className={style.btnText} />
                            <h3 className="truncate text-sm font-bold text-white">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-xs leading-relaxed text-zinc-400">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="whitespace-nowrap rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                            ~{item.timeMinutes} {t('د', 'min')}
                          </span>
                          <button
                            className={`
                              whitespace-nowrap rounded-lg px-3 py-1.5
                              text-xs font-bold transition
                              ${style.btnBg} ${style.btnText}
                            `}
                            onClick={() =>
                              onStartItem?.(item.type, item.subject, item.unit)
                            }
                          >
                            {TYPE_LABELS[item.type][isAr ? 'ar' : 'en']}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Daily challenge */}
              <motion.div
                className="mt-6 overflow-hidden rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.10))',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Target size={18} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-purple-300">
                    🎯 {t('تحدي اليوم', "Today's Challenge")}
                  </h3>
                </div>

                <p className="mb-3 text-sm text-zinc-300">
                  {t(
                    'احصل على 80%+ في 3 اختبارات',
                    'Score 80%+ on 3 quizzes',
                  )}
                </p>

                {/* Progress bar */}
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(challengeProgress / challengeTotal) * 100}%`,
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-300">
                    {challengeProgress}/{challengeTotal}{' '}
                    {t('مكتمل', 'complete')}
                  </span>
                </div>

                <p className="text-xs text-zinc-400">
                  {t('المكافأة', 'Reward')}: {challengeReward} 💎{' '}
                  {t('جواهر', 'gems')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default StudyTodayView;
