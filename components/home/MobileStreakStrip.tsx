import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Zap, CheckCircle2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useI18n } from '../../contexts/I18nContext';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { DAILY_GOALS } from '../../data/levelThresholds';
import { computeWeekDays } from '../../utils/weekDays';

export const MobileStreakStrip: React.FC = () => {
  const { state } = useUser();
  const { t } = useI18n();
  const navigate = useNavigate();

  const weekDays = useMemo(
    () => computeWeekDays(state.currentStreak, state.lastActiveDate),
    [state.currentStreak, state.lastActiveDate]
  );

  const dailyGoalTarget = DAILY_GOALS[state.dailyGoalTier];
  const dailyProgress = Math.min(Math.round((state.dailyXP / dailyGoalTarget) * 100), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => navigate('/profile')}
      className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-3 sm:p-4 text-white border border-white/10 shadow-lg cursor-pointer"
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-lg font-black text-orange-400">{state.currentStreak}</span>
          <span className="text-[10px] font-bold text-slate-400">{t('home.streak_days')}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/15 shrink-0">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-black text-yellow-400">{state.xp}</span>
          <span className="text-[9px] font-bold text-slate-500">XP</span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 rounded-lg border border-pink-500/15 shrink-0">
          <PinkDiamondIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-black text-pink-300">{state.gems}</span>
        </div>

        {/* Weekly dots */}
        <div className="flex items-center gap-1 shrink-0">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full text-[7px] font-bold flex items-center justify-center
                ${d.status === 'done'
                  ? 'bg-orange-500 text-white'
                  : d.status === 'current'
                    ? 'border border-orange-400 text-orange-400'
                    : 'bg-white/10 text-slate-500'
                }`}
            >
              {d.status === 'done' ? (
                <CheckCircle2 className="w-2.5 h-2.5" />
              ) : (
                d.day
              )}
            </div>
          ))}
        </div>

        {/* Daily goal mini-bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[80px]">
          <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-emerald-400/70">{dailyProgress}%</span>
        </div>
      </div>
    </motion.div>
  );
};
