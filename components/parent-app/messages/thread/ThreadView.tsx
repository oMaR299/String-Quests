// ThreadView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen chat surface within the phone shell. Sets `isDrawerOpen=true`
// on mount so ParentHomeLayout hides the bottom tab bar (mirroring the
// drawer pattern). Header is sticky at top; ComposeBar sticky at bottom;
// message list is the scrolling middle.
//
// On mount we also mark the thread as read (zeroing its unread counter +
// flipping any unread inbound messages to state='read').

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../../contexts/I18nContext';
import { useParentAppContext } from '../../useParentAppContext';
import { useMessageThreads } from '../hooks/useMessageThreads';
import { useContacts } from '../hooks/useContacts';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { ThreadHeader } from './ThreadHeader';
import { MessageBubble } from './MessageBubble';
import { ComposeBar } from './ComposeBar';
import type { MockMessage } from '../data/parentAppThreadsMock';

interface Props {
  threadId: string;
  onClose: () => void;
}

function daySeparatorLabel(
  iso: string,
  locale: 'ar' | 'en',
  t: (k: string) => string
): string {
  const d = new Date(iso);
  const now = new Date();
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return t('parentApp.messages.thread.daySeparator.today');
  }
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  ) {
    return t('parentApp.messages.thread.daySeparator.yesterday');
  }
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return locale === 'ar' ? `${day}/${month}` : `${month}/${day}`;
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const ThreadView: React.FC<Props> = ({ threadId, onClose }) => {
  const { locale } = useI18n();
  const { setDrawerOpen } = useParentAppContext();
  const { threads, messagesFor, markRead, sendText, sendVoice } =
    useMessageThreads();
  const { getById } = useContacts();
  const reduceMotion = useReducedMotion();
  const t = (k: string) => getMessagesString(locale, k);

  const thread = threads.find((th) => th.id === threadId);
  const contact = thread ? getById(thread.contactId) : null;
  const messages = useMemo(() => messagesFor(threadId), [messagesFor, threadId]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Hide bottom tab bar while in thread; restore on unmount. Also mark read.
  useEffect(() => {
    setDrawerOpen(true);
    return () => setDrawerOpen(false);
  }, [setDrawerOpen]);

  // Mark read once on mount (also when threadId changes — e.g. switching to
  // another thread from inside the same view).
  useEffect(() => {
    markRead(threadId);
  }, [threadId, markRead]);

  // Auto-scroll to bottom on mount + when new messages arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages.length, reduceMotion]);

  // Auto-advance voice playback: maintain a registry of play functions by
  // message id, then on `ended` find the next voice message in chrono order
  // and invoke its play().
  const voicePlayRegistryRef = useRef<Map<string, () => void>>(new Map());
  const registerVoicePlay = useCallback(
    (messageId: string, play: () => void) => {
      voicePlayRegistryRef.current.set(messageId, play);
    },
    []
  );
  const onVoiceEnded = useCallback(
    (messageId: string) => {
      const voiceIds = messages
        .filter((m) => m.kind === 'voice')
        .map((m) => m.id);
      const idx = voiceIds.indexOf(messageId);
      if (idx >= 0 && idx < voiceIds.length - 1) {
        const next = voiceIds[idx + 1];
        const play = voicePlayRegistryRef.current.get(next);
        play?.();
      }
    },
    [messages]
  );

  // ── Send helpers ─────────────────────────────────────────────────────────
  const handleSendText = useCallback(
    (body: string) => {
      sendText(threadId, body);
    },
    [threadId, sendText]
  );
  const handleSendVoice = useCallback(
    (blobUrl: string, durationSec: number) => {
      sendVoice(threadId, blobUrl, durationSec);
    },
    [threadId, sendVoice]
  );

  if (!thread || !contact) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <ThreadHeader
          onBack={onClose}
          contact={
            contact ?? {
              id: 'unknown',
              nameAr: '...',
              nameEn: '...',
              role: 'teacher',
              scope: 'school',
              avatarColor: 'slate',
              avatarInitial: '?',
              onlineStatus: 'offline',
              typicalReplyMinutes: 0,
              languages: ['ar'],
            }
          }
        />
        <p className="flex-1 flex items-center justify-center text-sm font-semibold text-slate-400">
          {t('parentApp.messages.recent.noResults')}
        </p>
      </div>
    );
  }

  // Group messages by day for separators.
  const groups: { key: string; iso: string; items: MockMessage[] }[] = [];
  for (const m of messages) {
    const k = dayKey(m.sentIso);
    const last = groups[groups.length - 1];
    if (last && last.key === k) {
      last.items.push(m);
    } else {
      groups.push({ key: k, iso: m.sentIso, items: [m] });
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
      className="absolute inset-0 flex flex-col bg-slate-50 z-10"
    >
      <ThreadHeader contact={contact} onBack={onClose} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
      >
        {groups.map((g) => (
          <div key={g.key} className="space-y-1.5">
            <div className="flex items-center justify-center my-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                {daySeparatorLabel(g.iso, locale, t)}
              </span>
            </div>
            {g.items.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                registerVoicePlay={registerVoicePlay}
                onVoiceEnded={onVoiceEnded}
              />
            ))}
          </div>
        ))}
      </div>

      <ComposeBar
        onSendText={handleSendText}
        onSendVoice={handleSendVoice}
      />
    </motion.div>
  );
};

export default ThreadView;
