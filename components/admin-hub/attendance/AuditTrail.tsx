import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronDown, ChevronUp, Calendar, Shield,
  Users, CheckCircle2, XCircle, Settings, CalendarX2,
  ArrowRight, ChevronLeft, ChevronRight, Edit3, Eye,
} from 'lucide-react';
import {
  EXTENDED_STUDENTS, EXTENDED_TEACHERS, getTodayString,
} from '../../../data/mockAttendanceData';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type AuditActionType = 'override' | 'bulk_mark' | 'excuse_approve' | 'excuse_reject' | 'policy_change' | 'session_cancel';

interface AuditEntry {
  id: string;
  timestamp: string;
  actionType: AuditActionType;
  performedBy: string;
  performedByRole: string;
  target: string;
  description: string;
  reason?: string;
  before?: string;
  after?: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const t = (locale: 'ar' | 'en', ar: string, en: string) => locale === 'ar' ? ar : en;

const ACTION_CONFIG: Record<AuditActionType, { ar: string; en: string; color: string; bg: string; ring: string; Icon: React.ElementType }> = {
  override:       { ar: 'تعديل يدوي',     en: 'Override',       color: 'text-sky-400',     bg: 'bg-sky-500/15',     ring: 'ring-sky-500/30',     Icon: Edit3 },
  bulk_mark:      { ar: 'تسجيل جماعي',    en: 'Bulk Mark',      color: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/30',   Icon: Users },
  excuse_approve: { ar: 'قبول إعفاء',      en: 'Excuse Approve', color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30', Icon: CheckCircle2 },
  excuse_reject:  { ar: 'رفض إعفاء',       en: 'Excuse Reject',  color: 'text-rose-400',    bg: 'bg-rose-500/15',    ring: 'ring-rose-500/30',    Icon: XCircle },
  policy_change:  { ar: 'تغيير إعدادات',   en: 'Policy Change',  color: 'text-purple-400',  bg: 'bg-purple-500/15',  ring: 'ring-purple-500/30',  Icon: Settings },
  session_cancel: { ar: 'إلغاء حصة',       en: 'Session Cancel', color: 'text-zinc-400',    bg: 'bg-zinc-500/15',    ring: 'ring-zinc-500/30',    Icon: CalendarX2 },
};

const PAGE_SIZE = 15;

// ─────────────────────────────────────────────
// Mock Data Generator
// ─────────────────────────────────────────────

function generateMockAuditEntries(campusId: string): AuditEntry[] {
  const students = EXTENDED_STUDENTS.filter(s => s.campusId === campusId);
  const teachers = EXTENDED_TEACHERS.filter(t => t.campusId === campusId);
  const entries: AuditEntry[] = [];
  const now = new Date();

  const admins = [
    { name: 'د. عبدالله العمر', role: 'مدير المدرسة' },
    { name: 'أ. نوره الخالد', role: 'مشرفة أكاديمية' },
    { name: 'أ. محمد السالم', role: 'مسؤول الحضور' },
    { name: 'أ. فاطمة الرشيد', role: 'مشرفة طلابية' },
  ];

  const actionTypes: AuditActionType[] = ['override', 'bulk_mark', 'excuse_approve', 'excuse_reject', 'policy_change', 'session_cancel'];

  // Generate 28 entries spanning 30 days
  for (let i = 0; i < 28; i++) {
    const dayOffset = Math.floor((i / 28) * 30);
    const d = new Date(now);
    d.setDate(d.getDate() - dayOffset);
    d.setHours(7 + (i % 8), (i * 17) % 60, 0, 0);

    const action = actionTypes[i % actionTypes.length];
    const admin = admins[i % admins.length];
    const stu = students[i % Math.max(students.length, 1)];
    const teacher = teachers.length > 0 ? teachers[i % teachers.length] : null;

    let target = '';
    let description = '';
    let reason: string | undefined;
    let before: string | undefined;
    let after: string | undefined;

    switch (action) {
      case 'override': {
        const stuName = stu?.name || 'طالب';
        target = `الطالب: ${stuName}`;
        const prevStatus = i % 2 === 0 ? 'غائب' : 'متأخر';
        const newStatus = i % 2 === 0 ? 'حاضر' : 'حاضر';
        description = `تعديل حالة الحضور من "${prevStatus}" إلى "${newStatus}"`;
        reason = i % 3 === 0 ? 'خطأ في التسجيل الأولي' : 'تأكيد حضور الطالب بعد مراجعة';
        before = `الحالة: ${prevStatus} | التاريخ: ${formatDateStr(d)}`;
        after = `الحالة: ${newStatus} | التاريخ: ${formatDateStr(d)} | معدّل يدوياً`;
        break;
      }
      case 'bulk_mark': {
        const grade = stu?.grade || ((i % 6) + 1);
        const section = stu?.section || 'A';
        target = `الصف ${grade} - ${section}`;
        const count = 20 + (i % 8);
        description = `تسجيل حضور جماعي لعدد ${count} طالب`;
        before = `${count} طالب بدون تسجيل`;
        after = `${count} حاضر | 0 غائب | 0 متأخر`;
        break;
      }
      case 'excuse_approve': {
        const stuName = stu?.name || 'طالب';
        target = `الطالب: ${stuName}`;
        const reasons = ['طبي', 'عائلي', 'سفر'];
        description = `قبول طلب إعفاء (${reasons[i % reasons.length]}) ليوم ${formatDateStr(d)}`;
        reason = 'تم التحقق من المستندات المرفقة';
        before = `الحالة: غائب (بدون عذر)`;
        after = `الحالة: غائب (معفى) | السبب: ${reasons[i % reasons.length]}`;
        break;
      }
      case 'excuse_reject': {
        const stuName = stu?.name || 'طالب';
        target = `الطالب: ${stuName}`;
        description = `رفض طلب إعفاء ليوم ${formatDateStr(d)}`;
        reason = i % 2 === 0 ? 'لم يتم تقديم مستندات داعمة' : 'السبب المقدم غير مقبول وفق السياسة';
        before = `طلب إعفاء: قيد المراجعة`;
        after = `طلب إعفاء: مرفوض`;
        break;
      }
      case 'policy_change': {
        target = 'إعدادات الحضور';
        const policies = [
          { desc: 'تعديل وقت بداية التسجيل', b: 'بداية التسجيل: 07:00', a: 'بداية التسجيل: 06:45' },
          { desc: 'تعديل حد التأخير المسموح', b: 'حد التأخير: 15 دقيقة', a: 'حد التأخير: 10 دقائق' },
          { desc: 'تفعيل الإشعارات التلقائية للأهالي', b: 'إشعارات الأهالي: معطلة', a: 'إشعارات الأهالي: مفعلة' },
          { desc: 'تعديل نسبة الحضور المطلوبة', b: 'الحد الأدنى: 75%', a: 'الحد الأدنى: 80%' },
        ];
        const p = policies[i % policies.length];
        description = p.desc;
        before = p.b;
        after = p.a;
        break;
      }
      case 'session_cancel': {
        const grade = stu?.grade || ((i % 6) + 1);
        const section = stu?.section || 'A';
        const teacherName = teacher?.name || 'المعلم';
        target = `الصف ${grade} - ${section}`;
        const periods = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'];
        description = `إلغاء الحصة ${periods[i % periods.length]} بسبب غياب المعلم ${teacherName}`;
        reason = 'غياب المعلم - لا يوجد بديل متاح';
        before = `الحصة ${periods[i % periods.length]}: مجدولة`;
        after = `الحصة ${periods[i % periods.length]}: ملغاة`;
        break;
      }
    }

    entries.push({
      id: `audit-${i + 1}`,
      timestamp: d.toISOString(),
      actionType: action,
      performedBy: admin.name,
      performedByRole: admin.role,
      target,
      description,
      reason,
      before,
      after,
    });
  }

  // Sort newest first
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimestamp(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDateOnly(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface AuditTrailProps {
  locale: 'ar' | 'en';
  campusId: string;
}

export function AuditTrail({ locale, campusId }: AuditTrailProps) {
  const l = useCallback((ar: string, en: string) => t(locale, ar, en), [locale]);
  const isRtl = locale === 'ar';

  // ── State ──
  const allEntries = useMemo(() => generateMockAuditEntries(campusId), [campusId]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditActionType | 'all'>('all');
  const [performerSearch, setPerformerSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  // ── Filtered Data ──
  const filtered = useMemo(() => {
    let list = [...allEntries];

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter(e => new Date(e.timestamp).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(e => new Date(e.timestamp).getTime() <= to.getTime());
    }
    if (actionFilter !== 'all') {
      list = list.filter(e => e.actionType === actionFilter);
    }
    if (performerSearch.trim()) {
      const q = performerSearch.trim().toLowerCase();
      list = list.filter(e => e.performedBy.toLowerCase().includes(q) || e.performedByRole.toLowerCase().includes(q));
    }

    return list;
  }, [allEntries, dateFrom, dateTo, actionFilter, performerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageEntries = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page on filter change
  useMemo(() => { setCurrentPage(1); }, [dateFrom, dateTo, actionFilter, performerSearch]);

  // ── Render ──
  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{l('سجل التدقيق', 'Audit Trail')}</h3>
          <p className="text-xs text-zinc-500">{l(`${filtered.length} إجراء مسجّل`, `${filtered.length} recorded actions`)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {/* Date Range */}
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/40 outline-none"
            placeholder={l('من', 'From')}
          />
          <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500/40 outline-none"
            placeholder={l('إلى', 'To')}
          />
        </div>

        {/* Action Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActionDropdownOpen(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-zinc-300 hover:bg-white/[0.08] transition-colors min-w-[160px]"
          >
            <Filter className="w-3.5 h-3.5" />
            {actionFilter === 'all' ? l('جميع الإجراءات', 'All Actions') : t(locale, ACTION_CONFIG[actionFilter].ar, ACTION_CONFIG[actionFilter].en)}
            <ChevronDown className="w-3 h-3 ms-auto" />
          </button>
          <AnimatePresence>
            {actionDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute top-full mt-1 end-0 bg-[#1a1a22] border border-white/[0.1] rounded-xl shadow-2xl z-30 py-1 min-w-[180px]"
              >
                <button
                  onClick={() => { setActionFilter('all'); setActionDropdownOpen(false); }}
                  className={`w-full text-start px-4 py-2 text-xs font-medium transition-colors ${
                    actionFilter === 'all' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {l('جميع الإجراءات', 'All Actions')}
                </button>
                {(Object.keys(ACTION_CONFIG) as AuditActionType[]).map(key => {
                  const cfg = ACTION_CONFIG[key];
                  return (
                    <button
                      key={key}
                      onClick={() => { setActionFilter(key); setActionDropdownOpen(false); }}
                      className={`w-full text-start px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                        actionFilter === key ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <cfg.Icon className={`w-3 h-3 ${cfg.color}`} />
                      {t(locale, cfg.ar, cfg.en)}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performer Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={performerSearch}
            onChange={e => setPerformerSearch(e.target.value)}
            placeholder={l('بحث بالمنفذ...', 'Search performer...')}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg ps-9 pe-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold w-8" />
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('الوقت', 'Time')}</th>
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('نوع الإجراء', 'Action Type')}</th>
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('المنفذ', 'Performed By')}</th>
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('الهدف', 'Target')}</th>
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('الوصف', 'Description')}</th>
                <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('السبب', 'Reason')}</th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-medium">
                    <Eye className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    {l('لا توجد إجراءات مطابقة', 'No matching actions')}
                  </td>
                </tr>
              ) : pageEntries.map(entry => {
                const cfg = ACTION_CONFIG[entry.actionType];
                const isExpanded = expandedId === entry.id;

                return (
                  <React.Fragment key={entry.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className={`border-b border-white/[0.04] cursor-pointer transition-colors ${
                        isExpanded ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                      } ${entry.before ? '' : 'cursor-default'}`}
                    >
                      <td className="px-3 py-3 text-center">
                        {entry.before && (
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                          </motion.div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                        {formatTimestamp(entry.timestamp, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold ring-1 ${cfg.bg} ${cfg.color} ${cfg.ring}`}>
                          <cfg.Icon className="w-3 h-3" />
                          {t(locale, cfg.ar, cfg.en)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium text-xs">{entry.performedBy}</p>
                        <p className="text-zinc-500 text-[10px]">{entry.performedByRole}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 max-w-[180px] truncate" title={entry.target}>
                        {entry.target}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 max-w-[220px] truncate" title={entry.description}>
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 max-w-[160px] truncate" title={entry.reason || '—'}>
                        {entry.reason || '—'}
                      </td>
                    </tr>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && entry.before && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                                  {l('مقارنة التغييرات', 'Change Comparison')}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Before */}
                                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                                      <span className="text-[10px] font-bold text-rose-400 uppercase">
                                        {l('قبل', 'Before')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                                      {entry.before}
                                    </p>
                                  </div>
                                  {/* After */}
                                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                                        {l('بعد', 'After')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                                      {entry.after}
                                    </p>
                                  </div>
                                </div>
                                {entry.reason && (
                                  <div className="mt-3 flex items-start gap-2">
                                    <span className="text-[10px] font-semibold text-zinc-500 shrink-0 mt-0.5">{l('السبب:', 'Reason:')}</span>
                                    <p className="text-xs text-zinc-400">{entry.reason}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
            <p className="text-[11px] text-zinc-500">
              {l(
                `صفحة ${safePage} من ${totalPages} (${filtered.length} إجراء)`,
                `Page ${safePage} of ${totalPages} (${filtered.length} actions)`
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isRtl ? <ChevronRight className="w-4 h-4 text-zinc-400" /> : <ChevronLeft className="w-4 h-4 text-zinc-400" />}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-zinc-600 text-xs px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-colors ${
                        p === safePage
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isRtl ? <ChevronLeft className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
