import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, XCircle, Clock, Upload, Download, FileSpreadsheet,
  AlertTriangle, ChevronDown, Check, Search, Building2, Users,
  FileUp, Trash2, Filter,
} from 'lucide-react';
import {
  CAMPUSES, EXTENDED_STUDENTS, ATTENDANCE_RECORDS, getTodayString,
} from '../../../data/mockAttendanceData';
import type { AttendanceStatus, ExtendedStudent, AttendanceRecord } from '../../../types/admin';

// ─────────────────────────────────────────────
// Props & Helpers
// ─────────────────────────────────────────────

interface BulkActionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  locale: 'ar' | 'en';
}

const t = (locale: 'ar' | 'en', ar: string, en: string) => locale === 'ar' ? ar : en;

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; labelEn: string; color: string; bg: string; ring: string; Icon: React.ElementType }> = {
  present: { label: 'حاضر', labelEn: 'Present', color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/40', Icon: CheckCircle2 },
  absent:  { label: 'غائب', labelEn: 'Absent',  color: 'text-rose-400',    bg: 'bg-rose-500/15',    ring: 'ring-rose-500/40',    Icon: XCircle },
  late:    { label: 'متأخر', labelEn: 'Late',   color: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/40',   Icon: Clock },
};

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

const TABS = [
  { id: 'bulk-mark' as const, ar: 'تسجيل جماعي', en: 'Bulk Mark' },
  { id: 'bulk-override' as const, ar: 'تعديل جماعي', en: 'Bulk Override' },
  { id: 'import-export' as const, ar: 'استيراد / تصدير', en: 'Import/Export' },
];
type TabId = typeof TABS[number]['id'];

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 2200)}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-2"
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      <CheckCircle2 className="w-5 h-5" />
      {message}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Confirmation Dialog
// ─────────────────────────────────────────────

function ConfirmDialog({
  title, message, requireInput, matchValue, confirmLabel, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  requireInput?: boolean;
  matchValue?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [inputVal, setInputVal] = useState('');
  const canConfirm = requireInput ? inputVal.trim() === matchValue?.trim() : true;

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
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{message}</p>
        {requireInput && (
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={matchValue}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 mb-4 placeholder:text-gray-300"
            dir="rtl"
          />
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Bulk Mark
// ─────────────────────────────────────────────

function BulkMarkTab({ locale }: { locale: 'ar' | 'en' }) {
  const l = (ar: string, en: string) => t(locale, ar, en);
  const [campusId, setCampusId] = useState('all');
  const [grade, setGrade] = useState<number | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayString());
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');

  // Determine available grades for selected campus
  const availableGrades = useMemo(() => {
    if (campusId === 'all') return GRADES;
    const camp = CAMPUSES.find(c => c.id === campusId);
    if (!camp) return GRADES;
    if (camp.type === 'boys' || camp.type === 'girls') return GRADES.slice(0, 6);
    return GRADES.slice(6); // international: 7-12
  }, [campusId]);

  const availableSections = useMemo(() => {
    if (campusId === 'all') return SECTIONS;
    const camp = CAMPUSES.find(c => c.id === campusId);
    if (!camp) return SECTIONS;
    if (camp.type === 'international') return SECTIONS.slice(0, 4);
    return SECTIONS;
  }, [campusId]);

  // When campus changes, reset grade/section if invalid
  const handleCampusChange = (id: string) => {
    setCampusId(id);
    setGrade(null);
    setSection(null);
  };

  // Scope calculation
  const scopeStudents = useMemo(() => {
    return EXTENDED_STUDENTS.filter(s => {
      if (campusId !== 'all' && s.campusId !== campusId) return false;
      if (grade !== null && s.grade !== grade) return false;
      if (section !== null && s.section !== section) return false;
      return true;
    });
  }, [campusId, grade, section]);

  const affectedClasses = useMemo(() => {
    const keys = new Set<string>();
    scopeStudents.forEach(s => keys.add(`${s.campusId}-${s.grade}-${s.section}`));
    return keys.size;
  }, [scopeStudents]);

  const isCampusWide = campusId !== 'all' && grade === null && section === null;
  const isValid = status !== null && reason.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    setConfirm(true);
  };

  const handleConfirm = () => {
    console.log('[BulkMark] Applied:', {
      campusId, grade, section, date, status, reason,
      students: scopeStudents.length, classes: affectedClasses,
    });
    setConfirm(false);
    setToast(l(
      `تم تعديل ${scopeStudents.length} سجل بنجاح`,
      `Successfully modified ${scopeStudents.length} records`
    ));
    // Reset
    setStatus(null);
    setReason('');
  };

  const campusName = campusId !== 'all' ? CAMPUSES.find(c => c.id === campusId)?.name || '' : '';

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
      {/* Step 1: Scope Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{l('نطاق التسجيل', 'Scope')}</h3>

        {/* Campus */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('المبنى', 'Campus')}</label>
          <select
            value={campusId}
            onChange={e => handleCampusChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
          >
            <option value="all">{l('جميع المباني', 'All Campuses')}</option>
            {CAMPUSES.map(c => (
              <option key={c.id} value={c.id}>{locale === 'ar' ? c.name : c.nameEn}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('الصف', 'Grade')}</label>
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setGrade(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                grade === null ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {l('الكل', 'All')}
            </motion.button>
            {availableGrades.map(g => (
              <motion.button
                key={g}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setGrade(g); setSection(null); }}
                className={`w-9 h-8 rounded-lg text-xs font-bold transition-all ${
                  grade === g ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {g}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Section */}
        <AnimatePresence>
          {grade !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('الشعبة', 'Section')}</label>
              <div className="flex gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSection(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    section === null ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {l('الكل', 'All')}
                </motion.button>
                {availableSections.map(sec => (
                  <motion.button
                    key={sec}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSection(sec)}
                    className={`w-9 h-8 rounded-lg text-xs font-bold transition-all ${
                      section === sec ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {sec}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Affected classes badge */}
        <motion.div
          key={`${campusId}-${grade}-${section}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2"
        >
          <Building2 className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-bold text-violet-700">
            {l('الفصول المتأثرة:', 'Affected classes:')} {affectedClasses}
          </span>
          <span className="text-xs text-violet-500 mr-auto">
            ({scopeStudents.length} {l('طالب', 'students')})
          </span>
        </motion.div>
      </div>

      {/* Step 2: Date */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('التاريخ', 'Date')}</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
        />
      </div>

      {/* Step 3: Status */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('الحالة', 'Status')}</label>
        <div className="grid grid-cols-3 gap-2">
          {(['present', 'absent', 'late'] as AttendanceStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const selected = status === s;
            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatus(s)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                  selected
                    ? `${cfg.bg} ${cfg.color} border-current shadow-md`
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <cfg.Icon className="w-6 h-6" />
                {locale === 'ar' ? cfg.label : cfg.labelEn}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 4: Reason */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l('السبب', 'Reason')} <span className="text-rose-400">*</span></label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder={l('سبب التعديل...', 'Reason for modification...')}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-300 resize-none placeholder:text-gray-300"
          dir="rtl"
        />
      </div>

      {/* Step 5: Preview */}
      <motion.div
        key={`preview-${scopeStudents.length}-${status}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.35 }}
        className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-bold text-violet-800">{l('معاينة', 'Preview')}</span>
        </div>
        <p className="text-sm text-violet-700 leading-relaxed">
          {l(
            `سيتم تعديل ${scopeStudents.length} سجل لـ ${scopeStudents.length} طالب في ${affectedClasses} فصل`,
            `Will modify ${scopeStudents.length} records for ${scopeStudents.length} students across ${affectedClasses} classes`
          )}
        </p>
        {status && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-violet-500">{l('الحالة الجديدة:', 'New status:')}</span>
            <span className={`text-xs font-bold ${STATUS_CONFIG[status].color}`}>
              {locale === 'ar' ? STATUS_CONFIG[status].label : STATUS_CONFIG[status].labelEn}
            </span>
          </div>
        )}
      </motion.div>

      {/* Step 6: Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
      >
        {l('تطبيق', 'Apply')}
      </button>

      {/* Confirmation */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            title={l('تأكيد الإجراء', 'Confirm Action')}
            message={
              isCampusWide
                ? l('هذا إجراء واسع النطاق. اكتب اسم المبنى للتأكيد:', 'This is a wide-scope action. Type the campus name to confirm:')
                : l(`هل أنت متأكد من تعديل ${scopeStudents.length} سجل؟`, `Are you sure you want to modify ${scopeStudents.length} records?`)
            }
            requireInput={isCampusWide}
            matchValue={campusName}
            confirmLabel={l('تأكيد', 'Confirm')}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Bulk Override
// ─────────────────────────────────────────────

function BulkOverrideTab({ locale }: { locale: 'ar' | 'en' }) {
  const l = (ar: string, en: string) => t(locale, ar, en);
  const [dateFrom, setDateFrom] = useState(getTodayString());
  const [dateTo, setDateTo] = useState(getTodayString());
  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [overrideReason, setOverrideReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');

  // Build a lookup for student info
  const studentMap = useMemo(() => {
    const m = new Map<string, ExtendedStudent>();
    EXTENDED_STUDENTS.forEach(s => m.set(s.id, s));
    return m;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return ATTENDANCE_RECORDS.filter(r => {
      if (r.date < dateFrom || r.date > dateTo) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      const stu = studentMap.get(r.studentId);
      if (!stu) return false;
      if (filterGrade !== null && stu.grade !== filterGrade) return false;
      if (filterSection !== null && stu.section !== filterSection) return false;
      return true;
    }).slice(0, 200); // Cap at 200 for performance
  }, [dateFrom, dateTo, filterGrade, filterSection, filterStatus, studentMap]);

  const recordKey = (r: AttendanceRecord) => `${r.studentId}-${r.date}`;

  const toggleSelect = (r: AttendanceRecord) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const k = recordKey(r);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map(recordKey)));
    }
  };

  const handleOverride = () => {
    if (selectedIds.size === 0 || !overrideReason.trim()) return;
    setConfirm(true);
  };

  const handleConfirm = () => {
    console.log('[BulkOverride] Applied:', {
      selectedCount: selectedIds.size, newStatus, reason: overrideReason,
    });
    setConfirm(false);
    setToast(l(`تم تعديل ${selectedIds.size} سجل بنجاح`, `Successfully modified ${selectedIds.size} records`));
    setSelectedIds(new Set());
    setOverrideReason('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-gray-400 block mb-0.5">{l('من', 'From')}</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-bold text-gray-400 block mb-0.5">{l('إلى', 'To')}</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterGrade ?? ''} onChange={e => setFilterGrade(e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300">
            <option value="">{l('كل الصفوف', 'All Grades')}</option>
            {GRADES.map(g => <option key={g} value={g}>{l('الصف', 'Grade')} {g}</option>)}
          </select>
          <select value={filterSection ?? ''} onChange={e => setFilterSection(e.target.value || null)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300">
            <option value="">{l('كل الشعب', 'All Sections')}</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AttendanceStatus | 'all')}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300">
            <option value="all">{l('كل الحالات', 'All Statuses')}</option>
            <option value="present">{l('حاضر', 'Present')}</option>
            <option value="absent">{l('غائب', 'Absent')}</option>
            <option value="late">{l('متأخر', 'Late')}</option>
          </select>
        </div>
        <p className="text-[10px] text-gray-400 font-semibold">{filteredRecords.length} {l('نتيجة', 'results')}</p>
      </div>

      {/* Results table */}
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
            {l('لا توجد نتائج', 'No results')}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="py-2 px-1 text-right w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-300"
                  />
                </th>
                <th className="py-2 px-1 text-right font-semibold">{l('الطالب', 'Student')}</th>
                <th className="py-2 px-1 text-right font-semibold">{l('التاريخ', 'Date')}</th>
                <th className="py-2 px-1 text-right font-semibold">{l('الحالة', 'Status')}</th>
                <th className="py-2 px-1 text-right font-semibold">{l('الصف', 'Class')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => {
                const stu = studentMap.get(r.studentId);
                const k = recordKey(r);
                const sel = selectedIds.has(k);
                const cfg = STATUS_CONFIG[r.status];
                return (
                  <tr
                    key={k + '-' + i}
                    onClick={() => toggleSelect(r)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${sel ? 'bg-violet-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-2 px-1">
                      <input type="checkbox" checked={sel} readOnly className="rounded border-gray-300 text-violet-600 focus:ring-violet-300 pointer-events-none" />
                    </td>
                    <td className="py-2 px-1 font-semibold text-gray-800 truncate max-w-[120px]">{stu?.name ?? r.studentId}</td>
                    <td className="py-2 px-1 text-gray-500 font-mono">{r.date}</td>
                    <td className="py-2 px-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                        <cfg.Icon className="w-3 h-3" />
                        {locale === 'ar' ? cfg.label : cfg.labelEn}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-gray-500">{stu ? `${stu.grade}${stu.section}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Override controls (sticky bottom) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="border-t border-gray-200 bg-white px-5 py-3 space-y-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {selectedIds.size} {l('سجل محدد', 'records selected')}
              </span>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-gray-600">
                {l('إلغاء التحديد', 'Clear')}
              </button>
            </div>
            <div className="flex gap-2">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as AttendanceStatus)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-violet-300 flex-shrink-0">
                <option value="present">{l('حاضر', 'Present')}</option>
                <option value="absent">{l('غائب', 'Absent')}</option>
                <option value="late">{l('متأخر', 'Late')}</option>
              </select>
              <input
                type="text"
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder={l('سبب التعديل...', 'Reason...')}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-violet-300 placeholder:text-gray-300"
                dir="rtl"
              />
            </div>
            <button
              onClick={handleOverride}
              disabled={!overrideReason.trim()}
              className="w-full py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
            >
              {l('تطبيق التعديل', 'Apply Override')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            title={l('تأكيد التعديل', 'Confirm Override')}
            message={l(`سيتم تعديل ${selectedIds.size} سجل. هل أنت متأكد؟`, `${selectedIds.size} records will be modified. Are you sure?`)}
            confirmLabel={l('تأكيد', 'Confirm')}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Import / Export
// ─────────────────────────────────────────────

function ImportExportTab({ locale }: { locale: 'ar' | 'en' }) {
  const l = (ar: string, en: string) => t(locale, ar, en);
  const [exportDateFrom, setExportDateFrom] = useState(getTodayString());
  const [exportDateTo, setExportDateTo] = useState(getTodayString());
  const [exportGrade, setExportGrade] = useState<number | null>(null);
  const [exportSection, setExportSection] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

  // Import state
  const [dragOver, setDragOver] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{ rows: string[][]; errors: number[] } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentMap = useMemo(() => {
    const m = new Map<string, ExtendedStudent>();
    EXTENDED_STUDENTS.forEach(s => m.set(s.id, s));
    return m;
  }, []);

  // CSV template headers
  const CSV_HEADERS = ['student_id', 'date', 'status', 'late_time', 'reason'];

  const downloadTemplate = () => {
    const header = CSV_HEADERS.join(',');
    const sample = 'stu-1,2026-03-30,present,,\nstu-2,2026-03-30,absent,,sick leave';
    const blob = new Blob([header + '\n' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const filtered = ATTENDANCE_RECORDS.filter(r => {
      if (r.date < exportDateFrom || r.date > exportDateTo) return false;
      const stu = studentMap.get(r.studentId);
      if (!stu) return false;
      if (exportGrade !== null && stu.grade !== exportGrade) return false;
      if (exportSection !== null && stu.section !== exportSection) return false;
      return true;
    });

    const header = ['student_id', 'student_name', 'grade', 'section', 'date', 'status', 'late_time', 'marked_by'];
    const rows = filtered.map(r => {
      const stu = studentMap.get(r.studentId);
      return [r.studentId, stu?.name ?? '', String(stu?.grade ?? ''), stu?.section ?? '', r.date, r.status, r.lateTime ?? '', r.markedBy].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM for Arabic support
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${exportDateFrom}_${exportDateTo}.${exportFormat === 'csv' ? 'csv' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(l('تم تصدير البيانات بنجاح', 'Data exported successfully'));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const dataRows = lines.slice(1); // skip header
      const parsed = dataRows.map(line => line.split(',').map(c => c.trim()));
      // Validate: check student_id exists and status is valid
      const errors: number[] = [];
      parsed.forEach((row, i) => {
        const [studentId, date, status] = row;
        if (!studentMap.has(studentId)) errors.push(i);
        else if (!['present', 'absent', 'late'].includes(status)) errors.push(i);
        else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(i);
      });
      setImportPreview({ rows: parsed, errors });
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importPreview) return;
    setConfirm(true);
  };

  const confirmImport = () => {
    const validRows = importPreview!.rows.filter((_, i) => !importPreview!.errors.includes(i));
    console.log('[Import] Applied:', { totalRows: importPreview!.rows.length, validRows: validRows.length, errors: importPreview!.errors.length });
    setConfirm(false);
    setToast(l(`تم استيراد ${validRows.length} سجل بنجاح`, `Successfully imported ${validRows.length} records`));
    setImportFile(null);
    setImportPreview(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
      {/* ── Export Section ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-gray-800">{l('تصدير البيانات', 'Export Data')}</h3>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">{l('من', 'From')}</label>
              <input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 block mb-0.5">{l('إلى', 'To')}</label>
              <input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300" />
            </div>
          </div>
          <div className="flex gap-2">
            <select value={exportGrade ?? ''} onChange={e => setExportGrade(e.target.value ? Number(e.target.value) : null)}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300">
              <option value="">{l('كل الصفوف', 'All Grades')}</option>
              {GRADES.map(g => <option key={g} value={g}>{l('الصف', 'Grade')} {g}</option>)}
            </select>
            <select value={exportSection ?? ''} onChange={e => setExportSection(e.target.value || null)}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-violet-300">
              <option value="">{l('كل الشعب', 'All Sections')}</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Format radio */}
          <div className="flex gap-3">
            {(['csv', 'excel'] as const).map(fmt => (
              <label key={fmt} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="export-format" value={fmt} checked={exportFormat === fmt}
                  onChange={() => setExportFormat(fmt)}
                  className="text-violet-600 focus:ring-violet-300" />
                <span className="text-xs font-semibold text-gray-600 uppercase">{fmt}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={downloadTemplate}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {l('تحميل القالب', 'Download Template')}
            </button>
            <button onClick={exportData}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md">
              <Download className="w-3.5 h-3.5" />
              {l('تصدير البيانات', 'Export Data')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Import Section ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-gray-800">{l('استيراد البيانات', 'Import Data')}</h3>
        </div>

        {/* Template link */}
        <button onClick={downloadTemplate} className="text-xs font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2">
          {l('تحميل القالب', 'Download Template')}
        </button>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-violet-400 bg-violet-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-violet-500' : 'text-gray-300'}`} />
          <p className="text-sm font-semibold text-gray-500">{l('اسحب ملف CSV هنا', 'Drag CSV file here')}</p>
          <p className="text-[10px] text-gray-400 mt-1">{l('أو انقر للاختيار', 'or click to browse')}</p>
        </div>

        {/* Validation Preview */}
        <AnimatePresence>
          {importPreview && importFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Summary */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700">
                    {importPreview.rows.length} {l('صف', 'rows')}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className={`text-xs font-bold ${importPreview.errors.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {importPreview.errors.length} {l('خطأ', 'errors')}
                  </span>
                </div>
                <button onClick={() => { setImportFile(null); setImportPreview(null); }}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      {CSV_HEADERS.map(h => (
                        <th key={h} className="py-1.5 px-2 text-right font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.slice(0, 5).map((row, i) => {
                      const isError = importPreview.errors.includes(i);
                      return (
                        <tr key={i} className={`border-b border-gray-50 ${isError ? 'bg-rose-50' : ''}`}>
                          {row.slice(0, 5).map((cell, j) => (
                            <td key={j} className={`py-1.5 px-2 ${isError ? 'text-rose-600 font-semibold' : 'text-gray-600'}`}>{cell || '—'}</td>
                          ))}
                          {/* Pad if row is short */}
                          {row.length < 5 && Array.from({ length: 5 - row.length }).map((_, j) => (
                            <td key={`pad-${j}`} className="py-1.5 px-2 text-gray-300">—</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {importPreview.rows.length > 5 && (
                <p className="text-center text-[10px] text-gray-400 py-1.5">
                  +{importPreview.rows.length - 5} {l('صفوف أخرى', 'more rows')}
                </p>
              )}

              {/* Import button */}
              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  onClick={handleImport}
                  disabled={importPreview.rows.length === 0 || importPreview.errors.length === importPreview.rows.length}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                >
                  {l('استيراد', 'Import')} ({importPreview.rows.length - importPreview.errors.length} {l('صف صالح', 'valid rows')})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation */}
      <AnimatePresence>
        {confirm && importPreview && (
          <ConfirmDialog
            title={l('تأكيد الاستيراد', 'Confirm Import')}
            message={l(
              `سيتم استيراد ${importPreview.rows.length - importPreview.errors.length} سجل. هل أنت متأكد؟`,
              `${importPreview.rows.length - importPreview.errors.length} records will be imported. Are you sure?`
            )}
            confirmLabel={l('استيراد', 'Import')}
            onConfirm={confirmImport}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────

export function BulkActionsPanel({ isOpen, onClose, locale }: BulkActionsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('bulk-mark');
  const isRtl = locale === 'ar';
  const l = (ar: string, en: string) => t(locale, ar, en);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bulk-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
          />

          {/* Panel — slide from end */}
          <motion.div
            key="bulk-panel"
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed top-0 ${isRtl ? 'start-0' : 'end-0'} h-full w-full max-w-xl bg-white shadow-2xl z-[90] flex flex-col`}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                {l('إجراءات جماعية', 'Bulk Actions')}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="px-5 pt-3 pb-1 border-b border-gray-100">
              <div className="relative flex bg-gray-100 rounded-xl p-1">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
                        isActive ? 'text-violet-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="bulk-tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        />
                      )}
                      <span className="relative z-10">{locale === 'ar' ? tab.ar : tab.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {activeTab === 'bulk-mark' && <BulkMarkTab locale={locale} />}
                {activeTab === 'bulk-override' && <BulkOverrideTab locale={locale} />}
                {activeTab === 'import-export' && <ImportExportTab locale={locale} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BulkActionsPanel;
