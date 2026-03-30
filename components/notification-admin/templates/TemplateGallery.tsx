import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Eye, PlayCircle, GraduationCap, Settings, CalendarDays,
  AlertTriangle, PartyPopper, Pencil, BarChart3,
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { ChannelIcon } from '../shared/ChannelIcon';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import type { NotificationTemplate, TemplateCategory } from '../../../types/notification';

// --- Category config ---

const CATEGORY_CONFIG: Record<TemplateCategory, {
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}> = {
  academic: {
    label: 'أكاديمي',
    icon: GraduationCap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  administrative: {
    label: 'إداري',
    icon: Settings,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  event: {
    label: 'فعاليات',
    icon: CalendarDays,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  emergency: {
    label: 'طوارئ',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  celebration: {
    label: 'احتفالات',
    icon: PartyPopper,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  custom: {
    label: 'مخصص',
    icon: Pencil,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

const ALL_CATEGORIES: TemplateCategory[] = [
  'academic', 'administrative', 'event', 'emergency', 'celebration', 'custom',
];

// --- Component ---

interface TemplateGalleryProps {
  onUseTemplate: (template: NotificationTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onUseTemplate }) => {
  const { state } = useNotifications();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return state.templates;
    return state.templates.filter((t) => t.category === activeCategory);
  }, [state.templates, activeCategory]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">القوالب</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            استخدم القوالب الجاهزة لإنشاء إشعارات بسرعة
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span>قالب جديد</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          الكل ({state.templates.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const count = state.templates.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? `${config.bg} ${config.color} ${config.border} border shadow-sm`
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <config.icon className="w-4 h-4" />
              <span>{config.label}</span>
              {count > 0 && (
                <span className={`text-xs ${activeCategory === cat ? 'opacity-70' : 'text-slate-400'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">لا توجد قوالب في هذه الفئة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => {
              const catConfig = CATEGORY_CONFIG[template.category];
              const CatIcon = catConfig.icon;

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all group"
                >
                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${catConfig.bg} ${catConfig.color}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      {catConfig.label}
                    </span>
                    {template.isSystem && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        نظام
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-black text-slate-800 mb-1 leading-tight">
                    {template.name}
                  </h3>

                  {/* Description */}
                  {template.description && (
                    <p className="text-sm font-medium text-slate-400 mb-4 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Channel icons + usage */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {template.channels.map((ch) => (
                        <ChannelIcon key={ch} channel={ch} size={16} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      استخدام: {template.usageCount}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة</span>
                    </button>
                    <button
                      onClick={() => onUseTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold hover:shadow-md hover:shadow-sky-500/20 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>استخدام</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(tmpl) => {
          setPreviewTemplate(null);
          onUseTemplate(tmpl);
        }}
      />
    </div>
  );
};
