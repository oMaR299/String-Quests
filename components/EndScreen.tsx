
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Star, Target, Award } from 'lucide-react';
import { Button } from './Button';
import { PinkDiamondIcon } from './ui/PinkDiamondIcon';
import { useSounds } from '../hooks/useSounds';

interface EndScreenProps {
  score: number;
  maxScore: number;
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, maxScore, onRestart }) => {
  const { playCelebration } = useSounds();
  
  useEffect(() => {
    playCelebration();
  }, [playCelebration]);

  const percentage = (score / maxScore) * 100;
  
  let message = "";
  let title = "";
  
  if (percentage >= 90) {
    title = "أداء أسطوري!";
    message = "أنت موسوعة متحركة، أحسنت صنعاً!";
  } else if (percentage >= 70) {
    title = "عمل رائع!";
    message = "معلوماتك ممتازة، استمر في التقدم.";
  } else if (percentage >= 50) {
    title = "بداية جيدة!";
    message = "لديك أساس جيد، حاول مرة أخرى لتحسين النتيجة.";
  } else {
    title = "حاول مرة أخرى";
    message = "لا تيأس، التعلم يأتي من المحاولة!";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative z-10 p-4">
      {/* Confetti Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
           {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-[-20px] w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  background: ['#60A5FA', '#A78BFA', '#F472B6', '#FBBF24'][i % 4],
                }}
                animate={{ 
                  y: '120vh', 
                  x: Math.random() * 200 - 100,
                  rotate: 360,
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4, 
                  ease: "linear", 
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              />
           ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12 max-w-md w-full relative z-10 text-center"
      >
         <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-400/40 border-4 border-white">
                <Trophy className="text-white w-12 h-12" />
            </div>
         </div>

         <div className="mt-10 mb-8">
            <h2 className="text-3xl font-black text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 font-medium">{message}</p>
         </div>

         {/* Score Card */}
         <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><PinkDiamondIcon className="w-24 h-24" /></div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">النتيجة النهائية</div>
            <div className="flex items-center justify-center gap-1 leading-none relative z-10">
                <span className="text-6xl font-black text-slate-800">{Math.round(score)}</span>
                <span className="text-2xl font-bold text-slate-400 self-end mb-2">/{maxScore}</span>
            </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
                <Target className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-2xl font-bold text-slate-800">{Math.round(percentage)}%</span>
                <span className="text-xs text-slate-500 font-bold">الدقة</span>
             </div>
             <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col items-center">
                <PinkDiamondIcon className="w-6 h-6 mb-1" />
                <span className="text-2xl font-bold text-slate-800">+{score * 5}</span>
                <span className="text-xs text-slate-500 font-bold">نقاط الخبرة</span>
             </div>
         </div>

         <Button onClick={onRestart} fullWidth size="lg" className="shadow-xl shadow-blue-500/20">
            <RotateCcw className="w-5 h-5 ml-2" />
            إلعب مرة أخرى
         </Button>
      </motion.div>
    </div>
  );
};

export default EndScreen;
