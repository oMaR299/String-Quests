import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, ExternalLink, ImagePlus, FormInput, Clock, ListTodo, ChevronDown,
} from 'lucide-react';
import { MockAppBackdrop } from './MockAppBackdrop';
import type {
  NotificationPriority,
  NotificationInteraction,
} from '../../../types/notification';
import { getMockFormById } from '../../../data/mockNotificationForms';
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

interface PopupPreviewProps {
  title: string;
  body: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  /** Tailwind gradient classes (e.g. "from-sky-400 to-blue-500") for the top stripe. */
  bannerGradient: string;
  isEmpty?: boolean;
  /** Render full-bleed (mobile/tablet); else render in a contained "viewport" with shadowed app behind. */
  fullBleed?: boolean;
  focusedField?: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
}

const SNOOZE_LABEL: Record<string, string> = {
  '1h': '1 ساعة',
  '3h': '3 ساعات',
  tomorrow: 'غدًا',
  '3d': '3 أيام',
  custom: 'تاريخ مخصص',
};

/**
 * Mirrors the real popup students see: a centered modal over a faded String app screen,
 * with a colored top stripe (uses bannerGradient), optional hero image, body, CTA + close.
 */
export const PopupPreview: React.FC<PopupPreviewProps> = ({
  title,
  body,
  imageUrl,
  ctaButton,
  priority,
  bannerGradient,
  isEmpty,
  fullBleed = false,
  focusedField = null,
  attachedFormId = null,
  interaction,
}) => {
  const attachedForm = getMockFormById(attachedFormId);
  const showSnooze = !!interaction?.allowSnooze && (interaction?.snoozeOptions.length ?? 0) > 0;
  const showAddTasks = !!interaction?.allowAddToTasks;
  const reduced = useReducedMotion();
  const gradientClass = bannerGradient || 'from-sky-400 to-blue-500';
  const isUrgent = priority === 'urgent';

  const titleFocused = focusedField === 'title';
  const bodyFocused = focusedField === 'body';
  const imageFocused = focusedField === 'imageUrl';
  const ctaFocused = focusedField === 'ctaButton';

  const titleLimit = RECOMMENDED_LENGTHS.popup.title;
  const bodyLimit = RECOMMENDED_LENGTHS.popup.body;
  const titleTone = getCountTone(title.length, titleLimit);
  const bodyTone = getCountTone(body.length, bodyLimit);

  // Popup tracks the chosen banner gradient — pulse follows.
  const pulse = getPulseColors('popup', bannerGradient);
  const pulseAnimate = buildFocusPulseAnimate(pulse.rgba);
  const pulseStaticStyle = buildFocusStaticRingStyle(pulse.rgba);

  // Container: a "viewport" that the popup overlays. In fullBleed (mobile), it fills the device.
  return (
    <div
      className={`relative ${
        fullBleed
          ? 'w-full h-[480px]'
          : 'w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[440px]'
      }`}
      dir="rtl"
    >
      {/* Faded app behind */}
      <div className="absolute inset-0">
        <MockAppBackdrop faded compact={fullBleed === false} />
      </div>

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[3px] flex items-center justify-center p-4">
        {/* Modal */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: 'spring', damping: 22, stiffness: 280 }
          }
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[280px] overflow-hidden"
        >
          {/* Top gradient stripe (uses banner gradient — admin sees their color land here) */}
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${
              isUrgent ? 'from-red-500 to-rose-500' : gradientClass
            }`}
          />

          {/* Close button */}
          <button
            type="button"
            className="absolute top-3 left-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Image — animated swap between empty placeholder and live image */}
          <AnimatePresence mode="popLayout" initial={false}>
            {imageUrl ? (
              <motion.div
                key="img-filled"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0 : 0.2 }}
                className="w-full overflow-hidden"
                {...(imageFocused
                  ? reduced
                    ? { style: pulseStaticStyle }
                    : {
                        animate: { opacity: 1, height: 'auto', ...pulseAnimate },
                        transition: FOCUS_PULSE_TRANSITION,
                      }
                  : {})}
              >
                <div className="w-full h-32 bg-gradient-to-br from-sky-100 to-blue-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </motion.div>
            ) : imageFocused ? (
              <motion.div
                key="img-empty"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  ...(reduced ? {} : pulseAnimate),
                }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={
                  reduced ? { duration: 0 } : FOCUS_PULSE_TRANSITION
                }
                style={reduced ? pulseStaticStyle : undefined}
                className="mx-3 mt-3 rounded-xl"
              >
                <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-purple-200 bg-purple-50/40 rounded-xl py-5">
                  <motion.div
                    animate={reduced ? undefined : { y: [0, -2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                  >
                    <ImagePlus className="w-4 h-4 text-purple-400" />
                  </motion.div>
                  <p className="text-[10px] font-bold text-slate-500">صورة (اختياري)</p>
                  <p className="text-[9px] font-medium text-slate-400">Image (optional)</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Sender identity */}
          <div className="flex items-center gap-2 px-5 pt-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0">
              S
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-700 truncate">String Quests</p>
              <p className="text-[9px] font-bold text-slate-400">إدارة المدرسة · الآن</p>
            </div>
            {isUrgent && (
              <span className="text-[9px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md mr-auto">
                عاجل
              </span>
            )}
          </div>

          {/* Content */}
          <div className="px-5 pt-3 pb-2">
            {/* Title slot */}
            <motion.div
              key={`popup-title-${getSwapKey(title)}`}
              initial={reduced ? false : { opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                ...(titleFocused && !reduced ? pulseAnimate : {}),
              }}
              transition={
                titleFocused && !reduced
                  ? FOCUS_PULSE_TRANSITION
                  : { duration: reduced ? 0 : 0.12, ease: 'easeOut' }
              }
              style={titleFocused && reduced ? pulseStaticStyle : undefined}
              className="relative inline-block max-w-full rounded-md mb-1.5"
            >
              <h3
                className={`text-[15px] font-black leading-tight ${
                  isEmpty ? 'text-slate-400 italic' : 'text-slate-800'
                }`}
              >
                {isEmpty ? (
                  <EmptyHint
                    ar="ابدأ كتابة عنوان الإشعار"
                    en="Start typing your title"
                    reduced={!!reduced}
                  />
                ) : (
                  <>
                    {title}
                    {titleFocused && <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />}
                  </>
                )}
              </h3>
              {!isEmpty && (
                <BadgeAnchor side="top">
                  <span
                    className={`text-[9px] font-bold rounded-full px-1.5 py-px backdrop-blur tabular-nums ${COUNT_BADGE_CLASS[titleTone]}`}
                  >
                    {title.length}/{titleLimit}
                  </span>
                </BadgeAnchor>
              )}
            </motion.div>

            {/* Body slot */}
            <motion.div
              key={`popup-body-${getSwapKey(body)}`}
              initial={reduced ? false : { opacity: 0, y: 3 }}
              animate={{
                opacity: 1,
                y: 0,
                ...(bodyFocused && !reduced ? pulseAnimate : {}),
              }}
              transition={
                bodyFocused && !reduced
                  ? FOCUS_PULSE_TRANSITION
                  : { duration: reduced ? 0 : 0.12, ease: 'easeOut' }
              }
              style={bodyFocused && reduced ? pulseStaticStyle : undefined}
              className="relative inline-block max-w-full rounded-md"
            >
              <p
                className={`text-xs font-medium leading-relaxed line-clamp-4 ${
                  !body ? 'text-slate-300 italic' : 'text-slate-500'
                }`}
              >
                {body ? (
                  <>
                    {body}
                    {bodyFocused && <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />}
                  </>
                ) : (
                  <EmptyHint
                    ar="اكتب التفاصيل هنا"
                    en="Write the details here"
                    reduced={!!reduced}
                  />
                )}
              </p>
              {!!body && (
                <BadgeAnchor side="bottom">
                  <span
                    className={`text-[9px] font-bold rounded-full px-1.5 py-px backdrop-blur tabular-nums ${COUNT_BADGE_CLASS[bodyTone]}`}
                  >
                    {body.length}/{bodyLimit}
                  </span>
                </BadgeAnchor>
              )}
            </motion.div>

            {/* Form metadata chip — surfaces the attached form so the recipient
                sees what they're committing to before clicking the CTA. */}
            <AnimatePresence>
              {attachedForm && (
                <motion.div
                  key="popup-form-chip"
                  initial={reduced ? false : { opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -2 }}
                  transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                  className="mt-2 inline-flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-md px-2 py-0.5 text-[9px] font-black text-violet-700"
                >
                  <FormInput className="w-2.5 h-2.5" />
                  <span>نموذج</span>
                  <span className="mx-0.5 text-violet-300">·</span>
                  <span className="tabular-nums">{attachedForm.fieldCount} سؤال</span>
                  <span className="mx-0.5 text-violet-300">·</span>
                  <span>~{attachedForm.estMinutes} د</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="px-5 pb-3 pt-3 space-y-2">
            <AnimatePresence initial={false}>
              {ctaButton?.label ? (
                <motion.button
                  key="cta-filled"
                  type="button"
                  initial={reduced ? false : { opacity: 0, scale: 0.95, height: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    height: 'auto',
                    ...(ctaFocused && !reduced ? pulseAnimate : {}),
                  }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, height: 0 }}
                  transition={
                    ctaFocused && !reduced
                      ? FOCUS_PULSE_TRANSITION
                      : { duration: reduced ? 0 : 0.18, ease: 'easeOut' }
                  }
                  style={ctaFocused && reduced ? pulseStaticStyle : undefined}
                  className={`w-full bg-gradient-to-r ${
                    isUrgent ? 'from-red-500 to-rose-500' : gradientClass
                  } text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md`}
                >
                  {attachedForm && <FormInput className="w-3 h-3" />}
                  {ctaButton.label}
                  <ExternalLink className="w-3 h-3" />
                </motion.button>
              ) : null}
            </AnimatePresence>
            <button
              type="button"
              className="w-full text-slate-400 hover:text-slate-600 text-xs font-bold py-2 rounded-xl transition-colors"
            >
              لاحقًا
            </button>
          </div>

          {/* Recipient-side action row — surfaces the snooze + add-to-tasks
              affordances the school enabled. Mock; not interactive. */}
          {(showSnooze || showAddTasks) && (
            <div className="px-5 pb-4 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                {showSnooze && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                    <Clock className="w-2.5 h-2.5" />
                    تذكيرني لاحقًا
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                  </span>
                )}
                {showAddTasks && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                    <ListTodo className="w-2.5 h-2.5" />
                    إضافة إلى مهامي
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 ms-auto">
                  إغلاق
                </span>
              </div>
              {/* Tiny menu hint for snooze options */}
              {showSnooze && interaction?.snoozeOptions && interaction.snoozeOptions.length > 0 && (
                <p className="text-[9px] font-medium text-slate-400 mt-1.5 leading-relaxed">
                  خيارات:{' '}
                  {interaction.snoozeOptions
                    .map((o) => SNOOZE_LABEL[o] ?? o)
                    .join(' · ')}
                </p>
              )}
            </div>
          )}
        </motion.div>
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
      <span aria-hidden className="text-purple-400/90 text-xs">←</span>
    ) : (
      <motion.span
        aria-hidden
        animate={{ x: [0, -6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-purple-400/90 text-xs"
      >
        ←
      </motion.span>
    )}
    <span className="font-bold">{ar}</span>
    <span className="mx-0.5 text-slate-300">·</span>
    <span className="text-[11px] font-medium not-italic">{en}</span>
  </span>
);

const CaretMirror: React.FC<{ reduced: boolean; colorClass?: string }> = ({
  reduced,
  colorClass = 'bg-purple-500',
}) => {
  if (reduced) {
    return (
      <span
        aria-hidden
        className={`ms-0.5 inline-block w-px h-[1em] ${colorClass} align-middle`}
      />
    );
  }
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      className={`ms-0.5 inline-block w-px h-[1em] ${colorClass} align-middle`}
    />
  );
};
