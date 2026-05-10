// TomorrowBooksDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "Tomorrow's books" — books only (v1.3). The list is now strictly a roster
// of textbooks for the next school day; water bottles, pencils, PE clothes
// and lunch boxes were removed per the spec. Subject icons drive the row
// glyph and the colored circle; the colors come from the shared
// SUBJECT_STYLES map so book rows feel like first-class siblings of the
// assignment + exam rows.
//
// Tappable checkbox per book — parents still mark off what's already in the
// bag. When all books are packed the bottom CTA flips to a green "All
// packed!" pill and a small confetti burst plays (skipped under
// reduced-motion).
//
// "Tomorrow" respects Jordan's Fri-Sat weekend:
//   getDay() | label
//   Sun (0)  | next day (Mon)
//   Mon (1)  | next day (Tue)
//   Tue (2)  | next day (Wed)
//   Wed (3)  | next day (Thu)
//   Thu (4)  | Sunday  (skip Fri+Sat)
//   Fri (5)  | Sunday  (skip Sat)
//   Sat (6)  | Sunday  (next day)
// We surface the day-of-week name in the header so it's clear when not "غداً".
//
// v1.2 — single-child only. Multi-child aggregate mode was removed.
// v1.3 — books only; subject icons replace generic emoji glyphs.

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, BookOpen, Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  getTomorrowBooks,
  getNextSchoolDay,
  getDayOfWeekLabel,
  SUBJECT_STYLES,
  type PackItem,
} from '../data/parentAppSchoolMockData';
import { AVATAR_STYLES, type ChildAvatarColor } from '../parentAppMockData';
import { useParentAppContext } from '../useParentAppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Forwarded to BottomSheet — enables horizontal swipe between drawers. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

interface PackListProps {
  childId: string;
  childName: string;
  childAvatarColor: ChildAvatarColor;
  childInitial: string;
  items: PackItem[];
  packed: Record<string, boolean>;
  onToggle: (itemId: string) => void;
  showHeader: boolean;
  todayIsThursdayOrLater: boolean;
  dayLabel: string;
}

const PackList: React.FC<PackListProps> = ({
  childId,
  childName,
  childAvatarColor,
  childInitial,
  items,
  packed,
  onToggle,
  showHeader,
  todayIsThursdayOrLater,
  dayLabel,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const total = items.length;
  const packedCount = items.filter((i) => packed[i.id]).length;
  const allPacked = packedCount === total && total > 0;

  const avatarStyle = AVATAR_STYLES[childAvatarColor];

  // Header copy: if today is Thu/Fri/Sat, weekend is involved → use "Sunday's"
  // phrasing rather than "tomorrow"
  const headerKey = todayIsThursdayOrLater
    ? 'parentApp.school.books.headerNext'
    : 'parentApp.school.books.headerOne';
  const headerCopy = interpolate(t(headerKey), { day: dayLabel, name: childName });

  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex items-center gap-3 pt-1">
          <div
            className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${avatarStyle.bg} ${avatarStyle.text} ${avatarStyle.shadow}`}
          >
            <span className="text-base font-black">{childInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-slate-800 leading-tight">
              {headerCopy}
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              {interpolate(t('parentApp.school.books.booksCount'), { n: total })}
            </div>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((item) => {
          const isPacked = !!packed[item.id];
          const title = locale === 'ar' ? item.titleAr : item.titleEn;
          // Subject style drives the colored book glyph circle. Falls back to
          // a neutral slate disc if a book row somehow lacks a subject hint.
          const subjectStyle = item.subject ? SUBJECT_STYLES[item.subject] : null;
          return (
            <li key={`${childId}-${item.id}`}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={isPacked}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.99] ${
                  isPacked
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <motion.div
                  initial={false}
                  animate={
                    reduceMotion
                      ? { scale: 1 }
                      : { scale: isPacked ? [1, 1.15, 1] : 1 }
                  }
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                  className={`w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${
                    isPacked
                      ? 'bg-emerald-500 text-white shadow-[0_2px_0_0_#059669]'
                      : 'bg-slate-100 text-transparent border border-slate-200'
                  }`}
                  aria-hidden="true"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                </motion.div>
                {subjectStyle ? (
                  <span
                    className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 text-base font-black ${subjectStyle.iconBg} ${subjectStyle.iconText}`}
                    aria-hidden="true"
                  >
                    {subjectStyle.glyph}
                  </span>
                ) : (
                  <span
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 bg-slate-100 text-slate-500"
                    aria-hidden="true"
                  >
                    <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                )}
                <span
                  className={`flex-1 text-start text-sm font-extrabold leading-tight ${
                    isPacked ? 'text-slate-500 line-through' : 'text-slate-800'
                  }`}
                >
                  {title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom CTA */}
      <div
        className={`relative rounded-2xl px-4 py-3 flex items-center justify-between border transition-colors ${
          allPacked
            ? 'bg-emerald-500 border-emerald-600'
            : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div
          className={`text-sm font-extrabold ${
            allPacked ? 'text-white' : 'text-slate-700'
          }`}
        >
          {allPacked
            ? t('parentApp.school.books.allPacked')
            : t('parentApp.school.books.cta')}
        </div>
        <div
          className={`text-xs font-extrabold ${
            allPacked ? 'text-white/90' : 'text-slate-500'
          }`}
        >
          {interpolate(t('parentApp.school.books.packedCount'), {
            packed: packedCount,
            total,
          })}
        </div>

        {/* Confetti */}
        <AnimatePresence>
          {allPacked && !reduceMotion && (
            <>
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: 0, x: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.6],
                    y: [-10 - i * 4, -30 - i * 6],
                    x: [(i - 2) * 14, (i - 2) * 24],
                    rotate: i * 60,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, delay: i * 0.04 }}
                  className="absolute top-2 start-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" strokeWidth={3} />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Body-only renderer used by SchoolLogisticsStrip's shared BottomSheet (Fix 2).
 *
 * Note: this drops the `open` reset for `packed` state (since the parent
 * BottomSheet stays mounted across drawer swipes). Instead the packing state
 * resets when the component itself mounts — and it does mount fresh whenever
 * the user navigates to/away from this drawer in the swipe sequence (because
 * the strip keys content on the active drawer key).
 */
export const TomorrowBooksDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const { state, activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Determine which child(ren) to show — single-child mode means at most one.
  const childrenToShow = useMemo(() => {
    const c = state.children.find((c) => c.id === activeChildId);
    return c ? [c] : [];
  }, [activeChildId, state.children]);

  // Today + next school day
  const today = useMemo(() => new Date(), []);
  const next = useMemo(() => getNextSchoolDay(today), [today]);
  const todayIsThursdayOrLater =
    today.getDay() === 4 || today.getDay() === 5 || today.getDay() === 6;
  const dayLabel = getDayOfWeekLabel(next, locale);

  // Per-child item lists
  const childItems = useMemo(() => {
    const map: Record<string, PackItem[]> = {};
    for (const c of childrenToShow) {
      map[c.id] = getTomorrowBooks(c.id, today);
    }
    return map;
  }, [childrenToShow, today]);

  // Per-child packing state. Reset on mount (the parent strip remounts this
  // content fresh whenever the active drawer changes — see Fix 2).
  const [packed, setPacked] = useState<Record<string, Record<string, boolean>>>(
    () => {
      const fresh: Record<string, Record<string, boolean>> = {};
      for (const c of childrenToShow) {
        fresh[c.id] = {};
      }
      return fresh;
    }
  );

  // If the active child changes mid-session, reset packing state so we
  // don't bleed checkboxes from another kid.
  useEffect(() => {
    const fresh: Record<string, Record<string, boolean>> = {};
    for (const c of childrenToShow) {
      fresh[c.id] = {};
    }
    setPacked(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId]);

  const togglePacked = useCallback((childId: string, itemId: string) => {
    setPacked((prev) => {
      const childMap = { ...(prev[childId] ?? {}) };
      childMap[itemId] = !childMap[itemId];
      return { ...prev, [childId]: childMap };
    });
  }, []);

  const showPerChildHeaders = childrenToShow.length > 1;

  if (childrenToShow.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
        <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-500">
          {t('parentApp.school.books.cta')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showPerChildHeaders && (
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 -mb-1">
          {t('parentApp.school.books.allKidsHeader')}
        </div>
      )}
      {childrenToShow.map((child) => {
        const items = childItems[child.id] ?? [];
        const childName = locale === 'ar' ? child.nameAr : child.nameEn;
        return (
          <PackList
            key={child.id}
            childId={child.id}
            childName={childName}
            childAvatarColor={child.avatarColor}
            childInitial={child.avatarInitial}
            items={items}
            packed={packed[child.id] ?? {}}
            onToggle={(itemId) => togglePacked(child.id, itemId)}
            showHeader
            todayIsThursdayOrLater={todayIsThursdayOrLater}
            dayLabel={dayLabel}
          />
        );
      })}
    </div>
  );
};

/**
 * Standalone wrapper — kept for back-compat. SchoolLogisticsStrip uses
 * `TomorrowBooksDrawerContent` inside its shared BottomSheet.
 */
export const TomorrowBooksDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.books.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.books.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="tomorrow-books"
    >
      <TomorrowBooksDrawerContent />
    </BottomSheet>
  );
};

export default TomorrowBooksDrawer;
