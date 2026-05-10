// countries.ts
// ─────────────────────────────────────────────────────────────────────────────
// Country list, formatter, and best-effort timezone-based detector for the
// parent-onboarding phone picker. Jordan is the home market, so it sorts
// first and is the default both for explicit fallback and when timezone
// detection fails.
//
// All data here is static and JIT-safe — we do NOT generate Tailwind classes
// from any of these strings.

export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. 'JO'. */
  code: string;
  /** Flag emoji (one per country). */
  flag: string;
  /** Localized country name (Arabic). */
  nameAr: string;
  /** Localized country name (English). */
  nameEn: string;
  /** Dial code with leading '+', e.g. '+962'. */
  dialCode: string;
  /** Expected national-number length (digits only, no prefix). */
  digits: number;
  /** Human-readable shape used as the input placeholder. */
  placeholderPattern: string;
  /** Group sizes used by formatPhone() to insert spaces, e.g. [3,3,3]. */
  groupPattern: number[];
  /**
   * Optional soft-validation prefixes. We use these only to surface a hint —
   * we never block the user from submitting if the prefix doesn't match.
   * Multi-prefix countries (Jordan, UAE, Egypt) make hard rejection a UX
   * footgun — false negatives are worse than weak validation.
   */
  validPrefixes?: string[];
}

/** Default country code — Jordan, the home market. */
export const DEFAULT_COUNTRY_CODE = 'JO';

/**
 * Country list. Jordan first by deliberate ordering — when the picker opens
 * with no search query, JO is at the top. The rest follow a rough Levant →
 * Gulf → North Africa → other regional → global pattern that mirrors how
 * a Jordan-based parent is most likely to scan the list.
 */
export const COUNTRIES: Country[] = [
  {
    code: 'JO',
    flag: '🇯🇴',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    dialCode: '+962',
    digits: 9,
    placeholderPattern: '7X XXXX XXXX',
    groupPattern: [2, 4, 4],
    validPrefixes: ['77', '78', '79'],
  },
  {
    code: 'SA',
    flag: '🇸🇦',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    dialCode: '+966',
    digits: 9,
    placeholderPattern: '5XX XXX XXX',
    groupPattern: [3, 3, 3],
    validPrefixes: ['5'],
  },
  {
    code: 'AE',
    flag: '🇦🇪',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    dialCode: '+971',
    digits: 9,
    placeholderPattern: '5X XXX XXXX',
    groupPattern: [2, 3, 4],
    validPrefixes: ['50', '52', '54', '55', '56', '58'],
  },
  {
    code: 'EG',
    flag: '🇪🇬',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    dialCode: '+20',
    digits: 10,
    placeholderPattern: '1X XXXX XXXX',
    groupPattern: [2, 4, 4],
    validPrefixes: ['10', '11', '12', '15'],
  },
  {
    code: 'KW',
    flag: '🇰🇼',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    dialCode: '+965',
    digits: 8,
    placeholderPattern: 'XXXX XXXX',
    groupPattern: [4, 4],
  },
  {
    code: 'QA',
    flag: '🇶🇦',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    dialCode: '+974',
    digits: 8,
    placeholderPattern: 'XXXX XXXX',
    groupPattern: [4, 4],
  },
  {
    code: 'BH',
    flag: '🇧🇭',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    dialCode: '+973',
    digits: 8,
    placeholderPattern: 'XXXX XXXX',
    groupPattern: [4, 4],
  },
  {
    code: 'OM',
    flag: '🇴🇲',
    nameAr: 'عُمان',
    nameEn: 'Oman',
    dialCode: '+968',
    digits: 8,
    placeholderPattern: 'XXXX XXXX',
    groupPattern: [4, 4],
  },
  {
    code: 'LB',
    flag: '🇱🇧',
    nameAr: 'لبنان',
    nameEn: 'Lebanon',
    dialCode: '+961',
    digits: 8,
    placeholderPattern: 'XX XXX XXX',
    groupPattern: [2, 3, 3],
  },
  {
    code: 'PS',
    flag: '🇵🇸',
    nameAr: 'فلسطين',
    nameEn: 'Palestine',
    dialCode: '+970',
    digits: 9,
    placeholderPattern: '5X XXX XXXX',
    groupPattern: [2, 3, 4],
  },
  {
    code: 'IQ',
    flag: '🇮🇶',
    nameAr: 'العراق',
    nameEn: 'Iraq',
    dialCode: '+964',
    digits: 10,
    placeholderPattern: '7XX XXX XXXX',
    groupPattern: [3, 3, 4],
  },
  {
    code: 'SY',
    flag: '🇸🇾',
    nameAr: 'سوريا',
    nameEn: 'Syria',
    dialCode: '+963',
    digits: 9,
    placeholderPattern: '9XX XXX XXX',
    groupPattern: [3, 3, 3],
  },
  {
    code: 'MA',
    flag: '🇲🇦',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    dialCode: '+212',
    digits: 9,
    placeholderPattern: '6XX XXX XXX',
    groupPattern: [3, 3, 3],
  },
  {
    code: 'TN',
    flag: '🇹🇳',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    dialCode: '+216',
    digits: 8,
    placeholderPattern: 'XX XXX XXX',
    groupPattern: [2, 3, 3],
  },
  {
    code: 'DZ',
    flag: '🇩🇿',
    nameAr: 'الجزائر',
    nameEn: 'Algeria',
    dialCode: '+213',
    digits: 9,
    placeholderPattern: '5XX XXX XXX',
    groupPattern: [3, 3, 3],
  },
  {
    code: 'TR',
    flag: '🇹🇷',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    dialCode: '+90',
    digits: 10,
    placeholderPattern: '5XX XXX XXXX',
    groupPattern: [3, 3, 4],
  },
  {
    code: 'GB',
    flag: '🇬🇧',
    nameAr: 'المملكة المتحدة',
    nameEn: 'United Kingdom',
    dialCode: '+44',
    digits: 10,
    placeholderPattern: 'XXXX XXXXXX',
    groupPattern: [4, 6],
  },
  {
    code: 'US',
    flag: '🇺🇸',
    nameAr: 'الولايات المتحدة',
    nameEn: 'United States',
    dialCode: '+1',
    digits: 10,
    placeholderPattern: 'XXX XXX XXXX',
    groupPattern: [3, 3, 4],
  },
];

/**
 * Lookup helper. Falls back to the default country if the code is not
 * recognized so callers never have to handle a `Country | undefined`.
 */
export function getCountryByCode(code: string): Country {
  const upper = code.toUpperCase();
  const match = COUNTRIES.find((c) => c.code === upper);
  return match ?? COUNTRIES[0]; // COUNTRIES[0] is JO by ordering
}

/**
 * Format a raw digit string using the country's groupPattern. Extra digits
 * past the country's `digits` total are dropped (the input layer should be
 * truncating already, but we double-belt it here).
 *
 * Example — JO with [2,4,4] and "799123456":
 *   "79 9123 456" while typing → "79 9123 4567" once complete.
 */
export function formatPhone(country: Country, digits: string): string {
  const clean = digits.replace(/\D+/g, '').slice(0, country.digits);
  if (clean.length === 0) return '';

  const groups: string[] = [];
  let cursor = 0;
  for (const size of country.groupPattern) {
    if (cursor >= clean.length) break;
    groups.push(clean.slice(cursor, cursor + size));
    cursor += size;
  }
  // Anything past the last declared group (shouldn't happen with the slice
  // above, but guard for safety) gets appended verbatim.
  if (cursor < clean.length) {
    groups.push(clean.slice(cursor));
  }
  return groups.join(' ');
}

/**
 * Map of IANA timezones → ISO country codes. Covers every country in the
 * list above plus the Americas (everything America/* maps to US as a sane
 * default for North-American clocks).
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Asia/Amman': 'JO',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Africa/Cairo': 'EG',
  'Asia/Kuwait': 'KW',
  'Asia/Qatar': 'QA',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Beirut': 'LB',
  'Asia/Hebron': 'PS',
  'Asia/Gaza': 'PS',
  'Asia/Baghdad': 'IQ',
  'Asia/Damascus': 'SY',
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Europe/Istanbul': 'TR',
  'Europe/London': 'GB',
};

/**
 * Best-effort country detection from the browser's resolved timezone.
 * Falls back to DEFAULT_COUNTRY_CODE if anything fails (SSR, missing Intl,
 * unmapped timezone). This is a pure UX-priming hint; we always let the
 * user override via the picker.
 */
export function tryDetectCountry(): Country {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
      return getCountryByCode(DEFAULT_COUNTRY_CODE);
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return getCountryByCode(DEFAULT_COUNTRY_CODE);

    // Direct match first.
    const direct = TIMEZONE_TO_COUNTRY[tz];
    if (direct) return getCountryByCode(direct);

    // Any America/* zone defaults to US.
    if (tz.startsWith('America/')) return getCountryByCode('US');

    return getCountryByCode(DEFAULT_COUNTRY_CODE);
  } catch {
    return getCountryByCode(DEFAULT_COUNTRY_CODE);
  }
}
