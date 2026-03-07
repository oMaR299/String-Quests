import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronRight, FileText, Layers } from 'lucide-react';
import { SkillMastery } from '../../utils/masteryEngine';
import {
  TEXTBOOK_DATA, KC_MAP, PAGE_MAP, LESSON_MAP, UNIT_MAP,
  getAllKCs, getKCsForPage, getKCsForLesson, getKCsForUnit,
  KnowledgeComponent,
} from '../../data/sampleTextbook';
import { BLOOM_LABELS, BloomLevel } from '../../data/skillTaxonomy';

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onSelectSkill: (skill: SkillMastery) => void;
}

// Simple KC mastery from attempt data stored in masteries
// Since masteries map to questionIds (not KC ids), we simulate KC mastery
// using a random-seeded but stable score for demo. In production this would
// come from a real KC-level mastery engine.
function getKCMasteryScore(kc: KnowledgeComponent, masteries: SkillMastery[]): number {
  // Use a hash of the kc.id to generate a stable "mastery" score
  // that responds to whether there are any masteries at all
  const hasData = masteries.some(m => m.attemptCount > 0);
  if (!hasData) return 0;

  // Simple hash to get a stable number
  let hash = 0;
  for (let i = 0; i < kc.id.length; i++) {
    hash = ((hash << 5) - hash) + kc.id.charCodeAt(i);
    hash |= 0;
  }
  // Map to 0-100 range, skewing toward middle-high for demo
  const base = Math.abs(hash % 100);
  // Weight by difficulty (easier KCs tend to be more mastered)
  const difficultyBonus = (6 - kc.difficulty) * 8;
  return Math.min(100, Math.max(0, base + difficultyBonus - 20));
}

function getMasteryColor(score: number): string {
  if (score === 0) return '#94a3b8'; // grey - not started
  if (score < 40) return '#FF4B4B';  // red - weak
  if (score < 90) return '#FFC800';  // gold - developing
  return '#58CC02';                   // green - mastered
}

function getMasteryLabel(score: number, locale: string): string {
  if (score === 0) return locale === 'ar' ? 'لم يبدأ' : 'Not Started';
  if (score < 40) return locale === 'ar' ? 'ضعيف' : 'Weak';
  if (score < 90) return locale === 'ar' ? 'نامٍ' : 'Developing';
  return locale === 'ar' ? 'متقن' : 'Mastered';
}

function getAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export const TextbookExplorerView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  // Pre-compute all KC scores
  const kcScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const kc of getAllKCs()) {
      scores[kc.id] = getKCMasteryScore(kc, masteries);
    }
    return scores;
  }, [masteries]);

  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleLesson = (id: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePage = (id: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getPageScore = (pageId: string) => {
    const kcs = getKCsForPage(pageId);
    return getAverageScore(kcs.map(kc => kcScores[kc.id] || 0));
  };

  const getLessonScore = (lessonId: string) => {
    const kcs = getKCsForLesson(lessonId);
    return getAverageScore(kcs.map(kc => kcScores[kc.id] || 0));
  };

  const getUnitScore = (unitId: string) => {
    const kcs = getKCsForUnit(unitId);
    return getAverageScore(kcs.map(kc => kcScores[kc.id] || 0));
  };

  return (
    <div className="space-y-3">
      {/* Book Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">
            {locale === 'ar' ? TEXTBOOK_DATA.nameAr : TEXTBOOK_DATA.nameEn}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {locale === 'ar' ? `الصف ${TEXTBOOK_DATA.gradeLevel}` : `Grade ${TEXTBOOK_DATA.gradeLevel}`}
            {' • '}
            {TEXTBOOK_DATA.unitIds.length} {locale === 'ar' ? 'وحدات' : 'units'}
          </p>
        </div>
      </div>

      {/* Units */}
      {TEXTBOOK_DATA.unitIds.map((unitId, uIdx) => {
        const unit = UNIT_MAP[unitId];
        if (!unit) return null;
        const unitScore = getUnitScore(unitId);
        const unitColor = getMasteryColor(unitScore);
        const isUnitOpen = expandedUnits.has(unitId);

        return (
          <motion.div
            key={unitId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: uIdx * 0.08 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 overflow-hidden"
          >
            {/* Unit Header */}
            <button
              onClick={() => toggleUnit(unitId)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
                style={{ backgroundColor: unitColor }}
              >
                {unit.unitNumber}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-slate-700">
                  {locale === 'ar' ? unit.nameAr : unit.nameEn}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {unit.lessonIds.length} {locale === 'ar' ? 'دروس' : 'lessons'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-black" style={{ color: unitColor }}>{unitScore}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full rounded-full transition-all" style={{ width: `${unitScore}%`, backgroundColor: unitColor }} />
                </div>
                {isUnitOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Lessons inside unit */}
            <AnimatePresence>
              {isUnitOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-2">
                    {unit.lessonIds.map((lessonId, lIdx) => {
                      const lesson = LESSON_MAP[lessonId];
                      if (!lesson) return null;
                      const lessonScore = getLessonScore(lessonId);
                      const lessonColor = getMasteryColor(lessonScore);
                      const isLessonOpen = expandedLessons.has(lessonId);

                      return (
                        <motion.div
                          key={lessonId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lIdx * 0.05 }}
                          className="bg-slate-50/80 rounded-xl border border-slate-100"
                        >
                          {/* Lesson Header */}
                          <button
                            onClick={() => toggleLesson(lessonId)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-100/50 transition-colors rounded-xl"
                          >
                            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="flex-1 text-left">
                              <span className="text-xs font-bold text-slate-600">
                                {locale === 'ar' ? lesson.nameAr : lesson.nameEn}
                              </span>
                            </div>
                            <span className="text-xs font-black" style={{ color: lessonColor }}>{lessonScore}%</span>
                            {isLessonOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                          </button>

                          {/* Pages inside lesson */}
                          <AnimatePresence>
                            {isLessonOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-1.5">
                                  {lesson.pageIds.map((pageId, pIdx) => {
                                    const page = PAGE_MAP[pageId];
                                    if (!page) return null;
                                    const pageScore = getPageScore(pageId);
                                    const pageColor = getMasteryColor(pageScore);
                                    const isPageOpen = expandedPages.has(pageId);

                                    return (
                                      <div key={pageId}>
                                        {/* Page Row */}
                                        <button
                                          onClick={() => togglePage(pageId)}
                                          className="w-full flex items-center gap-2 p-2 hover:bg-white/70 transition-colors rounded-lg"
                                        >
                                          <div
                                            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                            style={{ backgroundColor: pageColor }}
                                          >
                                            {page.pageNumber}
                                          </div>
                                          <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                          <span className="text-[11px] font-medium text-slate-600 flex-1 text-left truncate">
                                            {locale === 'ar' ? page.nameAr : page.nameEn}
                                          </span>
                                          <span className="text-[10px] font-bold" style={{ color: pageColor }}>
                                            {getMasteryLabel(pageScore, locale)}
                                          </span>
                                          {isPageOpen ? <ChevronDown className="w-3 h-3 text-slate-300" /> : <ChevronRight className="w-3 h-3 text-slate-300" />}
                                        </button>

                                        {/* KCs inside page */}
                                        <AnimatePresence>
                                          {isPageOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.15 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="ml-8 space-y-1 py-1">
                                                {getKCsForPage(pageId).map(kc => {
                                                  const score = kcScores[kc.id] || 0;
                                                  const color = getMasteryColor(score);
                                                  return (
                                                    <div
                                                      key={kc.id}
                                                      className="flex items-center gap-2 p-2 bg-white/80 rounded-lg border border-slate-50"
                                                    >
                                                      <div
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: color }}
                                                      />
                                                      <span className="text-[10px] font-medium text-slate-600 flex-1">
                                                        {locale === 'ar' ? kc.nameAr : kc.nameEn}
                                                      </span>
                                                      <span
                                                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                                        style={{ backgroundColor: `${color}15`, color }}
                                                      >
                                                        {BLOOM_LABELS[kc.bloomLevel as BloomLevel]?.[locale === 'ar' ? 'ar' : 'en'] || `B${kc.bloomLevel}`}
                                                      </span>
                                                      {/* Mastery bar */}
                                                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                          className="h-full rounded-full"
                                                          style={{ width: `${score}%`, backgroundColor: color }}
                                                        />
                                                      </div>
                                                      <span className="text-[10px] font-black w-7 text-right" style={{ color }}>
                                                        {score}
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
