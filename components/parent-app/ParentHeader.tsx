// ParentHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Flat, sticky top chrome for the Parent App. Single row, ~64px tall:
//
//   [ParentProfileButton (avatar ring)]   [ActiveChildPopoverTrigger (child + caret)]
//
// 2026-05 refactor: previously hosted avatar + scrollable child pills row +
// refresh + bell. The bell + refresh were both removed (behavior change,
// documented). The Messages tab in the bottom tab bar is now the sole entry
// point for the bell's former role. Refresh is gone — data is live via the
// Parent App context.
//
// Solid white background, hairline bottom border, no backdrop-blur, no
// inner shadows. RTL flips for free via flex + logical properties.

import React from 'react';
import { useParentAppContext } from './useParentAppContext';
import { ParentProfileButton } from './ParentProfileButton';
import { ActiveChildPopoverTrigger } from './ActiveChildPopover';

export const ParentHeader: React.FC = () => {
  const { state } = useParentAppContext();

  return (
    <header
      className="w-full bg-white border-b border-slate-200"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <ParentProfileButton initial={state.parentInitial} isPremium />
        <ActiveChildPopoverTrigger />
      </div>
    </header>
  );
};

export default ParentHeader;
