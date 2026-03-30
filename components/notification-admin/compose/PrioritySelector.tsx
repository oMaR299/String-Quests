import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import type { NotificationPriority } from '../../../types/notification';

interface PrioritySelectorProps {
  value: NotificationPriority;
  onChange: (p: NotificationPriority) => void;
}

const PRIORITY_OPTIONS: {
  id: NotificationPriority;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  borderColor: string;
  selectedBg: string;
  selectedBorder: string;
  iconColor: string;
}[] = [
  {
    id: 'normal',
    label: 'عادي',
    description: 'يُرسل حسب ترتيب الإرسال',
    icon: Shield,
    borderColor: 'border-slate-200',
    selectedBg: 'bg-slate-50',
    selectedBorder: 'border-slate-400',
    iconColor: 'text-slate-500',
  },
  {
    id: 'urgent',
    label: 'عاجل',
    description: 'يتخطّى قائمة الانتظار',
    icon: AlertTriangle,
    borderColor: 'border-slate-200',
    selectedBg: 'bg-red-50',
    selectedBorder: 'border-red-400',
    iconColor: 'text-red-500',
  },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-slate-800">أولوية الإرسال</h3>
      <div className="grid grid-cols-2 gap-3">
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(option.id)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? `${option.selectedBorder} ${option.selectedBg} shadow-sm`
                    : `${option.borderColor} bg-white hover:border-slate-300 hover:bg-slate-50`
                }
              `}
            >
              {/* Radio indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center shrink-0
                  ${isSelected ? option.selectedBorder : 'border-slate-300'}
                `}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-2.5 h-2.5 rounded-full ${option.selectedBorder.replace('border-', 'bg-')}`}
                  />
                )}
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? option.selectedBg : 'bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${option.iconColor}`} />
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">{option.label}</div>
                <div className="text-[11px] font-medium text-slate-400 leading-tight">
                  {option.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
