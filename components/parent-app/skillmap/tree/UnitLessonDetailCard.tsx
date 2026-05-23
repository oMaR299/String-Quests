// UnitLessonDetailCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The tap-detail card for the Subject Tree (Phase B). When a parent taps a
// unit BRANCH or a lesson TWIG inside `SubjectTreeView`, this prop-driven card
// surfaces that node's title, kind (Unit / Lesson), mastery %, a child-count
// line (lessonsCount for a unit, pagesCount for a lesson) and a single
// "Send practice" action.
//
// It is intentionally dumb: it owns no selection or send logic. The parent
// (`SubjectTreeView`) decides which node is selected, whether it's been sent,
// and what happens on send/close. This keeps the tree's interaction state in
// one place and makes the card trivially reusable.
//
// Aesthetic: flat white card, hairline border, Cairo, Lucide icons (no emoji),
// full RTL via logical props. The send→sent swap reuses the app-wide `SentState`
// confirmation from `CoachingCard` so the tree matches every other Send surface
// in the parent app. Framer Motion entrance is reduced-motion aware.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, X, GitBranch, Sprout } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../../parentAppI18n';
import { SentState } from '../CoachingCard';
import type { ParentSkillStatus } from '../data/parentAppSkillMapMock';

/** Which level of the tree the selected node sits at. */
export type TreeNodeKind = 'unit' | 'lesson';

export interface UnitLessonDetailCardProps {
  /** Branch (unit) or twig (lesson) the parent tapped. */
  kind: TreeNodeKind;
  /** Localized-ready titles for the tapped node. */
  titleAr: string;
  titleEn: string;
  /** 0-100 rolled-up mastery for the node. */
  masteryPct: number;
  /** Status bucket — drives the accent color of the mastery chip. */
  status: ParentSkillStatus;
  /** Count of the node's children: lessons for a unit, pages for a lesson. */
  childCount: number;
  /** Already-localized child name for the "sent" confirmation copy. */
  childName: string;
  /** Whether practice has already been sent for this node id this session. */
  sent: boolean;
  /** Fired when the parent taps "Send practice" (no-op if already sent). */
  onSend: () => void;
  /** Fired by the close button. */
  onClose: () => void;
}

// Status → flat accent classes for the mastery chip. Mirrors the leaf color
// language of the tree (emerald → rose) without importing the SVG hex map.
const STATUS_CHIP: Record<ParentSkillStatus, { bg: string; text: string }> = {
  mastered: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  proficient: { bg: 'bg-lime-100', text: 'text-lime-700' },
  developing: { bg: 'bg-amber-100', text: 'text-amber-700' },
  needsHelp: { bg: 'bg-rose-100', text: 'text-rose-700' },
};

export const UnitLessonDetailCard: React.FC<UnitLessonDetailCardProps> = ({
  kind,
  titleAr,
  titleEn,
  masteryPct,
  status,
  childCount,
  childName,
  sent,
  onSend,
  onClose,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();

  const t = (key: string) => getParentAppString(locale, key);

  const title = locale === 'ar' ? titleAr : titleEn;

  // Kind label ("Unit" / "Lesson") + matching Lucide glyph.
  const kindLabel =
    kind === 'unit'
      ? t('parentApp.skillMap.tree.unit')
      : t('parentApp.skillMap.tree.lesson');
  const KindIcon = kind === 'unit' ? GitBranch : Sprout;

  // Child-count line: a unit lists its lessons, a lesson lists its pages.
  const childCountLabel = interpolate(
    t(
      kind === 'unit'
        ? 'parentApp.skillMap.tree.lessonsCount'
        : 'parentApp.skillMap.tree.pagesCount'
    ),
    { n: childCount }
  );

  // Send-practice CTA copy depends on the node level.
  const sendLabel = t(
    kind === 'unit'
      ? 'parentApp.skillMap.tree.sendPracticeUnit'
      : 'parentApp.skillMap.tree.sendPracticeLesson'
  );

  const chip = STATUS_CHIP[status];

  return (
    <motion.div
      role="dialog"
      aria-label={title}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 28 }}
      className="relative w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-lg font-cairo"
    >
      {/* Close (inline-end, RTL-safe) */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t('parentApp.skillMap.tree.close')}
        className="absolute end-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>

      {/* Kind label + child count */}
      <div className="flex items-center gap-1.5 pe-8 text-[11px] font-bold text-slate-400">
        <KindIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
        <span>{kindLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{childCountLabel}</span>
      </div>

      {/* Title */}
      <h3 className="mt-1 pe-8 text-base font-black leading-tight text-slate-800">
        {title}
      </h3>

      {/* Mastery row */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500">
          {t('parentApp.skillMap.tree.overallMastery')}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-black tabular-nums ${chip.bg} ${chip.text}`}
        >
          {masteryPct}%
        </span>
      </div>

      {/* Send practice / sent confirmation */}
      <div className="mt-4">
        {sent ? (
          <SentState locale={locale} childName={childName} className="w-full" />
        ) : (
          <button
            type="button"
            onClick={onSend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-duo-blue px-4 py-3 text-sm font-black text-white shadow-[0_3px_0_0_#1899D6] transition-all hover:brightness-[1.03] active:translate-y-[2px] active:shadow-none"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            {sendLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default UnitLessonDetailCard;
