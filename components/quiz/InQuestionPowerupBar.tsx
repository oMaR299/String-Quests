/**
 * InQuestionPowerupBar — floating dock above the QuizCard exposing the
 * 6 in-question power-ups (Wave C integration).
 *
 * Display order: fifty_fifty, hint_reveal, second_chance, eraser, skip,
 * auto_complete. Per-button visibility/state rules match the spec exactly:
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
 *
 * Tap → PowerupConfirmDialog (cost shown via owned-line). Confirm dispatches
 * the per-slug action(s) below and toasts a brief notice.
 *
 * Skip / Auto-Complete additionally synthesize an answer payload (points=0)
 * via the parent-supplied `onSyntheticAnswer` callback so the existing
 * QuizSessionContext ANSWER reducer drives the question advance.
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
import { SqToast } from '../design-system/components/Toast';
import { PowerupIcon } from '../powerups/PowerupIcon';
import PowerupConfirmDialog from './PowerupConfirmDialog';
import type { Question } from '../../types';

export interface InQuestionPowerupBarProps {
  question: Question;
  /**
   * Synthetic answer dispatcher used by Skip / Auto-Complete. Wave A's
   * SKIP_QUESTION / AUTO_COMPLETE_QUESTION reducer actions only flip the
   * perfect-bonus flag — the actual question advance still rides on the
   * shared ANSWER pipeline so the parent owns scoring + skill-map writes.
   *
   * `is_correct: null` keeps incorrect-counter clean (skipped questions
   * are not "wrong"); `points: 0` forces zero score.
   */
  onSyntheticAnswer: () => void;
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

interface ToastState {
  open: boolean;
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  body?: string;
}

export const InQuestionPowerupBar: React.FC<InQuestionPowerupBarProps> = ({
  question,
  onSyntheticAnswer,
}) => {
  const { t, locale } = useI18n();
  const { state: userState, dispatch: userDispatch } = useUser();
  const { state: quizState, dispatch: quizDispatch } = useQuizSession();
  const { getOwned, isV2, consume } = usePowerups();
  const reduce = useReducedMotion();
  const isAr = locale === 'ar';

  const [confirmSlug, setConfirmSlug] = useState<PowerupSlug | null>(null);
  const [toast, setToast] = useState<ToastState>({ open: false, variant: 'info', title: '' });

  const hideToast = useCallback(() => setToast((s) => ({ ...s, open: false })), []);

  const fireToast = useCallback(
    (variant: ToastState['variant'], title: string, body?: string) => {
      setToast({ open: true, variant, title, body });
    },
    []
  );

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

  /** Confirm-handler — fans out to the right reducer chain per slug. */
  const handleConfirm = useCallback(() => {
    if (!confirmSlug) return;
    const slug = confirmSlug;
    setConfirmSlug(null);

    switch (slug) {
      case 'fifty_fifty': {
        const hidden = pickFiftyFiftyHidden();
        quizDispatch({ type: 'APPLY_5050', payload: { hiddenIndices: hidden } });
        consume('fifty_fifty');
        fireToast('success', t('powerups.name.fifty_fifty'));
        break;
      }
      case 'hint_reveal': {
        quizDispatch({ type: 'REVEAL_HINT_FREE' });
        consume('hint_reveal');
        fireToast('success', t('powerups.name.hint_reveal'));
        break;
      }
      case 'second_chance': {
        quizDispatch({ type: 'ARM_SECOND_CHANCE', payload: { questionId: question.id } });
        consume('second_chance');
        fireToast('success', t('powerups.toast.armed'));
        break;
      }
      case 'eraser': {
        if (userState.hearts < userState.maxHearts) {
          // REGEN_HEART caps at maxHearts, increments by 1 — perfect for Eraser.
          userDispatch({ type: 'REGEN_HEART' });
        }
        consume('eraser');
        fireToast('success', t('powerups.name.eraser'));
        break;
      }
      case 'skip': {
        quizDispatch({ type: 'SKIP_QUESTION' });
        consume('skip');
        fireToast('warning', t('powerups.name.skip'), t('powerups.toast.no_perfect_bonus'));
        onSyntheticAnswer();
        break;
      }
      case 'auto_complete': {
        quizDispatch({ type: 'AUTO_COMPLETE_QUESTION' });
        consume('auto_complete');
        fireToast('warning', t('powerups.name.auto_complete'), t('powerups.toast.no_perfect_bonus'));
        onSyntheticAnswer();
        break;
      }
    }
  }, [
    confirmSlug,
    pickFiftyFiftyHidden,
    quizDispatch,
    consume,
    fireToast,
    t,
    question.id,
    userState.hearts,
    userState.maxHearts,
    userDispatch,
    onSyntheticAnswer,
  ]);

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
          style={{ display: 'flex' }}
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

      <SqToast
        open={toast.open}
        variant={toast.variant}
        title={toast.title}
        body={toast.body}
        onClose={hideToast}
      />
    </>
  );
};

export default InQuestionPowerupBar;
