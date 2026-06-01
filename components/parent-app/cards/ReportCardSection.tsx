// ReportCardSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Home-page Report Card container. Renders one ReportCardRow per subject for
// the active child, plus a bottom "Generate full report" CTA that opens the
// full AI narrative sheet.
//
// Per-child filtering is automatic via useParentAppContext().activeChildId —
// switching the active child via the header popover reshuffles the rows.
//
// Empty state: when the active child has no report data (e.g. just-added kid)
// we render a soft empty card. The Generate-full-report CTA hides in that case.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, GraduationCap } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import { getReportCardForChild } from '../data/parentAppReportCardMock';
import { ReportCardStack } from './ReportCardStack';
import { ReportCardFullReportSheet } from './ReportCardFullReportSheet';

export const ReportCardSection: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { activeChild, activeChildId } = useParentAppContext();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  const rows = useMemo(
    () => getReportCardForChild(activeChildId),
    [activeChildId]
  );

  const [fullReportOpen, setFullReportOpen] = useState(false);

  return (
    <section
      aria-label={t('parentApp.reportCard.title')}
      className="space-y-3"
    >
      {/* Section header */}
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-black text-slate-800 leading-tight">
            {t('parentApp.reportCard.title')}
          </h2>
          <p className="text-[11px] font-bold text-slate-500 leading-tight">
            {t('parentApp.reportCard.subtitle')}
          </p>
        </div>
      </header>

      {/* Rows or empty state */}
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
          <GraduationCap className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-500">
            {t('parentApp.reportCard.empty')}
          </p>
        </div>
      ) : (
        <>
          {/* Fanned, swipeable stack — one subject at a time, with peeks of
              the next two cards on either side. Wraps at the ends. */}
          <ReportCardStack rows={rows} />

          {/* Generate full report CTA */}
          <motion.button
            type="button"
            onClick={() => setFullReportOpen(true)}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 240, damping: 24, delay: 0.2 }
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 bg-duo-purple text-white text-sm font-black motion-safe:active:scale-[0.98] hover:bg-duo-purple/90 transition-all"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            {t('parentApp.reportCard.generateFullReport')}
          </motion.button>
        </>
      )}

      {/* Full-report sheet — mounts once, controlled by `fullReportOpen`. */}
      <ReportCardFullReportSheet
        open={fullReportOpen}
        onClose={() => setFullReportOpen(false)}
        childId={activeChildId}
        childNameAr={activeChild.nameAr}
        childNameEn={activeChild.nameEn}
      />
    </section>
  );
};

export default ReportCardSection;
