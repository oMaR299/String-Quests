import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Lock, Target, HelpCircle, Zap } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useI18n } from '../../contexts/I18nContext';
import { PinkDiamondIcon } from '../ui/PinkDiamondIcon';
import { DAILY_GOALS } from '../../data/levelThresholds';
import { computeWeekDays } from '../../utils/weekDays';
import { StreakShieldBadge } from '../streak/StreakShieldBadge';
import { RestoreStreakButton } from '../streak/RestoreStreakButton';

export const StreakWidget: React.FC = () => {
  const { state } = useUser();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const weekDays = useMemo(
    () => computeWeekDays(state.currentStreak, state.lastActiveDate),
    [state.currentStreak, state.lastActiveDate]
  );

  const dailyGoalTarget = DAILY_GOALS[state.dailyGoalTier];
  const dailyProgress = Math.min(Math.round((state.dailyXP / dailyGoalTarget) * 100), 100);
  const accuracy = state.stats.total > 0
    ? Math.round((state.stats.correct / state.stats.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => navigate('/profile')}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="sticky top-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/30 cursor-pointer border border-white/10"
    >
      {/* Background decoration */}
      <div className="absolute top-0 end-0 w-40 h-40 bg-orange-500/8 rounded-full blur-[60px] pointer-events-none" />

      {/* Streak Shield owned-count chip — top-end corner, RTL-aware (end-*).
          Stops click propagation so it doesn't navigate to /profile. */}
      <div
        className="absolute top-3 end-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <StreakShieldBadge />
      </div>

      {/* ── Section 1: Streak Count ── */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Flame icon */}
          <div className="relative shrink-0">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-orange-500/40 blur-[12px] rounded-full"
            />
            <motion.div
              animate={{ y: [0, -3, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <Flame
                className="w-10 h-10"
                style={{ fill: 'url(#sidebarFlameGrad)', color: 'transparent' }}
              />
              <svg width="0" height="0">
                <linearGradient id="sidebarFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DC2626" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FACC15" />
                </linearGradient>
              </svg>
            </motion.div>
          </div>

          {/* Count + label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-400 tracking-tight leading-none">
                {state.currentStreak}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {t('home.streak_days')}
              </span>
            </div>
          </div>
        </div>

        {/* XP & Gems row */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/15">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-sm font-black text-yellow-400">{state.xp}</span>
            <span className="text-[10px] font-bold text-slate-500">XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-pink-500/10 rounded-lg border border-pink-500/15">
            <PinkDiamondIcon className="w-3.5 h-3.5" />
            <span className="text-sm font-black text-pink-300">{state.gems}</span>
          </div>
        </div>

        {/* Phoenix CTA — only renders when streak is broken-yesterday AND ≥1 owned.
            Stop propagation so the button click doesn't bubble to navigate('/profile'). */}
        <div onClick={(e) => e.stopPropagation()}>
          <RestoreStreakButton />
        </div>
      </div>

      {/* ── Section 2: Weekly Tracker ── */}
      <div className="px-5 pb-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all
                    ${
                      d.status === 'done'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30'
                        : d.status === 'current'
                          ? 'bg-transparent text-orange-400 border-orange-400 animate-pulse'
                          : 'bg-white/5 text-slate-500 border-transparent'
                    }
                  `}
                >
                  {d.status === 'done' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : d.status === 'locked' ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : (
                    d.day
                  )}
                </div>
                <span className="text-[8px] font-bold text-slate-500">
                  {locale === 'ar' ? d.label : d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Daily XP Progress ── */}
      <div className="px-5 pb-4 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400">
            {t('home.streak_daily_goal')}
          </span>
          <span className="text-[11px] font-black text-slate-300">
            {state.dailyXP} / {dailyGoalTarget}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dailyProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
          />
        </div>
        <div className="text-end mt-1">
          <span className="text-[10px] font-bold text-emerald-400/70">
            {dailyProgress}%
          </span>
        </div>
      </div>

      {/* ── Section 4: Stats ── */}
      <div className="px-5 pb-5 border-t border-white/5 pt-4">
        <div className="grid grid-cols-2 gap-2">
          {/* Accuracy */}
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {t('home.streak_accuracy')}
              </span>
            </div>
            <span className="text-lg font-black text-slate-200">
              {accuracy}%
            </span>
          </div>

          {/* Total Questions */}
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <HelpCircle className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {t('home.streak_total')}
              </span>
            </div>
            <span className="text-lg font-black text-slate-200">
              {state.stats.total}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
