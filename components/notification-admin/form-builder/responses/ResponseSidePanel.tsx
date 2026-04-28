// ResponseSidePanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Slide-in panel showing one full response. Logical-property aware so it
// anchors to the start side in RTL (right edge in Arabic). Footer has
// prev/next navigation, copy-link stub, and a destructive delete that uses
// the shared useConfirmDialog hook.

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X, Clock, ChevronLeft, ChevronRight, Share2, Trash2, CheckCircle2, XCircle,
  Star, FileText, Calendar, Hash, Type as TypeIcon, AlertCircle, CheckCheck,
} from 'lucide-react';
import type { FormDefinition, FormResponse } from '../../../../types/notification';
import {
  formatDateTime, formatDuration, getRelativeTime, getInitials, avatarGradient,
  ROLE_LABEL_AR, ROLE_LABEL_EN, ROLE_COLORS, lt, type Locale,
} from './responsesUtils';

interface Props {
  response: FormResponse | null;
  responses: FormResponse[];
  form: FormDefinition;
  locale: Locale;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: () => void; // parent handles confirm via useConfirmDialog
  onCopyShare: () => void;
}

export const ResponseSidePanel: React.FC<Props> = ({
  response, responses, form, locale, onClose, onPrev, onNext, onDelete, onCopyShare,
}) => {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!response) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); onNext(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); onPrev(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [response, onClose, onNext, onPrev]);

  if (!response) return null;

  const idx = responses.findIndex((r) => r.id === response.id);
  const total = responses.length;
  const roleColor = ROLE_COLORS[response.respondentRole];
  const roleLabel = locale === 'ar' ? ROLE_LABEL_AR[response.respondentRole] : ROLE_LABEL_EN[response.respondentRole];
  const ext = response as FormResponse & { durationSeconds?: number; isPartial?: boolean };

  // Logical anchor: side panel slides in from the start (right in RTL, left in LTR)
  const slideIn = locale === 'ar' ? { x: 100 } : { x: -100 };

  return (
    <AnimatePresence>
      {response && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, ...slideIn }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, ...slideIn }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col ${
              locale === 'ar' ? 'right-0 sm:rounded-l-3xl' : 'left-0 sm:rounded-r-3xl'
            }`}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-l from-sky-50/40 to-white shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <button
                  onClick={onClose}
                  className="p-2 -m-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  title={lt(locale, 'إغلاق', 'Close')}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400">
                    {idx + 1} / {total}
                  </span>
                  <button
                    onClick={onPrev}
                    disabled={idx <= 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={lt(locale, 'السابق', 'Previous')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNext}
                    disabled={idx >= total - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={lt(locale, 'التالي', 'Next')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient(response.respondentName)} flex items-center justify-center shadow-lg shrink-0`}>
                  <span className="text-lg font-black text-white">
                    {getInitials(response.respondentName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-slate-800 truncate">
                    {response.respondentName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColor.bg} ${roleColor.text}`}>
                      {roleLabel}
                    </span>
                    {response.respondentGrade && (
                      <span className="text-[11px] font-bold text-slate-400">
                        {lt(locale, `الصف ${response.respondentGrade}`, `Grade ${response.respondentGrade}`)}
                        {response.respondentSection ? ` / ${response.respondentSection}` : ''}
                      </span>
                    )}
                    {ext.isPartial ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold">
                        <AlertCircle className="w-2.5 h-2.5" /> {lt(locale, 'جزئي', 'Partial')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                        <CheckCheck className="w-2.5 h-2.5" /> {lt(locale, 'مكتمل', 'Complete')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(response.submittedAt, locale)}
                </span>
                <span className="text-slate-300">·</span>
                <span>{getRelativeTime(response.submittedAt, locale)}</span>
                {ext.durationSeconds !== undefined && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{lt(locale, 'استغرق', 'took')} {formatDuration(ext.durationSeconds, locale)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {form.fields.sort((a, b) => a.order - b.order).map((field) => {
                const answer = response.answers[field.id];
                const missing = answer === undefined || answer === null || answer === '';
                return (
                  <div key={field.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FieldIcon type={field.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 leading-snug">
                          {field.label}
                          {field.required && <span className="text-rose-500 ms-1">*</span>}
                        </p>
                      </div>
                    </div>
                    <div className="ms-9">
                      <AnswerDisplay field={field} answer={answer} missing={missing} locale={locale} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2 shrink-0">
              <button
                onClick={onCopyShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                title={lt(locale, 'نسخ رابط المشاركة', 'Copy share link')}
              >
                <Share2 className="w-3.5 h-3.5" />
                {lt(locale, 'مشاركة', 'Share')}
              </button>
              <div className="flex-1" />
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {lt(locale, 'حذف الرد', 'Delete response')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FieldIcon: React.FC<{ type: FormDefinition['fields'][number]['type'] }> = ({ type }) => {
  const cls = 'w-3.5 h-3.5 text-slate-500';
  switch (type) {
    case 'yes-no': return <CheckCircle2 className={cls} />;
    case 'number': return <Hash className={cls} />;
    case 'date': return <Calendar className={cls} />;
    case 'file-upload': return <FileText className={cls} />;
    default: return <TypeIcon className={cls} />;
  }
};

// ─────────────────────────────────────────────
// Per-type answer rendering
// ─────────────────────────────────────────────

const AnswerDisplay: React.FC<{
  field: FormDefinition['fields'][number];
  answer: string | string[] | number | boolean | undefined;
  missing: boolean;
  locale: Locale;
}> = ({ field, answer, missing, locale }) => {
  if (missing) {
    return <span className="text-sm font-bold text-slate-300">—</span>;
  }
  if (field.type === 'yes-no') {
    return answer ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5" /> {lt(locale, 'نعم', 'Yes')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600">
        <XCircle className="w-3.5 h-3.5" /> {lt(locale, 'لا', 'No')}
      </span>
    );
  }
  if (field.type === 'single-choice') {
    return (
      <span className="inline-block px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700">
        {String(answer)}
      </span>
    );
  }
  if (field.type === 'multiple-choice') {
    const arr = Array.isArray(answer) ? answer : [String(answer)];
    return (
      <div className="flex flex-wrap gap-1.5">
        {arr.map((v, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-xs font-bold text-violet-700">
            {v}
          </span>
        ))}
      </div>
    );
  }
  if (field.type === 'number') {
    // Render as star rating if ≤10, otherwise plain number
    const n = typeof answer === 'number' ? answer : parseFloat(String(answer));
    if (!isNaN(n) && n <= 5 && n >= 1 && Number.isInteger(n)) {
      return (
        <div className="inline-flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
            />
          ))}
          <span className="ms-2 text-sm font-black text-slate-700">{n}/5</span>
        </div>
      );
    }
    return <span className="text-sm font-black text-slate-700">{String(answer)}</span>;
  }
  if (field.type === 'long-text') {
    return (
      <blockquote className="text-sm font-medium text-slate-700 leading-relaxed border-s-4 border-violet-300 ps-3 py-1 bg-white rounded-e-lg">
        {String(answer)}
      </blockquote>
    );
  }
  if (field.type === 'date') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
        <Calendar className="w-3.5 h-3.5" />
        {String(answer)}
      </span>
    );
  }
  if (field.type === 'file-upload') {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        {String(answer)}
      </a>
    );
  }
  // short-text
  return <span className="text-sm font-bold text-slate-700">{String(answer)}</span>;
};
