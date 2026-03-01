
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Shield, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from './Button';

interface LeagueRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueRulesModal: React.FC<LeagueRulesModalProps> = ({ isOpen, onClose }) => {
  const leagues = [
      { name: 'برونزي', color: 'bg-amber-700', text: 'text-amber-100', icon: '🛡️', desc: 'بداية الرحلة' },
      { name: 'فضي', color: 'bg-slate-400', text: 'text-slate-100', icon: '⚔️', desc: 'للمثابرين' },
      { name: 'ذهبي', color: 'bg-yellow-500', text: 'text-yellow-50', icon: '👑', desc: 'للمحترفين' },
      { name: 'بلاتيني', color: 'bg-cyan-500', text: 'text-cyan-50', icon: '💠', desc: 'للنخبة' },
      { name: 'ماسي', color: 'bg-fuchsia-500', text: 'text-fuchsia-50', icon: '💎', desc: 'للأساطير' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white relative max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">نظام الدوريات</h2>
                        <p className="text-xs text-slate-500 font-bold">كيف تصعد للقمة؟</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* 1. The Leagues Visualization */}
                <div className="flex flex-col gap-2 mb-8 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-100 rounded-full z-0"></div>
                    {leagues.map((l, idx) => (
                        <div key={l.name} className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md border-4 border-white ${l.color}`}>
                                {l.icon}
                            </div>
                            <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <span className="block font-black text-slate-700">{l.name}</span>
                                    <span className="text-xs text-slate-400 font-bold">{l.desc}</span>
                                </div>
                                {idx === 2 && (
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full">أنت هنا</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Rules */}
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    قواعد الصعود والهبوط
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 text-center">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ArrowUp className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-emerald-800 mb-1">منطقة الصعود</h4>
                        <p className="text-xs text-emerald-600 font-medium">
                            أفضل 5 لاعبين في الدوري كل أسبوع يصعدون للدوري الأعلى.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Minus className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-700 mb-1">منطقة الأمان</h4>
                        <p className="text-xs text-slate-500 font-medium">
                            اللاعبون في الوسط يبقون في نفس الدوري للمنافسة مجدداً.
                        </p>
                    </div>

                    <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 text-center">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ArrowDown className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-rose-800 mb-1">منطقة الخطر</h4>
                        <p className="text-xs text-rose-600 font-medium">
                            آخر 5 لاعبين يهبطون للدوري الأدنى. حافظ على نقاطك!
                        </p>
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center text-blue-800 text-sm font-bold">
                    ⏳ ينتهي الموسم أسبوعياً يوم الأحد الساعة 12:00 ص
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <Button onClick={onClose} fullWidth>حسناً، سأنافس بقوة!</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
