import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '../Button';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  titleAr: string;
  titleEn: string;
  locale: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen, level, titleAr, titleEn, locale, onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  background: ['#FFC800', '#58CC02', '#FF4B4B', '#1CB0F6', '#A855F7'][i % 5],
                }}
                animate={{
                  y: '120vh',
                  x: Math.random() * 200 - 100,
                  rotate: 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  ease: 'linear',
                  delay: Math.random() * 1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center relative shadow-2xl border border-white overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white pointer-events-none" />

            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full z-10">
              <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="relative z-10">
              {/* Level badge */}
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="w-28 h-28 mx-auto mb-6 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-xl shadow-yellow-500/30" />
                <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <Star className="w-6 h-6 text-yellow-700 fill-yellow-700 mx-auto mb-0.5" />
                    <span className="text-3xl font-black text-yellow-800">{level}</span>
                  </div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-black text-slate-800 mb-1">
                {locale === 'ar' ? 'مستوى جديد!' : 'Level Up!'}
              </h2>
              <p className="text-lg font-bold text-[#FFC800] mb-2">
                {locale === 'ar' ? titleAr : titleEn}
              </p>
              <p className="text-slate-500 text-sm mb-6">
                {locale === 'ar'
                  ? `وصلت للمستوى ${level}! استمر في التقدم.`
                  : `You reached level ${level}! Keep going.`}
              </p>

              <Button onClick={onClose} fullWidth size="lg" className="shadow-lg">
                {locale === 'ar' ? 'رائع!' : 'Awesome!'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
