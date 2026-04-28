/**
 * BadgeAnchor
 *
 * Direction-aware floating badge anchor for the live count badges in the
 * preview channels. The previous static positioning (`-top-2 -left-1`) was
 * tuned for RTL only and clipped on LTR. This wrapper uses logical
 * positioning + an RTL-aware translate so the badge floats just outside
 * the start-end edge of its anchor in either direction:
 *
 *           ┌────────────────────┐
 *           │ Title text…        │  badge sits here (top-end corner)
 *           └────────────────────┘
 *
 *   - LTR: badge ends up at the top-RIGHT, half outside.
 *   - RTL: badge ends up at the top-LEFT, half outside.
 *
 * In RTL `end` resolves to the LEFT edge, and we counter-translate by
 * `-50%` instead of `+50%` so the badge still pokes outward (not inward).
 *
 * Tailwind v4 JIT-safe: every class string is a complete literal here.
 */

import React from 'react';

interface BadgeAnchorProps {
  /** Where on the parent the badge should attach. */
  side?: 'top' | 'bottom';
  /** Render anything — typically a small `<span>` with the count text. */
  children: React.ReactNode;
  /** Optional extra classes (style/colour come from the consumer). */
  className?: string;
}

const TOP_CLASSES =
  'pointer-events-none absolute z-20 top-0 end-0 -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2';

const BOTTOM_CLASSES =
  'pointer-events-none absolute z-20 bottom-0 end-0 translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2';

export const BadgeAnchor: React.FC<BadgeAnchorProps> = ({
  side = 'top',
  children,
  className = '',
}) => {
  return (
    <span
      className={`${side === 'top' ? TOP_CLASSES : BOTTOM_CLASSES} ${className}`}
    >
      {children}
    </span>
  );
};

export default BadgeAnchor;
