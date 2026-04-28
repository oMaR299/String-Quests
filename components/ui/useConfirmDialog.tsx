// useConfirmDialog.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Promise-based confirm hook on top of <ConfirmDialog/>. Replaces the
// boilerplate `pendingAction` state machine each callsite would otherwise
// own. Bilingual content (AR/EN) is required so the dialog renders the
// right copy in either locale.
//
//   const { confirm, dialog } = useConfirmDialog();
//   ...
//   const ok = await confirm({
//     titleAr: 'حذف القالب', titleEn: 'Delete template',
//     bodyAr: 'سيتم حذف "{name}"', bodyEn: 'Will delete "{name}"',
//     confirmLabelAr: 'حذف', confirmLabelEn: 'Delete',
//     destructive: true,
//   });
//   if (ok) actuallyDelete();
//   ...
//   return <>{dialog}</>;
//
// The hook is locale-aware via <I18nContext>. If the consumer prefers static
// strings (already-localized), they can pass identical AR/EN values — both
// sides will simply render the same copy.

import React, { useCallback, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { useI18n } from '../../contexts/I18nContext';

export interface ConfirmContent {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  confirmLabelAr?: string;
  confirmLabelEn?: string;
  cancelLabelAr?: string;
  cancelLabelEn?: string;
  destructive?: boolean;
}

interface DialogState extends ConfirmContent {
  resolve: (ok: boolean) => void;
}

const DEFAULT_CONFIRM_AR = 'تأكيد';
const DEFAULT_CONFIRM_EN = 'Confirm';
const DEFAULT_CANCEL_AR = 'إلغاء';
const DEFAULT_CANCEL_EN = 'Cancel';

export interface UseConfirmDialogReturn {
  /** Open the confirm; resolves true if confirmed, false if cancelled. */
  confirm: (content: ConfirmContent) => Promise<boolean>;
  /** Render this in your JSX so the dialog has a portal target. */
  dialog: React.ReactNode;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const { locale } = useI18n();
  const [state, setState] = useState<DialogState | null>(null);

  const confirm = useCallback((content: ConfirmContent): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...content, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!state) return;
    state.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    if (!state) return;
    state.resolve(false);
    setState(null);
  }, [state]);

  const isAr = locale === 'ar';
  const dialog = (
    <ConfirmDialog
      open={!!state}
      title={state ? (isAr ? state.titleAr : state.titleEn) : ''}
      body={state ? (isAr ? state.bodyAr : state.bodyEn) : ''}
      confirmLabel={
        state
          ? isAr
            ? state.confirmLabelAr ?? DEFAULT_CONFIRM_AR
            : state.confirmLabelEn ?? DEFAULT_CONFIRM_EN
          : ''
      }
      cancelLabel={
        state
          ? isAr
            ? state.cancelLabelAr ?? DEFAULT_CANCEL_AR
            : state.cancelLabelEn ?? DEFAULT_CANCEL_EN
          : ''
      }
      destructive={state?.destructive}
      locale={locale}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}

export default useConfirmDialog;
