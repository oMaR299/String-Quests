// MessagePreviewCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Latest unread message thread. Hides when nothing unread. Tap → Messages.

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';

export const MessagePreviewCard: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { state } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const unread = state.messages.filter((m) => m.unread);
  if (unread.length === 0) return null;

  const top = unread[0];
  const sender = locale === 'ar' ? top.fromAr : top.fromEn;
  const last = locale === 'ar' ? top.lastAr : top.lastEn;
  const initial = sender.slice(0, 1);

  return (
    <button
      type="button"
      onClick={() => navigate('/parent/messages')}
      className="w-full text-start rounded-2xl bg-white border border-slate-200 p-4 flex gap-3 items-start hover:bg-slate-50 transition-colors motion-safe:active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-full bg-duo-blue inline-flex items-center justify-center shrink-0">
        <span className="text-sm font-black text-white">{initial}</span>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm font-extrabold text-slate-800 leading-snug truncate">
            {sender}
          </p>
          <span className="w-2 h-2 rounded-full bg-duo-blue shrink-0" aria-label={t('parentApp.message.unread')} />
        </div>
        <p className="text-xs font-semibold text-slate-500 leading-snug truncate">{last}</p>
      </div>
    </button>
  );
};

export default MessagePreviewCard;
