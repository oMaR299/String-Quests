import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { GameRulesModal } from './GameRulesModal';
import { PracticeModeCard } from './home/PracticeModeCard';
import { ShopCard } from './home/ShopCard';
import { DailyChallengeCard } from './home/DailyChallengeCard';
import { WeeklyChampionCard } from './home/WeeklyChampionCard';
import { StreakWidget } from './home/StreakWidget';
import { MobileStreakStrip } from './home/MobileStreakStrip';
import { TopicGrid } from './home/TopicGrid';
import { DailyQuestCard } from './home/DailyQuestCard';
import { useI18n } from '../contexts/I18nContext';

const StartScreen: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const { t } = useI18n();

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-12 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-6 lg:gap-8">
        {/* Main content column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Game mode cards */}
          <PracticeModeCard />

          {/* Stardust Shop entry */}
          <ShopCard />

          {/* Mobile/Tablet streak strip */}
          <div className="lg:hidden">
            <MobileStreakStrip />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DailyChallengeCard />
            <WeeklyChampionCard />
          </div>

          {/* Browse all topics */}
          <TopicGrid />

          {/* Next recommended quest */}
          <DailyQuestCard />

          {/* How to play link */}
          <button
            onClick={() => setShowRules(true)}
            className="text-slate-400 hover:text-blue-500 font-bold text-sm flex items-center justify-center gap-2 transition-colors mx-auto py-2 px-4 hover:bg-blue-50 rounded-xl w-full"
          >
            <HelpCircle className="w-4 h-4" />
            {t('home.how_to_play')}
          </button>
        </div>

        {/* Sidebar: Streak widget (desktop only) */}
        <div className="hidden lg:block">
          <StreakWidget />
        </div>
      </div>

      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default StartScreen;
