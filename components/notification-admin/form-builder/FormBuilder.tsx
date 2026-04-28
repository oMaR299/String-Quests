import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus, GripVertical, Pencil, Trash2, Eye, BarChart3,
  ArrowRight, Calendar, ClipboardList, FileText,
  Type, AlignLeft, CircleDot, CheckSquare,
  Hash, Upload, ToggleLeft, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { FormFieldPalette } from './FormFieldPalette';
import { FormFieldEditor } from './FormFieldEditor';
import { FormPreview } from './FormPreview';
import { FormResponsesDashboard } from './responses/FormResponsesDashboard';
import { FormTemplateModal } from './FormTemplateModal';
import { useConfirmDialog } from '../../ui/useConfirmDialog';
import type { FormDefinition, FormField, FormFieldType } from '../../../types/notification';

// --- Field type icons ---

const FIELD_TYPE_ICON: Record<FormFieldType, React.FC<{ className?: string }>> = {
  'short-text': Type,
  'long-text': AlignLeft,
  'single-choice': CircleDot,
  'multiple-choice': CheckSquare,
  'number': Hash,
  'date': Calendar,
  'file-upload': Upload,
  'yes-no': ToggleLeft,
};

const FIELD_TYPE_LABEL: Record<FormFieldType, string> = {
  'short-text': 'نص قصير',
  'long-text': 'نص طويل',
  'single-choice': 'اختيار واحد',
  'multiple-choice': 'اختيار متعدد',
  'number': 'رقم',
  'date': 'تاريخ',
  'file-upload': 'رفع ملف',
  'yes-no': 'نعم / لا',
};

type ViewMode = 'list' | 'editor' | 'responses';

// --- Component ---

export const FormBuilder: React.FC = () => {
  const { state, dispatch } = useNotifications();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [responsesFormId, setResponsesFormId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFieldPalette, setShowFieldPalette] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Form being edited (local state during editing)
  const [formDraft, setFormDraft] = useState<FormDefinition | null>(null);

  // --- Handlers ---

  const handleNewForm = () => {
    const newForm: FormDefinition = {
      id: `form-${Date.now()}`,
      title: '',
      description: '',
      fields: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
    };
    setFormDraft(newForm);
    setEditingFormId(newForm.id);
    setViewMode('editor');
    setEditingFieldId(null);
  };

  const handleEditForm = (form: FormDefinition) => {
    setFormDraft({ ...form, fields: form.fields.map((f) => ({ ...f })) });
    setEditingFormId(form.id);
    setViewMode('editor');
    setEditingFieldId(null);
  };

  const handleViewResponses = (formId: string) => {
    setResponsesFormId(formId);
    setViewMode('responses');
  };

  const handleSaveForm = () => {
    if (!formDraft) return;
    const toSave: FormDefinition = {
      ...formDraft,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SAVE_FORM', payload: toSave });
    setViewMode('list');
    setFormDraft(null);
    setEditingFormId(null);
  };

  const handleDeleteForm = async (formId: string) => {
    const form = state.forms.find((f) => f.id === formId);
    if (!form) return;
    const responseCount = state.formResponses.filter((r) => r.formId === formId).length;
    const responseSuffixAr = responseCount > 0
      ? ` و${responseCount} ${responseCount === 1 ? 'رد مرتبط' : 'ردًا مرتبطًا'} به`
      : '';
    const responseSuffixEn = responseCount > 0
      ? ` and ${responseCount} linked ${responseCount === 1 ? 'response' : 'responses'}`
      : '';
    const ok = await confirm({
      titleAr: 'حذف نموذج',
      titleEn: 'Delete form',
      bodyAr: `سيتم حذف "${form.title || 'نموذج بدون عنوان'}"${responseSuffixAr} نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`,
      bodyEn: `Will permanently delete "${form.title || 'Untitled form'}"${responseSuffixEn}. This action cannot be undone.`,
      confirmLabelAr: 'حذف نهائيًا',
      confirmLabelEn: 'Delete permanently',
      destructive: true,
    });
    if (!ok) return;
    dispatch({ type: 'DELETE_FORM', payload: formId });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setFormDraft(null);
    setEditingFormId(null);
    setResponsesFormId(null);
  };

  // --- Field management ---

  const handleAddField = useCallback((type: FormFieldType) => {
    if (!formDraft) return;
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: '',
      required: false,
      order: formDraft.fields.length + 1,
      ...(type === 'single-choice' || type === 'multiple-choice'
        ? { options: [{ id: `opt-${Date.now()}-1`, label: '' }, { id: `opt-${Date.now()}-2`, label: '' }] }
        : {}),
    };
    setFormDraft({
      ...formDraft,
      fields: [...formDraft.fields, newField],
    });
    setEditingFieldId(newField.id);
    setShowFieldPalette(false);
  }, [formDraft]);

  const handleUpdateField = useCallback((updatedField: FormField) => {
    if (!formDraft) return;
    setFormDraft({
      ...formDraft,
      fields: formDraft.fields.map((f) =>
        f.id === updatedField.id ? updatedField : f
      ),
    });
  }, [formDraft]);

  const handleDeleteField = useCallback(async (fieldId: string) => {
    if (!formDraft) return;
    const field = formDraft.fields.find((f) => f.id === fieldId);
    if (!field) return;
    const ok = await confirm({
      titleAr: 'حذف حقل',
      titleEn: 'Delete field',
      bodyAr: `سيتم حذف الحقل "${field.label || 'حقل بدون عنوان'}" من النموذج. لن تفقد البيانات حتى تحفظ النموذج.`,
      bodyEn: `Will remove field "${field.label || 'Untitled field'}" from the form. Data is not lost until the form is saved.`,
      confirmLabelAr: 'حذف الحقل',
      confirmLabelEn: 'Delete field',
      destructive: true,
    });
    if (!ok) return;
    const newFields = formDraft.fields
      .filter((f) => f.id !== fieldId)
      .map((f, i) => ({ ...f, order: i + 1 }));
    setFormDraft({ ...formDraft, fields: newFields });
    if (editingFieldId === fieldId) setEditingFieldId(null);
  }, [formDraft, editingFieldId, confirm]);

  const handleReorderFields = useCallback((newOrder: FormField[]) => {
    if (!formDraft) return;
    setFormDraft({
      ...formDraft,
      fields: newOrder.map((f, i) => ({ ...f, order: i + 1 })),
    });
  }, [formDraft]);

  const handleUseTemplate = (templateForm: FormDefinition) => {
    const newForm: FormDefinition = {
      ...templateForm,
      id: `form-${Date.now()}`,
      title: `${templateForm.title} (نسخة)`,
      fields: templateForm.fields.map((f) => ({
        ...f,
        id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responseCount: 0,
      notificationId: undefined,
    };
    setFormDraft(newForm);
    setEditingFormId(newForm.id);
    setViewMode('editor');
    setShowTemplateModal(false);
  };

  // --- Render: Form List ---

  const renderFormList = () => (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">النماذج</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            إنشاء وإدارة نماذج الاستبيانات والموافقات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>من قالب</span>
          </button>
          <button
            onClick={handleNewForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>نموذج جديد</span>
          </button>
        </div>
      </div>

      {/* Form cards */}
      {state.forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-400 mb-1">لا توجد نماذج</p>
          <p className="text-sm font-medium text-slate-400">أنشئ نموذجك الأول</p>
          <button
            onClick={handleNewForm}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>نموذج جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.forms.map((form, index) => {
            const responseCount = state.formResponses.filter((r) => r.formId === form.id).length;
            const hasDeadline = !!form.deadline;
            const isPastDeadline = hasDeadline && new Date(form.deadline!) < new Date();

            return (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                {/* Status + field count */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    form.isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {form.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {form.fields.length} حقول
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-black text-slate-800 mb-1 leading-tight">
                  {form.title}
                </h3>

                {/* Description */}
                {form.description && (
                  <p className="text-sm font-medium text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                    {form.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {responseCount} إجابة
                  </span>
                  {hasDeadline && (
                    <span className={`flex items-center gap-1 ${isPastDeadline ? 'text-red-400' : ''}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(form.deadline!).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleEditForm(form)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleViewResponses(form.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sm font-bold text-sky-600 border border-sky-200 hover:bg-sky-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الإجابات</span>
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Template Modal */}
      <FormTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectForm={handleUseTemplate}
      />
    </div>
  );

  // --- Render: Form Editor ---

  const renderFormEditor = () => {
    if (!formDraft) return null;

    const sortedFields = [...formDraft.fields].sort((a, b) => a.order - b.order);

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Back + Save */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للنماذج</span>
          </button>
          <button
            onClick={handleSaveForm}
            disabled={!formDraft.title.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              formDraft.title.trim()
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>حفظ النموذج</span>
          </button>
        </div>

        {/* Form metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-base font-black text-slate-800">معلومات النموذج</h3>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">
              العنوان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formDraft.title}
              onChange={(e) => setFormDraft({ ...formDraft, title: e.target.value })}
              placeholder="عنوان النموذج"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-400 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">
              الوصف <span className="text-xs font-medium text-slate-400">(اختياري)</span>
            </label>
            <textarea
              value={formDraft.description || ''}
              onChange={(e) => setFormDraft({ ...formDraft, description: e.target.value })}
              placeholder="وصف مختصر للنموذج..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-400 transition-all outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1.5 block">
                آخر موعد <span className="text-xs font-medium text-slate-400">(اختياري)</span>
              </label>
              <input
                type="date"
                value={formDraft.deadline ? formDraft.deadline.split('T')[0] : ''}
                onChange={(e) =>
                  setFormDraft({
                    ...formDraft,
                    deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-400 transition-all outline-none"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <label className="text-sm font-bold text-slate-700">نشط</label>
              <button
                type="button"
                onClick={() => setFormDraft({ ...formDraft, isActive: !formDraft.isActive })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formDraft.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <motion.div
                  animate={{ x: formDraft.isActive ? -20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Split view: Fields + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Fields list (60%) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">
                الحقول ({sortedFields.length})
              </h3>
              <button
                onClick={() => setShowFieldPalette(!showFieldPalette)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 text-sm font-bold hover:bg-sky-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حقل</span>
                {showFieldPalette ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Field palette */}
            <AnimatePresence>
              {showFieldPalette && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-400 mb-3">اختر نوع الحقل:</p>
                    <FormFieldPalette onAddField={handleAddField} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields list */}
            {sortedFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                <ClipboardList className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-400">لا توجد حقول</p>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  اضغط "إضافة حقل" لبدء بناء النموذج
                </p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={sortedFields}
                onReorder={handleReorderFields}
                className="space-y-2"
              >
                <AnimatePresence initial={false}>
                  {sortedFields.map((field) => {
                    const TypeIcon = FIELD_TYPE_ICON[field.type];
                    const isEditing = editingFieldId === field.id;

                    return (
                      <Reorder.Item
                        key={field.id}
                        value={field}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                      >
                        {/* Field row */}
                        <div className="flex items-center gap-3 p-3">
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />

                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <TypeIcon className="w-4 h-4 text-slate-500" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {field.label || 'حقل بدون عنوان'}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">
                              {FIELD_TYPE_LABEL[field.type]}
                            </p>
                          </div>

                          {field.required && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-[10px] font-bold text-red-500 shrink-0">
                              مطلوب
                            </span>
                          )}

                          <button
                            onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              isEditing
                                ? 'bg-sky-100 text-sky-600'
                                : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inline editor */}
                        <AnimatePresence>
                          {isEditing && (
                            <div className="px-3 pb-3">
                              <FormFieldEditor
                                field={field}
                                onChange={handleUpdateField}
                                onDelete={() => handleDeleteField(field.id)}
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>

          {/* Right: Live preview (40%) */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                معاينة مباشرة
              </h3>
              <FormPreview
                fields={formDraft.fields}
                title={formDraft.title}
                description={formDraft.description}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Render: Responses View ---

  const renderResponsesView = () => {
    if (!responsesFormId) return null;
    return (
      <FormResponsesDashboard
        formId={responsesFormId}
        onBackToList={handleBackToList}
      />
    );
  };

  // --- Main Render ---

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode + (editingFormId || '') + (responsesFormId || '')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'list' && renderFormList()}
          {viewMode === 'editor' && renderFormEditor()}
          {viewMode === 'responses' && renderResponsesView()}
        </motion.div>
      </AnimatePresence>
      {confirmDialog}
    </>
  );
};
