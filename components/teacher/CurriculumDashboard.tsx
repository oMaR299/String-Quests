
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, FlaskConical, Languages, Landmark, Palette, 
  Trophy, BookOpen, Layers, Users, BarChart3, ArrowRight,
  Atom, Dna, Monitor, Scale, Globe, Book, Eye, LayoutGrid,
  Filter, TrendingDown, TrendingUp, AlertTriangle, X, CheckCircle2
} from 'lucide-react';
import { getClassComparisonBySubject, getSupervisorMatrix, getGradeSubjectDetails, getSchoolStats } from '../../utils/teacherAggregator';
import { SUBJECT_UNITS, Subject, GRADE_GROUPS } from '../../data/complexLeaderboardData';

// --- Icons Helper ---
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

// --- SUB-COMPONENT: Teacher Subject View ---
const TeacherSubjectView = ({ subject }: { subject: string }) => {
    const comparisonData = useMemo(() => getClassComparisonBySubject(subject), [subject]);
    const units = SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] || [];
    const bestClass = comparisonData[0];
    const worstClass = comparisonData[comparisonData.length - 1];

    if (comparisonData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p>لا توجد بيانات لهذا المادة حالياً</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-slate-700 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            أداء فصولك في {getSubjectLabel(subject)}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {comparisonData.map((cls, idx) => (
                            <div key={cls.id} className="group">
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-slate-700 w-16 text-right">
                                            {cls.grade}/{cls.section}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">
                                            {cls.studentCount} طالب
                                        </span>
                                    </div>
                                    <span className={`font-black ${cls.avgScore >= 80 ? 'text-emerald-500' : cls.avgScore >= 60 ? 'text-blue-500' : 'text-rose-500'}`}>
                                        {cls.avgScore}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cls.avgScore}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                                        className={`h-full rounded-full relative ${
                                            cls.avgScore >= 80 ? 'bg-emerald-400' : 
                                            cls.avgScore >= 60 ? 'bg-blue-400' : 'bg-rose-400'
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                         <div>
                             <div className="text-xs font-bold text-emerald-600 uppercase mb-1">الصف المتفوق</div>
                             <div className="text-2xl font-black text-emerald-800">
                                 {bestClass.grade}/{bestClass.section}
                             </div>
                             <div className="text-emerald-600 text-xs font-bold mt-1">
                                 دقة {bestClass.avgScore}%
                             </div>
                         </div>
                         <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                             <Trophy className="w-6 h-6" />
                         </div>
                     </div>

                     <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex items-center justify-between">
                         <div>
                             <div className="text-xs font-bold text-rose-600 uppercase mb-1">يحتاج دعم</div>
                             <div className="text-2xl font-black text-rose-800">
                                 {worstClass.grade}/{worstClass.section}
                             </div>
                             <div className="text-rose-600 text-xs font-bold mt-1">
                                 دقة {worstClass.avgScore}%
                             </div>
                         </div>
                         <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center text-rose-700">
                             <Users className="w-6 h-6" />
                         </div>
                     </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
                <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6">
                    <Layers className="w-5 h-5 text-purple-500" /> وحدات المادة
                </h3>
                <div className="space-y-3">
                    {units.map((unit, i) => (
                        <div key={unit} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors group cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-black text-slate-400 border border-slate-200 group-hover:border-purple-200 group-hover:text-purple-500 transition-colors">
                                        {i + 1}
                                    </span>
                                    <span className="font-bold text-slate-700 capitalize">{unit.replace('_', ' ')}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    + إضافة وحدة جديدة
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Supervisor Matrix View (Enhanced) ---
const SupervisorMatrixView = () => {
    const [gradeFilter, setGradeFilter] = useState<'all' | 'elem' | 'middle' | 'high'>('all');
    const [selectedCell, setSelectedCell] = useState<{ grade: number, subject: string } | null>(null);

    const schoolStats = useMemo(() => getSchoolStats(), []);
    const matrixData = useMemo(() => getSupervisorMatrix(), []);
    const subjects = Object.keys(SUBJECT_UNITS) as Subject[];

    // Filtering Logic
    const filteredRows = useMemo(() => {
        if (gradeFilter === 'all') return matrixData;
        
        const ranges = {
            'elem': [1,2,3,4,5],
            'middle': [6,7,8,9],
            'high': [10,11,12]
        };
        const allowedGrades = ranges[gradeFilter];
        return matrixData.filter(row => allowedGrades.includes(row.grade));
    }, [matrixData, gradeFilter]);

    // Drill-down Data
    const drillDownData = useMemo(() => {
        if (!selectedCell) return null;
        return getGradeSubjectDetails(selectedCell.grade, selectedCell.subject);
    }, [selectedCell]);

    return (
        <div className="flex flex-col gap-6 relative h-full">
            
            {/* 1. Supervisor Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{schoolStats.totalStudents}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">إجمالي الطلاب</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{schoolStats.avgAccuracy}%</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">متوسط المدرسة</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">3</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">صفوف تحتاج متابعة</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">الصف 4</div>
                        <div className="text-xs text-slate-400 font-bold uppercase">الأعلى أداءً</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 h-full min-h-[500px]">
                {/* 2. Main Matrix Area */}
                <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
                    
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-black text-slate-700">الخريطة الحرارية للأداء</h3>
                        </div>
                        
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'elem', label: 'ابتدائي' },
                                { id: 'middle', label: 'متوسط' },
                                { id: 'high', label: 'ثانوي' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setGradeFilter(f.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${gradeFilter === f.id ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar relative">
                        <table className="w-full text-center border-collapse">
                            <thead className="sticky top-0 z-20 shadow-sm">
                                <tr className="bg-slate-50">
                                    <th className="p-4 text-xs font-black text-slate-400 uppercase sticky right-0 z-30 bg-slate-50 border-b border-l border-slate-100 w-28">
                                        الصف
                                    </th>
                                    {subjects.map(subj => (
                                        <th key={subj} className="p-4 min-w-[100px] border-b border-slate-100">
                                            <div className="flex flex-col items-center gap-2 group">
                                                <SubjectIcon subject={subj} className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-bold text-slate-500">{getSubjectLabel(subj).split(' ')[0]}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRows.map((row) => (
                                    <tr key={row.grade} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-black text-slate-700 sticky right-0 bg-white z-10 border-l border-slate-100 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">{row.grade}</div>
                                                <span className="text-sm">الصف</span>
                                            </div>
                                        </td>
                                        {subjects.map(subj => {
                                            const val = row[subj];
                                            let bgClass = "bg-slate-50/30";
                                            let textClass = "text-slate-300";
                                            let ringClass = "";
                                            
                                            // Heatmap Logic
                                            if (val !== null) {
                                                if (val >= 90) { bgClass = "bg-emerald-500"; textClass = "text-white"; }
                                                else if (val >= 80) { bgClass = "bg-emerald-400"; textClass = "text-white"; }
                                                else if (val >= 70) { bgClass = "bg-emerald-300"; textClass = "text-white"; }
                                                else if (val >= 60) { bgClass = "bg-yellow-400"; textClass = "text-yellow-900"; }
                                                else if (val >= 50) { bgClass = "bg-orange-400"; textClass = "text-white"; }
                                                else { bgClass = "bg-rose-500"; textClass = "text-white"; ringClass="ring-2 ring-rose-200 ring-offset-1"; }
                                            }

                                            const isSelected = selectedCell?.grade === row.grade && selectedCell?.subject === subj;

                                            return (
                                                <td key={`${row.grade}-${subj}`} className="p-2">
                                                    <button 
                                                        onClick={() => setSelectedCell({ grade: row.grade, subject: subj })}
                                                        className={`w-full h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-200 transform
                                                            ${bgClass} ${textClass} ${ringClass}
                                                            ${isSelected ? 'scale-110 shadow-lg ring-4 ring-indigo-200 z-10 relative' : 'hover:scale-105 hover:shadow-md'}
                                                        `}
                                                    >
                                                        {val !== null ? `${val}%` : '-'}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Drill-Down Side Panel */}
                <AnimatePresence>
                    {selectedCell && drillDownData && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col shrink-0"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                        <SubjectIcon subject={drillDownData.subject} className="w-5 h-5" />
                                        <span className="font-bold text-sm">{getSubjectLabel(drillDownData.subject)}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800">الصف {drillDownData.grade}</h3>
                                </div>
                                <button onClick={() => setSelectedCell(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                
                                {/* Section Breakdown */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3">مقارنة الشعب</h4>
                                    <div className="space-y-2">
                                        {drillDownData.sectionStats.map((sec) => (
                                            <div key={sec.section} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <span className="font-bold text-slate-700">شعبة {sec.section}</span>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-black ${sec.avg >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {sec.avg}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Students */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <Trophy className="w-3 h-3 text-yellow-500" /> المتفوقون
                                    </h4>
                                    <div className="space-y-2">
                                        {drillDownData.topStudents.length > 0 ? drillDownData.topStudents.map(s => (
                                            <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className={`w-8 h-8 rounded-full ${s.avatar} border border-slate-100 shadow-sm`}></div>
                                                <div className="flex-1 text-sm font-bold text-slate-700">{s.name}</div>
                                                <div className="text-xs font-black text-emerald-600">{(s.subjectDetails as any)[drillDownData.subject].accuracy}%</div>
                                            </div>
                                        )) : <p className="text-xs text-slate-400">لا يوجد بيانات كافية</p>}
                                    </div>
                                </div>

                                {/* Weakest Units */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <TrendingDown className="w-3 h-3 text-rose-500" /> نقاط الضعف
                                    </h4>
                                    <div className="space-y-2">
                                        {drillDownData.unitStats.slice(0,2).map(u => (
                                            <div key={u.name} className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-bold text-rose-800 capitalize">{u.name.replace('_', ' ')}</span>
                                                    <span className="text-xs font-black text-rose-600">{u.avg}%</span>
                                                </div>
                                                <div className="h-1.5 bg-rose-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500" style={{ width: `${u.avg}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export const CurriculumDashboard: React.FC = () => {
    // Role Simulation State
    const [role, setRole] = useState<'teacher' | 'supervisor'>('teacher');
    const [selectedTeacherSubject, setSelectedTeacherSubject] = useState<string>('math');

    const teacherSubjects = ['math', 'science', 'physics', 'computer']; // Mock subjects a specific teacher might teach

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-full pb-20">
            {/* Header & Role Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">
                        {role === 'teacher' ? 'لوحة مادتي' : 'التحليل الأكاديمي العام'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {role === 'teacher' 
                            ? 'تحليل تفصيلي لأداء طلابك في الفصول المختلفة.' 
                            : 'نظرة شاملة على أداء المدرسة عبر جميع الصفوف والمواد.'}
                    </p>
                </div>

                <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
                    <button 
                        onClick={() => setRole('teacher')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                            ${role === 'teacher' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <BookOpen className="w-4 h-4" /> معلم
                    </button>
                    <button 
                        onClick={() => setRole('supervisor')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                            ${role === 'supervisor' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <Eye className="w-4 h-4" /> مشرف
                    </button>
                </div>
            </div>

            {/* Teacher View Controls */}
            {role === 'teacher' && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {teacherSubjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => setSelectedTeacherSubject(subj)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border
                                ${selectedTeacherSubject === subj 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                            `}
                        >
                            <SubjectIcon subject={subj} className="w-4 h-4" />
                            {getSubjectLabel(subj)}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
            >
                {role === 'teacher' 
                    ? <TeacherSubjectView subject={selectedTeacherSubject} />
                    : <SupervisorMatrixView />
                }
            </motion.div>
        </div>
    );
};
