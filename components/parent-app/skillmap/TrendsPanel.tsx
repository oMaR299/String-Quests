// TrendsPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A richer "trends over time" charts cluster (last 30 days) for the parent
// hub's Learn-more screen. UI-only: it reuses the seeded analytics getters and
// the shared MiniTrend chart — nothing is wired or persisted here.
//
// Three premium cards, each with a header (title + delta chip + current value)
// and a smooth MiniTrend:
//   1. Mastery growth   — overall mastery averaged across all subjects' series.
//   2. Accuracy over time — overall accuracy averaged across all subjects.
//   3. Study time       — daily study minutes.
//
// FULL RTL via the I18n locale; Cairo inherits from the app shell. Reduced
// motion is respected on the only animated element (the card reveal).

import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, Target, Clock4, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { MiniTrend } from './MiniTrend';
import { getChildSkillAreas } from './data/parentAppSkillMapMock';
import {
  getSubjectSeries,
  getDailyStudyMinutes,
} from './data/parentAppSkillAnalyticsMock';

interface TrendsPanelProps {
  childId: string;
}

// ── Delta-chip palette (never red — amber for "down") ─────────────────────────
const DELTA_UP = '#1F9D57'; // emerald
const DELTA_FLAT = '#94A3B8'; // slate
const DELTA_DOWN = '#E0A100'; // amber

type DeltaDir = 'up' | 'flat' | 'down';

function deltaDir(delta: number): DeltaDir {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

const DELTA_COLOR: Record<DeltaDir, string> = {
  up: DELTA_UP,
  flat: DELTA_FLAT,
  down: DELTA_DOWN,
};

const DeltaIcon: Record<DeltaDir, React.FC<{ className?: string }>> = {
  up: ArrowUp,
  flat: Minus,
  down: ArrowDown,
};

/** Average a list of equal-length series element-wise, rounded. Empty-safe. */
function averageSeries(seriesList: number[][]): number[] {
  if (seriesList.length === 0) return [];
  const length = Math.min(...seriesList.map((s) => s.length));
  if (!Number.isFinite(length) || length <= 0) return [];
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const s of seriesList) sum += s[i];
    out.push(Math.round(sum / seriesList.length));
  }
  return out;
}

export const TrendsPanel: React.FC<TrendsPanelProps> = ({ childId }) => {
  const { locale } = useI18n();
  const reduce = useReducedMotion() ?? false;
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // ── Derive the three 30-day series (in-view, empty-guarded) ─────────────────
  const subjects = useMemo(() => getChildSkillAreas(childId), [childId]);

  const masteryOverall = useMemo(
    () =>
      averageSeries(
        subjects.map((s) =>
          getSubjectSeries(childId, s.subjectKey, 30).map((p) => p.masteryPct),
        ),
      ),
    [childId, subjects],
  );

  const accuracyOverall = useMemo(
    () =>
      averageSeries(
        subjects.map((s) =>
          getSubjectSeries(childId, s.subjectKey, 30).map((p) => p.accuracyPct),
        ),
      ),
    [childId, subjects],
  );

  const studyMinutes = useMemo(
    () => getDailyStudyMinutes(childId, 30).map((d) => d.minutes),
    [childId],
  );

  return (
    <section
      dir={dir}
      aria-label={t('parentApp.skillMap.charts.title')}
      className="flex flex-col gap-3"
    >
      {/* Inline SectionHeader-style header: eyebrow + bold title */}
      <header className="flex flex-col gap-0.5 px-1 text-start">
        <span className="text-[12px] font-extrabold text-slate-400">
          {t('parentApp.skillMap.charts.last30')}
        </span>
        <h2 className="text-lg font-black leading-tight text-slate-800">
          {t('parentApp.skillMap.charts.title')}
        </h2>
      </header>

      <ChartCard
        icon={TrendingUp}
        title={t('parentApp.skillMap.charts.masteryGrowth')}
        values={masteryOverall}
        color="#56CF92"
        formatValue={(v) => `${v}%`}
        reduce={reduce}
        delay={0}
      />

      <ChartCard
        icon={Target}
        title={t('parentApp.skillMap.charts.accuracyOverTime')}
        values={accuracyOverall}
        color="#54B6E6"
        formatValue={(v) => `${v}%`}
        reduce={reduce}
        delay={0.06}
      />

      <ChartCard
        icon={Clock4}
        title={t('parentApp.skillMap.charts.studyTimeOverTime')}
        values={studyMinutes}
        color="#3DD9C0"
        formatValue={(v) => `${v} ${t('parentApp.skillMap.charts.minutesUnit')}`}
        reduce={reduce}
        delay={0.12}
      />
    </section>
  );
};

// ── One premium chart card ────────────────────────────────────────────────────

interface ChartCardProps {
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  title: string;
  values: number[];
  color: string;
  formatValue: (value: number) => string;
  reduce: boolean;
  delay: number;
}

const ChartCard: React.FC<ChartCardProps> = ({
  icon: Icon,
  title,
  values,
  color,
  formatValue,
  reduce,
  delay,
}) => {
  const hasData = values.length > 0;
  const first = hasData ? values[0] : 0;
  const last = hasData ? values[values.length - 1] : 0;
  const delta = last - first;
  const dir = deltaDir(delta);
  const chipColor = DELTA_COLOR[dir];
  const ChipIcon = DeltaIcon[dir];

  return (
    <motion.div
      className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3"
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: 'easeOut', delay }}
    >
      {/* Header row: title · delta chip · current value */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1F`, color }}
          aria-hidden="true"
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </span>

        <span className="flex-1 min-w-0 truncate text-sm font-black text-slate-800 text-start">
          {title}
        </span>

        {hasData && (
          <span
            className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-black tabular-nums"
            style={{ backgroundColor: `${chipColor}1F`, color: chipColor }}
          >
            <ChipIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        )}

        <span className="shrink-0 text-sm font-black text-slate-900 tabular-nums">
          {hasData ? formatValue(last) : '—'}
        </span>
      </div>

      {/* The trend itself */}
      {hasData ? (
        <MiniTrend values={values} color={color} />
      ) : (
        <div className="h-[132px]" aria-hidden="true" />
      )}
    </motion.div>
  );
};

export default TrendsPanel;
