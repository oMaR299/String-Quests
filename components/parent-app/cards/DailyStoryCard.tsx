// DailyStoryCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// One self-contained card in the Daily Story. Each card carries its OWN pastel
// color, 3-line summary, score rings, a highlight, and a single CTA — matching
// the user's reference screenshots (soft pastel health-app cards).
//
// Anatomy (top → bottom):
//   • Header — colored icon chip + title + completion badge
//   • Summary — ≤3 lines, warm + specific
//   • Score panel — white inner panel with rings (mini / single / multi)
//   • Highlight — teacher praise (avatar + date) OR a muted AI footnote
//   • CTA — pill that routes deeper into the app
//
// The "proud moment" card has no scores: just the moment + a celebrate button.
//
// Custom pastel hex comes from the data and is applied inline (Tailwind v4 JIT
// can't see runtime color classes). AR-first RTL, Lucide icons, reduced-motion
// aware.

import React, { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  School,
  BookOpenCheck,
  HeartPulse,
  GraduationCap,
  CalendarCheck,
  Trophy,
  ChevronLeft,
  Check,
  Clock3,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import type { DailyCardKey, DailyStoryCard as CardData } from '../data/parentAppDailyStoryMock';
import { ScoreRing, type ResolvedScore } from './ScoreRing';

const CARD_ICON: Record<
  DailyCardKey,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  school: School,
  home: BookOpenCheck,
  wellbeing: HeartPulse,
  academic: GraduationCap,
  attendance: CalendarCheck,
  proud: Trophy,
};

export interface DailyStoryCardProps {
  card: CardData;
  /** Whether the day is finalized ("اكتمل اليوم") vs still forming. */
  complete: boolean;
  index?: number;
  /** When inside the swipe stack, the stack owns motion — suppress the card's
   *  own entrance animation so the two don't fight. */
  inStack?: boolean;
}

export const DailyStoryCard: React.FC<DailyStoryCardProps> = ({
  card,
  complete,
  index = 0,
  inStack = false,
}) => {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;
  const [celebrated, setCelebrated] = useState(false);

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const ar = locale === 'ar';
  const Icon = CARD_ICON[card.key];

  const title = ar ? card.titleAr : card.titleEn;
  const summary = ar ? card.summaryAr : card.summaryEn;
  const ctaLabel = ar ? card.ctaLabelAr : card.ctaLabelEn;

  const resolvedScores: ResolvedScore[] = card.scores.map((s) => ({
    key: s.key,
    label: ar ? s.labelAr : s.labelEn,
    value: s.value,
    color: s.color,
    unit: s.unit,
  }));

  const isProud = card.key === 'proud';
  const hl = card.highlight;
  const attributed = !!(hl && hl.byAr);

  const onCta = useCallback(() => {
    if (isProud) {
      setCelebrated(true);
      return;
    }
    if (card.ctaRoute) navigate(card.ctaRoute);
  }, [isProud, card.ctaRoute, navigate]);

  return (
    <motion.article
      initial={reduceMotion || inStack ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion || inStack
          ? { duration: 0 }
          : { type: 'spring', stiffness: 220, damping: 26, delay: index * 0.05 }
      }
      className="rounded-[28px] p-5 flex flex-col gap-3.5"
      style={{
        background: card.bg,
        boxShadow: '0 10px 26px -12px rgba(60,40,80,0.20)',
      }}
      aria-label={`${title} — ${summary}`}
    >
      {/* Header */}
      <header className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl inline-flex items-center justify-center shrink-0"
          style={{ background: card.iconBg, color: card.iconColor }}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h3 className="flex-1 min-w-0 text-base font-black text-slate-800 leading-tight">{title}</h3>
        {/* Completion badge — not shown on the proud moment (it's a moment, not a score) */}
        {isProud ? null : complete ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 shrink-0">
            <Check className="w-3 h-3" strokeWidth={3} />
            {t('parentApp.story.completed')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold text-amber-600 shrink-0">
            <Clock3 className="w-3 h-3" strokeWidth={3} />
            {t('parentApp.story.completesEvening')}
          </span>
        )}
      </header>

      {/* Summary */}
      <p
        className={`font-bold text-slate-600 leading-relaxed ${isProud ? 'text-[15px]' : 'text-[13px] line-clamp-3'}`}
      >
        {summary}
      </p>

      {/* Score panel */}
      {!isProud && resolvedScores.length > 0 && (
        <div className="rounded-2xl bg-white/75 p-4">
          <ScoreRing mode={card.ringMode === 'none' ? 'mini' : card.ringMode} scores={resolvedScores} />
        </div>
      )}

      {/* Highlight */}
      {hl && attributed && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3">
          <div
            className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 text-white text-sm font-black"
            style={{ background: hl.avatarColor ?? card.iconBg }}
            aria-hidden="true"
          >
            {hl.avatarInitial ?? '★'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-slate-700 leading-snug">{ar ? hl.textAr : hl.textEn}</p>
            <p className="mt-0.5 text-[10px] font-extrabold" style={{ color: card.accent }}>
              {(ar ? hl.byAr : hl.byEn) ?? ''}
              {hl.dateLabelAr ? ` · ${ar ? hl.dateLabelAr : hl.dateLabelEn}` : ''}
            </p>
          </div>
        </div>
      )}

      {hl && !attributed && !isProud && (
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={2.5} style={{ color: card.accent }} />
          <p className="text-[11.5px] font-bold text-slate-500 leading-snug">{ar ? hl.textAr : hl.textEn}</p>
        </div>
      )}

      {/* CTA */}
      {isProud ? (
        <button
          type="button"
          onClick={onCta}
          className="mt-0.5 self-start inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-extrabold text-white motion-safe:active:scale-[0.97] transition-transform"
          style={{ background: card.accent }}
        >
          {celebrated ? (
            <>
              <Check className="w-4 h-4" strokeWidth={3} />
              {t('parentApp.story.celebrated')}
            </>
          ) : (
            <>
              <PartyPopper className="w-4 h-4" strokeWidth={2.5} />
              {ctaLabel}
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onCta}
          className="mt-0.5 self-start inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-extrabold shadow-sm motion-safe:active:scale-[0.97] transition-transform"
          style={{ color: card.accent }}
        >
          {ctaLabel}
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" strokeWidth={2.8} />
        </button>
      )}
    </motion.article>
  );
};

export default DailyStoryCard;
