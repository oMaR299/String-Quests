import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Filter, ChevronDown, Trash2, Copy, Save, BookmarkCheck } from 'lucide-react';
import { CAMPUSES, EXTENDED_STUDENTS } from '../../../data/mockAttendanceData';

// --- Types ---

export type FilterField = 'grade' | 'section' | 'campus' | 'attendance' | 'absences' | 'lateCount' | 'status' | 'role';
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
export type FilterCombinator = 'AND' | 'OR';

export interface FilterCondition {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface FilterGroup {
  combinator: FilterCombinator;
  conditions: FilterCondition[];
}

export interface SavedFilter {
  id: string;
  name: string;
  group: FilterGroup;
}

// --- Field Config ---

interface FieldConfig {
  label: string;
  labelEn: string;
  type: 'number' | 'select' | 'multiselect';
  operators: { op: FilterOperator; label: string; labelEn: string }[];
  options?: { value: string; label: string }[];
}

const FIELD_CONFIG: Record<FilterField, FieldConfig> = {
  grade: {
    label: 'الصف', labelEn: 'Grade', type: 'select',
    operators: [
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
      { op: 'neq', label: 'لا يساوي', labelEn: 'not equals' },
      { op: 'in', label: 'أحد', labelEn: 'is one of' },
    ],
    options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `الصف ${i + 1}` })),
  },
  section: {
    label: 'الشعبة', labelEn: 'Section', type: 'select',
    operators: [
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
      { op: 'neq', label: 'لا يساوي', labelEn: 'not equals' },
      { op: 'in', label: 'أحد', labelEn: 'is one of' },
    ],
    options: ['A', 'B', 'C', 'D', 'E', 'F'].map(s => ({ value: s, label: `شعبة ${s}` })),
  },
  campus: {
    label: 'المبنى', labelEn: 'Campus', type: 'select',
    operators: [
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
      { op: 'neq', label: 'لا يساوي', labelEn: 'not equals' },
    ],
    options: CAMPUSES.map(c => ({ value: c.id, label: c.name })),
  },
  attendance: {
    label: 'نسبة الحضور %', labelEn: 'Attendance %', type: 'number',
    operators: [
      { op: 'gt', label: 'أكبر من', labelEn: 'greater than' },
      { op: 'gte', label: 'أكبر أو يساوي', labelEn: 'greater or equal' },
      { op: 'lt', label: 'أقل من', labelEn: 'less than' },
      { op: 'lte', label: 'أقل أو يساوي', labelEn: 'less or equal' },
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
    ],
  },
  absences: {
    label: 'عدد أيام الغياب', labelEn: 'Absent Days', type: 'number',
    operators: [
      { op: 'gt', label: 'أكبر من', labelEn: 'greater than' },
      { op: 'gte', label: 'أكبر أو يساوي', labelEn: 'greater or equal' },
      { op: 'lt', label: 'أقل من', labelEn: 'less than' },
      { op: 'lte', label: 'أقل أو يساوي', labelEn: 'less or equal' },
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
    ],
  },
  lateCount: {
    label: 'عدد مرات التأخر', labelEn: 'Late Count', type: 'number',
    operators: [
      { op: 'gt', label: 'أكبر من', labelEn: 'greater than' },
      { op: 'gte', label: 'أكبر أو يساوي', labelEn: 'greater or equal' },
      { op: 'lt', label: 'أقل من', labelEn: 'less than' },
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
    ],
  },
  status: {
    label: 'حالة اليوم', labelEn: 'Today\'s Status', type: 'select',
    operators: [
      { op: 'eq', label: 'يساوي', labelEn: 'equals' },
      { op: 'neq', label: 'لا يساوي', labelEn: 'not equals' },
    ],
    options: [
      { value: 'present', label: 'حاضر' },
      { value: 'absent', label: 'غائب' },
      { value: 'late', label: 'متأخر' },
    ],
  },
  role: {
    label: 'التصنيف', labelEn: 'Category', type: 'select',
    operators: [{ op: 'eq', label: 'يساوي', labelEn: 'equals' }],
    options: [
      { value: 'chronic', label: 'غياب مزمن (<85%)' },
      { value: 'at-risk', label: 'معرض للخطر (75-85%)' },
      { value: 'good', label: 'جيد (85-95%)' },
      { value: 'excellent', label: 'ممتاز (>95%)' },
    ],
  },
};

// --- Preset Filters ---

const PRESET_FILTERS: { name: string; nameEn: string; icon: string; group: FilterGroup }[] = [
  {
    name: 'طلاب الغياب المزمن', nameEn: 'Chronic Absence',
    icon: '🔴',
    group: { combinator: 'AND', conditions: [{ id: 'p1', field: 'attendance', operator: 'lt', value: 85 }] },
  },
  {
    name: 'الحضور المثالي', nameEn: 'Perfect Attendance',
    icon: '🟢',
    group: { combinator: 'AND', conditions: [{ id: 'p2', field: 'attendance', operator: 'eq', value: 100 }] },
  },
  {
    name: 'المتأخرون المتكررون', nameEn: 'Frequent Late',
    icon: '🟡',
    group: { combinator: 'AND', conditions: [{ id: 'p3', field: 'lateCount', operator: 'gt', value: 3 }] },
  },
  {
    name: 'طلاب معرضون للخطر', nameEn: 'At Risk Students',
    icon: '⚠️',
    group: { combinator: 'AND', conditions: [
      { id: 'p4a', field: 'attendance', operator: 'gte', value: 75 },
      { id: 'p4b', field: 'attendance', operator: 'lt', value: 85 },
    ]},
  },
];

// --- Props ---

interface SmartFilterBuilderProps {
  locale: 'ar' | 'en';
  onFilterChange: (group: FilterGroup | null) => void;
  activeFilter: FilterGroup | null;
}

// --- Component ---

export const SmartFilterBuilder: React.FC<SmartFilterBuilderProps> = ({ locale, onFilterChange, activeFilter }) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const [isExpanded, setIsExpanded] = useState(false);
  const [group, setGroup] = useState<FilterGroup>(activeFilter || { combinator: 'AND', conditions: [] });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const matchCount = useMemo(() => {
    if (group.conditions.length === 0) return EXTENDED_STUDENTS.length;
    // Simple estimation
    let count = EXTENDED_STUDENTS.length;
    for (const cond of group.conditions) {
      if (cond.field === 'grade' && cond.operator === 'eq') {
        count = EXTENDED_STUDENTS.filter(s => s.grade === Number(cond.value)).length;
      } else if (cond.field === 'campus' && cond.operator === 'eq') {
        count = EXTENDED_STUDENTS.filter(s => s.campusId === cond.value).length;
      } else if (cond.field === 'attendance' && cond.operator === 'lt') {
        count = Math.round(count * (Number(cond.value) / 100) * 0.3);
      } else if (cond.field === 'attendance' && cond.operator === 'gt') {
        count = Math.round(count * ((100 - Number(cond.value)) / 100 + 0.5));
      }
    }
    return Math.max(0, Math.min(EXTENDED_STUDENTS.length, count));
  }, [group]);

  const addCondition = () => {
    const newCond: FilterCondition = {
      id: `cond-${Date.now()}`,
      field: 'grade',
      operator: 'eq',
      value: '',
    };
    const newGroup = { ...group, conditions: [...group.conditions, newCond] };
    setGroup(newGroup);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    const newGroup = {
      ...group,
      conditions: group.conditions.map(c => c.id === id ? { ...c, ...updates } : c),
    };
    setGroup(newGroup);
  };

  const removeCondition = (id: string) => {
    const newGroup = { ...group, conditions: group.conditions.filter(c => c.id !== id) };
    setGroup(newGroup);
    if (newGroup.conditions.length === 0) onFilterChange(null);
  };

  const applyFilter = () => {
    if (group.conditions.length === 0) {
      onFilterChange(null);
    } else {
      onFilterChange(group);
    }
  };

  const clearAll = () => {
    setGroup({ combinator: 'AND', conditions: [] });
    onFilterChange(null);
  };

  const loadPreset = (preset: typeof PRESET_FILTERS[0]) => {
    setGroup(preset.group);
    onFilterChange(preset.group);
    setIsExpanded(true);
  };

  const saveFilter = () => {
    if (!saveName.trim()) return;
    setSavedFilters(prev => [...prev, { id: `sf-${Date.now()}`, name: saveName, group: { ...group } }]);
    setSaveName('');
    setSaveDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Toggle Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isExpanded || group.conditions.length > 0
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>{t('تصفية ذكية', 'Smart Filter')}</span>
          {group.conditions.length > 0 && (
            <span className="bg-sky-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
              {group.conditions.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Preset Chips */}
        {PRESET_FILTERS.map(preset => (
          <button
            key={preset.name}
            onClick={() => loadPreset(preset)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-sky-200 hover:text-sky-700 transition-all"
          >
            <span>{preset.icon}</span>
            <span>{locale === 'ar' ? preset.name : preset.nameEn}</span>
          </button>
        ))}

        {/* Saved Filters */}
        {savedFilters.map(sf => (
          <button
            key={sf.id}
            onClick={() => { setGroup(sf.group); onFilterChange(sf.group); setIsExpanded(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-all"
          >
            <BookmarkCheck className="w-3 h-3" />
            <span>{sf.name}</span>
          </button>
        ))}
      </div>

      {/* Expanded Builder */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              {/* Combinator Toggle */}
              {group.conditions.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{t('تطابق:', 'Match:')}</span>
                  <button
                    onClick={() => setGroup({ ...group, combinator: 'AND' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      group.combinator === 'AND' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {t('كل الشروط (و)', 'All conditions (AND)')}
                  </button>
                  <button
                    onClick={() => setGroup({ ...group, combinator: 'OR' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      group.combinator === 'OR' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {t('أي شرط (أو)', 'Any condition (OR)')}
                  </button>
                </div>
              )}

              {/* Condition Rows */}
              <div className="space-y-2">
                {group.conditions.map((cond, i) => {
                  const fieldConfig = FIELD_CONFIG[cond.field];
                  return (
                    <motion.div
                      key={cond.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      {/* Combinator label between rows */}
                      {i > 0 && (
                        <span className="text-[10px] font-black text-sky-500 w-8 text-center">
                          {group.combinator === 'AND' ? t('و', 'AND') : t('أو', 'OR')}
                        </span>
                      )}
                      {i === 0 && <span className="w-8 text-center text-[10px] font-black text-slate-400">{t('حيث', 'Where')}</span>}

                      {/* Field selector */}
                      <select
                        value={cond.field}
                        onChange={e => updateCondition(cond.id, {
                          field: e.target.value as FilterField,
                          operator: FIELD_CONFIG[e.target.value as FilterField].operators[0].op,
                          value: '',
                        })}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 min-w-[8rem]"
                      >
                        {(Object.entries(FIELD_CONFIG) as [FilterField, FieldConfig][]).map(([key, cfg]) => (
                          <option key={key} value={key}>{locale === 'ar' ? cfg.label : cfg.labelEn}</option>
                        ))}
                      </select>

                      {/* Operator selector */}
                      <select
                        value={cond.operator}
                        onChange={e => updateCondition(cond.id, { operator: e.target.value as FilterOperator })}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 min-w-[7rem]"
                      >
                        {fieldConfig.operators.map(op => (
                          <option key={op.op} value={op.op}>{locale === 'ar' ? op.label : op.labelEn}</option>
                        ))}
                      </select>

                      {/* Value input */}
                      {fieldConfig.type === 'number' ? (
                        <input
                          type="number"
                          value={cond.value as number}
                          onChange={e => updateCondition(cond.id, { value: Number(e.target.value) })}
                          placeholder={locale === 'ar' ? 'القيمة...' : 'Value...'}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 w-24 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300"
                        />
                      ) : (
                        <select
                          value={cond.value as string}
                          onChange={e => updateCondition(cond.id, { value: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 min-w-[8rem] focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300"
                        >
                          <option value="">{locale === 'ar' ? 'اختر...' : 'Select...'}</option>
                          {fieldConfig.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeCondition(cond.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={addCondition}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('إضافة شرط', 'Add Condition')}
                  </button>

                  {group.conditions.length > 0 && (
                    <>
                      <button
                        onClick={clearAll}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('مسح الكل', 'Clear All')}
                      </button>
                      <button
                        onClick={() => setSaveDialogOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {t('حفظ الفلتر', 'Save Filter')}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Match count */}
                  <span className="text-xs font-bold text-slate-400">
                    {matchCount} {t('طالب مطابق', 'matching students')}
                  </span>

                  {group.conditions.length > 0 && (
                    <button
                      onClick={applyFilter}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {t('تطبيق', 'Apply')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <AnimatePresence>
        {saveDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSaveDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <h3 className="font-black text-slate-900">{t('حفظ الفلتر', 'Save Filter')}</h3>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder={t('اسم الفلتر...', 'Filter name...')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setSaveDialogOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100">
                  {t('إلغاء', 'Cancel')}
                </button>
                <button onClick={saveFilter} className="px-4 py-2 rounded-lg text-sm font-black bg-sky-500 text-white hover:bg-sky-600">
                  {t('حفظ', 'Save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
