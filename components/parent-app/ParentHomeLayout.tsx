// ParentHomeLayout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Top-level entry for the post-onboarding Parent App. Mounts the shared
// PhoneShell, owns the parent-app context (active child, lastUpdatedAt,
// mock state), and renders:
//
//   • Sticky header (avatar + child pills + refresh + bell)
//   • Tab content via React Router <Outlet />
//   • Bottom 5-tab bar — HIDDEN while any logistics drawer is open so the
//     drawer gets the full viewport AND the parent can't accidentally tab-
//     navigate while reading their kid's assignments/exams/etc.
//
// State is intentionally lifted here so changing the active child pill on
// Home persists when the user taps another bottom tab. Per plan §Risks #1.
//
// We mirror dir on documentElement (matching ParentOnboardingLayout) so any
// global behavior follows the locale even though this layout sits outside
// AppShell.

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PhoneShell } from '../shared/PhoneShell';
import { useI18n } from '../../contexts/I18nContext';
import { ParentAppProvider, useParentAppContext } from './useParentAppContext';
import { ParentHeader } from './ParentHeader';
import { ParentTabBar } from './ParentTabBar';

/**
 * Inner layout that has access to ParentAppContext (so it can read
 * `isDrawerOpen` to swap the tab bar in/out). Split out so the provider can
 * wrap it cleanly above.
 */
const ParentHomeLayoutInner: React.FC = () => {
  const { dir } = useI18n();
  const { isDrawerOpen } = useParentAppContext();
  const reduceMotion = useReducedMotion();

  // Bottom slot content — wrapped in AnimatePresence so the tab bar slides
  // out when a logistics drawer opens, and slides back in on close. Reduced
  // motion → instant disappear/reappear.
  const bottomSlot = (
    <AnimatePresence mode="wait" initial={false}>
      {!isDrawerOpen && (
        <motion.div
          key="parent-tab-bar"
          initial={
            reduceMotion ? { opacity: 1, y: 0 } : { y: 100, opacity: 0 }
          }
          animate={{ y: 0, opacity: 1 }}
          exit={
            reduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 220, damping: 22 }
          }
        >
          <ParentTabBar />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div dir={dir} className="font-cairo">
      <PhoneShell
        fullBleedChrome
        fullBleedBottom
        topCenter={<ParentHeader />}
        bottom={bottomSlot}
        bodyClassName="relative z-10 flex-1 overflow-y-auto"
      >
        <Outlet />
      </PhoneShell>
    </div>
  );
};

export const ParentHomeLayout: React.FC = () => {
  const { dir } = useI18n();

  useEffect(() => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = dir;
    return () => {
      document.documentElement.dir = previous;
    };
  }, [dir]);

  return (
    <ParentAppProvider>
      <ParentHomeLayoutInner />
    </ParentAppProvider>
  );
};

export default ParentHomeLayout;
