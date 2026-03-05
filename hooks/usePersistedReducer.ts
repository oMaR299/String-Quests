import { useReducer, useEffect, Reducer, Dispatch } from 'react';

export function usePersistedReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initialState: S
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initial, ...parsed };
      }
    } catch (e) {
      console.warn(`Failed to load state from localStorage key "${key}":`, e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn(`Failed to save state to localStorage key "${key}":`, e);
    }
  }, [key, state]);

  return [state, dispatch];
}
