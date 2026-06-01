// TodaysPickupCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Compact "Today's pickup" live-status card on Home. Sits ABOVE the
// SchoolLogisticsStrip so the parent doesn't have to drill into the
// pickup drawer to know if their kid boarded the bus yet. Hides on
// weekends + when there's no seeded data for today.
//
// Tap anywhere → opens the standalone PickupDrawer (separate from the
// shared logistics sheet — both surfaces share state via the hook + the
// `parent-app-pickup-v1` localStorage slice).
//
// Live status: the hook auto-advances boarded → en-route → arrived during
// the pickup window. We add a subtle animate-pulse dot on the active
// state. Reduced motion → dot is static, status text is the same.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bus, Car, Footprints, Sun, ChevronRight } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import {
  isSchoolDayToday,
  type PickupMethod,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';
import { usePickupForChild, formatTime } from '../hooks/usePickupForChild';
import { PickupDrawer } from '../drawers/PickupDrawer';

const METHOD_ICON: Record<PickupMethod, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  bus: Bus,
  parent: Car,
  walk: Footprints,
  aftercare: Sun,
};

const METHOD_TONE: Record<PickupMethod, { bg: string; text: string }> = {
  bus: { bg: 'bg-duo-blue', text: 'text-white' },
  parent: { bg: 'bg-duo-green', text: 'text-white' },
  walk: { bg: 'bg-duo-orange', text: 'text-white' },
  aftercare: { bg: 'bg-duo-purple', text: 'text-white' },
};

export const TodaysPickupCard: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { activeChildId, setDrawerOpen } = useParentAppContext();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const { todayPickup } = usePickupForChild(activeChildId);

  // Cache "is school day today" once per day (avoid re-computing every render).
  // Keyed on the date string so the card hides automatically when the user
  // crosses midnight while the app is open.
  const isSchoolDay = useMemo(() => {
    const today = new Date();
    // Memo key is implicit — useMemo runs on every render but `today.getDay()`
    // is cheap enough; we only need this to gate the early return.
    return isSchoolDayToday(today);
  }, []);

  const [drawerOpen, setLocalDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setLocalDrawerOpen(true);
    setDrawerOpen(true);
  }, [setDrawerOpen]);
  const closeDrawer = useCallback(() => {
    setLocalDrawerOpen(false);
    setDrawerOpen(false);
  }, [setDrawerOpen]);

  // Hide on weekends + when no seed exists for today.
  if (!isSchoolDay || !todayPickup) return null;

  const method = todayPickup.details.method;
  const Icon = METHOD_ICON[method];
  const tone = METHOD_TONE[method];

  // Resolve the status line into a single locale-aware string. For bus +
  // boarded/en-route, append the timestamp. For arrived, show the arrival
  // time + a green tone.
  const eventByKind = new Map<string, string>(
    todayPickup.events.map((e) => [e.kind, e.timeIso] as const)
  );

  let statusLine: string;
  let statusTone: 'pending' | 'active' | 'done' = 'pending';
  switch (todayPickup.status) {
    case 'not-yet':
      statusLine = t('parentApp.school.pickup.status.notYet');
      statusTone = 'pending';
      break;
    case 'boarded': {
      const time = formatTime(eventByKind.get('boarded'));
      const label =
        method === 'bus'
          ? t('parentApp.school.pickup.status.boarded')
          : t('parentApp.school.pickup.status.boardedParent');
      statusLine = `${label}${time ? ` · ${time}` : ''}`;
      statusTone = 'active';
      break;
    }
    case 'en-route':
      statusLine = t('parentApp.school.pickup.status.enRoute');
      statusTone = 'active';
      break;
    case 'arrived': {
      const time = formatTime(eventByKind.get('arrived'));
      statusLine = `${t('parentApp.school.pickup.status.arrived')}${time ? ` · ${time}` : ''}`;
      statusTone = 'done';
      break;
    }
    case 'cancelled':
      statusLine = t('parentApp.school.pickup.status.cancelled');
      statusTone = 'pending';
      break;
  }

  // ETA line — only when we have a typical arrival + we haven't arrived yet.
  const etaLine =
    todayPickup.status !== 'arrived' &&
    todayPickup.status !== 'cancelled' &&
    todayPickup.details.busTypicalArrival
      ? interpolate(t('parentApp.school.pickup.eta'), {
          time: todayPickup.details.busTypicalArrival,
        })
      : null;

  const dotClass =
    statusTone === 'done'
      ? 'bg-duo-green'
      : statusTone === 'active'
        ? `bg-duo-blue ${reduceMotion ? '' : 'motion-safe:animate-pulse'}`
        : 'bg-slate-300';

  return (
    <>
      <motion.button
        type="button"
        onClick={openDrawer}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 240, damping: 24 }
        }
        className="w-full text-start rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3 motion-safe:active:scale-[0.99] hover:bg-slate-50 transition-colors"
        aria-label={`${t('parentApp.school.pickup.title')} — ${statusLine}`}
      >
        <div
          className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${tone.bg} ${tone.text}`}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}
              aria-hidden="true"
            />
            <span className="text-sm font-black text-slate-800 leading-tight truncate">
              {statusLine}
            </span>
          </div>
          {etaLine && (
            <div className="text-[11px] font-bold text-slate-500 leading-tight mt-0.5 truncate tabular-nums">
              {etaLine}
            </div>
          )}
        </div>
        <ChevronRight
          className="w-4 h-4 text-slate-400 shrink-0 rtl:rotate-180"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="sr-only" aria-live="polite">
          {statusLine}
        </span>
      </motion.button>

      <PickupDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
};

export default TodaysPickupCard;
