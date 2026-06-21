// DailyStoryStack.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Swipeable deck for the Daily Story cards. Only the FRONT card is fully shown;
// the upcoming cards peek as thin colored slivers STACKED AT THE TOP. Swipe the
// front card sideways to advance (it flies away, the next card slides forward);
// tap a peeking card — or a dot — to jump straight to it.
//
// Mirrors the interaction of the Home report-card stack (ReportCardStack) for
// muscle-memory consistency, but with top-peeks instead of side-fan, per the
// design ask.
//
// Cards differ in height (the school card with a teacher note is tall; the
// proud-moment card is short), so the deck measures the active card and
// animates its own height to fit — no jumping of the content below.

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import type { DailyStoryCard as CardData } from '../data/parentAppDailyStoryMock';
import { DailyStoryCard } from './DailyStoryCard';
import { PremiumGate } from './PremiumGate';

// Commit thresholds — same as BottomSheet / ReportCardStack.
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 500;

// Headroom above the active card for the peeking tops, and per-card peek step.
const HEADROOM = 26;
const PEEK_STEP = 11;
const VISIBLE_DEPTH = 2; // how many upcoming cards peek behind the front one

interface Layout {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
  z: number;
}

function resolveLayout(offset: number, flip: number): Layout {
  // Active card — front and center.
  if (offset === 0) return { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, z: 50 };
  // Upcoming cards — peek at the top, progressively smaller + higher.
  if (offset > 0) {
    const c = Math.min(offset, VISIBLE_DEPTH + 1);
    return {
      x: 0,
      y: -PEEK_STEP * c,
      scale: 1 - 0.05 * c,
      opacity: offset <= VISIBLE_DEPTH ? 1 : 0,
      rotate: 0,
      z: 50 - offset,
    };
  }
  // Passed card — flung off to the side and faded.
  return { x: -340 * flip, y: 0, scale: 0.96, opacity: 0, rotate: -6 * flip, z: 60 };
}

export interface DailyStoryStackProps {
  cards: CardData[];
  /** Whether the selected day is finalized ("اكتمل اليوم"). */
  complete: boolean;
}

export const DailyStoryStack: React.FC<DailyStoryStackProps> = ({ cards, complete }) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion() ?? false;
  const flip = dir === 'rtl' ? -1 : 1;

  const [activeIdx, setActiveIdx] = useState(0);
  const total = cards.length;

  // Measure the active card so the deck height fits it (no content jumping).
  const activeRef = useRef<HTMLDivElement>(null);
  const [activeH, setActiveH] = useState(460);
  useLayoutEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    const measure = () => setActiveH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIdx, locale, total]);

  const advance = useCallback(() => {
    if (total > 0) setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const passed =
        Math.abs(info.offset.x) >= SWIPE_DISTANCE || Math.abs(info.velocity.x) >= SWIPE_VELOCITY;
      if (passed) advance();
    },
    [advance]
  );

  const rendered = useMemo(() => {
    const list: Array<{ card: CardData; idx: number; offset: number; layout: Layout }> = [];
    for (let i = 0; i < total; i++) {
      const offset = i - activeIdx;
      if (offset < -1 || offset > VISIBLE_DEPTH) continue; // keep DOM light
      list.push({ card: cards[i], idx: i, offset, layout: resolveLayout(offset, flip) });
    }
    return list.sort((a, b) => a.layout.z - b.layout.z);
  }, [cards, activeIdx, total, flip]);

  if (total === 0) return null;

  return (
    <div className="space-y-3">
      {/* Deck */}
      <div
        className="relative"
        style={{
          height: HEADROOM + activeH,
          paddingTop: HEADROOM,
          transition: reduceMotion ? undefined : 'height 0.3s ease',
        }}
        aria-roledescription="carousel"
      >
        {rendered.map(({ card, idx, offset, layout }) => {
          const isActive = offset === 0;
          const isJumpable = offset > 0;
          return (
            <motion.div
              key={card.key}
              className="absolute inset-x-0"
              style={{
                top: HEADROOM,
                zIndex: layout.z,
                transformOrigin: 'top center',
                touchAction: isActive ? 'pan-y' : 'auto',
                pointerEvents: offset < 0 ? 'none' : 'auto',
                cursor: isJumpable ? 'pointer' : undefined,
              }}
              initial={false}
              animate={{
                x: layout.x,
                y: layout.y,
                scale: layout.scale,
                opacity: layout.opacity,
                rotate: reduceMotion ? 0 : layout.rotate,
              }}
              transition={reduceMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 260, damping: 28 }}
              drag={isActive ? 'x' : false}
              dragConstraints={isActive ? { left: 0, right: 0 } : undefined}
              dragElastic={isActive ? 0.3 : 0}
              onDragEnd={isActive ? handleDragEnd : undefined}
              onClick={isJumpable ? () => setActiveIdx(idx) : undefined}
              role={isJumpable ? 'button' : undefined}
              aria-hidden={offset < 0 || offset > VISIBLE_DEPTH}
            >
              <div ref={isActive ? activeRef : undefined}>
                <PremiumGate tier={card.tier}>
                  <DailyStoryCard card={card} complete={complete} inStack />
                </PremiumGate>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Position dots — tap to jump to any card */}
      <div className="flex items-center justify-center gap-1.5">
        {cards.map((c, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={locale === 'ar' ? c.titleAr : c.titleEn}
              aria-current={on}
              className="p-1 -m-1"
            >
              <span
                className="block rounded-full transition-all duration-200"
                style={{
                  width: on ? 20 : 7,
                  height: 7,
                  background: on ? c.accent : 'rgba(15,23,42,0.18)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyStoryStack;
