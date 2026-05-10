// ChildrenListScreen.tsx — step 6
// ─────────────────────────────────────────────────────────────────────────────
// Linked children list. Each row is a glass card with avatar (initial),
// name, "Linked" subtitle, and a remove × button that goes through the
// shared confirm dialog. A dashed-border "Add another child" affordance
// routes back to the connect screen with state preserved. Bottom CTA "Done"
// shows a celebratory toast.

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, X, PartyPopper } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentOnboardingString, interpolate } from '../parentOnboardingI18n';
import { PrimaryButton } from '../PrimaryButton';
import { useConfirmDialog } from '../../ui/useConfirmDialog';
import type { OnboardingChild } from '../useParentOnboardingState';

interface ScreenProps {
  children: OnboardingChild[];
  onAddAnother: () => void;
  onRemoveChild: (id: string) => void;
  /** Render-prop hook. Also provides a place for the confirm dialog portal. */
  renderShell: (parts: {
    body: React.ReactNode;
    bottom: React.ReactNode;
    overlay: React.ReactNode;
  }) => React.ReactNode;
}

export const ChildrenListScreen: React.FC<ScreenProps> = ({
  children,
  onAddAnother,
  onRemoveChild,
  renderShell,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentOnboardingString(locale, key), [locale]);
  const reduceMotion = useReducedMotion();
  const { confirm, dialog } = useConfirmDialog();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleRemove = useCallback(
    async (child: OnboardingChild) => {
      const ok = await confirm({
        titleAr: interpolate(getParentOnboardingString('ar', 'parentOnboarding.list.removeTitle'), {
          name: child.nameAr,
        }),
        titleEn: interpolate(getParentOnboardingString('en', 'parentOnboarding.list.removeTitle'), {
          name: child.nameEn,
        }),
        bodyAr: interpolate(getParentOnboardingString('ar', 'parentOnboarding.list.removeBody'), {
          name: child.nameAr,
        }),
        bodyEn: interpolate(getParentOnboardingString('en', 'parentOnboarding.list.removeBody'), {
          name: child.nameEn,
        }),
        confirmLabelAr: getParentOnboardingString('ar', 'parentOnboarding.list.removeConfirm'),
        confirmLabelEn: getParentOnboardingString('en', 'parentOnboarding.list.removeConfirm'),
        cancelLabelAr: getParentOnboardingString('ar', 'parentOnboarding.list.removeCancel'),
        cancelLabelEn: getParentOnboardingString('en', 'parentOnboarding.list.removeCancel'),
        destructive: true,
      });
      if (ok) {
        onRemoveChild(child.id);
      }
    },
    [confirm, onRemoveChild]
  );

  const handleDone = useCallback(() => {
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2400);
    // After the celebratory toast, route into the post-onboarding home shell.
    // We give the toast a brief beat (~900ms) before transitioning so the
    // animation isn't cut short on the way out.
    window.setTimeout(() => {
      navigate('/parent/home');
    }, 900);
  }, [navigate]);

  const ctaEnabled = children.length > 0;

  const body = (
    <div className="space-y-6 pt-2">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
          {t('parentOnboarding.list.title')}
        </h1>
        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
          {t('parentOnboarding.list.subtitle')}
        </p>
      </motion.div>

      {/* Children list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {children.map((child, idx) => {
            const displayName = locale === 'ar' ? child.nameAr : child.nameEn;
            const initial = displayName.slice(0, 1);
            return (
              <motion.div
                key={child.id}
                layout={!reduceMotion}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.96 }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 24,
                  delay: idx * 0.04,
                }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/85 backdrop-blur border border-white shadow-sm"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-duo-green flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#4CAD00]">
                  <span className="text-lg font-black text-white">{initial}</span>
                </div>

                {/* Name + tag */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-extrabold text-slate-800 leading-tight truncate">
                    {displayName}
                  </h4>
                  <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-duo-green-light text-[#4CAD00] text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-duo-green" />
                    {t('parentOnboarding.list.linkedTag')}
                  </span>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => {
                    void handleRemove(child);
                  }}
                  aria-label={`${t('parentOnboarding.list.removeAria')} ${displayName}`}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add another */}
      <motion.button
        type="button"
        onClick={onAddAnother}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-white/40 hover:bg-white/70 border-2 border-dashed border-duo-blue/40 hover:border-duo-blue text-duo-blue font-extrabold text-base transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>{t('parentOnboarding.list.addAnother')}</span>
      </motion.button>
    </div>
  );

  const bottom = (
    <PrimaryButton onClick={handleDone} disabled={!ctaEnabled} variant="green">
      {t('parentOnboarding.list.cta')}
    </PrimaryButton>
  );

  // The toast + confirm dialog both go in the overlay slot so they ride on
  // top of the shell without nudging layout.
  const overlay = (
    <>
      {dialog}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="fixed top-6 inset-x-0 z-[140] flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-duo-green text-white shadow-[0_4px_0_0_#4CAD00] font-extrabold text-base pointer-events-auto">
              <PartyPopper className="w-5 h-5" />
              <span>{t('parentOnboarding.list.doneToast')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return <>{renderShell({ body, bottom, overlay })}</>;
};

export default ChildrenListScreen;
