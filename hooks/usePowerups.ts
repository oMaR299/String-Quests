/**
 * usePowerups — single hook surface for reading + mutating power-up inventory.
 *
 * Sibling agents (shop, loadout, HUD, end-screen) MUST go through this hook
 * rather than poking `useUser()` directly so the buy/consume cap-clip and
 * insufficient-stardust guards stay centralised.
 *
 * The reducer's BUY_POWERUP enforces:
 *   - silent cap-clip at POWERUP_CAP (10) — Stardust is still debited per backend spec
 *   - insufficient-Stardust → no-op (reducer drops the action; UI must guard for UX)
 *
 * `canAfford` is the UX-side check the shop should use to disable the buy button.
 */

import { useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  POWERUP_CATALOG,
  POWERUP_CAP,
  type PowerupSlug,
  type PowerupPhase,
} from '../data/mockPowerupsData';

export interface UsePowerupsApi {
  /** Owned counts per slug (read from UserContext). */
  inventory: Record<PowerupSlug, number>;
  /** Owned count for a single slug (0 if missing). */
  getOwned: (slug: PowerupSlug) => number;
  /** True iff the user has enough Stardust AND owned < POWERUP_CAP. */
  canAfford: (slug: PowerupSlug, balance?: number) => boolean;
  /** True iff `getOwned(slug) >= POWERUP_CAP`. */
  isMaxed: (slug: PowerupSlug) => boolean;
  /** Dispatches BUY_POWERUP — reducer guards insufficient-balance + cap-clips. */
  buy: (slug: PowerupSlug) => void;
  /** Dispatches CONSUME_POWERUP — decrements owned (floor 0). */
  consume: (slug: PowerupSlug) => void;
  /** Returns the activation phase for the slug. */
  activationPhase: (slug: PowerupSlug) => PowerupPhase;
  /** True iff the slug is v2 (backend mechanic not live yet). */
  isV2: (slug: PowerupSlug) => boolean;
}

export function usePowerups(): UsePowerupsApi {
  const { state, dispatch } = useUser();

  const inventory = state.powerups;

  const getOwned = useCallback(
    (slug: PowerupSlug) => inventory[slug] ?? 0,
    [inventory]
  );

  const canAfford = useCallback(
    (slug: PowerupSlug, balance?: number) => {
      const cost = POWERUP_CATALOG[slug].costSD;
      const sd = balance ?? state.stardust;
      const owned = inventory[slug] ?? 0;
      return sd >= cost && owned < POWERUP_CAP;
    },
    [inventory, state.stardust]
  );

  const isMaxed = useCallback(
    (slug: PowerupSlug) => (inventory[slug] ?? 0) >= POWERUP_CAP,
    [inventory]
  );

  const buy = useCallback(
    (slug: PowerupSlug) => {
      dispatch({ type: 'BUY_POWERUP', payload: { slug } });
    },
    [dispatch]
  );

  const consume = useCallback(
    (slug: PowerupSlug) => {
      dispatch({ type: 'CONSUME_POWERUP', payload: { slug } });
    },
    [dispatch]
  );

  const activationPhase = useCallback(
    (slug: PowerupSlug) => POWERUP_CATALOG[slug].phase,
    []
  );

  const isV2 = useCallback((slug: PowerupSlug) => POWERUP_CATALOG[slug].isV2, []);

  return {
    inventory,
    getOwned,
    canAfford,
    isMaxed,
    buy,
    consume,
    activationPhase,
    isV2,
  };
}

export default usePowerups;
