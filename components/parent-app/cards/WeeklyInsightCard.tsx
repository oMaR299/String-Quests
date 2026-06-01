// WeeklyInsightCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Hero card at the top of the Daily Insights section. Bigger than the topic
// cards, dramatic gradient, longer narrative.
//
// Tap → expands an inline highlights section (3 bullet points). The bullet
// list is collapsed by default so the card stays compact on first view.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type { WeeklyInsight } from '../data/parentAppDailyInsightsMock';

export interface WeeklyInsightCardProps {
  weekly: WeeklyInsight;
  childNameAr: string;
  childNameEn: string;
}

export const WeeklyInsightCard: React.FC<WeeklyInsightCardProps> = ({
  weekly,
  childNameAr,
  childNameEn,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const [expanded, setExpanded] = useState(false);

  const headline =
    locale === 'ar' ? weekly.headlineAr : weekly.headlineEn;
  const paragraph =
    locale === 'ar' ? weekly.paragraphAr : weekly.paragraphEn;
  const highlights =
    locale === 'ar' ? weekly.highlightsAr : weekly.highlightsEn;
  const childName = locale === 'ar' ? childNameAr : childNameEn;

  return (
    <motion.button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24 }
      }
      aria-expanded={expanded}
      className="relative w-full text-start rounded-3xl bg-gradient-to-br from-duo-purple via-indigo-500 to-duo-blue overflow-hidden p-4 motion-safe:active:scale-[0.99] transition-transform shadow-[0_8px_24px_-8px_rgba(124,58,237,0.4)]"
    >
      {/* Decorative blurred orbs — pure presentation, ARIA-hidden. */}
      <div
        className="absolute -top-12 -end-10 w-40 h-40 rounded-full bg-white/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -start-12 w-44 h-44 rounded-full bg-white/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-2.5">
        {/* Pill: AI + weekly label + child name */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-extrabold">
            <Sparkles className="w-3 h-3" strokeWidth={2.5} />
            {t('parentApp.insights.aiBadge')}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80">
            {t('parentApp.insights.weekly.label')} · {childName}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-black text-white leading-snug">
          {headline}
        </h3>

        {/* Paragraph */}
        <p className="text-xs font-bold text-white/90 leading-relaxed">
          {paragraph}
        </p>

        {/* Expand toggle */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-white/90 inline-flex items-center gap-1">
            {t('parentApp.insights.weekly.highlightsLabel')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/80 transition-transform ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ul
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0.1 } : { duration: 0.22 }}
              className="overflow-hidden space-y-1.5 pt-1"
            >
              {highlights.map((line, idx) => (
                <li
                  key={idx}
                  className="rounded-xl bg-white/15 backdrop-blur-sm px-2.5 py-2 flex items-start gap-2"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold text-white/95 leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default WeeklyInsightCard;
