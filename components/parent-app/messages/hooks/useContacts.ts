// useContacts.ts
// ─────────────────────────────────────────────────────────────────────────────
// Read-only selector hook over the static MOCK_CONTACTS list. Returns slices
// filtered for the active child (mentor, subject teachers) plus the always-
// visible cross-child school staff.

import { useMemo } from 'react';
import { useParentAppContext } from '../../useParentAppContext';
import {
  MOCK_CONTACTS,
  type MockContact,
  getMentorForChild as _getMentorForChild,
  getTeachersForChild as _getTeachersForChild,
  getSchoolStaff as _getSchoolStaff,
  getContactById,
} from '../data/parentAppContactsMock';

export interface UseContactsReturn {
  /** All contacts (unfiltered) — useful for thread row lookups. */
  all: MockContact[];
  /** Active child's mentor, or null if none. */
  mentor: MockContact | null;
  /** Active child's 6 subject teachers (math, arabic, english, science, pe, art). */
  teachers: MockContact[];
  /** Cross-child school staff (principal, counselor, admin, nurse). */
  staff: MockContact[];
  /** Lookup helper. */
  getById: (id: string) => MockContact | null;
}

export function useContacts(): UseContactsReturn {
  const { activeChildId } = useParentAppContext();

  return useMemo(
    () => ({
      all: MOCK_CONTACTS,
      mentor: _getMentorForChild(activeChildId),
      teachers: _getTeachersForChild(activeChildId),
      staff: _getSchoolStaff(),
      getById: getContactById,
    }),
    [activeChildId]
  );
}
