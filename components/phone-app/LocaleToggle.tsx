// AR | EN locale toggle for the Phone App onboarding (screen 1 only).
// Plain text-toggle — active language gets an underline in the screen accent
// (mint by default). No glass.

import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';

export const LocaleToggle: React.FC = () => {
  const { locale, toggleLocale } = useI18n();

  return (
    <motion.button
      type="button"
      onClick={toggleLocale}
      aria-label={`Toggle language (currently ${locale.toUpperCase()})`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-4 start-4 z-30 inline-flex items-center gap-2 select-none text-[12px] font-extrabold tracking-wide text-phone-ink"
    >
      <span className={
        locale === 'ar'
          ? 'text-phone-mint-600 underline decoration-phone-mint-500 decoration-[3px] underline-offset-[6px]'
          : 'text-phone-stone'
      }>
        AR
      </span>
      <span className="text-slate-300">/</span>
      <span className={
        locale === 'en'
          ? 'text-phone-mint-600 underline decoration-phone-mint-500 decoration-[3px] underline-offset-[6px]'
          : 'text-phone-stone'
      }>
        EN
      </span>
    </motion.button>
  );
};

export default LocaleToggle;
