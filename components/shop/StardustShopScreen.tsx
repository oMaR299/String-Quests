/**
 * StardustShopScreen — full-screen catalog of all 13 power-ups, grouped by
 * the 6 visual buckets locked in the plan.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │  ←  Title                Balance | Info-(?)  │
 *   ├──────────────────────────────────────────────┤
 *   │  ▍ Defensive (3)                             │
 *   │  [card] [card] [card]                        │
 *   │  ▍ XP Boosters (2)                           │
 *   │  [card] [card]                               │
 *   │  …                                            │
 *   └──────────────────────────────────────────────┘
 *
 * Conventions:
 *   - All copy goes through `useI18n().t(...)`. AR is the default.
 *   - RTL is achieved via `dir={dir}`; the back arrow swaps icon side.
 *   - The 6 group sections render in a fixed order matching the spec.
 *   - Cards animate in with a staggered fade+rise (Framer Motion); the
 *     stagger is killed when `useReducedMotion()` is on.
 *   - Toasts are owned here (not by PowerupCard) — we keep the Toast
 *     primitive stateless and just thread the latest "bought" event.
 *   - We deliberately mount inside AppShell (no sidebar duplicate) — the
 *     route wrapper at `pages/StardustShopPage.tsx` chooses that shell.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useStardust } from '../../hooks/useStardust';
import {
  ALL_POWERUP_SLUGS,
  POWERUP_CATALOG,
  type PowerupGroup,
  type PowerupSlug,
} from '../../data/mockPowerupsData';
import { PowerupCard } from '../powerups/PowerupCard';
import { StardustBadge } from '../powerups/StardustBadge';
import { SqDialog } from '../design-system/components/Dialog';
import { SqToast } from '../design-system/components/Toast';
import { SqPill } from '../design-system/components/Pill';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

/* ─── Group ordering (locked by spec) ─────────────────────────────────── */

const GROUP_ORDER: PowerupGroup[] = [
  'defensive',
  'xp_booster',
  'question_helper',
  'reactive',
  'combo_streak',
  'power_solve',
];

/** Subtle gradient bar per section header (light theme — pastel washes). */
const GROUP_BAR: Record<PowerupGroup, string> = {
  defensive: 'bg-gradient-to-r from-sq-info-200 via-sq-info-500 to-sq-info-200',
  xp_booster: 'bg-gradient-to-r from-sq-warning-200 via-sq-warning-500 to-sq-warning-200',
  question_helper: 'bg-gradient-to-r from-sq-brand-200 via-sq-brand-500 to-sq-brand-200',
  reactive: 'bg-gradient-to-r from-sq-success-200 via-sq-success-500 to-sq-success-200',
  combo_streak: 'bg-gradient-to-r from-sq-danger-200 via-sq-danger-500 to-sq-danger-200',
  power_solve: 'bg-gradient-to-r from-pastel-purple via-sq-brand-500 to-pastel-purple',
};

/* ─── Locale-aware digit formatter ────────────────────────────────────── */

const formatCount = (n: number, locale: 'ar' | 'en') =>
  locale === 'ar'
    ? n.toLocaleString('ar-EG')
    : n.toLocaleString('en-US');

/* ─── Static AR + EN bullets for the "How power-ups work" dialog ──────── */

const HOW_IT_WORKS = {
  ar: [
    'اشترِ الترقيات بنجوم النجوم (SD).',
    'بعض الترقيات تُجهَّز قبل بدء الجلسة، وبعضها يُستخدم داخل السؤال.',
    'الحد الأقصى للملكية هو 10 لكل ترقية.',
    'الترقيات الموسومة بـ "قريباً" ستُفعَّل في تحديث لاحق.',
  ],
  en: [
    'Buy power-ups with Stardust (SD).',
    'Some equip before a quest, others activate inside a question.',
    'You can hold up to 10 of each power-up.',
    '"Coming soon" items will unlock in a future update.',
  ],
};

/* ─── Card stagger variants ───────────────────────────────────────────── */

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Component ───────────────────────────────────────────────────────── */

export const StardustShopScreen: React.FC = () => {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { balance } = useStardust();

  const [infoOpen, setInfoOpen] = useState(false);
  const [toastSlug, setToastSlug] = useState<PowerupSlug | null>(null);
  const [toastKey, setToastKey] = useState(0);

  // Group → ordered slugs (catalog order). Computed once per render — cheap.
  const slugsByGroup = useMemo(() => {
    const map: Record<PowerupGroup, PowerupSlug[]> = {
      defensive: [],
      xp_booster: [],
      question_helper: [],
      reactive: [],
      combo_streak: [],
      power_solve: [],
    };
    for (const slug of ALL_POWERUP_SLUGS) {
      map[POWERUP_CATALOG[slug].group].push(slug);
    }
    return map;
  }, []);

  const handleBought = (slug: PowerupSlug) => {
    setToastSlug(slug);
    setToastKey((k) => k + 1);
  };

  const handleBack = () => {
    // Prefer history pop; fall back to /home if there's nowhere to go.
    if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };

  // Back arrow flips with locale (RTL = Arabic = right-pointing).
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  // Toast copy: "+1 Freeze. −40 SD"
  const toastTitle = (() => {
    if (!toastSlug) return '';
    const name = t(`powerups.name.${toastSlug}`);
    const cost = POWERUP_CATALOG[toastSlug].costSD;
    return isAr
      ? `+1 ${name} • -${cost} SD`
      : `+1 ${name} · −${cost} SD`;
  })();

  return (
    <div
      dir={dir}
      className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-12 relative z-10 font-cairo"
    >
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label={isAr ? 'رجوع' : 'Back'}
            className="shrink-0 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-slate-600 hover:text-sq-brand-700 hover:border-sq-brand-200 transition-colors"
          >
            <BackIcon className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight truncate">
              {t('powerups.shop.title')}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
              {t('powerups.shop.balance')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StardustBadge balance={balance} size="lg" animateOnChange />
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            aria-label={isAr ? 'كيف تعمل الترقيات؟' : 'How power-ups work'}
            className="shrink-0 w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-slate-500 hover:text-sq-brand-700 hover:border-sq-brand-200 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Sections ───────────────────────────────────────────────────── */}
      <motion.div
        initial={reduce ? false : 'hidden'}
        animate="visible"
        variants={reduce ? undefined : containerVariants}
        className="space-y-8 sm:space-y-10"
      >
        {GROUP_ORDER.map((group) => {
          const slugs = slugsByGroup[group];
          if (slugs.length === 0) return null;
          return (
            <section key={group} aria-labelledby={`group-${group}`}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-block h-1.5 w-10 rounded-full ${GROUP_BAR[group]}`}
                  aria-hidden
                />
                <h2
                  id={`group-${group}`}
                  className="text-sm sm:text-base font-black text-slate-800 tracking-tight"
                >
                  {t(`powerups.groups.${group}`)}
                </h2>
                <SqPill variant="accent">
                  {`(${formatCount(slugs.length, locale)})`}
                </SqPill>
              </div>

              {/* Card grid: 1 / 2 / 3 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {slugs.map((slug) => (
                  <motion.div
                    key={slug}
                    variants={reduce ? undefined : cardVariants}
                    transition={reduce ? MOTION_FALLBACK : SQ_SPRING.gentle}
                  >
                    <PowerupCard slug={slug} onBought={handleBought} />
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </motion.div>

      {/* ── "How it works" info dialog ─────────────────────────────────── */}
      <SqDialog
        open={infoOpen}
        variant="info"
        tone="brand"
        title={isAr ? 'كيف تعمل الترقيات؟' : 'How power-ups work'}
        body={
          isAr
            ? HOW_IT_WORKS.ar.map((b) => `• ${b}`).join('\n')
            : HOW_IT_WORKS.en.map((b) => `• ${b}`).join('\n')
        }
        locale={locale}
        confirmLabel={isAr ? 'فهمت' : 'Got it'}
        onConfirm={() => setInfoOpen(false)}
        onCancel={() => setInfoOpen(false)}
      />

      {/* ── Buy toast ──────────────────────────────────────────────────── */}
      <SqToast
        key={toastKey}
        open={toastSlug !== null}
        variant="success"
        title={t('powerups.toast.bought')}
        body={toastTitle}
        duration={2400}
        onClose={() => setToastSlug(null)}
      />
    </div>
  );
};

export default StardustShopScreen;
