// CalendarDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Hand-rolled month-view calendar that lives inside a BottomSheet. No new
// deps — uses native Date math.
//
// Layout:
//   [Header: < April 2026 >]
//   [Mon Tue Wed Thu Fri Sat Sun]   <-- DOW row
//   [grid of 6 weeks * 7 days]
//   <selected day events list>
//
// Today is the day that matches `new Date()` — we render it inside a duo-blue
// pill. Days with at least one school event get a small colored dot under
// the number.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  SCHOOL_EVENTS,
  SUBJECT_STYLES,
  type SchoolEvent,
} from '../data/parentAppSchoolMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Forwarded to BottomSheet — enables horizontal swipe between drawers. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function buildIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Body-only renderer used by SchoolLogisticsStrip's shared BottomSheet (Fix 2).
 */
export const CalendarDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Today (immutable per render)
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(
    () => buildIso(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  // Cursor month — initialized to current month
  const [cursorYear, setCursorYear] = useState(() => today.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(() => today.getMonth());

  // Selected day for the events list. Default to today.
  const [selectedIso, setSelectedIso] = useState<string>(todayIso);

  // Per-month events lookup
  const monthEventsByIso = useMemo(() => {
    const map: Record<string, SchoolEvent[]> = {};
    for (const ev of SCHOOL_EVENTS) {
      const d = new Date(ev.dateIso);
      if (d.getFullYear() === cursorYear && d.getMonth() === cursorMonth) {
        if (!map[ev.dateIso]) map[ev.dateIso] = [];
        map[ev.dateIso].push(ev);
      }
    }
    return map;
  }, [cursorYear, cursorMonth]);

  // Selected-day events (could be from any month)
  const selectedDayEvents = useMemo(
    () => SCHOOL_EVENTS.filter((e) => e.dateIso === selectedIso),
    [selectedIso]
  );

  // Build the 6-week grid
  const grid = useMemo(() => {
    const firstOfMonth = new Date(cursorYear, cursorMonth, 1);
    const startDow = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(cursorYear, cursorMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; iso: string | null }> = [];
    // Leading blanks
    for (let i = 0; i < startDow; i++) cells.push({ day: null, iso: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, iso: buildIso(cursorYear, cursorMonth, d) });
    }
    // Pad to multiple of 7 (so the grid is always rectangular). 6 rows max.
    while (cells.length % 7 !== 0) cells.push({ day: null, iso: null });
    return cells;
  }, [cursorYear, cursorMonth]);

  const goPrev = useCallback(() => {
    if (cursorMonth === 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth((m) => m - 1);
    }
  }, [cursorMonth]);

  const goNext = useCallback(() => {
    if (cursorMonth === 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth((m) => m + 1);
    }
  }, [cursorMonth]);

  const monthLabel = `${t(`parentApp.school.calendar.month.${cursorMonth}`)} ${cursorYear}`;

  return (
    <>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label={t('parentApp.school.calendar.prevMonthAria')}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" strokeWidth={2.5} />
        </button>
        <div className="text-base font-black text-slate-800">{monthLabel}</div>
        <button
          type="button"
          onClick={goNext}
          aria-label={t('parentApp.school.calendar.nextMonthAria')}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" strokeWidth={2.5} />
        </button>
      </div>

      {/* DOW header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-extrabold uppercase text-slate-400 tracking-wider py-1"
          >
            {t(`parentApp.school.calendar.dow.${d}`)}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, idx) => {
          if (!cell.day || !cell.iso) {
            return <div key={`b-${idx}`} className="aspect-square" />;
          }
          const events = monthEventsByIso[cell.iso] ?? [];
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === selectedIso;
          const dotSubject = events[0]?.subject;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedIso(cell.iso!)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-extrabold transition-all active:scale-95 ${
                isToday
                  ? 'bg-duo-blue text-white'
                  : isSelected
                    ? 'bg-duo-blue-light text-duo-blue ring-2 ring-duo-blue/40'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
              }`}
              aria-label={`${cell.day} ${monthLabel}${events.length ? ` — ${events.length} events` : ''}`}
            >
              <span>{cell.day}</span>
              {events.length > 0 && (
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full ${
                    isToday
                      ? 'bg-white'
                      : dotSubject
                        ? SUBJECT_STYLES[dotSubject].dot
                        : 'bg-rose-400'
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div className="mt-5 space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIso}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="space-y-2"
          >
            {selectedDayEvents.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                <CalendarIcon className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-500">
                  {t('parentApp.school.calendar.noEvents')}
                </p>
              </div>
            ) : (
              selectedDayEvents.map((ev) => {
                const subjectStyle = ev.subject ? SUBJECT_STYLES[ev.subject] : null;
                const title = locale === 'ar' ? ev.titleAr : ev.titleEn;
                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl bg-white border border-slate-100 p-3 flex items-start gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 text-base font-black ${
                        subjectStyle ? `${subjectStyle.iconBg} ${subjectStyle.iconText}` : 'bg-slate-200 text-slate-600'
                      }`}
                      aria-hidden="true"
                    >
                      {subjectStyle ? subjectStyle.glyph : '•'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-slate-800 leading-snug">
                        {title}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {locale === 'ar'
                          ? ['عطلة', 'رحلة', 'اختبار', 'اجتماع', 'رياضي', 'احتفال'][
                              ['holiday', 'trip', 'exam', 'meeting', 'sports', 'celebration'].indexOf(ev.kind)
                            ]
                          : ev.kind.charAt(0).toUpperCase() + ev.kind.slice(1)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

/**
 * Standalone wrapper — kept for back-compat. SchoolLogisticsStrip uses
 * `CalendarDrawerContent` inside its shared BottomSheet.
 */
export const CalendarDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.calendar.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.calendar.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="calendar"
    >
      <CalendarDrawerContent />
    </BottomSheet>
  );
};

export default CalendarDrawer;
