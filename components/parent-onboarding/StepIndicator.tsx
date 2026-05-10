// StepIndicator.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Four-dot horizontal progress for the onboarding flow. The dots are laid
// out logically (start → end), so they read correctly in both RTL and LTR.
// Active = duo-blue, completed = duo-green w/ checkmark, upcoming = slate.

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STEP_ORDER, stepIndex, type OnboardingStep } from './useParentOnboardingState';

interface StepIndicatorProps {
  current: OnboardingStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ current }) => {
  const activeIdx = stepIndex(current);

  return (
    <div className="w-full flex items-center justify-center gap-2 py-2" aria-label="Onboarding progress">
      {STEP_ORDER.map((step, idx) => {
        const isActive = idx === activeIdx;
        const isComplete = idx < activeIdx;

        const base = 'flex items-center justify-center transition-all duration-300 rounded-full';
        let sizing: string;
        let palette: string;

        if (isActive) {
          sizing = 'w-8 h-2.5';
          palette = 'bg-duo-blue shadow-[0_0_12px_rgba(28,176,246,0.5)]';
        } else if (isComplete) {
          sizing = 'w-5 h-5';
          palette = 'bg-duo-green text-white shadow-sm';
        } else {
          sizing = 'w-2.5 h-2.5';
          palette = 'bg-slate-300';
        }

        return (
          <motion.div
            key={step}
            initial={false}
            animate={{ scale: isActive ? 1 : 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`${base} ${sizing} ${palette}`}
          >
            {isComplete && <Check className="w-3 h-3" strokeWidth={3} />}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
