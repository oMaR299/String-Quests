/**
 * sq-BadgeAnchor — RTL-aware floating badge anchor.
 * Lifted from `notification-admin/compose/BadgeAnchor.tsx`.
 *
 * Wrap any anchor and place a count/status badge at its top-end (or
 * bottom-end) corner. The badge floats half outside, on the trailing
 * edge — so it pokes outward in both LTR and RTL.
 */

import React from 'react';

interface SqBadgeAnchorProps {
  side?: 'top' | 'bottom';
  className?: string;
  children: React.ReactNode;
}

const TOP_CLASSES =
  'pointer-events-none absolute z-20 top-0 end-0 -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2';
const BOTTOM_CLASSES =
  'pointer-events-none absolute z-20 bottom-0 end-0 translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2';

export const SqBadgeAnchor: React.FC<SqBadgeAnchorProps> = ({
  side = 'top',
  className = '',
  children,
}) => (
  <span className={`${side === 'top' ? TOP_CLASSES : BOTTOM_CLASSES} ${className}`}>
    {children}
  </span>
);

export default SqBadgeAnchor;
