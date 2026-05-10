// useRotatingPhrase.ts
// ─────────────────────────────────────────────────────────────────────────────
// Picks a phrase from the supplied pool, avoiding the last 3 indices used
// during this mount. Behavior:
//
//   • Each mount picks a fresh phrase → "every time you open Home, something
//     new" works because navigating away unmounts the strip.
//   • Re-picks when `poolKey` changes (e.g. the time band shifts mid-session).
//   • Recent-history is stored in a ref so it survives re-renders within the
//     same mount but resets on remount (which is exactly what we want).
//
// If the pool size is ≤ 3, we relax the rule (otherwise we'd loop forever).
// Specifically: avoid only the most recent index when pool size ≤ 3, and
// pick freely when the pool has just 1 entry.

import { useMemo, useRef } from 'react';

const RECENT_WINDOW = 3;

export interface UseRotatingPhraseArgs<T = string> {
  /** The phrase pool to pick from. */
  pool: readonly T[];
  /**
   * A stable key that identifies the current pool. When it changes, the
   * recent-history is cleared and a fresh pick is made.
   * Example: the time band ('morning' / 'afternoon' / ...).
   */
  poolKey: string;
}

export function useRotatingPhrase<T = string>({
  pool,
  poolKey,
}: UseRotatingPhraseArgs<T>): T | undefined {
  // Recent indices used in this mount, newest first. Survives re-renders.
  const recentRef = useRef<number[]>([]);
  // The pool key the recent-history belongs to. If it changes, reset.
  const lastKeyRef = useRef<string>(poolKey);

  return useMemo(() => {
    if (!pool || pool.length === 0) return undefined;

    // Pool key changed → reset history so the new band starts clean.
    if (lastKeyRef.current !== poolKey) {
      recentRef.current = [];
      lastKeyRef.current = poolKey;
    }

    // How many of the most-recent indices we will avoid for this pool size.
    let avoidCount: number;
    if (pool.length <= 1) avoidCount = 0;
    else if (pool.length <= RECENT_WINDOW) avoidCount = 1;
    else avoidCount = RECENT_WINDOW;

    const avoid = new Set(recentRef.current.slice(0, avoidCount));

    // Build the candidate index list (everything not in `avoid`).
    const candidates: number[] = [];
    for (let i = 0; i < pool.length; i++) {
      if (!avoid.has(i)) candidates.push(i);
    }

    // Fallback: if we somehow filtered everything out, use the whole pool.
    const finalCandidates = candidates.length > 0 ? candidates : pool.map((_, i) => i);
    const pickedIndex = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

    // Push to the front of recent-history, trim to RECENT_WINDOW.
    recentRef.current = [pickedIndex, ...recentRef.current].slice(0, RECENT_WINDOW);

    return pool[pickedIndex];
    // We want a fresh pick when the pool identity OR the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, poolKey]);
}

export default useRotatingPhrase;
