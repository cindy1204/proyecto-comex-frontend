'use client';

import Link from 'next/link';
import { Plus, RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '../../common/components/badge';
import { Button, buttonStyles } from '../../common/components/button';
import { ConfirmDialog } from '../../common/components/confirm-dialog';
import { DataTable, type DataTableColumn } from '../../common/components/data-table';
import { DateRangeFields } from '../../common/components/date-range-fields';
import { Field } from '../../common/components/field';
import { FilterBar } from '../../common/components/filter-bar';
import { Input } from '../../common/components/input';
import { Modal } from '../../common/components/modal';
import { Notice } from '../../common/components/notice';
import { NumeralCode } from '../../common/components/numeral-code';
import { PageSizeSelect } from '../../common/components/page-size-select';
import { Pagination } from '../../common/components/pagination';
import { QueryFeedback } from '../../common/components/query-feedback';
import { Select } from '../../common/components/select';
import { useDateRange } from '../../common/hooks/use-date-range';
import { useDebounce } from '../../common/hooks/use-debounce';
import { useClampPage, usePagination } from '../../common/hooks/use-pagination';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  CATALOG_CATEGORIES,
  CATALOG_DIRECTIONS,
  CATALOG_STATE_FILTERS,
  catalogItemPath,
  categoryLabel,
  isCatalogCategory,
  isCatalogDirection,
  type CatalogCategory,
  type CatalogDirection,
  type CatalogItem,
  type CatalogStateFilter,
} from '../domain/catalog';
import { useCatalog } from '../hooks/use-catalog';
import { useCatalogActions } from '../hooks/use-catalog-actions';
import { CatalogForm } from './catalog-form';
import { CatalogImage } from './catalog-image';

type FormTarget = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: CatalogItem };

function isStateFilter(value: string): value is CatalogStateFilter {
  return (CATALOG_STATE_FILTERS as readonly string[]).includes(value);
}

export function CatalogAdminPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CatalogCategory | ''>('');
  const [direction, setDirection] = useState<CatalogDirection | ''>('');
  const [state, setState] = useState<CatalogStateFilter>('ACTIVE');
  const [form, setForm] = useState<FormTarget>({ mode: 'closed' });
  const { page, limit, setPage, resetPage, setLimit } = usePagination();
  const range = useDateRange(resetPage);
  const debouncedSearch = useDebounce(search.trim());
  const { data, error, isLoading, reload } = useCatalog({
    page,
    limit,
    category,
    direction,
    search: debouncedSearch,
    state,
    createdFrom: range.createdFrom,
    createdTo: range.createdTo,
  });
  const actions = useCatalogActions(reload);
  useClampPage(page, data?.pagination.totalPages, setPage);

  const handleSaved = useCallback(
    (saved: CatalogItem) => {
      const wasEdit = form.mode === 'edit';
      setForm({ mode: 'closed' });
      actions.notify(
        'success',
        t(wasEdit ? 'catalog.admin.updated' : 'catalog.admin.created', { code: saved.code }),
      );
      reload();
    },
    [form.mode, actions, reload, t],
  );

  const hasActiveFilters = Boolean(
    search || category || direction || state !== 'ACTIVE' || range.from || range.to,
  );

  function resetFilters() {
    setSearch('');
    setCategory('');
    setDirection('');
    setState('ACTIVE');
    range.reset();
    resetPage();
  }

  const columns: ReadonlyArray<DataTableColumn<CatalogItem>> = [
    {
      key: 'image',
      header: t('catalog.admin.columns.image'),
      cell: (item) => (
        <CatalogImage
          alt={t('catalog.imageAlt', { code: item.code })}
          className="h-14 w-20 rounded-md"
          code={item.code}
          src={item.imageUrl}
        />
      ),
    },
    {
      key: 'code',
      header: t('catalog.admin.columns.code'),
      cell: (item) => <NumeralCode code={item.code} />,
    },
    {
      key: 'title',
      header: t('catalog.admin.columns.title'),
      className: 'md:max-w-xs',
      cell: (item) => (
        <>
          <span className="font-semibold">{item.title}</span>
          <span className="block text-sm text-muted-foreground">
            {categoryLabel(item.category, t)} · {t(`catalog.directions.${item.direction}`)}
          </span>
        </>
      ),
    },
    {
      key: 'state',
      header: t('catalog.admin.columns.state'),
      cell: (item) => (
        <Badge tone={item.state === 'ACTIVE' ? 'success' : 'danger'}>
          {t(`catalog.states.${item.state}`)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">{t('catalog.admin.description')}</p>
        <Button onClick={() => setForm({ mode: 'create' })}>
          <Plus aria-hidden="true" className="size-4" />
          {t('catalog.admin.newItem')}
        </Button>
      </div>

      <Notice notice={actions.notice} />

      <FilterBar
        hasActiveFilters={hasActiveFilters}
        label={t('catalog.admin.filterLabel')}
        onReset={resetFilters}
      >
        <Field label={t('catalog.admin.state')}>
          {(control) => (
            <Select
              {...control}
              onChange={(event) => {
                const value = event.target.value;
                setState(isStateFilter(value) ? value : 'ACTIVE');
                resetPage();
              }}
              value={state}
            >
              {CATALOG_STATE_FILTERS.map((value) => (
                <option key={value} value={value}>
                  {t(`catalog.stateFilters.${value}`)}
                </option>
              ))}
            </Select>
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
              <option value="">{t('catalog.admin.allCategories')}</option>
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
        <Field label={t('catalog.admin.search')}>
          {(control) => (
            <Input
              {...control}
              maxLength={200}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder={t('catalog.admin.searchPlaceholder')}
              type="search"
              value={search}
            />
          )}
        </Field>
        <DateRangeFields range={range} />
        <PageSizeSelect onChange={setLimit} value={limit} />
      </FilterBar>

      <QueryFeedback
        emptyAction={
          <Button onClick={() => setForm({ mode: 'create' })} variant="outline">
            {t('catalog.admin.createItem')}
          </Button>
        }
        emptyDescription={t('catalog.admin.emptyDescription')}
        emptyTitle={t('catalog.admin.emptyTitle')}
        error={error}
        hasData={Boolean(data)}
        isEmpty={data?.data.length === 0}
        isLoading={isLoading}
        loadingLabel={t('catalog.browser.loading')}
        onRetry={reload}
      />
      {data && data.data.length > 0 && (
        <DataTable
          actions={(item) =>
            item.state === 'ACTIVE' ? (
              <>
                <Link
                  className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                  href={catalogItemPath(item.id)}
                >
                  {t('catalog.admin.view')}
                  <span className="sr-only"> {t('catalog.admin.itemSr', { code: item.code })}</span>
                </Link>
                <Button onClick={() => setForm({ mode: 'edit', item })} size="sm" variant="outline">
                  <SquarePen aria-hidden="true" className="size-4" />
                  {t('catalog.admin.edit')}
                  <span className="sr-only"> {t('catalog.admin.itemSr', { code: item.code })}</span>
                </Button>
                <Button onClick={() => actions.remove.ask(item)} size="sm" variant="danger">
                  <Trash2 aria-hidden="true" className="size-4" />
                  {t('catalog.admin.remove')}
                  <span className="sr-only"> {t('catalog.admin.itemSr', { code: item.code })}</span>
                </Button>
              </>
            ) : (
              <Button
                isLoading={actions.restoringId === item.id}
                onClick={() => void actions.restore(item)}
                size="sm"
                variant="outline"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t('catalog.admin.restore')}
                <span className="sr-only"> {t('catalog.admin.itemSr', { code: item.code })}</span>
              </Button>
            )
          }
          caption={t('catalog.admin.caption')}
          columns={columns}
          getRowKey={(item) => item.id}
          isBusy={isLoading}
          rows={data.data}
        />
      )}
      {data && data.pagination.total > 0 && (
        <Pagination
          disabled={isLoading}
          itemsKey="catalog.items"
          onPageChange={setPage}
          pagination={data.pagination}
        />
      )}

      <Modal
        className="max-w-2xl"
        dismissOnBackdrop={false}
        onClose={() => setForm({ mode: 'closed' })}
        open={form.mode !== 'closed'}
        title={
          form.mode === 'edit'
            ? t('catalog.admin.editTitle', { code: form.item.code })
            : t('catalog.admin.newItem')
        }
      >
        {form.mode !== 'closed' && (
          <CatalogForm
            item={form.mode === 'edit' ? form.item : null}
            onCancel={() => setForm({ mode: 'closed' })}
            onSaved={handleSaved}
          />
        )}
      </Modal>
      <ConfirmDialog
        confirmLabel={t('catalog.admin.remove')}
        description={t('catalog.admin.removeDescription', {
          code: actions.remove.target?.code ?? '',
        })}
        destructive
        isLoading={actions.remove.isRemoving}
        onCancel={actions.remove.cancel}
        onConfirm={() => void actions.remove.confirm()}
        open={actions.remove.target !== null}
        title={t('catalog.admin.removeTitle')}
      />
    </div>
  );
}
