/**
 * useActiveSection
 *
 * IntersectionObserver-based scroll-spy hook for the AnchoringRail.
 *
 * Tracks which DOM element (by id) is closest to the viewport center and
 * returns its id as `activeId`. Designed to work both inside an internal
 * scroll container (Compose form is in `overflow-y-auto`) and against the
 * window root.
 *
 * Tuning (chosen deliberately, do not "simplify"):
 *   - rootMargin: '-40% 0px -40% 0px'
 *       Compresses the observation band to the middle 20% of the viewport
 *       so a section is only "active" when it actually sits under the
 *       reader's focal point. Avoids the classic scroll-spy bug where the
 *       LAST section can never light up because earlier ones still
 *       intersect the top of the viewport.
 *   - threshold: [0, 0.25, 0.5, 0.75, 1]
 *       Multiple thresholds so we get re-fired entries as a section
 *       partially scrolls in/out, letting us pick the one whose center
 *       is nearest to the viewport center for a stable active state.
 */

import type React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseActiveSectionOptions {
  /** Section ids to observe, in document order. */
  sectionIds: string[];
  /** Optional scroll container; falls back to viewport. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Defaults to first id once it mounts. */
  defaultId?: string;
}

export function useActiveSection({
  sectionIds,
  containerRef,
  defaultId,
}: UseActiveSectionOptions): string {
  const [activeId, setActiveId] = useState<string>(defaultId ?? sectionIds[0] ?? '');
  // Track the most recent intersection ratio per id so we can pick the
  // best candidate even when several sections intersect simultaneously.
  const ratiosRef = useRef<Map<string, number>>(new Map());

  const pickBest = useCallback(() => {
    let bestId = '';
    let bestRatio = -1;
    ratiosRef.current.forEach((ratio, id) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    });
    if (bestId && bestRatio > 0) {
      setActiveId((prev) => (prev === bestId ? prev : bestId));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    const root = containerRef?.current ?? null;

    // Reset ratios on mount / when ids change.
    ratiosRef.current = new Map(sectionIds.map((id) => [id, 0]));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          // If completely out of band, mark zero so it can't win.
          ratiosRef.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        pickBest();
      },
      {
        root,
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const elements: HTMLElement[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    // If nothing intersects at mount (e.g. user lands at top, first
    // section is above the band), fall back to first id so the rail
    // doesn't render empty.
    const fallbackTimer = window.setTimeout(() => {
      let anyActive = false;
      ratiosRef.current.forEach((r) => {
        if (r > 0) anyActive = true;
      });
      if (!anyActive) setActiveId(defaultId ?? sectionIds[0]);
    }, 80);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
    // We intentionally re-run when section list identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join('|'), containerRef, pickBest]);

  return activeId;
}
