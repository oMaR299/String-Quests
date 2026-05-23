// SubjectTreeSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Phase B — the full-height sheet that hosts the Subject Tree. A parent taps a
// subject's plant in the garden → this opens and shows that subject's whole
// textbook as a lush, scrollable tree (`SubjectTreeView`).
//
// It wraps the established `BottomSheet` primitive (same full-height sheet used
// by every parent-app drawer) so the open/close motion, backdrop, Escape key,
// body-scroll-lock and RTL header all come for free. We:
//   • Compute the tree on demand with `getSubjectTree(childId, subjectKey)`
//     only when actually open with both ids present (cheap + pure + seeded).
//   • Feed `BottomSheet` the localized `treeTitle` ("{subject} · {name}'s tree")
//     and the `close` aria label.
//   • Render a small `tapHint` subtext above the tree so parents learn that
//     branches/twigs are tappable (leaves are not).
//
// Props are deliberately null-tolerant (childId / subjectKey are null when the
// sheet is closed) so the parent can keep this mounted and just toggle `open`.
// House rules: flat, white, Cairo, Lucide-only, full RTL. No emoji.

import React, { useMemo } from 'react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../../parentAppI18n';
import { BottomSheet } from '../../drawers/BottomSheet';
import {
  getSubjectTree,
  type SubjectTree,
} from '../data/parentAppTextbookTreeMock';
import { SubjectTreeView } from './SubjectTreeView';

export interface SubjectTreeSheetProps {
  open: boolean;
  onClose: () => void;
  childId: string | null; // null when closed
  childName: string;
  subjectKey: string | null; // null when closed
}

export const SubjectTreeSheet: React.FC<SubjectTreeSheetProps> = ({
  open,
  onClose,
  childId,
  childName,
  subjectKey,
}) => {
  const { locale } = useI18n();

  // Build the tree only when we genuinely have an open sheet + both ids. Pure
  // and seeded, so memoizing on the inputs keeps it stable across re-renders.
  const tree: SubjectTree | null = useMemo(() => {
    if (!open || !childId || !subjectKey) return null;
    return getSubjectTree(childId, subjectKey);
  }, [open, childId, subjectKey]);

  // Localized subject name comes from the tree itself (matches the garden).
  const subjectLabel = tree
    ? locale === 'ar'
      ? tree.subjectAr
      : tree.subjectEn
    : '';

  const title = interpolate(
    getParentAppString(locale, 'parentApp.skillMap.tree.treeTitle'),
    { subject: subjectLabel, name: childName }
  );

  const closeAria = getParentAppString(locale, 'parentApp.skillMap.tree.close');
  const tapHint = getParentAppString(locale, 'parentApp.skillMap.tree.tapHint');

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      closeAriaLabel={closeAria}
    >
      {tree ? (
        <div className="font-cairo">
          {/* Tap hint subtext under the sheet header. */}
          <p className="mb-2 text-center text-xs font-bold text-slate-400">
            {tapHint}
          </p>
          <SubjectTreeView tree={tree} childName={childName} />
        </div>
      ) : null}
    </BottomSheet>
  );
};

export default SubjectTreeSheet;
