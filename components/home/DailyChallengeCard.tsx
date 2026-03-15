import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { useI18n } from '../../contexts/I18nContext';

export const DailyChallengeCard: React.FC = () => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.05 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="relative group cursor-pointer"
    >
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-white shadow-xl shadow-slate-500/10 border border-white/10 overflow-hidden min-h-[180px] sm:min-h-[220px] flex flex-col justify-between">
        {/* Calendar watermark */}
        <div className="absolute top-4 end-4 opacity-[0.07] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Calendar className="w-20 h-20 sm:w-28 sm:h-28" />
        </div>

        <div className="relative z-10">
          {/* Status badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 mb-3 sm:mb-4">
            <span className="text-[10px] font-bold text-slate-300">
              {t('home.daily_challenge_empty')}
            </span>
          </div>

          {/* Icon */}
          <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 border border-white/15">
            <Calendar className="w-5.5 h-5.5 text-white/80" />
          </div>

          {/* Title & description */}
          <h3 className="text-lg sm:text-xl font-black mb-1">
            {t('home.daily_challenge_title')}
          </h3>
          <p className="text-slate-400 font-medium text-xs">
            {t('home.daily_challenge_empty')}
          </p>
        </div>

        {/* Bottom: gem count + progress */}
        <div className="relative z-10 flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/10">
            <PinkDiamondIcon className="w-3.5 h-3.5" />
            <span>0</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-slate-600/50 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-white/60 rounded-full" />
            </div>
            <span className="text-[10px] font-bold text-slate-400">0%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
