# Skill Map Redesign: Textbook-Scoped Visualizations - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Skill Map so students select a textbook first (Duolingo language-picker style), then see all 7 visualizations scoped to that textbook's data. Replace Galaxy with a galaxy-styled radar chart. Replace Textbook Explorer with a Duolingo-style vertical progress path.

**Architecture:** Add a `TextbookSelector` component and `activeTextbookId` state to `SkillMapLayout`. All downstream visualizations receive textbook-filtered data. Galaxy and Textbook Explorer get full rewrites. Other 5 visualizations get adapter logic to work with textbook-scoped data instead of global skills.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS v4 (`@import "tailwindcss"`), Framer Motion 12, Lucide React, SVG for visualizations. No testing framework available — manual visual verification via dev server.

---

## Task 1: Add Multiple Textbooks to Data Layer

**Files:**
- Modify: `data/sampleTextbook.ts:393-402` (change single TEXTBOOK_DATA to array)

**Step 1: Convert TEXTBOOK_DATA to AVAILABLE_TEXTBOOKS array**

Replace the single `TEXTBOOK_DATA` export with an array. Keep the existing textbook and add a second placeholder for future expansion.

In `data/sampleTextbook.ts`, change lines 393-402 from:

```typescript
export const TEXTBOOK_DATA: Textbook = {
  id: 'textbook-g3-math',
  nameEn: 'Grade 3 Mathematics',
  nameAr: 'الرياضيات للصف الثالث',
  gradeLevel: 3,
  subject: 'رياضيات',
  unitIds: ['unit-3m-01', 'unit-3m-02', 'unit-3m-03', 'unit-3m-04', 'unit-3m-05'],
};
```

To:

```typescript
export const AVAILABLE_TEXTBOOKS: Textbook[] = [
  {
    id: 'textbook-g3-math',
    nameEn: 'Grade 3 Mathematics',
    nameAr: 'الرياضيات للصف الثالث',
    gradeLevel: 3,
    subject: 'رياضيات',
    unitIds: ['unit-3m-01', 'unit-3m-02', 'unit-3m-03', 'unit-3m-04', 'unit-3m-05'],
  },
];

/** @deprecated Use AVAILABLE_TEXTBOOKS[0] or getTextbookById() instead */
export const TEXTBOOK_DATA: Textbook = AVAILABLE_TEXTBOOKS[0];

/** Get a textbook by its id */
export function getTextbookById(id: string): Textbook | undefined {
  return AVAILABLE_TEXTBOOKS.find(t => t.id === id);
}
```

**Step 2: Verify no compile errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors (TEXTBOOK_DATA still exported for backward compat)

**Step 3: Commit**

```bash
git add data/sampleTextbook.ts
git commit -m "feat: add AVAILABLE_TEXTBOOKS array with getTextbookById helper"
```

---

## Task 2: Create TextbookSelector Component

**Files:**
- Create: `components/skillmap/TextbookSelector.tsx`

**Step 1: Create the TextbookSelector component**

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, GraduationCap } from 'lucide-react';
import { Textbook, AVAILABLE_TEXTBOOKS } from '../../data/sampleTextbook';

interface Props {
  activeTextbook: Textbook;
  onSelect: (textbook: Textbook) => void;
  locale: string;
}

export const TextbookSelector: React.FC<Props> = ({ activeTextbook, onSelect, locale }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (tb: Textbook) => {
    onSelect(tb);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Active textbook button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-black text-slate-800">
            {locale === 'ar' ? activeTextbook.nameAr : activeTextbook.nameEn}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {locale === 'ar' ? `الصف ${activeTextbook.gradeLevel}` : `Grade ${activeTextbook.gradeLevel}`}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
          >
            {AVAILABLE_TEXTBOOKS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => handleSelect(tb)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  tb.id === activeTextbook.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  tb.id === activeTextbook.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-bold ${tb.id === activeTextbook.id ? 'text-blue-600' : 'text-slate-700'}`}>
                    {locale === 'ar' ? tb.nameAr : tb.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {locale === 'ar' ? `الصف ${tb.gradeLevel}` : `Grade ${tb.gradeLevel}`}
                  </div>
                </div>
                {tb.id === activeTextbook.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
```

**Step 2: Verify no compile errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add components/skillmap/TextbookSelector.tsx
git commit -m "feat: add TextbookSelector component with Duolingo-style dropdown"
```

---

## Task 3: Wire TextbookSelector into SkillMapLayout + Filter Data

**Files:**
- Modify: `components/skillmap/SkillMapLayout.tsx`

This is the critical integration task. We need to:
1. Add activeTextbook state (persisted in localStorage)
2. Add TextbookSelector to the layout
3. Filter masteries and category scores to only the selected textbook's data
4. Pass textbook info to child components

**Step 1: Add imports and state**

At the top of `SkillMapLayout.tsx`, add imports:

```typescript
import { TextbookSelector } from './TextbookSelector';
import { AVAILABLE_TEXTBOOKS, TEXTBOOK_DATA, UNIT_MAP, getKCsForUnit } from '../../data/sampleTextbook';
import { Textbook } from '../../data/sampleTextbook';
```

Inside the component, add state after existing state declarations:

```typescript
// Active textbook (persisted)
const [activeTextbook, setActiveTextbook] = useState<Textbook>(() => {
  const savedId = localStorage.getItem('string-quests-active-textbook');
  if (savedId) {
    const found = AVAILABLE_TEXTBOOKS.find(t => t.id === savedId);
    if (found) return found;
  }
  return AVAILABLE_TEXTBOOKS[0];
});

const handleTextbookChange = (tb: Textbook) => {
  setActiveTextbook(tb);
  localStorage.setItem('string-quests-active-textbook', tb.id);
  setSelectedSkill(null);
};
```

**Step 2: Compute textbook-scoped unit mastery scores for radar/galaxy**

Add a new `useMemo` block after the existing `categoryScores` memo:

```typescript
// Unit scores for Galaxy Radar (scoped to active textbook)
const unitScores = useMemo(() => {
  return activeTextbook.unitIds.map(unitId => {
    const unit = UNIT_MAP[unitId];
    if (!unit) return { unitId, nameAr: '', nameEn: '', score: 0 };

    // Get all KC IDs for this unit
    const unitKCIds = getKCsForUnit(unitId).map(kc => kc.id);

    // Find masteries that match these KCs (via skill-to-kc bridge or subject match)
    // For now, compute from filteredAttempts using calculateUnitMastery
    const { calculateUnitMastery } = require('../../utils/masteryEngine');
    const score = calculateUnitMastery(unitId, filteredAttempts);

    return {
      unitId,
      nameAr: unit.nameAr,
      nameEn: unit.nameEn,
      score,
    };
  });
}, [activeTextbook, filteredAttempts]);
```

Wait — we can't use `require` in a React component. We need to import `calculateUnitMastery` at the top. It's already exported from `masteryEngine.ts`. Let me fix the import approach:

Add to the existing masteryEngine import line:
```typescript
import { computeAllSkillMasteries, getGapAnalysis, getStrengthAnalysis, calculateUnitMastery } from '../../utils/masteryEngine';
```

Then the useMemo becomes:
```typescript
const unitScores = useMemo(() => {
  return activeTextbook.unitIds.map(unitId => {
    const unit = UNIT_MAP[unitId];
    if (!unit) return { unitId, nameAr: '', nameEn: '', score: 0 };
    const score = calculateUnitMastery(unitId, filteredAttempts);
    return {
      unitId,
      nameAr: unit.nameAr,
      nameEn: unit.nameEn,
      score,
    };
  });
}, [activeTextbook, filteredAttempts]);
```

**Step 3: Add TextbookSelector to JSX**

Insert the TextbookSelector between the header and SkillMapSummaryDashboard:

```tsx
{/* Textbook Selector */}
<TextbookSelector
  activeTextbook={activeTextbook}
  onSelect={handleTextbookChange}
  locale={locale}
/>
```

**Step 4: Update GalaxyView props**

Change the GalaxyView render to pass unitScores instead of masteries:

```tsx
{mode === 'galaxy' && (
  <GalaxyView
    unitScores={unitScores}
    locale={locale}
    activeTextbook={activeTextbook}
  />
)}
```

**Step 5: Update TextbookExplorerView props**

```tsx
{mode === 'textbook' && (
  <Suspense fallback={...}>
    <TextbookExplorerView
      activeTextbook={activeTextbook}
      attempts={filteredAttempts}
      locale={locale}
      onSelectSkill={setSelectedSkill}
    />
  </Suspense>
)}
```

**Step 6: Pass activeTextbook to other views that need scoping**

For HeatMapView, RadarView, KnowledgeTreeView, DnaStrandView, and MemoryTimelineView — these currently take `masteries: SkillMastery[]`. Since they operate on SkillMastery[], we can keep passing `masteries` for now (they'll still work with global data). Scoping these is a lower-priority follow-up.

**Step 7: Verify no compile errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`

**Step 8: Commit**

```bash
git add components/skillmap/SkillMapLayout.tsx
git commit -m "feat: wire TextbookSelector into SkillMapLayout with localStorage persistence"
```

---

## Task 4: Rewrite GalaxyView as Galaxy Radar

**Files:**
- Rewrite: `components/skillmap/GalaxyView.tsx` (full replacement)

This is the largest task. Replace the scattered constellation with a galaxy-styled radar chart where units are spokes.

**Step 1: Rewrite GalaxyView.tsx**

```tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Textbook, UNIT_MAP } from '../../data/sampleTextbook';

interface UnitScore {
  unitId: string;
  nameAr: string;
  nameEn: string;
  score: number;
}

interface Props {
  unitScores: UnitScore[];
  locale: string;
  activeTextbook: Textbook;
}

/** Deterministic pseudo-random from seed */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// --- Geometry ---
const W = 800;
const H = 600;
const CX = W / 2;
const CY = H / 2;
const MAX_RADIUS = 200;
const GRID_RINGS = [0.25, 0.5, 0.75, 1.0];
const LABEL_OFFSET = 30;

function polarToCart(fraction: number, axisIdx: number, totalAxes: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * axisIdx) / totalAxes - Math.PI / 2;
  const r = fraction * MAX_RADIUS;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function ringPoints(fraction: number, totalAxes: number): string {
  return Array.from({ length: totalAxes })
    .map((_, i) => {
      const { x, y } = polarToCart(fraction, i, totalAxes);
      return `${x},${y}`;
    })
    .join(' ');
}

function scorePolygonPoints(scores: number[], totalAxes: number): string {
  return scores
    .map((score, i) => {
      const frac = Math.max(0, Math.min(100, score)) / 100;
      const { x, y } = polarToCart(frac, i, totalAxes);
      return `${x},${y}`;
    })
    .join(' ');
}

function labelPos(axisIdx: number, totalAxes: number): { x: number; y: number; anchor: string } {
  const angle = (Math.PI * 2 * axisIdx) / totalAxes - Math.PI / 2;
  const r = MAX_RADIUS + LABEL_OFFSET;
  const x = CX + r * Math.cos(angle);
  const y = CY + r * Math.sin(angle);
  const cos = Math.cos(angle);
  const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
  return { x, y, anchor };
}

function getMasteryColor(score: number): string {
  if (score === 0) return '#64748b';
  if (score < 40) return '#ef4444';
  if (score < 70) return '#f59e0b';
  if (score < 90) return '#22c55e';
  return '#eab308';
}

export const GalaxyView: React.FC<Props> = ({ unitScores, locale, activeTextbook }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const axes = unitScores.length;

  const filledPoints = useMemo(
    () => scorePolygonPoints(unitScores.map(u => u.score), axes),
    [unitScores, axes]
  );

  const zeroPoints = useMemo(
    () => scorePolygonPoints(unitScores.map(() => 0), axes),
    [unitScores, axes]
  );

  const vertices = useMemo(
    () => unitScores.map((u, i) => {
      const frac = Math.max(0, Math.min(100, u.score)) / 100;
      return { ...polarToCart(frac, i, axes), score: u.score };
    }),
    [unitScores, axes]
  );

  const labels = useMemo(
    () => unitScores.map((u, i) => ({
      ...labelPos(i, axes),
      name: locale === 'ar' ? u.nameAr : u.nameEn,
      score: u.score,
    })),
    [unitScores, axes, locale]
  );

  const avgScore = useMemo(() => {
    if (unitScores.length === 0) return 0;
    return Math.round(unitScores.reduce((s, u) => s + u.score, 0) / unitScores.length);
  }, [unitScores]);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950 min-h-[500px] rounded-2xl overflow-hidden relative">
      {/* Ambient background stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {Array.from({ length: 80 }).map((_, i) => (
          <circle
            key={`bg-star-${i}`}
            cx={`${seededRandom(i * 7 + 3) * 100}%`}
            cy={`${seededRandom(i * 13 + 11) * 100}%`}
            r={seededRandom(i * 3 + 1) < 0.6 ? 0.6 : 1.1}
            fill="white"
            opacity={0.08 + seededRandom(i * 5 + 17) * 0.12}
          >
            <animate
              attributeName="opacity"
              values={`${0.06 + seededRandom(i * 5) * 0.08};${0.15 + seededRandom(i * 5) * 0.1};${0.06 + seededRandom(i * 5) * 0.08}`}
              dur={`${2 + seededRandom(i * 9 + 7) * 5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Main radar SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full min-h-[500px] relative" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Neon glow filter for polygon edge */}
          <filter id="galaxy-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Star point glow */}
          <filter id="galaxy-star-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial gradient for polygon fill */}
          <radialGradient id="galaxy-radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.05} />
            <stop offset="60%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.25} />
          </radialGradient>

          {/* Nebula gradients for high-mastery axes */}
          {unitScores.map((u, i) => {
            if (u.score < 75) return null;
            const { x, y } = polarToCart(u.score / 100, i, axes);
            return (
              <radialGradient key={`nebula-${i}`} id={`nebula-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getMasteryColor(u.score)} stopOpacity={0.2} />
                <stop offset="100%" stopColor={getMasteryColor(u.score)} stopOpacity={0} />
              </radialGradient>
            );
          })}
        </defs>

        {/* Grid rings */}
        {GRID_RINGS.map((frac, i) => (
          <polygon
            key={`ring-${i}`}
            points={ringPoints(frac, axes)}
            fill="none"
            stroke="white"
            strokeWidth={frac === 1 ? 0.8 : 0.4}
            strokeOpacity={frac === 1 ? 0.15 : 0.08}
          />
        ))}

        {/* Ring percentage labels */}
        {GRID_RINGS.map((frac) => (
          <text
            key={`ring-label-${frac}`}
            x={CX + 6}
            y={CY - frac * MAX_RADIUS + 12}
            fontSize={8}
            fill="white"
            fillOpacity={0.2}
            fontWeight={600}
          >
            {Math.round(frac * 100)}%
          </text>
        ))}

        {/* Axis spoke lines */}
        {Array.from({ length: axes }).map((_, i) => {
          const { x, y } = polarToCart(1, i, axes);
          return (
            <line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="white"
              strokeWidth={0.5}
              strokeOpacity={0.1}
            />
          );
        })}

        {/* Nebula clouds at high-mastery axes */}
        {unitScores.map((u, i) => {
          if (u.score < 75) return null;
          const { x, y } = polarToCart(u.score / 100, i, axes);
          const nebulaSize = 30 + (u.score - 75) * 1.2;
          return (
            <circle
              key={`nebula-cloud-${i}`}
              cx={x}
              cy={y}
              r={nebulaSize}
              fill={`url(#nebula-${i})`}
              opacity={0.8}
            >
              <animate
                attributeName="r"
                values={`${nebulaSize * 0.9};${nebulaSize * 1.1};${nebulaSize * 0.9}`}
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* Score polygon fill */}
        <motion.polygon
          points={filledPoints}
          fill="url(#galaxy-radar-fill)"
          initial={{ points: zeroPoints, opacity: 0 }}
          animate={{ points: filledPoints, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Score polygon neon edge */}
        <motion.polygon
          points={filledPoints}
          fill="none"
          stroke="#818cf8"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#galaxy-neon-glow)"
          initial={{ points: zeroPoints, opacity: 0 }}
          animate={{ points: filledPoints, opacity: 0.9 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />

        {/* Data point stars at vertices */}
        {vertices.map((v, i) => {
          const isMastered = unitScores[i].score >= 90;
          const color = getMasteryColor(unitScores[i].score);
          return (
            <g key={`vertex-${i}`}>
              {/* Pulsing glow for mastered */}
              {isMastered && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={10}
                  fill={color}
                  opacity={0.3}
                  filter="url(#galaxy-star-glow)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.15;0.4;0.15"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values="8;14;8"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Star point */}
              <motion.circle
                cx={v.x}
                cy={v.y}
                r={hoveredIdx === i ? 7 : 5}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
                filter="url(#galaxy-star-glow)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: hoveredIdx === i ? 7 : 5, opacity: 1 }}
                transition={{
                  r: { duration: 0.15 },
                  opacity: { duration: 0.6, delay: 0.8 + i * 0.1 },
                }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Hit area */}
              <circle
                cx={v.x}
                cy={v.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Hover tooltip */}
              {hoveredIdx === i && (
                <motion.g
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <rect
                    x={v.x - 22}
                    y={v.y - 30}
                    width={44}
                    height={22}
                    rx={8}
                    fill="#0f172a"
                    fillOpacity={0.9}
                    stroke="#818cf8"
                    strokeWidth={0.5}
                    strokeOpacity={0.4}
                  />
                  <text
                    x={v.x}
                    y={v.y - 16}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={800}
                    fill="white"
                  >
                    {v.score}%
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Unit name labels */}
        {labels.map((label, i) => (
          <text
            key={`label-${i}`}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill="white"
            fillOpacity={hoveredIdx !== null && hoveredIdx !== i ? 0.3 : 0.8}
            className="transition-opacity duration-150"
          >
            {label.name}
          </text>
        ))}

        {/* Center score */}
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontSize={28}
          fontWeight={900}
          fill="white"
          fillOpacity={0.9}
        >
          {avgScore}%
        </text>
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill="white"
          fillOpacity={0.4}
        >
          {locale === 'ar' ? 'الإتقان الكلي' : 'Overall Mastery'}
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-x-4 gap-y-1 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-xl">
        {[
          { label: locale === 'ar' ? 'ضعيف' : 'Weak', color: '#ef4444', range: '<40%' },
          { label: locale === 'ar' ? 'نامٍ' : 'Developing', color: '#f59e0b', range: '40-69%' },
          { label: locale === 'ar' ? 'متقدم' : 'Proficient', color: '#22c55e', range: '70-89%' },
          { label: locale === 'ar' ? 'متقن' : 'Mastered', color: '#eab308', range: '90%+' },
        ].map(item => (
          <div key={item.color} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-medium text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Step 2: Verify no compile errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add components/skillmap/GalaxyView.tsx
git commit -m "feat: rewrite GalaxyView as galaxy-styled radar chart with neon glow and nebula effects"
```

---

## Task 5: Rewrite TextbookExplorerView as Progress Path

**Files:**
- Rewrite: `components/skillmap/TextbookExplorerView.tsx` (full replacement)

Replace the collapsible tree with a Duolingo-style vertical progress path.

**Step 1: Rewrite TextbookExplorerView.tsx**

```tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Star } from 'lucide-react';
import {
  Textbook, UNIT_MAP, LESSON_MAP, PAGE_MAP,
  getKCsForPage,
} from '../../data/sampleTextbook';
import { AttemptRecord } from '../../utils/skillMapStorage';
import {
  calculatePageMastery, calculateUnitMastery,
  checkPrerequisites, SkillMastery,
} from '../../utils/masteryEngine';

interface Props {
  activeTextbook: Textbook;
  attempts: AttemptRecord[];
  locale: string;
  onSelectSkill: (skill: SkillMastery) => void;
}

function getMasteryColor(score: number): string {
  if (score === 0) return '#94a3b8';
  if (score < 40) return '#ef4444';
  if (score < 70) return '#FFC800';
  if (score < 90) return '#58CC02';
  return '#eab308';
}

function getStatusIcon(score: number, isLocked: boolean) {
  if (isLocked) return <Lock className="w-4 h-4 text-slate-400" />;
  if (score >= 90) return <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />;
  if (score > 0) return <Check className="w-4 h-4 text-white" />;
  return null;
}

export const TextbookExplorerView: React.FC<Props> = ({ activeTextbook, attempts, locale, onSelectSkill }) => {
  // Build flat list of all pages with mastery and lock status
  const pathNodes = useMemo(() => {
    const nodes: {
      pageId: string;
      pageName: string;
      pageNumber: number;
      unitId: string;
      unitName: string;
      unitNumber: number;
      unitColor: string;
      lessonName: string;
      mastery: number;
      isLocked: boolean;
      isFirstInUnit: boolean;
    }[] = [];

    for (const unitId of activeTextbook.unitIds) {
      const unit = UNIT_MAP[unitId];
      if (!unit) continue;
      const unitMastery = calculateUnitMastery(unitId, attempts);
      const unitColor = getMasteryColor(unitMastery);
      let isFirstInUnit = true;

      for (const lessonId of unit.lessonIds) {
        const lesson = LESSON_MAP[lessonId];
        if (!lesson) continue;

        for (const pageId of lesson.pageIds) {
          const page = PAGE_MAP[pageId];
          if (!page) continue;

          const mastery = calculatePageMastery(pageId, attempts);

          // Check if any KC on this page has unmet prerequisites
          const kcIds = page.kcIds;
          const isLocked = kcIds.some(kcId => {
            const unmet = checkPrerequisites(kcId, attempts);
            return unmet.length > 0;
          });

          nodes.push({
            pageId,
            pageName: locale === 'ar' ? page.nameAr : page.nameEn,
            pageNumber: page.pageNumber,
            unitId,
            unitName: locale === 'ar' ? unit.nameAr : unit.nameEn,
            unitNumber: unit.unitNumber,
            unitColor,
            lessonName: locale === 'ar' ? lesson.nameAr : lesson.nameEn,
            mastery,
            isLocked,
            isFirstInUnit,
          });

          isFirstInUnit = false;
        }
      }
    }

    return nodes;
  }, [activeTextbook, attempts, locale]);

  // Find the "current" node (first with mastery < 90 and not locked)
  const currentNodeIdx = useMemo(() => {
    for (let i = 0; i < pathNodes.length; i++) {
      if (!pathNodes[i].isLocked && pathNodes[i].mastery < 90) return i;
    }
    return -1;
  }, [pathNodes]);

  return (
    <div className="relative py-8 px-4 max-w-md mx-auto">
      {/* Vertical path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

      {pathNodes.map((node, idx) => {
        const isCurrent = idx === currentNodeIdx;
        const nodeSize = isCurrent ? 56 : 48;
        const color = getMasteryColor(node.mastery);

        // S-curve: alternate left/right within each cluster of 3
        const sideOffset = Math.sin((idx / 2.5) * Math.PI) * 60;

        return (
          <React.Fragment key={node.pageId}>
            {/* Unit header separator */}
            {node.isFirstInUnit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="relative z-10 mb-6 mt-4"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl mx-auto max-w-xs"
                  style={{ backgroundColor: `${node.unitColor}15`, border: `1px solid ${node.unitColor}30` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: node.unitColor }}
                  >
                    {node.unitNumber}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{node.unitName}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Path node */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.04 }}
              className="relative z-10 flex items-center justify-center mb-6"
              style={{ marginLeft: sideOffset }}
            >
              <button
                onClick={() => {
                  if (!node.isLocked) {
                    // Create a minimal SkillMastery-like object for the detail panel
                    // (The detail panel will need to handle page-level data)
                  }
                }}
                disabled={node.isLocked}
                className="group relative flex flex-col items-center"
              >
                {/* Current node pulsing ring */}
                {isCurrent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="rounded-full border-2"
                      style={{ width: nodeSize + 12, height: nodeSize + 12, borderColor: color }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                )}

                {/* Node circle */}
                <div
                  className={`flex items-center justify-center rounded-full font-black text-sm transition-transform ${
                    node.isLocked ? 'opacity-50' : 'group-hover:scale-110'
                  }`}
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                    backgroundColor: node.isLocked ? '#e2e8f0' : node.mastery === 0 ? '#f1f5f9' : color,
                    border: node.mastery === 0 && !node.isLocked ? '2px dashed #cbd5e1' : 'none',
                    color: node.isLocked || node.mastery === 0 ? '#94a3b8' : 'white',
                  }}
                >
                  {getStatusIcon(node.mastery, node.isLocked) || (
                    <span className="text-lg">{node.pageNumber}</span>
                  )}
                </div>

                {/* Page name label */}
                <div className={`mt-2 text-center max-w-[120px] ${node.isLocked ? 'opacity-40' : ''}`}>
                  <div className="text-[10px] font-bold text-slate-600 truncate">
                    {node.pageName}
                  </div>
                  {node.mastery > 0 && !node.isLocked && (
                    <div className="text-[10px] font-black" style={{ color }}>
                      {node.mastery}%
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* End marker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: pathNodes.length * 0.04 + 0.3 }}
        className="relative z-10 flex justify-center mt-4"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
      </motion.div>
    </div>
  );
};
```

**Step 2: Verify no compile errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add components/skillmap/TextbookExplorerView.tsx
git commit -m "feat: rewrite TextbookExplorerView as Duolingo-style vertical progress path"
```

---

## Task 6: Fix All TypeScript Errors and Integration

**Files:**
- Modify: `components/skillmap/SkillMapLayout.tsx` (finalize all prop changes)

After Tasks 1-5, there will likely be TypeScript errors from changed props. This task fixes them all.

**Step 1: Run tsc and check all errors**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1`

**Step 2: Fix each error**

Common fixes expected:
- GalaxyView no longer accepts `masteries` / `onSelectSkill` — update SkillMapLayout to pass `unitScores` / `activeTextbook`
- TextbookExplorerView no longer accepts `masteries` — update to pass `activeTextbook` / `attempts`
- Any other components that import from changed files

**Step 3: Verify build passes**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors from Galaxy Radar and Progress Path rewrites"
```

---

## Task 7: Visual Verification with Dev Server

**Files:** None (testing only)

**Step 1: Start dev server**

Run: `cd D:/AI/Quests/String-Quests- && export PATH="/c/Program Files/nodejs:$PATH" && npx vite --host --port 3000`

**Step 2: Navigate to skill map page**

Open: `http://localhost:3000/skill-map`

Verify:
1. Textbook selector appears at top with "Grade 3 Mathematics" selected
2. Click Galaxy mode → shows galaxy-styled radar with 5 unit spokes
3. Click Textbook mode → shows vertical winding path with page nodes
4. Neon glow and nebula effects visible on Galaxy Radar
5. Progress path has S-curve layout with colored nodes
6. Unit headers separate groups on the progress path
7. All other visualization modes still work (Heat Map, Radar, Tree, DNA, Memory)

**Step 3: Test textbook selector**

1. Click the textbook dropdown
2. Verify dropdown opens with current textbook highlighted
3. Click outside → dropdown closes
4. Refresh page → same textbook is still selected (localStorage persistence)

**Step 4: Commit any fixes found during visual testing**

```bash
git add -A
git commit -m "fix: visual polish from testing Galaxy Radar and Progress Path"
```

---

## Task Summary

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Add AVAILABLE_TEXTBOOKS array | — |
| 2 | Create TextbookSelector component | 1 |
| 3 | Wire TextbookSelector into SkillMapLayout | 1, 2 |
| 4 | Rewrite GalaxyView as Galaxy Radar | 3 |
| 5 | Rewrite TextbookExplorerView as Progress Path | 3 |
| 6 | Fix all TypeScript errors | 4, 5 |
| 7 | Visual verification | 6 |
