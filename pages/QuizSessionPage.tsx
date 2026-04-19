import React, { useEffect, useMemo, useState, useRef } from 'react';
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

const QuizSessionPage: React.FC = () => {
  const { subjectSlug, lessonSlug } = useParams<{ subjectSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { state: userState, dispatch: userDispatch, level } = useUser();
  const { state: quizState, dispatch: quizDispatch, currentQuestion, maxScore } = useQuizSession();
  const { locale } = useI18n();
  const { recordAttempt } = useSkillModel();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ level: 1, titleAr: '', titleEn: '' });
  const prevLevelRef = useRef(level);

  const subject = subjectSlug ? slugToSubject(subjectSlug) : '';
  const lesson = lessonSlug && lessonSlug !== 'all' ? slugToLesson(lessonSlug) : null;

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

  const handleAnswer = (pointsAwarded: number) => {
    if (!currentQuestion) return;

    const isCorrect = pointsAwarded > 0;

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
        points: pointsAwarded,
        maxPoints: currentQuestion.points,
        correct: isCorrect,
      },
    });

    // Lose heart on wrong answer
    if (!isCorrect && quizState.phase !== 'reviewing') {
      userDispatch({ type: 'LOSE_HEART' });
    }

    // Advance quiz
    if (quizState.phase === 'reviewing') {
      quizDispatch({ type: 'REVIEW_ANSWER', payload: { points: pointsAwarded } });
    } else {
      quizDispatch({ type: 'ANSWER', payload: { points: pointsAwarded, questionId: currentQuestion.id } });
    }
  };

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

  // Render hearts
  const renderHearts = () => (
    <div className="flex gap-1">
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
      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUp}
        level={levelUpInfo.level}
        titleAr={levelUpInfo.titleAr}
        titleEn={levelUpInfo.titleEn}
        locale={locale}
        onClose={() => setShowLevelUp(false)}
      />

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

            <QuizCard
              currentIndex={quizState.currentQuestionIndex}
              totalQuestions={quizState.questions.length}
              question={currentQuestion}
              onAnswer={handleAnswer}
            />
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
