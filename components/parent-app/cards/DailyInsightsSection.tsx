// DailyInsightsSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Home section: WeeklyInsightCard (hero, full-width) + a horizontal-scroll
// strip of topic insight cards (one per topic). Lives between the report
// card and the rest of Home so the daily check-in feels prominent.
//
// Layout:
//   ┌─────────────────────────────────────────┐
//   │ Section header — title + subtitle       │
//   ├─────────────────────────────────────────┤
//   │ ╔═════════════════════════════════════╗ │  ← weekly hero
//   │ ║   Weekly Insight Card (gradient)    ║ │
//   │ ╚═════════════════════════════════════╝ │
//   ├─────────────────────────────────────────┤
//   │ → ┌─────┐┌─────┐┌─────┐┌─────┐  ...    │  ← horizontal scroll
//   │   │ M   ││ F   ││ Mo  ││ S   │         │
//   │   └─────┘└─────┘└─────┘└─────┘         │
//   └─────────────────────────────────────────┘
//
// Horizontal scroll uses CSS `snap-x snap-mandatory` so cards land flush
// after a swipe. The strip extends past the screen edge intentionally so
// the last card peeks — telegraphing "more to the side."
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import {
  getDailyInsightsForChild,
  getWeeklyInsightForChild,
} from '../data/parentAppDailyInsightsMock';
import { WeeklyInsightCard } from './WeeklyInsightCard';
import { DailyInsightCard } from './DailyInsightCard';

export const DailyInsightsSection: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild, activeChildId } = useParentAppContext();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const weekly = useMemo(
    () => getWeeklyInsightForChild(activeChildId),
    [activeChildId]
  );
  const insights = useMemo(
    () => getDailyInsightsForChild(activeChildId),
    [activeChildId]
  );

  if (!weekly && insights.length === 0) return null;

  return (
    <section
      aria-label={t('parentApp.insights.title')}
      className="space-y-3"
    >
      {/* Section header */}
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-slate-800 leading-tight inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-duo-purple" strokeWidth={2.5} />
            {t('parentApp.insights.title')}
          </h2>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            {t('parentApp.insights.subtitle')}
          </p>
        </div>
      </header>

      {/* Weekly hero */}
      {weekly && (
        <WeeklyInsightCard
          weekly={weekly}
          childNameAr={activeChild.nameAr}
          childNameEn={activeChild.nameEn}
        />
      )}

      {/* Topic strip — horizontal scroll. Negative inline margin breaks out
          of the page's px-5 so the first/last cards still have visible
          padding without us needing to re-pad the container. */}
      {insights.length > 0 && (
        <div className="-mx-5">
          <div
            className="overflow-x-auto overscroll-x-contain px-5 pb-1 snap-x snap-mandatory
                       scrollbar-thin
                       [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
            role="list"
            aria-label={t('parentApp.insights.title')}
          >
            <div className="flex items-stretch gap-3 pe-5">
              {insights.map((ins, idx) => (
                <div key={ins.topic} role="listitem">
                  <DailyInsightCard insight={ins} index={idx} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DailyInsightsSection;
