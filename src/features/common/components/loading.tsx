'use client';

import { useTranslation } from '../../i18n/hooks/use-translation';
import { cn } from '../utils/cn';
import { Spinner } from './spinner';

interface LoadingProps {
  label?: string;
  className?: string;
}

/** Estado de carga anunciado a lectores de pantalla (`role="status"`). */
export function Loading({ label, className }: Readonly<LoadingProps>) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-12 text-muted-foreground',
        className,
      )}
      role="status"
    >
      <Spinner className="text-primary" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}
