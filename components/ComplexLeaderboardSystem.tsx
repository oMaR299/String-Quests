
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Filter, School, GraduationCap, Users, 
  Search, Calculator, FlaskConical, Languages, 
  Palette, Landmark, AlertCircle, Award, User,
  Calendar, Clock, Shield, Info, BarChart3, ChevronLeft, Layers, Eye,
  PieChart
} from 'lucide-react';
import { MOCK_SCHOOL_DATA, StudentProfile, GradeLevel, ClassSection, Subject, CURRENT_USER_ID, Timeframe, League, SUBJECT_UNITS } from '../data/complexLeaderboardData';
import { LeagueRulesModal } from './LeagueRulesModal';
import { StudentProfileModal } from './StudentProfileModal';
import { InfoHelpModal } from './InfoHelpModal';
import { ClassAnalyticsView } from './ClassAnalyticsView';

// --- Helper Components ---

const FilterButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border w-full justify-start
      ${active 
        ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-800/20' 
        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
    `}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </button>
);

const SubjectIcon = ({ subject }: { subject: string }) => {
  switch(subject) {
    case 'math': return <Calculator className="w-4 h-4 text-blue-500" />;
    case 'science': return <FlaskConical className="w-4 h-4 text-emerald-500" />;
    case 'languages': return <Languages className="w-4 h-4 text-purple-500" />;
    case 'history': return <Landmark className="w-4 h-4 text-amber-500" />;
    case 'arts': return <Palette className="w-4 h-4 text-pink-500" />;
    default: return <Trophy className="w-4 h-4 text-yellow-500" />;
  }
};

const LeagueBadge = ({ league }: { league: League }) => {
    const colors = {
        bronze: 'bg-amber-700 border-amber-800 text-amber-100',
        silver: 'bg-slate-400 border-slate-500 text-slate-100',
        gold: 'bg-yellow-400 border-yellow-500 text-yellow-900',
        platinum: 'bg-cyan-400 border-cyan-500 text-cyan-900',
        diamond: 'bg-fuchsia-500 border-fuchsia-600 text-fuchsia-100',
    };
    return (
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] shadow-sm ${colors[league]}`} title={league}>
            {league === 'bronze' && '🛡️'}
            {league === 'silver' && '⚔️'}
            {league === 'gold' && '👑'}
            {league === 'platinum' && '💠'}
            {league === 'diamond' && '💎'}
        </div>
    );
};

// --- Main Component ---

export const ComplexLeaderboardSystem: React.FC = () => {
  // State
  const [viewType, setViewType] = useState<'ranking' | 'class-insight'>('ranking');
  const [scope, setScope] = useState<'school' | 'grade' | 'class'>('grade');
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const [topic, setTopic] = useState<Subject>('all');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeagueRules, setShowLeagueRules] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  
  // Specific Selectors for Class Insight View
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(4);
  const [selectedSection, setSelectedSection] = useState<ClassSection>('A');
  
  // Info Modal State
  const [infoConfig, setInfoConfig] = useState<{open: boolean, title: string, desc: string}>({
      open: false, title: '', desc: ''
  });

  // Mock Context
  const userGrade: GradeLevel = 4;
  const userClass: ClassSection = 'A';

  // --- Logic: Ranking Metric ---
  const isPlacementMode = timeframe === 'all-time' && !selectedUnit;

  // --- Copywriting Logic ---
  const copy = {
      headerTitle: viewType === 'class-insight' 
          ? `تحليل الصف ${selectedGrade} / ${selectedSection}` 
          : (viewMode === 'student' ? 'لوحة الأبطال' : 'لوحة تحكم الأداء'),
      headerDesc: viewType === 'class-insight' 
          ? 'إحصائيات شاملة وتحليل لأداء الفصل.'
          : (viewMode === 'student' 
             ? (isPlacementMode ? 'ترتيبك بناءً على مستواك في جميع المواد.' : 'نافس أصدقاءك واجمع المزيد من النقاط!') 
             : 'تحليل شامل لأداء الطلاب وترتيبهم الأكاديمي.'),
      rankingCol: viewMode === 'student' ? 'زملاؤك' : 'قائمة الطلاب',
  };

  // --- Data Processing for Ranking View ---

  const filteredData = useMemo(() => {
    let data = [...MOCK_SCHOOL_DATA];

    if (scope === 'grade') {
      data = data.filter(s => s.grade === userGrade);
    } else if (scope === 'class') {
      data = data.filter(s => s.grade === userGrade && s.section === userClass);
    }

    if (searchQuery) {
      data = data.filter(s => s.name.includes(searchQuery));
    }

    if (isPlacementMode) {
        let relevantUnits: string[] = [];
        if (topic === 'all') {
            Object.keys(SUBJECT_UNITS).forEach(subj => {
                SUBJECT_UNITS[subj as keyof typeof SUBJECT_UNITS].forEach(u => relevantUnits.push(`${subj}-${u}`));
            });
        } else {
            SUBJECT_UNITS[topic as keyof typeof SUBJECT_UNITS].forEach(u => relevantUnits.push(`${topic}-${u}`));
        }

        const studentRankSums: Record<string, number> = {};
        
        relevantUnits.forEach(unitKey => {
            const sortedByUnit = [...data].sort((a, b) => (b.lessonScores[unitKey] || 0) - (a.lessonScores[unitKey] || 0));
            sortedByUnit.forEach((s, idx) => {
                if (!studentRankSums[s.id]) studentRankSums[s.id] = 0;
                studentRankSums[s.id] += (idx + 1); 
            });
        });

        data = data.map(s => ({
            ...s,
            metric: (studentRankSums[s.id] || (relevantUnits.length * data.length)) / relevantUnits.length
        })).sort((a, b) => a.metric - b.metric);

    } else {
        data = data.map(s => {
            let val = 0;
            if (selectedUnit && topic !== 'all') {
                val = s.lessonScores[`${topic}-${selectedUnit}`] || 0;
            } else if (timeframe !== 'all-time') {
                val = s.timeframeScores[timeframe]; 
            } else {
                val = topic === 'all' ? s.totalXp : s.subjectXp[topic as Exclude<Subject, 'all'>];
            }
            return { ...s, metric: val };
        }).sort((a, b) => b.metric - a.metric);
    }

    return data.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [scope, topic, searchQuery, timeframe, selectedUnit, isPlacementMode, userGrade, userClass]);

  // --- Data Processing for Class Insight View ---
  const classInsightStudents = useMemo(() => {
      return MOCK_SCHOOL_DATA.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [selectedGrade, selectedSection]);

  // --- Insight Calculations ---
  const stats = useMemo(() => {
    const totalStudents = filteredData.length;
    const totalMetric = filteredData.reduce((acc, s) => acc + (s as any).metric, 0);
    const avgMetric = totalStudents > 0 ? totalMetric / totalStudents : 0;
    const topPerformer = filteredData[0];
    const strugglingCount = filteredData.filter(s => {
        const m = (s as any).metric;
        if (isPlacementMode) return m > (totalStudents * 0.75); 
        return m < (avgMetric * 0.6);
    }).length;

    return { totalStudents, avgMetric, topPerformer, strugglingCount };
  }, [filteredData, isPlacementMode]);

  const handleTopicChange = (t: Subject) => {
      setTopic(t);
      setSelectedUnit(null); 
  };

  const openInfo = (title: string, desc: string) => {
      setInfoConfig({ open: true, title, desc });
  };

  // --- Renderers ---

  const renderRankingRow = (student: StudentProfile & { rank: number, metric: number }) => {
    const isMe = student.id === CURRENT_USER_ID;
    
    let zoneColor = ''; 
    let zoneIcon = null;
    if (timeframe === 'weekly' && topic === 'all' && !selectedUnit) {
        if (student.rank <= 5) {
             zoneColor = 'bg-emerald-50 border-emerald-100'; 
             if (student.rank === 1) zoneIcon = <span className="text-[10px] text-emerald-600 font-bold px-2 bg-emerald-100 rounded-full">صعود</span>;
        } else if (student.rank > filteredData.length - 5) {
             zoneColor = 'bg-rose-50 border-rose-100'; 
        }
    }

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={student.id}
        onClick={() => setSelectedStudent(student)}
        className={`flex items-center gap-4 p-3 rounded-2xl mb-2 border transition-all cursor-pointer group
          ${isMe 
            ? 'bg-slate-800 border-slate-700 shadow-lg z-10 sticky top-0 md:relative' 
            : zoneColor || 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}
        `}
      >
        <div className={`w-8 text-center font-black text-lg ${isMe ? 'text-white' : 'text-slate-400'}`}>
          {student.rank}
        </div>

        <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.avatar} border-2 border-white shadow-sm`}>
               {isMe ? <User className="w-5 h-5 text-white" /> : <span className="font-bold text-slate-700 opacity-50">{student.name[0]}</span>}
            </div>
            <div className="absolute -bottom-1 -right-1">
                <LeagueBadge league={student.league} />
            </div>
        </div>

        <div className="flex-1">
           <div className="flex items-center gap-2">
               <span className={`font-bold text-sm ${isMe ? 'text-white' : 'text-slate-800'}`}>{isMe ? (viewMode === 'student' ? 'أنت (البطل)' : student.name) : student.name}</span>
               {isMe && viewMode === 'student' && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">أنا</span>}
               {zoneIcon}
           </div>
           
           {viewMode === 'teacher' ? (
                <div className="flex gap-1 mt-1">
                    {student.weeklyActivity.map((act, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: act > 50 ? '#10B981' : act > 20 ? '#FBBF24' : '#E2E8F0' }} title={`Day ${i+1}: ${act}%`} />
                    ))}
                </div>
           ) : (
                <div className={`text-xs ${isMe ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-2`}>
                    <span className="bg-slate-100/10 px-1.5 rounded text-[10px]">فصل {student.grade}/{student.section}</span>
                </div>
           )}
        </div>

        <div className="text-right">
           <div className={`font-black ${isMe ? 'text-emerald-400' : 'text-slate-800'}`}>
             {isPlacementMode 
                ? <span className="text-sm">#{student.metric.toFixed(1)}</span>
                : student.metric.toLocaleString()
             }
           </div>
           <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 justify-end group-hover:text-blue-500 transition-colors">
               {isPlacementMode ? 'متوسط المركز' : 'XP'}
               <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl">
      <LeagueRulesModal isOpen={showLeagueRules} onClose={() => setShowLeagueRules(false)} />
      <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <InfoHelpModal 
        isOpen={infoConfig.open} 
        onClose={() => setInfoConfig({...infoConfig, open: false})}
        title={infoConfig.title}
        description={infoConfig.desc}
      />
      
      {/* --- HEADER BAR --- */}
      <div className="bg-white p-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center sticky top-0 z-20 shadow-sm">
         <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-800">{copy.headerTitle}</h2>
                <button onClick={() => setShowLeagueRules(true)} className="bg-blue-50 text-blue-600 p-1 rounded-full hover:bg-blue-100 transition-colors">
                    <Info className="w-4 h-4" />
                </button>
            </div>
            <p className="text-slate-400 text-sm font-medium">
                {copy.headerDesc}
            </p>
         </div>

         {/* Class Selectors (Only visible in Class Insight) */}
         {viewType === 'class-insight' && (
             <div className="flex gap-2">
                 <select 
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(Number(e.target.value) as GradeLevel)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                 >
                     {[1,2,3,4,5,6].map(g => <option key={g} value={g}>الصف {g}</option>)}
                 </select>
                 <select 
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value as ClassSection)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                 >
                     {['A','B','C'].map(s => <option key={s} value={s}>شعبة {s}</option>)}
                 </select>
             </div>
         )}

         {/* View Toggles */}
         <div className="flex flex-col gap-2 md:items-end">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full md:w-auto overflow-x-auto">
                {viewType === 'ranking' ? (
                     (['daily', 'weekly', 'monthly', 'all-time'] as Timeframe[]).map(tf => (
                        <button
                            key={tf}
                            onClick={() => { setTimeframe(tf); setSelectedUnit(null); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-none
                                ${timeframe === tf ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                            `}
                        >
                            {tf === 'daily' ? 'اليوم' : tf === 'weekly' ? 'هذا الأسبوع' : tf === 'monthly' ? 'الشهر' : 'الكل'}
                        </button>
                    ))
                ) : (
                    <span className="px-3 py-1.5 text-xs font-bold text-slate-400">بيانات الفصل المباشرة</span>
                )}
            </div>
            
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shrink-0 self-start md:self-end">
                <button 
                  onClick={() => setViewType('ranking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewType === 'ranking' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                >
                    <Trophy className="w-3 h-3" /> الترتيب
                </button>
                <button 
                  onClick={() => setViewType('class-insight')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${viewType === 'class-insight' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                >
                    <PieChart className="w-3 h-3" /> تحليل الفصل
                </button>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* --- SIDEBAR FILTERS (Only visible in Ranking View) --- */}
          {viewType === 'ranking' && (
          <div className="w-full md:w-64 bg-white border-l border-slate-100 p-4 overflow-y-auto flex flex-col gap-6 z-10 shrink-0">
              {/* Teacher/Student Toggle inside Sidebar for ranking */}
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('student')}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'student' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                    >
                        عرض الطالب
                    </button>
                    <button 
                        onClick={() => setViewMode('teacher')}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'teacher' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                    >
                        عرض المعلم
                    </button>
              </div>

              {/* Scope Filter */}
              <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> {viewMode === 'student' ? 'من تنافس؟' : 'تصفية الطلاب'}
                  </h3>
                  <div className="space-y-2">
                      <FilterButton 
                         active={scope === 'class'} 
                         onClick={() => setScope('class')} 
                         icon={Users} 
                         label={viewMode === 'student' ? 'فصلي' : `فصل (${userGrade}/${userClass})`} 
                      />
                      <FilterButton 
                         active={scope === 'grade'} 
                         onClick={() => setScope('grade')} 
                         icon={GraduationCap} 
                         label={viewMode === 'student' ? 'دفعتي' : `الصف ${userGrade}`} 
                      />
                      <FilterButton 
                         active={scope === 'school'} 
                         onClick={() => setScope('school')} 
                         icon={School} 
                         label="كل المدرسة" 
                      />
                  </div>
              </div>

              {/* Topic & Unit Filter */}
              <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1">المادة والدروس</h3>
                  <div className="space-y-1">
                      {(['all', 'math', 'science', 'languages', 'history', 'arts'] as Subject[]).map(t => (
                          <div key={t} className="space-y-1">
                            <button
                                onClick={() => handleTopicChange(t)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-bold transition-colors
                                    ${topic === t ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <SubjectIcon subject={t} />
                                    <span>{t === 'all' ? 'المجموع العام' : t === 'math' ? 'الرياضيات' : t === 'science' ? 'العلوم' : t === 'languages' ? 'اللغات' : t === 'history' ? 'التاريخ' : 'الفنون'}</span>
                                </div>
                                {topic === t && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                            </button>
                            
                            {/* Sub-Units (Lessons) - Only show if specific topic selected */}
                            {topic === t && t !== 'all' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pr-6 space-y-1 border-r-2 border-slate-100 mr-3"
                                >
                                    {SUBJECT_UNITS[t as keyof typeof SUBJECT_UNITS]?.map((unit) => (
                                        <button
                                            key={unit}
                                            onClick={() => setSelectedUnit(unit)}
                                            className={`w-full text-right px-2 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-between
                                                ${selectedUnit === unit 
                                                    ? 'bg-blue-50 text-blue-600' 
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-3 h-3" />
                                                {unit}
                                            </div>
                                            {selectedUnit === unit && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Search */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="relative">
                      <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="بحث عن طالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                  </div>
              </div>
          </div>
          )}

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col relative">
              
              {viewType === 'class-insight' ? (
                  /* CLASS INSIGHT VIEW */
                  <ClassAnalyticsView 
                     grade={selectedGrade}
                     section={selectedSection}
                     students={classInsightStudents}
                  />
              ) : (
                  /* RANKING VIEW */
                  <>
                  {/* Teacher Insights Panel (Conditional) */}
                  <AnimatePresence>
                      {viewMode === 'teacher' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-800 text-white p-6 shadow-xl z-10 shrink-0 overflow-hidden"
                          >
                              <div className="flex items-center gap-2 mb-4">
                                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                                  <h3 className="font-bold text-lg">تحليلات الأداء</h3>
                                  <button onClick={() => openInfo('تحليلات المعلم', 'نظرة سريعة على متوسط أداء الفصل والطلاب الذين يحتاجون لمتابعة.')} className="text-white/50 hover:text-white"><Info className="w-4 h-4" /></button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                                  <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
                                      <div className="text-slate-400 text-xs font-bold mb-1">
                                          {isPlacementMode ? 'متوسط المركز' : 'متوسط الدرجات'}
                                      </div>
                                      <div className="text-2xl font-black">
                                          {isPlacementMode ? `#${stats.avgMetric.toFixed(1)}` : stats.avgMetric.toLocaleString()}
                                      </div>
                                  </div>
                                  <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
                                      <div className="text-slate-400 text-xs font-bold mb-1">الطلاب (النطاق)</div>
                                      <div className="text-2xl font-black">{stats.totalStudents}</div>
                                  </div>
                                  <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30">
                                      <div className="text-rose-200 text-xs font-bold mb-1 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3" /> يحتاجون دعم
                                      </div>
                                      <div className="text-2xl font-black text-rose-100">{stats.strugglingCount}</div>
                                  </div>
                                  <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
                                      <div className="text-emerald-200 text-xs font-bold mb-1 flex items-center gap-1">
                                          <Award className="w-3 h-3" /> الأفضل أداءً
                                      </div>
                                      <div className="text-sm font-bold text-emerald-100 truncate">{stats.topPerformer?.name}</div>
                                  </div>
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>

                  {/* List Header */}
                  <div className="bg-white border-b border-slate-100 p-3 px-6 grid grid-cols-[3rem_3rem_1fr_auto] gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-0">
                      <div className="text-center">#</div>
                      <div></div>
                      <div>{copy.rankingCol}</div>
                      <div className="text-left flex items-center justify-end gap-1">
                          {isPlacementMode ? 'متوسط المركز' : 'النقاط (XP)'}
                          <button onClick={() => openInfo(isPlacementMode ? 'متوسط المركز' : 'نقاط XP', isPlacementMode ? 'يتم حساب متوسط ترتيبك في كل درس على حدة.' : 'مجموع النقاط التي حصلت عليها من حل التمارين.')} className="hover:text-blue-500"><Info className="w-3 h-3" /></button>
                      </div>
                  </div>

                  {/* Scrollable List */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {filteredData.length > 0 ? (
                          filteredData.map(student => renderRankingRow(student as any))
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                              <Search className="w-12 h-12 mb-2" />
                              <p>لا توجد نتائج مطابقة</p>
                          </div>
                      )}
                  </div>
                  </>
              )}
          </div>
      </div>
    </div>
  );
};
