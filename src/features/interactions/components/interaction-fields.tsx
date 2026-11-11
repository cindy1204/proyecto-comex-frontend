import { useState, type FormEvent } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { Field, type FieldControlProps } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { Select } from '../../common/components/select';
import { Textarea } from '../../common/components/textarea';
import type { FieldErrors } from '../../common/domain/api-error';
import type { CatalogItem } from '../../catalog/domain/catalog';
import { FORM_FIELDS, IDENTIFICATION_TYPES, type FormFieldDefinition } from '../domain/form-fields';
import { OPERATIONS, formatDataValue, type InteractionType } from '../domain/interaction';
import { calculateDollarTotal } from '../domain/calculate-dollar-total';

function FieldControl({
  definition,
  control,
  defaultValue,
  calculatedValue,
}: Readonly<{
  definition: FormFieldDefinition;
  control: FieldControlProps;
  defaultValue: string;
  calculatedValue?: string;
}>) {
  const { t } = useTranslation();
  const { name, kind, placeholderKey, required } = definition;
  if (kind === 'identification') {
    return (
      <Select {...control} defaultValue={defaultValue} name={name}>
        <option disabled value="">
          {t('interactions.selectIdType')}
        </option>
        {IDENTIFICATION_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </Select>
    );
  }
  if (kind === 'textarea') {
    return (
      <Textarea
        {...control}
        defaultValue={defaultValue}
        maxLength={2000}
        name={name}
        required={required}
        rows={3}
      />
    );
  }
  const isCurrency = name === 'monedaNegociacion';
  return (
    <Input
      {...control}
      {...(calculatedValue === undefined
        ? { defaultValue }
        : { value: calculatedValue, readOnly: true })}
      maxLength={kind === 'number' ? undefined : isCurrency ? 3 : 250}
      min={kind === 'number' ? 0 : undefined}
      name={name}
      pattern={isCurrency ? '[A-Za-z]{3}' : undefined}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      step={kind === 'number' ? 'any' : undefined}
      type={kind}
    />
  );
}

interface NumeralSelection {
  items: CatalogItem[];
  isLoading: boolean;
  error: string | null;
  value: string;
  onChange: (code: string) => void;
}

interface InteractionFieldsProps {
  type: InteractionType;
  fieldErrors: FieldErrors;
  numeral: NumeralSelection;
  /** Valores iniciales (al editar). */
  initialData?: Record<string, unknown>;
}

/** Campos del formulario de una operación más el selector de numeral; compartido por alta y edición. */
export function InteractionFields({
  type,
  fieldErrors,
  numeral,
  initialData = {},
}: Readonly<InteractionFieldsProps>) {
  const { t } = useTranslation();
  const { numeralField } = OPERATIONS[type];
  const canSelect = !numeral.isLoading && !numeral.error && numeral.items.length > 0;
  const [dollarTotal, setDollarTotal] = useState(() =>
    formatDataValue(initialData.valorTotalDolares),
  );
  const exchangeField =
    type === 'formulario-importaciones' ? 'tipoCambioDolar' : 'tasaCambioDolares';

  function updateDollarTotal(event: FormEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== 'valorMonedaNegociacion' && target.name !== exchangeField) return;
    if (!target.form) return;
    const values = new FormData(target.form);
    setDollarTotal(
      calculateDollarTotal(
        String(values.get('valorMonedaNegociacion') ?? ''),
        String(values.get(exchangeField) ?? ''),
      ),
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2" onInput={updateDollarTotal}>
      {FORM_FIELDS[type].map((definition) => (
        <Field
          className={definition.kind === 'textarea' ? 'sm:col-span-2' : undefined}
          error={fieldErrors[definition.name]}
          key={definition.name}
          label={t(definition.labelKey)}
          required={definition.required}
        >
          {(control) => (
            <FieldControl
              control={control}
              calculatedValue={definition.name === 'valorTotalDolares' ? dollarTotal : undefined}
              defaultValue={formatDataValue(initialData[definition.name])}
              definition={definition}
            />
          )}
        </Field>
      ))}
      <Field
        error={fieldErrors[numeralField] ?? numeral.error ?? undefined}
        label={t('interactions.numeral')}
        required
      >
        {(control) => (
          <Select
            {...control}
            disabled={!canSelect}
            name={numeralField}
            onChange={(event) => numeral.onChange(event.target.value)}
            value={numeral.value}
          >
            <option value="">
              {numeral.isLoading
                ? t('interactions.numeralLoading')
                : t('interactions.numeralPlaceholder')}
            </option>
            {numeral.items.map((item) => (
              <option key={item.id} value={item.code}>
                {item.code} · {item.title}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  );
}
