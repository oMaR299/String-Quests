// PhoneScreen.tsx — step 3
// ─────────────────────────────────────────────────────────────────────────────
// Phone entry with a real country picker. Default country is detected from the
// browser timezone (Jordan as the home-market fallback). The country selector
// opens a bottom-sheet picker; selecting a country updates the dial-code
// prefix, placeholder, helper text, formatter (group pattern), and digit-count
// validation. CTA mocks a 1.2s "sending" state then advances to OTP.
//
// Phone digits are stored RAW (no spaces, no prefix) in state — formatting is
// purely a display layer driven by the active country's groupPattern.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentOnboardingString, interpolate } from '../parentOnboardingI18n';
import { PrimaryButton } from '../PrimaryButton';
import { WhatsAppIcon } from '../../notification-admin/compose/WhatsAppIcon';
import { CountryPickerSheet } from '../CountryPickerSheet';
import { type Country, formatPhone, getCountryByCode } from '../countries';

export interface PhoneScreenHandle {
  /** Bottom CTA element to render in the sticky strip. */
  bottom: React.ReactNode;
  /** Body. */
  body: React.ReactNode;
}

interface PhoneScreenProps {
  /** Initial digit value (no spaces, no prefix). Length depends on country. */
  initialPhone: string;
  /** Currently selected country (drives prefix, format, validation). */
  country: Country;
  /** User picked a different country. */
  onCountryChange: (country: Country) => void;
  /** Called with the digit-only value when the user advances. */
  onSubmit: (phone: string) => void;
}

/** Strip everything that isn't a digit. */
function digitsOnly(input: string): string {
  return input.replace(/\D+/g, '');
}

interface ScreenProps extends PhoneScreenProps {
  /** Render-prop hook so the layout can host the body and the CTA in
   *  separate slots (body inside scroll area, CTA inside sticky bottom). */
  renderShell: (parts: { body: React.ReactNode; bottom: React.ReactNode }) => React.ReactNode;
}

export const PhoneScreen: React.FC<ScreenProps> = ({
  initialPhone,
  country,
  onCountryChange,
  onSubmit,
  renderShell,
}) => {
  const { locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const t = useCallback((key: string) => getParentOnboardingString(locale, key), [locale]);

  const [digits, setDigits] = useState<string>(initialPhone);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hard-validation: only digit-count gates the CTA. Prefix is a soft hint.
  const isValid = digits.length === country.digits;

  // Soft prefix check — surfaces an amber helper if the first 1-2 digits
  // don't match any of the country's known prefixes. Never blocks submit.
  const prefixWarn = useMemo(() => {
    if (!country.validPrefixes || country.validPrefixes.length === 0) return false;
    if (digits.length === 0) return false;
    return !country.validPrefixes.some((p) => digits.startsWith(p));
  }, [country, digits]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = digitsOnly(e.target.value).slice(0, country.digits);
      setDigits(raw);
    },
    [country.digits]
  );

  const handleSubmit = useCallback(() => {
    if (!isValid || sending) return;
    setSending(true);
    // Mock the SMS-send latency. We deliberately don't time-spike on a real
    // network call — just feel-good UX delay.
    window.setTimeout(() => {
      setSending(false);
      onSubmit(digits);
    }, 1200);
  }, [digits, isValid, onSubmit, sending]);

  const formatted = useMemo(() => formatPhone(country, digits), [country, digits]);

  const localizedCountryName = isAr ? country.nameAr : country.nameEn;

  const helperText = useMemo(
    () =>
      interpolate(t('parentOnboarding.phone.helperGeneric'), {
        digits: country.digits,
        country: localizedCountryName,
      }),
    [t, country.digits, localizedCountryName]
  );

  const handlePickCountry = useCallback(
    (code: string) => {
      const next = getCountryByCode(code);
      onCountryChange(next);
      // Clear local digits — different country = different shape.
      setDigits('');
    },
    [onCountryChange]
  );

  const body = (
    <div className="space-y-6 pt-2">
      {/* Headline + WhatsApp framing + subhead */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
          {t('parentOnboarding.phone.title')}
        </h1>
        {/* WhatsApp pill — sets expectation that the code arrives via WhatsApp,
            not SMS. Parents read this and know exactly which app to open. */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full ps-2 pe-3 py-1">
          <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <WhatsAppIcon className="w-4 h-4" />
          </span>
          <span className="text-xs font-extrabold text-emerald-700">
            {t('parentOnboarding.phone.viaWhatsapp')}
          </span>
        </div>
        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
          {t('parentOnboarding.phone.subtitle')}
        </p>
      </motion.div>

      {/* Phone input row — country selector + input visually fused */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
        className="space-y-2"
      >
        <label
          htmlFor="parent-phone-input"
          className="block text-xs font-bold uppercase tracking-wider text-slate-400 ps-1"
        >
          {t('parentOnboarding.phone.numberLabel')}
        </label>
        <div className="flex items-stretch gap-2" dir={dir}>
          {/* Country selector — tap opens the picker sheet */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label={`${t('parentOnboarding.phone.countryLabel')}: ${localizedCountryName}`}
            aria-haspopup="dialog"
            className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-white/90 border-2 border-slate-200 shadow-sm shrink-0 hover:border-duo-blue/60 hover:bg-white transition-colors active:scale-[0.98]"
          >
            <span className="text-xl leading-none" aria-hidden>
              {country.flag}
            </span>
            <span className="font-extrabold text-slate-700 text-base tabular-nums" dir="ltr">
              {country.dialCode}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden />
          </button>

          {/* Input card */}
          <div
            onClick={() => inputRef.current?.focus()}
            className={
              isValid
                ? 'flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-duo-blue shadow-[0_0_0_4px_rgba(28,176,246,0.15)] transition-all duration-150'
                : 'flex-1 px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 shadow-sm transition-all duration-150 focus-within:border-duo-blue focus-within:shadow-[0_0_0_4px_rgba(28,176,246,0.15)]'
            }
          >
            <input
              ref={inputRef}
              id="parent-phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              value={formatted}
              onChange={handleChange}
              placeholder={country.placeholderPattern}
              className="w-full bg-transparent outline-none text-2xl font-extrabold tabular-nums text-slate-800 placeholder:text-slate-300 placeholder:font-bold"
              aria-invalid={digits.length > 0 && !isValid}
              aria-describedby="parent-phone-helper"
            />
          </div>
        </div>
        {/* Helper line — country-aware. Soft amber if the prefix looks off. */}
        <p
          id="parent-phone-helper"
          className={
            prefixWarn
              ? 'text-xs font-semibold text-amber-600 ps-1'
              : 'text-xs font-semibold text-slate-400 ps-1'
          }
        >
          {helperText}
        </p>
      </motion.div>

      {/* Reassurance card — keeps the bottom of the viewport from feeling empty */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.12 }}
        className="rounded-2xl bg-white/70 backdrop-blur border border-white/80 shadow-sm p-4 flex items-start gap-3"
      >
        <span
          className="shrink-0 w-9 h-9 rounded-full bg-slate-100 text-slate-500 inline-flex items-center justify-center"
          aria-hidden
        >
          <Lock className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
          {t('parentOnboarding.phone.reassurance')}
        </p>
      </motion.div>

      {/* Country picker sheet — portal-ish overlay, lives inside the body so
          AnimatePresence + the shell scroll work correctly. */}
      <CountryPickerSheet
        open={pickerOpen}
        selectedCode={country.code}
        onSelect={handlePickCountry}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );

  const bottom = (
    <PrimaryButton
      onClick={handleSubmit}
      disabled={!isValid}
      loading={sending}
      aria-label={t('parentOnboarding.phone.cta')}
    >
      {sending ? t('parentOnboarding.phone.ctaSending') : t('parentOnboarding.phone.cta')}
    </PrimaryButton>
  );

  return <>{renderShell({ body, bottom })}</>;
};

export default PhoneScreen;
