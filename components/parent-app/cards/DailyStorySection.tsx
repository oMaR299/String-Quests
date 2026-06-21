// DailyStorySection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Home section "ملاحظات اليوم" — the daily story of the child's whole day as
// SIX self-contained pastel cards (school, home, well-being, academic,
// attendance, proud moment). Replaces the old WeeklyInsightCard + topic strip.
//
// Defaults to TODAY. A small "الأيام السابقة" button reveals a week-day strip
// (ref: the M T W T F S S selector) so the parent can flip back through past
// days; each past day re-renders the same six cards for that date.
//
// Per the plan, each card is wrapped in <PremiumGate> (no-op today) so depth
// can be gated later with a single flag.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, CalendarDays } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import {
  getDailyStory,
  getRecentDays,
  isDayComplete,
  todayIso,
  formatDayLabel,
} from '../data/parentAppDailyStoryMock';
import { DailyStoryStack } from './DailyStoryStack';

export const DailyStorySection: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild, activeChildId } = useParentAppContext();
  const reduceMotion = useReducedMotion() ?? false;
  const ar = locale === 'ar';

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const [selectedIso, setSelectedIso] = useState<string>(() => todayIso());
  const [showDays, setShowDays] = useState(false);

  const days = useMemo(() => getRecentDays(7), []);
  const story = useMemo(
    () => getDailyStory(activeChildId, selectedIso),
    [activeChildId, selectedIso]
  );
  const complete = useMemo(() => isDayComplete(selectedIso), [selectedIso]);
  const isToday = selectedIso === todayIso();

  const name = ar ? activeChild.nameAr : activeChild.nameEn;
  const subtitle = isToday
    ? t('parentApp.story.subtitle').replace('{name}', name)
    : (ar ? formatDayLabel(selectedIso).ar : formatDayLabel(selectedIso).en);

  return (
    <section aria-label={t('parentApp.insights.title')} className="space-y-3">
      {/* Section header */}
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-slate-800 leading-tight inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-duo-purple" strokeWidth={2.5} />
            {t('parentApp.insights.title')}
          </h2>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">{subtitle}</p>
        </div>

        {/* Previous days toggle */}
        <button
          type="button"
          onClick={() => setShowDays((v) => !v)}
          aria-expanded={showDays}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold border transition-colors shrink-0 ${
            showDays
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" strokeWidth={2.5} />
          {t('parentApp.story.prevDays')}
        </button>
      </header>

      {/* Day strip */}
      <AnimatePresence initial={false}>
        {showDays && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex items-stretch justify-between gap-1.5 px-1 pb-1">
              {days.map((d) => {
                const selected = d.iso === selectedIso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedIso(d.iso)}
                    aria-pressed={selected}
                    className={`flex-1 flex flex-col items-center gap-0.5 rounded-2xl py-2 border transition-colors ${
                      selected
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold opacity-70 leading-none">
                      {ar ? d.letterAr : d.letterEn}
                    </span>
                    <span className="text-sm font-black leading-none">{d.dayNum}</span>
                    {d.isToday && (
                      <span
                        className={`text-[8px] font-extrabold leading-none ${selected ? 'text-white/80' : 'text-duo-purple'}`}
                      >
                        {t('parentApp.story.today')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The six cards as a swipeable deck — keyed by child+date so the stack
          resets to the front card when the child or day changes. */}
      <DailyStoryStack key={`${activeChildId}-${selectedIso}`} cards={story.cards} complete={complete} />
    </section>
  );
};

export default DailyStorySection;
