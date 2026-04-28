/**
 * AnchoringRail
 *
 * Vertical scroll-spy rail for the Notifications Compose page (collapses
 * to a horizontal pill bar below `lg`). Lists each form section as a
 * dot + label, highlights the one currently in view, and smooth-scrolls
 * to a section on click with a brief landing flash on the target card.
 *
 * Visual identity is per-section: every dot/pill/check adopts the matching
 * SectionCard's tone (see `sectionTones.ts`) so the active state always
 * reads as "this section, in its own colour." The morphing `layoutId` still
 * lets Framer Motion animate the active marker between rail items — the
 * colour swap during morph reads as a subtle hue transition.
 *
 * RTL: uses logical properties (ms- / me- / inset-inline-start / end)
 * so the rail naturally flips to the right side under `dir="rtl"`.
 *
 * Reduced-motion: the morphing dot/pill collapses to an instant swap, the
 * dot grow-on-hover becomes a flat color change, and the staggered focus
 * pop is skipped. (Caret blink + heartbeat pulse are preview-side and are
 * already guarded in the preview components.)
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, Circle } from 'lucide-react';
import { useActiveSection } from './useActiveSection';
import { getSectionToneTokens } from './sectionTones';

export interface AnchoringRailSection {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
  /** True = green check; false = hollow dot; 'optional' = neutral pill */
  complete: boolean | 'optional';
}

interface AnchoringRailProps {
  sections: AnchoringRailSection[];
  locale?: 'ar' | 'en';
  /** Scroll container that holds the form. Defaults to viewport. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Called when a rail item is activated; parent triggers the flash. */
  onJump?: (id: string) => void;
  /**
   * Which presentation to render.
   *   - auto       — both, with internal hidden lg:block / lg:hidden guards (default)
   *   - vertical   — desktop vertical rail only
   *   - horizontal — mobile horizontal pill bar only
   *
   * Use the explicit variants when you need to mount the desktop and
   * mobile versions in different parts of the DOM (e.g. mobile pill
   * bar above the padded column, vertical rail beside the form).
   */
  variant?: 'auto' | 'vertical' | 'horizontal';
}

/* ─────────────────────────────────────────────────────────────────────
   Smooth-scroll helper
   ───────────────────────────────────────────────────────────────────── */

function scrollSectionIntoView(id: string, containerEl: HTMLElement | null) {
  const el = document.getElementById(id);
  if (!el) return;

  if (containerEl) {
    // Scroll within the internal container so the page header stays put.
    const containerRect = containerEl.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // Distance from container's top to the element's top, plus current
    // container scroll, minus a small breathing offset (also clears the
    // sticky mobile pill bar when present).
    const offset = elRect.top - containerRect.top + containerEl.scrollTop - 24;
    containerEl.scrollTo({ top: offset, behavior: 'smooth' });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Status icon (check / hollow / optional pill)
   The completion check adopts the section's own tone so completed items
   in the rail read as "this section is done" in the section's colour.
   ───────────────────────────────────────────────────────────────────── */

const StatusIcon: React.FC<{
  sectionId: string;
  complete: boolean | 'optional';
  locale: 'ar' | 'en';
}> = ({ sectionId, complete, locale }) => {
  const reduced = useReducedMotion();
  const tokens = getSectionToneTokens(sectionId);

  if (complete === 'optional') {
    return (
      <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
        {locale === 'ar' ? 'اختياري' : 'Optional'}
      </span>
    );
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      {complete ? (
        <motion.span
          key="check"
          initial={reduced ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: 'spring', stiffness: 520, damping: 22 }
          }
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-white ${tokens.checkBg}`}
          aria-hidden="true"
        >
          <Check className="w-2.5 h-2.5" strokeWidth={3} />
        </motion.span>
      ) : (
        <motion.span
          key="empty"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
          className="inline-flex items-center justify-center w-4 h-4"
          aria-hidden="true"
        >
          <Circle className="w-3 h-3 text-slate-300" strokeWidth={2} />
        </motion.span>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Vertical (lg+) rail
   ───────────────────────────────────────────────────────────────────── */

const VerticalRail: React.FC<{
  sections: AnchoringRailSection[];
  activeId: string;
  locale: 'ar' | 'en';
  onActivate: (id: string) => void;
  buttonsRef: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  navAriaLabel: string;
}> = ({ sections, activeId, locale, onActivate, buttonsRef, navAriaLabel }) => {
  const reduced = useReducedMotion();
  // Tokens for the *currently-active* section drive the morphing dot's
  // halo + fill so the colour follows the focal point.
  const activeTokens = getSectionToneTokens(activeId);

  return (
    <nav
      aria-label={navAriaLabel}
      role="navigation"
      className="hidden lg:block w-44 shrink-0"
      style={{
        // Sticky inside the form's scroll container; the parent column
        // already pads the top, so a tiny inset keeps the rail aligned
        // with the first SectionCard's header. The form scroll container
        // is what scrolls — the page header stays put outside.
        position: 'sticky',
        top: '0.5rem',
        alignSelf: 'flex-start',
      }}
    >
      <div className="relative">
        {/* Vertical hairline running through the dot centers. The dots
            are rendered on the start edge (right in RTL, left in LTR)
            and the line sits at the same inline offset, behind them. */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 w-px bg-slate-200/60"
          style={{ insetInlineStart: '0.5625rem' }}
        />

        <ul className="relative space-y-1.5">
          {sections.map((section, idx) => {
            const isActive = section.id === activeId;
            const Icon = section.icon;
            return (
              <li key={section.id} className="relative">
                <button
                  ref={(el) => {
                    buttonsRef.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => onActivate(section.id)}
                  aria-current={isActive ? 'location' : undefined}
                  aria-label={`${locale === 'ar' ? section.labelAr : section.labelEn}${
                    section.complete === true
                      ? locale === 'ar'
                        ? ' — مكتمل'
                        : ' — complete'
                      : ''
                  }`}
                  className={[
                    'group relative w-full flex items-center gap-2.5 py-1.5 ps-6 pe-2 rounded-lg',
                    'text-start font-cairo text-[13px] font-bold transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50',
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                >
                  {/* Dot (sits on the rail line). */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
                    style={{ insetInlineStart: 0 }}
                    aria-hidden="true"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-anchor-dot"
                        transition={
                          reduced
                            ? { duration: 0 }
                            : {
                                type: 'spring',
                                stiffness: 420,
                                damping: 32,
                                mass: 0.7,
                              }
                        }
                        className={`absolute w-[18px] h-[18px] rounded-full ${activeTokens.railDotHalo}`}
                      />
                    )}
                    <span
                      className={[
                        'relative rounded-full transition-all duration-200',
                        isActive
                          ? `w-[10px] h-[10px] ${activeTokens.railDot}`
                          : 'w-[8px] h-[8px] bg-slate-300 group-hover:w-[14px] group-hover:h-[14px] group-hover:bg-slate-400',
                      ].join(' ')}
                    />
                  </span>

                  {/* Tiny icon — extra visual hook, sits before label. */}
                  <Icon
                    className={[
                      'w-3.5 h-3.5 shrink-0 transition-colors duration-200',
                      isActive
                        ? activeTokens.railIconActive
                        : 'text-slate-400 group-hover:text-slate-600',
                    ].join(' ')}
                    aria-hidden="true"
                  />

                  <span className="flex-1 truncate">
                    {locale === 'ar' ? section.labelAr : section.labelEn}
                  </span>

                  <StatusIcon
                    sectionId={section.id}
                    complete={section.complete}
                    locale={locale}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Horizontal pill bar (below lg)
   Wrapped in a contained sticky strip so it doesn't float over the
   page wash. Pills adopt the active section's tone.
   ───────────────────────────────────────────────────────────────────── */

const HorizontalPillBar: React.FC<{
  sections: AnchoringRailSection[];
  activeId: string;
  locale: 'ar' | 'en';
  onActivate: (id: string) => void;
  navAriaLabel: string;
}> = ({ sections, activeId, locale, onActivate, navAriaLabel }) => {
  const reduced = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeTokens = getSectionToneTokens(activeId);

  // Keep the active pill visible inside the scroller.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activePill = scroller.querySelector<HTMLElement>(
      `[data-anchor-pill="${activeId}"]`,
    );
    if (activePill) {
      activePill.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeId, reduced]);

  return (
    <nav
      aria-label={navAriaLabel}
      role="navigation"
      // z-20 sits below the page header (z-30) so the header always
      // shadows over the rail when both are sticky.
      className="lg:hidden sticky top-0 z-20 bg-white/75 backdrop-blur-xl border-b border-slate-200"
    >
      <div className="px-4 sm:px-6 py-2.5">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex items-center gap-2 overflow-x-auto"
        >
          {sections.map((section) => {
            const isActive = section.id === activeId;
            const tokens = getSectionToneTokens(section.id);
            return (
              <button
                key={section.id}
                type="button"
                data-anchor-pill={section.id}
                onClick={() => onActivate(section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
                  'font-cairo text-[12px] font-bold transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-800 bg-slate-100',
                ].join(' ')}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-anchor-pill"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : {
                            type: 'spring',
                            stiffness: 420,
                            damping: 32,
                            mass: 0.7,
                          }
                    }
                    className={`absolute inset-0 rounded-full ${activeTokens.pillBg}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={[
                    'relative rounded-full transition-all duration-200',
                    isActive
                      ? 'w-[7px] h-[7px] bg-white'
                      : 'w-[7px] h-[7px] bg-slate-300',
                  ].join(' ')}
                  aria-hidden="true"
                />
                <span className="relative whitespace-nowrap">
                  {locale === 'ar' ? section.labelAr : section.labelEn}
                </span>
                {section.complete === true && (
                  <span
                    className={[
                      'relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full',
                      isActive
                        ? 'bg-white/25 text-white'
                        : `${tokens.pillCheckBg} text-white`,
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <Check className="w-2 h-2" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   AnchoringRail (root)
   ───────────────────────────────────────────────────────────────────── */

export const AnchoringRail: React.FC<AnchoringRailProps> = ({
  sections,
  locale = 'ar',
  containerRef,
  onJump,
  variant = 'auto',
}) => {
  const sectionIds = sections.map((s) => s.id);
  const activeId = useActiveSection({ sectionIds, containerRef });

  // Refs for arrow-key navigation in the vertical rail.
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const handleActivate = useCallback(
    (id: string) => {
      scrollSectionIntoView(id, containerRef?.current ?? null);
      onJump?.(id);
    },
    [containerRef, onJump],
  );

  // Arrow-key navigation across rail items (when one is focused).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const idx = buttonsRef.current.findIndex((b) => b === target);
      if (idx === -1) return;
      let next = -1;
      if (e.key === 'ArrowDown') next = (idx + 1) % buttonsRef.current.length;
      else if (e.key === 'ArrowUp')
        next = (idx - 1 + buttonsRef.current.length) % buttonsRef.current.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = buttonsRef.current.length - 1;
      if (next !== -1) {
        e.preventDefault();
        buttonsRef.current[next]?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navAriaLabel =
    locale === 'ar' ? 'التنقل بين أقسام الإشعار' : 'Compose section navigation';

  const showVertical = variant === 'auto' || variant === 'vertical';
  const showHorizontal = variant === 'auto' || variant === 'horizontal';

  return (
    <>
      {showVertical && (
        <VerticalRail
          sections={sections}
          activeId={activeId}
          locale={locale}
          onActivate={handleActivate}
          buttonsRef={buttonsRef}
          navAriaLabel={navAriaLabel}
        />
      )}
      {showHorizontal && (
        <HorizontalPillBar
          sections={sections}
          activeId={activeId}
          locale={locale}
          onActivate={handleActivate}
          navAriaLabel={navAriaLabel}
        />
      )}
    </>
  );
};

export default AnchoringRail;
