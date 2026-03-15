# Textbook Digitization & Interactive Learning Platform - Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan from this design.

**Goal:** Convert real Jordanian school textbooks into a full digital learning platform with interactive lessons, auto-generated questions, flashcards, mini-games, and knowledge mind maps.

**Starting Point:** Grade 1 Math textbook. Pipeline proven here, then scaled to all subjects/grades.

---

## 1. Vision

Transform physical textbooks into a complete digital learning experience:

```
Physical Textbook PDF
  → Markdown pages with SVG diagrams + photos
    → KC-mapped content (linked to our 9,309 curriculum KCs)
      → 10-20+ auto-generated questions per KC (all 8 types)
        → Flashcards with spaced repetition
          → Mini-games (5 templates filled by AI)
            → Knowledge mind maps (full prerequisite graphs)
              → Student reader (page-by-page + interactive lesson mode)
                → Admin dashboard (coverage, downloads, management)
```

**Scale for Grade 1 Math alone:**
- ~180 textbook pages → markdown + images
- 116 KCs → mapped to pages
- 1,160-2,320+ questions generated
- 116+ flashcard sets
- 116+ game instances across 5 templates
- Unit/lesson mind maps with prerequisite connections

---

## 2. Architecture

### 2.1 Two Audiences, Two UIs

**Student-Facing (clean, beautiful):**
- Textbook reader (page-by-page with flip animation)
- Interactive lesson mode (inline quizzes, expandable hints)
- Flashcard practice with spaced repetition
- Mini-games per lesson/unit
- Mind map explorer (visual knowledge graph)

**Admin-Facing (data management):**
- JSON downloads at any granularity (subject, unit, lesson, KC)
- Coverage reports and gap analysis
- Question quality review
- Content verification tools

### 2.2 Data Architecture

```
data/textbooks/math/grade1/
├── metadata.json              # Book info, page count, units
├── pages/
│   ├── page-001.md            # Frontmatter + markdown content
│   ├── page-002.md
│   └── ...
├── images/
│   ├── page-015-photo-1.png   # Photos kept as-is
│   ├── page-015-diagram-1.svg # Diagrams recreated as SVG
│   └── ...
├── mapping.json               # Page → KC bidirectional mapping
├── questions/
│   ├── kc-math-g1-1.json      # 10-20+ questions per KC
│   ├── kc-math-g1-2.json
│   └── ...
├── flashcards/
│   ├── kc-math-g1-1.json      # Text + visual cards per KC
│   └── ...
├── games/
│   ├── lesson-01-memory.json  # Memory match game data
│   ├── lesson-01-sort.json    # Drag-and-sort game data
│   └── ...
└── mindmaps/
    ├── unit-01.json           # Knowledge graph for unit
    ├── lesson-01.json         # Knowledge graph for lesson
    └── ...
```

### 2.3 Page Markdown Format

```markdown
---
page: 15
unit: 1
unitNameAr: "الأعداد والعمليات"
lesson: 3
lessonNameAr: "الأعداد الكلية"
kcIds: ["kc-math-g1-1", "kc-math-g1-2"]
hasExercises: true
---

# قراءة الأعداد وكتابتها

تعلّم الطالب أن يقرأ الأعداد من 1 إلى 10...

<figure>
  <svg viewBox="0 0 400 100">
    <!-- Recreated number line diagram -->
  </svg>
  <figcaption>خط الأعداد من 1 إلى 10</figcaption>
</figure>

![صورة: أطفال يعدون التفاح](../images/page-015-photo-1.png)

> **تمرين:** اكتب الأعداد التالية بالكلمات
> 1. ٥ = _____
> 2. ٨ = _____
```

### 2.4 Question JSON Format

Follows existing `Question` interface from `types.ts`:

```json
{
  "id": 1001,
  "subject": "رياضيات",
  "lesson": "الأعداد الكلية",
  "type": "multiple-choice",
  "question": "ما هو العدد الذي يأتي بعد ٧؟",
  "choices": ["٥", "٦", "٨", "٩"],
  "answer": "٨",
  "hint": "عُدّ: ٧، ___",
  "points": 10,
  "kcId": "kc-math-g1-1",
  "bloomLevel": 1,
  "difficulty": 1,
  "sourcePageNumber": 15
}
```

### 2.5 Flashcard Format

```json
{
  "kcId": "kc-math-g1-1",
  "cards": [
    {
      "id": "fc-001",
      "type": "text",
      "front": "ما هو ناتج ٣ + ٤؟",
      "back": "٧",
      "difficulty": 1,
      "stability": 1,
      "nextReview": null
    },
    {
      "id": "fc-002",
      "type": "visual",
      "front": "<svg>...</svg>",
      "frontLabel": "كم عدد التفاحات؟",
      "back": "٥ تفاحات",
      "difficulty": 1
    }
  ]
}
```

### 2.6 Game Templates

5 reusable game components, AI generates the content data:

| Template | Description | Example |
|----------|-------------|---------|
| **Memory Match** | Flip cards to find pairs | Match ٥ to "خمسة" |
| **Drag Sort** | Drag items into correct order | Sort numbers 1-10 |
| **Fill Race** | Type answers before timer | Quick mental math |
| **Pop Bubbles** | Tap correct answers floating up | Pop the even numbers |
| **Puzzle Build** | Drag pieces to complete a picture/equation | Complete: ٣ + ___ = ٧ |

### 2.7 Mind Map Format

```json
{
  "unitId": "unit-01",
  "nodes": [
    { "id": "kc-math-g1-1", "label": "قراءة الأعداد", "bloomLevel": 1, "x": 0, "y": 0 },
    { "id": "kc-math-g1-2", "label": "كتابة الأعداد", "bloomLevel": 3, "x": 1, "y": 0 }
  ],
  "edges": [
    { "from": "kc-math-g1-1", "to": "kc-math-g1-2", "type": "prerequisite" },
    { "from": "kc-math-g1-1", "to": "kc-math-g1-5", "type": "related" }
  ]
}
```

---

## 3. Pipeline Phases

### Phase 1: Digitize (FIRST PRIORITY)
1. Download Grade 1 Math textbook PDF
2. Extract pages as images (150 DPI)
3. AI agents convert each page to structured markdown
4. Recreate diagrams as SVGs, keep photos as PNGs
5. Verification: reviewer agents compare original vs markdown

### Phase 2: Generate Questions
1. Map each page to curriculum KCs (116 for Grade 1 Math)
2. For each KC, generate 10-20+ questions across all 8 types
3. Questions follow existing Question interface → drop-in replacement for constants.ts
4. Verification: reviewer agents check correctness + difficulty + Arabic quality

### Phase 3: Generate Flashcards
1. For each KC, generate text + visual flashcard sets
2. Spaced repetition metadata (stability, next review)
3. Visual cards include SVG diagrams where appropriate

### Phase 4: Generate Games
1. For each lesson, generate content for 2-3 game templates
2. AI produces the data (pairs, sequences, answers), templates handle rendering
3. Each game tied to lesson's KCs

### Phase 5: Generate Mind Maps
1. For each unit and lesson, generate knowledge graph
2. Nodes = KCs, edges = prerequisites + related connections
3. Layout computed for visualization

### Phase 6: Build Dashboard & UI
1. **Student UI:**
   - Page-by-page reader with flip animation
   - Interactive lesson mode (inline quizzes + hints)
   - Flashcard practice screen
   - Game selector + game screens
   - Mind map explorer
2. **Admin UI:**
   - JSON downloads (subject/unit/lesson/KC granularity)
   - Coverage reports
   - Question browser + quality metrics

---

## 4. Agent Team Structure

| Agent | Count | Role |
|-------|-------|------|
| **Boss** | 1 | Orchestrates pipeline, tracks progress, reports to user |
| **Downloader** | 1 | Finds and downloads textbook PDF |
| **Digitizer** | 3-5 | Converts page batches to markdown + SVGs in parallel |
| **SVG Artist** | 1-2 | Recreates key diagrams as clean SVGs |
| **KC Mapper** | 1 | Maps pages to curriculum KCs, builds mapping.json |
| **Question Generator** | 3-5 | Generates questions per KC in parallel |
| **Flashcard Generator** | 2-3 | Generates flashcard sets per KC |
| **Game Content Generator** | 2 | Fills game templates with KC-based content |
| **Mind Map Generator** | 1 | Builds knowledge graphs from KC prerequisites |
| **Reviewer/Verifier** | 2-3 | Checks quality of all generated content |

---

## 5. Integration with Existing System

### Replace constants.ts
- Generated questions become the real question bank
- `QUESTIONS` array populated from generated JSON files
- Existing Question interface unchanged - generated questions are drop-in compatible

### Link to Curriculum KCs
- Each question, flashcard, game, and mind map links to curriculum KCs via kcId
- Skill map's curriculum view shows mastery based on real textbook questions
- TextbookExplorerView uses new page-level content

### Preserve Existing Features
- All existing skill map modes (heatmap, radar, galaxy, etc.) continue working
- Mastery engine unchanged - just more questions feeding into it
- Gamification (hearts, gems, XP, streaks) applies to new content

---

## 6. Success Criteria

- [ ] Grade 1 Math textbook fully digitized (all pages → markdown + SVGs)
- [ ] Every KC has at least 10 questions across multiple types
- [ ] Flashcards generated for every KC with spaced repetition
- [ ] 2-3 game types per lesson with AI-generated content
- [ ] Mind maps for every unit showing KC prerequisite graph
- [ ] Student reader: page-by-page + interactive lesson mode
- [ ] Admin: JSON downloads at all granularities
- [ ] All generated questions replace sample constants.ts data
- [ ] Verification passed: content accuracy, Arabic quality, KC coverage
