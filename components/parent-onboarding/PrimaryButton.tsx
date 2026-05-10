// PrimaryButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Big chunky duo-blue CTA matching the HomePage / StartScreen vibe. The 4px
// bottom shadow that collapses to flat on press is the signature Duolingo
// micro-interaction. We include a `loading` slot for inline spinners (used by
// the phone "Sending..." state and the OTP "Verifying..." state).

import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'green';

interface PrimaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode;
  loading?: boolean;
  /** primary = duo-blue, secondary = white card, green = duo-green (used for "Done"). */
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, { base: string; disabled: string }> = {
  primary: {
    base:
      'bg-duo-blue text-white shadow-[0_4px_0_0_#1899D6] hover:bg-[#16A0E0] active:translate-y-[2px] active:shadow-none',
    disabled: 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed active:translate-y-0',
  },
  secondary: {
    base:
      'bg-white text-slate-700 border-2 border-slate-200 shadow-[0_4px_0_0_#E2E8F0] hover:bg-slate-50 active:translate-y-[2px] active:shadow-none',
    disabled: 'bg-slate-50 text-slate-300 border-slate-100 shadow-none cursor-not-allowed active:translate-y-0',
  },
  green: {
    base:
      'bg-duo-green text-white shadow-[0_4px_0_0_#4CAD00] hover:bg-[#52BC02] active:translate-y-[2px] active:shadow-none',
    disabled: 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed active:translate-y-0',
  },
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANT_CLASSES[variant];
  const stateClasses = isDisabled ? variantClasses.disabled : variantClasses.base;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      className={`relative w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 px-6 font-extrabold text-lg tracking-tight transition-all duration-100 outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${stateClasses} ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
