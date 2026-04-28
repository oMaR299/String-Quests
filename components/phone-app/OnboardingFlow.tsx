// OnboardingFlow — orchestrates the 5 v1 screens.
// Reads `phoneAppOnboardingStep` from UserContext, picks the right screen,
// drives the per-screen background tone, and wraps it in the slide-transition
// shell.

import React, { useEffect } from 'react';
import { useOnboardingState } from './useOnboardingState';
import { TransitionShell } from './TransitionShell';
import { PhoneShell } from './PhoneShell';
import { BrandIntro } from './screens/BrandIntro';
import { RolePick } from './screens/RolePick';
import { PainMultiSelect } from './screens/PainMultiSelect';
import { BiggestPainPick } from './screens/BiggestPainPick';
import { ParentAha } from './screens/ParentAha';

// Per-screen background — each screen lives in one accent family.
const BG_BY_STEP: Record<number, string> = {
  1: 'bg-phone-mint-50',     // Brand intro — fresh & welcoming
  2: 'bg-phone-cream-50',    // Role pick — warm
  3: 'bg-phone-sky-50',      // Pain multi-select — calm/reflective
  4: 'bg-phone-mint-50',     // Biggest pain — focused decision
  5: 'bg-phone-cream-50',    // Aha — celebratory warmth
};

export const OnboardingFlow: React.FC = () => {
  const { step, direction, painPoints, setStep } = useOnboardingState();

  // Guard: if a user persisted to step 4 but their pain selections are empty,
  // bounce them back to screen 3.
  useEffect(() => {
    if (step === 4 && painPoints.length === 0) {
      setStep(3, 'back');
    }
  }, [step, painPoints.length, setStep]);

  let screen: React.ReactNode;
  switch (step) {
    case 1: screen = <BrandIntro />; break;
    case 2: screen = <RolePick />; break;
    case 3: screen = <PainMultiSelect />; break;
    case 4: screen = <BiggestPainPick />; break;
    case 5: screen = <ParentAha />; break;
    default: screen = <BrandIntro />; break;
  }

  const bgClass = BG_BY_STEP[step] ?? 'bg-phone-mint-50';

  return (
    <PhoneShell bgClass={bgClass}>
      <div className="relative flex-1 flex flex-col">
        <TransitionShell screenKey={step} direction={direction}>
          {screen}
        </TransitionShell>
      </div>
    </PhoneShell>
  );
};

export default OnboardingFlow;
