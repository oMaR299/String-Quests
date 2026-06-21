// StatusLegend.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The plain-language colour key so the mastery-ring colours are always decodable
// at a glance: 🟢 متقَن · 🔵 جيّد · 🟡 يتطوّر · 🔴 يحتاج دعماً. Color is the language;
// this makes it foolproof (color + word, never color alone). RTL, Cairo.

import React, { useCallback } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { STATUS_COLOR } from './skillMapKit';
import type { ParentSkillStatus } from './data/parentAppSkillMapMock';

const ORDER: ParentSkillStatus[] = ['mastered', 'proficient', 'developing', 'needsHelp'];

const LABEL_KEY: Record<ParentSkillStatus, string> = {
  mastered: 'parentApp.skillMap.legend.mastered',
  proficient: 'parentApp.skillMap.legend.proficient',
  developing: 'parentApp.skillMap.legend.developing',
  needsHelp: 'parentApp.skillMap.legend.needsHelp',
};

export const StatusLegend: React.FC<{ statuses?: ParentSkillStatus[] }> = ({ statuses = ORDER }) => {
  const { locale } = useI18n();
  const t = useCallback((k: string) => getParentAppString(locale, k), [locale]);
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 px-1" role="list">
      {statuses.map((s) => (
        <span key={s} role="listitem" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[s] }} aria-hidden="true" />
          {t(LABEL_KEY[s])}
        </span>
      ))}
    </div>
  );
};

export default StatusLegend;
