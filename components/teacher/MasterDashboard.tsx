import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Clock, Target, TrendingUp, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, BookOpen, BarChart3, 
  PieChart, GraduationCap, ArrowRight
} from 'lucide-react';
import { getSchoolStats, getGradePerformance, getSubjectPerformance, getCriticalAlerts } from '../../utils/teacherAggregator';

// --- Sub-components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass.replace('bg-', 'text-')}`}>
            <Icon className="w-24 h-24" />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{trend === 'up' ? '+12%' : '-5%'}</span>
                </div>
            )}
        </div>
        
        <div className="relative z-10">
            <div className="text-3xl font-black text-slate-800 mb-1">{value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{title}</div>
            {subtext && <div className="text-xs text-slate-500 mt-2 font-medium">{subtext}</div>}
        </div>
    </div>
);

const AlertRow: React.FC<{ alert: any }> = ({ alert }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-3 ${
        alert.type === 'danger' ? 'bg-rose-50 border-rose-100' : 
        alert.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
    }`}>
        <div className={`p-2 rounded-full shrink-0 ${
             alert.type === 'danger' ? 'bg-rose-100 text-rose-600' : 
             alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
        }`}>
            <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
            <div className={`font-bold text-sm ${
                alert.type === 'danger' ? 'text-rose-800' : 
                alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
            }`}>
                {alert.message}
            </div>
            <div className="text-xs opacity-70 font-medium">تم الرصد قبل قليل</div>
        </div>
        <div className="text-xl font-black">{alert.count}</div>
    </div>
);

export const MasterDashboard: React.FC = () => {
    const stats = useMemo(() => getSchoolStats(), []);
    const grades = useMemo(() => getGradePerformance(), []);
    const subjects = useMemo(() => getSubjectPerformance(), []);
    const alerts = useMemo(() => getCriticalAlerts(), []);

    // Helper for subject names
    const getSubjectName = (key: string) => {
        const map: any = { math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', history: 'التاريخ', arts: 'الفنون' };
        return map[key] || key;
    };

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">لوحة التحكم الرئيسية</h1>
                <p className="text-slate-500 font-medium">نظرة شاملة على أداء المدرسة، النشاط، والتنبيهات.</p>
            </div>

            {/* 1. KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="الطلاب النشطين" 
                    value={stats.activeStudents} 
                    subtext={`من أصل ${stats.totalStudents} طالب (${stats.activePercentage}%)`}
                    icon={Users} 
                    colorClass="bg-blue-500"
                    trend="up"
                />
                <StatCard 
                    title="متوسط الدقة" 
                    value={`${stats.avgAccuracy}%`} 
                    subtext="معدل الإجابات الصحيحة في المدرسة"
                    icon={Target} 
                    colorClass="bg-emerald-500"
                    trend="up"
                />
                <StatCard 
                    title="ساعات التعلم" 
                    value={stats.totalHours.toLocaleString()} 
                    subtext="إجمالي ساعات الدراسة هذا الشهر"
                    icon={Clock} 
                    colorClass="bg-purple-500"
                    trend="up"
                />
                <StatCard 
                    title="متوسط نقاط XP" 
                    value={stats.avgXP.toLocaleString()} 
                    subtext="لكل طالب نشط"
                    icon={Activity} 
                    colorClass="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. Performance By Grade (Bar Chart Sim) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> 
                            الأداء حسب الصف الدراسي
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> الدقة</div>
                             <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span> النشاط</div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-48 gap-4 px-2">
                        {grades.map((g) => (
                            <div key={g.grade} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                {/* Stacked Bar */}
                                <div className="w-full max-w-[40px] flex flex-col-reverse h-full justify-end gap-1">
                                    <div className="relative w-full bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-[60%]">
                                         <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${g.avgAccuracy}%` }}
                                            className="w-full bg-indigo-500 rounded-t-lg"
                                         />
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-500">صف {g.grade}</span>
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xl whitespace-nowrap pointer-events-none">
                                    دقة: {g.avgAccuracy}% | XP: {g.avgXP}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Subject Heatmap (Ranked List) */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6">
                        <PieChart className="w-5 h-5 text-purple-500" /> 
                        أداء المواد الدراسية
                    </h3>
                    <div className="space-y-4">
                        {subjects.map((s, idx) => (
                            <div key={s.subject} className="flex items-center gap-4">
                                <div className="w-8 text-sm font-black text-slate-300">#{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700">{getSubjectName(s.subject)}</span>
                                        <span className={`${s.score < 60 ? 'text-rose-500' : 'text-slate-500'}`}>{s.score}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.score}%` }}
                                            className={`h-full rounded-full ${
                                                s.score >= 80 ? 'bg-emerald-400' : 
                                                s.score >= 60 ? 'bg-blue-400' : 'bg-rose-400'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 4. Critical Alerts & Leaderboard Teaser */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Alerts */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> 
                            تنبيهات عاجلة
                        </h3>
                        {alerts.length > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-full">{alerts.length}</span>}
                    </div>
                    {alerts.length > 0 ? (
                        <div>
                            {alerts.map((alert, i) => (
                                <AlertRow key={i} alert={alert} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Target className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>كل شيء يسير على ما يرام!</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Leaderboard Teaser */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                     
                     <div className="relative z-10">
                        <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-yellow-400" />
                            أبطال الأسبوع
                        </h3>
                        <p className="text-slate-300 text-sm mb-6">
                            الصف <strong>4/A</strong> يتصدر المنافسة بفارق <strong>1200 نقطة</strong>.
                        </p>

                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md mb-2">
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-black">1</div>
                            <div>
                                <div className="font-bold text-sm">الصف الرابع (أ)</div>
                                <div className="text-xs text-slate-300">24,500 XP</div>
                            </div>
                        </div>
                     </div>

                     <button className="relative z-10 w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                         عرض التفاصيل <ArrowRight className="w-4 h-4" />
                     </button>
                </div>

            </div>
        </div>
    );
};