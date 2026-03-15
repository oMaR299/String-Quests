import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Radar, Sparkles, TreePine, Dna, BookOpen, Clock, GraduationCap } from 'lucide-react';

export type VisualizationMode = 'heatmap' | 'radar' | 'galaxy' | 'tree' | 'dna' | 'textbook' | 'memory' | 'curriculum';

interface ModeDef {
  id: VisualizationMode;
  labelAr: string;
  labelEn: string;
  icon: React.ElementType;
}

const MODES: ModeDef[] = [
  { id: 'heatmap', labelAr: 'خريطة حرارية', labelEn: 'Heat Map', icon: Grid3X3 },
  { id: 'radar', labelAr: 'رادار', labelEn: 'Radar', icon: Radar },
  { id: 'galaxy', labelAr: 'مجرة', labelEn: 'Galaxy', icon: Sparkles },
  { id: 'tree', labelAr: 'شجرة', labelEn: 'Tree', icon: TreePine },
  { id: 'dna', labelAr: 'حمض نووي', labelEn: 'DNA', icon: Dna },
  { id: 'textbook', labelAr: 'الكتاب المدرسي', labelEn: 'Textbook', icon: BookOpen },
  { id: 'memory', labelAr: 'الذاكرة', labelEn: 'Memory', icon: Clock },
  { id: 'curriculum', labelAr: 'المنهاج', labelEn: 'Curriculum', icon: GraduationCap },
];

interface Props {
  active: VisualizationMode;
  onChange: (mode: VisualizationMode) => void;
  locale: string;
}

export const VisualizationModeSwitcher: React.FC<Props> = ({ active, onChange, locale }) => {
  return (
    <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              transition-colors duration-150 whitespace-nowrap
              ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="mode-bg"
                className="absolute inset-0 bg-slate-800 rounded-xl"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? mode.labelAr : mode.labelEn}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
