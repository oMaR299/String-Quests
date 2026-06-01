// HeroWinCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The kid's daily progress card. Plain white glass surface — the rich
// time-of-day-aware gradient now lives in <GreetingStrip /> at the top of the
// page; this card is back to a clean, content-first kid summary.
//
// Layout (start-aligned, RTL-safe via logical props):
//
//   ┌────────────────────────────────────────────────────────────┐
//   │ [avatar] Sara                                  [اليوم/Today]│
//   │                                                             │
//   │ Sara finished 3 lessons today                               │
//   │                                                             │
//   │ [Time 22 min] [Accuracy 88%]                                │
//   │                                                             │
//   │ ┌─────────────────────────────────────────────────────────┐│
//   │ │              Cheer Sara                                  ││
//   │ └─────────────────────────────────────────────────────────┘│
//   └────────────────────────────────────────────────────────────┘
//
// Cheer button: one-tap-per-session. On tap: confetti toast appears above
// the button briefly, then the button settles into a disabled "Done!" state
// for the remainder of the session. Reduced-motion: skip toast animation.
//
// AR has gendered conjugation in the headline: "أنجزت" (female) vs "أنجز"
// (male). EN doesn't — same string regardless of gender.

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { AVATAR_STYLES } from '../parentAppMockData';
import { useParentAppContext } from '../useParentAppContext';
import { PrimaryButton } from '../../parent-onboarding/PrimaryButton';

export const HeroWinCard: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();
  const reduceMotion = useReducedMotion();

  const [cheered, setCheered] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const focal = activeChild;
  const focalStyle = AVATAR_STYLES[focal.avatarColor];
  const focalName = locale === 'ar' ? focal.nameAr : focal.nameEn;

  // AR has gendered conjugation; EN doesn't.
  const headlineKey =
    locale === 'ar' && focal.gender === 'male'
      ? 'parentApp.hero.lessonsHeadlineMale'
      : 'parentApp.hero.lessonsHeadline';
  const headline = interpolate(t(headlineKey), {
    name: focalName,
    n: focal.todayLessons,
  });

  const handleCheer = useCallback(() => {
    if (cheered) return;
    setCheered(true);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 1500);
  }, [cheered]);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24 }
      }
      className="rounded-2xl bg-white border border-slate-200 p-5"
      aria-label={t('parentApp.hero.todayPill')}
    >
      {/* Top row: avatar + kid name + Today pill */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full inline-flex items-center justify-center shrink-0 ${focalStyle.bg} ${focalStyle.text}`}
        >
          <span className="text-xl font-black">{focal.avatarInitial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-black text-slate-800 leading-tight truncate">
            {focalName}
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${focalStyle.softBg} text-slate-700 text-[11px] font-extrabold uppercase tracking-wide`}
        >
          {t('parentApp.hero.todayPill')}
        </span>
      </div>

      {/* Headline */}
      <h2 className="mt-3.5 text-base font-extrabold text-slate-800 leading-snug">
        {headline}
      </h2>

      {/* Stat chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-duo-blue-light text-duo-blue-dark text-xs font-extrabold">
          <span className="opacity-80">{t('parentApp.hero.durationLabel')}</span>
          <span>
            {interpolate(t('parentApp.hero.durationValue'), {
              mins: focal.todayMins,
            })}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-duo-green-light text-emerald-700 text-xs font-extrabold">
          <span className="opacity-80">{t('parentApp.hero.accuracyLabel')}</span>
          <span>
            {interpolate(t('parentApp.hero.accuracyValue'), {
              accuracy: focal.todayAccuracy,
            })}
          </span>
        </span>
      </div>

      {/* Cheer CTA — chunky 3D duo-blue button */}
      <div className="relative mt-4">
        <PrimaryButton onClick={handleCheer} disabled={cheered}>
          {cheered
            ? t('parentApp.hero.cheeredToast')
            : interpolate(t('parentApp.hero.cheerCta'), { name: focalName })}
        </PrimaryButton>

        <AnimatePresence>
          {showToast && !reduceMotion && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 -top-10 flex items-center justify-center pointer-events-none"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-duo-green text-white text-xs font-bold">
                <span>{t('parentApp.hero.cheeredToast')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default HeroWinCard;
