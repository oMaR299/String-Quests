/**
 * sfx.ts — Web Audio synthesizer for in-question power-up signature moments.
 *
 * Six named sounds, all generated inline via the Web Audio API (oscillators,
 * filtered white noise, ADSR envelopes). No assets, no third-party libraries.
 *
 * Wiring:
 *   - `playSfx(name)` is the only public play surface; lazy-inits the
 *     AudioContext on first call (to satisfy autoplay policies; the resume()
 *     call covers the case where the page loads before a user gesture).
 *   - `setSfxMuted(true)` silences every subsequent call. UserContext flips
 *     this from a useEffect that watches `state.sfxEnabled`.
 *   - All errors swallowed — audio must never break the UI.
 */

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
      ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
    } catch {
      ctx = null;
    }
  }
  return ctx;
};

export const setSfxMuted = (next: boolean) => {
  muted = next;
};

/** ADSR envelope helper — attack ramp, exponential decay tail. */
const env = (g: GainNode, t: number, attack: number, decay: number, peak = 0.4) => {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return t + attack + decay;
};

/** Build a transient white-noise buffer at the given duration (seconds). */
const noiseBuffer = (duration: number) => {
  const c = getCtx()!;
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
};

const playShatter = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // White-noise burst through low-pass sweep.
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(0.4);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(8000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.3);
  const g = c.createGain();
  src.connect(filter).connect(g).connect(c.destination);
  env(g, now, 0.005, 0.3, 0.5);
  src.start(now);
  src.stop(now + 0.4);
  // Low sine tail.
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 250;
  const og = c.createGain();
  osc.connect(og).connect(c.destination);
  env(og, now, 0.01, 0.25, 0.25);
  osc.start(now);
  osc.stop(now + 0.3);
};

const playChime = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = c.createGain();
    osc.connect(g).connect(c.destination);
    env(g, now + i * 0.06, 0.01, 0.55, 0.18);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.6);
  });
};

const playWhoosh = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
  const g = c.createGain();
  osc.connect(g).connect(c.destination);
  env(g, now, 0.02, 0.45, 0.3);
  osc.start(now);
  osc.stop(now + 0.55);
};

const playHeartbeat = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [0, 0.18].forEach((offset) => {
    [60, 90].forEach((freq) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = c.createGain();
      osc.connect(g).connect(c.destination);
      env(g, now + offset, 0.005, 0.075, 0.5);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  });
};

const playEraser = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // Brushed-noise swipe.
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(0.3);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1500;
  bp.Q.value = 0.5;
  const g = c.createGain();
  src.connect(bp).connect(g).connect(c.destination);
  env(g, now, 0.005, 0.27, 0.25);
  src.start(now);
  src.stop(now + 0.3);
  // Restore pluck (square).
  const osc = c.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 660;
  const og = c.createGain();
  osc.connect(og).connect(c.destination);
  env(og, now + 0.32, 0.005, 0.1, 0.18);
  osc.start(now + 0.32);
  osc.stop(now + 0.45);
};

const playClickSuccess = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  // Mechanical click.
  const click = c.createOscillator();
  click.type = 'square';
  click.frequency.value = 1200;
  const cg = c.createGain();
  click.connect(cg).connect(c.destination);
  env(cg, now, 0.001, 0.03, 0.2);
  click.start(now);
  click.stop(now + 0.04);
  // Success 2-note chime.
  [659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = c.createGain();
    osc.connect(g).connect(c.destination);
    env(g, now + 0.05 + i * 0.1, 0.005, 0.22, 0.18);
    osc.start(now + 0.05 + i * 0.1);
    osc.stop(now + 0.05 + i * 0.1 + 0.25);
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
  const c = getCtx();
  if (!c) return;
  // Resume if suspended (autoplay policy).
  if (c.state === 'suspended') c.resume().catch(() => {});
  try {
    REGISTRY[name]();
  } catch {
    /* never break the UI on audio errors */
  }
};
