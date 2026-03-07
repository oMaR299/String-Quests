import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Star } from 'lucide-react';
import { Textbook, UNIT_MAP, LESSON_MAP, PAGE_MAP } from '../../data/sampleTextbook';
import { AttemptRecord } from '../../utils/skillMapStorage';
import { calculatePageMastery, calculateUnitMastery, checkPrerequisites, SkillMastery } from '../../utils/masteryEngine';

interface Props {
  activeTextbook: Textbook;
  attempts: AttemptRecord[];
  locale: string;
  onSelectSkill: (skill: SkillMastery) => void;
}

// Unit banner color palette — one distinct hue per unit
const UNIT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

interface PathNode {
  pageId: string;
  pageName: string;
  pageNumber: number;
  unitId: string;
  unitName: string;
  unitNumber: number;
  unitColor: string;
  mastery: number;
  isLocked: boolean;
  isFirstInUnit: boolean;
}

function getMasteryColor(score: number): string {
  if (score === 0) return '#94a3b8';
  if (score < 40) return '#ef4444';
  if (score < 70) return '#FFC800';
  if (score < 90) return '#58CC02';
  return '#eab308';
}

export const TextbookExplorerView: React.FC<Props> = ({
  activeTextbook,
  attempts,
  locale,
  onSelectSkill,
}) => {
  // Build the flat path of nodes from the textbook hierarchy
  const pathNodes = useMemo(() => {
    const nodes: PathNode[] = [];

    activeTextbook.unitIds.forEach((unitId, uIdx) => {
      const unit = UNIT_MAP[unitId];
      if (!unit) return;

      const unitColor = UNIT_COLORS[uIdx % UNIT_COLORS.length];
      let isFirstInUnit = true;

      unit.lessonIds.forEach((lessonId) => {
        const lesson = LESSON_MAP[lessonId];
        if (!lesson) return;

        lesson.pageIds.forEach((pageId) => {
          const page = PAGE_MAP[pageId];
          if (!page) return;

          const mastery = calculatePageMastery(pageId, attempts);

          // A page is locked if any of its KCs has unmet prerequisites
          // from OUTSIDE this page (cross-page deps only).
          // Internal page dependencies don't lock the page itself.
          const pageKcSet = new Set(page.kcIds);
          const isLocked = page.kcIds.some((kcId) => {
            const unmet = checkPrerequisites(kcId, attempts);
            // Only count unmet prereqs that are NOT on this same page
            return unmet.some((preId) => !pageKcSet.has(preId));
          });

          nodes.push({
            pageId,
            pageName: locale === 'ar' ? page.nameAr : page.nameEn,
            pageNumber: page.pageNumber,
            unitId,
            unitName: locale === 'ar' ? unit.nameAr : unit.nameEn,
            unitNumber: unit.unitNumber,
            unitColor,
            mastery,
            isLocked,
            isFirstInUnit,
          });

          isFirstInUnit = false;
        });
      });
    });

    return nodes;
  }, [activeTextbook, attempts, locale]);

  // Determine the "current" node: first non-locked node with mastery < 90
  const currentIdx = useMemo(() => {
    return pathNodes.findIndex((n) => !n.isLocked && n.mastery < 90);
  }, [pathNodes]);

  return (
    <div className="relative max-w-md mx-auto pb-16">
      {/* Vertical center line */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200"
        aria-hidden="true"
      />

      {/* Path nodes */}
      {pathNodes.map((node, idx) => {
        const sideOffset = Math.sin((idx / 2.5) * Math.PI) * 60;
        const isCurrent = idx === currentIdx;
        const size = isCurrent ? 56 : 48;
        const color = node.isLocked ? '#e2e8f0' : getMasteryColor(node.mastery);

        return (
          <React.Fragment key={node.pageId}>
            {/* Unit header banner */}
            {node.isFirstInUnit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + idx * 0.04, duration: 0.4 }}
                className="relative z-10 flex items-center gap-3 rounded-2xl px-5 py-3 mb-6 mt-4"
                style={{ backgroundColor: node.unitColor }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center text-white font-black text-base shrink-0">
                  {node.unitNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm leading-tight truncate">
                    {node.unitName}
                  </p>
                  <p className="text-white/70 text-[10px] font-semibold">
                    {locale === 'ar' ? 'الوحدة' : 'Unit'} {node.unitNumber}
                    {' \u2022 '}
                    {calculateUnitMastery(node.unitId, attempts)}%
                  </p>
                </div>
              </motion.div>
            )}

            {/* Node */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.04, duration: 0.35 }}
              className="relative z-10 flex flex-col items-center py-3"
              style={{ marginLeft: `calc(50% - ${size / 2}px + ${sideOffset}px)` }}
            >
              {/* Pulsing ring for current node */}
              {isCurrent && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: size + 16,
                    height: size + 16,
                    top: -(8),
                    left: -(8),
                    border: `3px solid ${color}`,
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.15, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Circle button */}
              <button
                onClick={() => {
                  // No-op for now — integration will wire up onSelectSkill
                }}
                disabled={node.isLocked}
                className="relative rounded-full flex items-center justify-center font-black text-white transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  opacity: node.isLocked ? 0.5 : 1,
                  border:
                    !node.isLocked && node.mastery === 0
                      ? '3px dashed #94a3b8'
                      : '3px solid transparent',
                  boxShadow: isCurrent ? `0 0 0 3px ${color}33` : undefined,
                  cursor: node.isLocked ? 'not-allowed' : 'pointer',
                }}
              >
                {node.isLocked ? (
                  <Lock className="w-5 h-5 text-slate-400" />
                ) : node.mastery >= 90 ? (
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                ) : node.mastery > 0 ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm">{node.pageNumber}</span>
                )}
              </button>

              {/* Label below */}
              <p
                className="mt-1.5 text-[11px] font-semibold text-slate-600 max-w-[100px] text-center truncate leading-tight"
                title={node.pageName}
              >
                {node.pageName}
              </p>
              {node.mastery > 0 && !node.isLocked && (
                <span
                  className="text-[10px] font-black"
                  style={{ color }}
                >
                  {node.mastery}%
                </span>
              )}
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* End marker — golden star */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 + pathNodes.length * 0.04, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center pt-6"
        style={{ marginLeft: 'calc(50% - 32px)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #facc15, #f59e0b)',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
          }}
        >
          <Star className="w-8 h-8 text-white fill-white" />
        </div>
        <p className="mt-2 text-xs font-black text-amber-600">
          {locale === 'ar' ? 'النهاية!' : 'Finish!'}
        </p>
      </motion.div>
    </div>
  );
};
