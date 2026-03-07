import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, GraduationCap } from 'lucide-react';
import { Textbook, AVAILABLE_TEXTBOOKS } from '../../data/sampleTextbook';

interface Props {
  activeTextbook: Textbook;
  onSelect: (textbook: Textbook) => void;
  locale: string;
}

export const TextbookSelector: React.FC<Props> = ({ activeTextbook, onSelect, locale }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (tb: Textbook) => {
    onSelect(tb);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-black text-slate-800">
            {locale === 'ar' ? activeTextbook.nameAr : activeTextbook.nameEn}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {locale === 'ar' ? `الصف ${activeTextbook.gradeLevel}` : `Grade ${activeTextbook.gradeLevel}`}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
          >
            {AVAILABLE_TEXTBOOKS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => handleSelect(tb)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  tb.id === activeTextbook.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  tb.id === activeTextbook.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-bold ${tb.id === activeTextbook.id ? 'text-blue-600' : 'text-slate-700'}`}>
                    {locale === 'ar' ? tb.nameAr : tb.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {locale === 'ar' ? `الصف ${tb.gradeLevel}` : `Grade ${tb.gradeLevel}`}
                  </div>
                </div>
                {tb.id === activeTextbook.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
