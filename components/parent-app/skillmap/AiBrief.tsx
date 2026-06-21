// AiBrief.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A small AI-styled brief shown at the top of each skill-map view and each
// subject-sheet tab. Warm one/two-sentence synthesis, assembled from data
// (see parentAppAiBriefs.ts) — never free-form. Purple sparkles = the AI voice.

import React, { useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';

export const AiBrief: React.FC<{ text: string }> = ({ text }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  if (!text) return null;
  return (
    <div className="rounded-2xl bg-duo-purple-light border border-duo-purple/20 p-3.5 flex items-start gap-2.5">
      <span
        className="w-7 h-7 rounded-xl inline-flex items-center justify-center shrink-0 bg-duo-purple text-white"
        aria-hidden="true"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-duo-purple">
          {t('parentApp.skillMap.aiBrief')}
        </div>
        <p className="text-[13px] font-bold text-slate-700 leading-relaxed text-start">{text}</p>
      </div>
    </div>
  );
};

export default AiBrief;
