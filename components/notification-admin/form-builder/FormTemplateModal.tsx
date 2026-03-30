import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ClipboardList, Calendar, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { FormDefinition } from '../../../types/notification';

// --- Component ---

interface FormTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForm: (form: FormDefinition) => void;
}

export const FormTemplateModal: React.FC<FormTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectForm,
}) => {
  const { state } = useNotifications();

  // Available forms that can serve as templates
  const availableForms = state.forms;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800">قوالب النماذج</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">
                اختر نموذجاً موجوداً لاستخدامه كقالب
              </p>
            </div>

            {/* Form list */}
            <div className="flex-1 overflow-y-auto p-4">
              {availableForms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <ClipboardList className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">لا توجد نماذج محفوظة</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">أنشئ نموذجاً جديداً أولاً</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableForms.map((form) => (
                    <motion.button
                      key={form.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelectForm(form)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-sky-50/50 hover:border-sky-200 transition-all text-right group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center shrink-0 transition-colors">
                        <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-700 group-hover:text-sky-700 transition-colors truncate">
                          {form.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-slate-400">
                            {form.fields.length} حقول
                          </span>
                          {form.deadline && (
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(form.deadline).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            form.isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {form.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </div>

                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-sky-400 shrink-0 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
