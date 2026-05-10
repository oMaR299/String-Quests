/**
 * Power-Ups catalog + seed data (frontend-mock).
 *
 * Source-of-truth for all 13 power-ups, their costs, activation phase,
 * visual grouping, v2 status, and bilingual copy. Sibling components
 * MUST import `PowerupSlug`, `PowerupPhase`, `PowerupGroup`,
 * `PowerupCatalogEntry`, and `POWERUP_CATALOG` from this file —
 * nothing else owns this taxonomy.
 *
 * Costs match the backend Stardust spec exactly. Inventory is capped
 * at 10 per slug (silent clip — see `BUY_POWERUP` in UserContext).
 */

// ---- Slugs ----

export type PowerupSlug =
  | 'freeze'
  | 'restart_shield'
  | 'xp_double'
  | 'lucky_dice'
  | 'combo_lock'
  | 'streak_shield'
  | 'streak_revive'
  | 'fifty_fifty'
  | 'hint_reveal'
  | 'skip'
  | 'second_chance'
  | 'eraser'
  | 'auto_complete';

/**
 * Activation phase:
 * - `pre_artifact`  → equipped via LoadoutModal before a quiz starts
 * - `in_question`   → tappable in InQuestionPowerupBar during a question
 * - `passive`       → no UI button (auto-applies). streak_shield + streak_revive.
 */
export type PowerupPhase = 'pre_artifact' | 'in_question' | 'passive';

/**
 * Visual color/group buckets used by the shop screen and tile tints.
 * Color tokens (consumers should map these to existing sq-* / pastel* tokens):
 * - defensive       → sq-info
 * - xp_booster      → sq-warning
 * - question_helper → sq-brand
 * - reactive        → sq-success
 * - combo_streak    → sq-danger (warm)
 * - power_solve     → pastel-purple
 */
export type PowerupGroup =
  | 'defensive'
  | 'xp_booster'
  | 'question_helper'
  | 'reactive'
  | 'combo_streak'
  | 'power_solve';

export interface PowerupCatalogEntry {
  slug: PowerupSlug;
  costSD: number;
  phase: PowerupPhase;
  group: PowerupGroup;
  /** v2 = backend mechanic not yet live; render with "Coming soon" pill, disable activation. */
  isV2: boolean;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}

// ---- Catalog ----

export const POWERUP_CATALOG: Record<PowerupSlug, PowerupCatalogEntry> = {
  freeze: {
    slug: 'freeze',
    costSD: 40,
    phase: 'pre_artifact',
    group: 'defensive',
    isV2: false,
    nameAr: 'تجميد',
    nameEn: 'Freeze',
    descAr: 'يمتص أول إجابة خاطئة في الجلسة دون فقدان قلب.',
    descEn: 'Absorbs the first wrong answer this session — no heart lost.',
  },
  restart_shield: {
    slug: 'restart_shield',
    costSD: 120,
    phase: 'pre_artifact',
    group: 'defensive',
    isV2: false,
    nameAr: 'درع الإعادة',
    nameEn: 'Restart Shield',
    descAr: 'يعيد ملء قلوبك إذا نفدت أثناء الجلسة.',
    descEn: 'Refills your hearts if they run out mid-session.',
  },
  xp_double: {
    slug: 'xp_double',
    costSD: 60,
    phase: 'pre_artifact',
    group: 'xp_booster',
    isV2: false,
    nameAr: 'مضاعف الخبرة',
    nameEn: 'XP Doubler',
    descAr: 'يضاعف نقاط الخبرة لأول إجابة صحيحة.',
    descEn: 'Doubles XP on your first correct answer.',
  },
  lucky_dice: {
    slug: 'lucky_dice',
    costSD: 80,
    phase: 'pre_artifact',
    group: 'xp_booster',
    isV2: false,
    nameAr: 'النرد المحظوظ',
    nameEn: 'Lucky Dice',
    descAr: 'يلقي نرداً عند كل إجابة صحيحة لمضاعفة عشوائية.',
    descEn: 'Rolls a dice on each correct answer for a random XP multiplier.',
  },
  combo_lock: {
    slug: 'combo_lock',
    costSD: 100,
    phase: 'pre_artifact',
    group: 'combo_streak',
    isV2: true,
    nameAr: 'قفل الكومبو',
    nameEn: 'Combo Lock',
    descAr: 'يحافظ على عدّاد الكومبو عند الخطأ الأول.',
    descEn: 'Preserves your combo counter on the first wrong answer.',
  },
  streak_shield: {
    slug: 'streak_shield',
    costSD: 200,
    phase: 'passive',
    group: 'combo_streak',
    isV2: true,
    nameAr: 'درع السلسلة',
    nameEn: 'Streak Shield',
    descAr: 'يحمي سلسلتك تلقائياً إذا فاتك يوم.',
    descEn: 'Auto-protects your streak if you miss a day.',
  },
  streak_revive: {
    slug: 'streak_revive',
    costSD: 300,
    phase: 'passive',
    group: 'combo_streak',
    isV2: true,
    nameAr: 'إحياء السلسلة',
    nameEn: 'Phoenix',
    descAr: 'يستعيد سلسلة منكسرة بالأمس بضغطة واحدة.',
    descEn: 'Restores a streak that broke yesterday with one tap.',
  },
  fifty_fifty: {
    slug: 'fifty_fifty',
    costSD: 30,
    phase: 'in_question',
    group: 'question_helper',
    isV2: false,
    nameAr: 'خمسين خمسين',
    nameEn: '50 / 50',
    descAr: 'يخفي خيارين خاطئين في سؤال متعدد الاختيارات.',
    descEn: 'Hides two wrong options on a multiple-choice question.',
  },
  hint_reveal: {
    slug: 'hint_reveal',
    costSD: 20,
    phase: 'in_question',
    group: 'question_helper',
    isV2: false,
    nameAr: 'كشف التلميح',
    nameEn: 'Hint Reveal',
    descAr: 'يكشف التلميح بدون خصم من الخبرة.',
    descEn: 'Reveals the hint without the usual XP penalty.',
  },
  skip: {
    slug: 'skip',
    costSD: 80,
    phase: 'in_question',
    group: 'question_helper',
    isV2: false,
    nameAr: 'تخطّي',
    nameEn: 'Skip',
    descAr: 'يتخطى السؤال الحالي ويلغي مكافأة الإتقان.',
    descEn: 'Skips the current question (cancels perfect-bonus eligibility).',
  },
  second_chance: {
    slug: 'second_chance',
    costSD: 50,
    phase: 'in_question',
    group: 'defensive',
    isV2: false,
    nameAr: 'فرصة ثانية',
    nameEn: 'Second Chance',
    descAr: 'يمتص خطأً واحداً على السؤال الذي جُهِّز عليه.',
    descEn: 'Absorbs one wrong answer on the armed question.',
  },
  eraser: {
    slug: 'eraser',
    costSD: 60,
    phase: 'in_question',
    group: 'reactive',
    isV2: true,
    nameAr: 'الممحاة',
    nameEn: 'Eraser',
    descAr: 'يستعيد قلباً مفقوداً واحداً.',
    descEn: 'Regenerates one lost heart.',
  },
  auto_complete: {
    slug: 'auto_complete',
    costSD: 100,
    phase: 'in_question',
    group: 'power_solve',
    isV2: true,
    nameAr: 'حل تلقائي',
    nameEn: 'Auto-Complete',
    descAr: 'يحل السؤال الحالي تلقائياً ويلغي مكافأة الإتقان.',
    descEn: 'Auto-solves the current question (cancels perfect-bonus eligibility).',
  },
};

// ---- Constants ----

/** Per-slug inventory cap. Buys past 10 are silently clipped (Stardust still debited per backend spec). */
export const POWERUP_CAP = 10;

/** Seed Stardust balance for a fresh user. */
export const MOCK_STARDUST_BALANCE = 240;

/** Seed inventory — gives the user a few items to play with so the HUD has visible buttons day 1. */
export const MOCK_INITIAL_INVENTORY: Record<PowerupSlug, number> = {
  freeze: 2,
  restart_shield: 0,
  xp_double: 1,
  lucky_dice: 0,
  combo_lock: 0,
  streak_shield: 0,
  streak_revive: 0,
  fifty_fifty: 1,
  hint_reveal: 1,
  skip: 0,
  second_chance: 1,
  eraser: 0,
  auto_complete: 0,
};

/** Convenience: ordered list of all 13 slugs (catalog iteration order). */
export const ALL_POWERUP_SLUGS: PowerupSlug[] = [
  'freeze',
  'restart_shield',
  'xp_double',
  'lucky_dice',
  'combo_lock',
  'streak_shield',
  'streak_revive',
  'fifty_fifty',
  'hint_reveal',
  'skip',
  'second_chance',
  'eraser',
  'auto_complete',
];

/** Convenience: pre-artifact slugs in catalog order — used by LoadoutModal grid. */
export const PRE_ARTIFACT_SLUGS: PowerupSlug[] = ALL_POWERUP_SLUGS.filter(
  (s) => POWERUP_CATALOG[s].phase === 'pre_artifact'
);

/** Convenience: in-question slugs in catalog order — used by InQuestionPowerupBar. */
export const IN_QUESTION_SLUGS: PowerupSlug[] = ALL_POWERUP_SLUGS.filter(
  (s) => POWERUP_CATALOG[s].phase === 'in_question'
);

/** Convenience: passive slugs (no activation UI) — streak_shield, streak_revive. */
export const PASSIVE_SLUGS: PowerupSlug[] = ALL_POWERUP_SLUGS.filter(
  (s) => POWERUP_CATALOG[s].phase === 'passive'
);
