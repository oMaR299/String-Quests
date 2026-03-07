# Skill Map Redesign: Textbook-Scoped Visualizations

**Date:** 2026-03-07
**Status:** Approved

## Problem

All 21 subjects / 34 skills are dumped into one skill map view. Users can't focus on a specific textbook. Galaxy and Textbook Explorer visualizations are hard to read.

## Solution Overview

1. Add a Textbook Selector (Duolingo language-picker style)
2. Redesign Galaxy → Galaxy Radar (spider chart + galaxy aesthetic)
3. Redesign Textbook Explorer → Progress Path (Duolingo skill tree style)
4. Scope all 7 visualizations to the selected textbook

---

## Part 1: Textbook Selector

**Location:** Top of `SkillMapLayout`, between header and summary dashboard.

**Behavior:**
- Dropdown/switcher showing current textbook name + grade + icon
- Stores selection in localStorage key `string-quests-active-textbook`
- Auto-loads last used textbook on mount; defaults to first available
- All downstream data filters to only KCs belonging to selected textbook

**Data source:** `TEXTBOOK_DATA` from `data/sampleTextbook.ts`. Currently one textbook; structure supports multiple.

---

## Part 2: Galaxy Radar

Replace scattered star constellation with a radar/spider chart styled as a galaxy.

**Structure:**
- SVG viewBox 800x600, centered
- Each unit of the selected textbook = one spoke/axis (5 units = pentagon)
- Unit names as labels at spoke tips
- Mastery % fills outward along each spoke (0% center, 100% tip)
- Filled polygon connects data points across all spokes

**Galaxy Aesthetic:**
- Background: `bg-gradient-to-b from-slate-900 to-indigo-950`
- 60 ambient background stars with twinkle animations
- Spoke lines: thin white at 15% opacity
- Grid rings at 25%, 50%, 75%, 100%
- Polygon fill: semi-transparent gradient using textbook category color
- Polygon edge: glowing neon stroke via `feGaussianBlur` SVG filter
- Data points: bright circles with glow filter at each spoke intersection
- Nebula effect: radial gradient clouds near high-mastery axes (>75%)
- Mastered units (90%+): pulsing glow animation on data point

**Interaction:**
- Hover spoke → tooltip with unit name + mastery % + lesson count
- Click spoke/data point → drill into unit (show lessons panel or sub-radar)

**Data flow:** Receives textbook-filtered masteries. Computes unit mastery via `calculateUnitMastery()`.

---

## Part 3: Progress Path (Textbook Explorer Redesign)

Replace collapsible tree with Duolingo-style vertical winding path.

**Layout:**
- Vertical scrollable container
- S-curve winding path (left-right pattern like Duolingo skill tree)
- Each page = one node on the path
- Nodes grouped by lesson, lessons grouped by unit
- Unit headers as full-width section dividers

**Node Design:**
- Circle nodes (48x48px) with page number inside
- Color by mastery: grey (not started), red (<40%), gold (40-89%), green (90%+)
- Completed: solid fill + checkmark
- Current/next: larger (56x56px) with pulsing ring
- Locked: grey + lock icon, transparent — locked if prerequisites unmet via `checkPrerequisites()`
- Connecting path: curved SVG line, colored portion = progress

**Node interaction:**
- Click → opens `SkillDetailPanel` showing KCs for that page
- Page name + mastery % shown on hover/below node

**Unit section headers:**
- Full-width banner with unit color, unit number badge, unit name, mastery bar

**Data flow:** Iterates `TEXTBOOK_DATA.unitIds` → `lessonIds` → `pageIds`. Mastery via `calculatePageMastery()`. Prerequisites via KC chains.

---

## Part 4: Scoping All 7 Visualizations

| Viz | Scoped Behavior |
|-----|----------------|
| Heat Map | Grid shows units/lessons from selected textbook |
| Radar | Axes = units of selected textbook |
| Galaxy | Replaced with Galaxy Radar (Part 2) |
| Tree | Branches = units, sub-branches = lessons, leaves = pages/KCs |
| DNA | Rungs = pages from selected textbook in order |
| Textbook Explorer | Replaced with Progress Path (Part 3) |
| Memory Timeline | Filters to KCs from selected textbook |

Key: `SkillMapLayout` passes textbook-filtered data to all child viz components. Props stay the same but masteries array is pre-filtered.

---

## Technical Notes

- Tailwind CSS v4: use `@import "tailwindcss"` NOT `@tailwind`
- All animations via Framer Motion
- Bilingual EN/AR via locale prop
- Cairo font
- localStorage persistence
- React.lazy + Suspense for code-split views
