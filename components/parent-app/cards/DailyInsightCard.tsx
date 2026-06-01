// DailyInsightCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// One topic insight card. Renders in the horizontal-scroll strip of the
// Daily Insights section. Each topic has its own gradient palette + icon to
// make the section feel varied and visually rich without being noisy.
//
// Card structure (top → bottom):
//   • Header pill — topic name + trend chip (up / steady / down)
//   • Topic icon — colored disc with subtle ring
//   • Headline — 1-line short
//   • Body — 1-2 sentence insight
//   • Footer — "based on…" source line + AI badge
//
// Tap → no-op for v1 (could open a sheet with more context in v2).
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Target,
  Smile,
  Moon,
  Users,
  Zap,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type {
  DailyInsight,
  InsightTopic,
  InsightTrend,
} from '../data/parentAppDailyInsightsMock';

// ─── Per-topic style + icon map (Tailwind v4 JIT-safe literals) ─────────────

interface TopicStyle {
  /** Card gradient — outer surface. */
  gradient: string;
  /** Soft tinted bg used inside the header pill + footer band. */
  softBg: string;
  /** Icon disc background + text color. */
  iconBg: string;
  iconText: string;
  /** Body text color over the gradient. */
  textOnGrad: string;
  /** Muted text color over the gradient (for footer / source line). */
  textMutedOnGrad: string;
}

const TOPIC_STYLES: Record<InsightTopic, TopicStyle> = {
  momentum: {
    gradient: 'bg-gradient-to-br from-duo-blue/15 via-white to-sky-50',
    softBg: 'bg-duo-blue-light',
    iconBg: 'bg-duo-blue',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  focus: {
    gradient: 'bg-gradient-to-br from-duo-purple/15 via-white to-purple-50',
    softBg: 'bg-duo-purple-light',
    iconBg: 'bg-duo-purple',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  mood: {
    gradient: 'bg-gradient-to-br from-amber-100 via-white to-rose-50',
    softBg: 'bg-amber-100',
    iconBg: 'bg-amber-500',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  sleep: {
    gradient: 'bg-gradient-to-br from-indigo-100 via-white to-slate-100',
    softBg: 'bg-indigo-100',
    iconBg: 'bg-indigo-500',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  social: {
    gradient: 'bg-gradient-to-br from-emerald-100 via-white to-teal-50',
    softBg: 'bg-emerald-100',
    iconBg: 'bg-emerald-500',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  activity: {
    gradient: 'bg-gradient-to-br from-duo-orange/20 via-white to-orange-50',
    softBg: 'bg-duo-orange-light',
    iconBg: 'bg-duo-orange',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  reading: {
    gradient: 'bg-gradient-to-br from-rose-100 via-white to-pink-50',
    softBg: 'bg-rose-100',
    iconBg: 'bg-rose-500',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
  curiosity: {
    gradient: 'bg-gradient-to-br from-sky-100 via-white to-cyan-50',
    softBg: 'bg-sky-100',
    iconBg: 'bg-sky-500',
    iconText: 'text-white',
    textOnGrad: 'text-slate-800',
    textMutedOnGrad: 'text-slate-500',
  },
};

const TOPIC_ICON: Record<
  InsightTopic,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  momentum: Flame,
  focus: Target,
  mood: Smile,
  sleep: Moon,
  social: Users,
  activity: Zap,
  reading: BookOpen,
  curiosity: Lightbulb,
};

const TOPIC_LABEL_KEY: Record<InsightTopic, string> = {
  momentum: 'parentApp.insights.topic.momentum',
  focus: 'parentApp.insights.topic.focus',
  mood: 'parentApp.insights.topic.mood',
  sleep: 'parentApp.insights.topic.sleep',
  social: 'parentApp.insights.topic.social',
  activity: 'parentApp.insights.topic.activity',
  reading: 'parentApp.insights.topic.reading',
  curiosity: 'parentApp.insights.topic.curiosity',
};

const TREND_STYLE: Record<
  InsightTrend,
  { bg: string; text: string; labelKey: string }
> = {
  up: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    labelKey: 'parentApp.insights.trendUp',
  },
  steady: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    labelKey: 'parentApp.insights.trendSteady',
  },
  down: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    labelKey: 'parentApp.insights.trendDown',
  },
};

function trendIcon(trend: InsightTrend) {
  if (trend === 'up') return TrendingUp;
  if (trend === 'down') return TrendingDown;
  return Minus;
}

// ─── Component ──────────────────────────────────────────────────────────────

export interface DailyInsightCardProps {
  insight: DailyInsight;
  /** Stagger entry index. */
  index?: number;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({
  insight,
  index = 0,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const style = TOPIC_STYLES[insight.topic];
  const Icon = TOPIC_ICON[insight.topic];
  const TrendArrow = trendIcon(insight.trend);
  const trendStyle = TREND_STYLE[insight.trend];

  const topicLabel = t(TOPIC_LABEL_KEY[insight.topic]);
  const headline =
    locale === 'ar' ? insight.headlineAr : insight.headlineEn;
  const body = locale === 'ar' ? insight.bodyAr : insight.bodyEn;
  const source = locale === 'ar' ? insight.sourceAr : insight.sourceEn;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24, delay: index * 0.04 }
      }
      className={`shrink-0 w-[260px] rounded-3xl border border-white/60 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.12)] p-3.5 flex flex-col gap-2.5 snap-start ${style.gradient}`}
      aria-label={`${topicLabel} — ${headline}`}
    >
      {/* Header — topic label + trend chip */}
      <header className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${style.softBg} ${style.textOnGrad}`}
        >
          {topicLabel}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${trendStyle.bg} ${trendStyle.text}`}
          aria-label={t(trendStyle.labelKey)}
        >
          <TrendArrow className="w-2.5 h-2.5" strokeWidth={2.5} />
          {t(trendStyle.labelKey)}
        </span>
      </header>

      {/* Icon disc */}
      <div
        className={`w-12 h-12 rounded-2xl inline-flex items-center justify-center ${style.iconBg} ${style.iconText} shadow-md`}
        aria-hidden="true"
      >
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>

      {/* Headline + body */}
      <div className="flex-1 space-y-1">
        <h4 className={`text-sm font-black leading-snug ${style.textOnGrad}`}>
          {headline}
        </h4>
        <p className={`text-xs font-bold leading-relaxed ${style.textMutedOnGrad}`}>
          {body}
        </p>
      </div>

      {/* Footer — source + AI badge */}
      <footer className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
        <span className={`text-[10px] font-bold ${style.textMutedOnGrad}`}>
          {source}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-duo-purple">
          <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
          {t('parentApp.insights.aiBadge')}
        </span>
      </footer>
    </motion.article>
  );
};

export default DailyInsightCard;
