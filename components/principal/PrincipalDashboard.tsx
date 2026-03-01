
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, TrendingUp, GraduationCap, ArrowRight,
  TrendingDown, Activity, Calendar, MapPin, 
  Baby, ArrowUpRight, School, UserCheck, BarChart3,
  Target, Zap, PieChart, Clock, Layers, BookOpen, Backpack
} from 'lucide-react';
import { SCHOOL_ENTITIES, GLOBAL_STATS, StageEntity } from '../../data/principalData';

// --- HELPERS ---
const getIcon = (type: string) => {
    switch(type) {
        case 'baby': return <Baby className="w-8 h-8" />;
        case 'backpack': return <Backpack className="w-8 h-8" />;
        case 'book': return <BookOpen className="w-8 h-8" />;
        default: return <GraduationCap className="w-8 h-8" />;
    }
};

// --- CUSTOM WIDGETS ---

// 1. Comparison Widget (Tabbed + Time Filter)
const SchoolComparisonWidget = ({ stages }: { stages: StageEntity[] }) => {
    const [metric, setMetric] = useState<'performance' | 'accuracy' | 'xp'>('performance');
    const [timeFrame, setTimeFrame] = useState<'daily' | 'monthly' | 'semester'>('daily');

    const getMax = () => {
        if (metric === 'xp') return Math.max(...stages.map(s => s.totalXP)) * 1.1;
        return 100;
    };

    const getValue = (stage: StageEntity) => {
        if (metric === 'xp') {
            // Simulate XP variations based on timeframe for demo purposes
            if (timeFrame === 'daily') return stage.totalXP / 30;
            if (timeFrame === 'monthly') return stage.totalXP;
            return stage.totalXP * 4; // Semester
        }
        if (metric === 'accuracy') return stage.accuracy; // Accuracy usually stable
        
        // Performance changes based on time filter (using mock data)
        return stage.performanceData[timeFrame];
    };

    const getLabel = () => {
        if (metric === 'xp') return 'نقاط الخبرة (XP)';
        if (metric === 'accuracy') return 'دقة الإجابات (%)';
        return `الأداء الأكاديمي (${timeFrame === 'daily' ? 'اليومي' : timeFrame === 'monthly' ? 'الشهري' : 'الفصلي'})`;
    };

    const maxVal = getMax();

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden h-full flex flex-col">
            {/* Header / Tabs */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        التحليل المقارن
                    </h3>
                    <p className="text-sm text-slate-400 font-bold">مقارنة المراحل التعليمية</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {/* Time Filter */}
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['daily', 'monthly', 'semester'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTimeFrame(t as any)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                    ${timeFrame === t 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                {t === 'daily' ? 'يومي' : t === 'monthly' ? 'شهري' : 'فصلي'}
                            </button>
                        ))}
                    </div>

                    {/* Metric Filter */}
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {[
                            { id: 'performance', label: 'الأداء', icon: Activity },
                            { id: 'accuracy', label: 'الدقة', icon: Target },
                            { id: 'xp', label: 'النقاط', icon: Zap },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setMetric(tab.id as any)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                    ${metric === tab.id 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dynamic Chart */}
            <div className="flex-1 flex items-end justify-around gap-4 min-h-[200px] w-full px-4">
                {stages.map((stage, i) => {
                    const val = getValue(stage);
                    const heightPercent = Math.max((val / maxVal) * 100, 5); // Min height 5%
                    
                    return (
                    <div key={stage.id} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                        <div className="relative w-full bg-slate-50 rounded-2xl h-full flex items-end overflow-hidden group-hover:bg-slate-100 transition-colors">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className={`w-full rounded-t-2xl bg-gradient-to-t ${stage.color} opacity-80 group-hover:opacity-100 transition-opacity relative`}
                            >
                                <div className="absolute top-0 left-0 right-0 h-px bg-white/50"></div>
                            </motion.div>
                            
                            {/* Value Label */}
                            <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {metric === 'xp' ? (val/1000).toFixed(1) + 'k' : val + '%'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-slate-600 mb-1">{metric === 'xp' ? (val/1000).toFixed(0)+'k' : val + '%'}</div>
                            <div className="text-[10px] font-bold text-slate-400 truncate max-w-[80px] mx-auto">{stage.name.split(' ')[1] || stage.name}</div>
                        </div>
                    </div>
                )})}
            </div>
            
            <div className="absolute top-6 left-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden md:block">
                {getLabel()}
            </div>
        </div>
    );
};

// 2. Active Hours Heatmap (Light Theme)
const ActiveHoursHeatmap = ({ stages }: { stages: StageEntity[] }) => {
    // Hours 0-23
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-xl">
                        <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">خريطة النشاط اليومي</h3>
                        <p className="text-xs text-slate-400 font-medium">توزيع كثافة تفاعل الطلاب خلال اليوم</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-xl">
                    <span>منخفض</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                        <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
                        <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                        <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
                    </div>
                    <span>مرتفع</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[800px] space-y-2">
                    {/* X-Axis Labels */}
                    <div className="flex pl-24 mb-2">
                        {hours.map((h) => (
                            <div key={h} className="flex-1 text-center text-[9px] font-bold text-slate-300">
                                {h % 6 === 0 ? (h === 0 ? '12ص' : h === 12 ? '12م' : h > 12 ? (h-12)+'م' : h+'ص') : ''}
                            </div>
                        ))}
                    </div>

                    {stages.map((stage) => (
                        <div key={stage.id} className="flex items-center gap-4 group">
                            {/* Row Label */}
                            <div className="w-24 text-right shrink-0">
                                <div className="text-xs font-bold text-slate-700">{stage.name}</div>
                                <div className="text-[9px] text-slate-400">{Math.max(...stage.activeHours).toFixed(0)} ذروة</div>
                            </div>
                            
                            {/* Grid Row */}
                            <div className="flex-1 flex gap-1 bg-slate-50 p-1 rounded-lg">
                                {hours.map((h) => {
                                    const intensity = stage.activeHours[h] || 0;
                                    let bgClass = 'bg-slate-100'; // 0-10
                                    let textClass = 'text-slate-400';
                                    
                                    if (intensity > 90) { bgClass = 'bg-emerald-700'; textClass = 'text-emerald-100'; }
                                    else if (intensity > 60) { bgClass = 'bg-emerald-500'; textClass = 'text-white'; }
                                    else if (intensity > 30) { bgClass = 'bg-emerald-300'; textClass = 'text-emerald-800'; }
                                    else if (intensity > 10) { bgClass = 'bg-emerald-100'; textClass = 'text-emerald-700'; }

                                    return (
                                        <div 
                                            key={h} 
                                            className={`flex-1 h-8 rounded-md transition-all relative group/cell ${bgClass} hover:scale-110 hover:shadow-md hover:z-10`}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover/cell:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-20">
                                                {h}:00 - {Math.round(intensity)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. XP Distribution (Donut Sim)
const XPDistributionChart = ({ stages }: { stages: StageEntity[] }) => {
    const totalXP = stages.reduce((acc, s) => acc + s.totalXP, 0);
    
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                توزيع نقاط الخبرة
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-5">
                {stages.sort((a,b) => b.totalXP - a.totalXP).map((stage, idx) => {
                    const percent = Math.round((stage.totalXP / totalXP) * 100);
                    return (
                        <div key={stage.id}>
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stage.color}`}></div>
                                    <span className="text-slate-600">{stage.name}</span>
                                </div>
                                <span className="text-slate-800">{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden flex shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${stage.color}`} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">الإجمالي العام</div>
                <div className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {(totalXP / 1000).toFixed(1)}k
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const KPICard = ({ title, value, sub, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-shadow">
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
            {sub && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                    <span>{sub}</span>
                </div>
            )}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
            <Icon className="w-7 h-7" />
        </div>
    </div>
);

const StageCard: React.FC<{ stage: StageEntity, index: number }> = ({ stage, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
        >
            {/* Header Background */}
            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${stage.color} opacity-10 group-hover:opacity-15 transition-opacity`}></div>
            
            {/* Content */}
            <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-lg`}>
                        {getIcon(stage.icon)}
                    </div>
                    
                    {/* Trend Badge */}
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black bg-white/50 backdrop-blur-sm border border-slate-200/50 flex items-center gap-1
                        ${stage.trend === 'up' ? 'text-emerald-600' : stage.trend === 'down' ? 'text-rose-600' : 'text-slate-500'}
                    `}>
                        {stage.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : stage.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                        {stage.trend === 'up' ? 'صاعد' : stage.trend === 'down' ? 'تراجع' : 'مستقر'}
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight group-hover:text-indigo-900 transition-colors">
                    {stage.name}
                </h3>
                <p className="text-slate-400 text-xs font-bold mb-6">
                    {stage.studentsCount} طالب • {stage.teachersCount} معلم
                </p>

                <div className="mt-auto space-y-4">
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> الأداء
                            </div>
                            <div className="text-lg font-black text-slate-700">{stage.performanceData.daily}%</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                                <Target className="w-3 h-3" /> الدقة
                            </div>
                            <div className="text-lg font-black text-slate-700">{stage.accuracy}%</div>
                        </div>
                    </div>

                    {/* XP Badge */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{(stage.totalXP / 1000).toFixed(1)}k XP</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const PrincipalDashboard: React.FC = () => {
    return (
        <div className="p-8 pb-20 space-y-8">
            
            {/* 1. Global KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="إجمالي الطلاب" 
                    value={GLOBAL_STATS.totalStudents.toLocaleString()} 
                    sub="+45 هذا الشهر" 
                    icon={Users} 
                    trend="up"
                />
                <KPICard 
                    title="الكادر التعليمي" 
                    value={GLOBAL_STATS.totalTeachers} 
                    sub="نسبة إشغال 99%" 
                    icon={School} 
                    trend="stable"
                />
                <KPICard 
                    title="متوسط الحضور اليومي" 
                    value={`${GLOBAL_STATS.avgAttendance}%`} 
                    sub="أعلى من المعدل بـ 1.2%" 
                    icon={UserCheck} 
                    trend="up"
                />
                <KPICard 
                    title="المعدل الأكاديمي العام" 
                    value={`${GLOBAL_STATS.avgPerformance}%`} 
                    sub="تحسن مستمر" 
                    icon={Activity} 
                    trend="up"
                />
            </div>

            {/* 2. Stages Navigation Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">المراحل الدراسية</h2>
                        <p className="text-slate-500 font-medium">نظرة عامة على أداء ومقاييس كل مرحلة</p>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
                        إدارة المراحل
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SCHOOL_ENTITIES.map((stage, idx) => (
                        <StageCard key={stage.id} stage={stage} index={idx} />
                    ))}
                </div>
            </div>

            {/* 3. Deep Dive Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Tabbed Comparison Widget */}
                <div className="lg:col-span-2">
                    <SchoolComparisonWidget stages={SCHOOL_ENTITIES} />
                </div>

                {/* Right: XP Distribution */}
                <div className="lg:col-span-1">
                    <XPDistributionChart stages={SCHOOL_ENTITIES} />
                </div>
            </div>

            {/* 4. Activity Heatmap Section */}
            <div>
                <ActiveHoursHeatmap stages={SCHOOL_ENTITIES} />
            </div>
        </div>
    );
};
