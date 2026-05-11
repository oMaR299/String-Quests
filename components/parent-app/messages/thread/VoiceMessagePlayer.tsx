// VoiceMessagePlayer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Waveform UI for a voice message bubble. Tap play → audio plays; tap on
// the waveform → seek to that fraction. Each player owns its own <audio>
// element (simpler than sharing).
//
// Bar heights are deterministic per message id (hashed) so the "waveform"
// looks like a real recording's signature without us needing to analyse the
// actual audio bytes. Reduced motion → no animated fill; show static fill
// at current time fraction.
//
// Auto-advance: when audio ends, fire `onEnded` so the parent (ThreadView)
// can find the next unplayed voice message and trigger its play handler.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';

const BARS = 32;

interface Props {
  messageId: string;
  src: string;
  durationSec: number;
  /** Author = parent? Drives bar colors so they read well against the bubble. */
  fromParent: boolean;
  /** Called when this message finishes playback (auto-advance hook). */
  onEnded?: () => void;
  /** Imperative: parent can set this ref and call .play() to auto-advance. */
  registerPlay?: (play: () => void) => void;
}

/** Deterministic bar heights from a message id. Returns array of 0.2..1.0. */
function makeBars(id: string, count: number): number[] {
  // Simple xorshift-style hash from string.
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h = ((h ^ (h << 13)) >>> 0) ^ (h >>> 17);
    h = (h ^ (h << 5)) >>> 0;
    out.push(0.25 + ((h % 1000) / 1000) * 0.75);
  }
  return out;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const VoiceMessagePlayer: React.FC<Props> = ({
  messageId,
  src,
  durationSec,
  fromParent,
  onEnded,
  registerPlay,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = (k: string) => getMessagesString(locale, k);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const bars = useMemo(() => makeBars(messageId, BARS), [messageId]);

  // Wire native audio events.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnd);
    };
  }, [onEnded]);

  // Register imperative play handler.
  useEffect(() => {
    if (!registerPlay) return;
    registerPlay(() => {
      audioRef.current?.play().catch(() => {
        // Autoplay may be blocked; silently ignore.
      });
    });
  }, [registerPlay]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => {
        // Block from browser; nothing to do for the mock.
      });
    }
  };

  const seekFromX = (clientX: number) => {
    const el = audioRef.current;
    const c = containerRef.current;
    if (!el || !c) return;
    const rect = c.getBoundingClientRect();
    const xWithin = clientX - rect.left;
    let fraction = xWithin / rect.width;
    if (locale === 'ar') {
      // RTL: bars are visually mirrored — flip the seek fraction so the
      // start (oldest audio) is on the right.
      fraction = 1 - fraction;
    }
    fraction = Math.max(0, Math.min(1, fraction));
    const target = (el.duration && Number.isFinite(el.duration)
      ? el.duration
      : durationSec) * fraction;
    try {
      el.currentTime = target;
    } catch {
      // ignore
    }
  };

  const totalDur = Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0;
  const playedFraction = totalDur > 0 ? Math.min(1, currentTime / totalDur) : 0;

  // Color palette per bubble side
  const playBg = fromParent
    ? 'bg-white text-duo-blue'
    : 'bg-duo-blue text-white';
  const barIdle = fromParent ? 'bg-white/40' : 'bg-slate-300';
  const barActive = fromParent ? 'bg-white' : 'bg-duo-blue';

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={
          isPlaying
            ? t('parentApp.messages.voice.pauseAria')
            : t('parentApp.messages.voice.playAria')
        }
        className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full ${playBg} active:scale-95 transition-transform shadow`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" strokeWidth={2.5} />
        ) : (
          <Play
            className="w-4 h-4 rtl:-scale-x-100"
            strokeWidth={2.5}
          />
        )}
      </button>

      <div
        ref={containerRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={totalDur}
        aria-valuenow={currentTime}
        tabIndex={0}
        onClick={(e) => seekFromX(e.clientX)}
        className="flex-1 h-7 flex items-center gap-[2px] cursor-pointer"
      >
        {bars.map((h, i) => {
          // RTL: bar 0 should visually sit on the right edge so it "plays"
          // from start (right) to end (left). Reverse fill comparison.
          const barFraction = (i + 1) / BARS;
          const isPlayed = barFraction <= playedFraction;
          // Static (reduced motion) → only color, no transition.
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full ${
                isPlayed ? barActive : barIdle
              } ${reduceMotion ? '' : 'transition-colors duration-100'}`}
              style={{ height: `${Math.round(h * 100)}%` }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      <span
        className={`shrink-0 text-[11px] font-bold tabular-nums ${
          fromParent ? 'text-white/85' : 'text-slate-500'
        }`}
      >
        {fmt(isPlaying || currentTime > 0 ? currentTime : totalDur)}
      </span>
    </div>
  );
};

export default VoiceMessagePlayer;
