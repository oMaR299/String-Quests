// useMessageThreads.ts
// ─────────────────────────────────────────────────────────────────────────────
// In-memory thread + message store for the Messages module. Single source of
// truth shared across the whole tab via module-level state + a subscription
// pattern (no Context wiring needed because the Messages module is one tab
// and lives entirely under MessagesTab).
//
// The store is hydrated once from MOCK_THREAD_STORE on first render. Writes:
//   • markRead(threadId)               — sets unreadCount=0 on a thread.
//   • appendMessage({...})             — pushes a new message; auto-updates
//                                         lastMessageAt on its thread.
//   • simulateOutgoingLifecycle(id)    — mutates a parent's message state
//                                         from sending → sent → delivered →
//                                         read over ~1.5s.
//
// We use a tiny event-emitter so any subscribed component re-renders when
// the store changes. (Lighter than wiring full Context for what is a
// per-route surface — and avoids re-render storms on the parent layout.)
//
// IMPORTANT: state is session-only. A page refresh resets everything back to
// MOCK_THREAD_STORE. Matches the rest of the parent-app mock model.

import { useCallback, useEffect, useState } from 'react';
import {
  MOCK_THREAD_STORE,
  type MockMessage,
  type MockThread,
  type MessageKind,
  type MessageState,
} from '../data/parentAppThreadsMock';
import { useParentAppContext } from '../../useParentAppContext';

// ============================================================================
// Module-level state
// ============================================================================

const PARENT_ID = '__parent__';

let _threads: MockThread[] = MOCK_THREAD_STORE.threads.map((t) => ({ ...t }));
let _messages: MockMessage[] = MOCK_THREAD_STORE.messages.map((m) => ({ ...m }));

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ============================================================================
// Mutations
// ============================================================================

function markThreadRead(threadId: string) {
  let dirty = false;
  _threads = _threads.map((t) => {
    if (t.id === threadId && t.unreadCount > 0) {
      dirty = true;
      return { ...t, unreadCount: 0 };
    }
    return t;
  });
  _messages = _messages.map((m) =>
    m.threadId === threadId && !m.fromParent && m.state !== 'read'
      ? { ...m, state: 'read' as MessageState }
      : m
  );
  if (dirty) emit();
}

function pushMessage(input: {
  threadId: string;
  kind: MessageKind;
  bodyAr?: string;
  bodyEn?: string;
  voiceBlobUrl?: string;
  voiceDurationSec?: number;
}): MockMessage {
  const id = `${input.threadId}-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const msg: MockMessage = {
    id,
    threadId: input.threadId,
    fromContactId: PARENT_ID,
    fromParent: true,
    kind: input.kind,
    bodyAr: input.bodyAr,
    bodyEn: input.bodyEn,
    voiceBlobUrl: input.voiceBlobUrl,
    voiceDurationSec: input.voiceDurationSec,
    sentIso: new Date().toISOString(),
    state: 'sending',
  };
  _messages = [..._messages, msg];
  _threads = _threads.map((t) =>
    t.id === input.threadId
      ? { ...t, lastMessageAt: msg.sentIso }
      : t
  );
  emit();
  return msg;
}

function setMessageState(messageId: string, state: MessageState) {
  _messages = _messages.map((m) =>
    m.id === messageId ? { ...m, state } : m
  );
  emit();
}

function simulateOutgoingLifecycle(messageId: string) {
  // sending → sent (300ms) → delivered (500ms) → read (700ms)
  window.setTimeout(() => setMessageState(messageId, 'sent'), 300);
  window.setTimeout(() => setMessageState(messageId, 'delivered'), 800);
  window.setTimeout(() => setMessageState(messageId, 'read'), 1500);
}

// ============================================================================
// Hook
// ============================================================================

export interface UseMessageThreadsReturn {
  threads: MockThread[];
  messages: MockMessage[];
  /** Threads filtered by active child + cross-child contacts. */
  visibleThreads: MockThread[];
  /** Unread count across visible threads. */
  unreadCount: number;
  /** Find a thread by contactId (for "open chat with X" flows). Returns null if no thread exists yet. */
  findThreadByContact: (contactId: string) => MockThread | null;
  /** Mark all messages in a thread as read + zero its unread counter. */
  markRead: (threadId: string) => void;
  /** Get all messages for a thread (chrono order). */
  messagesFor: (threadId: string) => MockMessage[];
  /** Append a new parent-authored message and kick off the state lifecycle. */
  sendText: (threadId: string, body: string) => MockMessage;
  /** Append a parent-authored voice message. */
  sendVoice: (
    threadId: string,
    blobUrl: string,
    durationSec: number
  ) => MockMessage;
  /**
   * If no thread exists for this contact, create one (returns its id).
   * Otherwise returns the existing thread id.
   */
  ensureThreadForContact: (
    contactId: string,
    childId: string | undefined
  ) => string;
}

export function useMessageThreads(): UseMessageThreadsReturn {
  const { activeChildId } = useParentAppContext();
  // useSyncExternalStore would be cleaner but useState + subscribe also works
  // and is easier to reason about for v1.
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick((n) => n + 1));
  }, []);

  // Visible: threads whose contact is mentored to the active child OR cross-
  // child staff (scope='school'). We can't read the contact scope from a
  // thread directly, so we infer: a thread is visible if its childId equals
  // activeChildId, OR its childId is undefined (cross-child contacts).
  const visibleThreads = _threads.filter(
    (t) => !t.childId || t.childId === activeChildId
  );

  const unreadCount = visibleThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const findThreadByContact = useCallback(
    (contactId: string): MockThread | null => {
      return _threads.find((t) => t.contactId === contactId) ?? null;
    },
    []
  );

  const markRead = useCallback((threadId: string) => {
    markThreadRead(threadId);
  }, []);

  const messagesFor = useCallback((threadId: string): MockMessage[] => {
    return _messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => (a.sentIso < b.sentIso ? -1 : 1));
  }, []);

  const sendText = useCallback(
    (threadId: string, body: string): MockMessage => {
      const trimmed = body.trim();
      const msg = pushMessage({
        threadId,
        kind: 'text',
        bodyAr: trimmed,
        bodyEn: trimmed,
      });
      simulateOutgoingLifecycle(msg.id);
      return msg;
    },
    []
  );

  const sendVoice = useCallback(
    (threadId: string, blobUrl: string, durationSec: number): MockMessage => {
      const msg = pushMessage({
        threadId,
        kind: 'voice',
        voiceBlobUrl: blobUrl,
        voiceDurationSec: durationSec,
      });
      simulateOutgoingLifecycle(msg.id);
      return msg;
    },
    []
  );

  const ensureThreadForContact = useCallback(
    (contactId: string, childId: string | undefined): string => {
      const existing = _threads.find((t) => t.contactId === contactId);
      if (existing) return existing.id;

      const newThread: MockThread = {
        id: `thread-new-${contactId}-${Date.now()}`,
        contactId,
        childId,
        unreadCount: 0,
        pinned: false,
        muted: false,
        lastMessageAt: new Date().toISOString(),
      };
      _threads = [..._threads, newThread];
      emit();
      return newThread.id;
    },
    []
  );

  return {
    threads: _threads,
    messages: _messages,
    visibleThreads,
    unreadCount,
    findThreadByContact,
    markRead,
    messagesFor,
    sendText,
    sendVoice,
    ensureThreadForContact,
  };
}
