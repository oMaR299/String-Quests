import React, { useEffect, useLayoutEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuizCard from '../components/QuizCard';
import EncouragementScreen from '../components/EncouragementScreen';
import EndScreen from '../components/EndScreen';
import ProgressBar from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LevelUpModal } from '../components/gamification/LevelUpModal';
import { QUESTIONS } from '../constants';
import { useUser } from '../contexts/UserContext';
import { useQuizSession } from '../contexts/QuizSessionContext';
import { useI18n } from '../contexts/I18nContext';
import { slugToSubject, slugToLesson } from '../utils/slugify';
import { getLevelForXP } from '../data/levelThresholds';
import { useSkillModel } from '../contexts/SkillModelContext';
import { Eye, X, Heart, HeartCrack, Gem } from 'lucide-react';
import LoadoutModal, { type LoadoutSelection } from '../components/quiz/LoadoutModal';
import InQuestionPowerupBar from '../components/quiz/InQuestionPowerupBar';
import { SqToast } from '../components/design-system/components/Toast';
import { usePowerups } from '../hooks/usePowerups';
import PowerupCastOverlay from '../components/powerups/effects/PowerupCastOverlay';
import HeartLockBadge from '../components/streak/HeartLockBadge';

const QuizSessionPage: React.FC = () => {
  const { subjectSlug, lessonSlug } = useParams<{ subjectSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { state: userState, dispatch: userDispatch, level } = useUser();
  const { state: quizState, dispatch: quizDispatch, currentQuestion, maxScore } = useQuizSession();
  const { locale, t } = useI18n();
  const { recordAttempt } = useSkillModel();
  const { consume: consumePowerup } = usePowerups();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ level: 1, titleAr: '', titleEn: '' });
  const prevLevelRef = useRef(level);

  // ─── Cinematic power-up cast plumbing (Foundation chunk) ──────────────────
  // QuizCard sets `correctAnswerRef` on the option tile that matches the
  // question's correctAnswer (multi-choice only). After the card mounts we
  // measure the tile and cache its rect so spatial effects (RobotCursor walk)
  // know where to land. Non-multi-choice questions leave the ref null and
  // effects fall back to the viewport center.
  const correctAnswerRef = useRef<HTMLElement | null>(null);
  const [correctAnswerRect, setCorrectAnswerRect] = useState<DOMRect | null>(null);

  // ─── Power-ups (Wave C) ─────────────────────────────────────────────────
  // LoadoutModal opens once per fresh session. Gated by `questionsAnswered`
  // so it can't reopen mid-session.
  const [loadoutOpen, setLoadoutOpen] = useState(true);
  // First-correct flag for XP Doubler — tracked here because the doubler is
  // keyed to "first correct answer of the artifact", not Q1 specifically.
  const firstCorrectAppliedRef = useRef(false);
  // Toast bus for absorbed-events (Freeze, Second Chance, Restart Shield).
  const [absorbToast, setAbsorbToast] = useState<{ open: boolean; title: string; body?: string }>({
    open: false,
    title: '',
  });
  const fireAbsorbToast = useCallback(
    (title: string, body?: string) => setAbsorbToast({ open: true, title, body }),
    []
  );

  const subject = subjectSlug ? slugToSubject(subjectSlug) : '';
  const lesson = lessonSlug && lessonSlug !== 'all' ? slugToLesson(lessonSlug) : null;
  const lessonTitle = lesson || (locale === 'ar' ? 'تحدّي شامل' : 'All Questions');

  // Filter questions for this session
  const sessionQuestions = useMemo(() => {
    let filtered = QUESTIONS.filter(q => q.subject === subject);
    if (lesson) {
      filtered = filtered.filter(q => q.lesson === lesson);
    }
    return filtered;
  }, [subject, lesson]);

  // Start session on mount
  useEffect(() => {
    if (!quizState.active && sessionQuestions.length > 0) {
      quizDispatch({
        type: 'START_SESSION',
        payload: {
          subjectSlug: subjectSlug || '',
          lessonSlug: lessonSlug || null,
          questions: sessionQuestions,
        },
      });
    }
  }, []);

  // Detect level-up
  useEffect(() => {
    if (level > prevLevelRef.current) {
      const info = getLevelForXP(userState.xp);
      setLevelUpInfo({ level: info.level, titleAr: info.titleAr, titleEn: info.titleEn });
      setShowLevelUp(true);
    }
    prevLevelRef.current = level;
  }, [level, userState.xp]);

  // Mark lesson complete when quiz ends
  useEffect(() => {
    if (quizState.phase === 'ended' && subjectSlug && lessonSlug) {
      const lessonKey = `${subjectSlug}::${lessonSlug}`;
      userDispatch({ type: 'COMPLETE_LESSON', payload: lessonKey });

      // Check achievements
      const scorePercent = maxScore > 0 ? (quizState.score / maxScore) * 100 : 0;

      // First lesson
      if (userState.completedLessons.length === 0) {
        userDispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'first-lesson' });
      }
      // Perfect score
      if (scorePercent >= 95) {
        userDispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 'perfect-score' });
      }
    }
  }, [quizState.phase]);

  // Hearts exhaustion - force end
  useEffect(() => {
    if (userState.hearts === 0 && quizState.active && quizState.phase === 'playing') {
      quizDispatch({ type: 'END_SESSION' });
    }
  }, [userState.hearts, quizState.active, quizState.phase]);

  // Measure the correct-answer tile rect after each question mounts and on
  // resize (debounced ~100 ms). Spatial in-question power-up effects walk to
  // this rect's center. Non-multi-choice questions clear the ref in QuizCard,
  // so we set null explicitly to keep the cached value honest. useLayoutEffect
  // runs synchronously after DOM mutation, so the ref is already attached.
  useLayoutEffect(() => {
    if (!currentQuestion) return;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      const node = correctAnswerRef.current;
      setCorrectAnswerRect(node ? node.getBoundingClientRect() : null);
    };

    measure();

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 100);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [currentQuestion?.id]);

  /**
   * Cryptographic Lucky-Dice roll. window.crypto.getRandomValues per spec —
   * the value is purely cosmetic (multiplier picker) but consistency keeps
   * the same RNG bar as the 50/50 picker in the HUD.
   */
  const rollLuckyDice = useCallback((): number => {
    const buckets = [1.5, 2.0, 3.0];
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const u32 = new Uint32Array(1);
      window.crypto.getRandomValues(u32);
      const r = u32[0] / 0x100000000;
      return buckets[Math.floor(r * buckets.length)];
    }
    return buckets[Math.floor(Math.random() * buckets.length)];
  }, []);

  /**
   * Wrong-answer intercept order (Wave C spec):
   *   1. Freeze armed → consume freeze, suppress heart loss + wrong counter.
   *   2. Second Chance armed on this Q → consume, suppress heart loss only.
   *   3. About to hit 0 hearts AND restart_shield in loadout → REGEN_HEART
   *      (we use REGEN_HEART repeatedly to refill since REFILL_HEARTS costs
   *      gems; a small loop is the cleanest way to top up using existing
   *      reducer surface). Suppresses force-end.
   *   4. Else: normal LOSE_HEART.
   *
   * Returns `{ suppressHeart, isSyntheticSkip }` so the caller knows whether
   * to dispatch LOSE_HEART or skip the wrong-counter logic.
   */
  const interceptWrongAnswer = useCallback((): { suppressHeart: boolean } => {
    // 1) Freeze
    if (quizState.freezeArmed) {
      quizDispatch({ type: 'CONSUME_FREEZE' });
      consumePowerup('freeze');
      fireAbsorbToast(t('powerups.toast.absorbed'), t('powerups.name.freeze'));
      return { suppressHeart: true };
    }
    // 2) Second Chance — only the per-Q armed flag.
    if (currentQuestion && quizState.secondChanceArmedQId === currentQuestion.id) {
      quizDispatch({ type: 'CLEAR_SECOND_CHANCE' });
      consumePowerup('second_chance');
      fireAbsorbToast(t('powerups.toast.absorbed'), t('powerups.name.second_chance'));
      return { suppressHeart: true };
    }
    // 3) Restart Shield — only triggers when we'd hit 0 hearts.
    if (userState.hearts <= 1 && quizState.loadout.restart_shield) {
      const missing = userState.maxHearts - Math.max(0, userState.hearts - 1);
      // Dispatch REGEN_HEART per missing slot (caps at maxHearts).
      for (let i = 0; i < missing; i++) {
        userDispatch({ type: 'REGEN_HEART' });
      }
      consumePowerup('restart_shield');
      // Mutate loadout flag so the shield can't fire twice this artifact.
      // (We synthesize an APPLY_LOADOUT with restart_shield flipped off.)
      quizDispatch({
        type: 'APPLY_LOADOUT',
        payload: {
          loadout: { ...quizState.loadout, restart_shield: false },
        },
      });
      fireAbsorbToast(t('powerups.toast.absorbed'), t('powerups.name.restart_shield'));
      return { suppressHeart: true };
    }
    return { suppressHeart: false };
  }, [
    quizState.freezeArmed,
    quizState.secondChanceArmedQId,
    quizState.loadout,
    currentQuestion,
    userState.hearts,
    userState.maxHearts,
    quizDispatch,
    userDispatch,
    consumePowerup,
    fireAbsorbToast,
    t,
  ]);

  const handleAnswer = (pointsAwarded: number) => {
    if (!currentQuestion) return;

    let finalPoints = pointsAwarded;
    const isCorrect = pointsAwarded > 0;

    // ─── XP multipliers (correct answers only) ───────────────────────────
    if (isCorrect && quizState.phase !== 'reviewing') {
      let mult = 1;

      // XP Doubler — first correct of the artifact.
      if (quizState.xpDoublerPending && !firstCorrectAppliedRef.current) {
        mult *= 2;
        firstCorrectAppliedRef.current = true;
        quizDispatch({ type: 'CONSUME_XP_DOUBLER' });
      }

      // Lucky Dice — every correct answer rolls a fresh multiplier.
      if (quizState.loadout.lucky_dice) {
        const roll = rollLuckyDice();
        quizDispatch({ type: 'ROLL_LUCKY_DICE', payload: { multiplier: roll } });
        mult *= roll;
      }

      // Cap product at 6× per spec.
      mult = Math.min(mult, 6);
      finalPoints = Math.round(pointsAwarded * mult);
    }

    // Record in skill model (BKT + FSRS + IRT updates)
    recordAttempt(
      currentQuestion.id,
      isCorrect,
      0, // responseTimeMs - not tracked yet
      lessonSlug ?? '',
      subjectSlug ?? '',
    );

    // Record answer in user state
    userDispatch({
      type: 'RECORD_ANSWER',
      payload: {
        questionId: currentQuestion.id,
        points: finalPoints,
        maxPoints: currentQuestion.points,
        correct: isCorrect,
      },
    });

    // ─── Wrong-answer intercept chain (Wave C) ───────────────────────────
    if (!isCorrect && quizState.phase !== 'reviewing') {
      const { suppressHeart } = interceptWrongAnswer();
      if (!suppressHeart) {
        userDispatch({ type: 'LOSE_HEART' });
      }
    }

    // Advance quiz — the ANSWER reducer also clears per-question 50/50,
    // free-hint, and Second Chance flags.
    if (quizState.phase === 'reviewing') {
      quizDispatch({ type: 'REVIEW_ANSWER', payload: { points: finalPoints } });
    } else {
      quizDispatch({ type: 'ANSWER', payload: { points: finalPoints, questionId: currentQuestion.id } });
    }
  };

  // Note: the previous Wave-C `handleSyntheticAnswer` helper that dispatched
  // a points=0 ANSWER on Skip / Auto-Complete is gone. The cinematic-cast
  // effects (`Warp` for Skip, `RobotCursor` for Auto-Complete) now own that
  // dispatch in their post phase via `useQuizSession()` directly — keeps the
  // visual and the state in lockstep at the exact frame the cast resolves.

  /** Loadout modal start handler — applies the loadout to the session. */
  const handleLoadoutStart = useCallback(
    (loadout: LoadoutSelection) => {
      quizDispatch({ type: 'APPLY_LOADOUT', payload: { loadout } });
      setLoadoutOpen(false);
    },
    [quizDispatch]
  );

  /**
   * Loadout dismiss — closes the modal WITHOUT navigating away. The user
   * can still play the artifact without any bonuses (every loadout flag
   * defaults to false). To explicitly leave the quest the user clicks the
   * in-quiz X header button (handleExit) instead.
   *
   * IMPORTANT: do not navigate from here. handleLoadoutStart used to land
   * here too via LoadoutModal calling onClose() after onStart(); navigating
   * meant pressing Start kicked the user back to /learn before the quiz
   * could render. The modal no longer chains onClose() after onStart, but
   * even if it did, a no-op close keeps Start safe.
   */
  const handleLoadoutClose = useCallback(() => {
    setLoadoutOpen(false);
  }, []);

  const handleRestart = () => {
    quizDispatch({ type: 'RESTART' });
  };

  const handleExit = () => {
    quizDispatch({ type: 'END_SESSION' });
    navigate('/learn');
  };

  // No hearts screen
  if (userState.hearts === 0 && quizState.phase !== 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 max-w-sm w-full text-center mx-4"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartCrack className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {locale === 'ar' ? 'نفدت القلوب!' : 'No Hearts Left!'}
          </h2>
          <p className="text-slate-500 mb-6">
            {locale === 'ar'
              ? 'انتظر حتى تتجدد القلوب أو استخدم الجواهر'
              : 'Wait for hearts to regenerate or use gems'}
          </p>

          {userState.gems >= 350 && (
            <Button
              onClick={() => userDispatch({ type: 'REFILL_HEARTS' })}
              fullWidth
              size="lg"
              className="mb-3"
            >
              <Gem className="w-4 h-4 mr-2" />
              {locale === 'ar' ? `إعادة تعبئة (350 جوهرة)` : `Refill (350 gems)`}
            </Button>
          )}

          <Button onClick={() => navigate('/learn')} variant="secondary" fullWidth>
            {locale === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!quizState.active || sessionQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">
            {locale === 'ar' ? 'لا توجد أسئلة متاحة' : 'No questions available'}
          </p>
          <Button onClick={() => navigate('/learn')}>
            {locale === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  // Render hearts.
  // `data-hearts-row` is read by the EraserSweep cinematic effect to locate
  // the hearts row's bounding rect and target the next-to-restore slot center
  // for its sweep + sparkle + heart-pop. Do not remove without updating
  // EraserSweep.tsx.
  const renderHearts = () => (
    <div className="flex gap-1" data-hearts-row>
      {Array.from({ length: userState.maxHearts }).map((_, i) => (
        <Heart
          key={i}
          className={`w-5 h-5 transition-all ${
            i < userState.hearts
              ? 'text-red-500 fill-red-500'
              : 'text-slate-300 scale-90'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Cairo']">
      {/* Pre-quest LoadoutModal — opens on mount, gated against re-open mid-session. */}
      <LoadoutModal
        open={loadoutOpen && quizState.questionsAnswered === 0}
        onClose={handleLoadoutClose}
        onStart={handleLoadoutStart}
        lessonTitle={lessonTitle}
      />

      {/* Power-up absorb-toast (Freeze / Second Chance / Restart Shield). */}
      <SqToast
        open={absorbToast.open}
        variant="info"
        title={absorbToast.title}
        body={absorbToast.body}
        onClose={() => setAbsorbToast((s) => ({ ...s, open: false }))}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUp}
        level={levelUpInfo.level}
        titleAr={levelUpInfo.titleAr}
        titleEn={levelUpInfo.titleEn}
        locale={locale}
        onClose={() => setShowLevelUp(false)}
      />

      {/* In-question power-up cinematic-cast overlay (z-70). Renders nothing
          when the cast queue is empty; otherwise plays the head-of-queue
          effect and dequeues on completion. Mounted outside AnimatePresence
          so it survives card-swap transitions mid-cast. */}
      <PowerupCastOverlay correctAnswerRect={correctAnswerRect} />

      <AnimatePresence mode="wait">
        {quizState.phase === 'playing' && currentQuestion && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col items-center px-4 py-6"
          >
            {/* Lesson Header */}
            <div className="w-full max-w-3xl mb-8 z-30">
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-2 px-4 flex items-center gap-4 shadow-lg shadow-slate-200/50 border border-white">
                <button onClick={handleExit} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
                <div className="flex-1">
                  <ProgressBar current={quizState.currentQuestionIndex} total={quizState.questions.length} />
                </div>
                {renderHearts()}
              </div>
            </div>

            {/* In-question power-up dock. As of the cinematic-moments
                Foundation chunk, the bar only ENQUEUES casts; the actual
                state mutations (and synthetic answer for Skip / Auto-Complete)
                fire from the cast effects' post phase. */}
            <InQuestionPowerupBar question={currentQuestion} />

            <QuizCard
              currentIndex={quizState.currentQuestionIndex}
              totalQuestions={quizState.questions.length}
              question={currentQuestion}
              onAnswer={handleAnswer}
              correctAnswerRef={correctAnswerRef}
            />

            {/* Persistent "Second Chance armed" indicator. Mounts itself
                only when quizState.secondChanceArmedQId matches the current
                question's id; auto-unmounts when the chance is consumed or
                the user moves on. Position is `fixed` (top-end corner of
                the QuizCard area) — it lives inside the playing block so it
                shares the same AnimatePresence lifecycle. */}
            <HeartLockBadge />
          </motion.div>
        )}

        {quizState.phase === 'break' && (
          <motion.div
            key="break"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex items-center justify-center px-4"
          >
            <EncouragementScreen
              currentCount={quizState.currentQuestionIndex}
              onContinue={() => quizDispatch({ type: 'CONTINUE_BREAK' })}
            />
          </motion.div>
        )}

        {quizState.phase === 'pre-review' && (
          <motion.div
            key="pre-review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex items-center justify-center px-4"
          >
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white max-w-md w-full text-center">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 shadow-inner">
                <Eye className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">
                {locale === 'ar' ? 'فرصة ثانية!' : 'Second Chance!'}
              </h2>
              <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                {locale === 'ar'
                  ? 'لديك بعض الإجابات التي تحتاج إلى مراجعة. هل أنت مستعد لتحسين نتيجتك؟'
                  : 'You have some answers to review. Ready to improve?'}
              </p>
              <Button onClick={() => quizDispatch({ type: 'START_REVIEW' })} size="lg" fullWidth>
                {locale === 'ar' ? 'ابدأ المراجعة' : 'Start Review'}
              </Button>
            </div>
          </motion.div>
        )}

        {quizState.phase === 'reviewing' && currentQuestion && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col items-center px-4 py-6"
          >
            <div className="w-full max-w-3xl mb-8 z-30 flex justify-center">
              <div className="bg-orange-50 border border-orange-100 text-orange-700 px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-orange-500/10 flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                {locale === 'ar'
                  ? `وضع المراجعة المكثفة (${quizState.currentReviewIndex + 1} / ${quizState.incorrectQuestionIds.length})`
                  : `Review Mode (${quizState.currentReviewIndex + 1} / ${quizState.incorrectQuestionIds.length})`}
              </div>
            </div>

            <QuizCard
              currentIndex={quizState.currentReviewIndex}
              totalQuestions={quizState.incorrectQuestionIds.length}
              question={currentQuestion}
              onAnswer={handleAnswer}
              isReviewMode={true}
              scoreMultiplier={0.4}
            />
          </motion.div>
        )}

        {quizState.phase === 'ended' && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex items-center justify-center px-4"
          >
            <EndScreen
              score={quizState.score}
              maxScore={maxScore}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizSessionPage;
