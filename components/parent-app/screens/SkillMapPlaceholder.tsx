// SkillMapPlaceholder.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Splash for the Skill Map tab. Includes a secondary CTA that deep-links to
// the existing student-facing /skill-map route as a temporary jump-off (v2
// builds a dedicated parent-tuned view).

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Network, Target, Layers, TrendingUp } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { PrimaryButton } from '../../parent-onboarding/PrimaryButton';

export const SkillMapPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  return (
    <div className="flex flex-col items-center text-center px-6 pt-10 pb-6 min-h-full">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 22 }}
        className="w-24 h-24 rounded-full bg-duo-blue-light inline-flex items-center justify-center shadow-[0_4px_0_0_#1899D6] mb-5"
      >
        <Network className="w-12 h-12 text-duo-blue" strokeWidth={2.5} />
      </motion.div>

      <h1 className="text-2xl font-black text-slate-800 leading-tight mb-2">
        {t('parentApp.skillMap.headline')}
      </h1>
      <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-[28ch] mb-6">
        {t('parentApp.skillMap.value')}
      </p>

      <div className="w-full space-y-2 mb-6">
        <FeatureBullet icon={Target} text={t('parentApp.skillMap.feature1')} />
        <FeatureBullet icon={Layers} text={t('parentApp.skillMap.feature2')} />
        <FeatureBullet icon={TrendingUp} text={t('parentApp.skillMap.feature3')} />
      </div>

      <div className="w-full max-w-[280px] space-y-3 mt-auto">
        <PrimaryButton onClick={() => navigate('/skill-map')}>
          {t('parentApp.skillMap.openFull')}
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => navigate('/parent/home')}>
          {t('parentApp.common.backToHome')}
        </PrimaryButton>
      </div>
    </div>
  );
};

interface FeatureBulletProps {
  icon: React.ElementType;
  text: string;
}

const FeatureBullet: React.FC<FeatureBulletProps> = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/85 border border-white">
    <div className="w-8 h-8 rounded-full bg-duo-blue-light inline-flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-duo-blue" strokeWidth={2.5} />
    </div>
    <span className="flex-1 text-start text-sm font-extrabold text-slate-700 leading-snug">{text}</span>
  </div>
);

export default SkillMapPlaceholder;
