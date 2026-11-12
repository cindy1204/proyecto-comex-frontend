import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { INTL_LOCALES } from '../../i18n/domain/locale';
import { Field, type FieldControlProps } from '../../common/components/field';
import { Input } from '../../common/components/input';
import { Select } from '../../common/components/select';
import { Textarea } from '../../common/components/textarea';
import type { FieldErrors } from '../../common/domain/api-error';
import { CURRENCY_CODES } from '../../common/domain/currencies';
import { todayInBogota } from '../../common/domain/date';
import { canonicalDecimal, formatDecimalForLocale } from '../../common/domain/decimal';
import type { CatalogItem } from '../../catalog/domain/catalog';
import {
  FORM_FIELDS,
  IDENTIFICATION_TYPES,
  exchangeFieldOf,
  type FormFieldDefinition,
} from '../domain/form-fields';
import { OPERATIONS, formatDataValue, type InteractionType } from '../domain/interaction';
import { calculateDollarTotal } from '../domain/calculate-dollar-total';

/** Quita tildes y mayúsculas para que "Ganadería" encuentre "ganaderia". */
function searchKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function FieldControl({
  definition,
  control,
  defaultValue,
  calculatedValue,
  today,
  currencyNames,
}: Readonly<{
  definition: FormFieldDefinition;
  control: FieldControlProps;
  defaultValue: string;
  calculatedValue?: string;
  today: string;
  currencyNames: Intl.DisplayNames;
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
  if (kind === 'currency') {
    return (
      <Select {...control} defaultValue={defaultValue} name={name} required={required}>
        <option disabled value="">
          {t(placeholderKey ?? 'interactions.currencyPlaceholder')}
        </option>
        {CURRENCY_CODES.map((code) => (
          <option key={code} value={code}>
            {code} · {currencyNames.of(code) ?? code}
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
  return (
    <Input
      {...control}
      {...(calculatedValue === undefined
        ? { defaultValue }
        : { value: calculatedValue, readOnly: true })}
      inputMode={kind === 'number' ? 'decimal' : undefined}
      max={kind === 'date' ? today : undefined}
      maxLength={kind === 'number' ? 24 : 250}
      name={name}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      type={kind === 'number' ? 'text' : kind}
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
  /** Valores iniciales: al editar, o los datos de identidad que se conservan tras guardar. */
  initialData?: Record<string, unknown>;
}

/** Total inicial: se recalcula con valor × tasa para que coincida con lo que valida el envío. */
function initialDollarTotal(type: InteractionType, initialData: Record<string, unknown>): string {
  const recalculated = calculateDollarTotal(
    formatDataValue(initialData.valorMonedaNegociacion),
    formatDataValue(initialData[exchangeFieldOf(type)]),
  );
  return recalculated || formatDataValue(initialData.valorTotalDolares);
}

/** Campos del formulario de una operación más el selector de numeral; compartido por alta y edición. */
export function InteractionFields({
  type,
  fieldErrors,
  numeral,
  initialData = {},
}: Readonly<InteractionFieldsProps>) {
  const { t, locale } = useTranslation();
  const intlLocale = INTL_LOCALES[locale];
  const { numeralField } = OPERATIONS[type];
  const canSelect = !numeral.isLoading && !numeral.error && numeral.items.length > 0;
  const today = todayInBogota();
  const currencyNames = useMemo(
    () => new Intl.DisplayNames(intlLocale, { type: 'currency' }),
    [intlLocale],
  );
  const [dollarTotal, setDollarTotal] = useState(() => initialDollarTotal(type, initialData));
  // Vista previa de cada número: muestra cómo se leerá lo escrito (p. ej. "1.000" = 1,000 en es-CO
  // se ve distinto de 1000) sin reescribir el valor mientras la persona escribe.
  const [previews, setPreviews] = useState<Record<string, string | undefined>>({});
  const [numeralQuery, setNumeralQuery] = useState('');
  const exchangeField = exchangeFieldOf(type);

  const visibleItems = useMemo(() => {
    const query = searchKey(numeralQuery.trim());
    if (!query) return numeral.items;
    // El numeral ya elegido siempre aparece, para que el selector no quede sin coincidencia.
    return numeral.items.filter(
      (item) =>
        item.code === numeral.value || searchKey(`${item.code} ${item.title}`).includes(query),
    );
  }, [numeral.items, numeral.value, numeralQuery]);

  function handleInput(event: FormEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const definition = FORM_FIELDS[type].find((field) => field.name === target.name);
    if (definition?.kind === 'number') {
      const canonical = canonicalDecimal(target.value);
      setPreviews((current) => ({
        ...current,
        [target.name]:
          canonical === null
            ? undefined
            : t('interactions.numberPreview', {
                value: formatDecimalForLocale(canonical, intlLocale),
              }),
      }));
    }
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
    <div className="grid gap-5 sm:grid-cols-2" onInput={handleInput}>
      {FORM_FIELDS[type].map((definition) => {
        const isTotal = definition.name === 'valorTotalDolares';
        const hint = isTotal ? t('interactions.totalHint') : previews[definition.name];
        return (
          <Field
            className={definition.kind === 'textarea' ? 'sm:col-span-2' : undefined}
            error={fieldErrors[definition.name]}
            hint={hint}
            key={definition.name}
            label={t(definition.labelKey)}
            required={definition.required}
          >
            {(control) => (
              <FieldControl
                control={control}
                currencyNames={currencyNames}
                calculatedValue={isTotal ? dollarTotal : undefined}
                defaultValue={formatDataValue(initialData[definition.name])}
                definition={definition}
                today={today}
              />
            )}
          </Field>
        );
      })}
      <Field
        hint={
          numeralQuery && visibleItems.length === 0 ? t('interactions.noNumeralMatches') : undefined
        }
        label={t('interactions.numeralSearch')}
      >
        {(control) => (
          <Input
            {...control}
            onChange={(event) => setNumeralQuery(event.target.value)}
            placeholder={t('interactions.numeralSearchPlaceholder')}
            type="search"
            value={numeralQuery}
          />
        )}
      </Field>
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
            {visibleItems.map((item) => (
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
