import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, CheckCircle, Brain } from 'lucide-react';
import { SkillMastery } from '../../utils/masteryEngine';
import { BLOOM_LABELS, BloomLevel } from '../../data/skillTaxonomy';

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onSelectSkill: (skill: SkillMastery) => void;
}

type UrgencyLevel = 'today' | 'thisWeek' | 'later';

interface MemoryItem {
  mastery: SkillMastery;
  retention: number;          // 0-100 estimated current retention
  predictedForgetDate: Date;
  urgency: UrgencyLevel;
  daysSinceLastReview: number;
}

// Simple forgetting curve: retention = e^(-t/S) where S is stability
// Stability increases with more correct reviews
function calculateRetention(mastery: SkillMastery): number {
  if (mastery.attemptCount === 0 || !mastery.lastAttemptAt) return 0;

  const now = Date.now();
  const daysSince = (now - mastery.lastAttemptAt) / (1000 * 60 * 60 * 24);

  // Stability: more attempts and higher accuracy = slower forgetting
  const baseSt = 2; // base stability in days
  const accuracyBonus = (mastery.metrics.accuracy / 100) * 5;
  const repeatBonus = Math.min(mastery.attemptCount, 10) * 0.8;
  const stability = baseSt + accuracyBonus + repeatBonus;

  // Exponential decay
  const retention = Math.exp(-daysSince / stability) * 100;
  return Math.max(0, Math.min(100, Math.round(retention)));
}

// Predict when retention drops below 50%
function predictForgettingDate(mastery: SkillMastery): Date {
  if (!mastery.lastAttemptAt) return new Date();

  const baseSt = 2;
  const accuracyBonus = (mastery.metrics.accuracy / 100) * 5;
  const repeatBonus = Math.min(mastery.attemptCount, 10) * 0.8;
  const stability = baseSt + accuracyBonus + repeatBonus;

  // Solve: 0.5 = e^(-t/S) => t = S * ln(2)
  const daysUntilForget = stability * Math.log(2);
  const forgetTime = mastery.lastAttemptAt + daysUntilForget * 24 * 60 * 60 * 1000;
  return new Date(forgetTime);
}

function getUrgency(forgetDate: Date): UrgencyLevel {
  const now = new Date();
  const diffDays = (forgetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0) return 'today';
  if (diffDays <= 7) return 'thisWeek';
  return 'later';
}

const URGENCY_CONFIG: Record<UrgencyLevel, {
  labelEn: string;
  labelAr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  today: {
    labelEn: 'Review Today',
    labelAr: 'راجع اليوم',
    color: '#FF4B4B',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
    icon: AlertTriangle,
  },
  thisWeek: {
    labelEn: 'Review This Week',
    labelAr: 'راجع هذا الأسبوع',
    color: '#FFC800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    icon: Clock,
  },
  later: {
    labelEn: 'Review Later',
    labelAr: 'راجع لاحقاً',
    color: '#58CC02',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    icon: CheckCircle,
  },
};

export const MemoryTimelineView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  const memoryItems = useMemo(() => {
    return masteries
      .filter(m => m.attemptCount > 0)
      .map(m => {
        const retention = calculateRetention(m);
        const forgetDate = predictForgettingDate(m);
        const daysSince = m.lastAttemptAt
          ? Math.round((Date.now() - m.lastAttemptAt) / (1000 * 60 * 60 * 24))
          : 0;
        return {
          mastery: m,
          retention,
          predictedForgetDate: forgetDate,
          urgency: getUrgency(forgetDate),
          daysSinceLastReview: daysSince,
        } as MemoryItem;
      })
      .sort((a, b) => a.retention - b.retention); // Most urgent first
  }, [masteries]);

  const grouped = useMemo(() => {
    const groups: Record<UrgencyLevel, MemoryItem[]> = {
      today: [],
      thisWeek: [],
      later: [],
    };
    for (const item of memoryItems) {
      groups[item.urgency].push(item);
    }
    return groups;
  }, [memoryItems]);

  const noData = memoryItems.length === 0;

  if (noData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-600 mb-2">
          {locale === 'ar' ? 'لا توجد بيانات للذاكرة' : 'No Memory Data'}
        </h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          {locale === 'ar'
            ? 'أكمل بعض الاختبارات أولاً لتتبع منحنى النسيان'
            : 'Complete some quizzes first to track your forgetting curves'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['today', 'thisWeek', 'later'] as UrgencyLevel[]).map(level => {
          const config = URGENCY_CONFIG[level];
          const Icon = config.icon;
          const count = grouped[level].length;
          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${config.bgColor} rounded-xl p-3 border ${config.borderColor} text-center`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: config.color }} />
              <div className="text-2xl font-black" style={{ color: config.color }}>{count}</div>
              <div className="text-[10px] font-bold text-slate-500">
                {locale === 'ar' ? config.labelAr : config.labelEn}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Urgency groups */}
      {(['today', 'thisWeek', 'later'] as UrgencyLevel[]).map(level => {
        const items = grouped[level];
        if (items.length === 0) return null;
        const config = URGENCY_CONFIG[level];
        const Icon = config.icon;

        return (
          <div key={level}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              <h3 className="text-sm font-bold text-slate-700">
                {locale === 'ar' ? config.labelAr : config.labelEn}
              </h3>
              <span className="text-xs text-slate-400 font-medium">({items.length})</span>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <motion.div
                  key={item.mastery.skill.questionId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${config.bgColor} ${config.borderColor}`}
                  style={{ opacity: Math.max(0.4, item.retention / 100) }}
                >
                  {/* Retention indicator */}
                  <div className="relative w-10 h-10 shrink-0">
                    <svg width={40} height={40} className="transform -rotate-90">
                      <circle cx={20} cy={20} r={16} fill="none" stroke="#e2e8f0" strokeWidth={3} />
                      <circle
                        cx={20} cy={20} r={16}
                        fill="none"
                        stroke={config.color}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 * (1 - item.retention / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-black" style={{ color: config.color }}>
                        {item.retention}%
                      </span>
                    </div>
                  </div>

                  {/* Skill info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 truncate">
                      {locale === 'ar' ? item.mastery.skill.skillNameAr : item.mastery.skill.skillNameEn}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">
                        {item.mastery.skill.subject}
                      </span>
                      <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">
                        {BLOOM_LABELS[item.mastery.skill.bloomLevel as BloomLevel]?.[locale === 'ar' ? 'ar' : 'en']}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {locale === 'ar'
                        ? `آخر مراجعة: ${item.daysSinceLastReview === 0 ? 'اليوم' : `منذ ${item.daysSinceLastReview} يوم`}`
                        : `Last reviewed: ${item.daysSinceLastReview === 0 ? 'today' : `${item.daysSinceLastReview}d ago`}`}
                    </div>
                  </div>

                  {/* Review button */}
                  <button
                    onClick={() => onSelectSkill(item.mastery)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-colors"
                    style={{ backgroundColor: config.color }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {locale === 'ar' ? 'راجع' : 'Review'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Memory health summary */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-500" />
          <h4 className="text-sm font-bold text-slate-700">
            {locale === 'ar' ? 'صحة الذاكرة' : 'Memory Health'}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
              {grouped.later.length > 0 && (
                <div
                  className="h-full"
                  style={{
                    width: `${(grouped.later.length / memoryItems.length) * 100}%`,
                    backgroundColor: '#58CC02',
                  }}
                />
              )}
              {grouped.thisWeek.length > 0 && (
                <div
                  className="h-full"
                  style={{
                    width: `${(grouped.thisWeek.length / memoryItems.length) * 100}%`,
                    backgroundColor: '#FFC800',
                  }}
                />
              )}
              {grouped.today.length > 0 && (
                <div
                  className="h-full"
                  style={{
                    width: `${(grouped.today.length / memoryItems.length) * 100}%`,
                    backgroundColor: '#FF4B4B',
                  }}
                />
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {Math.round(memoryItems.reduce((sum, i) => sum + i.retention, 0) / memoryItems.length)}%{' '}
            {locale === 'ar' ? 'متوسط الاحتفاظ' : 'avg retention'}
          </span>
        </div>
      </div>
    </div>
  );
};
