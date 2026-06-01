// SchoolLogisticsStrip.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 2x3 grid of glass shortcut buttons that open the six logistics drawers
// (Assignments, Calendar, Tomorrow's bag, Exams, Forms, Attendance). Sits
// directly below the GreetingStrip on the Parent Home tab — the only two
// sections rendered there in v1.3.
//
// JSX order (LTR source order; under dir="rtl" they read right-to-left):
//   ┌──────────────┬──────────────┐
//   │ 1 Assignments│ 2 Calendar   │
//   ├──────────────┼──────────────┤
//   │ 3 Bag        │ 4 Exams      │
//   ├──────────────┼──────────────┤
//   │ 5 Forms      │ 6 Attendance │
//   └──────────────┴──────────────┘
//
// In RTL the visual reading order matches the screenshot:
//   Top:    الواجبات (right)  →  التقويم (left)
//   Middle: حقيبة الغد (right) →  الاختبارات (left)
//   Bottom: النماذج (right)   →  الحضور (left)
//
// Each card: glass surface + colored circle icon + bold AR title + small
// slate-500 subtitle. Optional badge in the top-end corner driven by mock
// data: pending assignments count (red), tomorrow's bag items count (dark
// slate), pending forms count (red), recent absence count (slate or red dot).

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Briefcase,
  ClipboardList,
  UserCheck,
  Bus,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { BottomSheet } from '../drawers/BottomSheet';
import { CalendarDrawerContent } from '../drawers/CalendarDrawer';
import { AssignmentsDrawerContent } from '../drawers/AssignmentsDrawer';
import { ExamsDrawerContent } from '../drawers/ExamsDrawer';
import { TomorrowBooksDrawerContent } from '../drawers/TomorrowBooksDrawer';
import { FormsDrawerContent } from '../drawers/FormsDrawer';
import { AttendanceDrawerContent } from '../drawers/AttendanceDrawer';
import { PickupDrawerContent } from '../drawers/PickupDrawer';
import {
  getPendingAssignmentCount,
  getTomorrowBooks,
  getPendingFormsCount,
  getRecentAbsenceCount,
  hasRecentUnexcusedAbsence,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';

type DrawerKey =
  | 'calendar'
  | 'assignments'
  | 'exams'
  | 'books'
  | 'forms'
  | 'attendance'
  | 'pickup'
  | null;

/**
 * Linear sequence the user steps through when swiping left/right inside an
 * open drawer. Order matches the JSX/grid reading order in RTL:
 *   Assignments → Calendar → Tomorrow's bag → Exams → Forms → Attendance
 * Wraps at the ends (modular indexing, see handleSwipe* below).
 */
const LOGISTICS_SEQUENCE: ReadonlyArray<Exclude<DrawerKey, null>> = [
  'assignments',
  'calendar',
  'books',
  'exams',
  'forms',
  'attendance',
  'pickup',
];

interface ShortcutProps {
  iconNode: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  onClick: () => void;
  index: number;
  /** Tailwind class to control grid span. Static literals only (JIT-safe). */
  spanClass?: string;
}

const Shortcut: React.FC<ShortcutProps> = ({
  iconNode,
  iconBg,
  title,
  subtitle,
  badge,
  onClick,
  index,
  spanClass = '',
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24, delay: index * 0.04 }
      }
      className={`relative w-full text-start rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3 motion-safe:active:scale-[0.98] hover:bg-slate-50 transition-colors ${spanClass}`}
    >
      <div
        className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${iconBg}`}
        aria-hidden="true"
      >
        {iconNode}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-slate-800 leading-tight truncate">
          {title}
        </div>
        <div className="text-[11px] font-bold text-slate-500 leading-tight truncate">
          {subtitle}
        </div>
      </div>
      {badge && (
        <div className="absolute top-2 end-2 pointer-events-none">{badge}</div>
      )}
    </motion.button>
  );
};

export const SchoolLogisticsStrip: React.FC = () => {
  const { locale } = useI18n();
  const { activeChildId, setDrawerOpen, swipeLocked } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const [openDrawer, setOpenDrawer] = useState<DrawerKey>(null);

  // Mirror open/closed state into ParentAppContext so ParentHomeLayout can
  // hide the bottom tab bar while a logistics drawer is open (Fix 1).
  useEffect(() => {
    setDrawerOpen(openDrawer !== null);
    // Cleanup on unmount: ensure tab bar comes back if this strip unmounts
    // while a drawer is somehow still flagged open.
    return () => {
      setDrawerOpen(false);
    };
  }, [openDrawer, setDrawerOpen]);

  // Drawer-to-drawer wrap-around navigation (Fix 2).
  const handleSwipeNext = useCallback(() => {
    setOpenDrawer((current) => {
      if (current === null) return current;
      const idx = LOGISTICS_SEQUENCE.indexOf(current);
      if (idx === -1) return current;
      const nextIdx = (idx + 1) % LOGISTICS_SEQUENCE.length;
      return LOGISTICS_SEQUENCE[nextIdx];
    });
  }, []);

  const handleSwipePrev = useCallback(() => {
    setOpenDrawer((current) => {
      if (current === null) return current;
      const idx = LOGISTICS_SEQUENCE.indexOf(current);
      if (idx === -1) return current;
      const prevIdx =
        (idx - 1 + LOGISTICS_SEQUENCE.length) % LOGISTICS_SEQUENCE.length;
      return LOGISTICS_SEQUENCE[prevIdx];
    });
  }, []);

  // Mock-driven badges (single active child only).
  const pendingCount = useMemo(
    () => getPendingAssignmentCount(activeChildId),
    [activeChildId]
  );
  const todayDate = useMemo(() => new Date(), []);
  const tomorrowItemsCount = useMemo(
    () => getTomorrowBooks(activeChildId, todayDate).length,
    [activeChildId, todayDate]
  );
  const pendingFormsCount = useMemo(
    () => getPendingFormsCount(activeChildId),
    [activeChildId]
  );
  const recentAbsenceCount = useMemo(
    () => getRecentAbsenceCount(activeChildId, 7),
    [activeChildId]
  );
  const recentUnexcused = useMemo(
    () => hasRecentUnexcusedAbsence(activeChildId, 7),
    [activeChildId]
  );

  return (
    <>
      <section
        aria-label={t('parentApp.school.shortcutsLabel')}
        className="grid grid-cols-2 gap-3"
      >
        {/* 1. Assignments — top-right in RTL */}
        <Shortcut
          index={0}
          iconBg="bg-duo-green"
          iconNode={<BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.assignments.title')}
          subtitle={t('parentApp.school.assignments.subtitle')}
          badge={
            pendingCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-black">
                {pendingCount}
              </span>
            ) : null
          }
          onClick={() => setOpenDrawer('assignments')}
        />

        {/* 2. Calendar — top-left in RTL */}
        <Shortcut
          index={1}
          iconBg="bg-duo-blue"
          iconNode={<Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.calendar.title')}
          subtitle={t('parentApp.school.calendar.subtitle')}
          onClick={() => setOpenDrawer('calendar')}
        />

        {/* 3. Tomorrow's bag — middle-right in RTL */}
        <Shortcut
          index={2}
          iconBg="bg-duo-orange"
          iconNode={<Briefcase className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.books.title')}
          subtitle={t('parentApp.school.books.subtitle')}
          badge={
            tomorrowItemsCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-800 text-white text-[11px] font-black">
                {tomorrowItemsCount}
              </span>
            ) : null
          }
          onClick={() => setOpenDrawer('books')}
        />

        {/* 4. Exams — middle-left in RTL */}
        <Shortcut
          index={3}
          iconBg="bg-duo-purple-light"
          iconNode={<GraduationCap className="w-5 h-5 text-duo-purple" strokeWidth={2.5} />}
          title={t('parentApp.school.exams.title')}
          subtitle={t('parentApp.school.exams.subtitle')}
          onClick={() => setOpenDrawer('exams')}
        />

        {/* 5. Forms — bottom-right in RTL */}
        <Shortcut
          index={4}
          iconBg="bg-duo-gold"
          iconNode={<ClipboardList className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.formsTitle')}
          subtitle={t('parentApp.school.formsSubtitle')}
          badge={
            pendingFormsCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-black">
                {pendingFormsCount}
              </span>
            ) : null
          }
          onClick={() => setOpenDrawer('forms')}
        />

        {/* 6. Attendance — bottom-left in RTL */}
        <Shortcut
          index={5}
          iconBg="bg-emerald-500"
          iconNode={<UserCheck className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.attendanceTitle')}
          subtitle={t('parentApp.school.attendanceSubtitle')}
          badge={
            recentUnexcused ? (
              <span
                className="inline-flex w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"
                aria-label="unexcused absence"
              />
            ) : recentAbsenceCount > 0 ? (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-800 text-white text-[11px] font-black">
                {recentAbsenceCount}
              </span>
            ) : null
          }
          onClick={() => setOpenDrawer('attendance')}
        />

        {/* 7. Pickup — spans both columns in row 4. Different visual hierarchy:
            time-sensitive, parents glance at it daily. The `col-span-2` makes
            it the visual anchor of the strip. JIT-safe literal class. */}
        <Shortcut
          index={6}
          iconBg="bg-sky-500"
          iconNode={<Bus className="w-5 h-5 text-white" strokeWidth={2.5} />}
          title={t('parentApp.school.pickup.title')}
          subtitle={t('parentApp.school.pickup.subtitle')}
          onClick={() => setOpenDrawer('pickup')}
          spanClass="col-span-2"
        />
      </section>

      {/* Single shared BottomSheet — body content swaps based on `openDrawer`
          so swipes between the 6 drawers animate horizontally instead of
          dismissing + remounting the whole sheet. (Fix 2 architecture.)
          Title is resolved from the active drawer's keyset; swipe handlers
          are wired only when a drawer is open so taps from the closed state
          don't accidentally trigger them. */}
      <SharedLogisticsSheet
        openDrawer={openDrawer}
        onClose={() => setOpenDrawer(null)}
        // Gate swipe handlers when a sub-mode (e.g. FormsDrawer fill view)
        // has requested a swipe lock — passing `undefined` makes the
        // BottomSheet drop the drag affordance + chevrons cleanly.
        onSwipeNext={swipeLocked ? undefined : handleSwipeNext}
        onSwipePrev={swipeLocked ? undefined : handleSwipePrev}
      />
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
 * SharedLogisticsSheet — one BottomSheet hosting all 6 drawer bodies.
 * Splits out the title-resolution + content-routing so the strip's main
 * component stays focused on the grid + badge logic.
 * ────────────────────────────────────────────────────────────────────── */

interface SharedLogisticsSheetProps {
  openDrawer: DrawerKey;
  onClose: () => void;
  /** Optional — passing undefined disables swipe affordance + chevrons. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

// Per-drawer title keys + content. Static map (no closures) so the JIT picks
// up everything, and so swapping between drawers is a pure index lookup.
const DRAWER_TITLE_KEYS: Record<Exclude<DrawerKey, null>, string> = {
  assignments: 'parentApp.school.assignments.drawerTitle',
  calendar: 'parentApp.school.calendar.drawerTitle',
  books: 'parentApp.school.books.drawerTitle',
  exams: 'parentApp.school.exams.drawerTitle',
  forms: 'parentApp.school.forms.drawerTitle',
  attendance: 'parentApp.school.attendance.drawerTitle',
  pickup: 'parentApp.school.pickup.drawerTitle',
};

const SharedLogisticsSheet: React.FC<SharedLogisticsSheetProps> = ({
  openDrawer,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  // Pin the last non-null drawer key so we keep rendering the previous title
  // and content during the slide-down close animation. Without this, the
  // sheet would visibly blank out before sliding away.
  const [lastKey, setLastKey] = useState<Exclude<DrawerKey, null>>(
    () => openDrawer ?? 'assignments'
  );
  useEffect(() => {
    if (openDrawer) setLastKey(openDrawer);
  }, [openDrawer]);

  const titleAr = getParentAppString('ar', DRAWER_TITLE_KEYS[lastKey]);
  const titleEn = getParentAppString('en', DRAWER_TITLE_KEYS[lastKey]);

  let body: React.ReactNode = null;
  switch (lastKey) {
    case 'assignments':
      body = <AssignmentsDrawerContent />;
      break;
    case 'calendar':
      body = <CalendarDrawerContent />;
      break;
    case 'books':
      body = <TomorrowBooksDrawerContent />;
      break;
    case 'exams':
      body = <ExamsDrawerContent />;
      break;
    case 'forms':
      body = <FormsDrawerContent />;
      break;
    case 'attendance':
      body = <AttendanceDrawerContent />;
      break;
    case 'pickup':
      body = <PickupDrawerContent />;
      break;
  }

  return (
    <BottomSheet
      open={openDrawer !== null}
      onClose={onClose}
      titleAr={titleAr}
      titleEn={titleEn}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey={lastKey}
    >
      {body}
    </BottomSheet>
  );
};

export default SchoolLogisticsStrip;
