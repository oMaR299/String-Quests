import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SkillMastery, MASTERY_COLORS, MasteryStatus } from '../../utils/masteryEngine';
import { getCategoryForSubject } from '../../data/skillTaxonomy';

const MASTERY_LABEL_AR: Record<MasteryStatus, string> = {
  unstarted: 'لم يُبدأ',
  attempted: 'جُرِّب',
  developing: 'في التطور',
  proficient: 'متقدم',
  mastered: 'مُتقَن',
};

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onSelectSkill: (mastery: SkillMastery) => void;
}

/** Compute a point on the sine strand at parameter t (0..1 over the full height) */
function strandX(t: number, centerX: number, amplitude: number, phaseOffset: number): number {
  return centerX + Math.sin(t * Math.PI * 2 * 3 + phaseOffset) * amplitude;
}

/**
 * Build a smooth SVG path for a sinusoidal strand using cubic bezier segments.
 * We sample many points and use them as polyline-ish bezier for smoothness.
 */
function buildStrandPath(
  centerX: number,
  amplitude: number,
  phaseOffset: number,
  startY: number,
  endY: number,
  steps: number
): string {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = startY + t * (endY - startY);
    const x = strandX(t, centerX, amplitude, phaseOffset);
    points.push({ x, y });
  }

  // Build path as smooth cubic bezier through these points
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Simple smooth curve: use midpoints as control points
    const cpx1 = prev.x;
    const cpy1 = prev.y + (curr.y - prev.y) * 0.5;
    const cpx2 = curr.x;
    const cpy2 = prev.y + (curr.y - prev.y) * 0.5;
    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }

  return d;
}

export const DnaStrandView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  const PADDING_TOP = 40;
  const PADDING_BOTTOM = 40;
  const RUNG_SPACING = 36;
  const AMPLITUDE = 80;
  const CENTER_X = 200; // center of the 400-wide SVG
  const STRAND_STEPS = 200; // smoothness of the bezier path

  const totalRungs = masteries.length;
  const contentHeight = PADDING_TOP + totalRungs * RUNG_SPACING + PADDING_BOTTOM;
  const W = 400;
  const H = Math.max(400, contentHeight);

  const START_Y = PADDING_TOP;
  const END_Y = H - PADDING_BOTTOM;

  // Build strand paths
  const strandAPath = useMemo(
    () => buildStrandPath(CENTER_X, AMPLITUDE, 0, START_Y, END_Y, STRAND_STEPS),
    [CENTER_X, AMPLITUDE, START_Y, END_Y]
  );
  const strandBPath = useMemo(
    () => buildStrandPath(CENTER_X, AMPLITUDE, Math.PI, START_Y, END_Y, STRAND_STEPS),
    [CENTER_X, AMPLITUDE, START_Y, END_Y]
  );

  // Compute rung data: position on each strand at the rung's Y level
  const rungs = useMemo(() => {
    return masteries.map((mastery, i) => {
      const t = totalRungs <= 1 ? 0.5 : i / (totalRungs - 1);
      const y = START_Y + t * (END_Y - START_Y);
      const xA = strandX(t, CENTER_X, AMPLITUDE, 0);
      const xB = strandX(t, CENTER_X, AMPLITUDE, Math.PI);

      const category = getCategoryForSubject(mastery.skill.subject);
      const rungColor = category?.color ?? '#94a3b8';
      const isUnstarted = mastery.status === 'unstarted';
      const opacity = isUnstarted ? 0.15 : Math.max(0.15, mastery.masteryScore / 100);

      return {
        mastery,
        y,
        xA,
        xB,
        rungColor,
        isUnstarted,
        opacity,
      };
    });
  }, [masteries, totalRungs, START_Y, END_Y, CENTER_X, AMPLITUDE]);

  return (
    <div className="min-h-[400px] rounded-2xl bg-gradient-to-b from-slate-50 to-white overflow-hidden p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minHeight: Math.min(H, 600), maxHeight: 800 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Strand A gradient: blue */}
          <linearGradient id="dna-strand-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          {/* Strand B gradient: purple to pink */}
          <linearGradient id="dna-strand-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          {/* Node glow */}
          <filter id="dna-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rungs (drawn behind strands for depth) */}
        {rungs.map((rung, i) => {
          const { mastery, y, xA, xB, rungColor, isUnstarted, opacity: rungOpacity } = rung;
          const skillName =
            locale === 'ar' ? mastery.skill.skillNameAr : mastery.skill.skillNameEn;

          return (
            <motion.g
              key={mastery.skill.questionId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.04 }}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectSkill(mastery)}
            >
              <title>{`${skillName} (${mastery.masteryScore}%)`}</title>

              {/* Rung line */}
              {isUnstarted ? (
                /* Dashed grey line for unstarted */
                <line
                  x1={xA}
                  y1={y}
                  x2={xB}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="4,3"
                  opacity={0.35}
                />
              ) : (
                /* Solid colored rung */
                <line
                  x1={xA}
                  y1={y}
                  x2={xB}
                  y2={y}
                  stroke={rungColor}
                  strokeWidth={2}
                  opacity={rungOpacity}
                  strokeLinecap="round"
                />
              )}

              {/* Intersection circles on Strand A */}
              <circle
                cx={xA}
                cy={y}
                r={isUnstarted ? 3 : 4.5}
                fill={isUnstarted ? '#e2e8f0' : rungColor}
                opacity={isUnstarted ? 0.4 : rungOpacity}
                filter={mastery.status === 'mastered' ? 'url(#dna-node-glow)' : undefined}
              />

              {/* Intersection circles on Strand B */}
              <circle
                cx={xB}
                cy={y}
                r={isUnstarted ? 3 : 4.5}
                fill={isUnstarted ? '#e2e8f0' : rungColor}
                opacity={isUnstarted ? 0.4 : rungOpacity}
                filter={mastery.status === 'mastered' ? 'url(#dna-node-glow)' : undefined}
              />

              {/* Skill label on the right side */}
              {!isUnstarted && (
                <text
                  x={Math.max(xA, xB) + 14}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize={8}
                  fontWeight={600}
                  opacity={0.7}
                >
                  {(locale === 'ar' ? mastery.skill.skillNameAr : mastery.skill.skillNameEn).slice(0, 18)}
                </text>
              )}

              {/* Score label on the left side for non-unstarted */}
              {!isUnstarted && (
                <text
                  x={Math.min(xA, xB) - 14}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={MASTERY_COLORS[mastery.status]}
                  fontSize={8}
                  fontWeight={800}
                  opacity={0.8}
                >
                  {mastery.masteryScore}
                </text>
              )}

              {/* Larger invisible hit area */}
              <rect
                x={Math.min(xA, xB) - 10}
                y={y - 10}
                width={Math.abs(xB - xA) + 20}
                height={20}
                fill="transparent"
              />
            </motion.g>
          );
        })}

        {/* Strand A (sine) */}
        <motion.path
          d={strandAPath}
          fill="none"
          stroke="url(#dna-strand-a)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          {/* Breathing animation on stroke width */}
          <animate
            attributeName="stroke-width"
            values="3;3.6;3"
            dur="4s"
            repeatCount="indefinite"
          />
        </motion.path>

        {/* Strand B (cosine / offset) */}
        <motion.path
          d={strandBPath}
          fill="none"
          stroke="url(#dna-strand-b)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.15 }}
        >
          {/* Breathing animation on stroke width (offset phase) */}
          <animate
            attributeName="stroke-width"
            values="3;3.6;3"
            dur="4s"
            begin="2s"
            repeatCount="indefinite"
          />
        </motion.path>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 mt-2 bg-slate-50 rounded-xl border border-slate-100">
        {(Object.keys(MASTERY_COLORS) as Array<keyof typeof MASTERY_COLORS>).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: status === 'unstarted' ? '#e2e8f0' : MASTERY_COLORS[status],
                opacity: status === 'unstarted' ? 0.5 : 1,
              }}
            />
            <span className="text-[10px] font-medium text-slate-500">{locale === 'ar' ? MASTERY_LABEL_AR[status] : status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
