/**
 * sq-DeviceFrame — desktop / tablet / mobile chrome wrapper.
 * Generalised from `notification-admin/compose/DeviceFrame.tsx`.
 *
 * Use to preview a screen as it would render on the target device.
 */

import React from 'react';
import { SqStatusBar } from './StatusBar';

export type SqDeviceMode = 'desktop' | 'tablet' | 'mobile';

interface SqDeviceFrameProps {
  mode: SqDeviceMode;
  children: React.ReactNode;
  statusBarVariant?: 'light' | 'dark';
  /** When true, disables the inner padding so the child can be edge-to-edge. */
  fullBleed?: boolean;
  /** Mock URL shown in the desktop browser bar. */
  url?: string;
}

export const SqDeviceFrame: React.FC<SqDeviceFrameProps> = ({
  mode,
  children,
  statusBarVariant = 'dark',
  fullBleed = false,
  url = 'app.stringquests.sa',
}) => {
  if (mode === 'desktop') {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="flex-1 mx-3">
            <div className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-400 truncate">
              {url}
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
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-600 z-20" />
        <SqStatusBar variant={statusBarVariant} />
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        <div className="w-10 h-1 bg-slate-700 rounded-full" />
      </div>
      <div className="pt-5 bg-white">
        <SqStatusBar variant={statusBarVariant} />
      </div>
      <div className={`relative bg-white ${fullBleed ? '' : 'p-3'}`}>{children}</div>
      <div className="h-5 flex items-center justify-center bg-white">
        <div className="w-24 h-1 bg-slate-800 rounded-full" />
      </div>
    </div>
  );
};

export default SqDeviceFrame;
