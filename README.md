<div align="center">

# 🎯 String‑Quests

**An experimental, Duolingo‑style Arabic learning platform by String.**
Students play quizzes and quests built from their real textbooks, a deep skill‑map engine tracks mastery at every level, and parents follow their child's progress in a calm, coach‑style companion app.

`React 19` · `TypeScript` · `Vite` · `Tailwind CSS v4` · `Framer Motion` · **Full RTL (Arabic‑first)**

</div>

---

> 🧪 **Experimental** — an in‑progress exploration by String, not a production release.

## ✨ What it is

String‑Quests turns the curriculum into a game. Students answer textbook‑based questions across **21 Arabic subjects**, earn XP / gems / streaks like Duolingo, and every attempt feeds a knowledge‑tracking engine that scores mastery from the **subject** level all the way down to individual **knowledge components** (subject → unit → lesson → page → KC). Separate experiences serve students, teachers, admins, principals, and parents.

## 🚀 Features

### For students
- **Quizzes & quests** from real textbooks — 8 question types (multiple‑choice, input, reorder, matching, and four reading types).
- **Gamification** — hearts (5 max, regenerate over time), XP & levels, daily streaks, gems, achievements, and 1–3 star lesson ratings.
- **Skill Map** — the crown jewel: 5 visualizations (heat map, radar, galaxy, knowledge tree, DNA strand), a 6‑metric weighted mastery engine, gap analysis, and a strength finder.

### For parents — النتائج والتقدّم
A calm, coach‑style companion (not a dashboard) in three tabs — **المواد / التقدّم / تعرّف أكثر**:
- A **performance flower** centerpiece — one heart petal per subject, colored by status and filled by mastery.
- Subject rings + a full‑screen "subject story", today's coaching (talk + send practice), homework/exam attention, and a daily wellbeing check‑in.
- Progress widgets (focus, effectiveness, streak, points), trend charts, **class ranking + anonymized peer comparison**, learning‑style insights, teacher rapport, and study rhythm.
- Fully bilingual (Arabic‑first, RTL) and **non‑alarming by design**.

### For staff
Dedicated teacher, admin, and principal areas for content allocation and oversight.

## 🛠 Tech stack

- **React 19** + **TypeScript** + **Vite** (dev server on port **3000**)
- **Tailwind CSS v4** — `@import "tailwindcss"`, custom `duo-*` / `pastel-*` tokens
- **React Router DOM v7**, **Framer Motion 12**, **Lucide** icons, **Cairo** font
- **localStorage** for persistence — **no backend required**

## ⚡ Getting started

**Prerequisites:** Node.js 18+ (developed on 22)

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

### Useful routes
| Route | What |
|---|---|
| `/home` | Student dashboard |
| `/learn` | Duolingo‑style skill tree |
| `/skill-map` | Student knowledge‑evaluation tool |
| `/parent/skill-map` | Parent "Results & Progress" hub |
| `/teacher`, `/admin`, `/principal` | Staff areas |

## 🗂 Project structure (high level)

```
components/    UI — quiz, skillmap, parent-app, admin-hub, …
contexts/      UserContext (persistent), QuizSession, I18n (AR/EN + RTL)
layouts/       AppShell, Sidebar, BottomNav, TopBar
constants.ts   questions + topic metadata
types.ts       question / domain types
```

## 📐 Conventions

- **Bilingual, RTL‑native** — Arabic is the source of truth, English mirrors it; the layout flips with the locale.
- **Tailwind v4 only** — no v3 `@tailwind` directives; runtime/data‑driven colors are applied inline (the JIT can't see them).
- **No backend** — all state is seeded/mock data + localStorage; a refresh resets ephemeral progress.

---

<div align="center"><sub>🧪 An experimental project by String.</sub></div>
