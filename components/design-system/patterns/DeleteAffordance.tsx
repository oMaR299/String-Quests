/**
 * sq-DeleteAffordance — a destructive button + confirm flow primitive.
 *
 * The composition encodes the rule that EVERY destructive action must
 * pass through a confirm dialog (never window.confirm). Consumer just
 * supplies the labels + the actual destruction handler.
 *
 * Uses SqDialog (variant=confirm, destructive). Self-managed local
 * state — no need to wire a hook in the consumer.
 */

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { SqButton, type SqButtonSize, type SqButtonVariant } from '../components/Button';
import { SqDialog } from '../components/Dialog';

interface SqDeleteAffordanceProps {
  /** Visible label on the trigger button. */
  label: string;
  /** Confirm dialog title. */
  confirmTitle: string;
  /** Confirm dialog body. */
  confirmBody: string;
  confirmLabel?: string;
  cancelLabel?: string;
  locale?: 'ar' | 'en';
  /** Triggered after the user confirms. */
  onDelete: () => void;
  size?: SqButtonSize;
  variant?: Extract<SqButtonVariant, 'solid' | 'outline' | 'ghost'>;
  /** Hide the trash icon. */
  hideIcon?: boolean;
  className?: string;
}

export const SqDeleteAffordance: React.FC<SqDeleteAffordanceProps> = ({
  label,
  confirmTitle,
  confirmBody,
  confirmLabel,
  cancelLabel,
  locale = 'ar',
  onDelete,
  size = 'md',
  variant = 'outline',
  hideIcon = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SqButton
        tone="danger"
        variant={variant}
        size={size}
        leadingIcon={hideIcon ? undefined : Trash2}
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </SqButton>
      <SqDialog
        open={open}
        variant="confirm"
        destructive
        locale={locale}
        title={confirmTitle}
        body={confirmBody}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={() => {
          setOpen(false);
          onDelete();
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default SqDeleteAffordance;
