
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, FlaskConical, Languages, Landmark, Palette, Trophy, 
  BarChart3, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Crown
} from 'lucide-react';
import { StudentProfile, SUBJECT_UNITS, Subject } from '../../data/complexLeaderboardData';

interface ClassTopicsViewProps {
    students: StudentProfile[];
}

const SubjectIcon = ({ subject, className }: { subject: string, className?: string }) => {
  switch(subject) {
    case 'math': return <Calculator className={className} />;
    case 'science': return <FlaskConical className={className} />;
    case 'languages': return <Languages className={className} />;
    case 'history': return <Landmark className={className} />;
    case 'arts': return <Palette className={className} />;
    default: return <Trophy className={className} />;
  }
};

const getSubjectLabel = (s: string) => {
    const map: any = { math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', history: 'التاريخ', arts: 'الفنون' };
    return map[s] || s;
};

export const ClassTopicsView: React.FC<ClassTopicsViewProps> = ({ students }) => {
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    const subjectsData = useMemo(() => {
        const subjects = ['math', 'science', 'languages', 'history', 'arts'] as Subject[];
        
        return subjects.map(subject => {
            if (subject === 'all') return null;
            
            // 1. Subject Overall Stats for this Class
            const subjectDetailsList = students.map(s => s.subjectDetails[subject]);
            const avgAccuracy = Math.round(subjectDetailsList.reduce((acc, curr) => acc + curr.accuracy, 0) / students.length) || 0;
            const avgTime = Math.round(subjectDetailsList.reduce((acc, curr) => acc + curr.timeSpent, 0) / students.length) || 0;

            // 2. Unit Breakdown
            const units = SUBJECT_UNITS[subject];
            const unitStats = units.map(unit => {
                const key = `${subject}-${unit}`;
                const unitScores = students.map(s => s.lessonDetails[key]);
                
                const unitAvgAcc = Math.round(unitScores.reduce((acc, curr) => acc + (curr?.accuracy || 0), 0) / students.length) || 0;
                
                // Identify struggling students for this specific unit (< 60% accuracy)
                const strugglingCount = unitScores.filter(u => (u?.accuracy || 0) < 60).length;

                return { name: unit, avgAccuracy: unitAvgAcc, strugglingCount };
            });

            // 3. Top Student in this Subject
            const sortedBySubjectXP = [...students].sort((a, b) => b.subjectDetails[subject].xp - a.subjectDetails[subject].xp);
            const topStudent = sortedBySubjectXP[0];

            return {
                id: subject,
                label: getSubjectLabel(subject),
                avgAccuracy,
                avgTime,
                unitStats,
                topStudent
            };
        }).filter(Boolean) as any[];
    }, [students]);

    return (
        <div className="p-6 md:p-8 space-y-6 pb-20">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-500" />
                    أداء المواد الدراسية
                </h3>
                <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                    {students.length} طالب
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {subjectsData.map((subject) => {
                    const isExpanded = expandedSubject === subject.id;
                    const isExcellent = subject.avgAccuracy >= 80;
                    const isWarning = subject.avgAccuracy < 60;

                    return (
                        <motion.div 
                            layout
                            key={subject.id}
                            className={`bg-white rounded-[2rem] border overflow-hidden transition-all
                                ${isExpanded ? 'border-indigo-200 shadow-xl z-10' : 'border-slate-100 shadow-sm hover:border-indigo-100'}
                            `}
                        >
                            {/* Card Header */}
                            <button 
                                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                                className="w-full p-5 flex flex-col md:flex-row items-start md:items-center gap-4 text-right"
                            >
                                {/* Icon & Title */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg
                                        ${subject.id === 'math' ? 'bg-blue-500' : subject.id === 'science' ? 'bg-emerald-500' : subject.id === 'languages' ? 'bg-purple-500' : subject.id === 'history' ? 'bg-amber-500' : 'bg-pink-500'}
                                    `}>
                                        <SubjectIcon subject={subject.id} className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800">{subject.label}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                                            {subject.unitStats.length} وحدات دراسية
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-xl font-black ${isExcellent ? 'text-emerald-500' : isWarning ? 'text-rose-500' : 'text-blue-500'}`}>
                                            {subject.avgAccuracy}%
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">متوسط الفصل</span>
                                    </div>
                                    
                                    {/* Top Student Mini Profile */}
                                    <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-2 pr-4 rounded-xl border border-slate-100">
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400">الأول على الفصل</div>
                                            <div className="text-xs font-black text-slate-700">{subject.topStudent.name}</div>
                                        </div>
                                        <div className="relative">
                                            <div className={`w-8 h-8 rounded-full ${subject.topStudent.avatar} border border-white shadow-sm`}></div>
                                            <Crown className="w-3 h-3 text-yellow-500 absolute -top-1.5 -right-1 fill-yellow-500" />
                                        </div>
                                    </div>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Content: Units Breakdown */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-slate-50 border-t border-slate-100"
                                    >
                                        <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {subject.unitStats.map((unit: any, idx: number) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-slate-700 capitalize text-sm">{unit.name}</span>
                                                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${unit.avgAccuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : unit.avgAccuracy < 60 ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {unit.avgAccuracy}%
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                                                        <div 
                                                            className={`h-full rounded-full ${unit.avgAccuracy >= 80 ? 'bg-emerald-400' : unit.avgAccuracy < 60 ? 'bg-rose-400' : 'bg-blue-400'}`} 
                                                            style={{ width: `${unit.avgAccuracy}%` }}
                                                        />
                                                    </div>

                                                    {/* Alert if struggling */}
                                                    {unit.strugglingCount > 3 ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg w-fit">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {unit.strugglingCount} طلاب يواجهون صعوبة
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            أداء ممتاز
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
