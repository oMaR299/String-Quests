/**
 * PowerupTile — compact toggleable tile for the pre-quest LoadoutModal grid.
 *
 * NOTE: this is intentionally smaller and simpler than the shop's
 * `PowerupCard` (built by sibling B2). The shop tile is for buying/owning;
 * this one is for arming a single power-up into the upcoming session.
 *
 * Visual recipe (light-theme glass, AR-first bilingual):
 *   - rounded-2xl glass surface (white/70 + backdrop-blur)
 *   - icon top-center inside a small gradient tile colored by the
 *     power-up's group bucket (defensive=info, xp_booster=warning,
 *     question_helper=brand, reactive=success, combo_streak=danger,
 *     power_solve=pastel-purple)
 *   - bilingual name below the icon (catalog ar/en mapped via i18n key)
 *   - owned-count Pill (`variant=accent` showing "×N") in the corner
 *   - selected → ring-2 ring-sq-brand-500 + faint sq-brand-50 wash
 *   - disabled when getOwned(slug) === 0 → greyed + "buy in shop" copy
 *   - v2 stub → small `Pill variant=warning` "قريبًا / Coming soon" overlay
 *     at the top-end corner (RTL-aware via `start/end`); tile still toggles
 *     per the user's "All 13 with v2 stubs" scope choice
 *   - whileTap scale=0.96 + SQ_SPRING.snappy, guarded by useReducedMotion
 *
 * Props are intentionally minimal — owned-count and v2-status are read
 * inside via `usePowerups()` so the LoadoutModal grid stays declarative.
 */

import React, { useCallback } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import {
  POWERUP_CATALOG,
  type PowerupGroup,
  type PowerupSlug,
} from '../../data/mockPowerupsData';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';
import { SqPill } from '../design-system/components/Pill';
import { PowerupIcon } from './PowerupIcon';

export interface PowerupTileProps {
  slug: PowerupSlug;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Static (JIT-safe) gradient + ring class lookup per group bucket.
 * Mirrors the color contract documented in mockPowerupsData.ts.
 */
const GROUP_GRADIENT: Record<PowerupGroup, string> = {
  defensive:       'bg-gradient-to-br from-sky-400 to-sq-info-500',
  xp_booster:      'bg-gradient-to-br from-amber-400 to-sq-warning-500',
  question_helper: 'bg-gradient-to-br from-violet-400 to-sq-brand-500',
  reactive:        'bg-gradient-to-br from-emerald-400 to-sq-success-500',
  combo_streak:    'bg-gradient-to-br from-rose-400 to-sq-danger-500',
  power_solve:     'bg-gradient-to-br from-pastel-purple to-sq-brand-500',
};

const GROUP_SHADOW: Record<PowerupGroup, string> = {
  defensive:       'shadow-md shadow-sky-500/25',
  xp_booster:      'shadow-md shadow-amber-500/25',
  question_helper: 'shadow-md shadow-violet-500/25',
  reactive:        'shadow-md shadow-emerald-500/25',
  combo_streak:    'shadow-md shadow-rose-500/25',
  power_solve:     'shadow-md shadow-violet-500/20',
};

export const PowerupTile: React.FC<PowerupTileProps> = ({
  slug,
  selected,
  onToggle,
  className,
}) => {
  const { t, locale } = useI18n();
  const { getOwned, isV2 } = usePowerups();
  const reduce = useReducedMotion();

  const entry = POWERUP_CATALOG[slug];
  const owned = getOwned(slug);
  const v2 = isV2(slug);
  const disabled = owned === 0;
  const name = t(`powerups.name.${slug}`);

  const tap: Transition = reduce ? MOTION_FALLBACK : SQ_SPRING.snappy;

  const handleClick = useCallback(() => {
    if (disabled) return;
    onToggle();
  }, [disabled, onToggle]);

  // Tile chrome — selected + disabled states layered onto the glass base.
  const baseChrome =
    'relative w-full h-full rounded-2xl border text-start font-cairo ' +
    'bg-white/70 backdrop-blur-md transition-colors duration-150 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-brand-500 focus-visible:ring-offset-1';

  const stateChrome = disabled
    ? 'border-slate-200/70 opacity-60 cursor-not-allowed'
    : selected
      ? 'border-sq-brand-500 bg-sq-brand-50/70 ring-2 ring-sq-brand-500'
      : 'border-white/60 hover:border-sq-brand-200 hover:bg-white/85 cursor-pointer';

  const isAr = locale === 'ar';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={disabled || reduce ? undefined : { scale: 0.96 }}
      transition={tap}
      aria-pressed={!disabled && selected}
      aria-disabled={disabled}
      aria-label={
        disabled
          ? `${name} — ${t('powerups.loadout.buy_in_shop')}`
          : `${name} — ${owned} ${t('powerups.hud.owned')}`
      }
      className={[baseChrome, stateChrome, className ?? ''].join(' ')}
    >
      {/* v2 stub badge — sits in the top-end corner (RTL-aware). */}
      {v2 && (
        <span
          className={[
            'absolute top-2',
            isAr ? 'left-2' : 'right-2',
            'pointer-events-none',
          ].join(' ')}
        >
          <SqPill variant="warning">{t('powerups.shop.coming_soon')}</SqPill>
        </span>
      )}

      {/* Owned-count chip — opposite corner from the v2 badge. */}
      <span
        className={[
          'absolute top-2',
          isAr ? 'right-2' : 'left-2',
          'pointer-events-none',
        ].join(' ')}
      >
        <SqPill variant={owned > 0 ? 'accent' : 'default'}>
          ×{owned}
        </SqPill>
      </span>

      {/* Body */}
      <div className="flex flex-col items-center text-center px-3 pt-9 pb-3 gap-2">
        <div
          className={[
            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
            GROUP_GRADIENT[entry.group],
            GROUP_SHADOW[entry.group],
          ].join(' ')}
        >
          <PowerupIcon
            slug={slug}
            size={22}
            className="text-white"
            strokeWidth={2.25}
          />
        </div>

        <div className="min-w-0 w-full">
          <div className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">
            {name}
          </div>
          {disabled && (
            <div className="mt-1 text-[10px] font-semibold text-slate-500 leading-tight line-clamp-2">
              {t('powerups.loadout.buy_in_shop')}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default PowerupTile;
