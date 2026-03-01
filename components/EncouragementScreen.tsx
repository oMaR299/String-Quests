import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface EncouragementScreenProps {
  onContinue: () => void;
  currentCount: number;
}

const EncouragementScreen: React.FC<EncouragementScreenProps> = ({ onContinue, currentCount }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <Sparkles className="w-10 h-10 animate-pulse" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">استراحة محارب! ☕</h2>
        <p className="text-slate-500 text-lg mb-8 font-medium">
            لقد أتممت {currentCount} أسئلة بنجاح. خذ نفساً عميقاً واستعد للجولة القادمة.
        </p>

        <Button onClick={onContinue} size="lg" fullWidth variant="primary">
          <span>أكمل التحدي</span>
          <ArrowLeft className="w-5 h-5 mr-1" />
        </Button>
      </motion.div>
    </div>
  );
};

export default EncouragementScreen;