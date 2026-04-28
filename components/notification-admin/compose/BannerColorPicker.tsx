import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface GradientOption {
  id: string;
  classes: string;
  label: string;
}

const GRADIENT_OPTIONS: GradientOption[] = [
  { id: 'from-blue-500 to-indigo-600', classes: 'bg-gradient-to-r from-blue-500 to-indigo-600', label: 'أزرق' },
  { id: 'from-emerald-500 to-teal-600', classes: 'bg-gradient-to-r from-emerald-500 to-teal-600', label: 'أخضر' },
  { id: 'from-purple-500 to-pink-500', classes: 'bg-gradient-to-r from-purple-500 to-pink-500', label: 'بنفسجي' },
  { id: 'from-red-600 to-orange-500', classes: 'bg-gradient-to-r from-red-600 to-orange-500', label: 'أحمر — عاجل' },
  { id: 'from-amber-400 to-orange-500', classes: 'bg-gradient-to-r from-amber-400 to-orange-500', label: 'برتقالي' },
  { id: 'from-sky-400 to-blue-500', classes: 'bg-gradient-to-r from-sky-400 to-blue-500', label: 'سماوي' },
  { id: 'from-rose-400 to-pink-500', classes: 'bg-gradient-to-r from-rose-400 to-pink-500', label: 'وردي' },
  { id: 'from-slate-600 to-slate-800', classes: 'bg-gradient-to-r from-slate-600 to-slate-800', label: 'رمادي' },
];

interface BannerColorPickerProps {
  value: string;
  onChange: (gradient: string) => void;
}

export const BannerColorPicker: React.FC<BannerColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <div className="grid grid-cols-4 gap-3">
          {GRADIENT_OPTIONS.map((option) => {
            const isSelected = value === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(option.id)}
                className="relative group"
              >
                <div
                  className={`h-14 rounded-xl ${option.classes} transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-duo-purple shadow-lg'
                      : 'hover:shadow-md hover:scale-105'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-1.5 block text-center">
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Preview bar */}
        {value && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-xs font-bold text-slate-400 mb-2">معاينة الشريط</p>
            <div
              className={`bg-gradient-to-r ${value} rounded-xl px-4 py-3 flex items-center justify-between`}
            >
              <span className="text-white text-sm font-bold">نص الإشعار سيظهر هنا</span>
              <button
                type="button"
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors"
              >
                تفاصيل
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
