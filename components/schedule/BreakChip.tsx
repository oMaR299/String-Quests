// BreakChip.tsx
// Draggable reusable "Break" chip. No quota, unlimited placements.

import React from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { Coffee } from 'lucide-react';
import { BREAK_COLOR_CLASSES } from './scheduleTypes';
import { breakChipLabel, type Locale } from './scheduleI18n';

interface BreakChipProps {
  locale: Locale;
  onDragStart: () => void;
  onDrag: (info: PanInfo) => void;
  onDragEnd: (info: PanInfo) => void;
}

export const BreakChip: React.FC<BreakChipProps> = ({
  locale,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const palette = BREAK_COLOR_CLASSES;

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      whileHover={{ y: -1 }}
      onDragStart={() => onDragStart()}
      onDrag={(_, info) => onDrag(info)}
      onDragEnd={(_, info) => onDragEnd(info)}
      className={[
        'relative select-none cursor-grab active:cursor-grabbing',
        // Pill — dashed outline reinforces "structural spacer, not content"
        'rounded-2xl border border-dashed px-3 py-2 shadow-sm hover:shadow transition-shadow',
        'flex items-center gap-2',
        palette.bg,
        palette.border,
        palette.text,
      ].join(' ')}
    >
      <span className="w-6 h-6 rounded-lg bg-white/70 border border-slate-200 flex items-center justify-center shrink-0">
        <Coffee className="w-3.5 h-3.5" />
      </span>
      <div className="text-[12px] font-black">{breakChipLabel(locale)}</div>
      <span className="ms-auto text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        ∞
      </span>
    </motion.div>
  );
};

export default BreakChip;
