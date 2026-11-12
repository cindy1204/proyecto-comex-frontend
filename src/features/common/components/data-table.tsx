'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { cn } from '../utils/cn';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: ReadonlyArray<DataTableColumn<T>>;
  rows: readonly T[];
  getRowKey: (row: T) => string;
  /** Acciones de la fila (editar, eliminar…). En móvil quedan al pie de la tarjeta. */
  actions?: (row: T) => ReactNode;
  isBusy?: boolean;
}

/**
 * Tabla semántica en escritorio que en móvil se convierte en tarjetas apiladas
 * (cada celda muestra su encabezado con `data-label`), sin duplicar el DOM.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  actions,
  isBusy = false,
}: Readonly<DataTableProps<T>>) {
  const { t } = useTranslation();
  return (
    <div
      aria-busy={isBusy}
      className={cn(
        'rounded-xl border border-border bg-surface md:overflow-x-auto',
        isBusy && 'opacity-60 transition-opacity',
      )}
    >
      <table className="block w-full text-left md:table">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only md:not-sr-only md:table-header-group">
          <tr className="md:border-b md:border-border md:bg-surface-muted">
            {columns.map((column) => (
              <th
                className="px-4 py-3 type-label text-muted-foreground"
                key={column.key}
                scope="col"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 type-label text-muted-foreground" scope="col">
                {t('common.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {rows.map((row) => (
            <tr
              className="block border-b border-border p-4 last:border-b-0 md:table-row md:p-0"
              key={getRowKey(row)}
            >
              {columns.map((column) => (
                <td
                  className={cn(
                    'block py-1 text-foreground before:block before:text-xs before:font-semibold before:text-muted-foreground before:content-[attr(data-label)]',
                    'md:table-cell md:px-4 md:py-3 md:align-top md:before:hidden',
                    column.className,
                  )}
                  data-label={column.header}
                  key={column.key}
                >
                  {column.cell(row)}
                </td>
              ))}
              {actions && (
                <td className="block pt-2 md:table-cell md:px-4 md:py-3 md:align-top">
                  <div className="flex flex-wrap gap-2">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
