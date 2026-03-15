import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Rocket, Clock } from 'lucide-react';
import {
  Calculator, Languages, Globe, Layers, Brain, Cat, Map, Dna,
  Landmark, Atom, FlaskConical, Moon, BookOpen, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell, Sparkles,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useI18n } from '../../contexts/I18nContext';
import { getLastPlayedInfo } from '../../utils/progressHelpers';

const getIcon = (iconName: string, className: string) => {
  const props = { className };
  switch (iconName) {
    case 'calculator': return <Calculator {...props} />;
    case 'languages': return <Languages {...props} />;
    case 'globe': return <Globe {...props} />;
    case 'layers': return <Layers {...props} />;
    case 'brain': return <Brain {...props} />;
    case 'cat': return <Cat {...props} />;
    case 'map': return <Map {...props} />;
    case 'dna': return <Dna {...props} />;
    case 'landmark': return <Landmark {...props} />;
    case 'atom': return <Atom {...props} />;
    case 'flask': return <FlaskConical {...props} />;
    case 'moon': return <Moon {...props} />;
    case 'book': return <BookOpen {...props} />;
    case 'monitor': return <Monitor {...props} />;
    case 'palette': return <Palette {...props} />;
    case 'activity': return <Activity {...props} />;
    case 'mountain': return <Mountain {...props} />;
    case 'message-circle': return <MessageCircle {...props} />;
    case 'message-square': return <MessageSquare {...props} />;
    case 'coins': return <Coins {...props} />;
    case 'dumbbell': return <Dumbbell {...props} />;
    default: return <Sparkles {...props} />;
  }
};

export const ContinueLearningCard: React.FC = () => {
  const { state } = useUser();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const lastPlayed = useMemo(
    () => getLastPlayedInfo(state.globalHistory, state.completedLessons, locale),
    [state.globalHistory, state.completedLessons, locale]
  );

  // New user - no activity yet
  if (!lastPlayed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={() => navigate('/learn')}
        className="bg-gradient-to-br from-[#58CC02] to-emerald-600 rounded-[2rem] p-6 shadow-xl shadow-green-500/20 cursor-pointer group overflow-hidden relative"
      >
        <div className="absolute top-0 end-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white">{t('home.start_first_quest')}</h3>
            <p className="text-sm text-white/80 font-medium">{t('home.start_first_quest_desc')}</p>
          </div>
          <Play className="w-8 h-8 text-white/80 shrink-0 group-hover:translate-x-[-4px] transition-transform fill-current" />
        </div>
      </motion.div>
    );
  }

  const { subject, lesson, meta, progress, timeAgo, subjectSlug, lessonSlug } = lastPlayed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`bg-gradient-to-br ${meta.gradient} rounded-[2rem] p-5 shadow-xl ${meta.shadow} cursor-pointer group hover:shadow-2xl transition-shadow relative overflow-hidden`}
      onClick={() => navigate(`/learn/${subjectSlug}/${lessonSlug}/play`)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 end-0 w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-[150px] h-[150px] bg-black/5 rounded-full blur-[50px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Play className="w-3.5 h-3.5 text-white/90 fill-white/90" />
          <span className="text-xs font-bold text-white/90 uppercase tracking-wide">
            {t('home.continue_where_left_off')}
          </span>
          <span className="text-xs text-white/60 font-medium ms-auto flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
            {getIcon(meta.icon, 'w-7 h-7 text-white drop-shadow-md')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-white truncate">{lesson}</h3>
            <p className="text-xs text-white/70 font-medium">{subject}</p>
          </div>
          <button className="bg-white text-slate-800 font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all shrink-0 hover:scale-105">
            {t('home.continue_btn')}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-white/70">
              {progress.answeredQuestions}/{progress.totalQuestions} {t('home.questions_answered')}
            </span>
            <span className="text-[10px] font-bold text-white/70">{progress.progressPercent}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
