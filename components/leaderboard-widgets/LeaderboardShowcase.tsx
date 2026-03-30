import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Globe, LayoutGrid, List } from 'lucide-react';

// Lazy imports — will resolve once the widget files are created
const TopStudentsWidget = React.lazy(() => import('./TopStudentsWidget'));
const SubjectLeaderboardWidget = React.lazy(() => import('./SubjectLeaderboardWidget'));
const ClassComparisonWidget = React.lazy(() => import('./ClassComparisonWidget'));
const TeacherPerformanceWidget = React.lazy(() => import('./TeacherPerformanceWidget').then(m => ({ default: m.TeacherPerformanceWidget })));
const LeagueProgressWidget = React.lazy(() => import('./LeagueProgressWidget').then(m => ({ default: m.LeagueProgressWidget })));
const SpaceWeeklyLeaderboardWidget = React.lazy(() => import('./SpaceWeeklyLeaderboardWidget'));
const SpaceLeaderboardDashboard = React.lazy(() => import('./SpaceLeaderboardDashboard'));

const Loader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="w-8 h-8 border-3 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
  </div>
);

interface LeaderboardShowcaseProps {
  onExit: () => void;
}

export const LeaderboardShowcase: React.FC<LeaderboardShowcaseProps> = ({ onExit }) => {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  return (
    <div className="min-h-screen bg-slate-50 font-['Cairo']" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="text-lg">←</span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{t('لوحة المتصدرين', 'Leaderboard')}</h1>
              <p className="text-xs font-medium text-slate-400">{t('7 أنماط من لوحات المتصدرين', '7 Leaderboard Widget Types')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setLayout('grid')} className={`p-2 rounded-md transition-colors ${layout === 'grid' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setLayout('list')} className={`p-2 rounded-md transition-colors ${layout === 'list' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Language toggle */}
            <button onClick={() => setLocale(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              <Globe className="w-4 h-4" />
              <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className={layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
          <React.Suspense fallback={<Loader />}>
            {/* Widget 1: Top Students by XP */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 1</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('ترتيب بسيط', 'Simple Ranking')}</span>
              </div>
              <TopStudentsWidget locale={locale} limit={10} />
            </motion.div>

            {/* Widget 2: Subject Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 2</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('ترتيب حسب المادة', 'Subject-based')}</span>
              </div>
              <SubjectLeaderboardWidget locale={locale} />
            </motion.div>

            {/* Widget 3: Class Comparison */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 3</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('مقارنة الفصول', 'Class Comparison')}</span>
              </div>
              <ClassComparisonWidget locale={locale} />
            </motion.div>

            {/* Widget 4: Teacher Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 4</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('أداء المعلمين', 'Teacher Performance')}</span>
              </div>
              <TeacherPerformanceWidget locale={locale} />
            </motion.div>

            {/* Widget 5: League Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={layout === 'grid' ? 'lg:col-span-2' : ''}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 5</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('نظام الدوريات', 'League System')}</span>
              </div>
              <LeagueProgressWidget locale={locale} />
            </motion.div>

            {/* Widget 6: Space Weekly Leaderboard (Sidebar) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 6</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('ترتيب المساحة الأسبوعي (شريط جانبي)', 'Space Weekly (Sidebar)')}</span>
              </div>
              <div className="max-w-sm">
                <SpaceWeeklyLeaderboardWidget
                  spaceSubject="science"
                  spaceGrade={7}
                  spaceSection="A"
                  locale={locale}
                  onViewFull={() => {}}
                />
              </div>
            </motion.div>

            {/* Widget 7: Space Leaderboard Dashboard (Full) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={layout === 'grid' ? 'lg:col-span-2' : ''}>
              <div className="mb-2">
                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Widget 7</span>
                <span className="text-[10px] font-medium text-slate-400 mr-2"> — {t('لوحة المتصدرين الكاملة للمساحة', 'Full Space Dashboard')}</span>
              </div>
              <SpaceLeaderboardDashboard
                spaceSubject="science"
                spaceGrade={7}
                spaceSection="A"
                locale={locale}
              />
            </motion.div>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};
