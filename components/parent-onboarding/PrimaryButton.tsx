// PrimaryButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Flat (Linear/Vercel-style) CTA used across the Parent App AND Parent
// Onboarding. The previous chunky 3D Duolingo-shadow recipe was retired in the
// 2026-05 visual-language refactor — every active surface in the Parent App
// is now flat with hairline borders. Press feedback: brief scale + color
// shift (color shift only under reduced motion). `loading` slot preserved
// for the existing "Sending..." / "Verifying..." flows.

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
      'bg-duo-blue text-white hover:bg-duo-blue-dark active:bg-duo-blue-dark motion-safe:active:scale-[0.98]',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
  },
  secondary: {
    base:
      'bg-white text-duo-blue border border-slate-200 hover:bg-slate-50 active:bg-slate-50 motion-safe:active:scale-[0.98]',
    disabled: 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed',
  },
  green: {
    base:
      'bg-duo-green text-white hover:bg-duo-green-dark active:bg-duo-green-dark motion-safe:active:scale-[0.98]',
    disabled: 'bg-slate-200 text-slate-400 cursor-not-allowed',
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
      className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold text-base tracking-tight transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40 ${stateClasses} ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
