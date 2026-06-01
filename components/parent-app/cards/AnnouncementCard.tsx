// AnnouncementCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Latest unread school announcement. Tap → Messages.

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';

export const AnnouncementCard: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { state, activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Filter: school-wide always; child-specific only when they belong to the
  // active child.
  const filtered = state.announcements.filter((a) => {
    if (!a.unread) return false;
    if (!a.childId) return true;
    return a.childId === activeChildId;
  });

  if (filtered.length === 0) return null;

  const top = filtered[0];
  const title = locale === 'ar' ? top.titleAr : top.titleEn;
  const body = locale === 'ar' ? top.bodyAr : top.bodyEn;

  return (
    <button
      type="button"
      onClick={() => navigate('/parent/messages')}
      className="w-full text-start rounded-2xl bg-white border border-slate-200 p-4 flex gap-3 items-start hover:bg-slate-50 transition-colors motion-safe:active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 inline-flex items-center justify-center shrink-0">
        <Megaphone className="w-5 h-5 text-slate-500" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {t('parentApp.announcement.tag')}
        </div>
        <p className="text-sm font-extrabold text-slate-800 leading-snug truncate">{title}</p>
        <p className="text-xs font-semibold text-slate-500 leading-snug truncate">{body}</p>
      </div>
    </button>
  );
};

export default AnnouncementCard;
