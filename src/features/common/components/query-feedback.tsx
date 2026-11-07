'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Alert } from './alert';
import { Button } from './button';
import { EmptyState } from './empty-state';
import { Loading } from './loading';

interface QueryFeedbackProps {
  error: string | null;
  isLoading: boolean;
  /** Ya se recibió al menos una respuesta. */
  hasData: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  loadingLabel?: string;
  emptyTitle: string;
  emptyDescription?: string;
  /** Acción sugerida en el estado vacío. */
  emptyAction?: ReactNode;
}

/** Estados de carga, error y vacío compartidos por todos los listados. */
export function QueryFeedback({
  error,
  isLoading,
  hasData,
  isEmpty,
  onRetry,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: Readonly<QueryFeedbackProps>) {
  const { t } = useTranslation();
  return (
    <>
      {error && (
        <Alert>
          <p>{error}</p>
          <Button className="mt-2" onClick={onRetry} size="sm" variant="outline">
            {t('common.retry')}
          </Button>
        </Alert>
      )}
      {!hasData && isLoading && <Loading label={loadingLabel} />}
      {hasData && isEmpty && !isLoading && !error && (
        <EmptyState description={emptyDescription} title={emptyTitle}>
          {emptyAction}
        </EmptyState>
      )}
    </>
  );
}
