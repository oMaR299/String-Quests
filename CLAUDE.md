# String-Quests - Educational Gamification Platform

> **IMPORTANT FOR AGENT TEAMMATES**: Read `PROJECT-CONTEXT.md` for FULL project context including file structure, data models, how knowledge tracking works, and what needs to be built. This CLAUDE.md is a quick reference.

## What This Is
A Duolingo-like Arabic educational module for Al-Khadr Modern Schools. Students play quizzes/quests based on real textbooks. The app tracks knowledge at every level: subject > unit > lesson > page > knowledge component (KC).

## Tech Stack
- **React 19** + TypeScript + Vite (dev server: `localhost:3000`, `--host 0.0.0.0`)
- **Tailwind CSS v4.2.1** via `@tailwindcss/postcss` (NOT v3 - use `@import "tailwindcss"` in CSS, NOT `@tailwind` directives)
- **React Router DOM v7** for URL-based navigation
- **Framer Motion 12** for animations
- **Lucide React** for icons
- **Cairo font** (Google Fonts, supports Arabic RTL)
- **localStorage** for persistence (no backend)
- Node.js v22.11.0 at `/c/Program Files/nodejs/`
- GitHub: https://github.com/oMaR299/String-Quests

## Architecture

### State Management
- `contexts/UserContext.tsx` - Persistent state (hearts, gems, XP, streaks, achievements, globalHistory) via `usePersistedReducer`
- `contexts/QuizSessionContext.tsx` - Ephemeral quiz state (questions, score, phase)
- `contexts/I18nContext.tsx` - Bilingual AR/EN with RTL/LTR switching

### Layout
- `layouts/AppShell.tsx` - Main layout wrapper
- `layouts/Sidebar.tsx` - Desktop nav (6 items: Home, Learn, Leaderboard, Skill Map, Profile, Settings)
- `layouts/BottomNav.tsx` - Mobile nav (same 6 items)
- `layouts/TopBar.tsx` - Hearts, gems, streak, XP bar, language toggle
- `layouts/PlatformNavbar.tsx` - Top platform navbar

### Routes (App.tsx)
```
/home -> HomePage (dashboard)
/learn -> LearnPage (Duolingo skill tree)
/learn/:subjectSlug/:lessonSlug/play -> QuizSessionPage
/leaderboard -> LeaderboardPage
/skill-map -> SkillMapPage (5 visualization modes)
/profile -> ProfilePage (streak, daily tasks, league)
/settings -> SettingsPage
/teacher/* -> TeacherLayout
/admin/* -> EduMatrixAllocation
/principal/* -> PrincipalLayout
```

### Questions & Content
- `constants.ts` - 34 QUESTIONS across 21 Arabic subjects, TOPIC_META with icons/colors
- `types.ts` - Question interface with 8 types: multiple-choice, input, reorder, matching, reading-word, reading-highlight, reading-list-extraction, reading-ai-opinion
- `components/QuizCard.tsx` - Main quiz renderer (handles all 8 question types)

### Gamification
- Hearts (5 max, lose on wrong answer, regen 30min)
- XP & Leveling (quadratic thresholds)
- Streaks (consecutive days)
- Gems (currency for heart refills, streak freezes)
- Achievements (10 types)
- Star system (1-3 stars per lesson based on score)

### Skill Map System (`components/skillmap/`)
The crown jewel - a comprehensive knowledge evaluation tool with:
- `utils/skillMapStorage.ts` - Records every quiz attempt to localStorage
- `data/skillTaxonomy.ts` - Maps all 34 questions to Bloom's Taxonomy levels, domains, categories
- `utils/masteryEngine.ts` - 6-metric weighted mastery: accuracy (35%), consistency (15%), retention (15%), confidence calibration (10%), growth velocity (10%), cognitive depth (15%)
- 5 visualization modes: HeatMap, Radar, Galaxy, KnowledgeTree, DnaStrand
- SkillDetailPanel (slide-in with mastery ring + 6 metrics + attempt timeline)
- GapAnalysisPanel (identifies unattempted, weak, declining skills)
- StrengthFinderPanel (identifies strong, improving, natural affinity skills)
- TimeSlider (filter by All/30d/7d/Today)
- SkillMapSummaryDashboard (6 widgets: score gauge, strongest/weakest, skills mastered, Bloom's depth, knowledge age rank)

## Key Conventions
- Arabic-first UI with bilingual support (AR/EN toggle)
- RTL layout by default, LTR for English
- Glassmorphism + gradient aesthetic
- All colors defined in `tailwind.config.ts` (duo*, pastel* prefixes)
- Code splitting via React.lazy() + Suspense
- File naming: PascalCase for components, camelCase for utils/hooks
- Dev server: run `export PATH="/c/Program Files/nodejs:$PATH" && npx vite --host` from project root

## Important Notes
- NEVER use Tailwind v3 syntax (`@tailwind base/components/utilities`) - always use v4 (`@import "tailwindcss"`)
- The `tailwind.config.ts` uses `@config` directive in CSS, not JS imports
- Questions are in Arabic - don't translate them, only translate UI labels
- localStorage keys: `string-quests-user-progress`, `string-quests-attempts`
