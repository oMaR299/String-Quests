// GreetingStrip.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The Parent Home page hero — a tall, time-of-day-aware greeting card. A
// rich vertical gradient + decorative SVG illustration that morphs across
// five bands (morning / afternoon / evening / night / late). The parent's
// salutation + a rotating editorial phrase overlay the scene.
//
// Layering (bottom → top):
//   1. Tailwind gradient backdrop (per band, static class map — JIT-safe)
//   2. <TimeOfDayScene band={...} /> SVG illustration
//   3. Bright-band tint (subtle dark wash on morning/afternoon) for legibility
//   4. Bottom vignette
//   5. Foreground content (date pill, salutation, rotating phrase)
//
// Cross-band transition: AnimatePresence keyed on `band`, mode="wait", soft
// fade ~600ms. Reduced-motion swaps instantly.
//
// AR/RTL: the parent flips us with `dir="rtl"` on the document root. We use
// logical properties for the foreground content so the date pill stays on
// the logical END and the text stays on the logical START. The SVG's
// viewBox is LTR-authored — to keep the celestial body on the END side in
// RTL, we mirror the SVG with `scale-x-[-1]` (mirror is purely cosmetic;
// the scene has no text).

import React, { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { interpolate } from '../parentAppI18n';
import type { TimeBand } from '../hooks/useTimeBand';
import { useTimeBand } from '../hooks/useTimeBand';
import { useRotatingPhrase } from '../hooks/useRotatingPhrase';
import {
  PHRASES,
  getSalutationTemplate,
} from '../data/parentAppGreetings';
import { pickSceneForBand, type OverlayWeight } from '../data/parentAppScenes';

// ─────────────────────────────────────────────────────────────────────────────
// Visual config — band-level fallback gradient + per-overlay-weight tint
// strength. The actual hero image is now picked from the scene catalog
// (see `parentAppScenes.ts`) which rotates day-to-day so the strip feels
// alive without requiring real weather data. Every class string is a
// literal so Tailwind v4's JIT picks them up at build time.
// ─────────────────────────────────────────────────────────────────────────────

interface BandFallback {
  /** Tailwind gradient shown before the image loads or if it 404s. Tuned to
   *  approximate the dominant color of the band's most-likely scene. */
  gradient: string;
  /** Bottom-anchored vignette to pull focus toward the salutation. */
  vignette: string;
}

const BAND_FALLBACK: Record<TimeBand, BandFallback> = {
  morning: {
    gradient: 'bg-gradient-to-br from-sky-200 via-blue-100 to-amber-100',
    vignette: 'bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent',
  },
  afternoon: {
    gradient: 'bg-gradient-to-br from-amber-300 via-orange-300 to-sky-300',
    vignette: 'bg-gradient-to-t from-orange-950/50 via-transparent to-transparent',
  },
  evening: {
    gradient: 'bg-gradient-to-br from-orange-400 via-rose-400 to-purple-600',
    vignette: 'bg-gradient-to-t from-purple-950/55 via-transparent to-transparent',
  },
  night: {
    gradient: 'bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-800',
    vignette: 'bg-gradient-to-t from-indigo-950/55 via-transparent to-transparent',
  },
  late: {
    gradient: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950',
    vignette: 'bg-gradient-to-t from-black/55 via-transparent to-transparent',
  },
};

/** Per-scene overlay strength → Tailwind class. Bright photos (sunny day,
 *  snowy day) need heavy darkening for white text contrast; already-dark
 *  night photos need only a light wash. */
const OVERLAY_CLASS: Record<OverlayWeight, string> = {
  light: 'bg-gradient-to-b from-slate-900/15 via-slate-900/10 to-slate-900/35',
  medium: 'bg-gradient-to-b from-slate-900/30 via-slate-900/15 to-slate-900/45',
  heavy: 'bg-gradient-to-b from-slate-900/45 via-slate-900/25 to-slate-900/55',
};

interface GreetingStripProps {
  /** Optional parent display name. When missing/empty the salutation drops
   *  the comma + name gracefully. */
  parentName?: string;
}

export const GreetingStrip: React.FC<GreetingStripProps> = ({ parentName }) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const band = useTimeBand();
  const fallback = BAND_FALLBACK[band];
  // Day-of-year-deterministic scene pick from the catalog. Same day = same
  // scene; different days surface different scenes within the band's pool.
  const scene = useMemo(() => pickSceneForBand(band), [band]);
  const overlayClass = OVERLAY_CLASS[scene.overlay];
  // Date pill is plain text — no leading weather glyph. The per-band hero
  // photo already conveys time-of-day + weather.
  // All scenes need white-on-dark contrast (overlay enforces this), so the
  // text shadow is always the dark variant.
  const dark = true;

  // The pool of rotating phrases for this band+locale.
  const pool = useMemo(() => PHRASES[band][locale], [band, locale]);

  // Rotating pick. Re-rolls when the band or locale changes.
  const phrase = useRotatingPhrase({
    pool,
    poolKey: `${band}::${locale}`,
  });

  // Build the salutation. Drop name+comma if empty/whitespace.
  const trimmedName = (parentName ?? '').trim();
  const hasName = trimmedName.length > 0;
  const salutationTemplate = getSalutationTemplate(band, locale, hasName);
  const salutation = hasName
    ? interpolate(salutationTemplate, { name: trimmedName })
    : salutationTemplate;

  // Locale-aware date for the pill: e.g. "الإثنين، ٣٠ أبريل" or "Monday, April 30".
  const dateLabel = useMemo(() => {
    const intlLocale = locale === 'ar' ? 'ar' : 'en-US';
    try {
      return new Intl.DateTimeFormat(intlLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date());
    } catch {
      // Defensive fallback if Intl chokes on the locale tag.
      return new Date().toDateString();
    }
  }, [locale]);

  // RTL flips the photo horizontally so the focal subject (Petra Treasury,
  // Amman skyline, etc.) lands on the logical END (= visual left in RTL).
  // The foreground is start-aligned and flips for free with the `dir="rtl"`
  // from the document root.
  const sceneFlipClass = dir === 'rtl' ? 'scale-x-[-1]' : '';

  // Subtle drop-shadow for white text — adds depth + readability over
  // varied photo backdrops. The overlay handles the bulk of contrast.
  const textShadow = dark
    ? { textShadow: '0 1px 2px rgba(15, 7, 38, 0.55)' }
    : { textShadow: '0 1px 2px rgba(124, 45, 18, 0.45)' };

  return (
    <motion.section
      aria-label="Greeting"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 22 }
      }
      className="relative overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.18)] min-h-[200px]"
    >
      {/* Layer 1-3: fallback gradient → real Jordan-themed photo → overlay
          tint (per-scene strength) → bottom vignette. Cross-fades when
          either the band OR the scene id changes. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeInOut' }}
          className={`absolute inset-0 ${fallback.gradient}`}
        >
          {/* Real photo. If the file is missing the fallback gradient shows
              through. Mirrored in RTL so the focal subject lands on the
              logical end. */}
          <img
            src={scene.file}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover ${sceneFlipClass}`}
            onError={(e) => {
              // Hide the broken-image icon if the file isn't there yet —
              // fallback gradient remains visible.
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Overlay tint — strength tuned per scene so bright photos get a
              heavier wash (sunny day) and dark photos a lighter one (clear
              night). Ensures white foreground text reads across every scene. */}
          <div className={`absolute inset-0 ${overlayClass}`} />
          <div className={`absolute inset-0 ${fallback.vignette}`} />
        </motion.div>
      </AnimatePresence>

      {/* Layer 5: foreground content */}
      <div className="relative z-10 p-5 flex flex-col gap-3 min-h-[200px]">
        {/* Date pill — top, end-aligned via ms-auto. Plain date text — no
            leading icon (the hero photo already carries the time-of-day mood). */}
        <span
          className="self-end inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wide"
          style={textShadow}
        >
          {dateLabel}
        </span>

        {/* Salutation + rotating phrase — start-aligned, vertical stack
            anchored toward the bottom so the scene reads above. */}
        <div className="mt-auto">
          <motion.div
            key={`salut-${band}-${locale}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }
            }
            className="text-2xl font-black text-white leading-tight"
            style={textShadow}
          >
            {salutation}
          </motion.div>
          {phrase && (
            <motion.div
              key={`phrase-${phrase}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.45, ease: 'easeOut', delay: 0.05 }
              }
              className="mt-2 text-base font-semibold text-white/95 leading-snug"
              style={textShadow}
            >
              {phrase}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default GreetingStrip;
