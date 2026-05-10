// BackButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Chevron-start back button. RTL-aware: the chevron flips by reading `dir`
// from I18nContext rather than mirroring with CSS transforms (cleaner SVG).

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface BackButtonProps {
  onClick: () => void;
  /** Override label; defaults to localized "Back". */
  label?: string;
  /** Hide if you only want the icon. */
  showLabel?: boolean;
  /** Disable interaction during transitions. */
  disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label,
  showLabel = false,
  disabled = false,
}) => {
  const { dir, locale } = useI18n();
  // In RTL the "back" direction visually points right; in LTR it points left.
  const Icon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const accessibleLabel = label ?? (locale === 'ar' ? 'رجوع' : 'Back');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={accessibleLabel}
      className="inline-flex items-center justify-center gap-1 h-12 min-w-12 px-3 rounded-2xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-800 border border-slate-200 shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm"
    >
      <Icon className="w-5 h-5" />
      {showLabel && <span>{accessibleLabel}</span>}
    </button>
  );
};

export default BackButton;
