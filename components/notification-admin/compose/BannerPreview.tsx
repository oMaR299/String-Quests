import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Clock, FormInput } from 'lucide-react';
import { MockAppBackdrop } from './MockAppBackdrop';
import type {
  NotificationPriority,
  NotificationInteraction,
} from '../../../types/notification';
import {
  FOCUS_PULSE_TRANSITION,
  RECOMMENDED_LENGTHS,
  COUNT_BADGE_CLASS,
  getCountTone,
  getSwapKey,
  getPulseColors,
  buildFocusPulseAnimate,
  buildFocusStaticRingStyle,
  type FocusField,
} from './previewFocus';
import { BadgeAnchor } from './BadgeAnchor';

interface BannerPreviewProps {
  shortMessage: string;
  gradient: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  isEmpty?: boolean;
  fullBleed?: boolean;
  focusedField?: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
}

/**
 * Mirrors the real sticky banner students see: a colored band pinned to the top of
 * the app screen, with the rest of the app visible (and not faded — the banner is
 * non-blocking, unlike the popup).
 */
export const BannerPreview: React.FC<BannerPreviewProps> = ({
  shortMessage,
  gradient,
  ctaButton,
  priority,
  isEmpty,
  fullBleed = false,
  focusedField = null,
  attachedFormId = null,
  interaction,
}) => {
  const hasForm = !!attachedFormId;
  const showSnooze = !!interaction?.allowSnooze;
  const reduced = useReducedMotion();
  const gradientClass =
    priority === 'urgent'
      ? 'from-red-500 via-rose-500 to-red-600'
      : gradient || 'from-sky-500 to-blue-600';

  const shortFocused = focusedField === 'shortMessage';
  const ctaFocused = focusedField === 'ctaButton';

  const shortLimit = RECOMMENDED_LENGTHS.banner.shortMessage;
  const shortTone = getCountTone(shortMessage.length, shortLimit);

  // Banner pulse derives from the gradient choice — admin sees the focal
  // colour follow their banner pick. (Urgent banners stay red.)
  const pulseGradient =
    priority === 'urgent' ? 'from-red-500 to-red-600' : gradient;
  const pulse = getPulseColors('banner', pulseGradient);
  const pulseAnimate = buildFocusPulseAnimate(pulse.rgba);
  const pulseStaticStyle = buildFocusStaticRingStyle(pulse.rgba);

  return (
    <div
      className={`relative ${
        fullBleed
          ? 'w-full h-[480px]'
          : 'w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[440px]'
      }`}
      dir="rtl"
    >
      {/* Banner pinned at top */}
      <motion.div
        initial={reduced ? false : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', damping: 22, stiffness: 280 }
        }
        className={`relative bg-gradient-to-r ${gradientClass} px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm z-10`}
      >
        {/* Subtle shimmer accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 flex-1 min-w-0 relative">
          {priority === 'urgent' && (
            <span className="text-[9px] font-black text-white bg-white/25 px-1.5 py-0.5 rounded-md shrink-0">
              عاجل
            </span>
          )}
          <motion.div
            key={`banner-short-${getSwapKey(shortMessage)}`}
            initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={{
              opacity: 1,
              y: 0,
              ...(shortFocused && !reduced ? pulseAnimate : {}),
            }}
            transition={
              shortFocused && !reduced
                ? FOCUS_PULSE_TRANSITION
                : { duration: reduced ? 0 : 0.12, ease: 'easeOut' }
            }
            style={shortFocused && reduced ? pulseStaticStyle : undefined}
            className="relative inline-block flex-1 min-w-0 rounded-md"
          >
            <p
              className={`text-xs font-black flex-1 truncate ${
                isEmpty ? 'text-white/70 italic' : 'text-white'
              }`}
            >
              {!shortMessage ? (
                <EmptyHint
                  ar="ستظهر رسالة الشريط هنا"
                  en="Banner message will appear here"
                  reduced={!!reduced}
                />
              ) : (
                <>
                  {shortMessage}
                  {shortFocused && <CaretMirror reduced={!!reduced} />}
                </>
              )}
            </p>
            {!!shortMessage && (
              <BadgeAnchor side="top">
                <span
                  className={`text-[9px] font-bold rounded-full px-1.5 py-px backdrop-blur tabular-nums ${COUNT_BADGE_CLASS[shortTone]}`}
                >
                  {shortMessage.length}/{shortLimit}
                </span>
              </BadgeAnchor>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">
          <AnimatePresence initial={false}>
            {ctaButton?.label ? (
              <motion.button
                key="banner-cta"
                type="button"
                initial={reduced ? false : { opacity: 0, scale: 0.85, width: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  width: 'auto',
                  ...(ctaFocused && !reduced ? pulseAnimate : {}),
                }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, width: 0 }}
                transition={
                  ctaFocused && !reduced
                    ? FOCUS_PULSE_TRANSITION
                    : { duration: reduced ? 0 : 0.18, ease: 'easeOut' }
                }
                style={ctaFocused && reduced ? pulseStaticStyle : undefined}
                className="bg-white/25 hover:bg-white/35 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-lg transition-colors whitespace-nowrap overflow-hidden inline-flex items-center gap-1"
              >
                {hasForm && <FormInput className="w-2.5 h-2.5" />}
                <span>{ctaButton.label}</span>
              </motion.button>
            ) : null}
          </AnimatePresence>
          {showSnooze && (
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              title="تأجيل · Snooze"
            >
              <Clock className="w-3.5 h-3.5 text-white/90" />
            </button>
          )}
          <button
            type="button"
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/90" />
          </button>
        </div>
      </motion.div>

      {/* Real-looking app screen below the banner */}
      <div className="absolute top-[44px] left-0 right-0 bottom-0">
        <MockAppBackdrop showTopBar={true} bellBadge={3} />
      </div>
    </div>
  );
};

const EmptyHint: React.FC<{ ar: string; en: string; reduced: boolean }> = ({
  ar,
  en,
  reduced,
}) => (
  <span className="inline-flex items-center gap-1.5 align-middle">
    {reduced ? (
      <span aria-hidden className="text-white/80 text-xs">←</span>
    ) : (
      <motion.span
        aria-hidden
        animate={{ x: [0, -6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-white/80 text-xs"
      >
        ←
      </motion.span>
    )}
    <span className="font-black">{ar}</span>
    <span className="mx-0.5 text-white/50">·</span>
    <span className="text-[10px] font-medium not-italic">{en}</span>
  </span>
);

const CaretMirror: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  // Banner caret stays white — the banner is on a coloured background and
  // a coloured caret would be invisible. The pulse around the text already
  // carries the colour identity.
  if (reduced) {
    return (
      <span
        aria-hidden
        className="ms-0.5 inline-block w-px h-[1em] bg-white align-middle"
      />
    );
  }
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      className="ms-0.5 inline-block w-px h-[1em] bg-white align-middle"
    />
  );
};
