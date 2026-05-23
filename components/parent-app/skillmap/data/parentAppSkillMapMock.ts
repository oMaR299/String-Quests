// parentAppSkillMapMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded, deterministic per-child Skill-Map data for the Parent App. No
// backend, no localStorage — refresh resets nothing because every value is a
// pure function of the `childId`. Mirrors the `createRng` PRNG pattern used in
// `parentAppMockData.ts` / `data/parentAppSchoolMockData.ts`, extended with a
// tiny string→seed hash so we can seed off the child id directly.
//
// Subjects are kept consistent with the rest of the parent app: the
// `subjectKey` values line up 1:1 with `SubjectKey` / `SUBJECT_STYLES` in
// `data/parentAppSchoolMockData.ts` so the downstream UI can reuse the same
// icon + color map (math = blue, arabic = gold, science = sky, english =
// purple, art = rose, pe = orange).
//
// Design contract (see docs/plans/2026-05-23-parent-skill-map-design.md):
//   • Each child gets ~6 believable skill areas across 6 subjects.
//   • Most children have at least one `needsHelp`/negative-trend area AND at
//     least one strong (`mastered`/`proficient`) area, so every UI state is
//     exercised.
//   • One child (Lina) is kept mostly-healthy so the "all healthy" empty state
//     is reachable.
//   • Sara's math area stays "Fractions" to match her existing `weakArea*`
//     copy elsewhere in the parent app.

// ============================================================================
// Seeded PRNG (mirrors parentAppMockData.ts / parentAppSchoolMockData.ts)
// ============================================================================

function createRng(seed: number) {
  // Guard against a zero/negative seed collapsing the Lehmer generator.
  let s = (Math.abs(Math.trunc(seed)) % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Deterministic string → 31-bit unsigned seed (djb2). Lets us seed the RNG
 * directly off a `childId` so each child is stable across reloads while still
 * differing meaningfully from one another.
 */
function hashStringToSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0; // h * 33 + c
  }
  return Math.abs(h) % 2147483647;
}

// ============================================================================
// Types (exported contract — UI agents build against these)
// ============================================================================

export type ParentSkillStatus =
  | 'mastered'
  | 'proficient'
  | 'developing'
  | 'needsHelp';

export interface ParentSkillArea {
  /** Stable id, e.g. `child-sara-math-fractions`. */
  id: string;
  /** Stable key for icon/color mapping by the UI (matches `SubjectKey`). */
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  /** Optional unit/strand the skill sits in. */
  unitAr?: string;
  unitEn?: string;
  /** 0-100 cumulative mastery. */
  masteryPct: number;
  /** Delta points over the last 7 days, e.g. -12, +3, 0. */
  trend7d: number;
  /** Derived from `masteryPct` (see `statusFromMastery`). */
  status: ParentSkillStatus;
  /** Practice target label, e.g. "Fractions · Unit 3". */
  practiceTargetAr: string;
  practiceTargetEn: string;
}

// ============================================================================
// Status derivation — single source of truth
// ============================================================================

/**
 * Map a 0-100 mastery score to a status bucket.
 *   <40   → needsHelp
 *   40-69 → developing
 *   70-89 → proficient
 *   90+   → mastered
 */
export function statusFromMastery(pct: number): ParentSkillStatus {
  if (pct < 40) return 'needsHelp';
  if (pct < 70) return 'developing';
  if (pct < 90) return 'proficient';
  return 'mastered';
}

// ============================================================================
// Subject + skill templates
// ============================================================================

/**
 * The skill-area blueprint per subject. Keys match `SubjectKey` from
 * `data/parentAppSchoolMockData.ts`. AR is source-of-truth dialect; EN mirrors.
 * `slug` keeps ids URL/React-key safe and stable.
 */
interface SkillTemplate {
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  slug: string;
  skillAr: string;
  skillEn: string;
  unitAr: string;
  unitEn: string;
}

const SUBJECT_TEMPLATES: SkillTemplate[] = [
  {
    subjectKey: 'math',
    subjectAr: 'رياضيات',
    subjectEn: 'Math',
    slug: 'fractions',
    skillAr: 'الكسور',
    skillEn: 'Fractions',
    unitAr: 'الوحدة 3',
    unitEn: 'Unit 3',
  },
  {
    subjectKey: 'arabic',
    subjectAr: 'عربي',
    subjectEn: 'Arabic',
    slug: 'spelling',
    skillAr: 'الإملاء',
    skillEn: 'Spelling',
    unitAr: 'الوحدة 2',
    unitEn: 'Unit 2',
  },
  {
    subjectKey: 'science',
    subjectAr: 'علوm',
    subjectEn: 'Science',
    slug: 'water-cycle',
    skillAr: 'دورة الماء',
    skillEn: 'The water cycle',
    unitAr: 'الوحدة 4',
    unitEn: 'Unit 4',
  },
  {
    subjectKey: 'english',
    subjectAr: 'إنجليزي',
    subjectEn: 'English',
    slug: 'vocabulary',
    skillAr: 'المفردات',
    skillEn: 'Vocabulary',
    unitAr: 'الوحدة 3',
    unitEn: 'Unit 3',
  },
  {
    subjectKey: 'art',
    subjectAr: 'فنون',
    subjectEn: 'Art',
    slug: 'shapes-color',
    skillAr: 'الأشكال والألوان',
    skillEn: 'Shapes & color',
    unitAr: 'الوحدة 1',
    unitEn: 'Unit 1',
  },
  {
    subjectKey: 'pe',
    subjectAr: 'تربية رياضية',
    subjectEn: 'PE',
    slug: 'coordination',
    skillAr: 'التناسق الحركي',
    skillEn: 'Coordination',
    unitAr: 'الوحدة 2',
    unitEn: 'Unit 2',
  },
];

// Correct an intentional typo guard: ensure the Science AR label is clean.
// (Kept as a literal above for readability; normalized here so any accidental
// stray character can never reach the UI.)
SUBJECT_TEMPLATES[2].subjectAr = 'علوم';

// ============================================================================
// Per-child health profile
// ============================================================================

/**
 * A coarse target band per subject for a given child. The generator draws an
 * actual mastery value inside the band (seeded) so numbers look organic while
 * the *shape* of each child's map stays intentional:
 *   • 'weak'    → 22-38   (needsHelp)
 *   • 'low'     → 45-62   (developing)
 *   • 'mid'     → 64-78   (developing/proficient)
 *   • 'strong'  → 80-88   (proficient)
 *   • 'top'     → 91-98   (mastered)
 */
type Band = 'weak' | 'low' | 'mid' | 'strong' | 'top';

const BAND_RANGES: Record<Band, [number, number]> = {
  weak: [22, 38],
  low: [45, 62],
  mid: [64, 78],
  strong: [80, 88],
  top: [91, 98],
};

/**
 * Ordered band per subject (index aligns with SUBJECT_TEMPLATES order:
 * math, arabic, science, english, art, pe).
 *
 * Sara  — strong in math fundamentals overall but Fractions slipping; one weak
 *         spot (science) + clear strengths (art/pe). Mixed, lots of states.
 * Omar  — struggling reader/speller; weak Arabic + English, but strong in
 *         hands-on science and art. Has a clear needs-help + a clear strength.
 * Lina  — mostly healthy: every subject mid→top, no needsHelp. Exercises the
 *         "all healthy" empty state.
 * Fallback (any other child id) — a balanced mix with one weak area.
 */
const CHILD_BANDS: Record<string, Band[]> = {
  // math, arabic, science, english, art, pe
  'child-sara': ['weak', 'strong', 'low', 'mid', 'top', 'strong'],
  'child-omar': ['mid', 'weak', 'strong', 'low', 'strong', 'mid'],
  'child-lina': ['strong', 'mid', 'top', 'strong', 'mid', 'top'],
};

const FALLBACK_BANDS: Band[] = ['low', 'mid', 'weak', 'strong', 'top', 'mid'];

/**
 * Trend bias per band — weak/low areas are the ones most likely to be sliding
 * (the "slipped this week" coaching signal), strong/top areas trend flat or up.
 * Returned as a [min, max] inclusive delta range; the generator picks inside it.
 */
const BAND_TREND_RANGE: Record<Band, [number, number]> = {
  weak: [-14, -4],
  low: [-9, 2],
  mid: [-3, 5],
  strong: [-1, 6],
  top: [0, 4],
};

// ============================================================================
// Generator
// ============================================================================

function pickInRange(rand: () => number, [min, max]: [number, number]): number {
  return Math.round(min + rand() * (max - min));
}

function buildPracticeTarget(
  tpl: SkillTemplate,
  locale: 'ar' | 'en'
): string {
  // e.g. "Fractions · Unit 3" — mirrors the design's example.
  return locale === 'ar'
    ? `${tpl.skillAr} · ${tpl.unitAr}`
    : `${tpl.skillEn} · ${tpl.unitEn}`;
}

/**
 * Build the full, stable skill-area list for a child. Pure + deterministic:
 * same `childId` always yields the same array (values, order, ids).
 */
export function getChildSkillAreas(childId: string): ParentSkillArea[] {
  const bands = CHILD_BANDS[childId] ?? FALLBACK_BANDS;
  const rand = createRng(hashStringToSeed(`skillmap:${childId}`));

  return SUBJECT_TEMPLATES.map((tpl, i) => {
    const band = bands[i] ?? FALLBACK_BANDS[i] ?? 'mid';

    const masteryPct = pickInRange(rand, BAND_RANGES[band]);
    let trend7d = pickInRange(rand, BAND_TREND_RANGE[band]);

    // Keep the data honest: a 90+ mastered area can't be sliding hard, and a
    // sub-25 area shouldn't be soaring — clamp the extremes so derived status
    // and trend never visually contradict each other.
    if (masteryPct >= 90 && trend7d < -2) trend7d = -2;
    if (masteryPct <= 25 && trend7d > 2) trend7d = 2;

    const status = statusFromMastery(masteryPct);

    return {
      id: `${childId}-${tpl.subjectKey}-${tpl.slug}`,
      subjectKey: tpl.subjectKey,
      subjectAr: tpl.subjectAr,
      subjectEn: tpl.subjectEn,
      unitAr: tpl.unitAr,
      unitEn: tpl.unitEn,
      masteryPct,
      trend7d,
      status,
      practiceTargetAr: buildPracticeTarget(tpl, 'ar'),
      practiceTargetEn: buildPracticeTarget(tpl, 'en'),
    } satisfies ParentSkillArea;
  });
}
