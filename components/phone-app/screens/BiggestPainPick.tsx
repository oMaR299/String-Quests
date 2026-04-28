// Screen 4 — Biggest pain pick (Duolingo-clean rebuild).
//
// Layout:
//   - Solid mint-50 background (focused decision).
//   - Corner mascot — "thinking" if no choice, "welcoming" once chosen.
//   - String thread progress dots (mint tone).
//   - Filtered cards (only the pains the user picked) in a single-column
//     stack using PhoneCards.
//   - Selected card has the iconic 3D mint bottom-shadow.
//   - Auto-select fires a small mascot bounce.
//   - Mint primary CTA at the bottom.

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StringMotif } from '../StringMotif';
import { MuteToggle } from '../MuteToggle';
import { ProgressDots } from '../ProgressDots';
import { PhoneCard } from '../PhoneCard';
import { PhoneButton } from '../PhoneButton';
import { usePhoneAppI18n } from '../phoneAppI18n';
import { useOnboardingState, useSoundIfNotMuted } from '../useOnboardingState';
import { arLeading, arBodyLeading } from '../phoneAppType';

export const BiggestPainPick: React.FC = () => {
  const { tp, locale, dir } = usePhoneAppI18n();
  const { step, pickedPainPoints, biggestPain, setBiggestPain, next, back } = useOnboardingState();
  const sounds = useSoundIfNotMuted();
  const reduce = useReducedMotion();

  // Auto-select first if the user has picks but no biggestPain set yet.
  useEffect(() => {
    if (!biggestPain && pickedPainPoints.length > 0) {
      setBiggestPain(pickedPainPoints[0].id);
    }
  }, [biggestPain, pickedPainPoints, setBiggestPain]);

  const handlePick = (id: string) => {
    if (id === biggestPain) return;
    sounds.playClick();
    setBiggestPain(id);
  };

  const handleContinue = () => {
    if (!biggestPain) {
      sounds.playUnsure();
      return;
    }
    sounds.playSure();
    setTimeout(() => sounds.playTransition(), 120);
    next();
  };

  // Reorder so the selected card is first.
  const ordered = biggestPain
    ? [
        ...pickedPainPoints.filter(p => p.id === biggestPain),
        ...pickedPainPoints.filter(p => p.id !== biggestPain),
      ]
    : pickedPainPoints;

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  // Numbered "rank" badge — 1 for the selected, otherwise empty / 2-4.
  const rankFor = (idx: number, selected: boolean) => (selected ? '1' : String(idx + 1));

  return (
    <div className="relative flex-1 flex flex-col px-5 pt-16 pb-8">
      <MuteToggle />

      <motion.div
        className="absolute top-3 start-4 z-20"
        animate={
          biggestPain && !reduce
            ? { y: [0, -6, 0] }
            : { y: 0 }
        }
        transition={reduce ? undefined : { duration: 0.5, ease: 'easeOut' }}
        key={biggestPain ?? 'none'}
      >
        <StringMotif
          size="md"
          mood={biggestPain ? 'welcoming' : 'thinking'}
          trackPointer={false}
        />
      </motion.div>

      <ProgressDots step={step} tone="mint" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 0.1 }}
        className="text-center mt-3 mb-5"
      >
        <h2 className={`text-[24px] md:text-[28px] font-black text-phone-ink tracking-tight ${arLeading(locale)}`}>
          {tp('biggest.headline')}
        </h2>
        <p className={`mt-1.5 text-[14px] font-medium text-phone-stone ${arBodyLeading(locale)}`}>
          {tp('biggest.subhead')}
        </p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {ordered.map((p, idx) => {
            const selected = p.id === biggestPain;
            return (
              <motion.div
                key={p.id}
                layoutId={reduce ? undefined : `pain-card-${p.id}`}
                layout={!reduce}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0.05 }
                    : { type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }
                }
              >
                <PhoneCard
                  tone="mint"
                  selected={selected}
                  onClick={() => handlePick(p.id)}
                  className="p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank chip */}
                    <span
                      className={
                        selected
                          ? 'flex-shrink-0 w-9 h-9 rounded-xl bg-phone-mint-500 text-white text-[15px] font-black flex items-center justify-center'
                          : 'flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 text-slate-400 text-[15px] font-black flex items-center justify-center'
                      }
                    >
                      {rankFor(idx, selected)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-extrabold text-phone-ink ${arBodyLeading(locale)}`}>
                        {locale === 'ar' ? p.ar : p.en}
                      </p>
                      {selected && (
                        <p className={`mt-0.5 text-[12px] font-bold uppercase tracking-wide text-phone-mint-600 ${arBodyLeading(locale)}`}>
                          {locale === 'ar' ? 'هذه أولويتك' : 'your top one'}
                        </p>
                      )}
                    </div>
                  </div>
                </PhoneCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.3, delay: 0.4 }}
        className="mt-6"
      >
        <PhoneButton
          tone="mint"
          variant="primary"
          size="lg"
          disabled={!biggestPain}
          onClick={handleContinue}
        >
          {tp('biggest.cta')}
        </PhoneButton>
      </motion.div>

      {/* Back */}
      <motion.button
        type="button"
        onClick={() => { sounds.playClick(); back(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? { duration: 0.05 } : { delay: 0.5 }}
        className="mx-auto mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-phone-stone hover:text-phone-ink transition-colors"
      >
        <BackIcon className="w-3.5 h-3.5" strokeWidth={3} />
        {tp('back')}
      </motion.button>
    </div>
  );
};

export default BiggestPainPick;
