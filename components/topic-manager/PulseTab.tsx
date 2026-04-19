import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Search, ChevronDown, ChevronUp, X, Building2,
  BookOpen, GraduationCap, Calendar,
} from 'lucide-react';
import { CAMPUSES, SUBJECT_META } from './TopicManagerLayout';
import {
  generateTeachers, type EnhancedTeacher, FilterPill,
} from './PrincipalTab';
import {
  ACTIVITIES, buildPulseData, ActivitySummaryCell, TeacherPulseRow, TeacherSidePanel,
  type ActivityKey, type PopupTeacher, type TeacherPulse,
} from './principal-popups';

interface PulseTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

/* ── Date helpers ── */
const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(dateStr: string, locale: 'ar' | 'en'): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = locale === 'ar' ? ARABIC_MONTHS : EN_MONTHS;
  return `${d} ${months[m - 1]} ${y}`;
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

const PulseTab: React.FC<PulseTabProps> = ({ subject, locale }) => {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => (ar ? a : e);
  const dir = ar ? 'rtl' : 'ltr';

  /* ── Filters (mirroring PrincipalTab) ── */
  const today = useMemo(() => ymd(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(subject);
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');

  /* ── Teachers + pulse data ── */
  const teachers = useMemo(() => generateTeachers(selectedSubject), [selectedSubject]);
  const campusScoped = useMemo(
    () => selectedCampus === 'all' ? teachers : teachers.filter(tc => tc.campusId === selectedCampus),
    [teachers, selectedCampus]
  );
  const gradeScoped = useMemo(
    () => gradeFilter === 'all'
      ? campusScoped
      : campusScoped.filter(tc => tc.classes.some(c => c.grade === gradeFilter)),
    [campusScoped, gradeFilter]
  );

  const popupTeachers = gradeScoped as unknown as PopupTeacher[];
  const pulses = useMemo<TeacherPulse[]>(
    () => buildPulseData(popupTeachers, selectedDate),
    [popupTeachers, selectedDate]
  );

  /* ── Aggregated school totals ── */
  const schoolTotals = useMemo(() => {
    const totals = {} as Record<ActivityKey, { done: number; total: number }>;
    ACTIVITIES.forEach(a => { totals[a.key] = { done: 0, total: 0 }; });
    pulses.forEach(p => {
      ACTIVITIES.forEach(a => {
        totals[a.key].done += p.perActivity[a.key].done;
        totals[a.key].total += p.perActivity[a.key].total;
      });
    });
    return totals;
  }, [pulses]);

  /* ── Table filters ── */
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'behind' | 'critical'>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityKey | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'score' | 'name'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo<TeacherPulse[]>(() => {
    let list = [...pulses];
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (activityFilter) {
      const af: ActivityKey = activityFilter;
      list = list.filter(p => p.perActivity[af].done < p.perActivity[af].total);
    }
    const term = search.trim();
    if (term) list = list.filter(p => p.teacher.name.includes(term));
    list.sort((a, b) => {
      const cmp = sortKey === 'score'
        ? a.score - b.score
        : a.teacher.name.localeCompare(b.teacher.name, 'ar');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [pulses, statusFilter, activityFilter, search, sortKey, sortDir]);

  const selected = useMemo(
    () => pulses.find(p => p.teacher.id === selectedId) ?? null,
    [pulses, selectedId]
  );
  useEffect(() => {
    if (selectedId && !filtered.some(p => p.teacher.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  const statusChips: { v: typeof statusFilter; ar: string; en: string }[] = [
    { v: 'all',      ar: 'الكل',     en: 'All' },
    { v: 'complete', ar: 'مكتمل',    en: 'Complete' },
    { v: 'behind',   ar: 'متأخر',    en: 'Behind' },
    { v: 'critical', ar: 'حرج',      en: 'Critical' },
  ];

  /* ── Date strip: last 14 days ── */
  const dateStrip = useMemo(() => {
    const arr: { dateStr: string; day: number; weekday: string }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push({
        dateStr: ymd(d),
        day: d.getDate(),
        weekday: ar ? ARABIC_DAYS[d.getDay()] : EN_DAYS[d.getDay()],
      });
    }
    return arr; // newest first
  }, [ar]);

  const anyActive =
    selectedCampus !== 'all' || selectedSubject !== 'all' || gradeFilter !== 'all' || selectedDate !== today;
  const allGrades: (number | 'all')[] = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="p-4 lg:p-8 space-y-5 pb-24" dir={dir}>
      {/* Header bar — title + filter pills (matches PrincipalTab pattern) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 flex-wrap p-2.5 rounded-2xl bg-gradient-to-r from-white via-violet-50/40 to-white border border-slate-200/80 shadow-sm backdrop-blur"
      >
        <div className="flex items-center gap-2 ps-1 pe-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-['Cairo'] font-black text-slate-800 text-sm sm:text-base truncate">
              {t('نبض اليوم', "Today's Pulse")}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold truncate">
              {t('روتين كل معلم — عبر كل الفصول، مع سجل تاريخي', "Each teacher's routine — across all classes, with history")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <FilterPill
            icon={<Building2 className="w-3.5 h-3.5" />}
            label={t('المبنى', 'Campus')}
            value={selectedCampus} defaultValue="all"
            onChange={setSelectedCampus} locale={locale}
            options={[
              { value: 'all', label: t('كل المباني', 'All') },
              ...CAMPUSES.map(c => ({ value: c.id, label: locale === 'ar' ? c.name : c.nameEn })),
            ]}
          />
          <FilterPill
            icon={<BookOpen className="w-3.5 h-3.5" />}
            label={t('المادة', 'Subject')}
            value={selectedSubject} defaultValue="all"
            onChange={setSelectedSubject} locale={locale}
            options={[
              { value: 'all', label: t('كل المواد', 'All') },
              ...Object.entries(SUBJECT_META).map(([key, val]) => ({
                value: key, label: locale === 'ar' ? val.ar : val.en, emoji: val.emoji,
              })),
            ]}
          />
          <FilterPill<number | 'all'>
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            label={t('الصف', 'Grade')}
            value={gradeFilter} defaultValue="all"
            onChange={setGradeFilter} locale={locale}
            options={allGrades.map(g => ({
              value: g,
              label: g === 'all' ? t('كل الصفوف', 'All') : `${t('الصف', 'Grade')} ${g}`,
            }))}
          />
          {anyActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setSelectedCampus('all');
                setSelectedSubject('all');
                setGradeFilter('all');
                setSelectedDate(today);
              }}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 text-xs font-black font-['Cairo'] shadow-sm transition-all"
            >
              <X className="w-3 h-3" />
              {t('مسح', 'Clear')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Date history strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 font-['Cairo']">
            <Calendar className="w-3.5 h-3.5 text-violet-500" />
            {t('عرض البيانات في تاريخ', 'View data for')}
            <span className="text-violet-700">{formatDateLabel(selectedDate, locale)}</span>
            {selectedDate === today && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                {t('اليوم', 'Today')}
              </span>
            )}
          </div>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300 font-['Cairo']"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" dir="ltr">
          {dateStrip.slice().reverse().map(d => {
            const isSelected = isSameDay(d.dateStr, selectedDate);
            const isToday = isSameDay(d.dateStr, today);
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all font-['Cairo'] ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-500 text-white shadow-md scale-105'
                    : isToday
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50/40'
                }`}
                title={formatDateLabel(d.dateStr, locale)}
              >
                <span className="text-[9px] font-bold opacity-80 leading-none">{d.weekday}</span>
                <span className="text-base font-black leading-none mt-1 tabular-nums">{d.day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky activity summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {ACTIVITIES.map(a => (
          <ActivitySummaryCell
            key={a.key}
            meta={a}
            done={schoolTotals[a.key].done}
            total={schoolTotals[a.key].total}
            active={activityFilter === a.key}
            locale={locale}
            onClick={() => setActivityFilter(f => (f === a.key ? null : a.key))}
          />
        ))}
      </div>

      {/* Filter chips + search */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusChips.map(c => (
          <button
            key={c.v}
            onClick={() => setStatusFilter(c.v)}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border transition ${
              statusFilter === c.v
                ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
            }`}
          >
            {ar ? c.ar : c.en}
          </button>
        ))}
        {activityFilter && (
          <button
            onClick={() => setActivityFilter(null)}
            className="text-xs font-black px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-500 hover:text-white transition inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {t('إلغاء فلتر النشاط', 'Clear activity filter')}
          </button>
        )}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('ابحث بالاسم...', 'Search by name...')}
            className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 transition font-['Cairo']"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold ms-auto">
          {filtered.length} {t('معلم', 'teachers')}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th
                  className="px-3 py-2.5 text-start text-[11px] font-black text-slate-500 min-w-[180px] cursor-pointer select-none"
                  onClick={() => {
                    if (sortKey === 'name') setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setSortKey('name'); setSortDir('asc'); }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {t('المعلم', 'Teacher')}
                    {sortKey === 'name' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </span>
                </th>
                <th
                  className="px-3 py-2.5 text-center text-[11px] font-black text-slate-500 cursor-pointer select-none"
                  onClick={() => {
                    if (sortKey === 'score') setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setSortKey('score'); setSortDir('desc'); }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {t('النتيجة', 'Score')}
                    {sortKey === 'score' && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                  </span>
                </th>
                {ACTIVITIES.map(a => {
                  const Icon = a.icon;
                  return (
                    <th key={a.key} className="px-2 py-2.5 text-center text-[10px] font-black text-slate-500">
                      <div className="inline-flex flex-col items-center gap-1">
                        <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                        <span className="leading-tight">{ar ? a.ar : a.en}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <TeacherPulseRow
                  key={p.teacher.id}
                  pulse={p} locale={locale}
                  onOpen={() => setSelectedId(p.teacher.id)}
                  isOpen={selectedId === p.teacher.id}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            {t('لا يوجد معلمون مطابقون', 'No matching teachers')}
          </div>
        )}
      </div>

      {/* Side panel — fixed, full-viewport overlay */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ x: ar ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: ar ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 end-0 z-[110] w-full sm:w-[460px] bg-white border-s border-slate-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <TeacherSidePanel pulse={selected} locale={locale} onClose={() => setSelectedId(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PulseTab;
