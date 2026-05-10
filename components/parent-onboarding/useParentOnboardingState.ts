// useParentOnboardingState.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the Parent Onboarding flow. A reducer hook with
// a small, explicit action surface. State lives entirely in React memory —
// no localStorage, no UserContext mutation, by deliberate choice. Refresh
// resets the demo cleanly.
//
// Step numbering follows the spec: phone (3) → otp (4) → connect (5) →
// list (6). The provider is responsible for routing the active screen off
// of `state.step`. NEXT advances to the next legal step *given* current
// state (e.g. NEXT from `connect` only advances to `list` if there is at
// least one child linked).

import { useReducer, useCallback } from 'react';
import { makeMockChildId } from './parentOnboardingMockData';
import { type Country, tryDetectCountry } from './countries';

export type OnboardingStep = 'phone' | 'otp' | 'connect' | 'list';

export interface OnboardingChild {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface OnboardingState {
  /** Selected country (drives prefix, format, validation, helper). */
  country: Country;
  /** National-number digits only (no spaces, no dial-code prefix). Length
   *  matches `country.digits` once the user has typed a full number. */
  phone: string;
  /** True after the mock OTP verification finishes. */
  otpVerified: boolean;
  /** Children the parent has linked so far. */
  children: OnboardingChild[];
  /** Active screen. */
  step: OnboardingStep;
}

/** Lazy initializer so we read the timezone once at mount, not on every render. */
function makeInitialState(): OnboardingState {
  return {
    country: tryDetectCountry(),
    phone: '',
    otpVerified: false,
    children: [],
    step: 'phone',
  };
}

type Action =
  | { type: 'SET_COUNTRY'; country: Country }
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'SET_OTP'; verified: boolean }
  | { type: 'ADD_CHILD'; nameAr: string; nameEn: string }
  | { type: 'REMOVE_CHILD'; id: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GOTO'; step: OnboardingStep }
  | { type: 'RESET' };

function nextStep(current: OnboardingStep): OnboardingStep {
  switch (current) {
    case 'phone':
      return 'otp';
    case 'otp':
      return 'connect';
    case 'connect':
      return 'list';
    case 'list':
      return 'list';
  }
}

function backStep(current: OnboardingStep): OnboardingStep {
  switch (current) {
    case 'phone':
      return 'phone';
    case 'otp':
      return 'phone';
    case 'connect':
      return 'otp';
    case 'list':
      // From the list back goes to connect — this is also the "add another"
      // affordance routes through.
      return 'connect';
  }
}

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'SET_COUNTRY':
      // When the country changes we deliberately clear `phone` — the digit
      // count and shape are different per country, so carrying digits across
      // would surface broken formatted output.
      return { ...state, country: action.country, phone: '' };
    case 'SET_PHONE':
      return { ...state, phone: action.phone };
    case 'SET_OTP':
      return { ...state, otpVerified: action.verified };
    case 'ADD_CHILD':
      return {
        ...state,
        children: [
          ...state.children,
          { id: makeMockChildId(), nameAr: action.nameAr, nameEn: action.nameEn },
        ],
      };
    case 'REMOVE_CHILD':
      return { ...state, children: state.children.filter((c) => c.id !== action.id) };
    case 'NEXT':
      return { ...state, step: nextStep(state.step) };
    case 'BACK':
      return { ...state, step: backStep(state.step) };
    case 'GOTO':
      return { ...state, step: action.step };
    case 'RESET':
      return makeInitialState();
  }
}

export interface UseParentOnboardingStateReturn {
  state: OnboardingState;
  setCountry: (country: Country) => void;
  setPhone: (phone: string) => void;
  setOtpVerified: (verified: boolean) => void;
  addChild: (nameAr: string, nameEn: string) => void;
  removeChild: (id: string) => void;
  next: () => void;
  back: () => void;
  goto: (step: OnboardingStep) => void;
  reset: () => void;
}

export function useParentOnboardingState(): UseParentOnboardingStateReturn {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const setCountry = useCallback(
    (country: Country) => dispatch({ type: 'SET_COUNTRY', country }),
    []
  );
  const setPhone = useCallback((phone: string) => dispatch({ type: 'SET_PHONE', phone }), []);
  const setOtpVerified = useCallback(
    (verified: boolean) => dispatch({ type: 'SET_OTP', verified }),
    []
  );
  const addChild = useCallback(
    (nameAr: string, nameEn: string) => dispatch({ type: 'ADD_CHILD', nameAr, nameEn }),
    []
  );
  const removeChild = useCallback((id: string) => dispatch({ type: 'REMOVE_CHILD', id }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const back = useCallback(() => dispatch({ type: 'BACK' }), []);
  const goto = useCallback((step: OnboardingStep) => dispatch({ type: 'GOTO', step }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    setCountry,
    setPhone,
    setOtpVerified,
    addChild,
    removeChild,
    next,
    back,
    goto,
    reset,
  };
}

/**
 * Step ordering used by the progress indicator.
 */
export const STEP_ORDER: OnboardingStep[] = ['phone', 'otp', 'connect', 'list'];

/**
 * 0-based index of `step` within the canonical order.
 */
export function stepIndex(step: OnboardingStep): number {
  return STEP_ORDER.indexOf(step);
}
