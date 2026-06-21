// mockKit.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared deterministic-mock primitives for the parent app. Previously these
// (createRng / hashStringToSeed / clamp + date helpers) were copy-pasted into
// ~10 data files; this is the single source of truth.
//
// Determinism contract: same seed → same sequence; same date string → same
// parse. Date helpers are timezone-SAFE (local parts, never UTC round-trips —
// `new Date('YYYY-MM-DD')` parses as UTC midnight and shifts the day in +offset
// zones like UTC+3).

/** Lehmer PRNG. Returns a function producing [0,1). Same seed → same sequence. */
export function createRng(seed: number): () => number {
  let s = (Math.abs(Math.trunc(seed)) % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Deterministic string → 31-bit unsigned seed (djb2). */
export function hashStringToSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Inclusive integer in [min,max] from the RNG. */
export function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

// ── Timezone-safe date helpers ───────────────────────────────────────────────

export function buildIso(year: number, month0: number, day: number): string {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

/** Parse YYYY-MM-DD as a LOCAL date (no UTC-midnight day shift). */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** ISO (YYYY-MM-DD) for `offset` days from today (0 = today, -1 = yesterday). */
export function isoForOffset(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return buildIso(d.getFullYear(), d.getMonth(), d.getDate());
}

export function todayIso(): string {
  return isoForOffset(0);
}

export function isoMinusOneDay(iso: string): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() - 1);
  return buildIso(d.getFullYear(), d.getMonth(), d.getDate());
}
