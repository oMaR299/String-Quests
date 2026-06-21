// PremiumGate.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Wrapper that decides whether a piece of the Daily Story is shown in full.
//
// v1 (now): everything is FREE. This is a pure pass-through — it renders its
// children untouched, no locks, no shimmer, no upgrade copy. The goal is to
// prove value first.
//
// Later: flipping PREMIUM_ENABLED to true (and marking some cards `tier:
// 'premium'`) turns this into the paywall — it can blur the child, overlay an
// "اشترك لرؤية التفاصيل" nudge, and route to an upgrade screen. Because every
// gate-able card is already wrapped here, enabling monetization is a one-flag
// change, not a refactor.

import React from 'react';
import type { CardTier } from '../data/parentAppDailyStoryMock';

/** Master switch. Keep false until monetization ships. */
export const PREMIUM_ENABLED = false;

export interface PremiumGateProps {
  tier: CardTier;
  children: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ tier, children }) => {
  // Free content, or premium not yet enabled → render as-is.
  if (!PREMIUM_ENABLED || tier === 'free') {
    return <>{children}</>;
  }

  // Future: locked premium content. Intentionally minimal for now — the real
  // blur/overlay/upgrade CTA lands with the monetization milestone.
  return <>{children}</>;
};

export default PremiumGate;
