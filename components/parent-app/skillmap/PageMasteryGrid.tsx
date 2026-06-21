// PageMasteryGrid.tsx
// ─────────────────────────────────────────────────────────────────────────────
// GitHub-contribution-style grid for a subject's textbook pages. Each page is a
// small rounded square colored by its mastery status (green good → red weak,
// gray = not started). Hover/long-press shows page number + title + %.
//
// Pure presentation: takes the flattened ordered pages. Flat, Cairo, RTL,
// status palette consistent with the rest of the skill map.

import React, { useCallback } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type { ParentSkillStatus } from './data/parentAppSkillMapMock';
import type { TreePage } from './data/parentAppTextbookTreeMock';

import { STATUS_COLOR } from './skillMapKit';

const NOT_STARTED = '#E2E8F0'; // slate-200

function pageColor(page: TreePage): string {
  if (page.masteryPct <= 0) return NOT_STARTED;
  return STATUS_COLOR[page.status];
}

const LEGEND: { key: ParentSkillStatus | 'notStarted'; color: string; labelKey: string }[] = [
  { key: 'mastered', color: STATUS_COLOR.mastered, labelKey: 'parentApp.skillMap.tree.legendMastered' },
  { key: 'proficient', color: STATUS_COLOR.proficient, labelKey: 'parentApp.skillMap.tree.legendProficient' },
  { key: 'developing', color: STATUS_COLOR.developing, labelKey: 'parentApp.skillMap.tree.legendDeveloping' },
  { key: 'needsHelp', color: STATUS_COLOR.needsHelp, labelKey: 'parentApp.skillMap.tree.legendNeedsHelp' },
  { key: 'notStarted', color: NOT_STARTED, labelKey: 'parentApp.skillMap.tree.legendNotStarted' },
];

export interface PageMasteryGridProps {
  pages: TreePage[];
}

export const PageMasteryGrid: React.FC<PageMasteryGridProps> = ({ pages }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';

  return (
    <div className="flex flex-col gap-3">
      {/* The grid — every page a square, left-to-right reading order. */}
      <div dir="ltr" className="flex flex-wrap gap-[3px]">
        {pages.map((p) => (
          <span
            key={p.id}
            className="w-[11px] h-[11px] rounded-[3px]"
            style={{ background: pageColor(p) }}
            title={`${ar ? 'صفحة' : 'Page'} ${p.pageNumber} · ${ar ? p.titleAr : p.titleEn} · ${p.masteryPct}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {LEGEND.map((l) => (
          <span key={l.key} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: l.color }} />
            {t(l.labelKey)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PageMasteryGrid;
