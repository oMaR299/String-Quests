/**
 * sq-Select — native <select> wrapped with consistent design-system styling.
 * Native is intentional: keyboard / screen-reader / mobile-OS picker support
 * without re-implementing a combobox.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SqSelectOption {
  value: string;
  label: string;
}

interface SqSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'className' | 'children'
  > {
  label?: string;
  helper?: string;
  error?: string;
  locale?: 'ar' | 'en';
  options: SqSelectOption[];
  className?: string;
}

export const SqSelect: React.FC<SqSelectProps> = ({
  label,
  helper,
  error,
  locale = 'ar',
  options,
  className,
  ...rest
}) => {
  const dirAttr = locale === 'ar' ? 'rtl' : 'ltr';
  const errored = !!error;
  return (
    <div className={className} dir={dirAttr}>
      {label && (
        <label className="block mb-1.5 text-xs font-bold text-slate-600 font-cairo">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...rest}
          className={`appearance-none w-full font-cairo font-medium text-slate-800 bg-white border-2 rounded-xl px-4 py-3 pe-10 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sq-brand-500/20 disabled:opacity-60 ${
            errored
              ? 'border-sq-danger-500 focus:border-sq-danger-500'
              : 'border-slate-200 focus:border-sq-brand-500'
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${
            locale === 'ar' ? 'left-4' : 'right-4'
          }`}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-[11px] font-bold text-sq-danger-600 font-cairo">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-[11px] font-bold text-slate-400 font-cairo">{helper}</p>
      ) : null}
    </div>
  );
};

export default SqSelect;
