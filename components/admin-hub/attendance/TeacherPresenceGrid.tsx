import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, Zap } from 'lucide-react';
import {
  EXTENDED_TEACHERS, TEACHER_ACTIVITIES, getTodayString,
} from '../../../data/mockAttendanceData';

interface TeacherPresenceGridProps {
  locale: 'ar' | 'en';
  campusId: string;
}

export const TeacherPresenceGrid: React.FC<TeacherPresenceGridProps> = ({ locale, campusId }) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const today = getTodayString();
  const [hoveredCell, setHoveredCell] = useState<{ teacherId: string; date: string } | null>(null);

  const teachers = useMemo(() => {
    let list = EXTENDED_TEACHERS;
    if (campusId !== 'all') list = list.filter(t => t.campusId === campusId);
    return list;
  }, [campusId]);

  // Get last 14 school days
  const dates = useMemo(() => {
    const days: string[] = [];
    const d = new Date();
    while (days.length < 14) {
      if (d.getDay() !== 5 && d.getDay() !== 6) {
        days.unshift(d.toISOString().split('T')[0]);
      }
      d.setDate(d.getDate() - 1);
    }
    return days;
  }, []);

  // Build activity lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, { totalMinutes: number; firstLogin?: string; actionsCount: number }>();
    for (const activity of TEACHER_ACTIVITIES) {
      if (campusId !== 'all' && !teachers.some(t => t.id === activity.teacherId)) continue;
      const key = `${activity.teacherId}-${activity.date}`;
      map.set(key, {
        totalMinutes: activity.totalMinutes,
        firstLogin: activity.firstLogin,
        actionsCount: activity.actions.length,
      });
    }
    return map;
  }, [teachers, campusId]);

  const getCellData = (teacherId: string, date: string) => {
    return activityMap.get(`${teacherId}-${date}`) || null;
  };

  const getCellColor = (data: ReturnType<typeof getCellData>) => {
    if (!data || data.totalMinutes === 0) return 'bg-slate-200';
    if (data.totalMinutes >= 120) return 'bg-emerald-400';
    if (data.totalMinutes >= 30) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  const formatDay = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-slate-500">{t('دليل الألوان:', 'Legend:')}</span>
        {[
          { color: 'bg-emerald-400', label: t('نشط (2+ ساعة)', 'Active (2+ hr)') },
          { color: 'bg-amber-400', label: t('نشط جزئياً (30د-2س)', 'Partial (30m-2hr)') },
          { color: 'bg-rose-400', label: t('نشاط قليل (<30د)', 'Low (<30m)') },
          { color: 'bg-slate-200', label: t('غير نشط', 'Inactive') },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="sticky right-0 bg-white z-10 px-4 py-3 text-right text-xs font-black text-slate-600 w-48 min-w-[12rem]">
                  {t('المعلم', 'Teacher')}
                </th>
                {dates.map(date => (
                  <th key={date} className={`px-1 py-2 text-center min-w-[2.5rem] ${date === today ? 'bg-sky-50' : ''}`}>
                    <div className="text-[9px] font-bold text-slate-400">{formatDay(date)}</div>
                    <div className="text-[10px] font-bold text-slate-500">{formatDate(date)}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-black text-slate-600 min-w-[5rem]">
                  {t('المعدل', 'Avg')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.map((teacher, ti) => {
                const totalActive = dates.reduce((sum, date) => {
                  const data = getCellData(teacher.id, date);
                  return sum + (data && data.totalMinutes > 0 ? 1 : 0);
                }, 0);
                const avgRate = Math.round(totalActive / dates.length * 100);

                return (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ti * 0.02 }}
                    className="hover:bg-slate-50/50"
                  >
                    {/* Teacher name */}
                    <td className="sticky right-0 bg-white z-10 px-4 py-3 border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 truncate max-w-[8rem]">{teacher.name}</div>
                          <div className="text-[9px] text-slate-400">{locale === 'ar' ? teacher.subject : teacher.subjectEn}</div>
                        </div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {dates.map(date => {
                      const data = getCellData(teacher.id, date);
                      const isHovered = hoveredCell?.teacherId === teacher.id && hoveredCell?.date === date;
                      const isToday = date === today;

                      return (
                        <td
                          key={date}
                          className={`px-1 py-3 text-center relative ${isToday ? 'bg-sky-50/50' : ''}`}
                          onMouseEnter={() => setHoveredCell({ teacherId: teacher.id, date })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div className={`w-6 h-6 mx-auto rounded-md ${getCellColor(data)} transition-transform ${isHovered ? 'scale-125 ring-2 ring-sky-400 ring-offset-1' : ''}`} />

                          {/* Tooltip */}
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 bg-slate-900 text-white rounded-lg px-3 py-2 text-[10px] font-bold whitespace-nowrap shadow-xl">
                              <div>{new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}</div>
                              {data ? (
                                <>
                                  <div className="flex items-center gap-1 mt-1"><Clock className="w-2.5 h-2.5" /> {data.firstLogin || '—'}</div>
                                  <div className="flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> {Math.round(data.totalMinutes / 60 * 10) / 10} {t('ساعة', 'hr')}</div>
                                  <div className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> {data.actionsCount} {t('إجراء', 'actions')}</div>
                                </>
                              ) : (
                                <div className="text-slate-400 mt-1">{t('غير نشط', 'Inactive')}</div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Average */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-black ${avgRate >= 80 ? 'text-emerald-600' : avgRate >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {avgRate}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
