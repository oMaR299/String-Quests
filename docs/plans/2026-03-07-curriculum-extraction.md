# Curriculum Extraction — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract real Math KCs from the official Jordanian NCCD framework PDF and integrate them into the app, replacing sample data.

**Architecture:** Download the 173-page Math Framework PDF, convert grade-specific pages (62-146) to images, read each with Claude Vision to extract the 5-column table data (Domain/Axis/Standard/Learning Outcomes/Performance Indicators), output structured JSON matching the app's data model, then wire into the existing Skill Map.

**Tech Stack:** Python 3.10 + PyMuPDF (PDF→PNG), Claude Vision (OCR), TypeScript (data files), React (dashboard integration)

---

## PDF Structure Reference

```
Pages 1-12:   Cover, credits, TOC, intro, methodology (SKIP)
Pages 13-57:  Scope & Sequence Matrix — standards across all grades by domain (EXTRACT for reference)
Pages 58-61:  Learning Standards overview diagrams (SKIP — info captured in indicators)
Pages 62-146: Performance Indicators BY GRADE (PRIMARY TARGET)
  Grade 1:  p.62-65  (4 pages)
  Grade 2:  p.66-71  (6 pages)
  Grade 3:  p.72-78  (7 pages)
  Grade 4:  p.79-85  (7 pages)
  Grade 5:  p.86-92  (7 pages)
  Grade 6:  p.93-99  (7 pages)
  Grade 7:  p.100-106 (7 pages)
  Grade 8:  p.107-113 (7 pages)
  Grade 9:  p.114-120 (7 pages)
  Grade 10: p.121-127 (7 pages)
  Grade 11: p.128-133 (6 pages)
  Grade 12: p.134-140 (7 pages)
  Grade 12 Business: p.141-146 (6 pages)
Pages 147-173: Teaching strategies, references, appendices (SKIP)
```

## Table Format (per grade page)

Each page has a table with 5 columns (RTL):
| مؤشرات الأداء | نتاجات التعلم | المعيار | المحور | المجال |
| Performance Indicators | Learning Outcomes | Standard | Axis | Domain |

- **المجال (Domain)** → maps to `Unit` in our model (e.g., الهندسة والقياس)
- **المحور (Axis)** → sub-grouping within domain (not always present)
- **المعيار (Standard)** → maps to `Lesson` (e.g., الكتل, السعات, الوقت)
- **نتاجات التعلم (Learning Outcomes)** → maps to `Page` (bullet points)
- **مؤشرات الأداء (Performance Indicators)** → maps to `KnowledgeComponent` (bullet points = atomic skills)

## 4 Math Domains

1. **الأعداد والعمليات** — Numbers & Operations
2. **الأنماط والجبر والاقترانات** — Patterns, Algebra & Functions
3. **الهندسة والقياس** — Geometry & Measurement
4. **تحليل البيانات والاحتمالات** — Data Analysis & Probability

---

### Task 1: Convert all grade indicator pages to PNG

**Files:**
- Script: (inline Python, no file needed)
- Output: `scripts/curriculum-data/pages/math/page-062.png` through `page-146.png`

**Step 1: Convert pages 62-146 to PNG at 200 DPI**

```python
import fitz
doc = fitz.open('D:/AI/Quests/String-Quests-/scripts/curriculum-data/math-framework.pdf')
for i in range(61, 146):  # 0-indexed: pages 62-146
    page = doc[i]
    mat = fitz.Matrix(200/72, 200/72)
    pix = page.get_pixmap(matrix=mat)
    pix.save(f'D:/AI/Quests/String-Quests-/scripts/curriculum-data/pages/math/page-{i+1:03d}.png')
doc.close()
```

Expected: 85 PNG files in `pages/math/`

**Step 2: Verify output**

Run: `ls scripts/curriculum-data/pages/math/ | wc -l`
Expected: 85+ files

---

### Task 2: Extract Grade 3 data (pages 72-78) — PILOT

**Files:**
- Read: `scripts/curriculum-data/pages/math/page-072.png` through `page-078.png`
- Create: `data/curricula/grade3-math-raw.json`

**Step 1: Read each page image with Claude Vision**

For each page 72-78, read the image and extract the table data. Output as JSON:

```json
{
  "gradeLevel": 3,
  "domain": "الهندسة والقياس",
  "domainEn": "Geometry & Measurement",
  "axis": "القياس",
  "standard": "الكتل",
  "standardEn": "Mass",
  "learningOutcomes": [
    {
      "outcomeAr": "يتعرف وحدات قياس كتل معيارية، ويُجري تحويلات بينها، ويستخدمها في حل المسائل",
      "indicators": [
        "يميّز وحدتي قياس الكتلة: الغرام، والكيلوغرام",
        "يختار وحدة قياس الكتلة المناسبة (الغرام، أو الكيلوغرام)",
        "يحل مسائل حياتية بسيطة تتضمن مقارنات وتقدير كُتل"
      ]
    }
  ]
}
```

**Step 2: Compile into grade3-math-raw.json**

Merge all page extractions into a single JSON array organized by domain → standard → outcomes → indicators.

**Step 3: Validate the extraction**

Check: every domain from the scope matrix is represented, indicators count is reasonable (expect 40-80 per grade).

---

### Task 3: Extract remaining grades (parallel agents per grade)

**Files:**
- Read: PNG images per grade range
- Create: `data/curricula/grade{N}-math-raw.json` for each grade 1-12

**Approach:** Dispatch parallel agents, one per grade (or 2-3 grades per agent to limit concurrency). Each agent:
1. Reads its grade's page images
2. Extracts the 5-column table data
3. Outputs a JSON file

Agent assignments (batch to reduce concurrency):
- Agent A: Grades 1-2 (p.62-71, 10 pages)
- Agent B: Grades 4-5 (p.79-92, 14 pages)
- Agent C: Grades 6-7 (p.93-106, 14 pages)
- Agent D: Grades 8-9 (p.107-120, 14 pages)
- Agent E: Grades 10-11 (p.121-133, 13 pages)
- Agent F: Grades 12 + 12 Business (p.134-146, 13 pages)

(Grade 3 already extracted in Task 2)

---

### Task 4: Create TypeScript types for curriculum data

**Files:**
- Create: `data/curricula/types.ts`

**Step 1: Write the type definitions**

```typescript
import { BloomLevel } from '../skillTaxonomy';

export interface CurriculumFramework {
  id: string;
  subject: string;
  subjectEn: string;
  grades: GradeCurriculum[];
}

export interface GradeCurriculum {
  gradeLevel: number;
  domains: Domain[];
}

export interface Domain {
  id: string;
  nameAr: string;
  nameEn: string;
  standards: Standard[];
}

export interface Standard {
  id: string;
  nameAr: string;
  nameEn: string;
  learningOutcomes: LearningOutcome[];
}

export interface LearningOutcome {
  id: string;
  outcomeAr: string;
  outcomeEn: string;
  bloomLevel: BloomLevel;
  indicators: string[];
  knowledgeComponents: CurriculumKC[];
}

export interface CurriculumKC {
  id: string;
  nameAr: string;
  nameEn: string;
  bloomLevel: BloomLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisiteKcIds: string[];
  tags: string[];
  standardCode: string;
}
```

**Step 2: Commit**

```bash
git add data/curricula/types.ts
git commit -m "feat: add TypeScript types for curriculum framework data"
```

---

### Task 5: Transform raw JSON into typed curriculum data

**Files:**
- Read: `data/curricula/grade{N}-math-raw.json` (all grades)
- Create: `data/curricula/mathCurriculum.ts`
- Create: `data/curricula/index.ts`

**Step 1: Build the transformation**

For each grade's raw JSON:
1. Group by domain → create Domain objects with unique IDs (e.g., `domain-math-g3-numbers`)
2. Group by standard → create Standard objects (e.g., `std-math-g3-mass`)
3. Map learning outcomes → create LearningOutcome objects with Bloom's level inferred from Arabic verb:
   - يعرف/يذكر/يسمي = 1 (Remember)
   - يفهم/يفسر/يصف = 2 (Understand)
   - يطبق/يستخدم/يحل = 3 (Apply)
   - يحلل/يقارن/يصنف = 4 (Analyze)
   - يقيم/يحكم/يبرر = 5 (Evaluate)
   - يبتكر/يصمم/ينشئ = 6 (Create)
4. Map indicators → create CurriculumKC objects
5. Infer prerequisites from sequential ordering within each standard
6. Generate English translations

**Step 2: Write mathCurriculum.ts**

Export the full `CurriculumFramework` object with all grades.

**Step 3: Write index.ts with helpers**

```typescript
export { MATH_CURRICULUM } from './mathCurriculum';
export * from './types';
export function getGradeCurriculum(grade: number): GradeCurriculum | undefined;
export function getDomainsForGrade(grade: number): Domain[];
export function getKCsForGrade(grade: number): CurriculumKC[];
export function getCurriculumAsTextbook(grade: number): Textbook; // adapter
```

**Step 4: Commit**

```bash
git add data/curricula/
git commit -m "feat: add Math curriculum data for grades 1-12 from NCCD framework"
```

---

### Task 6: Create adapter — CurriculumFramework → Textbook

**Files:**
- Modify: `data/curricula/index.ts`
- Modify: `data/sampleTextbook.ts` — update AVAILABLE_TEXTBOOKS

**Step 1: Write getCurriculumAsTextbook adapter**

Maps:
- Domain → Unit
- Standard → Lesson
- LearningOutcome → TextbookPage
- CurriculumKC → KnowledgeComponent

This lets the existing Skill Map, Galaxy Radar, and Progress Path work with real curriculum data without changes.

**Step 2: Update AVAILABLE_TEXTBOOKS**

Add entries for each grade (1-12) pulled from the curriculum data:

```typescript
export const AVAILABLE_TEXTBOOKS: Textbook[] = [
  getCurriculumAsTextbook(1),  // Grade 1 Math
  getCurriculumAsTextbook(2),  // Grade 2 Math
  getCurriculumAsTextbook(3),  // Grade 3 Math (replaces sample)
  // ... through Grade 12
];
```

**Step 3: Verify existing skill map still works**

Run: `npx tsc --noEmit`
Expected: No new errors

**Step 4: Commit**

```bash
git add data/curricula/ data/sampleTextbook.ts
git commit -m "feat: wire real curriculum data into textbook selector for grades 1-12"
```

---

### Task 7: Visual verification

**Step 1: Start dev server**

Run: `npx vite --host`

**Step 2: Navigate to /skill-map**

- Verify TextbookSelector shows all 12 grades
- Select Grade 3
- Check Galaxy Radar shows real domains (Numbers, Patterns, Geometry, Data)
- Check Progress Path shows real standards and page nodes
- Check Heat Map shows real KC data

**Step 3: Take screenshots for documentation**

**Step 4: Commit any fixes**

---

## Dependency Graph

```
Task 1 (convert pages)
  ├─→ Task 2 (extract Grade 3 pilot)
  │     └─→ Task 3 (extract remaining grades, parallel)
  │           └─→ Task 5 (transform to typed data)
  │                 └─→ Task 6 (adapter + wire into app)
  │                       └─→ Task 7 (visual verification)
  └─→ Task 4 (TypeScript types, independent)
```

Tasks 1 and 4 can run in parallel.
Task 3 runs as 6 parallel agents.
