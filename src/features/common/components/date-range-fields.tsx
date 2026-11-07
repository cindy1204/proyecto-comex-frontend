'use client';

import { useTranslation } from '../../i18n/hooks/use-translation';
import type { DateRange } from '../hooks/use-date-range';
import { Field } from './field';
import { Input } from './input';

/** Par de campos "Desde / Hasta" conectados a `useDateRange`. */
export function DateRangeFields({ range }: Readonly<{ range: DateRange }>) {
  const { t } = useTranslation();
  return (
    <>
      <Field label={t('common.dateFrom')}>
        {(control) => (
          <Input
            {...control}
            max={range.to || undefined}
            onChange={(event) => range.setFrom(event.target.value)}
            type="date"
            value={range.from}
          />
        )}
      </Field>
      <Field error={range.error ?? undefined} label={t('common.dateTo')}>
        {(control) => (
          <Input
            {...control}
            min={range.from || undefined}
            onChange={(event) => range.setTo(event.target.value)}
            type="date"
            value={range.to}
          />
        )}
      </Field>
    </>
  );
}
