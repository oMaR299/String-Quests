import React from 'react';
import { Clock } from 'lucide-react';

export type TimeRange = 'all' | '30d' | '7d' | 'today';

interface TimePreset {
  id: TimeRange;
  labelAr: string;
  labelEn: string;
}

const PRESETS: TimePreset[] = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All Time' },
  { id: '30d', labelAr: '30 يوم', labelEn: '30 Days' },
  { id: '7d', labelAr: '7 أيام', labelEn: '7 Days' },
  { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
];

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  locale: string;
}

export function getTimeRangeMs(range: TimeRange): { start: number; end: number } {
  const now = Date.now();
  switch (range) {
    case 'today': {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return { start: todayStart.getTime(), end: now };
    }
    case '7d':
      return { start: now - 7 * 86400000, end: now };
    case '30d':
      return { start: now - 30 * 86400000, end: now };
    case 'all':
    default:
      return { start: 0, end: now };
  }
}

export const TimeSlider: React.FC<Props> = ({ value, onChange, locale }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
      <Clock className="w-4 h-4 text-slate-400 ml-2" />
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            ${value === preset.id
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'}
          `}
        >
          {locale === 'ar' ? preset.labelAr : preset.labelEn}
        </button>
      ))}
    </div>
  );
};
