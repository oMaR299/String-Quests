// OtpScreen.tsx — step 4
// ─────────────────────────────────────────────────────────────────────────────
// 6-cell OTP input. Auto-advances per digit, paste fills all 6, backspace
// walks backward, full input mocks a 0.6s verify spin then auto-advances.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentOnboardingString, interpolate } from '../parentOnboardingI18n';
import { WhatsAppIcon } from '../../notification-admin/compose/WhatsAppIcon';
import { type Country, formatPhone } from '../countries';

const CELL_COUNT = 6;
const RESEND_SECONDS = 30;

interface ScreenProps {
  /** National-number digits (no spaces). Length matches `country.digits`. */
  phone: string;
  /** Country used to render the dial code + format the digit display. */
  country: Country;
  /** User wants to change the phone — back to PhoneScreen. */
  onChangePhone: () => void;
  /** Successfully verified — advance. */
  onVerified: () => void;
  /** Render-prop hook (matches the other screens). */
  renderShell: (parts: { body: React.ReactNode; bottom: React.ReactNode }) => React.ReactNode;
}

export const OtpScreen: React.FC<ScreenProps> = ({
  phone,
  country,
  onChangePhone,
  onVerified,
  renderShell,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentOnboardingString(locale, key), [locale]);
  const reduceMotion = useReducedMotion();

  const [cells, setCells] = useState<string[]>(() => Array(CELL_COUNT).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // Latest onVerified callback in a ref so the auto-submit effect doesn't
  // re-run when the parent re-renders with a new closure.
  const onVerifiedRef = useRef(onVerified);
  useEffect(() => { onVerifiedRef.current = onVerified; }, [onVerified]);
  // Guards re-entry of the auto-submit effect. Without this, the effect
  // re-runs whenever `verifying` toggles, the cleanup clears the in-flight
  // timeout, and `onVerified()` never fires — the bug the user hit.
  const verifyingRef = useRef(false);

  // Auto-focus the first cell on mount.
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Resend countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const allFilled = useMemo(() => cells.every((c) => /^\d$/.test(c)), [cells]);

  /** Run the mock verification and advance. Idempotent. */
  const verifyAndAdvance = useCallback(() => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    window.setTimeout(() => {
      setVerifying(false);
      // Don't reset verifyingRef — once verified we're moving on; if the
      // parent unmounts us this becomes irrelevant.
      onVerifiedRef.current();
    }, 600);
  }, []);

  // Auto-submit on full input. Depends ONLY on `allFilled` so toggling
  // `verifying` mid-effect can't kill the in-flight timeout.
  useEffect(() => {
    if (!allFilled) return;
    verifyAndAdvance();
  }, [allFilled, verifyAndAdvance]);

  const setCell = useCallback((idx: number, value: string) => {
    setCells((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Strip non-digits — handles paste of "5 6 7" etc.
      const digits = raw.replace(/\D+/g, '');

      if (digits.length === 0) {
        setCell(idx, '');
        return;
      }

      // If multiple digits arrived (e.g. paste into one cell), distribute
      // them across the remaining cells.
      if (digits.length > 1) {
        setCells((prev) => {
          const next = [...prev];
          for (let i = 0; i < digits.length && idx + i < CELL_COUNT; i += 1) {
            next[idx + i] = digits[i];
          }
          return next;
        });
        const targetIdx = Math.min(idx + digits.length, CELL_COUNT - 1);
        inputsRef.current[targetIdx]?.focus();
        return;
      }

      setCell(idx, digits);
      if (idx < CELL_COUNT - 1) {
        inputsRef.current[idx + 1]?.focus();
      }
    },
    [setCell]
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (cells[idx]) {
          // Clear current cell.
          setCell(idx, '');
        } else if (idx > 0) {
          // Move back and clear the previous cell.
          inputsRef.current[idx - 1]?.focus();
          setCell(idx - 1, '');
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && idx < CELL_COUNT - 1) {
        inputsRef.current[idx + 1]?.focus();
        e.preventDefault();
      }
    },
    [cells, setCell]
  );

  const handlePaste = useCallback(
    (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData('text');
      const digits = text.replace(/\D+/g, '').slice(0, CELL_COUNT - idx);
      if (digits.length === 0) return;
      e.preventDefault();
      setCells((prev) => {
        const next = [...prev];
        for (let i = 0; i < digits.length && idx + i < CELL_COUNT; i += 1) {
          next[idx + i] = digits[i];
        }
        return next;
      });
      const targetIdx = Math.min(idx + digits.length, CELL_COUNT - 1);
      inputsRef.current[targetIdx]?.focus();
    },
    []
  );

  const handleResend = useCallback(() => {
    setSecondsLeft(RESEND_SECONDS);
    setCells(Array(CELL_COUNT).fill(''));
    inputsRef.current[0]?.focus();
  }, []);

  // Wire the shake animation. Currently dormant (we never reject), but the
  // hook is here so a future failure path can flip it.
  useEffect(() => {
    if (!shake) return;
    const id = window.setTimeout(() => setShake(false), 400);
    return () => window.clearTimeout(id);
  }, [shake]);

  const cellsRow = (
    <motion.div
      animate={shake && !reduceMotion ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center gap-2"
      dir="ltr"
    >
      {cells.map((value, idx) => {
        const filled = /^\d$/.test(value);
        return (
          <motion.div
            key={idx}
            initial={false}
            animate={
              filled
                ? reduceMotion
                  ? { scale: 1 }
                  : { scale: [1, 1.08, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.18 }}
            className={
              verifying
                ? 'w-12 h-14 rounded-2xl flex items-center justify-center bg-duo-blue-light/70 border-2 border-duo-blue/60 transition-colors'
                : filled
                  ? 'w-12 h-14 rounded-xl flex items-center justify-center bg-white border border-duo-blue ring-2 ring-duo-blue/20 transition-colors'
                  : 'w-12 h-14 rounded-2xl flex items-center justify-center bg-white border-2 border-slate-200 shadow-sm transition-colors focus-within:border-duo-blue focus-within:shadow-[0_0_0_4px_rgba(28,176,246,0.15)]'
            }
          >
            <input
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              pattern="[0-9]"
              value={value}
              disabled={verifying}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={(e) => handlePaste(idx, e)}
              className="w-full h-full bg-transparent outline-none text-center text-2xl font-extrabold text-slate-800 tabular-nums"
              aria-label={`OTP digit ${idx + 1}`}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );

  const body = (
    <div className="space-y-6 pt-2">
      {/* Headline + WhatsApp framing + phone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
          {t('parentOnboarding.otp.title')}
        </h1>
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full ps-2 pe-3 py-1">
          <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <WhatsAppIcon className="w-4 h-4" />
          </span>
          <span className="text-xs font-extrabold text-emerald-700">
            {t('parentOnboarding.otp.viaWhatsapp')}
          </span>
        </div>
        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
          {t('parentOnboarding.otp.subtitle')}{' '}
          <span className="font-extrabold text-slate-700 tabular-nums" dir="ltr">
            {country.dialCode} {formatPhone(country, phone)}
          </span>
          {'  '}
          <button
            type="button"
            onClick={onChangePhone}
            className="text-duo-blue hover:text-duo-blue-dark font-extrabold underline underline-offset-2 transition-colors"
          >
            {t('parentOnboarding.otp.change')}
          </button>
        </p>
      </motion.div>

      {/* OTP cells */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.06 }}
        className="rounded-2xl bg-white/80 backdrop-blur border border-white/90 shadow-sm p-5"
      >
        {cellsRow}
        {verifying && (
          <p className="text-center text-sm font-bold text-duo-blue mt-4 animate-pulse">
            {t('parentOnboarding.otp.verifying')}
          </p>
        )}
      </motion.div>

      {/* Resend — "Didn't get the code?" prompt softens the wait and gives
          the user a clear escape hatch the moment the timer hits zero. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.12 }}
        className="text-center space-y-1"
      >
        <p className="text-xs font-semibold text-slate-400">
          {t('parentOnboarding.otp.didntGet')}
        </p>
        {secondsLeft > 0 ? (
          <p className="text-sm font-semibold text-slate-500 tabular-nums">
            {interpolate(t('parentOnboarding.otp.resendIn'), { seconds: secondsLeft })}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm font-extrabold text-duo-blue hover:text-duo-blue-dark transition-colors px-3 py-2 rounded-xl hover:bg-duo-blue-light/50 active:scale-95"
          >
            {t('parentOnboarding.otp.resendNow')}
          </button>
        )}
      </motion.div>
    </div>
  );

  // Manual safety-net CTA. Auto-submit fires the moment all 6 cells fill,
  // but if anything stalls (browser autofill timing, state update batching),
  // the user still has a tappable button to advance. It mirrors the same
  // verifyAndAdvance() the auto-submit calls, so the flow is identical.
  const bottom = (
    <button
      type="button"
      onClick={verifyAndAdvance}
      disabled={!allFilled || verifying}
      className={
        allFilled && !verifying
          ? 'w-full bg-duo-blue text-white hover:bg-duo-blue-dark active:bg-duo-blue-dark motion-safe:active:scale-[0.98] rounded-xl py-3 px-5 font-bold text-base transition-colors'
          : 'w-full bg-slate-200 text-slate-400 cursor-not-allowed rounded-xl py-3 px-5 font-bold text-base'
      }
    >
      {verifying ? t('parentOnboarding.otp.verifying') : t('parentOnboarding.otp.cta')}
    </button>
  );

  return <>{renderShell({ body, bottom })}</>;
};

export default OtpScreen;
