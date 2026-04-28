// phoneAppType — small helpers for type rules in the Phone App.
//
// Cairo (the Arabic-friendly font we use) sets denser than Latin Inter, so AR
// strings need a touch more leading to feel breathable. EN keeps `leading-tight`.
// Every screen uses these helpers instead of hand-picking line-heights.

import type { PhoneAppLocale } from './phoneAppI18n';

/** Returns the right Tailwind line-height utility for a locale. */
export function arLeading(locale: PhoneAppLocale): string {
  return locale === 'ar' ? 'leading-[1.4]' : 'leading-[1.1]';
}

/** Body text leading — slightly more relaxed. */
export function arBodyLeading(locale: PhoneAppLocale): string {
  return locale === 'ar' ? 'leading-[1.6]' : 'leading-snug';
}
