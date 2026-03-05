import React from 'react';
import { Heart, Flame } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useI18n } from '../contexts/I18nContext';
import { PinkDiamondIcon } from '../components/ui/PinkDiamondIcon';

export const TopBar: React.FC = () => {
  const { state, level, xpInLevel, xpForNextLevel } = useUser();
  const { locale, toggleLocale } = useI18n();

  const xpProgress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 0;

  return (
    <header
      className="
        sticky top-0 z-20
        bg-white/80 backdrop-blur-xl border-b border-slate-100
        h-14 md:h-16 shrink-0
        flex items-center justify-between
        px-4 md:px-6
      "
    >
      {/* Left Group: Hearts, Gems, Streak */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Hearts Display */}
        <div className="flex items-center gap-1" title={`${state.hearts}/${state.maxHearts}`}>
          {Array.from({ length: state.maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-200 ${
                i < state.hearts
                  ? 'text-duo-red fill-duo-red'
                  : 'text-slate-300 fill-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Gems Display */}
        <div className="flex items-center gap-1.5">
          <PinkDiamondIcon className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-sm md:text-base font-black text-slate-700">
            {state.gems}
          </span>
        </div>

        {/* Streak Display */}
        <div className="flex items-center gap-1">
          <Flame className="w-5 h-5 md:w-6 md:h-6 text-[#FF9600]" />
          <span className="text-sm md:text-base font-black text-[#FF9600]">
            {state.currentStreak}
          </span>
        </div>
      </div>

      {/* Right Group: XP Bar + Language Toggle */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* XP Progress Bar (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-[180px]">
            {/* Level badge */}
            <span className="bg-duo-blue text-white text-xs font-black px-2 py-0.5 rounded-full shrink-0">
              {level}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-duo-blue to-duo-green rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>

            {/* XP numbers */}
            <span className="text-[11px] font-bold text-slate-400 shrink-0 tabular-nums">
              {xpInLevel}/{xpForNextLevel}
            </span>
          </div>
        </div>

        {/* Language Toggle Pill */}
        <button
          onClick={toggleLocale}
          className="
            flex items-center gap-1
            px-3 py-1.5 rounded-full
            bg-slate-100 hover:bg-slate-200
            text-xs font-bold text-slate-600
            transition-colors duration-150
            border border-slate-200
          "
        >
          <span className={locale === 'ar' ? 'font-black text-duo-blue' : ''}>
            عربي
          </span>
          <span className="text-slate-300">|</span>
          <span className={locale === 'en' ? 'font-black text-duo-blue' : ''}>
            EN
          </span>
        </button>
      </div>
    </header>
  );
};
