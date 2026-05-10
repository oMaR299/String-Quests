/**
 * PowerupConfirmDialog — reusable confirmation step before any in-question
 * power-up activation (Wave C integration).
 *
 * Wraps the existing `SqDialog` glass primitive and adds a power-up-specific
 * body: large group-tinted icon tile, localized name + description, owned-count
 * line, and an optional warning string (used for Skip / Auto-Complete to flag
 * the perfect-bonus disqualification).
 *
 * Visual recipe matches the rest of the SQ system — light theme, glassmorphism,
 * AR-first bilingual w/ RTL. Relies on the shared `usePowerups()` hook for
 * inventory reads so the dialog is fully self-contained beyond `slug` + open.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import {
  POWERUP_CATALOG,
  type PowerupGroup,
  type PowerupSlug,
} from '../../data/mockPowerupsData';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';
import { PowerupIcon } from '../powerups/PowerupIcon';

export interface PowerupConfirmDialogProps {
  open: boolean;
  slug: PowerupSlug | null;
  /** Optional warning copy — when set, the confirm CTA flips to danger tone. */
  warning?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const GROUP_GRADIENT: Record<PowerupGroup, string> = {
  defensive:       'bg-gradient-to-br from-sky-400 to-sq-info-500',
  xp_booster:      'bg-gradient-to-br from-amber-400 to-sq-warning-500',
  question_helper: 'bg-gradient-to-br from-violet-400 to-sq-brand-500',
  reactive:        'bg-gradient-to-br from-emerald-400 to-sq-success-500',
  combo_streak:    'bg-gradient-to-br from-rose-400 to-sq-danger-500',
  power_solve:     'bg-gradient-to-br from-pastel-purple to-sq-brand-500',
};

const GROUP_HEADER_BG: Record<PowerupGroup, string> = {
  defensive:       'bg-gradient-to-br from-sky-500 to-sq-info-600',
  xp_booster:      'bg-gradient-to-br from-amber-500 to-sq-warning-600',
  question_helper: 'bg-gradient-to-br from-violet-500 to-sq-brand-600',
  reactive:        'bg-gradient-to-br from-emerald-500 to-sq-success-600',
  combo_streak:    'bg-gradient-to-br from-rose-500 to-sq-danger-600',
  power_solve:     'bg-gradient-to-br from-pastel-purple to-sq-brand-600',
};

export const PowerupConfirmDialog: React.FC<PowerupConfirmDialogProps> = ({
  open,
  slug,
  warning,
  onConfirm,
  onCancel,
}) => {
  const { t, locale } = useI18n();
  const { getOwned } = usePowerups();
  const reduce = useReducedMotion();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // Escape closes — mirrors SqDialog.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!slug) return null;
  const entry = POWERUP_CATALOG[slug];
  const name = t(`powerups.name.${slug}`);
  const desc = t(`powerups.desc.${slug}`);
  const owned = getOwned(slug);
  const hasWarning = !!warning;

  const headerBg = hasWarning
    ? 'bg-gradient-to-br from-rose-500 to-sq-danger-600'
    : GROUP_HEADER_BG[entry.group];

  const confirmBg = hasWarning
    ? 'bg-gradient-to-r from-rose-500 to-sq-danger-600'
    : 'bg-gradient-to-r from-sq-brand-500 to-sq-brand-600';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? MOTION_FALLBACK : { duration: 0.18 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm font-cairo"
          onClick={onCancel}
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sq-pup-confirm-title"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.92, opacity: 0, y: 12 }}
            transition={reduce ? MOTION_FALLBACK : SQ_SPRING.gentle}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white shadow-2xl overflow-hidden"
          >
            {/* Header — group-tinted gradient banner with floating icon tile */}
            <div className={`relative h-24 ${headerBg} overflow-hidden flex items-center justify-center`}>
              <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[2px]" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="relative z-10 p-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
                <PowerupIcon slug={slug} size={28} className="text-white" strokeWidth={2.25} />
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label={t('powerups.loadout.cancel')}
                className={[
                  'absolute top-3 z-10 p-1.5 rounded-full',
                  'bg-white/20 hover:bg-white/35 text-white transition-colors',
                  isAr ? 'left-3' : 'right-3',
                ].join(' ')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-2 text-center">
              <h3 id="sq-pup-confirm-title" className="text-xl font-black text-slate-800 mb-2">
                {name}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {desc}
              </p>

              {/* Owned line */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <span>{t('powerups.hud.owned')}</span>
                <span className="tabular-nums text-sq-brand-700">×{owned}</span>
              </div>

              {/* Warning row */}
              {hasWarning && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-start">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={['p-4 border-t border-slate-100 flex gap-3', isAr ? 'flex-row-reverse' : ''].join(' ')}>
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                {t('powerups.loadout.cancel')}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                className={`flex-[1.4] py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg ${confirmBg}`}
              >
                {t('powerups.hud.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PowerupConfirmDialog;
