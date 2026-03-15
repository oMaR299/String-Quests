import React, { useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, ChevronRight, Lock, Check, Crown, Play, Star } from 'lucide-react';
import {
  Calculator, Languages, Globe, Layers, Brain, Cat, Map, Dna,
  Landmark, Atom, FlaskConical, Moon, BookOpen, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell, Sparkles,
} from 'lucide-react';
import { PinkDiamondIcon } from './ui/PinkDiamondIcon';
import { TOPIC_META, QUESTIONS } from '../constants';
import { useUser } from '../contexts/UserContext';
import { useI18n } from '../contexts/I18nContext';
import { slugToSubject, lessonToSlug } from '../utils/slugify';
import { getStars } from '../data/learningPath';
import { getUnitsForSubject } from '../data/subjectUnits';
import { computeUnitProgress, type UnitProgress } from '../utils/progressHelpers';
import type { Question } from '../types';

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

// Node status types
type NodeStatus = 'locked' | 'available' | 'current' | 'completed' | 'perfect';

const statusConfig: Record<NodeStatus, { ring: string; iconColor: string; shadow: string; label: string }> = {
  locked: {
    ring: 'border-slate-300 bg-slate-100',
    iconColor: 'text-slate-400',
    shadow: '',
    label: 'bg-slate-200 text-slate-400',
  },
  available: {
    ring: 'border-slate-300 bg-white',
    iconColor: '',
    shadow: 'shadow-lg',
    label: 'bg-white text-slate-600',
  },
  current: {
    ring: 'border-[#58CC02] bg-white',
    iconColor: '',
    shadow: 'shadow-xl shadow-green-500/20',
    label: 'bg-[#58CC02] text-white',
  },
  completed: {
    ring: 'border-[#FFC800] bg-white',
    iconColor: '',
    shadow: 'shadow-lg shadow-yellow-500/10',
    label: 'bg-[#FFC800] text-yellow-900',
  },
  perfect: {
    ring: 'border-[#FFC800] bg-gradient-to-br from-yellow-50 to-amber-50',
    iconColor: '',
    shadow: 'shadow-xl shadow-yellow-500/20',
    label: 'bg-[#FFC800] text-yellow-900',
  },
};

// Zigzag positions cycle
const positions: Array<'left' | 'center' | 'right'> = ['center', 'right', 'center', 'left'];

// SVG connector between two nodes
const PathConnector: React.FC<{
  fromPos: 'left' | 'center' | 'right';
  toPos: 'left' | 'center' | 'right';
  completed: boolean;
}> = ({ fromPos, toPos, completed }) => {
  const offsetMap = { left: -64, center: 0, right: 64 };
  const x1 = 160 + offsetMap[fromPos];
  const x2 = 160 + offsetMap[toPos];
  const y1 = 0;
  const y2 = 40;
  const cy1 = y1 + 15;
  const cy2 = y2 - 15;

  return (
    <svg width="320" height="40" className="mx-auto block" style={{ overflow: 'visible' }}>
      <path
        d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
        fill="none"
        stroke={completed ? '#58CC02' : '#e2e8f0'}
        strokeWidth={completed ? 4 : 3}
        strokeDasharray={completed ? 'none' : '8 6'}
        strokeLinecap="round"
      />
    </svg>
  );
};

// Unit section banner with rich stats
const UnitBanner: React.FC<{
  nameAr: string;
  nameEn: string;
  emoji: string;
  locale: string;
  progress: UnitProgress;
  gradient: string;
}> = ({ nameAr, nameEn, emoji, locale, progress, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="my-5"
  >
    {/* Decorative lines */}
    <div className="flex items-center justify-center gap-3 mb-2">
      <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-slate-200" />
      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-slate-200" />
    </div>

    {/* Card */}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mx-auto max-w-[280px]">
      {/* Header: emoji + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
          <span className="text-xl">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-700 text-sm truncate">
            {locale === 'ar' ? nameAr : nameEn}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {locale === 'ar' ? nameEn : nameAr}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-slate-50 rounded-lg px-2 py-1.5 flex flex-col items-center border border-slate-100">
          <div className="flex items-center gap-1 mb-0.5">
            <PinkDiamondIcon className="w-2.5 h-2.5" />
            <span className="text-[8px] font-bold text-slate-400 uppercase">XP</span>
          </div>
          <span className="text-[11px] font-black text-slate-600">{progress.earnedPoints}/{progress.maxPoints}</span>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg px-2 py-1.5 flex flex-col items-center border border-slate-100">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCircle className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase">{locale === 'ar' ? 'تقدم' : 'Done'}</span>
          </div>
          <span className="text-[11px] font-black text-slate-600">{progress.answeredQuestions}/{progress.totalQuestions}</span>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg px-2 py-1.5 flex flex-col items-center border border-slate-100">
          <div className="flex items-center gap-1 mb-0.5">
            <Star className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[8px] font-bold text-slate-400 uppercase">{locale === 'ar' ? 'دقة' : 'Acc'}</span>
          </div>
          <span className="text-[11px] font-black text-slate-600">{progress.accuracyPercent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-bold text-slate-400">
            {locale === 'ar' ? 'الإنجاز' : 'Progress'}
          </span>
          <span className="text-[9px] font-black text-slate-500">{progress.progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// Star display
const StarDisplay: React.FC<{ stars: 0 | 1 | 2 | 3 }> = ({ stars }) => {
  if (stars === 0) return null;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= stars ? 'text-[#FFC800] fill-[#FFC800]' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

interface LessonNodeData {
  lesson: string;
  questions: Question[];
  totalQ: number;
  playedQ: number;
  score: number;
  maxPoints: number;
  scorePercent: number;
  stars: 0 | 1 | 2 | 3;
  status: NodeStatus;
  position: 'left' | 'center' | 'right';
}

const TopicDetailsScreen: React.FC = () => {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const navigate = useNavigate();
  const { state } = useUser();
  const { locale, dir } = useI18n();
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const topic = subjectSlug ? slugToSubject(subjectSlug) : '';
  const history = state.globalHistory;
  const questions = useMemo(() => QUESTIONS.filter(q => q.subject === topic), [topic]);

  const handleBack = () => navigate('/home');
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  // Get visual config
  const meta = TOPIC_META[topic] || TOPIC_META['mix'];

  // Get unit hierarchy
  const units = useMemo(() => getUnitsForSubject(topic), [topic]);

  // Build lesson nodes with status, grouped by unit
  const { lessonNodes, currentNodeIndex } = useMemo(() => {
    // Group questions by lesson
    const lessonsMap: Record<string, Question[]> = {};
    questions.forEach(q => {
      if (!lessonsMap[q.lesson]) lessonsMap[q.lesson] = [];
      lessonsMap[q.lesson].push(q);
    });

    // Build ordered lesson list from units, then append any lessons not in units
    const orderedLessons: string[] = [];
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        if (lessonsMap[lesson] && !orderedLessons.includes(lesson)) {
          orderedLessons.push(lesson);
        }
      }
    }
    // Append any remaining lessons not covered by units
    for (const lesson of Object.keys(lessonsMap)) {
      if (!orderedLessons.includes(lesson)) {
        orderedLessons.push(lesson);
      }
    }

    // Compute status for each lesson
    const nodes: LessonNodeData[] = [];
    let firstCurrentIdx = -1;
    let globalIdx = 0;

    for (const lesson of orderedLessons) {
      const lQuestions = lessonsMap[lesson];
      if (!lQuestions) continue;

      const totalQ = lQuestions.length;
      const playedQ = lQuestions.filter(q => history[q.id] !== undefined).length;
      const score = lQuestions.reduce((acc, q) => acc + (history[q.id] || 0), 0);
      const maxPoints = lQuestions.reduce((acc, q) => acc + q.points, 0);
      const scorePercent = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;
      const stars = getStars(scorePercent);
      const attempted = lQuestions.some(q => history[q.id] !== undefined);

      let status: NodeStatus;
      if (attempted && stars >= 1) {
        status = stars === 3 ? 'perfect' : 'completed';
      } else {
        if (globalIdx === 0) {
          status = 'available';
        } else {
          const prevNode = nodes[globalIdx - 1];
          const prevDone = prevNode.status === 'completed' || prevNode.status === 'perfect';
          status = prevDone ? 'available' : 'locked';
        }
      }

      nodes.push({
        lesson,
        questions: lQuestions,
        totalQ,
        playedQ,
        score,
        maxPoints,
        scorePercent,
        stars,
        status,
        position: positions[globalIdx % positions.length],
      });
      globalIdx++;
    }

    // Mark first available as current
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].status === 'available') {
        nodes[i].status = 'current';
        firstCurrentIdx = i;
        break;
      }
    }

    return { lessonNodes: nodes, currentNodeIndex: firstCurrentIdx };
  }, [questions, history, units]);

  // Calculate overall stats
  const totalQuestions = questions.length;
  const playedCount = questions.filter(q => history[q.id] !== undefined).length;
  const totalScore = questions.reduce((acc, q) => acc + (history[q.id] || 0), 0);
  const topicProgress = Math.round((playedCount / totalQuestions) * 100) || 0;

  // Auto-scroll to current node
  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentNodeIndex]);

  const handleNodeClick = (node: LessonNodeData) => {
    if (node.status === 'locked') return;
    navigate(`/learn/${subjectSlug}/${lessonToSlug(node.lesson)}/play`);
  };

  // Build a map: lesson name → unit it belongs to
  const lessonToUnit = useMemo(() => {
    const map: Record<string, typeof units[0]> = {};
    for (const unit of units) {
      for (const lesson of unit.lessons) {
        map[lesson] = unit;
      }
    }
    return map;
  }, [units]);

  // Track which units have been rendered
  const renderedUnits = new Set<string>();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Compact Topic Header */}
      <div className={`bg-gradient-to-r ${meta.gradient} rounded-2xl p-4 mb-6 relative overflow-hidden`}>
        <div className="absolute top-0 end-0 w-[150px] h-[150px] bg-white/10 rounded-full blur-[50px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <button onClick={handleBack} className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-sm shrink-0">
            <BackIcon className="w-5 h-5 text-white" />
          </button>

          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 border border-white/20">
            {getIcon(meta.icon, 'w-6 h-6 text-white drop-shadow-md')}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white truncate">{locale === 'ar' ? topic : meta.nameEn}</h2>
            <p className="text-[11px] text-white/70 font-medium">{locale === 'ar' ? meta.nameEn : topic}</p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="flex items-center gap-1 text-xs font-bold text-white/90">
              <CheckCircle className="w-3.5 h-3.5" /> {playedCount}/{totalQuestions}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-white/90">
              <PinkDiamondIcon className="w-3 h-3" /> {totalScore}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${topicProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>

      {/* Skill Tree with Unit Sections */}
      {lessonNodes.map((node, index) => {
        const config = statusConfig[node.status];
        const isClickable = node.status !== 'locked';
        const isCurrent = index === currentNodeIndex;

        const offsetClass =
          node.position === 'left' ? '-translate-x-16' :
          node.position === 'right' ? 'translate-x-16' : '';

        // Check if we need to show a unit banner before this node
        const unit = lessonToUnit[node.lesson];
        let showUnitBanner = false;
        if (unit && !renderedUnits.has(unit.id)) {
          showUnitBanner = true;
          renderedUnits.add(unit.id);
        }

        // Show connector before each node (except first)
        const showConnector = index > 0 && !showUnitBanner;
        const prevNode = index > 0 ? lessonNodes[index - 1] : null;
        const connectorCompleted = prevNode
          ? (prevNode.status === 'completed' || prevNode.status === 'perfect')
          : false;

        return (
          <div key={node.lesson}>
            {/* Unit Section Banner */}
            {showUnitBanner && unit && (
              <UnitBanner
                nameAr={unit.nameAr}
                nameEn={unit.nameEn}
                emoji={unit.emoji}
                locale={locale}
                progress={computeUnitProgress(unit, topic, history)}
                gradient={meta.gradient}
              />
            )}

            {/* Path Connector */}
            {showConnector && prevNode && (
              <PathConnector
                fromPos={prevNode.position}
                toPos={node.position}
                completed={connectorCompleted}
              />
            )}

            {/* Lesson Node */}
            <div
              ref={isCurrent ? currentNodeRef : undefined}
              className="flex justify-center"
            >
              <motion.div
                className={`flex flex-col items-center ${offsetClass}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: index * 0.05 }}
              >
                {/* Node Circle */}
                <motion.button
                  onClick={isClickable ? () => handleNodeClick(node) : undefined}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.08 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className={`
                    relative w-20 h-20 rounded-full border-[5px] flex items-center justify-center
                    transition-all duration-300
                    ${config.ring} ${config.shadow}
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {/* Locked icon */}
                  {node.status === 'locked' && (
                    <Lock className="w-7 h-7 text-slate-400" />
                  )}

                  {/* Perfect crown */}
                  {node.status === 'perfect' && (
                    <div className="absolute -top-2 -right-1 z-10">
                      <Crown className="w-6 h-6 text-[#FFC800] fill-[#FFC800] drop-shadow" />
                    </div>
                  )}

                  {/* Completion check badge */}
                  {(node.status === 'completed' || node.status === 'perfect') && (
                    <div className="absolute -bottom-1 -right-1 z-10 w-6 h-6 bg-[#58CC02] rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Topic icon */}
                  {node.status !== 'locked' && (
                    getIcon(meta.icon, `w-8 h-8 ${config.iconColor || meta.color}`)
                  )}

                  {/* Current node glow ring */}
                  {node.status === 'current' && (
                    <motion.div
                      className="absolute inset-[-8px] rounded-full border-2 border-[#58CC02]/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>

                {/* Label */}
                <div className={`mt-2 px-3 py-1 rounded-xl text-xs font-bold max-w-[140px] text-center ${config.label}`}>
                  {node.status === 'current' && <Play className="w-3 h-3 inline-block mr-1 fill-current" />}
                  {node.lesson}
                </div>

                {/* Stars */}
                <StarDisplay stars={node.stars} />

                {/* Question count */}
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  {node.playedQ}/{node.totalQ}
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}

      {/* End trophy */}
      {lessonNodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center mt-8 mb-16"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/20">
            <span className="text-2xl">🏆</span>
          </div>
          <span className="text-sm font-bold text-slate-400 mt-2">
            {locale === 'ar' ? 'أكمل جميع الدروس!' : 'Complete all lessons!'}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default TopicDetailsScreen;
