// RecentThreadsList.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reverse-chronological list of threads relevant to the active child + cross-
// child staff. Header copy varies based on unread count. Empty state when no
// threads match the search.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import {
  getMessagesString,
  interpolate,
} from '../data/parentAppMessagesI18n';
import { ThreadRow } from './ThreadRow';
import type { MockContact } from '../data/parentAppContactsMock';
import type { MockMessage, MockThread } from '../data/parentAppThreadsMock';

interface Props {
  threads: MockThread[];
  /** contactId -> contact */
  contactsById: Map<string, MockContact>;
  /** threadId -> last message in that thread */
  lastMessageByThread: Map<string, MockMessage | null>;
  searchQuery: string;
  onOpen: (threadId: string) => void;
}

export const RecentThreadsList: React.FC<Props> = ({
  threads,
  contactsById,
  lastMessageByThread,
  searchQuery,
  onOpen,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  // Reverse-chrono sort
  const sorted = [...threads].sort((a, b) =>
    a.lastMessageAt < b.lastMessageAt ? 1 : -1
  );

  const totalUnread = sorted.reduce((sum, th) => sum + th.unreadCount, 0);

  const header =
    totalUnread > 0
      ? interpolate(t('parentApp.messages.recent.headerWithUnread'), {
          count: totalUnread,
        })
      : t('parentApp.messages.recent.header');

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matches = (th: MockThread): boolean => {
    if (!trimmedQuery) return true;
    const contact = contactsById.get(th.contactId);
    if (!contact) return false;
    const fields = [
      contact.nameAr,
      contact.nameEn,
      t(`parentApp.messages.roles.${contact.role}`),
      contact.subject ? t(`parentApp.messages.subjects.${contact.subject}`) : '',
    ];
    const last = lastMessageByThread.get(th.id);
    if (last) {
      fields.push(last.bodyAr ?? '');
      fields.push(last.bodyEn ?? '');
    }
    return fields.some((f) => f.toLowerCase().includes(trimmedQuery));
  };

  const filtered = sorted.filter(matches);

  return (
    <section className="mt-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 px-1">
        {header}
      </h3>
      {filtered.length === 0 ? (
        <p className="text-center text-xs font-semibold text-slate-400 py-6">
          {trimmedQuery
            ? t('parentApp.messages.recent.noResults')
            : t('parentApp.messages.recent.emptyState')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filtered.map((th) => {
            const contact = contactsById.get(th.contactId);
            if (!contact) return null;
            return (
              <li key={th.id}>
                <ThreadRow
                  thread={th}
                  contact={contact}
                  lastMessage={lastMessageByThread.get(th.id) ?? null}
                  onOpen={onOpen}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentThreadsList;
