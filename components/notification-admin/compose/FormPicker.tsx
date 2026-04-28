// FormPicker.tsx
//
// Notion-style template gallery for picking which form a notification
// attaches. Each card surfaces title (AR + EN), short description, response
// field count, estimated completion time, and a small icon row indicating
// the form's field types (text / choice / file-upload).
//
// Frontend-only: forms come from `data/mockNotificationForms.ts`. The
// selected form's id flows back via `onChange` to the compose page, which
// auto-wires the CTA's URL to a `forms://internal/${id}` deep link.
//
// Tailwind v4 JIT-safe: every class string is a literal. RTL-aware via
// logical properties (ps-* / pe-* / ms-* / me-*). Cairo font is inherited.

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AlignLeft, ListChecks, Upload, Calendar, Hash, Check, FormInput,
  CheckCheck, Type, ToggleLeft, Clock, ArrowDownLeft,
} from 'lucide-react';
import { MOCK_NOTIFICATION_FORMS, type MockNotificationForm } from '../../../data/mockNotificationForms';
import type { FormFieldType } from '../../../types/notification';

interface FormPickerProps {
  selectedFormId: string | null;
  onChange: (formId: string | null) => void;
  /**
   * When true, renders a small "linked to CTA" affordance on the selected
   * card pointing back at the CTA section above.
   */
  ctaLinked?: boolean;
}

/* ─── Field-type icon map (literal classes) ───────────────────────────── */

const FIELD_TYPE_ICON: Record<FormFieldType, React.FC<{ className?: string }>> = {
  'short-text': Type,
  'long-text': AlignLeft,
  'single-choice': ListChecks,
  'multiple-choice': CheckCheck,
  number: Hash,
  date: Calendar,
  'file-upload': Upload,
  'yes-no': ToggleLeft,
};

const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
  'short-text': 'نص قصير',
  'long-text': 'نص طويل',
  'single-choice': 'اختيار واحد',
  'multiple-choice': 'اختيارات متعددة',
  number: 'رقم',
  date: 'تاريخ',
  'file-upload': 'رفع ملف',
  'yes-no': 'نعم / لا',
};

export const FormPicker: React.FC<FormPickerProps> = ({
  selectedFormId,
  onChange,
  ctaLinked = false,
}) => {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-500">
          اختر نموذجًا من المعرض
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="font-medium not-italic text-slate-400">
            Pick a form from the gallery
          </span>
        </p>
        {selectedFormId && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            إلغاء التحديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {MOCK_NOTIFICATION_FORMS.map((form) => {
          const isSelected = selectedFormId === form.id;
          return (
            <FormCard
              key={form.id}
              form={form}
              isSelected={isSelected}
              ctaLinked={ctaLinked && isSelected}
              reduced={!!reduced}
              onSelect={() => onChange(isSelected ? null : form.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─── Card ─────────────────────────────────────────────────────────────── */

interface FormCardProps {
  form: MockNotificationForm;
  isSelected: boolean;
  ctaLinked: boolean;
  reduced: boolean;
  onSelect: () => void;
}

const FormCard: React.FC<FormCardProps> = ({
  form,
  isSelected,
  ctaLinked,
  reduced,
  onSelect,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
      className={`relative text-start rounded-2xl border-2 p-4 transition-all duration-200 group
        ${
          isSelected
            ? 'border-violet-400 bg-violet-50/60 ring-4 ring-violet-200/50 shadow-md shadow-violet-500/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
        }
      `}
    >
      {/* Linked-to-CTA badge — shows when CTA is wired to this form */}
      <AnimatePresence>
        {ctaLinked && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
            className="absolute -top-2 start-3 inline-flex items-center gap-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-violet-500/30 whitespace-nowrap"
          >
            <ArrowDownLeft className="w-2.5 h-2.5" />
            <span>زر هذا الإشعار يفتح هذا النموذج</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected check — top end corner */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={reduced ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18, ease: 'backOut' }}
            className="absolute top-3 end-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shadow-md shadow-violet-500/30"
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="flex items-start gap-3 mb-3 pe-7">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/25'
              : 'bg-slate-100 group-hover:bg-slate-200'
          }`}
        >
          <FormInput
            className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-black leading-tight truncate ${
              isSelected ? 'text-violet-900' : 'text-slate-800'
            }`}
          >
            {form.titleAr}
          </h4>
          <p
            className={`text-[10px] font-bold mt-0.5 truncate ${
              isSelected ? 'text-violet-500' : 'text-slate-400'
            }`}
          >
            {form.titleEn}
          </p>
        </div>
      </div>

      {/* Description */}
      <p
        className={`text-xs font-medium leading-relaxed mb-3 line-clamp-2 ${
          isSelected ? 'text-violet-800/80' : 'text-slate-500'
        }`}
      >
        {form.descriptionAr}
      </p>

      {/* Meta row: field count + estimated time */}
      <div className="flex items-center gap-3 mb-2.5">
        <div
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
            isSelected
              ? 'bg-violet-100 text-violet-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span className="tabular-nums">{form.fieldCount}</span>
          <span>سؤال</span>
          <span className="mx-0.5 text-current/50">·</span>
          <span className="font-medium not-italic">questions</span>
        </div>
        <div
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
            isSelected
              ? 'bg-violet-100 text-violet-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Clock className="w-2.5 h-2.5" />
          <span>~{form.estMinutes} د</span>
        </div>
      </div>

      {/* Field type icon row */}
      <div className="flex items-center gap-1 flex-wrap">
        {form.fieldTypes.map((ft) => {
          const Icon = FIELD_TYPE_ICON[ft];
          return (
            <span
              key={ft}
              className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                isSelected
                  ? 'bg-white/80 text-violet-600 border border-violet-200'
                  : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}
              title={FIELD_TYPE_LABEL[ft]}
            >
              <Icon className="w-2.5 h-2.5" />
              <span>{FIELD_TYPE_LABEL[ft]}</span>
            </span>
          );
        })}
      </div>
    </motion.button>
  );
};

export default FormPicker;
