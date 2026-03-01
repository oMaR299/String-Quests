
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Building2, Users, FileText, Settings, 
  LogOut, Bell, Search, Menu, X, CheckCircle2,
  PieChart, GraduationCap
} from 'lucide-react';
import { PrincipalDashboard } from './PrincipalDashboard';

interface PrincipalLayoutProps {
    onLogout: () => void;
}

export const PrincipalLayout: React.FC<PrincipalLayoutProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'reports'>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavItem = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all relative overflow-hidden group
                ${activeTab === id 
                    ? 'text-white bg-white/10 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
        >
            {activeTab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full" />}
            <Icon className={`w-5 h-5 ${activeTab === id ? 'text-emerald-400' : ''}`} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-[#0f172a] font-['Cairo'] overflow-hidden text-slate-100 selection:bg-emerald-500/30">
            
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-72 bg-[#0f172a] border-l border-white/5 flex-col p-6 shrink-0 relative">
                {/* Logo Area */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl text-white leading-none tracking-tight">EduMatrix</h1>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">الإدارة العليا</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem id="dashboard" label="لوحة القيادة" icon={LayoutGrid} />
                    <NavItem id="schools" label="إدارة المدارس" icon={Building2} />
                    <NavItem id="staff" label="الكادر التعليمي" icon={Users} />
                    <NavItem id="reports" label="التقارير والتحليلات" icon={PieChart} />
                    <NavItem id="settings" label="إعدادات النظام" icon={Settings} />
                </nav>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-400">حالة النظام</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        جميع الأنظمة تعمل بكفاءة. تم تحديث البيانات قبل دقيقة.
                    </div>
                </div>

                <button 
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    <span>تسجيل خروج</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-[#f8fafc] rounded-r-[2.5rem] lg:rounded-r-[3rem] lg:my-4 lg:mr-4 overflow-hidden shadow-2xl">
                
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-lg hidden md:block group">
                            <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="بحث شامل: طالب، معلم، فصل، أو مدرسة..." 
                                className="w-full bg-slate-100 border-none rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                            />
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-200 shadow-sm">⌘ K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors group">
                            <Bell className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-black text-slate-800">د. عبدالله العمر</div>
                                <div className="text-xs font-bold text-slate-400">المدير العام</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-md overflow-hidden">
                                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Principal&backgroundColor=b6e3f4" alt="Principal" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Views */}
                <div className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
                    {activeTab === 'dashboard' && <PrincipalDashboard />}
                    
                    {activeTab !== 'dashboard' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                            <Building2 className="w-24 h-24 mb-6 opacity-10" />
                            <h2 className="text-2xl font-black text-slate-300">هذا القسم قيد التطوير</h2>
                            <p className="font-medium opacity-50">سيتم إضافة محتوى {activeTab} قريباً</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
