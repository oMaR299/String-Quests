# Phase 1: Grade 1 Math Textbook Digitization - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Download the Grade 1 Math textbook PDFs, extract all pages as images, convert each page to structured markdown with SVG diagrams, and verify quality.

**Architecture:** Python scripts download PDFs and extract pages as PNGs. AI agents process page images in parallel batches (5 pages per agent), producing markdown files with frontmatter metadata. Diagrams are described for later SVG recreation. A verification agent compares outputs against originals.

**Tech Stack:** Python 3 (PyMuPDF/fitz for PDF), AI agents for OCR/digitization, Markdown with YAML frontmatter

**PDF Sources (Jordanian Curriculum 2024-2025):**
- Semester 1 Student Book: `https://schoolbooks.jo1jo.com/1/MA.01.ST.BOOK_Print_Bleed.pdf`
- Semester 2 Student Book: `https://jo1sat.net/upload-download/do.php?id=20887`
- Semester 1 Exercises: `https://jo1sat.net/upload-download/do.php?id=20895`
- Semester 2 Exercises: `https://jo1sat.net/upload-download/do.php?id=20880`

---

### Task 1: Create Directory Structure

**Files:**
- Create: `data/textbooks/math/grade1/` (and subdirectories)

**Step 1: Create the directory tree**

```bash
mkdir -p data/textbooks/math/grade1/{pages,images,questions,flashcards,games,mindmaps}
mkdir -p data/textbooks/math/grade1/pdf
```

**Step 2: Verify directories exist**

```bash
ls -la data/textbooks/math/grade1/
```
Expected: pages/, images/, questions/, flashcards/, games/, mindmaps/, pdf/

**Step 3: Commit**

```bash
git add data/textbooks/math/grade1/.gitkeep
git commit -m "feat: create Grade 1 Math textbook directory structure"
```

---

### Task 2: Download Textbook PDFs

**Files:**
- Create: `scripts/download-textbook.py`
- Output: `data/textbooks/math/grade1/pdf/*.pdf`

**Step 1: Write the download script**

```python
"""
Download Grade 1 Math textbook PDFs from Jordanian curriculum sources.
Run: python scripts/download-textbook.py
"""
import os
import sys
import urllib.request

DEST = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1', 'pdf')

URLS = {
    'semester1-student.pdf': 'https://schoolbooks.jo1jo.com/1/MA.01.ST.BOOK_Print_Bleed.pdf',
    'semester2-student.pdf': 'https://jo1sat.net/upload-download/do.php?id=20887',
    'semester1-exercises.pdf': 'https://jo1sat.net/upload-download/do.php?id=20895',
    'semester2-exercises.pdf': 'https://jo1sat.net/upload-download/do.php?id=20880',
}

def download(name, url):
    dest_path = os.path.join(DEST, name)
    if os.path.exists(dest_path):
        size = os.path.getsize(dest_path)
        print(f'  SKIP {name} (already exists, {size:,} bytes)')
        return
    print(f'  Downloading {name}...')
    try:
        urllib.request.urlretrieve(url, dest_path)
        size = os.path.getsize(dest_path)
        print(f'  OK {name} ({size:,} bytes)')
    except Exception as e:
        print(f'  FAIL {name}: {e}')

def main():
    os.makedirs(DEST, exist_ok=True)
    print('Downloading Grade 1 Math textbooks...')
    for name, url in URLS.items():
        download(name, url)
    print('Done.')

if __name__ == '__main__':
    main()
```

**Step 2: Run the download script**

```bash
python scripts/download-textbook.py
```
Expected: 4 PDF files downloaded to `data/textbooks/math/grade1/pdf/`

**Step 3: Verify PDFs are valid**

```bash
python -c "
import fitz
for name in ['semester1-student.pdf', 'semester2-student.pdf']:
    path = f'data/textbooks/math/grade1/pdf/{name}'
    doc = fitz.open(path)
    print(f'{name}: {len(doc)} pages')
    doc.close()
"
```
Expected: Page counts for both student books (likely 100-200 pages each)

**Step 4: Commit**

```bash
git add scripts/download-textbook.py
git commit -m "feat: add textbook download script for Grade 1 Math"
```

Note: Do NOT commit the PDFs themselves (add `data/textbooks/*/pdf/*.pdf` to .gitignore).

---

### Task 3: Extract PDF Pages as Images

**Files:**
- Create: `scripts/extract-textbook-pages.py`
- Output: `data/textbooks/math/grade1/images/page-NNN.png`

**Step 1: Write the extraction script**

```python
"""
Extract all pages from Grade 1 Math textbook PDFs as PNG images.
Run: python scripts/extract-textbook-pages.py
"""
import os
import sys
import io
import fitz  # PyMuPDF

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1')
PDF_DIR = os.path.join(BASE, 'pdf')
IMG_DIR = os.path.join(BASE, 'images')
DPI = 150  # Keep under 2000px for AI processing

# Process both semester student books sequentially (pages numbered continuously)
BOOKS = [
    ('semester1-student.pdf', 'S1'),
    ('semester2-student.pdf', 'S2'),
]

def extract_pages():
    os.makedirs(IMG_DIR, exist_ok=True)
    global_page = 0

    for pdf_name, semester_tag in BOOKS:
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        if not os.path.exists(pdf_path):
            print(f'SKIP {pdf_name} (not found)')
            continue

        doc = fitz.open(pdf_path)
        print(f'\n--- {pdf_name}: {len(doc)} pages ---')

        for i in range(len(doc)):
            global_page += 1
            out_path = os.path.join(IMG_DIR, f'page-{global_page:03d}.png')

            if os.path.exists(out_path):
                continue

            page = doc[i]
            mat = fitz.Matrix(DPI / 72, DPI / 72)
            pix = page.get_pixmap(matrix=mat)
            pix.save(out_path)

            if global_page % 20 == 0:
                print(f'  Extracted {global_page} pages...')

        doc.close()

    print(f'\nTotal: {global_page} page images extracted')

def extract_embedded_images():
    """Extract embedded images (photos, illustrations) from PDFs."""
    embedded_dir = os.path.join(IMG_DIR, 'embedded')
    os.makedirs(embedded_dir, exist_ok=True)
    img_count = 0

    for pdf_name, _ in BOOKS:
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        if not os.path.exists(pdf_path):
            continue

        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            images = page.get_images(full=True)
            for img_idx, img_info in enumerate(images):
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                if base_image:
                    img_count += 1
                    ext = base_image['ext']
                    img_path = os.path.join(embedded_dir, f'page-{page_num+1:03d}-img-{img_idx+1}.{ext}')
                    with open(img_path, 'wb') as f:
                        f.write(base_image['image'])
        doc.close()

    print(f'Extracted {img_count} embedded images')

if __name__ == '__main__':
    print('=== Extracting page images ===')
    extract_pages()
    print('\n=== Extracting embedded images ===')
    extract_embedded_images()
```

**Step 2: Run the extraction**

```bash
python scripts/extract-textbook-pages.py
```
Expected: All pages extracted as PNG (150 DPI, under 2000px), plus embedded images

**Step 3: Check image dimensions**

```bash
python -c "
from PIL import Image
import os
img_dir = 'data/textbooks/math/grade1/images'
for f in sorted(os.listdir(img_dir))[:5]:
    if f.endswith('.png'):
        img = Image.open(os.path.join(img_dir, f))
        print(f'{f}: {img.size[0]}x{img.size[1]}')
"
```
Expected: All images under 2000px in both dimensions

**Step 4: Commit**

```bash
git add scripts/extract-textbook-pages.py
git commit -m "feat: add page extraction script for textbook digitization"
```

---

### Task 4: Create Metadata File

**Files:**
- Create: `data/textbooks/math/grade1/metadata.json`

**Step 1: Generate metadata from PDF analysis**

After extraction, create a metadata.json that records:

```json
{
  "subject": "رياضيات",
  "subjectEn": "Mathematics",
  "grade": 1,
  "gradeLabel": "الصف الأول",
  "curriculum": "Jordanian NCCD 2024-2025",
  "semesters": [
    {
      "id": "S1",
      "nameAr": "الفصل الأول",
      "nameEn": "Semester 1",
      "sourceFile": "semester1-student.pdf",
      "pageCount": 0,
      "startPage": 1,
      "endPage": 0
    },
    {
      "id": "S2",
      "nameAr": "الفصل الثاني",
      "nameEn": "Semester 2",
      "sourceFile": "semester2-student.pdf",
      "pageCount": 0,
      "startPage": 0,
      "endPage": 0
    }
  ],
  "totalPages": 0,
  "digitizedPages": 0,
  "status": "extracting"
}
```

Page counts and ranges will be filled after PDF extraction.

**Step 2: Commit**

```bash
git add data/textbooks/math/grade1/metadata.json
git commit -m "feat: add Grade 1 Math textbook metadata"
```

---

### Task 5: Digitize Pages — Batch Processing with Parallel Agents

**Files:**
- Create: `data/textbooks/math/grade1/pages/page-NNN.md` (one per page)
- Create: `scripts/digitize-textbook.py` (orchestrator)

**Step 1: Write the digitization orchestrator**

This Python script:
1. Reads all page images from `images/`
2. Splits into batches of 5 pages
3. Each batch is processed by an AI agent
4. Agent reads page images and produces markdown for each page

```python
"""
Orchestrate textbook page digitization.
This script is called by the agent team to track which pages need processing.
Run: python scripts/digitize-textbook.py --status
Run: python scripts/digitize-textbook.py --next-batch
"""
import os
import json
import sys
import glob

BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1')
IMG_DIR = os.path.join(BASE, 'images')
PAGE_DIR = os.path.join(BASE, 'pages')
BATCH_SIZE = 5

def get_status():
    images = sorted(glob.glob(os.path.join(IMG_DIR, 'page-*.png')))
    pages = sorted(glob.glob(os.path.join(PAGE_DIR, 'page-*.md')))
    total = len(images)
    done = len(pages)
    remaining = total - done
    print(f'Total pages: {total}')
    print(f'Digitized:   {done}')
    print(f'Remaining:   {remaining}')
    return total, done, remaining

def get_next_batch():
    images = sorted(glob.glob(os.path.join(IMG_DIR, 'page-*.png')))
    done = set(os.path.basename(f).replace('.md', '') for f in glob.glob(os.path.join(PAGE_DIR, 'page-*.md')))
    pending = [f for f in images if os.path.basename(f).replace('.png', '') not in done]
    batch = pending[:BATCH_SIZE]
    if not batch:
        print('All pages digitized!')
        return []
    print(f'Next batch ({len(batch)} pages):')
    for f in batch:
        print(f'  {os.path.basename(f)}')
    return batch

if __name__ == '__main__':
    if '--status' in sys.argv:
        get_status()
    elif '--next-batch' in sys.argv:
        get_next_batch()
    else:
        print('Usage: --status | --next-batch')
```

**Step 2: Agent digitization prompt template**

Each digitizer agent receives 3-5 page images and produces markdown with this structure:

```markdown
---
page: 15
semester: 1
unit: 1
unitNameAr: "الأعداد والعمليات"
unitNameEn: "Numbers and Operations"
lesson: 3
lessonNameAr: "قراءة الأعداد وكتابتها"
lessonNameEn: "Reading and Writing Numbers"
pageType: "content"  # content | exercise | review | intro | index
hasImages: true
hasExercises: true
---

# قراءة الأعداد وكتابتها

النص الكامل من الصفحة...

![شكل: خط الأعداد من ١ إلى ١٠](../images/page-015-diagram-1.svg)
<!-- SVG_TODO: Number line from 1 to 10, with tick marks and Arabic numerals -->

![صورة: أطفال يعدون التفاح](../images/embedded/page-015-img-1.png)

> **تمرين ١:**
> اكتب الأعداد التالية بالكلمات:
> ١. ٥ = _____
> ٢. ٨ = _____
```

Key rules for digitizer agents:
- ALL Arabic text must be extracted exactly as written
- Diagrams get `<!-- SVG_TODO: description -->` comments for later SVG creation
- Photos reference embedded images extracted in Task 3
- Exercises wrapped in blockquotes with `> **تمرين:**`
- Frontmatter must include page number, unit, lesson, page type
- If page is a cover/blank/copyright, mark pageType accordingly

**Step 3: Dispatch digitizer agents in parallel**

Boss agent dispatches 3-5 digitizer agents, each processing a batch of 5 pages.
Each agent:
1. Reads its batch of page images
2. Produces one .md file per page in `data/textbooks/math/grade1/pages/`
3. Reports completion back to boss

**Step 4: Commit after each batch**

```bash
git add data/textbooks/math/grade1/pages/
git commit -m "feat: digitize Grade 1 Math pages [batch N]"
```

---

### Task 6: Verify Digitization Quality

**Files:**
- Create: `scripts/verify-textbook-digitization.py`

**Step 1: Write verification script**

```python
"""
Verify quality of digitized textbook pages.
Checks: frontmatter present, Arabic text not empty, page numbers sequential,
all images referenced exist, no duplicate pages.
Run: python scripts/verify-textbook-digitization.py
"""
import os
import sys
import io
import glob
import re
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'textbooks', 'math', 'grade1')
PAGE_DIR = os.path.join(BASE, 'pages')
IMG_DIR = os.path.join(BASE, 'images')

errors = []
warnings = []

def check_page(filepath):
    name = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check frontmatter
    if not content.startswith('---'):
        errors.append(f'{name}: Missing frontmatter')
        return

    parts = content.split('---', 2)
    if len(parts) < 3:
        errors.append(f'{name}: Malformed frontmatter')
        return

    frontmatter = parts[1].strip()
    body = parts[2].strip()

    # Check required fields
    for field in ['page:', 'semester:', 'pageType:']:
        if field not in frontmatter:
            errors.append(f'{name}: Missing {field} in frontmatter')

    # Check body not empty (unless cover/blank)
    if 'pageType: "blank"' not in frontmatter and 'pageType: "cover"' not in frontmatter:
        if len(body) < 20:
            warnings.append(f'{name}: Very short body ({len(body)} chars)')

    # Check image references exist
    img_refs = re.findall(r'!\[.*?\]\((.*?)\)', body)
    for ref in img_refs:
        if 'SVG_TODO' in ref:
            continue
        full_path = os.path.normpath(os.path.join(PAGE_DIR, ref))
        if not os.path.exists(full_path):
            warnings.append(f'{name}: Image not found: {ref}')

    # Check Arabic content present
    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', body))
    if arabic_chars < 10 and 'pageType: "blank"' not in frontmatter:
        warnings.append(f'{name}: Very little Arabic text ({arabic_chars} chars)')

def main():
    pages = sorted(glob.glob(os.path.join(PAGE_DIR, 'page-*.md')))
    print(f'Checking {len(pages)} digitized pages...\n')

    for p in pages:
        check_page(p)

    # Check sequential page numbers
    page_nums = []
    for p in pages:
        m = re.search(r'page-(\d+)', os.path.basename(p))
        if m:
            page_nums.append(int(m.group(1)))
    page_nums.sort()
    for i in range(len(page_nums) - 1):
        if page_nums[i+1] - page_nums[i] > 1:
            errors.append(f'Gap: missing pages {page_nums[i]+1} to {page_nums[i+1]-1}')

    print(f'Errors:   {len(errors)}')
    for e in errors:
        print(f'  ERROR: {e}')
    print(f'Warnings: {len(warnings)}')
    for w in warnings:
        print(f'  WARN:  {w}')
    print(f'\nResult: {"PASS" if len(errors) == 0 else "FAIL"}')

if __name__ == '__main__':
    main()
```

**Step 2: Run verification**

```bash
python scripts/verify-textbook-digitization.py
```
Expected: 0 errors. Warnings acceptable for special pages.

**Step 3: Dispatch reviewer agent**

A reviewer agent spot-checks 10 random pages:
- Opens original page image
- Reads the generated markdown
- Verifies: text accuracy, no missing content, proper structure
- Reports any issues for re-digitization

**Step 4: Final commit**

```bash
git add scripts/verify-textbook-digitization.py
git commit -m "feat: add textbook digitization verification script"
```

---

### Task 7: Build Page-to-KC Mapping

**Files:**
- Create: `data/textbooks/math/grade1/mapping.json`
- Create: `scripts/map-textbook-to-kcs.py`

**Step 1: Write mapping script**

The mapper agent reads each page's content + our 116 Grade 1 Math KCs and creates:

```json
{
  "pages": {
    "page-015": {
      "kcIds": ["kc-math-g1-1", "kc-math-g1-2"],
      "unit": 1,
      "lesson": 3,
      "confidence": 0.95
    }
  },
  "kcs": {
    "kc-math-g1-1": {
      "pageIds": ["page-015", "page-016", "page-042"],
      "totalPages": 3
    }
  },
  "coverage": {
    "totalKCs": 116,
    "mappedKCs": 0,
    "unmappedKCs": [],
    "totalPages": 0,
    "mappedPages": 0
  }
}
```

**Step 2: Verify coverage**

```bash
python scripts/map-textbook-to-kcs.py --verify
```
Expected: Every KC has at least 1 page. Every content page has at least 1 KC.

**Step 3: Commit**

```bash
git add data/textbooks/math/grade1/mapping.json scripts/map-textbook-to-kcs.py
git commit -m "feat: map Grade 1 Math textbook pages to curriculum KCs"
```

---

## Agent Team Assignments

| Task | Agent(s) | Parallel? |
|------|----------|-----------|
| Task 1: Directories | Boss | No |
| Task 2: Download PDFs | Downloader agent | No |
| Task 3: Extract images | Extractor agent | No |
| Task 4: Metadata | Boss | No |
| Task 5: Digitize pages | 3-5 Digitizer agents | YES - parallel batches |
| Task 6: Verify quality | 1-2 Reviewer agents | After Task 5 |
| Task 7: KC mapping | Mapper agent | After Task 6 |

**Total estimated: ~7-10 agents for Phase 1**

---

## Definition of Done (Phase 1)

- [ ] All textbook PDFs downloaded
- [ ] All pages extracted as PNG images
- [ ] All pages digitized as markdown with frontmatter
- [ ] SVG_TODO comments for all diagrams
- [ ] Photos referenced from embedded images
- [ ] Verification passes: 0 errors
- [ ] Reviewer spot-check: content accurate
- [ ] KC mapping complete: 100% coverage
- [ ] metadata.json updated with final stats
- [ ] All scripts committed
