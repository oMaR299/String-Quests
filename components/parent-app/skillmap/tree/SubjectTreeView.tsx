// SubjectTreeView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase B — the signature visual of the Parent Skill Map: a whole textbook
// rendered as a lush, scrollable SVG TREE.
//
//   trunk  = subject   (tinted with the subject's brand color)
//   branch = unit       (alternating left / right up the trunk)
//   twig   = lesson      (a few off each branch)
//   leaf   = page         (one per page, COLORED BY THAT PAGE'S MASTERY)
//
// Reading order is bottom → top = unit 1 → last unit (you walk up through the
// textbook). Because every leaf is colored by its page status, a weak subject
// reads as sparse/amber/rose foliage while a strong one reads lush green — the
// health emerges from the data; we never special-case it.
//
// Layout is DETERMINISTIC + STRUCTURED (no random organic placement that could
// overlap). A fixed vertical band per unit, branches at fixed angles, twigs
// evenly spaced along each branch, and a tight leaf-fan per twig. This keeps a
// dense ~60-110-page tree legible at 360-414px.
//
// Interaction model:
//   • Leaves are DECORATIVE (pointer-events: none) — never tappable.
//   • Each unit branch and each lesson twig has an INVISIBLE enlarged hit-area
//     (≥44px) layered above the art. Tapping it selects that node and opens the
//     prop-driven `UnitLessonDetailCard` (this component owns that selection +
//     the in-memory "sent" set; nothing is persisted).
//
// Motion (Framer Motion, reduced-motion aware): branches + leaf clusters
// grow/stagger in once on mount. We DO NOT animate each of the 100+ leaves
// individually on a loop — leaves are plain SVG shapes; only a small number of
// container groups animate, so it stays performant.
//
// House rules: flat, white, Cairo, Lucide icons (no emoji), full RTL. The SVG
// art is authored LTR and is near-symmetric, so we keep branch sides as laid
// out; all TEXT + the detail card flow with the document `dir` so they read
// correctly in Arabic.

import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../../contexts/I18nContext';
import { getParentAppString } from '../../parentAppI18n';
import {
  SUBJECT_STYLES,
  type SubjectKey,
} from '../../data/parentAppSchoolMockData';
import type { ParentSkillStatus } from '../data/parentAppSkillMapMock';
import type {
  SubjectTree,
  TreeUnit,
  TreeLesson,
  TreePage,
} from '../data/parentAppTextbookTreeMock';
import {
  UnitLessonDetailCard,
  type TreeNodeKind,
} from './UnitLessonDetailCard';

// ─────────────────────────────────────────────────────────────────────────────
// Color language — flat hex per leaf status (SVG needs raw hex fills).
//   mastered   → emerald-500   #10B981
//   proficient → lime-400      #A3E635 (green/lime)
//   developing → amber-400     #FBBF24
//   needsHelp  → rose-400      #FB7185
//   notStarted → slate-300     #CBD5E1  (a page with masteryPct === 0)
// `statusFromMastery` already returns `needsHelp` for 0, so we detect "not
// started" by the raw mastery being 0 and override the color to grey.
// ─────────────────────────────────────────────────────────────────────────────

const LEAF_FILL: Record<ParentSkillStatus, string> = {
  mastered: '#10B981',
  proficient: '#A3E635',
  developing: '#FBBF24',
  needsHelp: '#FB7185',
};
const NOT_STARTED_FILL = '#CBD5E1';

/** A slightly darker companion per status — back leaves in a fan, for depth. */
const LEAF_FILL_DARK: Record<ParentSkillStatus, string> = {
  mastered: '#059669',
  proficient: '#84CC16',
  developing: '#F59E0B',
  needsHelp: '#F43F5E',
};
const NOT_STARTED_FILL_DARK = '#94A3B8';

/** Resolve a page's leaf fill, treating mastery 0 as the grey "not started". */
function leafColor(page: TreePage, dark = false): string {
  if (page.masteryPct <= 0) return dark ? NOT_STARTED_FILL_DARK : NOT_STARTED_FILL;
  return (dark ? LEAF_FILL_DARK : LEAF_FILL)[page.status];
}

/**
 * The dominant leaf color among a lesson's pages — used to paint a soft foliage
 * "mass" behind each leaf fan so a cluster reads as full foliage, not a few
 * scattered leaves.
 */
function fanBlobFill(pages: TreePage[]): string {
  const counts = new Map<string, number>();
  for (const p of pages) {
    const c = leafColor(p);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = NOT_STARTED_FILL;
  let max = -1;
  counts.forEach((n, c) => {
    if (n > max) {
      max = n;
      best = c;
    }
  });
  return best;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject → trunk/branch hex tint. SVG needs raw hex (SUBJECT_STYLES only
// carries Tailwind classes), so we keep a small parallel map keyed by the same
// SubjectKey, matching the garden plant's brand hues for visual continuity.
// `wood` tints the trunk + branches; `woodDark` is the shaded edge.
// ─────────────────────────────────────────────────────────────────────────────

interface WoodPalette {
  wood: string;
  woodDark: string;
}

const SUBJECT_WOOD: Record<SubjectKey, WoodPalette> = {
  math: { wood: '#1CB0F6', woodDark: '#1899D6' },
  arabic: { wood: '#E5A500', woodDark: '#B8830A' },
  english: { wood: '#B45CF0', woodDark: '#9333EA' },
  science: { wood: '#0EA5E9', woodDark: '#0284C7' },
  reading: { wood: '#4CAD00', woodDark: '#3E8E00' },
  pe: { wood: '#E07F00', woodDark: '#B86700' },
  art: { wood: '#E11D48', woodDark: '#BE123C' },
};

const FALLBACK_WOOD: WoodPalette = { wood: '#6B7C57', woodDark: '#566448' };

function getWood(subjectKey: string): WoodPalette {
  return SUBJECT_WOOD[subjectKey as SubjectKey] ?? FALLBACK_WOOD;
}

function getSubjectLabel(tree: SubjectTree, locale: 'ar' | 'en'): string {
  return locale === 'ar' ? tree.subjectAr : tree.subjectEn;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants (SVG userspace; the <svg> scales to the container width).
// A fixed band per unit makes the canvas height grow with the textbook so the
// sheet body scrolls bottom → top through the units.
// ─────────────────────────────────────────────────────────────────────────────

const W = 360; // canvas design width
const CX = W / 2; // trunk center x
const TOP_PAD = 60; // room above the top (last) unit for the crown
const BOTTOM_PAD = 48; // room below the first unit for the base
const UNIT_BAND = 150; // vertical space allotted to each unit (tighter → lusher)
const TRUNK_BASE_HALF = 13; // trunk half-width at the base (tapers up)
const TRUNK_TOP_HALF = 4; // trunk half-width just under the crown

const BRANCH_LEN = 122; // horizontal reach of a unit branch limb
const BRANCH_RISE = 50; // how much a branch rises as it reaches out
const TWIG_LEN = 32; // length of a lesson twig off the branch
const LEAF_LEN = 17; // page-leaf length

// ─────────────────────────────────────────────────────────────────────────────
// A single flat almond leaf (mirrors GardenPlant's leaf vocabulary for
// continuity). Authored pointing +x from the origin, then rotated. Decorative.
// ─────────────────────────────────────────────────────────────────────────────

interface LeafShapeProps {
  x: number;
  y: number;
  size: number;
  angle: number;
  fill: string;
}

const LeafShape: React.FC<LeafShapeProps> = ({ x, y, size, angle, fill }) => {
  const w = size * 0.5;
  const path = `M 0 0 Q ${size * 0.55} ${-w} ${size} 0 Q ${size * 0.55} ${w} 0 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={path} fill={fill} />
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Geometry helpers — pure, deterministic placement.
// ─────────────────────────────────────────────────────────────────────────────

/** Endpoint of a unit branch given its anchor on the trunk + side. */
function branchEnd(anchorY: number, side: 1 | -1) {
  return {
    x: CX + side * BRANCH_LEN,
    y: anchorY - BRANCH_RISE,
  };
}

/** A point fraction `t` (0..1) along the straight trunk→branchEnd limb. */
function pointOnBranch(anchorY: number, side: 1 | -1, t: number) {
  const end = branchEnd(anchorY, side);
  return {
    x: CX + (end.x - CX) * t,
    y: anchorY + (end.y - anchorY) * t,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf fan — a tight cluster of page-leaves at the tip of a lesson twig. Leaves
// fan around the twig direction; with ~5 pages this reads as a small frond, not
// a list. Placement is deterministic (evenly spread across an arc).
// ─────────────────────────────────────────────────────────────────────────────

interface LeafFanProps {
  /** Origin (twig tip). */
  x: number;
  y: number;
  /** Base direction the twig points, in degrees (leaves fan around this). */
  baseAngle: number;
  pages: TreePage[];
}

const LeafFan: React.FC<LeafFanProps> = ({ x, y, baseAngle, pages }) => {
  const n = pages.length;
  // Spread leaves across a ~96° arc centered on the twig direction.
  const spread = 96;
  const step = n > 1 ? spread / (n - 1) : 0;
  const start = baseAngle - spread / 2;
  return (
    <g>
      {/* Soft foliage mass behind the leaves so the cluster reads full, not
          scattered. Two stacked translucent blobs in the dominant leaf color. */}
      <ellipse cx={x} cy={y} rx={LEAF_LEN * 1.55} ry={LEAF_LEN * 1.25} fill={fanBlobFill(pages)} opacity={0.22} />
      <ellipse cx={x} cy={y} rx={LEAF_LEN * 1.05} ry={LEAF_LEN * 0.9} fill={fanBlobFill(pages)} opacity={0.28} />
      {pages.map((page, i) => {
        const angle = n > 1 ? start + step * i : baseAngle;
        // Alternate near/far + light/dark so the fan has depth, not a flat row.
        const far = i % 2 === 0;
        const size = far ? LEAF_LEN : LEAF_LEN * 0.86;
        const reach = far ? 4 : 1;
        const rad = (angle * Math.PI) / 180;
        const ox = x + Math.cos(rad) * reach;
        const oy = y + Math.sin(rad) * reach;
        return (
          <LeafShape
            key={page.id}
            x={ox}
            y={oy}
            size={size}
            angle={angle}
            fill={leafColor(page, !far)}
          />
        );
      })}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// One unit branch: the limb, its lesson twigs + leaf fans, the unit label, and
// the invisible hit-areas for the branch and each twig.
// ─────────────────────────────────────────────────────────────────────────────

interface UnitBranchProps {
  unit: TreeUnit;
  /** y where the branch meets the trunk. */
  anchorY: number;
  /** +1 → branch goes right, -1 → left. */
  side: 1 | -1;
  wood: WoodPalette;
  /** Stagger index for entrance motion. */
  order: number;
  reduceMotion: boolean;
  locale: 'ar' | 'en';
  unitLabel: string;
  onSelectUnit: (unit: TreeUnit) => void;
  onSelectLesson: (lesson: TreeLesson) => void;
}

const UnitBranch: React.FC<UnitBranchProps> = ({
  unit,
  anchorY,
  side,
  wood,
  order,
  reduceMotion,
  locale,
  unitLabel,
  onSelectUnit,
  onSelectLesson,
}) => {
  const end = branchEnd(anchorY, side);

  // Twigs sit at evenly spaced fractions along the outer half of the limb so
  // they don't crowd the trunk. Direction of each twig alternates up/down a
  // little around the limb's outward direction.
  const lessons = unit.lessons;
  const twigCount = lessons.length;

  // Branch grows from the trunk outward on mount.
  const grow = reduceMotion
    ? undefined
    : {
        initial: { scaleX: 0, scaleY: 0, opacity: 0 },
        animate: { scaleX: 1, scaleY: 1, opacity: 1 },
        transition: {
          type: 'spring' as const,
          stiffness: 200,
          damping: 22,
          delay: 0.15 + order * 0.12,
        },
      };

  // Limb as a gentle quadratic curve trunk→tip (control pulls it up a touch).
  const ctrlX = CX + side * BRANCH_LEN * 0.5;
  const ctrlY = anchorY - BRANCH_RISE * 0.35;
  const limbPath = `M ${CX} ${anchorY} Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;

  // Label sits just beyond the branch tip, offset to the branch's side.
  const labelX = end.x + side * 6;
  const labelAnchor = side === 1 ? 'start' : 'end';

  return (
    <motion.g
      initial={grow?.initial}
      animate={grow?.animate}
      transition={grow?.transition}
      style={{ transformOrigin: `${CX}px ${anchorY}px` }}
    >
      {/* The limb. */}
      <path
        d={limbPath}
        stroke={wood.woodDark}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={limbPath}
        stroke={wood.wood}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Lesson twigs + leaf fans. */}
      {lessons.map((lesson, li) => {
        // Spread twigs along 0.42..0.96 of the limb.
        const t = twigCount > 1 ? 0.42 + (0.54 * li) / (twigCount - 1) : 0.7;
        const base = pointOnBranch(anchorY, side, t);
        // Twig direction: outward + alternating vertical lean.
        const lean = li % 2 === 0 ? -34 : 18;
        const twigAngle = side === 1 ? lean : 180 - lean;
        const rad = (twigAngle * Math.PI) / 180;
        const tip = {
          x: base.x + Math.cos(rad) * TWIG_LEN,
          y: base.y + Math.sin(rad) * TWIG_LEN,
        };
        return (
          <g key={lesson.id}>
            {/* Twig stem. */}
            <path
              d={`M ${base.x} ${base.y} L ${tip.x} ${tip.y}`}
              stroke={wood.woodDark}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaf fan at the twig tip — decorative. */}
            <LeafFan
              x={tip.x}
              y={tip.y}
              baseAngle={twigAngle}
              pages={lesson.pages}
            />
            {/* Invisible lesson hit-area (≥44px) over the twig tip cluster. */}
            <circle
              cx={tip.x}
              cy={tip.y}
              r={26}
              fill="transparent"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLesson(lesson);
              }}
              role="button"
              tabIndex={0}
              aria-label={locale === 'ar' ? lesson.titleAr : lesson.titleEn}
            />
          </g>
        );
      })}

      {/* Unit label + mastery %, beyond the tip. Text flows with dir via the
          foreignObject-free <text>; we keep it concise. */}
      <text
        x={labelX}
        y={end.y - 14}
        textAnchor={labelAnchor}
        className="font-cairo"
        fontSize={13}
        fontWeight={800}
        fill="#334155"
      >
        {unitLabel}
      </text>
      <text
        x={labelX}
        y={end.y + 2}
        textAnchor={labelAnchor}
        className="font-cairo tabular-nums"
        fontSize={12}
        fontWeight={800}
        fill={wood.woodDark}
      >
        {unit.masteryPct}%
      </text>

      {/* Invisible unit hit-area: a wide capsule over the limb. We approximate
          with an enlarged invisible stroke along the limb path (≥44px tall). */}
      <path
        d={limbPath}
        stroke="transparent"
        strokeWidth={44}
        strokeLinecap="round"
        fill="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelectUnit(unit);
        }}
        role="button"
        tabIndex={0}
        aria-label={locale === 'ar' ? unit.titleAr : unit.titleEn}
      />
    </motion.g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Legend — the 5 status colors. Small, fixed (sticky) at the top of the
// scrollable area so it stays visible while scrolling the tree.
// ─────────────────────────────────────────────────────────────────────────────

const Legend: React.FC = () => {
  const { locale } = useI18n();
  const t = (key: string) => getParentAppString(locale, key);
  const items: { fill: string; key: string }[] = [
    { fill: LEAF_FILL.mastered, key: 'parentApp.skillMap.tree.legendMastered' },
    { fill: LEAF_FILL.proficient, key: 'parentApp.skillMap.tree.legendProficient' },
    { fill: LEAF_FILL.developing, key: 'parentApp.skillMap.tree.legendDeveloping' },
    { fill: LEAF_FILL.needsHelp, key: 'parentApp.skillMap.tree.legendNeedsHelp' },
    { fill: NOT_STARTED_FILL, key: 'parentApp.skillMap.tree.legendNotStarted' },
  ];
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-slate-100 bg-white/95 px-4 py-2 backdrop-blur-sm">
      {items.map((it) => (
        <span key={it.key} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.fill }}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold text-slate-500">
            {t(it.key)}
          </span>
        </span>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

export interface SubjectTreeViewProps {
  tree: SubjectTree;
  childName: string;
}

/** The selected node (branch or twig) the detail card describes. */
type Selected =
  | { kind: 'unit'; node: TreeUnit }
  | { kind: 'lesson'; node: TreeLesson }
  | null;

export const SubjectTreeView: React.FC<SubjectTreeViewProps> = ({
  tree,
  childName,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();

  const wood = getWood(tree.subjectKey);
  const units = tree.units;
  const unitWord = getParentAppString(locale, 'parentApp.skillMap.tree.unit');

  // Selection + in-memory "sent" set (no persistence — matches parent-app).
  const [selected, setSelected] = useState<Selected>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  // Canvas height grows with the unit count so the body scrolls bottom→top.
  const height = TOP_PAD + units.length * UNIT_BAND + BOTTOM_PAD;

  // Anchor y per unit: unit 0 (first) sits at the BOTTOM, last unit at top.
  // We render every unit; visual stacking comes from these y values.
  const anchors = useMemo(
    () =>
      units.map((_, i) => {
        // i = 0 → bottom band; increasing i climbs toward the top.
        const fromTopIndex = units.length - 1 - i;
        return TOP_PAD + fromTopIndex * UNIT_BAND + UNIT_BAND * 0.5;
      }),
    [units]
  );

  // Trunk: from just below the first (bottom) unit's anchor up past the last.
  const trunkTop = TOP_PAD + UNIT_BAND * 0.18;
  const trunkBottom = height - BOTTOM_PAD * 0.4;
  const trunkMidY = (trunkTop + trunkBottom) / 2;
  const trunkGradId = `trunkGrad-${tree.subjectKey}`;

  // Tapering trunk silhouette: wide at the base, narrowing to the crown, with
  // gently curved sides so it reads as a tree, not a uniform bar.
  const trunkPath =
    `M ${CX - TRUNK_BASE_HALF} ${trunkBottom}` +
    ` C ${CX - TRUNK_BASE_HALF * 0.7} ${trunkMidY} ${CX - TRUNK_TOP_HALF * 1.8} ${trunkMidY} ${CX - TRUNK_TOP_HALF} ${trunkTop}` +
    ` L ${CX + TRUNK_TOP_HALF} ${trunkTop}` +
    ` C ${CX + TRUNK_TOP_HALF * 1.8} ${trunkMidY} ${CX + TRUNK_BASE_HALF * 0.7} ${trunkMidY} ${CX + TRUNK_BASE_HALF} ${trunkBottom}` +
    ` Z`;
  // A thin lighter sliver up the leading edge for subtle dimension.
  const trunkHighlightPath =
    `M ${CX - TRUNK_BASE_HALF * 0.5} ${trunkBottom}` +
    ` C ${CX - TRUNK_BASE_HALF * 0.35} ${trunkMidY} ${CX - TRUNK_TOP_HALF * 0.9} ${trunkMidY} ${CX - TRUNK_TOP_HALF * 0.5} ${trunkTop}` +
    ` L ${CX - TRUNK_TOP_HALF * 0.1} ${trunkTop}` +
    ` C ${CX - TRUNK_TOP_HALF * 0.3} ${trunkMidY} ${CX - TRUNK_BASE_HALF * 0.12} ${trunkMidY} ${CX - TRUNK_BASE_HALF * 0.15} ${trunkBottom}` +
    ` Z`;

  // Trunk entrance: draw upward from the base.
  const trunkGrow = reduceMotion
    ? undefined
    : {
        initial: { scaleY: 0 },
        animate: { scaleY: 1 },
        transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
      };

  const handleSelectUnit = (node: TreeUnit) =>
    setSelected({ kind: 'unit', node });
  const handleSelectLesson = (node: TreeLesson) =>
    setSelected({ kind: 'lesson', node });

  const handleSend = () => {
    if (!selected) return;
    const id = selected.node.id;
    setSentIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  // Derived props for the detail card from the current selection.
  const detail = useMemo(() => {
    if (!selected) return null;
    const kind: TreeNodeKind = selected.kind;
    const node = selected.node;
    const childCount =
      selected.kind === 'unit'
        ? (selected.node as TreeUnit).lessons.length
        : (selected.node as TreeLesson).pages.length;
    return {
      kind,
      titleAr: node.titleAr,
      titleEn: node.titleEn,
      masteryPct: node.masteryPct,
      status: node.status,
      childCount,
      sent: sentIds.has(node.id),
    };
  }, [selected, sentIds]);

  return (
    <div className="relative">
      <Legend />

      {/* The tree canvas. The SVG scales to the container width; its intrinsic
          height drives the scrollable height of the sheet body. */}
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        className="block overflow-visible"
        role="img"
        aria-label={getSubjectLabel(tree, locale)}
      >
        {/* ── Trunk ── grows up from the base. */}
        <motion.g
          initial={trunkGrow?.initial}
          animate={trunkGrow?.animate}
          transition={trunkGrow?.transition}
          style={{ transformOrigin: `${CX}px ${trunkBottom}px` }}
        >
          <defs>
            <linearGradient id={trunkGradId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={wood.woodDark} />
              <stop offset="60%" stopColor={wood.wood} />
              <stop offset="100%" stopColor={wood.wood} />
            </linearGradient>
          </defs>

          {/* Soft ground shadow to root the trunk. */}
          <ellipse cx={CX} cy={trunkBottom + 4} rx={62} ry={9} fill={wood.woodDark} opacity={0.14} />

          {/* Tapering, gradient-filled trunk + a subtle highlight sliver. */}
          <path d={trunkPath} fill={`url(#${trunkGradId})`} />
          <path d={trunkHighlightPath} fill="#FFFFFF" opacity={0.12} />

          {/* Fuller leafy crown atop the trunk — layered subject-tinted blobs. */}
          <g>
            <circle cx={CX} cy={trunkTop - 2} r={30} fill={wood.wood} opacity={0.95} />
            <circle cx={CX - 24} cy={trunkTop + 10} r={21} fill={wood.woodDark} opacity={0.9} />
            <circle cx={CX + 24} cy={trunkTop + 10} r={21} fill={wood.woodDark} opacity={0.9} />
            <circle cx={CX - 13} cy={trunkTop - 17} r={16} fill={wood.wood} opacity={0.92} />
            <circle cx={CX + 15} cy={trunkTop - 14} r={15} fill={wood.wood} opacity={0.92} />
          </g>
        </motion.g>

        {/* ── Unit branches (alternating sides; unit 0 lowest). ── */}
        {units.map((unit, i) => {
          const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
          const unitLabel = `${unitWord} ${i + 1}`;
          return (
            <UnitBranch
              key={unit.id}
              unit={unit}
              anchorY={anchors[i]}
              side={side}
              wood={wood}
              order={i}
              reduceMotion={!!reduceMotion}
              locale={locale}
              unitLabel={unitLabel}
              onSelectUnit={handleSelectUnit}
              onSelectLesson={handleSelectLesson}
            />
          );
        })}
      </svg>

      {/* ── Detail card ── pinned to the bottom of the viewport area as an
          inset overlay so it's reachable wherever the parent has scrolled.
          It's sticky to the bottom of the scroll container. */}
      {detail && selected && (
        <div className="sticky bottom-3 z-20 mt-2 px-1">
          <UnitLessonDetailCard
            kind={detail.kind}
            titleAr={detail.titleAr}
            titleEn={detail.titleEn}
            masteryPct={detail.masteryPct}
            status={detail.status}
            childCount={detail.childCount}
            childName={childName}
            sent={detail.sent}
            onSend={handleSend}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
};

export default SubjectTreeView;
