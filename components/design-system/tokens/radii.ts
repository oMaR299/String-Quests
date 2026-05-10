/**
 * sq-radius tokens.
 *
 * Named radii so consumers don't have to remember "is this a rounded-2xl
 * or rounded-3xl card?". Each token maps to a literal Tailwind class.
 */

export const SQ_RADIUS = {
  /** Pills, badges, status chips */
  pill: 'rounded-full',
  /** Buttons (3D + standard) */
  button: 'rounded-2xl',
  /** Tile / icon shell (e.g. SectionCard's gradient icon tile) */
  tile: 'rounded-2xl',
  /** Standard card */
  card: 'rounded-2xl',
  /** Hero / section card (notification-admin uses 3xl) */
  cardLg: 'rounded-3xl',
  /** Inputs */
  input: 'rounded-xl',
  /** Modals */
  modal: 'rounded-[2rem]',
  /** Hairline sm radius (toolbar buttons) */
  sm: 'rounded-lg',
} as const;

export type SqRadiusKey = keyof typeof SQ_RADIUS;

/** For the showcase grid: visible label + class. */
export const SQ_RADIUS_TOKENS: Array<{ token: SqRadiusKey; class: string; px: string }> = [
  { token: 'sm',     class: 'rounded-lg',       px: '8px' },
  { token: 'input',  class: 'rounded-xl',       px: '12px' },
  { token: 'card',   class: 'rounded-2xl',      px: '16px' },
  { token: 'button', class: 'rounded-2xl',      px: '16px' },
  { token: 'tile',   class: 'rounded-2xl',      px: '16px' },
  { token: 'cardLg', class: 'rounded-3xl',      px: '24px' },
  { token: 'modal',  class: 'rounded-[2rem]',   px: '32px' },
  { token: 'pill',   class: 'rounded-full',     px: '∞' },
];
