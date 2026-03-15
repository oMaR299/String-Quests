import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { useI18n } from '../../contexts/I18nContext';

export const WeeklyChampionCard: React.FC = () => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="relative group cursor-pointer"
    >
      <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-white shadow-xl shadow-purple-500/20 border border-white/15 overflow-hidden min-h-[180px] sm:min-h-[220px] flex flex-col justify-between">
        {/* Trophy watermark */}
        <div className="absolute top-4 end-4 opacity-[0.1] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Trophy className="w-20 h-20 sm:w-28 sm:h-28" />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 border border-white/25">
            <Trophy className="w-5.5 h-5.5 text-white" />
          </div>

          {/* Title & description */}
          <h3 className="text-lg sm:text-xl font-black mb-1">
            {t('home.weekly_champion_title')}
          </h3>
          <p className="text-purple-100/80 font-medium text-xs">
            {t('home.weekly_champion_desc')}
          </p>
        </div>

        {/* Bottom: gems + coming soon */}
        <div className="relative z-10 flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/10">
            <PinkDiamondIcon className="w-3.5 h-3.5" />
            <span>2000</span>
          </div>
          <span className="px-2.5 py-1 bg-amber-400/90 text-amber-900 rounded-lg text-[11px] font-bold shadow-sm">
            {t('home.coming_soon')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
