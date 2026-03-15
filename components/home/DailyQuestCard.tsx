import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Play } from 'lucide-react';
import {
  Calculator, Languages, Globe, Layers, Brain, Cat, Map, Dna,
  Landmark, Atom, FlaskConical, Moon, BookOpen, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell, Sparkles,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useI18n } from '../../contexts/I18nContext';
import { getNextRecommendedNode } from '../../utils/progressHelpers';
import { subjectToSlug, lessonToSlug } from '../../utils/slugify';

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

export const DailyQuestCard: React.FC = () => {
  const { state } = useUser();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const nextNode = useMemo(
    () => getNextRecommendedNode(state.globalHistory, state.completedLessons),
    [state.globalHistory, state.completedLessons]
  );

  // All quests completed
  if (!nextNode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-gradient-to-br from-[#FFC800]/10 to-amber-50 rounded-2xl p-5 border border-[#FFC800]/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFC800]/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#FFC800]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">{t('home.all_completed')}</h3>
            <p className="text-xs text-slate-400">{t('home.review_weakest')}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleClick = () => {
    if (nextNode.lesson) {
      navigate(`/learn/${subjectToSlug(nextNode.subject)}/${lessonToSlug(nextNode.lesson)}/play`);
    } else {
      navigate(`/learn/${subjectToSlug(nextNode.subject)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
      onClick={handleClick}
      className="bg-gradient-to-br from-[#1CB0F6]/10 to-blue-50 rounded-2xl p-5 border border-[#1CB0F6]/20 cursor-pointer hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-[#1CB0F6] fill-[#1CB0F6]" />
        <span className="text-xs font-bold text-[#1CB0F6] uppercase tracking-wide">
          {t('home.next_quest')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${nextNode.bg} rounded-xl flex items-center justify-center shrink-0`}>
          {getIcon(nextNode.icon, `w-5 h-5 ${nextNode.color}`)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800">
            {locale === 'ar' ? nextNode.titleAr : nextNode.titleEn}
          </h3>
          <p className="text-xs text-slate-400">
            {locale === 'ar' ? nextNode.subject : nextNode.titleEn}
          </p>
        </div>
        <div className="w-8 h-8 bg-[#1CB0F6] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
    </motion.div>
  );
};
