/**
 * sq-Toast — top-floating, dismissible notification.
 * Variants: info | success | warning | error
 *
 * Stateless: the consumer controls show/hide. Designed to be wrapped by
 * a higher-level provider (out of scope here) but works standalone.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info as InfoIcon, X } from 'lucide-react';

export type SqToastVariant = 'info' | 'success' | 'warning' | 'error';

interface SqToastProps {
  open: boolean;
  variant?: SqToastVariant;
  title: string;
  body?: string;
  /** Auto-dismiss delay in ms; 0 = persistent. */
  duration?: number;
  onClose: () => void;
}

const VARIANT_STYLE: Record<SqToastVariant, { ring: string; icon: React.FC<{ className?: string }>; iconCls: string }> = {
  info:    { ring: 'border-sq-info-500',    icon: InfoIcon,       iconCls: 'text-sq-info-600' },
  success: { ring: 'border-sq-success-500', icon: CheckCircle,    iconCls: 'text-sq-success-600' },
  warning: { ring: 'border-sq-warning-500', icon: AlertTriangle,  iconCls: 'text-sq-warning-600' },
  error:   { ring: 'border-sq-danger-500',  icon: XCircle,        iconCls: 'text-sq-danger-600' },
};

export const SqToast: React.FC<SqToastProps> = ({
  open,
  variant = 'info',
  title,
  body,
  duration = 3200,
  onClose,
}) => {
  const reduce = useReducedMotion();
  const style = VARIANT_STYLE[variant];
  const Icon = style.icon;

  useEffect(() => {
    if (!open || duration === 0) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className={`fixed top-4 inset-x-0 mx-auto z-[140] max-w-sm font-cairo`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl border-l-4 ${style.ring} p-4 flex items-start gap-3`}
          >
            <div className={`shrink-0 mt-0.5 ${style.iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              {body && <p className="mt-0.5 text-xs font-medium text-slate-500">{body}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SqToast;
