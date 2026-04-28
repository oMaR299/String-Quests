// SlotCell.tsx
// A single (day × period) cell inside a day column. Registers its DOMRect for
// class-chip hit-testing; shows empty-affordance, drag-over highlight, or a
// PlacedSlotCard. Breaks are NOT rendered here anymore — they live in GapZones
// between slots.

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ClassItem, Placement, SlotKey } from './scheduleTypes';
import { slotKey } from './scheduleTypes';
import { PlacedSlotCard } from './PlacedSlotCard';
import { periodLabelShort, type Locale } from './scheduleI18n';

interface SlotCellProps {
  day: number;
  slot: number;
  placement: Placement | null;
  classItem: ClassItem | null; // resolved ClassItem for the placement (null if empty)
  isDragOver: boolean;
  justPlaced: boolean;
  locale: Locale;
  registerSlotRef: (key: SlotKey, el: HTMLElement | null) => void;
  onRequestRemove: (day: number, slot: number) => void;
}

export const SlotCell: React.FC<SlotCellProps> = ({
  day,
  slot,
  placement,
  classItem,
  isDragOver,
  justPlaced,
  locale,
  registerSlotRef,
  onRequestRemove,
}) => {
  const key = slotKey(day, slot);
  const elRef = useRef<HTMLDivElement | null>(null);

  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      elRef.current = el;
      registerSlotRef(key, el);
    },
    [key, registerSlotRef],
  );

  const hasPlacement = placement !== null;

  // Play a 180ms pulse when a placement lands here. `justPlaced` flips true
  // then back to false via a timeout in the parent — animate reacts to both.
  // The outer motion.div MUST keep a stable identity (no key prop) so the
  // ref callback doesn't churn and rect registration stays stable.
  return (
    <motion.div
      ref={refCallback}
      animate={justPlaced ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.18 }}
      className={[
        'relative min-h-[60px] rounded-xl p-1 transition-colors',
        hasPlacement
          ? 'bg-transparent'
          : isDragOver
          ? 'bg-violet-50 ring-2 ring-violet-300 border border-violet-300'
          : 'bg-white/40 border border-dashed border-slate-200 hover:border-slate-300 hover:bg-white/60',
      ].join(' ')}
    >
      {/* Tiny period label in the top-start corner — muted, uppercase */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 start-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
      >
        {periodLabelShort(slot, locale)}
      </span>

      {hasPlacement ? (
        <PlacedSlotCard
          day={day}
          slot={slot}
          classItem={classItem}
          locale={locale}
          onRequestRemove={() => onRequestRemove(day, slot)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Plus
            className={[
              'w-4 h-4 transition-all',
              isDragOver ? 'opacity-80 text-violet-500 scale-110' : 'opacity-20 text-slate-400',
            ].join(' ')}
          />
        </div>
      )}
    </motion.div>
  );
};

export default SlotCell;
