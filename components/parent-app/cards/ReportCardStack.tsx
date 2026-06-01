// ReportCardStack.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fanned card stack for the Home Report Card. Renders the active subject in
// the center plus two peek cards (next + after-next) tilted slightly to each
// side, giving the "stack of papers on a desk" feel the user asked for.
//
// Interactions:
//   • Drag the active card horizontally → past the threshold flicks it away
//     and advances to the next subject. Wraps at the ends.
//   • Tap a peek card → jumps directly to it.
//   • Tap a dot below the stack → jumps to that index.
//
// Visual layout (LTR — mirrored in RTL via the `dir`-aware peek offsets):
//
//                    ┌─────────────┐
//             ┌─────────────┐       │
//        ┌───────────────┐ │       │   ← active card (center, no offset)
//        │               ├─┘       │   ← next card (peeks one side)
//        │   ACTIVE CARD │         │   ← after-next card (peeks the other)
//        │               │         │
//        └───────────────┘
//
// Each subject gets a deterministic "random-looking" rotation seed so the
// stack feels organic but re-renders don't shuffle the rotation. Reduced
// motion → cards animate instantly, no rotation effects, drag still works.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type { ReportCardSubject } from '../data/parentAppReportCardMock';
import { ReportCardRow } from './ReportCardRow';

// Drag thresholds — match the BottomSheet primitive for muscle-memory
// consistency across the parent-app.
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 500;

// Visible cards in the stack at any time (active + 2 peeks). Anything past
// this is fully hidden — keeps the DOM light even on long subject lists.
const VISIBLE_DEPTH = 2;

/**
 * Deterministic small rotation per subject (-3°..+3°). Same subject always
 * rotates the same way so the stack looks intentional, not jittery.
 */
function rotSeed(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  // Map into [-3, +3] degrees.
  return (h % 7) - 3;
}

interface CardLayout {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

/**
 * Resolve the layout for a card at a given offset from the active card.
 * Offsets:
 *   0  → active (center, full scale, slight seeded rotation)
 *   1  → next (peeks one side, scaled down, tilted away)
 *   2  → after-next (peeks the other side, more scaled down, more tilted)
 *  >2  → fully hidden behind the stack
 *  <0  → cards already passed (folded behind, low opacity)
 *
 * `mirror` flips the horizontal peek directions for RTL so the peek-on-left
 * in LTR becomes peek-on-right in RTL (matches reading-direction intuition).
 */
function resolveLayout(offset: number, seedDeg: number, mirror: boolean): CardLayout {
  const flip = mirror ? -1 : 1;
  if (offset === 0) {
    return {
      x: 0,
      y: 0,
      rotate: seedDeg * 0.4,
      scale: 1,
      opacity: 1,
      zIndex: 30,
    };
  }
  if (offset === 1) {
    return {
      x: -28 * flip,
      y: 10,
      rotate: -5 + seedDeg * 0.6,
      scale: 0.94,
      opacity: 0.9,
      zIndex: 20,
    };
  }
  if (offset === 2) {
    return {
      x: 28 * flip,
      y: 20,
      rotate: 6 + seedDeg * 0.6,
      scale: 0.88,
      opacity: 0.7,
      zIndex: 10,
    };
  }
  // Already passed — folded behind.
  return {
    x: 0,
    y: -10,
    rotate: seedDeg * 0.2,
    scale: 0.86,
    opacity: 0,
    zIndex: 0,
  };
}

export interface ReportCardStackProps {
  rows: ReportCardSubject[];
  /** Fixed height for the stack container — avoids the layout below
   *  jumping when card content varies in height. */
  heightPx?: number;
}

export const ReportCardStack: React.FC<ReportCardStackProps> = ({
  rows,
  heightPx = 360,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const total = rows.length;

  const advance = useCallback(() => {
    if (total === 0) return;
    setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  const retreat = useCallback(() => {
    if (total === 0) return;
    setActiveIdx((i) => (i - 1 + total) % total);
  }, [total]);

  // Drag commit — once distance OR velocity passes the threshold we advance
  // (any direction = next, mirrors the Tinder pattern the stack visual evokes).
  // Subtle direction tweak: dragging in the natural-forward reading direction
  // advances, dragging back retreats. Saves a "back" button for the user.
  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;
      const passed =
        Math.abs(offset) >= SWIPE_DISTANCE ||
        Math.abs(velocity) >= SWIPE_VELOCITY;
      if (!passed) return;
      if (dir === 'rtl') {
        if (offset < 0) advance();
        else retreat();
      } else {
        if (offset < 0) advance();
        else retreat();
      }
    },
    [advance, retreat, dir]
  );

  // Per-card layout — recompute when active index OR direction flips.
  const cardsToRender = useMemo(() => {
    const list: Array<{
      row: ReportCardSubject;
      idx: number;
      offset: number;
      layout: CardLayout;
    }> = [];
    for (let i = 0; i < total; i++) {
      const offset = i - activeIdx;
      // Render the active card, the next N peek cards, AND the previously-
      // active card (offset = -1) so the discarded card animates out instead
      // of vanishing instantly.
      if (offset < -1 || offset > VISIBLE_DEPTH) continue;
      const seed = rotSeed(rows[i].subject);
      list.push({
        row: rows[i],
        idx: i,
        offset,
        layout: resolveLayout(offset, seed, dir === 'rtl'),
      });
    }
    // Render order: lowest z first so React paints back-to-front. (CSS
    // z-index handles stacking too, but keeping React order matched helps
    // hit-test debugging.)
    return list.sort((a, b) => a.layout.zIndex - b.layout.zIndex);
  }, [rows, activeIdx, total, dir]);

  if (total === 0) return null;

  return (
    <div
      className="relative w-full"
      style={{ height: heightPx }}
      aria-label={t('parentApp.reportCard.title')}
      aria-roledescription="carousel"
    >
      {cardsToRender.map(({ row, idx, offset, layout }) => {
        const isActive = offset === 0;
        // Peek cards: tappable to jump-to. Passed card (offset=-1): not
        // tappable, fades out only.
        const isJumpable = offset > 0;
        return (
          <motion.div
            key={row.subject}
            className="absolute inset-0"
            initial={false}
            animate={{
              x: layout.x,
              y: layout.y,
              rotate: reduceMotion ? 0 : layout.rotate,
              scale: layout.scale,
              opacity: layout.opacity,
            }}
            transition={
              reduceMotion
                ? { duration: 0.1 }
                : { type: 'spring', stiffness: 260, damping: 26 }
            }
            style={{
              zIndex: layout.zIndex,
              touchAction: isActive ? 'pan-y' : 'auto',
              // Peek + passed cards shouldn't intercept clicks from the
              // active card except for the jump-to handler we attach below.
              pointerEvents: offset < 0 ? 'none' : 'auto',
            }}
            drag={isActive ? 'x' : false}
            dragConstraints={isActive ? { left: 0, right: 0 } : undefined}
            dragElastic={isActive ? 0.25 : 0}
            onDragEnd={isActive ? handleDragEnd : undefined}
            // Tap-to-jump on peek cards. Use onClick (not onTap from
            // framer-motion) so we don't compete with drag detection on
            // the active card.
            onClick={
              isJumpable
                ? () => setActiveIdx(idx)
                : undefined
            }
            role={isJumpable ? 'button' : undefined}
            aria-label={
              isJumpable
                ? `${row.subject} — ${t('parentApp.reportCard.title')}`
                : undefined
            }
          >
            {/* The inner card. We re-use ReportCardRow but the stack-level
                index is always 0 — the row's own entry animation is
                suppressed because the stack handles motion. */}
            <ReportCardRow row={row} index={0} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ReportCardStack;
