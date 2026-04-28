// TodoTab.tsx
// Daily checklist. Top: today's date + day name. Body: seeded (auto) section +
// manual section. Add box at bottom.

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Sparkles, Plus, X, Check } from 'lucide-react';
import type { TodoItem } from './profileTypes';
import {
  todoTodayLabel,
  todoFromScheduleLabel,
  todoMyTasksLabel,
  todoAddPlaceholder,
  todoAddButtonLabel,
  todoNoClassesTodayLabel,
  todoNoManualLabel,
  todoAutoBadgeLabel,
  longDayLabel,
  type Locale,
} from './scheduleI18n';

interface TodoTabProps {
  todos: TodoItem[];
  locale: Locale;
  addManual: (label: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

/* ─── Small pieces ──────────────────────────────────────────────────────── */

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`appearance-none w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
        checked
          ? 'bg-duo-purple border-duo-purple'
          : 'bg-white border-slate-300 hover:border-duo-purple/60'
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  );
}

interface TodoRowProps {
  item: TodoItem;
  onToggle: () => void;
  onRemove: () => void;
  locale: Locale;
}

const TodoRow: React.FC<TodoRowProps> = ({ item, onToggle, onRemove, locale }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/80 transition-colors"
    >
      <Checkbox checked={item.done} onChange={onToggle} />
      <span
        className={`flex-1 text-sm font-semibold ${
          item.done
            ? 'line-through text-slate-400'
            : 'text-slate-700'
        }`}
      >
        {item.label}
      </span>
      {item.source === 'auto' && (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-duo-purple-light text-[#8B3FD6] border border-duo-purple/30 px-2 py-0.5 text-[10px] font-bold">
          <Sparkles className="w-3 h-3" />
          <span>{todoAutoBadgeLabel(locale)}</span>
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="remove"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

/* ─── Main ──────────────────────────────────────────────────────────────── */

export function TodoTab({ todos, locale, addManual, toggle, remove }: TodoTabProps) {
  const [draft, setDraft] = useState('');

  const today = useMemo(() => new Date(), []);
  const jsDay = today.getDay(); // 0..6
  const isWeekend = jsDay === 5 || jsDay === 6;

  const dateLabel = useMemo(() => {
    // Locale-aware: use Intl for month/day string; fallback to simple ISO on error.
    try {
      return today.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: undefined,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return today.toISOString().slice(0, 10);
    }
  }, [today, locale]);

  const autoTodos = todos.filter(t => t.source === 'auto');
  const manualTodos = todos.filter(t => t.source === 'manual');

  const handleAdd = () => {
    addManual(draft);
    setDraft('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="max-w-[720px] mx-auto"
    >
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-1">
              {todoTodayLabel(locale)}
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {longDayLabel(jsDay, locale)}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{dateLabel}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
            <ListChecks className="w-6 h-6 text-white" />
          </div>
        </header>

        <div className="h-px bg-slate-200 mb-5" />

        {/* Auto / schedule-derived section */}
        <section className="mb-6">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>{todoFromScheduleLabel(locale)}</span>
          </h3>
          {isWeekend || autoTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-400">
                {todoNoClassesTodayLabel(locale)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {autoTodos.map(t => (
                  <TodoRow
                    key={t.id}
                    item={t}
                    onToggle={() => toggle(t.id)}
                    onRemove={() => remove(t.id)}
                    locale={locale}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Manual section */}
        <section className="mb-4">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <ListChecks className="w-3.5 h-3.5 text-violet-500" />
            <span>{todoMyTasksLabel(locale)}</span>
          </h3>
          {manualTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-400">
                {todoNoManualLabel(locale)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {manualTodos.map(t => (
                  <TodoRow
                    key={t.id}
                    item={t}
                    onToggle={() => toggle(t.id)}
                    onRemove={() => remove(t.id)}
                    locale={locale}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Add input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder={todoAddPlaceholder(locale)}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-purple/40 focus:border-duo-purple placeholder:text-slate-400 transition"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-duo-purple text-white px-4 py-2 text-sm font-bold shadow-sm hover:shadow-md hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{todoAddButtonLabel(locale)}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default TodoTab;
