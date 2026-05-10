// LocaleToggle.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Two-pill AR / EN toggle anchored to the top-end of the phone shell. Wires
// directly to the global I18nContext so flipping it cascades to the rest of
// the app — including the dir attribute and any other consumer of t().

import React from 'react';
import { useI18n } from '../../contexts/I18nContext';

export const LocaleToggle: React.FC = () => {
  const { locale, toggleLocale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <div
      className="inline-flex items-center h-12 p-1 rounded-2xl bg-white/70 border border-slate-200 shadow-sm font-bold text-sm select-none"
      role="group"
      aria-label="Language toggle"
    >
      <button
        type="button"
        onClick={() => {
          if (!isAr) toggleLocale();
        }}
        aria-pressed={isAr}
        className={
          isAr
            ? 'h-full px-3 rounded-xl bg-duo-blue text-white shadow-sm transition-all duration-150'
            : 'h-full px-3 rounded-xl text-slate-500 hover:text-slate-700 transition-all duration-150'
        }
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => {
          if (isAr) toggleLocale();
        }}
        aria-pressed={!isAr}
        className={
          !isAr
            ? 'h-full px-3 rounded-xl bg-duo-blue text-white shadow-sm transition-all duration-150'
            : 'h-full px-3 rounded-xl text-slate-500 hover:text-slate-700 transition-all duration-150'
        }
      >
        EN
      </button>
    </div>
  );
};

export default LocaleToggle;
