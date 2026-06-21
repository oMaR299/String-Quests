// SubjectFlower.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The hub's centerpiece "performance flower" — a multi-HEART bloom (modeled on
// the user's clover/activity reference, in our branding). ONE heart petal per
// subject, arranged radially:
//   • petal shape  = a heart (point at the centre, lobes facing outward)
//   • petal colour = the subject's STATUS colour (green/blue/amber/rose)
//   • petal fill   = the subject's mastery % (fills from the visible outer lobes
//                    inward, over a faint full-heart track — so low scores still read)
//   • petal count  = number of the child's subjects (dynamic)
//   • tip label    = the subject glyph chip (so each petal is identified)
//   • centre       = the overall average %
//
// Pure SVG (one heart path rotated N times) + a per-petal vertical gradient with
// a hard stop at the mastery level. Inline colours (Tailwind v4 can't see runtime
// hex). Calm, minimal, reduced-motion aware.

import React, { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clamp } from '../data/mockKit';
import { STATUS_COLOR } from './skillMapKit';
import { resolveSubjectStyle } from './CoachingCard';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';

// A heart with its POINT at the centre (100,100) and the two rounded lobes
// facing outward (toward the top). Bbox ≈ x70..130, y30..100.
const HEART =
  'M100 100 C 92 82, 70 72, 70 50 C 70 34, 86 30, 100 44 C 114 30, 130 34, 130 50 C 130 72, 108 82, 100 100 Z';

const LABEL_R = 84; // radius for the glyph chips (just beyond the lobes)

export const SubjectFlower: React.FC<{ areas: ParentSkillArea[]; size?: number }> = ({
  areas,
  size = 212,
}) => {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, ''); // safe for SVG fragment ids
  const n = areas.length;

  const overall = useMemo(
    () => (n ? Math.round(areas.reduce((s, a) => s + a.masteryPct, 0) / n) : 0),
    [areas, n],
  );

  if (n === 0) return null;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="block"
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 18 }}
        aria-hidden="true"
      >
        <defs>
          {areas.map((a, i) => {
            const color = STATUS_COLOR[a.status];
            // Fill from the outer lobes (offset 0) inward toward the point by mastery.
            const frac = clamp(a.masteryPct / 100, 0, 1);
            return (
              <linearGradient key={a.id} id={`pf-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} stopOpacity={1} />
                <stop offset={frac} stopColor={color} stopOpacity={1} />
                <stop offset={frac} stopColor={color} stopOpacity={0} />
                <stop offset="1" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Heart petals */}
        {areas.map((a, i) => {
          const color = STATUS_COLOR[a.status];
          const angle = (360 / n) * i;
          return (
            <g key={a.id} transform={`rotate(${angle} 100 100)`}>
              <path d={HEART} fill={color} fillOpacity={0.18} stroke="#FFFFFF" strokeWidth={1.5} />
              <path d={HEART} fill={`url(#pf-${uid}-${i})`} />
            </g>
          );
        })}

        {/* Centre cap holding the overall number */}
        <circle cx="100" cy="100" r="28" fill="#FFFFFF" />

        {/* Subject glyph chips at each petal tip (upright, not rotated) */}
        {areas.map((a, i) => {
          const color = STATUS_COLOR[a.status];
          const glyph = resolveSubjectStyle(a.subjectKey).glyph;
          const rad = ((360 / n) * i * Math.PI) / 180;
          const lx = 100 + LABEL_R * Math.sin(rad);
          const ly = 100 - LABEL_R * Math.cos(rad);
          return (
            <g key={`lbl-${a.id}`}>
              <circle cx={lx} cy={ly} r={10.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
              <text
                x={lx}
                y={ly}
                dy="0.36em"
                textAnchor="middle"
                fontSize={11}
                fontWeight={900}
                fill="#FFFFFF"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              >
                {glyph}
              </text>
            </g>
          );
        })}
      </motion.svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[24px] font-black leading-none text-slate-800 tabular-nums">
          {overall}
          <span className="text-xs font-extrabold align-top">%</span>
        </span>
      </div>
    </div>
  );
};

export default SubjectFlower;
