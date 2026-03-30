import React from 'react';
import {
  Type, AlignLeft, CircleDot, CheckSquare,
  Hash, Calendar, Upload, ToggleLeft,
} from 'lucide-react';
import type { FormField, FormFieldType } from '../../../types/notification';

// --- Field type icons ---

const FIELD_ICONS: Record<FormFieldType, React.FC<{ className?: string }>> = {
  'short-text': Type,
  'long-text': AlignLeft,
  'single-choice': CircleDot,
  'multiple-choice': CheckSquare,
  'number': Hash,
  'date': Calendar,
  'file-upload': Upload,
  'yes-no': ToggleLeft,
};

// --- Field Renderers ---

const FieldRenderer: React.FC<{ field: FormField }> = ({ field }) => {
  switch (field.type) {
    case 'short-text':
      return (
        <input
          type="text"
          disabled
          placeholder="أدخل النص هنا..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-400 placeholder:text-slate-300 cursor-not-allowed"
        />
      );

    case 'long-text':
      return (
        <textarea
          disabled
          placeholder="أدخل النص هنا..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-400 placeholder:text-slate-300 cursor-not-allowed resize-none"
        />
      );

    case 'single-choice':
      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-not-allowed">
              <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 shrink-0" />
              <span className="text-sm font-medium text-slate-600">
                {option.label || 'خيار بدون نص'}
              </span>
            </label>
          ))}
          {(!field.options || field.options.length === 0) && (
            <p className="text-xs font-medium text-slate-400 italic">لا توجد خيارات</p>
          )}
        </div>
      );

    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {(field.options || []).map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-not-allowed">
              <div className="w-4.5 h-4.5 rounded border-2 border-slate-300 shrink-0" />
              <span className="text-sm font-medium text-slate-600">
                {option.label || 'خيار بدون نص'}
              </span>
            </label>
          ))}
          {(!field.options || field.options.length === 0) && (
            <p className="text-xs font-medium text-slate-400 italic">لا توجد خيارات</p>
          )}
        </div>
      );

    case 'number':
      return (
        <input
          type="number"
          disabled
          placeholder="0"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-400 placeholder:text-slate-300 cursor-not-allowed"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          disabled
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-400 cursor-not-allowed"
        />
      );

    case 'file-upload':
      return (
        <div className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 cursor-not-allowed">
          <Upload className="w-5 h-5 text-slate-300" />
          <span className="text-sm font-bold text-slate-400">اضغط لرفع ملف</span>
        </div>
      );

    case 'yes-no':
      return (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-not-allowed">
            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="text-sm font-bold text-slate-600">نعم</span>
          </label>
          <label className="flex items-center gap-2 cursor-not-allowed">
            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="text-sm font-bold text-slate-600">لا</span>
          </label>
        </div>
      );

    default:
      return null;
  }
};

// --- Component ---

interface FormPreviewProps {
  fields: FormField[];
  title: string;
  description?: string;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ fields, title, description }) => {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Form header */}
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-800 leading-tight">
          {title || 'عنوان النموذج'}
        </h3>
        {description && (
          <p className="text-sm font-medium text-slate-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Form fields */}
      {sortedFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <Type className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">أضف حقولاً لبناء النموذج</p>
          <p className="text-xs font-medium text-slate-400 mt-1">ستظهر المعاينة هنا</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedFields.map((field, index) => (
            <div key={field.id} className="space-y-1.5">
              {/* Label */}
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                <span>{field.label || `حقل ${index + 1}`}</span>
                {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Help text */}
              {field.helpText && (
                <p className="text-xs font-medium text-slate-400">{field.helpText}</p>
              )}

              {/* Field */}
              <FieldRenderer field={field} />
            </div>
          ))}
        </div>
      )}

      {/* Submit button (preview only) */}
      {sortedFields.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold opacity-60 cursor-not-allowed"
          >
            إرسال
          </button>
        </div>
      )}
    </div>
  );
};
