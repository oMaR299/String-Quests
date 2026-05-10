/**
 * sq-Dialog — generalised dialog primitive.
 *
 * Variants:
 *   - confirm : yes/no, with destructive flag
 *   - info    : single CTA, no cancel
 *   - prompt  : single text input + confirm/cancel
 *
 * Mirrors the existing ConfirmDialog API but is parameterised so any
 * surface in the codebase can opt in. Backdrop, AnimatePresence, focus
 * to confirm on open, Escape-to-cancel, RTL-safe.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, HelpCircle, Info as InfoIcon } from 'lucide-react';
import { SQ_TONES, type SqTone } from '../tokens/colors';

export type SqDialogVariant = 'confirm' | 'info' | 'prompt';

export interface SqDialogProps {
  open: boolean;
  variant?: SqDialogVariant;
  tone?: SqTone;
  destructive?: boolean;
  title: string;
  body?: string;
  /** Prompt only — initial input value. */
  initialValue?: string;
  /** Prompt only — placeholder text. */
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** RTL-aware. */
  locale?: 'ar' | 'en';
  /** confirm/info: void; prompt: receives the typed value. */
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export const SqDialog: React.FC<SqDialogProps> = ({
  open,
  variant = 'confirm',
  tone = 'brand',
  destructive = false,
  title,
  body,
  initialValue = '',
  placeholder,
  confirmLabel,
  cancelLabel,
  locale = 'ar',
  onConfirm,
  onCancel,
}) => {
  const reduce = useReducedMotion();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [value, setValue] = useState(initialValue);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    if (variant === 'prompt') {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      confirmBtnRef.current?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel, variant]);

  const t = destructive ? SQ_TONES.danger : SQ_TONES[tone];
  const Icon =
    variant === 'info' ? InfoIcon : destructive ? AlertTriangle : HelpCircle;

  const fallbackConfirm = locale === 'ar' ? 'تأكيد' : 'Confirm';
  const fallbackCancel = locale === 'ar' ? 'إلغاء' : 'Cancel';
  const fallbackOk = locale === 'ar' ? 'حسناً' : 'OK';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onCancel}
          dir={dir}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.92, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white relative font-cairo"
          >
            {/* Header — gradient banner with floating icon tile */}
            <div
              className={`h-24 ${t.gradient} relative overflow-hidden flex items-center justify-center`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[2px]" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="relative z-10 p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
              {body && (
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  {body}
                </p>
              )}
              {variant === 'prompt' && (
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onConfirm(value);
                    }
                  }}
                  placeholder={placeholder}
                  className={`mt-4 w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-sq-brand-500 focus:ring-2 focus:ring-sq-brand-500/20 ${
                    locale === 'ar' ? 'text-right' : 'text-left'
                  }`}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex gap-3">
              {variant !== 'info' && (
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  {cancelLabel ?? fallbackCancel}
                </button>
              )}
              <button
                ref={confirmBtnRef}
                onClick={() => onConfirm(variant === 'prompt' ? value : undefined)}
                className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg ${t.gradient}`}
              >
                {confirmLabel ?? (variant === 'info' ? fallbackOk : fallbackConfirm)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SqDialog;
