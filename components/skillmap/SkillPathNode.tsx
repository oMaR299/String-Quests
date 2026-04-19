/**
 * SkillPathNode - Individual node on the skill path
 *
 * Represents a single KC with fill level based on P(L),
 * color from mastery level, and state-dependent visual treatment.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { MasteryLevel } from '../../models/types';
import { MASTERY_COLORS } from '../../models/types';
import { Star, Lock, RotateCcw, Zap } from 'lucide-react';

interface SkillPathNodeProps {
  kcId: string;
  nameEn: string;
  nameAr: string;
  score: number;
  level: MasteryLevel;
  isSelected: boolean;
  isInZPD: boolean;
  position: { x: number; y: number };
  onClick: () => void;
  locale: 'ar' | 'en';
}

const NODE_SIZE = 56;
const NODE_RADIUS = NODE_SIZE / 2;

export const SkillPathNode: React.FC<SkillPathNodeProps> = ({
  kcId,
  nameEn,
  nameAr,
  score,
  level,
  isSelected,
  isInZPD,
  position,
  onClick,
  locale,
}) => {
  const color = MASTERY_COLORS[level];
  const isLocked = level === 'not-started' && !isInZPD;
  const isDecaying = level === 'decaying';
  const isMastered = level === 'mastered';
  const fillHeight = (score / 100) * NODE_SIZE;

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Glow effect for ZPD items */}
      {isInZPD && !isLocked && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={NODE_RADIUS + 8}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          opacity={0.4}
          animate={{ r: [NODE_RADIUS + 6, NODE_RADIUS + 12, NODE_RADIUS + 6], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Decay pulse */}
      {isDecaying && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={NODE_RADIUS + 6}
          fill="none"
          stroke={MASTERY_COLORS['decaying']}
          strokeWidth={2}
          opacity={0.5}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={position.x}
          cy={position.y}
          r={NODE_RADIUS + 4}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={3}
        />
      )}

      {/* Background circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={NODE_RADIUS}
        fill={isLocked ? '#F1F5F9' : '#FFFFFF'}
        stroke={isLocked ? '#CBD5E1' : color}
        strokeWidth={isLocked ? 1 : 2.5}
        opacity={isLocked ? 0.5 : 1}
      />

      {/* Fill (liquid fill effect using clipPath) */}
      {!isLocked && score > 0 && (
        <>
          <defs>
            <clipPath id={`fill-${kcId}`}>
              <circle cx={position.x} cy={position.y} r={NODE_RADIUS - 2} />
            </clipPath>
          </defs>
          <motion.rect
            x={position.x - NODE_RADIUS}
            y={position.y + NODE_RADIUS}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill={color}
            opacity={0.25}
            clipPath={`url(#fill-${kcId})`}
            initial={{ y: position.y + NODE_RADIUS }}
            animate={{ y: position.y + NODE_RADIUS - fillHeight }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Icon */}
      <foreignObject
        x={position.x - 12}
        y={position.y - 12}
        width={24}
        height={24}
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center justify-center w-full h-full">
          {isLocked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : isMastered ? (
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          ) : isDecaying ? (
            <RotateCcw className="w-4 h-4" style={{ color: MASTERY_COLORS['decaying'] }} />
          ) : isInZPD ? (
            <Zap className="w-4 h-4 text-blue-500" />
          ) : (
            <span className="text-xs font-bold" style={{ color }}>
              {score > 0 ? `${score}` : ''}
            </span>
          )}
        </div>
      </foreignObject>

      {/* Label (below node) */}
      <foreignObject
        x={position.x - 50}
        y={position.y + NODE_RADIUS + 6}
        width={100}
        height={36}
        style={{ pointerEvents: 'none' }}
      >
        <p className={`text-[10px] text-center font-medium leading-tight line-clamp-2 ${
          isLocked ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {locale === 'ar' ? nameAr : nameEn}
        </p>
      </foreignObject>
    </motion.g>
  );
};
