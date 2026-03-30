import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Shield, CalendarCheck, BarChart3, Activity, Megaphone, TrendingUp, TrendingDown } from 'lucide-react';
import { CAMPUSES, EXTENDED_STUDENTS, EXTENDED_TEACHERS, getDailySummary, getTodayString, getTeacherActivityForDate } from '../../data/mockAttendanceData';

interface OverviewDashboardProps {
  locale: 'ar' | 'en';
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ locale }) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const today = getTodayString();

  const todaySummary = useMemo(() => getDailySummary(today), [today]);
  const teacherActivity = useMemo(() => getTeacherActivityForDate(today), [today]);
  const activeTeachers = teacherActivity.filter(a => a.totalMinutes > 0).length;

  const stats = [
    {
      title: t('الطلاب', 'Students'),
      value: EXTENDED_STUDENTS.length,
      subtitle: t(`${todaySummary.present + todaySummary.late} حاضرون اليوم`, `${todaySummary.present + todaySummary.late} present today`),
      icon: GraduationCap,
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      title: t('المعلمون', 'Teachers'),
      value: EXTENDED_TEACHERS.length,
      subtitle: t(`${activeTeachers} نشطون اليوم`, `${activeTeachers} active today`),
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      title: t('الإداريون', 'Admins'),
      value: 3,
      subtitle: t('جميعهم متصلون', 'All online'),
      icon: Shield,
      gradient: 'from-purple-500 to-violet-600',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      title: t('الحضور اليوم', 'Attendance Today'),
      value: `${todaySummary.rate}%`,
      subtitle: t(`${todaySummary.absent} غائبون · ${todaySummary.late} متأخرون`, `${todaySummary.absent} absent · ${todaySummary.late} late`),
      icon: CalendarCheck,
      gradient: todaySummary.rate >= 90 ? 'from-emerald-500 to-green-600' : 'from-amber-500 to-orange-600',
      shadowColor: todaySummary.rate >= 90 ? 'shadow-emerald-500/20' : 'shadow-amber-500/20',
      trend: todaySummary.rate >= 90 ? { up: true, text: t('+1.2% عن الأمس', '+1.2% vs yesterday') } : { up: false, text: t('-2.1% عن الأمس', '-2.1% vs yesterday') },
    },
  ];

  const campusCards = CAMPUSES.map(campus => {
    const campusSummary = getDailySummary(today, campus.id);
    const campusStudents = EXTENDED_STUDENTS.filter(s => s.campusId === campus.id).length;
    const campusTeachers = EXTENDED_TEACHERS.filter(t => t.campusId === campus.id).length;
    return { ...campus, summary: campusSummary, studentCount: campusStudents, teacherCount: campusTeachers };
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{t('نظرة عامة', 'Overview')}</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">{t('ملخص شامل لجميع المباني والأقسام', 'Comprehensive summary across all campuses')}</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {stat.trend.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{stat.trend.text}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 mt-0.5">{stat.title}</div>
            <div className="text-[11px] font-medium text-slate-400 mt-1">{stat.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Campus Cards */}
      <div>
        <h2 className="text-lg font-black text-slate-900 mb-4">{t('المباني', 'Campuses')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campusCards.map((campus, i) => (
            <motion.div key={campus.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{locale === 'ar' ? campus.name : campus.nameEn}</h3>
                  <p className="text-[11px] font-medium text-slate-400">{campus.principalName}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${campus.summary.rate >= 90 ? 'bg-emerald-400' : campus.summary.rate >= 80 ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-black text-slate-900">{campus.studentCount}</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('طالب', 'Students')}</div>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">{campus.teacherCount}</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('معلم', 'Teachers')}</div>
                </div>
                <div>
                  <div className={`text-lg font-black ${campus.summary.rate >= 90 ? 'text-emerald-600' : campus.summary.rate >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{campus.summary.rate}%</div>
                  <div className="text-[10px] font-bold text-slate-400">{t('الحضور', 'Attendance')}</div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${campus.summary.rate}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className={`h-full rounded-full ${campus.summary.rate >= 90 ? 'bg-emerald-500' : campus.summary.rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-black text-slate-900 mb-4">{t('إجراءات سريعة', 'Quick Actions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CalendarCheck, label: t('حضور اليوم', 'Today\'s Attendance'), gradient: 'from-emerald-500 to-teal-600' },
            { icon: BarChart3, label: t('التحصيل الأكاديمي', 'Academic Progress'), gradient: 'from-blue-500 to-indigo-600' },
            { icon: Megaphone, label: t('إشعار جديد', 'New Notification'), gradient: 'from-sky-500 to-blue-600' },
            { icon: Activity, label: t('نشاط المنصة', 'Platform Activity'), gradient: 'from-purple-500 to-violet-600' },
          ].map((action, i) => (
            <motion.button key={action.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md hover:border-sky-200 transition-all text-right">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-700">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
