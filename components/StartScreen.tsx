import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { GameRulesModal } from './GameRulesModal';
import { ContinueLearningCard } from './home/ContinueLearningCard';
import { TopicGrid } from './home/TopicGrid';
import { DailyQuestCard } from './home/DailyQuestCard';
import { useI18n } from '../contexts/I18nContext';

const StartScreen: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const { t } = useI18n();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-12 relative z-10">
      {/* Continue where you left off */}
      <ContinueLearningCard />

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

      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default StartScreen;
