// useSlotRects.ts
// Owns two DOMRect registries for hand-rolled drag-over hit testing:
//   1. slotRects : Map<SlotKey, DOMRect>   — class chip targets
//   2. gapRects  : Map<GapKey,  DOMRect>   — break chip targets (between slots)
// Rebuilds rects on scroll/resize (rAF-throttled).

import { useCallback, useEffect, useRef } from 'react';
import type { GapKey, SlotKey } from './scheduleTypes';

export interface GapHit {
  day: number;
  gapIndex: number;
}

export interface SlotRectsApi {
  // ── Slot (class chip) targets ──────────────────────────────────────────
  /** Ref callback — pass to the underlying DOM element of each slot cell. */
  register: (key: SlotKey, el: HTMLElement | null) => void;
  /** Converts viewport coords (info.point.*) → SlotKey it lands in, or null. */
  hitTest: (x: number, y: number) => SlotKey | null;

  // ── Gap (break chip) targets ───────────────────────────────────────────
  /** Ref callback — pass to the underlying DOM element of each gap zone. */
  registerGap: (key: GapKey, el: HTMLElement | null) => void;
  /** Converts viewport coords → { day, gapIndex } the pointer lands in. */
  hitTestGap: (x: number, y: number) => GapHit | null;
  /**
   * Fallback for Break chips that land in the column but miss the thin
   * gap strip: finds the nearest gap within the same day column by
   * comparing the pointer Y to midpoints between registered slot rects.
   * Returns null if no day column contains X.
   */
  hitTestGapNearest: (x: number, y: number) => GapHit | null;

  /** Attach this to the grid root DOM node so scroll/resize refresh rects. */
  attachRoot: (el: HTMLElement | null) => void;
}

/** Parse a `${day}-gap-${gapIndex}` key back to { day, gapIndex }. */
function parseGapKey(key: GapKey): GapHit {
  // Format: `${day}-gap-${gapIndex}` — e.g. "2-gap-5"
  const [dayStr, , gapStr] = key.split('-');
  return { day: Number(dayStr), gapIndex: Number(gapStr) };
}

export function useSlotRects(): SlotRectsApi {
  const rectsRef = useRef<Map<SlotKey, DOMRect>>(new Map());
  const elsRef = useRef<Map<SlotKey, HTMLElement>>(new Map());

  const gapRectsRef = useRef<Map<GapKey, DOMRect>>(new Map());
  const gapElsRef = useRef<Map<GapKey, HTMLElement>>(new Map());

  const rafRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const refreshAll = useCallback(() => {
    const slotNext = new Map<SlotKey, DOMRect>();
    elsRef.current.forEach((el, key) => {
      slotNext.set(key, el.getBoundingClientRect());
    });
    rectsRef.current = slotNext;

    const gapNext = new Map<GapKey, DOMRect>();
    gapElsRef.current.forEach((el, key) => {
      gapNext.set(key, el.getBoundingClientRect());
    });
    gapRectsRef.current = gapNext;
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      refreshAll();
    });
  }, [refreshAll]);

  const register = useCallback(
    (key: SlotKey, el: HTMLElement | null) => {
      if (el) {
        elsRef.current.set(key, el);
        rectsRef.current.set(key, el.getBoundingClientRect());
        scheduleRefresh();
      } else {
        elsRef.current.delete(key);
        rectsRef.current.delete(key);
      }
    },
    [scheduleRefresh],
  );

  const registerGap = useCallback(
    (key: GapKey, el: HTMLElement | null) => {
      if (el) {
        gapElsRef.current.set(key, el);
        gapRectsRef.current.set(key, el.getBoundingClientRect());
        scheduleRefresh();
      } else {
        gapElsRef.current.delete(key);
        gapRectsRef.current.delete(key);
      }
    },
    [scheduleRefresh],
  );

  const attachRoot = useCallback(
    (el: HTMLElement | null) => {
      // Tear down prior observer/listeners.
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (rootRef.current) {
        rootRef.current.removeEventListener('scroll', scheduleRefresh);
      }
      rootRef.current = el;
      if (el) {
        const ro = new ResizeObserver(() => scheduleRefresh());
        ro.observe(el);
        resizeObserverRef.current = ro;
        el.addEventListener('scroll', scheduleRefresh, { passive: true });
      }
    },
    [scheduleRefresh],
  );

  // Window-level listeners — these persist for component lifetime.
  useEffect(() => {
    const onWin = () => scheduleRefresh();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, { passive: true });
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [scheduleRefresh]);

  const hitTest = useCallback((x: number, y: number): SlotKey | null => {
    const rects = rectsRef.current;
    for (const [key, r] of rects) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return key;
      }
    }
    return null;
  }, []);

  const hitTestGap = useCallback((x: number, y: number): GapHit | null => {
    const rects = gapRectsRef.current;
    for (const [key, r] of rects) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return parseGapKey(key);
      }
    }
    return null;
  }, []);

  // Fallback hit-test for Break chips: when the pointer lies within a day
  // column's horizontal range but misses the thin gap strip, pick the gap
  // whose rect-midpoint is closest to pointer Y.
  // Simple and removable — just don't call it from drag handlers to disable.
  const hitTestGapNearest = useCallback(
    (x: number, y: number): GapHit | null => {
      const gapRects = gapRectsRef.current;
      if (gapRects.size === 0) return null;

      // 1) Find the day whose column contains X by checking slot rects
      //    (slots are wider than the gap strips' visible hairline).
      const slotRects = rectsRef.current;
      const dayXRanges = new Map<number, { left: number; right: number }>();
      for (const [key, r] of slotRects) {
        const [dayStr] = key.split('-');
        const day = Number(dayStr);
        const existing = dayXRanges.get(day);
        if (!existing) {
          dayXRanges.set(day, { left: r.left, right: r.right });
        } else {
          existing.left = Math.min(existing.left, r.left);
          existing.right = Math.max(existing.right, r.right);
        }
      }
      let targetDay: number | null = null;
      for (const [day, range] of dayXRanges) {
        if (x >= range.left && x <= range.right) {
          targetDay = day;
          break;
        }
      }
      if (targetDay === null) return null;

      // 2) Of the gaps registered for that day, find the one whose rect
      //    midpoint is closest to Y.
      let best: { gapIndex: number; dist: number } | null = null;
      for (const [key, r] of gapRects) {
        const [dayStr, , gapStr] = key.split('-');
        if (Number(dayStr) !== targetDay) continue;
        const midY = (r.top + r.bottom) / 2;
        const dist = Math.abs(midY - y);
        if (!best || dist < best.dist) {
          best = { gapIndex: Number(gapStr), dist };
        }
      }
      if (!best) return null;
      return { day: targetDay, gapIndex: best.gapIndex };
    },
    [],
  );

  return {
    register,
    hitTest,
    registerGap,
    hitTestGap,
    hitTestGapNearest,
    attachRoot,
  };
}

// Pure hit-test helper — exported for unit-testing without a DOM.
export function hitTestRects(
  rects: Map<SlotKey, DOMRect | { left: number; right: number; top: number; bottom: number }>,
  x: number,
  y: number,
): SlotKey | null {
  for (const [key, r] of rects) {
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return key;
    }
  }
  return null;
}
