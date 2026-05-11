// ThreadHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sticky header inside ThreadView. Back button + avatar + name/role + status
// + kebab menu.
//
// The kebab menu is a tiny popover with three no-op (mock) actions: mute,
// archive, view profile. Closes on outside click or Escape.

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, BellOff, Archive, User } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { AVATAR_STYLES } from '../../parentAppMockData';
import type { MockContact } from '../data/parentAppContactsMock';

interface Props {
  contact: MockContact;
  onBack: () => void;
}

export const ThreadHeader: React.FC<Props> = ({ contact, onBack }) => {
  const { locale, dir } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const avatar = AVATAR_STYLES[contact.avatarColor === 'slate' ? 'duo-blue' : contact.avatarColor];
  const avatarBg = contact.avatarColor === 'slate' ? 'bg-slate-400' : avatar.bg;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const statusDot =
    contact.onlineStatus === 'online'
      ? 'bg-emerald-500'
      : contact.onlineStatus === 'busy'
        ? 'bg-amber-500'
        : 'bg-slate-300';

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="flex items-center gap-2.5 h-14 px-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('parentApp.messages.thread.backAria')}
          className="shrink-0 w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft
            className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>

        <div
          className={`shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center ${avatarBg} text-white`}
          aria-hidden="true"
        >
          <span className="text-sm font-black">{contact.avatarInitial}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 leading-tight truncate">
            {locale === 'ar' ? contact.nameAr : contact.nameEn}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot}`}
              aria-hidden="true"
            />
            <span className="truncate">
              {t(`parentApp.messages.roles.${contact.role}`)}
            </span>
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t('parentApp.messages.thread.menuAria')}
            aria-expanded={menuOpen}
            className="w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center active:scale-95 transition-transform"
          >
            <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
          </button>
          {menuOpen && (
            <ul
              role="menu"
              className="absolute top-full end-1 mt-1 min-w-[180px] rounded-2xl bg-white border border-slate-100 shadow-lg py-1 z-30"
            >
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-start text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <BellOff
                    className="w-4 h-4 text-slate-500"
                    strokeWidth={2.5}
                  />
                  <span>{t('parentApp.messages.thread.menuMute')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-start text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <Archive
                    className="w-4 h-4 text-slate-500"
                    strokeWidth={2.5}
                  />
                  <span>{t('parentApp.messages.thread.menuArchive')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-start text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <User className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                  <span>{t('parentApp.messages.thread.menuProfile')}</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default ThreadHeader;
