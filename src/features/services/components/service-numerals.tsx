'use client';

import { useState, type KeyboardEvent } from 'react';
import { Alert } from '../../common/components/alert';
import { Button } from '../../common/components/button';
import { EmptyState } from '../../common/components/empty-state';
import { Loading } from '../../common/components/loading';
import { cn } from '../../common/utils/cn';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { CatalogCard } from '../../catalog/components/catalog-card';
import {
  CATALOG_DIRECTIONS,
  type CatalogDirection,
  type CatalogItem,
} from '../../catalog/domain/catalog';
import { useCatalogByCategory } from '../../catalog/hooks/use-catalog';
import type { Service } from '../domain/services';

export function ServiceNumerals({ service }: Readonly<{ service: Service }>) {
  const { t } = useTranslation();
  const { data, error, isLoading, reload } = useCatalogByCategory(service.catalogCategory);

  if (error) {
    return (
      <Alert>
        <p>{error}</p>
        <Button className="mt-2" onClick={reload} size="sm" variant="outline">
          {t('common.retry')}
        </Button>
      </Alert>
    );
  }
  if (!data || isLoading) return <Loading label={t('services.numerals.loading')} />;

  return (
    <div className="flex flex-col gap-4">
      {service.slug === 'servicios' && <Alert tone="info">{t('services.numerals.notice')}</Alert>}
      <NumeralTabs idPrefix={service.slug} items={data} />
    </div>
  );
}

function NumeralTabs({ items, idPrefix }: Readonly<{ items: CatalogItem[]; idPrefix: string }>) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<CatalogDirection | null>(null);
  const active: CatalogDirection =
    selected ?? (items.some((item) => item.direction === 'INGRESOS') ? 'INGRESOS' : 'EGRESOS');
  const activeItems = items.filter((item) => item.direction === active);
  const tabId = (direction: CatalogDirection) => `${idPrefix}-numerals-${direction.toLowerCase()}`;

  function handleKeyDown(direction: CatalogDirection, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next =
      CATALOG_DIRECTIONS[
        (CATALOG_DIRECTIONS.indexOf(direction) + offset + CATALOG_DIRECTIONS.length) %
          CATALOG_DIRECTIONS.length
      ];
    setSelected(next);
    document.getElementById(tabId(next))?.focus();
  }

  return (
    <>
      <div
        aria-label={t('services.numerals.tabsLabel')}
        className="flex gap-2 border-b border-border"
        role="tablist"
      >
        {CATALOG_DIRECTIONS.map((direction) => {
          const isActive = active === direction;
          return (
            <button
              aria-controls={`${tabId(direction)}-panel`}
              aria-selected={isActive}
              className={cn(
                '-mb-px min-h-11 border-b-2 px-4 font-semibold transition-colors duration-150',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              id={tabId(direction)}
              key={direction}
              onClick={() => setSelected(direction)}
              onKeyDown={(event) => handleKeyDown(direction, event)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {t(`services.numerals.tabs.${direction}`)}{' '}
              <span className="text-sm">
                ({items.filter((item) => item.direction === direction).length})
              </span>
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={tabId(active)}
        id={`${tabId(active)}-panel`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeItems.length === 0 ? (
          <EmptyState title={t(`services.numerals.empty.${active}`)} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeItems.map((item) => (
              <li key={item.id}>
                <CatalogCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
