// AnnouncementFilterPills.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Single-select filter row above the announcement cards: All / School-wide /
// Class (active child) / Unread.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import {
  getMessagesString,
  interpolate,
} from '../data/parentAppMessagesI18n';

export type AnnouncementFilter = 'all' | 'school' | 'class' | 'unread';

interface Props {
  value: AnnouncementFilter;
  onChange: (next: AnnouncementFilter) => void;
  childNameAr: string;
  childNameEn: string;
}

export const AnnouncementFilterPills: React.FC<Props> = ({
  value,
  onChange,
  childNameAr,
  childNameEn,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);
  const childName = locale === 'ar' ? childNameAr : childNameEn;

  const pills: { key: AnnouncementFilter; label: string }[] = [
    { key: 'all', label: t('parentApp.messages.announcements.filterAll') },
    {
      key: 'school',
      label: t('parentApp.messages.announcements.filterSchool'),
    },
    {
      key: 'class',
      label: interpolate(
        t('parentApp.messages.announcements.filterClass'),
        { name: childName }
      ),
    },
    {
      key: 'unread',
      label: t('parentApp.messages.announcements.filterUnread'),
    },
  ];

  return (
    <div
      role="tablist"
      className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none"
    >
      {pills.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${
              active
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};

export default AnnouncementFilterPills;
