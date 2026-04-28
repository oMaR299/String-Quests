import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Trash2, Plus, GripVertical, X, AlertCircle,
  Type, AlignLeft, CircleDot, CheckSquare,
  Hash, Calendar, Upload, ToggleLeft,
} from 'lucide-react';
import type { FormField, FormFieldType, FormFieldOption } from '../../../types/notification';

// --- Field type labels and icons ---

const FIELD_TYPE_CONFIG: Record<FormFieldType, { label: string; icon: React.FC<{ className?: string }> }> = {
  'short-text': { label: 'نص قصير', icon: Type },
  'long-text': { label: 'نص طويل', icon: AlignLeft },
  'single-choice': { label: 'اختيار واحد', icon: CircleDot },
  'multiple-choice': { label: 'اختيار متعدد', icon: CheckSquare },
  'number': { label: 'رقم', icon: Hash },
  'date': { label: 'تاريخ', icon: Calendar },
  'file-upload': { label: 'رفع ملف', icon: Upload },
  'yes-no': { label: 'نعم / لا', icon: ToggleLeft },
};

const hasOptions = (type: FormFieldType) =>
  type === 'single-choice' || type === 'multiple-choice';

const hasTextValidation = (type: FormFieldType) =>
  type === 'short-text' || type === 'long-text';

const hasNumberValidation = (type: FormFieldType) =>
  type === 'number';

// --- Component ---

interface FormFieldEditorProps {
  field: FormField;
  onChange: (field: FormField) => void;
  onDelete: () => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  field,
  onChange,
  onDelete,
}) => {
  // Inline confirm UI removed — parent (FormBuilder) wires `onDelete` through
  // the shared <useConfirmDialog> destructive flow now.
  const typeConfig = FIELD_TYPE_CONFIG[field.type];
  const TypeIcon = typeConfig.icon;

  const updateField = (updates: Partial<FormField>) => {
    onChange({ ...field, ...updates });
  };

  const updateValidation = (updates: Partial<NonNullable<FormField['validation']>>) => {
    onChange({
      ...field,
      validation: { ...field.validation, ...updates },
    });
  };

  // --- Options management ---

  const addOption = () => {
    const newOption: FormFieldOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: '',
    };
    updateField({ options: [...(field.options || []), newOption] });
  };

  const updateOption = (optionId: string, label: string) => {
    updateField({
      options: (field.options || []).map((o) =>
        o.id === optionId ? { ...o, label } : o
      ),
    });
  };

  const removeOption = (optionId: string) => {
    updateField({
      options: (field.options || []).filter((o) => o.id !== optionId),
    });
  };

  const reorderOptions = (newOrder: FormFieldOption[]) => {
    updateField({ options: newOrder });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
        {/* Field type indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <TypeIcon className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-xs font-bold text-slate-400">{typeConfig.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="حذف الحقل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">
            العنوان <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            placeholder="عنوان الحقل"
            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
          />
        </div>

        {/* Help text */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">
            نص المساعدة <span className="text-xs font-medium text-slate-400">(اختياري)</span>
          </label>
          <input
            type="text"
            value={field.helpText || ''}
            onChange={(e) => updateField({ helpText: e.target.value || undefined })}
            placeholder="نص توضيحي إضافي..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
          />
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">حقل مطلوب</label>
          <button
            type="button"
            onClick={() => updateField({ required: !field.required })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              field.required ? 'bg-sky-500' : 'bg-slate-300'
            }`}
          >
            <motion.div
              animate={{ x: field.required ? -20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
            />
          </button>
        </div>

        {/* Options for choice types */}
        {hasOptions(field.type) && (
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              الخيارات
            </label>

            {(!field.options || field.options.length === 0) && (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 rounded-xl p-3 mb-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>أضف خياراً واحداً على الأقل</span>
              </div>
            )}

            <Reorder.Group
              axis="y"
              values={field.options || []}
              onReorder={reorderOptions}
              className="space-y-2"
            >
              <AnimatePresence initial={false}>
                {(field.options || []).map((option) => (
                  <Reorder.Item
                    key={option.id}
                    value={option}
                    className="flex items-center gap-2"
                  >
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder="نص الخيار"
                      className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
                    />
                    <button
                      onClick={() => removeOption(option.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>

            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة خيار</span>
            </button>
          </div>
        )}

        {/* Text validation */}
        {hasTextValidation(field.type) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">الحد الأدنى للأحرف</label>
              <input
                type="number"
                min={0}
                value={field.validation?.minLength ?? ''}
                onChange={(e) => updateValidation({
                  minLength: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">الحد الأقصى للأحرف</label>
              <input
                type="number"
                min={0}
                value={field.validation?.maxLength ?? ''}
                onChange={(e) => updateValidation({
                  maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                placeholder="بلا حد"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
              />
            </div>
          </div>
        )}

        {/* Number validation */}
        {hasNumberValidation(field.type) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">الحد الأدنى</label>
              <input
                type="number"
                value={field.validation?.min ?? ''}
                onChange={(e) => updateValidation({
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                placeholder="بلا حد"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">الحد الأقصى</label>
              <input
                type="number"
                value={field.validation?.max ?? ''}
                onChange={(e) => updateValidation({
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                placeholder="بلا حد"
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
