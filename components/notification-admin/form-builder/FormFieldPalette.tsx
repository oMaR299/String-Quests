import React from 'react';
import { motion } from 'framer-motion';
import {
  Type, AlignLeft, CircleDot, CheckSquare,
  Hash, Calendar, Upload, ToggleLeft,
} from 'lucide-react';
import type { FormFieldType } from '../../../types/notification';

// --- Field type config ---

const FIELD_TYPES: {
  type: FormFieldType;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
}[] = [
  { type: 'short-text', label: 'نص قصير', icon: Type, color: 'text-blue-500', bg: 'bg-blue-50' },
  { type: 'long-text', label: 'نص طويل', icon: AlignLeft, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { type: 'single-choice', label: 'اختيار واحد', icon: CircleDot, color: 'text-purple-500', bg: 'bg-purple-50' },
  { type: 'multiple-choice', label: 'اختيار متعدد', icon: CheckSquare, color: 'text-pink-500', bg: 'bg-pink-50' },
  { type: 'number', label: 'رقم', icon: Hash, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { type: 'date', label: 'تاريخ', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
  { type: 'file-upload', label: 'رفع ملف', icon: Upload, color: 'text-teal-500', bg: 'bg-teal-50' },
  { type: 'yes-no', label: 'نعم / لا', icon: ToggleLeft, color: 'text-rose-500', bg: 'bg-rose-50' },
];

// --- Component ---

interface FormFieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
}

export const FormFieldPalette: React.FC<FormFieldPaletteProps> = ({ onAddField }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {FIELD_TYPES.map((fieldType) => {
        const Icon = fieldType.icon;
        return (
          <motion.button
            key={fieldType.type}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddField(fieldType.type)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group`}
          >
            <div className={`w-9 h-9 rounded-lg ${fieldType.bg} flex items-center justify-center transition-colors group-hover:scale-105`}>
              <Icon className={`w-4.5 h-4.5 ${fieldType.color}`} />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 text-center leading-tight">
              {fieldType.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
