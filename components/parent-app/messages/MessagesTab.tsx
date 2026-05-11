// MessagesTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Route entry for /parent/messages. Owns:
//   • `segment` — which top-level surface is shown ('inbox' | 'announcements')
//   • `openThreadId` — null = list view, string = chat surface overlay
//
// Default segment heuristic: Inbox unless Announcements has unread AND Inbox
// doesn't (so the parent always lands on whatever has fresh items).
//
// When a thread is open, ThreadView renders as an absolute overlay inside
// the body slot of PhoneShell. ThreadView itself sets `isDrawerOpen=true`
// via ParentAppContext so the bottom tab bar slides away.

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParentAppContext } from '../useParentAppContext';
import { useMessageThreads } from './hooks/useMessageThreads';
import { useAnnouncements } from './hooks/useAnnouncements';
import { SegmentedControl, type MessagesSegment } from './SegmentedControl';
import { InboxView } from './inbox/InboxView';
import { AnnouncementsView } from './announcements/AnnouncementsView';
import { ThreadView } from './thread/ThreadView';

export const MessagesTab: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeChild } = useParentAppContext();
  const { unreadCount: inboxUnread, ensureThreadForContact, findThreadByContact } =
    useMessageThreads();
  const { unreadCount: announcementsUnread } = useAnnouncements();

  // Default segment: announcements only wins if it has unreads AND inbox
  // doesn't. Otherwise inbox. Computed once on first render.
  const initialSegment: MessagesSegment = useMemo(() => {
    if (announcementsUnread > 0 && inboxUnread === 0) return 'announcements';
    return 'inbox';
    // intentionally NOT re-deriving on count changes — defaults are sticky.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [segment, setSegment] = useState<MessagesSegment>(initialSegment);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  // Optional deep-link: ?thread=<id> opens a thread on mount. Documented for
  // v1.1 in the plan; harmless to support now.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('thread');
    if (t) {
      setOpenThreadId(t);
      // Strip the query param so back-button-from-thread doesn't reopen it.
      const next = location.pathname;
      navigate(next, { replace: true });
    }
    // intentionally one-shot on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openThreadByContact = (contactId: string) => {
    const existing = findThreadByContact(contactId);
    const childId = activeChild?.id;
    const id = existing
      ? existing.id
      : ensureThreadForContact(contactId, childId);
    setOpenThreadId(id);
  };

  // Announcement → "Message teacher" CTA: route to Inbox THEN open thread.
  const openThreadFromAnnouncement = (contactId: string) => {
    setSegment('inbox');
    openThreadByContact(contactId);
  };

  if (openThreadId) {
    return (
      <div className="relative h-full">
        <ThreadView
          threadId={openThreadId}
          onClose={() => setOpenThreadId(null)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-3">
      <SegmentedControl
        value={segment}
        onChange={setSegment}
        inboxUnread={inboxUnread}
        announcementsUnread={announcementsUnread}
      />

      <div className="-mx-4">
        {segment === 'inbox' ? (
          <InboxView
            onOpenThreadByContact={openThreadByContact}
            onOpenThread={(id) => setOpenThreadId(id)}
          />
        ) : (
          <AnnouncementsView
            onOpenThreadByContact={openThreadFromAnnouncement}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
