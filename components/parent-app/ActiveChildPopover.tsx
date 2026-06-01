// ActiveChildPopover.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Compact pill trigger on the END side of the flat Parent Header + the
// Google-style anchored popover that drops down from it. Replaces the old
// horizontally-scrollable `<ChildPills />` row.
//
// Behavior:
//   • Trigger shows the active child's avatar + name + chevron.
//   • Tap opens the popover anchored to the trigger (NOT a full-screen modal).
//   • Popover lists: ACTIVE row (current child, checkmark) + SWITCH TO rows
//     (other children, tap to switch) + "+ Add another child" action row
//     that opens the existing AddChildSheet.
//   • Escape, outside click, and selecting an item all close the popover.
//   • Tab key cycles through focusable items inside the popover.
//   • Framer entrance: opacity + scale + tiny y from the top end origin.
//     Reduced-motion → instant.
//   • RTL-safe via logical properties (end-*/start-*).
//
// Toast: on a successful child add we surface a top-of-screen confirmation,
// fading after ~2s — mirrors the old ChildPills behavior so the parent gets
// the same affordance.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check, Plus, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { getParentAppString, interpolate } from './parentAppI18n';
import { useParentAppContext } from './useParentAppContext';
import { AVATAR_STYLES, type MockChild } from './parentAppMockData';
import { AddChildSheet } from './drawers/AddChildSheet';

// ─── Avatar circle (used inside trigger + popover rows) ─────────────────────

interface ChildAvatarProps {
  child: MockChild;
  size: 'sm' | 'md';
}

const ChildAvatar: React.FC<ChildAvatarProps> = ({ child, size }) => {
  const style = AVATAR_STYLES[child.avatarColor];
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  return (
    <span
      className={`shrink-0 ${sizeClass} rounded-full inline-flex items-center justify-center font-black ${style.bg} ${style.text}`}
      aria-hidden="true"
    >
      {child.avatarInitial}
    </span>
  );
};

// ─── Top-of-screen "added" toast ────────────────────────────────────────────

interface AddedToastProps {
  message: string | null;
  reduceMotion: boolean;
}

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
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── The trigger + popover unit ─────────────────────────────────────────────

export const ActiveChildPopoverTrigger: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { state, activeChild, setActiveChildId } = useParentAppContext();

  const triggerLabel = getParentAppString(locale, 'parentApp.header.activeChildAria');
  const activeLabel = getParentAppString(locale, 'parentApp.header.popoverActiveLabel');
  const switchLabel = getParentAppString(locale, 'parentApp.header.popoverSwitchLabel');
  const addLabel = getParentAppString(locale, 'parentApp.header.addAnotherChild');

  const [open, setOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const activeChildName =
    locale === 'ar' ? activeChild.nameAr : activeChild.nameEn;
  const renderName = useCallback(
    (child: MockChild) => (locale === 'ar' ? child.nameAr : child.nameEn),
    [locale]
  );

  const others = state.children.filter((c) => c.id !== activeChild.id);

  // ── Outside click + Escape closes ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSwitch = useCallback(
    (childId: string) => {
      setActiveChildId(childId);
      setOpen(false);
    },
    [setActiveChildId]
  );

  const handleOpenAdd = useCallback(() => {
    setOpen(false);
    setAddSheetOpen(true);
  }, []);

  const handleAdded = useCallback(
    (displayName: string) => {
      const message = interpolate(
        getParentAppString(locale, 'parentApp.addChild.addedToast'),
        { name: displayName }
      );
      setToastMessage(message);
      window.setTimeout(() => setToastMessage(null), 2000);
    },
    [locale]
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="bg-white border border-slate-200 rounded-full ps-1 pe-3 py-1 inline-flex items-center gap-2 motion-safe:active:scale-[0.97] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40"
      >
        <ChildAvatar child={activeChild} size="md" />
        <span className="text-sm font-bold text-slate-800 leading-none">
          {activeChildName}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 text-slate-400"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            role="menu"
            initial={
              reduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.95, y: -4 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: -2 }
            }
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.15, ease: 'easeOut' }
            }
            style={{ transformOrigin: 'top right' }}
            className="absolute top-full end-0 mt-2 z-50 min-w-[240px] max-w-[280px] bg-white border border-slate-200 rounded-2xl shadow-md py-2"
          >
            {/* ACTIVE section */}
            <div className="ps-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {activeLabel}
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50">
              <ChildAvatar child={activeChild} size="md" />
              <span className="flex-1 text-sm font-bold text-slate-800 truncate">
                {activeChildName}
              </span>
              <Check
                className="w-4 h-4 text-duo-blue shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </div>

            {others.length > 0 && (
              <>
                <div className="mx-3 my-1 border-t border-slate-100" />
                <div className="ps-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {switchLabel}
                </div>
                {others.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSwitch(child.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-start hover:bg-slate-50 active:bg-slate-100 transition-colors outline-none focus-visible:bg-slate-50"
                  >
                    <ChildAvatar child={child} size="md" />
                    <span className="flex-1 text-sm font-bold text-slate-800 truncate">
                      {renderName(child)}
                    </span>
                  </button>
                ))}
              </>
            )}

            <div className="mx-3 my-1 border-t border-slate-100" />
            <button
              type="button"
              role="menuitem"
              onClick={handleOpenAdd}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-start hover:bg-slate-50 active:bg-slate-100 transition-colors outline-none focus-visible:bg-slate-50"
            >
              <span
                className="shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center border border-dashed border-duo-blue/50 text-duo-blue"
                aria-hidden="true"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <span className="flex-1 text-sm font-bold text-duo-blue truncate">
                {addLabel}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddChildSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onAdded={handleAdded}
      />

      <AddedToast message={toastMessage} reduceMotion={!!reduceMotion} />
    </div>
  );
};

export default ActiveChildPopoverTrigger;
