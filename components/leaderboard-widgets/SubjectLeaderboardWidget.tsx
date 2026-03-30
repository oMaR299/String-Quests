import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calculator, FlaskConical, Languages, Landmark,
  Palette, Moon, Globe, Monitor, Atom, Beaker, Leaf, Users,
} from 'lucide-react';
import { MOCK_SCHOOL_DATA } from '../../data/complexLeaderboardData';
import type { Subject, StudentProfile } from '../../data/complexLeaderboardData';

type SubjectKey = Exclude<Subject, 'all'>;

interface SubjectLeaderboardWidgetProps {
  locale?: 'ar' | 'en';
  defaultSubject?: SubjectKey;
  className?: string;
}

const SUBJECT_AR: Record<SubjectKey, string> = {
  math: 'رياضيات',
  science: 'علوم',
  languages: 'لغات',
  history: 'تاريخ',
  arts: 'فنون',
  islamic: 'تربية إسلامية',
  english: 'إنجليزية',
  computer: 'حاسب',
  physics: 'فيزياء',
  chemistry: 'كيمياء',
  biology: 'أحياء',
  social: 'اجتماعيات',
};

const SUBJECT_EN: Record<SubjectKey, string> = {
  math: 'Math',
  science: 'Science',
  languages: 'Languages',
  history: 'History',
  arts: 'Arts',
  islamic: 'Islamic',
  english: 'English',
  computer: 'Computer',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  social: 'Social',
};

const SUBJECT_ICONS: Record<SubjectKey, React.ElementType> = {
  math: Calculator,
  science: FlaskConical,
  languages: Languages,
  history: Landmark,
  arts: Palette,
  islamic: Moon,
  english: Globe,
  computer: Monitor,
  physics: Atom,
  chemistry: Beaker,
  biology: Leaf,
  social: Users,
};

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
];

const ALL_SUBJECTS: SubjectKey[] = [
  'math', 'science', 'languages', 'history', 'arts',
  'islamic', 'english', 'computer', 'physics', 'chemistry', 'biology', 'social',
];

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = (minutes / 60).toFixed(1);
  return `${h}h`;
}

function AccuracyBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const trackColor =
    value >= 80 ? 'bg-emerald-100' : value >= 60 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-14 h-1.5 rounded-full ${trackColor} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8">
        {value}%
      </span>
    </div>
  );
}

export default function SubjectLeaderboardWidget({
  locale = 'ar',
  defaultSubject = 'math',
  className = '',
}: SubjectLeaderboardWidgetProps) {
  const [activeSubject, setActiveSubject] = useState<SubjectKey>(defaultSubject);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const isRTL = locale === 'ar';

  const SubjectIcon = SUBJECT_ICONS[activeSubject];

  const topStudents = useMemo(() => {
    return [...MOCK_SCHOOL_DATA]
      .filter((s) => s.subjectDetails[activeSubject].xp > 0)
      .sort((a, b) => b.subjectDetails[activeSubject].xp - a.subjectDetails[activeSubject].xp)
      .slice(0, 8);
  }, [activeSubject]);

  const getAvatarGradient = (id: string) => {
    const idx = Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  };

  // Auto-scroll active tab into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeEl = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeSubject]);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm font-['Cairo'] ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
          <SubjectIcon className="w-4.5 h-4.5 text-sky-500" />
        </div>
        <h2 className="text-lg font-black text-slate-900">{t('ترتيب المواد', 'Subject Rankings')}</h2>
      </div>

      {/* Subject Tabs - Scrollable */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {ALL_SUBJECTS.map((subj) => {
          const Icon = SUBJECT_ICONS[subj];
          const isActive = activeSubject === subj;
          return (
            <button
              key={subj}
              data-active={isActive}
              onClick={() => setActiveSubject(subj)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3 h-3" />
              {t(SUBJECT_AR[subj], SUBJECT_EN[subj])}
            </button>
          );
        })}
      </div>

      {/* Student List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubject}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {/* Column Header */}
          <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="w-5">#</div>
            <div className="w-7" />
            <div className="flex-1">{t('الطالب', 'Student')}</div>
            <div className="w-16 text-center">XP</div>
            <div className="w-[5.5rem]">{t('الدقة', 'Accuracy')}</div>
            <div className="w-10 text-center">{t('الوقت', 'Time')}</div>
          </div>

          {topStudents.map((student, idx) => {
            const detail = student.subjectDetails[activeSubject];
            const rank = idx + 1;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-slate-50/80 cursor-default"
              >
                {/* Rank */}
                <div className="w-5 text-center">
                  {rank <= 3 ? (
                    <span className={`text-sm font-black ${
                      rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-orange-600'
                    }`}>{rank}</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarGradient(
                    student.id
                  )} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                >
                  {student.name.charAt(0)}
                </div>

                {/* Name & Grade */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {t(`${student.grade}-${student.section}`, `G${student.grade}-${student.section}`)}
                  </p>
                </div>

                {/* Subject XP */}
                <div className="w-16 text-center">
                  <span className="text-sm font-black text-slate-700 tabular-nums">
                    {detail.xp.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                {/* Accuracy */}
                <div className="w-[5.5rem]">
                  <AccuracyBar value={detail.accuracy} />
                </div>

                {/* Time Spent */}
                <div className="w-10 text-center">
                  <span className="text-[11px] font-bold text-slate-500">{formatTime(detail.timeSpent)}</span>
                </div>
              </motion.div>
            );
          })}

          {topStudents.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              {t('لا توجد بيانات لهذه المادة', 'No data for this subject')}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
