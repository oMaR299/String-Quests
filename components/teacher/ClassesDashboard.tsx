
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ChevronRight, GraduationCap, ArrowRight,
  TrendingUp, AlertCircle, BarChart3, LayoutGrid, PieChart
} from 'lucide-react';
import { getAllClassesSummary } from '../../utils/teacherAggregator';
import { MOCK_SCHOOL_DATA, GradeLevel, ClassSection, StudentProfile, Subject } from '../../data/complexLeaderboardData';
import { ClassAnalyticsView } from '../ClassAnalyticsView';
import { ClassTopicsView } from './ClassTopicsView';
import { SingleClassSubjectView } from './SingleClassSubjectView';
import { SingleClassUnitView } from './SingleClassUnitView';
import { StudentProfileModal } from '../StudentProfileModal';

export const ClassesDashboard: React.FC = () => {
    // State to track navigation
    const [selectedClass, setSelectedClass] = useState<{ grade: GradeLevel, section: ClassSection } | null>(null);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    
    // DETAIL VIEW STATE
    const [detailTab, setDetailTab] = useState<'overview' | 'topics'>('overview');

    // Get List of Classes
    const classesList = useMemo(() => getAllClassesSummary(), []);

    // Get Students for selected class
    const detailedStudents = useMemo(() => {
        if (!selectedClass) return [];
        return MOCK_SCHOOL_DATA.filter(s => s.grade === selectedClass.grade && s.section === selectedClass.section);
    }, [selectedClass]);

    const handleClassClick = (grade: number, section: string) => {
        setSelectedClass({ grade: grade as GradeLevel, section: section as ClassSection });
        setDetailTab('overview'); 
        setSelectedSubject(null);
        setSelectedUnit(null);
    };

    const handleTopicClick = (subject: string) => {
        setSelectedSubject(subject as Subject);
        setSelectedUnit(null);
    };

    return (
        <div className="bg-slate-50 min-h-full">
            <StudentProfileModal 
                student={selectedStudentForModal} 
                onClose={() => setSelectedStudentForModal(null)} 
            />

            <AnimatePresence mode="wait">
                {!selectedClass ? (
                    /* --- VIEW 1: CLASS SELECTION GRID --- */
                    <motion.div 
                        key="selection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 md:p-8 pb-20"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                                <LayoutGrid className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-800">صفوفي الدراسية</h1>
                                <p className="text-slate-500 font-medium">اختر فصلاً لعرض التحليل التفصيلي وقائمة الطلاب.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {classesList.map((cls, idx) => {
                                const isHighGrade = cls.grade >= 4;
                                const colorClass = isHighGrade ? 'from-indigo-500 to-blue-600' : 'from-orange-400 to-pink-500';
                                
                                return (
                                    <motion.button
                                        key={`${cls.grade}-${cls.section}`}
                                        onClick={() => handleClassClick(cls.grade, cls.section)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-[2rem] p-1 shadow-sm hover:shadow-xl transition-all group text-right relative"
                                    >
                                        <div className="bg-white rounded-[1.8rem] p-6 h-full border border-slate-100 group-hover:border-indigo-100 transition-colors relative overflow-hidden">
                                            
                                            {/* Top Banner with Grade */}
                                            <div className="flex justify-between items-start mb-6 relative z-10">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                                                    <span className="text-2xl font-black">{cls.grade}</span>
                                                    <span className="text-xs font-medium opacity-80 self-start mt-1 ml-0.5">{cls.section}</span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${cls.avgAccuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {cls.avgAccuracy}% دقة
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                        <Users className="w-4 h-4" />
                                                        <span>عدد الطلاب</span>
                                                    </div>
                                                    <span className="font-black text-slate-800 text-lg">{cls.studentCount}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>متوسط XP</span>
                                                    </div>
                                                    <span className="font-black text-slate-800">{cls.avgXP.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between group-hover:border-slate-100 transition-colors relative z-10">
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">عرض التفاصيل</span>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>

                                            {/* Decorative Background Blob */}
                                            <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr ${colorClass} opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : selectedUnit && selectedSubject ? (
                    /* --- VIEW 4: SINGLE UNIT DETAIL (DEEP DIVE) --- */
                    <motion.div
                        key="unit-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full"
                    >
                        <SingleClassUnitView 
                            grade={selectedClass.grade}
                            section={selectedClass.section}
                            subject={selectedSubject}
                            unit={selectedUnit}
                            students={detailedStudents}
                            onBack={() => setSelectedUnit(null)}
                            onStudentClick={(s) => setSelectedStudentForModal(s)}
                        />
                    </motion.div>
                ) : selectedSubject ? (
                    /* --- VIEW 3: SINGLE CLASS SINGLE SUBJECT (DRILL DOWN) --- */
                    <motion.div 
                        key="subject-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full"
                    >
                        <SingleClassSubjectView 
                            grade={selectedClass.grade}
                            section={selectedClass.section}
                            subject={selectedSubject}
                            students={detailedStudents}
                            onBack={() => setSelectedSubject(null)}
                            onStudentClick={(s) => setSelectedStudentForModal(s)}
                            onUnitClick={(unit) => setSelectedUnit(unit)}
                        />
                    </motion.div>
                ) : (
                    /* --- VIEW 2: CLASS DETAIL ANALYTICS --- */
                    <motion.div 
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full flex flex-col"
                    >
                        {/* Detail Header */}
                        <div className="bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setSelectedClass(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                                >
                                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-800" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <GraduationCap className="w-6 h-6 text-indigo-500" />
                                        الصف {selectedClass.grade} / {selectedClass.section}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-bold">لوحة التحليل المتقدم</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setDetailTab('overview')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        detailTab === 'overview' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    نظرة عامة
                                </button>
                                <button
                                    onClick={() => setDetailTab('topics')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                        detailTab === 'topics' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <PieChart className="w-4 h-4" />
                                    المواضيع
                                </button>
                            </div>
                        </div>

                        {/* Analytics Component Wrapper */}
                        <div className="flex-1 overflow-y-auto">
                             {detailTab === 'overview' ? (
                                <ClassAnalyticsView 
                                    grade={selectedClass.grade}
                                    section={selectedClass.section}
                                    students={detailedStudents}
                                    onStudentClick={(student) => setSelectedStudentForModal(student)}
                                />
                             ) : (
                                <div className="relative">
                                    <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-2 sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
                                        <p className="col-span-full text-xs font-bold text-slate-400 mb-2">اختر مادة للتحليل العميق:</p>
                                        {(['math', 'science', 'languages', 'history', 'arts'] as Subject[]).map(subj => (
                                            <button 
                                                key={subj}
                                                onClick={() => handleTopicClick(subj)}
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                                            >
                                                {subj === 'math' ? 'الرياضيات' : subj === 'science' ? 'العلوم' : subj === 'languages' ? 'اللغات' : subj === 'history' ? 'التاريخ' : 'الفنون'}
                                            </button>
                                        ))}
                                    </div>
                                    <ClassTopicsView students={detailedStudents} />
                                </div>
                             )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
