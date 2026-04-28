// Screen 2 — Role pick (Duolingo-clean rebuild).
//
// Layout:
//   - Solid cream-50 background.
//   - Corner mascot (md size) "welcoming".
//   - String thread progress dots (coral tone — matches the active accent).
//   - Headline + subhead (big, ink, breathing).
//   - Three stacked PhoneCards. Parent (enabled, coral accent), Student &
//     Teacher (disabled with lock + Soon pill).
//   - Each card has an emoji icon in a colored circle on the start side.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { StringMotif } from '../StringMotif';
import { MuteToggle } from '../MuteToggle';
import { ProgressDots } from '../ProgressDots';
import { PhoneCard } from '../PhoneCard';
import { usePhoneAppI18n } from '../phoneAppI18n';
import { useOnboardingState, useSoundIfNotMuted } from '../useOnboardingState';
import { arLeading, arBodyLeading } from '../phoneAppType';

interface RoleSpec {
  id: 'parent' | 'student' | 'teacher';
  title: string;
  sub: string;
  emoji: string;
  iconBg: string; // bg color of the emoji circle
  enabled: boolean;
}

export const RolePick: React.FC = () => {
  const { tp, locale, dir } = usePhoneAppI18n();
  const { step, next, back, setRole } = useOnboardingState();
  const sounds = useSoundIfNotMuted();
  const reduce = useReducedMotion();

  const cards: RoleSpec[] = [
    {
      id: 'parent',
      title: tp('role.parent.title'),
      sub: tp('role.parent.sub'),
      emoji: '\u{1F49B}', // yellow heart — warm, parental
      iconBg: 'bg-phone-coral-500',
      enabled: true,
    },
    {
      id: 'student',
      title: tp('role.student.title'),
      sub: tp('role.student.sub'),
      emoji: '\u{1F4DA}', // books
      iconBg: 'bg-slate-300',
      enabled: false,
    },
    {
      id: 'teacher',
      title: tp('role.teacher.title'),
      sub: tp('role.teacher.sub'),
      emoji: '\u{270F}\u{FE0F}', // pencil
      iconBg: 'bg-slate-300',
      enabled: false,
    },
  ];

  const pickRole = (id: 'parent' | 'student' | 'teacher') => {
    sounds.playClick();
    setRole(id);
    setTimeout(() => {
      sounds.playSure();
      next();
    }, 220);
  };

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ChevronEnd = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="relative flex-1 flex flex-col px-6 pt-16 pb-8">
      <MuteToggle />

      {/* Corner mascot */}
      <div className="absolute top-3 start-4 z-20">
        <StringMotif size="md" mood="welcoming" trackPointer={false} />
      </div>

      <ProgressDots step={step} tone="coral" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 0.1 }}
        className="text-center mt-3 mb-6"
      >
        <h2 className={`text-[28px] md:text-[32px] font-black text-phone-ink tracking-tight ${arLeading(locale)}`}>
          {tp('role.headline')}
        </h2>
        <p className={`mt-2 text-[15px] font-medium text-phone-stone ${arBodyLeading(locale)}`}>
          {tp('role.subhead')}
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex-1 flex flex-col gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0.05 }
                : { type: 'spring', stiffness: 280, damping: 24, delay: 0.18 + i * 0.08 }
            }
          >
            <PhoneCard
              tone="coral"
              disabled={!c.enabled}
              onClick={() => c.enabled && pickRole(c.id)}
              className="py-3.5"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center text-[22px] flex-shrink-0`}>
                  <span className="leading-none">{c.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-[18px] font-extrabold ${c.enabled ? 'text-phone-ink' : 'text-slate-500'}`}>
                      {c.title}
                    </h3>
                    {!c.enabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide bg-slate-200 text-slate-500 rounded-full px-2 py-0.5">
                        <Lock className="w-3 h-3" strokeWidth={3} />
                        {tp('role.soon')}
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-[13px] font-medium ${c.enabled ? 'text-phone-stone' : 'text-slate-400'} ${arBodyLeading(locale)}`}>
                    {c.sub}
                  </p>
                </div>
                {c.enabled && (
                  <ChevronEnd className="w-5 h-5 text-phone-coral-500 flex-shrink-0" strokeWidth={3} />
                )}
              </div>
            </PhoneCard>
          </motion.div>
        ))}
      </div>

      {/* Back link */}
      <motion.button
        type="button"
        onClick={() => { sounds.playClick(); back(); }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? { duration: 0.05 } : { delay: 0.5 }}
        className="mx-auto mt-6 inline-flex items-center gap-1 text-[12px] font-extrabold uppercase tracking-wide text-phone-stone hover:text-phone-ink transition-colors"
      >
        <BackIcon className="w-3.5 h-3.5" strokeWidth={3} />
        {tp('back')}
      </motion.button>
    </div>
  );
};

export default RolePick;
