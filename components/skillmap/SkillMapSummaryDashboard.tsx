import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, AlertTriangle, Target, Brain, Sparkles } from 'lucide-react';
import { SkillMastery, MasteryStatus, computeOverallScore, getStrongestSubject, getWeakestSubject, getMasteryDistribution, getBloomCoverage, getKnowledgeAge } from '../../utils/masteryEngine';
import { BLOOM_LABELS, BloomLevel } from '../../data/skillTaxonomy';
import { TOPIC_META } from '../../constants';

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onPractice?: (subject: string) => void;
}

// Circular gauge SVG
const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 30 ? '#ef4444' : score < 60 ? '#f59e0b' : score < 85 ? '#22c55e' : '#eab308';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
};

export const SkillMapSummaryDashboard: React.FC<Props> = ({ masteries, locale, onPractice }) => {
  const overall = computeOverallScore(masteries);
  const strongest = getStrongestSubject(masteries);
  const weakest = getWeakestSubject(masteries);
  const dist = getMasteryDistribution(masteries);
  const bloomCoverage = getBloomCoverage(masteries);
  const knowledgeAge = getKnowledgeAge(overall, locale);
  const totalSkills = masteries.length;
  const masteredCount = dist.mastered + dist.proficient;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {/* 1. Overall Score */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
        <div className="relative mb-2">
          <ScoreGauge score={overall} size={80} />
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800">
            {overall}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400">
          {locale === 'ar' ? 'النتيجة الكلية' : 'Overall Score'}
        </span>
      </motion.div>

      {/* 2. Strongest Subject */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-600">
            {locale === 'ar' ? 'الأقوى' : 'Strongest'}
          </span>
        </div>
        {strongest ? (
          <>
            <p className="text-sm font-black text-slate-800 truncate">{strongest.subject}</p>
            <p className="text-lg font-black text-emerald-600">{strongest.score}%</p>
          </>
        ) : (
          <p className="text-sm text-slate-400">{locale === 'ar' ? 'لا بيانات' : 'No data'}</p>
        )}
      </motion.div>

      {/* 3. Weakest Subject */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-rose-600">
            {locale === 'ar' ? 'الأضعف' : 'Weakest'}
          </span>
        </div>
        {weakest ? (
          <>
            <p className="text-sm font-black text-slate-800 truncate">{weakest.subject}</p>
            <p className="text-lg font-black text-rose-500">{weakest.score}%</p>
            {onPractice && (
              <button
                onClick={() => onPractice(weakest.subject)}
                className="text-[10px] font-bold text-rose-500 hover:underline mt-1"
              >
                {locale === 'ar' ? 'تدرب الآن' : 'Practice'}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">{locale === 'ar' ? 'لا بيانات' : 'No data'}</p>
        )}
      </motion.div>

      {/* 4. Skills Mastered */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-slate-400">
            {locale === 'ar' ? 'المهارات' : 'Skills'}
          </span>
        </div>
        <p className="text-lg font-black text-slate-800">{masteredCount}<span className="text-sm text-slate-400">/{totalSkills}</span></p>
        {/* Mini status bar */}
        <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-slate-100 gap-px">
          {(['mastered', 'proficient', 'developing', 'attempted', 'unstarted'] as MasteryStatus[]).map(status => {
            const count = dist[status];
            if (count === 0) return null;
            const colors: Record<MasteryStatus, string> = {
              mastered: 'bg-yellow-400', proficient: 'bg-green-400', developing: 'bg-amber-400',
              attempted: 'bg-red-400', unstarted: 'bg-slate-200',
            };
            return <div key={status} className={`${colors[status]}`} style={{ width: `${(count / totalSkills) * 100}%` }} />;
          })}
        </div>
      </motion.div>

      {/* 5. Cognitive Depth (Bloom's) */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold text-slate-400">
            {locale === 'ar' ? 'العمق المعرفي' : 'Depth'}
          </span>
        </div>
        <div className="space-y-1.5">
          {bloomCoverage.map((bc) => (
            <div key={bc.level} className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-400 w-4">{bc.level}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all"
                  style={{ width: bc.total > 0 ? `${(bc.achieved / bc.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6. Knowledge Age */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col items-center justify-center">
        <Sparkles className="w-6 h-6 text-indigo-400 mb-2" />
        <p className="text-lg font-black text-indigo-700">{knowledgeAge}</p>
        <span className="text-[10px] font-bold text-indigo-400">
          {locale === 'ar' ? 'المرتبة المعرفية' : 'Knowledge Rank'}
        </span>
      </motion.div>
    </motion.div>
  );
};
