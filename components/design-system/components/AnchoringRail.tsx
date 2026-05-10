/**
 * sq-AnchoringRail — generalised vertical/horizontal scroll-spy rail.
 *
 * Lifted from `components/notification-admin/compose/AnchoringRail.tsx`,
 * but stripped of the section-tone coupling so any module can use it.
 * The active dot/pill morphs with `layoutId` for a smooth transition.
 *
 * Modes:
 *   - vertical (lg+)   : a column of dot+label rows, each with optional check
 *   - horizontal       : a horizontal scrollable pill bar
 *
 * RTL-safe: uses logical properties; the rail naturally flips to the
 * trailing edge under `dir="rtl"`.
 *
 * Reduced motion: disables the morph + entry animations.
 */

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Check, Circle } from 'lucide-react';

export interface SqRailSection {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** true = check, false = hollow, 'optional' = small "Optional" pill */
  complete: boolean | 'optional';
}

interface SqAnchoringRailProps {
  sections: SqRailSection[];
  activeId: string;
  onActivate: (id: string) => void;
  variant?: 'vertical' | 'horizontal';
  /** Sticky positioning offset for the horizontal variant. */
  sticky?: boolean;
  className?: string;
  /** Override the active accent (defaults to sq-brand). Tones are tailwind utilities. */
  activeBg?: string; // e.g. 'bg-sq-brand-500'
  activeHalo?: string; // e.g. 'bg-sq-brand-500/15'
  activeIconColor?: string; // e.g. 'text-sq-brand-700'
  checkBg?: string; // e.g. 'bg-sq-brand-500'
}

const DEFAULT_ACTIVE_BG = 'bg-sq-brand-500 shadow-sm shadow-violet-500/30';
const DEFAULT_HALO = 'bg-sq-brand-500/15';
const DEFAULT_ICON = 'text-sq-brand-700';
const DEFAULT_CHECK = 'bg-sq-brand-500 shadow-sm shadow-violet-500/30';

export const SqAnchoringRail: React.FC<SqAnchoringRailProps> = ({
  sections,
  activeId,
  onActivate,
  variant = 'vertical',
  sticky = true,
  className = '',
  activeBg = DEFAULT_ACTIVE_BG,
  activeHalo = DEFAULT_HALO,
  activeIconColor = DEFAULT_ICON,
  checkBg = DEFAULT_CHECK,
}) => {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Horizontal: keep active pill in view
  useEffect(() => {
    if (variant !== 'horizontal') return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activePill = scroller.querySelector<HTMLElement>(`[data-rail-pill="${activeId}"]`);
    if (activePill) {
      activePill.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeId, reduce, variant]);

  if (variant === 'vertical') {
    return (
      <nav
        className={`w-44 shrink-0 ${className}`}
        style={sticky ? { position: 'sticky', top: '0.5rem', alignSelf: 'flex-start' } : undefined}
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 w-px bg-slate-200/60"
            style={{ insetInlineStart: '0.5625rem' }}
          />
          <ul className="relative space-y-1.5">
            {sections.map((section) => {
              const isActive = section.id === activeId;
              const SectionIcon = section.icon;
              return (
                <li key={section.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onActivate(section.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`group relative w-full flex items-center gap-2.5 py-1.5 ps-6 pe-2 rounded-lg text-start font-cairo text-[13px] font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-brand-500/40 ${
                      isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span
                      className="absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
                      style={{ insetInlineStart: 0 }}
                      aria-hidden="true"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sq-rail-active-dot"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
                          }
                          className={`absolute w-[18px] h-[18px] rounded-full ${activeHalo}`}
                        />
                      )}
                      <span
                        className={`relative rounded-full transition-all duration-200 ${
                          isActive
                            ? `w-[10px] h-[10px] ${activeBg}`
                            : 'w-[8px] h-[8px] bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      />
                    </span>
                    {SectionIcon && (
                      <SectionIcon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${
                          isActive ? activeIconColor : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1 truncate">{section.label}</span>
                    <RailStatus complete={section.complete} checkBg={checkBg} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }

  // horizontal
  return (
    <nav
      className={`${
        sticky ? 'sticky top-0 z-20 bg-white/75 backdrop-blur-xl border-b border-slate-200' : ''
      } ${className}`}
    >
      <div className="px-4 sm:px-6 py-2.5">
        <div ref={scrollerRef} className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                data-rail-pill={section.id}
                onClick={() => onActivate(section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-cairo text-[12px] font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-brand-500/40 ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sq-rail-active-pill"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
                    }
                    className={`absolute inset-0 rounded-full ${activeBg}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative rounded-full w-[7px] h-[7px] ${
                    isActive ? 'bg-white' : 'bg-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="relative whitespace-nowrap">{section.label}</span>
                {section.complete === true && (
                  <span
                    className={`relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : `${checkBg} text-white`
                    }`}
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

const RailStatus: React.FC<{ complete: boolean | 'optional'; checkBg: string }> = ({
  complete,
  checkBg,
}) => {
  if (complete === 'optional') {
    return (
      <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
        Optional
      </span>
    );
  }
  if (complete) {
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-white ${checkBg}`}
        aria-hidden="true"
      >
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-4 h-4" aria-hidden="true">
      <Circle className="w-3 h-3 text-slate-300" strokeWidth={2} />
    </span>
  );
};

export default SqAnchoringRail;
