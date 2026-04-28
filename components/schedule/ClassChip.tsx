// ClassChip.tsx
// Draggable sidebar chip for one class. `dragSnapToOrigin` gives copy semantics:
// the chip always returns home after drop — the slot placement is the payload.

import React from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import type { ClassItem } from './scheduleTypes';
import { SUBJECT_COLOR_CLASSES } from './scheduleTypes';
import {
  subjectLabel,
  classGradeSectionLabel,
  perClassProgressLabel,
  weeklyQuotaAria,
  type Locale,
} from './scheduleI18n';

interface ClassChipProps {
  item: ClassItem;
  placedCount: number;
  locale: Locale;
  onDragStart: (classId: string) => void;
  onDrag: (classId: string, info: PanInfo) => void;
  onDragEnd: (classId: string, info: PanInfo) => void;
}

export const ClassChip: React.FC<ClassChipProps> = ({
  item,
  placedCount,
  locale,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const remaining = item.weeklyTarget - placedCount;
  const atQuota = remaining <= 0;
  const palette = SUBJECT_COLOR_CLASSES[item.colorToken];

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      whileHover={{ y: -1 }}
      onDragStart={() => onDragStart(item.id)}
      onDrag={(_, info) => onDrag(item.id, info)}
      onDragEnd={(_, info) => onDragEnd(item.id, info)}
      className={[
        'group relative select-none cursor-grab active:cursor-grabbing',
        'rounded-2xl border px-3 py-2.5 shadow-sm hover:shadow transition-shadow',
        palette.bg,
        palette.border,
        palette.text,
        atQuota ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {/* Grab affordance — telegraphs draggability */}
        <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-opacity shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-black leading-tight truncate">
            {classGradeSectionLabel(item.grade, item.section, locale)}
          </div>
          <div className="text-[11px] font-bold opacity-80 truncate mt-0.5">
            {subjectLabel(item.subject, locale)}
          </div>
        </div>

        <span
          className={[
            'shrink-0 text-[10px] font-black rounded-lg px-1.5 py-0.5 tabular-nums',
            'bg-white/70 text-slate-700 border border-white/80 shadow-sm',
          ].join(' ')}
          aria-label={weeklyQuotaAria(locale)}
        >
          {perClassProgressLabel(placedCount, item.weeklyTarget, locale)}
        </span>
      </div>
    </motion.div>
  );
};

export default ClassChip;
