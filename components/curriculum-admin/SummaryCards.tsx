import React, { useMemo } from 'react';
import { Layers, BookOpen, Target, Zap } from 'lucide-react';
import type { GradeCurriculum, CurriculumKC } from '../../data/curricula';

interface SummaryCardsProps {
  grade: GradeCurriculum;
}

function countStats(grade: GradeCurriculum) {
  let domains = 0;
  let standards = 0;
  let outcomes = 0;
  let kcs = 0;
  const allKCs: CurriculumKC[] = [];

  for (const domain of grade.domains) {
    domains++;
    for (const std of domain.standards) {
      standards++;
      for (const lo of std.learningOutcomes) {
        outcomes++;
        kcs += lo.knowledgeComponents.length;
        allKCs.push(...lo.knowledgeComponents);
      }
    }
  }

  return { domains, standards, outcomes, kcs, allKCs };
}

function getDifficultyDistribution(kcs: CurriculumKC[]): number[] {
  const dist = [0, 0, 0, 0, 0]; // difficulty 1-5
  for (const kc of kcs) {
    dist[kc.difficulty - 1]++;
  }
  return dist;
}

const STAT_CARDS = [
  {
    key: 'domains' as const,
    icon: Layers,
    labelEn: 'Domains',
    labelAr: 'المجالات',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'standards' as const,
    icon: BookOpen,
    labelEn: 'Standards',
    labelAr: 'المعايير',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    key: 'outcomes' as const,
    icon: Target,
    labelEn: 'Outcomes',
    labelAr: 'نتاجات التعلّم',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    key: 'kcs' as const,
    icon: Zap,
    labelEn: 'KCs',
    labelAr: 'مكوّنات المعرفة',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
] as const;

const DIFFICULTY_COLORS = [
  'bg-green-500',
  'bg-lime-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
];

export const SummaryCards: React.FC<SummaryCardsProps> = ({ grade }) => {
  const stats = useMemo(() => countStats(grade), [grade]);
  const diffDist = useMemo(
    () => getDifficultyDistribution(stats.allKCs),
    [stats.allKCs]
  );
  const maxDiff = Math.max(...diffDist, 1);

  return (
    <div className="space-y-4">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <div
              key={card.key}
              className={`rounded-xl border ${card.border} ${card.bg} p-4 flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-slate-500 font-medium">
                  {card.labelEn}
                </span>
              </div>
              <div className={`text-3xl font-bold ${card.color}`}>{value}</div>
              <div className="text-sm text-slate-600 font-medium">
                {card.labelAr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Difficulty distribution bar chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold text-slate-500 mb-3">
          توزيع الصعوبة
          <span className="text-xs text-slate-400 mr-2">
            Difficulty Distribution
          </span>
        </h3>
        <div className="flex items-end gap-3 h-24">
          {diffDist.map((count, i) => {
            const heightPercent = (count / maxDiff) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">
                  {count}
                </span>
                <div className="w-full relative" style={{ height: '80px' }}>
                  <div
                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-300 ${DIFFICULTY_COLORS[i]}`}
                    style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
