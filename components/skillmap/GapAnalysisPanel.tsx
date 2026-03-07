import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ChevronDown, BookOpen, TrendingUp, Brain, Target, CheckCircle } from 'lucide-react';
import { GapItem } from '../../utils/masteryEngine';

interface Props {
  isOpen: boolean;
  gaps: GapItem[];
  locale: string;
  onClose: () => void;
  onPractice: (subject: string, lesson: string) => void;
}

type GapReason = GapItem['reason'];

interface ReasonConfig {
  label: { ar: string; en: string };
  icon: React.ElementType;
  color: string;       // accent text color
  bgColor: string;     // section header bg
  borderColor: string; // item border
  badgeBg: string;     // badge background
  badgeText: string;   // badge text color
}

const REASON_CONFIG: Record<GapReason, ReasonConfig> = {
  never_attempted: {
    label: { ar: 'لم يتم المحاولة', en: 'Never Attempted' },
    icon: Target,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
  },
  low_accuracy: {
    label: { ar: 'دقة منخفضة', en: 'Low Accuracy' },
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-600',
  },
  declining: {
    label: { ar: 'أداء متراجع', en: 'Declining Performance' },
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-600',
  },
  bloom_ceiling: {
    label: { ar: 'سقف بلوم', en: "Bloom's Ceiling" },
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-600',
  },
};

const REASON_ORDER: GapReason[] = ['never_attempted', 'low_accuracy', 'declining', 'bloom_ceiling'];

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
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const CollapsibleSection: React.FC<{
  reason: GapReason;
  items: GapItem[];
  locale: string;
  onPractice: (subject: string, lesson: string) => void;
}> = ({ reason, items, locale, onPractice }) => {
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
              {items.map((gap, index) => (
                <motion.div
                  key={`${gap.skill.questionId}-${index}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-xl border ${config.borderColor} bg-white`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {locale === 'ar' ? gap.skill.skillNameAr : gap.skill.skillNameEn}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {gap.skill.subject} &middot; {gap.skill.lesson}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {locale === 'ar'
                        ? gap.detail === 'No attempts yet' ? 'لا محاولات بعد'
                          : gap.detail === 'Performance declining' ? 'الأداء في تراجع'
                          : gap.detail.endsWith('% accuracy') ? `${gap.detail.replace('% accuracy', '')}% دقة`
                          : gap.detail
                        : gap.detail}
                    </p>
                    {reason === 'low_accuracy' && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${Math.min(100, gap.mastery.masteryScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-red-500">
                          {gap.mastery.masteryScore}%
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onPractice(gap.skill.subject, gap.skill.lesson)}
                    className={`ml-3 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      reason === 'never_attempted'
                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                        : 'bg-[#1CB0F6] text-white hover:bg-[#1A9FE0]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {reason === 'never_attempted'
                      ? (locale === 'ar' ? 'ابدأ' : 'Start')
                      : (locale === 'ar' ? 'تدرب' : 'Practice')
                    }
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GapAnalysisPanel: React.FC<Props> = ({ isOpen, gaps, locale, onClose, onPractice }) => {
  // Group gaps by reason
  const groupedGaps = REASON_ORDER.reduce<Record<GapReason, GapItem[]>>(
    (acc, reason) => {
      acc[reason] = gaps.filter(g => g.reason === reason);
      return acc;
    },
    { never_attempted: [], low_accuracy: [], declining: [], bloom_ceiling: [] }
  );

  // Filter out empty groups
  const nonEmptyGroups = REASON_ORDER.filter(r => groupedGaps[r].length > 0);

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
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">
                        {locale === 'ar' ? 'تحليل الفجوات' : 'Gap Analysis'}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">
                        {locale === 'ar'
                          ? `${gaps.length} فجوة تحتاج اهتمامك`
                          : `${gaps.length} gap${gaps.length !== 1 ? 's' : ''} need${gaps.length === 1 ? 's' : ''} attention`
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
                {gaps.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {locale === 'ar' ? 'لا توجد فجوات!' : 'No gaps found!'}
                    </h3>
                    <p className="text-sm text-slate-400 max-w-xs">
                      {locale === 'ar'
                        ? 'أداؤك ممتاز في جميع المهارات. استمر!'
                        : "You're doing great across all skills. Keep it up!"
                      }
                    </p>
                  </motion.div>
                ) : (
                  /* Gap Sections */
                  <div className="space-y-4">
                    {nonEmptyGroups.map((reason) => (
                      <CollapsibleSection
                        key={reason}
                        reason={reason}
                        items={groupedGaps[reason]}
                        locale={locale}
                        onPractice={onPractice}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
