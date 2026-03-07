import React, { useMemo } from 'react';
import type { GradeCurriculum } from '../../data/curricula';
import type { BloomLevel } from '../../data/skillTaxonomy';

/* ── Stats collection ─────────────────────────────────────────────────────── */

interface ChartStats {
  bloomDist: number[];   // index 0-5  → bloom levels 1-6
  diffDist: number[];    // index 0-4  → difficulty 1-5
  domainKCs: { name: string; count: number }[];
}

function collectStats(grade: GradeCurriculum): ChartStats {
  const bloomDist = [0, 0, 0, 0, 0, 0];
  const diffDist = [0, 0, 0, 0, 0];
  const domainKCs: { name: string; count: number }[] = [];

  for (const domain of grade.domains) {
    let domainCount = 0;
    for (const std of domain.standards) {
      for (const outcome of std.learningOutcomes) {
        for (const kc of outcome.knowledgeComponents) {
          bloomDist[kc.bloomLevel - 1]++;
          diffDist[kc.difficulty - 1]++;
          domainCount++;
        }
      }
    }
    domainKCs.push({ name: domain.nameAr, count: domainCount });
  }

  return { bloomDist, diffDist, domainKCs };
}

/* ── Constants ────────────────────────────────────────────────────────────── */

const BLOOM_COLORS = ['#64748b', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];
const BLOOM_LABELS = ['تذكر', 'فهم', 'تطبيق', 'تحليل', 'تقييم', 'إبداع'];

const DIFF_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

const DOMAIN_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b'];

/* ── Vertical bar chart (SVG) ─────────────────────────────────────────────── */

interface BarChartProps {
  data: number[];
  colors: string[];
  labels: string[];
  title: string;
  titleEn: string;
}

const VerticalBarChart: React.FC<BarChartProps> = ({
  data,
  colors,
  labels,
  title,
  titleEn,
}) => {
  const maxVal = Math.max(...data, 1);
  const barCount = data.length;
  const chartWidth = 300;
  const chartHeight = 160;
  const barAreaTop = 24;
  const barAreaBottom = chartHeight - 28;
  const barAreaHeight = barAreaBottom - barAreaTop;
  const barWidth = Math.min(36, (chartWidth - 20) / barCount - 8);
  const totalBarsWidth = barCount * (barWidth + 8) - 8;
  const startX = (chartWidth - totalBarsWidth) / 2;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-slate-500 mb-3">
        {title}
        <span className="text-xs text-slate-400 mr-2">{titleEn}</span>
      </h3>
      <svg
        dir="ltr"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        role="img"
        aria-label={titleEn}
      >
        {data.map((value, i) => {
          const barHeight = maxVal > 0 ? (value / maxVal) * barAreaHeight : 0;
          const x = startX + i * (barWidth + 8);
          const y = barAreaBottom - barHeight;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, value > 0 ? 2 : 0)}
                rx={4}
                fill={colors[i]}
              />
              {/* Value label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#475569"
              >
                {value}
              </text>
              {/* Label below bar */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 4}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── KCs per Domain (div bars) ────────────────────────────────────────────── */

const DomainBarChart: React.FC<{
  domainKCs: { name: string; count: number }[];
}> = ({ domainKCs }) => {
  const maxCount = Math.max(...domainKCs.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-slate-500 mb-3">
        مكوّنات المعرفة لكل مجال
        <span className="text-xs text-slate-400 mr-2">KCs per Domain</span>
      </h3>
      <div className="space-y-2">
        {domainKCs.map((d, i) => {
          const widthPercent = (d.count / maxCount) * 100;
          const color = DOMAIN_COLORS[i % DOMAIN_COLORS.length];

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium w-32 truncate text-right shrink-0">
                {d.name}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                    minWidth: d.count > 0 ? '8px' : '0',
                  }}
                />
              </div>
              <span className="text-xs text-slate-500 font-bold w-8 text-left shrink-0">
                {d.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────────────── */

interface CurriculumChartsProps {
  grade: GradeCurriculum;
}

export const CurriculumCharts: React.FC<CurriculumChartsProps> = ({
  grade,
}) => {
  const stats = useMemo(() => collectStats(grade), [grade]);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-slate-500">
        تحليلات
        <span className="text-xs text-slate-400 mr-2">Analytics</span>
      </h2>

      {/* Bloom + Difficulty side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VerticalBarChart
          data={stats.bloomDist}
          colors={BLOOM_COLORS}
          labels={BLOOM_LABELS}
          title="توزيع بلوم"
          titleEn="Bloom's Distribution"
        />
        <VerticalBarChart
          data={stats.diffDist}
          colors={DIFF_COLORS}
          labels={['1', '2', '3', '4', '5']}
          title="توزيع الصعوبة"
          titleEn="Difficulty Distribution"
        />
      </div>

      {/* KCs per Domain full width */}
      <DomainBarChart domainKCs={stats.domainKCs} />
    </section>
  );
};
