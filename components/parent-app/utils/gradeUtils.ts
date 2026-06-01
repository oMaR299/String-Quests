// gradeUtils.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers for rendering a Grade pill / breakdown. Lives here (not in
// data/) so the AssignmentsDrawer and ExamsDrawer pull the EXACT same tone
// + formatter — no drift between them.
//
// Tailwind v4 JIT: the three tone class strings below are literal so the
// compiler picks them up at build time. NEVER reconstruct with template
// literals (`bg-${tone}-100`) — those won't be discovered by the JIT.

import type { Grade } from '../data/parentAppSchoolMockData';

export type GradeTone = 'emerald' | 'amber' | 'rose';

/**
 * Minimum shape needed for tone + formatter helpers. Both Grade (Assignment
 * + Exam) and ReportItem (term-end report card) satisfy this — the helpers
 * are intentionally structural so they work across both surfaces without
 * a type-import bridge.
 */
export interface Scored {
  score: number;
  outOf: number;
}

/**
 * Pick the visual tone for a grade based on percent. Thresholds match the
 * standard "A/B/C" cutoffs in MENA primary-school grading:
 *   ≥80%  → emerald (strong)
 *   60–79 → amber   (acceptable but needs review)
 *   <60   → rose    (concerning — needs intervention)
 */
export function getGradeTone(grade: Scored): GradeTone {
  const pct = grade.score / grade.outOf;
  if (pct >= 0.8) return 'emerald';
  if (pct >= 0.6) return 'amber';
  return 'rose';
}

/**
 * Literal class strings for each tone. Used by both the row pill and the
 * expanded grade breakdown. Each string is a literal so Tailwind v4's JIT
 * picks every one of them up.
 */
export const GRADE_TONE_CLASSES: Record<
  GradeTone,
  { bg: string; text: string; border: string; ring: string }
> = {
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-300',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-300',
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    ring: 'ring-rose-300',
  },
};

/** Short pill text — "8/10", "92/100". Always Western digits for tabular alignment. */
export function formatGradeShort(grade: Scored): string {
  return `${grade.score}/${grade.outOf}`;
}

/** Percent of the score, rounded. e.g. 0.825 → 83. */
export function gradePercent(grade: Scored): number {
  if (grade.outOf <= 0) return 0;
  return Math.round((grade.score / grade.outOf) * 100);
}

// `Grade` import kept for the .d.ts surface — re-export so consumers can pull
// it through the same module if they want a single import point.
export type { Grade };
