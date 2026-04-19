import React, { useState, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, GraduationCap, Users, BookOpen, BrainCircuit,
  FileText, LogOut, Menu, X, Search, Globe, ChevronDown, Sparkles, Activity,
} from 'lucide-react';
import { SUBJECT_UNITS, type Subject } from '../../data/complexLeaderboardData';

/* ═══════════════════════════════════════════════════════════════
   Campus Data (shared by all tabs)
   ═══════════════════════════════════════════════════════════════ */

export const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor (Girls)' },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy' },
];

export function formatSectionLabel(section: string, campusId: string, locale: 'ar' | 'en'): string {
  const campus = CAMPUSES.find(c => c.id === campusId);
  const sectionLabel = locale === 'ar' ? `شعبة ${section}` : `Section ${section}`;
  return campus ? `${sectionLabel} - ${locale === 'ar' ? campus.name : campus.nameEn}` : sectionLabel;
}

/* ═══════════════════════════════════════════════════════════════
   Subject Metadata
   ═══════════════════════════════════════════════════════════════ */

const SUBJECT_META: Record<string, { ar: string; en: string; emoji: string; gradient: string }> = {
  math:      { ar: 'الرياضيات', en: 'Mathematics', emoji: '📐', gradient: 'from-blue-500 to-indigo-600' },
  science:   { ar: 'العلوم', en: 'Science', emoji: '🔬', gradient: 'from-emerald-500 to-teal-600' },
  languages: { ar: 'اللغات', en: 'Languages', emoji: '📝', gradient: 'from-violet-500 to-purple-600' },
  history:   { ar: 'التاريخ', en: 'History', emoji: '🏛️', gradient: 'from-amber-500 to-orange-600' },
  arts:      { ar: 'الفنون', en: 'Arts', emoji: '🎨', gradient: 'from-pink-500 to-rose-600' },
  islamic:   { ar: 'التربية الإسلامية', en: 'Islamic Studies', emoji: '🕌', gradient: 'from-green-600 to-emerald-700' },
  english:   { ar: 'اللغة الإنجليزية', en: 'English', emoji: '🔤', gradient: 'from-sky-500 to-blue-600' },
  computer:  { ar: 'الحاسب الآلي', en: 'Computer Science', emoji: '💻', gradient: 'from-cyan-500 to-teal-600' },
  physics:   { ar: 'الفيزياء', en: 'Physics', emoji: '⚛️', gradient: 'from-indigo-500 to-blue-700' },
  chemistry: { ar: 'الكيمياء', en: 'Chemistry', emoji: '🧪', gradient: 'from-red-500 to-pink-600' },
  biology:   { ar: 'الأحياء', en: 'Biology', emoji: '🧬', gradient: 'from-lime-500 to-green-600' },
  social:    { ar: 'الاجتماعيات', en: 'Social Studies', emoji: '🌍', gradient: 'from-teal-500 to-cyan-600' },
};

export { SUBJECT_META };

/* ═══════════════════════════════════════════════════════════════
   Lazy Tab Imports
   ═══════════════════════════════════════════════════════════════ */

const OverviewTab  = lazy(() => import('./OverviewTab'));
const GradesTab    = lazy(() => import('./GradesTab'));
const TeachersTab  = lazy(() => import('./TeachersTab'));
const UnitsTab     = lazy(() => import('./UnitsTab'));
const SkillMapTab  = lazy(() => import('./SkillMapTab'));
const ReportsTab   = lazy(() => import('./ReportsTab'));
const PrincipalTab = lazy(() => import('./PrincipalTab'));
const PulseTab     = lazy(() => import('./PulseTab'));

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

type Tab = 'overview' | 'grades' | 'teachers' | 'units' | 'skills' | 'reports' | 'principal' | 'pulse';

interface TopicManagerLayoutProps {
  onExit: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function TopicManagerLayout({ onExit }: TopicManagerLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const t = useCallback((ar: string, en: string) => (locale === 'ar' ? ar : en), [locale]);
  const isRTL = locale === 'ar';
  const subjectMeta = SUBJECT_META[selectedSubject] || SUBJECT_META.math;

  const tabs: { id: Tab; label: string; labelEn: string; icon: React.FC<{ className?: string }>; enabled: boolean }[] = [
    { id: 'overview',  label: 'نظرة عامة',  labelEn: 'Overview',   icon: LayoutGrid,    enabled: true },
    { id: 'grades',    label: 'الصفوف',      labelEn: 'Grades',     icon: GraduationCap, enabled: true },
    { id: 'teachers',  label: 'المعلمون',    labelEn: 'Teachers',   icon: Users,         enabled: true },
    { id: 'units',     label: 'الوحدات',     labelEn: 'Units',      icon: BookOpen,      enabled: true },
    { id: 'skills',    label: 'المهارات',    labelEn: 'Skill Map',  icon: BrainCircuit,  enabled: true },
    { id: 'reports',   label: 'التقارير',    labelEn: 'Reports',    icon: FileText,      enabled: true },
    { id: 'principal', label: 'لوحة المدير',  labelEn: 'Principal',  icon: Sparkles,      enabled: true },
    { id: 'pulse',     label: 'نبض اليوم',    labelEn: "Today's Pulse", icon: Activity,    enabled: true },
  ];

  /* ── NavItem ─────────────────────────────────────── */
  const renderNavItem = (tab: typeof tabs[0]) => (
    <button
      key={tab.id}
      onClick={() => { if (tab.enabled) { setActiveTab(tab.id); setIsMobileMenuOpen(false); } }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative overflow-hidden text-sm
        ${activeTab === tab.id
          ? 'text-violet-700 bg-violet-50'
          : tab.enabled
            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            : 'text-slate-300 cursor-not-allowed'}
      `}
      disabled={!tab.enabled}
    >
      {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-r-full" />}
      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-violet-500' : ''}`} />
      <span>{locale === 'ar' ? tab.label : tab.labelEn}</span>
      {!tab.enabled && <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full mr-auto">{t('قريبا', 'Soon')}</span>}
    </button>
  );

  /* ── Tab Content ──────────────────────────────────── */
  const TabPlaceholder = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 p-8">
      <BookOpen className="w-24 h-24 mb-6 opacity-10" />
      <h2 className="text-2xl font-black text-slate-300">{t('قيد التطوير', 'Coming Soon')}</h2>
      <p className="font-medium opacity-50">{label}</p>
    </div>
  );

  const TabFallback = () => (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Suspense fallback={<TabFallback />}>
            <OverviewTab subject={selectedSubject} locale={locale} />
          </Suspense>
        );
      case 'grades':
        return (
          <Suspense fallback={<TabFallback />}>
            <GradesTab subject={selectedSubject} locale={locale} />
          </Suspense>
        );
      case 'teachers':
        return <Suspense fallback={<TabFallback />}><TeachersTab subject={selectedSubject} locale={locale} /></Suspense>;
      case 'units':
        return <Suspense fallback={<TabFallback />}><UnitsTab subject={selectedSubject} locale={locale} /></Suspense>;
      case 'skills':
        return <Suspense fallback={<TabFallback />}><SkillMapTab subject={selectedSubject} locale={locale} /></Suspense>;
      case 'reports':
        return <Suspense fallback={<TabFallback />}><ReportsTab subject={selectedSubject} locale={locale} /></Suspense>;
      case 'principal':
        return <Suspense fallback={<TabFallback />}><PrincipalTab subject={selectedSubject} locale={locale} onNavigate={setActiveTab} /></Suspense>;
      case 'pulse':
        return <Suspense fallback={<TabFallback />}><PulseTab subject={selectedSubject} locale={locale} /></Suspense>;
      default:
        return null;
    }
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  return (
    <div className="flex h-screen bg-slate-100 font-['Cairo'] overflow-hidden text-slate-800 selection:bg-violet-500/30" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className={`
        fixed lg:relative z-50 lg:z-auto h-full
        w-72 bg-white border-r border-slate-200 flex-col p-5 shrink-0
        transition-transform lg:transition-none duration-300 shadow-sm
        ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full lg:translate-x-0 lg:flex hidden lg:flex'}
      `}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute top-4 left-4 text-slate-400 hover:text-slate-700">
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 mt-1">
          <div className={`w-11 h-11 bg-gradient-to-br ${subjectMeta.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 leading-none tracking-tight">String</h1>
            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">{t('مدير المادة', 'Topic Manager')}</span>
          </div>
        </div>

        {/* Subject Selector (in sidebar) */}
        <div className="relative mb-5">
          <button
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-gradient-to-r ${subjectMeta.gradient} text-white font-bold text-sm shadow-md hover:shadow-lg transition-all`}
          >
            <span className="text-lg">{subjectMeta.emoji}</span>
            <span className="flex-1 text-start">{t(subjectMeta.ar, subjectMeta.en)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {subjectDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5 w-full max-h-72 overflow-y-auto"
              >
                {Object.entries(SUBJECT_META).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedSubject(key); setSubjectDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      key === selectedSubject
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{val.emoji}</span>
                    <span>{t(val.ar, val.en)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <div className="px-3 mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('الأقسام', 'Modules')}</span></div>
          {tabs.map(renderNavItem)}
        </nav>

        {/* Footer */}
        <button onClick={onExit}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors mt-auto text-sm">
          <LogOut className="w-5 h-5" />
          <span>{t('العودة', 'Back')}</span>
        </button>
      </aside>

      {/* Click-outside dismiss for subject dropdown */}
      {subjectDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSubjectDropdownOpen(false)} />
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-[4.5rem] bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="relative w-full max-w-md hidden md:block group">
              <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input type="text" placeholder={t('بحث...', 'Search...')}
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pr-11 pl-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Subject badge */}
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${subjectMeta.gradient} text-white text-xs font-bold shadow-sm`}>
              <span>{subjectMeta.emoji}</span>
              <span>{t(subjectMeta.ar, subjectMeta.en)}</span>
            </span>
            {/* AR/EN toggle */}
            <button onClick={() => setLocale(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              <Globe className="w-4 h-4" /><span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="h-full">
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default TopicManagerLayout;
