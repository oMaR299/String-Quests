// ReportCardFullReportSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// BottomSheet that shows the full multi-section AI narrative report for the
// active child. Triggered by the "Generate full report" CTA at the bottom
// of the Home Report Card section.
//
// On open we show a brief "Generating..." simulation (~1.2s) then reveal the
// composed report (sections from generateFullReport()). Reduced motion → no
// shimmer, the content appears instantly after the same delay.
//
// AR-first RTL via logical properties. Lucide icons only.

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Sparkles, RotateCw } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import {
  generateFullReport,
  type FullReportSection,
} from '../data/parentAppReportCardMock';

export interface ReportCardFullReportSheetProps {
  open: boolean;
  onClose: () => void;
  childId: string;
  childNameAr: string;
  childNameEn: string;
}

export const ReportCardFullReportSheet: React.FC<ReportCardFullReportSheetProps> = ({
  open,
  onClose,
  childId,
  childNameAr,
  childNameEn,
}) => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );

  // "Generating..." simulation. Reset on every open so the user always sees
  // the AI vibe when they tap the CTA.
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<FullReportSection[]>([]);

  const runGenerate = useCallback(() => {
    setGenerating(true);
    setSections([]);
    window.setTimeout(() => {
      const { sectionsAr, sectionsEn } = generateFullReport(
        childId,
        childNameAr,
        childNameEn
      );
      setSections(locale === 'ar' ? sectionsAr : sectionsEn);
      setGenerating(false);
    }, 1200);
  }, [childId, childNameAr, childNameEn, locale]);

  useEffect(() => {
    if (open) runGenerate();
  }, [open, runGenerate]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="fixed inset-0 z-[299] bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('parentApp.reportCard.fullReport.title')}
            dir={dir}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', stiffness: 220, damping: 22 }
            }
            className="fixed inset-x-0 bottom-0 z-[300] mx-auto max-w-[430px] bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-lg font-cairo border-t border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1 rounded-full bg-slate-300" aria-hidden="true" />
            </div>

            <div className="relative px-4 pt-2 pb-3 shrink-0">
              <div className="text-center px-8 space-y-0.5">
                <div className="flex items-center justify-center gap-2 text-base font-black text-slate-800">
                  <Sparkles className="w-4 h-4 text-duo-purple" strokeWidth={2.5} />
                  {t('parentApp.reportCard.fullReport.title')}
                </div>
                <div className="text-[11px] font-bold text-slate-500 truncate">
                  {t('parentApp.reportCard.fullReport.subtitle')}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('parentApp.reportCard.popover.closeAria')}
                className="absolute end-3 top-1.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-5">
              {generating ? (
                <GeneratingState reduceMotion={!!reduceMotion} t={t} />
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-duo-purple-light text-duo-purple text-[10px] font-extrabold">
                    <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                    {t('parentApp.reportCard.fullReport.aiBadge')}
                  </div>
                  {sections.map((section, idx) => (
                    <section
                      key={`${section.titleEn}-${idx}`}
                      className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2"
                    >
                      <h3 className="text-sm font-black text-slate-800 leading-tight">
                        {locale === 'ar' ? section.titleAr : section.titleEn}
                      </h3>
                      {(locale === 'ar' ? section.bodyAr : section.bodyEn).map(
                        (para, pidx) => (
                          <p
                            key={pidx}
                            className="text-xs font-bold text-slate-700 leading-relaxed"
                          >
                            {para}
                          </p>
                        )
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — Regenerate (re-runs the simulation). */}
            <div className="px-4 pt-2 pb-5 shrink-0 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={runGenerate}
                disabled={generating}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition-all active:scale-[0.98] ${
                  generating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-duo-purple border-2 border-duo-purple/30 hover:bg-duo-purple-light'
                }`}
              >
                <RotateCw className="w-4 h-4" strokeWidth={2.5} />
                {generating
                  ? t('parentApp.reportCard.generating')
                  : t('parentApp.reportCard.fullReport.regenerate')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Generating shimmer state ───────────────────────────────────────────────

interface GeneratingStateProps {
  reduceMotion: boolean;
  t: (key: string) => string;
}

const GeneratingState: React.FC<GeneratingStateProps> = ({ reduceMotion, t }) => (
  <div className="space-y-3 py-8">
    <div className="flex flex-col items-center gap-2.5">
      <motion.div
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-9 h-9 rounded-full bg-duo-purple-light text-duo-purple inline-flex items-center justify-center"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.5} />
      </motion.div>
      <p className="text-xs font-extrabold text-slate-500">
        {t('parentApp.reportCard.generating')}
      </p>
    </div>
    {/* Shimmer placeholder rows */}
    {[1, 2, 3].map((n) => (
      <div
        key={n}
        className={`rounded-2xl bg-slate-100 p-3 space-y-2 ${reduceMotion ? '' : 'motion-safe:animate-pulse'}`}
      >
        <div className="h-3 w-1/3 rounded-full bg-slate-200" />
        <div className="h-2 rounded-full bg-slate-200" />
        <div className="h-2 w-4/5 rounded-full bg-slate-200" />
      </div>
    ))}
  </div>
);

export default ReportCardFullReportSheet;
