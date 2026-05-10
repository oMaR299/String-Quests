// ChildPills.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Horizontal row of compact avatar circles for each child + a small "+"
// add-another affordance at the end. v1.2 — multi-child aggregate "All" mode
// was removed; the parent always has exactly one active child at a time.
//
//   ( س )  ( ع )  ( ل )   ( + )
//
// The active avatar gets a duo-blue ring (4px) with a 2px white offset, so it
// reads as "selected" even on the light glass header. Inactive avatars have
// no ring. Tapping an avatar swaps the entire app to that child's data.
//
// v1.3: tapping the "+" pill now opens a bottom sheet (`AddChildSheet`) that
// mirrors the onboarding connect-child UX (mock QR scan + paste-invite-code)
// without yanking the parent out of the Home tab. On a successful add, the
// active child auto-switches to the new one (handled in the context) and a
// brief top-screen toast confirms the addition.
//
// RTL-safe: relies on `flex-row` + logical properties — under `dir="rtl"` the
// row visually flows right-to-left without us applying any transforms.
// JIT-safe: every class is a literal in source.

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, CheckCircle2, User } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { getParentAppString, interpolate } from './parentAppI18n';
import { useParentAppContext } from './useParentAppContext';
import { type MockChild } from './parentAppMockData';
import { AddChildSheet } from './drawers/AddChildSheet';

interface AvatarPillProps {
  child: MockChild;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}

/**
 * Plain avatar pill — neutral slate-tinted circle with a generic User
 * silhouette as the placeholder. Active state uses a duo-blue ring with a
 * white offset so it reads as "selected" on the light glass header.
 *
 * (Per design ask: drop the bold colored 3D treatment + initial letter; we
 * just want empty avatars with placeholder content until real photos land.)
 */
const AvatarPill: React.FC<AvatarPillProps> = ({ child: _child, active, onClick, ariaLabel }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={
        active
          ? 'relative shrink-0 w-11 h-11 rounded-full inline-flex items-center justify-center bg-slate-100 text-slate-400 transition-transform duration-100 active:scale-95 ring-4 ring-duo-blue ring-offset-2 ring-offset-white border border-slate-200'
          : 'relative shrink-0 w-11 h-11 rounded-full inline-flex items-center justify-center bg-slate-100 text-slate-400 transition-transform duration-100 active:scale-95 border border-slate-200 hover:bg-slate-50'
      }
    >
      <User className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
};

interface AddPillProps {
  onClick: () => void;
  ariaLabel: string;
}

const AddPill: React.FC<AddPillProps> = ({ onClick, ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center border-2 border-dashed border-duo-blue/40 hover:border-duo-blue text-duo-blue transition-colors active:scale-95"
  >
    <Plus className="w-4 h-4" strokeWidth={3} />
  </button>
);

interface AddedToastProps {
  message: string | null;
  reduceMotion: boolean;
}

/**
 * Top-of-screen success toast that floats above the sheet (z-[140] sits above
 * the sheet's z-[121] and its z-[120] backdrop). Auto-fades after ~2s — the
 * caller controls the fade by clearing the message string.
 */
const AddedToast: React.FC<AddedToastProps> = ({ message, reduceMotion }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        key={message}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.22 }}
        className="fixed top-4 inset-x-0 flex justify-center pointer-events-none z-[140] px-4"
        aria-live="polite"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-extrabold shadow-[0_4px_0_0_#4CAD00]">
          <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
          <span>{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const ChildPills: React.FC = () => {
  const { locale, dir } = useI18n();
  const reduceMotion = useReducedMotion();
  const { state, activeChildId, setActiveChildId } = useParentAppContext();

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Sheet open/closed state — local to the pill row.
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  // Toast message — null when hidden. We use a counter to force AnimatePresence
  // to re-mount if the same name is added back-to-back.
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelect = useCallback(
    (next: string) => {
      setActiveChildId(next);
    },
    [setActiveChildId]
  );

  const handleAdd = useCallback(() => {
    setAddSheetOpen(true);
  }, []);

  const handleAdded = useCallback(
    (displayName: string) => {
      const message = interpolate(t('parentApp.addChild.addedToast'), { name: displayName });
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage(null);
      }, 2000);
    },
    [t]
  );

  const renderName = useCallback(
    (child: MockChild) => (locale === 'ar' ? child.nameAr : child.nameEn),
    [locale]
  );

  return (
    <>
      <div
        className="flex items-center gap-2 overflow-x-auto px-1 py-1 -mx-1 no-scrollbar"
        role="tablist"
        aria-label={t('parentApp.tab.home')}
        // Make horizontal scrollwheel work intuitively without altering DOM order.
        style={{ scrollBehavior: 'smooth', direction: dir }}
      >
        {state.children.map((child) => (
          <AvatarPill
            key={child.id}
            child={child}
            active={activeChildId === child.id}
            onClick={() => handleSelect(child.id)}
            ariaLabel={renderName(child)}
          />
        ))}

        <AddPill onClick={handleAdd} ariaLabel={t('parentApp.header.addChild')} />
      </div>

      <AddChildSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onAdded={handleAdded}
      />

      <AddedToast message={toastMessage} reduceMotion={!!reduceMotion} />
    </>
  );
};

export default ChildPills;
