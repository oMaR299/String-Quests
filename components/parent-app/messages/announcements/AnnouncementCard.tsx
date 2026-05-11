// AnnouncementCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// One announcement card. Left stripe color per kind. Optional inline actions.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import {
  getMessagesString,
  interpolate,
} from '../data/parentAppMessagesI18n';
import type {
  MockAnnouncementFull,
  AnnouncementKind,
} from '../data/parentAppAnnouncementsMock';
import type { MockContact } from '../data/parentAppContactsMock';
import { Eye, X, MessageCircle, PartyPopper } from 'lucide-react';

// Static stripe-color map — Tailwind v4 JIT safe.
const STRIPE_COLOR: Record<AnnouncementKind, string> = {
  broadcast: 'bg-duo-blue',
  reminder: 'bg-amber-400',
  achievement: 'bg-emerald-500',
  'action-needed': 'bg-rose-500',
};

const KIND_ICON: Record<AnnouncementKind, string> = {
  broadcast: '📢',
  reminder: '⏰',
  achievement: '🎉',
  'action-needed': '📋',
};

const KIND_LABEL_KEY: Record<AnnouncementKind, string> = {
  broadcast: 'parentApp.messages.announcements.kindLabel.broadcast',
  reminder: 'parentApp.messages.announcements.kindLabel.reminder',
  achievement: 'parentApp.messages.announcements.kindLabel.achievement',
  'action-needed': 'parentApp.messages.announcements.kindLabel.actionNeeded',
};

function formatTime(iso: string, locale: 'ar' | 'en'): string {
  const t = (k: string) => getMessagesString(locale, k);
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return t('parentApp.messages.time.justNow');
  if (diffMin < 60)
    return interpolate(t('parentApp.messages.time.minutesAgo'), { n: diffMin });
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24)
    return interpolate(t('parentApp.messages.time.hoursAgo'), { n: diffHour });
  const d = new Date(iso);
  return locale === 'ar'
    ? `${d.getDate()}/${d.getMonth() + 1}`
    : `${d.getMonth() + 1}/${d.getDate()}`;
}

interface Props {
  announcement: MockAnnouncementFull;
  fromContact: MockContact | null;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMessageTeacher: (contactId: string) => void;
}

export const AnnouncementCard: React.FC<Props> = ({
  announcement: a,
  fromContact,
  onMarkRead,
  onDismiss,
  onMessageTeacher,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  const title = locale === 'ar' ? a.titleAr : a.titleEn;
  const body = locale === 'ar' ? a.bodyAr : a.bodyEn;
  const senderName = fromContact
    ? locale === 'ar'
      ? fromContact.nameAr
      : fromContact.nameEn
    : '';

  const showMessageCta =
    a.ctaKind === 'message-teacher' && !!a.ctaTargetContactId;
  const showCelebrate = a.ctaKind === 'celebrate';

  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-[0_1px_0_0_#E2E8F0] ${
        a.read ? 'opacity-75' : ''
      }`}
    >
      {/* Left stripe — RTL-safe via logical start */}
      <span
        className={`absolute top-0 bottom-0 start-0 w-1 ${STRIPE_COLOR[a.kind]}`}
        aria-hidden="true"
      />

      <div className="ps-4 pe-3 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true">{KIND_ICON[a.kind]}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t(KIND_LABEL_KEY[a.kind])}
          </span>
          <span className="ms-auto text-[11px] font-bold text-slate-400">
            {formatTime(a.sentIso, locale)}
          </span>
        </div>

        <h4 className="text-base font-black text-slate-800 leading-tight mb-1">
          {title}
        </h4>

        <p className="text-sm font-semibold text-slate-600 leading-snug line-clamp-3">
          {body}
        </p>

        {senderName && (
          <p className="text-[11px] font-semibold text-slate-400 mt-1.5">
            {interpolate(t('parentApp.messages.announcements.fromLabel'), {
              name: senderName,
            })}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {!a.read && (
            <button
              type="button"
              onClick={() => onMarkRead(a.id)}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 active:scale-95 transition-transform"
            >
              <Eye className="w-3 h-3" strokeWidth={2.5} />
              <span>{t('parentApp.messages.announcements.markRead')}</span>
            </button>
          )}

          {showMessageCta && a.ctaTargetContactId && (
            <button
              type="button"
              onClick={() => onMessageTeacher(a.ctaTargetContactId!)}
              className="inline-flex items-center gap-1 rounded-full bg-duo-blue-light hover:bg-duo-blue-light/80 px-2.5 py-1 text-[11px] font-extrabold text-duo-blue active:scale-95 transition-transform"
            >
              <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
              <span>{t('parentApp.messages.announcements.messageTeacher')}</span>
            </button>
          )}

          {showCelebrate && (
            <button
              type="button"
              onClick={() => onMarkRead(a.id)}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 active:scale-95 transition-transform"
            >
              <PartyPopper className="w-3 h-3" strokeWidth={2.5} />
              <span>{t('parentApp.messages.announcements.celebrate')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDismiss(a.id)}
            className="ms-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-transform"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
            <span>{t('parentApp.messages.announcements.dismiss')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default AnnouncementCard;
