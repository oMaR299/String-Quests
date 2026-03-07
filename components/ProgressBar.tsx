import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between text-[10px] uppercase tracking-wider font-black text-slate-400 mb-2 px-2">
        <span>التقدم</span>
        <span dir="ltr" className="font-sans text-slate-500">{current + 1} / {total}</span>
      </div>
      <div className="h-4 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden relative border border-white shadow-inner">
        <motion.div
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-[#58CC02] via-[#4CAF00] to-[#89E219] rounded-full shadow-[0_0_12px_rgba(88,204,2,0.35)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
        >
             {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;