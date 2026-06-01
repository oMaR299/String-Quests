// MessageTeacherSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable BottomSheet that opens "over" any drawer (or anywhere in the app)
// and lets the parent fire a quick comment to a specific teacher / staff
// member via the existing Messages module. The same sheet is mounted from:
//
//   • AssignmentsDrawer expanded row     ("Re: {assignment title} — {grade}")
//   • ExamsDrawer expanded row           ("Re: {exam title} — {grade}")
//   • AttendanceDrawer absent-day panel  ("Re: غياب يوم {date} — {reason}")
//
// On submit we resolve (or create) a thread for the target contact and append
// a parent-authored text message that's prefixed with a quoted context line.
//
// Stacking: drawers render at z-[200] (their BottomSheet). To sit cleanly on
// top of them we render our own portal at z-[300]. Tab bar is already hidden
// while a drawer is open (see useParentAppContext.isDrawerOpen), so no extra
// tab-bar gymnastics needed here.
//
// Reduced motion: backdrop fades, sheet slides → fades, toast loses bounce.
//
// AR-first RTL via logical properties everywhere (`ps-*`/`pe-*`/`start-*`/`end-*`).

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { getContactById } from './data/parentAppContactsMock';
import { useMessageThreads } from './hooks/useMessageThreads';

export interface MessageTeacherSheetProps {
  /** Open / closed. Mounting is gated by AnimatePresence. */
  open: boolean;
  onClose: () => void;
  /** Target contact (resolved upstream via getTeacherForSubject / getHomeroomTeacher). */
  contactId: string;
  /** Optional child scoping — passed through to the thread (for per-child filtering). */
  childId?: string;
  /**
   * Optional quoted-context line. Renders inside a quoted card AND auto-
   * prefixes the outbound message body so the teacher gets the same context.
   * Example: "امتحان الرياضيات — 8/10".
   */
  contextLabel?: string;
  /** Optional pre-filled draft body. Defaults to ''. */
  defaultDraft?: string;
  /** Fires after the parent successfully sends. */
  onSent?: (threadId: string) => void;
}

const SHEET_Z = 'z-[300]';
const BACKDROP_Z = 'z-[299]';
const TOAST_Z = 'z-[310]';

export const MessageTeacherSheet: React.FC<MessageTeacherSheetProps> = ({
  open,
  onClose,
  contactId,
  childId,
  contextLabel,
  defaultDraft = '',
  onSent,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );
  const { ensureThreadForContact, sendText } = useMessageThreads();

  const contact = useMemo(() => getContactById(contactId), [contactId]);
  const contactName = useMemo(() => {
    if (!contact) return '';
    return locale === 'ar' ? contact.nameAr : contact.nameEn;
  }, [contact, locale]);

  const [draft, setDraft] = useState<string>(defaultDraft);
  const [sending, setSending] = useState(false);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset draft + autofocus textarea every time we open. (Without the reset
  // the second open would reuse the leftover draft of the first open.)
  useEffect(() => {
    if (!open) return;
    setDraft(defaultDraft);
    setSending(false);
    // Focus after the sheet's enter animation has settled so the keyboard
    // pops naturally on mobile.
    const id = window.setTimeout(() => textareaRef.current?.focus(), 220);
    return () => window.clearTimeout(id);
  }, [open, defaultDraft]);

  // Escape closes (matches BottomSheet primitive behavior).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const trimmedDraft = draft.trim();
  const canSend = trimmedDraft.length > 0 && !sending && !!contact;

  const composeBody = useCallback((): string => {
    const quote = contextLabel ? `❝ ${contextLabel} ❞\n\n` : '';
    return `${quote}${trimmedDraft}`;
  }, [contextLabel, trimmedDraft]);

  const handleSend = useCallback(() => {
    if (!canSend || !contact) return;
    setSending(true);
    // Tiny mocked latency so the user sees the loading state — feels real
    // without delaying them more than needed.
    window.setTimeout(() => {
      const threadId = ensureThreadForContact(contactId, childId);
      sendText(threadId, composeBody());
      setSending(false);
      const toastMsg = interpolate(t('parentApp.messageTeacher.sentToast'), {
        name: contactName,
      });
      setSentToast(toastMsg);
      onSent?.(threadId);
      // Close the sheet shortly after — gives the toast a moment to read.
      window.setTimeout(() => {
        onClose();
        // Clear toast a moment after the sheet has slid away.
        window.setTimeout(() => setSentToast(null), 350);
      }, 600);
    }, 250);
  }, [
    canSend,
    contact,
    contactId,
    childId,
    ensureThreadForContact,
    sendText,
    composeBody,
    t,
    contactName,
    onSent,
    onClose,
  ]);

  // "Open full conversation" — create the thread (if needed) and route. We
  // don't have router context here, so we hand off the threadId via the
  // onSent callback (callers can choose to navigate). For v1 just sends a
  // tap-event style callback; routing wiring lives at the call site.
  const handleOpenThread = useCallback(() => {
    if (!contact) return;
    const threadId = ensureThreadForContact(contactId, childId);
    onSent?.(threadId);
    onClose();
  }, [contact, ensureThreadForContact, contactId, childId, onSent, onClose]);

  const headerTitle = interpolate(t('parentApp.messageTeacher.headerTo'), {
    name: contactName,
  });

  return (
    <>
      {/* Toast (independent of sheet open state — stays visible briefly after
          the sheet closes). */}
      <AnimatePresence>
        {sentToast && (
          <motion.div
            key={sentToast}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.92 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }
            }
            transition={{ duration: reduceMotion ? 0.18 : 0.22 }}
            className={`fixed top-4 inset-x-0 flex justify-center pointer-events-none ${TOAST_Z} px-4`}
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              <span>{sentToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — sits ABOVE any underlying drawer (z-[200]) so a tap
                on it dismisses just this sheet, not the drawer underneath. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
              className={`fixed inset-0 ${BACKDROP_Z} bg-slate-900/60 backdrop-blur-sm`}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={headerTitle}
              dir={dir}
              initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 220, damping: 22 }
              }
              className={`fixed inset-x-0 bottom-0 ${SHEET_Z} mx-auto max-w-[430px] bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-lg font-cairo border-t border-slate-200`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag-handle pill */}
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div
                  className="w-12 h-1 rounded-full bg-slate-300"
                  aria-hidden="true"
                />
              </div>

              {/* Header */}
              <div className="relative px-4 pt-2 pb-3 shrink-0">
                <h2 className="text-center text-base font-black text-slate-800 px-8 truncate">
                  {headerTitle}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('parentApp.messageTeacher.closeAria')}
                  className="absolute end-3 top-1.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Body — quoted context (if any) + textarea. */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-3">
                {contextLabel && (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                      {t('parentApp.messageTeacher.contextLabel')}
                    </div>
                    <div className="text-xs font-bold text-slate-700 leading-relaxed">
                      ❝ {contextLabel} ❞
                    </div>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('parentApp.messageTeacher.placeholder')}
                  rows={4}
                  className="w-full rounded-2xl bg-white border border-slate-200 p-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold focus:border-duo-blue focus:outline-none focus:ring-4 focus:ring-duo-blue/15 transition-all resize-none"
                  aria-label={t('parentApp.messageTeacher.placeholder')}
                />
              </div>

              {/* Footer — Send + "Open full conversation" */}
              <div className="px-4 pt-2 pb-5 shrink-0 border-t border-slate-100 space-y-2 bg-white">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all active:scale-[0.98] ${
                    canSend
                      ? 'bg-duo-blue text-white hover:bg-duo-blue-dark'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 rtl:rotate-180" strokeWidth={2.5} />
                  {sending
                    ? t('parentApp.messageTeacher.sending')
                    : t('parentApp.messageTeacher.send')}
                </button>

                <button
                  type="button"
                  onClick={handleOpenThread}
                  className="w-full inline-flex items-center justify-center gap-1 text-xs font-extrabold text-slate-500 hover:text-slate-700 active:scale-[0.98] py-1.5"
                >
                  {t('parentApp.messageTeacher.openThread')}
                  <ArrowRight
                    className="w-3.5 h-3.5 rtl:rotate-180"
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageTeacherSheet;
