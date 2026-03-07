# UI Visual Audit — String-Quests
**Date:** 2026-03-07
**Auditor:** UI Guardian (Claude Sonnet 4.6)
**App:** مسابقة المعرفة (Knowledge Quest)
**Stack:** Vite + React + Tailwind CSS v4 + Framer Motion + Cairo font
**Aesthetic:** Glassmorphism, Duolingo-inspired gamification

---

## 1. `/home` — Dashboard

### What Looks Good
- Clean centered card layout with glassmorphism styling (subtle shadow, rounded corners).
- Stats grid (Accuracy, Points, Boosts, Daily Streak) uses consistent card sizing and font hierarchy.
- "ابدأ رحلة اليوم" CTA button is bold and prominent in dark navy — good contrast.
- Arabic RTL layout renders correctly. Cairo font loads cleanly.
- Top navigation bar is clean with proper spacing and active state highlight on "التحديات".
- Right sidebar navigation is minimal and well-organized.
- Lives (hearts) in top bar are visually distinctive and properly sized.

### Visual Bugs
- **Large empty whitespace below the card** — the main content card is vertically centered in the upper half, leaving ~40% of the viewport as dead space. The page does not feel full or complete.
- **BOOSTS label is in English** ("BOOSTS") inside an otherwise Arabic card. This is a language inconsistency. Should be "المعززات" or similar Arabic translation.
- **Progress bar color** in the XP bar (top left) is lavender/blue — does not match the Duolingo palette (should be green #58CC02 for XP progress).
- **"كيف ألعب؟" link** is very low contrast (light gray on white) — accessibility issue.
- **Page icon/logo** in the card header uses a generic brain emoji-ish icon — no strong brand identity.
- **Left sidebar** shows a thin purple bar on the left edge — this appears to be a visual artifact or an incomplete sidebar/panel indicator. Unclear purpose.

### What Could Look Better
- The home card could be wider or have more content (recent activity, quick stats, recommended next skill).
- Bottom half of page is completely empty — could show streaks calendar, recent achievements, or a "continue where you left off" section.
- Stats cards could use the Duolingo color palette more: green for accuracy, gold for points, orange for streak, blue for boosts.
- Consider adding a greeting ("مرحباً، طالب!" or similar) to personalize the experience.

### Accessibility Issues
- "كيف ألعب؟" — very low contrast text, fails WCAG AA.
- The purple gradient card background behind stats is subtle but the text labels ("الدقة", "مجموع النقاط") are tiny and grayish — may be hard to read on mobile.

---

## 2. `/learn` — Duolingo Skill Tree

### What Looks Good
- Skill tree path style is clearly Duolingo-inspired with the winding/zigzag path layout.
- The unlocked "الجمع" node has a clear green ring and active "▶ الجمع" CTA button.
- Locked skills use a lock icon correctly — visually communicates progression gating.
- Section headers ("الأساسيات", "فهم المقروء") use leaf/book emojis for categorization.
- Dashed connecting lines between nodes reinforce the path metaphor.

### Visual Bugs
- **Left purple/lavender vertical bar** — same artifact as home page. Appears as a ~4px bar on the far left of the content area. Looks like an accidentally visible scrollbar or border element.
- **Locked skill nodes are too uniform** — all gray/white circles with identical lock icons. There's no visual differentiation between "almost unlocked" vs "far away" skills. In Duolingo, nodes have colors/characters.
- **Path alignment** — the skill nodes are not perfectly centered; they zigzag left-center-left in an irregular pattern that looks slightly off. The rightmost nodes get cut near the sidebar.
- **Single active skill has green ring** but the "الجمع" label button below it visually competes with the node itself — two click targets stacked.
- **Node sizes are inconsistent** — the active node (大きい) is larger than locked ones but the size difference is subtle on a white background.
- **Section header cards** ("الأساسيات") use a 🌱 emoji but the styling is flat/minimal — could be more visually distinctive as a category marker.
- **Content is left-aligned** in an RTL context — the skill tree scrolls vertically in an off-center column which feels unbalanced.

### What Could Look Better
- Locked nodes could have ghost/transparent styling with category-specific colors.
- Add XP bubble showing cost to unlock next skill.
- Section divider cards could be more decorative (background gradient, icon).
- Active node could have a subtle pulsing animation (Framer Motion) to draw attention.

### Accessibility
- Lock icons inside gray circles have very low contrast — gray on light gray.
- Text labels below locked nodes ("الطرح", "الأعداد") are small and light gray.

---

## 3. `/learn/math/addition/play` — Quiz Page

### What Looks Good
- Quiz UI is clean and focused — full white/light background reduces distraction.
- Progress bar at top with "1 / 1" counter is clear.
- "كم يساوي: 5 + 5؟" heading is large, bold, and readable.
- Text input has a nice rounded style with the ✍️ emoji as a visual hint.
- The "رياضيات" subject tag (top right, dark navy pill) is a nice contextual indicator.
- "تلميح" (hint) button is styled correctly as a yellow action button.
- Hearts/lives at top left persist correctly.

### Visual Bugs
- **Large dead space below the answer area** — the quiz card occupies the top ~50% of the viewport with the bottom 50% being empty light gray. No footer content, no padding fill.
- **"تأكيد الإجابة" button** starts disabled (gray) and only enables after typing — good UX, but the disabled gray is almost identical to the enabled dark navy from a distance.
- **XP bubble** (top left "10 ◈") is very small and floats awkwardly above a pink/salmon gradient blob. The styling looks unfinished (the blob decoration feels incomplete).
- **"لست متأكداً تماماً"** ("I'm not sure") button is plain unstyled text-link at far right — inconsistent with the main button style.
- **Progress bar** uses a lavender-to-pink gradient — not matching the standard Duolingo green (#58CC02). Should be more energetic.
- **Confirm button icon** (✓ checkmark image) is misaligned slightly to the left of the button text in Arabic RTL context.

### What Could Look Better
- Add a subtle question number progress indicator below the progress bar.
- The question area feels floating — a slight card/panel background would anchor it.
- Progress bar should turn green as it fills (correctness feedback).
- Bottom area could show a motivational message or subject context card.

### Accessibility
- Disabled state of "تأكيد الإجابة" has insufficient visual distinction from enabled state at small sizes.

---

## 4. Quiz Correct Answer Feedback

### What Looks Good
- Green background feedback panel clearly signals "correct."
- "+10 ◈" points display is large and celebratory.
- "إجابة صحيحة!" heading is bold.
- Auto-advance "التالي..." with spinner is smooth UX.

### Visual Bugs
- **Panel is top-half only** — the correct answer panel appears in the upper half of the viewport; the bottom ~55% is empty light gray dead space.
- **The panel overflows the top** — the green check circle at the top of the feedback card is partially cut off by the viewport top edge. It's clipped and only the bottom of the icon is visible.
- **Feedback card lacks padding at top** — the celebration icon runs into the edge.

### What Could Look Better
- Full-screen overlay or centered card for the feedback state.
- Add a confetti/sparkle animation (Framer Motion) on correct answer.
- "التالي..." loading text could be more descriptive.

---

## 5. Quiz End/Results Screen

### What Looks Good
- **This is the strongest screen visually.** Confetti dots animation in background is delightful.
- Trophy icon in gold circle is appropriate and celebratory.
- "أداء أسطوري!" and motivational subtitle are well-written.
- Score card "10 / 10" with subtle decorative diamond is clean.
- Stats grid (XP earned, accuracy) uses colored backgrounds (pink/purple, light blue) that match the palette.
- "إلعب مرة أخرى" button is clear and prominent.
- Overall card is well-proportioned and centered.

### Visual Bugs
- **Score layout RTL issue** — "10/ 10" displays as number then slash then number, but in RTL layout the "/" order reads awkwardly. Shows "10/" on the left and "10" on the right with slash between — the visual reads "10 /10" with inconsistent spacing.
- **Score "10" large number** and smaller "/10" have different font weights creating slight visual tension.
- **Diamond decoration** (translucent pink) overlaps the score box content area — a decorative element partially obscures data.
- **XP stat box** uses pink/magenta accent — matches the diamond icon but not the Duolingo green palette for XP.
- **No "Go Back to Learn" button** — only "Play Again" is offered. Users have no easy exit to continue the skill tree.
- **Background confetti** dots use random colors (purple, blue, gold, red) — generally fine but some dots are very close to the card edge and look like they might be cut off.

### What Could Look Better
- Add "متابعة" (Continue) button to return to skill tree.
- Show level-up animation if XP milestone is reached.
- Display a short summary of wrong answers or "perfect score" badge.

### Accessibility
- Score display contrast is good. No significant issues.

---

## 6. `/skill-map` — Heat Map Mode (Default)

### What Looks Good
- **Rich dashboard header** with multiple summary cards (rank, cognitive depth, skills count, strongest/weakest, total score) is information-dense and useful.
- Duolingo-palette color coding: green for high scores (MATH-ADD: 85), red/pink for weak/zero scores.
- Subject grouping with emoji headers (🧮 رياضيات, 🌐 لغات, 🌍 ثقافة عامة) is clear and scannable.
- "الفجوات" and "نقاط القوة" pill buttons at top left are well-styled with count badges.
- Time filter row (الكل / 30 يوم / 7 أيام / اليوم) is clean.
- Visualization mode switcher buttons are well-aligned.
- Active skill (MATH-ADD) shows green score "85" with a green progress bar underline — excellent at-a-glance status.

### Visual Bugs
- **Same left purple bar artifact** as other pages — appears as a thin lavender strip on the far left content edge.
- **Summary cards row** is very information-dense with tiny font — "العمق المعرفي" mini bar chart has bars so small they're nearly invisible at small screen sizes.
- **"الأضعف" card** has identical subject ("رياضيات 28%") as "الأقوى" card — this is because there's only 1 practiced subject, so both show the same. Visual logic issue: showing same subject as both strongest and weakest is confusing.
- **Most skill cards show "0"** with a plain zero — no visual distinction between "never attempted" vs "attempted but failed". All zero-score cards look the same.
- **Subject category headers** use "📚" emoji for almost every category (ترتيب, معلومات, حيوانات, etc.) — lacks unique visual identity per subject. Should use subject-specific icons/emojis.
- **Score progress bars** on cards with score 0 are invisible (empty bars) — the bar container outline itself is also barely visible.
- **Card grid is asymmetric** — the last card in each subject row aligns left (RTL). When a row has only 1 card (e.g., ثقافة عامة), the single card is right-aligned while the rest of the content is left-aligned, creating visual inconsistency.

### What Could Look Better
- Add a color legend for the heat map (e.g., red = 0-30%, yellow = 30-60%, green = 60-100%).
- The 0-score cards could show a ghost/empty state with "لم تُجرب بعد" text.
- Skills count "1/34" could be a more prominent progress bar rather than inline text.
- Consider collapsible subject groups to reduce scroll.

### Accessibility
- Tiny bar charts in "العمق المعرفي" have no text alternative.
- Red/green color coding alone distinguishes skill strength — needs secondary indicator for color-blind users.

---

## 7. `/skill-map` — Radar Mode

### What Looks Good
- Radar/spider chart renders correctly with 8 subject axes.
- Subject labels around the perimeter are legible.
- The hexagon grid lines provide scale reference.
- Active "رادار" button pill is properly highlighted.

### Visual Bugs
- **Data point is almost invisible** — only one subject (رياضيات at 28%) has any data, so the "filled area" is a tiny dot near the center of the radar. The chart looks practically empty.
- **Two overlapping dots** at the center (a blue circle and an orange dot) — unclear what each represents. No legend visible in-viewport.
- **Subject label colors** are multicolored (green, purple, pink, blue) which is festive but inconsistent with the rest of the UI's color system. No clear meaning to the colors.
- **Radar container has a plain white background with thin border** — lacks the glassmorphism aesthetic used elsewhere. Looks like a raw SVG dump.
- **No tooltip or interactivity indicators** — user doesn't know they can hover the chart axes.
- **Chart appears left-aligned in its container** — not centered horizontally. The chart is offset slightly to the left leaving empty space to the right.
- **Large empty space below the chart** before the page footer.

### What Could Look Better
- When only 1 subject has data, show an onboarding prompt: "أكمل مزيداً من المواضيع لرؤية رادارك!"
- Add hover tooltips showing exact percentage per axis.
- Apply glassmorphism card background consistent with other panels.
- Animate the fill area drawing in (Framer Motion).

---

## 8. `/skill-map` — Galaxy Mode

### What Looks Good
- Dark navy/space background is atmospheric and thematically appropriate.
- Subject name labels use varied colors (teal, yellow, pink, purple) that create a galaxy-like feel.
- Legend at the bottom (Mastered / Proficient / Developing / Attempted / Unstarted) — English labels instead of Arabic, but clear.
- Most of the galaxy canvas is visible in the viewport.

### Visual Bugs
- **Only one star/dot is visible** (رياضيات / جمع الأعداد at 85%) as a bright point. All other 33 skills are unstarted and appear as invisible or extremely faint dots — the galaxy looks nearly empty.
- **Subject labels are text-only** with no associated visual nodes visible nearby — the labels float in empty space with no anchoring dots.
- **Legend is in English** ("Mastered", "Proficient", "Developing", "Attempted", "Unstarted") while the entire app is Arabic. Major language inconsistency.
- **No interactivity feedback** — hovering a skill/label doesn't visually highlight it clearly.
- **Large wasted canvas space** — the skill nodes cluster in the upper-center leaving most of the canvas dark and empty.
- **Canvas aspect ratio** is very tall and narrow, making the galaxy feel cramped horizontally.

### What Could Look Better
- Unstarted skills should at least appear as dim/ghost stars so the galaxy looks populated.
- Add panning/zooming capability for a denser star map.
- Consider adding constellation lines connecting related skills.
- Translate legend to Arabic.

---

## 9. `/skill-map` — Knowledge Tree Mode

### What Looks Good
- Tree metaphor (trunk, branches, leaves) is creative and unique.
- The single mastered skill (جمع الأعداد) appears as a visible green dot/leaf near the top — good mastery indicator.
- Each branch represents a subject category with a label.
- Tree has a pleasant earthy aesthetic (brown trunk, light green background).
- Legend at the bottom is visible.

### Visual Bugs
- **Legend is in English** again ("Mastered", "Proficient", etc.) — same inconsistency as Galaxy mode.
- **Branch labels are tiny and hard to read** — they sit along the branches at small font size with colorful text (pink, green, blue) but insufficient contrast against the light green background.
- **Most nodes are invisible small dots** — the 33 unstarted skills appear as tiny gray dots that barely register visually. The tree looks barren.
- **Labels overlap branches** — Arabic text labels for some subjects (علوم الأرض, لغة إنجليزية) appear to overlap with neighboring branch lines.
- **Tree trunk is off-center** — positioned left of center, making the right side of the canvas feel unbalanced.
- **Branches are too uniform** — all branches are the same thickness and arc, regardless of how many skills are in each category. A category with 11 skills (لغات) looks identical to one with 1 skill.
- **The root nodes at bottom are tiny** and the tree disappears off the bottom of the container with no indicator it continues.
- **Container has no scroll indicator** — user won't know to scroll the canvas.

### What Could Look Better
- Branches could scale with skill count (thicker = more skills).
- Mastered skills could be shown as glowing/colored leaves rather than dots.
- Animate the tree growing upward (Framer Motion entrance animation).
- Tree background gradient could be richer (sky at top, earth at bottom).

---

## 10. `/skill-map` — DNA Strand Mode

### What Looks Good
- DNA double helix visual is instantly recognizable and thematically clever for "knowledge strands."
- The blue/pink interwoven helix lines are rendered cleanly.
- Mode is visually distinctive from all other modes.

### Visual Bugs
- **No skill labels visible in viewport** — the DNA strand shows the helical structure but no skill names or data points are visible in the screenshot. The skills may be off-screen or the labels may not be rendering.
- **Strand is off-center** — positioned in the upper-left area of the canvas container rather than centered.
- **No data visualization** — the strand doesn't appear to show mastery state on the nodes. All the "rungs" of the DNA ladder look identical regardless of skill mastery.
- **Legend is present** at the bottom but the canvas above it appears empty of content beyond the bare helix lines.
- **Very large empty canvas** — the strand occupies only ~35% of the canvas width and extends far down beyond the viewport with no indicators.
- **English legend** again — same as Galaxy and Tree modes.

### What Could Look Better
- Each DNA rung/node should be color-coded by mastery level.
- Skill name labels should appear along the rungs.
- Center the helix in the canvas.
- Add hover/tooltip on each node showing skill name and score.

---

## 11. Skill Detail Panel (MATH-ADD)

### What Looks Good
- Panel slides in from the right — good interaction pattern.
- Circular progress indicator (85%) with green ring is clear and well-designed.
- "إتقان" label below the score is appropriately sized.
- 6-metric breakdown (Accuracy, Stability, Retention, Calibration, Growth, Depth) with mini bar graphs is comprehensive and informative.
- "سجل المحاولات (1)" section shows the quiz attempt with score and date — useful history.
- "تدرب على هذه المهارة" CTA button uses the brand blue (#1CB0F6) — stands out well.
- "proficient" badge at top left uses a clear pill style.
- Breadcrumb "رياضيات > الحساب" is clear.

### Visual Bugs
- **"proficient" badge is in English** — should be "متقدم" or the Arabic equivalent. Language inconsistency.
- **Background blur on main content** when panel is open is very heavy — the skill map behind is almost unreadable, making the blur feel more like a page overlay than a side panel. Contrast with the crisp white panel creates a jarring visual split.
- **Metric labels are right-aligned Arabic** but metric bars go left-to-right — in RTL layout, bars should fill from right to left.
- **Retention metric** (80%) has a gray bar which is the same color as the Depth/Growth (50%) bars. Bar colors should vary by value (green for high, yellow for medium, red for low).
- **Close button (X)** is very small (top-left of panel) and low contrast — the icon is a thin X on white background.
- **Panel has no scrollbar indicator** despite content that requires scrolling.

### What Could Look Better
- Translate "proficient" to Arabic.
- Add color coding to metric bars (green/yellow/orange/red).
- Reduce background blur intensity.
- Add an animation for the circular progress drawing in.

---

## 12. Gap Analysis Panel

### What Looks Good
- Panel title "تحليل الفجوات" with subtitle "33 فجوة تحتاج اهتمامك" is clear and alarming (appropriate tone).
- Warning icon (orange/amber triangle) matches the urgency of gaps.
- "لم يتم المحاولة 33" accordion section is correctly expandable.
- Each gap row shows skill name, subject path (e.g., "رياضيات · الطرح"), and "No attempts yet" status.
- "ابدأ" CTA buttons on each row are dark and clear — good call to action.
- The panel is scrollable with visible content.

### Visual Bugs
- **"No attempts yet" text is in English** throughout — should be Arabic ("لا محاولات بعد"). Major language inconsistency.
- **All 33 gaps are the same category** ("لم يتم المحاولة") — there's no breakdown by priority, difficulty, or subject. For a student with 33 gaps, this flat list is overwhelming.
- **"ابدأ" button contains a book icon** (📖) — the icon is slightly misaligned inside the button, sitting too close to the text.
- **Backdrop** when panel is open is barely dimmed — the panel looks like it's floating over the live page rather than an overlay. A slightly more prominent scrim would help.
- **No visual hierarchy** among gaps — all rows look identical regardless of how critical the gap is.

### What Could Look Better
- Add categorization: group gaps by subject.
- Sort gaps by "most critical" (closest to current skill level, prerequisite skills first).
- Add a progress summary at top (e.g., "0/33 gaps addressed").
- Translate "No attempts yet" to Arabic.

---

## 13. Strength Finder Panel

### What Looks Good
- Panel structure mirrors Gap Analysis — consistent UX pattern.
- "نقاط القوة" (Strengths) with trophy icon in gold/orange is thematically appropriate.
- "1 نقطة قوة مكتشفة" subtitle is clear.
- The single strength (جمع الأعداد, 85% mastery) is displayed cleanly in a card.
- "High confidence + accuracy" descriptor — though English, conveys meaning.
- The "85 إتقان" score badge is well-styled in green/gold.

### Visual Bugs
- **"High confidence + accuracy" is in English** — should be Arabic. ("ثقة عالية + دقة").
- **Only 1 strength shown** — given the new quiz data, this is technically accurate, but the panel feels sparse. A more encouraging empty state would help motivate.
- **"ميول طبيعية" category label** could be confusing — "Natural Tendencies"? The category naming is unclear for students.
- **Score badge color** (olive/tan background) doesn't match the green mastery theme established elsewhere.

### What Could Look Better
- Add "أحسنت!" encouragement message when there's at least 1 strength.
- Show what would need to happen to discover more strengths.
- "ميول طبيعية" category needs a clearer label and icon.

---

## 14. `/profile` — Student Profile

### What Looks Good
- **Most visually impressive page.** The orange gradient "streak" banner is bold and motivating.
- "1 أيام متتالية من الحماس" streak card with flame icon looks great — engaging.
- Daily tasks section ("المهام اليومية") with progress bars is well-structured.
- Task progress bars use blue fill color — clear and readable.
- Leaderboard mini-widget ("الدوري الذهبي") shows rank 7 with contextual neighbors (rank 1 and rank 8) — smart truncation.
- "متجر الجوائز" (Prize Store) purple banner at bottom is colorful and attention-grabbing.
- Level indicator (LVL 1) and XP bar in top-left card are clean.
- "Boosts" card with "Active" badge and "متجر المعززات" button is well-styled with purple gradient border.
- Confetti/fire/color theming throughout is consistent and vibrant.

### Visual Bugs
- **Profile avatar area** (top right of header, next to "مركز القيادة") is a plain empty gray circle — no avatar image, no initials fallback. Looks broken/unfinished.
- **"لوحة الصدارة" / "نظرة عامة" tabs** in the page header — the "نظرة عامة" tab appears active (dark) but its underline/active indicator style is not clearly distinguished from "لوحة الصدارة". Tab styling could be more pronounced.
- **XP bar** in the level card (top left) is nearly empty and the fill color is very faint — the bar is barely visible.
- **Streak tracker icons** (7 circles row inside the orange banner) — locked days use a gray lock icon which is very low contrast on the orange/red gradient background.
- **Daily tasks XP rewards** (50+, 100+, 200+) use a sparkle ✨ emoji that appears as an emoji rather than an icon — inconsistent with the icon system used elsewhere.
- **Leaderboard card** ("الدوري الذهبي") cuts off at the bottom — "اضغط لعرض الترتيب الكامل" footer link is partially hidden by the bottom edge of the card. The card needs more bottom padding.
- **Rank indicator** for the user (rank 7) is a plain gray default avatar dot — missing personalization.
- **"قريباً" badge** ("Coming Soon") on the prize store banner is well-placed but the text is white on yellow background with poor contrast.
- **Network error for noise.svg** (grainy gradients from vercel.app) — one background texture fails to load. This means some glassmorphism backgrounds may look flat.

### What Could Look Better
- Add a proper avatar/initials placeholder in the profile header.
- The page doesn't show the user's actual name anywhere prominent.
- Consider adding a stats summary bar (total XP earned, total questions answered, best subject).
- The Prize Store "قريباً" items are 3 locked gray icons — could show silhouettes or descriptions of what's coming.

### Accessibility
- Orange banner gradient background with small white text for the streak counter days — contrast may fail WCAG AA.
- "قريباً" yellow badge with white text fails WCAG AA contrast ratio.

---

## Global / Cross-Page Issues

### Critical Bugs (Fix First)
1. **English strings scattered throughout Arabic UI:**
   - "No attempts yet" in Gap Analysis panel
   - "High confidence + accuracy" in Strength Finder
   - "proficient" badge in Skill Detail Panel
   - Legend labels ("Mastered", "Proficient", "Developing", "Attempted", "Unstarted") in Galaxy, Tree, and DNA modes
   - "BOOSTS" in the home dashboard card
   All of these should be translated to Arabic.

2. **Left purple vertical bar artifact** — visible on Home, Learn, Skill Map pages. A ~4px lavender/purple strip on the left side of the main content area. Appears to be an unintended element (possibly a border, sidebar edge, or progress indicator rendered incorrectly).

3. **Dead space / empty viewports** — Home, Quiz play, Quiz correct-answer screens all have large empty areas (40-55% of viewport empty). Content doesn't fill the screen.

4. **Skill Detail Panel: metric bar direction** — bars fill left-to-right in an RTL layout. Should fill right-to-left.

5. **Profile avatar missing** — gray empty circle in profile page header. Needs initials fallback at minimum.

### Medium Priority
6. **Missing favicon** — console shows 404 for favicon.ico.
7. **noise.svg failing** (profile page) — grainy gradient texture 404s from external CDN.
8. **Quiz progress bar color** — lavender gradient instead of Duolingo green.
9. **XP bar on home** — lavender instead of green.
10. **Score display RTL** on end screen — "/" slash ordering reads awkwardly.

### Low Priority / Polish
11. **Legend language inconsistency** in Galaxy/Tree/DNA — should be Arabic.
12. **Subject emoji variety** — most subjects use generic 📚 emoji. Assign unique emojis per subject.
13. **"ميول طبيعية" category** in Strength Finder — unclear label, needs better Arabic naming.
14. **Radar chart** is not centered in its container.
15. **DNA strand** is off-center and nodes lack data visualization.
16. **Add "Continue to Learn"** button on quiz end screen.

---

## Page-by-Page Visual Score Summary

| Page/Component | Visual Quality | Critical Issues |
|---|---|---|
| `/home` | 6/10 | Empty space, BOOSTS English, left artifact |
| `/learn` (Skill Tree) | 7/10 | Left artifact, locked nodes too uniform |
| Quiz Play | 6/10 | Empty space below card, clipped feedback |
| Quiz End Screen | 8/10 | Best screen, minor RTL score display |
| Skill Map — Heat Map | 7/10 | Left artifact, same subject as best+worst |
| Skill Map — Radar | 5/10 | Nearly empty chart, not centered |
| Skill Map — Galaxy | 5/10 | Empty stars, English legend |
| Skill Map — Tree | 5/10 | English legend, tiny labels, off-center |
| Skill Map — DNA | 4/10 | No data on nodes, off-center, empty |
| Skill Detail Panel | 7/10 | English badge, RTL bar direction |
| Gap Analysis Panel | 6/10 | English "No attempts yet", flat list |
| Strength Finder Panel | 6/10 | English labels, sparse |
| `/profile` | 8/10 | Missing avatar, minor contrast issues |

---

*Screenshots saved to project root:*
- `home-page.png`
- `learn-page.png`
- `quiz-page.png`
- `quiz-answered.png`
- `quiz-correct-answer.png`
- `quiz-end-screen.png`
- `skill-map-default.png` (Heat Map)
- `skill-map-radar.png`
- `skill-map-galaxy.png`
- `skill-map-tree.png`
- `skill-map-dna.png`
- `skill-detail-panel.png`
- `gap-analysis-panel.png`
- `strength-finder-panel.png`
- `profile-page.png`
- `profile-page-full.png`
