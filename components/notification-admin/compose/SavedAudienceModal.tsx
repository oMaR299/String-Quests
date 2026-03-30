import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trash2, Save, FolderOpen } from 'lucide-react';
import type { AudienceTarget, SavedAudience } from '../../../types/notification';
import { useNotifications } from '../../../contexts/NotificationContext';
import { estimateAudienceCount } from '../../../data/mockUserDirectory';

interface SavedAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudience: AudienceTarget;
  onSelect: (audience: AudienceTarget) => void;
}

export const SavedAudienceModal: React.FC<SavedAudienceModalProps> = ({
  isOpen,
  onClose,
  currentAudience,
  onSelect,
}) => {
  const { state, dispatch } = useNotifications();
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!saveName.trim()) return;

    const count = estimateAudienceCount({
      roles: currentAudience.roles,
      grades: currentAudience.grades,
      sections: currentAudience.sections,
      campusIds: currentAudience.campusIds,
      individualIds: currentAudience.individualIds,
    });

    const newAudience: SavedAudience = {
      id: `aud-${Date.now()}`,
      name: saveName.trim(),
      target: { ...currentAudience },
      estimatedCount: count,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'SAVE_AUDIENCE', payload: newAudience });
    setSaveName('');
    setIsSaving(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_AUDIENCE', payload: id });
  };

  const handleSelect = (saved: SavedAudience) => {
    onSelect(saved.target);
  };

  const currentHasFilters =
    currentAudience.roles.length > 0 ||
    currentAudience.individualIds.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-sky-500" />
                  الجماهير المحفوظة
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Saved Audiences List */}
                {state.savedAudiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">لا توجد جماهير محفوظة</p>
                    <p className="text-xs text-slate-400 mt-1">احفظ الجمهور الحالي لإعادة استخدامه لاحقًا</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.savedAudiences.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-sky-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{saved.name}</div>
                          <div className="text-xs font-medium text-slate-400">
                            ~{saved.estimatedCount} مستخدم
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelect(saved)}
                            className="px-3 py-1.5 bg-sky-500 text-white text-xs font-bold rounded-lg hover:bg-sky-600 transition-colors"
                          >
                            استخدام
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(saved.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Current */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-700 mb-3">حفظ الجمهور الحالي</p>
                  {!currentHasFilters ? (
                    <p className="text-xs text-slate-400 font-medium">
                      لا يوجد جمهور محدد للحفظ. اختر الأدوار والفلاتر أولاً.
                    </p>
                  ) : isSaving ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="اسم الجمهور..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                        dir="rtl"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!saveName.trim()}
                        className="px-4 py-2.5 bg-sky-500 text-white text-sm font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSaving(false);
                          setSaveName('');
                        }}
                        className="px-3 py-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSaving(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      حفظ الجمهور الحالي
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
