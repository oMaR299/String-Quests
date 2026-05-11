// SchoolStaffTiles.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 2-column grid of cross-child staff. Always visible regardless of active
// child.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { StaffTile } from './StaffTile';
import type { MockContact } from '../data/parentAppContactsMock';

interface Props {
  staff: MockContact[];
  unreadByContact: Map<string, number>;
  onOpen: (contactId: string) => void;
}

export const SchoolStaffTiles: React.FC<Props> = ({
  staff,
  unreadByContact,
  onOpen,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  if (staff.length === 0) return null;

  return (
    <section className="mt-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
        {t('parentApp.messages.tiles.staffHeader')}
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        {staff.map((c) => (
          <StaffTile
            key={c.id}
            contact={c}
            unread={unreadByContact.get(c.id) ?? 0}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
};

export default SchoolStaffTiles;
