/**
 * InQuestionPowerupBar — floating dock above the QuizCard exposing the
 * 6 in-question power-ups.
 *
 * As of the Foundation chunk for cinematic power-up moments, this bar's
 * confirm handlers are PURE PRODUCERS for the cinematic-cast queue: each
 * one computes any pre-needed data (50/50 picks the wrong-option indices)
 * and dispatches `ENQUEUE_CAST`. The actual reducer mutations
 * (CONSUME_POWERUP, APPLY_5050, REVEAL_HINT_FREE, ARM_SECOND_CHANCE,
 * SKIP_QUESTION, AUTO_COMPLETE_QUESTION, REGEN_HEART) and the synthetic
 * "answer" dispatch for Skip/Auto-Complete are owned by the effect
 * components in `components/powerups/effects/`, fired in their post phase
 * so the visual and the state stay in lockstep.
 *
 * Display order: fifty_fifty, hint_reveal, second_chance, eraser, skip,
 * auto_complete. Per-button visibility/state rules unchanged:
 *
 *   - Owned == 0 → button HIDDEN entirely (keeps the dock tight; spec).
 *   - fifty_fifty: HIDDEN if not multiple-choice OR options < 4 OR already
 *     applied this question.
 *   - hint_reveal: HIDDEN if free-hint already revealed this question.
 *   - second_chance: HIDDEN if armed on the current question. DISABLED
 *     w/ tooltip if armed elsewhere.
 *   - eraser: HIDDEN when hearts === maxHearts (no wrong to erase).
 *   - skip / auto_complete: opens PowerupConfirmDialog with the
 *     "no_perfect_bonus" warning.
 *   - v2 stubs (eraser, auto_complete) get a "قريبًا/Coming soon" pill
 *     overlay but remain functional per the Wave-C scope choice.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';
import { usePowerups } from '../../hooks/usePowerups';
import { useUser } from '../../contexts/UserContext';
import { useQuizSession } from '../../contexts/QuizSessionContext';
import {
  POWERUP_CATALOG,
  type PowerupGroup,
  type PowerupSlug,
} from '../../data/mockPowerupsData';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';
import { SqPill } from '../design-system/components/Pill';
import { PowerupIcon } from '../powerups/PowerupIcon';
import PowerupConfirmDialog from './PowerupConfirmDialog';
import type { Question } from '../../types';

export interface InQuestionPowerupBarProps {
  question: Question;
}

const HUD_SLUGS: PowerupSlug[] = [
  'fifty_fifty',
  'hint_reveal',
  'second_chance',
  'eraser',
  'skip',
  'auto_complete',
];

const GROUP_GRADIENT: Record<PowerupGroup, string> = {
  defensive:       'bg-gradient-to-br from-sky-400 to-sq-info-500',
  xp_booster:      'bg-gradient-to-br from-amber-400 to-sq-warning-500',
  question_helper: 'bg-gradient-to-br from-violet-400 to-sq-brand-500',
  reactive:        'bg-gradient-to-br from-emerald-400 to-sq-success-500',
  combo_streak:    'bg-gradient-to-br from-rose-400 to-sq-danger-500',
  power_solve:     'bg-gradient-to-br from-pastel-purple to-sq-brand-500',
};

const GROUP_SHADOW: Record<PowerupGroup, string> = {
  defensive:       'shadow-md shadow-sky-500/30',
  xp_booster:      'shadow-md shadow-amber-500/30',
  question_helper: 'shadow-md shadow-violet-500/30',
  reactive:        'shadow-md shadow-emerald-500/30',
  combo_streak:    'shadow-md shadow-rose-500/30',
  power_solve:     'shadow-md shadow-violet-500/25',
};

export const InQuestionPowerupBar: React.FC<InQuestionPowerupBarProps> = ({
  question,
}) => {
  const { t, locale } = useI18n();
  const { state: userState } = useUser();
  const { state: quizState, dispatch: quizDispatch } = useQuizSession();
  const { getOwned, isV2 } = usePowerups();
  const reduce = useReducedMotion();
  const isAr = locale === 'ar';

  const [confirmSlug, setConfirmSlug] = useState<PowerupSlug | null>(null);

  /** Per-slug visibility + disabled rules for the dock. */
  const visibility = useMemo(() => {
    const map = new Map<PowerupSlug, { visible: boolean; disabled: boolean; tooltip?: string }>();

    for (const slug of HUD_SLUGS) {
      const owned = getOwned(slug);

      // Inventory==0 → hidden (keeps the dock tight per spec).
      if (owned <= 0) {
        map.set(slug, { visible: false, disabled: false });
        continue;
      }

      let visible = true;
      let disabled = false;
      let tooltip: string | undefined;

      switch (slug) {
        case 'fifty_fifty': {
          const isMC = question.type === 'multiple-choice';
          const has4Plus = (question.options?.length ?? 0) >= 4;
          const alreadyUsed = quizState.hiddenOptionIndices.length > 0;
          if (!isMC || !has4Plus || alreadyUsed) visible = false;
          break;
        }
        case 'hint_reveal': {
          if (quizState.hintRevealedNoPenalty) visible = false;
          break;
        }
        case 'second_chance': {
          const armedHere = quizState.secondChanceArmedQId === question.id;
          const armedElsewhere =
            quizState.secondChanceArmedQId !== null && !armedHere;
          if (armedHere) visible = false;
          if (armedElsewhere) {
            disabled = true;
            // Use 1-based question index for the tooltip readout.
            const armedIndex =
              quizState.questions.findIndex((q) => q.id === quizState.secondChanceArmedQId);
            tooltip =
              armedIndex >= 0
                ? isAr
                  ? `مُجهّز على سؤال ${armedIndex + 1}`
                  : `Already armed on Q${armedIndex + 1}`
                : isAr
                  ? 'مُجهّز على سؤال آخر'
                  : 'Already armed on another question';
          }
          break;
        }
        case 'eraser': {
          if (userState.hearts >= userState.maxHearts) visible = false;
          break;
        }
        case 'skip':
        case 'auto_complete':
          break;
      }

      map.set(slug, { visible, disabled, tooltip });
    }

    return map;
  }, [
    getOwned,
    question.id,
    question.type,
    question.options,
    quizState.hiddenOptionIndices,
    quizState.hintRevealedNoPenalty,
    quizState.secondChanceArmedQId,
    quizState.questions,
    userState.hearts,
    userState.maxHearts,
    isAr,
  ]);

  /** Pick 2 random WRONG-option indices for 50/50.
   *  Uses cryptographic RNG to align with the same RNG-quality bar Lucky Dice
   *  uses (consistency over performance — answers are not hot-loop). */
  const pickFiftyFiftyHidden = useCallback((): number[] => {
    if (!question.options) return [];
    // correctAnswer is a string match against the option text.
    const correctIdx = question.options.findIndex(
      (opt) => opt === question.correctAnswer
    );
    const wrongIdxs = question.options
      .map((_, i) => i)
      .filter((i) => i !== correctIdx);

    const arr = wrongIdxs.slice();
    // Fisher-Yates with crypto RNG (Web Crypto preferred; Math.random fallback for SSR).
    const cryptoRef =
      typeof window !== 'undefined' && window.crypto?.getRandomValues
        ? window.crypto
        : null;
    const u32 = new Uint32Array(1);
    for (let i = arr.length - 1; i > 0; i--) {
      let r: number;
      if (cryptoRef) {
        cryptoRef.getRandomValues(u32);
        r = u32[0] / 0x100000000;
      } else {
        r = Math.random();
      }
      const j = Math.floor(r * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 2);
  }, [question.options, question.correctAnswer]);

  /**
   * Confirm-handler — enqueues a cinematic cast for the chosen slug.
   *
   * The cast queue head is picked up by `<PowerupCastOverlay />`, which
   * mounts the matching effect component (Annihilate, Illuminate, Warp,
   * HeartLock, EraserSweep, RobotCursor). Each effect runs a pre/cast/post
   * animation phase chain and, in `post`, dispatches the actual reducer
   * mutations (CONSUME_POWERUP + the slug-specific QuizSession action) and
   * the synthetic answer (Skip / Auto-Complete only).
   *
   * The bar itself does NOT touch state beyond enqueuing the cast — keeps
   * visual + state in lockstep when the effect commits in its post phase.
   */
  const handleConfirm = useCallback(() => {
    if (!confirmSlug) return;
    const slug = confirmSlug;
    setConfirmSlug(null);

    if (slug === 'fifty_fifty') {
      // Pre-compute the 2 wrong indices NOW so the cast can shatter the right
      // tiles. Excludes the correct option via the correctAnswer string match.
      const hidden = pickFiftyFiftyHidden();
      quizDispatch({
        type: 'ENQUEUE_CAST',
        payload: { entry: { slug, questionId: question.id, hiddenIndices: hidden } },
      });
      return;
    }

    quizDispatch({
      type: 'ENQUEUE_CAST',
      payload: { entry: { slug, questionId: question.id } },
    });
  }, [confirmSlug, pickFiftyFiftyHidden, quizDispatch, question.id]);

  // Stagger reveal of the dock children.
  const containerVariants = {
    hidden: {},
    visible: {
      transition: reduce ? { staggerChildren: 0 } : { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: reduce ? MOTION_FALLBACK : SQ_SPRING.snappy },
  };

  // Compute warning copy for skip/auto_complete confirm.
  const warningForSlug = (slug: PowerupSlug | null): string | undefined => {
    if (slug === 'skip' || slug === 'auto_complete') {
      return t('powerups.toast.no_perfect_bonus');
    }
    return undefined;
  };

  // Hide the entire dock if no slugs are visible (clean UI, avoids empty pill).
  const anyVisible = HUD_SLUGS.some((s) => visibility.get(s)?.visible);
  if (!anyVisible) {
    return (
      <PowerupConfirmDialog
        open={!!confirmSlug}
        slug={confirmSlug}
        warning={warningForSlug(confirmSlug)}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmSlug(null)}
      />
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className="w-full max-w-3xl mx-auto mb-3 z-30"
      >
        <div
          className="
            inline-flex items-center gap-2 px-3 py-2 rounded-full
            bg-white/70 backdrop-blur-md border border-white/80
            shadow-lg shadow-slate-200/50 mx-auto
            max-w-full overflow-x-auto no-scrollbar
          "
        >
          {HUD_SLUGS.map((slug) => {
            const v = visibility.get(slug);
            if (!v?.visible) return null;
            const entry = POWERUP_CATALOG[slug];
            const owned = getOwned(slug);
            const v2 = isV2(slug);

            return (
              <motion.button
                key={slug}
                variants={itemVariants}
                type="button"
                disabled={v.disabled}
                onClick={() => !v.disabled && setConfirmSlug(slug)}
                whileTap={v.disabled || reduce ? undefined : { scale: 0.94 }}
                title={v.tooltip}
                aria-label={`${t(`powerups.name.${slug}`)} — ×${owned}`}
                className={[
                  'relative shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
                  'border border-white/70 transition-all',
                  v.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:scale-[1.04] cursor-pointer',
                  GROUP_GRADIENT[entry.group],
                  GROUP_SHADOW[entry.group],
                ].join(' ')}
              >
                <PowerupIcon slug={slug} size={20} className="text-white" strokeWidth={2.25} />

                {/* Owned-count micro chip */}
                <span
                  className={[
                    'absolute -bottom-1',
                    isAr ? '-left-1' : '-right-1',
                    'min-w-[1.1rem] h-[1.1rem] px-1 rounded-full',
                    'bg-white text-slate-700 text-[10px] font-black',
                    'border border-slate-200 shadow flex items-center justify-center tabular-nums',
                  ].join(' ')}
                >
                  {owned}
                </span>

                {/* v2 "Coming soon" corner pill */}
                {v2 && (
                  <span
                    className={[
                      'absolute -top-2',
                      isAr ? '-right-2' : '-left-2',
                      'pointer-events-none',
                    ].join(' ')}
                  >
                    <SqPill variant="warning" className="!px-1.5 !py-0.5 !text-[9px]">
                      {t('powerups.shop.coming_soon')}
                    </SqPill>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <PowerupConfirmDialog
        open={!!confirmSlug}
        slug={confirmSlug}
        warning={warningForSlug(confirmSlug)}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmSlug(null)}
      />
    </>
  );
};

export default InQuestionPowerupBar;
