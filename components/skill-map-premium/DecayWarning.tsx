/**
 * DecayWarning - Pulsing warning ring overlay for decaying unit tiles.
 *
 * Renders an animated ring border that pulses at a speed determined
 * by how urgent the decay is (days until critical). Overlays the
 * parent tile via absolute positioning.
 */

import React from 'react';

interface DecayWarningProps {
  daysUntilCritical: number; // 1-7
  className?: string;
}

export function DecayWarning({ daysUntilCritical, className = '' }: DecayWarningProps) {
  // Urgency tiers
  const isRed = daysUntilCritical <= 2;
  const isOrange = daysUntilCritical >= 3 && daysUntilCritical <= 4;
  // Yellow for 5-7

  const ringColor = isRed
    ? 'border-red-400'
    : isOrange
      ? 'border-orange-400'
      : 'border-yellow-400';

  // Pulse speed via custom animation duration
  const pulseDuration = isRed ? '0.8s' : isOrange ? '1.4s' : '2s';

  return (
    <div
      className={`absolute inset-0 rounded-xl pointer-events-none ${className}`}
      style={{ zIndex: 2 }}
    >
      {/* Pulsing ring */}
      <div
        className={`absolute inset-0 rounded-xl border-2 ${ringColor} opacity-80`}
        style={{
          animation: `pulse ${pulseDuration} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
        }}
      />
      {/* Tiny days label */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9px] text-white/80 font-medium">
        <span>⏳</span>
        <span>{daysUntilCritical}d</span>
      </div>
    </div>
  );
}

export default DecayWarning;
