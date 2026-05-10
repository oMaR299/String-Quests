/**
 * sq-StatusBar — iOS-style status bar with RTL-aware layout.
 * Lifted from `notification-admin/compose/StatusBar.tsx`.
 */

import React from 'react';
import { Signal, Wifi, BatteryFull } from 'lucide-react';

interface SqStatusBarProps {
  variant?: 'light' | 'dark';
  /** Defaults to AR-first (rtl=true). */
  rtl?: boolean;
  /** Override the displayed time. */
  time?: string;
}

export const SqStatusBar: React.FC<SqStatusBarProps> = ({
  variant = 'dark',
  rtl = true,
  time = '9:41',
}) => {
  const tone = variant === 'dark' ? 'text-slate-800' : 'text-white';
  return (
    <div
      className="flex items-center justify-between px-5 py-1 text-[11px] select-none"
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <span className={`text-[11px] font-bold tabular-nums ${tone}`}>{time}</span>
      <div className={`flex items-center gap-1 ${tone}`}>
        <Signal className="w-3 h-3" strokeWidth={2.5} />
        <Wifi className="w-3 h-3" strokeWidth={2.5} />
        <BatteryFull className="w-4 h-3" strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default SqStatusBar;
