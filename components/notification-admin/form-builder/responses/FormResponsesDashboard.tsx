// FormResponsesDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Notion/Airtable-flavored review dashboard for a single form. Replaces the
// flat-table FormResponsesView. Three tabs:
//   - Overview     → at-a-glance stats + per-question mini charts + heatmap
//   - Responses    → table/card view, drill-down side panel
//   - Analytics    → per-question deep-dive
//
// AR-first bilingual via I18n locale; full RTL via logical properties.
// Library-free charts (see ./Charts.tsx). Mock seeded data via
// `data/mockFormResponses.ts`.

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BarChart3, ListChecks, LineChart, Send, CheckCircle2, ChevronLeft,
} from 'lucide-react';
import type { FormResponse } from '../../../../types/notification';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { useI18n } from '../../../../contexts/I18nContext';
import { useConfirmDialog } from '../../../ui/useConfirmDialog';
import { FORM_ESTIMATED_RECIPIENTS } from '../../../../data/notificationData';
import { OverviewTab } from './OverviewTab';
import { ResponsesTab } from './ResponsesTab';
import { AnalyticsTab } from './AnalyticsTab';
import { ResponseSidePanel } from './ResponseSidePanel';
import { lt, type Locale } from './responsesUtils';

interface FormResponsesDashboardProps {
  formId: string;
  onBackToList: () => void;
}

type TabId = 'overview' | 'responses' | 'analytics';

const TABS: { id: TabId; ar: string; en: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', ar: 'نظرة عامة', en: 'Overview', icon: BarChart3 },
  { id: 'responses', ar: 'الردود', en: 'Responses', icon: ListChecks },
  { id: 'analytics', ar: 'تحليلات', en: 'Analytics', icon: LineChart },
];

export const FormResponsesDashboard: React.FC<FormResponsesDashboardProps> = ({ formId, onBackToList }) => {
  const { state } = useNotifications();
  const { locale } = useI18n();
  const safeLocale: Locale = locale === 'ar' ? 'ar' : 'en';
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [showReminderToast, setShowReminderToast] = useState(false);
  // We track locally-deleted responses since the reducer currently has no
  // DELETE_FORM_RESPONSE action — frontend-only stub.
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<Set<string>>(new Set());
  const [shareToast, setShareToast] = useState(false);

  const form = state.forms.find((f) => f.id === formId);

  const responses: FormResponse[] = useMemo(() => {
    if (!form) return [];
    return state.formResponses
      .filter((r) => r.formId === formId)
      .filter((r) => !locallyDeletedIds.has(r.id))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [state.formResponses, formId, form, locallyDeletedIds]);

  const estimatedTotal = FORM_ESTIMATED_RECIPIENTS[formId] ?? Math.max(responses.length, 20);

  const selectedResponse = useMemo(
    () => responses.find((r) => r.id === selectedResponseId) ?? null,
    [responses, selectedResponseId],
  );

  const handlePrev = () => {
    if (!selectedResponse) return;
    const idx = responses.findIndex((r) => r.id === selectedResponse.id);
    if (idx > 0) setSelectedResponseId(responses[idx - 1].id);
  };

  const handleNext = () => {
    if (!selectedResponse) return;
    const idx = responses.findIndex((r) => r.id === selectedResponse.id);
    if (idx >= 0 && idx < responses.length - 1) setSelectedResponseId(responses[idx + 1].id);
  };

  const handleDeleteResponse = async () => {
    if (!selectedResponse) return;
    const ok = await confirm({
      titleAr: 'حذف رد',
      titleEn: 'Delete response',
      bodyAr: `سيتم حذف رد "${selectedResponse.respondentName}" نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`,
      bodyEn: `Will permanently delete response from "${selectedResponse.respondentName}". This action cannot be undone.`,
      confirmLabelAr: 'حذف نهائيًا',
      confirmLabelEn: 'Delete permanently',
      destructive: true,
    });
    if (!ok) return;
    setLocallyDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(selectedResponse.id);
      return next;
    });
    // Auto-advance to next response if available
    const idx = responses.findIndex((r) => r.id === selectedResponse.id);
    const nextResp = responses[idx + 1] ?? responses[idx - 1] ?? null;
    setSelectedResponseId(nextResp ? nextResp.id : null);
  };

  const handleClearAllResponses = async () => {
    if (responses.length === 0) return;
    const ok = await confirm({
      titleAr: `حذف ${responses.length} ${responses.length === 1 ? 'ردًا' : 'ردًا'}`,
      titleEn: `Delete ${responses.length} ${responses.length === 1 ? 'response' : 'responses'}`,
      bodyAr: `سيتم حذف جميع الردود الـ${responses.length} لهذا النموذج نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`,
      bodyEn: `Will permanently delete all ${responses.length} responses for this form. This action cannot be undone.`,
      confirmLabelAr: 'حذف الكل نهائيًا',
      confirmLabelEn: 'Delete all permanently',
      destructive: true,
    });
    if (!ok) return;
    setLocallyDeletedIds((prev) => {
      const next = new Set(prev);
      for (const r of responses) next.add(r.id);
      return next;
    });
  };

  const handleSendReminder = () => {
    setShowReminderToast(true);
    setTimeout(() => setShowReminderToast(false), 3000);
  };

  const handleCopyShare = () => {
    // Frontend stub — copy a deep-link to clipboard
    const link = `${window.location.origin}/forms/${formId}/responses/${selectedResponseId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => undefined);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  if (!form) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-400">{lt(safeLocale, 'النموذج غير موجود', 'Form not found')}</p>
          <button onClick={onBackToList} className="mt-3 text-sm font-bold text-sky-600 hover:underline">
            {lt(safeLocale, 'العودة إلى النماذج', 'Back to forms')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Breadcrumb + summary header */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <button onClick={onBackToList} className="hover:text-slate-600 transition-colors">
            {lt(safeLocale, 'النماذج', 'Forms')}
          </button>
          <ChevronLeft className={`w-3 h-3 ${safeLocale === 'ar' ? '' : 'rotate-180'}`} />
          <span className="text-slate-600 truncate">{form.title}</span>
          <ChevronLeft className={`w-3 h-3 ${safeLocale === 'ar' ? '' : 'rotate-180'}`} />
          <span className="text-violet-600">{lt(safeLocale, 'الردود', 'Responses')}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <button
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors mb-2"
            >
              <ArrowRight className={`w-3.5 h-3.5 ${safeLocale === 'ar' ? '' : 'rotate-180'}`} />
              {lt(safeLocale, 'العودة للنماذج', 'Back to forms')}
            </button>
            <h2 className="text-2xl font-black text-slate-800">{form.title}</h2>
            {form.description && (
              <p className="text-sm font-medium text-slate-400 mt-1 max-w-2xl">{form.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendReminder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {lt(safeLocale, 'إرسال تذكير', 'Send reminder')}
            </button>
            {responses.length > 0 && (
              <button
                onClick={handleClearAllResponses}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-colors"
              >
                {lt(safeLocale, `حذف الكل (${responses.length})`, `Delete all (${responses.length})`)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 inline-flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                active
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {locale === 'ar' ? tab.ar : tab.en}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab form={form} responses={responses} estimatedTotal={estimatedTotal} locale={safeLocale} />
          )}
          {activeTab === 'responses' && (
            <ResponsesTab
              form={form}
              responses={responses}
              locale={safeLocale}
              onSelectResponse={(r) => setSelectedResponseId(r.id)}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab form={form} responses={responses} locale={safeLocale} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Toasts */}
      <AnimatePresence>
        {showReminderToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">
              {lt(safeLocale, 'تم إرسال التذكير', 'Reminder sent')}
            </span>
          </motion.div>
        )}
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-bold text-sky-700">
              {lt(safeLocale, 'تم نسخ الرابط', 'Link copied')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side panel */}
      <ResponseSidePanel
        response={selectedResponse}
        responses={responses}
        form={form}
        locale={safeLocale}
        onClose={() => setSelectedResponseId(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        onDelete={handleDeleteResponse}
        onCopyShare={handleCopyShare}
      />

      {confirmDialog}
    </div>
  );
};
