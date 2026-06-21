// widgetKit.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Pastel "widget" building blocks for the rebuilt hub. Colors are taken from the
// user's reference `image.png` (saturated-soft pastel card fills + a bolder icon
// chip); the widget shape (icon + big bold number) is from `image copy.png` /
// `image copy 2.png`. Runtime colors are applied inline (Tailwind v4 JIT can't
// see them). Flat, Cairo, RTL, reduced-motion aware.
//
// IMPORTANT: these pastel fills are DECORATION. The status meaning still lives in
// the mastery rings (STATUS_COLOR) — never use a pastel fill to encode status.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface PastelTone {
  /** Card background fill. */
  bg: string;
  /** Icon color (sits on a white chip). */
  icon: string;
}

/** Reference palette sampled from `image.png` (lavender/butter/mint/green/pink) + a sky. */
export const PASTEL: Record<'lavender' | 'butter' | 'mint' | 'green' | 'pink' | 'sky', PastelTone> = {
  lavender: { bg: '#ECE7FB', icon: '#8E7DE0' },
  butter: { bg: '#FFF3CC', icon: '#E0A100' },
  mint: { bg: '#D4F1E9', icon: '#1FA992' },
  green: { bg: '#DCF3C9', icon: '#5DAE2E' },
  pink: { bg: '#FBDCE7', icon: '#E2658F' },
  sky: { bg: '#DCEEFB', icon: '#3E97D6' },
};

// ─── Stat widget (icon + label + big bold number) ─────────────────────────────

export const StatWidget: React.FC<{
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  unit?: string;
  /** Tiny meaning line under the number (so a bare metric never stands alone). */
  sublabel?: string;
  tone: PastelTone;
  /** Optional top-end element (trophy/achievement badge, trend chip, mini-ring). */
  badge?: React.ReactNode;
  index?: number;
}> = ({ icon: Icon, label, value, unit, sublabel, tone, badge, index = 0 }) => {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 24, delay: index * 0.04 }}
      className="rounded-[26px] p-4 flex flex-col gap-3"
      style={{ background: tone.bg }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-9 h-9 rounded-2xl inline-flex items-center justify-center shrink-0 bg-white/70"
          style={{ color: tone.icon }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <span className="flex-1 min-w-0 text-[13px] font-extrabold text-slate-700 leading-tight truncate">
          {label}
        </span>
        {badge}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-1">
          <span className="text-[30px] font-black leading-none text-slate-800 tabular-nums">{value}</span>
          {unit && <span className="text-[12px] font-bold text-slate-500 pb-0.5">{unit}</span>}
        </div>
        {sublabel && <span className="text-[10.5px] font-bold text-slate-500/90 leading-tight">{sublabel}</span>}
      </div>
    </motion.div>
  );
};

// ─── Section header (eyebrow + title) ─────────────────────────────────────────

export const SectionHeader: React.FC<{ eyebrow?: string; title: string }> = ({ eyebrow, title }) => (
  <header className="flex flex-col gap-0.5 px-1">
    {eyebrow && (
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{eyebrow}</span>
    )}
    <h2 className="text-lg font-black text-slate-800 leading-tight text-start">{title}</h2>
  </header>
);

export default StatWidget;
