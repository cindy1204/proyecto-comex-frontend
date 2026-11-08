'use client';

import { useState } from 'react';
import { DateRangeFields } from '../../common/components/date-range-fields';
import { Field } from '../../common/components/field';
import { FilterBar } from '../../common/components/filter-bar';
import { Input } from '../../common/components/input';
import { Pagination } from '../../common/components/pagination';
import { QueryFeedback } from '../../common/components/query-feedback';
import { Select } from '../../common/components/select';
import { useDateRange } from '../../common/hooks/use-date-range';
import { useDebounce } from '../../common/hooks/use-debounce';
import { usePagination } from '../../common/hooks/use-pagination';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  CATALOG_CATEGORIES,
  CATALOG_DIRECTIONS,
  isCatalogCategory,
  isCatalogDirection,
  type CatalogCategory,
  type CatalogDirection,
} from '../domain/catalog';
import { useCatalog } from '../hooks/use-catalog';
import { CatalogCard } from './catalog-card';

export function CatalogBrowser() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CatalogCategory | ''>('');
  const [direction, setDirection] = useState<CatalogDirection | ''>('');
  const { page, limit, setPage, resetPage } = usePagination();
  const range = useDateRange(resetPage);
  const debouncedSearch = useDebounce(search.trim());
  const { data, error, isLoading, reload } = useCatalog({
    page,
    limit,
    category,
    direction,
    search: debouncedSearch,
    createdFrom: range.createdFrom,
    createdTo: range.createdTo,
  });

  const hasActiveFilters = Boolean(search || category || direction || range.from || range.to);

  function resetFilters() {
    setSearch('');
    setCategory('');
    setDirection('');
    range.reset();
    resetPage();
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        hasActiveFilters={hasActiveFilters}
        label={t('catalog.browser.filterLabel')}
        onReset={resetFilters}
      >
        <Field className="sm:col-span-2" label={t('catalog.browser.search')}>
          {(control) => (
            <Input
              {...control}
              maxLength={200}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              type="search"
              value={search}
            />
          )}
        </Field>
        <Field label={t('catalog.browser.category')}>
          {(control) => (
            <Select
              {...control}
              onChange={(event) => {
                const value = event.target.value;
                setCategory(isCatalogCategory(value) ? value : '');
                resetPage();
              }}
              value={category}
            >
              <option value="">{t('catalog.browser.allCategories')}</option>
              {CATALOG_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {t(`catalog.categories.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t('catalog.browser.type')}>
          {(control) => (
            <Select
              {...control}
              onChange={(event) => {
                const value = event.target.value;
                setDirection(isCatalogDirection(value) ? value : '');
                resetPage();
              }}
              value={direction}
            >
              <option value="">{t('catalog.browser.allDirections')}</option>
              {CATALOG_DIRECTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`catalog.directions.${value}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <DateRangeFields range={range} />
      </FilterBar>

      <QueryFeedback
        emptyDescription={t('catalog.browser.emptyDescription')}
        emptyTitle={t('catalog.browser.emptyTitle')}
        error={error}
        hasData={Boolean(data)}
        isEmpty={data?.data.length === 0}
        isLoading={isLoading}
        loadingLabel={t('catalog.browser.loading')}
        onRetry={reload}
      />
      {data && data.data.length > 0 && (
        <div
          aria-busy={isLoading}
          className={isLoading ? 'opacity-60 transition-opacity' : undefined}
        >
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((item) => (
              <li key={item.id}>
                <CatalogCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {data && data.pagination.total > 0 && (
        <Pagination
          disabled={isLoading}
          itemsKey="catalog.items"
          onPageChange={setPage}
          pagination={data.pagination}
        />
      )}
    </div>
  );
}
