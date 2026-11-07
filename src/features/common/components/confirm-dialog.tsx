'use client';

import { useTranslation } from '../../i18n/hooks/use-translation';
import { Button } from './button';
import { Modal } from './modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Pinta la confirmación como acción destructiva (rojo). */
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const { t } = useTranslation();
  return (
    <Modal onClose={isLoading ? () => undefined : onCancel} open={open} title={title}>
      <p className="text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={isLoading} onClick={onCancel} variant="outline">
          {cancelLabel ?? t('common.cancel')}
        </Button>
        <Button
          isLoading={isLoading}
          onClick={onConfirm}
          variant={destructive ? 'danger' : 'primary'}
        >
          {confirmLabel ?? t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
}
