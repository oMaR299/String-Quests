import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SkillMastery, MASTERY_COLORS } from '../../utils/masteryEngine';
import { getCategoryForSubject } from '../../data/skillTaxonomy';

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onSelectSkill: (mastery: SkillMastery) => void;
}

/** Deterministic pseudo-random from a seed number */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Map maxPoints to star diameter */
function getStarSize(maxPoints: number): number {
  if (maxPoints <= 10) return 10;
  if (maxPoints <= 20) return 14;
  return 18;
}

export const GalaxyView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  // Group masteries by subject
  const subjectGroups = useMemo(() => {
    const groups: Record<string, SkillMastery[]> = {};
    for (const m of masteries) {
      const subj = m.skill.subject;
      if (!groups[subj]) groups[subj] = [];
      groups[subj].push(m);
    }
    return groups;
  }, [masteries]);

  const subjects = Object.keys(subjectGroups);

  // Viewport dimensions for our coordinate space
  const W = 800;
  const H = 600;
  const CX = W / 2;
  const CY = H / 2;
  const ORBIT_RADIUS = Math.min(W, H) * 0.34;

  // Compute absolute positions for every star within its subject cluster
  const starPositions = useMemo(() => {
    const positions: {
      mastery: SkillMastery;
      x: number;
      y: number;
      color: string;
      size: number;
    }[] = [];

    subjects.forEach((subject, sIdx) => {
      const cluster = subjectGroups[subject];
      const category = getCategoryForSubject(subject);
      const clusterColor = category?.color ?? '#94a3b8';

      // Cluster center angle and position
      const angle = (sIdx / subjects.length) * Math.PI * 2 - Math.PI / 2;
      const clusterCX = CX + Math.cos(angle) * ORBIT_RADIUS;
      const clusterCY = CY + Math.sin(angle) * ORBIT_RADIUS;

      // Spread stars within each cluster
      const clusterSpread = 40 + cluster.length * 8;

      cluster.forEach((m, i) => {
        const seed = m.skill.questionId * 137 + i;
        const starAngle = (i / cluster.length) * Math.PI * 2 + seededRandom(seed) * 0.8;
        const dist = 12 + seededRandom(seed + 1) * clusterSpread;

        positions.push({
          mastery: m,
          x: clusterCX + Math.cos(starAngle) * dist,
          y: clusterCY + Math.sin(starAngle) * dist,
          color: clusterColor,
          size: getStarSize(m.skill.maxPoints),
        });
      });
    });

    return positions;
  }, [subjects, subjectGroups, CX, CY, ORBIT_RADIUS]);

  // Build lines connecting stars within same subject
  const constellationLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

    subjects.forEach((subject) => {
      const category = getCategoryForSubject(subject);
      const color = category?.color ?? '#94a3b8';

      // Find positions for this subject
      const clusterPositions = starPositions.filter(
        (sp) => sp.mastery.skill.subject === subject
      );

      // Connect consecutive stars in the cluster
      for (let i = 0; i < clusterPositions.length - 1; i++) {
        lines.push({
          x1: clusterPositions[i].x,
          y1: clusterPositions[i].y,
          x2: clusterPositions[i + 1].x,
          y2: clusterPositions[i + 1].y,
          color,
        });
      }
      // Connect last to first if 3+ stars to close the constellation
      if (clusterPositions.length >= 3) {
        lines.push({
          x1: clusterPositions[clusterPositions.length - 1].x,
          y1: clusterPositions[clusterPositions.length - 1].y,
          x2: clusterPositions[0].x,
          y2: clusterPositions[0].y,
          color,
        });
      }
    });

    return lines;
  }, [subjects, starPositions]);

  // Subject labels at cluster centers
  const subjectLabels = useMemo(() => {
    return subjects.map((subject, sIdx) => {
      const angle = (sIdx / subjects.length) * Math.PI * 2 - Math.PI / 2;
      const lx = CX + Math.cos(angle) * (ORBIT_RADIUS + 55);
      const ly = CY + Math.sin(angle) * (ORBIT_RADIUS + 55);
      const category = getCategoryForSubject(subject);
      return { subject, x: lx, y: ly, color: category?.color ?? '#94a3b8' };
    });
  }, [subjects, CX, CY, ORBIT_RADIUS]);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950 min-h-[500px] rounded-2xl overflow-hidden relative">
      {/* Ambient background stars (decorative) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <circle
            key={`bg-star-${i}`}
            cx={`${seededRandom(i * 7 + 3) * 100}%`}
            cy={`${seededRandom(i * 13 + 11) * 100}%`}
            r={seededRandom(i * 3 + 1) < 0.6 ? 0.8 : 1.3}
            fill="white"
            opacity={0.1 + seededRandom(i * 5 + 17) * 0.15}
          >
            <animate
              attributeName="opacity"
              values={`${0.08 + seededRandom(i * 5) * 0.12};${0.2 + seededRandom(i * 5) * 0.15};${0.08 + seededRandom(i * 5) * 0.12}`}
              dur={`${2 + seededRandom(i * 9 + 7) * 4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Main SVG canvas */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full min-h-[500px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow filter for mastered stars */}
          <filter id="galaxy-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Constellation lines */}
        {constellationLines.map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth={0.8}
            strokeOpacity={0.12}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.02 }}
          />
        ))}

        {/* Subject labels */}
        {subjectLabels.map((label) => (
          <text
            key={`label-${label.subject}`}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={label.color}
            fontSize={10}
            fontWeight={700}
            opacity={0.6}
          >
            {label.subject}
          </text>
        ))}

        {/* Stars */}
        {starPositions.map((star, i) => {
          const { mastery, x, y, color, size } = star;
          const isUnstarted = mastery.status === 'unstarted';
          const isMastered = mastery.status === 'mastered';
          const brightness = isUnstarted ? 0.2 : 0.2 + (mastery.masteryScore / 100) * 0.8;
          const r = size / 2;
          const skillName =
            locale === 'ar' ? mastery.skill.skillNameAr : mastery.skill.skillNameEn;

          // Twinkling animation parameters (vary per star)
          const twinkleDuration = 2.5 + seededRandom(mastery.skill.questionId * 3) * 3;
          const twinkleDelay = seededRandom(mastery.skill.questionId * 7) * 3;

          return (
            <motion.g
              key={mastery.skill.questionId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.03 }}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectSkill(mastery)}
            >
              <title>{`${skillName} (${mastery.masteryScore}%)`}</title>

              {/* Glow halo for mastered skills */}
              {isMastered && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.3}
                  filter="url(#galaxy-glow)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.15;0.4;0.15"
                    dur={`${twinkleDuration}s`}
                    begin={`${twinkleDelay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values={`${r + 4};${r + 8};${r + 4}`}
                    dur={`${twinkleDuration}s`}
                    begin={`${twinkleDelay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {isUnstarted ? (
                /* Hollow dashed circle for unstarted */
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="none"
                  stroke="#475569"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  opacity={brightness}
                />
              ) : (
                /* Solid filled circle for attempted skills */
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={color}
                    opacity={brightness}
                    filter={isMastered ? 'url(#galaxy-glow)' : undefined}
                  >
                    {/* Twinkle animation */}
                    <animate
                      attributeName="opacity"
                      values={`${brightness * 0.85};${Math.min(1, brightness * 1.15)};${brightness * 0.85}`}
                      dur={`${twinkleDuration}s`}
                      begin={`${twinkleDelay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Inner bright core */}
                  <circle
                    cx={x}
                    cy={y}
                    r={r * 0.4}
                    fill="white"
                    opacity={brightness * 0.6}
                  >
                    <animate
                      attributeName="opacity"
                      values={`${brightness * 0.4};${brightness * 0.7};${brightness * 0.4}`}
                      dur={`${twinkleDuration}s`}
                      begin={`${twinkleDelay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}

              {/* Hover hit area (larger, invisible) */}
              <circle cx={x} cy={y} r={Math.max(r + 4, 12)} fill="transparent" />
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-xl">
        {(Object.keys(MASTERY_COLORS) as Array<keyof typeof MASTERY_COLORS>).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: status === 'unstarted' ? 'transparent' : MASTERY_COLORS[status],
                border: status === 'unstarted' ? '1px dashed #475569' : 'none',
                opacity: status === 'unstarted' ? 0.5 : 1,
              }}
            />
            <span className="text-[10px] font-medium text-slate-300 capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
