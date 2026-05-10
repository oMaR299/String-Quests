// DeadlineCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Surfaces the most-urgent upcoming deadline. Color band on the start side
// reflects urgency: green (>7d), amber (2-7d), rose (<2d). Tap → Messages.
// "+N more deadlines" microcopy below when there are extras.

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import {
  daysUntilIso,
  urgencyTone,
  URGENCY_STYLES,
} from '../parentAppMockData';
import { useParentAppContext } from '../useParentAppContext';

export const DeadlineCard: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { state, activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Filter deadlines: school-wide (no childId) always show; child-specific
  // only when they belong to the active child.
  const filtered = state.deadlines.filter((d) => {
    if (!d.childId) return true;
    return d.childId === activeChildId;
  });

  if (filtered.length === 0) return null;

  // Sort by soonest due.
  const sorted = [...filtered].sort((a, b) =>
    daysUntilIso(a.dueIso) - daysUntilIso(b.dueIso)
  );
  const top = sorted[0];
  const days = daysUntilIso(top.dueIso);
  const tone = urgencyTone(days);
  const styles = URGENCY_STYLES[tone];

  let dueLabel: string;
  if (days <= 0) {
    dueLabel = t('parentApp.deadline.dueToday');
  } else if (days === 1) {
    dueLabel = t('parentApp.deadline.dueTomorrow');
  } else {
    dueLabel = interpolate(t('parentApp.deadline.dueIn'), { days });
  }

  const title = locale === 'ar' ? top.titleAr : top.titleEn;
  const moreCount = sorted.length - 1;

  return (
    <button
      type="button"
      onClick={() => navigate('/parent/messages')}
      className="w-full text-start rounded-2xl bg-white/90 backdrop-blur border border-slate-200 overflow-hidden flex hover:bg-white transition-colors active:scale-[0.99]"
    >
      <div className={`w-1.5 shrink-0 ${styles.band}`} aria-hidden="true" />
      <div className="flex-1 p-4 flex gap-3 items-start min-w-0">
        <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${styles.pill}`}>
          <CalendarClock className={`w-5 h-5 ${styles.pillText}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('parentApp.deadline.title')}
          </div>
          <p className="text-sm font-extrabold text-slate-800 leading-snug truncate">{title}</p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${styles.pill} ${styles.pillText}`}>
              {dueLabel}
            </span>
            {moreCount > 0 && (
              <span className="text-[11px] font-bold text-slate-500">
                {interpolate(t('parentApp.deadline.moreLink'), { n: moreCount })}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DeadlineCard;
