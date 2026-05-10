/**
 * sq-shadow tokens.
 *
 * Curated shadow recipes. The iconic `button-3d` recipe is the Duolingo
 * press shadow already proven inside `PhoneButton.tsx` — we lift it
 * here as a re-usable token so any new primary CTA can adopt it without
 * re-deriving the math.
 */

export const SQ_SHADOW = {
  /** Standard card resting shadow */
  card: 'shadow-sm',
  /** Card hover lift */
  cardHover: 'shadow-md',
  /** Modal / dialog backdrop */
  modal: 'shadow-2xl',
  /** Header / sticky chrome */
  chrome: 'shadow-[0_1px_0_0_rgba(15,23,42,0.04)]',
  /**
   * The iconic 3D Duolingo press shadow.
   * The button has `border-b-4` on the sides + bottom; on `:active` we
   * collapse to `border-b-2` and translate-y so the surface "presses in".
   * Tone classes (mint/coral/sky/brand) live in Button.tsx.
   */
  button3d: 'border-b-4 active:translate-y-[3px] active:border-b-2',
  /** Pressed-in inset shadow (used on selected option cards) */
  press: 'shadow-[0_4px_0_0_rgba(0,0,0,0.05)]',
  /** Halo glow used for active rail dots */
  ringHalo: 'shadow-[0_0_0_3px_rgba(167,139,250,0.22)]',
} as const;

export type SqShadowKey = keyof typeof SQ_SHADOW;

export interface SqShadowDoc {
  token: SqShadowKey;
  class: string;
  description: string;
}

export const SQ_SHADOW_DOCS: SqShadowDoc[] = [
  { token: 'card',      class: 'shadow-sm',  description: 'Resting card / SectionCard.' },
  { token: 'cardHover', class: 'shadow-md',  description: 'Subtle hover lift.' },
  { token: 'modal',     class: 'shadow-2xl', description: 'Modals, popups, important floating panels.' },
  { token: 'chrome',    class: 'shadow-[0_1px_0_0_rgba(15,23,42,0.04)]', description: 'Sticky header hairline.' },
  { token: 'button3d',  class: 'border-b-4 active:translate-y-[3px] active:border-b-2', description: 'The iconic 3D press recipe (PhoneButton).' },
  { token: 'press',     class: 'shadow-[0_4px_0_0_rgba(0,0,0,0.05)]', description: 'Pressed-in inset (selected option card).' },
  { token: 'ringHalo',  class: 'shadow-[0_0_0_3px_rgba(167,139,250,0.22)]', description: 'Halo around active rail dots.' },
];
