// TodaysFocusSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 1 wrapper — "Help {name} today". Renders the 1-3 coaching cards chosen
// upstream by `selectTodaysFocus`, plus the two edge states:
//   • all-healthy empty state (focus.length === 0) — calm + positive, no fake
//     problems; offers one "stretch" idea instead.
//   • a small "Shining" pride row when a strength is worth celebrating.
//
// Self-contained + prop-driven: it receives the already-selected `focus` /
// `shining` arrays and the `sentAreaIds` list; it never selects or fetches.
//
// House rules: flat white, hairline borders, Cairo font, Lucide icons only
// (NO emoji), full RTL via logical props, duo-*/pastel-* tokens, Framer Motion
// + useReducedMotion.

import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sprout, TrendingUp, Lightbulb } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { CoachingCard, resolveSubjectStyle, subjectLabel } from './CoachingCard';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';

interface TodaysFocusSectionProps {
  /** 0-3 areas, already chosen by selectTodaysFocus, most urgent first. */
  focus: ParentSkillArea[];
  /** A single strength to celebrate, or null. */
  shining: ParentSkillArea | null;
  /** Localized child name already resolved by the caller. */
  childName: string;
  /** Ids whose practice has been sent — drives each card's `sent` state. */
  sentAreaIds: string[];
  onSendPractice: (areaId: string) => void;
  onTalkDone?: (areaId: string) => void;
}

export function TodaysFocusSection({
  focus,
  shining,
  childName,
  sentAreaIds,
  onSendPractice,
  onTalkDone,
}: TodaysFocusSectionProps) {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const heading = interpolate(t('parentApp.skillMap.helpToday'), {
    name: childName,
  });

  const sentSet = new Set(sentAreaIds);
  const isEmpty = focus.length === 0;

  return (
    <section
      aria-label={heading}
      className="flex flex-col gap-3"
    >
      {/* Section heading + subtitle */}
      <header className="flex flex-col gap-0.5">
        <h2 className="text-lg font-black text-slate-800 leading-tight text-start">
          {heading}
        </h2>
        <p className="text-[13px] font-bold text-slate-500 leading-snug text-start">
          {t('parentApp.skillMap.helpTodaySubtitle')}
        </p>
      </header>

      {/* Body — either the coaching cards or the all-healthy empty state */}
      {isEmpty ? (
        <AllHealthyState childName={childName} locale={locale} />
      ) : (
        <div className="flex flex-col gap-3">
          {focus.map((area, i) => (
            <CoachingCard
              key={area.id}
              area={area}
              childName={childName}
              stepIndex={i + 1}
              total={focus.length}
              sent={sentSet.has(area.id)}
              onSendPractice={onSendPractice}
              onTalkDone={onTalkDone}
            />
          ))}
        </div>
      )}

      {/* Shining pride row — celebrated regardless of the empty/cards branch */}
      {shining && (
        <ShiningRow
          area={shining}
          locale={locale}
          reduceMotion={!!reduceMotion}
        />
      )}
    </section>
  );
}

// ─── All-healthy empty state ─────────────────────────────────────────────────
// Shown when nothing needs the parent today. Calm, green-tinted, and offers a
// single stretch idea so the screen still feels useful without inventing work.

function AllHealthyState({
  childName,
  locale,
}: {
  childName: string;
  locale: 'ar' | 'en';
}) {
  const reduceMotion = useReducedMotion();
  const title = interpolate(
    getParentAppString(locale, 'parentApp.skillMap.allHealthyTitle'),
    { name: childName }
  );
  const body = getParentAppString(locale, 'parentApp.skillMap.allHealthyBody');
  const stretch = interpolate(
    getParentAppString(locale, 'parentApp.skillMap.stretchSuggestion'),
    { name: childName }
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24 }
      }
      className="rounded-2xl bg-duo-green-light border border-duo-green/25 p-5 flex flex-col items-center text-center gap-2.5"
    >
      <div
        className="w-14 h-14 rounded-2xl inline-flex items-center justify-center bg-duo-green text-white shrink-0"
        aria-hidden="true"
      >
        <Sprout className="w-7 h-7" strokeWidth={2.5} />
      </div>
      <h3 className="text-base font-black text-slate-800 leading-snug">
        {title}
      </h3>
      <p className="text-[13px] font-bold text-slate-600 leading-relaxed max-w-[36ch]">
        {body}
      </p>
      {/* Stretch idea — quiet, with a lightbulb to mark it as optional/extra. */}
      <div className="mt-1 inline-flex items-start gap-2 rounded-xl bg-white/70 border border-duo-green/20 py-2 px-3 text-start">
        <Lightbulb
          className="w-4 h-4 text-[#4CAD00] shrink-0 mt-0.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <p className="text-[12px] font-bold text-emerald-800/90 leading-relaxed">
          {stretch}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Shining pride row ───────────────────────────────────────────────────────
// A small green-tinted celebration of the child's strongest area: subject icon
// + name + mastery% + an upward trend mark. Pure pride, no actions.

function ShiningRow({
  area,
  locale,
  reduceMotion,
}: {
  area: ParentSkillArea;
  locale: 'ar' | 'en';
  reduceMotion: boolean;
}) {
  const style = resolveSubjectStyle(area.subjectKey);
  const subject = subjectLabel(area, locale);
  const shiningLabel = getParentAppString(locale, 'parentApp.skillMap.shining');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 240, damping: 24, delay: 0.05 }
      }
      className="rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3 flex items-center gap-3"
      aria-label={`${shiningLabel} — ${subject}`}
    >
      <div
        className={`w-10 h-10 rounded-xl inline-flex items-center justify-center shrink-0 text-base font-black ${style.iconBg} ${style.iconText}`}
        aria-hidden="true"
      >
        {style.glyph}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700/80 leading-tight">
          {shiningLabel}
        </div>
        <div className="text-sm font-black text-slate-800 leading-tight truncate">
          {subject}
        </div>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-black text-emerald-700 shrink-0">
        <TrendingUp className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        {area.masteryPct}%
      </span>
    </motion.div>
  );
}

export default TodaysFocusSection;
