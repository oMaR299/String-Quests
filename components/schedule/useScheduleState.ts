// useScheduleState.ts
// Reducer-backed state for the Schedule module.
// Actions: SET_TEACHER, PLACE, REMOVE, CLEAR_WEEK, INSERT_BREAK, REMOVE_BREAK.
//
// Breaks are inter-slot dividers — they live in `state.breaks` indexed by
// (day, gapIndex) and NOT as placements. At most one break per (day, gapIndex);
// INSERT_BREAK is idempotent.

import { useCallback, useReducer } from 'react';
import type { DayBreak, Placement, ScheduleState } from './scheduleTypes';
import { getClassesForTeacher, getTeachers } from './scheduleMockData';

type Action =
  | { type: 'SET_TEACHER'; teacherId: string }
  | { type: 'PLACE'; placement: Placement }
  | { type: 'REMOVE'; day: number; slot: number }
  | { type: 'CLEAR_WEEK' }
  | { type: 'INSERT_BREAK'; day: number; gapIndex: number }
  | { type: 'REMOVE_BREAK'; day: number; gapIndex: number };

function reducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case 'SET_TEACHER': {
      if (action.teacherId === state.teacherId) return state;
      return {
        teacherId: action.teacherId,
        classes: getClassesForTeacher(action.teacherId),
        placements: [],
        breaks: [],
      };
    }
    case 'PLACE': {
      const { day, slot } = action.placement;
      // Overwrite any existing placement at the same (day, slot).
      const remaining = state.placements.filter(
        p => !(p.day === day && p.slot === slot),
      );
      return { ...state, placements: [...remaining, action.placement] };
    }
    case 'REMOVE': {
      return {
        ...state,
        placements: state.placements.filter(
          p => !(p.day === action.day && p.slot === action.slot),
        ),
      };
    }
    case 'CLEAR_WEEK':
      return { ...state, placements: [], breaks: [] };

    case 'INSERT_BREAK': {
      // Idempotent — if a break already exists at this gap, no-op.
      const exists = state.breaks.some(
        b => b.day === action.day && b.gapIndex === action.gapIndex,
      );
      if (exists) return state;
      const next: DayBreak = { day: action.day, gapIndex: action.gapIndex };
      return { ...state, breaks: [...state.breaks, next] };
    }

    case 'REMOVE_BREAK': {
      return {
        ...state,
        breaks: state.breaks.filter(
          b => !(b.day === action.day && b.gapIndex === action.gapIndex),
        ),
      };
    }

    default:
      return state;
  }
}

function initialState(teacherId: string): ScheduleState {
  // Guard: empty/falsy teacherId would propagate to hashString-based class
  // generation and potentially throw. Fall back to the first mock teacher.
  const safeId =
    teacherId && teacherId.length > 0 ? teacherId : getTeachers()[0]?.id ?? '';
  return {
    teacherId: safeId,
    classes: getClassesForTeacher(safeId),
    placements: [],
    breaks: [],
  };
}

export function useScheduleState(initialTeacherId: string) {
  const [state, dispatch] = useReducer(reducer, initialTeacherId, initialState);

  const setTeacher = useCallback((teacherId: string) => {
    dispatch({ type: 'SET_TEACHER', teacherId });
  }, []);

  const place = useCallback((placement: Placement) => {
    dispatch({ type: 'PLACE', placement });
  }, []);

  const remove = useCallback((day: number, slot: number) => {
    dispatch({ type: 'REMOVE', day, slot });
  }, []);

  const clearWeek = useCallback(() => {
    dispatch({ type: 'CLEAR_WEEK' });
  }, []);

  const insertBreak = useCallback((day: number, gapIndex: number) => {
    dispatch({ type: 'INSERT_BREAK', day, gapIndex });
  }, []);

  const removeBreak = useCallback((day: number, gapIndex: number) => {
    dispatch({ type: 'REMOVE_BREAK', day, gapIndex });
  }, []);

  return {
    state,
    setTeacher,
    place,
    remove,
    clearWeek,
    insertBreak,
    removeBreak,
  };
}

// Re-exported so tests can import the pure reducer.
export { reducer as scheduleReducer };
export type { Action as ScheduleAction };
