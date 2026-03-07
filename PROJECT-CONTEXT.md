# String-Quests: Complete Project Context

> This document gives FULL context for any AI agent or teammate working on this project.
> Read this BEFORE making any changes.

## What Is This App?

String-Quests is an educational gamification platform for **Al-Khadr Modern Schools**. School students (Grades 1-12) play quiz games based on their **real textbooks**. The quizzes ask questions indirectly - students think they're playing a fun game, but we're actually testing what they learned from each page of their textbook.

### The Big Vision
We want to know **EVERYTHING** about what a student knows:
- Which **textbook** they're using
- Which **unit** they're strong/weak in
- Which **lesson** they understand
- Which **page** they've mastered
- Which **knowledge component (KC)** - the smallest testable piece of knowledge - they need to review

We show this data to 4 audiences:
1. **Students** - fun, gamified visualizations to motivate them
2. **Teachers** - class-wide analytics to guide instruction
3. **Parents** - simple report cards showing textbook progress
4. **Principals** - school-wide overview

## Tech Stack

| Technology | Version | Notes |
|---|---|---|
| React | 19 | Latest, with hooks only |
| TypeScript | strict mode | All files are .tsx/.ts |
| Vite | 6 | Dev server on port 3000, `--host 0.0.0.0` |
| Tailwind CSS | **v4.2.1** | Uses `@import "tailwindcss"` NOT `@tailwind` directives |
| Framer Motion | 12 | All animations |
| React Router DOM | 7 | URL-based navigation |
| Lucide React | latest | Icon library |
| Font | Cairo | Google Fonts, supports Arabic |

### CRITICAL: Tailwind v4 Syntax
```css
/* CORRECT (v4) */
@import "tailwindcss";
@config "./tailwind.config.ts";

/* WRONG (v3 - will break everything) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## File Structure

```
String-Quests-/
├── App.tsx                          # Routes + providers (React Router v7)
├── index.tsx                        # Entry point
├── index.css                        # Tailwind v4 imports
├── types.ts                         # Core TypeScript interfaces
├── constants.ts                     # 34 QUESTIONS + TOPIC_META (21 subjects)
├── tailwind.config.ts               # Custom colors (duo*, pastel*)
├── postcss.config.js                # @tailwindcss/postcss
│
├── contexts/
│   ├── UserContext.tsx               # Persistent: hearts, gems, XP, streaks, achievements
│   ├── QuizSessionContext.tsx        # Ephemeral: current quiz state
│   └── I18nContext.tsx               # Bilingual AR/EN with RTL/LTR
│
├── layouts/
│   ├── AppShell.tsx                  # Main layout wrapper
│   ├── Sidebar.tsx                   # Desktop nav (6 items)
│   ├── BottomNav.tsx                 # Mobile nav (6 items)
│   ├── TopBar.tsx                    # Hearts, gems, streak, XP bar, lang toggle
│   └── PlatformNavbar.tsx            # Top platform bar
│
├── pages/
│   ├── HomePage.tsx                  # Dashboard
│   ├── LearnPage.tsx                 # Duolingo skill tree
│   ├── QuizSessionPage.tsx           # Full-screen quiz
│   ├── SkillMapPage.tsx              # ** THE SKILL MAP ** (our main focus)
│   ├── ProfilePage.tsx               # Streak, daily tasks, league
│   ├── LeaderboardPage.tsx           # Rankings
│   ├── SettingsPage.tsx              # Settings
│   └── TopicDetailsPage.tsx          # Topic drill-down
│
├── components/
│   ├── QuizCard.tsx                  # Main quiz renderer (8 question types!)
│   ├── StartScreen.tsx               # Home dashboard content
│   ├── StreakScreen.tsx               # Profile content
│   ├── EndScreen.tsx                 # Quiz results with confetti
│   ├── ReadingRenderers.tsx          # Reading comprehension UI
│   │
│   ├── skillmap/                     # ** THE SKILL MAP COMPONENTS **
│   │   ├── SkillMapLayout.tsx        # Orchestrator - wires everything together
│   │   ├── SkillMapSummaryDashboard.tsx  # 6 summary widgets
│   │   ├── VisualizationModeSwitcher.tsx # 5 mode tabs
│   │   ├── TimeSlider.tsx            # All/30d/7d/Today filter
│   │   ├── HeatMapView.tsx           # Grid of skills colored by mastery
│   │   ├── RadarView.tsx             # 8-axis spider chart (SVG)
│   │   ├── GalaxyView.tsx            # Dark constellation map (SVG)
│   │   ├── KnowledgeTreeView.tsx     # Organic tree with leaf skills (SVG)
│   │   ├── DnaStrandView.tsx         # Double helix visualization (SVG)
│   │   ├── SkillDetailPanel.tsx      # Slide-in: mastery ring + 6 metrics + timeline
│   │   ├── GapAnalysisPanel.tsx      # Modal: 33 unattempted skills, weak areas
│   │   └── StrengthFinderPanel.tsx   # Modal: strong skills, natural affinities
│   │
│   ├── gamification/
│   │   ├── SkillTree.tsx             # Duolingo-style learning path
│   │   ├── PathNode.tsx              # Individual skill tree node
│   │   └── LevelUpModal.tsx          # Level-up celebration
│   │
│   ├── teacher/                      # Teacher dashboard components
│   ├── admin/                        # Admin components
│   └── principal/                    # Principal dashboard
│
├── data/
│   ├── skillTaxonomy.ts              # ** Maps all 34 questions to skills/domains/Bloom's **
│   ├── learningPath.ts               # Skill tree structure (5 tiers, 22 nodes)
│   ├── achievements.ts               # 10 achievement definitions
│   └── levelThresholds.ts            # XP thresholds per level
│
├── utils/
│   ├── skillMapStorage.ts            # ** localStorage: save/load attempt records **
│   ├── masteryEngine.ts              # ** 6-metric mastery computation engine **
│   └── slugify.ts                    # Arabic subject -> URL slug mapping
│
└── hooks/
    ├── usePersistedReducer.ts        # localStorage-backed useReducer
    └── useSounds.ts                  # Sound effects
```

## How Knowledge Tracking Currently Works

### 1. When a student answers a question:
`QuizCard.tsx` calls `saveAttempt()` which stores an `AttemptRecord` in localStorage:
```typescript
interface AttemptRecord {
  questionId: number;      // Links to QUESTIONS array in constants.ts
  subject: string;         // e.g. "رياضيات"
  lesson: string;          // e.g. "الجمع"
  questionType: QuestionType;  // 8 types
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
  confidence: 'sure' | 'unsure';
  hintUsed: boolean;
  isReviewMode: boolean;
  timestamp: number;
}
```

### 2. Skill Taxonomy maps questions to knowledge:
Each of the 34 questions maps to a `SkillDef`:
```typescript
interface SkillDef {
  questionId: number;
  subject: string;         // "رياضيات" (21 unique subjects)
  lesson: string;          // "الجمع"
  skillCode: string;       // "MATH-ADD"
  skillNameAr: string;     // "جمع الأعداد"
  skillNameEn: string;     // "Addition"
  domain: string;          // "arithmetic"
  bloomLevel: BloomLevel;  // 1-6 (Bloom's Taxonomy)
  maxPoints: number;
}
```

### 3. Mastery Engine computes 6 metrics per skill:
| Metric | Weight | What it measures |
|---|---|---|
| Accuracy | 35% | % correct answers |
| Consistency | 15% | Inverse of performance variance |
| Retention | 15% | Review mode vs first attempt |
| Confidence Calibration | 10% | Sure+correct=good, Sure+wrong=bad |
| Growth Velocity | 10% | Rate of improvement over time |
| Cognitive Depth | 15% | Bloom's level achievement |

Mastery statuses: unstarted(0) -> attempted(<40) -> developing(40-69) -> proficient(70-89) -> mastered(90+)

### 4. Five Visualization Modes show the data:
- **Heat Map**: Grid cards grouped by subject, colored by mastery
- **Radar**: 8-axis spider chart (subjects grouped into 8 categories)
- **Galaxy**: Dark constellation map, stars = skills, brightness = mastery
- **Knowledge Tree**: SVG organic tree, branches = subjects, leaves = skills
- **DNA Strand**: Double helix, rungs = skills, color = category

### 5. Analysis Panels:
- **Gap Analysis**: Finds never_attempted, low_accuracy, declining skills
- **Strength Finder**: Finds consistently_strong, fast_improving, natural_affinity, cognitive_champion
- **Skill Detail Panel**: Slide-in with mastery ring, 6 metric cards, attempt timeline, practice button

## What We Currently DON'T Track (the gaps to fill):
1. No textbook/grade/unit/page mapping - just subject+lesson
2. No Knowledge Component (KC) granularity - just skill-level
3. No forgetting curves or spaced repetition predictions
4. No teacher class-wide view of skill map data
5. No parent-friendly report
6. No principal school-wide overview
7. No prerequisite chains between KCs
8. No predicted review dates

## 21 Subjects Currently in the App
رياضيات, لغات, ثقافة عامة, ترتيب, معلومات, حيوانات, جغرافيا, علوم, تاريخ, فيزياء, كيمياء, تربية إسلامية, لغة عربية, حاسوب, فنون, أحياء, علوم الأرض, لغة إنجليزية, لغة فرنسية, تربية مالية, تربية رياضية

## 8 Question Types
1. `multiple-choice` (Bloom's 1: Remember)
2. `matching` (Bloom's 1: Remember)
3. `reorder` (Bloom's 2: Understand)
4. `input` (Bloom's 3: Apply)
5. `reading-word` (Bloom's 4: Analyze)
6. `reading-highlight` (Bloom's 4: Analyze)
7. `reading-list-extraction` (Bloom's 5: Evaluate)
8. `reading-ai-opinion` (Bloom's 6: Create)

## Gamification System
- **Hearts**: 5 max, lose 1 on wrong answer, regen 30min
- **XP**: Quadratic leveling (L1=0, L2=100, L3=300...)
- **Streaks**: Consecutive days with activity
- **Gems**: Currency for heart refills, streak freezes
- **Stars**: 1-3 per lesson based on score (50%/75%/95%)
- **Achievements**: 10 types (First Lesson, Perfect Score, etc.)
- **Daily Tasks**: 3 per day with XP rewards

## Routes
```
/home              -> HomePage (dashboard with stats)
/learn             -> LearnPage (Duolingo skill tree - 5 tiers, 22 nodes)
/learn/:subject/:lesson/play -> QuizSessionPage (full-screen quiz)
/skill-map         -> SkillMapPage (5 viz modes - THIS IS OUR FOCUS)
/profile           -> ProfilePage (streak, daily tasks, league, prize shop)
/leaderboard       -> LeaderboardPage
/settings          -> SettingsPage
/teacher/*         -> Teacher dashboard
/admin/*           -> Admin panel
/principal/*       -> Principal dashboard
```

## How to Run
```bash
cd D:/AI/Quests/String-Quests-
export PATH="/c/Program Files/nodejs:$PATH"
npx vite --host --port 3000
```
Dev server: http://localhost:3000

## localStorage Keys
- `string-quests-user-progress` - User state (XP, hearts, gems, streaks, etc.)
- `string-quests-attempts` - All quiz attempt records (for skill map)

## Design Language
- Glassmorphism (backdrop-blur, semi-transparent whites)
- Gradient accents (purple-to-blue headers, colored stat cards)
- English-first, LTR default. Arabic (RTL) added as second language via toggle
- Cairo font (supports both English and Arabic)
- Duolingo-inspired color system: green (#58CC02), blue (#1CB0F6), gold (#FFC800), red (#FF4B4B), orange (#FF9600)
- Framer Motion for all animations
- Rounded corners (rounded-2xl, rounded-3xl)
- Card-based layout with subtle shadows
