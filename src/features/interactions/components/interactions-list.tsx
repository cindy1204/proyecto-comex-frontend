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
import { NumeralCode } from '../../common/components/numeral-code';
import { PageSizeSelect } from '../../common/components/page-size-select';
import { Pagination } from '../../common/components/pagination';
import { QueryFeedback } from '../../common/components/query-feedback';
import { Select } from '../../common/components/select';
import { isCuid } from '../../common/domain/id';
import { useDateRange } from '../../common/hooks/use-date-range';
import { useClampPage, usePagination } from '../../common/hooks/use-pagination';
import { useTranslation } from '../../i18n/hooks/use-translation';
import {
  interactionLabel,
  isInteractionType,
  type Interaction,
  type InteractionType,
} from '../domain/interaction';
import { useInteractionActions } from '../hooks/use-interaction-actions';
import { useInteractions, type InteractionScope } from '../hooks/use-interactions';
import { InteractionDetail } from './interaction-detail';
import { InteractionEditForm } from './interaction-edit-form';

interface InteractionsListProps {
  /** `mine`: formularios del usuario; `all`: de todos los usuarios (solo administradores). */
  scope: InteractionScope;
}

type Dialog =
  { mode: 'closed' } | { mode: 'view'; item: Interaction } | { mode: 'edit'; item: Interaction };

export function InteractionsList({ scope }: Readonly<InteractionsListProps>) {
  const { t, format } = useTranslation();
  const isAdminScope = scope === 'all';
  const [type, setType] = useState<InteractionType | ''>('');
  const [userId, setUserId] = useState('');
  const [dialog, setDialog] = useState<Dialog>({ mode: 'closed' });
  const { page, limit, setPage, resetPage, setLimit } = usePagination();
  const range = useDateRange(resetPage);
  const trimmedUserId = userId.trim();
  const userIdError =
    trimmedUserId && !isCuid(trimmedUserId) ? t('interactions.list.userIdInvalid') : null;
  const { data, error, isLoading, reload } = useInteractions(
    scope,
    {
      type,
      userId: userIdError ? '' : trimmedUserId,
      createdFrom: range.createdFrom,
      createdTo: range.createdTo,
    },
    { page, limit },
  );
  const actions = useInteractionActions(reload);
  useClampPage(page, data?.pagination.totalPages, setPage);

  const handleSaved = useCallback(
    (saved: Interaction) => {
      setDialog({ mode: 'closed' });
      actions.notify('success', t('interactions.updated', { code: saved.catalogItem.code }));
      reload();
    },
    [actions, reload, t],
  );

  const hasActiveFilters = Boolean(type || userId || range.from || range.to);

  function resetFilters() {
    setType('');
    setUserId('');
    range.reset();
    resetPage();
  }

  const columns: ReadonlyArray<DataTableColumn<Interaction>> = [
    {
      key: 'type',
      header: t('interactions.list.columns.form'),
      cell: (item) => <Badge tone="primary">{interactionLabel(item.type, t)}</Badge>,
    },
    {
      key: 'numeral',
      header: t('interactions.list.columns.numeral'),
      cell: (item) => (
        <>
          <NumeralCode code={item.catalogItem.code} />
          <span className="block text-sm text-muted-foreground">{item.catalogItem.title}</span>
        </>
      ),
    },
    ...(isAdminScope
      ? [
          {
            key: 'user',
            header: t('interactions.list.columns.user'),
            cell: (item: Interaction) =>
              item.user ? (
                <>
                  <span className="font-semibold">{item.user.name}</span>
                  <span className="block text-sm text-muted-foreground">{item.user.email}</span>
                </>
              ) : (
                <span className="text-muted-foreground">{item.userId}</span>
              ),
          },
        ]
      : []),
    {
      key: 'createdAt',
      header: t('interactions.list.columns.date'),
      cell: (item) => <time dateTime={item.createdAt}>{format.dateTime(item.createdAt)}</time>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Notice notice={actions.notice} />

      <FilterBar
        hasActiveFilters={hasActiveFilters}
        label={t('interactions.list.filterLabel')}
        onReset={resetFilters}
      >
        <Field label={t('interactions.list.columns.form')}>
          {(control) => (
            <Select
              {...control}
              onChange={(event) => {
                const value = event.target.value;
                setType(isInteractionType(value) ? value : '');
                resetPage();
              }}
              value={type}
            >
              <option value="">{t('common.all')}</option>
              <option value="formulario-importaciones">{t('interactions.list.imports')}</option>
              <option value="formulario-exportaciones">{t('interactions.list.exports')}</option>
              <option value="formulario-servicios">{t('interactions.list.services')}</option>
              <option value="formulario-inversiones">{t('interactions.list.investments')}</option>
              <option value="formulario-endeudamiento">{t('interactions.list.debts')}</option>
            </Select>
          )}
        </Field>
        {isAdminScope && (
          <Field error={userIdError ?? undefined} label={t('interactions.list.userId')}>
            {(control) => (
              <Input
                {...control}
                onChange={(event) => {
                  setUserId(event.target.value);
                  resetPage();
                }}
                placeholder={t('interactions.list.userIdPlaceholder')}
                value={userId}
              />
            )}
          </Field>
        )}
        <DateRangeFields range={range} />
        <PageSizeSelect onChange={setLimit} value={limit} />
      </FilterBar>

      <QueryFeedback
        emptyDescription={
          hasActiveFilters
            ? t('interactions.list.emptyFiltered')
            : t('interactions.list.emptyDescription')
        }
        emptyTitle={t('interactions.list.emptyTitle')}
        error={error}
        hasData={Boolean(data)}
        isEmpty={data?.data.length === 0}
        isLoading={isLoading}
        loadingLabel={t('interactions.list.loading')}
        onRetry={reload}
      />
      {data && data.data.length > 0 && (
        <DataTable
          actions={(item) => (
            <>
              <Button onClick={() => setDialog({ mode: 'view', item })} size="sm" variant="ghost">
                <Eye aria-hidden="true" className="size-4" />
                {t('common.view')}
                <span className="sr-only">
                  {' '}
                  {t('interactions.list.itemSr', { code: item.catalogItem.code })}
                </span>
              </Button>
              {!isAdminScope && (
                <Button
                  onClick={() => setDialog({ mode: 'edit', item })}
                  size="sm"
                  variant="outline"
                >
                  <SquarePen aria-hidden="true" className="size-4" />
                  {t('common.edit')}
                  <span className="sr-only">
                    {' '}
                    {t('interactions.list.itemSr', { code: item.catalogItem.code })}
                  </span>
                </Button>
              )}
              <Button onClick={() => actions.remove.ask(item)} size="sm" variant="danger">
                <Trash2 aria-hidden="true" className="size-4" />
                {t('common.delete')}
                <span className="sr-only">
                  {' '}
                  {t('interactions.list.itemSr', { code: item.catalogItem.code })}
                </span>
              </Button>
            </>
          )}
          caption={t('interactions.list.caption')}
          columns={columns}
          getRowKey={(item) => item.id}
          isBusy={isLoading}
          rows={data.data}
        />
      )}
      {data && data.pagination.total > 0 && (
        <Pagination
          disabled={isLoading}
          itemsKey="interactions.items"
          onPageChange={setPage}
          pagination={data.pagination}
        />
      )}

      <Modal
        className="max-w-2xl"
        dismissOnBackdrop={dialog.mode !== 'edit'}
        onClose={() => setDialog({ mode: 'closed' })}
        open={dialog.mode !== 'closed'}
        title={
          dialog.mode === 'edit'
            ? t('interactions.list.editTitle', { code: dialog.item.catalogItem.code })
            : t('interactions.list.detailTitle')
        }
      >
        {dialog.mode === 'view' && <InteractionDetail interaction={dialog.item} />}
        {dialog.mode === 'edit' && (
          <InteractionEditForm
            interaction={dialog.item}
            onCancel={() => setDialog({ mode: 'closed' })}
            onSaved={handleSaved}
          />
        )}
      </Modal>
      <ConfirmDialog
        confirmLabel={t('common.delete')}
        description={t('interactions.list.removeDescription')}
        destructive
        isLoading={actions.remove.isRemoving}
        onCancel={actions.remove.cancel}
        onConfirm={() => void actions.remove.confirm()}
        open={actions.remove.target !== null}
        title={t('interactions.list.removeTitle')}
      />
    </div>
  );
}
