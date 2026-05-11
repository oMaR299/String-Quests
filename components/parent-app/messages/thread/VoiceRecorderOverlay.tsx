// VoiceRecorderOverlay.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-width red overlay that replaces the compose bar while a voice
// recording is in progress. Pulsing red dot + live (faked) waveform +
// duration counter + swipe-up-to-cancel hint.
//
// Reduced motion → no pulse, no animated waveform, no transition. Static
// "Recording... 0:14" text.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { useWaveformAnalyser } from '../hooks/useWaveformAnalyser';

interface Props {
  /** Live duration in seconds (integer). */
  durationSec: number;
  /** Max length warning visible? */
  warning?: boolean;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const VoiceRecorderOverlay: React.FC<Props> = ({
  durationSec,
  warning,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = (k: string) => getMessagesString(locale, k);

  const bars = useWaveformAnalyser({
    active: true,
    bars: 18,
    reduceMotion: !!reduceMotion,
  });

  return (
    <div className="rounded-2xl bg-rose-500 text-white p-3 flex items-center gap-3 shadow-lg">
      {/* Pulsing dot */}
      <motion.span
        className="shrink-0 w-3 h-3 rounded-full bg-white"
        animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0.4, 1] }}
        transition={
          reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 1 }
        }
        aria-hidden="true"
      />

      <span className="shrink-0 text-sm font-black tabular-nums">
        {fmt(durationSec)}
      </span>

      {/* Live (faked) waveform */}
      <div className="flex-1 h-7 flex items-center gap-[3px]" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-white/90"
            style={{ height: `${Math.round(h * 100)}%` }}
          />
        ))}
      </div>

      <span className="shrink-0 text-[10px] font-bold text-white/90 leading-tight max-w-[88px] truncate">
        {warning
          ? t('parentApp.messages.compose.maxLengthReached')
          : t('parentApp.messages.compose.swipeToCancel')}
      </span>
    </div>
  );
};

export default VoiceRecorderOverlay;
