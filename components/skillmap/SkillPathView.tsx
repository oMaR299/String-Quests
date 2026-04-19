/**
 * SkillPathView - Student-facing skill path (Duolingo-style)
 *
 * A winding vertical path through skill nodes. Each node represents a KC
 * colored by mastery level. The path branches at key points.
 * ZPD frontier items pulse to indicate "learn next."
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillModel } from '../../contexts/SkillModelContext';
import { useI18n } from '../../contexts/I18nContext';
import { useZPDFrontier } from '../../hooks/useZPDFrontier';
import { useReviewQueue } from '../../hooks/useReviewQueue';
import { classifyMastery, getMasteryScore } from '../../models/masteryClassifier';
import type { MasteryLevel, KCState } from '../../models/types';
import { MASTERY_COLORS } from '../../models/types';
import { KC_MAP } from '../../data/sampleTextbook';
import { topologicalSort, getDirectPrerequisites } from '../../data/prerequisiteGraph';
import { SkillPathNode } from './SkillPathNode';
import { MasteryRing } from './MasteryRing';
import { RotateCcw, Zap, ChevronLeft, BookOpen, TrendingUp } from 'lucide-react';

interface PathNodeData {
  kcId: string;
  nameEn: string;
  nameAr: string;
  score: number;
  level: MasteryLevel;
  isInZPD: boolean;
  position: { x: number; y: number };
}

const PATH_WIDTH = 360;
const NODE_SPACING_Y = 100;
const AMPLITUDE = 80; // Horizontal wave amplitude

export const SkillPathView: React.FC = () => {
  const { model } = useSkillModel();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const zpdItems = useZPDFrontier();
  const reviewQueue = useReviewQueue();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const zpdSet = useMemo(() => new Set(zpdItems.map(z => z.kcId)), [zpdItems]);

  // Get topologically sorted KCs (learning order)
  const sortedKCIds = useMemo(() => {
    const all = topologicalSort();
    // Limit to first 60 for performance
    return all.slice(0, 60);
  }, []);

  // Compute node positions (winding path)
  const pathNodes = useMemo((): PathNodeData[] => {
    const centerX = PATH_WIDTH / 2;

    return sortedKCIds.map((kcId, index) => {
      const kc = KC_MAP[kcId];
      if (!kc) return null;

      const state = model.kcs[kcId];
      const score = state ? getMasteryScore(state, now) : 0;
      const level = state ? classifyMastery(state, now) : 'not-started';

      // Sinusoidal path: x oscillates, y increases linearly
      const x = centerX + Math.sin(index * 0.8) * AMPLITUDE;
      const y = 80 + index * NODE_SPACING_Y;

      return {
        kcId,
        nameEn: kc.nameEn,
        nameAr: kc.nameAr,
        score,
        level,
        isInZPD: zpdSet.has(kcId),
        position: { x, y },
      };
    }).filter((n): n is PathNodeData => n !== null);
  }, [sortedKCIds, model.kcs, now, zpdSet]);

  // SVG path connector between nodes
  const pathD = useMemo(() => {
    if (pathNodes.length < 2) return '';
    let d = `M ${pathNodes[0].position.x} ${pathNodes[0].position.y}`;
    for (let i = 1; i < pathNodes.length; i++) {
      const prev = pathNodes[i - 1].position;
      const curr = pathNodes[i].position;
      const cpY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [pathNodes]);

  const totalHeight = pathNodes.length > 0
    ? pathNodes[pathNodes.length - 1].position.y + 120
    : 400;

  // Find the "current" position (first ZPD item or first not-mastered)
  const currentIndex = useMemo(() => {
    const zpdIdx = pathNodes.findIndex(n => n.isInZPD);
    if (zpdIdx >= 0) return zpdIdx;
    return pathNodes.findIndex(n => n.level !== 'mastered') || 0;
  }, [pathNodes]);

  const selectedData = selectedNode ? pathNodes.find(n => n.kcId === selectedNode) : null;
  const selectedState = selectedNode ? model.kcs[selectedNode] : null;

  return (
    <div className="relative">
      {/* Header widgets */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
        {/* Review Queue */}
        {reviewQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-700">
                {isAr ? 'مراجعة اليوم' : 'Review Today'}
              </p>
              <p className="text-lg font-black text-amber-800">{reviewQueue.length}</p>
            </div>
          </motion.div>
        )}

        {/* ZPD Recommendations */}
        {zpdItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-blue-700">
                {isAr ? 'جاهز للتعلم' : 'Ready to Learn'}
              </p>
              <p className="text-lg font-black text-blue-800">{zpdItems.length}</p>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs font-bold text-emerald-700">
              {isAr ? 'التقدم' : 'Progress'}
            </p>
            <p className="text-lg font-black text-emerald-800">
              {pathNodes.filter(n => n.level === 'mastered' || n.level === 'proficient').length}/{pathNodes.length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Path */}
      <div className="overflow-y-auto overflow-x-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60"
           style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <svg
          width={PATH_WIDTH}
          height={totalHeight}
          viewBox={`0 0 ${PATH_WIDTH} ${totalHeight}`}
          className="mx-auto"
        >
          {/* Path connector line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={4}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Completed portion of path */}
          {currentIndex > 0 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${(currentIndex / Math.max(pathNodes.length - 1, 1)) * 100}% 100%`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          )}

          {/* Nodes */}
          {pathNodes.map(node => (
            <SkillPathNode
              key={node.kcId}
              kcId={node.kcId}
              nameEn={node.nameEn}
              nameAr={node.nameAr}
              score={node.score}
              level={node.level}
              isSelected={node.kcId === selectedNode}
              isInZPD={node.isInZPD}
              position={node.position}
              onClick={() => setSelectedNode(node.kcId === selectedNode ? null : node.kcId)}
              locale={locale}
            />
          ))}
        </svg>
      </div>

      {/* Detail panel (bottom sheet on mobile) */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-slate-200 p-6 z-50 max-h-[50vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-start gap-4">
              <MasteryRing score={selectedData.score} level={selectedData.level} size={64} strokeWidth={5} />
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">
                  {isAr ? selectedData.nameAr : selectedData.nameEn}
                </h3>
                <p className="text-sm text-slate-500 capitalize mt-0.5">
                  {selectedData.level.replace('-', ' ')}
                </p>

                {selectedState && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MiniStat label={isAr ? 'نجاح' : 'Pass'} value={`${selectedState.successCount}`} />
                    <MiniStat label={isAr ? 'فشل' : 'Fail'} value={`${selectedState.failureCount}`} />
                    <MiniStat label={isAr ? 'بلوم' : 'Bloom'} value={`${selectedState.bloomLevelReached}/6`} />
                  </div>
                )}

                {selectedData.isInZPD && (
                  <div className="mt-3 flex items-center gap-2 text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isAr ? 'جاهز للتعلم!' : 'Ready to learn!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);
