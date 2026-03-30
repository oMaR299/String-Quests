import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, TrendingDown, UserX, CheckCheck, ChevronLeft } from 'lucide-react';
import {
  EXTENDED_STUDENTS,
  EXTENDED_TEACHERS,
  CAMPUSES,
  getTodayString,
  getTeacherComplianceForDate,
  getDailySummary,
  getClassAttendance,
  getStudentAttendance,
} from '../../../data/mockAttendanceData';

type AlertType = 'teacher-compliance' | 'chronic-absence' | 'spike' | 'trend-drop';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
  messageEn: string;
  timestamp: string;
  severity: 'red' | 'amber' | 'blue';
}

interface AlertsFeedProps {
  locale: 'ar' | 'en';
  campusId: string;
}

const teacherMap = new Map(EXTENDED_TEACHERS.map(t => [t.id, t]));
const studentMap = new Map(EXTENDED_STUDENTS.map(s => [s.id, s]));

function getSchoolDaysRecent(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  while (d.getDay() === 5 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  while (days.length < count) {
    if (d.getDay() !== 5 && d.getDay() !== 6) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.unshift(`${y}-${m}-${day}`);
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
}

export function AlertsFeed({ locale, campusId }: AlertsFeedProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const today = getTodayString();
    const recentDays = getSchoolDaysRecent(5);
    const yesterday = recentDays.length >= 2 ? recentDays[recentDays.length - 2] : today;
    let alertId = 0;

    // 1. Teacher compliance — teachers with 2+ non-submitted periods today
    const compliance = getTeacherComplianceForDate(today, campusId === 'all' ? undefined : campusId);
    const nonSubmittedByTeacher = new Map<string, number>();
    for (const rec of compliance) {
      if (!rec.submitted) {
        nonSubmittedByTeacher.set(rec.teacherId, (nonSubmittedByTeacher.get(rec.teacherId) || 0) + 1);
      }
    }
    for (const [teacherId, count] of nonSubmittedByTeacher) {
      if (count >= 2) {
        const teacher = teacherMap.get(teacherId);
        if (!teacher) continue;
        result.push({
          id: `alert-${++alertId}`,
          type: 'teacher-compliance',
          message: `${teacher.name} لم يسجل الحضور في ${count} حصص اليوم`,
          messageEn: `${teacher.nameEn} hasn't submitted attendance for ${count} periods today`,
          timestamp: `${today}T08:30:00`,
          severity: 'red',
        });
      }
    }

    // 2. Chronic absence — students with 3+ consecutive absent days in last 5 days
    const campusStudents = campusId === 'all'
      ? EXTENDED_STUDENTS
      : EXTENDED_STUDENTS.filter(s => s.campusId === campusId);
    // Sample a subset for performance
    const sampleStudents = campusStudents.filter((_, i) => i % 20 === 0);
    for (const student of sampleStudents) {
      const records = getStudentAttendance(student.id);
      const last5 = recentDays.map(d => records.find(r => r.date === d));
      let consecutive = 0;
      for (let i = last5.length - 1; i >= 0; i--) {
        if (last5[i]?.status === 'absent') consecutive++;
        else break;
      }
      if (consecutive >= 3) {
        result.push({
          id: `alert-${++alertId}`,
          type: 'chronic-absence',
          message: `${student.name} غائب ${consecutive} أيام متتالية`,
          messageEn: `${student.nameEn} has been absent ${consecutive} consecutive days`,
          timestamp: `${today}T09:00:00`,
          severity: 'red',
        });
      }
    }

    // 3. Spike — classes with rate < 85% today
    const campus = campusId === 'all' ? CAMPUSES[0] : CAMPUSES.find(c => c.id === campusId) || CAMPUSES[0];
    const grades = campus.type === 'international' ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6];
    const sections = campus.type === 'international' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const g of grades) {
      for (const sec of sections) {
        const ca = getClassAttendance(today, g, sec, campusId === 'all' ? undefined : campusId);
        if (ca.totalStudents > 0 && ca.rate < 85) {
          result.push({
            id: `alert-${++alertId}`,
            type: 'spike',
            message: `الصف ${g}-${sec} نسبة حضور منخفضة اليوم (${ca.rate}%)`,
            messageEn: `Grade ${g}-${sec} has unusual low attendance today (${ca.rate}%)`,
            timestamp: `${today}T09:15:00`,
            severity: 'amber',
          });
        }
      }
    }

    // 4. Trend drop — compare today vs yesterday
    const todaySummary = getDailySummary(today, campusId === 'all' ? undefined : campusId);
    const yesterdaySummary = getDailySummary(yesterday, campusId === 'all' ? undefined : campusId);
    const drop = yesterdaySummary.rate - todaySummary.rate;
    if (drop > 2) {
      result.push({
        id: `alert-${++alertId}`,
        type: 'trend-drop',
        message: `انخفض الحضور ${drop.toFixed(1)}% مقارنة بأمس`,
        messageEn: `Attendance dropped ${drop.toFixed(1)}% compared to yesterday`,
        timestamp: `${today}T10:00:00`,
        severity: 'blue',
      });
    }

    // Sort newest first (by id descending for deterministic order)
    return result.reverse();
  }, [campusId]);

  const unreadCount = alerts.length - readIds.size;

  const markAllRead = () => setReadIds(new Set(alerts.map(a => a.id)));

  const iconForType = (type: AlertType, severity: string) => {
    const size = 'w-5 h-5';
    const colorClass = severity === 'red' ? 'text-red-500' : severity === 'amber' ? 'text-amber-500' : 'text-blue-500';
    switch (type) {
      case 'teacher-compliance': return <Clock className={`${size} ${colorClass}`} />;
      case 'chronic-absence': return <UserX className={`${size} ${colorClass}`} />;
      case 'spike': return <AlertTriangle className={`${size} ${colorClass}`} />;
      case 'trend-drop': return <TrendingDown className={`${size} ${colorClass}`} />;
    }
  };

  const bgForSeverity = (severity: string, read: boolean) => {
    if (read) return 'bg-white';
    if (severity === 'red') return 'bg-red-50/60';
    if (severity === 'amber') return 'bg-amber-50/60';
    return 'bg-blue-50/60';
  };

  return (
    <div className="w-full font-[Cairo]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-800">
            {t('التنبيهات', 'Alerts')}
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('تعيين الكل كمقروء', 'Mark all as read')}
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            {t('لا توجد تنبيهات حالياً', 'No alerts at this time')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            <AnimatePresence initial>
              {alerts.map((alert, i) => {
                const isRead = readIds.has(alert.id);
                return (
                  <motion.li
                    key={alert.id}
                    initial={{ opacity: 0, x: locale === 'ar' ? 16 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${bgForSeverity(alert.severity, isRead)}`}
                  >
                    <span className="shrink-0 mt-0.5">{iconForType(alert.type, alert.severity)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${isRead ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                        {locale === 'ar' ? alert.message : alert.messageEn}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {alert.timestamp.split('T')[1]?.slice(0, 5) || ''}
                      </span>
                    </div>
                    <button
                      onClick={() => setReadIds(prev => new Set([...prev, alert.id]))}
                      className="shrink-0 mt-1 text-slate-300 hover:text-purple-500 transition-colors"
                      title={t('عرض', 'View')}
                    >
                      <ChevronLeft className={`w-4 h-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
