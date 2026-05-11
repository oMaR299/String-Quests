// useWaveformAnalyser.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tiny faked oscillator that returns an array of bar heights (0-1) updated
// every ~80ms while recording. The plan accepts a faked oscillation for v1
// because Web Audio's AnalyserNode hookup adds cross-browser complexity
// (especially on iOS Safari) for what is a visual flourish.
//
// Trade-off: bars don't actually reflect the captured signal. They just look
// "live". When/if a real backend captures audio, the playback waveform is
// already deterministic per message id (see VoiceMessagePlayer), so this fake
// is only for the recording overlay.
//
// Reduced-motion: returns a static array of mid-height bars and never
// updates state — callers should also guard their animations.

import { useEffect, useState } from 'react';

export function useWaveformAnalyser(opts: {
  active: boolean;
  bars: number;
  reduceMotion?: boolean;
}): number[] {
  const { active, bars, reduceMotion = false } = opts;
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: bars }, () => 0.5)
  );

  useEffect(() => {
    if (!active || reduceMotion) return;
    let mounted = true;
    const id = window.setInterval(() => {
      if (!mounted) return;
      setHeights((prev) =>
        prev.map((_, i) => {
          // Rhythmic-ish oscillation: each bar gets a different phase based
          // on its index. Random twitch on top to keep it from looking
          // metronomic.
          const t = Date.now() / 250;
          const base = 0.4 + 0.45 * Math.abs(Math.sin(t + i * 0.6));
          const jitter = (Math.random() - 0.5) * 0.15;
          return Math.max(0.1, Math.min(1, base + jitter));
        })
      );
    }, 80);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [active, reduceMotion]);

  // If `bars` changes (rare), reset the array shape.
  useEffect(() => {
    setHeights((prev) =>
      prev.length === bars ? prev : Array.from({ length: bars }, () => 0.5)
    );
  }, [bars]);

  return heights;
}
