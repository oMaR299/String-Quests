// HeroHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Persistent warm hero at the top of the hub (modeled on the greeting heroes in
// the reference `image copy 2.png`): child avatar + name + a one-line warm AI
// status + a tiny this-week streak pulse. Presentation-only — the caller computes
// statusLine (getViewBrief) + summary (getGrowthSummary) so it re-renders cheaply
// across tab switches. Soft lavender→pink gradient (inline), Cairo, RTL.

import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { AVATAR_STYLES, type MockChild } from '../parentAppMockData';
import { DAY_LETTERS_AR, DAY_LETTERS_EN } from './skillMapKit';
import type { GrowthSummary } from './data/parentAppGrowthMock';

export const HeroHeader: React.FC<{
  child: MockChild;
  childName: string;
  statusLine: string;
  summary: GrowthSummary;
}> = ({ child, childName, statusLine, summary }) => {
  const { locale } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const t = useCallback((k: string) => getParentAppString(locale, k), [locale]);
  const avatar = AVATAR_STYLES[child.avatarColor];
  const letters = locale === 'ar' ? DAY_LETTERS_AR : DAY_LETTERS_EN;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 26 }}
      className="rounded-[28px] p-5 flex flex-col gap-4"
      style={{ background: 'linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 45%,#FCE7F3 100%)' }}
      aria-label={t('parentApp.skillMap.hero.eyebrow')}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl inline-flex items-center justify-center shrink-0 text-lg font-black ${avatar.bg} ${avatar.text}`}
          aria-hidden="true"
        >
          {child.avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('parentApp.skillMap.hero.eyebrow')}
          </span>
          <h1 className="text-xl font-black text-slate-800 leading-tight truncate">{childName}</h1>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-black text-orange-500 shrink-0 tabular-nums">
          <Flame className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          {summary.currentStreak}
        </span>
      </div>

      {statusLine && (
        <p className="text-[13.5px] font-bold text-slate-700 leading-relaxed text-start">{statusLine}</p>
      )}

      <div className="flex items-stretch justify-between gap-1">
        {summary.weekActive.map((d, i) => (
          <div key={d.dateIso} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span
              className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${
                d.active
                  ? 'bg-orange-400 text-white'
                  : d.isToday
                    ? 'bg-white ring-2 ring-orange-300 text-slate-400'
                    : 'bg-white/60 text-slate-300'
              }`}
              aria-hidden="true"
            >
              {d.active && <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </span>
            <span className="text-[9px] font-bold text-slate-400">{letters[i]}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default HeroHeader;
