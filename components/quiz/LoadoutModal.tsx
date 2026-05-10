/**
 * LoadoutModal — pre-quest "equip your loadout" dialog.
 *
 * Wave B4 deliverable. STANDALONE — Wave C will mount it inside
 * QuizSessionPage and forward the `onStart` payload to the
 * QuizSessionContext `APPLY_LOADOUT` reducer action. We do NOT dispatch
 * APPLY_LOADOUT here so the integration boundary stays clean.
 *
 * What it shows:
 *   - 5 pre-artifact-slot toggles (NOT 7). The plan's earlier "7 toggles"
 *     phrasing predates the passive/active split — Streak Shield + Phoenix
 *     are passive (no in-loadout UI), so the modal renders only the 5
 *     active pre-artifact slugs:
 *         xp_double, lucky_dice, freeze, restart_shield, combo_lock
 *     in that visual order (boosters first to draw the eye, then defensive,
 *     then the v2 combo_lock).
 *
 * Visual contract (matches the rest of the design system):
 *   - Custom AnimatePresence-backed modal mirroring SqDialog's glass +
 *     scale-pop language. The shipped SqDialog primitive is too rigid for
 *     this layout (gradient banner header, single body string, fixed
 *     icon) so we hand-roll a glass card with the same visual weight.
 *   - Backdrop: slate-900/40 + backdrop-blur-sm — light theme, NOT dark.
 *   - 3-col tile grid on >=sm, 2-col on narrow phones.
 *   - Tile entrance staggered (gentle spring), reduced-motion safe.
 *   - Footer: "Start" 3D button + ghost "Cancel"; order flips with RTL via
 *     `flex-row-reverse` on AR.
 *   - Backdrop click + Escape both close.
 *
 * Inventory consumption:
 *   - On Start, every toggled-on slug is `consume`'d via usePowerups()
 *     BEFORE invoking the parent's onStart callback. This deducts the
 *     UserContext inventory; Wave C's APPLY_LOADOUT writes the matching
 *     armed-flags into the QuizSessionContext.
 *   - The Tile primitive guards against toggling owned=0 slugs, so by
 *     construction every toggled-true slug has >=1 in inventory.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';
import { SqButton } from '../design-system/components/Button';
import PowerupTile from '../powerups/PowerupTile';

/**
 * Public API the future QuizSessionPage integration (Wave C) reads.
 * The `onStart` payload uses the same camelCase keys the
 * QuizSessionContext reducer expects on `APPLY_LOADOUT { loadout }`.
 */
export interface LoadoutSelection {
  freeze: boolean;
  restart_shield: boolean;
  xp_double: boolean;
  lucky_dice: boolean;
  combo_lock: boolean;
}

export interface LoadoutModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Fired with the final selection when the user taps Start. The modal
   * has already consumed each toggled slug from inventory by the time
   * this callback runs.
   */
  onStart: (loadout: LoadoutSelection) => void;
  /** Optional lesson title shown beneath the main heading. */
  lessonTitle?: string;
}

/** The 5 pre-artifact-slot slugs in modal display order. */
const LOADOUT_SLOTS: ReadonlyArray<keyof LoadoutSelection> = [
  'xp_double',
  'lucky_dice',
  'freeze',
  'restart_shield',
  'combo_lock',
];

const EMPTY_SELECTION: LoadoutSelection = {
  freeze: false,
  restart_shield: false,
  xp_double: false,
  lucky_dice: false,
  combo_lock: false,
};

export const LoadoutModal: React.FC<LoadoutModalProps> = ({
  open,
  onClose,
  onStart,
  lessonTitle,
}) => {
  const { t, locale } = useI18n();
  const { consume } = usePowerups();
  const reduce = useReducedMotion();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isAr = locale === 'ar';

  const [selection, setSelection] = useState<LoadoutSelection>(EMPTY_SELECTION);

  // Reset selection whenever the modal re-opens — a closed/cancel cycle
  // shouldn't carry stale toggles into the next session.
  useEffect(() => {
    if (open) setSelection(EMPTY_SELECTION);
  }, [open]);

  // Escape closes — mirrors SqDialog behavior so users get the same affordance.
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

  const toggleSlug = useCallback(
    (slug: keyof LoadoutSelection) => {
      setSelection((prev) => ({ ...prev, [slug]: !prev[slug] }));
    },
    []
  );

  const selectedCount = useMemo(
    () => LOADOUT_SLOTS.reduce((n, s) => n + (selection[s] ? 1 : 0), 0),
    [selection]
  );

  const handleStart = useCallback(() => {
    // Consume each toggled slug from UserContext inventory. Tile
    // guarantees we never have a true value with owned=0.
    LOADOUT_SLOTS.forEach((slug) => {
      if (selection[slug]) consume(slug);
    });
    // The parent's onStart handler is responsible for closing the modal
    // (e.g. via setLoadoutOpen(false)). We intentionally do NOT call
    // onClose() here — onClose is reserved for "user abandoned" paths
    // (backdrop click, Escape, Cancel, X) so the parent can route those
    // to a different handler (e.g. navigate back to /learn).
    onStart({ ...selection });
  }, [selection, consume, onStart]);

  // Stagger the tile entrance — gentle spring per token guidance.
  const containerVariants = {
    hidden: {},
    visible: {
      transition: reduce ? { staggerChildren: 0 } : { staggerChildren: 0.04 },
    },
  };

  const tileVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduce ? MOTION_FALLBACK : SQ_SPRING.gentle,
    },
  };

  // SSR/StrictMode-safe portal target.
  const portalTarget =
    typeof document !== 'undefined' ? document.body : null;

  if (!portalTarget) return null;

  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? MOTION_FALLBACK : { duration: 0.18 }}
          dir={dir}
          // Light-theme backdrop — translucent slate wash + blur, NEVER
          // a solid dark fill (matches the rest of the SQ system).
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-cairo"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sq-loadout-title"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.94, opacity: 0, y: 12 }}
            transition={reduce ? MOTION_FALLBACK : SQ_SPRING.gentle}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/70 shadow-2xl overflow-hidden"
          >
            {/* Header — soft brand gradient banner with floating sparkle tile */}
            <div className="relative h-24 bg-gradient-to-br from-violet-500 to-purple-600 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="relative z-10 p-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
                <Sparkles className="w-7 h-7 text-white" aria-hidden />
              </div>
              {/* Close X — RTL-aware corner */}
              <button
                type="button"
                onClick={onClose}
                aria-label={t('powerups.loadout.cancel')}
                className={[
                  'absolute top-3 z-10 p-1.5 rounded-full',
                  'bg-white/20 hover:bg-white/35 text-white transition-colors',
                  isAr ? 'left-3' : 'right-3',
                ].join(' ')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title block */}
            <div className="px-6 pt-5 pb-3 text-center">
              <h2
                id="sq-loadout-title"
                className="text-xl font-black text-slate-900 leading-tight"
              >
                {t('powerups.loadout.title')}
              </h2>
              {lessonTitle && (
                <div className="mt-1 text-sm font-semibold text-sq-brand-700">
                  {lessonTitle}
                </div>
              )}
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {t('powerups.loadout.subtitle')}
              </p>
            </div>

            {/* Tile grid — 2 cols on narrow, 3 cols on >=sm. */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {LOADOUT_SLOTS.map((slug) => (
                <motion.div key={slug} variants={tileVariants}>
                  <PowerupTile
                    slug={slug}
                    selected={selection[slug]}
                    onToggle={() => toggleSlug(slug)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Footer — RTL flips the visual order so "Start" lands under
                the user's primary thumb on AR. */}
            <div
              className={[
                'p-4 border-t border-slate-100 flex gap-3',
                isAr ? 'flex-row-reverse' : '',
              ].join(' ')}
            >
              <SqButton
                variant="ghost"
                tone="neutral"
                size="lg"
                onClick={onClose}
                className="flex-1"
              >
                {t('powerups.loadout.cancel')}
              </SqButton>
              <SqButton
                variant="3d"
                tone="brand"
                size="lg"
                onClick={handleStart}
                className="flex-[1.4]"
                aria-label={`${t('powerups.loadout.start')} (${selectedCount})`}
              >
                {t('powerups.loadout.start')}
                {selectedCount > 0 && (
                  <span className="ms-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-white/25 text-[11px] font-bold tabular-nums">
                    {selectedCount}
                  </span>
                )}
              </SqButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, portalTarget);
};

export default LoadoutModal;
