// BottomSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable bottom-sheet primitive used by every drawer in the parent-app
// home (Calendar, Assignments, Exams, Tomorrow's Books, Forms, Attendance,
// AddChild).
//
// Design notes:
//   • Slides up from the bottom of the 430px phone shell. On desktop where
//     the phone shell is centered, the sheet is constrained to max-w-[430px]
//     and centered horizontally so it stays "inside" the device frame.
//   • Backdrop tap + Escape key both close it.
//   • Body scroll is locked while open — toggling document.body.style.overflow.
//   • Reduced-motion: fades instead of sliding.
//   • A drag-handle pill at the top suggests draggability. We don't actually
//     wire vertical drag-to-close in v1.x; the visual hint is enough.
//   • Header has a centered title (AR or EN) plus an absolute close X button
//     placed at the inline-end (RTL-safe via end-3 logical class).
//   • Body is scrollable with overscroll-contain so iOS rubber-banding stays
//     inside the sheet.
//
// Fix 1 (drawer content was clipped by tab bar):
//   • Resolved at the layout level — `ParentHomeLayout` removes the tab bar
//     while `isDrawerOpen` is true. We additionally bumped z-index up
//     (z-[200] sheet / z-[199] backdrop) so we sit cleanly above any future
//     tab-bar implementation.
//
// Fix 2 (swipe between the 6 logistics drawers):
//   • Optional `onSwipeNext` / `onSwipePrev` callbacks. When BOTH provided:
//       – Body content gets a horizontal drag (drag="x", elasticity 0.2).
//       – Threshold = 60px OR velocity > 500 px/s → fires next/prev.
//       – Direction is RTL-aware: in RTL, swipe LEFT (offset.x < 0) = next;
//         in LTR, swipe RIGHT (offset.x > 0) = next. (Both cases: swipe in
//         the natural reading-flow direction = forward.)
//       – Title row shows small chevron buttons that tap = same as swipe.
//       – Content swap uses AnimatePresence keyed on `transitionKey` so old
//         content slides out + new slides in. Reduced motion → instant swap.
//   • When neither callback is provided: NO drag, NO chevrons, NO key-based
//     re-mounts. Backwards-compatible (AddChildSheet stays as-is).
//   • The vertical drag-to-close gesture (none today) MUST NOT collide —
//     drag axis is locked to "x" only.

import React, { useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';

export interface BottomSheetProps {
  /** Open / closed. Mounting the sheet itself is handled by AnimatePresence. */
  open: boolean;
  /** Called by backdrop tap, Escape key, and the close X. */
  onClose: () => void;
  /** Single-locale fallback if the caller already resolved the title. */
  title?: string;
  /** Pre-localized title; if both `titleAr` & `titleEn` set, used per locale. */
  titleAr?: string;
  titleEn?: string;
  /** Body content. Rendered inside the scrollable area. */
  children: React.ReactNode;
  /** Optional aria label override for the close button. */
  closeAriaLabel?: string;
  /**
   * When provided alongside `onSwipePrev`, the sheet body becomes
   * horizontally swipeable and chevron buttons appear in the title row.
   * Wraps around at the ends — caller decides the cycle.
   */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
  /**
   * Identity key for the current "page" of content. When this changes (and
   * swipe handlers are wired), the body content slides out + the new slides
   * in. The title row's title also key-fades when this changes.
   */
  transitionKey?: string;
}

// Distance in px the user must drag past for a swipe to register.
const SWIPE_DISTANCE_THRESHOLD = 60;
// Velocity (px/s) above which a fast flick counts as a swipe regardless of
// distance traveled.
const SWIPE_VELOCITY_THRESHOLD = 500;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  titleAr,
  titleEn,
  children,
  closeAriaLabel,
  onSwipeNext,
  onSwipePrev,
  transitionKey,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Resolve the title — prefer locale-specific if both are provided.
  let resolvedTitle: string;
  if (titleAr && titleEn) {
    resolvedTitle = locale === 'ar' ? titleAr : titleEn;
  } else if (title) {
    resolvedTitle = title;
  } else {
    resolvedTitle = '';
  }

  // Whether swipe affordance is active for this sheet instance.
  const swipeEnabled = !!(onSwipeNext && onSwipePrev);

  // Track the direction of the last navigation so the slide-in matches:
  // 1 = moved forward (next), -1 = moved backward (prev). Used to drive the
  // initial-x offset of the new content's mount animation.
  const lastDirRef = useRef<1 | -1>(1);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock while sheet is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ── Swipe handlers ───────────────────────────────────────────────────────
  // RTL: natural reading flow is right→left, so swiping LEFT = NEXT.
  // LTR: natural reading flow is left→right, so swiping RIGHT = NEXT.

  const goNext = () => {
    if (!onSwipeNext) return;
    lastDirRef.current = 1;
    onSwipeNext();
  };

  const goPrev = () => {
    if (!onSwipePrev) return;
    lastDirRef.current = -1;
    onSwipePrev();
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!swipeEnabled) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const passedDistance = Math.abs(offset) >= SWIPE_DISTANCE_THRESHOLD;
    const passedVelocity = Math.abs(velocity) >= SWIPE_VELOCITY_THRESHOLD;
    if (!passedDistance && !passedVelocity) return; // snap back via dragElastic

    if (dir === 'rtl') {
      // RTL: leftward (negative offset) → next; rightward → prev
      if (offset < 0) goNext();
      else goPrev();
    } else {
      // LTR: rightward (positive offset) → next; leftward → prev
      if (offset > 0) goNext();
      else goPrev();
    }
  };

  // Slide-in offset for new content based on last direction. In RTL the
  // forward direction is leftward, so new content should enter from the
  // right (positive x); in LTR, from the left (negative x).
  const enterX =
    dir === 'rtl'
      ? lastDirRef.current === 1
        ? 80
        : -80
      : lastDirRef.current === 1
        ? -80
        : 80;
  const exitX = -enterX;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — z-[199] sits below the sheet but above any tab bar
              (which we additionally hide via context, see Fix 1). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="fixed inset-0 z-[199] bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={resolvedTitle}
            dir={dir}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { y: '100%' }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { y: 0 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { y: '100%' }
            }
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 220, damping: 22 }
            }
            className="fixed inset-x-0 bottom-0 z-[200] mx-auto max-w-[430px] bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl font-cairo"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag-handle pill */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div
                className="w-12 h-1 rounded-full bg-slate-300"
                aria-hidden="true"
              />
            </div>

            {/* Header: title (key-fades when transitionKey changes) + chevrons
                + close button. The chevrons only render when swipe is wired
                so plain sheets like AddChildSheet are unaffected. */}
            <div className="relative px-4 pt-2 pb-3 shrink-0">
              {swipeEnabled && (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label={getParentAppString(
                    locale,
                    'parentApp.sheet.prevDrawerAria'
                  )}
                  className="absolute start-12 top-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-500"
                >
                  <ChevronLeft
                    className="w-4 h-4 rtl:rotate-180"
                    strokeWidth={2.5}
                  />
                </button>
              )}

              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={transitionKey ?? resolvedTitle}
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.16 }
                  }
                  className="text-center text-base font-black text-slate-800"
                >
                  {resolvedTitle}
                </motion.h2>
              </AnimatePresence>

              {swipeEnabled && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={getParentAppString(
                    locale,
                    'parentApp.sheet.nextDrawerAria'
                  )}
                  className="absolute end-12 top-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-500"
                >
                  <ChevronRight
                    className="w-4 h-4 rtl:rotate-180"
                    strokeWidth={2.5}
                  />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label={
                  closeAriaLabel ?? (locale === 'ar' ? 'إغلاق' : 'Close')
                }
                className="absolute end-3 top-1.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Body — scrollable. ALWAYS wrap in the same AnimatePresence +
                motion.div structure so that toggling swipe (e.g. when the
                Forms drawer enters fill mode and locks horizontal swipe)
                does NOT change the React tree shape. If we re-shaped the
                tree, `children` would remount and FormsDrawerContent's
                local `mode='fill'` state would reset to `mode='list'`,
                making the drawer appear to close instantly on tap.
                Drag behavior is gated by `swipeEnabled`; the wrapper
                structure stays stable across mode toggles. */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
              <AnimatePresence mode="wait" initial={false} custom={lastDirRef.current}>
                <motion.div
                  key={transitionKey ?? 'sheet-body'}
                  drag={swipeEnabled ? 'x' : false}
                  dragConstraints={swipeEnabled ? { left: 0, right: 0 } : undefined}
                  dragElastic={swipeEnabled ? 0.2 : 0}
                  onDragEnd={swipeEnabled ? handleDragEnd : undefined}
                  initial={
                    !swipeEnabled
                      ? false
                      : reduceMotion
                        ? { opacity: 0 }
                        : { x: enterX, opacity: 0 }
                  }
                  animate={{ x: 0, opacity: 1 }}
                  exit={
                    !swipeEnabled
                      ? { opacity: 0 }
                      : reduceMotion
                        ? { opacity: 0 }
                        : { x: exitX, opacity: 0 }
                  }
                  transition={
                    !swipeEnabled || reduceMotion
                      ? { duration: 0.12 }
                      : { type: 'spring', stiffness: 280, damping: 30 }
                  }
                  // touch-pan-y so vertical scroll inside the body still
                  // works — only horizontal pans are captured by drag (and
                  // only when swipe is enabled).
                  style={{ touchAction: 'pan-y' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
