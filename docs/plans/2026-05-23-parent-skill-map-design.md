# Parent Skill Map — Design

> Date: 2026-05-23 · Status: **Approved** · Module: Parent App (`components/parent-app/`)
> Route: `/parent/skill-map` (currently `SkillMapPlaceholder`)

## Goal

Make the Skill Map the **main value** of the Parent App: impressive at a glance, yet
dead-simple to understand. It is **not a dashboard** — it is a **coaching engine** that
turns the child's mastery data into 1–3 concrete things a parent can do to help.

## Core decisions (locked)

| Decision | Choice |
|---|---|
| Parent's #1 job | **Coach me to help** (action-first, not analytics) |
| Action levers | **💬 Talk & ask** (offline) + **✨ Push practice to the child's String app** (one tap) |
| Intelligence | **No real AI.** Designed mock content (seeded numbers + bilingual templates) that *looks* like a smart, live product |
| Child selection | Reads the **active child from the existing app-level header pill** (`activeChildId`). No selector inside the Skill Map |
| Signature visual | **Clean flat** illustration (geometric, 2–3 brand colors, white space). Not playful, not 3D, not emoji |
| Impressive vs easy | Solved with **depth layers** — easy on the surface, impressive in the depth |

The **✨ Push** lever is the strategic core: it closes a loop unique to String —
*parent spots weakness → one tap → child gets a quest → child plays → mastery rises →
parent sees it improve.* This flywheel drives student engagement via the parent.

## Architecture — one scrollable screen, 4 stacked layers

```
LAYER 0 · GLANCE (3s)     🌳 Garden hero — 1 plant per subject, health = mastery
                           "Sara's thriving — one area needs you."
LAYER 1 · TODAY (action)  💬✨ 1–3 daily "Help Sara Today" coaching cards (the spine)
LAYER 2 · FULL PICTURE     ✨ Shining  /  🤝 Needs a hand  (every strength + focus area)
LAYER 3 · DIVE (3min)     Subject → unit mastery bars (the "why"; calm reference)
```

The two levers (💬 Talk, ✨ Push) appear on **any** weak item across Layers 1–3 so the
parent learns one interaction once.

## The coaching engine

### Inputs (per child, mock + seeded)
`ParentSkillArea { subjectAr/En, unitAr/En?, masteryPct (0–100), trend7d (Δ, e.g. -12),
status: mastered|proficient|developing|needsHelp, practiceTargetAr/En }`.
Seeded by `childId` so each child is stable across reloads. `trend7d` is the signal that
makes coaching feel *timely* ("slipped this week") rather than generic.

### Selection — how it picks the 1–3
Score each weak area by **urgency**, rank, take top 3:
- 📉 **recent drop** (`trend7d` negative) — weighed highest (most coachable)
- ⬇️ low absolute `masteryPct`
- 📚 core-subject bump (Math / Arabic / Science > electives)
- 🕐 **cooldown** — areas with practice already sent are suppressed for a few "days"
- Hard cap **3**. Always also surface **1 "Shining"** area for pride.

### Suggestion content — pure templates, no AI
Bilingual library keyed by `status × subject`, e.g. (slipping skill):
> 💬 "Ask Sara to teach YOU how to add fractions — if she can explain it, she's got it."
> ✨ Send practice → "Fractions · Unit 3" → Sara's Quests

Tone: **warm**, bilingual-appropriate. Styled with an "AI insight" treatment (consistent
with existing Daily Insights) but 100% static content.

### States
- **All healthy:** "Nothing needs you today — Sara's cruising 🌳" + 1 stretch idea (no fake problems).
- **Sent:** card → "✓ Sent — Sara'll see it tonight"; that garden plant gets a watering shimmer; area enters cooldown.
- **Talk done:** swipe-to-✓.

## Visual design

**House rules:** flat, white background, minimal elevation, **Cairo font, Lucide icons
(no emoji)**, full RTL, `duo-*` / `pastel-*` tokens, Framer Motion + `useReducedMotion`.

- **Layer 0 — Garden hero:** flat SVG plants, one per subject; growth stage = mastery
  (`seed → sprout → young → bloom`); needs-help plants droop + gently sway. Plants spring
  up on load (staggered). Tap a plant → scroll to that subject in Deep Map. Plain status line.
- **Layer 1 — Coaching cards:** flat white `rounded-2xl`, hairline border; amber/red status
  chip ("↓ 12% this week"); skill + subject title; Talk prompt in a soft quote block;
  two buttons — **Talk** (secondary) · **Send practice** (primary). Success state on send. "1 of N" stepper.
- **Layer 2 — Full Picture:** two labeled zones — **Shining** (green-tint rows, %, ↑) and
  **Needs a hand** (amber/red rows with inline Talk · Send).
- **Layer 3 — Deep Map:** subject rows with mastery progress bars (v1). Quiet, reference-only.

## Data & build plan

**New files** under `components/parent-app/skillmap/`:
| File | Role |
|---|---|
| `ParentSkillMapScreen.tsx` | Orchestrates the 4 layers; reads `activeChild`. Replaces `SkillMapPlaceholder` at `/parent/skill-map`. |
| `GardenHero.tsx`, `GardenPlant.tsx` | Flat SVG plants + growth stages + motion. |
| `TodaysFocusSection.tsx`, `CoachingCard.tsx` | Talk + Send cards (value core). |
| `FullPictureSection.tsx` | Shining / Needs-a-hand zones. |
| `DeepMapSection.tsx` | Subject mastery bars. |
| `useParentSkillMap.ts` | Hook: garden data + today's focus + send/cooldown handlers. |
| `data/parentAppSkillMapMock.ts` | Seeded per-child `ParentSkillArea[]` generator. |
| `skillMapCoaching.ts` | `selectTodaysFocus()` ranking + template resolver. |

**Edits:** `App.tsx` (swap route), `parentAppI18n.ts` (skill-map strings AR/EN), context
if needed for `sent` state (in-memory, matches current parent-app pattern).

**Build sequence (value first, wow second):**
1. **Data + engine** — `parentAppSkillMapMock.ts`, `skillMapCoaching.ts`, types, i18n keys. No UI. *(the contract everything builds against)*
2. **Coaching cards + Full Picture** (Layers 1–2) — the usefulness.
3. **Garden hero** (Layer 0) — the signature wow.
4. **Deep Map + route swap + polish** — RTL, reduced-motion, browser screenshot check.

## Scope

**v1:** Layers 0–2 fully polished; Layer 3 = subject-level bars (defer lesson-level depth).
The ✨ Send action shows a real-feeling confirmation (mock) — not yet wired into the student app.

**Later (v2+):** real student-app push wiring; lesson-level deep map; persistence of
sent/cooldown to localStorage (`string-quests-*`); power the Talk prompts via Aware AI.
