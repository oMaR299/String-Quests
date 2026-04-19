import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Lock, FileText, BarChart3, Search, ChevronDown, ChevronUp,
  BookOpen, ClipboardList, PenTool, TrendingUp, ArrowUp, ArrowDown,
  LogIn, UserCheck, Monitor, Users, Activity, CheckCircle2, XCircle,
  AlertTriangle, ExternalLink,
} from 'lucide-react';
import { InfoTip } from './PrincipalTab';

/* ═══════════════════════════════════════════════════════════════
   Shared types & helpers
   ═══════════════════════════════════════════════════════════════ */

export interface PopupTeacher {
  id: string;
  name: string;
  campusId: string;
  grade: number;
  section: string;
  studentCount: number;
  avgAccuracy: number;
  engagementHours: number;
  lessons: number;
  assignments: number;
  exams: number;
  studentEngagementScore: number;
  studentWeeklyLoginRate: number;
  classes?: { grade: number; section: string; campusId: string; studentCount: number }[];
}

function seededRandom(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

function teacherSeed(t: PopupTeacher): number {
  return t.name.charCodeAt(0) + t.grade * 7 + t.section.charCodeAt(0) * 3;
}

function TeacherAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 65%, 45%))`,
      }}
    >
      {initials}
    </div>
  );
}

/* ── Generic modal shell ── */
function ModalShell({
  icon, title, subtitle, color, locale, onClose, children,
}: {
  icon: React.ReactNode; title: string; subtitle: string;
  color: string; locale: 'ar' | 'en';
  onClose: () => void; children: React.ReactNode;
}) {
  const ar = locale === 'ar';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
      dir={ar ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl border border-white flex flex-col font-['Cairo']"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 bg-slate-50/30">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. LoginPresenceModal — Login & attendance tracking
   ═══════════════════════════════════════════════════════════════ */

interface PresenceRow {
  id: string;
  name: string;
  campusId: string;
  daysSinceLogin: number;
  status: 'active' | 'partial' | 'inactive';
  weeklyHours: number;
  avgWeeklyHours: number;
  trendDir: 'up' | 'down' | 'flat';
  streak: number;
}

function buildPresenceData(teachers: PopupTeacher[]): PresenceRow[] {
  return teachers.map(t => {
    const seed = teacherSeed(t);
    const daysSinceLogin = Math.floor(seededRandom(seed + 100) * 6);
    const status: 'active' | 'partial' | 'inactive' =
      daysSinceLogin === 0 ? 'active' : daysSinceLogin <= 2 ? 'partial' : 'inactive';
    const weeklyHours = Math.round(t.engagementHours * 10) / 10;
    const avgWeeklyHours = Math.round((weeklyHours * (0.85 + seededRandom(seed + 200) * 0.3)) * 10) / 10;
    const trendDir: 'up' | 'down' | 'flat' =
      weeklyHours > avgWeeklyHours + 0.3 ? 'up' : weeklyHours < avgWeeklyHours - 0.3 ? 'down' : 'flat';
    const streak = Math.floor(seededRandom(seed + 300) * 12);
    return { id: t.id, name: t.name, campusId: t.campusId, daysSinceLogin, status, weeklyHours, avgWeeklyHours, trendDir, streak };
  });
}

export function LoginPresenceModal({
  teachers, locale, onClose,
}: { teachers: PopupTeacher[]; locale: 'ar' | 'en'; onClose: () => void }) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => ar ? a : e;
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'partial' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'daysSinceLogin' | 'weeklyHours' | 'streak'>('weeklyHours');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const allRows = useMemo(() => buildPresenceData(teachers), [teachers]);
  const maxWeeklyHours = useMemo(() => Math.max(...allRows.map(r => r.weeklyHours), 1), [allRows]);

  const filtered = useMemo(() => {
    let list = [...allRows];
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'ar');
      else if (sortKey === 'daysSinceLogin') cmp = a.daysSinceLogin - b.daysSinceLogin;
      else if (sortKey === 'weeklyHours') cmp = a.weeklyHours - b.weeklyHours;
      else if (sortKey === 'streak') cmp = a.streak - b.streak;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [allRows, statusFilter, sortKey, sortDir]);

  const handleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  return (
    <ModalShell
      icon={<Lock className="w-5 h-5" />}
      title={t('🔐 متابعة الحضور والدخول', '🔐 Login & Presence')}
      subtitle={t('متابعة تسجيل الدخول والحضور', 'Track teacher login & presence')}
      color="#0ea5e9" locale={locale} onClose={onClose}
    >
      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { v: 'all',      lAr: 'الكل', lEn: 'All' },
          { v: 'active',   lAr: '🟢 نشط', lEn: '🟢 Active' },
          { v: 'partial',  lAr: '🟡 جزئي', lEn: '🟡 Partial' },
          { v: 'inactive', lAr: '🔴 غير نشط', lEn: '🔴 Inactive' },
        ] as const).map(c => (
          <button
            key={c.v}
            onClick={() => setStatusFilter(c.v)}
            className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
              statusFilter === c.v
                ? 'bg-sky-500 text-white border-sky-500 shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
            }`}
          >
            {ar ? c.lAr : c.lEn}
          </button>
        ))}
        <span className="text-xs text-slate-400 ms-auto self-center">
          {filtered.length} {t('معلم', 'teachers')}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-3 py-3 text-start text-xs font-semibold text-slate-500 w-10">#</th>
                {([
                  { k: 'name' as const,            l: t('المعلم', 'Teacher'),       w: 'min-w-[180px]' },
                  { k: 'daysSinceLogin' as const,  l: t('آخر دخول', 'Last Login'),  w: 'min-w-[120px]' },
                  { k: 'daysSinceLogin' as const,  l: t('الحالة', 'Status'),       w: 'min-w-[70px]' },
                  { k: 'weeklyHours' as const,     l: t('هذا الأسبوع', 'This Week'),w: 'min-w-[140px]' },
                  { k: 'weeklyHours' as const,     l: t('متوسط أسبوعي', 'Avg Weekly'), w: 'min-w-[110px]' },
                  { k: 'streak' as const,          l: t('السلسلة', 'Streak'),       w: 'min-w-[70px]' },
                ]).map((col, ci) => (
                  <th
                    key={ci}
                    className={`px-3 py-3 text-start text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700 transition ${col.w}`}
                    onClick={() => handleSort(col.k)}
                  >
                    <span className="flex items-center gap-1">
                      {col.l}
                      {'tip' in col && (col as { tip?: string }).tip && (
                        <span onClick={(e) => e.stopPropagation()}><InfoTip>{(col as { tip: string }).tip}</InfoTip></span>
                      )}
                      {sortKey === col.k && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => {
                const loginColor = row.daysSinceLogin === 0 ? 'text-emerald-600' : row.daysSinceLogin <= 2 ? 'text-amber-600' : 'text-rose-600';
                const loginLabel = row.daysSinceLogin === 0
                  ? t('اليوم', 'Today')
                  : row.daysSinceLogin === 1
                    ? t('قبل يوم', '1 day ago')
                    : (ar ? `قبل ${row.daysSinceLogin} أيام` : `${row.daysSinceLogin} days ago`);
                const statusEmoji = row.status === 'active' ? '🟢' : row.status === 'partial' ? '🟡' : '🔴';
                const trendArrow = row.trendDir === 'up' ? '↑' : row.trendDir === 'down' ? '↓' : '→';
                const isInactive3Plus = row.daysSinceLogin >= 3;
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.015 }}
                    className={`border-b border-slate-50 ${isInactive3Plus ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="px-3 py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <TeacherAvatar name={row.name} />
                        <span className="font-semibold text-slate-700 text-xs truncate">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className={`text-xs font-semibold ${loginColor}`}>{loginLabel}</span></td>
                    <td className="px-3 py-3 text-center"><span className="text-sm">{statusEmoji}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-sky-400"
                            initial={{ width: 0 }} animate={{ width: `${(row.weeklyHours / maxWeeklyHours) * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.02 }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-end">{row.weeklyHours}h</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="text-xs text-slate-600">{row.avgWeeklyHours}h {trendArrow}</span></td>
                    <td className="px-3 py-3"><span className="text-xs font-bold text-slate-700">{row.streak > 3 ? '🔥 ' : ''}{row.streak}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">{t('لا يوجد معلمون مطابقون', 'No matching teachers')}</div>
        )}
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. ContentProductionModal — 4 stat cards + per-teacher table
   ═══════════════════════════════════════════════════════════════ */

export function ContentProductionModal({
  teachers, locale, onClose,
}: { teachers: PopupTeacher[]; locale: 'ar' | 'en'; onClose: () => void }) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => ar ? a : e;
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'lessons' | 'assignments' | 'exams' | 'reviewed' | 'activeRate' | 'score'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const enriched = useMemo(() => teachers.map(tch => {
    const seed = teacherSeed(tch);
    const reviewed = Math.floor(seededRandom(seed + 400) * 20) + 2;
    const activeStudentRate = tch.studentWeeklyLoginRate;
    const contentScore = Math.round(
      Math.min(100, (tch.lessons * 4 + tch.assignments * 2 + tch.exams * 5 + reviewed * 1.5) / 1.2)
    );
    return { ...tch, reviewed, activeStudentRate, contentScore };
  }), [teachers]);

  const totalLessons = enriched.reduce((s, c) => s + c.lessons, 0);
  const totalAssignments = enriched.reduce((s, c) => s + c.assignments, 0);
  const totalExams = enriched.reduce((s, c) => s + c.exams, 0);
  const avgActiveRate = Math.round(enriched.reduce((s, c) => s + c.activeStudentRate, 0) / (enriched.length || 1));

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (search.trim()) list = list.filter(c => c.name.includes(search.trim()));
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ar'); break;
        case 'lessons': cmp = a.lessons - b.lessons; break;
        case 'assignments': cmp = a.assignments - b.assignments; break;
        case 'exams': cmp = a.exams - b.exams; break;
        case 'reviewed': cmp = a.reviewed - b.reviewed; break;
        case 'activeRate': cmp = a.activeStudentRate - b.activeStudentRate; break;
        case 'score': cmp = a.contentScore - b.contentScore; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [enriched, search, sortKey, sortDir]);

  const ranked = [...enriched].sort((a, b) => b.contentScore - a.contentScore);

  const handleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const cards: { color: string; icon: React.ReactNode; label: string; value: string; chip?: string }[] = [
    { color: '#0ea5e9', icon: <BookOpen className="w-5 h-5" />, label: t('الدروس المنشأة', 'Lessons Created'), value: String(totalLessons), chip: t(`هذا الأسبوع: ${totalLessons}`, `This week: ${totalLessons}`) },
    { color: '#10b981', icon: <ClipboardList className="w-5 h-5" />, label: t('إجمالي الواجبات', 'Total Assignments'), value: String(totalAssignments), chip: t(`+${Math.round(totalAssignments * 0.15)} مقابل الأسبوع الماضي`, `+${Math.round(totalAssignments * 0.15)} vs last week`) },
    { color: '#8b5cf6', icon: <PenTool className="w-5 h-5" />, label: t('إجمالي الاختبارات', 'Total Exams'), value: String(totalExams), chip: t(`بمعدل ${Math.round(totalExams / (enriched.length || 1))} لكل معلم`, `Avg ${Math.round(totalExams / (enriched.length || 1))} per teacher`) },
    { color: '#f59e0b', icon: <TrendingUp className="w-5 h-5" />, label: t('متوسط نشاط الطلاب', 'Avg Active Students'), value: `${avgActiveRate}%` },
  ];

  return (
    <ModalShell
      icon={<FileText className="w-5 h-5" />}
      title={t('📝 إنتاج المحتوى', '📝 Content Production')}
      subtitle={t('إحصائيات إنشاء المحتوى والواجبات', 'Content creation and assignment statistics')}
      color="#10b981" locale={locale} onClose={onClose}
    >
      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="relative bg-white border border-slate-100 shadow-sm rounded-2xl p-4 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="absolute top-0 end-0 w-24 h-24 rounded-full opacity-[0.05]" style={{ background: c.color, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                <p className="text-2xl font-extrabold text-slate-800">{c.value}</p>
              </div>
              <div className="p-2 rounded-xl" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
            </div>
            {c.chip && (
              <div className="mt-3">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: `${c.color}15`, color: c.color }}>
                  {c.chip}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Per-Teacher Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('ابحث عن معلم...', 'Search teacher...')}
              className="w-full ps-10 pe-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition font-['Cairo']"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {([
                  { k: 'name' as const,        l: t('المعلم', 'Teacher'),         w: 'min-w-[180px]' },
                  { k: 'lessons' as const,     l: t('الدروس', 'Lessons'),         w: 'min-w-[80px]' },
                  { k: 'assignments' as const, l: t('الواجبات', 'Assignments'),   w: 'min-w-[90px]' },
                  { k: 'exams' as const,       l: t('الاختبارات', 'Exams'),       w: 'min-w-[80px]' },
                  { k: 'reviewed' as const,    l: t('سترنغز', 'Strings'),         w: 'min-w-[80px]', tip: t('السترنغز هي وحدات الدروس التفاعلية في منصتنا — كلما زاد العدد زادت تجربة الطالب', 'Strings are the interactive lesson units in our platform — more = richer student experience') },
                  { k: 'activeRate' as const,  l: t('نشاط الطلاب %', 'Active %'), w: 'min-w-[140px]' },
                  { k: 'score' as const,       l: t('نقاط المحتوى', 'Score'),     w: 'min-w-[100px]' },
                ]).map(col => (
                  <th
                    key={col.k}
                    className={`px-3 py-3 text-start text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700 transition ${col.w}`}
                    onClick={() => handleSort(col.k)}
                  >
                    <span className="flex items-center gap-1">
                      {col.l}
                      {'tip' in col && (col as { tip?: string }).tip && (
                        <span onClick={(e) => e.stopPropagation()}><InfoTip>{(col as { tip: string }).tip}</InfoTip></span>
                      )}
                      {sortKey === col.k && (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ct, idx) => {
                const rank = ranked.findIndex(r => r.id === ct.id) + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                const scoreBg = ct.contentScore >= 80 ? 'bg-emerald-100 text-emerald-700' : ct.contentScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
                const rateColor = ct.activeStudentRate >= 85 ? '#10b981' : ct.activeStudentRate >= 70 ? '#0ea5e9' : ct.activeStudentRate >= 55 ? '#f59e0b' : '#f43f5e';
                return (
                  <motion.tr
                    key={ct.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.015 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {medal && <span className="text-sm">{medal}</span>}
                        <TeacherAvatar name={ct.name} />
                        <span className="font-semibold text-slate-700 text-xs truncate">{ct.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{ct.lessons}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{ct.assignments}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{ct.exams}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{ct.reviewed}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                          <motion.div
                            className="h-full rounded-full" style={{ background: rateColor }}
                            initial={{ width: 0 }} animate={{ width: `${ct.activeStudentRate}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.015 }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color: rateColor }}>{ct.activeStudentRate}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${scoreBg}`}>{ct.contentScore}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">{t('لا يوجد معلمون مطابقون', 'No matching teachers')}</div>
        )}
      </div>
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. DailyPulseModal — نبض اليوم / Today's Pulse
   Per-class daily routine checkup across all teachers
   ═══════════════════════════════════════════════════════════════ */

export type ActivityKey =
  | 'login' | 'attendance' | 'smartboard' | 'assignment'
  | 'studentEngagement' | 'stringShared' | 'textbookProgress';

export const ACTIVITIES: {
  key: ActivityKey;
  icon: React.ComponentType<{ className?: string }>;
  ar: string; en: string;
  tipAr: string; tipEn: string;
  color: string;
}[] = [
  { key: 'login', icon: LogIn, ar: 'تسجيل الدخول', en: 'Login Today',
    tipAr: 'هل فتح المعلم حصّة الفصل على المنصة اليوم؟', tipEn: 'Did the teacher open the class on the platform today?', color: '#0ea5e9' },
  { key: 'attendance', icon: UserCheck, ar: 'تسجيل الحضور', en: 'Attendance',
    tipAr: 'هل سجّل المعلم حضور طلاب الفصل اليوم؟', tipEn: 'Did the teacher submit attendance for this class today?', color: '#10b981' },
  { key: 'smartboard', icon: Monitor, ar: 'السبورة الذكية', en: 'Smart Board',
    tipAr: 'هل شغّل المعلم السبورة الذكية في الفصل اليوم؟', tipEn: 'Did a smart-board session run in this class today?', color: '#8b5cf6' },
  { key: 'assignment', icon: ClipboardList, ar: 'إنشاء واجب', en: 'Assignment',
    tipAr: 'هل أنشأ المعلم واجباً جديداً وأرسله للفصل اليوم؟', tipEn: 'Did the teacher create and publish ≥1 assignment today?', color: '#f59e0b' },
  { key: 'studentEngagement', icon: Users, ar: 'نشاط الطلاب أمس', en: 'Students Active',
    tipAr: 'نسبة الطلاب الذين سجّلوا دخولاً ولعبوا Quest واحداً على الأقل أمس. ≥٦٠٪ يُعتبر "تم"', tipEn: 'Share of students who logged in and completed ≥1 Quest yesterday. ≥60% counts as done', color: '#ec4899' },
  { key: 'stringShared', icon: BookOpen, ar: 'مشاركة String', en: 'String Shared',
    tipAr: 'هل أنشأ المعلم String وشاركه مع طلاب الفصل اليوم؟', tipEn: 'Did the teacher create AND share a String today?', color: '#06b6d4' },
  { key: 'textbookProgress', icon: FileText, ar: 'تحديث المنهج', en: 'Textbook Progress',
    tipAr: 'هل حدّث المعلم مؤشّر تقدّم المنهج لهذا الفصل اليوم؟', tipEn: 'Did the teacher advance the textbook progress marker today?', color: '#6366f1' },
];

export interface ClassPulse {
  classKey: string;
  grade: number;
  section: string;
  studentCount: number;
  status: Record<Exclude<ActivityKey, 'studentEngagement'>, boolean>;
  engagementPct: number;
}

export interface TeacherPulse {
  teacher: PopupTeacher;
  classes: ClassPulse[];
  perActivity: Record<ActivityKey, { done: number; total: number; pct: number }>;
  score: number;                       // 0-7, counts activities where ALL classes passed
  status: 'complete' | 'behind' | 'critical';
}

/** Hash a YYYY-MM-DD into a small integer offset */
function dateHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) | 0;
  return Math.abs(h) % 10000;
}

/** Deterministic mock data — one TeacherPulse per teacher.
 *  When `dateStr` is provided the seed varies by date so historical days look different but stable. */
export function buildPulseData(teachers: PopupTeacher[], dateStr?: string): TeacherPulse[] {
  const dateOffset = dateStr ? dateHash(dateStr) : 0;
  return teachers.map(t => {
    const baseSeed = teacherSeed(t) + dateOffset;
    // Use teacher.classes if present; otherwise synthesize 2-4 from grade/section seed
    const cls = (t.classes && t.classes.length > 0)
      ? t.classes
      : (() => {
          const n = 2 + Math.floor(seededRandom(baseSeed + 1) * 3);
          return Array.from({ length: n }, (_, i) => {
            const g = Math.max(1, Math.min(12, t.grade + (i === 0 ? 0 : (i - 1))));
            const secIdx = (baseSeed + i * 17) % 6;
            return {
              grade: g,
              section: ['A','B','C','D','E','F'][secIdx],
              campusId: t.campusId,
              studentCount: 22 + Math.floor(seededRandom(baseSeed + i * 31) * 12),
            };
          });
        })();

    const classes: ClassPulse[] = cls.map((c, i) => {
      const s = baseSeed + c.grade * 31 + c.section.charCodeAt(0) + i * 7;
      const r = (n: number) => seededRandom(s + n * 13);
      // Bias: higher for login/attendance (more common), lower for stringShared/textbookProgress
      const login = r(1) > 0.15;                            // 85%
      const attendance = r(2) > 0.20;                       // 80%
      const smartboard = r(3) > 0.40;                       // 60%
      const assignment = r(4) > 0.55;                       // 45%
      const stringShared = r(6) > 0.60;                     // 40%
      const textbookProgress = r(7) > 0.45;                 // 55%
      const engagementPct = Math.round(40 + r(5) * 55);     // 40-95
      return {
        classKey: `${c.grade}-${c.section}`,
        grade: c.grade, section: c.section, studentCount: c.studentCount,
        status: { login, attendance, smartboard, assignment, stringShared, textbookProgress },
        engagementPct,
      };
    });

    // Aggregate per activity
    const perActivity = {} as TeacherPulse['perActivity'];
    const total = classes.length;
    ACTIVITIES.forEach(a => {
      let done = 0;
      if (a.key === 'studentEngagement') {
        done = classes.filter(c => c.engagementPct >= 60).length;
      } else {
        done = classes.filter(c => c.status[a.key as Exclude<ActivityKey, 'studentEngagement'>]).length;
      }
      perActivity[a.key] = { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    });

    // Score: number of activities where ALL classes passed
    const score = ACTIVITIES.reduce((sum, a) => sum + (perActivity[a.key].done === total && total > 0 ? 1 : 0), 0);
    const status: TeacherPulse['status'] = score >= 6 ? 'complete' : score >= 4 ? 'behind' : 'critical';

    return { teacher: t, classes, perActivity, score, status };
  });
}

/** Color helpers used by the row pills and the summary strip */
function pctTone(pct: number): { bg: string; text: string; border: string; bar: string } {
  if (pct >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#10b981' };
  if (pct >= 50) return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: '#f59e0b' };
  return           { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    bar: '#ef4444' };
}

function engagementTone(pct: number): { bg: string; text: string; border: string } {
  if (pct >= 75) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (pct >= 60) return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' };
  return           { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' };
}

function scoreTone(score: number): { bg: string; text: string; border: string } {
  if (score >= 7) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (score >= 5) return { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200' };
  return            { bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200' };
}

/** Sticky strip cell: aggregate across whole school, clickable to filter the table */
type ActivitySummaryCellProps = {
  meta: typeof ACTIVITIES[number];
  done: number; total: number;
  active: boolean;
  locale: 'ar' | 'en';
  onClick: () => void;
};
export const ActivitySummaryCell: React.FC<ActivitySummaryCellProps> = ({
  meta, done, total, active, locale, onClick,
}) => {
  const ar = locale === 'ar';
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const tone = pctTone(pct);
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={`group relative text-start p-3 rounded-2xl border transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        active ? 'bg-violet-50 border-violet-300 ring-2 ring-violet-200' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` }}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="text-[11px] font-black text-slate-700 leading-tight">{ar ? meta.ar : meta.en}</div>
        </div>
        <span onClick={(e) => e.stopPropagation()}><InfoTip>{ar ? meta.tipAr : meta.tipEn}</InfoTip></span>
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className={`text-lg font-black tabular-nums ${tone.text}`}>{done}</span>
        <span className="text-[10px] text-slate-400 font-bold">/ {total}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: tone.bar }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
      </div>
    </button>
  );
};

/** Table cell pill for a (teacher, activity) aggregate */
type ActivityStatusPillProps = {
  done: number; total: number;
  isEngagement?: boolean; avgEngagement?: number;
};
export const ActivityStatusPill: React.FC<ActivityStatusPillProps> = ({ done, total, isEngagement, avgEngagement }) => {
  if (isEngagement && typeof avgEngagement === 'number') {
    const tone = engagementTone(avgEngagement);
    return (
      <span className={`inline-flex items-center justify-center min-w-[44px] px-2 py-1 rounded-lg border text-[11px] font-black tabular-nums ${tone.bg} ${tone.text} ${tone.border}`}>
        {avgEngagement}%
      </span>
    );
  }
  if (total === 0) return <span className="text-slate-300 text-xs">—</span>;
  if (done === total) {
    return (
      <span className="inline-flex items-center justify-center w-9 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    );
  }
  if (done === 0) {
    return (
      <span className="inline-flex items-center justify-center w-9 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
        <XCircle className="w-4 h-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black tabular-nums">
      {done}/{total}
    </span>
  );
};

/** Compact per-class icon (side panel only) */
type ClassActivityIconProps = {
  meta: typeof ACTIVITIES[number];
  done?: boolean;
  engagementPct?: number;
  locale: 'ar' | 'en';
};
const ClassActivityIcon: React.FC<ClassActivityIconProps> = ({ meta, done, engagementPct, locale }) => {
  const ar = locale === 'ar';
  const Icon = meta.icon;
  if (meta.key === 'studentEngagement' && typeof engagementPct === 'number') {
    const tone = engagementTone(engagementPct);
    return (
      <div className="relative group">
        <span className={`inline-flex flex-col items-center justify-center w-12 h-10 rounded-lg border ${tone.bg} ${tone.text} ${tone.border}`}>
          <Icon className="w-3 h-3" />
          <span className="text-[10px] font-black tabular-nums leading-none mt-0.5">{engagementPct}%</span>
        </span>
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {ar ? meta.ar : meta.en}
        </span>
      </div>
    );
  }
  const ok = !!done;
  return (
    <div className="relative group">
      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border ${
        ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      }`}>
        <Icon className="w-4 h-4" />
        {ok
          ? <CheckCircle2 className="w-2.5 h-2.5 absolute -top-1 -end-1 bg-white rounded-full text-emerald-500" />
          : <XCircle className="w-2.5 h-2.5 absolute -top-1 -end-1 bg-white rounded-full text-rose-500" />}
      </span>
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {ar ? meta.ar : meta.en}
      </span>
    </div>
  );
};

/** Side panel with per-class breakdown */
type TeacherSidePanelProps = { pulse: TeacherPulse; locale: 'ar' | 'en'; onClose: () => void };
export const TeacherSidePanel: React.FC<TeacherSidePanelProps> = ({ pulse, locale, onClose }) => {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => ar ? a : e;
  const { teacher, classes, score } = pulse;
  const scoreT = scoreTone(score);
  return (
    <div
      key={teacher.id}
      className="w-full h-full flex flex-col overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-start gap-3">
        <TeacherAvatar name={teacher.name} size={52} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-slate-800 truncate">{teacher.name}</h3>
          <div className="text-[11px] text-slate-500 font-bold mt-0.5">
            {classes.length} {t('فصول', 'classes')} · {classes.reduce((s, c) => s + c.studentCount, 0)} {t('طالب', 'students')}
          </div>
          <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg border text-[11px] font-black tabular-nums ${scoreT.bg} ${scoreT.text} ${scoreT.border}`}>
            {score}/7 {t('من المهام', 'of tasks')}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition shrink-0">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Scrollable class list */}
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-slate-50/40">
        {classes.map((c, idx) => {
          const missed: string[] = [];
          if (!c.status.attendance) missed.push(t('لم يُسجّل الحضور', 'attendance not marked'));
          if (!c.status.login) missed.push(t('لم يسجّل الدخول', 'not logged in'));
          return (
            <motion.div
              key={c.classKey}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-[11px] font-black text-violet-700">
                    {c.grade}{c.section}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      {t(`الصف ${c.grade} — شعبة ${c.section}`, `Grade ${c.grade}${c.section}`)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">{c.studentCount} {t('طالب', 'students')}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITIES.map(a => (
                  <ClassActivityIcon
                    key={a.key}
                    meta={a}
                    done={a.key === 'studentEngagement' ? undefined : c.status[a.key as Exclude<ActivityKey, 'studentEngagement'>]}
                    engagementPct={a.key === 'studentEngagement' ? c.engagementPct : undefined}
                    locale={locale}
                  />
                ))}
              </div>
              {missed.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
                  <AlertTriangle className="w-3 h-3" />
                  {missed.join(' · ')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/** Table row — one teacher, aggregated across classes */
type TeacherPulseRowProps = { pulse: TeacherPulse; locale: 'ar' | 'en'; onOpen: () => void; isOpen: boolean };
export const TeacherPulseRow: React.FC<TeacherPulseRowProps> = ({ pulse, locale, onOpen, isOpen }) => {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => ar ? a : e;
  const { teacher, classes, perActivity, score } = pulse;
  const scoreT = scoreTone(score);
  // Avg engagement for the engagement column display
  const avgEng = classes.length > 0
    ? Math.round(classes.reduce((s, c) => s + c.engagementPct, 0) / classes.length)
    : 0;

  return (
    <tr
      onClick={onOpen}
      className={`border-b border-slate-100 cursor-pointer transition-colors ${isOpen ? 'bg-violet-50/60' : 'hover:bg-slate-50/60'}`}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <TeacherAvatar name={teacher.name} />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-800 truncate">{teacher.name}</div>
            <div className="text-[10px] text-slate-400 font-bold">{classes.length} {t('فصول', 'classes')}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg border text-xs font-black tabular-nums ${scoreT.bg} ${scoreT.text} ${scoreT.border}`}>
          {score}/7
        </span>
      </td>
      {ACTIVITIES.map(a => (
        <td key={a.key} className="px-2 py-2.5 text-center">
          <ActivityStatusPill
            done={perActivity[a.key].done}
            total={perActivity[a.key].total}
            isEngagement={a.key === 'studentEngagement'}
            avgEngagement={a.key === 'studentEngagement' ? avgEng : undefined}
          />
        </td>
      ))}
      <td className="px-2 py-2.5 text-slate-300">
        <ChevronDown className={`w-4 h-4 transition-transform ${ar ? 'rotate-90' : '-rotate-90'}`} />
      </td>
    </tr>
  );
};

export function DailyPulseModal({
  teachers, locale, onClose,
}: { teachers: PopupTeacher[]; locale: 'ar' | 'en'; onClose: () => void }) {
  const ar = locale === 'ar';
  const t = (a: string, e: string) => ar ? a : e;

  const pulses = useMemo(() => buildPulseData(teachers), [teachers]);

  const schoolTotals = useMemo(() => {
    const totals = {} as Record<ActivityKey, { done: number; total: number }>;
    ACTIVITIES.forEach(a => {
      totals[a.key] = { done: 0, total: 0 };
    });
    pulses.forEach(p => {
      ACTIVITIES.forEach(a => {
        totals[a.key].done += p.perActivity[a.key].done;
        totals[a.key].total += p.perActivity[a.key].total;
      });
    });
    return totals;
  }, [pulses]);

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
      const cmp = sortKey === 'score' ? a.score - b.score : a.teacher.name.localeCompare(b.teacher.name, 'ar');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [pulses, statusFilter, activityFilter, search, sortKey, sortDir]);

  const selected = useMemo(() => pulses.find(p => p.teacher.id === selectedId) ?? null, [pulses, selectedId]);
  useEffect(() => {
    if (selectedId && !filtered.some(p => p.teacher.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const statusChips: { v: typeof statusFilter; ar: string; en: string }[] = [
    { v: 'all',      ar: 'الكل',     en: 'All' },
    { v: 'complete', ar: 'مكتمل',    en: 'Complete' },
    { v: 'behind',   ar: 'متأخر',    en: 'Behind' },
    { v: 'critical', ar: 'حرج',      en: 'Critical' },
  ];

  return (
    <ModalShell
      icon={<Activity className="w-5 h-5" />}
      title={t('نبض اليوم', "Today's Pulse")}
      subtitle={t('نظرة سريعة على روتين كل معلم اليوم — عبر كل الفصول', 'Quick read on each teacher\'s daily routine — across all their classes')}
      color="#8b5cf6" locale={locale} onClose={onClose}
    >
      {/* Relative wrapper so the side-panel can overlay only this region */}
      <div className="relative -m-5 p-5 overflow-hidden" style={{ minHeight: '60vh' }}>
        {/* Sticky activity summary strip */}
        <div className="sticky top-0 z-10 -mx-5 px-5 pb-3 pt-1 bg-slate-50/80 backdrop-blur-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ACTIVITIES.map(a => (
              <ActivitySummaryCell
                key={a.key}
                meta={a}
                done={schoolTotals[a.key].done}
                total={schoolTotals[a.key].total}
                active={activityFilter === a.key}
                locale={locale}
                onClick={() => setActivityFilter(f => f === a.key ? null : a.key)}
              />
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap mt-4 mb-3">
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
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('ابحث بالاسم...', 'Search by name...')}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 transition font-['Cairo']"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold ms-auto">{filtered.length} {t('معلم', 'teachers')}</span>
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
                    <span className="inline-flex items-center gap-1">{t('المعلم', 'Teacher')}
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
                    <span className="inline-flex items-center gap-1">{t('النتيجة', 'Score')}
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
            <div className="text-center py-10 text-slate-400 text-sm">{t('لا يوجد معلمون مطابقون', 'No matching teachers')}</div>
          )}
        </div>

        {/* Side panel overlay (scoped to the modal body) */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/20 z-20"
                onClick={() => setSelectedId(null)}
              />
              <motion.div
                key={selected.teacher.id}
                initial={{ x: ar ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: ar ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="absolute inset-y-0 end-0 z-30 w-full sm:w-[460px] bg-white border-s border-slate-200 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <TeacherSidePanel pulse={selected} locale={locale} onClose={() => setSelectedId(null)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ModalShell>
  );
}
