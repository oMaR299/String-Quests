import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Target, TrendingUp, Brain, Shield, BarChart3, BookOpen } from 'lucide-react';
import { SkillMastery, MASTERY_COLORS } from '../../utils/masteryEngine';
import { BLOOM_LABELS } from '../../data/skillTaxonomy';
import { useNavigate } from 'react-router-dom';
import { subjectToSlug, lessonToSlug } from '../../utils/slugify';

interface Props {
  mastery: SkillMastery | null;
  locale: string;
  onClose: () => void;
}

const MetricCard: React.FC<{ label: string; value: number; icon: React.ElementType; color: string }> = ({
  label, value, icon: Icon, color,
}) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-black text-slate-600 w-8 text-right">{Math.round(value)}</span>
    </div>
  </div>
);

export const SkillDetailPanel: React.FC<Props> = ({ mastery, locale, onClose }) => {
  const navigate = useNavigate();

  const handlePractice = () => {
    if (!mastery) return;
    const subSlug = subjectToSlug(mastery.skill.subject);
    const lesSlug = mastery.skill.lesson ? lessonToSlug(mastery.skill.lesson) : 'all';
    navigate(`/learn/${subSlug}/${lesSlug}/play`);
    onClose();
  };

  return (
    <AnimatePresence>
      {mastery && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: MASTERY_COLORS[mastery.status] }}
                >
                  {mastery.status}
                </span>
              </div>
              {/* Breadcrumb */}
              <div className="text-xs text-slate-400 font-medium mb-1">
                {mastery.skill.subject} &gt; {locale === 'ar' ? mastery.skill.domainAr : mastery.skill.domainEn}
              </div>
              <h2 className="text-xl font-black text-slate-800">
                {locale === 'ar' ? mastery.skill.skillNameAr : mastery.skill.skillNameEn}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md">
                  {BLOOM_LABELS[mastery.skill.bloomLevel][locale === 'ar' ? 'ar' : 'en']}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                  {mastery.skill.skillCode}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Mastery Score Ring */}
              <div className="flex justify-center">
                <div className="relative">
                  <svg width={120} height={120} className="transform -rotate-90">
                    <circle cx={60} cy={60} r={50} fill="none" stroke="#e2e8f0" strokeWidth={10} />
                    <motion.circle
                      cx={60} cy={60} r={50}
                      fill="none"
                      stroke={MASTERY_COLORS[mastery.status]}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - mastery.masteryScore / 100) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{mastery.masteryScore}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {locale === 'ar' ? 'إتقان' : 'Mastery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <MetricCard label={locale === 'ar' ? 'الدقة' : 'Accuracy'} value={mastery.metrics.accuracy} icon={Target} color="text-blue-500" />
                <MetricCard label={locale === 'ar' ? 'الثبات' : 'Consistency'} value={mastery.metrics.consistency} icon={BarChart3} color="text-green-500" />
                <MetricCard label={locale === 'ar' ? 'الاحتفاظ' : 'Retention'} value={mastery.metrics.retention} icon={Brain} color="text-purple-500" />
                <MetricCard label={locale === 'ar' ? 'المعايرة' : 'Calibration'} value={mastery.metrics.confidenceCalibration} icon={Shield} color="text-amber-500" />
                <MetricCard label={locale === 'ar' ? 'النمو' : 'Growth'} value={mastery.metrics.growthVelocity} icon={TrendingUp} color="text-emerald-500" />
                <MetricCard label={locale === 'ar' ? 'العمق' : 'Depth'} value={mastery.metrics.cognitiveDepth} icon={Brain} color="text-indigo-500" />
              </div>

              {/* Attempt Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {locale === 'ar' ? 'سجل المحاولات' : 'Attempt History'}
                  <span className="text-slate-400 text-xs">({mastery.attemptCount})</span>
                </h3>
                {mastery.attempts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {locale === 'ar' ? 'لا توجد محاولات بعد' : 'No attempts yet'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[...mastery.attempts].reverse().map((attempt, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                          attempt.isCorrect
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-rose-50 border-rose-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${attempt.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-bold text-slate-700">
                            {attempt.pointsAwarded}/{attempt.maxPoints}
                          </span>
                          {attempt.hintUsed && <span className="text-[9px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded font-bold">Hint</span>}
                          {attempt.isReviewMode && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">Review</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(attempt.timestamp).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Practice Button */}
              <button
                onClick={handlePractice}
                className="w-full py-3 bg-[#1CB0F6] hover:bg-[#1A9FE0] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {locale === 'ar' ? 'تدرب على هذه المهارة' : 'Practice This Skill'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
