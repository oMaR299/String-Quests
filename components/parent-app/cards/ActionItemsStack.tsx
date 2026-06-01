// ActionItemsStack.tsx
// ─────────────────────────────────────────────────────────────────────────────
// v1.1 Home — "Needs your action" pile. Each item is a small warm-slate card
// (visually distinct from celebration's yellow tint) with an inline action:
//
//   sign-permission → chunky duo-blue "Sign" button → modal confirm → resolve
//   ack-note        → "Read" expands the note inline → auto-resolves on tap
//   reply-message   → quick-reply chip row + Custom modal → resolve
//   rsvp-event      → "Yes / No" pill row → resolve
//
// Resolving an item animates the card out (Framer AnimatePresence exit) and a
// floating toast confirms ("Signed", "Read", etc.) — toast disappears after
// 1.6s. Resolution state lives in component state for v1.1 (resets on reload).
//
// Reduced motion: instant disappear instead of exit animation, toast fade
// shortened (300ms instead of 1600ms).
//
// The stack mounts only when there's at least one unresolved item.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FileSignature,
  MessageCircle,
  X,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import {
  useParentAppContext,
} from '../useParentAppContext';
import type { ActionItem, ActionItemKind } from '../parentAppMockData';
import { PrimaryButton } from '../../parent-onboarding/PrimaryButton';

// ─── Static, JIT-safe per-kind visual map ────────────────────────────────────
// Tailwind v4 demands literal class strings, so each kind owns its full bundle.

interface KindStyle {
  iconBg: string;
  iconText: string;
  ring: string;
}

const KIND_STYLES: Record<ActionItemKind, KindStyle> = {
  'sign-permission': {
    iconBg: 'bg-duo-blue-light',
    iconText: 'text-duo-blue',
    ring: 'ring-duo-blue/20',
  },
  'ack-note': {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    ring: 'ring-amber-400/20',
  },
  'reply-message': {
    iconBg: 'bg-duo-purple-light',
    iconText: 'text-duo-purple',
    ring: 'ring-duo-purple/20',
  },
  'rsvp-event': {
    iconBg: 'bg-duo-green-light',
    iconText: 'text-[#4CAD00]',
    ring: 'ring-duo-green/20',
  },
};

const KIND_ICONS: Record<ActionItemKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'sign-permission': FileSignature,
  'ack-note': Bell,
  'reply-message': MessageCircle,
  'rsvp-event': CalendarCheck,
};

// ─── Toast (floating confirm after resolution) ───────────────────────────────

interface ToastState {
  id: number;
  message: string;
}

interface ToastProps {
  toast: ToastState | null;
  reduceMotion: boolean;
}

const FloatingToast: React.FC<ToastProps> = ({ toast, reduceMotion }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }}
          transition={{ duration: reduceMotion ? 0.18 : 0.22 }}
          className="fixed bottom-24 inset-x-0 flex justify-center pointer-events-none z-50"
          aria-live="polite"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
            <span>{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Sign-permission modal (digital signature pattern) ───────────────────────

interface SignModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  reduceMotion: boolean;
}

const SignModal: React.FC<SignModalProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
  body,
  cancelLabel,
  confirmLabel,
  reduceMotion,
}) => {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="sign-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          key="sign-card"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-md p-5 space-y-4"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full inline-flex items-center justify-center shrink-0 bg-duo-blue-light text-duo-blue">
              <FileSignature className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label={cancelLabel}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">{body}</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <div className="flex-1">
              <PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Custom-reply modal ──────────────────────────────────────────────────────

interface ReplyModalProps {
  open: boolean;
  onCancel: () => void;
  onSend: (message: string) => void;
  title: string;
  placeholder: string;
  cancelLabel: string;
  sendLabel: string;
  reduceMotion: boolean;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  open,
  onCancel,
  onSend,
  title,
  placeholder,
  cancelLabel,
  sendLabel,
  reduceMotion,
}) => {
  const [draft, setDraft] = useState('');
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="reply-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          key="reply-card"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-md p-5 space-y-3"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 bg-duo-purple-light text-duo-purple">
              <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h3 className="flex-1 text-base font-extrabold text-slate-800 leading-tight">{title}</h3>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label={cancelLabel}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-duo-purple focus:ring-2 focus:ring-duo-purple/20 transition-colors resize-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={draft.trim().length === 0}
              onClick={() => onSend(draft.trim())}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-duo-purple text-white hover:bg-[#B970FF] active:bg-[#B970FF] motion-safe:active:scale-[0.98] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {sendLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Sub-components per kind ─────────────────────────────────────────────────

interface CardShellProps {
  item: ActionItem;
  locale: 'ar' | 'en';
  t: (key: string) => string;
  children: React.ReactNode;
}

const CardShell: React.FC<CardShellProps> = ({ item, locale, t, children }) => {
  const style = KIND_STYLES[item.kind];
  const Icon = KIND_ICONS[item.kind];
  const title = locale === 'ar' ? item.titleAr : item.titleEn;

  // Section-row labels per kind (small uppercase eyebrow above the title).
  let sectionLabel: string;
  switch (item.kind) {
    case 'sign-permission':
      sectionLabel = t('parentApp.actions.signPermissionTitle');
      break;
    case 'ack-note':
      sectionLabel = t('parentApp.actions.ackNoteTitle');
      break;
    case 'reply-message':
      sectionLabel = t('parentApp.actions.replyTitle');
      break;
    case 'rsvp-event':
      sectionLabel = t('parentApp.actions.rsvpTitle');
      break;
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconText}`}
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none mb-1">
            {sectionLabel}
          </div>
          <p className="text-sm font-extrabold text-slate-800 leading-snug">{title}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

interface ItemActionProps {
  item: ActionItem;
  locale: 'ar' | 'en';
  t: (key: string) => string;
  onResolve: (toastMessage: string) => void;
  onOpenSignModal: () => void;
  onOpenReplyModal: () => void;
}

const SignAction: React.FC<ItemActionProps> = ({ t, onOpenSignModal }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <PrimaryButton onClick={onOpenSignModal}>
          {t('parentApp.actions.signPermissionCta')}
        </PrimaryButton>
      </div>
    </div>
  );
};

const AckNoteAction: React.FC<ItemActionProps> = ({ item, locale, t, onResolve }) => {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const note = locale === 'ar' ? item.noteAr : item.noteEn;
  const from = locale === 'ar' ? item.fromAr : item.fromEn;
  const resolvedRef = useRef(false);

  const handleOpen = useCallback(() => {
    setExpanded(true);
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    // Auto-mark read after the expand transition feels intentional, not abrupt.
    window.setTimeout(
      () => onResolve(t('parentApp.actions.ackNoteResolvedToast')),
      reduceMotion ? 0 : 700
    );
  }, [onResolve, reduceMotion, t]);

  return (
    <div className="space-y-2">
      {!expanded ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-extrabold hover:bg-amber-200 active:scale-[0.98] transition-all"
          >
            <span>{t('parentApp.actions.ackNoteCta')}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" strokeWidth={3} />
          </button>
        </div>
      ) : (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="rounded-xl bg-amber-50 border border-amber-200/70 p-3 space-y-1.5">
            {from && (
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700/80">
                {from}
              </div>
            )}
            <p className="text-xs font-semibold text-amber-900 leading-relaxed">{note}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ReplyAction: React.FC<ItemActionProps> = ({ t, onResolve, onOpenReplyModal }) => {
  const chips = useMemo(
    () => [
      { id: 'thanks', label: t('parentApp.actions.replyChipThanks') },
      { id: 'done', label: t('parentApp.actions.replyChipDone') },
      { id: 'time', label: t('parentApp.actions.replyChipNeedTime') },
    ],
    [t]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onResolve(t('parentApp.actions.replyResolvedToast'))}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-duo-purple-light text-duo-purple text-xs font-extrabold hover:bg-[#E4D2FA] active:scale-[0.97] transition-all"
        >
          {chip.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onOpenReplyModal}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-duo-purple border-2 border-duo-purple/30 text-xs font-extrabold hover:bg-duo-purple-light active:scale-[0.97] transition-all"
      >
        {t('parentApp.actions.replyChipCustom')}
      </button>
    </div>
  );
};

const RsvpAction: React.FC<ItemActionProps> = ({ t, onResolve }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onResolve(t('parentApp.actions.rsvpResolvedToast'))}
        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-duo-green text-white text-sm font-bold hover:bg-duo-green-dark active:bg-duo-green-dark motion-safe:active:scale-[0.98] transition-colors"
      >
        {t('parentApp.actions.rsvpYes')}
      </button>
      <button
        type="button"
        onClick={() => onResolve(t('parentApp.actions.rsvpResolvedToast'))}
        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 text-sm font-bold hover:bg-slate-50 motion-safe:active:scale-[0.98] transition-colors"
      >
        {t('parentApp.actions.rsvpNo')}
      </button>
    </div>
  );
};

// ─── Main stack ──────────────────────────────────────────────────────────────

// Static order so 'sign-permission' always rises to the top.
const KIND_PRIORITY: Record<ActionItemKind, number> = {
  'sign-permission': 0,
  'ack-note': 1,
  'rsvp-event': 2,
  'reply-message': 3,
};

export const ActionItemsStack: React.FC = () => {
  const { locale } = useI18n();
  const { state } = useParentAppContext();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const [resolvedIds, setResolvedIds] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [signModalForId, setSignModalForId] = useState<string | null>(null);
  const [replyModalForId, setReplyModalForId] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const items = useMemo(() => {
    return [...state.actionItems]
      .filter((item) => !resolvedIds.has(item.id))
      .sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind]);
  }, [state.actionItems, resolvedIds]);

  const showToast = useCallback(
    (message: string) => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      const id = Date.now();
      setToast({ id, message });
      toastTimerRef.current = window.setTimeout(
        () => setToast(null),
        reduceMotion ? 700 : 1600
      );
    },
    [reduceMotion]
  );

  const resolveItem = useCallback(
    (id: string, toastMessage: string) => {
      setResolvedIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      showToast(toastMessage);
    },
    [showToast]
  );

  const handleSignConfirm = useCallback(() => {
    if (!signModalForId) return;
    const id = signModalForId;
    setSignModalForId(null);
    resolveItem(id, t('parentApp.actions.signPermissionResolvedToast'));
  }, [signModalForId, resolveItem, t]);

  const handleReplySend = useCallback(() => {
    if (!replyModalForId) return;
    const id = replyModalForId;
    setReplyModalForId(null);
    resolveItem(id, t('parentApp.actions.replyResolvedToast'));
  }, [replyModalForId, resolveItem, t]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-2.5" aria-label={t('parentApp.actions.sectionHeader')}>
      <div className="flex items-center gap-2 px-1">
        <Bell className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.75} />
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          {t('parentApp.actions.sectionHeader')}
        </h3>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => {
          const onResolve = (toastMessage: string) => resolveItem(item.id, toastMessage);
          return (
            <motion.div
              key={item.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      opacity: 0,
                      x: locale === 'ar' ? -24 : 24,
                      scale: 0.96,
                      transition: { duration: 0.24, ease: 'easeOut' },
                    }
              }
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <CardShell item={item} locale={locale} t={t}>
                {item.kind === 'sign-permission' && (
                  <SignAction
                    item={item}
                    locale={locale}
                    t={t}
                    onResolve={onResolve}
                    onOpenSignModal={() => setSignModalForId(item.id)}
                    onOpenReplyModal={() => undefined}
                  />
                )}
                {item.kind === 'ack-note' && (
                  <AckNoteAction
                    item={item}
                    locale={locale}
                    t={t}
                    onResolve={onResolve}
                    onOpenSignModal={() => undefined}
                    onOpenReplyModal={() => undefined}
                  />
                )}
                {item.kind === 'reply-message' && (
                  <ReplyAction
                    item={item}
                    locale={locale}
                    t={t}
                    onResolve={onResolve}
                    onOpenSignModal={() => undefined}
                    onOpenReplyModal={() => setReplyModalForId(item.id)}
                  />
                )}
                {item.kind === 'rsvp-event' && (
                  <RsvpAction
                    item={item}
                    locale={locale}
                    t={t}
                    onResolve={onResolve}
                    onOpenSignModal={() => undefined}
                    onOpenReplyModal={() => undefined}
                  />
                )}
              </CardShell>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <SignModal
        open={signModalForId !== null}
        onCancel={() => setSignModalForId(null)}
        onConfirm={handleSignConfirm}
        title={t('parentApp.actions.signModalTitle')}
        body={t('parentApp.actions.signModalBody')}
        cancelLabel={t('parentApp.actions.signModalCancel')}
        confirmLabel={t('parentApp.actions.signModalConfirm')}
        reduceMotion={!!reduceMotion}
      />

      <ReplyModal
        open={replyModalForId !== null}
        onCancel={() => setReplyModalForId(null)}
        onSend={handleReplySend}
        title={t('parentApp.actions.replyModalTitle')}
        placeholder={t('parentApp.actions.replyModalPlaceholder')}
        cancelLabel={t('parentApp.actions.replyModalCancel')}
        sendLabel={t('parentApp.actions.replyModalSend')}
        reduceMotion={!!reduceMotion}
      />

      <FloatingToast toast={toast} reduceMotion={!!reduceMotion} />
    </section>
  );
};

export default ActionItemsStack;
