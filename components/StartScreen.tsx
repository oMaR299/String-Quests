
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, BrainCircuit, HelpCircle, Flame, Target, Info,
} from 'lucide-react';
import { Button } from './Button';
import { GameRulesModal } from './GameRulesModal';
import { BoostIcon } from './BoostIcon';
import { InfoHelpModal } from './InfoHelpModal';
import { PinkDiamondIcon } from './ui/PinkDiamondIcon';
import { useUser } from '../contexts/UserContext';

const StartScreen: React.FC = () => {
  const { state, accuracy } = useUser();
  const navigate = useNavigate();
  const { xp: totalXP, currentStreak: streak, totalBoosts } = state;
  const [showRules, setShowRules] = useState(false);
  const [infoConfig, setInfoConfig] = useState<{open: boolean, title: string, desc: string, icon?: React.ReactNode}>({
      open: false, title: '', desc: ''
  });

  const openInfo = (title: string, desc: string, icon: React.ReactNode) => {
      setInfoConfig({ open: true, title, desc, icon });
  };

  const stats = [
      {
        icon: <PinkDiamondIcon className="w-5 h-5" />,
        label: "مجموع النقاط",
        value: totalXP.toLocaleString(),
        color: "bg-pink-50 border-pink-100 text-pink-600",
        desc: "النقاط التي جمعتها من حل التمارين وإكمال المهام."
      },
      {
        icon: <Target className="w-5 h-5 text-blue-500" />,
        label: "الدقة",
        value: `${accuracy}%`,
        color: "bg-blue-50 border-blue-100 text-blue-600",
        desc: "نسبة إجاباتك الصحيحة من إجمالي محاولاتك."
      },
      {
        icon: <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />,
        label: "حماس يومي",
        value: streak,
        color: "bg-orange-50 border-orange-100 text-orange-600",
        desc: "عدد الأيام المتتالية التي لعبت فيها دون انقطاع."
      },
      {
        icon: <BoostIcon className="w-5 h-5" />,
        label: "المعززات",
        value: totalBoosts,
        color: "bg-purple-50 border-purple-100 text-purple-600",
        desc: "معززات يمكنك استخدامها لمضاعفة نقاطك."
      }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative z-10 pb-12">
      <InfoHelpModal
        isOpen={infoConfig.open}
        onClose={() => setInfoConfig({...infoConfig, open: false})}
        title={infoConfig.title}
        description={infoConfig.desc}
        icon={infoConfig.icon}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative w-full max-w-md"
      >
        {/* Floating Decorative Cards behind */}
        <motion.div
            animate={{ rotate: -6, x: -20 }}
            className="absolute inset-0 bg-blue-100 rounded-[3rem] -z-10 opacity-60"
        />
        <motion.div
            animate={{ rotate: 6, x: 20 }}
            className="absolute inset-0 bg-purple-100 rounded-[3rem] -z-10 opacity-60"
        />

        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white w-full text-center">

          {/* Hero Icon */}
          <motion.div
            className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3"
            whileHover={{ rotate: 0, scale: 1.05 }}
          >
            <BrainCircuit className="text-white w-10 h-10" />
          </motion.div>

          <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">تحدي المعرفة</h1>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
              {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => openInfo(stat.label, stat.desc, stat.icon)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${stat.color} shadow-sm cursor-pointer hover:shadow-md transition-shadow relative group`}
                  >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info className="w-3 h-3" />
                      </div>
                      <div className="flex items-center gap-2 mb-1 opacity-80">
                          {stat.icon}
                          <span className="text-[10px] font-bold uppercase tracking-wide">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                  </motion.div>
              ))}
          </div>

          {/* Action Button */}
          <Button onClick={() => navigate('/learn')} size="lg" fullWidth className="text-lg group mb-4 shadow-xl shadow-slate-800/20">
            <span className="relative z-10 flex items-center gap-2">
                ابـدأ رحلة اليوم
                <Play className="w-5 h-5 fill-current group-hover:translate-x-[-4px] transition-transform" />
            </span>
          </Button>

          {/* Tutorial Link */}
          <button
            onClick={() => setShowRules(true)}
            className="text-slate-400 hover:text-blue-500 font-bold text-sm flex items-center justify-center gap-2 transition-colors mx-auto py-2 px-4 hover:bg-blue-50 rounded-xl w-full"
          >
            <HelpCircle className="w-4 h-4" />
            كيف ألعب؟
          </button>

        </div>
      </motion.div>

      {/* Rules Modal */}
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default StartScreen;
