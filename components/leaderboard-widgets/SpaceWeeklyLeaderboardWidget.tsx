import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MOCK_SCHOOL_DATA } from '../../data/complexLeaderboardData';
import type { Subject, StudentProfile } from '../../data/complexLeaderboardData';

type SubjectKey = Exclude<Subject, 'all'>;

interface SpaceWeeklyLeaderboardWidgetProps {
  spaceSubject: string;
  spaceGrade: number;
  spaceSection: string;
  currentUserId?: string;
  locale?: 'ar' | 'en';
  onViewFull?: () => void;
}

const SUBJECT_AR: Record<string, string> = {
  math: 'رياضيات', science: 'علوم', languages: 'لغات', history: 'تاريخ',
  arts: 'فنون', islamic: 'تربية إسلامية', english: 'إنجليزية', computer: 'حاسب',
  physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء', social: 'اجتماعيات',
};

const SUBJECT_GRADIENTS: Record<string, string> = {
  math: 'from-blue-500 to-indigo-500', science: 'from-emerald-400 to-teal-500',
  languages: 'from-violet-500 to-purple-500', history: 'from-amber-500 to-orange-500',
  arts: 'from-pink-400 to-rose-500', islamic: 'from-emerald-500 to-green-600',
  english: 'from-sky-400 to-blue-500', computer: 'from-cyan-400 to-teal-500',
  physics: 'from-indigo-400 to-violet-500', chemistry: 'from-orange-400 to-red-500',
  biology: 'from-green-400 to-emerald-500', social: 'from-teal-400 to-cyan-500',
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600', 'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600', 'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500', 'from-teal-400 to-cyan-600',
];

const RANK_MEDALS = ['', '\u{1F947}', '\u{1F948}', '\u{1F949}'];

function getAvatarGradient(id: string) {
  const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getSunWeekRange(offset: number, locale: 'ar' | 'en') {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day + offset * 7);
  const thursday = new Date(sunday);
  thursday.setDate(sunday.getDate() + 4);

  const monthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const monthsEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (locale === 'ar') {
    return `${sunday.getDate()}-${thursday.getDate()} ${monthsAr[thursday.getMonth()]}`;
  }
  return `${monthsEn[sunday.getMonth()]} ${sunday.getDate()}-${thursday.getDate()}`;
}

export function SpaceWeeklyLeaderboardWidget({
  spaceSubject,
  spaceGrade,
  spaceSection,
  currentUserId,
  locale = 'ar',
  onViewFull,
}: SpaceWeeklyLeaderboardWidgetProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [direction, setDirection] = useState(0);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';
  const subjectKey = spaceSubject as SubjectKey;

  const classStudents = useMemo(() => {
    return MOCK_SCHOOL_DATA.filter(
      (s) => s.grade === spaceGrade && s.section === spaceSection
    );
  }, [spaceGrade, spaceSection]);

  const rankedStudents = useMemo(() => {
    return classStudents
      .map((s, idx) => {
        let xp = s.subjectDetails[subjectKey]?.xp ?? s.subjectXp[subjectKey] ?? 0;
        if (weekOffset < 0) {
          const decay = 0.85 + seededRandom(idx * 1000 + Math.abs(weekOffset)) * 0.3;
          for (let w = 0; w < Math.abs(weekOffset); w++) {
            xp = Math.round(xp * (0.85 + seededRandom(idx * 100 + w * 7) * 0.3));
          }
        }
        const accuracy = s.subjectDetails[subjectKey]?.accuracy ?? 0;
        return { ...s, weekXp: xp, accuracy };
      })
      .sort((a, b) => b.weekXp - a.weekXp);
  }, [classStudents, subjectKey, weekOffset]);

  const top5 = rankedStudents.slice(0, 5);
  const currentUserEntry = currentUserId
    ? rankedStudents.find((s) => s.id === currentUserId)
    : null;
  const currentUserRank = currentUserEntry
    ? rankedStudents.indexOf(currentUserEntry) + 1
    : null;
  const isCurrentInTop5 = currentUserRank != null && currentUserRank <= 5;

  const gradient = SUBJECT_GRADIENTS[spaceSubject] || 'from-slate-400 to-slate-500';

  const navigateWeek = (dir: -1 | 1) => {
    const next = weekOffset + dir;
    if (next > 0) return;
    setDirection(dir);
    setWeekOffset(next);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-['Cairo']`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Subject gradient strip */}
      <div className={`h-[3px] bg-gradient-to-r ${gradient}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              {t('ترتيب الأسبوع', 'Weekly Ranking')}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">
              {SUBJECT_AR[spaceSubject] || spaceSubject}
            </p>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWeek(isRTL ? 1 : -1)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-600 tabular-nums">
            {getSunWeekRange(weekOffset, locale)}
          </span>
          <button
            onClick={() => navigateWeek(isRTL ? -1 : 1)}
            disabled={weekOffset >= 0}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ranking list */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={weekOffset}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-1"
          >
            {top5.map((student, idx) => {
              const rank = idx + 1;
              const isCurrentUser = student.id === currentUserId;
              const accColor =
                student.accuracy >= 80 ? 'bg-emerald-400' : student.accuracy >= 60 ? 'bg-amber-400' : 'bg-red-400';
              const rowBg =
                rank === 1 ? 'bg-amber-50/60' :
                rank === 2 ? 'bg-slate-50/80' :
                rank === 3 ? 'bg-orange-50/40' : '';

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors ${rowBg} ${
                    isCurrentUser ? 'ring-1 ring-sky-300/50 bg-sky-50/40' : ''
                  } ${rank === 1 ? 'py-2.5' : ''}`}
                >
                  {/* Rank */}
                  <div className="w-5 text-center flex-shrink-0">
                    {rank <= 3 ? (
                      <span className="text-sm">{RANK_MEDALS[rank]}</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`${rank === 1 ? 'w-8 h-8' : 'w-7 h-7'} rounded-full bg-gradient-to-br ${getAvatarGradient(
                      student.id
                    )} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                  >
                    {student.name.charAt(0)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`${rank === 1 ? 'text-sm' : 'text-[13px]'} font-bold text-slate-800 truncate`}>
                      {student.name}
                    </p>
                  </div>

                  {/* XP + accuracy dot */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <motion.span
                      key={`${student.id}-${weekOffset}`}
                      className={`${rank === 1 ? 'text-sm' : 'text-xs'} font-black text-slate-700 tabular-nums`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.06 + 0.2, duration: 0.4 }}
                    >
                      {student.weekXp.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </motion.span>
                    <span className="text-[10px] text-slate-400">XP</span>
                    <div className={`w-2 h-2 rounded-full ${accColor}`} title={`${student.accuracy}%`} />
                  </div>
                </motion.div>
              );
            })}

            {top5.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                {t('لا توجد بيانات', 'No data available')}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Current user section */}
        {currentUserEntry && !isCurrentInTop5 && (
          <>
            <div className="border-t border-dashed border-slate-200 my-3" />
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-sky-50/50 ring-1 ring-sky-200/40">
              <div className="w-5 text-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-500">{currentUserRank}</span>
              </div>
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarGradient(
                  currentUserEntry.id
                )} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
              >
                {currentUserEntry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <p className="text-[13px] font-bold text-slate-800 truncate">{currentUserEntry.name}</p>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {t('أنت', 'You')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs font-black text-slate-700 tabular-nums">
                  {currentUserEntry.weekXp.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
                <span className="text-[10px] text-slate-400">XP</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentUserEntry.accuracy >= 80 ? 'bg-emerald-400' : currentUserEntry.accuracy >= 60 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        {onViewFull && (
          <>
            <div className="border-t border-slate-100 mt-3 pt-3">
              <button
                onClick={onViewFull}
                className="w-full flex items-center justify-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
              >
                {t('عرض لوحة المتصدرين الكاملة', 'View Full Leaderboard')}
                <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SpaceWeeklyLeaderboardWidget;
