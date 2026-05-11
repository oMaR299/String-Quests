# In-Question Power-Up Moments — Design

**Date:** 2026-05-11
**Status:** Approved
**Owners:** UX redesign of the 6 in-question power-ups inside the QuizSessionPage HUD.

## Context

The 13-power-up feature shipped in prior session (foundation + shop + loadout + HUD + integration). The 6 in-question buttons currently fire reducer actions with minimal flair: 50/50 just greys two options, Hint Reveal slides a card, Skip silently advances. The user wants each activation to feel like a deliberate **moment** — high-fidelity UI + animation per power-up — without breaking the app's light-glassmorphism aesthetic.

## Decisions (locked with user before writing this doc)

| Question | Decision |
|---|---|
| Visual vocabulary | **Hybrid** — shared base motion grammar + 1 signature flourish per power-up. |
| Theatricality | **Cinematic ~1–1.5s with sound.** Each moment is a deliberate 3-phase landing animation. |
| Tooling | **Lean** — add `canvas-confetti` (~5 KB gzip) for shatter debris + Web Audio API (no assets) for synthesized SFX. No Lottie / no tone.js. |
| Reduced motion | Always respected: collapses to a 200 ms tinted cross-fade with no sound; state mutation still fires. |
| Sound default | ON (toggleable from Settings via a new `sfxEnabled` flag in UserContext). |

## Shared system — the family DNA

Every signature is implemented as a 3-phase animation:

1. **Pre (~300 ms)** — wind-up: the activated HUD button glows in its group color; the screen tints faintly in that color via a fixed-position overlay.
2. **Cast (~700–900 ms)** — the per-power-up signature flourish (see Section 2).
3. **Post (~200 ms)** — settle: overlay fades; reducer state mutation commits.

### Surface

A new `<PowerupCastOverlay />` component is mounted once at the top of `QuizSessionPage`. It listens to a small queue (`powerupCastQueue`) added to `QuizSessionContext` and renders the active effect at `z-[70]` (above QuizCard, below modals at `z-[140]`). Effects can paint outside the QuizCard bounds (the cursor walks across the whole viewport, the wormhole engulfs the card).

### Color

Each effect derives its accent palette from the powerup's existing `group` token:

| Power-up | Group | Accent palette |
|---|---|---|
| 50/50 | `question_helper` | `sq-brand` (violet) |
| Hint Reveal | `question_helper` | `sq-brand` + warm gold (`amber-300`) for the beam |
| Skip | `question_helper` | `sq-brand` + indigo for the wormhole |
| Second Chance | `defensive` | `sq-info` + rose for the heart |
| Eraser | `reactive` | `sq-success` + slate for chalk-dust |
| Auto-Complete | `power_solve` | `pastel-purple` + neutral for the pixel cursor |

### Sound

A new `utils/sfx.ts` module exposes:

```ts
playSfx('shatter' | 'chime' | 'whoosh' | 'heartbeat' | 'eraser' | 'click_success'): void
```

Every sound is synthesized at call-time via `AudioContext` — oscillators (sine/square/sawtooth), filtered white noise, ADSR envelopes. Lazy-init the context on first use. Each call is gated by `sfxEnabled` (UserContext flag, default `true`). Total file: <100 LOC, zero assets.

### Reduced motion

Every effect component:

- Reads `useReducedMotion()`
- When true: skips particles, skips sound, renders a 200 ms tinted cross-fade only
- State mutation always fires regardless

### RTL

Spatial signatures (cursor walk path, eraser sweep direction) read `useI18n().locale` and mirror their direction when AR.

## Per-power-up signature moments

### 1. 50/50 — "Annihilate"

- **Pre:** the 50/50 button pulses violet; viewport tints brand-50/30.
- **Cast:** the 2 picked wrong-option tiles shake (4 jolts, ±4 px) → emit a short `confetti` burst from each tile's center using shard-shaped particles in the option's text color → a thin shockwave ring (white, 2 px) sweeps outward from each origin → tiles dissolve via `opacity → 0` + `scale → 0.92` over 300 ms, leaving negative space (the row keeps its grid position but collapses height when settled). The remaining options briefly scale 1.04 → 1.0 to "breathe into focus".
- **Sound:** `'shatter'` — 80 ms white-noise burst through a low-pass filter sweep + a 250 Hz sine tail with quick decay.
- **Post:** the option tiles stay hidden (existing `hiddenOptionIndices` mechanic); HUD button consumed.
- **Total:** 1.2 s. Reduced-motion: 200 ms fade-out on the two tiles + state.

### 2. Hint Reveal — "Illuminate"

- **Pre:** the Hint button's lightbulb icon swells to 1.15× and emits a faint amber glow.
- **Cast:** 6–8 amber particle dots fly inward from the screen corners and converge on the lightbulb icon (200 ms) → a horizontal gradient beam (transparent → amber-300 → transparent) sweeps across the question text (left→right, RTL: right→left, 350 ms) → the question text gets a brief golden underline that fades in 200 ms → the existing hint card slides up from below with a freshly added 1 px amber border + soft amber shadow.
- **Sound:** `'chime'` — 3 stacked sine notes (C5, E5, G5) with quick attack + harp-like decay (~600 ms tail).
- **Post:** hint card persists; question retains a faint amber rim-light until next answer.
- **Total:** 1.3 s. Reduced-motion: hint card slide-up only, no beam, no chime.

### 3. Skip — "Warp"

- **Pre:** the Skip button glows brand-violet; the QuizCard's edges blur 4 px.
- **Cast:** the QuizCard rotates `rotateY(-12deg)` and scales to 0.94 (perspective container at 1200 px) → 12 small radial particles spiral inward from the card edges with motion blur → card collapses to a thin vertical line at center → a tunnel-vortex (concentric rotating rings, brand → indigo gradient) appears for 250 ms → next QuizCard materializes from the same vortex (reverse animation: line → expand → settle).
- **Sound:** `'whoosh'` — sine sweep from 800 Hz down to 100 Hz over 500 ms with a slight pitch wobble.
- **Post:** new question is now active. The wrong-counter and `questionsAnswered` already advanced via the existing `SKIP_QUESTION` action.
- **Total:** 1.5 s. Reduced-motion: existing AnimatePresence card swap, no vortex.

### 4. Second Chance — "Heart-Lock"

- **Pre:** the Second Chance button (RotateCcw icon) tints rose; subtle screen tint.
- **Cast:** a glowing heart (Heart icon, rose-500, scale 0.6 → 1.4 over 250 ms) appears centered above the QuizCard → a translucent heart-shaped force field (SVG heart path with a radial pink-to-transparent fill) bubbles outward to encase the QuizCard for 400 ms → the bubble shrinks back into a small `heart-lock` chip pinned to the QuizCard's top corner (RTL-aware via `start/end`) → a subtle rose rim-light persists on the QuizCard until consumed.
- **Sound:** `'heartbeat'` — two low-frequency sine pulses (60 Hz fundamental + 90 Hz overtone), 80 ms each, 180 ms gap.
- **Post:** `secondChanceArmedQId` set on the current question; the persistent heart-lock chip stays visible.
- **Total:** 1.0 s. Reduced-motion: heart chip appears in place with a 200 ms fade.

### 5. Eraser — "Chalkboard Undo"

- **Pre:** the Eraser button greens; subtle slate dust appears at its base.
- **Cast:** the eraser icon detaches from its button position and animates along an arc up to the hearts row → a virtual eraser sprite sweeps across the hearts row (right-to-left in LTR, mirrored in RTL) leaving a chalk-dust trail (small grey particles) → at the end of the sweep, the most-recently-lost heart pops back in (Heart icon scales 0 → 1.2 → 1.0 with a brief sparkle ring of 6 small white dots).
- **Sound:** `'eraser'` — short brushed-noise swipe (~300 ms band-pass-filtered white noise) + a one-note pluck (square wave, 660 Hz, 100 ms) at the heart-restore moment.
- **Post:** `hearts` incremented by 1 via existing `REGEN_HEART` action.
- **Total:** 1.4 s. Reduced-motion: heart restored with a single pop + glow, no eraser sprite, no dust.

### 6. Auto-Complete — "Robot Solver"

- **Pre:** the Auto-Complete button glows pastel-purple; a small "🤖" emoji or robot icon flickers in the button.
- **Cast:** a pixel-art mouse cursor (custom SVG, 16×24 px white-with-black-outline arrow) materializes at the top-end corner of the viewport with a small "+" particle pop → cursor moves along a Bezier path toward the correct answer tile (curve, ~700 ms with `easeInOutCubic`, RTL: starts top-start) → at the destination, cursor performs a `mousedown` animation (scale 0.85, 80 ms) and a ripple ring expands from the click point → the correct answer tile gets the standard correct-answer treatment (green tint, scale pop) plus a "🤖 Auto-solved" pill chip appears in its corner.
- **Sound:** `'click_success'` — a brief mechanical click (square wave 1200 Hz, 30 ms) at the click moment + a positive 2-note chime (E5 → G5, 250 ms).
- **Post:** synthetic correct answer is dispatched via existing `AUTO_COMPLETE_QUESTION` flow; perfect-bonus disqualified.
- **Total:** 1.5 s. Reduced-motion: correct answer is highlighted in place with a 200 ms green flash + Auto-solved chip; no cursor walk.

## Files

### New

| File | Role |
|---|---|
| `utils/sfx.ts` | Web Audio synth helpers + `sfxEnabled` gate + `playSfx()` |
| `components/powerups/effects/PowerupCastOverlay.tsx` | Top-level orchestrator; reads `quizState.powerupCastQueue` and renders the active effect |
| `components/powerups/effects/Annihilate.tsx` | 50/50 shatter |
| `components/powerups/effects/Illuminate.tsx` | Hint reveal beam |
| `components/powerups/effects/Warp.tsx` | Skip wormhole |
| `components/powerups/effects/HeartLock.tsx` | Second Chance shield + lock chip |
| `components/powerups/effects/EraserSweep.tsx` | Eraser sweep + heart restore |
| `components/powerups/effects/RobotCursor.tsx` | Auto-Complete pixel cursor |
| `components/powerups/effects/types.ts` | Shared effect props + cast queue entry types |

### Modified

| File | Change |
|---|---|
| `contexts/QuizSessionContext.tsx` | Add `powerupCastQueue: CastEntry[]` to state; new actions `ENQUEUE_CAST { entry }` and `DEQUEUE_CAST`. |
| `contexts/UserContext.tsx` | Add `sfxEnabled: boolean` (default `true`) + `TOGGLE_SFX` action. |
| `components/quiz/InQuestionPowerupBar.tsx` | On confirm, instead of dispatching the powerup action immediately, enqueue a cast entry. The cast effect's "post" hook fires the actual reducer action. |
| `components/quiz/PowerupConfirmDialog.tsx` | No structural change; copy stays. |
| `pages/QuizSessionPage.tsx` | Mount `<PowerupCastOverlay />` once near the root. |
| `components/QuizCard.tsx` | Listens to cast queue for `fifty_fifty` to time the option-shake → shatter → dissolve so the existing greying becomes the post-effect of the shatter. For Auto-Complete, exposes the correct-answer tile's bounding rect for the cursor to walk to (refs forwarded). |
| `pages/SettingsPage.tsx` | Add an SFX toggle row. |
| `contexts/I18nContext.tsx` | Add `settings.sfx`, `settings.sfx_on`, `settings.sfx_off` keys (AR + EN). |

### Dependencies

- Add `canvas-confetti` (~5 KB gzip). No other deps.

## Data flow per cast

1. User taps an in-question button → `PowerupConfirmDialog` opens.
2. User confirms → `InQuestionPowerupBar` dispatches `ENQUEUE_CAST { entry }` (entry = `{ slug, casterRect?, targetRect? }` for spatial effects).
3. `PowerupCastOverlay` sees the new queue head → renders the matching effect component → effect runs `pre → cast → post` phases → during the `post` phase, effect calls a callback that dispatches both `CONSUME_POWERUP` (UserContext) and the slug-specific QuizSession action (`APPLY_5050`, `REVEAL_HINT_FREE`, `SKIP_QUESTION`, `ARM_SECOND_CHANCE`, `REGEN_HEART`, `AUTO_COMPLETE_QUESTION`).
4. Overlay dispatches `DEQUEUE_CAST`.

The bar no longer dispatches state mutations directly — the effect owns the timing of state change so the visual and the state stay in sync.

## Error handling

- Sound init failure (autoplay policy, no AudioContext) — silently no-op; effects still play.
- `canvas-confetti` failure or chunk-load failure — Annihilate falls back to a CSS keyframe shatter (4 small divs with `transform` + `opacity`); state still mutates.
- Effect component throws — caught by an Error Boundary inside `PowerupCastOverlay` so a broken effect can't lock the quiz; logs to console + dispatches the post-state mutation directly.

## Verification

1. Open a multi-choice question → tap 50/50 → confirm → 2 wrong options shake, shatter into colored shards, dissolve. Sound fires unless SFX off. Reduced-motion: 200 ms fade.
2. Tap Hint → amber particles converge, beam sweeps the question, hint slides up with golden border. Sound: chime.
3. Tap Skip → card warps into wormhole, next card materializes. Sound: whoosh.
4. Tap Second Chance → heart-lock bubble engulfs the card, chip persists in corner. Sound: heartbeat.
5. After losing a heart → tap Eraser → eraser sweeps across the hearts row, lost heart restores. Sound: brush + pluck.
6. Tap Auto-Complete → pixel cursor walks across the screen to the correct answer, "clicks" it, correct tile highlights with 🤖 chip. Sound: click + chime.
7. Toggle Settings > SFX off → repeat any effect → no sound, animation unchanged.
8. macOS / Windows "reduce motion" on → every effect collapses to a 200 ms cross-fade, sound suppressed, state mutation still fires.
9. AR locale → Eraser sweeps L→R, Robot Cursor starts top-start (right edge in AR), all spatial effects mirror correctly.
10. `npx tsc --noEmit` clean (only the 4 known pre-existing errors). `npx vite build` succeeds.

## Out of scope (explicit non-goals)

- Pre-artifact loadout power-ups (Freeze, Restart Shield, XP Doubler, Lucky Dice, Combo Lock) — separate UX pass.
- Streak Shield + Phoenix — already have their own visual treatments on the streak widget.
- Sound preset packs / multiple SFX themes.
- Achievements / metric tracking on power-up usage.
