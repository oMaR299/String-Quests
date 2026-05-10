// HomeFooter.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Small, demoted footer at the bottom of the Home card stack. Two pieces:
//
//   1. Freshness line — "Last synced X ago" + tiny refresh button (bumps the
//      lastUpdatedAt context).
//   2. Privacy reminder — "Your data is private. Manage sharing" (with a tiny
//      lock icon). The "Manage sharing" link is a no-op in v1.1 (logs to
//      console).
//
// Style: centered, no card chrome, just text + small icons. Sits at the very
// bottom of Home, above the bottom tab bar.

import React, { useCallback } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';

/**
 * Format an ISO timestamp into a human-readable "X ago" duration using the
 * provided i18n keys. Returns the localized duration phrase only — the
 * surrounding "Last synced ___ ago" wrapper lives in the caller.
 */
function formatTimeAgo(
  iso: string,
  now: number,
  t: (key: string) => string
): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return t('parentApp.footer.justNow');
  const diffMs = Math.max(0, now - then);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t('parentApp.footer.justNow');
  if (diffMin === 1) return t('parentApp.footer.minuteAgo');
  if (diffMin < 60) return interpolate(t('parentApp.footer.minutesAgo'), { n: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return t('parentApp.footer.hourAgo');
  return interpolate(t('parentApp.footer.hoursAgo'), { n: diffHr });
}

export const HomeFooter: React.FC = () => {
  const { locale } = useI18n();
  const { state, lastUpdatedAt, bumpLastUpdated } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // The freshness line reads from the seeded ISO timestamp on the mock state,
  // but recomputes against the live `lastUpdatedAt` epoch when refresh fires.
  // First visit: 5-minute-old ISO timestamp from mock data.
  // After first refresh: the live epoch resets to "just now".
  const referenceIso =
    lastUpdatedAt > Date.parse(state.lastUpdatedAt)
      ? new Date(lastUpdatedAt).toISOString()
      : state.lastUpdatedAt;

  const duration = formatTimeAgo(referenceIso, Date.now(), t);
  const lastSyncedText = interpolate(t('parentApp.footer.lastSynced'), { duration });

  const handleRefresh = useCallback(() => {
    bumpLastUpdated();
  }, [bumpLastUpdated]);

  const handleManageSharing = useCallback(() => {
    console.info('manage-sharing tapped');
  }, []);

  return (
    <footer className="pt-2 pb-1 space-y-1.5 text-center" aria-label="Home footer">
      {/* Freshness line */}
      <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold">
        <span>{lastSyncedText}</span>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label={t('parentApp.footer.refreshAria')}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>

      {/* Privacy reminder */}
      <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold">
        <Lock className="w-3 h-3 text-slate-400" strokeWidth={2.5} aria-hidden="true" />
        <span>{t('parentApp.footer.privacy')}</span>
        <button
          type="button"
          onClick={handleManageSharing}
          className="text-slate-500 hover:text-duo-blue underline-offset-2 hover:underline transition-colors"
        >
          {t('parentApp.footer.manageSharing')}
        </button>
      </div>
    </footer>
  );
};

export default HomeFooter;
