// DeepMapSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layer 3 — the calm "Knowledge map" reference. One row per subject with a
// mastery progress bar. Intentionally quiet (no coaching levers here) so it
// reads as reference, not a second dashboard. v1 = subject-level; lesson-level
// depth is deferred (see design doc §Scope).
//
// Each row carries an id (`skillmap-subject-<key>`) so the Garden hero can
// scroll-to a subject when a plant is tapped.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import {
  SUBJECT_STYLES,
  type SubjectKey,
} from '../data/parentAppSchoolMockData';
import type {
  ParentSkillArea,
  ParentSkillStatus,
} from './data/parentAppSkillMapMock';

interface DeepMapSectionProps {
  areas: ParentSkillArea[];
}

/** Mastery-bar fill color per status. */
const BAR_FILL: Record<ParentSkillStatus, string> = {
  mastered: 'bg-emerald-500',
  proficient: 'bg-duo-blue',
  developing: 'bg-amber-500',
  needsHelp: 'bg-rose-500',
};

const STATUS_KEY: Record<ParentSkillStatus, string> = {
  mastered: 'parentApp.skillMap.statusMastered',
  proficient: 'parentApp.skillMap.statusProficient',
  developing: 'parentApp.skillMap.statusDeveloping',
  needsHelp: 'parentApp.skillMap.statusNeedsHelp',
};

export const DeepMapSection: React.FC<DeepMapSectionProps> = ({ areas }) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = (key: string) => getParentAppString(locale, key);

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-5">
      <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4">
        {t('parentApp.skillMap.knowledgeMap')}
      </h2>

      <div className="space-y-4">
        {areas.map((area) => {
          const style = SUBJECT_STYLES[area.subjectKey as SubjectKey];
          const label = locale === 'ar' ? area.subjectAr : area.subjectEn;
          const unit = locale === 'ar' ? area.unitAr : area.unitEn;
          const fill = BAR_FILL[area.status];

          return (
            <div
              key={area.id}
              id={`skillmap-subject-${area.subjectKey}`}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-1.5">
                {/* Subject glyph */}
                <span
                  className={`w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-sm font-black ${
                    style ? `${style.pillBg} ${style.pillText}` : 'bg-slate-100 text-slate-500'
                  }`}
                  aria-hidden="true"
                >
                  {style?.glyph ?? '•'}
                </span>

                <span className="flex-1 min-w-0 text-sm font-extrabold text-slate-700 truncate">
                  {label}
                  {unit && (
                    <span className="ms-1.5 text-xs font-bold text-slate-400">· {unit}</span>
                  )}
                </span>

                <span className="text-sm font-black text-slate-700 tabular-nums">
                  {area.masteryPct}%
                </span>
              </div>

              {/* Mastery bar */}
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${fill}`}
                  initial={reduceMotion ? false : { width: 0 }}
                  whileInView={{ width: `${area.masteryPct}%` }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 120, damping: 20 }
                  }
                  style={reduceMotion ? { width: `${area.masteryPct}%` } : undefined}
                />
              </div>

              <div className="mt-1 text-[11px] font-bold text-slate-400 text-end">
                {t(STATUS_KEY[area.status])}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DeepMapSection;
