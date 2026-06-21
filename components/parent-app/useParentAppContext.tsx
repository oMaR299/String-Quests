// useParentAppContext.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tiny context shared by every screen inside `ParentHomeLayout`. Owns:
//
//   • activeChildId      — Always a specific child id (single child mode only).
//                          Defaults to the first child. Persists across tab
//                          changes so toggling a pill on Home is reflected on
//                          Profile / Skill Map / etc. once those tabs are real.
//   • setActiveChildId
//   • lastUpdatedAt      — Number (epoch ms). Bumped by the manual refresh
//                          button in the header so dependent components can
//                          show "Updated just now" microcopy.
//   • bumpLastUpdated
//   • state              — The full mock state object. The `children` array
//                          is owned here as React state so the "+ add child"
//                          flow on Home can append new entries at runtime.
//   • activeChild        — Convenience: the resolved active child. Always non-null
//                          assuming the children array isn't empty.
//   • addChild           — Append a new MockChild to the list AND auto-switch
//                          the active pill to it (so the Hero card immediately
//                          reflects the just-added child).
//
// State is intentionally in-memory only. Refresh resets everything for v1.

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { MOCK_PARENT_APP_STATE, type MockChild, type ParentAppState } from './parentAppMockData';

export type ActiveChildId = string;

interface ParentAppContextValue {
  state: ParentAppState;
  activeChildId: ActiveChildId;
  setActiveChildId: (next: ActiveChildId) => void;
  activeChild: MockChild;
  lastUpdatedAt: number;
  bumpLastUpdated: () => void;
  /**
   * Append a brand-new child to the list and auto-switch the active pill to
   * it. The caller is responsible for picking a unique id, name, avatar
   * color, and zeroed-out stats — see `AddChildSheet` for the canonical use.
   */
  addChild: (child: MockChild) => void;
  /**
   * True while ANY logistics drawer (Calendar / Assignments / Exams /
   * Tomorrow's bag / Forms / Attendance) is open. Wired by
   * `SchoolLogisticsStrip` via an effect that mirrors its local `drawerKey`
   * state into context. `ParentHomeLayout` reads this to hide the bottom
   * tab bar so drawer content has the full viewport — and so the parent
   * doesn't accidentally tab-navigate while reading their kid's stuff.
   *
   * Note: the standalone AddChildSheet is NOT wired here (it's a single
   * sheet, not part of the logistics sequence and intentionally feels
   * lightweight — tapping the avatar `+` doesn't dismiss the tab bar).
   */
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  /**
   * True while a FULL-SCREEN hub overlay (subject detail / learn-more) is open.
   * ParentHomeLayout hides BOTH the top header and the bottom tab bar so the
   * overlay owns the entire phone frame. Distinct from `isDrawerOpen` (bottom
   * sheets only hide the tab bar and keep the header visible).
   */
  isOverlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
  /**
   * True while a drawer is in a sub-mode where horizontal swipe navigation
   * between drawers must be suppressed (currently: FormsDrawer's "fill" mode
   * — the parent is filling out a form and a sideways swipe should NOT
   * teleport them to the Attendance drawer). The strip reads this to gate
   * the BottomSheet's swipe handlers without mounting/unmounting the sheet.
   */
  swipeLocked: boolean;
  setSwipeLocked: (locked: boolean) => void;
}

const ParentAppContext = createContext<ParentAppContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  /** Optional override for testing / future real data. */
  initialState?: ParentAppState;
}

export function ParentAppProvider({
  children,
  initialState = MOCK_PARENT_APP_STATE,
}: ProviderProps) {
  // Children list owned as state so we can mutate it via `addChild`. Other
  // top-level fields (celebrations, deadlines, …) remain static for v1.
  const [childrenList, setChildrenList] = useState<MockChild[]>(
    () => initialState.children
  );
  const [activeChildId, setActiveChildId] = useState<ActiveChildId>(() => {
    // Default to the first child. The "All" / multi-child aggregate mode was
    // removed in v1.2 — Parent App is now single-child-at-a-time.
    return initialState.children[0]?.id ?? '';
  });
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(() => Date.now());

  // Logistics-drawer open flag. Mirrored into context from
  // `SchoolLogisticsStrip` so the layout can hide the bottom tab bar while a
  // drawer is open (UX: drawers are modal — full viewport, no accidental tab
  // navigation while the parent reads). See ParentHomeLayout.
  const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpenState(open);
  }, []);
  const [isOverlayOpen, setIsOverlayOpenState] = useState<boolean>(false);
  const setOverlayOpen = useCallback((open: boolean) => {
    setIsOverlayOpenState(open);
  }, []);
  const [swipeLocked, setSwipeLockedState] = useState<boolean>(false);
  const setSwipeLocked = useCallback((locked: boolean) => {
    setSwipeLockedState(locked);
  }, []);

  const bumpLastUpdated = useCallback(() => {
    setLastUpdatedAt(Date.now());
  }, []);

  const addChild = useCallback((child: MockChild) => {
    setChildrenList((prev) => {
      // Defensive: don't insert a duplicate id (would break React keys).
      if (prev.some((c) => c.id === child.id)) return prev;
      return [...prev, child];
    });
    // Auto-switch active pill to the new child so the Hero card reflects it
    // immediately. The user's mental model is "I just added them — show me
    // their stuff."
    setActiveChildId(child.id);
  }, []);

  // Re-derive the full state object whenever the mutable slice changes so
  // consumers reading `state.children` see fresh data. Spread the original
  // initialState to preserve celebrations / deadlines / messages / etc.
  const state = useMemo<ParentAppState>(
    () => ({ ...initialState, children: childrenList }),
    [initialState, childrenList]
  );

  const activeChild = useMemo<MockChild>(() => {
    const found = childrenList.find((c) => c.id === activeChildId);
    // Fallback to first child if the active id has somehow drifted away.
    return found ?? childrenList[0];
  }, [activeChildId, childrenList]);

  const value = useMemo<ParentAppContextValue>(
    () => ({
      state,
      activeChildId,
      setActiveChildId,
      activeChild,
      lastUpdatedAt,
      bumpLastUpdated,
      addChild,
      isDrawerOpen,
      setDrawerOpen,
      isOverlayOpen,
      setOverlayOpen,
      swipeLocked,
      setSwipeLocked,
    }),
    [
      state,
      activeChildId,
      activeChild,
      lastUpdatedAt,
      bumpLastUpdated,
      addChild,
      isDrawerOpen,
      setDrawerOpen,
      isOverlayOpen,
      setOverlayOpen,
      swipeLocked,
      setSwipeLocked,
    ]
  );

  return (
    <ParentAppContext.Provider value={value}>
      {children}
    </ParentAppContext.Provider>
  );
}

export function useParentAppContext(): ParentAppContextValue {
  const ctx = useContext(ParentAppContext);
  if (!ctx) {
    throw new Error('useParentAppContext must be used within ParentAppProvider');
  }
  return ctx;
}

/**
 * Returns the slice of children to render for the active filter. In single-
 * child mode this is always exactly one child — the active one.
 */
export function useFilteredChildren(): MockChild[] {
  const { state, activeChildId } = useParentAppContext();
  return useMemo(
    () => state.children.filter((c) => c.id === activeChildId),
    [activeChildId, state.children]
  );
}
