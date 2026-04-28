/**
 * PremiumChannelModal — "contact-the-team" upgrade flow opened when an
 * admin clicks a premium-tier channel chip (WhatsApp / SMS) or the
 * locked preview tab.
 *
 * Visual contract:
 *   - Backdrop + scale-pop animation matches InfoHelpModal & ConfirmDialog
 *     so it lives in the same modal family.
 *   - Header: gradient amber/gold band, channel icon on a white circle,
 *     "خاصية مميزة · Premium feature" title.
 *   - Body: bilingual headline + sub-copy + 4-bullet "what's included".
 *   - Footer: gold gradient primary CTA opens a real-looking mailto draft;
 *     secondary "إغلاق · Close" button closes the modal.
 *   - Cancel via backdrop click or Escape.
 *   - Reduced-motion: skip the breathing-glow pulse on the primary CTA.
 *
 * AR-first bilingual: when locale === 'ar' the modal flips dir="rtl"
 * and the AR copy reads first.
 */
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Crown, Check, Mail } from 'lucide-react';
import {
  buildPremiumMailto,
  type PremiumChannelOption,
} from './premiumChannels';

interface PremiumChannelModalProps {
  open: boolean;
  channel: PremiumChannelOption | null;
  locale?: 'ar' | 'en';
  onClose: () => void;
}

export const PremiumChannelModal: React.FC<PremiumChannelModalProps> = ({
  open,
  channel,
  locale = 'ar',
  onClose,
}) => {
  const reduced = useReducedMotion();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Escape closes — same affordance as ConfirmDialog.
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

  if (!channel) return null;

  const Icon = channel.icon;
  const mailto = buildPremiumMailto(channel);

  // Gentle gold breathing pulse on the primary CTA (reduced-motion guarded).
  const pulseAnimate = reduced
    ? undefined
    : {
        boxShadow: [
          '0 10px 25px -5px rgba(245, 158, 11, 0.35)',
          '0 12px 35px -5px rgba(245, 158, 11, 0.55)',
          '0 10px 25px -5px rgba(245, 158, 11, 0.35)',
        ],
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-cairo"
          onClick={onClose}
          dir={dir}
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 10 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
          >
            {/* Header — gradient amber/gold band */}
            <div className="h-32 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[2px]" />
              <div className="absolute -top-10 -end-10 w-32 h-32 bg-white/25 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -start-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />

              {/* Channel icon on white circle */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white/50">
                <Icon className={`w-8 h-8 ${channel.iconColor}`} />
                {/* Crown badge bottom-end */}
                <div className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Close button (top-end, RTL-safe) */}
              <button
                onClick={onClose}
                aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
                className="absolute top-4 end-4 p-1.5 bg-black/15 hover:bg-black/25 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-black text-amber-700 mb-3">
                <Crown className="w-3 h-3" />
                <span>خاصية مميزة · Premium feature</span>
              </div>

              <h3
                id="premium-modal-title"
                className="text-lg font-black text-slate-800 mb-1.5 leading-snug"
              >
                {channel.modalHeadline}
              </h3>
              <p className="text-[13px] font-bold text-slate-400 mb-3 leading-snug">
                {channel.modalHeadlineEn}
              </p>

              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4 text-start">
                {channel.modalSubcopy}
              </p>
              <p className="text-[12px] font-medium text-slate-400 leading-relaxed mb-5 text-start">
                {channel.modalSubcopyEn}
              </p>

              {/* What's included */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100 text-start mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                    ما الذي ستحصل عليه · What's included
                  </span>
                </div>
                <ul className="space-y-2">
                  {channel.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[13px] font-bold text-slate-700"
                    >
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                      <span className="leading-snug">
                        <span className="block">{bullet.ar}</span>
                        <span className="block text-[11px] font-medium text-slate-400">
                          {bullet.en}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[12px] font-bold text-amber-600 leading-snug">
                ابقَ على اطلاع — هذه الميزة قادمة قريبًا
                <br />
                <span className="text-slate-400 font-medium">
                  Stay tuned — this feature is rolling out soon.
                </span>
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="sm:flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                إغلاق · Close
              </button>
              <motion.a
                href={mailto}
                onClick={() => {
                  // Close after firing mailto so the admin returns to a clean composer.
                  setTimeout(onClose, 100);
                }}
                animate={pulseAnimate}
                transition={
                  reduced
                    ? undefined
                    : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                }
                className="sm:flex-[1.4] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-sm hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                ref={closeBtnRef as unknown as React.Ref<HTMLAnchorElement>}
              >
                <Mail className="w-4 h-4" />
                <span>تواصل مع فريق String · Contact String Team</span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumChannelModal;
