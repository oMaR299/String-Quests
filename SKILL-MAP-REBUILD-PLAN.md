# Skill Map Module - Complete Rebuild Plan

> **Science-First Educational Skill Tracking System**
> A deep, research-backed plan to rebuild the skill map from scratch using real learning science, proven algorithms, and effective visualizations.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Learning Science Foundation](#2-learning-science-foundation)
3. [The Student Model (Data Layer)](#3-the-student-model-data-layer)
4. [Mastery Engine Algorithms](#4-mastery-engine-algorithms)
5. [Spaced Repetition & Forgetting](#5-spaced-repetition--forgetting)
6. [Prerequisite Graph & ZPD](#6-prerequisite-graph--zpd)
7. [Adaptive Difficulty (IRT)](#7-adaptive-difficulty-irt)
8. [Visualization Architecture](#8-visualization-architecture)
9. [View 1: Skill Path Map (Student-Facing)](#9-view-1-skill-path-map-student-facing)
10. [View 2: Mastery Grid / Heatmap (Teacher/Parent)](#10-view-2-mastery-grid--heatmap-teacherparent)
11. [View 3: Knowledge Graph Explorer (Advanced)](#11-view-3-knowledge-graph-explorer-advanced)
12. [Gamification Integration](#12-gamification-integration)
13. [Color System & Accessibility](#13-color-system--accessibility)
14. [Animation & Interaction Design](#14-animation--interaction-design)
15. [Technology Stack](#15-technology-stack)
16. [File Structure & Architecture](#16-file-structure--architecture)
17. [Data Migration Strategy](#17-data-migration-strategy)
18. [Implementation Phases](#18-implementation-phases)
19. [References](#19-references)

---

## 1. Current State Audit

### What Exists (16 components, ~4,100 lines)

| File | Lines | Purpose | Verdict |
|------|-------|---------|---------|
| `SkillMapLayout.tsx` | 257 | Main orchestrator, 8 viz modes | **Replace** - bloated mode switching |
| `RadarView.tsx` | 370 | SVG 8-axis radar | **Keep concept** - good for skill profiles |
| `GalaxyView.tsx` | 523 | SVG dark space theme | **Delete** - looks cool, teaches nothing |
| `HeatMapView.tsx` | 140 | Pure React grid | **Replace** - too simplistic |
| `KnowledgeTreeView.tsx` | ~200 | SVG tree metaphor | **Delete** - replaced by Skill Path |
| `DnaStrandView.tsx` | ~200 | SVG dual helix | **Delete** - gimmick, not informative |
| `SkillDetailPanel.tsx` | ~300 | Slide-in mastery ring | **Rebuild** - good idea, weak data |
| `GapAnalysisPanel.tsx` | ~200 | 4 gap categories | **Rebuild** - needs real science |
| `StrengthFinderPanel.tsx` | ~200 | 4 strength categories | **Rebuild** - needs real science |
| `SkillMapSummaryDashboard.tsx` | ~300 | 6 widgets | **Rebuild** - metrics are arbitrary |
| `masteryEngine.ts` | 486 | 6-metric weighted mastery | **Replace** - use BKT/PFA instead |
| `skillMapStorage.ts` | 94 | AttemptRecord, localStorage | **Replace** - needs richer data model |
| `skillTaxonomy.ts` | 463 | 34 skills, Bloom's, categories | **Expand** - good foundation, incomplete |
| `sampleTextbook.ts` | 2000+ | 9,309 KCs, 13 textbooks | **Keep** - this is the real data source |

### Critical Problems in Current System

1. **Fake Science**: The 6-metric weighted mastery (Accuracy 35%, Consistency 15%, etc.) has no basis in learning science research. It's arbitrary numbers dressed up as metrics.

2. **Incomplete KC Mapping**: `SKILL_TO_KC_MAP` only maps 5 of 34 questions to KCs. The remaining 29 questions have no KC association, making the entire skill tracking system a facade.

3. **No Forgetting Model**: Mastery never decays. Once a student scores well, they appear "mastered" forever, regardless of how long ago they practiced.

4. **No Prerequisite Graph**: Skills are treated as independent. There's no model of which skills depend on which others, so the system cannot recommend "what to learn next."

5. **Visualization Without Purpose**: Galaxy, DNA Strand, and other views look impressive but communicate no actionable information. They visualize data without meaning.

6. **No Performance Optimization**: All visualizations render in SVG without memoization, causing performance issues with large datasets.

---

## 2. Learning Science Foundation

This rebuild is grounded in six established models from educational psychology and cognitive science. Here is what each one does and why we need it.

### Model 1: Bayesian Knowledge Tracing (BKT)
**Purpose**: Estimates whether a student has *learned* a knowledge component.
**Citation**: Corbett & Anderson, 1995

BKT models learning as a hidden Markov process with two states: "mastered" and "not mastered." It uses four parameters:

| Parameter | Name | What It Means | Default Range |
|-----------|------|---------------|---------------|
| P(L0) | Prior | Probability student already knows the skill | 0.0 - 0.3 |
| P(T) | Learn | Probability of learning on each practice opportunity | 0.05 - 0.4 |
| P(G) | Guess | Probability of getting it right without knowing | 0.0 - 0.3 |
| P(S) | Slip | Probability of getting it wrong despite knowing | 0.0 - 0.2 |

**Update equations** (run after every student response):

```
Step 1 - Predict:
P(correct) = P(Ln) * (1 - P(S)) + (1 - P(Ln)) * P(G)

Step 2 - Update posterior:
If correct:  P(Ln|obs) = P(Ln) * (1 - P(S)) / P(correct)
If incorrect: P(Ln|obs) = P(Ln) * P(S) / (1 - P(correct))

Step 3 - Account for learning:
P(Ln+1) = P(Ln|obs) + (1 - P(Ln|obs)) * P(T)
```

A skill is "mastered" when P(L) >= **0.95** (standard in Cognitive Tutor research).

**Why BKT and not the current weighted average**: BKT uses Bayes' theorem -- it mathematically updates belief based on evidence. The current system just averages percentages, which has no theoretical foundation and cannot distinguish between a student who guessed correctly and one who truly knows the material.

### Model 2: Performance Factors Analysis (PFA)
**Purpose**: Alternative to BKT that handles multi-KC items and uses observable counts.
**Citation**: Pavlik, Cen & Koedinger, 2009

```
m(i, KCs) = SUM_j [ beta_j + gamma_j * s_ij + rho_j * f_ij ]
P(correct) = 1 / (1 + e^(-m))
```

Where:
- `beta_j` = easiness of KC j (negative = harder)
- `gamma_j` = how much each prior success helps
- `rho_j` = how much each prior failure helps
- `s_ij` = count of prior successes on KC j
- `f_ij` = count of prior failures on KC j

**When to use PFA vs BKT**: PFA is better when a question tests multiple KCs simultaneously (e.g., a word problem that tests both "addition" and "reading comprehension"). BKT is better for single-KC tracking.

**Our approach**: Use **BKT as primary** (simpler, well-studied for K-12), with PFA counts stored as supplementary data for multi-KC items.

### Model 3: Item Response Theory (IRT)
**Purpose**: Calibrates item difficulty to student ability for adaptive testing.
**Key formula** (3PL):

```
P(correct | theta) = c + (1 - c) / (1 + e^(-a * (theta - b)))
```

Where:
- `theta` = student ability (estimated, starts at 0)
- `b` = item difficulty (pre-assigned, e.g., Bloom level 1 = -1, level 6 = +2)
- `a` = item discrimination (how well it separates high/low ability, default 1.0)
- `c` = guessing parameter (for 4-option MCQ, typically 0.25)

**Simplified ELO-like update** (practical for frontend):
```
theta_new = theta_old + K * (observed - expected)
```
Where K starts at 0.4 and decays to 0.1 as more data accumulates.

### Model 4: Ebbinghaus Forgetting Curve + FSRS
**Purpose**: Models memory decay over time and schedules optimal review timing.

**FSRS power forgetting curve** (better empirical fit than exponential):
```
R(t) = (1 + (19/81) * t / S) ^ (-0.5)
```

Where:
- `R` = retrievability (probability of recall)
- `t` = time since last review (days)
- `S` = stability (time in days for R to drop from 1.0 to 0.9)

At t = 0: R = 1.0 (just reviewed)
At t = S: R = 0.9 (90% recall)
At t = 4S: R ~ 0.78
At t = 16S: R ~ 0.63

### Model 5: Bloom's Revised Taxonomy
**Purpose**: Tags questions by cognitive complexity level for progression scaffolding.

| Level | Process | Question Types |
|-------|---------|---------------|
| 1. Remember | Recall facts | MCQ, definition matching, fill-blank |
| 2. Understand | Explain meaning | Classify, compare, summarize |
| 3. Apply | Use in new situation | Solve, calculate, demonstrate |
| 4. Analyze | Break into parts | Compare/contrast, find error, debug |
| 5. Evaluate | Judge quality | Rank, critique, justify |
| 6. Create | Produce new work | Design, compose, formulate |

**Knowledge Dimensions**: Factual, Conceptual, Procedural, Metacognitive

Each question in our system will be tagged with its Bloom level and knowledge dimension. This directly maps to IRT difficulty and controls progression (students must demonstrate lower levels before attempting higher ones within the same KC).

### Model 6: Zone of Proximal Development (ZPD)
**Purpose**: Determines what the student is ready to learn next.
**Citation**: Vygotsky, 1978

A skill is in the student's ZPD if:
1. All prerequisite KCs are mastered (P(L) >= threshold)
2. The skill itself is NOT mastered
3. The difficulty is within reach (IRT theta within range)

This maps directly to the **frontier of the prerequisite DAG** -- the set of unmastered KCs whose prerequisites are all mastered.

---

## 3. The Student Model (Data Layer)

### localStorage Data Structure

**Key**: `string-quests-skill-model`

```typescript
interface StudentModel {
  version: 2;
  lastUpdated: string; // ISO timestamp

  // Per-KC mastery state
  kcs: Record<string, KCState>;

  // Global ability estimate (IRT theta per domain)
  domainTheta: Record<string, number>;

  // Raw attempt log (for analytics/visualization)
  attempts: AttemptRecord[];

  // Spaced repetition schedule
  reviewQueue: ReviewItem[];
}

interface KCState {
  kcId: string;

  // BKT state
  pLearned: number;       // P(L) - probability skill is mastered [0,1]

  // FSRS state
  stability: number;      // S - days for R to drop to 0.9
  difficulty: number;     // D - FSRS difficulty [1,10]
  lastPractice: string;   // ISO timestamp

  // PFA counts (supplementary)
  successCount: number;   // s_ij
  failureCount: number;   // f_ij

  // Bloom progression
  bloomLevelReached: number; // highest Bloom level demonstrated (1-6)

  // Computed at read time (not stored)
  // retrievability: computed from stability + elapsed time
  // effectiveMastery: pLearned * retrievability
}

interface AttemptRecord {
  id: string;
  timestamp: string;
  questionId: string;
  kcIds: string[];         // which KCs this question tests
  bloomLevel: number;      // Bloom level of this question
  correct: boolean;
  responseTimeMs: number;

  // Context
  lessonSlug: string;
  subjectSlug: string;
}

interface ReviewItem {
  kcId: string;
  nextReviewDate: string;  // ISO date
  intervalDays: number;
}
```

**Storage footprint**: ~120 bytes per KC. With 500 KCs = ~60 KB. Well within localStorage 5-10 MB limit.

### BKT Parameter Sets

Instead of fitting parameters per-KC (which requires large datasets), use **parameter families** based on question type and Bloom level:

```typescript
interface BKTParams {
  pL0: number;  // prior knowledge
  pT: number;   // learn rate
  pG: number;   // guess rate
  pS: number;   // slip rate
}

const BKT_PARAM_FAMILIES: Record<string, BKTParams> = {
  // Factual recall (MCQ, definitions)
  'remember-factual': { pL0: 0.10, pT: 0.20, pG: 0.25, pS: 0.10 },

  // Conceptual understanding
  'understand-conceptual': { pL0: 0.05, pT: 0.15, pG: 0.20, pS: 0.10 },

  // Procedural application (math problems)
  'apply-procedural': { pL0: 0.05, pT: 0.10, pG: 0.15, pS: 0.12 },

  // Analysis and evaluation
  'analyze-evaluate': { pL0: 0.02, pT: 0.08, pG: 0.10, pS: 0.15 },

  // Open-ended / creation
  'create': { pL0: 0.01, pT: 0.05, pG: 0.05, pS: 0.10 },

  // Default fallback
  'default': { pL0: 0.10, pT: 0.15, pG: 0.20, pS: 0.10 },
};
```

**Rationale**: MCQ has higher guess rate (0.25 for 4 options). Procedural skills have lower prior (students rarely know procedures before instruction). Analysis/creation have lower guess and learn rates (they're harder to luck into and slower to master).

---

## 4. Mastery Engine Algorithms

### Core: BKT Update Function

```typescript
function updateBKT(
  state: KCState,
  correct: boolean,
  params: BKTParams
): KCState {
  const pL = state.pLearned;
  const { pT, pG, pS } = params;

  // Step 1: Predicted probability of correct
  const pCorrect = pL * (1 - pS) + (1 - pL) * pG;

  // Step 2: Bayesian posterior update
  let pLGivenObs: number;
  if (correct) {
    pLGivenObs = (pL * (1 - pS)) / pCorrect;
  } else {
    pLGivenObs = (pL * pS) / (1 - pCorrect);
  }

  // Step 3: Learning transition
  const pLNew = pLGivenObs + (1 - pLGivenObs) * pT;

  return {
    ...state,
    pLearned: pLNew,
    successCount: state.successCount + (correct ? 1 : 0),
    failureCount: state.failureCount + (correct ? 0 : 1),
  };
}
```

### Effective Mastery (with forgetting)

```typescript
function getEffectiveMastery(state: KCState, now: Date): number {
  const elapsed = daysSince(state.lastPractice, now);

  // FSRS power forgetting curve
  const retrievability = Math.pow(
    1 + (19 / 81) * elapsed / state.stability,
    -0.5
  );

  // Effective mastery = P(learned) * P(can recall)
  return state.pLearned * retrievability;
}
```

### Mastery Classification

```typescript
type MasteryLevel =
  | 'not-started'    // no attempts
  | 'struggling'     // P(L) < 0.4 or effective < 0.3
  | 'developing'     // P(L) 0.4-0.7
  | 'proficient'     // P(L) 0.7-0.95
  | 'mastered'       // P(L) >= 0.95 AND R > 0.7
  | 'decaying';      // P(L) >= 0.7 BUT R < 0.5 (needs review)

function classifyMastery(state: KCState, now: Date): MasteryLevel {
  if (state.successCount === 0 && state.failureCount === 0) return 'not-started';

  const R = getRetrievability(state, now);
  const pL = state.pLearned;

  if (pL >= 0.95 && R > 0.7) return 'mastered';
  if (pL >= 0.7 && R < 0.5) return 'decaying';
  if (pL >= 0.7) return 'proficient';
  if (pL >= 0.4) return 'developing';
  return 'struggling';
}
```

### FSRS Stability Update

After each review, update the FSRS stability:

```typescript
function updateStability(
  state: KCState,
  correct: boolean,
  now: Date
): KCState {
  const elapsed = daysSince(state.lastPractice, now);
  const R = getRetrievability(state, now);
  const S = state.stability;
  const D = state.difficulty;

  let newS: number;
  let newD: number;

  if (correct) {
    // Stability grows after successful recall
    // Simplified FSRS: growth depends on difficulty, current stability, and elapsed time
    const difficultyFactor = 11 - D;
    const stabilityDecay = Math.pow(S, -0.2);  // w9 ~ 0.2
    const retrievabilityBonus = Math.exp(0.9 * (1 - R)) - 1;  // w10 ~ 0.9

    const growthFactor = 1 + Math.exp(1.5) * difficultyFactor * stabilityDecay * retrievabilityBonus;
    newS = S * growthFactor;

    // Difficulty decreases slightly on success
    newD = Math.max(1, Math.min(10, D - 0.3));
  } else {
    // Stability drops after failure
    newS = Math.max(0.4, S * 0.5);  // Don't go below minimum

    // Difficulty increases on failure
    newD = Math.max(1, Math.min(10, D + 0.5));
  }

  return {
    ...state,
    stability: newS,
    difficulty: newD,
    lastPractice: now.toISOString(),
  };
}
```

---

## 5. Spaced Repetition & Forgetting

### Review Scheduling

After each practice, compute when this KC should be reviewed:

```typescript
function scheduleNextReview(state: KCState, targetRetention = 0.9): ReviewItem {
  const S = state.stability;

  // FSRS optimal interval formula:
  // I = (S / F) * (R_target^(1/C) - 1)
  // Where F = 19/81, C = -0.5
  const F = 19 / 81;
  const C = -0.5;
  const interval = (S / F) * (Math.pow(targetRetention, 1 / C) - 1);

  const nextDate = new Date(state.lastPractice);
  nextDate.setDate(nextDate.getDate() + Math.round(interval));

  return {
    kcId: state.kcId,
    nextReviewDate: nextDate.toISOString(),
    intervalDays: Math.round(interval),
  };
}
```

When `targetRetention = 0.9` and `t = S`, interval = S days. So if stability is 7 days, the next review is in 7 days, at which point retrievability will have dropped to exactly 90%.

### Daily Review Queue

Each time the app opens:

```typescript
function getDailyReviewQueue(model: StudentModel, now: Date): string[] {
  return model.reviewQueue
    .filter(item => new Date(item.nextReviewDate) <= now)
    .sort((a, b) =>
      // Prioritize: most overdue first, then lowest stability
      (daysSince(a.nextReviewDate, now) / a.intervalDays) -
      (daysSince(b.nextReviewDate, now) / b.intervalDays)
    )
    .map(item => item.kcId);
}
```

### Decay on Session Start

Every time the student opens the app, apply forgetting to all KCs:

```typescript
function applyDecayOnLoad(model: StudentModel, now: Date): void {
  for (const kc of Object.values(model.kcs)) {
    const R = getRetrievability(kc, now);
    // Don't modify P(L) directly - forgetting affects recall, not learning
    // But flag KCs that need review
    if (R < 0.7 && kc.pLearned > 0.5) {
      // This KC was learned but is decaying - add to review queue if not already
      ensureInReviewQueue(model, kc.kcId);
    }
  }
}
```

---

## 6. Prerequisite Graph & ZPD

### Knowledge Component Graph

The prerequisite graph is a DAG (Directed Acyclic Graph) where edges point from prerequisite to dependent skill.

```typescript
interface KCGraph {
  nodes: KCNode[];
  edges: PrerequisiteEdge[];
}

interface KCNode {
  id: string;
  nameAr: string;
  nameEn: string;
  domain: string;       // e.g., 'numbers', 'geometry', 'measurement'
  unit: string;
  bloomLevels: number[]; // which Bloom levels have questions for this KC
  bktFamily: string;     // key into BKT_PARAM_FAMILIES
}

interface PrerequisiteEdge {
  from: string;  // prerequisite KC id
  to: string;    // dependent KC id
  strength: 'hard' | 'soft';
  // 'hard' = MUST master before attempting dependent
  // 'soft' = helps but not required
}
```

### ZPD Frontier Computation

```typescript
function getZPDFrontier(
  graph: KCGraph,
  studentKCs: Record<string, KCState>,
  now: Date,
  masteryThreshold = 0.85
): string[] {
  const frontier: string[] = [];

  for (const node of graph.nodes) {
    // Skip already mastered
    const state = studentKCs[node.id];
    if (state && getEffectiveMastery(state, now) >= masteryThreshold) continue;

    // Check all hard prerequisites
    const hardPrereqs = graph.edges
      .filter(e => e.to === node.id && e.strength === 'hard')
      .map(e => e.from);

    const allPrereqsMet = hardPrereqs.every(prereqId => {
      const prereqState = studentKCs[prereqId];
      return prereqState && getEffectiveMastery(prereqState, now) >= masteryThreshold;
    });

    if (allPrereqsMet) {
      frontier.push(node.id);
    }
  }

  return frontier;
}
```

### Building the Graph from sampleTextbook.ts

The existing `sampleTextbook.ts` contains 9,309 KCs organized by textbook > chapter > lesson > page. The prerequisite relationships can be derived from:

1. **Sequential ordering**: KCs within a lesson are naturally ordered (page 1 before page 2)
2. **Lesson ordering**: Lessons within a chapter depend on prior lessons
3. **Cross-topic links**: Some KCs explicitly reference others (e.g., "multiplication" requires "addition")

**Phase 1**: Auto-generate a linear prerequisite chain from the existing sequential structure.
**Phase 2**: Manually curate cross-topic links for the most important connections (maybe 50-100 key edges).
**Phase 3**: Allow the system to discover implicit prerequisites from student performance data (if student consistently fails KC B after mastering KC A, but succeeds after also mastering KC C, then C may be an implicit prerequisite of B).

---

## 7. Adaptive Difficulty (IRT)

### Per-Domain Ability Tracking

```typescript
function updateTheta(
  currentTheta: number,
  itemDifficulty: number,
  itemDiscrimination: number,
  correct: boolean,
  attemptCount: number
): number {
  // Adaptive learning rate: high early, decreasing with more data
  const K = Math.max(0.1, 0.4 * Math.exp(-0.05 * attemptCount));

  // 3PL probability (with guessing for MCQ)
  const c = 0.25; // 4-option MCQ
  const prob = c + (1 - c) / (1 + Math.exp(-itemDiscrimination * (currentTheta - itemDifficulty)));

  const observed = correct ? 1 : 0;
  return currentTheta + K * (observed - prob);
}
```

### Mapping Bloom Levels to IRT Difficulty

| Bloom Level | Default IRT b | Description |
|-------------|---------------|-------------|
| 1 (Remember) | -1.5 | Easy recall |
| 2 (Understand) | -0.5 | Basic comprehension |
| 3 (Apply) | 0.0 | Standard application |
| 4 (Analyze) | 0.8 | Requires decomposition |
| 5 (Evaluate) | 1.5 | Requires judgment |
| 6 (Create) | 2.0 | Hardest, generative |

### Bloom Level Gating

Within each KC, students must demonstrate mastery at lower Bloom levels before receiving higher-level questions:

```typescript
function getAppropriateBloomLevel(
  kcState: KCState,
  domainTheta: number
): number {
  const currentBloom = kcState.bloomLevelReached;

  // Must have P(L) >= 0.7 at current Bloom level to attempt next level
  if (kcState.pLearned >= 0.7 && currentBloom < 6) {
    return currentBloom + 1;
  }

  return currentBloom || 1; // Start at Remember
}
```

---

## 8. Visualization Architecture

### Design Principles

1. **Ben Shneiderman's Mantra**: "Overview first, zoom and filter, then details on demand"
2. **Progressive Disclosure**: Show the minimum by default, reveal detail on interaction
3. **Semantic Zoom**: Different zoom levels show different information density
4. **Action-Oriented**: Every visualization should answer "what should I do next?"
5. **Age-Appropriate**: Different metaphors for different grade levels

### Three Views, Three Audiences

| View | Audience | Primary Question | Metaphor |
|------|----------|-----------------|----------|
| Skill Path Map | Students | "What should I do next?" | Adventure trail |
| Mastery Grid | Teachers/Parents | "Who needs help with what?" | Heatmap matrix |
| Knowledge Graph | Advanced/Admin | "How does everything connect?" | Network graph |

### Lessons from Real Products

**Duolingo** (Skill Path): Linear path eliminates decision paralysis. Spaced review is embedded in the path. Progress is viscerally satisfying. **We adopt**: The path metaphor with branching.

**Khan Academy** (Mastery Grid): Color-coded matrix is information-dense. Teachers can see 30 students x 20 skills at a glance. Skills can revert (blue -> red). **We adopt**: The heatmap for teachers.

**Memrise** (Organic Growth): Knowledge as "flowers that need watering" makes forgetting tangible. Younger students connect with organic/living metaphors. **We adopt**: Living metaphor for younger grades.

**Anki** (Data Dashboard): GitHub-style heatmap shows study consistency. Statistical views serve power users. **We adopt**: Calendar heatmap for streak/consistency tracking.

**Path of Exile** (Knowledge Graph): Massive skill web works because of search, zoom, and filtering. But it intimidates new users. **We adopt**: Graph as optional advanced view with guided tour mode.

---

## 9. View 1: Skill Path Map (Student-Facing)

### Concept

A winding vertical path (like Duolingo) through skill nodes. The student scrolls down to see their journey. The path branches at key points where the curriculum allows choice. Each node represents a KC and is color-coded by mastery level.

### Visual Design

```
     [Start] ★ mastered
       |
      ○ - KC1 "Counting to 5"     ← mastered (filled blue)
       |
      ● - KC2 "Counting to 10"    ← proficient (mostly filled)
       |
     /   \
    ○     ◐  ← branch point (choose path)
    |     |
   KC3   KC4
    |     |
     \   /
      ○
      |
      ◌ - KC5 "Comparing"         ← locked (grey, faded)
      |
      🔒 - KC6                    ← locked (prerequisites not met)
```

### Node States

| State | Visual | Interaction |
|-------|--------|-------------|
| Locked | Grey, 50% opacity, lock icon, fog blur | Tap shows prerequisites needed |
| In ZPD (recommended) | Soft pulse, colored border | Tap starts practice |
| In Progress | Partially filled, colored | Tap continues practice |
| Proficient | Mostly filled, check mark | Tap opens review or detail |
| Mastered | Fully filled, star/crown | Tap shows achievement |
| Decaying | Was filled, now has cracks/wilting | Tap starts review, pulse animation |

### Node Fill Animation

Use SVG `clipPath` animated with Framer Motion to create a "liquid fill" effect. The fill level corresponds directly to `P(L)` (BKT mastery):

```
Fill level = P(L) as percentage
Fill color = mastery level color from blue scale
```

### Unlock Animation Sequence

When a student masters a prerequisite and a new node unlocks:

1. Brief delay (200ms)
2. Lock icon dissolves (opacity fade to 0)
3. Color fades in from grey to pale blue (300ms, ease-out)
4. Slight scale-up "pop" (1.0 -> 1.1 -> 1.0, spring physics)
5. Connecting path "draws in" from predecessor (strokeDashoffset animation)
6. Optional: confetti burst using `canvas-confetti`

### Metaphor Adaptation by Age

- **Grades 1-3**: Garden theme. Nodes are flower plots. As mastery grows, flowers bloom. Decaying skills show wilting. The path is a garden walkway.
- **Grades 4-6**: Adventure map. Nodes are landmarks on a trail (mountains, rivers, villages). Fog of war covers locked areas. Unlocking reveals the landscape.
- **Grades 7-12**: Clean modern path. Nodes are circles with progress rings. Focus on data over metaphor.

### Technical Implementation

- **Rendering**: Custom SVG + Framer Motion
- **Path layout**: Bezier curves for the winding trail, computed from node positions
- **Scroll**: CSS `overflow-y: auto` with intersection observer for lazy rendering
- **Zoom**: `@use-gesture/react` for pinch-to-zoom on mobile
- **Performance**: Virtualize off-screen nodes (only render nodes within viewport + 2 screens buffer)

---

## 10. View 2: Mastery Grid / Heatmap (Teacher/Parent)

### Concept

A matrix where rows = KCs (or students when viewing a class) and columns = time periods (or skills when viewing a student). Each cell is color-coded by mastery level.

### Teacher View

```
              Addition  Subtraction  Shapes  Counting  Patterns
Student A      ████       ████       ▓▓▓▓     ████      ░░░░
Student B      ▓▓▓▓       ░░░░       ████     ▓▓▓▓      ████
Student C      ░░░░       ░░░░       ▓▓▓▓     ████      ▓▓▓▓
Student D      ████       ████       ████     ████      ▓▓▓▓
```

████ = mastered, ▓▓▓▓ = proficient, ░░░░ = struggling, (blank) = not started

### Student Detail View

For an individual student, the grid shows KCs x Time:

```
              Week 1  Week 2  Week 3  Week 4  Current
Count to 5      ████    ████    ████    ████    ████
Count to 10     ░░░░    ▓▓▓▓    ████    ████    ████
Compare         ----    ░░░░    ░░░░    ▓▓▓▓    ▓▓▓▓
Add within 5    ----    ----    ░░░░    ░░░░    ▓▓▓▓
```

### Features

- **Sort** by any dimension (name, mastery, most-needs-attention, recently active)
- **Filter** by mastery state (show only "Struggling" or "Decaying")
- **Time slider** to see mastery at any past point
- **Click cell** to drill down to attempt history
- **Radar overlay** for per-student skill profile (5-8 domain axes)
- **Summary row/column** with aggregate mastery percentages

### Color System

5-level blue sequential scale (colorblind-safe):

| Level | Color | Hex |
|-------|-------|-----|
| Not Started | Light grey | `#E0E0E0` |
| Struggling | Pale blue | `#BDD7E7` |
| Developing | Medium blue | `#6BAED6` |
| Proficient | Strong blue | `#2171B5` |
| Mastered | Deep navy | `#08306B` |
| Decaying | Amber/Orange | `#E6550D` |

### Technical Implementation

- **Rendering**: visx `@visx/heatmap` or raw SVG with D3 color scales
- **Color mapping**: `d3-scale-chromatic` Blues sequential scale
- **Transitions**: Framer Motion for smooth cell color changes
- **Responsiveness**: Horizontal scroll on mobile, sticky headers
- **Radar chart**: Recharts `<RadarChart>` for skill profile overview

---

## 11. View 3: Knowledge Graph Explorer (Advanced)

### Concept

A force-directed graph showing KCs as nodes and prerequisites as edges. Nodes are sized by importance (number of dependents) and colored by mastery. Clusters of related skills form visible groups.

### Visual Design

- **Domain clusters**: KCs in the same domain are attracted to each other, forming visible groups
- **Prerequisite arrows**: Directed edges showing dependency flow
- **Node size**: Proportional to number of downstream dependents (bottleneck skills are bigger)
- **Node color**: Mastery level from blue scale
- **Edge color**: Greyed out for unmet prerequisites, glowing for active learning paths

### Semantic Zoom Levels

| Zoom Level | What's Shown |
|------------|-------------|
| Far (overview) | Domain clusters as colored regions with labels |
| Medium | Individual KC nodes with names |
| Close | Full detail: mastery %, Bloom level, review schedule, "Start Practice" button |

### Interactions

- **Click node**: Opens detail panel (same as Skill Path detail)
- **Search**: Text search to find specific KCs (highlights result and dims everything else)
- **Filter**: By domain, mastery state, Bloom level
- **Guided tour**: A mode that highlights the recommended learning path through the graph step by step
- **"Focus mode"**: Click a node to dim everything except its prerequisites and dependents

### Technical Implementation

- **Rendering**: `react-force-graph-2d` (Canvas-based for performance)
- **Physics**: D3-force simulation with custom forces for domain clustering
- **Custom node painting**: Canvas drawing for mastery color, size, labels
- **Search**: Client-side fuzzy search over KC names
- **Performance**: Canvas handles 200-300 nodes well at 60fps

### Why This Is Optional

Khan Academy removed their Knowledge Map because most users found it overwhelming. Path of Exile's skill web intimidates new players. This view is powerful for advanced users but should NOT be the default. It's a stretch goal for Phase 3.

---

## 12. Gamification Integration

### Self-Determination Theory (SDT) Audit

SDT (Deci & Ryan, 1985) identifies three psychological needs for intrinsic motivation:

| Need | Current System | New System |
|------|---------------|------------|
| **Autonomy** (choice, control) | Path is forced | ZPD frontier gives 2-3 valid "next" options |
| **Competence** (feeling capable) | XP and levels | BKT mastery with clear progress, Bloom scaffolding |
| **Relatedness** (social connection) | Leaderboard | Leaderboard + class progress view, parent sharing |

### Hearts System Concern

The current hearts system (lose a heart on wrong answer) may create **performance avoidance** rather than mastery orientation. Research on overjustification effect (Deci, 1971) shows that external punishments can undermine intrinsic motivation.

**Recommendation**: Keep hearts as a gentle constraint but:
- Don't punish review/practice sessions (hearts only for "quest" mode)
- Give bonus hearts for returning to study decaying skills
- Never gate practice behind heart availability -- students should always be able to practice

### Flow Theory Integration (Csikszentmihalyi)

The "flow channel" -- where challenge matches skill -- maps directly to IRT:

```
If theta >> item difficulty: student is bored → increase difficulty
If theta << item difficulty: student is anxious → decrease difficulty
If theta ≈ item difficulty: student is in flow → maintain difficulty
```

The IRT theta update + Bloom level gating creates this naturally.

### Celebration Moments

| Event | Animation | Frequency |
|-------|-----------|-----------|
| Correct answer | Brief green flash, +XP counter | Every correct |
| KC mastered | Confetti burst, star appears on path node | ~Every 5-10 questions |
| Bloom level up | New badge icon, brief fanfare | Every 10-20 questions |
| All prereqs met (unlock) | Path extending animation, new area revealed | Per lesson completion |
| Streak maintained | Flame icon grows | Daily |
| Review completed | "Garden watered" / restoration animation | Per review session |

---

## 13. Color System & Accessibility

### Primary Mastery Scale (Colorblind-Safe)

Uses ColorBrewer Blues sequential scale:

```css
--mastery-not-started: #E0E0E0;  /* neutral grey */
--mastery-struggling:  #BDD7E7;  /* pale blue */
--mastery-developing:  #6BAED6;  /* medium blue */
--mastery-proficient:  #2171B5;  /* strong blue */
--mastery-mastered:    #08306B;  /* deep navy */
--mastery-decaying:    #E6550D;  /* amber/orange warning */
```

### Why Blue

Most color vision deficiency (deuteranopia, protanopia) affects red-green discrimination. Blue is perceived similarly across nearly all forms of colorblindness, making blue sequential scales the safest default.

### Redundant Encoding

Color alone should never be the only encoding. Each mastery level also has:
- A distinct icon/shape (empty circle, quarter fill, half fill, three-quarter, star)
- A text label available on hover/tap
- A numeric percentage if detail view is open

### Dark Mode Adaptation

The blue scale works in both light and dark modes:
- Light mode: as specified above (light background)
- Dark mode: slightly increase saturation, maintain the same lightness ordering

---

## 14. Animation & Interaction Design

### Performance Budget

| Element | Max Duration | Easing |
|---------|-------------|--------|
| Color transition | 300ms | ease-out |
| Node fill change | 400ms | spring (stiffness: 200, damping: 20) |
| Panel slide-in | 300ms | ease-out |
| Unlock animation | 600ms total | staged keyframes |
| Confetti | 1500ms | gravity fall-off |
| Path draw | 500ms | ease-in-out |

### Mobile-Specific

- **Min tap target**: 44x44 px (Apple HIG)
- **No hover-dependent info**: All hover tooltips become tap-to-reveal
- **Pinch-to-zoom**: For all graph/map views
- **Swipe navigation**: Between sibling skills in path view
- **Fat-finger tolerance**: Invisible hit areas extend 8px beyond visual boundary

### SVG vs Canvas Decision

| Use Case | Renderer | Why |
|----------|----------|-----|
| Skill Path Map | SVG + Framer Motion | < 100 visible nodes, needs rich animation |
| Mastery Heatmap | SVG (visx) | Simple geometry, precise styling |
| Radar Chart | SVG (Recharts) | Standard chart, library handles it |
| Knowledge Graph | Canvas (react-force-graph) | 200+ nodes, needs 60fps |
| Calendar Heatmap | SVG | Simple rectangle grid |

---

## 15. Technology Stack

| Component | Library | Rationale |
|-----------|---------|-----------|
| **Student skill path** | SVG + Framer Motion + `@use-gesture/react` | Custom layout, rich animation, touch |
| **Mastery heatmap** | visx (`@visx/heatmap`) or raw SVG + D3 scales | Simple geometry, precise color |
| **Radar chart** | Recharts `<RadarChart>` | Ready-made, declarative |
| **Knowledge graph** | `react-force-graph-2d` | Canvas perf, built-in physics |
| **Color scale** | `d3-scale-chromatic` (Blues) | Colorblind-safe, perceptually ordered |
| **Celebrations** | `canvas-confetti` + Framer Motion | Lightweight particles + SVG anim |
| **Dashboard charts** | Nivo (treemap, bar, line) | Comprehensive, motion built-in |
| **State management** | Existing UserContext + new SkillModelContext | Consistent with app architecture |
| **Persistence** | localStorage | Consistent with app (no backend) |

### New npm Dependencies

```
d3-scale-chromatic    # Color scales
@visx/heatmap         # Heatmap primitives (optional, can use raw SVG)
@visx/scale           # Scale utilities
react-force-graph-2d  # Knowledge graph visualization (Phase 3)
canvas-confetti       # Celebration particles
@use-gesture/react    # Touch gestures (pinch zoom, swipe)
```

Dependencies already in the project: `framer-motion`, `recharts` or use Nivo, `lucide-react`.

---

## 16. File Structure & Architecture

### New File Structure

```
src/
├── contexts/
│   └── SkillModelContext.tsx          # NEW: Provides StudentModel state + updaters
│
├── models/
│   ├── bkt.ts                        # NEW: BKT update functions
│   ├── fsrs.ts                       # NEW: FSRS stability/retrievability
│   ├── irt.ts                        # NEW: IRT theta updates
│   ├── masteryClassifier.ts          # NEW: Classify KC mastery level
│   ├── reviewScheduler.ts            # NEW: Compute review queue
│   └── types.ts                      # NEW: StudentModel, KCState, etc.
│
├── data/
│   ├── sampleTextbook.ts             # KEEP: 9,309 KCs
│   ├── skillTaxonomy.ts              # EXPAND: Add Bloom tags, BKT families
│   ├── prerequisiteGraph.ts          # NEW: DAG of KC prerequisites
│   └── bktParams.ts                  # NEW: Parameter families
│
├── components/skillmap/
│   ├── SkillMapPage.tsx              # NEW: Main page, view switcher
│   ├── SkillPathView.tsx             # NEW: View 1 - Student path
│   ├── SkillPathNode.tsx             # NEW: Individual path node
│   ├── SkillPathConnector.tsx        # NEW: SVG path between nodes
│   ├── MasteryGridView.tsx           # NEW: View 2 - Heatmap
│   ├── MasteryGridCell.tsx           # NEW: Individual grid cell
│   ├── KnowledgeGraphView.tsx        # NEW: View 3 - Force graph
│   ├── SkillDetailPanel.tsx          # REBUILD: Slide-in panel with real data
│   ├── RadarProfile.tsx              # REBUILD: Radar chart using Recharts
│   ├── ReviewQueueWidget.tsx         # NEW: "Skills to review" list
│   ├── CalendarHeatmap.tsx           # NEW: GitHub-style activity tracker
│   ├── MasteryRing.tsx               # REBUILD: SVG ring showing P(L)
│   ├── ZPDRecommendations.tsx        # NEW: "Learn next" suggestions
│   └── CelebrationOverlay.tsx        # NEW: Confetti/particles
│
├── hooks/
│   ├── useStudentModel.ts            # NEW: Hook to access/update skill model
│   ├── useZPDFrontier.ts             # NEW: Compute ZPD frontier
│   ├── useReviewQueue.ts             # NEW: Get today's review items
│   └── useMasteryColors.ts           # NEW: D3 color scale hook
│
└── utils/
    ├── skillMapStorage.ts            # REBUILD: Richer data model
    └── graphUtils.ts                 # NEW: DAG traversal, topological sort
```

### Files to Delete

```
DELETE: components/skillmap/GalaxyView.tsx         # Gimmick
DELETE: components/skillmap/DnaStrandView.tsx       # Gimmick
DELETE: components/skillmap/KnowledgeTreeView.tsx   # Replaced by SkillPathView
DELETE: components/skillmap/HeatMapView.tsx         # Replaced by MasteryGridView
DELETE: components/skillmap/SkillMapLayout.tsx      # Replaced by SkillMapPage
DELETE: components/skillmap/GapAnalysisPanel.tsx    # Replaced by ZPDRecommendations
DELETE: components/skillmap/StrengthFinderPanel.tsx # Replaced by RadarProfile
DELETE: components/skillmap/SkillMapSummaryDashboard.tsx  # Rebuilt into SkillMapPage
DELETE: utils/masteryEngine.ts                      # Replaced by models/bkt.ts + friends
```

---

## 17. Data Migration Strategy

### From Old to New

The current `string-quests-attempts` localStorage key stores `AttemptRecord[]`. The new system needs to:

1. Read existing attempts
2. For each attempt, map `questionId` to KC(s) using the expanded `skillTaxonomy`
3. Replay BKT updates chronologically to build initial `KCState` for each KC
4. Compute FSRS stability from attempt spacing
5. Store the migrated `StudentModel` under new key `string-quests-skill-model`
6. Keep old data as backup

```typescript
function migrateFromV1(oldAttempts: OldAttemptRecord[]): StudentModel {
  const model = createEmptyStudentModel();

  // Sort by timestamp (chronological replay)
  const sorted = oldAttempts.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const attempt of sorted) {
    const kcIds = mapQuestionToKCs(attempt.questionId);
    for (const kcId of kcIds) {
      // Initialize KC if first time
      if (!model.kcs[kcId]) {
        model.kcs[kcId] = createInitialKCState(kcId);
      }

      // Apply BKT update
      const params = getBKTParams(kcId);
      model.kcs[kcId] = updateBKT(model.kcs[kcId], attempt.correct, params);
      model.kcs[kcId] = updateStability(model.kcs[kcId], attempt.correct, new Date(attempt.timestamp));
    }

    // Store in new attempt format
    model.attempts.push(convertAttempt(attempt, kcIds));
  }

  return model;
}
```

---

## 18. Implementation Phases

### Phase 1: Data Layer & Core Engine (Week 1-2)

**Goal**: All learning science algorithms working, tested, and storing data.

1. Create `models/types.ts` with all TypeScript interfaces
2. Implement `models/bkt.ts` (BKT update function)
3. Implement `models/fsrs.ts` (stability, retrievability, forgetting curve)
4. Implement `models/irt.ts` (theta updates)
5. Implement `models/masteryClassifier.ts` (classify mastery level)
6. Implement `models/reviewScheduler.ts` (compute review queue)
7. Create `data/bktParams.ts` (parameter families)
8. Expand `data/skillTaxonomy.ts` (complete KC-to-question mapping, Bloom tags)
9. Create `data/prerequisiteGraph.ts` (initial DAG from textbook structure)
10. Create `contexts/SkillModelContext.tsx`
11. Create `hooks/useStudentModel.ts`, `useZPDFrontier.ts`, `useReviewQueue.ts`
12. Implement `utils/skillMapStorage.ts` (new format with migration)
13. Implement data migration from V1
14. Wire into existing `QuizSessionContext` -- after each answer, update BKT/FSRS/IRT

**Deliverable**: Student model updates in real-time during quizzes. Data persists. Migration works.

### Phase 2: Mastery Grid View (Week 3)

**Goal**: Teacher/parent-facing heatmap working.

1. Create `MasteryGridView.tsx` with D3 color scales
2. Create `MasteryGridCell.tsx` with Framer Motion color transitions
3. Implement sort/filter controls
4. Add time slider (show mastery at any past point)
5. Create `RadarProfile.tsx` using Recharts
6. Create `CalendarHeatmap.tsx` (study consistency)
7. Wire into `SkillMapPage.tsx` as first view

**Deliverable**: Functional heatmap showing real mastery data.

### Phase 3: Skill Path View (Week 4-5)

**Goal**: Student-facing skill path working.

1. Design path layout algorithm (node positioning, bezier curves)
2. Create `SkillPathView.tsx` (main container with scroll)
3. Create `SkillPathNode.tsx` (node with fill animation, states)
4. Create `SkillPathConnector.tsx` (SVG path connections)
5. Implement unlock animations
6. Create `ZPDRecommendations.tsx` ("Learn next" suggestions)
7. Create `ReviewQueueWidget.tsx` ("Skills to review" list)
8. Create `CelebrationOverlay.tsx` (confetti on mastery)
9. Add mobile touch support (pinch-zoom, swipe)
10. Implement age-appropriate metaphor switching

**Deliverable**: Fully interactive skill path with real mastery data driving the visuals.

### Phase 4: Detail Panels & Polish (Week 6)

**Goal**: All detail views, transitions, polish.

1. Rebuild `SkillDetailPanel.tsx` with real BKT/FSRS data
2. Add `MasteryRing.tsx` showing P(L) as animated SVG ring
3. Add attempt timeline in detail panel
4. Add Bloom level progression indicator
5. Implement view transitions between views (AnimatePresence, layoutId)
6. Performance optimization (React.memo, useMemo for heavy computations)
7. Accessibility pass (ARIA labels, keyboard navigation, screen reader alt text)
8. Delete old files (Galaxy, DNA, etc.)

**Deliverable**: Complete, polished skill map module.

### Phase 5: Knowledge Graph (Stretch Goal, Week 7+)

**Goal**: Advanced graph view for power users.

1. Install and configure `react-force-graph-2d`
2. Create `KnowledgeGraphView.tsx`
3. Implement semantic zoom (domain clusters -> nodes -> details)
4. Add search and filter
5. Implement "guided tour" mode
6. Add "focus mode" (click node to show only its prereqs/dependents)

**Deliverable**: Interactive knowledge graph exploration.

---

## 19. References

### Learning Science
- Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4(4), 253-278.
- Pavlik, P. I., Cen, H., & Koedinger, K. R. (2009). Performance Factors Analysis -- A New Alternative to Knowledge Tracing. *AIED 2009*.
- Anderson, L. W., & Krathwohl, D. R. (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*.
- Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*.
- Bloom, B. S. (1968). Learning for Mastery. *Evaluation Comment*, 1(2).
- Ebbinghaus, H. (1885). *Uber das Gedachtnis*.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*.
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*.

### Spaced Repetition Algorithms
- Wozniak, P. A. (1990). SM-2 Algorithm. SuperMemo.
- Ye, J. (2023). FSRS -- Free Spaced Repetition Scheduler. *Anki 23.10+*.
- Settles, B., & Meeder, B. (2016). A Trainable Spaced Repetition Model for Language Learning. *ACL 2016*. (Duolingo's Birdbrain system)

### Item Response Theory
- Rasch, G. (1960). *Probabilistic Models for Some Intelligence and Attainment Tests*.
- Lord, F. M. (1980). *Applications of Item Response Theory to Practical Testing Problems*.

### Visualization
- Shneiderman, B. (1996). The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations.
- ColorBrewer 2.0 (Cynthia Brewer) -- colorbrewer2.org
- Murre, J. M. J., & Dros, J. (2015). Replication and Analysis of Ebbinghaus' Forgetting Curve. *PLoS ONE*.

### Products Studied
- Duolingo learning path redesign (2022)
- Khan Academy mastery progress visualization
- Brilliant.org + ustwo design partnership
- Codecademy Skill XP and weighted progression
- Memrise spaced repetition "garden" metaphor
- Anki Review Heatmap add-on
- Path of Exile passive skill tree (game UI reference)
- Civilization VI tech tree (game UI reference)
