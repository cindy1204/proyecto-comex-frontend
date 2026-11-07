'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import type { TranslationKey } from '../../i18n/domain/translate';
import type { Pagination as PaginationData } from '../domain/pagination';
import { Button } from './button';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  /** Clave plural (`_one`/`_other`) del sustantivo del resumen, por ejemplo `contact.items`. */
  itemsKey?: TranslationKey;
  disabled?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  itemsKey = 'common.results',
  disabled = false,
}: Readonly<PaginationProps>) {
  const { t } = useTranslation();
  const { total, currentPage, totalPages } = pagination;
  const lastPage = Math.max(totalPages, 1);

  return (
    <nav
      aria-label={t('common.pagination.label')}
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        {t('common.pagination.summary', {
          items: t(itemsKey, { count: total }),
          page: currentPage,
          pages: lastPage,
        })}
      </p>
      <div className="flex gap-2">
        <Button
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {t('common.pagination.previous')}
        </Button>
        <Button
          disabled={disabled || currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          variant="outline"
        >
          {t('common.pagination.next')}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
