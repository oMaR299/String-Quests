
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layers, CheckCircle2, Search, Filter, 
  LayoutGrid, GraduationCap, Save, AlertCircle, 
  Briefcase, Wand2, School as SchoolIcon, ChevronRight,
  BookOpen, Calculator, FlaskConical, Globe, Palette,
  Monitor, Activity, History, GripVertical, X, Lock, Check
} from 'lucide-react';
import { 
    STAFF_TEACHERS, STAFF_SUPERVISORS, GRADES, CLASS_SECTIONS, 
    SCHOOLS, GRADE_STAGES, StaffMember, Subject, School 
} from '../../data/adminData';

// --- Icons & Visuals ---
const getSubjectIcon = (subject: string) => {
    switch(subject) {
        case 'math': return <Calculator className="w-4 h-4" />;
        case 'science': return <FlaskConical className="w-4 h-4" />;
        case 'languages': return <Globe className="w-4 h-4" />;
        case 'arts': return <Palette className="w-4 h-4" />;
        case 'computer': return <Monitor className="w-4 h-4" />;
        case 'history': return <History className="w-4 h-4" />;
        default: return <BookOpen className="w-4 h-4" />;
    }
};

const getSubjectLabel = (s: string) => {
    const map: any = { 
        math: 'الرياضيات', science: 'العلوم', languages: 'اللغات', 
        history: 'التاريخ', arts: 'الفنون', physics: 'الفيزياء', chemistry: 'الكيمياء',
        biology: 'الأحياء', computer: 'الحاسوب', islamic: 'التربية الإسلامية',
        social: 'الدراسات الاجتماعية', english: 'اللغة الإنجليزية'
    };
    return map[s] || s;
};

// --- Main Component ---
export const EduMatrixAllocation: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    // 1. Context State
    const [selectedSchool, setSelectedSchool] = useState<School>(SCHOOLS[0]);
    const [activeDepartment, setActiveDepartment] = useState<Subject>('math');
    const [allocationMode, setAllocationMode] = useState<'teacher' | 'supervisor'>('teacher');
    
    // 2. Resource State
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // 3. Data State (The "Database")
    // Keys: "schoolId-grade-section-subject" -> TeacherID
    const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
    // Keys: "schoolId-gradeStageId-subject" -> SupervisorID
    const [supervisorMap, setSupervisorMap] = useState<Record<string, string>>({});

    // --- Derived Data ---

    // Filter staff based on: School (optional match), Role, Major (Department)
    const availableStaff = useMemo(() => {
        const pool = allocationMode === 'teacher' ? STAFF_TEACHERS : STAFF_SUPERVISORS;
        return pool.filter(s => {
            const matchesSchool = allocationMode === 'supervisor' ? true : (s.schoolId === selectedSchool.id || s.schoolId === 'all');
            const matchesMajor = s.major === activeDepartment;
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSchool && matchesMajor && matchesSearch;
        });
    }, [allocationMode, selectedSchool, activeDepartment, searchTerm]);

    // Calculate current workload dynamically from state
    const getStaffWorkload = (staffId: string) => {
        let count = 0;
        if (allocationMode === 'teacher') {
            Object.values(teacherMap).forEach(id => { if (id === staffId) count++; });
        } else {
            Object.values(supervisorMap).forEach(id => { if (id === staffId) count++; });
        }
        return count;
    };

    // --- Handlers ---

    const handleTeacherAssignment = (grade: number, section: string) => {
        if (!selectedStaff || allocationMode !== 'teacher') return;
        
        const key = `${selectedSchool.id}-${grade}-${section}-${activeDepartment}`;
        setTeacherMap(prev => {
            const current = prev[key];
            if (current === selectedStaff.id) {
                // Toggle off
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: selectedStaff.id };
        });
    };

    const handleSupervisorAssignment = (stageId: string) => {
        if (!selectedStaff || allocationMode !== 'supervisor') return;

        const key = `${selectedSchool.id}-${stageId}-${activeDepartment}`;
        setSupervisorMap(prev => {
            const current = prev[key];
            if (current === selectedStaff.id) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: selectedStaff.id };
        });
    };

    const getAssignedTeacher = (grade: number, section: string) => {
        const key = `${selectedSchool.id}-${grade}-${section}-${activeDepartment}`;
        const id = teacherMap[key];
        return STAFF_TEACHERS.find(s => s.id === id);
    };

    const getAssignedSupervisor = (stageId: string) => {
        const key = `${selectedSchool.id}-${stageId}-${activeDepartment}`;
        const id = supervisorMap[key];
        return STAFF_SUPERVISORS.find(s => s.id === id);
    };

    const handleBulkGradeAssign = (grade: number) => {
        if (!selectedStaff || allocationMode !== 'teacher') return;
        const newMap = { ...teacherMap };
        CLASS_SECTIONS.forEach(sec => {
            const key = `${selectedSchool.id}-${grade}-${sec}-${activeDepartment}`;
            newMap[key] = selectedStaff.id;
        });
        setTeacherMap(newMap);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-['Cairo'] overflow-hidden text-right" dir="rtl">
            
            {/* --- TOP BAR: CONTEXT & CONTROLS --- */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <h1 className="font-black text-lg text-slate-800 hidden md:block">EduMatrix</h1>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                    {/* School Switcher */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-colors">
                            <SchoolIcon className="w-4 h-4 text-indigo-500" />
                            {selectedSchool.name}
                            <ChevronRight className="w-4 h-4 rotate-90 text-slate-400" />
                        </button>
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-50">
                            {SCHOOLS.map(s => (
                                <button 
                                    key={s.id} 
                                    onClick={() => setSelectedSchool(s)}
                                    className={`w-full text-right px-4 py-3 text-sm font-bold hover:bg-slate-50 flex items-center gap-2 ${selectedSchool.id === s.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
                                >
                                    {selectedSchool.id === s.id && <CheckCircle2 className="w-4 h-4" />}
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                        <button 
                            onClick={() => { setAllocationMode('teacher'); setSelectedStaff(null); }}
                            className={`px-4 py-1.5 rounded-md transition-all ${allocationMode === 'teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        >
                            توزيع المعلمين
                        </button>
                        <button 
                            onClick={() => { setAllocationMode('supervisor'); setSelectedStaff(null); }}
                            className={`px-4 py-1.5 rounded-md transition-all ${allocationMode === 'supervisor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        >
                            توزيع المشرفين
                        </button>
                    </div>
                    
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20 text-sm flex items-center gap-2 transition-all">
                        <Save className="w-4 h-4" />
                        <span>حفظ</span>
                    </button>
                    
                    <button onClick={onExit} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                
                {/* --- LEFT SIDEBAR: DEPARTMENTS --- */}
                <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">الأقسام الأكاديمية</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {(['math', 'science', 'languages', 'english', 'history', 'arts', 'physics', 'chemistry', 'biology', 'computer', 'islamic', 'social'] as Subject[]).map(subj => (
                            <button
                                key={subj}
                                onClick={() => { setActiveDepartment(subj); setSelectedStaff(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                                    ${activeDepartment === subj 
                                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                        : 'text-slate-600 font-medium hover:bg-slate-50'}
                                `}
                            >
                                <div className={`p-2 rounded-lg ${activeDepartment === subj ? 'bg-white shadow-sm' : 'bg-slate-100 group-hover:bg-white'}`}>
                                    {getSubjectIcon(subj)}
                                </div>
                                <span>{getSubjectLabel(subj)}</span>
                                {activeDepartment === subj && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* --- CENTER: THE MATRIX GRID --- */}
                <main className="flex-1 bg-slate-50/50 overflow-auto p-6 md:p-8 relative custom-scrollbar">
                    
                    {/* Mode Indicator / Header */}
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                {allocationMode === 'teacher' ? 'جدول الحصص' : 'نطاقات الإشراف'}
                                <span className="text-slate-300">/</span>
                                <span className="text-indigo-600">{getSubjectLabel(activeDepartment)}</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                {allocationMode === 'teacher' 
                                    ? `قم بتعيين معلمي ${getSubjectLabel(activeDepartment)} للفصول الدراسية.` 
                                    : `حدد المشرف المسؤول عن كل مرحلة دراسية.`}
                            </p>
                        </div>
                        
                        {/* Selected Staff Sticky Indicator */}
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm border transition-all ${selectedStaff ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                            {selectedStaff ? (
                                <>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span>جاري التوزيع: {selectedStaff.name}</span>
                                    <span className="bg-white/20 px-2 rounded text-xs">{getStaffWorkload(selectedStaff.id)}/{selectedStaff.capacity}</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>اختر موظفاً من القائمة للبدء</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- TEACHER GRID VIEW --- */}
                    {allocationMode === 'teacher' && (
                        <div className="space-y-8 pb-20">
                            {/* Render Grids by Grade Group for visual separation */}
                            {GRADE_STAGES.map(stage => {
                                const stageGrades = GRADES.filter(g => stage.grades.includes(g as number));
                                if (stageGrades.length === 0) return null;

                                return (
                                    <div key={stage.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <h3 className="font-bold text-slate-700">{stage.label}</h3>
                                        </div>
                                        
                                        <div className="divide-y divide-slate-100">
                                            {stageGrades.map(grade => (
                                                <div key={grade} className="flex flex-col md:flex-row group">
                                                    {/* Grade Label & Bulk Action */}
                                                    <div className="w-40 bg-slate-50/30 p-4 flex flex-col justify-center items-start border-l border-slate-100 shrink-0">
                                                        <span className="font-black text-xl text-slate-800 mb-1">الصف {grade}</span>
                                                        {selectedStaff && (
                                                            <button 
                                                                onClick={() => handleBulkGradeAssign(grade as number)}
                                                                className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-bold w-full"
                                                            >
                                                                تعيين للكل
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Sections Grid */}
                                                    <div className="flex-1 p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                        {CLASS_SECTIONS.map(section => {
                                                            const assigned = getAssignedTeacher(grade as number, section);
                                                            const isMyAssignment = assigned?.id === selectedStaff?.id;
                                                            const isAssignedToOther = assigned && !isMyAssignment;

                                                            return (
                                                                <button
                                                                    key={section}
                                                                    onClick={() => handleTeacherAssignment(grade as number, section)}
                                                                    disabled={!selectedStaff}
                                                                    className={`relative h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group/cell overflow-hidden
                                                                        ${isMyAssignment 
                                                                            ? 'bg-indigo-50 border-indigo-500' 
                                                                            : isAssignedToOther 
                                                                                ? 'bg-white border-slate-200 opacity-60' 
                                                                                : selectedStaff 
                                                                                    ? 'bg-white border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer'
                                                                                    : 'bg-slate-50 border-slate-100 cursor-not-allowed'}
                                                                    `}
                                                                >
                                                                    <div className="absolute top-2 right-3 text-xs font-black text-slate-300 group-hover/cell:text-slate-500 uppercase">{section}</div>
                                                                    
                                                                    {assigned ? (
                                                                        <>
                                                                            <div className={`w-8 h-8 rounded-full ${assigned.avatar} flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm`}>
                                                                                {assigned.name.charAt(0)}
                                                                            </div>
                                                                            <span className="text-xs font-bold text-slate-700 truncate max-w-[90%] px-2">{assigned.name}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-300 group-hover/cell:text-indigo-400 transition-colors">
                                                                            {selectedStaff ? '+ تعيين' : 'شاغر'}
                                                                        </span>
                                                                    )}
                                                                    
                                                                    {isMyAssignment && (
                                                                        <div className="absolute top-1 left-1 bg-indigo-500 rounded-full p-0.5">
                                                                            <Check className="w-3 h-3 text-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* --- SUPERVISOR GRID VIEW --- */}
                    {allocationMode === 'supervisor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {GRADE_STAGES.map(stage => {
                                const assigned = getAssignedSupervisor(stage.id);
                                const isMyAssignment = assigned?.id === selectedStaff?.id;

                                return (
                                    <button
                                        key={stage.id}
                                        onClick={() => handleSupervisorAssignment(stage.id)}
                                        disabled={!selectedStaff}
                                        className={`relative p-8 rounded-[2rem] border-2 text-right transition-all group overflow-hidden
                                            ${isMyAssignment 
                                                ? 'bg-purple-50 border-purple-500 shadow-md' 
                                                : assigned 
                                                    ? 'bg-white border-slate-200' 
                                                    : selectedStaff 
                                                        ? 'bg-white border-dashed border-slate-300 hover:border-purple-300 hover:bg-purple-50/20'
                                                        : 'bg-slate-50 border-slate-100 cursor-not-allowed'}
                                        `}
                                    >
                                        <div className="absolute top-0 left-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <GraduationCap className="w-32 h-32" />
                                        </div>

                                        <div className="relative z-10 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 mb-1">{stage.label}</h3>
                                                <p className="text-sm font-medium text-slate-500">مشرف قسم {getSubjectLabel(activeDepartment)}</p>
                                            </div>
                                            
                                            {assigned ? (
                                                <div className="text-center">
                                                    <div className={`w-14 h-14 rounded-2xl ${assigned.avatar} flex items-center justify-center text-xl font-black text-slate-700 border-4 border-white shadow-lg mx-auto mb-2`}>
                                                        {assigned.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm">
                                                        {assigned.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                                    <Users className="w-6 h-6 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {isMyAssignment && (
                                            <div className="absolute bottom-4 left-4 flex items-center gap-1 text-purple-600 font-bold text-xs bg-white px-2 py-1 rounded-lg shadow-sm">
                                                <CheckCircle2 className="w-3 h-3" /> تم التعيين
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                </main>

                {/* --- RIGHT SIDEBAR: RESOURCE POOL --- */}
                <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-xl">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            {allocationMode === 'teacher' ? 'كادر المعلمين' : 'كادر الإشراف'}
                        </h2>
                        
                        <div className="relative">
                            <Search className="absolute top-2.5 right-3 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="بحث بالاسم..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-sm font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400">
                            <span>{availableStaff.length} متاح</span>
                            <span className="text-indigo-600">{activeDepartment}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {availableStaff.map(staff => {
                            const isSelected = selectedStaff?.id === staff.id;
                            const load = getStaffWorkload(staff.id);
                            const loadPercent = (load / staff.capacity) * 100;
                            const isOverloaded = load > staff.capacity;

                            return (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(staff)}
                                    className={`w-full text-right p-3 rounded-2xl border-2 transition-all relative overflow-hidden group
                                        ${isSelected 
                                            ? 'bg-slate-800 border-slate-800 text-white shadow-lg ring-2 ring-indigo-200 ring-offset-2' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'}
                                    `}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${staff.avatar} ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate">{staff.name}</div>
                                            <div className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                                {allocationMode === 'teacher' ? 'معلم' : 'مشرف'} • {load}/{staff.capacity}
                                            </div>
                                        </div>
                                        {isOverloaded && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                                    </div>

                                    {/* Load Bar */}
                                    <div className="absolute bottom-0 right-0 left-0 h-1.5 bg-black/10 mt-3">
                                        <div 
                                            className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-rose-500' : isSelected ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(loadPercent, 100)}%` }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                        
                        {availableStaff.length === 0 && (
                            <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                                <Briefcase className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-sm font-bold">لا يوجد كادر متاح لهذا التخصص</span>
                            </div>
                        )}
                    </div>
                </aside>

            </div>
        </div>
    );
};
