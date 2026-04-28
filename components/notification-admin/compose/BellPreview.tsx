import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, ChevronLeft, Check, FormInput, ListTodo } from 'lucide-react';
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

interface BellPreviewProps {
  title: string;
  shortMessage: string;
  priority: NotificationPriority;
  /** Empty state placeholder shown when title is empty. */
  isEmpty?: boolean;
  focusedField?: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
}

const SAMPLE_NOTIFICATIONS = [
  {
    id: 'sample-1',
    title: 'تذكير: تسليم مشروع العلوم',
    message: 'آخر موعد لتسليم مشروع العلوم هو يوم الأحد القادم',
    timestamp: 'منذ ٣ ساعات',
    unread: true,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    id: 'sample-2',
    title: 'تحديث نظام String',
    message: 'تم إطلاق ميزات جديدة في خريطة المهارات',
    timestamp: 'منذ يوم',
    unread: false,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
  },
];

/**
 * Realistic bell-dropdown preview that mirrors the real student-side dropdown.
 * Renders the new (just-composed) notification at the top with an "الآن" timestamp,
 * followed by plausible existing items so the admin sees the full context.
 */
export const BellPreview: React.FC<BellPreviewProps> = ({
  title,
  shortMessage,
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
  const newCount = 1 + SAMPLE_NOTIFICATIONS.filter((n) => n.unread).length;

  const titleFocused = focusedField === 'title';
  const shortFocused = focusedField === 'shortMessage';

  const titleLimit = RECOMMENDED_LENGTHS.bell.title;
  const shortLimit = RECOMMENDED_LENGTHS.bell.shortMessage;
  const titleTone = getCountTone(title.length, titleLimit);
  const shortTone = getCountTone(shortMessage.length, shortLimit);

  // Bell uses sky for its focal pulse — matches the topbar bell badge.
  const pulse = getPulseColors('bell');
  const pulseAnimate = buildFocusPulseAnimate(pulse.rgba);
  const pulseStaticStyle = buildFocusStaticRingStyle(pulse.rgba);

  return (
    <div className="w-full max-w-sm mx-auto" dir="rtl">
      {/* Mock TopBar — anchors the dropdown to the bell */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
            S
          </div>
          <span className="text-sm font-black text-slate-800">String</span>
        </div>

        <div className="relative">
          <button className="relative p-2 rounded-xl bg-sky-50">
            <Bell className="w-5 h-5 text-sky-600" />
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-black shadow-sm">
              {newCount}
            </span>
          </button>
          {/* Connector arrow to the dropdown */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-t border-r border-slate-200 z-10" />
        </div>
      </div>

      {/* Dropdown */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        className="bg-white rounded-b-2xl border border-slate-200 shadow-xl overflow-hidden origin-top relative"
      >
        {/* Dropdown header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-800">الإشعارات</h4>
          <button className="text-[10px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>تعليم الكل كمقروء</span>
          </button>
        </div>

        {/* Notification items */}
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {/* The new (just-composed) notification — highlighted */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors relative ${
              isUrgent
                ? 'bg-red-50/60 hover:bg-red-50'
                : 'bg-sky-50/60 hover:bg-sky-50'
            }`}
          >
            {/* Left accent strip */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-1 ${
                isUrgent ? 'bg-red-500' : 'bg-sky-500'
              }`}
            />

            {/* Icon avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isUrgent ? 'bg-red-100' : 'bg-sky-100'
              }`}
            >
              <Bell
                className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-sky-500'}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap relative">
                {/* Title with pulse + caret-mirror + count badge */}
                <motion.div
                  key={`bell-title-${getSwapKey(title)}`}
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
                  className="relative inline-block max-w-full rounded-md"
                >
                  <p
                    className={`text-sm leading-tight font-black truncate ${
                      isEmpty ? 'text-slate-400 italic font-bold' : 'text-slate-800'
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
                        {titleFocused && (
                          <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />
                        )}
                      </>
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
                {isUrgent && (
                  <span className="text-[9px] font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                    عاجل
                  </span>
                )}
              </div>

              {/* Short message line */}
              <motion.div
                key={`bell-short-${getSwapKey(shortMessage)}`}
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
                className="relative inline-block max-w-full rounded-md mt-0.5"
              >
                <p
                  className={`text-xs font-medium line-clamp-2 ${
                    !shortMessage ? 'text-slate-300 italic' : 'text-slate-500'
                  }`}
                >
                  {shortMessage ? (
                    <>
                      {shortMessage}
                      {shortFocused && <CaretMirror reduced={!!reduced} colorClass={pulse.caretClass} />}
                    </>
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

              {/* Form chip + add-to-tasks affordance */}
              {(attachedForm || showAddTasks) && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {attachedForm && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-md">
                      <FormInput className="w-2.5 h-2.5" />
                      <span>نموذج</span>
                      <span className="mx-0.5 text-violet-300">·</span>
                      <span className="tabular-nums">{attachedForm.fieldCount} سؤال</span>
                    </span>
                  )}
                  {showAddTasks && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                      <ListTodo className="w-2.5 h-2.5" />
                      <span>إضافة لمهامي</span>
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold text-slate-400">الآن</span>
                <span className="text-[10px] font-bold text-sky-500">· جديد</span>
              </div>
            </div>

            {/* Unread dot */}
            <div
              className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                isUrgent ? 'bg-red-500' : 'bg-sky-500'
              }`}
            />
          </motion.div>

          {/* Existing samples */}
          {SAMPLE_NOTIFICATIONS.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : 0.05 + index * 0.05 }}
              className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                notif.unread ? 'hover:bg-slate-50' : 'hover:bg-slate-50 opacity-80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}
              >
                <Bell className={`w-4 h-4 ${notif.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-tight truncate ${
                    notif.unread ? 'font-black text-slate-800' : 'font-bold text-slate-600'
                  }`}
                >
                  {notif.title}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">
                  {notif.message}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{notif.timestamp}</p>
              </div>

              {notif.unread && (
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer link */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
          <button className="w-full flex items-center justify-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors">
            <span>عرض كل الإشعارات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Empty-state hint with a softly bobbing arrow that nudges the eye toward
 * the start of the line. Bilingual (AR + EN). Honors prefers-reduced-motion.
 *
 * The bell preview is locked to `dir="rtl"` at its root (AR-first product),
 * so the start of every line is on the RIGHT. The arrow `←` bobs LEFT to
 * say "type from this side" — pointing the eye toward the start of the
 * line in RTL. Don't change this even though it looks "backwards" in LTR
 * mental models.
 */
const EmptyHint: React.FC<{ ar: string; en: string; reduced: boolean }> = ({
  ar,
  en,
  reduced,
}) => (
  <span className="inline-flex items-center gap-1.5 align-middle">
    {reduced ? (
      <span aria-hidden className="text-purple-400/90 text-xs">
        ←
      </span>
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
