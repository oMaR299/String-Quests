// ParentOnboardingLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Top-level entry for `/parent/*`. Owns the onboarding state hook and routes
// the active screen. Each screen uses a render-prop (renderShell) so this
// layout stays in control of the shell + transitions.
//
// We intentionally don't sync `state.step` with the URL on every change in
// v1 — the spec calls for in-memory state only and a single `/parent/*`
// wildcard. URL sub-paths could be added later if deep-linking matters.

import React, { useCallback, useEffect } from 'react';
import { PhoneShell } from './PhoneShell';
import { BackButton } from './BackButton';
import { LocaleToggle } from './LocaleToggle';
import { StepIndicator } from './StepIndicator';
import { TransitionShell } from './TransitionShell';
import { useParentOnboardingState, stepIndex } from './useParentOnboardingState';
import { PhoneScreen } from './screens/PhoneScreen';
import { OtpScreen } from './screens/OtpScreen';
import { ConnectChildScreen } from './screens/ConnectChildScreen';
import { ChildrenListScreen } from './screens/ChildrenListScreen';
import { useI18n } from '../../contexts/I18nContext';

export const ParentOnboardingLayout: React.FC = () => {
  const { dir } = useI18n();
  const {
    state,
    setCountry,
    setPhone,
    setOtpVerified,
    addChild,
    removeChild,
    next,
    back,
    goto,
  } = useParentOnboardingState();

  // Mirror dir on the document root so any global behavior (scrollbars,
  // input cursor placement) follows the locale. AppShell does this for the
  // main app — this layout is mounted outside AppShell so we re-do it here.
  useEffect(() => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = dir;
    return () => {
      document.documentElement.dir = previous;
    };
  }, [dir]);

  // Auto-advance after a successful child link on the connect screen. We
  // watch the children count and the active step.
  const childrenCount = state.children.length;
  useEffect(() => {
    if (state.step === 'connect' && childrenCount > 0) {
      // Small grace period so the success tick / button transitions can
      // breathe before the screen swaps out.
      const id = window.setTimeout(() => {
        goto('list');
      }, 550);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state.step, childrenCount, goto]);

  // Handlers wired to each screen
  const handlePhoneSubmit = useCallback(
    (phone: string) => {
      setPhone(phone);
      next();
    },
    [next, setPhone]
  );

  const handleOtpVerified = useCallback(() => {
    setOtpVerified(true);
    next();
  }, [next, setOtpVerified]);

  const handleAddAnother = useCallback(() => {
    goto('connect');
  }, [goto]);

  const renderActiveScreen = () => {
    switch (state.step) {
      case 'phone':
        return (
          <PhoneScreen
            initialPhone={state.phone}
            country={state.country}
            onCountryChange={setCountry}
            onSubmit={handlePhoneSubmit}
            renderShell={({ body, bottom }) => (
              <PhoneShell
                topStart={null /* no back from the first screen */}
                topCenter={<StepIndicator current={state.step} />}
                topEnd={<LocaleToggle />}
                bottom={bottom}
              >
                {body}
              </PhoneShell>
            )}
          />
        );
      case 'otp':
        return (
          <OtpScreen
            phone={state.phone}
            country={state.country}
            onChangePhone={back}
            onVerified={handleOtpVerified}
            renderShell={({ body, bottom }) => (
              <PhoneShell
                topStart={<BackButton onClick={back} />}
                topCenter={<StepIndicator current={state.step} />}
                topEnd={<LocaleToggle />}
                bottom={bottom}
              >
                {body}
              </PhoneShell>
            )}
          />
        );
      case 'connect':
        return (
          <ConnectChildScreen
            childrenCount={childrenCount}
            onAddChild={addChild}
            renderShell={({ body, bottom }) => (
              <PhoneShell
                topStart={
                  <BackButton
                    onClick={() => {
                      // If we already have at least one child linked, "back"
                      // should take us to the list rather than re-prompting
                      // for OTP (the user has already verified).
                      if (childrenCount > 0) {
                        goto('list');
                      } else {
                        back();
                      }
                    }}
                  />
                }
                topCenter={<StepIndicator current={state.step} />}
                topEnd={<LocaleToggle />}
                bottom={bottom}
              >
                {body}
              </PhoneShell>
            )}
          />
        );
      case 'list':
        return (
          <ChildrenListScreen
            children={state.children}
            onAddAnother={handleAddAnother}
            onRemoveChild={removeChild}
            renderShell={({ body, bottom, overlay }) => (
              <>
                <PhoneShell
                  topStart={<BackButton onClick={() => goto('connect')} />}
                  topCenter={<StepIndicator current={state.step} />}
                  topEnd={<LocaleToggle />}
                  bottom={bottom}
                >
                  {body}
                </PhoneShell>
                {overlay}
              </>
            )}
          />
        );
    }
  };

  return (
    <div dir={dir} className="font-cairo" data-step={state.step} data-step-index={stepIndex(state.step)}>
      <TransitionShell screenKey={state.step}>{renderActiveScreen()}</TransitionShell>
    </div>
  );
};

export default ParentOnboardingLayout;
