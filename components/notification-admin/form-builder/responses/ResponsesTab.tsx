// ResponsesTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Notion/Airtable-style review of every response. Switchable table or card
// view, top toolbar with search/filter/date-range/export, sticky first
// column anchored to the start side, column hide & pin via dropdown.

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search, Download, LayoutGrid, Table as TableIcon, Filter, ChevronDown,
  ArrowUpDown, X, EyeOff, Pin,
} from 'lucide-react';
import type { FormDefinition, FormResponse, FormField, UserRole } from '../../../../types/notification';
import {
  formatAnswer, formatDateTime, getRelativeTime, getInitials, avatarGradient,
  ROLE_LABEL_AR, ROLE_LABEL_EN, ROLE_COLORS, lt, type Locale,
  matchesSearch, matchesDateRange, exportResponsesAsCsv,
} from './responsesUtils';

interface ResponsesTabProps {
  form: FormDefinition;
  responses: FormResponse[];
  locale: Locale;
  onSelectResponse: (response: FormResponse) => void;
}

type ViewMode = 'table' | 'cards';
type SortDir = 'asc' | 'desc';

const ROLE_OPTIONS: { value: UserRole | 'all'; ar: string; en: string }[] = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'parent', ar: 'أولياء الأمور', en: 'Parents' },
  { value: 'student', ar: 'الطلاب', en: 'Students' },
  { value: 'teacher', ar: 'المعلمون', en: 'Teachers' },
  { value: 'admin', ar: 'المسؤولون', en: 'Admins' },
];

export const ResponsesTab: React.FC<ResponsesTabProps> = ({ form, responses, locale, onSelectResponse }) => {
  const reduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<string>('submittedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [showColMenu, setShowColMenu] = useState(false);

  const sortedFields = useMemo(
    () => [...form.fields].sort((a, b) => a.order - b.order),
    [form.fields],
  );

  const filtered = useMemo(() => {
    return responses
      .filter((r) => matchesSearch(r, search))
      .filter((r) => roleFilter === 'all' || r.respondentRole === roleFilter)
      .filter((r) => matchesDateRange(r, dateFrom, dateTo));
  }, [responses, search, roleFilter, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      if (sortField === 'submittedAt') {
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
      } else if (sortField === 'respondentName') {
        aVal = a.respondentName;
        bVal = b.respondentName;
      } else if (sortField === 'role') {
        aVal = a.respondentRole;
        bVal = b.respondentRole;
      } else if (sortField === 'grade') {
        aVal = a.respondentGrade ?? 0;
        bVal = b.respondentGrade ?? 0;
      } else {
        aVal = formatAnswer(a.answers[sortField], locale);
        bVal = formatAnswer(b.answers[sortField], locale);
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDir, locale]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleColHidden = (field: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = search.trim() || roleFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lt(locale, 'بحث بالاسم...', 'Search by name…')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 ps-9 pe-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all outline-none"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 ps-3 pe-9 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 cursor-pointer outline-none"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {locale === 'ar' ? o.ar : o.en}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 outline-none"
          />
          <span className="text-xs font-bold text-slate-300">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 outline-none"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500"
            >
              <X className="w-3 h-3" />
              {lt(locale, 'مسح', 'Clear')}
            </button>
          )}

          <div className="flex-1" />

          {/* Column manager */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              {lt(locale, 'أعمدة', 'Columns')}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showColMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`absolute z-20 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-2 ${locale === 'ar' ? 'start-0' : 'end-0'}`}
                >
                  {sortedFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => toggleColHidden(f.id)}
                      className="w-full text-start px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-700 truncate">{f.label}</span>
                      <span className={`w-3 h-3 rounded-sm border ${hiddenCols.has(f.id) ? 'border-slate-300 bg-white' : 'border-sky-500 bg-sky-500'}`} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
              title={lt(locale, 'جدول', 'Table')}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
              title={lt(locale, 'بطاقات', 'Cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export */}
          <button
            onClick={() => exportResponsesAsCsv(sortedFields, sorted, form.title, locale)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>
            {sorted.length} {lt(locale, 'إجابة', 'responses')}
            {hasActiveFilters && ` (${lt(locale, 'من أصل', 'of')} ${responses.length})`}
          </span>
        </div>
      </div>

      {/* Body */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">
            {lt(locale, 'لا توجد نتائج', 'No matching responses')}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <TableView
          fields={sortedFields}
          responses={sorted}
          hiddenCols={hiddenCols}
          locale={locale}
          sortField={sortField}
          sortDir={sortDir}
          onSort={toggleSort}
          onSelectResponse={onSelectResponse}
        />
      ) : (
        <CardsView
          fields={sortedFields}
          responses={sorted}
          locale={locale}
          onSelectResponse={onSelectResponse}
          reduceMotion={!!reduceMotion}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Table view — sticky first column
// ─────────────────────────────────────────────

const TableView: React.FC<{
  fields: FormField[];
  responses: FormResponse[];
  hiddenCols: Set<string>;
  locale: Locale;
  sortField: string;
  sortDir: SortDir;
  onSort: (field: string) => void;
  onSelectResponse: (r: FormResponse) => void;
}> = ({ fields, responses, hiddenCols, locale, sortField, sortDir, onSort, onSelectResponse }) => {
  const visibleFields = fields.filter((f) => !hiddenCols.has(f.id));
  const stickyClass = locale === 'ar' ? 'sticky right-0 z-10' : 'sticky left-0 z-10';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className={`${stickyClass} bg-slate-50 px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap`}>
                <button onClick={() => onSort('respondentName')} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                  <Pin className="w-3 h-3 text-slate-300" />
                  {lt(locale, 'الاسم', 'Name')}
                  <SortIcon active={sortField === 'respondentName'} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap">
                <button onClick={() => onSort('role')} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                  {lt(locale, 'الدور', 'Role')}
                  <SortIcon active={sortField === 'role'} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap">
                <button onClick={() => onSort('grade')} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                  {lt(locale, 'الصف', 'Grade')}
                  <SortIcon active={sortField === 'grade'} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap">
                <button onClick={() => onSort('submittedAt')} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors">
                  {lt(locale, 'تاريخ الإرسال', 'Submitted')}
                  <SortIcon active={sortField === 'submittedAt'} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap">
                {lt(locale, 'الحالة', 'Status')}
              </th>
              {visibleFields.map((f) => (
                <th key={f.id} className="px-4 py-3 text-start font-bold text-slate-500 whitespace-nowrap">
                  <button onClick={() => onSort(f.id)} className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors max-w-[200px] truncate">
                    {f.label}
                    <SortIcon active={sortField === f.id} dir={sortDir} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, idx) => {
              const ext = r as FormResponse & { isPartial?: boolean };
              const roleLabel = locale === 'ar' ? ROLE_LABEL_AR[r.respondentRole] : ROLE_LABEL_EN[r.respondentRole];
              const roleColor = ROLE_COLORS[r.respondentRole];
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30';
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectResponse(r)}
                  className={`border-b border-slate-100 hover:bg-sky-50/40 transition-colors cursor-pointer ${rowBg}`}
                >
                  <td className={`${stickyClass} ${rowBg} group-hover:bg-sky-50/40 px-4 py-3 whitespace-nowrap`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${avatarGradient(r.respondentName)} flex items-center justify-center shrink-0`}>
                        <span className="text-[10px] font-black text-white">{getInitials(r.respondentName)}</span>
                      </div>
                      <span className="font-bold text-slate-700">{r.respondentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColor.bg} ${roleColor.text}`}>
                      {roleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-500">
                    {r.respondentGrade ? `${r.respondentGrade}` : '—'}
                    {r.respondentSection ? `/${r.respondentSection}` : ''}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-500">
                    {getRelativeTime(r.submittedAt, locale)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {ext.isPartial ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        {lt(locale, 'جزئي', 'Partial')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {lt(locale, 'مكتمل', 'Complete')}
                      </span>
                    )}
                  </td>
                  {visibleFields.map((f) => {
                    const val = r.answers[f.id];
                    const text = formatAnswer(val, locale);
                    return (
                      <td key={f.id} className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap max-w-[200px] truncate">
                        {text === '—' ? <span className="text-slate-300">—</span> : text}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SortIcon: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => (
  <ArrowUpDown className={`w-3 h-3 ${active ? (dir === 'asc' ? 'text-sky-500 rotate-180' : 'text-sky-500') : 'text-slate-300'}`} />
);

// ─────────────────────────────────────────────
// Cards view
// ─────────────────────────────────────────────

const CardsView: React.FC<{
  fields: FormField[];
  responses: FormResponse[];
  locale: Locale;
  onSelectResponse: (r: FormResponse) => void;
  reduceMotion: boolean;
}> = ({ fields, responses, locale, onSelectResponse, reduceMotion }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {responses.map((r, idx) => {
        const previewFields = fields.slice(0, 3);
        const roleLabel = locale === 'ar' ? ROLE_LABEL_AR[r.respondentRole] : ROLE_LABEL_EN[r.respondentRole];
        const roleColor = ROLE_COLORS[r.respondentRole];
        const ext = r as FormResponse & { isPartial?: boolean };
        return (
          <motion.button
            key={r.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : idx * 0.03 }}
            onClick={() => onSelectResponse(r)}
            className="text-start bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(r.respondentName)} flex items-center justify-center shrink-0`}>
                <span className="text-xs font-black text-white">{getInitials(r.respondentName)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 truncate">{r.respondentName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${roleColor.bg} ${roleColor.text}`}>
                    {roleLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {getRelativeTime(r.submittedAt, locale)}
                  </span>
                </div>
              </div>
              {ext.isPartial && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  {lt(locale, 'جزئي', 'Partial')}
                </span>
              )}
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-3">
              {previewFields.map((f) => {
                const text = formatAnswer(r.answers[f.id], locale);
                return (
                  <div key={f.id}>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{f.label}</p>
                    <p className={`text-xs font-bold ${text === '—' ? 'text-slate-300' : 'text-slate-700'} truncate`}>
                      {text}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] font-bold text-sky-600 group-hover:text-sky-700 mt-3 text-center pt-2 border-t border-slate-100">
              {lt(locale, 'عرض الإجابة الكاملة ←', 'View full response →')}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
};
