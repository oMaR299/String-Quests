// useTimeBand.ts
// ─────────────────────────────────────────────────────────────────────────────
// Returns the current time band based on the local clock. Bands are tuned to
// typical Jordan school-day rhythm (school 7:30am–2:30pm):
//
//   morning     hour < 11           (before-school + first lessons)
//   afternoon   11 ≤ hour < 16      (mid-day, end-of-school)
//   evening     16 ≤ hour < 20      (homework / family time)
//   night       20 ≤ hour < 22      (winding down)
//   late        hour ≥ 22 || hour < 6   (quiet)
//
// The hook re-evaluates every 60 seconds, so a parent who leaves Home open
// across a boundary (e.g. 10:59 → 11:00) sees the band update without a
// remount. SSR-safe: defaults to 'morning' until first effect tick.

import { useEffect, useState } from 'react';

export type TimeBand = 'morning' | 'afternoon' | 'evening' | 'night' | 'late';

function computeBand(hour: number): TimeBand {
  if (hour >= 22 || hour < 6) return 'late';
  if (hour < 11) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}

export function useTimeBand(): TimeBand {
  const [band, setBand] = useState<TimeBand>(() => computeBand(new Date().getHours()));

  useEffect(() => {
    // Recheck every minute so boundary crossings flip the band cleanly.
    const tick = () => setBand(computeBand(new Date().getHours()));
    tick(); // run once on mount in case the SSR-default is stale
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return band;
}

export default useTimeBand;
