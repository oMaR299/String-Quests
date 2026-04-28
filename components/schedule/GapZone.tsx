// GapZone.tsx
// Inter-slot drop target that lives BETWEEN SlotCells (and at the top/bottom of
// each day column). Two visual states:
//   - empty  → a thin 10-12px strip with a faint slate hairline, soft violet
//              highlight on drag-over from a Break chip, inert for Class chips.
//   - filled → the 36px break band (Coffee icon + BREAK/استراحة label) lifted
//              from the old PlacedSlotCard break branch. Small × on hover.
//
// Registers its rect via the gap-rect registry so ScheduleLayout can hit-test.

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import type { GapKey } from './scheduleTypes';
import { gapKey } from './scheduleTypes';
import { breakChipLabel, removeSlotAria, type Locale } from './scheduleI18n';

interface GapZoneProps {
  day: number;
  gapIndex: number;
  hasBreak: boolean;
  /** True while a Break chip is being dragged over this specific gap. */
  isDragOver: boolean;
  locale: Locale;
  registerGapRef: (key: GapKey, el: HTMLElement | null) => void;
  onRequestRemoveBreak: (day: number, gapIndex: number) => void;
}

export const GapZone: React.FC<GapZoneProps> = ({
  day,
  gapIndex,
  hasBreak,
  isDragOver,
  locale,
  registerGapRef,
  onRequestRemoveBreak,
}) => {
  const key = gapKey(day, gapIndex);
  const elRef = useRef<HTMLDivElement | null>(null);

  // Stable ref callback — must keep the outer div identity (no key) so
  // gap-rect registration stays stable across renders/state flips.
  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      elRef.current = el;
      registerGapRef(key, el);
    },
    [key, registerGapRef],
  );

  // ── Filled: 36px break band ──────────────────────────────────────────────
  if (hasBreak) {
    return (
      <div
        ref={refCallback}
        className="relative w-full py-1"
      >
        <motion.div
          layoutId={`break-${day}-${gapIndex}`}
          className={[
            'group relative w-full flex items-center justify-center gap-1.5',
            'h-[36px] rounded-md',
            'bg-slate-100/70',
            'border-y border-dashed border-slate-300/80',
            'text-slate-500',
          ].join(' ')}
        >
          <Coffee className="w-3 h-3 opacity-70" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {breakChipLabel(locale)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestRemoveBreak(day, gapIndex);
            }}
            className="absolute top-1/2 -translate-y-1/2 end-1 p-0.5 rounded-md bg-white/70 hover:bg-white text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={removeSlotAria(locale)}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Empty: thin strip with faint hairline ────────────────────────────────
  return (
    <div
      ref={refCallback}
      className={[
        'relative w-full flex items-center transition-all',
        isDragOver
          ? 'h-[14px] bg-duo-purple-light/40 ring-1 ring-duo-purple/30 rounded'
          : 'h-[10px]',
      ].join(' ')}
    >
      {/* Faint horizontal hairline — very muted so it reads as "space" */}
      <div
        aria-hidden
        className={[
          'w-full h-px mx-2 transition-opacity',
          isDragOver ? 'opacity-0' : 'bg-slate-200/60 opacity-100',
        ].join(' ')}
      />
    </div>
  );
};

export default GapZone;
