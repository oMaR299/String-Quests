
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface InfoHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  colorClass?: string;
  tips?: string[];
}

export const InfoHelpModal: React.FC<InfoHelpModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  icon,
  colorClass = "bg-blue-500",
  tips
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white relative"
          >
            {/* Header / Graphic */}
            <div className={`h-24 ${colorClass} relative overflow-hidden flex items-center justify-center`}>
                 <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[2px]"></div>
                 {/* Decorative Circles */}
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                 
                 <div className="relative z-10 p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
                     {icon || <Info className="w-8 h-8 text-white" />}
                 </div>

                 <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-6 text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-6 text-sm">
                    {description}
                </p>

                {tips && tips.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">نصائح مفيدة</div>
                        <ul className="space-y-2">
                            {tips.map((tip, idx) => (
                                <li key={idx} className="text-sm font-bold text-slate-600 flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors shadow-lg shadow-slate-800/20"
                >
                    حسناً، فهمت
                </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
