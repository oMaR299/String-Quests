import React from 'react';
import { Mail, Bell, MessageSquare, Flag } from 'lucide-react';
import type { NotificationChannel } from '../../../types/notification';

const CHANNEL_CONFIG: Record<NotificationChannel, {
  icon: React.FC<{ className?: string }>;
  label: string;
  labelEn: string;
  color: string;
}> = {
  email: { icon: Mail, label: 'بريد إلكتروني', labelEn: 'Email', color: 'text-blue-500' },
  bell: { icon: Bell, label: 'إشعار الجرس', labelEn: 'Bell', color: 'text-amber-500' },
  popup: { icon: MessageSquare, label: 'نافذة منبثقة', labelEn: 'Pop-up', color: 'text-purple-500' },
  banner: { icon: Flag, label: 'شريط إعلاني', labelEn: 'Banner', color: 'text-emerald-500' },
};

interface ChannelIconProps {
  channel: NotificationChannel;
  size?: number;
  showLabel?: boolean;
  locale?: 'ar' | 'en';
  className?: string;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ channel, size = 16, showLabel = false, locale = 'ar', className = '' }) => {
  const config = CHANNEL_CONFIG[channel];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={locale === 'ar' ? config.label : config.labelEn}>
      <Icon className={`${config.color}`} style={{ width: size, height: size }} />
      {showLabel && <span className={`text-xs font-bold ${config.color}`}>{locale === 'ar' ? config.label : config.labelEn}</span>}
    </span>
  );
};

export { CHANNEL_CONFIG };
