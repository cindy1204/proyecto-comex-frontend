'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { cn } from '../utils/cn';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Diálogo modal sobre `<dialog>`: el navegador atrapa el foco, inertiza el fondo, cierra con
 * Escape y devuelve el foco al elemento que lo abrió. También cierra al pulsar el fondo.
 */
export function Modal({ open, title, onClose, children, className }: Readonly<ModalProps>) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  return (
    <dialog
      aria-labelledby={titleId}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl',
        'backdrop:bg-overlay',
        className,
      )}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <h2 className="type-heading" id={titleId}>
              {title}
            </h2>
            <button
              aria-label={t('common.close')}
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
