/**
 * sq-motion tokens.
 *
 * Spring presets + duration tokens. Every continuous animation in the
 * design system MUST guard on Framer Motion's `useReducedMotion()` and
 * provide a static fallback. The `MOTION_FALLBACK` value here exists so
 * consumers can `transition={reduce ? MOTION_FALLBACK : SQ_SPRING.snappy}`
 * without re-typing the `{ duration: 0 }` literal.
 */

import type { Transition } from 'framer-motion';

export const SQ_SPRING = {
  /** Default — light, predictable */
  gentle:  { type: 'spring', stiffness: 220, damping: 26, mass: 0.6 },
  /** Quick UI moves — chip / pill morph */
  snappy:  { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 },
  /** Springy hop — celebrate moments only */
  bouncy:  { type: 'spring', stiffness: 520, damping: 18, mass: 0.6 },
} as const satisfies Record<string, Transition>;

export const SQ_DURATION = {
  instant: 0,
  fast:    0.15,
  normal:  0.25,
  slow:    0.4,
} as const;

/** Use as `transition={reduce ? MOTION_FALLBACK : SQ_SPRING.snappy}` */
export const MOTION_FALLBACK: Transition = { duration: 0 };

export const SQ_MOTION_DOCS = [
  { token: 'spring.gentle', use: 'Default page/element entrance — light, predictable' },
  { token: 'spring.snappy', use: 'Pill/chip layout morphs — quick but not flashy' },
  { token: 'spring.bouncy', use: 'Celebratory micro-interactions only' },
  { token: 'duration.fast (150ms)',   use: 'Hover swaps, color tweaks' },
  { token: 'duration.normal (250ms)', use: 'Tab switches, panel reveals' },
  { token: 'duration.slow (400ms)',   use: 'Page enter/exit, hero reveals' },
];
