import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, GraduationCap, Settings, CalendarDays,
  AlertTriangle, PartyPopper, Pencil, ChevronDown,
} from 'lucide-react';
import type { TemplateCategory } from '../../../types/notification';

// --- Category config ---

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: 'academic', label: 'أكاديمي', icon: GraduationCap },
  { value: 'administrative', label: 'إداري', icon: Settings },
  { value: 'event', label: 'فعاليات', icon: CalendarDays },
  { value: 'emergency', label: 'طوارئ', icon: AlertTriangle },
  { value: 'celebration', label: 'احتفالات', icon: PartyPopper },
  { value: 'custom', label: 'مخصص', icon: Pencil },
];

// --- Component ---

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, category: TemplateCategory, description: string) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [description, setDescription] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [nameError, setNameError] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave(name.trim(), category, description.trim());
    // Reset
    setName('');
    setCategory('custom');
    setDescription('');
    setNameError(false);
  };

  const handleClose = () => {
    setName('');
    setCategory('custom');
    setDescription('');
    setNameError(false);
    onClose();
  };

  const selectedCategoryOption = CATEGORY_OPTIONS.find((c) => c.value === category)!;
  const SelectedIcon = selectedCategoryOption.icon;

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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-sky-500/20">
                <Save className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800">حفظ كقالب</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">
                احفظ الإشعار الحالي كقالب لإعادة استخدامه لاحقاً
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1.5 block">
                  اسم القالب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="مثال: إعلان أكاديمي عام"
                  className={`w-full bg-slate-50 border rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-400 transition-all outline-none ${
                    nameError ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-red-500 mt-1"
                  >
                    اسم القالب مطلوب
                  </motion.p>
                )}
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <label className="text-sm font-bold text-slate-700 mb-1.5 block">
                  الفئة
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 hover:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all outline-none"
                >
                  <span className="flex items-center gap-2">
                    <SelectedIcon className="w-4 h-4 text-slate-500" />
                    {selectedCategoryOption.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-20"
                    >
                      {CATEGORY_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setCategory(opt.value);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                              category === opt.value
                                ? 'bg-sky-50 text-sky-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <OptIcon className="w-4 h-4" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1.5 block">
                  الوصف <span className="text-xs font-medium text-slate-400">(اختياري)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للقالب..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-400 transition-all outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ القالب</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
