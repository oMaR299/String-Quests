// parentAppScenes.ts
// ─────────────────────────────────────────────────────────────────────────────
// Catalog of the Jordan-themed hero scenes that render behind the GreetingStrip
// on Parent Home. Each scene is a real illustration in `/public/parent-app/
// hero/*.png` tagged with its time-of-day + weather mood. Until we wire real
// weather data the strip picks deterministically by day-of-year, so:
//
//   • The hero stays stable across navigation within a single day.
//   • Different days surface different scenes — variety without flicker.
//   • Time-of-day still drives the band-to-pool mapping (morning/afternoon
//     pull from "day" scenes, evening pulls from "sunset", night/late pull
//     from "night").
//
// When a real weather feed lands, swap `pickSceneForBand()` for a
// `pickSceneForBandAndWeather(band, currentWeather)` that filters the pool to
// the matching weather id and falls back to band-default if no match.

import type { TimeBand } from '../hooks/useTimeBand';

export type SceneTime = 'day' | 'sunset' | 'night';
export type SceneWeather =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'clear';

/** How heavy a dark overlay the foreground white text needs over this scene
 *  to stay legible. Bright/sunny photos = heavy. Already-dark night photos
 *  = light. Picked per-scene so we don't over-darken dramatic skies or
 *  under-darken bright Petra walls. */
export type OverlayWeight = 'light' | 'medium' | 'heavy';

export interface Scene {
  id: string;
  /** Path served from `public/`. */
  file: string;
  time: SceneTime;
  weather: SceneWeather;
  /** Foreground-text overlay strength. */
  overlay: OverlayWeight;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene catalog — each entry maps to a real .png in /public/parent-app/hero/.
// ─────────────────────────────────────────────────────────────────────────────

export const SCENES: Scene[] = [
  // Day variants — used by morning + afternoon bands.
  {
    id: 'sunny-day',
    file: '/parent-app/hero/sunny-day.png',
    time: 'day',
    weather: 'sunny',
    overlay: 'heavy',
  },
  {
    id: 'cloudy-day',
    file: '/parent-app/hero/cloudy-day.png',
    time: 'day',
    weather: 'cloudy',
    overlay: 'heavy',
  },
  {
    id: 'rainy-day',
    file: '/parent-app/hero/rainy-day.png',
    time: 'day',
    weather: 'rainy',
    overlay: 'medium',
  },
  {
    id: 'stormy-day',
    file: '/parent-app/hero/stormy-day.png',
    time: 'day',
    weather: 'stormy',
    overlay: 'light',
  },
  {
    id: 'snowy-day',
    file: '/parent-app/hero/snowy-day.png',
    time: 'day',
    weather: 'snowy',
    overlay: 'heavy',
  },
  {
    id: 'foggy-day',
    file: '/parent-app/hero/foggy-day.png',
    time: 'day',
    weather: 'foggy',
    overlay: 'medium',
  },

  // Sunset variants — used by the evening band.
  {
    id: 'sunset-clear',
    file: '/parent-app/hero/sunset-clear.png',
    time: 'sunset',
    weather: 'clear',
    overlay: 'medium',
  },
  // sunset-cloudy will land here when the user provides it.

  // Night variants — used by night + late bands.
  {
    id: 'clear-night',
    file: '/parent-app/hero/clear-night.png',
    time: 'night',
    weather: 'clear',
    overlay: 'light',
  },
  {
    id: 'cloudy-night',
    file: '/parent-app/hero/cloudy-night.png',
    time: 'night',
    weather: 'cloudy',
    overlay: 'light',
  },
  {
    id: 'rainy-night',
    file: '/parent-app/hero/rainy-night.png',
    time: 'night',
    weather: 'rainy',
    overlay: 'light',
  },
  {
    id: 'stormy-night',
    file: '/parent-app/hero/stormy-night.png',
    time: 'night',
    weather: 'stormy',
    overlay: 'light',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Time band → eligible scene-times mapping. Bands draw from the union of
// these times' scenes. Order in the array is purely cosmetic.
// ─────────────────────────────────────────────────────────────────────────────

const BAND_TIME_POOL: Record<TimeBand, SceneTime[]> = {
  morning: ['day'],
  afternoon: ['day'],
  evening: ['sunset', 'day'], // falls back to day if sunset pool is small
  night: ['night'],
  late: ['night'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Day-of-year (1..366), timezone-aware. Used as the rotation seed so the
 *  hero is stable within a single day but varies day-to-day. */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86_400_000);
}

/** Pick a scene for the given band. Deterministic by day-of-year so the
 *  same day always returns the same scene. */
export function pickSceneForBand(band: TimeBand, date: Date = new Date()): Scene {
  const allowedTimes = BAND_TIME_POOL[band];
  const pool = SCENES.filter((s) => allowedTimes.includes(s.time));
  // Defensive fallback — should never hit unless SCENES is empty.
  if (pool.length === 0) return SCENES[0];
  const idx = getDayOfYear(date) % pool.length;
  return pool[idx];
}

/** Look up a scene by its id (for forced-override scenarios — dev tools,
 *  weather feeds). Returns null if not found. */
export function getSceneById(id: string): Scene | null {
  return SCENES.find((s) => s.id === id) ?? null;
}
