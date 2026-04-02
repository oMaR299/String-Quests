import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Minimize2 } from 'lucide-react';

interface ExpandableWidgetProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const ExpandableWidget: React.FC<ExpandableWidgetProps> = ({ children, title, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Normal view with maximize button */}
      <div className={`relative group ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-300 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
          title={title ? `توسيع ${title}` : 'توسيع'}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        {children}
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100 rounded-t-2xl">
                {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Widget content rendered at full size */}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpandableWidget;
