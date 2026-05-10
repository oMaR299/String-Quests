// CountryPickerSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom-sheet country picker for the phone screen. Lives inside the 430px
// PhoneShell on desktop (so visually it floats inside the device frame) and
// behaves like a true mobile bottom sheet on phones.
//
// Search filters on three signals:
//   1. Arabic name (substring match)
//   2. English name (case-insensitive substring match)
//   3. Dial code (with or without leading '+', and pure-digit forms — typing
//      "962" surfaces Jordan)
//
// Reduced-motion: skips the spring slide-up and fades in/out instead.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { COUNTRIES, type Country } from './countries';

interface CountryPickerSheetProps {
  open: boolean;
  selectedCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

/** Normalize a string for accent/spacing-tolerant searching. */
function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Decide whether `country` matches `query`. Empty query → match everything.
 * Three independent checks: AR name, EN name, dial code (with multiple
 * digit-form variants so "962", "+962", and "00962" all hit Jordan).
 */
function countryMatches(country: Country, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  // AR name — direct substring (no normalization beyond lowercase, AR isn't
  // case-sensitive but lowercase is a no-op for it).
  if (country.nameAr.includes(q)) return true;

  // EN name — case-insensitive substring.
  if (normalize(country.nameEn).includes(q)) return true;

  // Dial code — check raw, no-leading-plus, and digit-only-with-prefixes.
  const dial = country.dialCode;                // "+962"
  const dialNoPlus = dial.replace('+', '');     // "962"
  const qNoPlus = q.replace('+', '');           // user-typed
  if (dial.includes(q)) return true;
  if (dialNoPlus.includes(qNoPlus)) return true;

  // ISO code — power-user shortcut ("jo" → Jordan).
  if (normalize(country.code).includes(q)) return true;

  return false;
}

export const CountryPickerSheet: React.FC<CountryPickerSheetProps> = ({
  open,
  selectedCode,
  onSelect,
  onClose,
}) => {
  const { locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Reset the search every time the sheet opens, and autofocus the input
  // a beat after the slide-up so the keyboard doesn't fight the animation
  // on mobile.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, reduceMotion ? 0 : 220);
    return () => window.clearTimeout(id);
  }, [open, reduceMotion]);

  // Escape closes the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(
    () => COUNTRIES.filter((c) => countryMatches(c, query)),
    [query]
  );

  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code);
      onClose();
    },
    [onSelect, onClose]
  );

  // Animation variants. Reduced-motion swaps slide-up for fade.
  const sheetInitial = reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 1 };
  const sheetAnimate = reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 };
  const sheetExit = reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 1 };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="country-picker-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm"
            aria-hidden
          />

          {/* Sheet — constrained to the 430px shell on desktop via max-w + mx-auto. */}
          <motion.div
            key="country-picker-sheet"
            ref={sheetRef}
            initial={sheetInitial}
            animate={sheetAnimate}
            exit={sheetExit}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'اختر الدولة' : 'Choose your country'}
            dir={dir}
            className="fixed inset-x-0 bottom-0 z-[121] max-w-[430px] mx-auto bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl"
          >
            {/* Drag handle */}
            <div className="pt-3 pb-1 flex items-center justify-center">
              <span className="block w-12 h-1 rounded-full bg-slate-300" aria-hidden />
            </div>

            {/* Header */}
            <div className="relative px-5 pt-2 pb-3">
              <h2 className="text-center text-base font-extrabold text-slate-800">
                {isAr ? 'اختر الدولة' : 'Choose your country'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                className="absolute top-1 end-3 w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400 pointer-events-none"
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  inputMode="search"
                  type="search"
                  placeholder={
                    isAr ? 'ابحث: الأردن، Jordan، 962…' : 'Search: Jordan, الأردن, 962…'
                  }
                  className="w-full bg-slate-50 rounded-xl border border-slate-200 ps-9 pe-4 py-3 text-base font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-duo-blue focus:bg-white focus:shadow-[0_0_0_4px_rgba(28,176,246,0.12)] transition-all"
                  aria-label={isAr ? 'ابحث عن دولة' : 'Search for a country'}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-6">
              {filtered.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-400">
                    {isAr ? 'لا توجد نتائج' : 'No matches'}
                  </p>
                </div>
              ) : (
                <ul role="listbox" aria-activedescendant={`country-row-${selectedCode}`}>
                  {filtered.map((country) => {
                    const selected = country.code === selectedCode;
                    return (
                      <li key={country.code}>
                        <button
                          id={`country-row-${country.code}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => handleSelect(country.code)}
                          className={
                            selected
                              ? 'w-full flex items-center gap-3 px-5 py-3 bg-duo-blue-light text-slate-800 active:bg-duo-blue-light/80 transition-colors'
                              : 'w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors'
                          }
                        >
                          <span className="text-2xl leading-none shrink-0" aria-hidden>
                            {country.flag}
                          </span>
                          <span className="flex-1 min-w-0 text-start text-base font-extrabold text-slate-800 truncate">
                            {isAr ? country.nameAr : country.nameEn}
                          </span>
                          <span
                            className="text-sm font-semibold text-slate-500 tabular-nums shrink-0"
                            dir="ltr"
                          >
                            {country.dialCode}
                          </span>
                          {selected && (
                            <span
                              className="w-6 h-6 rounded-full bg-duo-blue flex items-center justify-center shrink-0"
                              aria-hidden
                            >
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CountryPickerSheet;
