
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Settings, LogOut,
  Search, Bell, Menu, X, BrainCircuit
} from 'lucide-react';
import { MasterDashboard } from './MasterDashboard';
import { CurriculumDashboard } from './CurriculumDashboard';
import { ClassesDashboard } from './ClassesDashboard';
import { TeacherSkillMapPage } from '../../pages/TeacherSkillMapPage';

interface TeacherLayoutProps {
    onLogout: () => void;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'curriculum' | 'skill-map'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavItem = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                ${activeTab === id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-['Cairo'] overflow-hidden">
            
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col p-4 shrink-0">
                <div className="p-4 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">
                        M
                    </div>
                    <div>
                        <div className="font-black text-lg leading-none">المعلم</div>
                        <div className="text-xs text-slate-400 font-medium">لوحة التحكم</div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem id="overview" label="نظرة عامة" icon={LayoutDashboard} />
                    <NavItem id="classes" label="الطلاب والصفوف" icon={Users} />
                    <NavItem id="curriculum" label="المنهج والتحليل" icon={BookOpen} />
                    <NavItem id="skill-map" label="خريطة المهارات" icon={BrainCircuit} />
                    <NavItem id="settings" label="الإعدادات" icon={Settings} />
                </nav>

                <button 
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    <span>خروج</span>
                </button>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50">
                <div className="font-black text-lg">لوحة المعلم</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-16 bg-slate-900 z-40 p-4 space-y-2 md:hidden"
                    >
                        <NavItem id="overview" label="نظرة عامة" icon={LayoutDashboard} />
                        <NavItem id="classes" label="الطلاب والصفوف" icon={Users} />
                        <NavItem id="curriculum" label="المنهج والتحليل" icon={BookOpen} />
                        <NavItem id="skill-map" label="خريطة المهارات" icon={BrainCircuit} />
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 font-bold">
                            <LogOut className="w-5 h-5" /> خروج
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="بحث سريع عن طالب أو فصل..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm font-bold focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" alt="Admin" />
                        </div>
                    </div>
                </header>

                {/* Content Views */}
                <div className="min-h-[calc(100vh-64px)]">
                    {activeTab === 'overview' && <MasterDashboard />}
                    
                    {activeTab === 'classes' && <ClassesDashboard />}
                    
                    {activeTab === 'curriculum' && <CurriculumDashboard />}

                    {activeTab === 'skill-map' && <TeacherSkillMapPage />}

                    {activeTab === 'settings' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                            <Settings className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-bold">الإعدادات قريباً</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
