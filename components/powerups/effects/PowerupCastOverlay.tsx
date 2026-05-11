/**
 * PowerupCastOverlay — top-level orchestrator for cinematic power-up casts.
 *
 * Mounted once inside QuizSessionPage. Reads the head of
 * `quizState.powerupCastQueue`, looks up the matching effect component in the
 * registry, and renders it inside an error boundary + Suspense.
 *
 *   bar  → ENQUEUE_CAST → overlay sees head → renders effect → effect runs
 *   pre/cast/post → effect calls onComplete → overlay dispatches DEQUEUE_CAST.
 *
 * Layered at z-70, fixed inset-0, pointer-events-none (effects opt back in
 * if they need pointer hits — none of the foundation-chunk effects do).
 */

import React, { Suspense, useEffect } from 'react';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import type { EffectComponentProps } from './types';
import type { PowerupSlug } from '../../../data/mockPowerupsData';

/**
 * Lazy-load each effect — keeps the QuizSessionPage chunk lean and lets
 * Rollup emit one chunk per effect at production build. Static specifiers
 * are required (Rollup can't statically analyse a runtime variable path).
 *
 * The 6 stub files exist so missing-module errors can't bork the build
 * before the next chunk lands the real implementations; each stub mounts,
 * fires onComplete, returns null, so the cast queue can't lock either.
 */
const Annihilate = React.lazy(() => import('./Annihilate'));
const Illuminate = React.lazy(() => import('./Illuminate'));
const Warp = React.lazy(() => import('./Warp'));
const HeartLock = React.lazy(() => import('./HeartLock'));
const EraserSweep = React.lazy(() => import('./EraserSweep'));
const RobotCursor = React.lazy(() => import('./RobotCursor'));

const REGISTRY: Partial<Record<PowerupSlug, React.LazyExoticComponent<React.FC<EffectComponentProps>>>> = {
  fifty_fifty: Annihilate,
  hint_reveal: Illuminate,
  skip: Warp,
  second_chance: HeartLock,
  eraser: EraserSweep,
  auto_complete: RobotCursor,
};

/**
 * Inline error boundary so a single broken effect can't lock the whole quiz.
 * On any throw, dispatches the `onComplete` callback (which the overlay
 * routes to DEQUEUE_CAST) and renders nothing. Parent JSX keys this on
 * `entry.id` so a per-cast error can't poison subsequent casts.
 */
interface EffectErrorBoundaryProps {
  onComplete: () => void;
  children: React.ReactNode;
  // `key` declared here because the project's tsconfig combo loses React's
  // structural `Attributes` layer on class components.
  key?: React.Key;
}
interface EffectErrorBoundaryState {
  hasError: boolean;
}
class EffectErrorBoundary extends React.Component<EffectErrorBoundaryProps, EffectErrorBoundaryState> {
  // `declare` is required because the project sets `useDefineForClassFields:
  // false`, which loses the structural `props`/`state` typing on Component.
  declare props: EffectErrorBoundaryProps;
  declare state: EffectErrorBoundaryState;
  constructor(props: EffectErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): EffectErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[PowerupCastOverlay] effect threw:', error);
    this.props.onComplete();
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

interface PowerupCastOverlayProps {
  /** Bounding rect of the correct-answer tile (forwarded down to spatial effects). */
  correctAnswerRect?: DOMRect | null;
}

export const PowerupCastOverlay: React.FC<PowerupCastOverlayProps> = ({ correctAnswerRect }) => {
  const { state, dispatch } = useQuizSession();
  const entry = state.powerupCastQueue[0];
  const Effect = entry ? REGISTRY[entry.slug] : undefined;

  // Drain unknown-slug entries from an effect, never from render — render
  // dispatches are a StrictMode hazard (double-invocation can desync).
  useEffect(() => {
    if (entry && !Effect) {
      dispatch({ type: 'DEQUEUE_CAST' });
    }
  }, [entry?.id, Effect, dispatch]);

  if (!entry || !Effect) return null;

  const onComplete = () => dispatch({ type: 'DEQUEUE_CAST' });

  return (
    <div
      // z-70 sits above the QuizCard (z-30) but below modals (z-140).
      // pointer-events-none so the overlay never eats taps; effects that
      // need clicks can opt back in via their own subtree.
      className="fixed inset-0 z-[70] pointer-events-none"
      aria-hidden
    >
      {/* Keyed on entry.id so the boundary remounts per cast — a per-cast
          error can't poison subsequent casts. */}
      <EffectErrorBoundary key={entry.id} onComplete={onComplete}>
        <Suspense fallback={null}>
          <Effect
            entry={entry}
            onComplete={onComplete}
            correctAnswerRect={correctAnswerRect}
          />
        </Suspense>
      </EffectErrorBoundary>
    </div>
  );
};

export default PowerupCastOverlay;
