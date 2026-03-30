import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, PlayCircle, GraduationCap, Settings, CalendarDays,
  AlertTriangle, PartyPopper, Pencil,
} from 'lucide-react';
import { ChannelIcon } from '../shared/ChannelIcon';
import type { NotificationTemplate, TemplateCategory } from '../../../types/notification';

// --- Category display ---

const CATEGORY_DISPLAY: Record<TemplateCategory, {
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
}> = {
  academic: { label: 'أكاديمي', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
  administrative: { label: 'إداري', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
  event: { label: 'فعاليات', icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
  emergency: { label: 'طوارئ', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  celebration: { label: 'احتفالات', icon: PartyPopper, color: 'text-amber-600', bg: 'bg-amber-50' },
  custom: { label: 'مخصص', icon: Pencil, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

// --- Component ---

interface TemplatePreviewModalProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: NotificationTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUse,
}) => {
  if (!template) return null;

  const catConfig = CATEGORY_DISPLAY[template.category];
  const CatIcon = catConfig.icon;

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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${catConfig.bg} ${catConfig.color}`}>
                  <CatIcon className="w-3.5 h-3.5" />
                  {catConfig.label}
                </span>
                {template.isSystem && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    قالب نظام
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">
                {template.name}
              </h2>
              {template.description && (
                <p className="text-sm font-medium text-slate-400 mt-1">{template.description}</p>
              )}
            </div>

            {/* Preview content */}
            <div className="p-6 space-y-5">
              {/* Title preview */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">العنوان</label>
                <div className="bg-slate-50 rounded-xl p-3 text-sm font-bold text-slate-700 border border-slate-100">
                  {template.title}
                </div>
              </div>

              {/* Short message preview */}
              {template.shortMessage && (
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">الرسالة المختصرة</label>
                  <div className="bg-slate-50 rounded-xl p-3 text-sm font-medium text-slate-600 border border-slate-100">
                    {template.shortMessage}
                  </div>
                </div>
              )}

              {/* Body preview */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">النص الكامل</label>
                <div className="bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-600 border border-slate-100 whitespace-pre-line leading-relaxed">
                  {template.body}
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block">القنوات المستخدمة</label>
                <div className="flex flex-wrap gap-2">
                  {template.channels.map((ch) => (
                    <span key={ch} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      <ChannelIcon channel={ch} size={14} />
                      <ChannelIcon channel={ch} size={14} showLabel locale="ar" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Channel config details */}
              {template.channelConfig && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 block">إعدادات القنوات</label>

                  {template.channelConfig.email && (
                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                      <span className="text-xs font-bold text-blue-600 mb-1 block">البريد الإلكتروني</span>
                      {template.channelConfig.email.senderName && (
                        <p className="text-xs font-medium text-slate-500">
                          المرسل: {template.channelConfig.email.senderName}
                        </p>
                      )}
                      {template.channelConfig.email.ctaButton && (
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          زر الإجراء: {template.channelConfig.email.ctaButton.label}
                        </p>
                      )}
                    </div>
                  )}

                  {template.channelConfig.popup && (
                    <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100">
                      <span className="text-xs font-bold text-purple-600 mb-1 block">النافذة المنبثقة</span>
                      <p className="text-xs font-medium text-slate-500">
                        الحجم: {template.channelConfig.popup.size === 'lg' ? 'كبير' : template.channelConfig.popup.size === 'md' ? 'متوسط' : 'صغير'}
                        {' — '}
                        {template.channelConfig.popup.dismissible ? 'قابل للإغلاق' : 'غير قابل للإغلاق'}
                      </p>
                      {template.channelConfig.popup.primaryButton && (
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          الزر: {template.channelConfig.popup.primaryButton.label}
                        </p>
                      )}
                    </div>
                  )}

                  {template.channelConfig.banner && (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-600 mb-1 block">الشريط الإعلاني</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500">التدرج:</span>
                        <div className={`h-5 w-20 rounded-lg bg-gradient-to-r ${template.channelConfig.banner.bgGradient}`} />
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {template.channelConfig.banner.dismissible ? 'قابل للإغلاق' : 'غير قابل للإغلاق'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Usage stats */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400">
                  عدد مرات الاستخدام: {template.usageCount}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {new Date(template.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => onUse(template)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>استخدام هذا القالب</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
