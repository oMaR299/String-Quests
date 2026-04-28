// Screen 5 — Parent Aha (Duolingo-clean rebuild).
//
// Layout:
//   - Solid cream-50 background (warm, celebratory).
//   - Corner mascot — "proud" pose; switches to "celebrating" with a bounce
//     when confetti fires.
//   - String thread progress dots (coral tone — last step).
//   - Headline + subhead.
//   - Notification banner drops in from the top.
//   - SOLID white phone-mockup card with thick border and bottom-shadow,
//     containing 4 mastery rings in a 2×2 grid + 2 callouts.
//   - Confetti uses 4 solid palette colors.
//   - v1 endpoint CTA: ACTIVE coral primary button — tap shows toast.

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bell, MessageCircleQuestion, Trophy, ChevronRight, ChevronLeft, Sparkles,
} from 'lucide-react';
import { StringMotif } from '../StringMotif';
import { MuteToggle } from '../MuteToggle';
import { ProgressDots } from '../ProgressDots';
import { PhoneButton } from '../PhoneButton';
import { usePhoneAppI18n } from '../phoneAppI18n';
import { useOnboardingState, useSoundIfNotMuted } from '../useOnboardingState';
import { WEEKLY_SUMMARY_MOCK, phoneAppRng } from '../phoneAppMockData';
import { arLeading, arBodyLeading } from '../phoneAppType';

// ---------------------------------------------------------------------------
// Mastery ring — solid Duolingo-style stroke ring with rounded caps.
// ---------------------------------------------------------------------------

const RING_RADIUS = 28;
const RING_STROKE = 7;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

// Solid accents — one per ring (no multi-stop gradients).
const RING_COLORS: Array<{ track: string; fill: string }> = [
  { track: '#E5E7EB', fill: '#0EA5E9' }, // sky
  { track: '#E5E7EB', fill: '#10B981' }, // mint
  { track: '#E5E7EB', fill: '#F87171' }, // coral
  { track: '#E5E7EB', fill: '#FCD34D' }, // gold
];

interface MasteryRingProps {
  percent: number;
  label: string;
  delay: number;
  index: number;
  reduce: boolean;
  onArrival?: () => void;
}

const MasteryRing: React.FC<MasteryRingProps> = ({ percent, label, delay, index, reduce, onArrival }) => {
  const offset = RING_CIRC - (RING_CIRC * percent) / 100;
  const colors = RING_COLORS[index % RING_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 280, damping: 22, delay }}
      onAnimationComplete={onArrival}
      className="flex flex-col items-center"
    >
      <div className="relative w-[72px] h-[72px]">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle
            cx="36" cy="36" r={RING_RADIUS}
            fill="none"
            stroke={colors.track}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
          />
          <motion.circle
            cx="36" cy="36" r={RING_RADIUS}
            fill="none"
            stroke={colors.fill}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            initial={{ strokeDashoffset: RING_CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={reduce ? { duration: 0 } : { duration: 1.1, delay: delay + 0.1, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[16px] font-black text-phone-ink tabular-nums">
          {percent}
          <span className="text-[10px] font-extrabold ms-0.5 text-phone-stone">%</span>
        </span>
      </div>
      <span className="mt-1.5 text-[11px] font-extrabold text-phone-ink tracking-tight text-center">
        {label}
      </span>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Confetti — 28 particles in 4 palette solids, ~1.4s lifetime.
// ---------------------------------------------------------------------------

interface ConfettiPiece {
  id: number;
  x: number;
  rotate: number;
  drift: number;
  fall: number;
  delay: number;
  color: string;
  size: number;
}

const CONFETTI_COLORS = ['#F87171', '#10B981', '#0EA5E9', '#FCD34D'];

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: phoneAppRng() * 100,
    rotate: phoneAppRng() * 360,
    drift: (phoneAppRng() - 0.5) * 80,
    fall: 220 + phoneAppRng() * 160,
    delay: phoneAppRng() * 0.25,
    color: CONFETTI_COLORS[Math.floor(phoneAppRng() * CONFETTI_COLORS.length)],
    size: 5 + Math.floor(phoneAppRng() * 5),
  }));
}

const ConfettiBurst: React.FC<{ active: boolean }> = ({ active }) => {
  const reduce = useReducedMotion();
  const pieces = useRef<ConfettiPiece[]>(makeConfetti(28));
  if (reduce || !active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      {pieces.current.map(p => (
        <motion.span
          key={p.id}
          className="absolute block rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0, y: 0, x: 0, rotate: p.rotate }}
          animate={{ opacity: [0, 1, 1, 0], y: p.fall, x: p.drift, rotate: p.rotate + 540 }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export const ParentAha: React.FC = () => {
  const { tp, locale, dir } = usePhoneAppI18n();
  const { step, back, reset } = useOnboardingState();
  const sounds = useSoundIfNotMuted();
  const reduce = useReducedMotion();

  const [showBanner, setShowBanner] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [ringsArrived, setRingsArrived] = useState(0);
  const [showCallouts, setShowCallouts] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mascotMood, setMascotMood] = useState<'thinking' | 'celebrating' | 'proud'>('proud');

  const child = WEEKLY_SUMMARY_MOCK.childPlaceholder;
  const childText = locale === 'ar' ? child.ar : child.en;

  // Choreography: banner → card → rings (stagger) → callouts → confetti
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise(r => setTimeout(r, 250));
      if (cancelled) return;
      sounds.playSoftDing();
      setShowBanner(true);

      await new Promise(r => setTimeout(r, 700));
      if (cancelled) return;
      setShowCard(true);

      await new Promise(r => setTimeout(r, 200));
      if (cancelled) return;
      for (let i = 0; i < 4; i++) {
        if (cancelled) return;
        sounds.playTransition();
        await new Promise(r => setTimeout(r, 150));
      }

      await new Promise(r => setTimeout(r, 350));
      if (cancelled) return;
      sounds.playSuccessShort();
      setShowCallouts(true);

      await new Promise(r => setTimeout(r, 350));
      if (cancelled) return;
      sounds.playCelebration();
      setMascotMood('celebrating');
      setConfettiActive(true);

      await new Promise(r => setTimeout(r, 1600));
      if (cancelled) return;
      setConfettiActive(false);
      setMascotMood('proud');
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCtaTap = () => {
    sounds.playSure();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ChevronEnd = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="relative flex-1 flex flex-col px-5 pt-14 pb-8">
      <MuteToggle />

      {/* Corner mascot */}
      <motion.div
        className="absolute top-3 start-4 z-20"
        animate={
          confettiActive && !reduce
            ? { y: [0, -10, 0, -6, 0] }
            : { y: 0 }
        }
        transition={reduce ? undefined : { duration: 0.7, ease: 'easeOut' }}
      >
        <StringMotif size="md" mood={mascotMood} trackPointer={false} />
      </motion.div>

      <ProgressDots step={step} tone="coral" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.05 } : { duration: 0.4, delay: 0.1 }}
        className="text-center mt-2 mb-3"
      >
        <h2 className={`text-[22px] md:text-[26px] font-black text-phone-ink tracking-tight ${arLeading(locale)}`}>
          {tp('aha.headline')}
        </h2>
        <p className={`mt-1.5 text-[13px] font-medium text-phone-stone ${arBodyLeading(locale)}`}>
          {tp('aha.subhead')}
        </p>
      </motion.div>

      {/* Notification banner — solid, with a 4px coral bottom shadow */}
      <div className="relative h-16 mb-3">
        <AnimatePresence>
          {showBanner && (
            <motion.div
              key="banner"
              initial={reduce ? { opacity: 0 } : { y: -80, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute inset-x-0 mx-auto max-w-[24rem] rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#CBD5E1] px-3.5 py-2.5 flex items-center gap-2.5"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-phone-coral-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" strokeWidth={2.6} />
              </div>
              <div className="min-w-0 flex-1 text-start">
                <div className="text-[11px] font-extrabold text-phone-ink truncate">
                  {tp('aha.banner.title')}
                </div>
                <div className={`text-[11px] font-medium text-phone-stone truncate ${arBodyLeading(locale)}`}>
                  {tp('aha.banner.body')}
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-phone-stone">9:41</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weekly summary mockup — SOLID white card, thick border, bottom shadow */}
      <div className="relative">
        <AnimatePresence>
          {showCard && (
            <motion.div
              key="card"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.05 } : { duration: 0.4, type: 'spring', stiffness: 240, damping: 24 }}
              className="relative rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_#CBD5E1] p-4 overflow-hidden"
            >
              <ConfettiBurst active={confettiActive} />

              {/* Card header */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0.05 } : { duration: 0.3, delay: 0.15 }}
                className="flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-phone-cream-100 flex items-center justify-center text-[16px] font-black text-phone-coral-600">
                    ★
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold text-phone-stone uppercase tracking-wider">
                      {locale === 'ar' ? 'هذا الأسبوع' : 'This week'}
                    </div>
                    <div className="text-[14px] font-extrabold text-phone-ink truncate">
                      {childText}
                    </div>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-phone-coral-500" strokeWidth={2.6} />
              </motion.div>

              {/* Mastery rings — 2x2 grid for breathing room */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-4">
                {WEEKLY_SUMMARY_MOCK.rings.map((r, i) => (
                  <MasteryRing
                    key={r.subjectEn}
                    index={i}
                    percent={r.percent}
                    label={locale === 'ar' ? r.subjectAr : r.subjectEn}
                    delay={0.25 + i * 0.14}
                    reduce={!!reduce}
                    onArrival={i === WEEKLY_SUMMARY_MOCK.rings.length - 1
                      ? () => setRingsArrived(WEEKLY_SUMMARY_MOCK.rings.length)
                      : undefined}
                  />
                ))}
              </div>

              {/* Callouts */}
              <AnimatePresence>
                {showCallouts && (
                  <motion.div
                    key="callouts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    {/* Topic to ask — coral tint */}
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 6 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                      transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 380, damping: 22 }}
                      className="flex items-center gap-2.5 rounded-xl bg-phone-cream-50 border-2 border-phone-coral-500/30 px-3 py-2.5"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-phone-coral-500 flex items-center justify-center">
                        <MessageCircleQuestion className="w-4 h-4 text-white" strokeWidth={2.6} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-extrabold uppercase tracking-wide text-phone-coral-600">
                          {tp('aha.topicLabel')}
                        </div>
                        <div className="text-[13px] font-extrabold text-phone-ink truncate">
                          {locale === 'ar' ? WEEKLY_SUMMARY_MOCK.topicToAsk.ar : WEEKLY_SUMMARY_MOCK.topicToAsk.en}
                        </div>
                      </div>
                      <ChevronEnd className="w-4 h-4 text-phone-coral-500 flex-shrink-0" strokeWidth={2.8} />
                    </motion.div>

                    {/* Win to celebrate — gold tint */}
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 6 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                      transition={reduce ? { duration: 0.05 } : { type: 'spring', stiffness: 380, damping: 22, delay: 0.12 }}
                      className="flex items-center gap-2.5 rounded-xl bg-amber-50 border-2 border-phone-gold-500/40 px-3 py-2.5"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-phone-gold-500 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-amber-900" strokeWidth={2.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-extrabold uppercase tracking-wide text-phone-gold-600">
                          {tp('aha.winLabel')}
                        </div>
                        <div className="text-[13px] font-extrabold text-phone-ink truncate">
                          {locale === 'ar' ? WEEKLY_SUMMARY_MOCK.winToCelebrate.ar : WEEKLY_SUMMARY_MOCK.winToCelebrate.en}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA + toast */}
      <div className="relative">
        <AnimatePresence>
          {showToast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="absolute -top-14 inset-x-0 mx-auto max-w-[20rem] rounded-2xl bg-phone-ink text-white text-center text-[12px] font-extrabold px-4 py-3 shadow-lg"
            >
              {tp('aha.toast')}
            </motion.div>
          )}
        </AnimatePresence>

        <PhoneButton
          tone="coral"
          variant="primary"
          size="lg"
          onClick={onCtaTap}
        >
          {tp('aha.cta')}
        </PhoneButton>
      </div>

      {/* Back + dev reset */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-phone-stone">
        <button
          type="button"
          onClick={() => { sounds.playClick(); back(); }}
          className="inline-flex items-center gap-1 hover:text-phone-ink transition-colors"
        >
          <BackIcon className="w-3.5 h-3.5" strokeWidth={3} />
          {tp('back')}
        </button>
        <button
          type="button"
          onClick={() => { sounds.playClick(); reset(); }}
          className="hover:text-phone-coral-500 transition-colors"
          title="Restart onboarding"
        >
          ↻
        </button>
      </div>

      {/* Hidden — keeps ringsArrived in scope */}
      <span className="sr-only">{ringsArrived}</span>
    </div>
  );
};

export default ParentAha;
