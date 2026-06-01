// StaffTile.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Cross-child school staff tile. Single avatar + role label. Smaller / simpler
// than subject tiles.

import React from 'react';
import {
  Briefcase,
  Brain,
  ClipboardList,
  Stethoscope,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import type { MockContact, ContactRole } from '../data/parentAppContactsMock';

// Role-specific lucide icons. Locked literal map so the JIT picks up every
// utility class used inside this component at build time.
const ROLE_ICON: Record<
  ContactRole,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  principal: Briefcase,
  counselor: Brain,
  admin: ClipboardList,
  nurse: Stethoscope,
  mentor: GraduationCap,
  teacher: BookOpen,
};

interface Props {
  contact: MockContact;
  unread: number;
  onOpen: (contactId: string) => void;
}

export const StaffTile: React.FC<Props> = ({ contact, unread, onOpen }) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);
  const Icon = ROLE_ICON[contact.role];

  return (
    <button
      type="button"
      onClick={() => onOpen(contact.id)}
      className="relative rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-2.5 text-start hover:bg-slate-50 motion-safe:active:scale-[0.98] transition-colors"
    >
      <div
        className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center bg-slate-100 text-slate-600"
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {t(`parentApp.messages.roles.${contact.role}`)}
        </p>
        <p className="text-sm font-black text-slate-800 leading-tight truncate">
          {locale === 'ar' ? contact.nameAr : contact.nameEn}
        </p>
      </div>
      {unread > 0 && (
        <span
          className="absolute top-2 end-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-duo-red text-white text-[10px] font-black"
          aria-label={`${unread} unread`}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
};

export default StaffTile;
