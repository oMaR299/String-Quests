// FormsDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom-sheet drawer that lists every school form for the active child + a
// parent-side fill mode that takes over the same drawer body when the user
// taps a form. The fill mode is NOT a separate sheet — it lives inside the
// existing BottomSheet so the shared swipe-between-drawers gesture is
// preserved (we suppress horizontal-swipe-navigation while in fill mode).
//
// Two modes inside this component:
//
//   list — original directory of forms, status pills, expand/collapse on tap.
//   fill — a single form's fields rendered as a fillable parent-facing form,
//          back chevron in the local header, sticky submit/close pill at
//          the bottom, mock 0.6s submit flow that flips status to completed.
//
// Visual vocabulary mirrors `notification-admin/form-builder/FormPreview.tsx`
// so the parent-side form looks like a member of the same family the school
// admins author the forms in: rounded-xl inputs on bg-slate-50, slate-200
// borders, sky→blue gradient submit, etc. (We swap the gradient for the
// chunky duo-blue 3D PrimaryButton to match the parent app's button family.)
//
// Status pill tints (static maps for Tailwind v4 JIT safety):
//   pending  → rose-tinted   ("بانتظار التعبئة / Awaiting fill")
//   completed → emerald-tinted ("مكتمل / Completed")
//   signed   → slate-tinted  ("موقّع / Signed")

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  FileText,
  ClipboardList,
  ChevronLeft,
  PenLine,
  Upload,
  Check,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  MOCK_FORMS,
  type SchoolForm,
  type FormStatus,
  type FormField,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';
import { daysUntilIso } from '../parentAppMockData';
import { PrimaryButton } from '../../parent-onboarding/PrimaryButton';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Forwarded to BottomSheet — enables horizontal swipe between drawers. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

interface RowProps {
  form: SchoolForm;
  effectiveStatus: FormStatus;
  onOpen: () => void;
}

// Tailwind v4 JIT-safe — every class is a literal.
const FORM_STATUS_STYLES: Record<
  FormStatus,
  { bg: string; text: string; labelKey: string }
> = {
  pending: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    labelKey: 'parentApp.school.forms.statusPending',
  },
  completed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    labelKey: 'parentApp.school.forms.statusCompleted',
  },
  signed: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    labelKey: 'parentApp.school.forms.statusSigned',
  },
};

const FormRow: React.FC<RowProps> = ({ form, effectiveStatus, onOpen }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const title = locale === 'ar' ? form.titleAr : form.titleEn;
  const statusStyle = FORM_STATUS_STYLES[effectiveStatus];

  // Due label
  let dueLabel: string;
  if (!form.dueIso) {
    dueLabel = t('parentApp.school.forms.noDeadline');
  } else {
    const days = daysUntilIso(form.dueIso);
    if (days <= 0) dueLabel = t('parentApp.school.assignments.dueToday');
    else if (days === 1) dueLabel = t('parentApp.school.assignments.dueTomorrow');
    else dueLabel = interpolate(t('parentApp.school.assignments.dueInDays'), { n: days });
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-start rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors active:scale-[0.99]"
    >
      <div className="p-3 flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 bg-duo-gold-light"
          aria-hidden="true"
        >
          <FileText className="w-5 h-5 text-amber-700" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-sm font-extrabold text-slate-800 leading-snug">
            {title}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500">{dueLabel}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusStyle.bg} ${statusStyle.text}`}
            >
              {t(statusStyle.labelKey)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {interpolate(t('parentApp.school.forms.questionsMeta'), {
                n: form.fields.length,
                m: form.estimatedMinutes,
              })}
            </span>
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 text-slate-400 shrink-0 mt-1 -rotate-90 rtl:rotate-90"
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
};

// ─── Field renderers ────────────────────────────────────────────────────────
// Mirror the visual vocabulary of `FormPreview.tsx` (notification-admin/form-builder)
// while keeping every class a static literal so Tailwind v4 JIT picks them.

interface FieldRendererProps {
  field: FormField;
  value: string;
  onChange: (next: string) => void;
  /** Read-only when the form is already completed/signed. */
  readOnly: boolean;
}

// Shared input shell classes (mirror the form-builder preview).
const INPUT_SHELL =
  'w-full rounded-xl py-2.5 px-4 text-sm font-medium border outline-none transition-colors';
const INPUT_ENABLED =
  'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-duo-blue focus:ring-2 focus:ring-duo-blue/20';
const INPUT_READONLY =
  'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed';

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  readOnly,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const placeholder = t('parentApp.school.forms.field.textPlaceholder');

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={readOnly}
          className={`${INPUT_SHELL} ${readOnly ? INPUT_READONLY : INPUT_ENABLED}`}
        />
      );

    case 'long-text':
      return (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={readOnly}
          className={`${INPUT_SHELL} resize-none ${readOnly ? INPUT_READONLY : INPUT_ENABLED}`}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={`${INPUT_SHELL} ${readOnly ? INPUT_READONLY : INPUT_ENABLED}`}
        />
      );

    case 'multiple-choice': {
      const options = locale === 'ar' ? (field.optionsAr ?? []) : (field.optionsEn ?? []);
      return (
        <div className="space-y-1.5">
          {options.map((option, i) => {
            const indexValue = String(i);
            const selected = value === indexValue;
            return (
              <button
                key={i}
                type="button"
                disabled={readOnly}
                onClick={() => onChange(indexValue)}
                className={`w-full text-start rounded-xl py-2.5 px-4 text-sm font-bold border transition-colors flex items-center gap-3 ${
                  selected
                    ? 'bg-duo-blue-light border-duo-blue text-duo-blue'
                    : readOnly
                      ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full inline-flex items-center justify-center shrink-0 border-2 ${
                    selected ? 'border-duo-blue bg-duo-blue' : 'border-slate-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    case 'yes-no': {
      const yes = t('parentApp.school.forms.field.yes');
      const no = t('parentApp.school.forms.field.no');
      const isYes = value === 'yes';
      const isNo = value === 'no';
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onChange('yes')}
            className={`flex-1 rounded-xl py-2.5 px-4 text-sm font-extrabold border transition-colors ${
              isYes
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                : readOnly
                  ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {yes}
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onChange('no')}
            className={`flex-1 rounded-xl py-2.5 px-4 text-sm font-extrabold border transition-colors ${
              isNo
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : readOnly
                  ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {no}
          </button>
        </div>
      );
    }

    case 'signature': {
      const signed = value === 'signed';
      return (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange(signed ? '' : 'signed')}
          className={`w-full rounded-xl py-3 px-4 text-sm font-extrabold border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
            signed
              ? 'bg-duo-blue-light border-duo-blue text-duo-blue'
              : readOnly
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <PenLine className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <span>
            {signed
              ? t('parentApp.school.forms.field.signed')
              : t('parentApp.school.forms.field.tapToSign')}
          </span>
          {signed && <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />}
        </button>
      );
    }

    case 'file': {
      const attached = value === 'attached';
      return (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onChange(attached ? '' : 'attached')}
          className={`w-full rounded-xl py-3 px-4 text-sm font-extrabold border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
            attached
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : readOnly
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <span>
            {attached
              ? t('parentApp.school.forms.field.fileAttached')
              : t('parentApp.school.forms.field.tapToUpload')}
          </span>
          {attached && <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />}
        </button>
      );
    }

    default:
      return null;
  }
};

// ─── Fill mode body ─────────────────────────────────────────────────────────

interface FillModeProps {
  form: SchoolForm;
  effectiveStatus: FormStatus;
  onBack: () => void;
  onSubmit: () => void;
  /** Submission in flight. */
  submitting: boolean;
}

const FillMode: React.FC<FillModeProps> = ({
  form,
  effectiveStatus,
  onBack,
  onSubmit,
  submitting,
}) => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const title = locale === 'ar' ? form.titleAr : form.titleEn;
  const description = locale === 'ar' ? form.descriptionAr : form.descriptionEn;
  const readOnly = effectiveStatus === 'completed' || effectiveStatus === 'signed';

  // Local form state. Initialize from prefilled answers (read-only forms).
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of form.fields) {
      if (f.prefilledAnswer !== undefined) {
        // For multiple-choice, find the option index that matches (best-effort).
        if (f.type === 'multiple-choice') {
          const opts = locale === 'ar' ? f.optionsAr ?? [] : f.optionsEn ?? [];
          const idx = opts.findIndex((o) => o === f.prefilledAnswer);
          init[f.id] = idx >= 0 ? String(idx) : f.prefilledAnswer;
        } else {
          init[f.id] = f.prefilledAnswer;
        }
      } else {
        init[f.id] = '';
      }
    }
    return init;
  });

  const update = useCallback((id: string, next: string) => {
    setValues((prev) => ({ ...prev, [id]: next }));
  }, []);

  const meta = interpolate(t('parentApp.school.forms.questionsMeta'), {
    n: form.fields.length,
    m: form.estimatedMinutes,
  });

  return (
    <div className="space-y-4">
      {/* Local back chevron + title block */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('parentApp.school.forms.backToList')}
          className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-800 leading-tight">
            {title}
          </h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">{meta}</p>
        </div>
      </div>

      {/* Form description */}
      {description && (
        <p className="text-xs font-bold text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
          {description}
        </p>
      )}

      {/* Fields — staggered in (skipped under reduced motion) */}
      <div className="space-y-4">
        {form.fields.map((field, idx) => {
          const question = locale === 'ar' ? field.questionAr : field.questionEn;
          const help = locale === 'ar' ? field.helpAr : field.helpEn;
          return (
            <motion.div
              key={field.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.22, delay: idx * 0.04 }
              }
              className="space-y-1.5"
            >
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                <span>{question}</span>
                {field.required && (
                  <span className="text-rose-500" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
              {help && (
                <p className="text-[11px] font-medium text-slate-400 leading-snug">
                  {help}
                </p>
              )}
              <FieldRenderer
                field={field}
                value={values[field.id] ?? ''}
                onChange={(next) => update(field.id, next)}
                readOnly={readOnly}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Sticky bottom action */}
      <div className="pt-3">
        {readOnly ? (
          <PrimaryButton variant="secondary" onClick={onBack}>
            {t('parentApp.school.forms.close')}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onSubmit} loading={submitting}>
            {submitting
              ? t('parentApp.school.forms.submitting')
              : t('parentApp.school.forms.submit')}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

/**
 * Body-only renderer used by SchoolLogisticsStrip's shared BottomSheet (Fix 2).
 *
 * Two modes — list and fill. We keep the swipe-between-drawers gesture in
 * list mode, and disable horizontal swipes while in fill mode by NOT
 * forwarding swipe handlers (the parent's BottomSheet only enables the drag
 * affordance when both `onSwipeNext` & `onSwipePrev` are provided — but those
 * live on the BottomSheet, not in here, so we lean on the visual cue: the
 * back chevron is the way out of fill mode).
 *
 * Note: because SchoolLogisticsStrip wires the BottomSheet's swipe handlers
 * unconditionally, swipe in fill mode currently still triggers the drawer
 * change. The spec says either no-op OR swipe back to list — we'd need to
 * lift fill-mode state up to disable swipe on the BottomSheet from the
 * strip. For v1.x we accept the current behavior: visually clear that fill
 * mode is "the form you tapped", and a swipe out returns to the previous
 * drawer. The back chevron is the canonical way out. (Documented in the
 * strip-level comments as well.)
 */
export const FormsDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const { activeChildId, setSwipeLocked } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const [mode, setMode] = useState<'list' | 'fill'>('list');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Mirror fill-mode into the strip-level swipe lock so a horizontal swipe
  // while filling a form doesn't teleport the user to the Attendance drawer.
  // Cleanup on unmount restores swipe (the user navigated away from forms).
  useEffect(() => {
    setSwipeLocked(mode === 'fill');
    return () => setSwipeLocked(false);
  }, [mode, setSwipeLocked]);

  const filtered = useMemo(() => {
    return MOCK_FORMS.filter((f) => f.childId === activeChildId).sort((a, b) => {
      const order: Record<FormStatus, number> = { pending: 0, completed: 1, signed: 2 };
      const aOrder = submittedIds.has(a.id) ? order.completed : order[a.status];
      const bOrder = submittedIds.has(b.id) ? order.completed : order[b.status];
      if (aOrder !== bOrder) return aOrder - bOrder;
      const ad = a.dueIso ? daysUntilIso(a.dueIso) : 9999;
      const bd = b.dueIso ? daysUntilIso(b.dueIso) : 9999;
      return ad - bd;
    });
  }, [activeChildId, submittedIds]);

  const selectedForm = useMemo(
    () => filtered.find((f) => f.id === selectedFormId) ?? null,
    [filtered, selectedFormId]
  );

  const handleOpenForm = useCallback((id: string) => {
    setSelectedFormId(id);
    setMode('fill');
  }, []);

  const handleBackToList = useCallback(() => {
    setMode('list');
    setSelectedFormId(null);
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedForm) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmittedIds((prev) => {
        const next = new Set(prev);
        next.add(selectedForm.id);
        return next;
      });
      setSubmitting(false);
      setMode('list');
      setSelectedFormId(null);
      setToast(t('parentApp.school.forms.submittedToast'));
      setTimeout(() => setToast(null), 1500);
    }, 600);
  }, [selectedForm, t]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (mode === 'fill' && selectedForm) {
    const effectiveStatus: FormStatus = submittedIds.has(selectedForm.id)
      ? 'completed'
      : selectedForm.status;
    return (
      <>
        <FillMode
          form={selectedForm}
          effectiveStatus={effectiveStatus}
          onBack={handleBackToList}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
        {/* Toast — fixed-position overlay; z-[210] so it sits above the
            BottomSheet (z-[200]). */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-0 bottom-6 z-[210] mx-auto max-w-[280px] px-4"
            >
              <div className="rounded-full bg-slate-900 text-white text-sm font-extrabold py-2.5 px-4 text-center shadow-lg">
                {toast}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // List mode
  return (
    <>
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 text-center">
          <ClipboardList className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-500">
            {t('parentApp.school.forms.noFormsEmpty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => {
            const effectiveStatus: FormStatus = submittedIds.has(f.id)
              ? 'completed'
              : f.status;
            return (
              <FormRow
                key={f.id}
                form={f}
                effectiveStatus={effectiveStatus}
                onOpen={() => handleOpenForm(f.id)}
              />
            );
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 bottom-6 z-[210] mx-auto max-w-[280px] px-4"
          >
            <div className="rounded-full bg-slate-900 text-white text-sm font-extrabold py-2.5 px-4 text-center shadow-lg">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Standalone wrapper — kept for back-compat. SchoolLogisticsStrip uses
 * `FormsDrawerContent` inside its shared BottomSheet.
 */
export const FormsDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.forms.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.forms.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="forms"
    >
      <FormsDrawerContent />
    </BottomSheet>
  );
};

export default FormsDrawer;
