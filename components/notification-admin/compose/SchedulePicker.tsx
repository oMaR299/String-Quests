import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CalendarClock, Timer } from 'lucide-react';
import type { NotificationChannel } from '../../../types/notification';

type ScheduleMode = 'now' | 'scheduled';

interface SchedulePickerProps {
  sendAt: string | null;
  expiresAt?: string;
  channels: NotificationChannel[];
  onChange: (sendAt: string | null, expiresAt?: string) => void;
}

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  sendAt,
  expiresAt,
  channels,
  onChange,
}) => {
  const mode: ScheduleMode = sendAt ? 'scheduled' : 'now';
  const [hasExpiry, setHasExpiry] = useState(!!expiresAt);

  const showExpiryOption = channels.includes('popup') || channels.includes('banner');

  const handleModeChange = (newMode: ScheduleMode) => {
    if (newMode === 'now') {
      onChange(null, hasExpiry ? expiresAt : undefined);
    } else {
      // Default to tomorrow 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      onChange(tomorrow.toISOString().slice(0, 16), hasExpiry ? expiresAt : undefined);
    }
  };

  const handleDateTimeChange = (value: string) => {
    onChange(value || null, hasExpiry ? expiresAt : undefined);
  };

  const handleExpiryToggle = () => {
    if (hasExpiry) {
      setHasExpiry(false);
      onChange(sendAt, undefined);
    } else {
      setHasExpiry(true);
      // Default to 7 days from now
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      onChange(sendAt, expiry.toISOString().slice(0, 16));
    }
  };

  const handleExpiryChange = (value: string) => {
    onChange(sendAt, value || undefined);
  };

  const options: {
    id: ScheduleMode;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'now',
      label: 'إرسال الآن',
      description: 'يُرسل فور النقر على إرسال',
      icon: Send,
    },
    {
      id: 'scheduled',
      label: 'جدولة',
      description: 'اختر تاريخ ووقت الإرسال',
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-slate-800">موعد الإرسال</h3>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = mode === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleModeChange(option.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-sky-400 bg-sky-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${isSelected ? 'border-sky-400' : 'border-slate-300'}
                  `}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full bg-sky-500"
                    />
                  )}
                </div>

                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-sky-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} />
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">{option.label}</div>
                  <div className="text-[11px] font-medium text-slate-400">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Schedule DateTime Input */}
        <AnimatePresence>
          {mode === 'scheduled' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-500">تاريخ ووقت الإرسال</label>
                <input
                  type="datetime-local"
                  value={sendAt?.slice(0, 16) || ''}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                  dir="ltr"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expiry Option */}
        <AnimatePresence>
          {showExpiryOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleExpiryToggle}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${hasExpiry ? 'border-sky-400 bg-sky-500' : 'border-slate-300 bg-white'}
                    `}
                  >
                    {hasExpiry && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <Timer className="w-4 h-4 text-slate-400" />
                  تعيين انتهاء
                  <span className="text-xs font-medium text-slate-400">(للنوافذ والشريط الإعلاني)</span>
                </button>

                <AnimatePresence>
                  {hasExpiry && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">تاريخ الانتهاء</label>
                        <input
                          type="datetime-local"
                          value={expiresAt?.slice(0, 16) || ''}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                          dir="ltr"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
