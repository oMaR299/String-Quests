/**
 * PowerupCard — large catalog tile used by the Stardust Shop screen.
 *
 * One-prop API: `<PowerupCard slug="freeze" onBought={...} />`. Everything
 * else (icon, name, description, cost, owned count, group color, v2 status)
 * is resolved from `POWERUP_CATALOG` + the `usePowerups` / `useStardust`
 * hooks. This keeps shop sections declarative — they just iterate slugs.
 *
 * Design contract:
 *   - Light theme + glass surface (reuses `SqCard variant="glass"`).
 *   - Group → tone mapping is locked here (matches the plan):
 *       defensive       → sq-info
 *       xp_booster      → sq-warning
 *       question_helper → sq-brand
 *       reactive        → sq-success
 *       combo_streak    → sq-danger
 *       power_solve     → pastel-purple (special — handled inline)
 *   - States:
 *       isV2(slug)        → "Coming soon" pill + button disabled
 *       isMaxed(slug)     → "Max owned" + 10/10 pill + button disabled
 *       !canAfford(slug)  → button disabled + title="Insufficient Stardust"
 *   - On buy: dispatches BUY_POWERUP via the hook, then calls `onBought` so
 *     the parent screen can fire its toast (we don't own toast UI here —
 *     the Toast primitive is stateless).
 *
 * RTL: every start/end edge is wired through `useI18n().locale`. Arabic
 * renders RTL by default; English flips. No directional hard-coding.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import { useStardust } from '../../hooks/useStardust';
import {
  POWERUP_CATALOG,
  POWERUP_CAP,
  type PowerupGroup,
  type PowerupSlug,
} from '../../data/mockPowerupsData';
import { PowerupIcon } from './PowerupIcon';
import { SqButton } from '../design-system/components/Button';
import { SqPill } from '../design-system/components/Pill';

/* ─── Group → tone-class lookups (literal strings for Tailwind v4 JIT) ─── */

interface GroupVisualTokens {
  /** Gradient on the icon tile */
  gradient: string;
  /** Accent text color used for cost chip + owned count */
  accentText: string;
  /** Soft background for the cost chip */
  chipBg: string;
  /** Border color for the cost chip */
  chipBorder: string;
}

const GROUP_VISUALS: Record<PowerupGroup, GroupVisualTokens> = {
  defensive: {
    gradient: 'bg-gradient-to-br from-sky-400 to-sq-info-600',
    accentText: 'text-sq-info-700',
    chipBg: 'bg-sq-info-50',
    chipBorder: 'border-sq-info-200',
  },
  xp_booster: {
    gradient: 'bg-gradient-to-br from-amber-400 to-sq-warning-600',
    accentText: 'text-sq-warning-700',
    chipBg: 'bg-sq-warning-50',
    chipBorder: 'border-sq-warning-200',
  },
  question_helper: {
    gradient: 'bg-gradient-to-br from-violet-500 to-sq-brand-700',
    accentText: 'text-sq-brand-700',
    chipBg: 'bg-sq-brand-50',
    chipBorder: 'border-sq-brand-200',
  },
  reactive: {
    gradient: 'bg-gradient-to-br from-emerald-400 to-sq-success-600',
    accentText: 'text-sq-success-700',
    chipBg: 'bg-sq-success-50',
    chipBorder: 'border-sq-success-200',
  },
  combo_streak: {
    gradient: 'bg-gradient-to-br from-rose-400 to-sq-danger-600',
    accentText: 'text-sq-danger-700',
    chipBg: 'bg-sq-danger-50',
    chipBorder: 'border-sq-danger-200',
  },
  power_solve: {
    // Special — pastel-purple per spec. We layer a soft fade to a deeper
    // violet so the tile still feels gradient-y.
    gradient: 'bg-gradient-to-br from-pastel-purple to-sq-brand-500',
    accentText: 'text-sq-brand-700',
    chipBg: 'bg-sq-brand-50',
    chipBorder: 'border-sq-brand-200',
  },
};

/* ─── Cost chip ───────────────────────────────────────────────────────── */

const CostChip: React.FC<{ cost: number; tokens: GroupVisualTokens }> = ({
  cost,
  tokens,
}) => (
  <span
    className={[
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
      'text-[11px] font-bold font-cairo border',
      tokens.chipBg,
      tokens.chipBorder,
      tokens.accentText,
    ].join(' ')}
  >
    <Sparkles className="w-3 h-3 text-sq-warning-500" strokeWidth={2.5} aria-hidden />
    <span className="tabular-nums">{cost}</span>
    <span className="opacity-80">SD</span>
  </span>
);

/* ─── Public props ────────────────────────────────────────────────────── */

export interface PowerupCardProps {
  slug: PowerupSlug;
  /** Optional callback fired AFTER a successful buy() dispatch. Parent uses
   *  this to surface a toast — we don't own that surface here. */
  onBought?: (slug: PowerupSlug) => void;
  className?: string;
}

/* ─── Component ───────────────────────────────────────────────────────── */

export const PowerupCard: React.FC<PowerupCardProps> = ({
  slug,
  onBought,
  className = '',
}) => {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';
  const { getOwned, canAfford, isMaxed, buy, isV2 } = usePowerups();
  const { balance } = useStardust();

  const entry = POWERUP_CATALOG[slug];
  const tokens = GROUP_VISUALS[entry.group];

  const owned = getOwned(slug);
  const v2 = isV2(slug);
  const maxed = isMaxed(slug);
  const affordable = canAfford(slug, balance);

  const name = t(`powerups.name.${slug}`);
  const desc = t(`powerups.desc.${slug}`);

  const buttonLabel = maxed
    ? t('powerups.shop.max_owned')
    : v2
      ? t('powerups.shop.coming_soon')
      : t('powerups.shop.buy');

  const buttonDisabled = v2 || maxed || !affordable;

  const insufficientTitle = isAr ? 'رصيد النجوم غير كافٍ' : 'Insufficient Stardust';
  const tooltip = !v2 && !maxed && !affordable ? insufficientTitle : undefined;

  const handleClick = () => {
    if (buttonDisabled) return;
    buy(slug);
    onBought?.(slug);
  };

  return (
    <div
      className={[
        // Glass surface — matches SqCard variant=glass recipe but flat
        // padding so we can lay out the header/footer rows precisely.
        'relative rounded-3xl bg-white/80 backdrop-blur-xl',
        'border border-white/60 shadow-sm font-cairo',
        'transition-all duration-150 hover:shadow-md hover:border-white/90',
        'flex flex-col p-5 gap-4',
        className,
      ].join(' ')}
      // Helps screen readers announce the card name + state.
      aria-label={`${name} — ${desc}`}
    >
      {/* ── Top row: icon tile + cost chip ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            'shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center',
            'shadow-sm',
            tokens.gradient,
          ].join(' ')}
          aria-hidden
        >
          <PowerupIcon
            slug={slug}
            size={24}
            className="text-white"
            strokeWidth={2.25}
          />
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <CostChip cost={entry.costSD} tokens={tokens} />
          {v2 && (
            <SqPill variant="warning" dot>
              {t('powerups.shop.coming_soon')}
            </SqPill>
          )}
        </div>
      </div>

      {/* ── Title + description ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-slate-900 leading-tight tracking-tight">
          {name}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
          {desc}
        </p>
      </div>

      {/* ── Bottom row: owned count + buy button ───────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          {maxed ? (
            <SqPill variant="success" dot>
              {`${owned}/${POWERUP_CAP}`}
            </SqPill>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <span className={`tabular-nums ${tokens.accentText}`}>{owned}</span>
              <span className="text-slate-400">/</span>
              <span className="tabular-nums text-slate-500">{POWERUP_CAP}</span>
            </span>
          )}
        </div>

        <SqButton
          variant="3d"
          tone="brand"
          size="sm"
          disabled={buttonDisabled}
          onClick={handleClick}
          // Native title — surfaces "Insufficient Stardust" on hover until a
          // Tooltip primitive lands.
          title={tooltip}
          aria-label={`${buttonLabel} — ${name}`}
        >
          {buttonLabel}
        </SqButton>
      </div>
    </div>
  );
};

export default PowerupCard;
