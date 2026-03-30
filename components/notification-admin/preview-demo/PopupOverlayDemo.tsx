import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// --- Component ---

interface PopupOverlayDemoProps {
  title?: string;
  body?: string;
  imageUrl?: string;
  primaryButton?: { label: string; url: string };
  dismissible?: boolean;
}

export const PopupOverlayDemo: React.FC<PopupOverlayDemoProps> = ({
  title = 'عنوان الإشعار',
  body = 'محتوى الإشعار يظهر هنا...',
  imageUrl,
  primaryButton,
  dismissible = true,
}) => {
  return (
    <div
      className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
      style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}
    >
      {/* Mock page background */}
      <div className="bg-slate-100 p-6 min-h-[320px] relative">
        {/* Mock page content */}
        <div className="space-y-3 opacity-30">
          <div className="h-6 w-3/4 bg-slate-300 rounded-lg" />
          <div className="h-4 w-full bg-slate-300 rounded-lg" />
          <div className="h-4 w-5/6 bg-slate-300 rounded-lg" />
          <div className="h-4 w-2/3 bg-slate-300 rounded-lg" />
          <div className="h-20 w-full bg-slate-300 rounded-xl mt-4" />
          <div className="h-4 w-full bg-slate-300 rounded-lg" />
          <div className="h-4 w-4/5 bg-slate-300 rounded-lg" />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden"
            dir="rtl"
          >
            {/* Close button */}
            {dismissible && (
              <button className="absolute top-3 left-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10">
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}

            {/* Image */}
            {imageUrl && (
              <div className="w-full h-32 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              <h3 className="text-base font-black text-slate-800 mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-line">
                {body}
              </p>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 space-y-2">
              {primaryButton && (
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold hover:shadow-md transition-all">
                  {primaryButton.label}
                </button>
              )}
              {dismissible && (
                <button className="w-full py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                  إغلاق
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
