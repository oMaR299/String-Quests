
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Clock, Activity, Star } from 'lucide-react';
import { Button } from './Button';

interface StatsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsInfoModal: React.FC<StatsInfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white relative flex flex-col"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg border border-white/20">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white">دليل الإحصائيات</h2>
                    <p className="text-indigo-100 text-sm font-medium">افهم أرقامك لتطور مستواك</p>
                </div>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                
                {/* 1. XP */}
                <div className="flex gap-4 items-start p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 shrink-0 mt-1">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-purple-900 mb-1">نقاط الخبرة (XP)</h3>
                        <p className="text-sm text-purple-700/80 font-medium leading-relaxed">
                            مقياس لمجهودك العام. تحصل عليها عند إتمام الدروس والمهام. كلما زادت، ارتفع ترتيبك في الدوري!
                        </p>
                    </div>
                </div>

                {/* 2. Accuracy */}
                <div className="flex gap-4 items-start p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                    <div className="w-10 h-10 bg-cyan-200 rounded-full flex items-center justify-center text-cyan-700 shrink-0 mt-1">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-cyan-900 mb-1">الدقة (%)</h3>
                        <p className="text-sm text-cyan-700/80 font-medium leading-relaxed">
                            مقياس لجودة إجاباتك. 
                            <span className="block mt-1 text-xs bg-white/50 px-2 py-1 rounded-md w-fit">
                                ⭐ فوق 90% = أداء أسطوري
                            </span>
                        </p>
                    </div>
                </div>

                {/* 3. Time */}
                <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 shrink-0 mt-1">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-amber-900 mb-1">وقت التعلم</h3>
                        <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
                            الوقت الذي قضيته في التدريب والدراسة. الاستمرارية هي مفتاح النجاح!
                        </p>
                    </div>
                </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button onClick={onClose} fullWidth>فهمت، شكراً!</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
