
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Target, BookOpen, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { PinkDiamondIcon } from './ui/PinkDiamondIcon';
import { useSounds } from '../hooks/useSounds';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { useQuizSession } from '../contexts/QuizSessionContext';
import { PowerupIcon } from './powerups/PowerupIcon';

interface EndScreenProps {
  score: number;
  maxScore: number;
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, maxScore, onRestart }) => {
  const { playCelebration } = useSounds();
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { state: quizState } = useQuizSession();

  useEffect(() => {
    playCelebration();
  }, [playCelebration]);

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Bilingual title / message — preserves original AR copy as the AR variant
  // and supplies English counterparts for parity (Wave-C bilingual fix).
  let title = '';
  let message = '';
  if (percentage >= 90) {
    title = locale === 'ar' ? 'أداء أسطوري!' : 'Legendary performance!';
    message = locale === 'ar' ? 'أنت موسوعة متحركة، أحسنت صنعاً!' : 'You’re a walking encyclopedia. Outstanding!';
  } else if (percentage >= 70) {
    title = locale === 'ar' ? 'عمل رائع!' : 'Great work!';
    message = locale === 'ar' ? 'معلوماتك ممتازة، استمر في التقدم.' : 'Excellent knowledge — keep it up.';
  } else if (percentage >= 50) {
    title = locale === 'ar' ? 'بداية جيدة!' : 'Good start!';
    message = locale === 'ar' ? 'لديك أساس جيد، حاول مرة أخرى لتحسين النتيجة.' : 'Solid foundation — try again to improve your score.';
  } else {
    title = locale === 'ar' ? 'حاول مرة أخرى' : 'Try again';
    message = locale === 'ar' ? 'لا تيأس، التعلم يأتي من المحاولة!' : 'Don’t give up — learning comes from trying!';
  }

  // Stardust earned this session — derived from final score using the
  // same 1 SD per 10 XP rate UserContext.RECORD_ANSWER applies. Kept as a
  // simple derived calc since UserContext doesn’t expose a per-session
  // tally and the spec calls for an indicative line, not an audit.
  const sdEarnedEstimate = Math.max(0, Math.round(score / 10));

  // Power-ups consumed this artifact — small icon strip.
  const usedPowerups = quizState.powerupsUsedThisArtifact;
  const isPerfect = percentage >= 95 && !quizState.perfectBonusDisqualified;
  const perfectDisabled = percentage >= 95 && quizState.perfectBonusDisqualified;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative z-10 p-4 font-cairo">
      {/* Confetti Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-[-20px] w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              background: ['#60A5FA', '#A78BFA', '#F472B6', '#FBBF24'][i % 4],
            }}
            animate={{
              y: '120vh',
              x: Math.random() * 200 - 100,
              rotate: 360,
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              ease: 'linear',
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12 max-w-md w-full relative z-10 text-center"
      >
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-400/40 border-4 border-white">
            <Trophy className="text-white w-12 h-12" />
          </div>
        </div>

        <div className="mt-10 mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 font-medium">{message}</p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <PinkDiamondIcon className="w-24 h-24" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">
            {t('end.score')}
          </div>
          <div className="flex items-center justify-center gap-1 leading-none relative z-10" dir="ltr">
            <span className="text-6xl font-black text-slate-800">{Math.round(score)}</span>
            <span className="text-2xl font-bold text-slate-400 self-end mb-2">/{maxScore}</span>
          </div>

          {/* Stardust earned line — derived from session score per the
              1 SD per 10 XP rate. */}
          {sdEarnedEstimate > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              +{sdEarnedEstimate} SD
            </div>
          )}
        </div>

        {/* Power-ups used this artifact (Wave C). */}
        {usedPowerups.length > 0 && (
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {locale === 'ar' ? 'الترقيات المُستخدَمة' : 'Power-ups used'}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {usedPowerups.map((slug, i) => (
                <span
                  key={`${slug}-${i}`}
                  title={t(`powerups.name.${slug}`)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700"
                >
                  <PowerupIcon slug={slug} size={16} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
            <Target className="w-6 h-6 text-blue-500 mb-1" />
            <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
            <span className="text-xs text-slate-500 font-bold">
              {t('home.accuracy')}
            </span>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col items-center">
            <PinkDiamondIcon className="w-6 h-6 mb-1" />
            <span className="text-2xl font-bold text-slate-800">+{score * 5}</span>
            <span className="text-xs text-slate-500 font-bold">
              {t('end.xp_earned')}
            </span>
          </div>
        </div>

        {/* Perfect-bonus chip — hidden when disqualified by Skip / Auto-Complete. */}
        {isPerfect && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black shadow-lg shadow-amber-500/30">
            <Trophy className="w-4 h-4" />
            {t('end.perfect')}
          </div>
        )}
        {perfectDisabled && (
          <div
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-400 text-xs font-bold opacity-70"
            title={locale === 'ar' ? 'تم استخدام تخطّي / حل تلقائي' : 'Used a Skip / Auto-Complete'}
          >
            <Trophy className="w-4 h-4" />
            {t('end.perfect')}
          </div>
        )}

        <Button onClick={onRestart} fullWidth size="lg" className="shadow-xl shadow-blue-500/20 mb-3">
          <RotateCcw className="w-5 h-5 ml-2" />
          {locale === 'ar' ? 'إلعب مرة أخرى' : 'Play again'}
        </Button>
        <Button onClick={() => navigate('/learn')} variant="secondary" fullWidth size="lg">
          <BookOpen className="w-5 h-5 ml-2" />
          {locale === 'ar' ? 'العودة إلى التعلم' : 'Back to learning'}
        </Button>
      </motion.div>
    </div>
  );
};

export default EndScreen;
