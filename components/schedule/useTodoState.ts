// useTodoState.ts
// In-memory to-do list.
//
// NEW MODEL (derived-on-render):
//   - `manualTodos` are full TodoItems the user explicitly added.
//   - `autoOverrides` stores user actions (toggle done / remove) against
//     derived auto-seeded todos. The auto todos themselves are NOT stored;
//     they are computed live from `todaysPlacements` by the consumer
//     (TodoTab via ScheduleLayout), keyed by `auto-${day}-${slot}`.
//
// Why: previously we snapshot-seeded on teacher switch, which missed any
// placements added afterwards (schedule-tab drag → todo-tab showed nothing).
// Now, adding a placement instantly produces an auto todo; removing a
// placement drops it — unless the user explicitly overrode it.

import { useCallback, useState } from 'react';
import type { TodoItem } from './profileTypes';

/** Per-auto-todo user override. Keyed by the derived id `auto-${day}-${slot}`. */
export interface AutoOverride {
  done?: boolean;
  removed?: boolean;
}

export interface UseTodoStateReturn {
  /** User-added manual todos (full items). */
  manualTodos: TodoItem[];
  /** Map of auto-id → user override (done / removed). */
  autoOverrides: Record<string, AutoOverride>;
  /**
   * True if the user has any manual todos OR has touched any auto todo
   * (toggle or remove). Used by the teacher-switch dirty check.
   */
  hasUserMutations: boolean;
  addManual: (label: string) => void;
  /**
   * Toggle done state. If `id` starts with `auto-`, flips the override
   * (falling back to the passed `currentDerivedDone`). Else toggles manual.
   */
  toggle: (id: string, currentDerivedDone?: boolean) => void;
  /** Remove. Auto → override.removed=true; Manual → drop from list. */
  remove: (id: string) => void;
  /** Clear both lists (teacher switch = clean slate). */
  resetForTeacher: (nextTeacherId: string) => void;
}

export function useTodoState(_initialTeacherId: string): UseTodoStateReturn {
  const [manualTodos, setManualTodos] = useState<TodoItem[]>([]);
  const [autoOverrides, setAutoOverrides] = useState<
    Record<string, AutoOverride>
  >({});

  const addManual = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `manual-${Math.random().toString(36).slice(2, 10)}`;
    setManualTodos(prev => [
      ...prev,
      { id, label: trimmed, done: false, source: 'manual' },
    ]);
  }, []);

  const toggle = useCallback(
    (id: string, currentDerivedDone?: boolean) => {
      if (id.startsWith('auto-')) {
        setAutoOverrides(prev => {
          const existing = prev[id];
          // Prefer the current derived value passed by the consumer so the
          // flip reflects what's actually on screen.
          const base =
            existing?.done !== undefined ? existing.done : currentDerivedDone ?? false;
          return {
            ...prev,
            [id]: { ...existing, done: !base },
          };
        });
      } else {
        setManualTodos(prev =>
          prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
        );
      }
    },
    [],
  );

  const remove = useCallback((id: string) => {
    if (id.startsWith('auto-')) {
      setAutoOverrides(prev => ({
        ...prev,
        [id]: { ...prev[id], removed: true },
      }));
    } else {
      setManualTodos(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const resetForTeacher = useCallback((_nextTeacherId: string) => {
    setManualTodos([]);
    setAutoOverrides({});
  }, []);

  const hasUserMutations =
    manualTodos.length > 0 || Object.keys(autoOverrides).length > 0;

  return {
    manualTodos,
    autoOverrides,
    hasUserMutations,
    addManual,
    toggle,
    remove,
    resetForTeacher,
  };
}
