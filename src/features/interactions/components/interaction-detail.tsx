'use client';

import { Badge } from '../../common/components/badge';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { fieldLabelKey } from '../domain/form-fields';
import { interactionLabel, formatDataValue, type Interaction } from '../domain/interaction';

export function InteractionDetail({ interaction }: Readonly<{ interaction: Interaction }>) {
  const { t, format } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{interactionLabel(interaction.type, t)}</Badge>
        <span className="font-semibold">
          {interaction.catalogItem.code} · {interaction.catalogItem.title}
        </span>
      </div>
      {interaction.user && (
        <p className="text-sm text-muted-foreground">
          {t('interactions.detail.user')}{' '}
          <span className="font-semibold text-foreground">{interaction.user.name}</span> ·{' '}
          {interaction.user.email}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {t('interactions.detail.sentOn')}{' '}
        <time dateTime={interaction.createdAt}>{format.dateTime(interaction.createdAt)}</time>
        {interaction.updatedAt !== interaction.createdAt && (
          <>
            {' '}
            · {t('interactions.detail.updatedOn')}{' '}
            <time dateTime={interaction.updatedAt}>{format.dateTime(interaction.updatedAt)}</time>
          </>
        )}
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {Object.entries(interaction.data).map(([key, value]) => {
          const labelKey = fieldLabelKey(interaction.type, key);
          return (
            <div key={key}>
              <dt className="type-label text-muted-foreground">{labelKey ? t(labelKey) : key}</dt>
              <dd className="break-words text-foreground">{formatDataValue(value) || '—'}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
