// ThreadRow.tsx
// ─────────────────────────────────────────────────────────────────────────────
// One row inside RecentThreadsList. Avatar + name/role/preview + time +
// optional unread chip.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import {
  getMessagesString,
  interpolate,
} from '../data/parentAppMessagesI18n';
import { AVATAR_STYLES } from '../../parentAppMockData';
import type { MockContact } from '../data/parentAppContactsMock';
import type { MockMessage, MockThread } from '../data/parentAppThreadsMock';

interface Props {
  thread: MockThread;
  contact: MockContact;
  lastMessage: MockMessage | null;
  onOpen: (threadId: string) => void;
}

/**
 * Compact "time ago" formatter for thread rows. Returns "الآن" / "٢ د" /
 * "أمس" / "الإثنين" / "30 أبريل".
 */
function formatTime(iso: string, locale: 'ar' | 'en'): string {
  const t = (k: string) => getMessagesString(locale, k);
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return t('parentApp.messages.time.justNow');
  if (diffMin < 60) return interpolate(t('parentApp.messages.time.minutesAgo'), { n: diffMin });
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return interpolate(t('parentApp.messages.time.hoursAgo'), { n: diffHour });
  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return t('parentApp.messages.time.yesterday');
  if (diffDay < 7) return interpolate(t('parentApp.messages.time.daysAgo'), { n: diffDay });
  // Older than a week → MM/DD format
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return locale === 'ar' ? `${day}/${month}` : `${month}/${day}`;
}

function summarizeMessage(m: MockMessage | null, locale: 'ar' | 'en'): string {
  if (!m) return '';
  if (m.kind === 'voice') return locale === 'ar' ? '🎤 رسالة صوتية' : '🎤 Voice message';
  if (m.kind === 'image') return locale === 'ar' ? '🖼️ صورة' : '🖼️ Photo';
  const body = locale === 'ar' ? m.bodyAr : m.bodyEn;
  return (body ?? '').trim();
}

export const ThreadRow: React.FC<Props> = ({
  thread,
  contact,
  lastMessage,
  onOpen,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  const avatar = AVATAR_STYLES[contact.avatarColor === 'slate' ? 'duo-blue' : contact.avatarColor];
  const avatarBg = contact.avatarColor === 'slate' ? 'bg-slate-400' : avatar.bg;
  const avatarShadow =
    contact.avatarColor === 'slate' ? 'shadow-[0_2px_0_0_#64748B]' : avatar.shadow;

  const name = locale === 'ar' ? contact.nameAr : contact.nameEn;
  const roleLabel = t(`parentApp.messages.roles.${contact.role}`);
  const preview = summarizeMessage(lastMessage, locale);
  const isUnread = thread.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      className="w-full flex items-center gap-3 px-1 py-3 text-start rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center ${avatarBg} text-white ${avatarShadow}`}
        aria-hidden="true"
      >
        <span className="text-sm font-black">{contact.avatarInitial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p
            className={`text-sm truncate ${
              isUnread ? 'font-black text-slate-900' : 'font-extrabold text-slate-800'
            }`}
          >
            {name}
          </p>
          <span className="text-[11px] font-semibold text-slate-400 truncate">
            · {roleLabel}
          </span>
        </div>
        {preview && (
          <p
            className={`text-xs truncate ${
              isUnread ? 'text-slate-700 font-semibold' : 'text-slate-500'
            }`}
          >
            {preview}
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[11px] font-bold text-slate-400">
          {formatTime(thread.lastMessageAt, locale)}
        </span>
        {isUnread && (
          <span
            className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-duo-red text-white text-[10px] font-black"
            aria-label={`${thread.unreadCount} unread`}
          >
            {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default ThreadRow;
