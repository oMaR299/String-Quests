import React from 'react';
import { motion } from 'framer-motion';
import { Infinity } from 'lucide-react';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { useI18n } from '../../contexts/I18nContext';

export const PracticeModeCard: React.FC = () => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
    >
      {/* Outer glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2A1B3D] via-[#DA43D0]/30 to-[#44318D] rounded-[1.5rem] sm:rounded-[2rem] blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-[#2A1B3D] to-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 overflow-hidden border border-white/10 shadow-2xl">
        {/* Decorative background blurs */}
        <div className="absolute top-0 end-0 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-[200px] h-[200px] bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-5 relative z-10">
          {/* Infinity icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(218,67,208,0.15)] border border-white/20 shrink-0 group-hover:rotate-12 transition-transform duration-700">
            <div className="absolute -top-0.5 -end-0.5 sm:-top-1 sm:-end-1 animate-bounce">
              <PinkDiamondIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <Infinity className="w-6 h-6 sm:w-8 sm:h-8 text-pink-200 drop-shadow-[0_0_10px_rgba(249,168,212,0.5)]" />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <PinkDiamondIcon className="w-2.5 h-2.5" />
                {t('home.practice_mode_badge')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-1 tracking-tight">
              {t('home.practice_mode_title')}
            </h3>
            <p className="text-indigo-200/80 text-xs sm:text-sm font-medium line-clamp-2">
              {t('home.practice_mode_desc')}
            </p>
          </div>

          {/* Coming Soon tag */}
          <div className="shrink-0">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-400/90 text-amber-900 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm">
              {t('home.coming_soon')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
