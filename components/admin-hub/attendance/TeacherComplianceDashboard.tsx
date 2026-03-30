import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, Award, ChevronDown, ChevronUp,
  AlertTriangle, Send, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
  EXTENDED_TEACHERS, TEACHER_ACTIVITIES, getTeacherActivityForDate, getTodayString, CAMPUSES,
} from '../../../data/mockAttendanceData';
import type { TeacherComplianceRecord } from '../../../types/admin';

interface TeacherComplianceDashboardProps {
  locale: 'ar' | 'en';
  campusId: string;
}

// Generate mock compliance records inline (will be replaced by mockAttendanceData export later)
function generateComplianceRecords(): TeacherComplianceRecord[] {
  const records: TeacherComplianceRecord[] = [];
  const today = new Date();
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    if (d.getDay() === 5 || d.getDay() === 6) continue;
    const dateStr = d.toISOString().split('T')[0];
    for (const teacher of EXTENDED_TEACHERS) {
      const sessionsPerDay = 4 + Math.floor(Math.random() * 3); // 4-6
      for (let p = 1; p <= sessionsPerDay; p++) {
        const isLowCompliance = ['tch-3', 'tch-8', 'tch-15', 'tch-22'].includes(teacher.id);
        const submitted = isLowCompliance ? Math.random() > 0.35 : Math.random() > 0.07;
        records.push({
          teacherId: teacher.id,
          date: dateStr,
          spaceId: teacher.spaces[p % teacher.spaces.length] || `space-${p}`,
          period: p,
          submitted,
          submittedAt: submitted ? `${dateStr}T${7 + p}:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}:00` : undefined,
        });
      }
    }
  }
  return records;
}

const COMPLIANCE_RECORDS = generateComplianceRecords();

export const TeacherComplianceDashboard: React.FC<TeacherComplianceDashboardProps> = ({ locale, campusId }) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const today = getTodayString();
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'compliance' | 'name' | 'attendance'>('compliance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showReminder, setShowReminder] = useState<string | null>(null);

  const teachers = useMemo(() => {
    let list = EXTENDED_TEACHERS;
    if (campusId !== 'all') list = list.filter(t => t.campusId === campusId);
    return list;
  }, [campusId]);

  const teacherStats = useMemo(() => {
    return teachers.map(teacher => {
      const allRecords = COMPLIANCE_RECORDS.filter(r => r.teacherId === teacher.id);
      const todayRecords = allRecords.filter(r => r.date === today);
      const totalSessions = allRecords.length;
      const submittedSessions = allRecords.filter(r => r.submitted).length;
      const complianceRate = totalSessions > 0 ? Math.round(submittedSessions / totalSessions * 1000) / 10 : 0;

      const todayTotal = todayRecords.length;
      const todaySubmitted = todayRecords.filter(r => r.submitted).length;
      const todayRate = todayTotal > 0 ? Math.round(todaySubmitted / todayTotal * 1000) / 10 : 0;

      const nonCompliantToday = todayRecords.filter(r => !r.submitted);

      // Trend: compare last 7 days vs previous 7 days
      const recent = allRecords.slice(-7 * 5);
      const older = allRecords.slice(-14 * 5, -7 * 5);
      const recentRate = recent.length > 0 ? recent.filter(r => r.submitted).length / recent.length : 0;
      const olderRate = older.length > 0 ? older.filter(r => r.submitted).length / older.length : 0;
      const trend: 'up' | 'down' | 'stable' = recentRate > olderRate + 0.03 ? 'up' : recentRate < olderRate - 0.03 ? 'down' : 'stable';

      // Last non-compliant
      const lastNonCompliant = allRecords.filter(r => !r.submitted).sort((a, b) => b.date.localeCompare(a.date))[0];

      // Activity data
      const activity = getTeacherActivityForDate(today, campusId !== 'all' ? campusId : undefined)
        .find(a => a.teacherId === teacher.id);

      return {
        teacher,
        complianceRate,
        todayRate,
        todayTotal,
        todaySubmitted,
        nonCompliantToday,
        totalSessions,
        submittedSessions,
        trend,
        lastNonCompliant,
        activity,
      };
    });
  }, [teachers, today, campusId]);

  const sortedStats = useMemo(() => {
    const sorted = [...teacherStats];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'compliance') cmp = a.complianceRate - b.complianceRate;
      else if (sortBy === 'name') cmp = a.teacher.name.localeCompare(b.teacher.name, 'ar');
      else if (sortBy === 'attendance') cmp = (a.activity?.totalMinutes || 0) - (b.activity?.totalMinutes || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [teacherStats, sortBy, sortDir]);

  // Summary stats
  const campusTodayRate = useMemo(() => {
    const todayRecords = COMPLIANCE_RECORDS.filter(r => r.date === today && (campusId === 'all' || teachers.some(t => t.id === r.teacherId)));
    return todayRecords.length > 0 ? Math.round(todayRecords.filter(r => r.submitted).length / todayRecords.length * 1000) / 10 : 0;
  }, [today, teachers, campusId]);

  const semesterRate = useMemo(() => {
    const allRecords = COMPLIANCE_RECORDS.filter(r => campusId === 'all' || teachers.some(t => t.id === r.teacherId));
    return allRecords.length > 0 ? Math.round(allRecords.filter(r => r.submitted).length / allRecords.length * 1000) / 10 : 0;
  }, [teachers, campusId]);

  const nonCompliantToday = teacherStats.reduce((sum, s) => sum + s.nonCompliantToday.length, 0);
  const perfectTeachers = teacherStats.filter(s => s.complianceRate >= 99.5).length;

  const handleSort = (col: 'compliance' | 'name' | 'attendance') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir(col === 'name' ? 'asc' : 'desc'); }
  };

  const complianceBadge = (rate: number) => {
    if (rate >= 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (rate >= 70) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('الالتزام اليوم', 'Today\'s Compliance'), value: `${campusTodayRate}%`, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
          { label: t('الالتزام الفصلي', 'Semester Compliance'), value: `${semesterRate}%`, icon: Award, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
          { label: t('حصص غير مسجلة اليوم', 'Non-Compliant Today'), value: nonCompliantToday, icon: XCircle, gradient: nonCompliantToday > 0 ? 'from-rose-500 to-red-600' : 'from-slate-400 to-slate-500', shadow: nonCompliantToday > 0 ? 'shadow-rose-500/20' : 'shadow-slate-500/20' },
          { label: t('معلمون بالتزام كامل', '100% Compliance'), value: perfectTeachers, icon: Award, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadow} mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">{t('التزام المعلمين', 'Teacher Compliance')}</h3>
          <span className="text-xs font-bold text-slate-400">{teachers.length} {t('معلم', 'teachers')}</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-100">
          <button onClick={() => handleSort('name')} className="col-span-3 text-right flex items-center gap-1 hover:text-slate-700">
            {t('المعلم', 'Teacher')} {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </button>
          <div className="col-span-2">{t('المادة', 'Subject')}</div>
          <button onClick={() => handleSort('compliance')} className="col-span-2 flex items-center gap-1 hover:text-slate-700">
            {t('الالتزام', 'Compliance')} {sortBy === 'compliance' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </button>
          <div className="col-span-2">{t('اليوم', 'Today')}</div>
          <div className="col-span-1">{t('الاتجاه', 'Trend')}</div>
          <button onClick={() => handleSort('attendance')} className="col-span-2 flex items-center gap-1 hover:text-slate-700">
            {t('النشاط', 'Activity')} {sortBy === 'attendance' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {sortedStats.map((stat, i) => {
            const badge = complianceBadge(stat.complianceRate);
            const isExpanded = expandedTeacher === stat.teacher.id;

            return (
              <div key={stat.teacher.id}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setExpandedTeacher(isExpanded ? null : stat.teacher.id)}
                  className={`grid grid-cols-12 gap-2 px-6 py-4 cursor-pointer transition-colors ${isExpanded ? 'bg-sky-50/50' : 'hover:bg-slate-50/50'}`}
                >
                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {stat.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 truncate">{stat.teacher.name}</div>
                      <div className="text-[10px] text-slate-400">{stat.teacher.spaces.length} {t('مساحة', 'spaces')}</div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="col-span-2 flex items-center text-sm text-slate-600 font-medium">
                    {locale === 'ar' ? stat.teacher.subject : stat.teacher.subjectEn}
                  </div>

                  {/* Compliance */}
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {stat.complianceRate}%
                    </span>
                  </div>

                  {/* Today */}
                  <div className="col-span-2 flex items-center text-sm">
                    <span className="font-bold text-slate-700">{stat.todaySubmitted}/{stat.todayTotal}</span>
                    {stat.nonCompliantToday.length > 0 && (
                      <span className="mr-2 text-rose-500"><AlertTriangle className="w-3.5 h-3.5" /></span>
                    )}
                  </div>

                  {/* Trend */}
                  <div className="col-span-1 flex items-center">
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                    {stat.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                    {stat.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                  </div>

                  {/* Activity */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(stat.activity?.totalMinutes || 0) > 120 ? 'bg-emerald-500' : (stat.activity?.totalMinutes || 0) > 30 ? 'bg-amber-500' : 'bg-rose-400'}`}
                        style={{ width: `${Math.min(100, ((stat.activity?.totalMinutes || 0) / 300) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                      {Math.round((stat.activity?.totalMinutes || 0) / 60 * 10) / 10}h
                    </span>
                  </div>
                </motion.div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-5 bg-sky-50/30 border-t border-sky-100/50 space-y-4">
                        {/* Compliance Grid (last 5 days × periods) */}
                        <div>
                          <h4 className="text-xs font-black text-slate-600 mb-2">{t('سجل الالتزام (آخر 5 أيام)', 'Compliance Record (Last 5 Days)')}</h4>
                          <div className="flex gap-1">
                            {(() => {
                              const teacherRecords = COMPLIANCE_RECORDS.filter(r => r.teacherId === stat.teacher.id);
                              const dates = [...new Set(teacherRecords.map(r => r.date))].sort().slice(-5);
                              return dates.map(date => (
                                <div key={date} className="flex-1">
                                  <div className="text-[9px] font-bold text-slate-400 text-center mb-1">
                                    {new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    {teacherRecords.filter(r => r.date === date).map((r, ri) => (
                                      <div key={ri} className={`h-3 rounded-sm ${r.submitted ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                        title={`${t('الحصة', 'Period')} ${r.period} — ${r.submitted ? t('مسجل', 'Submitted') : t('غير مسجل', 'Missing')}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Non-compliant today */}
                        {stat.nonCompliantToday.length > 0 && (
                          <div>
                            <h4 className="text-xs font-black text-slate-600 mb-2">{t('حصص غير مسجلة اليوم', 'Missing Sessions Today')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {stat.nonCompliantToday.map((r, ri) => (
                                <div key={ri} className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 text-xs">
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span className="font-bold text-rose-700">{t('الحصة', 'Period')} {r.period}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowReminder(stat.teacher.id); setTimeout(() => setShowReminder(null), 2000); }}
                                    className="text-rose-500 hover:text-rose-700"
                                  >
                                    <Send className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Activity */}
                        {stat.activity && stat.activity.actions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-black text-slate-600 mb-2">{t('آخر الأنشطة اليوم', 'Today\'s Activity')}</h4>
                            <div className="space-y-1">
                              {stat.activity.actions.slice(0, 5).map((action, ai) => (
                                <div key={ai} className="flex items-center gap-2 text-xs text-slate-600">
                                  <span className="text-[10px] font-mono text-slate-400">{action.timestamp.split('T')[1]?.slice(0, 5)}</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                  <span className="font-medium">{action.details || action.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder Toast */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-sky-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {t('تم إرسال التذكير', 'Reminder sent')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
