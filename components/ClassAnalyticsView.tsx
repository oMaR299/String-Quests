
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Clock, Target, AlertCircle, 
  Award, BookOpen, BrainCircuit, Calendar,
  BarChart3, Zap, ArrowUpRight, ArrowDownRight,
  Calculator, FlaskConical, Languages, Landmark, Palette, Trophy, Search, User
} from 'lucide-react';
import { StudentProfile, GradeLevel, ClassSection } from '../data/complexLeaderboardData';
import { getSubjectBreakdownForClass } from '../utils/teacherAggregator';

interface ClassAnalyticsViewProps {
  grade: GradeLevel;
  section: ClassSection;
  students: StudentProfile[];
  onStudentClick?: (student: StudentProfile) => void;
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

export const ClassAnalyticsView: React.FC<ClassAnalyticsViewProps> = ({ grade, section, students, onStudentClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // --- Aggregation Logic ---
  const stats = useMemo(() => {
    if (students.length === 0) return null;

    const totalStudents = students.length;
    const totalXP = students.reduce((acc, s) => acc + s.totalXp, 0);
    const avgXP = Math.round(totalXP / totalStudents);

    // Calculate Average Accuracy across all subjects for the class
    const totalAccuracy = students.reduce((acc, s) => {
        const subjs = Object.values(s.subjectDetails) as { accuracy: number }[];
        const sAvg = subjs.reduce((a, c) => a + c.accuracy, 0) / subjs.length;
        return acc + sAvg;
    }, 0);
    const avgAccuracy = Math.round(totalAccuracy / totalStudents);

    // Activity Curve Aggregation
    const aggHourly = new Array(24).fill(0);
    students.forEach(s => {
        s.hourlyActivity.forEach((val, idx) => {
            aggHourly[idx] += val;
        });
    });
    const avgHourly = aggHourly.map(v => Math.round(v / totalStudents));

    // Subject Breakdown (Proficiency)
    const subjectProficiency = getSubjectBreakdownForClass(students);

    // Identify Outliers
    const sortedByXP = [...students].sort((a, b) => b.totalXp - a.totalXp);
    const topStudents = sortedByXP.slice(0, 3);
    const strugglingStudents = sortedByXP.slice(-3).reverse(); // Lowest 3

    return { totalStudents, avgXP, avgAccuracy, avgHourly, subjectProficiency, topStudents, strugglingStudents };
  }, [students]);

  // Filtered Students for Roster Table
  const filteredStudents = useMemo(() => {
      return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, searchQuery]);

  if (!stats) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p>لا يوجد طلاب في هذا الفصل</p>
          </div>
      );
  }

  const maxHourlyVal = Math.max(...stats.avgHourly) || 1;

  return (
    <div className="p-6 md:p-8 space-y-8 pb-20">
        
        {/* 1. Class Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5"><Users className="w-16 h-16" /></div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">عدد الطلاب</div>
                <div className="text-3xl font-black text-slate-800">{stats.totalStudents}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">طالب وطالبة</div>
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-5"><Zap className="w-16 h-16" /></div>
                 <div className="text-xs font-bold text-slate-400 uppercase mb-2">متوسط XP</div>
                 <div className="text-3xl font-black text-indigo-600">{stats.avgXP.toLocaleString()}</div>
                 <div className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> أداء ممتاز
                 </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-5"><Target className="w-16 h-16" /></div>
                 <div className="text-xs font-bold text-slate-400 uppercase mb-2">متوسط الدقة</div>
                 <div className="text-3xl font-black text-blue-600">{stats.avgAccuracy}%</div>
                 <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.avgAccuracy}%` }} />
                 </div>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 rounded-3xl shadow-lg shadow-purple-500/20 text-white flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="text-xs font-bold text-white/60 uppercase mb-2">المادة الأقوى</div>
                 <div className="text-2xl font-black capitalize mb-1">
                     {/* Find max accuracy subject */}
                     {(() => {
                        const best = stats.subjectProficiency.reduce((prev, current) => (prev.avgAccuracy > current.avgAccuracy) ? prev : current);
                        return best.subject === 'math' ? 'الرياضيات' : 
                               best.subject === 'science' ? 'العلوم' :
                               best.subject === 'languages' ? 'اللغات' :
                               best.subject === 'history' ? 'التاريخ' : 'الفنون';
                     })()}
                 </div>
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">
                     أداء متميز للفصل
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 2. Activity Heatmap */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-700 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" /> نشاط الفصل (المتوسط الساعي)
                    </h3>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                           <span className="w-2 h-2 rounded-full bg-slate-200"></span> خامل
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                           <span className="w-2 h-2 rounded-full bg-amber-400"></span> نشط
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between h-40 gap-1 pb-2">
                    {stats.avgHourly.map((val, hour) => {
                        const heightPercent = Math.max((val / maxHourlyVal) * 100, 5);
                        return (
                            <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    className={`w-full rounded-t-sm transition-all opacity-80 group-hover:opacity-100 ${val > (maxHourlyVal * 0.6) ? 'bg-amber-400' : 'bg-slate-200'}`}
                                />
                                <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                    {hour}:00 - {val} نشاط
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2 px-1">
                    <span>12 ص</span>
                    <span>6 ص</span>
                    <span>12 م</span>
                    <span>6 م</span>
                    <span>11 م</span>
                </div>
            </div>

            {/* 3. Subject Proficiency (Vertical Bars) */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6">
                    <BrainCircuit className="w-5 h-5 text-purple-500" /> التميز الأكاديمي
                </h3>
                <div className="space-y-5">
                    {stats.subjectProficiency.map((item, idx) => (
                        <div key={item.subject}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <SubjectIcon subject={item.subject} className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold capitalize text-slate-600">
                                    {item.subject === 'math' ? 'الرياضيات' : item.subject === 'science' ? 'العلوم' : item.subject === 'languages' ? 'اللغات' : item.subject === 'history' ? 'التاريخ' : 'الفنون'}
                                    </span>
                                </div>
                                <span className={`text-xs font-black ${item.avgAccuracy >= 80 ? 'text-emerald-500' : item.avgAccuracy >= 60 ? 'text-blue-500' : 'text-rose-500'}`}>{item.avgAccuracy}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.avgAccuracy}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                    className={`h-full rounded-full ${
                                        item.avgAccuracy >= 80 ? 'bg-emerald-400' : 
                                        item.avgAccuracy >= 60 ? 'bg-blue-400' : 'bg-rose-400'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 4. Student Highlights (Top & Struggling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Top Performers */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full -translate-x-10 -translate-y-10 blur-2xl pointer-events-none"></div>
                <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 relative z-10">
                    <Award className="w-5 h-5 text-emerald-500" /> لوحة الشرف
                </h3>
                <div className="space-y-3 relative z-10">
                    {stats.topStudents.map((s, idx) => (
                        <button key={s.id} onClick={() => onStudentClick && onStudentClick(s)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-400' : 'bg-amber-600'}`}>
                                 {idx + 1}
                             </div>
                             <div className={`w-8 h-8 rounded-full ${s.avatar} border border-slate-200`}></div>
                             <div className="flex-1 text-right font-bold text-slate-700 text-sm">{s.name}</div>
                             <div className="font-black text-emerald-600 text-sm">{s.totalXp.toLocaleString()} XP</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Needs Attention */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-rose-50 rounded-full -translate-x-10 -translate-y-10 blur-2xl pointer-events-none"></div>
                 <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 relative z-10">
                    <AlertCircle className="w-5 h-5 text-rose-500" /> يحتاجون للمتابعة
                </h3>
                <div className="space-y-3 relative z-10">
                    {stats.strugglingStudents.map((s) => (
                        <button key={s.id} onClick={() => onStudentClick && onStudentClick(s)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100 hover:bg-rose-100 transition-colors">
                             <div className={`w-8 h-8 rounded-full ${s.avatar} border border-slate-200 opacity-70`}></div>
                             <div className="flex-1 text-right font-bold text-slate-700 text-sm">{s.name}</div>
                             <div className="text-xs font-bold text-rose-400 bg-white px-2 py-1 rounded-lg">
                                 دقة منخفضة ({(Object.values(s.subjectDetails) as {accuracy:number}[]).reduce((a,b) => a+b.accuracy,0)/5}%)
                             </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 5. COMPLETE STUDENT ROSTER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <h3 className="font-black text-slate-700 flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-indigo-500" /> قائمة الطلاب
                </h3>
                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="بحث عن طالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm font-bold focus:outline-none focus:border-indigo-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">الطالب</th>
                            <th className="px-6 py-4">نقاط XP</th>
                            <th className="px-6 py-4">الدقة</th>
                            <th className="px-6 py-4">النشاط</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student) => {
                             const acc = (Object.values(student.subjectDetails) as {accuracy:number}[]).reduce((a,b) => a+b.accuracy,0)/5;
                             const trend = student.trend;
                             return (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onStudentClick && onStudentClick(student)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full ${student.avatar} flex items-center justify-center text-slate-600 font-black border border-slate-100`}>
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{student.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">#{student.id.split('-').pop()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-700">
                                        {student.totalXp.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${acc > 80 ? 'bg-emerald-100 text-emerald-600' : acc > 50 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {acc}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="flex gap-1">
                                            {student.weeklyActivity.slice(-5).map((a,i) => (
                                                <div key={i} className={`w-1.5 h-6 rounded-full ${a > 50 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                            ))}
                                         </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {trend === 'up' && <span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> تحسن</span>}
                                        {trend === 'down' && <span className="text-rose-500 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> تراجع</span>}
                                        {trend === 'stable' && <span className="text-slate-400 font-bold flex items-center gap-1"> مستقر</span>}
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                         <button className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-indigo-500 hover:shadow-sm transition-all">
                                             <User className="w-4 h-4" />
                                         </button>
                                    </td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
            </div>
            {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                    لم يتم العثور على طلاب
                </div>
            )}
        </div>

    </div>
  );
};
