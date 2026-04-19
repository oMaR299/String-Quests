/**
 * NewSkillMapPage - Main skill map page with view switcher
 *
 * Three views:
 * 1. Skill Path (student-facing, default)
 * 2. Mastery Grid (teacher/parent heatmap)
 * 3. Summary Dashboard
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route as RouteIcon, Grid3x3, BarChart3, Brain, Clock, Zap, Star, AlertTriangle } from 'lucide-react';
import { useSkillModel } from '../../contexts/SkillModelContext';
import { useI18n } from '../../contexts/I18nContext';
import { getMasterySummary, getMasteryScore } from '../../models/masteryClassifier';
import { MASTERY_COLORS, type MasteryLevel } from '../../models/types';
import { SkillPathView } from './SkillPathView';
import { MasteryGridView } from './MasteryGridView';
import { MasteryRing } from './MasteryRing';

type ViewMode = 'path' | 'grid' | 'summary';

export const NewSkillMapPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('path');
  const { model, masterySummary } = useSkillModel();
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const now = useMemo(() => new Date(), []);

  // Overall stats
  const overallScore = useMemo(() => {
    const states = Object.values(model.kcs);
    if (states.length === 0) return 0;
    const total = states.reduce((sum, s) => sum + getMasteryScore(s, now), 0);
    return Math.round(total / states.length);
  }, [model.kcs, now]);

  const overallLevel: MasteryLevel = overallScore >= 85 ? 'mastered' :
    overallScore >= 60 ? 'proficient' :
    overallScore >= 35 ? 'developing' :
    overallScore > 0 ? 'struggling' : 'not-started';

  const totalKCs = Object.keys(model.kcs).length;
  const totalAttempts = model.attempts.length;

  const views: { id: ViewMode; icon: typeof RouteIcon; labelEn: string; labelAr: string }[] = [
    { id: 'path', icon: RouteIcon, labelEn: 'Skill Path', labelAr: 'مسار المهارات' },
    { id: 'grid', icon: Grid3x3, labelEn: 'Mastery Grid', labelAr: 'شبكة الإتقان' },
    { id: 'summary', icon: BarChart3, labelEn: 'Summary', labelAr: 'ملخص' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-['Cairo']">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {isAr ? 'خريطة المهارات' : 'Skill Map'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAr ? 'تتبع تقدمك العلمي' : 'Track your learning progress'}
          </p>
        </div>

        {/* Overall Score Ring */}
        {totalKCs > 0 && (
          <MasteryRing score={overallScore} level={overallLevel} size={56} strokeWidth={5} />
        )}
      </div>

      {/* View Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100/80 rounded-2xl mb-6">
        {views.map(view => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? view.labelAr : view.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Active View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'path' && <SkillPathView />}
          {activeView === 'grid' && <MasteryGridView />}
          {activeView === 'summary' && <SummaryView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Summary View ────────────────────────────────────────────────────────────

const SummaryView: React.FC = () => {
  const { model, masterySummary } = useSkillModel();
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const now = useMemo(() => new Date(), []);

  const totalKCs = Object.keys(model.kcs).length;
  const totalAttempts = model.attempts.length;

  // Overall mastery score
  const overallScore = useMemo(() => {
    const states = Object.values(model.kcs);
    if (states.length === 0) return 0;
    return Math.round(states.reduce((s, st) => s + getMasteryScore(st, now), 0) / states.length);
  }, [model.kcs, now]);

  // Domain breakdown
  const domains = useMemo(() => {
    const domainMap: Record<string, { scores: number[]; name: string }> = {};
    for (const attempt of model.attempts) {
      const domain = attempt.subjectSlug || 'unknown';
      if (!domainMap[domain]) domainMap[domain] = { scores: [], name: domain };
      domainMap[domain].scores.push(attempt.correct ? 100 : 0);
    }
    return Object.entries(domainMap).map(([key, val]) => ({
      domain: key,
      avgScore: Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length),
      attempts: val.scores.length,
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [model.attempts]);

  // Bloom level distribution
  const bloomDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0, 0]; // levels 1-6
    for (const state of Object.values(model.kcs)) {
      if (state.bloomLevelReached >= 1 && state.bloomLevelReached <= 6) {
        dist[state.bloomLevelReached - 1]++;
      }
    }
    return dist;
  }, [model.kcs]);

  const bloomLabels = [
    { en: 'Remember', ar: 'تذكر' },
    { en: 'Understand', ar: 'فهم' },
    { en: 'Apply', ar: 'تطبيق' },
    { en: 'Analyze', ar: 'تحليل' },
    { en: 'Evaluate', ar: 'تقييم' },
    { en: 'Create', ar: 'إبداع' },
  ];

  if (totalKCs === 0) {
    return (
      <div className="text-center py-20">
        <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-600">
          {isAr ? 'لا توجد بيانات بعد' : 'No data yet'}
        </h2>
        <p className="text-slate-400 mt-2">
          {isAr ? 'ابدأ بحل الاختبارات لتتبع تقدمك' : 'Start taking quizzes to track your progress'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row: big stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Brain className="w-5 h-5 text-blue-500" />}
          label={isAr ? 'النقاط الكلية' : 'Overall Score'}
          value={`${overallScore}%`}
          color="blue"
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-amber-500" />}
          label={isAr ? 'مهارات أتقنت' : 'Skills Mastered'}
          value={`${masterySummary.mastered}`}
          color="amber"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-emerald-500" />}
          label={isAr ? 'إجمالي المحاولات' : 'Total Attempts'}
          value={`${totalAttempts}`}
          color="emerald"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
          label={isAr ? 'تحتاج مراجعة' : 'Need Review'}
          value={`${masterySummary.decaying}`}
          color="orange"
        />
      </div>

      {/* Mastery Distribution */}
      <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          {isAr ? 'توزيع الإتقان' : 'Mastery Distribution'}
        </h3>
        <div className="flex gap-1 h-8 rounded-xl overflow-hidden">
          {(Object.entries(masterySummary) as [MasteryLevel, number][])
            .filter(([_, count]) => count > 0)
            .map(([level, count]) => {
              const total = Object.values(masterySummary).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <motion.div
                  key={level}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: MASTERY_COLORS[level], minWidth: pct > 5 ? '2rem' : '0' }}
                  title={`${level}: ${count}`}
                >
                  {pct > 8 ? count : ''}
                </motion.div>
              );
            })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {(Object.entries(masterySummary) as [MasteryLevel, number][])
            .filter(([_, count]) => count > 0)
            .map(([level, count]) => (
              <div key={level} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MASTERY_COLORS[level] }} />
                <span className="capitalize">{level.replace('-', ' ')}: {count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Bloom's Taxonomy Progress */}
      <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-slate-200/60">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          {isAr ? 'العمق المعرفي (تصنيف بلوم)' : "Cognitive Depth (Bloom's Taxonomy)"}
        </h3>
        <div className="space-y-2">
          {bloomLabels.map((label, i) => {
            const count = bloomDist[i];
            const maxCount = Math.max(...bloomDist, 1);
            const pct = (count / maxCount) * 100;
            const colors = ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'];
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-20 text-right font-medium">
                  {isAr ? label.ar : label.en}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg flex items-center px-2"
                    style={{ backgroundColor: colors[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white">{count}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Performance */}
      {domains.length > 0 && (
        <div className="bg-white/70 backdrop-blur rounded-2xl p-5 border border-slate-200/60">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            {isAr ? 'الأداء حسب المادة' : 'Performance by Subject'}
          </h3>
          <div className="space-y-2">
            {domains.slice(0, 8).map(d => (
              <div key={d.domain} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 truncate font-medium">{d.domain}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{ backgroundColor: d.avgScore >= 70 ? '#22C55E' : d.avgScore >= 40 ? '#F59E0B' : '#EF4444' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.avgScore}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 w-10 text-right">{d.avgScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-slate-200/60">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
    <p className="text-2xl font-black text-slate-800">{value}</p>
  </div>
);
