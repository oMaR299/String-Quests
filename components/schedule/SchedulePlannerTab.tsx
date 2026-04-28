// SchedulePlannerTab.tsx
// The original sidebar + week grid layout, extracted so ScheduleLayout can
// render it as one of three tabs. All drag/drop state + hit-testing stays here.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type PanInfo } from 'framer-motion';
import {
  type ClassItem,
  type DayBreak,
  type PendingAction,
  type Placement,
  type SlotKey,
  slotKey,
} from './scheduleTypes';
import { useSlotRects } from './useSlotRects';
import { WeekGrid, breakGapSetKey } from './WeekGrid';
import { ClassSidebar } from './ClassSidebar';
import type { Locale } from './scheduleI18n';

interface SchedulePlannerTabProps {
  classes: ClassItem[];
  placements: Placement[];
  breaks: DayBreak[];
  locale: Locale;
  // Actions
  place: (p: Placement) => void;
  insertBreak: (day: number, gapIndex: number) => void;
  removeBreak: (day: number, gapIndex: number) => void;
  // Confirm plumbing — pendingAction is owned by the layout so the dialog is
  // shared across tabs, but this tab is the only producer of class/slot
  // actions. We accept a setter.
  setPendingAction: (a: PendingAction) => void;
  // Just-placed pulse lives here (UI-only) so it doesn't leak across tabs.
}

export function SchedulePlannerTab({
  classes,
  placements,
  breaks,
  locale,
  place,
  insertBreak,
  removeBreak,
  setPendingAction,
}: SchedulePlannerTabProps) {
  const [dragOverSlotKey, setDragOverSlotKey] = useState<SlotKey | null>(null);
  const [dragOverGap, setDragOverGap] = useState<{ day: number; gapIndex: number } | null>(null);
  const [justPlacedKey, setJustPlacedKey] = useState<SlotKey | null>(null);

  const {
    register,
    hitTest,
    registerGap,
    hitTestGap,
    hitTestGapNearest,
    attachRoot,
  } = useSlotRects();

  // ── Derived maps ─────────────────────────────────────────────────────────

  const classById = useMemo(() => {
    const m = new Map<string, ClassItem>();
    for (const c of classes) m.set(c.id, c);
    return m;
  }, [classes]);

  const placementsBySlot = useMemo(() => {
    const m = new Map<SlotKey, Placement>();
    for (const p of placements) m.set(slotKey(p.day, p.slot), p);
    return m;
  }, [placements]);

  const placedCountByClass = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of placements) {
      m.set(p.classId, (m.get(p.classId) ?? 0) + 1);
    }
    return m;
  }, [placements]);

  const breaksByGap = useMemo(() => {
    const s = new Set<string>();
    for (const b of breaks) s.add(breakGapSetKey(b));
    return s;
  }, [breaks]);

  const filledPlacements = placements.length;

  // ── Ref mirror of mutable state for drag handlers ────────────────────────
  const stateRef = useRef({
    placementsBySlot,
    placedCountByClass,
    classById,
    place,
    insertBreak,
  });
  stateRef.current = {
    placementsBySlot,
    placedCountByClass,
    classById,
    place,
    insertBreak,
  };

  // ── rAF-throttled drag-over tracking ─────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null);
  const dragKindRef = useRef<'class' | 'break' | null>(null);

  const scheduleDragOverUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pt = pendingPointRef.current;
      if (!pt) return;
      if (dragKindRef.current === 'break') {
        const hit = hitTestGap(pt.x, pt.y);
        setDragOverGap(prev => {
          if (!prev && !hit) return prev;
          if (prev && hit && prev.day === hit.day && prev.gapIndex === hit.gapIndex) return prev;
          return hit;
        });
      } else if (dragKindRef.current === 'class') {
        const key = hitTest(pt.x, pt.y);
        setDragOverSlotKey(prev => (prev === key ? prev : key));
      }
    });
  }, [hitTest, hitTestGap]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // ── Class chip drag handlers ─────────────────────────────────────────────

  const handleChipDragStart = useCallback((_classId: string) => {
    dragKindRef.current = 'class';
    setDragOverSlotKey(null);
    setDragOverGap(null);
  }, []);

  const handleChipDrag = useCallback(
    (_classId: string, info: PanInfo) => {
      pendingPointRef.current = { x: info.point.x, y: info.point.y };
      scheduleDragOverUpdate();
    },
    [scheduleDragOverUpdate],
  );

  const decideClassDrop = useCallback(
    (classId: string, key: SlotKey | null) => {
      if (!key) return;
      const {
        placementsBySlot: curPlacements,
        placedCountByClass: curCounts,
        classById: curClasses,
        place: curPlace,
      } = stateRef.current;

      const [dayStr, slotStr] = key.split('-');
      const day = Number(dayStr);
      const slot = Number(slotStr);

      const existing = curPlacements.get(key);

      if (existing && existing.classId === classId) return;

      const target = curClasses.get(classId)?.weeklyTarget ?? 0;
      const currentCount = curCounts.get(classId) ?? 0;
      const projected = currentCount + 1;
      const wouldExceed = projected > target;

      if (existing && wouldExceed) {
        setPendingAction({
          kind: 'overwriteSlot',
          day,
          slot,
          incoming: { classId, day, slot },
          alsoExceedsQuota: true,
        });
        return;
      }
      if (existing) {
        setPendingAction({
          kind: 'overwriteSlot',
          day,
          slot,
          incoming: { classId, day, slot },
        });
        return;
      }
      if (wouldExceed) {
        setPendingAction({
          kind: 'exceedQuota',
          classId,
          day,
          slot,
        });
        return;
      }

      curPlace({ classId, day, slot });
      setJustPlacedKey(key);
    },
    [setPendingAction],
  );

  const handleChipDragEnd = useCallback(
    (classId: string, info: PanInfo) => {
      const key = hitTest(info.point.x, info.point.y);
      setDragOverSlotKey(null);
      setDragOverGap(null);
      pendingPointRef.current = null;
      dragKindRef.current = null;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      decideClassDrop(classId, key);
    },
    [decideClassDrop, hitTest],
  );

  // ── Break chip drag handlers ─────────────────────────────────────────────

  const handleBreakDragStart = useCallback(() => {
    dragKindRef.current = 'break';
    setDragOverSlotKey(null);
    setDragOverGap(null);
  }, []);

  const handleBreakDrag = useCallback(
    (info: PanInfo) => {
      pendingPointRef.current = { x: info.point.x, y: info.point.y };
      scheduleDragOverUpdate();
    },
    [scheduleDragOverUpdate],
  );

  const handleBreakDragEnd = useCallback(
    (info: PanInfo) => {
      let hit = hitTestGap(info.point.x, info.point.y);
      if (!hit) {
        hit = hitTestGapNearest(info.point.x, info.point.y);
      }
      setDragOverSlotKey(null);
      setDragOverGap(null);
      pendingPointRef.current = null;
      dragKindRef.current = null;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!hit) return;
      stateRef.current.insertBreak(hit.day, hit.gapIndex);
    },
    [hitTestGap, hitTestGapNearest],
  );

  // ── Slot + button handlers ───────────────────────────────────────────────

  const handleRequestRemove = useCallback(
    (day: number, slot: number) => {
      setPendingAction({ kind: 'removeSlot', day, slot });
    },
    [setPendingAction],
  );

  const handleRequestRemoveBreak = useCallback(
    (day: number, gapIndex: number) => {
      removeBreak(day, gapIndex);
    },
    [removeBreak],
  );

  const handleRequestClearWeek = useCallback(() => {
    setPendingAction({ kind: 'clearWeek' });
  }, [setPendingAction]);

  // Clear justPlacedKey after pulse duration.
  useEffect(() => {
    if (!justPlacedKey) return;
    const t = window.setTimeout(() => setJustPlacedKey(null), 220);
    return () => window.clearTimeout(t);
  }, [justPlacedKey]);

  return (
    <div
      className="grid gap-4 lg:gap-5 h-[calc(100vh-11rem)]"
      style={{ gridTemplateColumns: `minmax(280px, 320px) 1fr` }}
    >
      <ClassSidebar
        classes={classes}
        placedCountByClass={placedCountByClass}
        filled={filledPlacements}
        total={35}
        locale={locale}
        onRequestClearWeek={handleRequestClearWeek}
        onChipDragStart={handleChipDragStart}
        onChipDrag={handleChipDrag}
        onChipDragEnd={handleChipDragEnd}
        onBreakDragStart={handleBreakDragStart}
        onBreakDrag={handleBreakDrag}
        onBreakDragEnd={handleBreakDragEnd}
      />

      <WeekGrid
        placementsBySlot={placementsBySlot}
        breaksByGap={breaksByGap}
        classById={classById}
        dragOverSlotKey={dragOverSlotKey}
        dragOverGap={dragOverGap}
        justPlacedKey={justPlacedKey}
        locale={locale}
        registerSlotRef={register}
        registerGapRef={registerGap}
        attachRoot={attachRoot}
        onRequestRemove={handleRequestRemove}
        onRequestRemoveBreak={handleRequestRemoveBreak}
      />
    </div>
  );
}

export default SchedulePlannerTab;
