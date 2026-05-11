/**
 * Shared contract for cinematic in-question power-up effects.
 *
 * Every effect under `components/powerups/effects/` (Annihilate, Illuminate,
 * Warp, HeartLock, EraserSweep, RobotCursor) implements:
 *
 *   const Effect: React.FC<EffectComponentProps>
 *
 * The effect orchestrates its own pre → cast → post timing internally.
 * In the post phase it MUST:
 *   1. Call `consumePowerup(slug)` (UserContext)
 *   2. Dispatch the slug-specific QuizSession action (APPLY_5050,
 *      REVEAL_HINT_FREE, SKIP_QUESTION, ARM_SECOND_CHANCE, REGEN_HEART
 *      via UserContext, AUTO_COMPLETE_QUESTION)
 *   3. Optionally `playSfx(...)` (auto-no-op when sfxEnabled is false)
 *   4. Call `props.onComplete()` so the overlay dequeues
 *
 * Reduced-motion path: skip particles, skip sound, do pre 0 ms / cast 200 ms /
 * post 0 ms — state mutation still fires.
 */

import type { CastEntry } from '../../../contexts/QuizSessionContext';

export interface EffectComponentProps {
  /** The cast entry being played out. */
  entry: CastEntry;
  /**
   * Called by the effect once its post phase completes its state mutations.
   * The overlay then dispatches DEQUEUE_CAST.
   */
  onComplete: () => void;
  /**
   * Bounding rect of the correct-answer option tile, captured by
   * QuizSessionPage from a ref forwarded through QuizCard. Spatial effects
   * (RobotCursor walk path) target this point. `null` when unknown
   * (non-multi-choice question types) — effects fall back to the viewport
   * center.
   */
  correctAnswerRect?: DOMRect | null;
}

export type EffectPhase = 'pre' | 'cast' | 'post';
