// FullPictureSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 2 — "The full picture". Every one of the child's 6 skill areas, split
// into two labeled, scannable zones:
//   • ✨ Shining     — proficient/mastered → green-tint rows (subject + % + ↑)
//   • 🤝 Needs a hand — developing/needsHelp, most-urgent first → amber/red rows
//     each with an inline Talk (expands the prompt) + Send practice action.
//
// Self-contained + prop-driven: receives all 6 `areas` (fixed order) and the
// `sentAreaIds` list; it derives the two zones locally and reuses the SAME
// handlers + sent state as the Layer-1 cards. No data fetching, no selection.
//
// House rules: flat white, hairline borders, Cairo font, Lucide icons only
// (NO emoji), full RTL via logical props, duo-*/pastel-* tokens, Framer Motion
// + useReducedMotion.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MessageCircle,
  Sparkles,
  TrendingUp,
  Sun,
  HeartHandshake,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { getTalkPrompt } from './skillMapCoaching';
import {
  resolveSubjectStyle,
  subjectLabel,
  skillHead,
  STATUS_CHIP,
  resolveTrendChip,
  SentState,
} from './CoachingCard';
import PrimaryButton from '../../parent-onboarding/PrimaryButton';
import type {
  ParentSkillArea,
  ParentSkillStatus,
} from './data/parentAppSkillMapMock';

interface FullPictureSectionProps {
  /** All 6 areas, fixed order. */
  areas: ParentSkillArea[];
  /** Localized child name already resolved by the caller. */
  childName: string;
  /** Ids whose practice has been sent — drives row sent state. */
  sentAreaIds: string[];
  onSendPractice: (areaId: string) => void;
}

/** Strength = celebrated in the Shining zone. */
function isShining(status: ParentSkillStatus): boolean {
  return status === 'proficient' || status === 'mastered';
}

/** Coachable urgency rank for the "Needs a hand" zone (most urgent first):
 *  needsHelp before developing, then steeper recent drop, then lower mastery. */
function needsHandRank(area: ParentSkillArea): number {
  const statusWeight = area.status === 'needsHelp' ? 1000 : 0;
  const dropWeight = area.trend7d < 0 ? Math.abs(area.trend7d) * 8 : 0;
  const masteryWeight = 100 - area.masteryPct;
  return statusWeight + dropWeight + masteryWeight;
}

export function FullPictureSection({
  areas,
  childName,
  sentAreaIds,
  onSendPractice,
}: FullPictureSectionProps) {
  const { locale } = useI18n();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const sentSet = useMemo(() => new Set(sentAreaIds), [sentAreaIds]);

  const shining = useMemo(
    () =>
      areas
        .filter((a) => isShining(a.status))
        .sort((a, b) => b.masteryPct - a.masteryPct),
    [areas]
  );
  const needsHand = useMemo(
    () =>
      areas
        .filter((a) => !isShining(a.status))
        .sort((a, b) => needsHandRank(b) - needsHandRank(a)),
    [areas]
  );

  return (
    <section
      aria-label={t('parentApp.skillMap.fullPicture')}
      className="flex flex-col gap-4"
    >
      <h2 className="text-lg font-black text-slate-800 leading-tight text-start">
        {t('parentApp.skillMap.fullPicture')}
      </h2>

      {/* Shining zone */}
      {shining.length > 0 && (
        <div className="flex flex-col gap-2">
          <ZoneLabel
            icon={
              <Sun className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
            }
            label={t('parentApp.skillMap.shining')}
          />
          <div className="flex flex-col gap-2">
            {shining.map((area, i) => (
              <ShiningRow
                key={area.id}
                area={area}
                locale={locale}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Needs a hand zone */}
      {needsHand.length > 0 && (
        <div className="flex flex-col gap-2">
          <ZoneLabel
            icon={
              <HeartHandshake
                className="w-4 h-4 text-amber-600"
                strokeWidth={2.5}
              />
            }
            label={t('parentApp.skillMap.needsAHand')}
          />
          <div className="flex flex-col gap-2">
            {needsHand.map((area, i) => (
              <NeedsHandRow
                key={area.id}
                area={area}
                childName={childName}
                locale={locale}
                index={i}
                sent={sentSet.has(area.id)}
                onSendPractice={onSendPractice}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Zone label ──────────────────────────────────────────────────────────────

function ZoneLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span aria-hidden="true">{icon}</span>
      <span className="text-[12px] font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ─── Shining row ─────────────────────────────────────────────────────────────
// Compact green-tint row: subject icon + name + mastery% + upward trend mark.

interface ShiningRowProps {
  area: ParentSkillArea;
  locale: 'ar' | 'en';
  index: number;
}

const ShiningRow: React.FC<ShiningRowProps> = ({ area, locale, index }) => {
  const reduceMotion = useReducedMotion();
  const style = resolveSubjectStyle(area.subjectKey);
  const subject = subjectLabel(area, locale);
  const skill = skillHead(area, locale);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 260, damping: 26, delay: index * 0.03 }
      }
      className="rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3 flex items-center gap-3"
      aria-label={`${subject} — ${skill} ${area.masteryPct}%`}
    >
      <div
        className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
        aria-hidden="true"
      >
        {style.glyph}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-slate-800 leading-tight truncate">
          {subject}
        </div>
        <div className="text-[11px] font-bold text-slate-500 leading-tight truncate">
          {skill}
        </div>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700 shrink-0">
        <TrendingUp className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {area.masteryPct}%
      </span>
    </motion.div>
  );
};

// ─── Needs-a-hand row ────────────────────────────────────────────────────────
// Amber/red row: subject + status chip; inline Talk (expands the prompt) + Send
// practice (reuses the same handler + sent state as the Layer-1 cards).

interface NeedsHandRowProps {
  area: ParentSkillArea;
  childName: string;
  locale: 'ar' | 'en';
  index: number;
  sent: boolean;
  onSendPractice: (areaId: string) => void;
}

const NeedsHandRow: React.FC<NeedsHandRowProps> = ({
  area,
  childName,
  locale,
  index,
  sent,
  onSendPractice,
}) => {
  const reduceMotion = useReducedMotion();
  const [showPrompt, setShowPrompt] = useState(false);

  const style = resolveSubjectStyle(area.subjectKey);
  const subject = subjectLabel(area, locale);
  const skill = skillHead(area, locale);
  const statusChip = STATUS_CHIP[area.status];
  const trendChip = resolveTrendChip(area, locale);
  const prompt = getTalkPrompt(area, childName, locale);

  const talkLabel = getParentAppString(locale, 'parentApp.skillMap.talk');
  const sendLabel = getParentAppString(locale, 'parentApp.skillMap.sendPractice');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 260, damping: 26, delay: index * 0.03 }
      }
      className="rounded-2xl bg-white border border-slate-200 p-3 flex flex-col gap-2.5"
      aria-label={`${subject} — ${skill}`}
    >
      {/* Row head — subject icon + name/skill + status & trend chips */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl inline-flex items-center justify-center shrink-0 text-sm font-black ${style.iconBg} ${style.iconText}`}
          aria-hidden="true"
        >
          {style.glyph}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-slate-800 leading-tight truncate">
            {subject}
          </div>
          <div className="text-[11px] font-bold text-slate-500 leading-tight truncate">
            {skill}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusChip.bg} ${statusChip.text}`}
          >
            {getParentAppString(locale, statusChip.labelKey)}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${trendChip.bg} ${trendChip.text}`}
          >
            <trendChip.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
            {trendChip.label}
          </span>
        </div>
      </div>

      {/* Expandable talk prompt — toggled by the inline Talk button */}
      <AnimatePresence initial={false}>
        {showPrompt && (
          <motion.div
            key="prompt"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex gap-2">
              <MessageCircle
                className="w-3.5 h-3.5 text-duo-blue shrink-0 mt-0.5"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <p className="text-[12px] font-bold text-slate-700 leading-relaxed text-start">
                {prompt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline actions — Talk (toggles prompt) · Send practice / Sent */}
      <div className="grid grid-cols-2 gap-2">
        <PrimaryButton
          variant="secondary"
          onClick={() => setShowPrompt((v) => !v)}
          aria-expanded={showPrompt}
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
          {talkLabel}
        </PrimaryButton>

        {sent ? (
          <SentState locale={locale} childName={childName} />
        ) : (
          <PrimaryButton
            variant="primary"
            onClick={() => onSendPractice(area.id)}
            aria-label={sendLabel}
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            {sendLabel}
          </PrimaryButton>
        )}
      </div>
    </motion.div>
  );
};

export default FullPictureSection;
