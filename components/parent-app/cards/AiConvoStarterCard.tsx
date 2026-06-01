// AiConvoStarterCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Daily AI-generated conversation prompt. Always renders. Tap routes to
// /parent/aware-ai (the placeholder in v1; v2 wires the real assistant).

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';

export const AiConvoStarterCard: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const { state } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const prompt = locale === 'ar' ? state.aiConvoStarter.promptAr : state.aiConvoStarter.promptEn;

  return (
    <button
      type="button"
      onClick={() => navigate('/parent/aware-ai')}
      className="w-full text-start rounded-2xl bg-white border border-slate-200 p-4 flex gap-3 items-start hover:bg-slate-50 transition-colors motion-safe:active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-full bg-duo-purple-light inline-flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-duo-purple" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-duo-purple">
          {t('parentApp.ai.title')}
        </div>
        <p className="text-sm font-extrabold text-slate-800 leading-snug">{prompt}</p>
        <div className="text-[10px] font-bold text-slate-400 pt-0.5">
          {t('parentApp.ai.suggestedBy')}
        </div>
      </div>
    </button>
  );
};

export default AiConvoStarterCard;
