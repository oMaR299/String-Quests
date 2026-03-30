import React from 'react';
import type { NotificationStatus } from '../../../types/notification';

const STATUS_CONFIG: Record<NotificationStatus, { label: string; labelEn: string; bg: string; text: string; dot: string }> = {
  draft: { label: 'مسودة', labelEn: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  scheduled: { label: 'مجدول', labelEn: 'Scheduled', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  sent: { label: 'تم الإرسال', labelEn: 'Sent', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  expired: { label: 'منتهي', labelEn: 'Expired', bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-300' },
  cancelled: { label: 'ملغي', labelEn: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-400' },
};

interface StatusBadgeProps {
  status: NotificationStatus;
  locale?: 'ar' | 'en';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, locale = 'ar' }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {locale === 'ar' ? config.label : config.labelEn}
    </span>
  );
};
