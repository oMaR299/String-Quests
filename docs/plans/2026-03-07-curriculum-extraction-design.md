# Curriculum Extraction Module — Design Document

**Date:** 2026-03-07
**Status:** Approved
**Scope:** Math framework only (expandable to all subjects later)

## Problem

The app uses hardcoded sample textbook data (105 fake KCs). We need real Knowledge Components extracted from the official Jordanian curriculum frameworks published by NCCD (nccd.gov.jo). The framework PDFs contain images (not searchable text), requiring vision-based extraction.

## Source

- **URL:** `https://www.nccd.gov.jo/AR/List/__الأطر____`
- **Math PDF:** `Math_Framework_Arabic.pdf` (173 pages, Arabic, image-based)
- **All subjects available:** Math, Science, English, Computer, Arts, PE, Kindergarten, General Framework

## Audiences

The extracted data serves 3 stakeholders:

| Audience | What they see | Data level |
|----------|--------------|------------|
| **Student** | KCs in skill map, mastery tracking | KnowledgeComponent |
| **Teacher** | Learning outcomes, performance indicators | LearningOutcome, Indicator |
| **Ministry** | Standards alignment, domain coverage reports | Domain, Standard |

## Data Model

```
CurriculumFramework
├── id: string
├── subject: string (Arabic)
├── subjectEn: string
├── grades: GradeCurriculum[]
│
GradeCurriculum
├── gradeLevel: number
├── domains: Domain[]  (المحاور/المجالات)
│
Domain (محور)
├── id: string
├── nameAr: string
├── nameEn: string
├── standardCode: string (e.g. "3.OA")
├── standards: Standard[]
│
Standard (معيار)
├── id: string
├── nameAr: string
├── nameEn: string
├── learningOutcomes: LearningOutcome[]
│
LearningOutcome (نتاج تعلم)
├── id: string
├── outcomeAr: string
├── outcomeEn: string
├── bloomLevel: 1-6
├── indicators: string[] (مؤشرات الأداء)
├── knowledgeComponents: KnowledgeComponent[]
│
KnowledgeComponent (مكون معرفي)
├── id: string
├── nameAr: string
├── nameEn: string
├── bloomLevel: 1-6
├── difficulty: 1-5
├── prerequisiteKcIds: string[]
├── tags: string[]
├── standardCode: string
```

This maps to the existing app model:
- `Domain` → `Unit`
- `Standard` → `Lesson`
- `LearningOutcome` → `Page`
- `KnowledgeComponent` → `KnowledgeComponent` (direct match)

## Extraction Pipeline

### Step 1: Download & Convert PDF
- Download `Math_Framework_Arabic.pdf` from NCCD
- Convert each page to PNG using `pdftoppm` or Node.js pdf-to-image
- Store in `scripts/curriculum-data/pages/math/`

### Step 2: Smart Sampling — Read TOC & Structure
- Read pages 1-10 with Claude Vision
- Identify page ranges for each grade level and domain
- Build a page map: `{ grade: 3, domain: "الأعداد والعمليات", pages: [45-62] }`

### Step 3: Targeted Extraction
- For each identified data section, read pages with Claude Vision
- Extract: domain names, standard codes, learning outcomes, performance indicators
- Parse Arabic text into structured JSON

### Step 4: KC Generation
- From learning outcomes, derive atomic Knowledge Components
- Assign Bloom's levels based on Arabic verb analysis (يعرف=1, يفهم=2, يطبق=3, يحلل=4, يقيم=5, يبتكر=6)
- Estimate difficulty (1-5)
- Infer prerequisite chains from sequential ordering
- Generate English translations

### Step 5: Output & Integration
- Write raw extraction to `data/curricula/math-framework.json`
- Generate TypeScript file `data/curricula/mathCurriculum.ts` matching app types
- Create adapter functions to map CurriculumFramework → Textbook (for existing skill map)

### Step 6: Dashboard (future)
- Curriculum browser page: grade selector → subject → domains → outcomes → KCs
- Wire into existing Skill Map via textbook selector
- Add teacher view and ministry report view

## Approach

- **Extraction method:** Claude Vision (one-time, manual via Claude Code agents)
- **Smart sampling:** Read TOC first, extract only data pages (skip preamble/methodology)
- **Implementation:** Team agents with parallel task dispatch
- **Math first:** Prove pipeline, then expand to other subjects

## Output Files

```
data/
  curricula/
    math-framework.json          # Raw extraction (all grades)
    mathCurriculum.ts            # TypeScript typed data
    index.ts                     # Exports + helpers
scripts/
  curriculum-data/
    pages/math/                  # PDF page images (gitignored)
```
