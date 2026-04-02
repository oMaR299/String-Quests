/**
 * MasteryBadge - Tiny badge component showing Bronze/Silver/Gold mastery level.
 *
 * Renders a small circular icon with a star/crown for earned mastery tiers.
 * Uses Framer Motion for a satisfying pop-in scale animation on mount.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown } from 'lucide-react';

interface MasteryBadgeProps {
  level: 'none' | 'bronze' | 'silver' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

const ICON_SCALE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 10,
  md: 14,
  lg: 20,
};

export function MasteryBadge({ level, size = 'sm', className = '' }: MasteryBadgeProps) {
  if (level === 'none') return null;

  const px = SIZE_MAP[size];
  const iconPx = ICON_SCALE[size];

  const config = {
    bronze: {
      bg: 'bg-amber-700',
      shadow: '',
      icon: <Star className="text-amber-200" style={{ width: iconPx, height: iconPx }} />,
    },
    silver: {
      bg: 'bg-slate-400',
      shadow: '',
      icon: (
        <span className="flex -space-x-[2px]">
          <Star className="text-white" style={{ width: iconPx * 0.7, height: iconPx * 0.7 }} />
          <Star className="text-white" style={{ width: iconPx * 0.7, height: iconPx * 0.7 }} />
        </span>
      ),
    },
    gold: {
      bg: 'bg-yellow-500',
      shadow: 'shadow-[0_0_6px_rgba(234,179,8,0.6)]',
      icon: <Crown className="text-yellow-900" style={{ width: iconPx, height: iconPx }} />,
    },
  } as const;

  const { bg, shadow, icon } = config[level];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.3 }}
      className={`${bg} ${shadow} rounded-full flex items-center justify-center ${className}`}
      style={{ width: px, height: px, minWidth: px }}
      title={level.charAt(0).toUpperCase() + level.slice(1)}
    >
      {icon}
    </motion.div>
  );
}

export default MasteryBadge;
