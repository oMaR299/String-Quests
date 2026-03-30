import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { EXTENDED_STUDENTS, CAMPUSES } from '../../../data/mockAttendanceData';
import type { ExtendedStudent } from '../../../types/admin';

interface StudentSearchBarProps {
  locale: 'ar' | 'en';
  onSelectStudent: (student: ExtendedStudent) => void;
}

const campusMap = new Map(CAMPUSES.map(c => [c.id, c]));

export function StudentSearchBar({ locale, onSelectStudent }: StudentSearchBarProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 200ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter students
  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return EXTENDED_STUDENTS
      .filter(s => s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q))
      .slice(0, 8);
  }, [debouncedQuery]);

  // Open dropdown when results exist
  useEffect(() => {
    setIsOpen(debouncedQuery.length > 0);
  }, [debouncedQuery]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (student: ExtendedStudent) => {
    onSelectStudent(student);
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  };

  const campusBadgeColor = (type: string) => {
    if (type === 'boys') return 'bg-blue-100 text-blue-700';
    if (type === 'girls') return 'bg-pink-100 text-pink-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (debouncedQuery) setIsOpen(true); }}
          placeholder={t('البحث عن طالب...', 'Search for a student...')}
          className="w-full ps-10 pe-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all font-[Cairo]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setDebouncedQuery(''); setIsOpen(false); }}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
          >
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 font-[Cairo]">
                {t('لا توجد نتائج', 'No results found')}
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {results.map(student => {
                  const campus = campusMap.get(student.campusId);
                  const initial = student.name.charAt(0);
                  return (
                    <li key={student.id}>
                      <button
                        onClick={() => handleSelect(student)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-start"
                      >
                        {/* Avatar */}
                        <span className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold font-[Cairo]">
                          {initial}
                        </span>

                        {/* Name + grade */}
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-slate-800 truncate font-[Cairo]">
                            {locale === 'ar' ? student.name : student.nameEn}
                          </span>
                          <span className="block text-xs text-slate-500 font-[Cairo]">
                            {t('الصف', 'Grade')} {student.grade} - {student.section}
                          </span>
                        </span>

                        {/* Campus badge */}
                        {campus && (
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold font-[Cairo] ${campusBadgeColor(campus.type)}`}>
                            {locale === 'ar' ? campus.name.split('(')[0].trim() : campus.nameEn.split('(')[0].trim()}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
