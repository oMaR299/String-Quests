
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Flame, Zap, Target, Calendar, Star,
  Trophy, CheckCircle2, Lock, Crown, ShoppingBag,
  TrendingUp, Shield, Sparkles, Medal, User, ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import { Button } from './Button';
import { BoostIcon } from './BoostIcon';
import { ComplexLeaderboardSystem } from './ComplexLeaderboardSystem';
import { useUser } from '../contexts/UserContext';

// --- Sub-Components for cleaner code ---

const AnimatedFlame = () => (
  <div className="relative w-32 h-32 flex items-center justify-center">
     {/* Outer Glow */}
     <motion.div
       animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
       transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
       className="absolute inset-0 bg-orange-500/40 blur-[50px] rounded-full"
     />
     {/* Core Flame Motion */}
     <motion.div
       animate={{ 
         y: [0, -10, 0], 
         scale: [1, 1.05, 1],
         rotate: [-2, 2, -2]
       }}
       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
       className="relative z-10 filter drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
     >
       <Flame className="w-24 h-24 text-orange-500 fill-gradient-to-t from-red-500 to-yellow-400" style={{ fill: "url(#flameGradient)" }} />
       {/* SVG Gradient Definition */}
       <svg width="0" height="0">
         <linearGradient id="flameGradient" x1="0%" y1="100%" x2="100%" y2="0%">
           <stop offset="0%" stopColor="#DC2626" />
           <stop offset="50%" stopColor="#F97316" />
           <stop offset="100%" stopColor="#FACC15" />
         </linearGradient>
       </svg>
     </motion.div>
     {/* Sparks */}
     {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [-20, -60], x: [(i-1)*10, (i-1)*20], opacity: [1, 0], scale: [1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full blur-[1px]"
        />
     ))}
  </div>
);

const LevelProgress = ({ current, max, level }: { current: number, max: number, level: number }) => {
    const percentage = Math.min((current / max) * 100, 100);
    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-slate-100" strokeWidth="5" fill="none" />
                    <circle 
                        cx="28" cy="28" r="24" 
                        className="stroke-blue-500" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeDasharray="150"
                        strokeDashoffset={150 - (150 * percentage) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">مستوى</span>
                    <span className="text-lg font-black text-blue-600">{level}</span>
                </div>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black text-slate-700">مستكشف المعرفة</span>
                    <span className="text-xs font-bold text-slate-400">{current} / {max} نقطة</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                    />
                </div>
            </div>
        </div>
    );
};

// Helper for icons
function BookOpenIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}

function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
}

// --- Main Screen ---

const StreakScreen: React.FC = () => {
  const { state } = useUser();
  const navigate = useNavigate();
  const { dailyCorrectAnswers: dailyCount, currentStreak, xp: totalXP, totalBoosts } = state;
  const [activeView, setActiveView] = useState<'overview' | 'leaderboard'>('overview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const weekDays = [
    { day: 'S', label: 'السبت', status: 'done' },
    { day: 'M', label: 'الأحد', status: 'done' },
    { day: 'T', label: 'الاثنين', status: 'done' },
    { day: 'W', label: 'الثلاثاء', status: 'done' },
    { day: 'T', label: 'الأربعاء', status: 'current' },
    { day: 'F', label: 'الخميس', status: 'locked' },
    { day: 'S', label: 'الجمعة', status: 'locked' },
  ];

  const missions = [
    { id: 1, title: "تحدي السرعة", desc: "أجب على 5 أسئلة في دقيقة", progress: 3, total: 5, xp: 50, icon: <Zap className="text-yellow-500" /> },
    { id: 2, title: "المواظب", desc: "أكمل درسين اليوم", progress: 1, total: 2, xp: 100, icon: <BookOpenIcon className="text-blue-500" /> }, 
    { id: 3, title: "الدقة المتناهية", desc: "حقق 100% في اختبار", progress: 0, total: 1, xp: 200, icon: <Target className="text-red-500" /> },
  ];
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-6xl mx-auto p-4 min-h-screen flex flex-col gap-6 relative z-20 pb-20"
    >
      {/* --- HEADER --- */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/learn')} variant="secondary" className="rounded-full w-12 h-12 flex items-center justify-center p-0 border-2 border-slate-100 hover:border-slate-300">
                <ArrowRight className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">مركز القيادة</h1>
                <div className="flex gap-4 mt-2">
                    <button 
                        onClick={() => setActiveView('overview')}
                        className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all border ${activeView === 'overview' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                        نظرة عامة
                    </button>
                    <button 
                        onClick={() => setActiveView('leaderboard')}
                        className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all border ${activeView === 'leaderboard' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                        لوحة الصدارة
                    </button>
                </div>
            </div>
        </div>
        <LevelProgress current={totalXP % 1000} max={1000} level={Math.floor(totalXP/1000) + 1} />
      </motion.header>

      {/* --- VIEW CONTENT --- */}
      <AnimatePresence mode="wait">
      
      {activeView === 'overview' ? (
      <motion.div 
        key="overview"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
      >
        
        {/* 1. HERO STREAK CARD (Large, Top Left) */}
        <motion.div 
            variants={itemVariants}
            className="md:col-span-8 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-orange-500/20 flex flex-col md:flex-row items-center md:items-start justify-between min-h-[300px]"
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-yellow-500/30 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between text-center md:text-right items-center md:items-start w-full">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4 shadow-sm">
                        <TrendingUp className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs font-bold tracking-wide">أداء مذهل!</span>
                    </div>
                    <h2 className="text-7xl font-black tracking-tighter mb-2 drop-shadow-sm">{currentStreak}</h2>
                    <p className="text-orange-100 text-xl font-medium mb-8">أيام متتالية من الحماس 🔥</p>
                </div>

                {/* Weekly Visualizer */}
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-4 w-full border border-white/10">
                    <div className="flex justify-between items-center">
                        {weekDays.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2
                                    ${d.status === 'done' ? 'bg-white text-orange-600 border-white shadow-lg scale-110' : 
                                      d.status === 'current' ? 'bg-orange-500/50 text-white border-orange-300 animate-pulse' : 
                                      'bg-transparent text-orange-200/50 border-orange-200/10'}
                                `}>
                                    {d.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : d.status === 'locked' ? <Lock className="w-4 h-4" /> : d.day}
                                </div>
                                <span className="text-[10px] font-bold text-orange-100/60">{d.label.charAt(0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animated Flame Right Side */}
            <div className="relative z-10 mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-12">
                <AnimatedFlame />
            </div>
        </motion.div>

        {/* 2. BOOST CARD (Top Right) */}
        <motion.div 
            variants={itemVariants}
            className="md:col-span-4 bg-white rounded-[2.5rem] p-1 bg-gradient-to-b from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20"
        >   
            <div className="bg-white rounded-[2.3rem] h-full p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent opacity-50"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                         <BoostIcon className="w-8 h-8" />
                    </div>
                    <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">Active</span>
                </div>

                <div className="text-center mt-2 mb-6 relative z-10">
                    <div className="text-6xl font-black text-slate-800 tracking-tighter">{totalBoosts}</div>
                    <div className="text-indigo-500 font-bold">معززات الطاقة</div>
                </div>

                <Button fullWidth className="mt-auto bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 group">
                    <span>متجر المعززات</span>
                    <ShoppingBag className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
            </div>
        </motion.div>

        {/* 3. LEAGUE CARD (Middle Left) */}
        <motion.div 
            variants={itemVariants}
            onClick={() => setActiveView('leaderboard')}
            className="md:col-span-4 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    الدوري الذهبي
                </h3>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            <div className="space-y-3 mb-4">
                 {/* Rank 1 (Fake) */}
                 <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-2xl border border-yellow-100">
                     <div className="flex items-center gap-3">
                         <span className="font-black text-yellow-600 w-4 text-center">1</span>
                         <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-white shadow-sm"></div>
                         <span className="font-bold text-slate-700 text-sm">سارة .ك</span>
                     </div>
                     <span className="text-xs font-black text-yellow-600">3200 نقطة</span>
                 </div>
                 {/* You */}
                 <div className="flex items-center justify-between bg-slate-800 p-3 rounded-2xl shadow-lg shadow-slate-800/20 transform scale-105">
                     <div className="flex items-center gap-3">
                         <span className="font-black text-white w-4 text-center">7</span>
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-sm"></div>
                         <span className="font-bold text-white text-sm">أنت</span>
                     </div>
                     <span className="text-xs font-black text-white">{totalXP} نقطة</span>
                 </div>
                 {/* Rank 5 */}
                 <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 opacity-60">
                     <div className="flex items-center gap-3">
                         <span className="font-black text-slate-400 w-4 text-center">8</span>
                         <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                         <span className="font-bold text-slate-700 text-sm">خالد .ع</span>
                     </div>
                     <span className="text-xs font-black text-slate-400">1950 XP</span>
                 </div>
            </div>
            <div className="text-center text-xs text-slate-400 font-bold mt-auto">
                اضغط لعرض الترتيب الكامل
            </div>
        </motion.div>

        {/* 4. MISSIONS (Middle Right - Span 8) */}
        <motion.div 
            variants={itemVariants}
            className="md:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg"
        >
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                     <h3 className="font-black text-slate-800 text-xl">المهام اليومية</h3>
                     <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                         {missions.filter(m => m.progress >= m.total).length}/{missions.length} منجز
                     </div>
                 </div>
                 <div className="text-slate-400 font-medium text-sm">
                    تتجدد خلال 14:02
                 </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {missions.map((mission) => {
                    const isCompleted = mission.progress >= mission.total;
                    return (
                        <div key={mission.id} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors group bg-slate-50/50">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-xl
                                ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-white text-slate-600'}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : mission.icon}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h4 className="font-bold text-slate-800">{mission.title}</h4>
                                    <span className="text-xs font-black text-slate-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                                        {mission.progress}/{mission.total}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">{mission.desc}</p>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(mission.progress/mission.total)*100}%` }}
                                        className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[80px]">
                                <div className="flex items-center gap-1 text-sm font-black text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-100 shadow-sm">
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                    +{mission.xp}
                                </div>
                                {isCompleted && (
                                    <Button size="sm" className="h-8 text-xs px-3 bg-green-500 hover:bg-green-600 text-white shadow-green-200">
                                        جمع
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </motion.div>

        {/* 5. STORE TEASER (Bottom - Span 12) */}
        <motion.div 
            variants={itemVariants}
            className="md:col-span-12 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center justify-between"
        >
            <div className="relative z-10 max-w-lg">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="bg-purple-500/30 border border-purple-400/30 text-purple-100 px-3 py-1 rounded-lg text-xs font-bold uppercase">قريباً</span>
                    <ShoppingBag className="w-5 h-5 text-purple-300" />
                 </div>
                 <h3 className="text-3xl font-black mb-2">متجر الجوائز</h3>
                 <p className="text-indigo-200 font-medium">استبدل نقاطك بأشكال شخصيات جديدة، خلفيات، وقوى خارقة.</p>
            </div>
            
            <div className="hidden md:flex gap-4 relative z-10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                        <Lock className="w-8 h-8 text-white/50" />
                    </div>
                ))}
            </div>
        </motion.div>
      </motion.div>
      ) : (
        /* --- LEADERBOARD VIEW (NEW COMPLEX SYSTEM) --- */
        <motion.div
           key="leaderboard"
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="w-full h-[800px]" 
        >
           <ComplexLeaderboardSystem />
        </motion.div>
      )}
      </AnimatePresence>

    </motion.div>
  );
};

export default StreakScreen;
