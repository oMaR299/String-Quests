
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, PieChart, TrendingUp, Sun, Moon, BookOpen } from 'lucide-react';
import { StudentProfile } from '../data/complexLeaderboardData';

interface StudyBehaviorViewProps {
  student: StudentProfile;
}

export const StudyBehaviorView: React.FC<StudyBehaviorViewProps> = ({ student }) => {
  
  // Safe Accessors & Defaults to prevent empty charts
  const hourlyData = (student.hourlyActivity && student.hourlyActivity.length === 24) 
    ? student.hourlyActivity 
    : [0,0,0,0,0,5,10,20,40,30,20,10,20,30,50,70,80,60,40,20,10,5,0,0]; // Fallback curve

  // Find Peak Hour
  const maxActivity = Math.max(...hourlyData) || 1;
  const peakHour = hourlyData.indexOf(maxActivity);
  
  const formatHour = (h: number) => {
      if(h === 0) return '12 ص';
      if(h === 12) return '12 م';
      return h > 12 ? `${h-12} م` : `${h} ص`;
  };

  const focusData = (student.focusDistribution && Object.keys(student.focusDistribution).length > 0)
    ? student.focusDistribution
    : { math: 30, science: 30, languages: 20, history: 10, arts: 10 };

  const historyData = (student.improvementHistory && student.improvementHistory.length > 0)
    ? student.improvementHistory
    : [
        { month: 'يناير', score: 50 }, { month: 'فبراير', score: 60 },
        { month: 'مارس', score: 65 }, { month: 'أبريل', score: 70 },
        { month: 'مايو', score: 80 }, { month: 'يونيو', score: 85 }
      ];

  return (
    <div className="space-y-6">
       {/* 1. Time of Day Analysis */}
       <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-amber-500" /> أوقات النشاط
               </h3>
               <div className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                   وقت الذروة: <span className="text-amber-600">{formatHour(peakHour)}</span>
               </div>
           </div>

           <div className="flex items-end justify-between h-32 gap-1 pb-2">
               {hourlyData.map((val, hour) => {
                   // Normalize height: Ensure at least 5% height so bar is visible
                   const heightPercent = Math.max((val / maxActivity) * 100, 5);
                   const isPeak = hour === peakHour;
                   
                   // Determine color based on time of day
                   let color = "bg-slate-200";
                   if(hour >= 6 && hour < 18) color = "bg-amber-300"; // Day
                   else color = "bg-indigo-300"; // Night
                   
                   if(isPeak) color = "bg-emerald-400";

                   return (
                       <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                           <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.5, delay: hour * 0.02 }}
                                className={`w-full rounded-t-sm ${color} transition-all opacity-80 group-hover:opacity-100`}
                           />
                           
                           {/* Tooltip */}
                           <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap shadow-xl">
                               {formatHour(hour)}: {val} نشاط
                           </div>
                       </div>
                   );
               })}
           </div>
           
           <div className="flex justify-between mt-2 px-2 text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2">
               <div className="flex items-center gap-1"><Sun className="w-3 h-3" /> صباحاً</div>
               <div className="flex items-center gap-1"><Moon className="w-3 h-3" /> مساءً</div>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* 2. Focus Distribution */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                   <PieChart className="w-4 h-4 text-purple-500" /> توزيع التركيز
               </h3>
               <div className="space-y-4">
                   {Object.entries(focusData)
                     .sort(([,a], [,b]) => (b as number) - (a as number)) // Sort highest first
                     .map(([subj, percentRaw], idx) => {
                       const percent = percentRaw as number;
                       return (
                       <div key={subj}>
                           <div className="flex justify-between text-xs font-bold mb-1">
                               <span className="capitalize text-slate-600">
                                   {subj === 'math' ? 'الرياضيات' : subj === 'science' ? 'العلوم' : subj === 'languages' ? 'اللغات' : subj === 'history' ? 'التاريخ' : 'الفنون'}
                               </span>
                               <span className="text-slate-800">{percent}%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                               <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${percent}%` }}
                                   transition={{ duration: 0.8, delay: idx * 0.1 }}
                                   className={`h-full rounded-full ${percent > 30 ? 'bg-purple-500' : 'bg-purple-300'}`}
                               />
                           </div>
                       </div>
                   )})}
               </div>
           </div>

           {/* 3. Improvement History */}
           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-emerald-500" /> التطور الشهري
               </h3>
               
               <div className="flex items-end justify-between h-40 pt-4 px-2 gap-3 border-b border-slate-100 pb-2">
                   {historyData.map((entry, idx) => (
                       <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                           {/* Line/Bar */}
                           <div className="relative w-full flex justify-center items-end h-full">
                               <motion.div 
                                   initial={{ height: 0 }}
                                   animate={{ height: `${Math.max(entry.score, 10)}%` }}
                                   transition={{ duration: 0.6, delay: idx * 0.1 }}
                                   className="w-2 md:w-3 bg-gradient-to-t from-emerald-200 to-emerald-400 rounded-t-full group-hover:from-emerald-400 group-hover:to-emerald-500 transition-colors"
                               />
                               {/* Dot */}
                               <motion.div 
                                   initial={{ bottom: 0 }}
                                   animate={{ bottom: `${Math.max(entry.score, 10)}%` }}
                                   transition={{ duration: 0.6, delay: idx * 0.1 }}
                                   className="absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-sm z-10 translate-y-1/2 group-hover:scale-125 transition-transform"
                               />
                           </div>
                           
                           {/* Month */}
                           <span className="text-[9px] font-bold text-slate-400 mt-2">{entry.month}</span>

                           {/* Tooltip */}
                           <div className="absolute -top-8 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                               {entry.score}/100
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       {/* Recommendation */}
       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start">
           <div className="bg-white p-2 rounded-xl shadow-sm text-blue-500 mt-1">
               <BookOpen className="w-5 h-5" />
           </div>
           <div>
               <h4 className="font-bold text-blue-900 text-sm mb-1">توصية النظام</h4>
               <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                   بناءً على نشاط {student.name}، يبدو أن التركيز العالي يكون في الفترة المسائية. ننصح بتكثيف دروس "العلوم" في هذا الوقت لتحقيق أفضل نتائج، ومراجعة "اللغات" في الصباح.
               </p>
           </div>
       </div>
    </div>
  );
};
