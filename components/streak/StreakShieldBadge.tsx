/**
 * StreakShieldBadge — owned-count chip surfaced inside the StreakWidget
 * header (and a compact variant on the MobileStreakStrip). Streak Shield
 * is a passive v2 power-up — there is no "use" button anywhere; this
 * badge only communicates "you're protected, ×n shields stocked".
 *
 * Hidden when the user owns 0 shields. Soft glow appears when count > 0.
 *
 * Usage:
 *   <StreakShieldBadge />
 *   <StreakShieldBadge size="sm" />
 *
 * Reads inventory via `usePowerups().getOwned('streak_shield')` so Wave A
 * remains the single source of truth for inventory access.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

export type StreakShieldBadgeSize = 'sm' | 'md';

export interface StreakShieldBadgeProps {
  size?: StreakShieldBadgeSize;
  className?: string;
}

const SIZE_CLASSES: Record<StreakShieldBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

const ICON_PX: Record<StreakShieldBadgeSize, number> = {
  sm: 11,
  md: 13,
};

export const StreakShieldBadge: React.FC<StreakShieldBadgeProps> = ({
  size = 'md',
  className,
}) => {
  const { t } = useI18n();
  const { getOwned } = usePowerups();
  const reduce = useReducedMotion();

  const owned = getOwned('streak_shield');
  if (owned <= 0) return null;

  const transition = reduce ? MOTION_FALLBACK : SQ_SPRING.snappy;
  const tooltip = t('powerups.streak.shield_owned');
  // Always > 0 here, so use ShieldCheck (active/owned glyph).
  const Icon = ShieldCheck;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transition}
      title={tooltip}
      role="status"
      aria-label={`${tooltip}: ${owned}`}
      className={[
        'relative inline-flex items-center rounded-full font-bold leading-none',
        // Light glass on dark widget surface — mirrors widget's white/5 chips
        'bg-sq-info-50/90 border border-sq-info-200/70 text-sq-info-700',
        'shadow-sm backdrop-blur-sm',
        SIZE_CLASSES[size],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Soft glow halo (visible only when count > 0; disabled by reduced-motion) */}
      {!reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-sq-info-400/30 blur-md -z-[1]"
        />
      )}
      <Icon
        size={ICON_PX[size]}
        strokeWidth={2.5}
        className="text-sq-info-600 shrink-0"
        aria-hidden
      />
      <span className="tabular-nums">×{owned}</span>
      {/* Defensive icon export to satisfy bundler-tree-shaking when only Shield is used elsewhere */}
      <Shield size={0} className="hidden" aria-hidden />
    </motion.div>
  );
};

export default StreakShieldBadge;
