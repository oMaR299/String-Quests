// CoachingCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 1 — the spine of the Parent Skill Map. One flat white coaching card that
// turns a single weak skill area into two concrete parent moves:
//   • 💬 Talk  — a warm, ready-to-say prompt (from `getTalkPrompt`)
//   • ✨ Send practice — one tap pushes a quest to the child's String app (mock)
//
// Self-contained + prop-driven: it owns NO data and NO "sent" state. The parent
// (TodaysFocusSection / orchestrator) passes `sent` in and gets `onSendPractice`
// / `onTalkDone` back. Pure presentation otherwise.
//
// House rules: flat white surface, hairline border, Cairo font, Lucide icons
// only (NO emoji in the rendered UI), full RTL via logical properties
// (ms-/me-/text-start), duo-*/pastel-* tokens, Framer Motion + useReducedMotion.

import React, { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Sparkles,
  Check,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import {
  SUBJECT_STYLES,
  type SubjectKey,
} from '../data/parentAppSchoolMockData';
import PrimaryButton from '../../parent-onboarding/PrimaryButton';
import { getTalkPrompt } from './skillMapCoaching';
import type { ParentSkillArea, ParentSkillStatus } from './data/parentAppSkillMapMock';

// ─── Shared subject + status helpers (re-used by FullPictureSection) ─────────

/** Closed set of subject keys SUBJECT_STYLES is keyed by — used to narrow the
 *  `ParentSkillArea.subjectKey` string safely. */
const SUBJECT_KEYS: ReadonlySet<string> = new Set<SubjectKey>([
  'math',
  'arabic',
  'english',
  'science',
  'reading',
  'pe',
  'art',
]);

/** Resolve a skill area's subject style (icon bg/text + glyph + pill colors).
 *  Falls back to `math` if a future subjectKey isn't in the style map. */
export function resolveSubjectStyle(subjectKey: string) {
  const key: SubjectKey = SUBJECT_KEYS.has(subjectKey)
    ? (subjectKey as SubjectKey)
    : 'math';
  return SUBJECT_STYLES[key];
}

/** Localized subject label from the area itself (AR source-of-truth, EN mirror). */
export function subjectLabel(area: ParentSkillArea, locale: 'ar' | 'en'): string {
  return locale === 'ar' ? area.subjectAr : area.subjectEn;
}

/** Skill head = the part of the practice target before the " · " unit suffix
 *  (e.g. "Fractions · Unit 3" → "Fractions"). Matches getTalkPrompt's split. */
export function skillHead(area: ParentSkillArea, locale: 'ar' | 'en'): string {
  const target = locale === 'ar' ? area.practiceTargetAr : area.practiceTargetEn;
  return target.split('·')[0].trim();
}

/** Status chip palette + i18n label key. Amber = developing, Red = needsHelp,
 *  Green = proficient/mastered (used by the Full Picture "Shining" rows). */
export const STATUS_CHIP: Record<
  ParentSkillStatus,
  { bg: string; text: string; labelKey: string }
> = {
  needsHelp: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    labelKey: 'parentApp.skillMap.statusNeedsHelp',
  },
  developing: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    labelKey: 'parentApp.skillMap.statusDeveloping',
  },
  proficient: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    labelKey: 'parentApp.skillMap.statusProficient',
  },
  mastered: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    labelKey: 'parentApp.skillMap.statusMastered',
  },
};

/**
 * Trend chip — the "↓12% this week" timeliness signal. The arrow glyph already
 * lives in the i18n string (trendDown/trendUp carry the sign), so `{n}` is the
 * absolute magnitude. A Lucide arrow is paired for at-a-glance scanning.
 */
export interface TrendChip {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  bg: string;
  text: string;
  /** Fully-resolved label, e.g. "↓12% this week". */
  label: string;
}

export function resolveTrendChip(
  area: ParentSkillArea,
  locale: 'ar' | 'en'
): TrendChip {
  const n = Math.abs(area.trend7d);
  if (area.trend7d < 0) {
    return {
      Icon: TrendingDown,
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      label: interpolate(
        getParentAppString(locale, 'parentApp.skillMap.trendDown'),
        { n }
      ),
    };
  }
  if (area.trend7d > 0) {
    return {
      Icon: TrendingUp,
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      label: interpolate(
        getParentAppString(locale, 'parentApp.skillMap.trendUp'),
        { n }
      ),
    };
  }
  return {
    Icon: Minus,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    label: getParentAppString(locale, 'parentApp.skillMap.trendFlat'),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CoachingCardProps {
  area: ParentSkillArea;
  /** Localized child name already resolved by the caller. */
  childName: string;
  /** 1-based index for the "1 of N" stepper. */
  stepIndex?: number;
  total?: number;
  /** Whether this area's practice has already been sent (cooldown). */
  sent: boolean;
  onSendPractice: (areaId: string) => void;
  onTalkDone?: (areaId: string) => void;
}

export const CoachingCard: React.FC<CoachingCardProps> = ({
  area,
  childName,
  stepIndex,
  total,
  sent,
  onSendPractice,
  onTalkDone,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  // Local "talk done" affordance — purely visual acknowledgement; the real
  // (optional) state lives with the caller via onTalkDone.
  const [talkDone, setTalkDone] = useState(false);

  const style = resolveSubjectStyle(area.subjectKey);
  const subject = subjectLabel(area, locale);
  const skill = skillHead(area, locale);
  const statusChip = STATUS_CHIP[area.status];
  const trendChip = resolveTrendChip(area, locale);
  const prompt = getTalkPrompt(area, childName, locale);

  const showStepper =
    typeof stepIndex === 'number' && typeof total === 'number' && total > 0;
  const stepperLabel = showStepper
    ? interpolate(t('parentApp.skillMap.focusStepper'), {
        i: stepIndex as number,
        n: total as number,
      })
    : '';

  const handleTalk = useCallback(() => {
    setTalkDone(true);
    onTalkDone?.(area.id);
  }, [area.id, onTalkDone]);

  const handleSend = useCallback(() => {
    onSendPractice(area.id);
  }, [area.id, onSendPractice]);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24 }
      }
      className="rounded-3xl bg-white border border-slate-100 p-4 flex flex-col gap-3"
      aria-label={`${subject} — ${skill}`}
    >
      {/* Header — status + trend chips (start) · stepper (end) */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${statusChip.bg} ${statusChip.text}`}
          >
            {t(statusChip.labelKey)}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${trendChip.bg} ${trendChip.text}`}
          >
            <trendChip.Icon className="w-3 h-3" strokeWidth={2.5} />
            {trendChip.label}
          </span>
        </div>
        {showStepper && (
          <span className="text-[11px] font-bold text-slate-400 shrink-0">
            {stepperLabel}
          </span>
        )}
      </header>

      {/* Title — subject icon + "Subject · Skill" */}
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-2xl inline-flex items-center justify-center shrink-0 text-lg font-black ${style.iconBg} ${style.iconText}`}
          aria-hidden="true"
        >
          {style.glyph}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-400 leading-tight">
            {subject}
          </div>
          <h4 className="text-base font-black text-slate-800 leading-snug truncate">
            {skill}
          </h4>
        </div>
      </div>

      {/* Talk prompt — soft quote block with a leading MessageCircle */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex gap-2.5">
        <MessageCircle
          className="w-4 h-4 text-duo-blue shrink-0 mt-0.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <p className="text-[13px] font-bold text-slate-700 leading-relaxed text-start">
          {prompt}
        </p>
      </div>

      {/* Actions — Talk (secondary) · Send practice (primary) / Sent (success) */}
      <div className="grid grid-cols-2 gap-2.5">
        <PrimaryButton
          variant="secondary"
          onClick={handleTalk}
          aria-label={interpolate(t('parentApp.skillMap.talkTo'), {
            name: childName,
          })}
        >
          {talkDone ? (
            <Check className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
          )}
          {t('parentApp.skillMap.talk')}
        </PrimaryButton>

        {sent ? (
          <SentState locale={locale} childName={childName} />
        ) : (
          <PrimaryButton variant="primary" onClick={handleSend}>
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            {t('parentApp.skillMap.sendPractice')}
          </PrimaryButton>
        )}
      </div>
    </motion.article>
  );
};

// ─── Sent success state ──────────────────────────────────────────────────────
// Calm green confirmation that replaces the Send button once practice is sent.
// Exported so FullPictureSection can show the identical state on its rows.

export function SentState({
  locale,
  childName,
  className = '',
}: {
  locale: 'ar' | 'en';
  childName: string;
  className?: string;
}) {
  const detail = interpolate(
    getParentAppString(locale, 'parentApp.skillMap.sentDetail'),
    { name: childName }
  );
  return (
    <div
      className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-xl bg-duo-green-light border border-duo-green/30 py-2 px-3 text-center ${className}`}
      role="status"
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-black text-[#4CAD00]">
        <Send className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {getParentAppString(locale, 'parentApp.skillMap.sent')}
      </span>
      <span className="text-[11px] font-bold text-emerald-700/80 leading-tight">
        {detail}
      </span>
    </div>
  );
}

export default CoachingCard;
