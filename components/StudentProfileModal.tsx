
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Trophy, GraduationCap, School, Users, 
  TrendingUp, Calendar, Target, ChevronDown, ChevronUp,
  Calculator, FlaskConical, Languages, Landmark, Palette,
  Award, Star, Clock, Info, Timer, Zap, BarChart3, BrainCircuit, Crown
} from 'lucide-react';
import { 
  StudentProfile, 
  MOCK_SCHOOL_DATA, 
  SUBJECT_UNITS, 
  Subject,
  League
} from '../data/complexLeaderboardData';
import { StatsInfoModal } from './StatsInfoModal';
import { InfoHelpModal } from './InfoHelpModal';
import { StudyBehaviorView } from './StudyBehaviorView';

interface StudentProfileModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

// Helper to format minutes into H:M
const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} د`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}س ${m}د`;
};

// Circular Progress Component for Accuracy
const AccuracyRing = ({ percentage, size = 40, stroke = 3 }: { percentage: number, size?: number, stroke?: number }) => {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    const color = percentage >= 90 ? 'text-emerald-500' : percentage >= 75 ? 'text-blue-500' : percentage >= 50 ? 'text-yellow-500' : 'text-rose-500';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle cx={size/2} cy={size/2} r={radius} className="stroke-slate-200 fill-none" strokeWidth={stroke} />
                <circle 
                    cx={size/2} cy={size/2} r={radius} 
                    className={`${color} fill-none transition-all duration-500 ease-out`} 
                    strokeWidth={stroke} 
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute text-[9px] font-black ${color}`}>{percentage}%</span>
        </div>
    );
};

// Helper to calculate rank within a specific scope
const calculateRank = (studentId: string, data: StudentProfile[], scope: 'school' | 'grade' | 'class') => {
  let filtered = data;
  const targetStudent = data.find(s => s.id === studentId);
  if (!targetStudent) return 0;

  if (scope === 'grade') {
    filtered = data.filter(s => s.grade === targetStudent.grade);
  } else if (scope === 'class') {
    filtered = data.filter(s => s.grade === targetStudent.grade && s.section === targetStudent.section);
  }

  // Sort by Total XP descending
  filtered.sort((a, b) => b.totalXp - a.totalXp);
  return filtered.findIndex(s => s.id === studentId) + 1;
};

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

const LeagueBadge = ({ league, onClick }: { league: League, onClick?: () => void }) => {
    const config = {
        bronze: { color: 'bg-amber-700', border: 'border-amber-600', text: 'برونزي' },
        silver: { color: 'bg-slate-400', border: 'border-slate-300', text: 'فضي' },
        gold: { color: 'bg-yellow-500', border: 'border-yellow-400', text: 'ذهبي' },
        platinum: { color: 'bg-cyan-500', border: 'border-cyan-400', text: 'بلاتيني' },
        diamond: { color: 'bg-fuchsia-500', border: 'border-fuchsia-400', text: 'ماسي' },
    };
    const c = config[league];
    
    return (
        <button 
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border-2 ${c.color} ${c.border} flex items-center gap-1 hover:scale-105 transition-transform`}
        >
            <span>{c.text}</span>
            <Trophy className="w-3 h-3" />
        </button>
    );
};

const getLeagueInfo = (league: League) => {
    switch(league) {
        case 'bronze': return { title: "الدوري البرونزي", desc: "بداية رحلة الأبطال. اجمع النقاط للصعود إلى الدوري الفضي." };
        case 'silver': return { title: "الدوري الفضي", desc: "أنت في الطريق الصحيح! المنافسة هنا قوية، استمر في التقدم." };
        case 'gold': return { title: "الدوري الذهبي", desc: "دوري النخبة! أنت من بين أفضل الطلاب أداءً." };
        case 'platinum': return { title: "الدوري البلاتيني", desc: "مرحلة الاحتراف. القليل فقط يصلون إلى هنا." };
        case 'diamond': return { title: "الدوري الماسي", desc: "القمة المطلقة! أنت أسطورة المدرسة." };
        default: return { title: "الدوري", desc: "" };
    }
};

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showStatsInfo, setShowStatsInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'behavior'>('performance');
  const [infoModalConfig, setInfoModalConfig] = useState<{open: boolean, title: string, desc: string, icon?: React.ReactNode}>({
      open: false, title: '', desc: ''
  });

  // Memoize ranks
  const ranks = useMemo(() => {
    if (!student) return { school: 0, grade: 0, class: 0 };
    return {
      school: calculateRank(student.id, MOCK_SCHOOL_DATA, 'school'),
      grade: calculateRank(student.id, MOCK_SCHOOL_DATA, 'grade'),
      class: calculateRank(student.id, MOCK_SCHOOL_DATA, 'class'),
    };
  }, [student]);

  // Calculate Global Aggregates
  const aggregates = useMemo(() => {
      if (!student) return { acc: 0, time: 0 };
      const subjs = Object.values(student.subjectDetails) as { xp: number; accuracy: number; timeSpent: number }[];
      const totalTime = subjs.reduce((acc, curr) => acc + curr.timeSpent, 0);
      const avgAcc = Math.round(subjs.reduce((acc, curr) => acc + curr.accuracy, 0) / subjs.length);
      return { acc: avgAcc, time: totalTime };
  }, [student]);

  const openInfo = (title: string, desc: string, icon?: React.ReactNode) => {
      setInfoModalConfig({ open: true, title, desc, icon });
  };
  
  const handleLeagueClick = () => {
      if(!student) return;
      const info = getLeagueInfo(student.league);
      openInfo(info.title, info.desc, <Crown className="w-8 h-8 text-white" />);
  };

  if (!student) return null;

  return (
    <AnimatePresence>
      <StatsInfoModal isOpen={showStatsInfo} onClose={() => setShowStatsInfo(false)} />
      <InfoHelpModal 
        isOpen={infoModalConfig.open} 
        onClose={() => setInfoModalConfig({...infoModalConfig, open: false})}
        title={infoModalConfig.title}
        description={infoModalConfig.desc}
        icon={infoModalConfig.icon}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-50 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-white flex flex-col"
        >
          {/* --- HEADER --- */}
          <div className="bg-white p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shrink-0 relative overflow-hidden">
             {/* Decorative BG */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

            <div className="flex items-center gap-6 relative z-10">
               <div className={`w-24 h-24 rounded-full ${student.avatar} border-[6px] border-slate-50 shadow-xl flex items-center justify-center text-4xl font-black text-slate-700/50`}>
                   {student.name.charAt(0)}
               </div>
               <div>
                   <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h2>
                       <LeagueBadge league={student.league} onClick={handleLeagueClick} />
                   </div>
                   <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
                       <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                           <GraduationCap className="w-4 h-4" /> الصف {student.grade}
                       </span>
                       <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                           <Users className="w-4 h-4" /> الشعبة {student.section}
                       </span>
                   </div>
               </div>
            </div>
            
            {/* Header Global Stats */}
            <div className="flex gap-4 relative z-10 self-end md:self-center">
                 <button 
                    onClick={() => openInfo('الدقة العامة', 'متوسط دقة إجابات الطالب في جميع المواد الدراسية.', <Target className="w-8 h-8 text-white" />)}
                    className="flex flex-col items-center bg-cyan-50 px-4 py-2 rounded-2xl border border-cyan-100 hover:bg-cyan-100 transition-colors"
                 >
                     <span className="text-[10px] uppercase font-bold text-cyan-400 mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> الدقة العامة
                     </span>
                     <span className="text-2xl font-black text-cyan-600">{aggregates.acc}%</span>
                 </button>
                 <button 
                    onClick={() => openInfo('وقت التعلم', 'إجمالي الوقت الذي قضاه الطالب في حل التمارين والدروس.', <Clock className="w-8 h-8 text-white" />)}
                    className="flex flex-col items-center bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-colors"
                 >
                     <span className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> وقت التعلم
                     </span>
                     <span className="text-2xl font-black text-amber-600" dir="ltr">{formatTime(aggregates.time)}</span>
                 </button>
            </div>

            <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20">
                <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* --- TABS --- */}
          <div className="flex gap-2 px-6 pt-4 bg-white border-b border-slate-100 sticky top-0 z-20">
              <button 
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all border-t border-x ${
                    activeTab === 'performance' 
                    ? 'bg-slate-50 text-slate-800 border-slate-200 -mb-px relative z-10' 
                    : 'bg-white text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                  <Trophy className="w-4 h-4" />
                  الأداء والنتائج
              </button>
              <button 
                onClick={() => setActiveTab('behavior')}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl font-bold text-sm transition-all border-t border-x ${
                    activeTab === 'behavior' 
                    ? 'bg-slate-50 text-slate-800 border-slate-200 -mb-px relative z-10' 
                    : 'bg-white text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                  <BrainCircuit className="w-4 h-4" />
                  سلوكيات التعلم
              </button>
          </div>

          {/* --- BODY SCROLL --- */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50">
            
            {activeTab === 'behavior' ? (
                <StudyBehaviorView student={student} />
            ) : (
            <>
            {/* 1. Global Stats Grid */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4" /> الأداء العام
                    </h3>
                    <button 
                        onClick={() => setShowStatsInfo(true)}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                    >
                        <Info className="w-3 h-3" />
                        دليل الإحصائيات
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-200 transition-colors">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="w-16 h-16" /></div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">XP الكلي</div>
                        <div className="text-3xl font-black text-indigo-600">{student.totalXp.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-slate-300 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-5"><School className="w-16 h-16" /></div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">ترتيب المدرسة</div>
                        <div className="text-3xl font-black text-slate-800 flex items-center gap-2">
                            #{ranks.school}
                            {ranks.school <= 10 && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-slate-300 transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">ترتيب الدفعة</div>
                        <div className="text-3xl font-black text-slate-800">#{ranks.grade}</div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-slate-300 transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">ترتيب الفصل</div>
                        <div className="text-3xl font-black text-slate-800">#{ranks.class}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. Activity & Trend (Left Column) */}
                <div className="space-y-6">
                    {/* Activity Chart */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black text-slate-700 mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" /> النشاط الأسبوعي
                        </h3>
                        <div className="flex items-end justify-between h-32 px-2">
                            {student.weeklyActivity.map((val, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 w-1/7 group cursor-pointer">
                                    <div className="relative w-full flex justify-center h-full items-end">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            className={`w-3 md:w-4 rounded-full ${val > 60 ? 'bg-emerald-400' : val > 30 ? 'bg-blue-400' : 'bg-slate-200'} group-hover:scale-110 transition-transform`}
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 shadow-lg translate-y-2 group-hover:translate-y-0">
                                            {val}% نشاط
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600">
                                        {['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                         {/* BG Shapes */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                         <div className="flex justify-between items-start mb-4 relative z-10">
                             <div>
                                 <div className="flex items-center gap-2">
                                     <span className="text-indigo-100 text-xs font-bold uppercase mb-1">مؤشر الأداء</span>
                                     <button onClick={() => openInfo('مؤشر الأداء', 'يعكس تغير مستوى الطالب مقارنة بالأسابيع الماضية بناءً على النقاط والنشاط.', <TrendingUp className="w-8 h-8 text-white" />)} className="text-white/50 hover:text-white"><Info className="w-3 h-3" /></button>
                                 </div>
                                 <div className="text-3xl font-black tracking-tight">
                                     {student.trend === 'up' ? 'صاعد بقوة 🚀' : student.trend === 'down' ? 'يحتاج تحسين 📉' : 'مستقر ⚖️'}
                                 </div>
                             </div>
                             <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
                                 <TrendingUp className="w-6 h-6 text-white" />
                             </div>
                         </div>
                         <p className="text-indigo-100/90 text-sm font-medium leading-relaxed relative z-10">
                             {student.trend === 'up' 
                                ? 'أداء الطالب يتحسن بشكل ملحوظ مقارنة بالأسبوع الماضي.' 
                                : student.trend === 'stable' 
                                ? 'يحافظ الطالب على مستوى ثابت في معظم المواد.'
                                : 'انخفاض طفيف في النشاط، ينصح بالمتابعة المستمرة.'}
                         </p>
                    </div>
                </div>

                {/* 3. Detailed Subjects Breakdown (Right Column - Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
                        <Award className="w-4 h-4" /> تفاصيل المواد
                    </h3>
                    
                    {/* Map through subjects */}
                    {(['math', 'science', 'languages', 'history', 'arts'] as Subject[]).map((subject) => {
                        const details = student.subjectDetails[subject as keyof typeof student.subjectDetails];
                        const units = SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS];
                        const isExpanded = expandedSubject === subject;

                        return (
                            <motion.div 
                                layout
                                key={subject} 
                                className={`bg-white rounded-[2rem] border transition-all overflow-hidden
                                    ${isExpanded ? 'border-blue-200 shadow-lg ring-4 ring-blue-50 z-10' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}
                                `}
                            >
                                {/* Subject Header (Clickable) */}
                                <button 
                                    onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                                    className="w-full flex items-center justify-between p-5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform`}>
                                            <SubjectIcon subject={subject} className="w-7 h-7 text-slate-600" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-slate-800 capitalize mb-1">
                                                {subject === 'math' ? 'الرياضيات' : subject === 'science' ? 'العلوم' : subject === 'languages' ? 'اللغات' : subject === 'history' ? 'التاريخ' : 'الفنون'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                                <span>{units.length} وحدات</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(details.timeSpent)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 md:gap-8">
                                        {/* Accuracy Ring */}
                                        <div className="hidden sm:flex flex-col items-center gap-1">
                                            <AccuracyRing percentage={details.accuracy} />
                                            <span className="text-[10px] font-bold text-slate-400">الدقة</span>
                                        </div>

                                        <div className="text-right min-w-[70px]">
                                            <div className="text-xl font-black text-indigo-600">{details.xp.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">XP مكتسب</div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Units List */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-slate-50/50"
                                        >
                                            {/* Sub-Header for Units */}
                                            <div className="px-6 py-3 bg-slate-100/50 grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                <div className="col-span-6">اسم الدرس</div>
                                                <div className="col-span-2 text-center">الوقت</div>
                                                <div className="col-span-2 text-center">الدقة</div>
                                                <div className="col-span-2 text-center">النقاط</div>
                                            </div>

                                            <div className="p-4 grid gap-2">
                                                {units.map((unit) => {
                                                    const key = `${subject}-${unit}`;
                                                    const lessonStat = student.lessonDetails[key] || { xp: 0, accuracy: 0, timeSpent: 0 };
                                                    
                                                    return (
                                                        <div key={unit} className="grid grid-cols-12 items-center bg-white p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                                            {/* Name */}
                                                            <div className="col-span-6 flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lessonStat.xp > 500 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                    <Target className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-bold text-slate-700 text-sm capitalize truncate pr-2">{unit}</span>
                                                            </div>
                                                            
                                                            {/* Time */}
                                                            <div className="col-span-2 text-center flex justify-center">
                                                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                                                                    {formatTime(lessonStat.timeSpent)}
                                                                </span>
                                                            </div>

                                                            {/* Accuracy */}
                                                            <div className="col-span-2 flex justify-center">
                                                                 <div className={`text-xs font-black px-2 py-1 rounded-lg ${lessonStat.accuracy >= 90 ? 'bg-emerald-100 text-emerald-600' : lessonStat.accuracy >= 70 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                     {lessonStat.accuracy}%
                                                                 </div>
                                                            </div>

                                                            {/* XP */}
                                                            <div className="col-span-2 text-center">
                                                                <span className="text-sm font-black text-slate-800">
                                                                    {lessonStat.xp}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
