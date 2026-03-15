import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Layers, Play } from 'lucide-react';
import {
  Calculator, Languages, Globe, Brain, Cat, Map, Dna,
  Landmark, Atom, FlaskConical, Moon, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell, Sparkles,
} from 'lucide-react';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { TOPIC_META, QUESTIONS } from '../../constants';
import { useUser } from '../../contexts/UserContext';
import { useI18n } from '../../contexts/I18nContext';
import { computeSubjectProgress } from '../../utils/progressHelpers';
import { subjectToSlug } from '../../utils/slugify';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

export const TopicGrid: React.FC = () => {
  const { state } = useUser();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const topics = useMemo(() => {
    return Object.entries(TOPIC_META)
      .filter(([key]) => key !== 'mix')
      .map(([subjectAr, meta]) => {
        const progress = computeSubjectProgress(subjectAr, state.globalHistory);
        const questionCount = QUESTIONS.filter(q => q.subject === subjectAr).length;
        const totalPoints = QUESTIONS.filter(q => q.subject === subjectAr).reduce((sum, q) => sum + q.points, 0);
        return { subjectAr, meta, progress, questionCount, totalPoints, slug: subjectToSlug(subjectAr) };
      })
      .filter(t => t.questionCount > 0);
  }, [state.globalHistory]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-black text-slate-700">{t('home.explore_topics')}</h2>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
          {topics.length}
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4"
      >
        {topics.map(({ subjectAr, meta, progress, questionCount, totalPoints, slug }) => {
          const isNew = progress.answeredQuestions === 0;
          const isComplete = progress.progressPercent === 100;

          return (
            <motion.div
              key={subjectAr}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/learn/${slug}`)}
              className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col"
            >
              {/* New badge */}
              {isNew && !isComplete && (
                <span className="absolute top-3 end-3 text-[9px] font-black text-white bg-[#1CB0F6] px-2 py-0.5 rounded-md z-10">
                  {t('home.new_badge')}
                </span>
              )}

              {/* Complete checkmark */}
              {isComplete && (
                <div className="absolute top-3 end-3 z-10 w-6 h-6 bg-[#58CC02] rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Large Gradient Icon Box */}
              <motion.div
                whileHover={{ rotate: 0, scale: 1.1 }}
                className={`w-16 h-16 bg-gradient-to-tr ${meta.gradient} rounded-2xl flex items-center justify-center mb-3 shadow-lg ${meta.shadow} transform rotate-3 transition-transform duration-300`}
              >
                {getIcon(meta.icon, 'text-white w-8 h-8 drop-shadow-md')}
              </motion.div>

              {/* Names */}
              <h3 className="text-base font-black text-slate-800 leading-tight mb-0.5">
                {locale === 'ar' ? subjectAr : meta.nameEn}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">
                {locale === 'ar' ? meta.nameEn : subjectAr}
              </p>

              {/* Description */}
              <p className="text-xs text-slate-500 font-medium leading-snug mb-3 line-clamp-2 min-h-[32px]">
                {locale === 'ar' ? meta.desc : meta.descEn}
              </p>

              {/* Stats Grid (2 columns) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                    <PinkDiamondIcon className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{locale === 'ar' ? 'نقاط' : 'Pts'}</span>
                  </div>
                  <span className="text-base font-black text-slate-700">{totalPoints}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                    <Layers className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{locale === 'ar' ? 'أسئلة' : 'Q\'s'}</span>
                  </div>
                  <span className="text-base font-black text-slate-700">{questionCount}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-slate-400">
                    {locale === 'ar' ? 'الإنجاز' : 'Progress'}
                  </span>
                  <span className="text-[9px] font-black text-slate-500">{progress.progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      isComplete ? 'from-[#58CC02] to-emerald-500' : `${meta.gradient}`
                    }`}
                  />
                </div>
              </div>

              {/* Start Button */}
              <button
                className="w-full mt-auto bg-[#58CC02] hover:bg-[#4CAD00] text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-green-500/20 transition-colors flex items-center justify-center gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/learn/${slug}`);
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isComplete
                  ? (locale === 'ar' ? 'مراجعة' : 'Review')
                  : (locale === 'ar' ? 'ابدأ الآن' : 'Start Now')
                }
              </button>

              {/* Background Decoration */}
              <div className={`absolute -bottom-10 -end-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-tr ${meta.gradient}`} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
