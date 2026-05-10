// parentOnboardingMockData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded mock children pool used by both the QR-scan simulator and the paste-
// invite-code resolver to produce a plausible child name on a successful link.
//
// In v1 these are static — no backend, no localStorage. The flow is purely a
// demo of UX choreography: the user "scans" or "pastes a code" and a name is
// added to their list. Names rotate so repeated additions feel different.

export interface MockChild {
  /** Stable identifier within a single session (in-memory). */
  id: string;
  /** Display name (Arabic). */
  nameAr: string;
  /** Display name (English transliteration). */
  nameEn: string;
}

const NAME_POOL: ReadonlyArray<{ ar: string; en: string }> = [
  { ar: 'أحمد', en: 'Ahmed' },
  { ar: 'سارة', en: 'Sarah' },
  { ar: 'عمر', en: 'Omar' },
  { ar: 'لين', en: 'Leen' },
  { ar: 'يوسف', en: 'Yousef' },
  { ar: 'هدى', en: 'Huda' },
  { ar: 'فيصل', en: 'Faisal' },
  { ar: 'ريم', en: 'Reem' },
  { ar: 'نواف', en: 'Nawaf' },
  { ar: 'جنى', en: 'Jana' },
];

/**
 * Pick the next child name from the seeded pool, deterministic on the count of
 * already-linked children so the demo feels predictable. Wraps around if the
 * pool is exhausted.
 */
export function pickMockChildName(existingCount: number): { nameAr: string; nameEn: string } {
  const entry = NAME_POOL[existingCount % NAME_POOL.length];
  return { nameAr: entry.ar, nameEn: entry.en };
}

/**
 * Generate a stable id for an in-memory mock child.
 */
export function makeMockChildId(): string {
  return `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
