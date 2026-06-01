// ConnectChildScreen.tsx — step 5
// ─────────────────────────────────────────────────────────────────────────────
// Two affordances stacked vertically:
//   1. Mock QR scanner — corner brackets + animated scanline + "Tap to simulate
//      scan" button. On tap: 1.0s of accelerated scanline, tick pop, then a
//      mock child name is added and we auto-advance.
//   2. Paste-code fallback — textarea + small CTA. 0.6s mock validation, then
//      adds + advances.
// On RTL the scan card reads first; the paste card reads second; an
// "or / أو" divider sits between them.

import React, { useCallback, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, Check, ScanLine } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentOnboardingString } from '../parentOnboardingI18n';
import { PrimaryButton } from '../PrimaryButton';
import { pickMockChildName } from '../parentOnboardingMockData';

interface ScreenProps {
  /** How many children are already linked — used to deterministically pick
   *  the next mock name from the seeded pool. */
  childrenCount: number;
  /** Called with the child name to add. */
  onAddChild: (nameAr: string, nameEn: string) => void;
  /** Render-prop hook. */
  renderShell: (parts: { body: React.ReactNode; bottom: React.ReactNode }) => React.ReactNode;
}

type ScanState = 'idle' | 'scanning' | 'success';
type LinkState = 'idle' | 'linking';

export const ConnectChildScreen: React.FC<ScreenProps> = ({
  childrenCount,
  onAddChild,
  renderShell,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentOnboardingString(locale, key), [locale]);
  const reduceMotion = useReducedMotion();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [code, setCode] = useState('');
  const [linkState, setLinkState] = useState<LinkState>('idle');

  const isCodeValid = code.trim().length >= 6;
  const busy = scanState !== 'idle' || linkState !== 'idle';

  const handleSimulateScan = useCallback(() => {
    if (busy) return;
    setScanState('scanning');
    window.setTimeout(() => {
      setScanState('success');
      window.setTimeout(() => {
        const { nameAr, nameEn } = pickMockChildName(childrenCount);
        onAddChild(nameAr, nameEn);
        setScanState('idle');
      }, 450);
    }, 1000);
  }, [busy, childrenCount, onAddChild]);

  const handleLinkCode = useCallback(() => {
    if (!isCodeValid || busy) return;
    setLinkState('linking');
    window.setTimeout(() => {
      const { nameAr, nameEn } = pickMockChildName(childrenCount);
      onAddChild(nameAr, nameEn);
      setLinkState('idle');
      setCode('');
    }, 600);
  }, [busy, childrenCount, isCodeValid, onAddChild]);

  const body = (
    <div className="space-y-6 pt-2">
      {/* Headline + subhead */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
          {t('parentOnboarding.connect.title')}
        </h1>
        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
          {t('parentOnboarding.connect.subtitle')}
        </p>
      </motion.div>

      {/* Scan card — primary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
        className="rounded-3xl bg-white/85 backdrop-blur border border-white shadow-lg shadow-duo-blue/10 p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-duo-blue-light flex items-center justify-center">
            <Camera className="w-5 h-5 text-duo-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-800 leading-tight">
              {t('parentOnboarding.connect.scanLabel')}
            </h3>
            <p className="text-xs font-semibold text-slate-400 leading-tight">
              {t('parentOnboarding.connect.scanHint')}
            </p>
          </div>
        </div>

        {/* Fake viewfinder */}
        <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
          {/* Inner gradient noise to feel like a camera feed */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(28,176,246,0.18),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(88,204,2,0.14),transparent_55%)]" />

          {/* Corner brackets */}
          <CornerBracket position="tl" />
          <CornerBracket position="tr" />
          <CornerBracket position="bl" />
          <CornerBracket position="br" />

          {/* Scanline */}
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

          {/* QR-ish dots watermark to suggest content under the scanline */}
          <div className="absolute inset-[18%] grid grid-cols-7 grid-rows-7 gap-0.5 opacity-[0.18]">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className={
                  // Pseudo-random pattern based on index parity / primes — JIT-safe.
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
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-duo-green flex items-center justify-center">
                <Check className="w-9 h-9 text-white" strokeWidth={3.5} />
              </div>
            </motion.div>
          )}

          {/* Scanning label */}
          {scanState === 'scanning' && (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs font-bold inline-flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5" />
                {t('parentOnboarding.connect.scanning')}
              </span>
            </div>
          )}
        </div>

        <PrimaryButton
          onClick={handleSimulateScan}
          loading={scanState === 'scanning'}
          disabled={scanState === 'success' || linkState === 'linking'}
        >
          {scanState === 'scanning'
            ? t('parentOnboarding.connect.scanning')
            : t('parentOnboarding.connect.scanCta')}
        </PrimaryButton>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3" aria-hidden>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          {t('parentOnboarding.connect.divider')}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Paste-code card — secondary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.1 }}
        className="rounded-3xl bg-white/70 backdrop-blur border border-white shadow-sm p-5 space-y-3"
      >
        <h3 className="text-base font-extrabold text-slate-800 leading-tight">
          {t('parentOnboarding.connect.codeTitle')}
        </h3>

        <div
          className={
            isCodeValid
              ? 'rounded-2xl bg-white border-2 border-duo-blue shadow-[0_0_0_4px_rgba(28,176,246,0.15)] transition-all duration-150'
              : 'rounded-2xl bg-white border-2 border-slate-200 shadow-sm transition-all duration-150 focus-within:border-duo-blue focus-within:shadow-[0_0_0_4px_rgba(28,176,246,0.15)]'
          }
        >
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('parentOnboarding.connect.codePlaceholder')}
            rows={2}
            disabled={linkState === 'linking'}
            className="w-full bg-transparent outline-none px-4 py-3 text-base font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-semibold tracking-wide tabular-nums resize-none"
            aria-label={t('parentOnboarding.connect.codeTitle')}
          />
        </div>

        <p className="text-xs font-semibold text-slate-400 ps-1">
          {t('parentOnboarding.connect.codeHelper')}
        </p>

        <PrimaryButton
          onClick={handleLinkCode}
          disabled={!isCodeValid || scanState !== 'idle'}
          loading={linkState === 'linking'}
          variant="secondary"
        >
          {linkState === 'linking'
            ? t('parentOnboarding.connect.linking')
            : t('parentOnboarding.connect.codeCta')}
        </PrimaryButton>
      </motion.div>
    </div>
  );

  // No global sticky CTA — each card carries its own primary action.
  return <>{renderShell({ body, bottom: null })}</>;
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

export default ConnectChildScreen;
