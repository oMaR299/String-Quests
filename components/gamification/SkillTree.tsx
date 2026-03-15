import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PathNode, NodeStatus } from './PathNode';
import { LEARNING_PATH, ALL_PATH_NODES, getStars } from '../../data/learningPath';
import { QUESTIONS } from '../../constants';
import { useUser } from '../../contexts/UserContext';
import { subjectToSlug, lessonToSlug } from '../../utils/slugify';
import { useI18n } from '../../contexts/I18nContext';

interface NodeInfo {
  status: NodeStatus;
  stars: 0 | 1 | 2 | 3;
  scorePercent: number;
  questionCount: number;
  completionPercent: number;
}

// Compute node status from user progress
function computeNodeStatus(
  nodeId: string,
  prerequisiteIds: string[],
  subject: string,
  lesson: string | null,
  globalHistory: Record<number, number>,
  completedNodes: Set<string>,
): NodeInfo {
  // Get questions for this node
  const questions = QUESTIONS.filter(q => {
    if (q.subject !== subject) return false;
    if (lesson && q.lesson !== lesson) return false;
    return true;
  });

  const questionCount = questions.length;

  if (questionCount === 0) {
    return { status: 'locked', stars: 0, scorePercent: 0, questionCount: 0, completionPercent: 0 };
  }

  // Check if all prerequisites are completed
  const prereqsMet = prerequisiteIds.every(pid => completedNodes.has(pid));

  // Calculate score
  const totalMaxPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const totalEarned = questions.reduce((sum, q) => sum + (globalHistory[q.id] || 0), 0);
  const attempted = questions.some(q => globalHistory[q.id] !== undefined);
  const scorePercent = totalMaxPoints > 0 ? (totalEarned / totalMaxPoints) * 100 : 0;
  const stars = getStars(scorePercent);

  // Completion percentage: how many questions have been answered (any score)
  const answeredCount = questions.filter(q => globalHistory[q.id] !== undefined).length;
  const completionPercent = questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 0;

  if (attempted && stars >= 1) {
    if (stars === 3) return { status: 'perfect', stars, scorePercent, questionCount, completionPercent };
    return { status: 'completed', stars, scorePercent, questionCount, completionPercent };
  }

  if (!prereqsMet) return { status: 'locked', stars: 0, scorePercent: 0, questionCount, completionPercent: 0 };

  // Available or partially attempted
  return { status: 'available', stars: 0, scorePercent: 0, questionCount, completionPercent };
}

// Connector color based on node statuses
function getConnectorColor(prevStatus: NodeStatus): { stroke: string; width: number; dash: string } {
  switch (prevStatus) {
    case 'perfect':
      return { stroke: '#FFC800', width: 4, dash: 'none' };   // gold
    case 'completed':
      return { stroke: '#58CC02', width: 4, dash: 'none' };   // green
    default:
      return { stroke: '#e2e8f0', width: 3, dash: '8 6' };    // gray dashed
  }
}

// SVG connector between two nodes
const PathConnector: React.FC<{
  fromPos: 'left' | 'center' | 'right';
  toPos: 'left' | 'center' | 'right';
  prevStatus: NodeStatus;
}> = ({ fromPos, toPos, prevStatus }) => {
  const offsetMap = { left: -64, center: 0, right: 64 };
  const x1 = 160 + offsetMap[fromPos];
  const x2 = 160 + offsetMap[toPos];
  const y1 = 0;
  const y2 = 40;

  // Curve control points
  const cy1 = y1 + 15;
  const cy2 = y2 - 15;

  const { stroke, width, dash } = getConnectorColor(prevStatus);

  return (
    <svg width="320" height="40" className="mx-auto block" style={{ overflow: 'visible' }}>
      <path
        d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
};

// Section header banner
const SectionBanner: React.FC<{
  titleAr: string;
  titleEn: string;
  emoji: string;
  locale: string;
}> = ({ titleAr, titleEn, emoji, locale }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-center gap-3 py-4 my-2"
  >
    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-slate-200" />
    <div className="bg-white/80 backdrop-blur-sm px-5 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      <span className="font-black text-slate-700 text-sm">
        {locale === 'ar' ? titleAr : titleEn}
      </span>
    </div>
    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-slate-200" />
  </motion.div>
);

export const SkillTree: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useUser();
  const { locale } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  // Pre-compute which nodes are completed
  const { nodeStatuses, currentNodeId } = useMemo(() => {
    const completedNodes = new Set<string>();
    const statuses: Record<string, NodeInfo> = {};

    // First pass: identify completed nodes
    for (const node of ALL_PATH_NODES) {
      const questions = QUESTIONS.filter(q => {
        if (q.subject !== node.subject) return false;
        if (node.lesson && q.lesson !== node.lesson) return false;
        return true;
      });
      const totalMax = questions.reduce((sum, q) => sum + q.points, 0);
      const totalEarned = questions.reduce((sum, q) => sum + (state.globalHistory[q.id] || 0), 0);
      const attempted = questions.some(q => state.globalHistory[q.id] !== undefined);
      const percent = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
      if (attempted && getStars(percent) >= 1) {
        completedNodes.add(node.id);
      }
    }

    // Second pass: compute full status
    let firstAvailable: string | null = null;
    for (const node of ALL_PATH_NODES) {
      const result = computeNodeStatus(
        node.id, node.prerequisiteIds, node.subject, node.lesson,
        state.globalHistory, completedNodes,
      );
      statuses[node.id] = result;
      if (!firstAvailable && result.status === 'available') {
        firstAvailable = node.id;
      }
    }

    // Mark the first available node as 'current'
    if (firstAvailable) {
      statuses[firstAvailable] = { ...statuses[firstAvailable], status: 'current' };
    }

    return { nodeStatuses: statuses, currentNodeId: firstAvailable };
  }, [state.globalHistory]);

  // Auto-scroll to current node
  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentNodeId]);

  const handleNodeClick = (nodeId: string) => {
    const node = ALL_PATH_NODES.find(n => n.id === nodeId);
    if (!node) return;

    const subjectSlug = subjectToSlug(node.subject);
    if (node.lesson) {
      const lessonSlg = lessonToSlug(node.lesson);
      navigate(`/learn/${subjectSlug}/${lessonSlg}/play`);
    } else {
      navigate(`/learn/${subjectSlug}/all/play`);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="w-full max-w-md mx-auto px-4 py-8"
    >
      {LEARNING_PATH.map((section, sIdx) => (
        <div key={section.id}>
          <SectionBanner
            titleAr={section.titleAr}
            titleEn={section.titleEn}
            emoji={section.emoji}
            locale={locale}
          />

          {section.nodes.map((node, nIdx) => {
            const nodeStatus = nodeStatuses[node.id] || {
              status: 'locked' as NodeStatus,
              stars: 0 as const,
              scorePercent: 0,
              questionCount: 0,
              completionPercent: 0,
            };
            const isCurrent = node.id === currentNodeId;

            // Show connector before each node (except first in first section)
            const showConnector = !(sIdx === 0 && nIdx === 0);
            let prevNode = nIdx > 0 ? section.nodes[nIdx - 1] : null;
            if (!prevNode && sIdx > 0) {
              const prevSection = LEARNING_PATH[sIdx - 1];
              prevNode = prevSection.nodes[prevSection.nodes.length - 1];
            }

            const prevStatus = prevNode
              ? (nodeStatuses[prevNode.id]?.status || 'locked')
              : 'locked';

            return (
              <div key={node.id}>
                {showConnector && prevNode && (
                  <PathConnector
                    fromPos={prevNode.position}
                    toPos={node.position}
                    prevStatus={prevStatus}
                  />
                )}
                <div ref={isCurrent ? currentNodeRef : undefined} className="flex justify-center">
                  <PathNode
                    id={node.id}
                    titleAr={node.titleAr}
                    titleEn={node.titleEn}
                    icon={node.icon}
                    color={node.color}
                    bg={node.bg}
                    status={nodeStatus.status}
                    stars={nodeStatus.stars}
                    position={node.position}
                    questionCount={nodeStatus.questionCount}
                    completionPercent={nodeStatus.completionPercent}
                    onClick={() => handleNodeClick(node.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* End trophy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center mt-8 mb-16"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/20">
          <span className="text-2xl">🏆</span>
        </div>
        <span className="text-sm font-bold text-slate-400 mt-2">
          {locale === 'ar' ? 'أكمل جميع التحديات!' : 'Complete all challenges!'}
        </span>
      </motion.div>
    </div>
  );
};
