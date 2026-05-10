/**
 * ShopCard — home-page entry tile to the Stardust Shop.
 *
 * Light-theme glassmorphism on a soft warm-gold → pastel-purple gradient.
 * Mounted on the StartScreen next to PracticeModeCard (Wave B1).
 *
 * Visual language:
 *   - Warm gold (sq-warning-*) ties the tile to the Stardust currency.
 *   - Pastel-purple bleed echoes the brand violet (sq-brand-*) without
 *     introducing a dark surface — every other home card uses dark
 *     gradients, so this tile uses the design-system "glass on light"
 *     pattern instead, matching the rest of the Power-Ups surfaces.
 *
 * Tap micro-interaction:
 *   - whileHover lift via SQ_SPRING.snappy
 *   - whileTap scale 0.97
 *   - Both no-ops under prefers-reduced-motion.
 */

import React from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useStardust } from '../../hooks/useStardust';
import { StardustBadge } from '../powerups/StardustBadge';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

const POWERUP_COUNT = 13;

export const ShopCard: React.FC = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { balance } = useStardust();
  const reduce = useReducedMotion();

  const isAr = locale === 'ar';
  const subtitle = isAr
    ? `${POWERUP_COUNT} ترقية متاحة`
    : `${POWERUP_COUNT} power-ups available`;
  const ctaLabel = isAr ? 'ادخل المتجر' : 'Enter shop';

  const enterTransition: Transition = reduce
    ? MOTION_FALLBACK
    : { type: 'spring', stiffness: 200, damping: 20, delay: 0.04 };
  const hoverTransition: Transition = reduce ? MOTION_FALLBACK : SQ_SPRING.snappy;

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/shop')}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={enterTransition}
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      // Hover/tap easing
      style={{ transition: undefined }}
      aria-label={t('powerups.shop.title')}
      className="
        relative group w-full text-start
        rounded-[1.5rem] sm:rounded-[2rem]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-warning-500/40 focus-visible:ring-offset-2
        font-cairo
      "
    >
      {/* Soft outer glow — warm gold to pastel-purple, light theme */}
      <span
        aria-hidden
        className="
          pointer-events-none absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem]
          bg-gradient-to-r from-sq-warning-50 via-amber-100/60 to-pastel-purple/50
          blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-500
        "
      />

      <div
        className="
          relative overflow-hidden
          rounded-[1.5rem] sm:rounded-[2rem]
          p-4 sm:p-6
          bg-white/80 backdrop-blur-xl
          border border-white/70
          shadow-sm
          transition-shadow duration-300 group-hover:shadow-md
        "
        // Inline gradient overlay so the warm tint reads on white without
        // needing a new Tailwind utility.
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,251,235,0.95) 0%, rgba(255,255,255,0.85) 45%, rgba(199,184,234,0.35) 100%)',
        }}
      >
        {/* Decorative pastel blurs */}
        <div
          className={`
            pointer-events-none absolute top-0 ${isAr ? 'start-0 -translate-x-1/3' : 'end-0 translate-x-1/3'}
            w-[260px] h-[260px] rounded-full blur-[80px] -translate-y-1/3
            bg-sq-warning-500/15
          `}
        />
        <div
          className={`
            pointer-events-none absolute bottom-0 ${isAr ? 'end-0' : 'start-0'}
            w-[180px] h-[180px] rounded-full blur-[60px]
            bg-sq-brand-500/10
          `}
        />

        <div className="flex items-center gap-3 sm:gap-5 relative z-10">
          {/* Gradient icon tile (warm gold → soft purple) */}
          <div
            className="
              relative w-12 h-12 sm:w-16 sm:h-16
              rounded-2xl sm:rounded-3xl
              flex items-center justify-center shrink-0
              bg-gradient-to-br from-sq-warning-500 to-sq-brand-500
              shadow-[0_8px_24px_-8px_rgba(245,158,11,0.55)]
              transition-transform duration-500 group-hover:rotate-6
            "
          >
            <Sparkles
              className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
              strokeWidth={2.25}
            />
            {/* Tiny floating SD chip */}
            <span
              className="
                absolute -top-1.5 -end-1.5
                rounded-full px-1.5 py-0.5
                bg-white text-[9px] sm:text-[10px] font-black text-sq-warning-700
                border border-sq-warning-200
                shadow-sm
                tabular-nums
              "
            >
              SD
            </span>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="
                  px-2.5 py-0.5 rounded-full
                  bg-sq-warning-50 border border-sq-warning-200
                  text-sq-warning-700 text-[10px] font-bold uppercase tracking-wider
                  flex items-center gap-1.5
                "
              >
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                {isAr ? 'جديد' : 'New'}
              </span>
              <StardustBadge balance={balance} size="sm" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 tracking-tight">
              {t('powerups.shop.title')}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium line-clamp-2">
              {subtitle}
            </p>
          </div>

          {/* CTA chevron — flips with RTL via lucide rotation */}
          <div
            className="
              shrink-0
              hidden sm:flex items-center gap-1.5
              px-3 py-2 rounded-xl
              bg-white/80 border border-sq-warning-200
              text-sq-warning-700 text-xs font-bold
              transition-transform duration-200 group-hover:translate-x-0
            "
          >
            <span>{ctaLabel}</span>
            <ArrowRight
              className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default ShopCard;
