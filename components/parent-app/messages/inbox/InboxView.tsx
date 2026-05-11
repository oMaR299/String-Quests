// InboxView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Option A "Discovery first" layout:
//   1. Search bar
//   2. Mentor hero card (active child's mentor)
//   3. Subject tiles grid (active child's 6 subject teachers)
//   4. School staff tiles (cross-child principal/counselor/admin/nurse)
//   5. Recent threads list (active child + cross-child)
//
// The parent owns `searchQuery` and passes it down. Tiles + threads both
// filter by it; the mentor hero stays visible regardless.

import React, { useMemo, useState } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { useParentAppContext } from '../../useParentAppContext';
import { useContacts } from '../hooks/useContacts';
import { useMessageThreads } from '../hooks/useMessageThreads';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { MessagesSearchBar } from './MessagesSearchBar';
import { MentorHeroCard } from './MentorHeroCard';
import { SubjectTilesGrid } from './SubjectTilesGrid';
import { SchoolStaffTiles } from './SchoolStaffTiles';
import { RecentThreadsList } from './RecentThreadsList';
import type { MockContact } from '../data/parentAppContactsMock';
import type { MockMessage } from '../data/parentAppThreadsMock';

interface Props {
  onOpenThreadByContact: (contactId: string) => void;
  onOpenThread: (threadId: string) => void;
}

export const InboxView: React.FC<Props> = ({
  onOpenThreadByContact,
  onOpenThread,
}) => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();
  const { mentor, teachers, staff, all } = useContacts();
  const { visibleThreads, messagesFor } = useMessageThreads();
  const t = (k: string) => getMessagesString(locale, k);

  const [searchQuery, setSearchQuery] = useState('');

  // Build contactId -> contact map for thread rows.
  const contactsById = useMemo(() => {
    const map = new Map<string, MockContact>();
    all.forEach((c) => map.set(c.id, c));
    return map;
  }, [all]);

  // Build threadId -> last message map.
  const lastMessageByThread = useMemo(() => {
    const map = new Map<string, MockMessage | null>();
    visibleThreads.forEach((th) => {
      const msgs = messagesFor(th.id);
      map.set(th.id, msgs.length > 0 ? msgs[msgs.length - 1] : null);
    });
    return map;
  }, [visibleThreads, messagesFor]);

  // Build contactId -> unread count from threads (for tile badges).
  const unreadByContact = useMemo(() => {
    const map = new Map<string, number>();
    visibleThreads.forEach((th) => {
      if (th.unreadCount > 0) {
        map.set(th.contactId, (map.get(th.contactId) ?? 0) + th.unreadCount);
      }
    });
    return map;
  }, [visibleThreads]);

  // Filter tile sets by search query — name / role / subject match.
  const trimmedQuery = searchQuery.trim().toLowerCase();

  function matchesQuery(c: MockContact): boolean {
    if (!trimmedQuery) return true;
    const subjectLocalized = c.subject
      ? t(`parentApp.messages.subjects.${c.subject}`)
      : '';
    const roleLocalized = t(`parentApp.messages.roles.${c.role}`);
    return [
      c.nameAr,
      c.nameEn,
      c.role,
      roleLocalized,
      c.subject ?? '',
      subjectLocalized,
    ]
      .join(' ')
      .toLowerCase()
      .includes(trimmedQuery);
  }

  const visibleTeachers = teachers.filter(matchesQuery);
  const visibleStaff = staff.filter(matchesQuery);

  return (
    <div className="px-4 pt-3 pb-6">
      <MessagesSearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="mt-4">
        {mentor && (
          <MentorHeroCard
            mentor={mentor}
            childNameAr={activeChild.nameAr}
            childNameEn={activeChild.nameEn}
            onOpen={onOpenThreadByContact}
          />
        )}
      </div>

      <SubjectTilesGrid
        teachers={visibleTeachers}
        childNameAr={activeChild.nameAr}
        childNameEn={activeChild.nameEn}
        unreadByContact={unreadByContact}
        onOpen={onOpenThreadByContact}
      />

      <SchoolStaffTiles
        staff={visibleStaff}
        unreadByContact={unreadByContact}
        onOpen={onOpenThreadByContact}
      />

      <RecentThreadsList
        threads={visibleThreads}
        contactsById={contactsById}
        lastMessageByThread={lastMessageByThread}
        searchQuery={searchQuery}
        onOpen={onOpenThread}
      />
    </div>
  );
};

export default InboxView;
