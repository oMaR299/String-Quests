import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, ChevronDown, Shield, Brain, Zap, Target, BookOpen } from 'lucide-react';
import { StrengthItem } from '../../utils/masteryEngine';

interface Props {
  isOpen: boolean;
  strengths: StrengthItem[];
  locale: string;
  onClose: () => void;
}

type StrengthReason = StrengthItem['reason'];

interface ReasonConfig {
  label: { ar: string; en: string };
  icon: React.ElementType;
  color: string;        // accent text
  bgColor: string;      // section header bg
  borderColor: string;  // item border
  badgeBg: string;      // badge bg
  badgeText: string;    // badge text
  scoreBg: string;      // mastery score badge bg
  scoreText: string;    // mastery score badge text
}

const REASON_CONFIG: Record<StrengthReason, ReasonConfig> = {
  consistently_strong: {
    label: { ar: 'أداء ثابت ومتميز', en: 'Consistently Strong' },
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-600',
    scoreBg: 'bg-emerald-100',
    scoreText: 'text-emerald-700',
  },
  fast_improving: {
    label: { ar: 'تحسن سريع', en: 'Fastest Improving' },
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-600',
    scoreBg: 'bg-blue-100',
    scoreText: 'text-blue-700',
  },
  natural_affinity: {
    label: { ar: 'ميول طبيعية', en: 'Natural Affinities' },
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-600',
    scoreBg: 'bg-amber-100',
    scoreText: 'text-amber-700',
  },
  cognitive_champion: {
    label: { ar: 'أبطال التفكير العميق', en: 'Cognitive Champions' },
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-600',
    scoreBg: 'bg-purple-100',
    scoreText: 'text-purple-700',
  },
};

const REASON_ORDER: StrengthReason[] = ['consistently_strong', 'fast_improving', 'natural_affinity', 'cognitive_champion'];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 320 } },
  exit: { opacity: 0, scale: 0.92, y: 30, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const CollapsibleSection: React.FC<{
  reason: StrengthReason;
  items: StrengthItem[];
  locale: string;
}> = ({ reason, items, locale }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = REASON_CONFIG[reason];
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 ${config.bgColor} transition-colors hover:brightness-95`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className={`text-sm font-bold ${config.color}`}>
            {locale === 'ar' ? config.label.ar : config.label.en}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
            {items.length}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      {/* Section Items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {items.map((strength, index) => (
                <motion.div
                  key={`${strength.skill.questionId}-${reason}-${index}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.06, type: 'spring', damping: 20, stiffness: 250 }}
                  className={`flex items-center justify-between p-3 rounded-xl border ${config.borderColor} bg-white`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {locale === 'ar' ? strength.skill.skillNameAr : strength.skill.skillNameEn}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {strength.skill.subject} &middot; {strength.skill.lesson}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {locale === 'ar'
                        ? strength.detail === 'High confidence + accuracy' ? 'ثقة عالية + دقة'
                          : strength.detail === 'Rapid improvement' ? 'تحسن سريع'
                          : strength.detail.endsWith('% accuracy') ? `${strength.detail.replace('% accuracy', '')}% دقة`
                          : strength.detail.startsWith("Bloom's level") ? `مستوى بلوم ${strength.detail.replace("Bloom's level ", '')}`
                          : strength.detail
                        : strength.detail}
                    </p>
                  </div>
                  {/* Mastery Score Badge */}
                  <div className={`ml-3 shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl ${config.scoreBg}`}>
                    <span className={`text-lg font-black ${config.scoreText}`}>
                      {strength.mastery.masteryScore}
                    </span>
                    <span className={`text-[9px] font-bold ${config.scoreText} opacity-70`}>
                      {locale === 'ar' ? 'إتقان' : 'mastery'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StrengthFinderPanel: React.FC<Props> = ({ isOpen, strengths, locale, onClose }) => {
  // Group strengths by reason
  const groupedStrengths = REASON_ORDER.reduce<Record<StrengthReason, StrengthItem[]>>(
    (acc, reason) => {
      acc[reason] = strengths.filter(s => s.reason === reason);
      return acc;
    },
    { consistently_strong: [], fast_improving: [], natural_affinity: [], cognitive_champion: [] }
  );

  // Filter out empty groups
  const nonEmptyGroups = REASON_ORDER.filter(r => groupedStrengths[r].length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-slate-100 rounded-t-[2.5rem]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">
                        {locale === 'ar' ? 'نقاط القوة' : 'Your Strengths'}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        {locale === 'ar'
                          ? `${strengths.length} نقطة قوة مكتشفة`
                          : `${strengths.length} strength${strengths.length !== 1 ? 's' : ''} discovered`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {strengths.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                      <Trophy className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {locale === 'ar' ? 'لم تُكتشف نقاط قوة بعد' : 'No strengths discovered yet'}
                    </h3>
                    <p className="text-sm text-slate-400 max-w-xs">
                      {locale === 'ar'
                        ? 'أكمل المزيد من الاختبارات لاكتشاف نقاط قوتك!'
                        : 'Complete more quizzes to discover your strengths!'
                      }
                    </p>
                  </motion.div>
                ) : (
                  /* Strength Sections */
                  <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.1 } },
                    }}
                  >
                    {nonEmptyGroups.map((reason) => (
                      <motion.div
                        key={reason}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <CollapsibleSection
                          reason={reason}
                          items={groupedStrengths[reason]}
                          locale={locale}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
