// SubjectTilesGrid.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 2-column grid of subject tiles for the active child. Header above:
// "معلمو {childName} / {childName}'s teachers".

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString, interpolate } from '../data/parentAppMessagesI18n';
import { SubjectTile } from './SubjectTile';
import type { MockContact, SubjectKey } from '../data/parentAppContactsMock';

interface Props {
  teachers: MockContact[];
  childNameAr: string;
  childNameEn: string;
  /** thread.contactId -> unread count map for badging. */
  unreadByContact: Map<string, number>;
  onOpen: (contactId: string) => void;
}

export const SubjectTilesGrid: React.FC<Props> = ({
  teachers,
  childNameAr,
  childNameEn,
  unreadByContact,
  onOpen,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  const header = interpolate(t('parentApp.messages.tiles.teachersHeader'), {
    name: locale === 'ar' ? childNameAr : childNameEn,
  });

  if (teachers.length === 0) return null;

  return (
    <section className="mt-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
        {header}
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {teachers.map((c) => (
          <SubjectTile
            key={c.id}
            contact={c}
            subject={c.subject as SubjectKey}
            unread={unreadByContact.get(c.id) ?? 0}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
};

export default SubjectTilesGrid;
