// ParentTabBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom 5-tab bar. Sticky to bottom with safe-area-inset-bottom padding.
//
// Active tab: filled icon + duo-blue text. Inactive: outlined icon + slate-500.
// Tap → React Router navigate to the tab's route (no transition between tabs;
// the layout owns the chrome so tab swap is a content-only re-render).
//
// Order in source (LTR): Home / Aware AI / Skill Map / Profile / Messages.
// In RTL the row visually flips because we use a plain `flex-row` — DOM
// order stays the same, and the user reads right-to-left so "Home" lands at
// the start side.

import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Network, User, MessageCircle } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { getParentAppString } from './parentAppI18n';
import { useParentAppContext } from './useParentAppContext';

interface TabDef {
  id: string;
  route: string;
  labelKey: string;
  icon: React.ElementType;
  /** When true, draw a small unread dot on the icon. */
  showUnreadDot?: 'messages';
}

const TABS: ReadonlyArray<TabDef> = [
  { id: 'home',     route: '/parent/home',      labelKey: 'parentApp.tab.home',     icon: Home },
  { id: 'awareAi',  route: '/parent/aware-ai',  labelKey: 'parentApp.tab.awareAi',  icon: Sparkles },
  { id: 'skillMap', route: '/parent/skill-map', labelKey: 'parentApp.tab.skillMap', icon: Network },
  { id: 'profile',  route: '/parent/profile',   labelKey: 'parentApp.tab.profile',  icon: User },
  { id: 'messages', route: '/parent/messages',  labelKey: 'parentApp.tab.messages', icon: MessageCircle, showUnreadDot: 'messages' },
];

export const ParentTabBar: React.FC = () => {
  const location = useLocation();
  const { locale } = useI18n();
  const { state } = useParentAppContext();

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const messagesUnread =
    state.announcements.filter((a) => a.unread).length +
    state.messages.filter((m) => m.unread).length;

  return (
    <nav
      className="bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="tablist"
      aria-label={t('parentApp.tab.home')}
    >
      <div className="flex items-stretch h-14">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = location.pathname === tab.route;
          const showDot = tab.showUnreadDot === 'messages' && messagesUnread > 0;
          const label = t(tab.labelKey);

          return (
            <Link
              key={tab.id}
              to={tab.route}
              role="tab"
              aria-selected={active}
              aria-label={label}
              title={label}
              className={
                active
                  ? 'flex-1 flex items-center justify-center text-duo-blue transition-colors min-h-[48px]'
                  : 'flex-1 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors min-h-[48px]'
              }
            >
              <span className="relative inline-flex">
                <Icon
                  className="w-7 h-7"
                  strokeWidth={active ? 2.5 : 2}
                  // Active state gets a softer "filled" feel via the
                  // currentColor + heavier stroke weight; labels are kept off
                  // the bar to keep it iconography-only per the design ask.
                />
                {showDot && (
                  <span
                    className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-duo-red border-2 border-white"
                    aria-hidden="true"
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ParentTabBar;
