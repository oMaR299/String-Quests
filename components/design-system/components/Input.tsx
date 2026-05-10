/**
 * sq-Input — text input + variants.
 *
 * Variants: text | email | phone | code | textarea
 * State: idle / focus / error / disabled
 *
 * AR/EN aware via a `locale` prop. The label and helper sit above the
 * field; the error replaces the helper when present and tints the
 * field's border to danger.
 */

import React from 'react';
import { Phone, type LucideIcon } from 'lucide-react';

export type SqInputVariant = 'text' | 'email' | 'phone' | 'code' | 'textarea';

interface SqInputBaseProps {
  label?: string;
  helper?: string;
  error?: string;
  locale?: 'ar' | 'en';
  /** Optional leading icon (lucide). */
  leadingIcon?: LucideIcon;
  className?: string;
}

interface SqTextInputProps
  extends SqInputBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  variant?: 'text' | 'email' | 'phone' | 'code';
  /** Phone-only — country prefix to display (e.g. "+966"). */
  prefix?: string;
}

interface SqTextareaProps
  extends SqInputBaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  variant: 'textarea';
}

export type SqInputProps = SqTextInputProps | SqTextareaProps;

/* ─── Class fragments ─────────────────────────────────────────────────── */

const FIELD_BASE =
  'w-full font-cairo font-medium text-slate-800 placeholder:text-slate-400 ' +
  'bg-white border-2 rounded-xl ' +
  'transition-all duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-sq-brand-500/20 ' +
  'disabled:opacity-60 disabled:bg-slate-50';

const FIELD_PADDING_INPUT = 'px-4 py-3 text-sm';
const FIELD_PADDING_CODE = 'px-4 py-3 text-2xl font-mono tracking-[0.4em] tabular-nums text-center';
const FIELD_PADDING_TEXTAREA = 'px-4 py-3 text-sm min-h-[96px]';

const FIELD_BORDER_IDLE = 'border-slate-200 focus:border-sq-brand-500';
const FIELD_BORDER_ERROR = 'border-sq-danger-500 focus:border-sq-danger-500 focus:ring-sq-danger-500/20';

const LABEL_CLS = 'block mb-1.5 text-xs font-bold text-slate-600 font-cairo';
const HELPER_CLS = 'mt-1.5 text-[11px] font-bold text-slate-400 font-cairo';
const ERROR_CLS = 'mt-1.5 text-[11px] font-bold text-sq-danger-600 font-cairo';

/* ─── Component ───────────────────────────────────────────────────────── */

export const SqInput: React.FC<SqInputProps> = (props) => {
  const { label, helper, error, locale = 'ar', leadingIcon: LeadingIcon } = props;
  const dirAttr = locale === 'ar' ? 'rtl' : 'ltr';
  const errored = !!error;

  if (props.variant === 'textarea') {
    const { variant: _v, label: _l, helper: _h, error: _e, locale: _lo, leadingIcon: _li, className, ...rest } = props;
    void _v; void _l; void _h; void _e; void _lo; void _li;
    return (
      <div className={className} dir={dirAttr}>
        {label && <label className={LABEL_CLS}>{label}</label>}
        <textarea
          {...rest}
          className={`${FIELD_BASE} ${FIELD_PADDING_TEXTAREA} ${
            errored ? FIELD_BORDER_ERROR : FIELD_BORDER_IDLE
          } resize-y`}
        />
        {error ? <p className={ERROR_CLS}>{error}</p> : helper ? <p className={HELPER_CLS}>{helper}</p> : null}
      </div>
    );
  }

  // input variants
  const variant = props.variant ?? 'text';
  const { label: _l, helper: _h, error: _e, locale: _lo, leadingIcon: _li, prefix, className, ...rest } = props;
  void _l; void _h; void _e; void _lo; void _li;

  const padding = variant === 'code' ? FIELD_PADDING_CODE : FIELD_PADDING_INPUT;
  const border = errored ? FIELD_BORDER_ERROR : FIELD_BORDER_IDLE;

  // Phone: render the prefix as an inline pill
  if (variant === 'phone') {
    return (
      <div className={className} dir={dirAttr}>
        {label && <label className={LABEL_CLS}>{label}</label>}
        <div className={`flex items-stretch gap-2`}>
          <span className="inline-flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm border-2 border-slate-200 font-cairo">
            <Phone className="w-3.5 h-3.5" />
            {prefix ?? '+966'}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            {...rest}
            className={`${FIELD_BASE} ${FIELD_PADDING_INPUT} ${border} flex-1`}
          />
        </div>
        {error ? <p className={ERROR_CLS}>{error}</p> : helper ? <p className={HELPER_CLS}>{helper}</p> : null}
      </div>
    );
  }

  return (
    <div className={className} dir={dirAttr}>
      {label && <label className={LABEL_CLS}>{label}</label>}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${
              locale === 'ar' ? 'right-4' : 'left-4'
            }`}
          />
        )}
        <input
          type={variant === 'email' ? 'email' : 'text'}
          {...rest}
          className={`${FIELD_BASE} ${padding} ${border} ${
            LeadingIcon ? (locale === 'ar' ? 'pe-11' : 'ps-11') : ''
          }`}
        />
      </div>
      {error ? <p className={ERROR_CLS}>{error}</p> : helper ? <p className={HELPER_CLS}>{helper}</p> : null}
    </div>
  );
};

export default SqInput;
