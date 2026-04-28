// Screen 1 — Brand intro (Duolingo-clean rebuild).
//
// Layout:
//   - Solid mint-50 phone background (driven by OnboardingFlow).
//   - Top corners: AR/EN locale toggle (start) + mute (end).
//   - Hero mascot (180px) at vertical centre, in a friendly "welcoming" pose.
//   - "String" wordmark in big black-weight ink. NOT gradient text.
//   - Tiny "by Quests" line in stone uppercase.
//   - Big bold headline + subhead with breathing space.
//   - Single mint primary PhoneButton CTA at the bottom — full width, 3D press.

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StringMotif } from '../StringMotif';
import { LocaleToggle } from '../LocaleToggle';
import { MuteToggle } from '../MuteToggle';
import { PhoneButton } from '../PhoneButton';
import { usePhoneAppI18n } from '../phoneAppI18n';
import { useOnboardingState, useSoundIfNotMuted } from '../useOnboardingState';
import { arLeading, arBodyLeading } from '../phoneAppType';

export const BrandIntro: React.FC = () => {
  const { tp, locale } = usePhoneAppI18n();
  const { next } = useOnboardingState();
  const sounds = useSoundIfNotMuted();
  const reduce = useReducedMotion();

  // Soft transition tone on mount (after brief delay so layout settles)
  useEffect(() => {
    const id = setTimeout(() => sounds.playTransition(), 250);
    return () => clearTimeout(id);
  }, [sounds]);

  const handleStart = () => {
    sounds.playClick();
    setTimeout(() => sounds.playTransition(), 120);
    next();
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-between px-6 pt-20 pb-10 text-center">
      <LocaleToggle />
      <MuteToggle />

      {/* Hero block */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
        >
          <StringMotif size="hero" mood="welcoming" trackPointer />
        </motion.div>

        {/* Wordmark — big, black-weight, ink color */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.05 } : { duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="mt-8 text-[48px] md:text-[56px] font-black text-phone-ink tracking-tight leading-none"
        >
          String
        </motion.h1>

        {/* Sub-wordmark "by Quests" */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 0.55 }}
          className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-phone-stone"
        >
          by Quests
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.05 } : { duration: 0.5, delay: 0.7, ease: 'easeOut' }}
          className={`mt-8 text-[28px] md:text-[32px] font-black text-phone-ink tracking-tight ${arLeading(locale)}`}
        >
          {tp('brand.headline')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.05 } : { duration: 0.5, delay: 0.85, ease: 'easeOut' }}
          className={`mt-3 text-[16px] font-medium text-phone-stone max-w-[20rem] ${arBodyLeading(locale)}`}
        >
          {tp('brand.subhead')}
        </motion.p>
      </div>

      {/* CTA — the iconic 3D button */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 1.05 }}
        className="w-full max-w-xs"
      >
        <PhoneButton tone="mint" variant="primary" size="lg" onClick={handleStart}>
          {tp('brand.cta')}
        </PhoneButton>
      </motion.div>
    </div>
  );
};

export default BrandIntro;
