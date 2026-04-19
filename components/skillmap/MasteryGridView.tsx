/**
 * MasteryGridView - Heatmap visualization (Teacher/Parent view)
 *
 * A Khan Academy-style grid where each cell represents a KC
 * colored by mastery level. Supports sorting, filtering, and
 * time-based views.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowUpDown, Clock, Search, ChevronRight } from 'lucide-react';
import { useSkillModel } from '../../contexts/SkillModelContext';
import { useI18n } from '../../contexts/I18nContext';
import { classifyMastery, getMasteryScore } from '../../models/masteryClassifier';
import { MASTERY_COLORS, type MasteryLevel } from '../../models/types';
import { KC_MAP } from '../../data/sampleTextbook';
import { SUBJECT_CATEGORIES } from '../../data/skillTaxonomy';
import { MasteryRing } from './MasteryRing';

type SortMode = 'name' | 'mastery-asc' | 'mastery-desc' | 'recent';
type FilterMode = 'all' | MasteryLevel;

interface GridItem {
  kcId: string;
  nameEn: string;
  nameAr: string;
  domain: string;
  score: number;
  level: MasteryLevel;
  lastPractice: string | null;
  bloomLevel: number;
}

export const MasteryGridView: React.FC = () => {
  const { model } = useSkillModel();
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const [sortMode, setSortMode] = useState<SortMode>('mastery-desc');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKC, setSelectedKC] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);

  // Build grid items from all KCs that have been attempted + KC_MAP entries
  const gridItems = useMemo((): GridItem[] => {
    const items: GridItem[] = [];
    const seen = new Set<string>();

    // First: all KCs with state (attempted)
    for (const [kcId, state] of Object.entries(model.kcs)) {
      seen.add(kcId);
      const kc = KC_MAP[kcId];
      items.push({
        kcId,
        nameEn: kc?.nameEn ?? kcId,
        nameAr: kc?.nameAr ?? kcId,
        domain: kc?.tags?.[0] ?? 'general',
        score: getMasteryScore(state, now),
        level: classifyMastery(state, now),
        lastPractice: state.lastPractice,
        bloomLevel: kc?.bloomLevel ?? 1,
      });
    }

    // Then: a sample of unattempted KCs (up to 50 to keep grid manageable)
    let unattemptedCount = 0;
    for (const [kcId, kc] of Object.entries(KC_MAP)) {
      if (seen.has(kcId)) continue;
      if (unattemptedCount >= 50) break;
      items.push({
        kcId,
        nameEn: kc.nameEn,
        nameAr: kc.nameAr,
        domain: kc.tags?.[0] ?? 'general',
        score: 0,
        level: 'not-started',
        lastPractice: null,
        bloomLevel: kc.bloomLevel,
      });
      unattemptedCount++;
    }

    return items;
  }, [model.kcs, now]);

  // Apply filter
  const filtered = useMemo(() => {
    let items = gridItems;

    if (filterMode !== 'all') {
      items = items.filter(i => i.level === filterMode);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.nameEn.toLowerCase().includes(q) || i.nameAr.includes(q)
      );
    }

    return items;
  }, [gridItems, filterMode, searchQuery]);

  // Apply sort
  const sorted = useMemo(() => {
    const items = [...filtered];
    switch (sortMode) {
      case 'name':
        return items.sort((a, b) => (isAr ? a.nameAr : a.nameEn).localeCompare(isAr ? b.nameAr : b.nameEn));
      case 'mastery-asc':
        return items.sort((a, b) => a.score - b.score);
      case 'mastery-desc':
        return items.sort((a, b) => b.score - a.score);
      case 'recent':
        return items.sort((a, b) => {
          if (!a.lastPractice) return 1;
          if (!b.lastPractice) return -1;
          return new Date(b.lastPractice).getTime() - new Date(a.lastPractice).getTime();
        });
      default:
        return items;
    }
  }, [filtered, sortMode, isAr]);

  // Group by domain
  const grouped = useMemo(() => {
    const groups: Record<string, GridItem[]> = {};
    for (const item of sorted) {
      const key = item.domain;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [sorted]);

  // Summary stats
  const stats = useMemo(() => {
    const total = gridItems.length;
    const mastered = gridItems.filter(i => i.level === 'mastered').length;
    const struggling = gridItems.filter(i => i.level === 'struggling').length;
    const decaying = gridItems.filter(i => i.level === 'decaying').length;
    const avgScore = total > 0 ? Math.round(gridItems.reduce((s, i) => s + i.score, 0) / total) : 0;
    return { total, mastered, struggling, decaying, avgScore };
  }, [gridItems]);

  const selectedItem = selectedKC ? gridItems.find(i => i.kcId === selectedKC) : null;
  const selectedState = selectedKC ? model.kcs[selectedKC] : null;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label={isAr ? 'المتوسط' : 'Average'}
          value={`${stats.avgScore}%`}
          color="#6BAED6"
        />
        <SummaryCard
          label={isAr ? 'أتقن' : 'Mastered'}
          value={`${stats.mastered}`}
          color={MASTERY_COLORS['mastered']}
        />
        <SummaryCard
          label={isAr ? 'يحتاج دعم' : 'Struggling'}
          value={`${stats.struggling}`}
          color={MASTERY_COLORS['struggling']}
        />
        <SummaryCard
          label={isAr ? 'يحتاج مراجعة' : 'Needs Review'}
          value={`${stats.decaying}`}
          color={MASTERY_COLORS['decaying']}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن مهارة...' : 'Search skills...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => {
            const modes: SortMode[] = ['mastery-desc', 'mastery-asc', 'name', 'recent'];
            const idx = modes.indexOf(sortMode);
            setSortMode(modes[(idx + 1) % modes.length]);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-600 hover:bg-white transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortMode === 'mastery-desc' ? (isAr ? 'الأعلى أولاً' : 'Highest') :
           sortMode === 'mastery-asc' ? (isAr ? 'الأقل أولاً' : 'Lowest') :
           sortMode === 'name' ? (isAr ? 'الاسم' : 'Name') :
           (isAr ? 'الأحدث' : 'Recent')}
        </button>

        {/* Filter */}
        <div className="flex gap-1">
          {(['all', 'mastered', 'proficient', 'developing', 'struggling', 'decaying'] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterMode === mode
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white/60 text-slate-500 hover:bg-white/80'
              }`}
            >
              {mode === 'all' ? (isAr ? 'الكل' : 'All') :
               mode === 'mastered' ? (isAr ? 'أتقن' : 'Mastered') :
               mode === 'proficient' ? (isAr ? 'متقن' : 'Prof.') :
               mode === 'developing' ? (isAr ? 'تطور' : 'Dev.') :
               mode === 'struggling' ? (isAr ? 'دعم' : 'Struggle') :
               (isAr ? 'مراجعة' : 'Decay')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid by Domain */}
      <div className="space-y-6">
        {(Object.entries(grouped) as [string, GridItem[]][]).map(([domain, items]) => (
          <div key={domain}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {domain}
              <span className="ml-2 text-slate-400 font-normal">({items.length})</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {items.map(item => (
                <motion.button
                  key={item.kcId}
                  onClick={() => setSelectedKC(item.kcId === selectedKC ? null : item.kcId)}
                  className={`relative p-2 rounded-xl border transition-all text-center group ${
                    item.kcId === selectedKC
                      ? 'ring-2 ring-blue-400 border-blue-300 bg-blue-50'
                      : 'border-slate-200/60 bg-white/60 hover:bg-white hover:shadow-sm'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  {/* Color indicator */}
                  <div
                    className="w-full aspect-square rounded-lg mb-1.5 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: MASTERY_COLORS[item.level] }}
                  >
                    {item.score > 0 ? `${item.score}%` : '—'}
                  </div>
                  {/* Label */}
                  <p className="text-[10px] text-slate-600 leading-tight line-clamp-2 font-medium">
                    {isAr ? item.nameAr : item.nameEn}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">{isAr ? 'لا توجد مهارات' : 'No skills found'}</p>
          <p className="text-sm mt-1">{isAr ? 'جرب تغيير الفلتر' : 'Try changing the filter'}</p>
        </div>
      )}

      {/* Detail Panel (slide-in from right) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 z-50 overflow-y-auto p-6"
          >
            <button
              onClick={() => setSelectedKC(null)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <div className="text-center mb-6 mt-8">
              <MasteryRing score={selectedItem.score} level={selectedItem.level} size={100} strokeWidth={8} />
              <h3 className="mt-4 text-lg font-bold text-slate-800">
                {isAr ? selectedItem.nameAr : selectedItem.nameEn}
              </h3>
              <p className="text-sm text-slate-500 capitalize">{selectedItem.domain}</p>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <DetailRow
                label={isAr ? 'مستوى الإتقان' : 'Mastery Level'}
                value={selectedItem.level.replace('-', ' ')}
                color={MASTERY_COLORS[selectedItem.level]}
              />
              {selectedState && (
                <>
                  <DetailRow
                    label={isAr ? 'احتمال التعلم' : 'P(Learned)'}
                    value={`${(selectedState.pLearned * 100).toFixed(1)}%`}
                  />
                  <DetailRow
                    label={isAr ? 'الثبات (أيام)' : 'Stability (days)'}
                    value={selectedState.stability.toFixed(1)}
                  />
                  <DetailRow
                    label={isAr ? 'محاولات ناجحة' : 'Successes'}
                    value={`${selectedState.successCount}`}
                  />
                  <DetailRow
                    label={isAr ? 'محاولات فاشلة' : 'Failures'}
                    value={`${selectedState.failureCount}`}
                  />
                  <DetailRow
                    label={isAr ? 'مستوى بلوم' : 'Bloom Level'}
                    value={`${selectedState.bloomLevelReached}/6`}
                  />
                  <DetailRow
                    label={isAr ? 'آخر تدريب' : 'Last Practice'}
                    value={new Date(selectedState.lastPractice).toLocaleDateString()}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200/60">
        {(Object.entries(MASTERY_COLORS) as [MasteryLevel, string][]).map(([level, color]) => (
          <div key={level} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="capitalize">{level.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-slate-200/60">
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-bold" style={color ? { color } : undefined}>{value}</span>
  </div>
);
