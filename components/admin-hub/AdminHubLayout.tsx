import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, CalendarCheck, BarChart3, Users, Activity,
  FileText, Settings, Megaphone, LogOut, Menu, X, Search, Globe, Shield
} from 'lucide-react';

type Module = 'overview' | 'attendance' | 'attendance-report' | 'academics' | 'people' | 'usage' | 'reports' | 'settings';

interface AdminHubLayoutProps {
  onExit: () => void;
  children?: React.ReactNode;
}

export const AdminHubLayout: React.FC<AdminHubLayoutProps> = ({ onExit }) => {
  const [activeModule, setActiveModule] = useState<Module>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  const modules: { id: Module; label: string; labelEn: string; icon: React.FC<{ className?: string }>; enabled: boolean }[] = [
    { id: 'overview', label: 'نظرة عامة', labelEn: 'Overview', icon: LayoutGrid, enabled: true },
    { id: 'attendance', label: 'الحضور والغياب', labelEn: 'Attendance', icon: CalendarCheck, enabled: true },
    { id: 'academics', label: 'التحصيل الأكاديمي', labelEn: 'Academics', icon: BarChart3, enabled: false },
    { id: 'people', label: 'دليل المستخدمين', labelEn: 'People', icon: Users, enabled: false },
    { id: 'usage', label: 'استخدام المنصة', labelEn: 'Usage Analytics', icon: Activity, enabled: false },
    { id: 'reports', label: 'التقارير', labelEn: 'Reports', icon: FileText, enabled: false },
    { id: 'settings', label: 'الإعدادات', labelEn: 'Settings', icon: Settings, enabled: false },
  ];

  const NavItem = ({ mod, ...rest }: { mod: typeof modules[0]; [key: string]: any }) => (
    <button
      onClick={() => { if (mod.enabled) { setActiveModule(mod.id); setIsMobileMenuOpen(false); } }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative overflow-hidden group text-sm
        ${activeModule === mod.id
          ? 'text-sky-700 bg-sky-50'
          : mod.enabled
            ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            : 'text-slate-300 cursor-not-allowed'}
      `}
      disabled={!mod.enabled}
    >
      {activeModule === mod.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full" />}
      <mod.icon className={`w-5 h-5 ${activeModule === mod.id ? 'text-sky-500' : ''}`} />
      <span>{locale === 'ar' ? mod.label : mod.labelEn}</span>
      {!mod.enabled && <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full mr-auto">قريباً</span>}
    </button>
  );

  const handleNavigateToNotifications = () => {
    window.location.href = '/admin/notifications';
  };

  return (
    <div className="flex h-screen bg-slate-100 font-['Cairo'] overflow-hidden text-slate-800 selection:bg-sky-500/30" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
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
        <div className="flex items-center gap-3 mb-8 mt-1">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 leading-none tracking-tight">String</h1>
            <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{t('مركز الإدارة', 'Admin Hub')}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <div className="px-3 mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('الأقسام', 'Modules')}</span></div>
          {modules.map(mod => (
            <NavItem key={mod.id} mod={mod} />
          ))}

          <div className="my-3 border-t border-slate-100" />
          <div className="px-3 mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('أدوات', 'Tools')}</span></div>

          <button onClick={handleNavigateToNotifications}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all">
            <Megaphone className="w-5 h-5" />
            <span>{t('الإشعارات', 'Notifications')}</span>
          </button>
        </nav>

        {/* Footer */}
        <button onClick={onExit}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors mt-auto text-sm">
          <LogOut className="w-5 h-5" />
          <span>{t('العودة', 'Back')}</span>
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-[4.5rem] bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="relative w-full max-w-md hidden md:block group">
              <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input type="text" placeholder={t('بحث...', 'Search...')}
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pr-11 pl-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocale(l => l === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              <Globe className="w-4 h-4" /><span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-sm font-black text-slate-800">{t('مدير النظام', 'System Admin')}</div>
                <div className="text-[11px] font-bold text-slate-400">Admin</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="h-full">
              {activeModule === 'overview' && <OverviewPlaceholder locale={locale} onNavigate={setActiveModule} />}
              {(activeModule === 'attendance' || activeModule === 'attendance-report') && <AttendancePlaceholder locale={locale} module={activeModule} onNavigate={setActiveModule} />}
              {!['overview', 'attendance', 'attendance-report'].includes(activeModule) && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                  <BarChart3 className="w-24 h-24 mb-6 opacity-10" />
                  <h2 className="text-2xl font-black text-slate-300">{locale === 'ar' ? 'قيد التطوير' : 'Coming Soon'}</h2>
                  <p className="font-medium opacity-50">{locale === 'ar' ? 'سيتم إضافة هذا القسم قريباً' : 'This module will be added soon'}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Placeholder — will be replaced by real components
const OverviewPlaceholder: React.FC<{ locale: 'ar' | 'en'; onNavigate: (m: any) => void }> = ({ locale }) => {
  // Lazy import the real component
  const [Comp, setComp] = React.useState<React.FC<any> | null>(null);
  React.useEffect(() => {
    import('./OverviewDashboard').then(m => setComp(() => m.OverviewDashboard));
  }, []);
  if (Comp) return <Comp locale={locale} />;
  return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" /></div>;
};

const AttendancePlaceholder: React.FC<{ locale: 'ar' | 'en'; module: string; onNavigate: (m: any) => void }> = ({ locale, module, onNavigate }) => {
  const [Comp, setComp] = React.useState<React.FC<any> | null>(null);
  React.useEffect(() => {
    if (module === 'attendance-report') {
      import('./attendance/AttendanceReport').then(m => setComp(() => m.AttendanceReport));
    } else {
      import('./attendance/AttendanceDashboard').then(m => setComp(() => m.AttendanceDashboard));
    }
  }, [module]);
  if (Comp) return <Comp locale={locale} onNavigateToReport={() => onNavigate('attendance-report')} onBack={() => onNavigate('attendance')} />;
  return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" /></div>;
};
