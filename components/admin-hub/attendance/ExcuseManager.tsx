import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, Search, Filter, ChevronDown,
  Paperclip, FileText, X, Check, AlertTriangle, Calendar,
  ShieldCheck, ShieldX, Heart, Plane, BookOpen, HelpCircle,
  ArrowUpDown, ChevronUp,
} from 'lucide-react';
import {
  EXTENDED_STUDENTS, getTodayString,
} from '../../../data/mockAttendanceData';
import type { ExtendedStudent } from '../../../types/admin';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ExcuseReason = 'medical' | 'family' | 'religious' | 'travel' | 'other';

interface ExcuseRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  section: string;
  dates: string[];
  reason: ExcuseReason;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  attachment?: string;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const REASON_CONFIG: Record<ExcuseReason, { ar: string; en: string; color: string; bg: string; ring: string; Icon: React.ElementType }> = {
  medical:  { ar: 'طبي',   en: 'Medical',  color: 'text-sky-400',    bg: 'bg-sky-500/15',    ring: 'ring-sky-500/30',    Icon: Heart },
  family:   { ar: 'عائلي', en: 'Family',   color: 'text-purple-400', bg: 'bg-purple-500/15', ring: 'ring-purple-500/30', Icon: BookOpen },
  religious:{ ar: 'ديني',  en: 'Religious', color: 'text-emerald-400',bg: 'bg-emerald-500/15',ring: 'ring-emerald-500/30',Icon: ShieldCheck },
  travel:   { ar: 'سفر',   en: 'Travel',   color: 'text-amber-400',  bg: 'bg-amber-500/15',  ring: 'ring-amber-500/30',  Icon: Plane },
  other:    { ar: 'أخرى',  en: 'Other',    color: 'text-zinc-400',   bg: 'bg-zinc-500/15',   ring: 'ring-zinc-500/30',   Icon: HelpCircle },
};

const TABS = [
  { id: 'pending' as const, ar: 'طلبات الإعفاء', en: 'Excuse Requests' },
  { id: 'history' as const, ar: 'السجل', en: 'History' },
];
type TabId = typeof TABS[number]['id'];

const t = (locale: 'ar' | 'en', ar: string, en: string) => locale === 'ar' ? ar : en;

const DESCRIPTIONS_AR: Record<ExcuseReason, string[]> = {
  medical: [
    'حالة مرضية تستدعي الراحة بناءً على تقرير الطبيب',
    'موعد طبي في المستشفى لمراجعة دورية',
    'إصابة رياضية تستدعي العلاج والراحة',
  ],
  family: [
    'ظرف عائلي طارئ يستوجب التغيب',
    'حضور مناسبة عائلية مهمة',
  ],
  religious: [
    'أداء مناسك العمرة مع الأسرة',
    'حضور حلقة تحفيظ قرآن كريم',
  ],
  travel: [
    'سفر خارج المملكة لظروف عائلية',
    'سفر مع الأسرة لأغراض علاجية',
  ],
  other: [
    'ظرف خاص يستوجب التغيب عن المدرسة',
    'مشاركة في مسابقة خارجية على مستوى المنطقة',
  ],
};

const MOCK_FILES = ['تقرير_طبي.pdf', 'إفادة_مستشفى.pdf', 'خطاب_رسمي.pdf', 'شهادة_مرضية.jpg'];

// ─────────────────────────────────────────────
// Mock Data Generator
// ─────────────────────────────────────────────

function generateMockExcuses(campusId: string): ExcuseRequest[] {
  const campusStudents = EXTENDED_STUDENTS.filter(s => s.campusId === campusId);
  if (campusStudents.length === 0) return [];

  const reasons: ExcuseReason[] = ['medical', 'family', 'religious', 'travel', 'other'];
  const today = new Date();
  const excuses: ExcuseRequest[] = [];

  // 9 pending excuses
  for (let i = 0; i < 9; i++) {
    const stu = campusStudents[i % campusStudents.length];
    const reason = reasons[i % reasons.length];
    const dayOffset = (i * 3) + 1;
    const absenceDate1 = new Date(today);
    absenceDate1.setDate(absenceDate1.getDate() - dayOffset);
    const dates = [formatDateStr(absenceDate1)];
    if (i % 3 === 0) {
      const absenceDate2 = new Date(absenceDate1);
      absenceDate2.setDate(absenceDate2.getDate() - 1);
      dates.push(formatDateStr(absenceDate2));
    }
    const descs = DESCRIPTIONS_AR[reason];
    const submittedDate = new Date(absenceDate1);
    submittedDate.setDate(submittedDate.getDate() + 1);

    excuses.push({
      id: `exc-p-${i + 1}`,
      studentId: stu.id,
      studentName: stu.name,
      grade: stu.grade,
      section: stu.section,
      dates,
      reason,
      description: descs[i % descs.length],
      submittedBy: stu.parentName || `ولي أمر ${stu.name}`,
      submittedAt: submittedDate.toISOString(),
      status: 'pending',
      attachment: i % 3 === 0 ? MOCK_FILES[i % MOCK_FILES.length] : undefined,
    });
  }

  // 6 processed (history) excuses
  const processedStatuses: ('approved' | 'rejected')[] = ['approved', 'approved', 'rejected', 'approved', 'rejected', 'approved'];
  for (let i = 0; i < 6; i++) {
    const stu = campusStudents[(i + 12) % campusStudents.length];
    const reason = reasons[(i + 2) % reasons.length];
    const dayOffset = 10 + (i * 4);
    const absenceDate = new Date(today);
    absenceDate.setDate(absenceDate.getDate() - dayOffset);
    const dates = [formatDateStr(absenceDate)];
    if (i % 2 === 0) {
      const d2 = new Date(absenceDate);
      d2.setDate(d2.getDate() - 1);
      dates.push(formatDateStr(d2));
    }
    const descs = DESCRIPTIONS_AR[reason];
    const submittedDate = new Date(absenceDate);
    submittedDate.setDate(submittedDate.getDate() + 1);
    const processedDate = new Date(submittedDate);
    processedDate.setDate(processedDate.getDate() + 1);

    excuses.push({
      id: `exc-h-${i + 1}`,
      studentId: stu.id,
      studentName: stu.name,
      grade: stu.grade,
      section: stu.section,
      dates,
      reason,
      description: descs[i % descs.length],
      submittedBy: stu.parentName || `ولي أمر ${stu.name}`,
      submittedAt: submittedDate.toISOString(),
      status: processedStatuses[i],
      attachment: i % 4 === 0 ? MOCK_FILES[i % MOCK_FILES.length] : undefined,
      processedBy: 'د. عبدالله العمر',
      processedAt: processedDate.toISOString(),
      rejectionReason: processedStatuses[i] === 'rejected' ? 'لم يتم تقديم مستندات داعمة كافية' : undefined,
    });
  }

  return excuses;
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function avatarGradient(name: string): string {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium"
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      <Check className="w-4 h-4" />
      {message}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Reject Modal
// ─────────────────────────────────────────────

function RejectModal({
  studentName, locale, onConfirm, onCancel,
}: {
  studentName: string;
  locale: 'ar' | 'en';
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const l = (ar: string, en: string) => t(locale, ar, en);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[111] bg-white rounded-2xl shadow-2xl max-w-md w-[90vw] p-6"
        style={{ fontFamily: 'Cairo, sans-serif' }}
        dir="rtl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {l('رفض الإعفاء', 'Reject Excuse')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {l(`سيتم رفض طلب الإعفاء المقدم للطالب "${studentName}". يرجى تحديد سبب الرفض.`,
             `The excuse request for "${studentName}" will be rejected. Please provide a reason.`)}
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder={l('اكتب سبب الرفض...', 'Enter rejection reason...')}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 mb-4 placeholder:text-gray-400 resize-none h-24"
          dir="rtl"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
            {l('إلغاء', 'Cancel')}
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || l('لم يتم تقديم سبب', 'No reason provided'))}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md"
          >
            {l('تأكيد الرفض', 'Confirm Reject')}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────
// Stats Card
// ─────────────────────────────────────────────

function StatCard({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: React.ElementType }) {
  const colorMap: Record<string, { bg: string; text: string; ring: string; iconBg: string }> = {
    orange:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   ring: 'ring-amber-500/20',   iconBg: 'bg-amber-500/20' },
    green:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20', iconBg: 'bg-emerald-500/20' },
    red:     { bg: 'bg-rose-500/10',    text: 'text-rose-400',    ring: 'ring-rose-500/20',    iconBg: 'bg-rose-500/20' },
    blue:    { bg: 'bg-sky-500/10',     text: 'text-sky-400',     ring: 'ring-sky-500/20',     iconBg: 'bg-sky-500/20' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`${c.bg} ${c.ring} ring-1 rounded-xl p-4 flex items-center gap-3`}
    >
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-xs text-zinc-400 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ExcuseManagerProps {
  locale: 'ar' | 'en';
  campusId: string;
}

export function ExcuseManager({ locale, campusId }: ExcuseManagerProps) {
  const l = useCallback((ar: string, en: string) => t(locale, ar, en), [locale]);
  const isRtl = locale === 'ar';

  // ── State ──
  const [excuses, setExcuses] = useState<ExcuseRequest[]>(() => generateMockExcuses(campusId));
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ExcuseRequest | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [sortField, setSortField] = useState<'date' | 'student' | 'reason'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Derived ──
  const pending = useMemo(() => excuses.filter(e => e.status === 'pending'), [excuses]);
  const processed = useMemo(() => {
    let list = excuses.filter(e => e.status !== 'pending');
    if (historyFilter !== 'all') list = list.filter(e => e.status === historyFilter);
    if (historySearch.trim()) {
      const q = historySearch.trim().toLowerCase();
      list = list.filter(e => e.studentName.toLowerCase().includes(q) || e.submittedBy.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortField === 'date') {
        const da = new Date(a.processedAt || a.submittedAt).getTime();
        const db = new Date(b.processedAt || b.submittedAt).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
      if (sortField === 'student') {
        return sortDir === 'asc' ? a.studentName.localeCompare(b.studentName, 'ar') : b.studentName.localeCompare(a.studentName, 'ar');
      }
      return sortDir === 'asc' ? a.reason.localeCompare(b.reason) : b.reason.localeCompare(a.reason);
    });
    return list;
  }, [excuses, historyFilter, historySearch, sortField, sortDir]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const approvedMonth = excuses.filter(e => e.status === 'approved' && e.processedAt?.startsWith(thisMonth)).length;
    const rejectedMonth = excuses.filter(e => e.status === 'rejected' && e.processedAt?.startsWith(thisMonth)).length;
    const totalDays = excuses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.dates.length, 0);
    return { pending: pending.length, approvedMonth, rejectedMonth, totalDays };
  }, [excuses, pending]);

  // ── Actions ──
  const handleApprove = useCallback((id: string) => {
    setExcuses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'approved' as const,
      processedBy: 'د. عبدالله العمر',
      processedAt: new Date().toISOString(),
    } : e));
    setToastMsg(l('تم قبول الإعفاء', 'Excuse approved'));
  }, [l]);

  const handleReject = useCallback((id: string, reason: string) => {
    setExcuses(prev => prev.map(e => e.id === id ? {
      ...e,
      status: 'rejected' as const,
      processedBy: 'د. عبدالله العمر',
      processedAt: new Date().toISOString(),
      rejectionReason: reason,
    } : e));
    setRejectTarget(null);
    setToastMsg(l('تم رفض الإعفاء', 'Excuse rejected'));
  }, [l]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // ── Render ──
  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, sans-serif' }}>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label={l('قيد الانتظار', 'Pending')} value={stats.pending} color="orange" Icon={Clock} />
        <StatCard label={l('مقبول هذا الشهر', 'Approved this month')} value={stats.approvedMonth} color="green" Icon={CheckCircle2} />
        <StatCard label={l('مرفوض هذا الشهر', 'Rejected this month')} value={stats.rejectedMonth} color="red" Icon={XCircle} />
        <StatCard label={l('إجمالي أيام الإعفاء', 'Total excused days')} value={stats.totalDays} color="blue" Icon={Calendar} />
      </div>

      {/* Tab Switcher */}
      <div className="relative flex border-b border-white/[0.08]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t(locale, tab.ar, tab.en)}
            {tab.id === 'pending' && pending.length > 0 && (
              <span className="mr-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {pending.length}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="excuse-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'pending' ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <ShieldCheck className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                <p className="text-zinc-400 font-medium">{l('لا توجد طلبات إعفاء معلقة', 'No pending excuse requests')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pending.map((exc, idx) => {
                  const rc = REASON_CONFIG[exc.reason];
                  return (
                    <motion.div
                      key={exc.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 space-y-4 hover:border-white/[0.14] transition-colors"
                    >
                      {/* Header: Avatar + Student Info + Reason Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(exc.studentName)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
                            {exc.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{exc.studentName}</p>
                            <p className="text-xs text-zinc-500">
                              {l(`الصف ${exc.grade} - ${exc.section}`, `Grade ${exc.grade} - ${exc.section}`)}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ring-1 ${rc.bg} ${rc.color} ${rc.ring}`}>
                          <rc.Icon className="w-3 h-3" />
                          {t(locale, rc.ar, rc.en)}
                        </span>
                      </div>

                      {/* Absence Dates */}
                      <div className="flex flex-wrap gap-1.5">
                        {exc.dates.map(d => (
                          <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25 text-[11px] font-medium">
                            <Calendar className="w-3 h-3" />
                            {formatDisplayDate(d, locale)}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-300 leading-relaxed">{exc.description}</p>

                      {/* Submitted By + Attachment */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{l('بواسطة:', 'By:')} {exc.submittedBy} &middot; {formatTimestamp(exc.submittedAt, locale)}</span>
                        {exc.attachment && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Paperclip className="w-3 h-3" />
                            {exc.attachment}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(exc.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {l('قبول', 'Approve')}
                        </button>
                        <button
                          onClick={() => setRejectTarget(exc)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {l('رفض', 'Reject')}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  placeholder={l('بحث بالاسم...', 'Search by name...')}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg ps-9 pe-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(p => !p)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 hover:bg-white/[0.08] transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {historyFilter === 'all' ? l('الكل', 'All') : historyFilter === 'approved' ? l('مقبول', 'Approved') : l('مرفوض', 'Rejected')}
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1 end-0 bg-[#1a1a22] border border-white/[0.1] rounded-xl shadow-2xl z-30 py-1 min-w-[140px]"
                    >
                      {(['all', 'approved', 'rejected'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => { setHistoryFilter(f); setFilterOpen(false); }}
                          className={`w-full text-start px-4 py-2 text-xs font-medium transition-colors ${
                            historyFilter === f ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          {f === 'all' ? l('الكل', 'All') : f === 'approved' ? l('مقبول', 'Approved') : l('مرفوض', 'Rejected')}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* History Table */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      {[
                        { key: 'student' as const, ar: 'الطالب', en: 'Student' },
                        { key: 'date' as const, ar: 'التواريخ', en: 'Dates' },
                        { key: 'reason' as const, ar: 'السبب', en: 'Reason' },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          className="px-4 py-3 text-start text-zinc-400 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <span className="inline-flex items-center gap-1">
                            {t(locale, col.ar, col.en)}
                            <ArrowUpDown className={`w-3 h-3 ${sortField === col.key ? 'text-purple-400' : 'text-zinc-600'}`} />
                          </span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('الحالة', 'Status')}</th>
                      <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('بواسطة', 'By')}</th>
                      <th className="px-4 py-3 text-start text-zinc-400 font-semibold">{l('التاريخ', 'Date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processed.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-zinc-500 font-medium">
                          {l('لا توجد نتائج', 'No results')}
                        </td>
                      </tr>
                    ) : processed.map(exc => {
                      const rc = REASON_CONFIG[exc.reason];
                      return (
                        <tr key={exc.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient(exc.studentName)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                {exc.studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{exc.studentName}</p>
                                <p className="text-zinc-500 text-[10px]">{l(`الصف ${exc.grade}`, `Grade ${exc.grade}`)} - {exc.section}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {exc.dates.map(d => (
                                <span key={d} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 text-[10px]">
                                  {formatDisplayDate(d, locale)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ${rc.bg} ${rc.color} ${rc.ring}`}>
                              <rc.Icon className="w-2.5 h-2.5" />
                              {t(locale, rc.ar, rc.en)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {exc.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25 text-[10px] font-semibold">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {l('مقبول', 'Approved')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/25 text-[10px] font-semibold">
                                <XCircle className="w-2.5 h-2.5" />
                                {l('مرفوض', 'Rejected')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400">{exc.processedBy || '—'}</td>
                          <td className="px-4 py-3 text-zinc-500">{exc.processedAt ? formatTimestamp(exc.processedAt, locale) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            studentName={rejectTarget.studentName}
            locale={locale}
            onConfirm={(reason) => handleReject(rejectTarget.id, reason)}
            onCancel={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>
    </div>
  );
}
