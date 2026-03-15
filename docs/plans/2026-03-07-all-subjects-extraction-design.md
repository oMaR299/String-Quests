# All-Subjects Curriculum Extraction — Design Document

**Date:** 2026-03-07
**Status:** Approved

## Goal

Extract curriculum data from all 6 remaining NCCD framework PDFs (Science, Computer, English, Arts, PE, Kindergarten) using the same pipeline proven with Math. Each subject gets a parallel agent that adapts to the PDF's table format.

## Source PDFs

| Subject | URL Path | Arabic |
|---------|----------|--------|
| Science | `/EBV4.0/Root_Storage/EN/الإطار_العام_والخاص_للعلوم.pdf` | العلوم |
| Computer | `/EBV4.0/Root_Storage/EN/إطار_المنهاج_الخاص_بمبحث_الحاسوب_والمهارات_الرقمية.pdf` | الحاسوب |
| English | `/EBV4.0/Root_Storage/AR/FW/English-Language-Curriculum-Framework.pdf` | الإنجليزية |
| Arts | `/EBV4.0/Root_Storage/AR/FW/الإطار_الخاص_لمبحث_التربية_الفنية_والموسيقية.pdf` | التربية الفنية |
| PE | `/EBV4.0/Root_Storage/AR/FW/الاطار_العام_للرياضة.pdf` | التربية الرياضية |
| Kindergarten | `/EBV4.0/Root_Storage/AR/FW/وثيقة%20الإطار%20العام%20...pdf` | رياض الأطفال |

## Pipeline (per subject agent)

1. Download PDF from `https://www.nccd.gov.jo{path}`
2. Convert to PNG at 200 DPI using PyMuPDF
3. Read TOC/structure pages to identify grade ranges and table format
4. Extract grade-by-grade using Claude Vision, adapting to table columns
5. Output `data/curricula/{subject}/grade{N}-{subject}-raw.json`
6. Generate `data/curricula/{subject}/{subject}Curriculum.ts`

## Data Model

Same as Math: CurriculumFramework → GradeCurriculum → Domain → Standard → LearningOutcome → CurriculumKC

If a subject uses different column names, the agent maps them to the same model.

## Dashboard Update

- Add subject selector bar to CurriculumAdminPage
- Grade chips update per subject
- Explorer, charts, download all work from selected subject's data

## Execution

6 parallel agents dispatched simultaneously, each fully independent.
