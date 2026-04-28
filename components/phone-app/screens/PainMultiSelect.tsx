// Screen 3 — Pain points multi-select (Duolingo-clean rebuild).
//
// Layout:
//   - Solid sky-50 background.
//   - Corner mascot (md size) "thinking".
//   - String thread progress dots (sky tone).
//   - Headline + subhead.
//   - 2-column grid of 4 PhoneCards. Each card has an emoji icon chip on the
//     start side. Selected cards bump to sky-50 with a 4px bottom-shadow.
//   - Bottom CTA (sky primary) — disabled until ≥1 pain selected, then turns
//     active with a satisfying pop.

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { StringMotif } from '../StringMotif';
import { MuteToggle } from '../MuteToggle';
import { ProgressDots } from '../ProgressDots';
import { PhoneCard } from '../PhoneCard';
import { PhoneButton } from '../PhoneButton';
import { usePhoneAppI18n } from '../phoneAppI18n';
import { useOnboardingState, useSoundIfNotMuted } from '../useOnboardingState';
import { PARENT_PAINS } from '../phoneAppMockData';
import { arLeading, arBodyLeading } from '../phoneAppType';

// Per-pain emoji + icon-chip background. Static lookup so JIT scans them.
const PAIN_ICON: Record<string, { emoji: string; bg: string }> = {
  visibility:    { emoji: '\u{1F441}\u{FE0F}', bg: 'bg-phone-sky-100' },     // eye
  comprehension: { emoji: '\u{1F9E0}',         bg: 'bg-phone-cream-100' },   // brain
  time:          { emoji: '\u{23F0}',           bg: 'bg-phone-mint-100' },    // clock
  announcements: { emoji: '\u{1F514}',          bg: 'bg-amber-100' },         // bell
};

export const PainMultiSelect: React.FC = () => {
  const { tp, locale, dir } = usePhoneAppI18n();
  const { step, painPoints, togglePain, next, back, biggestPain, setBiggestPain } = useOnboardingState();
  const sounds = useSoundIfNotMuted();
  const reduce = useReducedMotion();

  const handleToggle = (id: string) => {
    sounds.playClick();
    togglePain(id);
    if (biggestPain === id) setBiggestPain(null);
  };

  const canContinue = painPoints.length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      sounds.playUnsure();
      return;
    }
    sounds.playSure();
    setTimeout(() => sounds.playTransition(), 120);
    next();
  };

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <div className="relative flex-1 flex flex-col px-5 pt-16 pb-8">
      <MuteToggle />

      <div className="absolute top-3 start-4 z-20">
        <StringMotif
          size="md"
          mood={painPoints.length > 0 ? 'welcoming' : 'thinking'}
          trackPointer={false}
        />
      </div>

      <ProgressDots step={step} tone="sky" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 0.1 }}
        className="text-center mt-3 mb-5"
      >
        <h2 className={`text-[24px] md:text-[28px] font-black text-phone-ink tracking-tight ${arLeading(locale)}`}>
          {tp('pain.headline')}
        </h2>
        <p className={`mt-1.5 text-[14px] font-medium text-phone-stone ${arBodyLeading(locale)}`}>
          {tp('pain.subhead')}
        </p>
      </motion.div>

      {/* Grid of pain cards */}
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {PARENT_PAINS.map((p, i) => {
          const selected = painPoints.includes(p.id);
          const icon = PAIN_ICON[p.id] ?? { emoji: '\u{1F4CD}', bg: 'bg-slate-100' };
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.05 }
                  : {
                      opacity: { duration: 0.3, delay: 0.15 + i * 0.06 },
                      y:       { type: 'spring', stiffness: 240, damping: 22, delay: 0.15 + i * 0.06 },
                    }
              }
            >
              <PhoneCard
                tone="sky"
                selected={selected}
                onClick={() => handleToggle(p.id)}
                className="min-h-[128px] p-3.5"
              >
                {/* Icon chip */}
                <div className={`w-10 h-10 rounded-xl ${icon.bg} flex items-center justify-center text-[18px] mb-2`}>
                  <span className="leading-none">{icon.emoji}</span>
                </div>

                <p className={`text-[14px] font-extrabold text-phone-ink pe-5 ${arBodyLeading(locale)}`}>
                  {locale === 'ar' ? p.ar : p.en}
                </p>

                {/* Check badge — pop into the top-end corner when selected */}
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      key="check"
                      initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                      animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 460, damping: 18 }}
                      className="absolute top-2 end-2 w-6 h-6 rounded-full bg-phone-sky-500 text-white flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3.6} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </PhoneCard>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: canContinue && !reduce ? [1, 1.025, 1] : 1,
        }}
        transition={
          reduce
            ? { duration: 0.05 }
            : {
                opacity: { duration: 0.3, delay: 0.5 },
                y:       { duration: 0.3, delay: 0.5 },
                scale:   { duration: 0.45, type: 'spring', stiffness: 320, damping: 18 },
              }
        }
        className="mt-6"
      >
        <PhoneButton
          tone="sky"
          variant="primary"
          size="lg"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {tp('pain.cta')}
        </PhoneButton>
      </motion.div>

      {/* Back */}
      <motion.button
        type="button"
        onClick={() => { sounds.playClick(); back(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? { duration: 0.05 } : { delay: 0.6 }}
        className="mx-auto mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-phone-stone hover:text-phone-ink transition-colors"
      >
        <BackIcon className="w-3.5 h-3.5" strokeWidth={3} />
        {tp('back')}
      </motion.button>
    </div>
  );
};

export default PainMultiSelect;
