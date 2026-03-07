import React, { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import type {
  GradeCurriculum,
  Domain,
  Standard,
  LearningOutcome,
  CurriculumKC,
} from '../../data/curricula';
import type { BloomLevel } from '../../data/skillTaxonomy';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const BLOOM_COLORS: Record<BloomLevel, string> = {
  1: 'bg-slate-200 text-slate-700',
  2: 'bg-blue-200 text-blue-800',
  3: 'bg-green-200 text-green-800',
  4: 'bg-yellow-200 text-yellow-800',
  5: 'bg-orange-200 text-orange-800',
  6: 'bg-red-200 text-red-800',
};

const BLOOM_LABELS: Record<BloomLevel, string> = {
  1: 'تذكر',
  2: 'فهم',
  3: 'تطبيق',
  4: 'تحليل',
  5: 'تقييم',
  6: 'إبداع',
};

export const BloomBadge: React.FC<{ level: BloomLevel }> = ({ level }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${BLOOM_COLORS[level]}`}
  >
    {BLOOM_LABELS[level]}
    <span className="opacity-70">{level}</span>
  </span>
);

export const DifficultyStars: React.FC<{ level: 1 | 2 | 3 | 4 | 5 }> = ({
  level,
}) => (
  <span className="text-amber-500 text-sm tracking-wider" aria-label={`Difficulty ${level}/5`}>
    {'★'.repeat(level)}
    {'☆'.repeat(5 - level)}
  </span>
);

/* ── Row chevron helper ───────────────────────────────────────────────────── */

const ExpandIcon: React.FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
  ) : (
    <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
  );

/* ── KC Row (innermost, not expandable) ───────────────────────────────────── */

const KCRow: React.FC<{ kc: CurriculumKC }> = ({ kc }) => {
  const visibleTags = kc.tags.slice(0, 5);
  return (
    <div className="pr-16 py-2 px-4 flex items-center gap-3 text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-slate-800">{kc.nameAr}</p>
        <p className="text-xs text-slate-400">{kc.nameEn}</p>
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <BloomBadge level={kc.bloomLevel} />
      <DifficultyStars level={kc.difficulty} />
    </div>
  );
};

/* ── Outcome Row ──────────────────────────────────────────────────────────── */

const OutcomeRow: React.FC<{ outcome: LearningOutcome }> = ({ outcome }) => {
  const [open, setOpen] = useState(false);
  const kcCount = outcome.knowledgeComponents.length;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full pr-12 py-2 px-4 flex items-center gap-3 text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors text-right"
      >
        <ExpandIcon open={open} />
        <div className="flex-1 min-w-0">
          <p className="text-slate-700">{outcome.outcomeAr}</p>
        </div>
        <BloomBadge level={outcome.bloomLevel} />
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
          {kcCount} KC
        </span>
      </button>
      {open &&
        outcome.knowledgeComponents.map((kc) => (
          <KCRow key={kc.id} kc={kc} />
        ))}
    </div>
  );
};

/* ── Standard Row ─────────────────────────────────────────────────────────── */

const StandardRow: React.FC<{ standard: Standard }> = ({ standard }) => {
  const [open, setOpen] = useState(false);
  const outcomeCount = standard.learningOutcomes.length;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full pr-8 py-2.5 px-4 flex items-center gap-3 text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors text-right"
      >
        <ExpandIcon open={open} />
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 font-medium">{standard.nameAr}</p>
          <p className="text-xs text-slate-400">{standard.nameEn}</p>
        </div>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
          {outcomeCount} نتاج
        </span>
      </button>
      {open &&
        standard.learningOutcomes.map((outcome) => (
          <OutcomeRow key={outcome.id} outcome={outcome} />
        ))}
    </div>
  );
};

/* ── Domain Row (outermost) ───────────────────────────────────────────────── */

const DomainRow: React.FC<{ domain: Domain; defaultOpen: boolean }> = ({
  domain,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const standardCount = domain.standards.length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-3 px-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-right"
      >
        <ExpandIcon open={open} />
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-bold">{domain.nameAr}</p>
          <p className="text-xs text-slate-400">{domain.nameEn}</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
          {standardCount} معيار
        </span>
      </button>
      {open && (
        <div className="border-t border-slate-100">
          {domain.standards.map((standard) => (
            <StandardRow key={standard.id} standard={standard} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────────────── */

interface CurriculumExplorerProps {
  grade: GradeCurriculum;
}

export const CurriculumExplorer: React.FC<CurriculumExplorerProps> = ({
  grade,
}) => {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-slate-500">
        هيكل المنهاج
        <span className="text-xs text-slate-400 mr-2">Curriculum Structure</span>
      </h2>
      <div className="space-y-3">
        {grade.domains.map((domain, index) => (
          <DomainRow
            key={domain.id}
            domain={domain}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
};
