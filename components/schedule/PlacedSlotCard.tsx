// PlacedSlotCard.tsx
// Visual rep of a filled CLASS slot — subject-tinted card that fills the cell.
// (Breaks are no longer slot-occupants; they live in GapZone between slots.)

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ClassItem } from './scheduleTypes';
import { SUBJECT_COLOR_CLASSES } from './scheduleTypes';
import {
  subjectLabel,
  classGradeSectionLabel,
  removeSlotAria,
  type Locale,
} from './scheduleI18n';

interface PlacedSlotCardProps {
  day: number;
  slot: number;
  classItem: ClassItem | null;
  locale: Locale;
  onRequestRemove: () => void;
}

export const PlacedSlotCard: React.FC<PlacedSlotCardProps> = ({
  day,
  slot,
  classItem,
  locale,
  onRequestRemove,
}) => {
  // Defensive: classItem should always be present when we reach this point
  // (SlotCell only renders PlacedSlotCard when there's a placement, and
  // placements are class-only now). Render nothing if it's somehow missing.
  if (!classItem) return null;

  const palette = SUBJECT_COLOR_CLASSES[classItem.colorToken];

  return (
    <motion.div
      layoutId={`placed-${day}-${slot}`}
      className={[
        'group relative h-full w-full rounded-lg border px-2 py-1.5 shadow-sm',
        'flex flex-col justify-center',
        palette.bg,
        palette.border,
        palette.text,
      ].join(' ')}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRequestRemove();
        }}
        className="absolute top-1 end-1 p-0.5 rounded-md bg-white/70 hover:bg-white text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={removeSlotAria(locale)}
      >
        <X className="w-3 h-3" />
      </button>

      <div className="text-[12px] font-black leading-tight truncate">
        {classGradeSectionLabel(classItem.grade, classItem.section, locale)}
      </div>
      <div className="text-[10px] font-bold opacity-80 truncate mt-0.5">
        {subjectLabel(classItem.subject, locale)}
      </div>
    </motion.div>
  );
};

export default PlacedSlotCard;
