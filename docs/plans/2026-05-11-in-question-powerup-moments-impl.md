# In-Question Power-Up Moments — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current low-flair in-question power-up activations with cinematic ~1.2 s signature moments (visual + sound), one signature per power-up, sharing a 3-phase motion grammar and a synthesized-audio system.

**Architecture:** A new top-level `PowerupCastOverlay` component sits inside `QuizSessionPage` at z-70 and reads a `powerupCastQueue` added to `QuizSessionContext`. The HUD bar no longer dispatches state mutations directly — it enqueues a cast entry. The overlay renders one of 6 per-power-up effect components (`Annihilate`, `Illuminate`, `Warp`, `HeartLock`, `EraserSweep`, `RobotCursor`), each a 3-phase animation (`pre → cast → post`) that fires the actual reducer mutation in its `post` callback. Sound is synthesized inline via Web Audio in a tiny `utils/sfx.ts`; reduced-motion always degrades to a 200 ms cross-fade with no sound.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Framer Motion 12, lucide-react, Web Audio API, `canvas-confetti` (~5 KB gzip, single new dep). No test framework exists in the project — verification is `npx tsc --noEmit` + dev-server smoke check per task.

**Note:** the design rationale lives in [`2026-05-11-in-question-powerup-moments-design.md`](./2026-05-11-in-question-powerup-moments-design.md) — keep it open while executing.

---

## Build sequence at a glance

```
Foundation (sequential, blocks all later tasks)
  Task 1  — add canvas-confetti dep
  Task 2  — utils/sfx.ts (Web Audio synth)
  Task 3  — sfxEnabled flag in UserContext
  Task 4  — powerupCastQueue + actions in QuizSessionContext
  Task 5  — effects/types.ts
  Task 6  — PowerupCastOverlay shell
  Task 7  — Mount overlay in QuizSessionPage
  Task 8  — Refactor InQuestionPowerupBar to enqueue casts
  Task 9  — Forward correctAnswerRef from QuizCard

Effects (parallelizable — each in its own file)
  Task 10 — Annihilate (50/50)
  Task 11 — Illuminate (Hint Reveal)
  Task 12 — Warp (Skip)
  Task 13 — HeartLock (Second Chance)
  Task 14 — EraserSweep
  Task 15 — RobotCursor (Auto-Complete)

Polish (sequential)
  Task 16 — SFX toggle in SettingsPage + i18n
  Task 17 — Final typecheck + production build + dev smoke
```

---

## Foundation

### Task 1: Add `canvas-confetti` dependency

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/package.json`

**Step 1: Install the package and its types**

Run (Bash, with Node on PATH):
```bash
export PATH="/c/Program Files/nodejs:$PATH" && cd 'd:/AI/Quests/String-Quests-' && npm install canvas-confetti && npm install -D @types/canvas-confetti
```
Expected: `package.json` gains `"canvas-confetti": "^1.x"` under `dependencies` and `"@types/canvas-confetti"` under `devDependencies`. `package-lock.json` updates. ~5 KB gzip added to bundle.

**Step 2: Verify import resolves**

Run: `node -e "console.log(require.resolve('canvas-confetti'))"`
Expected: prints a path under `node_modules/canvas-confetti`.

**Step 3: Commit**

(Defer commit until user requests — per project policy. Same applies to every task below; do not auto-commit.)

---

### Task 2: Create `utils/sfx.ts` (Web Audio synth)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/utils/sfx.ts`

**Step 1: Write the file**

Implement a singleton AudioContext (lazy init on first call) and 6 named SFX functions. Each synthesized inline — no assets.

```ts
// utils/sfx.ts
export type SfxName =
  | 'shatter'
  | 'chime'
  | 'whoosh'
  | 'heartbeat'
  | 'eraser'
  | 'click_success';

let ctx: AudioContext | null = null;
let muted = false;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  return ctx;
};

export const setSfxMuted = (next: boolean) => { muted = next; };

const env = (g: GainNode, t: number, attack: number, decay: number, peak = 0.4) => {
  const c = getCtx()!;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return t + attack + decay;
};

const noiseBuffer = (duration: number) => {
  const c = getCtx()!;
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
};

const playShatter = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  // White-noise burst through low-pass sweep.
  const src = c.createBufferSource(); src.buffer = noiseBuffer(0.4);
  const filter = c.createBiquadFilter(); filter.type = 'lowpass';
  filter.frequency.setValueAtTime(8000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.3);
  const g = c.createGain();
  src.connect(filter).connect(g).connect(c.destination);
  env(g, now, 0.005, 0.3, 0.5);
  src.start(now); src.stop(now + 0.4);
  // Low sine tail.
  const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = 250;
  const og = c.createGain(); osc.connect(og).connect(c.destination);
  env(og, now, 0.01, 0.25, 0.25);
  osc.start(now); osc.stop(now + 0.3);
};

const playChime = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    const g = c.createGain(); osc.connect(g).connect(c.destination);
    env(g, now + i * 0.06, 0.01, 0.55, 0.18);
    osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.6);
  });
};

const playWhoosh = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
  const g = c.createGain(); osc.connect(g).connect(c.destination);
  env(g, now, 0.02, 0.45, 0.3);
  osc.start(now); osc.stop(now + 0.55);
};

const playHeartbeat = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  [0, 0.18].forEach((offset) => {
    [60, 90].forEach((freq) => {
      const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = c.createGain(); osc.connect(g).connect(c.destination);
      env(g, now + offset, 0.005, 0.075, 0.5);
      osc.start(now + offset); osc.stop(now + offset + 0.1);
    });
  });
};

const playEraser = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  // Brushed-noise swipe.
  const src = c.createBufferSource(); src.buffer = noiseBuffer(0.3);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.5;
  const g = c.createGain(); src.connect(bp).connect(g).connect(c.destination);
  env(g, now, 0.005, 0.27, 0.25);
  src.start(now); src.stop(now + 0.3);
  // Restore pluck (square).
  const osc = c.createOscillator(); osc.type = 'square'; osc.frequency.value = 660;
  const og = c.createGain(); osc.connect(og).connect(c.destination);
  env(og, now + 0.32, 0.005, 0.1, 0.18);
  osc.start(now + 0.32); osc.stop(now + 0.45);
};

const playClickSuccess = () => {
  const c = getCtx(); if (!c) return;
  const now = c.currentTime;
  // Mechanical click.
  const click = c.createOscillator(); click.type = 'square'; click.frequency.value = 1200;
  const cg = c.createGain(); click.connect(cg).connect(c.destination);
  env(cg, now, 0.001, 0.03, 0.2);
  click.start(now); click.stop(now + 0.04);
  // Success 2-note chime.
  [659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    const g = c.createGain(); osc.connect(g).connect(c.destination);
    env(g, now + 0.05 + i * 0.1, 0.005, 0.22, 0.18);
    osc.start(now + 0.05 + i * 0.1); osc.stop(now + 0.05 + i * 0.1 + 0.25);
  });
};

const REGISTRY: Record<SfxName, () => void> = {
  shatter: playShatter,
  chime: playChime,
  whoosh: playWhoosh,
  heartbeat: playHeartbeat,
  eraser: playEraser,
  click_success: playClickSuccess,
};

export const playSfx = (name: SfxName) => {
  if (muted) return;
  const c = getCtx(); if (!c) return;
  // Resume if suspended (autoplay policy).
  if (c.state === 'suspended') c.resume().catch(() => {});
  try { REGISTRY[name](); } catch (e) { /* never break the UI on audio errors */ }
};
```

**Step 2: Verify it typechecks**

Run: `export PATH="/c/Program Files/nodejs:$PATH" && cd 'd:/AI/Quests/String-Quests-' && node node_modules/typescript/bin/tsc --noEmit 2>&1 | grep -v "TextbookExplorer\|textbookData\|tailwind.config" | head -20`
Expected: no new errors (only the 4 known pre-existing).

---

### Task 3: Add `sfxEnabled` to UserContext

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/contexts/UserContext.tsx`
- Modify: `d:/AI/Quests/String-Quests-/utils/sfx.ts` (sync mute flag)

**Step 1: Read existing UserState shape and reducer pattern**

Read the file fully. Note where `stardust`, `powerups`, `streakShieldActive` were added by Wave A — match that pattern.

**Step 2: Add the field + action + sync to sfx**

Add to `UserState`:
```ts
sfxEnabled: boolean;
```
Add to initial state: `sfxEnabled: true`.
Add reducer case:
```ts
case 'TOGGLE_SFX':
  return { ...state, sfxEnabled: !state.sfxEnabled };
```
Add to action union: `| { type: 'TOGGLE_SFX' }`.

In a `useEffect` inside the provider, call `setSfxMuted(!state.sfxEnabled)` whenever `state.sfxEnabled` flips. Import from `../utils/sfx`.

**Step 3: Verify typecheck**

Run typecheck command above.

---

### Task 4: Add cast queue + actions to QuizSessionContext

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/contexts/QuizSessionContext.tsx`

**Step 1: Add types**

```ts
export interface CastEntry {
  id: number;                 // monotonic, used as key
  slug: PowerupSlug;          // one of the 6 in-question slugs
  questionId?: number;        // for arming Second Chance, indices for 50/50
  hiddenIndices?: number[];   // pre-computed by the bar for 50/50
}
```

Add to state:
```ts
powerupCastQueue: CastEntry[];
nextCastId: number;
```

Initial: `[]`, `1`.

**Step 2: Add reducer cases**

```ts
case 'ENQUEUE_CAST':
  return {
    ...state,
    powerupCastQueue: [...state.powerupCastQueue, { ...action.payload, id: state.nextCastId }],
    nextCastId: state.nextCastId + 1,
  };
case 'DEQUEUE_CAST':
  return { ...state, powerupCastQueue: state.powerupCastQueue.slice(1) };
```

Reset on `START_SESSION` and `RESTART`: `powerupCastQueue: [], nextCastId: 1`.

**Step 3: Verify typecheck**

---

### Task 5: Create `effects/types.ts`

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/types.ts`

**Step 1: Write shared effect contract**

```ts
import type { CastEntry } from '../../../contexts/QuizSessionContext';

export interface EffectComponentProps {
  entry: CastEntry;
  /** Called by the effect during its `post` phase. The overlay then dequeues. */
  onComplete: () => void;
  /** Optional hooks the overlay may pass for spatial effects (auto-complete cursor). */
  correctAnswerRect?: DOMRect | null;
}

export type EffectPhase = 'pre' | 'cast' | 'post';
```

---

### Task 6: Create `PowerupCastOverlay` shell

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/PowerupCastOverlay.tsx`

**Step 1: Write the orchestrator**

The shell:
- Reads `quizState.powerupCastQueue[0]` (head).
- Maintains a small `slug → component` registry.
- Renders the matching effect, passes `entry` + `onComplete = () => quizDispatch({ type: 'DEQUEUE_CAST' })`.
- Wraps the effect in an `<ErrorBoundary>` so a broken effect can't lock the quiz; the boundary's fallback dispatches `onComplete` immediately.
- Mounts at `position: fixed; inset: 0; z-index: 70; pointer-events: none` so its child effects can opt-in to pointer events as needed.
- For now, the registry maps to placeholder `null` — Tasks 10–15 fill these in.

```tsx
import React, { Suspense } from 'react';
import { useQuizSession } from '../../../contexts/QuizSessionContext';
import type { EffectComponentProps } from './types';
import type { PowerupSlug } from '../../../data/mockPowerupsData';

// Lazy-load each effect; keeps the QuizSessionPage chunk lean.
const Annihilate = React.lazy(() => import('./Annihilate'));
const Illuminate = React.lazy(() => import('./Illuminate'));
const Warp = React.lazy(() => import('./Warp'));
const HeartLock = React.lazy(() => import('./HeartLock'));
const EraserSweep = React.lazy(() => import('./EraserSweep'));
const RobotCursor = React.lazy(() => import('./RobotCursor'));

const REGISTRY: Partial<Record<PowerupSlug, React.LazyExoticComponent<React.FC<EffectComponentProps>>>> = {
  fifty_fifty: Annihilate,
  hint_reveal: Illuminate,
  skip: Warp,
  second_chance: HeartLock,
  eraser: EraserSweep,
  auto_complete: RobotCursor,
};

class EffectErrorBoundary extends React.Component<{ onComplete: () => void; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onComplete(); }
  render() { return this.state.hasError ? null : this.props.children; }
}

export const PowerupCastOverlay: React.FC<{ correctAnswerRect?: DOMRect | null }> = ({ correctAnswerRect }) => {
  const { state, dispatch } = useQuizSession();
  const entry = state.powerupCastQueue[0];
  if (!entry) return null;
  const Effect = REGISTRY[entry.slug];
  if (!Effect) {
    // Unknown slug — drain so we don't lock.
    dispatch({ type: 'DEQUEUE_CAST' });
    return null;
  }
  const onComplete = () => dispatch({ type: 'DEQUEUE_CAST' });
  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <EffectErrorBoundary onComplete={onComplete}>
        <Suspense fallback={null}>
          <Effect entry={entry} onComplete={onComplete} correctAnswerRect={correctAnswerRect} />
        </Suspense>
      </EffectErrorBoundary>
    </div>
  );
};

export default PowerupCastOverlay;
```

**Step 2: Verify typecheck — note the lazy imports will fail until Tasks 10-15 land. That's expected; mark it as known.**

---

### Task 7: Mount the overlay in QuizSessionPage

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/pages/QuizSessionPage.tsx`

**Step 1: Add a ref + state for the correct-answer rect**

```tsx
const correctAnswerRef = useRef<HTMLElement | null>(null);
const [correctAnswerRect, setCorrectAnswerRect] = useState<DOMRect | null>(null);
```

(The ref will be passed to `QuizCard` in a later step. For now, declare the state.)

**Step 2: Mount `<PowerupCastOverlay />` near the top of the JSX tree, inside the main page wrapper, above `<AnimatePresence>`. Pass `correctAnswerRect` prop.**

**Step 3: Verify typecheck (still expected to fail until lazy-imported effects exist — proceed).**

---

### Task 8: Refactor `InQuestionPowerupBar` to enqueue casts

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/components/quiz/InQuestionPowerupBar.tsx`

**Step 1: Replace direct dispatch with enqueue**

For each powerup `onConfirm`, instead of dispatching the powerup-specific action immediately:
1. Compute any pre-needed data (50/50: pick 2 wrong indices via cryptographic RNG; everything else: nothing).
2. Dispatch `ENQUEUE_CAST` with `{ slug, questionId: currentQuestion.id, hiddenIndices? }`.
3. Do NOT dispatch `CONSUME_POWERUP` here — the effect's `post` callback owns the entire mutation.
4. Do NOT call `onSyntheticAnswer()` here — Warp + RobotCursor own that.

Keep all the existing visibility / disable rules (inventory > 0, type guards, etc.).

**Step 2: Verify typecheck**

---

### Task 9: Forward correct-answer ref from QuizCard

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/components/QuizCard.tsx`
- Modify: `d:/AI/Quests/String-Quests-/pages/QuizSessionPage.tsx`

**Step 1: Add a `correctAnswerRef` prop to QuizCard**

```ts
correctAnswerRef?: React.MutableRefObject<HTMLElement | null>;
```

For multiple-choice, set the ref on the option tile whose index matches the correct answer. For input/non-choice question types, leave the ref null (RobotCursor falls back to a center-of-card target).

**Step 2: In QuizSessionPage, after the QuizCard mounts (use `useEffect` watching `currentQuestion.id`), measure `correctAnswerRef.current?.getBoundingClientRect()` and store it via `setCorrectAnswerRect(...)`.**

Re-measure on resize (`window.addEventListener('resize', ...)`) — debounce to 100 ms.

**Step 3: Verify typecheck**

---

## Effects (parallelizable)

> The 6 effect files are independent. After Task 9, all six can be developed in parallel by separate agents — each touches one file under `components/powerups/effects/`. The shared effect contract is in `effects/types.ts` (Task 5).
>
> Recipe for every effect:
> 1. Read `useReducedMotion()` and `useI18n()` (locale for RTL mirroring on spatial effects).
> 2. Run `pre → cast → post` in a single `useEffect` chain using `setTimeout`s sized to the design doc.
> 3. In `post`, call:
>    - `consumePowerup(entry.slug)` — from `usePowerups()` hook (UserContext)
>    - the slug-specific QuizSession dispatch (e.g. `APPLY_5050`, `REVEAL_HINT_FREE`, etc.)
>    - `playSfx('...')` if not muted
>    - `props.onComplete()` to dequeue
> 4. Reduced-motion path: skip particles, skip sound, do `pre` 0 ms / `cast` 200 ms / `post` 0 ms — state still mutates.

### Task 10: Annihilate (50/50)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/Annihilate.tsx`

**Step 1: Implement**

Render an absolutely-positioned overlay over the QuizCard. Find the 2 option tiles whose indices are in `entry.hiddenIndices` via `data-option-index` attributes (add this attr in QuizCard if missing — small Modify in this same task). For each:

- `pre` 250 ms: shake (`x: [0, -4, 4, -3, 3, 0]`, `transition: { duration: 0.25 }`).
- `cast` 600 ms: fire a `confetti` burst using `canvas-confetti`'s `confetti.create()` with `{ particleCount: 18, startVelocity: 25, scalar: 0.6, spread: 60, origin: { x, y }, colors: [...] }` where `origin` is the tile center. Then a CSS keyframe shockwave ring (`scale: 0 → 2.4`, `opacity: 0.8 → 0`, `border-radius: 9999px`). Then `opacity → 0; scale → 0.92` on the tile itself.
- `post` 100 ms: dispatch `APPLY_5050 { hiddenIndices: entry.hiddenIndices! }` + `consumePowerup('fifty_fifty')` + `playSfx('shatter')` + `onComplete()`.

For reduced-motion: skip particles + shake + ring; just `opacity: 0` the 2 tiles over 200 ms then dispatch + complete (no sound).

**Step 2: Verify typecheck. Smoke test: `npm run dev`, open a multi-choice question, click 50/50 → 2 wrong tiles shake + shatter + dissolve + sound.**

---

### Task 11: Illuminate (Hint Reveal)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/Illuminate.tsx`

**Step 1: Implement**

- `pre` 250 ms: render 8 small amber dots at random screen-edge positions; animate them inward toward the center of the viewport (or, if you can locate the Hint button DOM via a global ref, toward that). End at the center where the lightbulb sits.
- `cast` 700 ms: 
   - render a horizontal gradient beam (`bg-gradient-to-r from-transparent via-amber-300/80 to-transparent`) sweeping across the screen at the y-coordinate of the QuizCard. RTL: sweep right→left.
   - 200 ms after the sweep starts, render a brief golden underline below the question text using `position: absolute` + a measured rect (you may simplify: render a 4 px tall amber-200 bar at `bottom: -2 px` of the QuizCard).
- `post` 100 ms: dispatch `REVEAL_HINT_FREE` + `consumePowerup('hint_reveal')` + `playSfx('chime')` + `onComplete()`.

Reduced-motion: skip particles + beam + underline; dispatch + complete in 200 ms with no sound.

**Step 2: Verify typecheck + smoke**

---

### Task 12: Warp (Skip)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/Warp.tsx`

**Step 1: Implement**

Apply a CSS perspective transform to the QuizCard (`transform: perspective(1200px) rotateY(-12deg) scale(0.94)`) using a small global-CSS class toggled by writing to `document.body.dataset.warping = 'true'`. The actual QuizCard reads `[data-warping] &` in CSS to know to deform.

Simpler: render an overlay that contains:
- `pre` 200 ms: a faint brand glow + edge blur (CSS `backdrop-filter: blur(4px)` on the overlay).
- `cast` 900 ms: a tunnel-vortex (concentric SVG rings rotating + brand→indigo gradient + scaling outward) covering the QuizCard area. Spiral particles (12 small dots) move inward along radial paths.
- `post` 200 ms: dispatch `SKIP_QUESTION` + `consumePowerup('skip')` + synthetic `ANSWER { points: 0, questionId: entry.questionId! }` (use the same dispatch the existing `handleSyntheticAnswer` does — call it through a callback prop you add: see Task 8 note about removing direct calls from the bar) + `playSfx('whoosh')` + `onComplete()`.

Reduced-motion: dispatch + complete in 200 ms, no vortex, no blur, no sound. Existing AnimatePresence handles card swap.

**Step 2: Verify typecheck + smoke**

---

### Task 13: HeartLock (Second Chance)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/HeartLock.tsx`

**Step 1: Implement**

- `pre` 250 ms: a small `Heart` icon (rose-500) appears centered above the QuizCard, scaling 0.6 → 1.4.
- `cast` 500 ms: a translucent heart-shaped force field (inline SVG path with radial pink-to-transparent gradient) bubbles outward to encase the QuizCard area, then settles. Use `motion.svg` to scale 0 → 1.2 → 1.05.
- `post` 250 ms: the bubble shrinks into a small `heart-lock` chip pinned to the QuizCard's top-end corner. The chip stays visible until `secondChanceArmedQId` clears (dispatch `ARM_SECOND_CHANCE { questionId: entry.questionId! }` + `consumePowerup('second_chance')` + `playSfx('heartbeat')` + `onComplete()`). The persistent chip is rendered by a separate small component `<HeartLockBadge />` mounted in `QuizSessionPage` that reads `quizState.secondChanceArmedQId`.

Reduced-motion: render the chip in place with a 200 ms fade, dispatch + complete, no bubble, no sound.

**Step 2: Also add `<HeartLockBadge />` (small component, ~30 LOC) and mount it inside QuizSessionPage's playing block — Modify `pages/QuizSessionPage.tsx`.**

**Step 3: Verify typecheck + smoke**

---

### Task 14: EraserSweep

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/EraserSweep.tsx`

**Step 1: Implement**

You need the bounding rect of the hearts row in the QuizSessionPage header. Add a ref on that row (Modify `pages/QuizSessionPage.tsx`) and pass it to the overlay (or read it via a `data-hearts-row` query inside the effect — pick whichever is simpler).

- `pre` 200 ms: the eraser icon (small SVG) detaches from its HUD button position and animates along an arc up to the hearts row.
- `cast` 800 ms: the eraser sprite sweeps across the hearts row left→right (LTR) or right→left (RTL). Behind the sweep, emit small grey particles ("chalk dust"). Use Framer Motion's `animate` with a curved path or break into two sequential keyframes.
  - At the endpoint: identify the most-recently-lost heart slot (`hearts < maxHearts`, the `hearts`-th index); render a sparkle ring (6 small white dots scaling out from center) and pop a `Heart` icon back in (scale 0 → 1.2 → 1.0).
- `post` 100 ms: dispatch `REGEN_HEART` (UserContext action) + `consumePowerup('eraser')` + `playSfx('eraser')` + `onComplete()`.

Reduced-motion: simply pop the heart back in over 200 ms + dispatch + complete, no eraser sprite, no dust, no sound.

**Step 2: Verify typecheck + smoke. To test: lose a heart on a wrong answer, then trigger Eraser.**

---

### Task 15: RobotCursor (Auto-Complete)

**Files:**
- Create: `d:/AI/Quests/String-Quests-/components/powerups/effects/RobotCursor.tsx`

**Step 1: Implement**

This effect uses `props.correctAnswerRect` (forwarded by overlay → QuizSessionPage → QuizCard ref).

- `pre` 250 ms: a pixel-art mouse cursor SVG (16×24, white fill + black outline) materializes at the top-end corner of the viewport with a small "+" particle pop (3 tiny dots scaling out).
- `cast` 850 ms: cursor moves along a Bezier path toward `correctAnswerRect`'s center. Implement with Framer Motion's `animate` + `transition.path` is overkill — just keyframe the `x` and `y` along 3 control points (start, mid-with-curve, end). Use `easeInOutCubic`. RTL: starts top-end (right edge in AR).
   - At ~700 ms in, animate cursor scale 1 → 0.85 → 1 (mousedown effect).
   - Render a ripple ring expanding from the click point (CSS keyframe).
- `post` 200 ms: dispatch `AUTO_COMPLETE_QUESTION` + `consumePowerup('auto_complete')` + synthetic `ANSWER { points: 0 }` (same callback as Skip) + `playSfx('click_success')` + render a "🤖 Auto-solved" pill chip overlaid on the correct tile briefly + `onComplete()`.

If `correctAnswerRect` is null (non-choice question types), fall back: cursor walks to the center of the QuizCard.

Reduced-motion: skip cursor walk; immediately tint the correct tile green for 200 ms with the 🤖 chip + dispatch + complete + no sound.

**Step 2: Verify typecheck + smoke**

---

## Polish

### Task 16: SFX toggle in SettingsPage + i18n

**Files:**
- Modify: `d:/AI/Quests/String-Quests-/pages/SettingsPage.tsx` (read first; if it doesn't exist or is minimal, add a row inline)
- Modify: `d:/AI/Quests/String-Quests-/contexts/I18nContext.tsx`

**Step 1: Add bilingual i18n keys**

```
settings.sfx        ar: "المؤثرات الصوتية"   en: "Sound effects"
settings.sfx_on     ar: "مُفعّل"             en: "On"
settings.sfx_off    ar: "متوقف"             en: "Off"
```

**Step 2: Add a row to SettingsPage**

Toggle pill that reads `userState.sfxEnabled`, dispatches `TOGGLE_SFX` on click. Use existing design-system `SqButton` or `SqPill` for the toggle. RTL-aware.

**Step 3: Verify typecheck + smoke (open `/settings`, toggle sound, then trigger any effect to confirm it's silent)**

---

### Task 17: Final typecheck + production build + dev smoke

**Files:** none — verification only.

**Step 1: Typecheck**

Run: `export PATH="/c/Program Files/nodejs:$PATH" && cd 'd:/AI/Quests/String-Quests-' && node node_modules/typescript/bin/tsc --noEmit 2>&1 | tail -20`
Expected: only the 4 known pre-existing errors (TextbookExplorer, textbookData, tailwind.config). Zero introduced.

**Step 2: Production build**

Run: `node node_modules/vite/bin/vite.js build 2>&1 | tail -10`
Expected: `✓ built in N s`. No new warnings beyond the pre-existing chunk-size warning. Bundle increase ≤ 15 KB gzip across all chunks (canvas-confetti ≈ 5 KB, effects ≈ 10 KB).

**Step 3: Dev-server smoke**

Run dev server in background. Walk the verification list from the design doc (10 items: 50/50, Hint, Skip, Second Chance, Eraser, Auto-Complete, SFX toggle, reduced-motion, AR/RTL, build). Confirm each.

**Step 4: Update memory**

If any agent introduced a project convention worth persisting (e.g. "all effects live under `components/powerups/effects/` and follow the 3-phase contract"), append a feedback memory.

---

## Conventions every effect must respect

- **No new design tokens** — reuse `sq-*` and `pastel-*`.
- **All Framer Motion guarded by `useReducedMotion()`**.
- **All SFX gated by `sfxEnabled`** via the `playSfx()` helper (it auto-checks the mute flag).
- **No external assets** — synth audio, lucide icons, inline SVG only.
- **State mutation lives in `post`** — the bar enqueues, the effect mutates. This keeps timing in sync.
- **RTL via `useI18n().locale === 'ar'` ternaries** for any spatial direction.
- **Light theme only** — never a dark fill, never a dark scrim.
