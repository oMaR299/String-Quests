/**
 * PowerupIcon — single source of truth mapping `PowerupSlug` to a
 * lucide-react icon. Sibling agents MUST use this primitive instead of
 * importing icons directly so the shop, loadout grid, in-question HUD,
 * and end-screen summary all render the same glyph for a given slug.
 *
 * Usage:
 *   <PowerupIcon slug="freeze" size={20} className="text-sq-info-500" />
 */

import React from 'react';
import {
  Snowflake,
  ShieldCheck,
  Zap,
  Dices,
  Lock,
  Shield,
  Flame,
  HelpCircle,
  Lightbulb,
  SkipForward,
  RotateCcw,
  Eraser,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { PowerupSlug } from '../../data/mockPowerupsData';

const ICON_MAP: Record<PowerupSlug, LucideIcon> = {
  freeze: Snowflake,
  restart_shield: ShieldCheck,
  xp_double: Zap,
  lucky_dice: Dices,
  combo_lock: Lock,
  streak_shield: Shield,
  streak_revive: Flame,
  fifty_fifty: HelpCircle,
  hint_reveal: Lightbulb,
  skip: SkipForward,
  second_chance: RotateCcw,
  eraser: Eraser,
  auto_complete: Sparkles,
};

export interface PowerupIconProps {
  slug: PowerupSlug;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

function PowerupIcon({
  slug,
  size = 20,
  className,
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: PowerupIconProps) {
  const Icon = ICON_MAP[slug];
  // Defensive — should be unreachable thanks to the union type but keeps runtime safe.
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}

export default PowerupIcon;
export { PowerupIcon };
