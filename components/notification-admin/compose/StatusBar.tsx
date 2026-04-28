import React from 'react';
import { Signal, Wifi, BatteryFull } from 'lucide-react';

interface StatusBarProps {
  variant?: 'light' | 'dark';
  /** RTL flips signal/time positions. Default: rtl=true (AR-first). */
  rtl?: boolean;
}

/**
 * iOS-style status bar.
 * In LTR: time on left, signal/wifi/battery on right.
 * In RTL: time on right, signal/wifi/battery on left.
 */
export const StatusBar: React.FC<StatusBarProps> = ({ variant = 'dark', rtl = true }) => {
  const tone = variant === 'dark' ? 'text-slate-800' : 'text-white';

  const Time = (
    <span className={`text-[11px] font-bold tabular-nums ${tone}`}>9:41</span>
  );

  const Indicators = (
    <div className={`flex items-center gap-1 ${tone}`}>
      <Signal className="w-3 h-3" strokeWidth={2.5} />
      <Wifi className="w-3 h-3" strokeWidth={2.5} />
      <BatteryFull className="w-4 h-3" strokeWidth={2.5} />
    </div>
  );

  return (
    <div
      className="flex items-center justify-between px-5 py-1 text-[11px] select-none"
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* In RTL flex-direction reverses; visually time anchors right, indicators left */}
      {Time}
      {Indicators}
    </div>
  );
};
