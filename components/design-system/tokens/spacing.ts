/**
 * sq-spacing tokens.
 *
 * Maps semantic spacing names to the Tailwind spacing scale (4px base).
 * Use these names when laying out new design-system surfaces so that
 * "card padding" / "stack rhythm" / "page gutter" stay consistent across
 * modules, even if the underlying pixel values change.
 */

export interface SqSpaceToken {
  /** Tailwind utility for padding (e.g. p-4) */
  padding: string;
  /** Tailwind utility for margin */
  margin: string;
  /** Tailwind utility for gap */
  gap: string;
  /** Pixel equivalent for the showcase ruler */
  px: number;
}

export const SQ_SPACE = {
  '1': { padding: 'p-1', margin: 'm-1', gap: 'gap-1', px: 4 },
  '2': { padding: 'p-2', margin: 'm-2', gap: 'gap-2', px: 8 },
  '3': { padding: 'p-3', margin: 'm-3', gap: 'gap-3', px: 12 },
  '4': { padding: 'p-4', margin: 'm-4', gap: 'gap-4', px: 16 },
  '5': { padding: 'p-5', margin: 'm-5', gap: 'gap-5', px: 20 },
  '6': { padding: 'p-6', margin: 'm-6', gap: 'gap-6', px: 24 },
  '8': { padding: 'p-8', margin: 'm-8', gap: 'gap-8', px: 32 },
  '10': { padding: 'p-10', margin: 'm-10', gap: 'gap-10', px: 40 },
  '12': { padding: 'p-12', margin: 'm-12', gap: 'gap-12', px: 48 },
} as const satisfies Record<string, SqSpaceToken>;

export type SqSpaceKey = keyof typeof SQ_SPACE;

/**
 * Named "recipe" spacings for common compositions.
 * Each value is a literal Tailwind utility (or composition) — JIT-safe.
 */
export const SQ_SPACE_RECIPES = {
  /** Standard card inner padding */
  cardPadding: 'p-6',
  /** Section card padding (notification-admin uses md:p-8) */
  sectionPadding: 'p-6 md:p-8',
  /** Page gutter — use as the outer container x-padding */
  pageGutter: 'px-4 md:px-6 lg:px-8',
  /** Vertical stack rhythm between major blocks */
  stackLg: 'space-y-8',
  /** Vertical stack rhythm between form fields */
  stackMd: 'space-y-4',
  /** Tight stack inside dense lists */
  stackSm: 'space-y-2',
  /** Standard grid gap */
  gridGap: 'gap-6',
  /** Tight grid gap (e.g. swatches) */
  gridGapTight: 'gap-3',
} as const;

export type SqSpaceRecipe = keyof typeof SQ_SPACE_RECIPES;
