// GardenHero.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 0 of the Parent Skill Map — the signature visual. A flat "garden"
// scene: a calm, very-light sky, a soft ground line, and one GardenPlant per
// subject (6, fixed order: math, arabic, science, english, art, pe). Each
// plant's growth stage encodes its mastery, and wilting subjects droop + sway
// so a parent spots "where help is needed" in ~3 seconds.
//
// CLEAN FLAT house rules: flat vector ground/sky, generous white space, no 3D,
// no drop-shadow stacks, no emoji of our own (the localized summary copy may
// itself contain an emoji — that lives in the locked i18n file, not here).
//
// Above the scene sits a single bold STATUS SUMMARY line, chosen by the
// needs-help count (computed via `isWilting`):
//   0  → gardenSummaryHealthy   ({name})
//   1  → gardenSummary          ({name})
//   ≥2 → gardenSummaryMany      ({name} + {n})
//
// RTL: the parent document sets `dir="rtl"`. The plant row uses normal flex
// flow so it mirrors for free; the flat ground SVG is horizontally symmetric
// so it needs no mirroring. Cairo font + duo/pastel tokens come from the
// document root.

import React, { useMemo } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';
import { isWilting } from './skillMapCoaching';
import { GardenPlant } from './GardenPlant';

// ─────────────────────────────────────────────────────────────────────────────
// Flat scene backdrop — a calm light sky + a soft rolling ground band. Pure
// SVG, single soft gradient on the sky only (kept very light per the flat
// aesthetic), flat fills everywhere else. Sits BEHIND the plant row.
// ─────────────────────────────────────────────────────────────────────────────

const SceneBackdrop: React.FC = () => (
  <svg
    viewBox="0 0 400 200"
    preserveAspectRatio="none"
    className="absolute inset-0 h-full w-full"
    aria-hidden="true"
  >
    <defs>
      {/* Faint flat sky wash — barely there, keeps the hero light + premium. */}
      <linearGradient id="garden-sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#F0F9FF" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="400" height="200" fill="url(#garden-sky)" />

    {/* Back ground band — a soft hill behind the plants. */}
    <path
      d="M 0 168 Q 100 150 200 162 T 400 156 L 400 200 L 0 200 Z"
      fill="#DCFCE7"
    />
    {/* Front ground band — the soil line the plants stand on. */}
    <path
      d="M 0 182 Q 120 170 240 180 T 400 178 L 400 200 L 0 200 Z"
      fill="#BBF7D0"
    />
    {/* Hairline ground edge for a crisp flat finish. */}
    <path
      d="M 0 182 Q 120 170 240 180 T 400 178"
      fill="none"
      stroke="#86EFAC"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Status summary line resolution
// ─────────────────────────────────────────────────────────────────────────────

function resolveSummary(
  locale: 'ar' | 'en',
  childName: string,
  needsHelp: number
): string {
  let key: string;
  if (needsHelp <= 0) key = 'parentApp.skillMap.gardenSummaryHealthy';
  else if (needsHelp === 1) key = 'parentApp.skillMap.gardenSummary';
  else key = 'parentApp.skillMap.gardenSummaryMany';

  return interpolate(getParentAppString(locale, key), {
    name: childName,
    n: needsHelp,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

export interface GardenHeroProps {
  /** All 6 areas, fixed order (math, arabic, science, english, art, pe). */
  areas: ParentSkillArea[];
  /** Already-localized child name. */
  childName: string;
  onPlantTap?: (subjectKey: string) => void;
}

export const GardenHero: React.FC<GardenHeroProps> = ({
  areas,
  childName,
  onPlantTap,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();

  const needsHelp = useMemo(
    () => areas.filter((a) => isWilting(a)).length,
    [areas]
  );

  const summary = useMemo(
    () => resolveSummary(locale, childName, needsHelp),
    [locale, childName, needsHelp]
  );

  // Summary entrance — a soft rise, after the plants begin to sprout. Color
  // leans calm-green when all is well, warm-amber when areas need a hand, so
  // the line reinforces the garden at a glance.
  const summaryTone =
    needsHelp <= 0 ? 'text-emerald-700' : 'text-amber-700';

  const summaryMotion: {
    initial: false | { opacity: number; y: number };
    transition: Transition;
  } = reduceMotion
    ? { initial: false, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 6 },
        transition: { duration: 0.4, ease: 'easeOut', delay: 0.1 },
      };

  return (
    <section
      aria-label={summary}
      className="flex flex-col gap-3"
    >
      {/* Status summary line — plain text, bold, color-toned by health. */}
      <motion.p
        initial={summaryMotion.initial}
        animate={{ opacity: 1, y: 0 }}
        transition={summaryMotion.transition}
        className={`px-1 text-center text-base font-extrabold leading-snug ${summaryTone}`}
      >
        {summary}
      </motion.p>

      {/* The flat garden scene. */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-white">
        <SceneBackdrop />

        {/* Plant row — wraps to a clean 3×2 grid on narrow mobile (390–414px)
            and spreads to a single row when there's width. Normal flex flow
            mirrors automatically in RTL. */}
        <div className="relative z-10 flex flex-wrap items-end justify-center gap-x-1 gap-y-2 px-2 pb-4 pt-5 sm:gap-x-3">
          {areas.map((area, i) => (
            <GardenPlant
              key={area.id}
              area={area}
              index={i}
              onTap={() => onPlantTap?.(area.subjectKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GardenHero;
