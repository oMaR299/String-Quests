// Top-end corner mute toggle for the Phone App onboarding.
// Solid white pill with a soft slate icon — no glassmorphism.

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useOnboardingState } from './useOnboardingState';
import { usePhoneAppI18n } from './phoneAppI18n';

export const MuteToggle: React.FC = () => {
  const { muted, toggleMute } = useOnboardingState();
  const { tp } = usePhoneAppI18n();
  const label = muted ? tp('mute.on') : tp('mute.off');

  return (
    <motion.button
      type="button"
      onClick={toggleMute}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="absolute top-4 end-4 z-30 w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-[0_2px_0_0_#CBD5E1] flex items-center justify-center text-slate-600 hover:text-phone-ink transition-colors active:translate-y-[1px] active:shadow-none"
    >
      {muted
        ? <VolumeX className="w-5 h-5" strokeWidth={2.6} />
        : <Volume2 className="w-5 h-5" strokeWidth={2.6} />}
    </motion.button>
  );
};

export default MuteToggle;
