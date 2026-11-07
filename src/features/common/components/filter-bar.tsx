'use client';

import { ChevronDown, FilterX } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { cn } from '../utils/cn';
import { Button } from './button';

interface FilterBarProps {
  /** Nombre accesible de la búsqueda (ya traducido), por ejemplo "Filtrar solicitudes". */
  label: string;
  onReset: () => void;
  /** Muestra el botón de limpiar solo cuando hay algún filtro activo. */
  hasActiveFilters: boolean;
  children: ReactNode;
}

/** Contenedor de filtros: rejilla responsiva con acción para limpiarlos. */
export function FilterBar({
  label,
  onReset,
  hasActiveFilters,
  children,
}: Readonly<FilterBarProps>) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const fieldsId = useId();
  return (
    <form
      aria-label={label}
      className="flex flex-col gap-3"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <Button
        aria-controls={fieldsId}
        aria-expanded={isOpen}
        className="justify-between sm:hidden"
        onClick={() => setIsOpen((open) => !open)}
        variant="outline"
      >
        <span>
          {t('common.filters')}
          {hasActiveFilters && (
            <span aria-hidden="true" className="ml-2 inline-block size-2 rounded-full bg-accent" />
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-150', isOpen && 'rotate-180')}
        />
      </Button>
      <div
        className={cn('gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4', isOpen ? 'grid' : 'hidden')}
        id={fieldsId}
      >
        {children}
      </div>
      {hasActiveFilters && (
        <div>
          <Button onClick={onReset} size="sm" variant="ghost">
            <FilterX aria-hidden="true" className="size-4" />
            {t('common.clearFilters')}
          </Button>
        </div>
      )}
    </form>
  );
}
