// MessagesSearchBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Search input pinned to top of InboxView. Lifted state — parent owns the
// query and re-renders dependent children with it.

import React from 'react';
import { Search, X } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export const MessagesSearchBar: React.FC<Props> = ({ value, onChange }) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  return (
    <div className="relative">
      <span
        className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none"
        aria-hidden="true"
      >
        <Search className="w-4 h-4" strokeWidth={2.5} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('parentApp.messages.search.placeholder')}
        autoComplete="off"
        inputMode="text"
        className="w-full rounded-full bg-slate-100 ps-9 pe-9 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-normal border border-transparent focus:outline-none focus:border-duo-blue focus:bg-white transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('parentApp.messages.compose.cancel')}
          className="absolute top-1/2 -translate-y-1/2 end-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 active:scale-95 transition-transform"
        >
          <X className="w-3 h-3" strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default MessagesSearchBar;
