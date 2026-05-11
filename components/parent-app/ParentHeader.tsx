// ParentHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sticky top chrome for the Parent App. Glass background, three slots:
//
//   [ avatar ]   [ scrollable child pills ]   [ refresh + bell ]
//
// The bell shows a red-dot badge when unread > 0 (announcements + messages
// + deadlines, summed). Tapping it routes to /parent/messages. The refresh
// icon is the v1 manual-refresh affordance — tapping it shows a 600ms spinner
// then bumps the lastUpdatedAt timestamp via the parent-app context (a tiny
// "Updated just now" microcopy under the hero card reads off this).
//
// We deliberately render the avatar as a no-op in v1 (per plan §Risks #2 it
// could open a profile drawer in v2). The component lives inside PhoneShell
// using `fullBleedChrome` so we draw our own sticky border + blur.

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { getParentAppString } from './parentAppI18n';
import { useParentAppContext } from './useParentAppContext';
import { ChildPills } from './ChildPills';
import { useMessageThreads } from './messages/hooks/useMessageThreads';
import { useAnnouncements } from './messages/hooks/useAnnouncements';

export const ParentHeader: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { state, bumpLastUpdated } = useParentAppContext();
  const { unreadCount: inboxUnread } = useMessageThreads();
  const { unreadCount: announcementsUnread } = useAnnouncements();
  const reduceMotion = useReducedMotion();
  const [refreshing, setRefreshing] = useState(false);

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Combined unread for the bell badge: Messages module (Inbox + Announcements).
  const unreadCount = inboxUnread + announcementsUnread;

  const handleBell = useCallback(() => {
    navigate('/parent/messages');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      bumpLastUpdated();
      setRefreshing(false);
    }, 600);
  }, [refreshing, bumpLastUpdated]);

  return (
    <header
      className="w-full bg-white/85 backdrop-blur border-b border-slate-200"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-3 h-14 px-3">
        {/* Avatar — start side. v1 no-op tap. */}
        <button
          type="button"
          aria-label={t('parentApp.header.profileAria')}
          className="shrink-0 w-10 h-10 rounded-full bg-duo-green inline-flex items-center justify-center shadow-[0_2px_0_0_#4CAD00] active:translate-y-[1px] active:shadow-none transition-transform duration-100"
        >
          <span className="text-base font-black text-white">{state.parentInitial}</span>
        </button>

        {/* Pills — center, fills remaining space, scrolls horizontally. */}
        <div className="flex-1 min-w-0">
          <ChildPills />
        </div>

        {/* Refresh + Bell — end side. */}
        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            onClick={handleRefresh}
            aria-label={t('parentApp.header.refreshNow')}
            disabled={refreshing}
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center transition-colors active:scale-95 disabled:opacity-60"
          >
            <motion.span
              animate={refreshing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
              transition={
                refreshing && !reduceMotion
                  ? { duration: 0.6, ease: 'linear', repeat: 0 }
                  : { duration: 0 }
              }
              className="inline-flex"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.span>
          </button>

          <button
            type="button"
            onClick={handleBell}
            aria-label={t('parentApp.header.notificationsAria')}
            className="relative w-10 h-10 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center transition-colors active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full bg-duo-red border-2 border-white"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ParentHeader;
