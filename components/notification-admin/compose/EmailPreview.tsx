import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Inbox, Star, Reply, Forward, MoreHorizontal, ChevronDown, Search,
  FormInput, ListTodo,
} from 'lucide-react';
import { EmailPreviewRenderer } from './EmailPreviewRenderer';
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

interface EmailPreviewProps {
  title: string;
  shortMessage: string;
  body: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  isEmpty?: boolean;
  focusedField?: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
}

/**
 * Realistic email client mockup — Gmail/Outlook-ish chrome around an inbox row
 * + opened email view. The email body is rendered via the existing
 * EmailPreviewRenderer (iframe with sandboxed HTML).
 */
export const EmailPreview: React.FC<EmailPreviewProps> = ({
  title,
  shortMessage,
  body,
  ctaButton,
  priority,
  isEmpty,
  focusedField = null,
  attachedFormId = null,
  interaction,
}) => {
  const attachedForm = getMockFormById(attachedFormId);
  const showAddTasks = !!interaction?.allowAddToTasks;
  const reduced = useReducedMotion();
  const isUrgent = priority === 'urgent';
  const subject = isEmpty
    ? ''
    : isUrgent
    ? `[عاجل] ${title}`
    : title;

  const titleFocused = focusedField === 'title';
  const shortFocused = focusedField === 'shortMessage';

  const titleLimit = RECOMMENDED_LENGTHS.email.title;
  const shortLimit = RECOMMENDED_LENGTHS.email.shortMessage;
  const titleTone = getCountTone(title.length, titleLimit);
  const shortTone = getCountTone(shortMessage.length, shortLimit);

  // Email pulse uses indigo — matches a generic mail-client accent
  // without fighting the sky-tinted inbox row.
  const pulse = getPulseColors('email');
  const pulseAnimate = buildFocusPulseAnimate(pulse.rgba);
  const pulseStaticStyle = buildFocusStaticRingStyle(pulse.rgba);

  return (
    <div className="w-full">
      {/* Mail client chrome */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top bar (mail client) */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-400 to-amber-400 flex items-center justify-center text-white text-[10px] font-black">
              M
            </div>
            <span className="text-xs font-black text-slate-700">Mail</span>
          </div>
          <div className="flex-1 mx-2 hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200">
            <Search className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">بحث في البريد</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400">متصل</span>
          </div>
        </div>

        {/* Inbox row (the email arriving) */}
        <div
          className={`flex items-start gap-3 px-4 py-3 border-b-2 cursor-pointer transition-colors ${
            isUrgent
              ? 'bg-red-50/40 border-b-red-200 hover:bg-red-50/60'
              : 'bg-sky-50/40 border-b-sky-200 hover:bg-sky-50/60'
          }`}
          dir="rtl"
        >
          {/* Unread indicator */}
          <div
            className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
              isUrgent ? 'bg-red-500' : 'bg-sky-500'
            }`}
          />

          {/* Sender avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
            S
          </div>

          {/* Subject + preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black text-slate-800 truncate">String Quests</p>
              <span className="text-[10px] font-bold text-slate-400 shrink-0">٩:٤١ ص</span>
            </div>
            {/* Subject line — pulses on title focus */}
            <motion.div
              key={`email-title-${getSwapKey(title)}`}
              initial={reduced ? false : { opacity: 0, y: 3 }}
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
              className="relative inline-block max-w-full mt-0.5 rounded-md"
            >
              <p
                className={`text-sm font-black truncate ${
                  isEmpty ? 'text-slate-400 italic' : 'text-slate-800'
                }`}
              >
                {subject ? (
                  <>
                    {subject}
                    {titleFocused && <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />}
                  </>
                ) : (
                  <EmptyHint
                    ar="ابدأ كتابة عنوان الإشعار"
                    en="Start typing your title"
                    reduced={!!reduced}
                  />
                )}
              </p>
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

            {/* Snippet — short message preview, pulses on shortMessage focus */}
            <motion.div
              key={`email-short-${getSwapKey(shortMessage || body.slice(0, 80))}`}
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
              className="relative inline-block max-w-full mt-0.5 rounded-md"
            >
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {shortMessage ? (
                  <>
                    {shortMessage}
                    {shortFocused && <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />}
                  </>
                ) : body ? (
                  body.slice(0, 80)
                ) : (
                  <EmptyHint
                    ar="وصف موجز"
                    en="Short message"
                    reduced={!!reduced}
                  />
                )}
              </p>
              {!!shortMessage && (
                <BadgeAnchor side="bottom">
                  <span
                    className={`text-[9px] font-bold rounded-full px-1.5 py-px backdrop-blur tabular-nums ${COUNT_BADGE_CLASS[shortTone]}`}
                  >
                    {shortMessage.length}/{shortLimit}
                  </span>
                </BadgeAnchor>
              )}
            </motion.div>
          </div>

          <Star className="w-4 h-4 text-slate-300 shrink-0" />
        </div>

        {/* Opened email — full thread view */}
        <div className="px-4 pt-4 pb-2 border-b border-slate-100" dir="rtl">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm">
                S
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-slate-800 truncate">String Quests</p>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 truncate">
                  noreply@stringquests.app · إلى: أنت
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-400">٩:٤١ ص</span>
              <button className="p-1 rounded hover:bg-slate-100">
                <Star className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button className="p-1 rounded hover:bg-slate-100">
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Inbox label chips */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Inbox className="w-2.5 h-2.5" />
              صندوق الوارد
            </span>
            <span className="text-[9px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              مدرسة
            </span>
            {isUrgent && (
              <span className="text-[9px] font-black text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                مهم
              </span>
            )}
            {attachedForm && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">
                <FormInput className="w-2.5 h-2.5" />
                <span>نموذج</span>
                <span className="mx-0.5 text-violet-300">·</span>
                <span className="tabular-nums">{attachedForm.fieldCount} سؤال</span>
                <span className="mx-0.5 text-violet-300">·</span>
                <span>~{attachedForm.estMinutes} د</span>
              </span>
            )}
          </div>
        </div>

        {/* Rendered HTML body via iframe */}
        <div className="bg-slate-50">
          <EmailPreviewRenderer
            title={subject || 'سيظهر عنوان الإشعار هنا'}
            body={body || 'محتوى الرسالة سيظهر هنا...'}
            ctaButton={ctaButton || undefined}
          />
          {/* Add-to-tasks affordance — surfaces beneath the CTA region */}
          {showAddTasks && (
            <div className="px-4 py-2 border-t border-slate-200 bg-white" dir="rtl">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <ListTodo className="w-3 h-3" />
                <span>إضافة إلى مهامي</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="font-medium not-italic text-slate-400">
                  Add to my tasks
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 bg-white" dir="rtl">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50">
            <Reply className="w-3 h-3" />
            رد
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50">
            <Forward className="w-3 h-3" />
            إعادة توجيه
          </button>
        </div>
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
