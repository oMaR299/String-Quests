import React, { useState, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Trophy, BrainCircuit } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { loadAttempts, AttemptRecord } from '../../utils/skillMapStorage';
import { computeAllSkillMasteries, getGapAnalysis, getStrengthAnalysis } from '../../utils/masteryEngine';
import { computeCategoryMasteries, calculateUnitMastery } from '../../utils/masteryEngine';
import { SUBJECT_CATEGORIES } from '../../data/skillTaxonomy';
import { AVAILABLE_TEXTBOOKS, UNIT_MAP, getKCsForUnit, Textbook } from '../../data/sampleTextbook';
import { subjectToSlug, lessonToSlug } from '../../utils/slugify';

import { TextbookSelector } from './TextbookSelector';
import { SkillMapSummaryDashboard } from './SkillMapSummaryDashboard';
import { VisualizationModeSwitcher, VisualizationMode } from './VisualizationModeSwitcher';
import { TimeSlider, TimeRange, getTimeRangeMs } from './TimeSlider';
import { HeatMapView } from './HeatMapView';
import { RadarView } from './RadarView';
import { GalaxyView } from './GalaxyView';
import { KnowledgeTreeView } from './KnowledgeTreeView';
import { DnaStrandView } from './DnaStrandView';
import { SkillDetailPanel } from './SkillDetailPanel';
import { GapAnalysisPanel } from './GapAnalysisPanel';
import { StrengthFinderPanel } from './StrengthFinderPanel';
import { SkillMastery } from '../../utils/masteryEngine';

const TextbookExplorerView = React.lazy(() => import('./TextbookExplorerView').then(m => ({ default: m.TextbookExplorerView })));
const MemoryTimelineView = React.lazy(() => import('./MemoryTimelineView').then(m => ({ default: m.MemoryTimelineView })));
const CurriculumMapView = React.lazy(() => import('./CurriculumMapView').then(m => ({ default: m.CurriculumMapView })));

export const SkillMapLayout: React.FC = () => {
  const { locale, t } = useI18n();
  const navigate = useNavigate();

  const [mode, setMode] = useState<VisualizationMode>('heatmap');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillMastery | null>(null);
  const [showGaps, setShowGaps] = useState(false);
  const [showStrengths, setShowStrengths] = useState(false);

  const [activeTextbook, setActiveTextbook] = useState<Textbook>(() => {
    try {
      const savedId = localStorage.getItem('string-quests-active-textbook');
      if (savedId) {
        const found = AVAILABLE_TEXTBOOKS.find(t => t.id === savedId);
        if (found) return found;
      }
    } catch {}
    return AVAILABLE_TEXTBOOKS[0];
  });

  const handleTextbookChange = (tb: Textbook) => {
    setActiveTextbook(tb);
    localStorage.setItem('string-quests-active-textbook', tb.id);
    setSelectedSkill(null);
  };

  // Load and filter attempts by time range
  const filteredAttempts = useMemo(() => {
    const all = loadAttempts();
    if (timeRange === 'all') return all;
    const { start, end } = getTimeRangeMs(timeRange);
    return all.filter(a => a.timestamp >= start && a.timestamp <= end);
  }, [timeRange]);

  // Compute masteries from filtered attempts
  const masteries = useMemo(() => computeAllSkillMasteries(filteredAttempts), [filteredAttempts]);

  // Category scores for radar
  const categoryScores = useMemo(() => {
    const catMasteries = computeCategoryMasteries(masteries);
    return SUBJECT_CATEGORIES.map(cat => {
      const cm = catMasteries.find(c => c.categoryId === cat.id);
      return {
        categoryId: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        color: cat.color,
        score: cm?.score || 0,
      };
    });
  }, [masteries]);

  const unitScores = useMemo(() => {
    return activeTextbook.unitIds.map(unitId => {
      const unit = UNIT_MAP[unitId];
      if (!unit) return { unitId, nameAr: '', nameEn: '', score: 0 };
      const score = calculateUnitMastery(unitId, filteredAttempts);
      return {
        unitId,
        nameAr: unit.nameAr,
        nameEn: unit.nameEn,
        score,
      };
    });
  }, [activeTextbook, filteredAttempts]);

  // Analysis data
  const gaps = useMemo(() => getGapAnalysis(masteries), [masteries]);
  const strengths = useMemo(() => getStrengthAnalysis(masteries), [masteries]);

  const handlePractice = (subject: string, lesson?: string) => {
    const subSlug = subjectToSlug(subject);
    const lesSlug = lesson ? lessonToSlug(lesson) : 'all';
    navigate(`/learn/${subSlug}/${lesSlug}/play`);
  };

  const hasAttempts = filteredAttempts.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              {locale === 'ar' ? 'خريطة المهارات' : 'Skill Map'}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {locale === 'ar' ? 'تحليل شامل لمعرفتك' : 'Comprehensive knowledge analysis'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Analysis buttons */}
          <button
            onClick={() => setShowGaps(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {locale === 'ar' ? 'الفجوات' : 'Gaps'}
            {gaps.length > 0 && (
              <span className="bg-rose-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">
                {gaps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowStrengths(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            <Trophy className="w-3.5 h-3.5" />
            {locale === 'ar' ? 'نقاط القوة' : 'Strengths'}
          </button>
        </div>
      </div>

      {/* Textbook Selector */}
      <TextbookSelector
        activeTextbook={activeTextbook}
        onSelect={handleTextbookChange}
        locale={locale}
      />

      {/* Summary Dashboard */}
      <SkillMapSummaryDashboard
        masteries={masteries}
        locale={locale}
        onPractice={(subject) => handlePractice(subject)}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <VisualizationModeSwitcher active={mode} onChange={setMode} locale={locale} />
        <TimeSlider value={timeRange} onChange={setTimeRange} locale={locale} />
      </div>

      {/* Empty State - only for non-curriculum modes */}
      {!hasAttempts && mode !== 'curriculum' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-black text-slate-700 mb-2">
            {locale === 'ar' ? 'ابدأ رحلتك!' : 'Start Your Journey!'}
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {locale === 'ar'
              ? 'أجب على 5 أسئلة على الأقل لفتح خريطة مهاراتك الشاملة'
              : 'Answer at least 5 questions to unlock your comprehensive skill map'}
          </p>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-3 bg-[#1CB0F6] text-white font-bold rounded-xl hover:bg-[#1A9FE0] transition-colors shadow-lg shadow-blue-500/20"
          >
            {locale === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
          </button>
        </motion.div>
      )}

      {/* Visualization */}
      {(hasAttempts || mode === 'curriculum') && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
          {mode === 'heatmap' && (
            <HeatMapView masteries={masteries} locale={locale} onSelectSkill={setSelectedSkill} />
          )}
          {mode === 'radar' && (
            <RadarView categoryScores={categoryScores} locale={locale} />
          )}
          {mode === 'galaxy' && (
            <GalaxyView unitScores={unitScores} locale={locale} activeTextbook={activeTextbook} />
          )}
          {mode === 'tree' && (
            <KnowledgeTreeView masteries={masteries} locale={locale} onSelectSkill={setSelectedSkill} />
          )}
          {mode === 'dna' && (
            <DnaStrandView masteries={masteries} locale={locale} onSelectSkill={setSelectedSkill} />
          )}
          {mode === 'textbook' && (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" /></div>}>
              <TextbookExplorerView activeTextbook={activeTextbook} attempts={filteredAttempts} locale={locale} onSelectSkill={setSelectedSkill} />
            </Suspense>
          )}
          {mode === 'memory' && (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>}>
              <MemoryTimelineView masteries={masteries} locale={locale} onSelectSkill={setSelectedSkill} />
            </Suspense>
          )}
          {mode === 'curriculum' && (
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /></div>}>
              <CurriculumMapView locale={locale} />
            </Suspense>
          )}
        </div>
      )}

      {/* Panels */}
      <SkillDetailPanel
        mastery={selectedSkill}
        locale={locale}
        onClose={() => setSelectedSkill(null)}
      />
      <GapAnalysisPanel
        isOpen={showGaps}
        gaps={gaps}
        locale={locale}
        onClose={() => setShowGaps(false)}
        onPractice={(subject, lesson) => handlePractice(subject, lesson)}
      />
      <StrengthFinderPanel
        isOpen={showStrengths}
        strengths={strengths}
        locale={locale}
        onClose={() => setShowStrengths(false)}
      />
    </div>
  );
};
