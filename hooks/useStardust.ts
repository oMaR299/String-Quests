/**
 * useStardust — single hook surface for the Stardust currency.
 *
 * Sibling agents should call this from any UI that displays or mutates the
 * Stardust balance (TopBar badge, shop header, "+SD" toasts, etc).
 * Mutations are routed through the UserContext reducer so the persisted
 * state stays canonical.
 *
 * `formatSD` is the canonical display formatter — keep it consistent across
 * the app so AR/EN both render the same shape (e.g. "240 SD").
 */

import { useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export interface UseStardustApi {
  balance: number;
  earn: (amount: number) => void;
  spend: (amount: number) => void;
  formatSD: (n: number) => string;
}

export function useStardust(): UseStardustApi {
  const { state, dispatch } = useUser();

  const earn = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      dispatch({ type: 'EARN_STARDUST', payload: { amount } });
    },
    [dispatch]
  );

  const spend = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      dispatch({ type: 'SPEND_STARDUST', payload: { amount } });
    },
    [dispatch]
  );

  const formatSD = useCallback((n: number) => `${n} SD`, []);

  return {
    balance: state.stardust,
    earn,
    spend,
    formatSD,
  };
}

export default useStardust;
