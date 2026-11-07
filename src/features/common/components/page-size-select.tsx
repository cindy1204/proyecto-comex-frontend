'use client';

import { useTranslation } from '../../i18n/hooks/use-translation';
import { Field } from './field';
import { Select } from './select';

const OPTIONS = [10, 20, 50] as const;

interface PageSizeSelectProps {
  value: number;
  onChange: (limit: number) => void;
}

export function PageSizeSelect({ value, onChange }: Readonly<PageSizeSelectProps>) {
  const { t } = useTranslation();
  return (
    <Field label={t('common.pageSize')}>
      {(control) => (
        <Select
          {...control}
          onChange={(event) => onChange(Number(event.target.value))}
          value={value}
        >
          {OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}
