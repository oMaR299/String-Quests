// SegmentedControl.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Two-option pill toggle for the Messages tab — Inbox / Announcements
// with optional unread badges. Active segment background slides between the
// two via Framer `layoutId="messages-segment-active"`. Reduced motion → instant.
//
// Lucide icons (MessageCircle / Megaphone) sit before each label to keep the
// segments scannable without leaning on emoji glyphs.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Megaphone } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getMessagesString } from './data/parentAppMessagesI18n';

export type MessagesSegment = 'inbox' | 'announcements';

interface SegmentedControlProps {
  value: MessagesSegment;
  onChange: (next: MessagesSegment) => void;
  inboxUnread: number;
  announcementsUnread: number;
}

interface SegmentDef {
  key: MessagesSegment;
  labelKey: string;
  unread: number;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  onChange,
  inboxUnread,
  announcementsUnread,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = (k: string) => getMessagesString(locale, k);

  const segments: SegmentDef[] = [
    {
      key: 'inbox',
      labelKey: 'parentApp.messages.segments.inbox',
      unread: inboxUnread,
      Icon: MessageCircle,
    },
    {
      key: 'announcements',
      labelKey: 'parentApp.messages.segments.announcements',
      unread: announcementsUnread,
      Icon: Megaphone,
    },
  ];

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="bg-slate-100 rounded-full p-1 flex gap-1"
    >
      {segments.map((seg) => {
        const isActive = value === seg.key;
        return (
          <button
            key={seg.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(seg.key)}
            className={`relative flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 px-3 text-sm transition-colors duration-150 ${
              isActive
                ? 'text-slate-900 font-extrabold'
                : 'text-slate-500 font-semibold hover:text-slate-700'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={reduceMotion ? undefined : 'messages-segment-active'}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 32 }
                }
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap">
              <seg.Icon className="w-4 h-4" strokeWidth={2.5} />
              {t(seg.labelKey)}
            </span>
            {seg.unread > 0 && (
              <span
                className="relative z-10 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-duo-red text-white text-[10px] font-black"
                aria-label={`${seg.unread} unread`}
              >
                {seg.unread > 99 ? '99+' : seg.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
