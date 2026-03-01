
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, RotateCcw, HelpCircle, Lightbulb, Trophy, Calendar } from 'lucide-react';
import { Button } from './Button';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinkDiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
      <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
      <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
      <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
  </div>
);

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white relative"
          >
            {/* Header */}
            <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">دليل اللعبة</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                
                {/* Rule 1: Confidence */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-32 h-32 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2 relative z-10">
                        <span className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 text-sm font-black">1</span>
                         استراتيجية الثقة
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                تأكيد الإجابة
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                هل أنت واثق تماماً؟ <br/>
                                <span className="text-emerald-600 font-bold">إجابة صحيحة:</span> كامل النقاط 💎<br/>
                                <span className="text-rose-500 font-bold">إجابة خاطئة:</span> صفر نقاط
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                لست متأكداً تماماً
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                هل لديك شك؟ <br/>
                                <span className="text-blue-600 font-bold">إجابة صحيحة:</span> نصف النقاط <br/>
                                <span className="text-slate-400">خيار ذكي للحفاظ على تقدمك!</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rule 2: Hints & Points */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lightbulb className="w-32 h-32 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2 relative z-10">
                        <span className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700 text-sm font-black">2</span>
                        نقاط وتلميحات
                    </h3>
                    <ul className="space-y-3 relative z-10">
                        <li className="flex items-start gap-3 text-emerald-800 font-medium">
                            <span className="bg-white p-1.5 rounded-lg text-yellow-500 shadow-sm mt-0.5 ring-1 ring-emerald-100"><Lightbulb className="w-4 h-4 fill-current" /></span>
                            <span>يمكنك استخدام زر <span className="font-bold">التلميح</span> للمساعدة، لكنه سيخصم <span className="font-bold">20%</span> من نقاط السؤال.</span>
                        </li>
                        <li className="flex items-start gap-3 text-emerald-800 font-medium">
                            <span className="bg-white p-1.5 rounded-lg text-pink-500 shadow-sm mt-0.5 ring-1 ring-emerald-100"><PinkDiamondIcon className="w-4 h-4" /></span>
                            <span>تختلف النقاط حسب صعوبة السؤال. الأسئلة المعقدة (مثل الترتيب والمطابقة) تمنح نقاطاً أعلى!</span>
                        </li>
                    </ul>
                </div>

                {/* Rule 3: Second Chance */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <RotateCcw className="w-32 h-32 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2 relative z-10">
                        <span className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center text-orange-700 text-sm font-black">3</span>
                        الفرصة الثانية (تصحيح الأخطاء)
                    </h3>
                    <div className="relative z-10 space-y-4 text-orange-900/80 font-medium text-base md:text-lg leading-relaxed">
                        <p>
                            لا تقلق من الأخطاء! عند الإجابة بشكل خاطئ، لن تخسر كل شيء.
                        </p>
                        <div className="bg-white/60 rounded-2xl p-4 border border-orange-100/50 shadow-sm">
                           <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>أي سؤال تخطئ فيه (0 نقاط) يتم حفظه في قائمة <span className="font-bold text-orange-700">المراجعة</span>.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>في نهاية اللعبة، ستحصل على فرصة أخرى للإجابة على هذه الأسئلة.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>إذا أجبت بشكل صحيح في المراجعة، ستستعيد <span className="font-bold text-orange-700">40% من قيمة السؤال</span>!</span>
                                </li>
                           </ul>
                        </div>
                    </div>
                </div>

                {/* Rule 4: Game Modes */}
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-3xl p-6 border border-purple-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-32 h-32 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2 relative z-10">
                        <span className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-purple-700 text-sm font-black">4</span>
                        أنواع التحديات
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-purple-100/50">
                            <span className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Calendar className="w-5 h-5" /></span>
                            <div>
                                <span className="block font-bold text-slate-700 text-sm">التحدي اليومي</span>
                                <span className="text-xs text-slate-500 font-medium">5 أسئلة سريعة يومياً.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-purple-100/50">
                            <span className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><Trophy className="w-5 h-5" /></span>
                            <div>
                                <span className="block font-bold text-slate-700 text-sm">بطل الأسبوع</span>
                                <span className="text-xs text-slate-500 font-medium">تحدي شامل للمحترفين.</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={onClose} className="px-8 shadow-lg shadow-slate-200">حسناً، فهمت!</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
