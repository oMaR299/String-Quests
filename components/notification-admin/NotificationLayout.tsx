import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, LayoutGrid, FileText, ClipboardList,
  LogOut, Menu, X, Search, Megaphone, Globe
} from 'lucide-react';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { NotificationDashboard } from './NotificationDashboard';
import { ComposeNotification } from './ComposeNotification';
import { TemplateGallery } from './templates/TemplateGallery';
import { FormBuilder } from './form-builder/FormBuilder';

type Tab = 'dashboard' | 'compose' | 'templates' | 'forms';

interface NotificationLayoutProps {
  onExit: () => void;
}

export const NotificationLayout: React.FC<NotificationLayoutProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');

  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  const handleCompose = (notificationId?: string) => {
    setEditingNotificationId(notificationId ?? null);
    setActiveTab('compose');
  };

  const NavItem = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: React.FC<{ className?: string }> }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); setEditingNotificationId(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all relative overflow-hidden group
        ${activeTab === id
          ? 'text-sky-700 bg-sky-50'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
      `}
    >
      {activeTab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full" />}
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-sky-500' : ''}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-100 font-['Cairo'] overflow-hidden text-slate-800 selection:bg-sky-500/30" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar — Clean White */}
        <aside className={`
          fixed lg:relative z-50 lg:z-auto h-full
          w-72 bg-white border-r border-slate-200 flex-col p-6 shrink-0
          transition-transform lg:transition-none duration-300 shadow-sm
          ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full lg:translate-x-0 lg:flex hidden lg:flex'}
        `}>
          {/* Mobile close */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute top-4 left-4 text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>

          {/* Logo Area */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 leading-none tracking-tight">String</h1>
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">{t('مركز الإشعارات', 'Notification Center')}</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem id="dashboard" label={t('لوحة التحكم', 'Dashboard')} icon={LayoutGrid} />
            <NavItem id="compose" label={t('إنشاء إشعار', 'Compose')} icon={Send} />
            <NavItem id="templates" label={t('القوالب', 'Templates')} icon={FileText} />
            <NavItem id="forms" label={t('النماذج', 'Forms')} icon={ClipboardList} />
          </nav>

          {/* Stats Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-bold text-sky-600">{t('مركز الإشعارات', 'Notification Center')}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {t('إدارة جميع إشعارات المدرسة من مكان واحد.', 'Manage all school notifications from one place.')}
            </div>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('العودة', 'Back')}</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-hidden">

          {/* Header */}
          <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile menu toggle */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                <Menu className="w-6 h-6 text-slate-600" />
              </button>

              <div className="relative w-full max-w-lg hidden md:block group">
                <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t('بحث في الإشعارات...', 'Search notifications...')}
                  className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={() => setLocale(l => l === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              <button
                onClick={() => handleCompose()}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t('إشعار جديد', 'New Notification')}</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-black text-slate-800">{t('مدير النظام', 'System Admin')}</div>
                  <div className="text-xs font-bold text-slate-400">Admin</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && <NotificationDashboard onCompose={handleCompose} />}
                {activeTab === 'compose' && <ComposeNotification editingId={editingNotificationId} onDone={() => setActiveTab('dashboard')} />}
                {activeTab === 'templates' && <TemplateGallery onUseTemplate={(tmpl) => { setActiveTab('compose'); }} />}
                {activeTab === 'forms' && <FormBuilder />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
};
