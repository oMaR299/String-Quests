// WeekGrid.tsx
// Flex row of 5 day columns (Sun → Thu). Each column is its own flex-col that
// interleaves GapZones and SlotCells:
//   DayHeader → GapZone(0) → SlotCell(day,0) → GapZone(1) → SlotCell(day,1) → …
//              → SlotCell(day,6) → GapZone(7)
//
// Columns grow in height independently when breaks are inserted — that's the
// "shift" behavior. Period labels are rendered as tiny corner tags inside each
// SlotCell, so there is NO shared left period column.

import React from 'react';
import type {
  ClassItem,
  DayBreak,
  GapKey,
  Placement,
  SlotKey,
} from './scheduleTypes';
import {
  DAY_INDEXES,
  GAP_INDEXES,
  SLOT_INDEXES,
  slotKey,
} from './scheduleTypes';
import { SlotCell } from './SlotCell';
import { GapZone } from './GapZone';
import { dayLabel, type Locale } from './scheduleI18n';

interface WeekGridProps {
  placementsBySlot: Map<SlotKey, Placement>;
  /** Set of "day-gapIndex" strings (`${day}-${gapIndex}`) — presence = break. */
  breaksByGap: Set<string>;
  classById: Map<string, ClassItem>;
  dragOverSlotKey: SlotKey | null;
  dragOverGap: { day: number; gapIndex: number } | null;
  justPlacedKey: SlotKey | null;
  locale: Locale;
  registerSlotRef: (key: SlotKey, el: HTMLElement | null) => void;
  registerGapRef: (key: GapKey, el: HTMLElement | null) => void;
  attachRoot: (el: HTMLElement | null) => void;
  onRequestRemove: (day: number, slot: number) => void;
  onRequestRemoveBreak: (day: number, gapIndex: number) => void;
}

/** Key used in the `breaksByGap` set — mirrors DayBreak identity. */
export function breakGapSetKey(b: Pick<DayBreak, 'day' | 'gapIndex'>): string {
  return `${b.day}-${b.gapIndex}`;
}

export const WeekGrid: React.FC<WeekGridProps> = ({
  placementsBySlot,
  breaksByGap,
  classById,
  dragOverSlotKey,
  dragOverGap,
  justPlacedKey,
  locale,
  registerSlotRef,
  registerGapRef,
  attachRoot,
  onRequestRemove,
  onRequestRemoveBreak,
}) => {
  return (
    <div
      ref={attachRoot}
      className="relative h-full overflow-auto rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-4"
    >
      {/* Flex row of 5 day columns — flips naturally under dir="rtl" */}
      <div className="flex gap-2 items-start">
        {DAY_INDEXES.map(day => (
          <div
            key={`col-${day}`}
            className="flex-1 min-w-0 flex flex-col gap-0"
          >
            {/* Sticky day header — part of the column's own flex layout */}
            <div
              className="sticky top-0 z-10 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur-xl border border-slate-200/70 rounded-xl py-2 px-2 text-center text-xs font-black text-slate-700 shadow-sm mb-1"
            >
              {dayLabel(day, locale)}
            </div>

            {/* Interleave: GapZone(0) → Slot(0) → GapZone(1) → Slot(1) → … → Slot(6) → GapZone(7) */}
            {SLOT_INDEXES.map(slot => {
              const gapIndex = slot; // gap BEFORE this slot (gap 0 = before P1)
              const gapHasBreak = breaksByGap.has(`${day}-${gapIndex}`);
              const gapIsDragOver =
                dragOverGap !== null &&
                dragOverGap.day === day &&
                dragOverGap.gapIndex === gapIndex;

              const key = slotKey(day, slot);
              const placement = placementsBySlot.get(key) ?? null;
              const classItem = placement
                ? classById.get(placement.classId) ?? null
                : null;

              return (
                <React.Fragment key={`day-${day}-row-${slot}`}>
                  <GapZone
                    day={day}
                    gapIndex={gapIndex}
                    hasBreak={gapHasBreak}
                    isDragOver={gapIsDragOver}
                    locale={locale}
                    registerGapRef={registerGapRef}
                    onRequestRemoveBreak={onRequestRemoveBreak}
                  />
                  <SlotCell
                    day={day}
                    slot={slot}
                    placement={placement}
                    classItem={classItem}
                    isDragOver={dragOverSlotKey === key}
                    justPlaced={justPlacedKey === key}
                    locale={locale}
                    registerSlotRef={registerSlotRef}
                    onRequestRemove={onRequestRemove}
                  />
                </React.Fragment>
              );
            })}

            {/* Trailing gap (gap 7 = after P7) */}
            {(() => {
              const trailingGap = GAP_INDEXES[GAP_INDEXES.length - 1]; // 7
              const gapHasBreak = breaksByGap.has(`${day}-${trailingGap}`);
              const gapIsDragOver =
                dragOverGap !== null &&
                dragOverGap.day === day &&
                dragOverGap.gapIndex === trailingGap;
              return (
                <GapZone
                  day={day}
                  gapIndex={trailingGap}
                  hasBreak={gapHasBreak}
                  isDragOver={gapIsDragOver}
                  locale={locale}
                  registerGapRef={registerGapRef}
                  onRequestRemoveBreak={onRequestRemoveBreak}
                />
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekGrid;
