/**
 * sq-AdminShell — page shell with sticky header + tab pills + main pane.
 *
 * Generalised from TopicManagerLayout / ScheduleLayout / NotificationLayout.
 * The shell wraps three slots:
 *   - eyebrow / module title (top-left)
 *   - tab pills (sticky, scrollable)
 *   - main content (scrollable)
 *
 * Designed to be embedded inside an existing route. Nothing here is
 * locale-specific; consumer wires it up with their own t() function.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface SqAdminShellTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface SqAdminShellProps {
  /** Module title shown in the header. */
  title: string;
  /** Small eyebrow above the title. */
  eyebrow?: string;
  /** Optional right-side header slot (e.g. locale toggle). */
  rightSlot?: React.ReactNode;
  tabs: SqAdminShellTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
  /** Callback when the shell wants to "exit" (back to home). Optional. */
  onExit?: () => void;
  exitLabel?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const SqAdminShell: React.FC<SqAdminShellProps> = ({
  title,
  eyebrow,
  rightSlot,
  tabs,
  activeTab,
  onTabChange,
  children,
  onExit,
  exitLabel = 'Back',
  className = '',
  dir = 'ltr',
}) => {
  return (
    <div
      className={`flex flex-col h-full bg-sq-cloud font-cairo text-slate-800 ${className}`}
      dir={dir}
    >
      {/* Sticky header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
        <div className="px-4 lg:px-8 py-3 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <span className="block text-[10px] font-bold text-sq-brand-500 uppercase tracking-widest">
                {eyebrow}
              </span>
            )}
            <h1 className="text-lg lg:text-xl font-black text-slate-900 leading-tight tracking-tight truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rightSlot}
            {onExit && (
              <button
                onClick={onExit}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                {exitLabel}
              </button>
            )}
          </div>
        </div>

        {/* Tab pills */}
        <nav className="px-4 lg:px-8 pb-2.5">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => !tab.disabled && onTabChange(tab.id)}
                  disabled={tab.disabled}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-brand-500/40 ${
                    tab.disabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                  }`}
                >
                  {isActive && !tab.disabled && (
                    <motion.span
                      layoutId="sq-admin-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
                      className="absolute inset-0 rounded-full bg-sq-brand-500 shadow-sm shadow-violet-500/30"
                    />
                  )}
                  {Icon && (
                    <Icon className={`relative w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  )}
                  <span className="relative whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main pane */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-4 lg:px-8 py-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SqAdminShell;
