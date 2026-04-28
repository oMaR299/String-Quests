// ScheduleLayout.tsx
// Route entry for the Schedule module. Now a THREE-TAB container:
//   - Schedule (SchedulePlannerTab) — original planner
//   - Profile (ProfileTab)          — teacher info form
//   - To-Do   (TodoTab)             — today's checklist
//
// Owns:
//   - useScheduleState (classes + placements + breaks; reducer)
//   - useProfileState  (per-teacher profile, in-memory)
//   - useTodoState     (per-teacher to-do list, in-memory)
//   - activeTab + pendingAction + ConfirmDialog
//   - Teacher switch dirty check (expanded to include profile + todos)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  CalendarDays,
  UserCircle2,
  ListChecks,
} from 'lucide-react';
import {
  type ClassItem,
  type PendingAction,
  type Placement,
  slotKey,
} from './scheduleTypes';
import { useScheduleState } from './useScheduleState';
import { useProfileState } from './useProfileState';
import { useTodoState } from './useTodoState';
import { isProfileDirty, type TodoItem } from './profileTypes';
import { getTeachers } from './scheduleMockData';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SchedulePlannerTab } from './SchedulePlannerTab';
import { ProfileTab } from './ProfileTab';
import { TodoTab } from './TodoTab';
import {
  backToHomeLabel,
  cancelButtonLabel,
  classGradeSectionLabel,
  confirmButtonLabel,
  confirmCopyFor,
  dayLabel,
  localeToggleLabel,
  periodLabel,
  scheduleModuleSubtitle,
  scheduleModuleTitle,
  subjectLabel,
  switchTeacherLabel,
  tabScheduleLabel,
  tabProfileLabel,
  tabTodoLabel,
  todoPrepPrefix,
  type Locale,
} from './scheduleI18n';

interface ScheduleLayoutProps {
  onExit: () => void;
}

type TabId = 'schedule' | 'profile' | 'todo';

/**
 * Map JavaScript Date.getDay() (0=Sun..6=Sat) to this module's day index
 * (0=Sun..4=Thu). Returns null for Fri/Sat — the school weekend.
 */
function todayScheduleDayIndex(): number | null {
  const d = new Date().getDay();
  if (d >= 0 && d <= 4) return d;
  return null;
}

/** Build "Prep G5-B Math · P3" label from a placement. */
function buildPrepLabel(
  p: Placement,
  c: ClassItem,
  locale: Locale,
): string {
  const prefix = todoPrepPrefix(locale);
  const gs = classGradeSectionLabel(c.grade, c.section, locale);
  const subj = subjectLabel(c.subject, locale);
  const per = periodLabel(p.slot, locale);
  return `${prefix} ${gs} ${subj} · ${per}`;
}

export function ScheduleLayout({ onExit }: ScheduleLayoutProps) {
  const teachers = useMemo(() => getTeachers(), []);
  const initialTeacherId = teachers[0].id;

  const {
    state,
    setTeacher,
    place,
    remove,
    clearWeek,
    insertBreak,
    removeBreak,
  } = useScheduleState(initialTeacherId);

  const [locale, setLocale] = useState<Locale>('ar');
  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const [activeTab, setActiveTab] = useState<TabId>('schedule');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // ── Profile + Todo hooks ──────────────────────────────────────────────
  const profileState = useProfileState(state.teacherId);
  const { profile, setField, setPhoto, resetProfile, baselineNameAr, baselineNameEn } =
    profileState;

  // Derived maps that both planner + todo seeding need.
  const classById = useMemo(() => {
    const m = new Map<string, ClassItem>();
    for (const c of state.classes) m.set(c.id, c);
    return m;
  }, [state.classes]);

  const placementsBySlot = useMemo(() => {
    const m = new Map<string, Placement>();
    for (const p of state.placements) m.set(slotKey(p.day, p.slot), p);
    return m;
  }, [state.placements]);

  // Today's placements, sorted by slot, filtered to today's DOW.
  const todaysDayIdx = todayScheduleDayIndex();
  const todaysPlacements = useMemo(() => {
    if (todaysDayIdx == null) return [];
    return state.placements
      .filter(p => p.day === todaysDayIdx)
      .slice()
      .sort((a, b) => a.slot - b.slot);
  }, [state.placements, todaysDayIdx]);

  const todoState = useTodoState(state.teacherId);
  const {
    manualTodos,
    autoOverrides,
    hasUserMutations: todosHaveUserMutations,
    addManual,
    toggle,
    remove: removeTodo,
    resetForTeacher: resetTodos,
  } = todoState;

  // Derive auto todos live from today's placements + current locale +
  // user overrides. This fixes the "placed after teacher switch" bug and
  // makes labels re-render in the current locale for free.
  const autoTodos = useMemo<TodoItem[]>(() => {
    const items: TodoItem[] = [];
    for (const p of todaysPlacements) {
      const id = `auto-${p.day}-${p.slot}`;
      const override = autoOverrides[id];
      if (override?.removed) continue;
      const c = classById.get(p.classId);
      if (!c) continue;
      items.push({
        id,
        label: buildPrepLabel(p, c, locale),
        done: override?.done ?? false,
        source: 'auto',
      });
    }
    return items;
  }, [todaysPlacements, classById, autoOverrides, locale]);

  // Merged list for TodoTab (which splits by `source` internally).
  const todos = useMemo<TodoItem[]>(
    () => [...autoTodos, ...manualTodos],
    [autoTodos, manualTodos],
  );

  // Wrapper so TodoTab can keep the simple `(id) => void` signature while
  // the hook still gets the current derived done value for auto items.
  const handleToggle = useCallback(
    (id: string) => {
      if (id.startsWith('auto-')) {
        const item = autoTodos.find(t => t.id === id);
        toggle(id, item?.done ?? false);
      } else {
        toggle(id);
      }
    },
    [autoTodos, toggle],
  );

  // ── Teacher switch with expanded dirty check ─────────────────────────
  const pendingActionRef = useRef<PendingAction | null>(pendingAction);
  pendingActionRef.current = pendingAction;

  const handleSwitchTeacher = useCallback(
    (nextId: string) => {
      if (nextId === state.teacherId) return;
      const hasPlan = state.placements.length > 0 || state.breaks.length > 0;
      const hasProfile = isProfileDirty(profile, baselineNameAr, baselineNameEn);
      const hasTodos = todosHaveUserMutations;
      if (hasPlan || hasProfile || hasTodos) {
        setPendingAction({ kind: 'switchTeacher', nextTeacherId: nextId });
      } else {
        setTeacher(nextId);
      }
    },
    [
      state.teacherId,
      state.placements.length,
      state.breaks.length,
      profile,
      baselineNameAr,
      baselineNameEn,
      todosHaveUserMutations,
      setTeacher,
    ],
  );

  // When teacher actually changes (reducer applied), cascade-reset profile
  // and todos. Auto todos are derived from placements (which the schedule
  // reducer already cleared on SET_TEACHER), so resetting todos is just a
  // matter of dropping manual items and any overrides.
  const lastTeacherIdRef = useRef<string>(state.teacherId);
  useEffect(() => {
    if (lastTeacherIdRef.current === state.teacherId) return;
    lastTeacherIdRef.current = state.teacherId;
    resetProfile(state.teacherId);
    resetTodos(state.teacherId);
  }, [state.teacherId, resetProfile, resetTodos]);

  // ── Confirm dialog apply ─────────────────────────────────────────────
  const applyPendingAction = useCallback(() => {
    if (!pendingAction) return;
    switch (pendingAction.kind) {
      case 'clearWeek':
        clearWeek();
        break;
      case 'removeSlot':
        remove(pendingAction.day, pendingAction.slot);
        break;
      case 'overwriteSlot': {
        const { incoming } = pendingAction;
        place(incoming);
        break;
      }
      case 'exceedQuota': {
        const { classId, day, slot } = pendingAction;
        place({ classId, day, slot });
        break;
      }
      case 'switchTeacher':
        setTeacher(pendingAction.nextTeacherId);
        break;
    }
    setPendingAction(null);
  }, [pendingAction, clearWeek, remove, place, setTeacher]);

  const cancelPendingAction = useCallback(() => setPendingAction(null), []);

  // ── Keyboard shortcut: Shift+Ctrl+K → clear-week confirm (Schedule tab only) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t) {
        if (
          t instanceof HTMLInputElement ||
          t instanceof HTMLTextAreaElement ||
          t instanceof HTMLSelectElement ||
          t.isContentEditable
        ) {
          return;
        }
      }
      if (pendingActionRef.current) return;
      if (e.shiftKey && e.ctrlKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        setPendingAction({ kind: 'clearWeek' });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ── Confirm dialog copy context ──────────────────────────────────────
  const dialogCopy = useMemo(() => {
    if (!pendingAction) return null;
    const ctx: Parameters<typeof confirmCopyFor>[2] = {};

    if (pendingAction.kind === 'removeSlot') {
      ctx.dayName = dayLabel(pendingAction.day, locale);
      ctx.periodName = periodLabel(pendingAction.slot, locale);
    }
    if (pendingAction.kind === 'overwriteSlot') {
      ctx.dayName = dayLabel(pendingAction.day, locale);
      ctx.periodName = periodLabel(pendingAction.slot, locale);
      const incoming = pendingAction.incoming;
      const c = classById.get(incoming.classId);
      ctx.className = c
        ? `${subjectLabel(c.subject, locale)} · ${classGradeSectionLabel(c.grade, c.section, locale)}`
        : '';
      ctx.target = c?.weeklyTarget;
      const existing = placementsBySlot.get(
        slotKey(pendingAction.day, pendingAction.slot),
      );
      if (existing) {
        const oc = classById.get(existing.classId);
        ctx.outgoingClassName = oc
          ? `${subjectLabel(oc.subject, locale)} · ${classGradeSectionLabel(oc.grade, oc.section, locale)}`
          : '';
      }
    }
    if (pendingAction.kind === 'exceedQuota') {
      const c = classById.get(pendingAction.classId);
      ctx.className = c
        ? `${subjectLabel(c.subject, locale)} · ${classGradeSectionLabel(c.grade, c.section, locale)}`
        : '';
      ctx.target = c?.weeklyTarget;
    }
    return confirmCopyFor(pendingAction, locale, ctx);
  }, [pendingAction, locale, classById, placementsBySlot]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  /* ─── Tab pill bar ───────────────────────────────────────────────── */
  const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'schedule', label: tabScheduleLabel(locale), icon: CalendarDays },
    { id: 'profile', label: tabProfileLabel(locale), icon: UserCircle2 },
    { id: 'todo', label: tabTodoLabel(locale), icon: ListChecks },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <SchedulePlannerTab
            classes={state.classes}
            placements={state.placements}
            breaks={state.breaks}
            locale={locale}
            place={place}
            insertBreak={insertBreak}
            removeBreak={removeBreak}
            setPendingAction={setPendingAction}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            profile={profile}
            locale={locale}
            setField={setField}
            setPhoto={setPhoto}
          />
        );
      case 'todo':
        return (
          <TodoTab
            todos={todos}
            locale={locale}
            addManual={addManual}
            toggle={handleToggle}
            remove={removeTodo}
          />
        );
    }
  };

  return (
    <motion.div
      dir={dir}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="relative min-h-screen font-cairo text-slate-800 bg-slate-100"
    >
      {/* Ambient pastel wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 0% -10%, rgba(199, 184, 234, 0.28), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(167, 199, 231, 0.28), transparent 55%), radial-gradient(700px 500px at 50% 110%, rgba(248, 200, 220, 0.18), transparent 60%)',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 h-16 lg:h-[4.5rem] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <BackIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{backToHomeLabel(locale)}</span>
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-black text-slate-900 leading-none tracking-tight truncate">
                {scheduleModuleTitle(locale)}
              </h1>
              <p className="mt-1 text-[10px] lg:text-[11px] font-bold text-violet-500 uppercase tracking-widest truncate">
                {scheduleModuleSubtitle(locale)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur px-2.5 py-1.5 shadow-sm hover:shadow hover:border-violet-300 transition">
            <span className="hidden md:inline text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {switchTeacherLabel(locale)}
            </span>
            <select
              value={state.teacherId}
              onChange={(e) => handleSwitchTeacher(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-700 focus:outline-none cursor-pointer max-w-[160px]"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {locale === 'ar' ? t.nameAr : t.nameEn}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => setLocale(l => (l === 'ar' ? 'en' : 'ar'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{localeToggleLabel(locale)}</span>
          </button>
        </div>
      </header>

      {/* Tab pill bar */}
      <div className="relative px-4 lg:px-8 pt-4 lg:pt-5">
        <div className="flex gap-2">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={
                  active
                    ? 'inline-flex items-center gap-2 bg-white shadow-md text-slate-900 border border-slate-200 rounded-full px-4 py-2 text-sm font-bold ring-2 ring-duo-purple/20 transition'
                    : 'inline-flex items-center gap-2 bg-white/70 hover:bg-white/90 text-slate-600 border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold transition'
                }
              >
                <Icon className={active ? 'w-4 h-4 text-violet-600' : 'w-4 h-4'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <main className="relative px-4 lg:px-8 py-4 lg:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + ':' + state.teacherId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!pendingAction && !!dialogCopy}
        title={dialogCopy?.title ?? ''}
        body={dialogCopy?.body ?? ''}
        destructive={dialogCopy?.destructive}
        confirmLabel={confirmButtonLabel(locale)}
        cancelLabel={cancelButtonLabel(locale)}
        locale={locale}
        onConfirm={applyPendingAction}
        onCancel={cancelPendingAction}
      />
    </motion.div>
  );
}

export default ScheduleLayout;
