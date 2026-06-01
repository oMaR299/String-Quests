// SupernovaTeaserCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Day-30+ contextual upsell for the Supernova premium plan. v1 ships GATED
// OFF — the gating function in `parentAppMockData.ts` always returns false
// because `daysSinceFirstLogin` is seeded to 5. The file ships ready for
// activation in v3 when the upsell + paywall land.
//
// Renders: glass card with violet-purple gradient accent, "Unlock Supernova"
// headline, 1-line value prop, "Learn more" CTA. CTA is a no-op stub — v3
// wires the paywall flow.

import React, { useCallback } from 'react';
import { Crown } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { shouldShowSupernovaTeaser } from '../parentAppMockData';
import { useParentAppContext } from '../useParentAppContext';

export const SupernovaTeaserCard: React.FC = () => {
  const { locale } = useI18n();
  const { state } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  if (!shouldShowSupernovaTeaser(state)) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-3 items-start">
      <div className="w-10 h-10 rounded-full bg-duo-purple-light inline-flex items-center justify-center shrink-0">
        <Crown className="w-5 h-5 text-duo-purple" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-extrabold text-slate-800 leading-snug">
          {t('parentApp.supernova.title')}
        </p>
        <p className="text-xs font-semibold text-slate-600 leading-snug">
          {t('parentApp.supernova.body')}
        </p>
        <button
          type="button"
          className="mt-1 inline-flex items-center px-3 py-1.5 rounded-full bg-duo-purple text-white text-xs font-bold hover:bg-[#B970FF] active:bg-[#B970FF] motion-safe:active:scale-[0.97] transition-colors duration-100"
        >
          {t('parentApp.supernova.cta')}
        </button>
      </div>
    </section>
  );
};

export default SupernovaTeaserCard;
