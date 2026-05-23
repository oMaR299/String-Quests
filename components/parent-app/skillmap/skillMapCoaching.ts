// skillMapCoaching.ts
// ─────────────────────────────────────────────────────────────────────────────
// The Parent Skill-Map coaching engine + bilingual copy. 100% pure,
// deterministic, side-effect-free — NO AI, NO network, NO storage. The UI
// layer owns the in-memory "sent / cooldown" state and feeds it back in via
// `sentAreaIds`; everything here is a pure function of its arguments.
//
// Responsibilities (see docs/plans/2026-05-23-parent-skill-map-design.md):
//   • Map mastery → garden growth stage (`masteryToStage`).
//   • Flag a skill as "wilting" for the garden hero (`isWilting`).
//   • Rank weak areas by urgency and pick today's 1-3 focus + 1 shining
//     strength (`selectTodaysFocus`).
//   • Resolve a warm, bilingual Talk prompt from a static template library
//     (`getTalkPrompt`) — chosen deterministically so it's stable per day.

import type { ParentSkillArea, ParentSkillStatus } from './data/parentAppSkillMapMock';

// ============================================================================
// Garden growth stage
// ============================================================================

export type PlantStage = 'seed' | 'sprout' | 'young' | 'bloom';

/**
 * Map a 0-100 mastery score to a garden growth stage. Mirrors the status
 * thresholds in `statusFromMastery` so a plant's height always agrees with its
 * skill status:
 *   <40   → seed
 *   40-69 → sprout
 *   70-89 → young
 *   90+   → bloom
 */
export function masteryToStage(pct: number): PlantStage {
  if (pct < 40) return 'seed';
  if (pct < 70) return 'sprout';
  if (pct < 90) return 'young';
  return 'bloom';
}

// ============================================================================
// Wilting flag (garden hero droop)
// ============================================================================

/**
 * A skill is "wilting" when it needs help OR has dropped meaningfully in the
 * last 7 days. Drives the drooping/swaying plant treatment in the garden hero.
 */
export function isWilting(area: ParentSkillArea): boolean {
  return area.status === 'needsHelp' || area.trend7d <= -8;
}

// ============================================================================
// Today's Focus — urgency ranking
// ============================================================================

export interface TodaysFocus {
  /** 1-3 areas the parent should act on today, most urgent first. */
  focus: ParentSkillArea[];
  /** A single strength to celebrate, or null if the child has none worth it. */
  shining: ParentSkillArea | null;
}

/** Subjects that get an urgency bump — they matter most day-to-day. */
const CORE_SUBJECTS = new Set<string>(['math', 'arabic', 'science']);

/** Max number of focus cards surfaced at once. */
const MAX_FOCUS = 3;

/**
 * Compute an urgency score for a weak area. Higher = more in need of a parent
 * nudge today. Weighting follows the design's coaching engine:
 *   • recent drop (negative trend) — heaviest, most coachable signal
 *   • low absolute mastery
 *   • core-subject bump (Math / Arabic / Science)
 */
function urgencyScore(area: ParentSkillArea): number {
  // Recent drop: only negative trends add urgency, scaled up hard. A -12
  // contributes ~96 points; flat/positive trends contribute 0.
  const dropPoints = area.trend7d < 0 ? Math.abs(area.trend7d) * 8 : 0;

  // Low mastery: 0 mastery → 60 points, 100 mastery → 0 points.
  const masteryPoints = (100 - area.masteryPct) * 0.6;

  // Core-subject bump.
  const corePoints = CORE_SUBJECTS.has(area.subjectKey) ? 12 : 0;

  // needsHelp deserves a small floor bump so a brand-weak-but-flat area still
  // outranks a merely-developing one.
  const statusPoints = area.status === 'needsHelp' ? 10 : 0;

  return dropPoints + masteryPoints + corePoints + statusPoints;
}

/** A "weak enough to coach" area: anything not already strong. */
function isCoachable(area: ParentSkillArea): boolean {
  return area.status === 'needsHelp' || area.status === 'developing';
}

/** Pick the single best strength to celebrate (highest mastery, then trend). */
function pickShining(areas: ParentSkillArea[]): ParentSkillArea | null {
  const strong = areas.filter(
    (a) => a.status === 'mastered' || a.status === 'proficient'
  );
  if (strong.length === 0) return null;

  return [...strong].sort((a, b) => {
    if (b.masteryPct !== a.masteryPct) return b.masteryPct - a.masteryPct;
    if (b.trend7d !== a.trend7d) return b.trend7d - a.trend7d;
    // Stable final tie-break by id so the choice never flickers.
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  })[0];
}

/**
 * Select today's 1-3 focus areas + 1 shining strength.
 *
 * @param areas        Full per-child skill-area list.
 * @param sentAreaIds  Ids whose practice was already sent — suppressed
 *                     (cooldown) so the parent isn't nagged about the same
 *                     thing two "days" running.
 * @param daySeed      Stable seed for the current day (e.g. an ISO date). Used
 *                     only as a deterministic tie-break, so the ordering of
 *                     equally-urgent areas is stable within a day but can vary
 *                     across days.
 *
 * Pure: same inputs → same output. `daySeed` is currently consumed only for
 * tie-breaking; it is intentionally part of the signature so callers pass a
 * stable per-day value and the engine can evolve without an API change.
 */
export function selectTodaysFocus(
  areas: ParentSkillArea[],
  sentAreaIds: string[],
  daySeed: string
): TodaysFocus {
  const suppressed = new Set(sentAreaIds);
  const dayBias = hashStringToSeed(daySeed);

  const ranked = areas
    .filter(isCoachable)
    .filter((a) => !suppressed.has(a.id))
    .map((a) => ({ area: a, score: urgencyScore(a) }))
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      // Deterministic, day-seeded tie-break among equal-urgency areas.
      const xt = hashStringToSeed(x.area.id + daySeed) ^ dayBias;
      const yt = hashStringToSeed(y.area.id + daySeed) ^ dayBias;
      if (xt !== yt) return xt - yt;
      return x.area.id < y.area.id ? -1 : 1;
    });

  const focus = ranked.slice(0, MAX_FOCUS).map((r) => r.area);

  // Shining is picked from the strengths regardless of cooldown — celebrating a
  // strength is never suppressed.
  const shining = pickShining(areas);

  return { focus, shining };
}

// ============================================================================
// Talk-prompt template library (pure, bilingual, no AI)
// ============================================================================

interface PromptTemplate {
  ar: string;
  en: string;
}

/**
 * Warm, conversational Talk prompts keyed by status. Each status has a few
 * variants so the screen feels alive; one is chosen deterministically per
 * (area, day) so it stays stable across a session/day but differs between
 * areas. `{name}` and `{skill}` are substituted at resolve time.
 *
 * Tone: encouraging, never clinical — the parent is a coach, not an examiner.
 */
const TALK_TEMPLATES: Record<ParentSkillStatus, PromptTemplate[]> = {
  needsHelp: [
    {
      ar: 'اطلبوا من {name} أن يشرح لكم {skill} — إذا قدر يشرحها، فهو فاهمها.',
      en: 'Ask {name} to teach YOU {skill} — if they can explain it, they’ve got it.',
    },
    {
      ar: 'اجلسوا مع {name} وحلّوا مثالاً واحداً على {skill} سوياً، بدون ضغط.',
      en: 'Sit with {name} and work through one {skill} example together — no pressure.',
    },
    {
      ar: 'اسألوا {name} ما هو أصعب جزء في {skill}، وابدؤوا من هناك.',
      en: 'Ask {name} which part of {skill} feels hardest, and start there.',
    },
  ],
  developing: [
    {
      ar: '{name} يتقدم في {skill} — اطلبوا منه يوريكم مثالاً تعلّمه اليوم.',
      en: '{name} is making progress on {skill} — ask them to show you one example they learned today.',
    },
    {
      ar: 'شجّعوا {name} بسؤال بسيط عن {skill} خلال العشاء — التكرار اللطيف يثبّت الفكرة.',
      en: 'Slip a light {skill} question into dinner chat — gentle repetition makes it stick.',
    },
    {
      ar: 'اطلبوا من {name} أن يعطيكم مثالاً من الحياة على {skill}.',
      en: 'Ask {name} for a real-life example of {skill}.',
    },
  ],
  proficient: [
    {
      ar: '{name} قوي في {skill} — تحدّوه بسؤال أصعب قليلاً ليبقى متحمساً.',
      en: '{name} is strong at {skill} — stretch them with a slightly harder question to keep it fun.',
    },
    {
      ar: 'اطلبوا من {name} يعلّم أخاً أو صديقاً {skill} — التعليم يرسّخ الإتقان.',
      en: 'Have {name} teach {skill} to a sibling or friend — teaching cements mastery.',
    },
  ],
  mastered: [
    {
      ar: 'احتفلوا مع {name} بإتقانه {skill}! اسألوه ما الذي يحب يتعلّمه بعدها.',
      en: 'Celebrate {name} mastering {skill}! Ask what they’d love to learn next.',
    },
    {
      ar: '{name} أتقن {skill} تماماً — دعوه يختار التحدي القادم بنفسه.',
      en: '{name} has fully mastered {skill} — let them pick the next challenge themselves.',
    },
  ],
};

/**
 * Deterministic string → 31-bit unsigned seed (djb2). Kept local + identical to
 * the mock generator's hash so behavior is consistent across the feature.
 */
function hashStringToSeed(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 2147483647;
}

/** Minimal `{name}`/`{skill}` substitution (matches parentAppI18n.interpolate). */
function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{${key}}`
  );
}

/**
 * Resolve a warm, bilingual Talk prompt for a skill area. The variant is chosen
 * deterministically from the area id (so each card differs) — stable across
 * reloads. `{skill}` resolves to the area's locale-appropriate practice skill
 * (the head of the practice target, e.g. "Fractions").
 *
 * Pure template content only — there is no AI call here.
 */
export function getTalkPrompt(
  area: ParentSkillArea,
  childName: string,
  locale: 'ar' | 'en'
): string {
  const variants = TALK_TEMPLATES[area.status];
  const idx = hashStringToSeed(area.id) % variants.length;
  const tpl = variants[idx];

  // Skill label = the part of the practice target before the " · " separator,
  // so prompts read naturally ("…teach YOU Fractions") without the unit suffix.
  const target = locale === 'ar' ? area.practiceTargetAr : area.practiceTargetEn;
  const skill = target.split('·')[0].trim();

  return fill(locale === 'ar' ? tpl.ar : tpl.en, {
    name: childName,
    skill,
  });
}
