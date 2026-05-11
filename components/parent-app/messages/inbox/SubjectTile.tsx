// SubjectTile.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Single subject tile. Icon circle (subject-tinted) on start side, subject
// name (AR primary, EN sub) + teacher's first name. Unread badge on end side.

import React from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import {
  SUBJECT_STYLES,
  type MockContact,
  type SubjectKey,
} from '../data/parentAppContactsMock';

interface Props {
  contact: MockContact;
  subject: SubjectKey;
  unread: number;
  onOpen: (contactId: string) => void;
}

export const SubjectTile: React.FC<Props> = ({
  contact,
  subject,
  unread,
  onOpen,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);
  const style = SUBJECT_STYLES[subject];

  const subjectArKey = `parentApp.messages.subjects.${subject}`;
  const subjectEnKey = `parentApp.messages.subjects.${subject}.en`;

  // Teacher's display name — keep the first name only for compactness.
  const teacherFullName = locale === 'ar' ? contact.nameAr : contact.nameEn;
  // Strip honorific prefixes ("الأستاذ ", "الأستاذة ", "Mr. ", "Ms. ", "Dr. ").
  const teacherFirstName = teacherFullName
    .replace(/^(الأستاذة |الأستاذ |د\.\s*|أ\.\s*|Ms\.\s*|Mr\.\s*|Dr\.\s*)/u, '')
    .split(/\s+/)[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(contact.id)}
      className="relative rounded-2xl bg-white border border-slate-100 p-3 flex items-center gap-3 text-start hover:bg-slate-50 active:scale-[0.98] transition-transform shadow-[0_1px_0_0_#E2E8F0]"
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center ${style.bg}`}
        aria-hidden="true"
      >
        <span className="text-lg">{style.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-800 leading-tight truncate">
          {t(subjectArKey)}
        </p>
        <p className="text-[11px] font-bold text-slate-500 truncate">
          {teacherFirstName}
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

export default SubjectTile;
