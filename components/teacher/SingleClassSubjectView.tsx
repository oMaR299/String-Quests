
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, FlaskConical, Languages, Landmark, Palette, Trophy, 
  BarChart3, Users, Clock, Target, AlertTriangle, CheckCircle2, 
  MoreHorizontal, Download, BrainCircuit, Atom, Dna, Monitor, Book, Globe, Filter, User,
  Sun, Moon, TrendingUp, HelpCircle, Activity, Layers
} from 'lucide-react';
import { StudentProfile, Subject, SUBJECT_UNITS } from '../../data/complexLeaderboardData';
import { getClassSubjectStats } from '../../utils/teacherAggregator';

interface SingleClassSubjectViewProps {
    grade: number;
    section: string;
    subject: Subject;
    students: StudentProfile[];
    onBack: () => void;
    onStudentClick: (student: StudentProfile) => void;
    onUnitClick: (unit: string) => void;
}

const SubjectIcon = ({ subject, className }: { subject: string, className?: string }) => {
  switch(subject) {
    case 'math': return <Calculator className={className} />;
    case 'science': return <FlaskConical className={className} />;
    case 'languages': return <Languages className={className} />;
    case 'english': return <Languages className={className} />;
    case 'history': return <Landmark className={className} />;
    case 'arts': return <Palette className={className} />;
    case 'physics': return <Atom className={className} />;
    case 'chemistry': return <FlaskConical className={className} />;
    case 'biology': return <Dna className={className} />;
    case 'computer': return <Monitor className={className} />;
    case 'islamic': return <Book className={className} />;
    case 'social': return <Globe className={className} />;
    default: return <Trophy className={className} />;
  }
};

const getSubjectLabel = (s: string) => {
    const map: any = { 
        math: 'الرياضيات', science: 'العلوم العامة', languages: 'اللغة العربية', 
        history: 'التاريخ', arts: 'الفنون', physics: 'الفيزياء', chemistry: 'الكيمياء',
        biology: 'الأحياء', computer: 'الحاسوب', islamic: 'التربية الإسلامية',
        social: 'الدراسات الاجتماعية', english: 'اللغة الإنجليزية'
    };
    return map[s] || s;
};

const getSubjectColor = (s: string) => {
    const map: any = {
        math: 'blue', science: 'emerald', languages: 'purple', history: 'amber', arts: 'pink'
    };
    return map[s] || 'indigo';
}

const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}د`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}س ${m}د`;
};

const formatHour = (h: number) => {
    if(h === 0) return '12 ص';
    if(h === 12) return '12 م';
    return h > 12 ? `${h-12} م` : `${h} ص`;
};

export const SingleClassSubjectView: React.FC<SingleClassSubjectViewProps> = ({ 
    grade, section, subject, students, onBack, onStudentClick, onUnitClick
}) => {
    const stats = useMemo(() => getClassSubjectStats(students, subject), [students, subject]);
    const colorTheme = getSubjectColor(subject);

    if (!stats) return <div>No Data</div>;

    // Determine Peak Hour
    const peakHourIndex = stats.hourlyActivity.indexOf(Math.max(...stats.hourlyActivity));

    return (
        <div className="p-6 md:p-8 space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-lg">الصف {grade}/{section}</span>
                            <span>•</span>
                            <span>{students.length} طالب</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
                            <div className={`p-2 rounded-2xl bg-${colorTheme}-100 text-${colorTheme}-600 shadow-sm`}>
                                <SubjectIcon subject={subject} className="w-8 h-8" />
                            </div>
                            {getSubjectLabel(subject)}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        <span className="hidden md:inline">تقرير PDF</span>
                    </button>
                    <button className={`flex items-center gap-2 px-5 py-3 bg-${colorTheme}-600 text-white rounded-2xl font-bold hover:bg-${colorTheme}-700 transition-all shadow-lg shadow-${colorTheme}-500/20`}>
                        <BrainCircuit className="w-5 h-5" /> 
                        <span>إنشاء اختبار ذكي</span>
                    </button>
                </div>
            </div>

            {/* 1. Overview KPIs (Redesigned) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Score Card */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${colorTheme}-50 rounded-full blur-2xl group-hover:bg-${colorTheme}-100 transition-colors`}></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className={`p-2 rounded-xl bg-${colorTheme}-50 text-${colorTheme}-600`}>
                            <Target className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stats.avgAccuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {stats.avgAccuracy >= 80 ? '+ مميز' : 'عادي'}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-black text-slate-800">{stats.avgAccuracy}%</div>
                        <div className="text-xs font-bold text-slate-400">متوسط الدقة</div>
                    </div>
                </div>

                {/* Time Card */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-black text-slate-800" dir="ltr">{formatTime(stats.avgTime)}</div>
                        <div className="text-xs font-bold text-slate-400">متوسط وقت الدراسة</div>
                    </div>
                </div>

                {/* Struggling Card */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100 transition-colors"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-rose-100 text-rose-600">تنبيه</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-black text-slate-800">{stats.strugglingCount}</div>
                        <div className="text-xs font-bold text-slate-400">طلاب يحتاجون لدعم</div>
                    </div>
                </div>

                {/* Excelling Card */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-black text-slate-800">{stats.excellingCount}</div>
                        <div className="text-xs font-bold text-slate-400">طلاب متفوقون</div>
                    </div>
                </div>
            </div>

            {/* 2. Deep Dive Visualizations (Pulse & Distribution) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. Class Activity Pulse (Hourly) */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-500" />
                            نبض نشاط الفصل
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
                            <Sun className="w-4 h-4 text-amber-400" />
                            الذروة: {formatHour(peakHourIndex)}
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-40 gap-1 pb-2">
                        {stats.hourlyActivity.map((val, hour) => {
                            // Normalize for visual (ensure minimum height)
                            const heightPercent = Math.max(val, 5); 
                            const isPeak = hour === peakHourIndex;
                            let color = "bg-slate-200";
                            if(hour >= 6 && hour < 18) color = "bg-amber-200"; // Day
                            else color = "bg-indigo-200"; // Night
                            if(isPeak) color = "bg-emerald-400";

                            return (
                                <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.6, delay: hour * 0.02 }}
                                        className={`w-full rounded-t-sm ${color} opacity-80 group-hover:opacity-100 transition-all`}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap pointer-events-none">
                                        {formatHour(hour)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-1"><Moon className="w-3 h-3" /> صباحاً</div>
                        <div className="flex items-center gap-1"><Sun className="w-3 h-3" /> ظهراً</div>
                        <div className="flex items-center gap-1"><Moon className="w-3 h-3" /> مساءً</div>
                    </div>
                </div>

                {/* B. Accuracy Distribution (Score Buckets) */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            توزيع مستويات الطلاب
                        </h3>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-6">
                        {/* Excellent Tier */}
                        <div className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-bold text-slate-600">ممتاز (90%+)</span>
                                </div>
                                <span className="text-xl font-black text-emerald-600">{stats.distributionBuckets.excellent}</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.distributionBuckets.excellent / students.length) * 100}%` }}
                                    className="h-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Good Tier */}
                        <div className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-bold text-slate-600">جيد جداً (75-90%)</span>
                                </div>
                                <span className="text-xl font-black text-blue-600">{stats.distributionBuckets.good}</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.distributionBuckets.good / students.length) * 100}%` }}
                                    className="h-full bg-blue-400 group-hover:bg-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Struggling Tier */}
                        <div className="group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <span className="text-sm font-bold text-slate-600">يحتاج دعم (&lt; 60%)</span>
                                </div>
                                <span className="text-xl font-black text-rose-600">{stats.distributionBuckets.struggling}</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.distributionBuckets.struggling / students.length) * 100}%` }}
                                    className="h-full bg-rose-400 group-hover:bg-rose-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Unit Performance Grid */}
            <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 text-lg">
                        <Layers className={`w-5 h-5 text-${colorTheme}-500`} /> 
                        تفاصيل الدروس والوحدات
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.unitStats.map((unit) => (
                        <div 
                            key={unit.name} 
                            onClick={() => onUnitClick(unit.name)}
                            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col cursor-pointer"
                        >
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">وحدة</span>
                                    <h4 className="font-black text-slate-700 capitalize text-lg leading-tight mt-1 group-hover:text-blue-600 transition-colors">{unit.name.replace('_', ' ')}</h4>
                                </div>
                                <span className={`text-sm font-black px-2 py-1 rounded-lg ${unit.avgAccuracy >= 80 ? 'bg-emerald-50 text-emerald-600' : unit.avgAccuracy < 60 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {unit.avgAccuracy}%
                                </span>
                            </div>

                            {/* Main Progress Bar */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${unit.avgAccuracy}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full rounded-full ${
                                        unit.avgAccuracy >= 80 ? 'bg-emerald-400' : 
                                        unit.avgAccuracy < 60 ? 'bg-rose-400' : `bg-${colorTheme}-400`
                                    }`}
                                />
                            </div>

                            {/* Mini Distribution Chart within Card */}
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-400">توزيع الدرجات</span>
                                </div>
                                <div className="flex gap-1 h-8 items-end">
                                    {/* Low */}
                                    <div className="flex-1 bg-rose-50 rounded-sm relative group/bar">
                                        <div className="absolute bottom-0 w-full bg-rose-300 rounded-sm" style={{ height: `${(unit.distribution.low / students.length) * 100}%` }}></div>
                                    </div>
                                    {/* Mid */}
                                    <div className="flex-1 bg-blue-50 rounded-sm relative group/bar">
                                        <div className="absolute bottom-0 w-full bg-blue-300 rounded-sm" style={{ height: `${(unit.distribution.mid / students.length) * 100}%` }}></div>
                                    </div>
                                    {/* High */}
                                    <div className="flex-1 bg-emerald-50 rounded-sm relative group/bar">
                                        <div className="absolute bottom-0 w-full bg-emerald-300 rounded-sm" style={{ height: `${(unit.distribution.high / students.length) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-slate-300 mt-1 uppercase">
                                    <span>Low</span>
                                    <span>Avg</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Detailed Student Roster */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-700 flex items-center gap-2 text-lg">
                        <Users className={`w-5 h-5 text-${colorTheme}-500`} /> 
                        سجل الطلاب
                    </h3>
                    <button className="text-slate-400 hover:text-slate-600">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">الطالب</th>
                                <th className="px-6 py-4">XP المادة</th>
                                <th className="px-6 py-4">الدقة</th>
                                <th className="px-6 py-4">آخر 5 دروس</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600 text-sm">
                            {stats.processedStudents.map((student) => (
                                <tr 
                                    key={student.id} 
                                    onClick={() => onStudentClick(student)}
                                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full ${student.avatar} border border-slate-200 flex items-center justify-center text-slate-500 font-bold`}>
                                                {student.name[0]}
                                            </div>
                                            <span className="font-bold text-slate-800">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-700">{student.subjectXP.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${student.subjectAccuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : student.subjectAccuracy < 60 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {student.subjectAccuracy}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1.5">
                                            {student.history.map((status: string, i: number) => (
                                                <div 
                                                    key={i} 
                                                    className={`w-2.5 h-2.5 rounded-full ${status === 'good' ? 'bg-emerald-400' : status === 'avg' ? 'bg-yellow-400' : 'bg-rose-400'}`} 
                                                    title={status}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.subjectAccuracy >= 90 ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-100">
                                                <CheckCircle2 className="w-3 h-3" /> متفوق
                                            </span>
                                        ) : student.subjectAccuracy < 60 ? (
                                            <span className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-full w-fit border border-rose-100">
                                                <AlertTriangle className="w-3 h-3" /> يحتاج دعم
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-bold">مستقر</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <button className="text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">
                                            <User className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
