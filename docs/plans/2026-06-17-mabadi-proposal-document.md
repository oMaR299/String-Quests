# Mabadi Proposal Document — Polish & Print Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the existing `/proposal/mabadi` page into a pixel-perfect, print-ready professional document that can be exported as a clean PDF with one click.

**Architecture:** The document lives at `components/proposal/MabadiProposal.tsx` as a single self-contained React component with injected `<style>` CSS. All improvements are confined to that one file plus a new `PrintButton` utility. No new routes needed.

**Tech Stack:** React 19, TypeScript, inline CSS (injected `<style>` tag), Cairo font (Google Fonts), `window.print()` for PDF export, `@page` CSS rules for A4 layout.

---

## Current problems to fix

1. **String logo doesn't load** — falls back to "S" text square; needs SVG inline fallback
2. **No print/export button** — user has no way to save as PDF
3. **`@page` CSS missing** — browser print dialog won't know paper size; pages may re-flow badly
4. **Cover sidebar overlaps** — on smaller screens the flex layout breaks
5. **Content overflow risk** — some pages may overflow their 1123px min-height and bleed into the next sheet visually
6. **Gray desk background prints** — wastes ink; `@media print` must force white background
7. **Page breaks not enforced** — no `page-break-inside: avoid` on cards/callouts; they split mid-element

---

### Task 1: Add `@page` A4 rules + fix print background

**Files:**
- Modify: `components/proposal/MabadiProposal.tsx` — inside the `<style>` block

**Step 1: Locate the style block**

Open `components/proposal/MabadiProposal.tsx`. Find the `<style>` tag. It starts with `@import url(...)`.

**Step 2: Add `@page` rules at the top of the style block, right after the `@import`:**

```css
@page {
  size: A4 portrait;
  margin: 0;
}
```

**Step 3: Update the existing `@media print` block to this:**

```css
@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

  body, .proposal-root {
    background: #fff !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  .page-sheet {
    width: 210mm !important;
    min-height: 297mm !important;
    box-shadow: none !important;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
  }

  .cover-page {
    page-break-after: always;
    break-after: page;
  }

  .print-btn {
    display: none !important;
  }
}
```

**Step 4: Add `page-break-inside: avoid` to callout boxes and feature rows in the same style block:**

```css
.callout, .feature-row, .dna-card, .data-card, .skill-bar-row {
  page-break-inside: avoid;
  break-inside: avoid;
}
```

**Step 5: Verify in browser**

Navigate to `http://localhost:3000/proposal/mabadi`. Open browser print dialog (`Ctrl+P`). Confirm it shows "A4" as the paper size and the gray background is gone.

**Step 6: Commit**

```bash
git add components/proposal/MabadiProposal.tsx
git commit -m "fix: add @page A4 rules and correct print styles for MabadiProposal"
```

---

### Task 2: Add a sticky Print / Save as PDF button

**Files:**
- Modify: `components/proposal/MabadiProposal.tsx`

**Step 1: Add `.print-btn` style inside the `<style>` block:**

```css
.print-btn {
  position: fixed;
  bottom: 32px;
  left: 32px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0c1a2e;
  color: #fff;
  font-family: 'Cairo', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transition: background 0.2s;
}
.print-btn:hover { background: #1e3050; }
.print-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
```

**Step 2: Add the button element inside `<div className="proposal-root">`, as the very first child (before the cover page):**

```tsx
<button
  className="print-btn"
  onClick={() => window.print()}
  aria-label="طباعة / حفظ PDF"
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
  <span>طباعة · PDF</span>
</button>
```

**Step 3: Test**

Go to `http://localhost:3000/proposal/mabadi`. Confirm the button appears bottom-left. Click it — browser print dialog should open. Switch destination to "Save as PDF". Confirm the button itself does NOT appear in the PDF preview.

**Step 4: Commit**

```bash
git add components/proposal/MabadiProposal.tsx
git commit -m "feat: add sticky print/PDF button to MabadiProposal"
```

---

### Task 3: Inline the String logo as SVG (fix broken logo)

**Files:**
- Modify: `components/proposal/MabadiProposal.tsx`

**Step 1: Find the cover sidebar logo block**

In the `MabadiProposal` component, find `<div className="cover-sidebar-logo">S</div>`. This is the fallback. We'll replace it with a proper SVG mark.

**Step 2: Replace the `cover-sidebar-logo` div with this inline SVG version:**

```tsx
<div className="cover-sidebar-logo">
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36 }}>
    <rect width="40" height="40" rx="10" fill="#1e90d6"/>
    <text x="20" y="28" textAnchor="middle" fill="white"
      style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Cairo, sans-serif' }}>S</text>
  </svg>
</div>
```

**Step 3: Also fix the cover body logo `<img>` tag**

Find the `<img src="/string-logo.png" ...>` in the cover body. Replace the entire logo block with:

```tsx
<div style={{ marginBottom: 20 }}>
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 10,
    background: '#f0f7ff', border: '1px solid #d0e4f8',
    borderRadius: 12, padding: '8px 16px'
  }}>
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <rect width="24" height="24" rx="6" fill="#1e90d6"/>
      <text x="12" y="17" textAnchor="middle" fill="white"
        style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Cairo' }}>S</text>
    </svg>
    <span style={{ fontSize: 13, fontWeight: 900, color: '#0c1a2e', letterSpacing: 1 }}>STRING</span>
  </div>
</div>
```

**Step 4: Verify**

Reload `http://localhost:3000/proposal/mabadi`. Confirm the cover shows a proper blue rounded-square logo with "S" in both the sidebar and the body — no broken image icon.

**Step 5: Commit**

```bash
git add components/proposal/MabadiProposal.tsx
git commit -m "fix: replace broken img logo with inline SVG in MabadiProposal cover"
```

---

### Task 4: Fix cover page layout — table of contents fills empty space

**Files:**
- Modify: `components/proposal/MabadiProposal.tsx`

**Problem:** The cover page has a large empty white space between the meta block and the table of contents because `margin-top: auto` pushes the TOC to the bottom but leaves a blank void in the middle.

**Step 1: Add a decorative separator element between the meta block and the TOC.**

In the cover body JSX, between `</div>` (closing cover-meta-block) and `<div className="cover-toc">`, insert:

```tsx
{/* Decorative feature strip */}
<div style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
  {['الفكرة', 'الذكاء الاصطناعي', 'DNA', 'Quests', 'الأهل'].map(label => (
    <div key={label} style={{
      flex: 1, background: '#f5f9ff', border: '1px solid #d8e8f8',
      borderRadius: 8, padding: '10px 8px', textAlign: 'center',
      fontSize: 11, fontWeight: 700, color: '#4a6a8a'
    }}>{label}</div>
  ))}
</div>
```

**Step 2: Remove `marginTop: 'auto'` from the `cover-toc` wrapper** by changing:

```tsx
<div className="cover-toc">
```

to:

```tsx
<div className="cover-toc" style={{ marginTop: 0 }}>
```

**Step 3: Verify**

Reload the page. The cover should now have the feature strip filling the gap and the TOC sitting naturally below it.

**Step 4: Commit**

```bash
git add components/proposal/MabadiProposal.tsx
git commit -m "fix: fill empty cover page space with feature strip"
```

---

### Task 5: Final print test — full PDF export

**Files:** None to change — this is a verification task.

**Step 1: Open the page**

Navigate to `http://localhost:3000/proposal/mabadi`.

**Step 2: Click the "طباعة · PDF" button**

The browser print dialog opens.

**Step 3: Verify these settings in the dialog:**
- Paper size: A4
- Margins: None (or Default — both fine since `@page { margin: 0 }`)
- Background graphics: ON (required for colored headers and dark boxes)
- Destination: Save as PDF

**Step 4: Save the PDF. Open it and check each page:**
- Page 1 (Cover): dark sidebar left, content right, TOC visible, no button
- Page 2–7 (Content): dark navy header band, body text, footer with page numbers
- Page 8 (Contact): contact card visible, no print button

**Step 5: If any page overflows** (content cut off at bottom), open `MabadiProposal.tsx`, find the overflowing `Page` component, and reduce font sizes or spacing inside its `page-body` div.

**Step 6: Commit if any fixes were needed**

```bash
git add components/proposal/MabadiProposal.tsx
git commit -m "fix: resolve print overflow on page N of MabadiProposal"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-06-17-mabadi-proposal-document.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open a new session with executing-plans, batch execution with checkpoints

**Which approach?**
