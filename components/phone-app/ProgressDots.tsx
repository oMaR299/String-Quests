// ProgressDots — the brand's "string" progress indicator.
//
// Visual recipe — this is the brand. The product is literally called String,
// so the journey progress is a connected string of dots:
//
//   - 4 circles in a row, threaded by a single curved line.
//   - The thread is drawn with stroke-dasharray so it "draws itself" from
//     the start up to the current step's circle as the user advances.
//   - Active circle: solid accent (per-step tone), slightly larger.
//   - Completed circle: solid accent + tiny white check.
//   - Pending circle: hollow white with slate-300 border.
//
// Tones rotate with the per-screen accent (mint / cream-coral / sky / mint).
// The overall component is small and sits at the top of the phone.

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressDotsProps {
  /** Current step (1-based, 1..5). Step 1 hides the dots. */
  step: number;
  /** Tone of the active dot — defaults to mint. Per-screen overrides match
   *  each screen's accent family. */
  tone?: 'mint' | 'coral' | 'sky';
}

// Static color lookups so JIT picks them up.
const TONE_FILL: Record<NonNullable<ProgressDotsProps['tone']>, string> = {
  mint:  '#10B981',
  coral: '#F87171',
  sky:   '#0EA5E9',
};

export const ProgressDots: React.FC<ProgressDotsProps> = ({ step, tone = 'mint' }) => {
  const reduce = useReducedMotion();
  if (step < 2) return null;

  // Map step 2..5 → index 0..3 of the 4 visible dots.
  const total = 4;
  const activeIdx = Math.max(0, Math.min(total - 1, step - 2));

  // SVG canvas — width tuned so dots have generous breathing room.
  const VB_W = 200;
  const VB_H = 28;
  const PAD = 18;
  const stride = (VB_W - PAD * 2) / (total - 1); // distance between dot centres
  const dotR = 6;
  const activeR = 8;

  // Path of the gentle wavy thread that connects each dot — alternates above
  // and below the centre line so it reads as a flowing string, not a ruler.
  // We compute Q-curve segments between adjacent dots.
  const buildThreadPath = () => {
    let d = '';
    for (let i = 0; i < total; i++) {
      const x = PAD + stride * i;
      const y = VB_H / 2;
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const xPrev = PAD + stride * (i - 1);
        const cx = (x + xPrev) / 2;
        const cy = i % 2 === 1 ? y - 5 : y + 5;
        d += ` Q ${cx} ${cy} ${x} ${y}`;
      }
    }
    return d;
  };
  const threadPath = buildThreadPath();

  // Compute fraction of total path the active dot represents (for stroke-dasharray draw).
  const totalSegments = total - 1;
  const completedFraction = totalSegments === 0 ? 0 : activeIdx / totalSegments;

  const activeFill = TONE_FILL[tone];

  return (
    <div className="flex items-center justify-center pt-3 pb-1" aria-label="Progress">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="170"
        height="24"
        role="img"
        aria-hidden
      >
        {/* Pending thread (full path, slate-200) */}
        <path
          d={threadPath}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Drawn thread up to the active step (animated) */}
        <motion.path
          d={threadPath}
          fill="none"
          stroke={activeFill}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          initial={false}
          animate={{ pathLength: completedFraction }}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
        />

        {/* Dots */}
        {Array.from({ length: total }).map((_, i) => {
          const cx = PAD + stride * i;
          const cy = VB_H / 2;
          const isActive    = i === activeIdx;
          const isCompleted = i < activeIdx;

          if (isActive) {
            return (
              <motion.circle
                key={i}
                cx={cx} cy={cy}
                r={activeR}
                fill={activeFill}
                stroke="#FFFFFF"
                strokeWidth="2"
                initial={false}
                animate={{ scale: 1 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 20 }}
              />
            );
          }
          if (isCompleted) {
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={dotR} fill={activeFill} />
                {/* Tiny check */}
                <path
                  d={`M ${cx - 2.6} ${cy + 0.2} L ${cx - 0.6} ${cy + 2.2} L ${cx + 2.6} ${cy - 1.6}`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          }
          // pending
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={dotR - 0.5}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ProgressDots;
