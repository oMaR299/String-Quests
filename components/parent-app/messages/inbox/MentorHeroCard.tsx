// MentorHeroCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Wide hero card surfacing the active child's Academic Mentor. Avatar + name
// + role label + online status + typical reply time + a chunky duo-blue
// "Open chat" button.
//
// Tap anywhere on the card OR the button → calls `onOpen(mentorContactId)`.

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString, interpolate } from '../data/parentAppMessagesI18n';
import { AVATAR_STYLES } from '../../parentAppMockData';
import type { MockContact } from '../data/parentAppContactsMock';
import { PrimaryButton } from '../../../parent-onboarding/PrimaryButton';

interface Props {
  mentor: MockContact;
  childNameAr: string;
  childNameEn: string;
  onOpen: (contactId: string) => void;
}

function formatReplyTime(mins: number, locale: 'ar' | 'en'): string {
  const t = (k: string) => getMessagesString(locale, k);
  if (mins < 60) {
    return interpolate(t('parentApp.messages.mentor.replyTimeMinutes'), {
      minutes: mins,
    });
  }
  const hours = Math.round(mins / 60);
  if (hours === 1) {
    return t('parentApp.messages.mentor.replyTimeApproxHour');
  }
  return interpolate(t('parentApp.messages.mentor.replyTimeHours'), {
    hours,
  });
}

export const MentorHeroCard: React.FC<Props> = ({
  mentor,
  childNameAr,
  childNameEn,
  onOpen,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = (k: string) => getMessagesString(locale, k);

  // Mentors get duo-purple avatar tone per the contacts mock.
  const avatar =
    AVATAR_STYLES[mentor.avatarColor === 'slate' ? 'duo-purple' : mentor.avatarColor];

  const childName = locale === 'ar' ? childNameAr : childNameEn;
  const roleLabel = interpolate(t('parentApp.messages.mentor.roleLabel'), {
    name: childName,
  });
  const replyTime = formatReplyTime(mentor.typicalReplyMinutes, locale);

  const statusDot =
    mentor.onlineStatus === 'online'
      ? 'bg-emerald-500'
      : mentor.onlineStatus === 'busy'
        ? 'bg-amber-500'
        : 'bg-slate-300';
  const statusLabel =
    mentor.onlineStatus === 'online'
      ? t('parentApp.messages.mentor.statusOnline')
      : mentor.onlineStatus === 'busy'
        ? t('parentApp.messages.mentor.statusBusy')
        : t('parentApp.messages.mentor.statusOffline');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
      className="rounded-3xl border border-white/90 bg-gradient-to-br from-duo-purple-light via-duo-blue-light to-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Avatar with mortarboard overlay */}
        <button
          type="button"
          onClick={() => onOpen(mentor.id)}
          aria-label={mentor.nameAr}
          className="relative shrink-0 active:scale-95 transition-transform"
        >
          <div
            className={`w-14 h-14 rounded-full inline-flex items-center justify-center ${avatar.bg} ${avatar.text} ${avatar.shadow}`}
          >
            <span className="text-xl font-black">{mentor.avatarInitial}</span>
          </div>
          <span
            className="absolute -bottom-1 end-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white shadow border border-slate-100"
            aria-hidden="true"
          >
            <GraduationCap
              className="w-3.5 h-3.5 text-duo-purple"
              strokeWidth={2.5}
            />
          </span>
        </button>

        {/* Name + role + status */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 truncate">
            {roleLabel}
          </p>
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate">
            {locale === 'ar' ? mentor.nameAr : mentor.nameEn}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span
              className={`inline-block w-2 h-2 rounded-full ${statusDot}`}
              aria-hidden="true"
            />
            <span>{statusLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{replyTime}</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <PrimaryButton onClick={() => onOpen(mentor.id)}>
          {t('parentApp.messages.mentor.openChat')}
        </PrimaryButton>
      </div>
    </motion.div>
  );
};

export default MentorHeroCard;
