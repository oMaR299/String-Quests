# Curriculum Admin Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/curriculum-admin` page that displays extracted curriculum data (2,017 KCs across 13 grades) with grade selector, summary cards, drill-down explorer, analytics charts, and per-grade JSON download.

**Architecture:** Single-page React component at a new route. Reads `MATH_CURRICULUM` from existing `data/curricula/` exports. No backend — all client-side. 5 new components in `components/curriculum-admin/`. Inline SVG charts (no chart library).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion 12, Lucide React icons

---

## Reference: Key Data Structures

```typescript
// data/curricula/types.ts
CurriculumFramework { id, subject, subjectEn, grades: GradeCurriculum[] }
GradeCurriculum { gradeLevel: number, domains: Domain[] }
Domain { id, nameAr, nameEn, standards: Standard[] }
Standard { id, nameAr, nameEn, learningOutcomes: LearningOutcome[] }
LearningOutcome { id, outcomeAr, outcomeEn, bloomLevel: 1-6, indicators: string[], knowledgeComponents: CurriculumKC[] }
CurriculumKC { id, nameAr, nameEn, bloomLevel: 1-6, difficulty: 1-5, prerequisiteKcIds[], tags[], standardCode }

// data/curricula/index.ts — already exported helpers:
MATH_CURRICULUM, getGradeCurriculum(grade), getDomainsForGrade(grade), getKCsForGrade(grade)
```

## Reference: Project Conventions

- Tailwind v4: use `@import "tailwindcss"` in CSS (NOT `@tailwind` directives)
- Components: PascalCase files, default exports for pages, named exports for components
- RTL: Arabic is primary language, use `dir="rtl"` context from `useI18n()`
- Icons: import from `lucide-react`
- Animations: `framer-motion` for enter/exit transitions
- Dev server: `export PATH="/c/Program Files/nodejs:$PATH" && npx vite --host`
- Role routes use full-screen self-contained layouts (no AppShell)

---

### Task 1: Create CurriculumAdminPage shell + route

**Files:**
- Create: `components/curriculum-admin/CurriculumAdminPage.tsx`
- Modify: `App.tsx`
- Modify: `layouts/Sidebar.tsx`

**Step 1: Create the page component shell**

```tsx
// components/curriculum-admin/CurriculumAdminPage.tsx
import React, { useState } from 'react';
import { ArrowRight, Database } from 'lucide-react';
import { MATH_CURRICULUM } from '../../data/curricula';

const GRADES = MATH_CURRICULUM.grades;

export const CurriculumAdminPage: React.FC = () => {
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0);
  const grade = GRADES[selectedGradeIndex];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold">مستعرض المنهاج</h1>
          <span className="text-sm text-slate-400">Curriculum Explorer</span>
        </div>
        <button
          onClick={() => window.location.href = '/home'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
        >
          <span>خروج</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Grade selector placeholder */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-slate-500">Grade: {grade.gradeLevel}</p>
        </div>
      </main>
    </div>
  );
};
```

**Step 2: Add route to App.tsx**

In `App.tsx`, add the lazy import after the other page imports (line ~17):
```tsx
const CurriculumAdminPage = lazy(() => import('./components/curriculum-admin/CurriculumAdminPage').then(m => ({ default: m.CurriculumAdminPage })));
```

Add route after line 53 (after `/admin/*`):
```tsx
<Route path="/curriculum-admin" element={<CurriculumAdminPage />} />
```

**Step 3: Add sidebar Dev link**

In `layouts/Sidebar.tsx`, add import `Database` from `lucide-react` and add to `DEV_TOGGLES` array (after line 43):
```tsx
{ label: 'Curriculum', icon: Database, route: '/curriculum-admin', color: 'text-cyan-400' },
```

**Step 4: Verify**

Run: `export PATH="/c/Program Files/nodejs:$PATH" && npx vite --host`
Navigate to: `http://localhost:3000/curriculum-admin`
Expected: Dark header with "مستعرض المنهاج", exit button, placeholder content

**Step 5: Commit**

```bash
git add components/curriculum-admin/CurriculumAdminPage.tsx App.tsx layouts/Sidebar.tsx
git commit -m "feat: add curriculum admin page shell with route"
```

---

### Task 2: Build GradeSelector with download button

**Files:**
- Create: `components/curriculum-admin/GradeSelector.tsx`
- Modify: `components/curriculum-admin/CurriculumAdminPage.tsx`

**Step 1: Create GradeSelector component**

```tsx
// components/curriculum-admin/GradeSelector.tsx
import React from 'react';
import { Download } from 'lucide-react';
import { MATH_CURRICULUM } from '../../data/curricula';
import type { GradeCurriculum } from '../../data/curricula';

interface Props {
  grades: GradeCurriculum[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function gradeLabel(grade: GradeCurriculum, index: number): string {
  if (index === 12) return 'الصف 12 تجاري';
  return `الصف ${grade.gradeLevel}`;
}

function downloadGradeJSON(grade: GradeCurriculum, index: number) {
  const data = {
    gradeLevel: grade.gradeLevel,
    isBusinessMath: index === 12,
    subject: MATH_CURRICULUM.subject,
    subjectEn: MATH_CURRICULUM.subjectEn,
    domains: grade.domains,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = index === 12
    ? 'grade12b-math.json'
    : `grade${grade.gradeLevel}-math.json`;
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export const GradeSelector: React.FC<Props> = ({ grades, selectedIndex, onSelect }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-500">اختر الصف الدراسي</h2>
        <button
          onClick={() => downloadGradeJSON(grades[selectedIndex], selectedIndex)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>تحميل JSON</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {grades.map((g, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              i === selectedIndex
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {gradeLabel(g, i)}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Step 2: Wire into CurriculumAdminPage**

Replace the placeholder `<div>` in the `<main>` section with:
```tsx
import { GradeSelector } from './GradeSelector';
// ...
<GradeSelector
  grades={GRADES}
  selectedIndex={selectedGradeIndex}
  onSelect={setSelectedGradeIndex}
/>
```

**Step 3: Verify**

Navigate to: `http://localhost:3000/curriculum-admin`
Expected: 13 grade chips, clicking switches selection, download button triggers JSON file download

**Step 4: Commit**

```bash
git add components/curriculum-admin/GradeSelector.tsx components/curriculum-admin/CurriculumAdminPage.tsx
git commit -m "feat: add grade selector with JSON download"
```

---

### Task 3: Build SummaryCards

**Files:**
- Create: `components/curriculum-admin/SummaryCards.tsx`
- Modify: `components/curriculum-admin/CurriculumAdminPage.tsx`

**Step 1: Create SummaryCards component**

```tsx
// components/curriculum-admin/SummaryCards.tsx
import React from 'react';
import { Layers, BookOpen, Target, Zap } from 'lucide-react';
import type { GradeCurriculum } from '../../data/curricula';

interface Props {
  grade: GradeCurriculum;
}

function countStandards(grade: GradeCurriculum): number {
  return grade.domains.reduce((sum, d) => sum + d.standards.length, 0);
}

function countOutcomes(grade: GradeCurriculum): number {
  return grade.domains.reduce((sum, d) =>
    sum + d.standards.reduce((s2, std) => s2 + std.learningOutcomes.length, 0), 0);
}

function countKCs(grade: GradeCurriculum): number {
  return grade.domains.reduce((sum, d) =>
    sum + d.standards.reduce((s2, std) =>
      s2 + std.learningOutcomes.reduce((s3, lo) => s3 + lo.knowledgeComponents.length, 0), 0), 0);
}

function difficultyDistribution(grade: GradeCurriculum): number[] {
  const dist = [0, 0, 0, 0, 0]; // difficulty 1-5
  for (const d of grade.domains)
    for (const std of d.standards)
      for (const lo of std.learningOutcomes)
        for (const kc of lo.knowledgeComponents)
          dist[kc.difficulty - 1]++;
  return dist;
}

const DIFFICULTY_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

export const SummaryCards: React.FC<Props> = ({ grade }) => {
  const domains = grade.domains.length;
  const standards = countStandards(grade);
  const outcomes = countOutcomes(grade);
  const kcs = countKCs(grade);
  const diffDist = difficultyDistribution(grade);
  const maxDiff = Math.max(...diffDist, 1);

  const cards = [
    { icon: Layers, label: 'المجالات', labelEn: 'Domains', value: domains, color: 'text-blue-600 bg-blue-50' },
    { icon: BookOpen, label: 'المعايير', labelEn: 'Standards', value: standards, color: 'text-purple-600 bg-purple-50' },
    { icon: Target, label: 'نتاجات التعلم', labelEn: 'Outcomes', value: outcomes, color: 'text-amber-600 bg-amber-50' },
    { icon: Zap, label: 'مكونات المعرفة', labelEn: 'KCs', value: kcs, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.labelEn} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
              <c.icon className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400">{c.labelEn}</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{c.value}</p>
          <p className="text-sm text-slate-500">{c.label}</p>
        </div>
      ))}
      {/* Difficulty mini-bar inside the KC card area */}
      <div className="col-span-2 lg:col-span-4 bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-500 mb-2">توزيع الصعوبة <span className="text-slate-300">Difficulty Distribution</span></p>
        <div className="flex items-end gap-1 h-12">
          {diffDist.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(count / maxDiff) * 100}%`,
                  minHeight: count > 0 ? 4 : 0,
                  backgroundColor: DIFFICULTY_COLORS[i],
                }}
              />
              <span className="text-[10px] text-slate-400">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-slate-300">
          <span>سهل</span>
          <span>صعب</span>
        </div>
      </div>
    </div>
  );
};
```

**Step 2: Wire into CurriculumAdminPage**

Add below `<GradeSelector>`:
```tsx
import { SummaryCards } from './SummaryCards';
// ...
<SummaryCards grade={grade} />
```

**Step 3: Verify**

Expected: 4 stat cards (Domains, Standards, Outcomes, KCs) + difficulty bar. Switch grades and numbers update.

**Step 4: Commit**

```bash
git add components/curriculum-admin/SummaryCards.tsx components/curriculum-admin/CurriculumAdminPage.tsx
git commit -m "feat: add summary stat cards for curriculum dashboard"
```

---

### Task 4: Build CurriculumExplorer (collapsible tree-table)

**Files:**
- Create: `components/curriculum-admin/CurriculumExplorer.tsx`
- Modify: `components/curriculum-admin/CurriculumAdminPage.tsx`

**Step 1: Create CurriculumExplorer component**

This is the largest component. It renders a collapsible tree with 4 levels: Domain → Standard → LearningOutcome → KCs.

```tsx
// components/curriculum-admin/CurriculumExplorer.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import type { GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC } from '../../data/curricula';

interface Props {
  grade: GradeCurriculum;
}

const BLOOM_LABELS: Record<number, { ar: string; en: string; color: string }> = {
  1: { ar: 'تذكر', en: 'Remember', color: 'bg-slate-200 text-slate-700' },
  2: { ar: 'فهم', en: 'Understand', color: 'bg-blue-100 text-blue-700' },
  3: { ar: 'تطبيق', en: 'Apply', color: 'bg-green-100 text-green-700' },
  4: { ar: 'تحليل', en: 'Analyze', color: 'bg-yellow-100 text-yellow-700' },
  5: { ar: 'تقييم', en: 'Evaluate', color: 'bg-orange-100 text-orange-700' },
  6: { ar: 'إبداع', en: 'Create', color: 'bg-red-100 text-red-700' },
};

function BloomBadge({ level }: { level: number }) {
  const b = BLOOM_LABELS[level] || BLOOM_LABELS[1];
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.color}`}>
      {b.ar} ({level})
    </span>
  );
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {'★'.repeat(level)}{'☆'.repeat(5 - level)}
    </span>
  );
}

function KCRow({ kc }: { kc: CurriculumKC }) {
  return (
    <div className="pr-16 py-2 px-4 border-b border-slate-50 hover:bg-slate-50 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 font-medium">{kc.nameAr}</p>
          <p className="text-slate-400 text-xs">{kc.nameEn}</p>
          {kc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {kc.tags.slice(0, 5).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BloomBadge level={kc.bloomLevel} />
          <DifficultyStars level={kc.difficulty} />
        </div>
      </div>
    </div>
  );
}

function OutcomeRow({ outcome }: { outcome: LearningOutcome }) {
  const [open, setOpen] = useState(false);
  const kcCount = outcome.knowledgeComponents.length;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full pr-12 py-2 px-4 flex items-center gap-2 hover:bg-amber-50/50 text-sm text-right"
      >
        {open ? <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" /> : <ChevronLeft className="w-3 h-3 text-slate-400 shrink-0" />}
        <span className="flex-1 text-slate-700">{outcome.outcomeAr}</span>
        <BloomBadge level={outcome.bloomLevel} />
        <span className="text-xs text-slate-400">{kcCount} KC</span>
      </button>
      {open && outcome.knowledgeComponents.map(kc => <KCRow key={kc.id} kc={kc} />)}
    </div>
  );
}

function StandardRow({ standard }: { standard: Standard }) {
  const [open, setOpen] = useState(false);
  const outcomeCount = standard.learningOutcomes.length;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full pr-8 py-2.5 px-4 flex items-center gap-2 hover:bg-purple-50/50 text-sm font-medium text-right"
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />}
        <span className="flex-1 text-slate-800">{standard.nameAr}</span>
        <span className="text-xs text-slate-400">{standard.nameEn}</span>
        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold">{outcomeCount} نتاج</span>
      </button>
      {open && standard.learningOutcomes.map(lo => <OutcomeRow key={lo.id} outcome={lo} />)}
    </div>
  );
}

function DomainRow({ domain, index }: { domain: Domain; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const stdCount = domain.standards.length;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-3 px-4 flex items-center gap-3 bg-white hover:bg-slate-50 text-right"
      >
        {open ? <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronLeft className="w-5 h-5 text-slate-500 shrink-0" />}
        <div className="flex-1">
          <p className="text-base font-bold text-slate-800">{domain.nameAr}</p>
          <p className="text-xs text-slate-400">{domain.nameEn}</p>
        </div>
        <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-bold">{stdCount} معيار</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/50 divide-y divide-slate-100">
          {domain.standards.map(std => <StandardRow key={std.id} standard={std} />)}
        </div>
      )}
    </div>
  );
}

export const CurriculumExplorer: React.FC<Props> = ({ grade }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-500">
        مستعرض المنهاج <span className="text-slate-300">Curriculum Explorer</span>
      </h2>
      {grade.domains.map((d, i) => (
        <DomainRow key={d.id} domain={d} index={i} />
      ))}
    </div>
  );
};
```

**Step 2: Wire into CurriculumAdminPage**

Add below `<SummaryCards>`:
```tsx
import { CurriculumExplorer } from './CurriculumExplorer';
// ...
<CurriculumExplorer grade={grade} />
```

**Step 3: Verify**

Expected: Collapsible tree. First domain expanded by default. Click to expand/collapse at each level. KCs show Arabic/English text, Bloom badge, difficulty stars, tags.

**Step 4: Commit**

```bash
git add components/curriculum-admin/CurriculumExplorer.tsx components/curriculum-admin/CurriculumAdminPage.tsx
git commit -m "feat: add collapsible curriculum explorer tree"
```

---

### Task 5: Build CurriculumCharts (inline SVG)

**Files:**
- Create: `components/curriculum-admin/CurriculumCharts.tsx`
- Modify: `components/curriculum-admin/CurriculumAdminPage.tsx`

**Step 1: Create CurriculumCharts component**

3 bar charts using inline SVG — no chart library needed.

```tsx
// components/curriculum-admin/CurriculumCharts.tsx
import React from 'react';
import type { GradeCurriculum } from '../../data/curricula';

interface Props {
  grade: GradeCurriculum;
}

function collectStats(grade: GradeCurriculum) {
  const bloomDist = [0, 0, 0, 0, 0, 0]; // levels 1-6
  const diffDist = [0, 0, 0, 0, 0]; // difficulty 1-5
  const domainKCs: { name: string; count: number }[] = [];

  for (const d of grade.domains) {
    let dCount = 0;
    for (const std of d.standards) {
      for (const lo of std.learningOutcomes) {
        for (const kc of lo.knowledgeComponents) {
          bloomDist[kc.bloomLevel - 1]++;
          diffDist[kc.difficulty - 1]++;
          dCount++;
        }
      }
    }
    domainKCs.push({ name: d.nameAr, count: dCount });
  }

  return { bloomDist, diffDist, domainKCs };
}

const BLOOM_COLORS = ['#94a3b8', '#60a5fa', '#34d399', '#fbbf24', '#fb923c', '#f87171'];
const BLOOM_NAMES = ['تذكر', 'فهم', 'تطبيق', 'تحليل', 'تقييم', 'إبداع'];
const DIFF_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
const DOMAIN_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b'];

function BarChart({ data, colors, labels, title }: {
  data: number[];
  colors: string[];
  labels: string[];
  title: string;
}) {
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;
  const chartH = 120;
  const chartW = 300;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-600 mb-3">{title}</p>
      <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full" dir="ltr">
        {data.map((val, i) => {
          const barH = (val / max) * chartH;
          const x = i * (chartW / data.length) + 4;
          const w = chartW / data.length - 8;
          return (
            <g key={i}>
              <rect
                x={x} y={chartH - barH} width={w} height={barH}
                rx={4} fill={colors[i % colors.length]}
              />
              <text x={x + w / 2} y={chartH - barH - 4} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                {val > 0 ? val : ''}
              </text>
              <text x={x + w / 2} y={chartH + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HorizontalBarChart({ data, title }: {
  data: { name: string; count: number }[];
  title: string;
}) {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm font-bold text-slate-600 mb-3">{title}</p>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-40 text-right shrink-0 truncate">{d.name}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(d.count / max) * 100}%`,
                  backgroundColor: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 w-8">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CurriculumCharts: React.FC<Props> = ({ grade }) => {
  const { bloomDist, diffDist, domainKCs } = collectStats(grade);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-500">
        تحليلات <span className="text-slate-300">Analytics</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart
          data={bloomDist}
          colors={BLOOM_COLORS}
          labels={BLOOM_NAMES}
          title="توزيع مستوى بلوم — Bloom's Level Distribution"
        />
        <BarChart
          data={diffDist}
          colors={DIFF_COLORS}
          labels={['1', '2', '3', '4', '5']}
          title="توزيع الصعوبة — Difficulty Distribution"
        />
      </div>
      <HorizontalBarChart
        data={domainKCs}
        title="عدد المكونات المعرفية لكل مجال — KCs per Domain"
      />
    </div>
  );
};
```

**Step 2: Wire into CurriculumAdminPage**

Add below `<CurriculumExplorer>`:
```tsx
import { CurriculumCharts } from './CurriculumCharts';
// ...
<CurriculumCharts grade={grade} />
```

**Step 3: Verify**

Expected: 2 bar charts (Bloom, Difficulty) + 1 horizontal bar chart (KCs per domain). Switch grades and charts update.

**Step 4: Commit**

```bash
git add components/curriculum-admin/CurriculumCharts.tsx components/curriculum-admin/CurriculumAdminPage.tsx
git commit -m "feat: add curriculum analytics charts"
```

---

### Task 6: Final assembly + visual verification

**Files:**
- Modify: `components/curriculum-admin/CurriculumAdminPage.tsx` (final polish)

**Step 1: Ensure CurriculumAdminPage imports all 4 sub-components**

The final page component should have this structure in `<main>`:
```tsx
<main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
  <GradeSelector grades={GRADES} selectedIndex={selectedGradeIndex} onSelect={setSelectedGradeIndex} />
  <SummaryCards grade={grade} />
  <CurriculumExplorer grade={grade} />
  <CurriculumCharts grade={grade} />
</main>
```

**Step 2: Visual verification**

Navigate to: `http://localhost:3000/curriculum-admin`

Check:
- [ ] Grade selector shows 13 chips
- [ ] Clicking grade chip updates all sections
- [ ] Download button triggers JSON download
- [ ] Summary cards show correct counts
- [ ] Explorer tree is collapsible (Domain → Standard → Outcome → KC)
- [ ] KC details show Arabic/English, Bloom, difficulty, tags
- [ ] Charts render correctly for each grade
- [ ] Exit button returns to /home
- [ ] Sidebar shows "Curriculum" in Dev section

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete curriculum admin dashboard with explorer, charts, and JSON download"
```

---

## Dependency Graph

```
Task 1 (page shell + route)
  └─→ Task 2 (grade selector + download)
       └─→ Task 3 (summary cards)
            └─→ Task 4 (curriculum explorer tree)
                 └─→ Task 5 (analytics charts)
                      └─→ Task 6 (final assembly + verification)
```

All tasks are sequential — each builds on the previous.
