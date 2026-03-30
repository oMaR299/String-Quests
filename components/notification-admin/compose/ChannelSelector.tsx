import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, MessageSquare, Flag, AlertCircle } from 'lucide-react';
import type { NotificationChannel } from '../../../types/notification';

interface ChannelOption {
  id: NotificationChannel;
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  color: string;
  selectedBg: string;
  selectedBorder: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    id: 'email',
    icon: Mail,
    label: 'بريد إلكتروني',
    description: 'إرسال بريد إلكتروني مفصّل',
    color: 'text-blue-500',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-400',
  },
  {
    id: 'bell',
    icon: Bell,
    label: 'إشعار الجرس',
    description: 'إشعار سريع في لوحة التحكم',
    color: 'text-amber-500',
    selectedBg: 'bg-amber-50',
    selectedBorder: 'border-amber-400',
  },
  {
    id: 'popup',
    icon: MessageSquare,
    label: 'نافذة منبثقة',
    description: 'نافذة تظهر عند تسجيل الدخول',
    color: 'text-purple-500',
    selectedBg: 'bg-purple-50',
    selectedBorder: 'border-purple-400',
  },
  {
    id: 'banner',
    icon: Flag,
    label: 'شريط إعلاني',
    description: 'شريط ثابت أعلى الصفحة',
    color: 'text-emerald-500',
    selectedBg: 'bg-emerald-50',
    selectedBorder: 'border-emerald-400',
  },
];

interface ChannelSelectorProps {
  selected: NotificationChannel[];
  onChange: (channels: NotificationChannel[]) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ selected, onChange }) => {
  const hasValidationError = selected.length === 0;

  const toggleChannel = (channelId: NotificationChannel) => {
    if (selected.includes(channelId)) {
      onChange(selected.filter((c) => c !== channelId));
    } else {
      onChange([...selected, channelId]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-slate-800">قنوات الإرسال</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CHANNEL_OPTIONS.map((channel) => {
          const isSelected = selected.includes(channel.id);
          const Icon = channel.icon;

          return (
            <motion.button
              key={channel.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleChannel(channel.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center
                ${
                  isSelected
                    ? `${channel.selectedBorder} ${channel.selectedBg} shadow-sm`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              {/* Toggle indicator */}
              <div
                className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                  ${isSelected ? `${channel.selectedBorder} ${channel.selectedBg}` : 'border-slate-300 bg-white'}
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-2.5 h-2.5 rounded-full ${channel.selectedBorder.replace('border-', 'bg-')}`}
                  />
                )}
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                  ${isSelected ? channel.selectedBg : 'bg-slate-100'}
                `}
              >
                <Icon className={`w-5 h-5 ${channel.color}`} />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800">{channel.label}</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5 leading-tight">
                  {channel.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Validation error */}
      {hasValidationError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-500 text-xs font-bold"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>يجب اختيار قناة واحدة على الأقل</span>
        </motion.div>
      )}
    </div>
  );
};
