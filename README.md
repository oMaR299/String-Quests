<div align="center">

<a href="https://string.education">
  <img src="https://string.education/string-logo.svg" alt="String — the operating system for schools" width="128" />
</a>

# 🎯 String‑Quests

**A Duolingo‑style Arabic learning platform, built from students' real textbooks.**

Play quizzes and quests generated from the actual curriculum, watch a deep skill‑map engine track mastery down to the individual page, and let parents follow their child's progress in a calm, coach‑style companion app.

Built by [**String — the operating system for schools**](https://string.education).

`React 19` · `TypeScript` · `Vite` · `Tailwind CSS v4` · `Framer Motion` · `Full RTL (Arabic‑first)`

> 🧪 **This is a developer experiment — not part of String's main product.** It's a standalone sandbox by the [String](https://string.education) team for exploring ideas, and does not reflect String's production platform, roadmap, or capabilities.

</div>

---

## 📑 Table of contents

- [What String‑Quests is](#-what-stringquests-is)
- [Why we built it](#-why-we-built-it)
- [Features](#-features)
  - [For students](#for-students)
  - [The Skill Map — the crown jewel](#the-skill-map--the-crown-jewel)
  - [For parents](#for-parents--النتائج-والتقدّم)
  - [For staff](#for-staff)
- [Tech stack](#-tech-stack)
- [Getting started](#-getting-started)
- [Useful routes](#-useful-routes)
- [Project structure](#-project-structure-high-level)
- [Conventions](#-conventions)
- [Roadmap](#-roadmap)
- [About String](#-about-string)
- [License & disclaimer](#-license--disclaimer)

---

## ✨ What String‑Quests is

String‑Quests turns the **Arabic K‑12 curriculum into a game**. Students answer textbook‑based questions across **21 Arabic subjects**, earn XP, gems, and streaks the way they would in Duolingo, and every single attempt feeds a **knowledge‑tracking engine** that scores mastery from the subject level all the way down to individual **knowledge components**:

> **subject → unit → lesson → page → KC**

That last layer is the point. Most learning apps know *whether* a student got a question right. String‑Quests is built to know *why* — which specific idea, on which page of which lesson, is strong or shaky — and to turn that into a living picture of the learner rather than a score.

Separate, purpose‑built experiences serve **students, teachers, admins, principals, and parents**, each seeing the same underlying learning data through the lens that's useful to them.

This repository is an **experimental Arabic edtech project** — an open exploration of what a curriculum‑native, Arabic‑first, RTL learning platform can feel like when it's designed as a game instead of a worksheet. It's part of the wider work at [String](https://string.education).

---

## 🧭 Why we built it

Arabic‑first education software is thin on the ground. Most tools are English products with Arabic bolted on — the layout doesn't flip properly, the pedagogy assumes a different curriculum, and the "gamification" is a progress bar and a badge.

String‑Quests is a bet on the opposite approach:

- **Curriculum‑native, not curriculum‑agnostic.** Questions come from the students' *actual textbooks*, so the game maps onto what they're graded on at school.
- **Arabic is the source of truth.** The interface is designed right‑to‑left from the first pixel; English mirrors it, not the other way around.
- **Mastery, not completion.** Finishing a lesson isn't the win condition. *Understanding* the knowledge components inside it is — and the app is architected to measure that.
- **Every role gets a real experience.** A parent shouldn't be handed an analytics dashboard. A teacher shouldn't be handed a toy. Each audience gets an interface built for them.

It's an early, honest experiment — and a preview of the kind of learning surface String is building toward. You can read more about that mission at [string.education](https://string.education).

---

## 🚀 Features

### For students

- **Quizzes & quests from real textbooks** — **8 question types**: multiple‑choice, free input, reorder, matching, and four distinct reading‑comprehension formats.
- **Duolingo‑style gamification** — hearts (5 max, regenerating over time), XP & levels, daily streaks, gems, achievements, and 1–3 star ratings per lesson.
- **21 Arabic subjects** — broad curriculum coverage across the K‑12 range.
- **A skill tree** that turns the curriculum into a path you actually want to walk down.

### The Skill Map — the crown jewel

The Skill Map is where String‑Quests stops being a quiz app and starts being a **student model**. It's a full **knowledge‑evaluation tool** with:

- **5 visualizations** — heat map, radar, galaxy, knowledge tree, and a DNA‑strand view of the learner.
- **A 6‑metric weighted mastery engine** — mastery isn't a single accuracy percentage; it's a composite score built from multiple signals.
- **Gap analysis** — surfaces exactly which knowledge components are weak, and where in the curriculum they live.
- **A strength finder** — the mirror image: what this student is genuinely good at.

Because scoring runs all the way down to the **KC (knowledge component)** level, the Skill Map can answer questions a gradebook can't: *not "did they pass the unit?" but "which idea on which page is holding them back?"* This is the same philosophy that drives String's core [live student model](https://string.education).

### For parents — النتائج والتقدّم

A **calm, coach‑style companion** — deliberately *not* a dashboard — organized into three tabs (المواد / التقدّم / تعرّف أكثر):

- **A performance flower centerpiece** — one heart‑shaped petal per subject, colored by status and filled by mastery. A single glance tells the story.
- **Subject rings + a full‑screen "subject story"** — tap into any subject for the narrative behind the number.
- **Today's coaching** — what to talk about, and a way to send practice.
- **Homework & exam attention** flags, plus a **daily wellbeing check‑in**.
- **Progress widgets** — focus, effectiveness, streak, and points.
- **Trend charts, class ranking, and anonymized peer comparison.**
- **Learning‑style insights, teacher rapport, and study‑rhythm signals.**

Fully bilingual (Arabic‑first, RTL) and **non‑alarming by design** — a parent should leave feeling like a coach, not a case worker.

### For staff

Dedicated **teacher, admin, and principal** areas for content allocation and oversight — each scoped to the decisions that role actually makes.

---

## 🛠 Tech stack

| Layer | Choice |
| --- | --- |
| **Framework** | React 19 + TypeScript |
| **Build** | Vite (dev server on port `3000`) |
| **Styling** | Tailwind CSS v4 — `@import "tailwindcss"`, custom `duo-*` / `pastel-*` tokens |
| **Routing** | React Router DOM v7 |
| **Motion** | Framer Motion 12 |
| **Icons** | Lucide |
| **Typography** | Cairo (Arabic‑first) |
| **Persistence** | `localStorage` — no backend required |

The whole thing runs client‑side on mock/seed data, which makes it fast to clone, run, and hack on.

---

## ⚡ Getting started

**Prerequisites:** Node.js 18+ (developed on 22).

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

---

## 🧭 Useful routes

| Route | What you'll see |
| --- | --- |
| `/home` | Student dashboard |
| `/learn` | Duolingo‑style skill tree |
| `/skill-map` | Student knowledge‑evaluation tool |
| `/parent/skill-map` | Parent "Results & Progress" hub |
| `/teacher` | Teacher area |
| `/admin` | Admin area |
| `/principal` | Principal area |

---

## 🗂 Project structure (high level)

```
components/    UI — quiz, skillmap, parent-app, admin-hub, …
contexts/      UserContext (persistent), QuizSession, I18n (AR/EN + RTL)
layouts/       AppShell, Sidebar, BottomNav, TopBar
constants.ts   questions + topic metadata
types.ts       question / domain types
```

---

## 📐 Conventions

- **Bilingual, RTL‑native.** Arabic is the source of truth; English mirrors it. The entire layout flips with the locale.
- **Tailwind v4 only.** No v3 `@tailwind` directives. Runtime / data‑driven colors are applied inline, because the JIT can't see them.
- **No backend.** All state is seeded / mock data plus `localStorage`. A refresh resets ephemeral progress — by design, this is a playground, not a database.

---

## 🗺 Roadmap

String‑Quests is an experiment, and it's meant to move. Directions we're actively exploring:

- Deeper **knowledge‑tracing** models behind the 6‑metric mastery engine.
- Richer **question generation** straight from textbook source material.
- More expressive **parent coaching** — turning signals into concrete next actions.
- Tighter integration with the broader [String platform](https://string.education), where these ideas graduate from experiment to product.

If any of this is interesting to you, the bigger picture lives at [string.education](https://string.education).

---

## 🧩 About String

**String is the OS layer for schools.** We run existing learning apps inside a shared data and AI context so they work together through a single login, and every activity feeds into one live, continuously updated student model.

Schools today run a dozen disconnected tools — one app for reading, another for math, a separate gradebook, a separate parent portal — and none of them talk to each other. String is the **ground they all stand on**: a single layer that connects those apps, unifies their data, and turns every activity a student does into one coherent, continuously updated picture of that learner. Instead of a school buying yet another point tool, it gets the infrastructure that makes all its tools work together.

That's the shift — from **another edtech app** to the **operating system underneath them all**:

- 🧠 **One student model.** Every quiz, lesson, and activity — across every connected app — feeds a single live profile of the learner, from the subject level down to the individual knowledge component.
- 🔗 **One login, one context.** Students, teachers, and parents move through a connected experience instead of a pile of logins and dashboards.
- 🏫 **Arabic‑first, curriculum‑native.** Built RTL from the ground up and mapped to the real curriculum, not translated onto it.
- 🧩 **Infrastructure, not a silo.** String is designed as the layer other learning tools plug into — the data and AI context that makes the whole stack coherent.

### How this repo relates to String

> **String‑Quests is a developer experiment — a separate sandbox, not String's product.** It's where the team plays with ideas like gamified quizzing and knowledge‑component‑level mastery in the open. Some of the thinking here informs how we approach learning at String; **none of it should be read as a description of String's actual production platform, features, performance, or roadmap.** For what String really is and does, go to the source:

- 🌐 **Website:** [string.education](https://string.education)
- 🧠 **What we're building:** the operating system that lets every learning app in a school share one context, one login, and one student model — [learn more at string.education](https://string.education).

---

## 📄 License & disclaimer

🧪 **An experimental project by [String](https://string.education).** Provided as‑is, as an in‑progress exploration — not a production release. Product names, curriculum content, and interfaces are subject to change.

<div align="center">

Made with ♥ by the team at **[String](https://string.education)** · [string.education](https://string.education)

</div>
