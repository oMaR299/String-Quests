// useAnnouncements.ts
// ─────────────────────────────────────────────────────────────────────────────
// Module-level mutable store for announcement cards. Mirrors useMessageThreads
// — single in-memory list, subscribe-on-change pattern.

import { useCallback, useEffect, useState } from 'react';
import {
  MOCK_ANNOUNCEMENTS,
  type MockAnnouncementFull,
} from '../data/parentAppAnnouncementsMock';
import { useParentAppContext } from '../../useParentAppContext';

let _announcements: MockAnnouncementFull[] = MOCK_ANNOUNCEMENTS.map((a) => ({
  ...a,
}));

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

function _markRead(id: string) {
  _announcements = _announcements.map((a) =>
    a.id === id && !a.read ? { ...a, read: true } : a
  );
  emit();
}

function _dismiss(id: string) {
  _announcements = _announcements.map((a) =>
    a.id === id && !a.dismissed ? { ...a, dismissed: true } : a
  );
  emit();
}

export interface UseAnnouncementsReturn {
  /** All announcements, including dismissed (use `visible` for rendering). */
  all: MockAnnouncementFull[];
  /** Announcements filtered by active child + scope='school' + not dismissed. */
  visible: MockAnnouncementFull[];
  /** Unread visible count. */
  unreadCount: number;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
}

export function useAnnouncements(): UseAnnouncementsReturn {
  const { activeChildId } = useParentAppContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick((n) => n + 1));
  }, []);

  // Visible filter:
  //   • Drop dismissed
  //   • Drop scope=child/class for other kids
  //   • Keep scope=school always
  const visible = _announcements.filter((a) => {
    if (a.dismissed) return false;
    if (a.scope === 'school') return true;
    if ((a.scope === 'class' || a.scope === 'child') && a.childId) {
      return a.childId === activeChildId;
    }
    return true;
  });

  const unreadCount = visible.filter((a) => !a.read).length;

  const markRead = useCallback((id: string) => _markRead(id), []);
  const dismiss = useCallback((id: string) => _dismiss(id), []);

  return {
    all: _announcements,
    visible,
    unreadCount,
    markRead,
    dismiss,
  };
}
