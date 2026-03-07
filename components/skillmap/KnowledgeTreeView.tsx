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

/** Deterministic pseudo-random from a seed number */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export const KnowledgeTreeView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  const W = 800;
  const H = 700;

  // Ground line position
  const GROUND_Y = H - 60;
  // Trunk base and top
  const TRUNK_BASE_X = W / 2;
  const TRUNK_BASE_Y = GROUND_Y;
  const TRUNK_TOP_Y = 120;
  const TRUNK_TOP_X = W / 2;

  // Unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const m of masteries) set.add(m.skill.subject);
    return Array.from(set);
  }, [masteries]);

  // Branch layout: each subject gets a branch spreading left or right
  const branches = useMemo(() => {
    const branchData: {
      subject: string;
      color: string;
      // Branch start (on trunk) and end point
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      controlX: number;
      controlY: number;
      // Skills along this branch
      skills: SkillMastery[];
    }[] = [];

    const totalBranches = subjects.length;
    const trunkHeight = TRUNK_BASE_Y - TRUNK_TOP_Y;
    // Branches distributed along the trunk vertically, top branches first
    const spacing = trunkHeight / (totalBranches + 1);

    subjects.forEach((subject, idx) => {
      const category = getCategoryForSubject(subject);
      const color = category?.color ?? '#8B7355';
      const skills = masteries.filter((m) => m.skill.subject === subject);

      // Alternate left/right
      const side = idx % 2 === 0 ? -1 : 1;
      // Branch start on the trunk
      const startY = TRUNK_TOP_Y + spacing * (idx + 1);
      const startX = TRUNK_BASE_X;

      // Branch length varies by number of skills
      const branchLength = 100 + skills.length * 22;
      // Branch angles slightly upward
      const angleOffset = -0.25 + seededRandom(idx * 17) * 0.3;
      const endX = startX + side * branchLength;
      const endY = startY + angleOffset * branchLength * 0.3;

      // Control point for organic curve
      const controlX = startX + side * branchLength * 0.5;
      const controlY = startY - 20 - seededRandom(idx * 31) * 20;

      branchData.push({
        subject,
        color,
        startX,
        startY,
        endX,
        endY,
        controlX,
        controlY,
        skills,
      });
    });

    return branchData;
  }, [subjects, masteries, TRUNK_BASE_X, TRUNK_BASE_Y, TRUNK_TOP_Y]);

  // Compute leaf positions for each branch
  const leafPositions = useMemo(() => {
    const leaves: {
      mastery: SkillMastery;
      x: number;
      y: number;
      branchSubject: string;
    }[] = [];

    branches.forEach((branch) => {
      const { skills, startX, startY, endX, endY, controlX, controlY } = branch;

      skills.forEach((m, i) => {
        const totalSkills = skills.length;
        // Distribute leaves along the branch curve (t from 0.3 to 1.0)
        const t = totalSkills === 1 ? 0.85 : 0.3 + (i / (totalSkills - 1)) * 0.7;

        // Quadratic bezier point
        const mt = 1 - t;
        const lx = mt * mt * startX + 2 * mt * t * controlX + t * t * endX;
        const ly = mt * mt * startY + 2 * mt * t * controlY + t * t * endY;

        // Slight jitter so leaves don't overlap exactly on the line
        const jitterX = (seededRandom(m.skill.questionId * 11) - 0.5) * 18;
        const jitterY = -8 - seededRandom(m.skill.questionId * 23) * 16;

        leaves.push({
          mastery: m,
          x: lx + jitterX,
          y: ly + jitterY,
          branchSubject: branch.subject,
        });
      });
    });

    return leaves;
  }, [branches]);

  // Trunk path (organic, slightly curved)
  const trunkPath = `M ${TRUNK_BASE_X} ${TRUNK_BASE_Y}
    C ${TRUNK_BASE_X - 8} ${TRUNK_BASE_Y - (TRUNK_BASE_Y - TRUNK_TOP_Y) * 0.4},
      ${TRUNK_BASE_X + 8} ${TRUNK_BASE_Y - (TRUNK_BASE_Y - TRUNK_TOP_Y) * 0.7},
      ${TRUNK_TOP_X} ${TRUNK_TOP_Y}`;

  // Root paths (decorative underground roots)
  const rootPaths = useMemo(() => {
    const roots: string[] = [];
    const rootCount = 5;
    for (let i = 0; i < rootCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 40 + seededRandom(i * 41) * 80;
      const depth = 15 + seededRandom(i * 53) * 25;
      roots.push(
        `M ${TRUNK_BASE_X} ${GROUND_Y}
         Q ${TRUNK_BASE_X + side * spread * 0.5} ${GROUND_Y + depth * 0.6},
           ${TRUNK_BASE_X + side * spread} ${GROUND_Y + depth}`
      );
    }
    return roots;
  }, [TRUNK_BASE_X, GROUND_Y]);

  // Shared animation: path drawing
  const drawTransition = { duration: 1.5, ease: 'easeInOut' as const };

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-green-50 to-amber-50 min-h-[500px] rounded-2xl overflow-hidden relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full min-h-[500px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Leaf shadow */}
          <filter id="leaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ground line */}
        <line
          x1={60}
          y1={GROUND_Y}
          x2={W - 60}
          y2={GROUND_Y}
          stroke="#92400e"
          strokeWidth={2}
          strokeOpacity={0.3}
        />

        {/* Ground fill (below ground line) */}
        <rect
          x={0}
          y={GROUND_Y}
          width={W}
          height={H - GROUND_Y}
          fill="#78350f"
          fillOpacity={0.08}
        />

        {/* Roots label */}
        <text
          x={W / 2}
          y={GROUND_Y + 32}
          textAnchor="middle"
          fill="#92400e"
          fontSize={11}
          fontWeight={600}
          opacity={0.4}
        >
          {locale === 'ar' ? 'الجذور' : 'Roots'}
        </text>

        {/* Root paths (underground) */}
        {rootPaths.map((rp, i) => (
          <motion.path
            key={`root-${i}`}
            d={rp}
            fill="none"
            stroke="#92400e"
            strokeWidth={2.5 - i * 0.3}
            strokeOpacity={0.25}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...drawTransition, delay: 1.0 + i * 0.12 }}
          />
        ))}

        {/* Trunk */}
        <motion.path
          d={trunkPath}
          fill="none"
          stroke="#78350f"
          strokeWidth={12}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={drawTransition}
        />
        {/* Trunk highlight (lighter inner line for depth) */}
        <motion.path
          d={trunkPath}
          fill="none"
          stroke="#a16207"
          strokeWidth={4}
          strokeLinecap="round"
          strokeOpacity={0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...drawTransition, delay: 0.2 }}
        />

        {/* Branches */}
        {branches.map((branch, bIdx) => {
          const branchPath = `M ${branch.startX} ${branch.startY}
            Q ${branch.controlX} ${branch.controlY},
              ${branch.endX} ${branch.endY}`;

          return (
            <motion.path
              key={`branch-${branch.subject}`}
              d={branchPath}
              fill="none"
              stroke="#78350f"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...drawTransition, delay: 0.5 + bIdx * 0.1 }}
            />
          );
        })}

        {/* Leaves (skill circles) */}
        {leafPositions.map((leaf, lIdx) => {
          const { mastery, x, y } = leaf;
          const isUnstarted = mastery.status === 'unstarted';
          const isMasteredOrProficient =
            mastery.status === 'mastered' || mastery.status === 'proficient';
          const color = isUnstarted ? '#94a3b8' : MASTERY_COLORS[mastery.status];
          const skillName =
            locale === 'ar' ? mastery.skill.skillNameAr : mastery.skill.skillNameEn;

          const branchData = branches.find(
            (b) => b.subject === leaf.branchSubject
          );
          const branchDelay = branchData
            ? 0.5 + branches.indexOf(branchData) * 0.1 + 0.8
            : 1.5;

          return (
            <motion.g
              key={mastery.skill.questionId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: branchDelay + lIdx * 0.02 }}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectSkill(mastery)}
            >
              <title>{`${skillName} (${mastery.masteryScore}%)`}</title>

              {isUnstarted ? (
                /* Visible grey leaf bud for unstarted */
                <circle cx={x} cy={y} r={8} fill="#cbd5e1" opacity={0.6} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3,2" />
              ) : (
                /* Leaf circle */
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill={color}
                    opacity={0.85}
                    filter="url(#leaf-shadow)"
                  />
                  {/* Inner highlight */}
                  <circle
                    cx={x - 2}
                    cy={y - 2}
                    r={4}
                    fill="white"
                    opacity={0.25}
                  />
                </>
              )}

              {/* Show name labels for mastered/proficient skills */}
              {isMasteredOrProficient && (
                <text
                  x={x}
                  y={y - 17}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize={8}
                  fontWeight={700}
                  opacity={0.7}
                >
                  {skillName.length > 14 ? skillName.slice(0, 12) + '..' : skillName}
                </text>
              )}

              {/* Larger invisible hit area */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
            </motion.g>
          );
        })}

        {/* Subject labels near branch endpoints */}
        {branches.map((branch) => {
          const side = branch.endX > W / 2 ? 1 : -1;
          const labelX = branch.endX + side * 10;
          const anchor = side === 1 ? 'start' : 'end';

          return (
            <motion.text
              key={`branchlabel-${branch.subject}`}
              x={labelX}
              y={branch.endY + 4}
              textAnchor={anchor}
              fill={branch.color}
              fontSize={10}
              fontWeight={700}
              opacity={0.65}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              transition={{ delay: 2 }}
            >
              {branch.subject}
            </motion.text>
          );
        })}
      </svg>

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 bg-white/50 backdrop-blur-sm rounded-xl">
        {(Object.keys(MASTERY_COLORS) as Array<keyof typeof MASTERY_COLORS>).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: status === 'unstarted' ? '#cbd5e1' : MASTERY_COLORS[status],
                opacity: status === 'unstarted' ? 0.5 : 1,
              }}
            />
            <span className="text-[10px] font-medium text-slate-600">{locale === 'ar' ? MASTERY_LABEL_AR[status] : status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
