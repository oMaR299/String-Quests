import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// --- Component ---

interface StickyBannerDemoProps {
  shortMessage?: string;
  gradient?: string;
  actionButton?: { label: string; url: string };
  dismissible?: boolean;
}

export const StickyBannerDemo: React.FC<StickyBannerDemoProps> = ({
  shortMessage = 'رسالة الإشعار تظهر هنا...',
  gradient = 'from-sky-500 to-blue-600',
  actionButton,
  dismissible = true,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm" dir="rtl">
      {/* Banner */}
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`bg-gradient-to-r ${gradient} overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="text-sm font-bold text-white flex-1 truncate">
                {shortMessage}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {actionButton && (
                  <button className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition-colors">
                    {actionButton.label}
                  </button>
                )}

                {dismissible && (
                  <button
                    onClick={() => setIsDismissed(true)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/80" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mock page below */}
      <div className="bg-white">
        {/* Mock header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600" />
            <span className="text-sm font-black text-slate-800">String</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200" />
            <div className="w-5 h-5 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Mock page content */}
        <div className="p-4 space-y-3">
          <div className="h-5 w-2/3 bg-slate-100 rounded-lg" />
          <div className="h-3 w-full bg-slate-100 rounded-lg" />
          <div className="h-3 w-5/6 bg-slate-100 rounded-lg" />
          <div className="h-3 w-3/4 bg-slate-100 rounded-lg" />

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-lg" />
          <div className="h-3 w-4/5 bg-slate-100 rounded-lg" />
          <div className="h-3 w-2/3 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Reset button (when dismissed) */}
      <AnimatePresence>
        {isDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 right-2"
          >
            <button
              onClick={() => setIsDismissed(false)}
              className="px-2.5 py-1 rounded-lg bg-white shadow-md border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              إعادة العرض
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
