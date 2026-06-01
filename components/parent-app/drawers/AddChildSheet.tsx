// AddChildSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom sheet that lets a parent connect another child after onboarding.
// Triggered by the dashed "+" pill in the avatar row at the top of Home.
//
// We deliberately mirror the visual + interaction grammar of
// `components/parent-onboarding/screens/ConnectChildScreen.tsx` (mock QR
// viewfinder with corner brackets + animated scanline, success tick, AND a
// paste-invite-code fallback) without depending on its onboarding shell. The
// onboarding shell is wired to `BottomShell + StepIndicator` and would not
// fit cleanly inside a bottom sheet, so we own a simplified inline version
// here and pull the same i18n keys via the parent-app dict.
//
// On a successful link, we:
//   1. Generate a fresh `MockChild` (zero stats, fresh id, an unused name from
//      the seeded pool, and an avatar color we haven't used yet if possible).
//   2. Call the parent-app context's `addChild()` action (this also auto-
//      switches the active pill to the new child — see useParentAppContext).
//   3. Close the sheet.
//   4. Fire `onAdded(displayName)` so the host can surface a top-screen toast.
//
// Reduced-motion: the scanline becomes static, transitions are instant.
// JIT-safe: every class string is a literal.
// RTL-safe: logical properties (`ps-`, `end-`, etc.) and flex-row.

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, Check, ScanLine } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import { useParentAppContext } from '../useParentAppContext';
import {
  type ChildAvatarColor,
  type MockChild,
} from '../parentAppMockData';
import { pickMockChildName } from '../../parent-onboarding/parentOnboardingMockData';

// Avatar color palette in the order we'd like to assign new children. We try
// each in turn and pick the first that isn't already used by an existing
// child. If they're all taken (rare — there are only 5 of them) we fall back
// to round-robin.
const AVATAR_COLOR_ROTATION: ReadonlyArray<ChildAvatarColor> = [
  'duo-purple',
  'duo-orange',
  'duo-blue',
  'duo-green',
  'duo-gold',
];

interface AddChildSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fired with the new child's display name (locale-resolved). */
  onAdded?: (displayName: string) => void;
}

type ScanState = 'idle' | 'scanning' | 'success';
type LinkState = 'idle' | 'linking';

export const AddChildSheet: React.FC<AddChildSheetProps> = ({
  open,
  onClose,
  onAdded,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { state, addChild } = useParentAppContext();

  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [code, setCode] = useState('');
  const [linkState, setLinkState] = useState<LinkState>('idle');

  const isCodeValid = code.trim().length >= 6;
  const busy = scanState !== 'idle' || linkState !== 'idle';

  // Names already used by existing children (locale-agnostic — we check both
  // AR and EN to be safe).
  const usedNames = useMemo(() => {
    const set = new Set<string>();
    state.children.forEach((c) => {
      set.add(c.nameAr);
      set.add(c.nameEn);
    });
    return set;
  }, [state.children]);

  const usedColors = useMemo(() => {
    const set = new Set<ChildAvatarColor>();
    state.children.forEach((c) => set.add(c.avatarColor));
    return set;
  }, [state.children]);

  /** Build a brand-new MockChild with zero stats and a fresh id. */
  const buildNewChild = useCallback((): MockChild => {
    // Walk the seeded name pool starting from `existingCount` until we land
    // on an entry whose names aren't already in the list. Cap the loop at
    // 16 attempts so we can't infinite-loop if the pool is exhausted (we
    // accept a duplicate name in that edge case).
    const startCount = state.children.length;
    let nameAr = '';
    let nameEn = '';
    for (let offset = 0; offset < 16; offset++) {
      const candidate = pickMockChildName(startCount + offset);
      if (!usedNames.has(candidate.nameAr) && !usedNames.has(candidate.nameEn)) {
        nameAr = candidate.nameAr;
        nameEn = candidate.nameEn;
        break;
      }
    }
    if (!nameAr) {
      // Fallback: just use the offset-0 pick (may duplicate, but the demo
      // pool only has 10 entries so this is acceptable in v1).
      const fallback = pickMockChildName(startCount);
      nameAr = fallback.nameAr;
      nameEn = fallback.nameEn;
    }

    // Pick an avatar color that isn't already taken if possible.
    let avatarColor: ChildAvatarColor = AVATAR_COLOR_ROTATION[0];
    for (const candidate of AVATAR_COLOR_ROTATION) {
      if (!usedColors.has(candidate)) {
        avatarColor = candidate;
        break;
      }
    }
    // If every color is taken, round-robin by child count.
    if (usedColors.has(avatarColor)) {
      avatarColor = AVATAR_COLOR_ROTATION[startCount % AVATAR_COLOR_ROTATION.length];
    }

    // Single-character initial — first letter of AR name (RTL-safe; in AR the
    // "first letter" is the visually-rightmost glyph but slicing the string
    // returns the first code point, which is correct for our font rendering).
    const avatarInitial = nameAr.charAt(0) || nameEn.charAt(0) || '?';

    // Stable id — timestamp + random suffix. Unique per session.
    const id = `child-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    // Brand-new children have zero activity. No fake "5 lessons today".
    return {
      id,
      nameAr,
      nameEn,
      avatarColor,
      avatarInitial,
      gender: 'female', // Neutral default; AR copy has gendered conjugation
                       // but a brand-new child has 0 lessons so the gendered
                       // line never fires for them.
      todayMins: 0,
      todayLessons: 0,
      todayAccuracy: 0,
      weakAreaAr: '—',
      weakAreaEn: '—',
      streakDays: 0,
      totalLessons: 0,
      masteryPct: 0,
    };
  }, [state.children.length, usedColors, usedNames]);

  /** Finalize an add — compute the new child, push to context, fire toast, close. */
  const finishAdd = useCallback(() => {
    const newChild = buildNewChild();
    addChild(newChild);
    const displayName = locale === 'ar' ? newChild.nameAr : newChild.nameEn;
    onAdded?.(displayName);
    // Reset internal state so the next open is clean.
    setScanState('idle');
    setLinkState('idle');
    setCode('');
    onClose();
  }, [addChild, buildNewChild, locale, onAdded, onClose]);

  const handleSimulateScan = useCallback(() => {
    if (busy) return;
    setScanState('scanning');
    window.setTimeout(() => {
      setScanState('success');
      window.setTimeout(() => {
        finishAdd();
      }, 450);
    }, 1000);
  }, [busy, finishAdd]);

  const handleLinkCode = useCallback(() => {
    if (!isCodeValid || busy) return;
    setLinkState('linking');
    window.setTimeout(() => {
      finishAdd();
    }, 600);
  }, [busy, finishAdd, isCodeValid]);

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        if (busy) return; // Don't let the user dismiss mid-link
        setCode('');
        setScanState('idle');
        setLinkState('idle');
        onClose();
      }}
      titleAr={getParentAppString('ar', 'parentApp.addChild.title')}
      titleEn={getParentAppString('en', 'parentApp.addChild.title')}
      closeAriaLabel={t('parentApp.addChild.closeAria')}
    >
      <div className="space-y-5 pt-1">
        {/* Subtitle */}
        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
          {t('parentApp.addChild.subtitle')}
        </p>

        {/* Scan card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-duo-blue-light flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-duo-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                {t('parentApp.addChild.scanLabel')}
              </h3>
              <p className="text-xs font-semibold text-slate-400 leading-tight">
                {t('parentApp.addChild.scanHint')}
              </p>
            </div>
          </div>

          {/* Fake viewfinder */}
          <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
            {/* Inner gradient noise */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(28,176,246,0.18),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(88,204,2,0.14),transparent_55%)]" />

            {/* Corner brackets */}
            <CornerBracket position="tl" />
            <CornerBracket position="tr" />
            <CornerBracket position="bl" />
            <CornerBracket position="br" />

            {/* Animated scanline (skipped under reduced-motion) */}
            {!reduceMotion && scanState !== 'success' && (
              <motion.div
                initial={{ y: '12%', opacity: 0.3 }}
                animate={
                  scanState === 'scanning'
                    ? { y: ['12%', '88%', '12%'], opacity: 0.95 }
                    : { y: ['12%', '88%', '12%'], opacity: 0.45 }
                }
                transition={{
                  duration: scanState === 'scanning' ? 1 : 2.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-x-[10%] h-[3px] rounded-full bg-gradient-to-r from-transparent via-duo-blue to-transparent shadow-[0_0_18px_rgba(28,176,246,0.9)]"
              />
            )}

            {/* Static scanline placeholder for reduced-motion */}
            {reduceMotion && scanState !== 'success' && (
              <div
                className="absolute inset-x-[10%] top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-transparent via-duo-blue to-transparent"
                aria-hidden
              />
            )}

            {/* QR-ish dots watermark */}
            <div className="absolute inset-[18%] grid grid-cols-7 grid-rows-7 gap-0.5 opacity-[0.18]">
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    i % 3 === 0 || i % 5 === 0 || i % 7 === 0
                      ? 'bg-white rounded-[2px]'
                      : 'bg-transparent'
                  }
                />
              ))}
            </div>

            {/* Success tick */}
            {scanState === 'success' && (
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0.15 }
                    : { type: 'spring', stiffness: 360, damping: 18 }
                }
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-duo-green flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" strokeWidth={3.5} />
                </div>
              </motion.div>
            )}

            {/* Scanning label */}
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold inline-flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5" />
                  {t('parentApp.addChild.scanning')}
                </span>
              </div>
            )}
          </div>

          {/* Scan CTA — duo-blue chunky button matching the onboarding flow */}
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={scanState === 'success' || linkState === 'linking'}
            className={
              scanState === 'success' || linkState === 'linking'
                ? 'relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold text-base tracking-tight transition-colors duration-100 outline-none bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold text-base tracking-tight transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40 bg-duo-blue text-white hover:bg-duo-blue-dark active:bg-duo-blue-dark motion-safe:active:scale-[0.98]'
            }
          >
            {scanState === 'scanning' && (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden />
            )}
            <span>
              {scanState === 'scanning'
                ? t('parentApp.addChild.scanning')
                : t('parentApp.addChild.scanCta')}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3" aria-hidden>
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            {t('parentApp.addChild.divider')}
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Invite-code card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
          <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
            {t('parentApp.addChild.codeTitle')}
          </h3>

          <div
            className={
              isCodeValid
                ? 'rounded-xl bg-white border border-duo-blue ring-2 ring-duo-blue/20 transition-colors duration-150'
                : 'rounded-xl bg-white border border-slate-200 transition-colors duration-150 focus-within:border-duo-blue focus-within:ring-2 focus-within:ring-duo-blue/20'
            }
          >
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('parentApp.addChild.codePlaceholder')}
              rows={2}
              disabled={linkState === 'linking' || scanState !== 'idle'}
              className="w-full bg-transparent outline-none px-4 py-3 text-base font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-semibold tracking-wide tabular-nums resize-none"
              aria-label={t('parentApp.addChild.codeTitle')}
            />
          </div>

          <p className="text-xs font-semibold text-slate-400 ps-1">
            {t('parentApp.addChild.codeHelper')}
          </p>

          <button
            type="button"
            onClick={handleLinkCode}
            disabled={!isCodeValid || scanState !== 'idle' || linkState === 'linking'}
            className={
              !isCodeValid || scanState !== 'idle' || linkState === 'linking'
                ? 'relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold text-base tracking-tight transition-colors duration-100 outline-none bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                : 'relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-5 font-bold text-base tracking-tight transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40 bg-white text-duo-blue border border-slate-200 hover:bg-slate-50 motion-safe:active:scale-[0.98]'
            }
          >
            {linkState === 'linking' && (
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" aria-hidden />
            )}
            <span>
              {linkState === 'linking'
                ? t('parentApp.addChild.linking')
                : t('parentApp.addChild.codeCta')}
            </span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

/* ──────────────────────────────────────────────────────────────────────── */

interface CornerBracketProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
}

const CornerBracket: React.FC<CornerBracketProps> = ({ position }) => {
  // Static literal class strings — JIT-safe.
  const map = {
    tl: 'top-3 left-3 border-t-4 border-l-4 rounded-tl-xl',
    tr: 'top-3 right-3 border-t-4 border-r-4 rounded-tr-xl',
    bl: 'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-xl',
    br: 'bottom-3 right-3 border-b-4 border-r-4 rounded-br-xl',
  } as const;
  return (
    <div
      className={`absolute w-7 h-7 border-duo-blue ${map[position]} shadow-[0_0_8px_rgba(28,176,246,0.5)]`}
      aria-hidden
    />
  );
};

export default AddChildSheet;
