// AnnouncementsView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Stack of announcement cards with single-select filter pills + time grouping
// (Today / Yesterday / Earlier).

import React, { useMemo, useState } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { useParentAppContext } from '../../useParentAppContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useContacts } from '../hooks/useContacts';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import {
  AnnouncementFilterPills,
  type AnnouncementFilter,
} from './AnnouncementFilterPills';
import { AnnouncementCard } from './AnnouncementCard';
import type { MockAnnouncementFull } from '../data/parentAppAnnouncementsMock';

type Bucket = 'today' | 'yesterday' | 'earlier';

function bucketOf(iso: string): Bucket {
  const then = new Date(iso);
  const now = new Date();
  if (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  ) {
    return 'today';
  }
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (
    then.getFullYear() === y.getFullYear() &&
    then.getMonth() === y.getMonth() &&
    then.getDate() === y.getDate()
  ) {
    return 'yesterday';
  }
  return 'earlier';
}

interface Props {
  onOpenThreadByContact: (contactId: string) => void;
}

export const AnnouncementsView: React.FC<Props> = ({
  onOpenThreadByContact,
}) => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();
  const { visible, markRead, dismiss } = useAnnouncements();
  const { getById } = useContacts();
  const t = (k: string) => getMessagesString(locale, k);

  const [filter, setFilter] = useState<AnnouncementFilter>('all');

  const filtered = useMemo(() => {
    return visible.filter((a) => {
      if (filter === 'all') return true;
      if (filter === 'school') return a.scope === 'school';
      if (filter === 'class')
        return (
          (a.scope === 'class' || a.scope === 'child') &&
          a.childId === activeChild.id
        );
      if (filter === 'unread') return !a.read;
      return true;
    });
  }, [visible, filter, activeChild.id]);

  // Reverse-chrono sort then group
  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      a.sentIso < b.sentIso ? 1 : -1
    );
    const groups: Record<Bucket, MockAnnouncementFull[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };
    sorted.forEach((a) => {
      groups[bucketOf(a.sentIso)].push(a);
    });
    return groups;
  }, [filtered]);

  const sectionTitle = (b: Bucket) => {
    if (b === 'today') return t('parentApp.messages.time.today');
    if (b === 'yesterday') return t('parentApp.messages.time.yesterday');
    return t('parentApp.messages.time.earlier');
  };

  return (
    <div className="px-4 pt-3 pb-6">
      <AnnouncementFilterPills
        value={filter}
        onChange={setFilter}
        childNameAr={activeChild.nameAr}
        childNameEn={activeChild.nameEn}
      />

      {filtered.length === 0 ? (
        <p className="text-center text-sm font-semibold text-slate-400 py-12">
          {t('parentApp.messages.announcements.emptyState')}
        </p>
      ) : (
        <div className="mt-3 space-y-5">
          {(['today', 'yesterday', 'earlier'] as Bucket[]).map((b) => {
            const rows = grouped[b];
            if (rows.length === 0) return null;
            return (
              <section key={b}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
                  {sectionTitle(b)}
                </h3>
                <div className="space-y-2.5">
                  {rows.map((a) => (
                    <AnnouncementCard
                      key={a.id}
                      announcement={a}
                      fromContact={getById(a.fromContactId)}
                      onMarkRead={markRead}
                      onDismiss={dismiss}
                      onMessageTeacher={onOpenThreadByContact}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsView;
