'use client';

import { Eye, SquarePen, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '../../common/components/badge';
import { Button } from '../../common/components/button';
import { ConfirmDialog } from '../../common/components/confirm-dialog';
import { DataTable, type DataTableColumn } from '../../common/components/data-table';
import { DateRangeFields } from '../../common/components/date-range-fields';
import { Field } from '../../common/components/field';
import { FilterBar } from '../../common/components/filter-bar';
import { Input } from '../../common/components/input';
import { Modal } from '../../common/components/modal';
import { Notice } from '../../common/components/notice';
import { PageSizeSelect } from '../../common/components/page-size-select';
import { Pagination } from '../../common/components/pagination';
import { QueryFeedback } from '../../common/components/query-feedback';
import { Select } from '../../common/components/select';
import { useDateRange } from '../../common/hooks/use-date-range';
import { useDebounce } from '../../common/hooks/use-debounce';
import { useClampPage, usePagination } from '../../common/hooks/use-pagination';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  CONTACT_PRODUCT_TYPES,
  contactProductLabel,
  isContactProductType,
  type ContactProductType,
  type ContactRequest,
} from '../domain/contact';
import { useContactActions } from '../hooks/use-contact-actions';
import { useContactRequests, type ContactScope } from '../hooks/use-contact-requests';
import { ContactDetail } from './contact-detail';
import { ContactEditForm } from './contact-edit-form';

interface ContactRequestsListProps {
  /** `mine`: solicitudes del usuario (editables); `all`: todas (solo administradores, con búsqueda). */
  scope: ContactScope;
}

type Dialog =
  | { mode: 'closed' }
  | { mode: 'view'; item: ContactRequest }
  | { mode: 'edit'; item: ContactRequest };

export function ContactRequestsList({ scope }: Readonly<ContactRequestsListProps>) {
  const { t, format } = useTranslation();
  const isAdminScope = scope === 'all';
  const [tipoProducto, setTipoProducto] = useState<ContactProductType | ''>('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' });
  const debouncedSearch = useDebounce(search.trim());
  const { page, limit, setPage, resetPage, setLimit } = usePagination();
  const range = useDateRange(resetPage);
  const { data, error, isLoading, reload } = useContactRequests(
    scope,
    {
      tipoProducto,
      search: isAdminScope ? debouncedSearch : undefined,
      createdFrom: range.createdFrom,
      createdTo: range.createdTo,
    },
    { page, limit },
  );
  const actions = useContactActions(reload);
  useClampPage(page, data?.pagination.totalPages, setPage);

  const handleSaved = useCallback(
    (saved: ContactRequest) => {
      setDialog({ mode: 'closed' });
      actions.notify('success', t('contact.updated', { name: saved.nombreCompleto }));
      reload();
    },
    [actions, reload, t],
  );

  const hasActiveFilters = Boolean(tipoProducto || search || range.from || range.to);

  function resetFilters() {
    setTipoProducto('');
    setSearch('');
    range.reset();
    resetPage();
  }

  const columns: ReadonlyArray<DataTableColumn<ContactRequest>> = [
    {
      key: 'requester',
      header: t('contact.list.columns.requester'),
      cell: (item) => (
        <>
          <span className="font-semibold">{item.nombreCompleto}</span>
          <span className="block text-sm text-muted-foreground">{item.email}</span>
        </>
      ),
    },
    {
      key: 'product',
      header: t('contact.list.columns.service'),
      cell: (item) => <Badge tone="primary">{contactProductLabel(item.tipoProducto, t)}</Badge>,
    },
    {
      key: 'amount',
      header: t('contact.list.columns.amount'),
      cell: (item) =>
        item.montoEstimado === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          format.currency(item.montoEstimado)
        ),
    },
    {
      key: 'createdAt',
      header: t('contact.list.columns.date'),
      cell: (item) => <time dateTime={item.createdAt}>{format.dateTime(item.createdAt)}</time>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Notice notice={actions.notice} />

      <FilterBar
        hasActiveFilters={hasActiveFilters}
        label={t('contact.list.filterLabel')}
        onReset={resetFilters}
      >
        {isAdminScope && (
          <Field label={t('contact.list.search')}>
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
        )}
        <Field label={t('contact.list.columns.service')}>
          {(control) => (
            <Select
              {...control}
              onChange={(event) => {
                const value = event.target.value;
                setTipoProducto(isContactProductType(value) ? value : '');
                resetPage();
              }}
              value={tipoProducto}
            >
              <option value="">{t('common.all')}</option>
              {CONTACT_PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`contact.productTypes.${type}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <DateRangeFields range={range} />
        <PageSizeSelect onChange={setLimit} value={limit} />
      </FilterBar>

      <QueryFeedback
        emptyDescription={
          isAdminScope || hasActiveFilters
            ? t('contact.list.emptyFiltered')
            : t('contact.list.emptyMine')
        }
        emptyTitle={t('contact.list.emptyTitle')}
        error={error}
        hasData={Boolean(data)}
        isEmpty={data?.data.length === 0}
        isLoading={isLoading}
        loadingLabel={t('contact.list.loading')}
        onRetry={reload}
      />
      {data && data.data.length > 0 && (
        <DataTable
          actions={(item) => (
            <>
              <Button
                aria-label={`${t('common.view')} ${t('contact.list.itemSr', { name: item.nombreCompleto })}`}
                className="size-11 px-0"
                onClick={() => setDialog({ mode: 'view', item })}
                size="sm"
                title={t('common.view')}
                variant="ghost"
              >
                <Eye aria-hidden="true" className="size-4" />
              </Button>
              {!isAdminScope && (
                <Button
                  onClick={() => setDialog({ mode: 'edit', item })}
                  aria-label={`${t('common.edit')} ${t('contact.list.itemSr', { name: item.nombreCompleto })}`}
                  className="size-11 px-0"
                  size="sm"
                  title={t('common.edit')}
                  variant="outline"
                >
                  <SquarePen aria-hidden="true" className="size-4" />
                </Button>
              )}
              <Button
                aria-label={`${t('common.delete')} ${t('contact.list.itemSr', { name: item.nombreCompleto })}`}
                className="size-11 px-0"
                onClick={() => actions.remove.ask(item)}
                size="sm"
                title={t('common.delete')}
                variant="danger"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </>
          )}
          caption={t('contact.list.caption')}
          columns={columns}
          getRowKey={(item) => item.id}
          isBusy={isLoading}
          rows={data.data}
        />
      )}
      {data && data.pagination.total > 0 && (
        <Pagination
          disabled={isLoading}
          itemsKey="contact.items"
          onPageChange={setPage}
          pagination={data.pagination}
        />
      )}

      <Modal
        className="max-w-2xl"
        dismissOnBackdrop={dialog.mode !== 'edit'}
        onClose={() => setDialog({ mode: 'closed' })}
        open={dialog.mode !== 'closed'}
        title={dialog.mode === 'edit' ? t('contact.list.editTitle') : t('contact.list.detailTitle')}
      >
        {dialog.mode === 'view' && <ContactDetail request={dialog.item} />}
        {dialog.mode === 'edit' && (
          <ContactEditForm
            onCancel={() => setDialog({ mode: 'closed' })}
            onSaved={handleSaved}
            request={dialog.item}
          />
        )}
      </Modal>
      <ConfirmDialog
        confirmLabel={t('common.delete')}
        description={t('contact.list.removeDescription', {
          name: actions.remove.target?.nombreCompleto ?? '',
        })}
        destructive
        isLoading={actions.remove.isRemoving}
        onCancel={actions.remove.cancel}
        onConfirm={() => void actions.remove.confirm()}
        open={actions.remove.target !== null}
        title={t('contact.list.removeTitle')}
      />
    </div>
  );
}
