
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layers, CheckCircle2, Search, Filter, 
  LayoutGrid, GraduationCap, ChevronRight, Save, 
  AlertCircle, Plus, X, BarChart, Unlock, Lock,
  Briefcase, Wand2
} from 'lucide-react';
import { STAFF_TEACHERS, STAFF_SUPERVISORS, GRADES, CLASS_SECTIONS, StaffMember, Subject } from '../../data/adminData';
import { SUBJECT_UNITS } from '../../data/complexLeaderboardData'; // Reusing for subject list

// --- Types ---
type ViewMode = 'teachers' | 'supervisors';

interface StaffCardProps {
    staff: StaffMember;
    isSelected: boolean;
    currentLoad: number;
    onSelect: (staff: StaffMember) => void;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, isSelected, currentLoad, onSelect }) => {
    const loadPercent = Math.min(100, (currentLoad / staff.capacity) * 100);
    const isOverloaded = currentLoad > staff.capacity;

    return (
        <button 
            onClick={() => onSelect(staff)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all relative overflow-hidden group
                ${isSelected 
                    ? 'bg-slate-800 border-slate-800 text-white shadow-xl scale-[1.02] z-10' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50'}
            `}
        >
            {/* Progress Bar BG */}
            <div 
                className={`absolute left-0 top-0 bottom-0 bg-current opacity-5 transition-all duration-500 pointer-events-none`} 
                style={{ width: `${loadPercent}%`, backgroundColor: isOverloaded ? '#F43F5E' : 'currentColor' }}
            />

            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${staff.avatar} ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                {staff.name.charAt(0)}
            </div>
            
            <div className="flex-1 text-right min-w-0">
                <div className="font-bold truncate">{staff.name}</div>
                <div className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {staff.major === 'all' ? 'عام' : staff.major} • {currentLoad}/{staff.capacity}
                </div>
            </div>

            {isOverloaded && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
            {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        </button>
    );
};

export const NizamSystem: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('teachers');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState<string>('all');
    
    // Allocation State: Key = "Grade-Section-Subject", Value = TeacherID
    const [allocations, setAllocations] = useState<Record<string, string>>({});
    
    // Supervisor Allocation: Key = "Subject" (Department Head) or "Grade", Value = SupervisorID
    const [supAllocations, setSupAllocations] = useState<Record<string, string>>({});

    // Filter Logic
    const filteredStaff = useMemo(() => {
        const list = viewMode === 'teachers' ? STAFF_TEACHERS : STAFF_SUPERVISORS;
        return list.filter(s => {
            const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchSubj = filterSubject === 'all' || s.major === filterSubject;
            return matchSearch && matchSubj;
        });
    }, [viewMode, searchQuery, filterSubject]);

    // Derived: Current capacity usage based on allocations state
    const staffUsage = useMemo(() => {
        const usage: Record<string, number> = {};
        Object.values(allocations).forEach((tid: string) => {
            usage[tid] = (usage[tid] || 0) + 1;
        });
        // Add supervisors
        Object.values(supAllocations).forEach((sid: string) => {
            usage[sid] = (usage[sid] || 0) + 1;
        });
        return usage;
    }, [allocations, supAllocations]);

    // --- ACTIONS ---

    const handleCellClick = (key: string) => {
        if (!selectedStaff) return;

        if (viewMode === 'teachers') {
            setAllocations(prev => {
                const currentOwner = prev[key];
                // Toggle off if clicking same teacher
                if (currentOwner === selectedStaff.id) {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                }
                // Assign new teacher
                return { ...prev, [key]: selectedStaff.id };
            });
        } else {
            // Supervisor Logic
            setSupAllocations(prev => {
                const currentOwner = prev[key];
                if (currentOwner === selectedStaff.id) {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                }
                return { ...prev, [key]: selectedStaff.id };
            });
        }
    };

    const handleBulkAssignGrade = (grade: number | string) => {
        if (!selectedStaff || viewMode !== 'teachers') return;
        
        const newAllocations = { ...allocations };
        CLASS_SECTIONS.forEach(sec => {
            const key = `${grade}-${sec}-${selectedStaff.major}`;
            newAllocations[key] = selectedStaff.id;
        });
        setAllocations(newAllocations);
    };

    const getAssignedStaff = (key: string) => {
        const id = viewMode === 'teachers' ? allocations[key] : supAllocations[key];
        if (!id) return null;
        const list = viewMode === 'teachers' ? STAFF_TEACHERS : STAFF_SUPERVISORS;
        return list.find(s => s.id === id);
    };

    return (
        <div className="flex h-screen bg-slate-50 font-['Cairo'] overflow-hidden relative">
            
            {/* --- SIDEBAR: STAFF LIST --- */}
            <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl text-slate-800 leading-none">نظام التوزيع</h1>
                            <span className="text-xs font-bold text-slate-400">Nizam Allocate</span>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-4">
                        <button 
                            onClick={() => { setViewMode('teachers'); setSelectedStaff(null); }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'teachers' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                        >
                            المعلمون
                        </button>
                        <button 
                            onClick={() => { setViewMode('supervisors'); setSelectedStaff(null); }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'supervisors' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                        >
                            المشرفون
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute top-2.5 right-3 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="بحث بالاسم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-sm font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <select 
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-indigo-500 text-slate-600"
                        >
                            <option value="all">كل التخصصات</option>
                            {Object.keys(SUBJECT_UNITS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                    {filteredStaff.map(staff => (
                        <StaffCard 
                            key={staff.id} 
                            staff={staff} 
                            isSelected={selectedStaff?.id === staff.id}
                            currentLoad={staffUsage[staff.id] || 0}
                            onSelect={setSelectedStaff}
                        />
                    ))}
                    {filteredStaff.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm font-bold">
                            لا توجد نتائج
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button 
                        onClick={onExit}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" /> خروج
                    </button>
                </div>
            </aside>

            {/* --- MAIN AREA: THE MATRIX --- */}
            <main className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
                
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 ${selectedStaff ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                            {selectedStaff ? (
                                <>
                                    <Wand2 className="w-4 h-4 animate-pulse" />
                                    <span>وضع التعيين: {selectedStaff.name} ({selectedStaff.major})</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>اختر موظفاً للبدء</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">حالة التوزيع</div>
                            <div className="text-sm font-black text-slate-700">
                                {viewMode === 'teachers' 
                                    ? `${Object.keys(allocations).length} حصة معينة` 
                                    : `${Object.keys(supAllocations).length} قسم معين`
                                }
                            </div>
                        </div>
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
                            <Save className="w-4 h-4" />
                            حفظ التغييرات
                        </button>
                    </div>
                </header>

                {/* Matrix Content */}
                <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
                    
                    {viewMode === 'teachers' ? (
                        /* --- TEACHER ALLOCATION MATRIX --- */
                        <div className="space-y-8">
                            {GRADES.map(grade => {
                                // Only show relevant subject columns if a teacher is selected, otherwise show generic subject placeholders
                                const subjectsToShow = selectedStaff ? [selectedStaff.major] : Object.keys(SUBJECT_UNITS).slice(0, 6) as Subject[]; 

                                return (
                                <div key={grade} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Grade Header */}
                                    <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-slate-200 text-slate-700">
                                                {grade}
                                            </div>
                                            <h3 className="font-bold text-slate-700">الصف {grade}</h3>
                                        </div>
                                        
                                        {/* Bulk Action */}
                                        {selectedStaff && (
                                            <button 
                                                onClick={() => handleBulkAssignGrade(grade)}
                                                className="text-xs font-bold text-indigo-500 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                تعيين لجميع الشعب
                                            </button>
                                        )}
                                    </div>

                                    {/* Sections Grid */}
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {CLASS_SECTIONS.map(section => (
                                            <div key={section} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <div className="text-xs font-black text-slate-400 uppercase mb-3 flex justify-between">
                                                    <span>شعبة {section}</span>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {/* If a teacher is selected, only show slots for their specialty. If not, show summary. */}
                                                    {selectedStaff ? (
                                                        <div 
                                                            onClick={() => handleCellClick(`${grade}-${section}-${selectedStaff.major}`)}
                                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group
                                                                ${allocations[`${grade}-${section}-${selectedStaff.major}`] 
                                                                    ? (allocations[`${grade}-${section}-${selectedStaff.major}`] === selectedStaff.id ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200 opacity-50') 
                                                                    : 'bg-white border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-500 uppercase">{selectedStaff.major}</span>
                                                            </div>
                                                            {(() => {
                                                                const assigned = getAssignedStaff(`${grade}-${section}-${selectedStaff.major}`);
                                                                if (assigned) {
                                                                    return (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-bold text-slate-800">{assigned.name}</span>
                                                                            {assigned.id === selectedStaff.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                                                        </div>
                                                                    )
                                                                }
                                                                return <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400">+ تعيين</span>;
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 text-slate-400 text-xs font-medium">
                                                            اختر معلماً من القائمة للبدء في التوزيع
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        /* --- SUPERVISOR ALLOCATION GRID --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* By Department/Subject */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm md:col-span-3">
                                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-purple-500" />
                                    رؤساء الأقسام (المواد)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.keys(SUBJECT_UNITS).map(subj => {
                                        const assigned = getAssignedStaff(subj);
                                        const isMyAssignment = assigned?.id === selectedStaff?.id;
                                        
                                        return (
                                            <button 
                                                key={subj}
                                                onClick={() => selectedStaff && handleCellClick(subj)}
                                                disabled={!selectedStaff}
                                                className={`p-4 rounded-2xl border-2 text-right transition-all
                                                    ${isMyAssignment 
                                                        ? 'bg-purple-50 border-purple-200' 
                                                        : assigned 
                                                            ? 'bg-white border-slate-200' 
                                                            : 'bg-slate-50 border-dashed border-slate-300 hover:border-purple-300'}
                                                `}
                                            >
                                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">قسم {subj}</div>
                                                {assigned ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${assigned.avatar} flex items-center justify-center text-xs font-bold`}>
                                                            {assigned.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-sm">{assigned.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="h-8 flex items-center text-slate-300 text-sm font-bold">
                                                        {selectedStaff ? '+ تعيين مشرف' : 'شاغر'}
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};
