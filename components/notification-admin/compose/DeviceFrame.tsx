import React from 'react';
import { StatusBar } from './StatusBar';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface DeviceFrameProps {
  mode: DeviceMode;
  children: React.ReactNode;
  /** Status bar tone. Light = white text (over colored hero); dark = dark text (over white). */
  statusBarVariant?: 'light' | 'dark';
  /** Use full-bleed inside the frame (no padding). Useful for popup/banner that need to look like full app screens. */
  fullBleed?: boolean;
}

/**
 * Shared device chrome for the notification preview.
 * - Desktop: simple browser-ish window
 * - Tablet: rounded slab w/ speaker dot
 * - Mobile: iPhone-like notch + status bar + home indicator
 */
export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mode,
  children,
  statusBarVariant = 'dark',
  fullBleed = false,
}) => {
  if (mode === 'desktop') {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="flex-1 mx-3">
            <div className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-400 truncate">
              app.stringquests.sa
            </div>
          </div>
        </div>
        <div className={fullBleed ? '' : 'p-4'}>{children}</div>
      </div>
    );
  }

  if (mode === 'tablet') {
    return (
      <div className="w-full max-w-[768px] mx-auto rounded-[1.5rem] border-[10px] border-slate-800 bg-white shadow-lg overflow-hidden relative">
        {/* Speaker dot */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-600 z-20" />
        <StatusBar variant={statusBarVariant} />
        <div className={fullBleed ? '' : 'p-4'}>{children}</div>
        <div className="h-3 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    );
  }

  // mobile
  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2.25rem] border-[10px] border-slate-900 bg-white shadow-2xl overflow-hidden relative">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        <div className="w-10 h-1 bg-slate-700 rounded-full" />
      </div>

      {/* Status bar (under notch) */}
      <div className="pt-5 bg-white">
        <StatusBar variant={statusBarVariant} />
      </div>

      {/* Screen content */}
      <div className={`relative bg-white ${fullBleed ? '' : 'p-3'}`}>{children}</div>

      {/* Home indicator */}
      <div className="h-5 flex items-center justify-center bg-white">
        <div className="w-24 h-1 bg-slate-800 rounded-full" />
      </div>
    </div>
  );
};
