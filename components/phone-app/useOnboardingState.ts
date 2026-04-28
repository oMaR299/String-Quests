// Phone App onboarding — state hook
// Wraps UserContext actions in a small, screen-friendly API.
// All state is persisted via UserContext's existing localStorage layer.

import { useCallback, useMemo, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useSounds } from '../../hooks/useSounds';
import { PARENT_PAINS, type PainPoint } from './phoneAppMockData';

export type OnboardingDirection = 'forward' | 'back';

export function useOnboardingState() {
  const { state, dispatch } = useUser();
  const [direction, setDirection] = useState<OnboardingDirection>('forward');

  const step = state.phoneAppOnboardingStep;
  const role = state.phoneAppRole;
  const painPoints = state.phoneAppPainPoints;
  const biggestPain = state.phoneAppBiggestPain;
  const muted = state.phoneAppMuted;

  const setStep = useCallback((nextStep: number, dir: OnboardingDirection = 'forward') => {
    setDirection(dir);
    dispatch({ type: 'SET_PHONE_APP_STEP', payload: nextStep });
  }, [dispatch]);

  const next = useCallback(() => {
    setDirection('forward');
    dispatch({ type: 'SET_PHONE_APP_STEP', payload: Math.min(5, step + 1) });
  }, [dispatch, step]);

  const back = useCallback(() => {
    setDirection('back');
    dispatch({ type: 'SET_PHONE_APP_STEP', payload: Math.max(1, step - 1) });
  }, [dispatch, step]);

  const setRole = useCallback((r: 'student' | 'parent' | 'teacher' | null) => {
    dispatch({ type: 'SET_PHONE_APP_ROLE', payload: r });
  }, [dispatch]);

  const togglePain = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PHONE_APP_PAIN', payload: id });
  }, [dispatch]);

  const setBiggestPain = useCallback((id: string | null) => {
    dispatch({ type: 'SET_PHONE_APP_BIGGEST_PAIN', payload: id });
  }, [dispatch]);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'SET_PHONE_APP_MUTED', payload: !muted });
  }, [dispatch, muted]);

  const reset = useCallback(() => {
    setDirection('back');
    dispatch({ type: 'RESET_PHONE_APP_ONBOARDING' });
  }, [dispatch]);

  // Derive the picked PainPoint objects in original PARENT_PAINS order for screen 4.
  const pickedPainPoints: PainPoint[] = useMemo(
    () => PARENT_PAINS.filter(p => painPoints.includes(p.id)),
    [painPoints],
  );

  return {
    // raw
    step,
    role,
    painPoints,
    biggestPain,
    muted,
    direction,
    // derived
    pickedPainPoints,
    // actions
    next,
    back,
    setStep,
    setRole,
    togglePain,
    setBiggestPain,
    toggleMute,
    reset,
  };
}

/**
 * Returns the same sound functions from `useSounds`, but each one is a no-op
 * when the user has muted the Phone App via UserContext.
 */
export function useSoundIfNotMuted() {
  const { state } = useUser();
  const sounds = useSounds();
  const muted = state.phoneAppMuted;

  return useMemo(() => {
    const guard = (fn: () => void) => () => {
      if (muted) return;
      try { fn(); } catch { /* noop */ }
    };
    return {
      playTransition:   guard(sounds.playTransition),
      playClick:        guard(sounds.playClick),
      playSoftDing:     guard(sounds.playSoftDing),
      playSuccessShort: guard(sounds.playSuccessShort),
      playCelebration:  guard(sounds.playCelebration),
      playSure:         guard(sounds.playSure),
      playUnsure:       guard(sounds.playUnsure),
      playGentleError:  guard(sounds.playGentleError),
      playPop:          guard(sounds.playPop),
      playHint:         guard(sounds.playHint),
    };
  }, [muted, sounds]);
}
