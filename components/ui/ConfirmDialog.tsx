// ConfirmDialog.tsx
// Reusable yes/no modal. Animation/backdrop mirror InfoHelpModal.tsx.
// Purpose-built for Schedule confirms but stays domain-neutral.

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  locale?: 'ar' | 'en';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  locale = 'en',
  onConfirm,
  onCancel,
}) => {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const Icon = destructive ? AlertTriangle : HelpCircle;
  // Align with the violet-accented admin family (matches TopicManagerLayout /
  // PrincipalTab). Destructive keeps rose for unambiguous warning.
  const headerColor = destructive
    ? 'bg-gradient-to-br from-rose-500 to-red-500'
    : 'bg-gradient-to-br from-violet-500 to-purple-600';
  const confirmBtnColor = destructive
    ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:shadow-lg hover:shadow-rose-500/20'
    : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-lg hover:shadow-violet-500/20';

  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  // Escape closes, and Confirm auto-focuses on open (simple, not a full trap).
  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onCancel}
          dir={dir}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white relative font-cairo"
          >
            {/* Header — mirrors InfoHelpModal's decorative pattern */}
            <div className={`h-24 ${headerColor} relative overflow-hidden flex items-center justify-center`}>
              <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[2px]" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-xl" />
              <div className="relative z-10 p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="p-6 text-center">
              <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                {body}
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg ${confirmBtnColor}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
