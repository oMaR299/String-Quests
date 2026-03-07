# Curriculum Admin Dashboard — Design Document

**Date:** 2026-03-07
**Status:** Approved
**Scope:** Read-only curriculum data explorer + per-grade JSON download

## Problem

We extracted 2,017 KCs from the Jordanian NCCD Math Framework across 13 grade levels. There's no way to browse, inspect, or download this data from the app. We need an admin dashboard for viewing and exporting the extracted curriculum data.

## Solution

A new `/curriculum-admin` route with a single-page dashboard that provides:
1. Grade selector with per-grade JSON download
2. Summary statistics cards
3. Interactive drill-down explorer (Domain → Standard → Outcome → KC)
4. Analytics charts (Bloom's distribution, difficulty, KCs per domain)

## Route & Layout

- **Route:** `/curriculum-admin` — top-level route in App.tsx
- **Layout:** Full-screen self-contained page (same pattern as `/admin/*`, `/teacher/*`)
- **Exit:** Button returns to `/home`
- **Direction:** RTL (Arabic primary)
- **Header:** Dark bar with title "مستعرض المنهاج" (Curriculum Explorer)

## Page Sections (top to bottom)

### 1. Grade Selector + Download Bar

Row of 13 clickable grade chips (الصف 1 through الصف 12 + 12 تجاري). Selected grade highlighted. Download button generates that grade's JSON from `MATH_CURRICULUM` in-memory and triggers browser download.

### 2. Summary Cards

4 stat cards in a horizontal row for the selected grade:
- **Domains** — count + domain names
- **Standards** — total count
- **Learning Outcomes** — total count
- **Knowledge Components** — total count + mini difficulty distribution

### 3. Drill-down Explorer

Interactive collapsible tree-table with 4 levels:
1. **Domain** — nameAr, nameEn, standard count (expandable)
2. **Standard** — nameAr, nameEn, outcome count (expandable)
3. **Learning Outcome** — outcomeAr, Bloom's badge, indicator count (expandable)
4. **Knowledge Component** — nameAr, nameEn, Bloom's badge, difficulty stars, tags, prerequisites

All text bilingual (Arabic primary, English secondary).

### 4. Analytics Charts

3 inline SVG charts for the selected grade:
- **Bloom's Distribution** — bar chart (KC count per Bloom level 1-6)
- **Difficulty Distribution** — bar chart (KC count per difficulty 1-5)
- **KCs per Domain** — horizontal bar chart

## Data Source

All data comes from existing exports:
- `MATH_CURRICULUM` from `data/curricula/mathCurriculum.ts`
- Helper functions from `data/curricula/index.ts`
- No backend needed — everything is client-side

## Files to Create

```
components/curriculum-admin/
  CurriculumAdminPage.tsx     — Main page component
  GradeSelector.tsx           — Grade chips + download button
  SummaryCards.tsx             — 4 stat cards
  CurriculumExplorer.tsx      — Collapsible tree-table
  CurriculumCharts.tsx        — 3 SVG charts
```

## Integration

- Add route to `App.tsx`
- Add sidebar link in `Sidebar.tsx` and `BottomNav.tsx` (Dev section)
