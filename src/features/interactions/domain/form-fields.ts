import {
  canonicalDecimal,
  decimalToCents,
  fitsDigits,
  formatCents,
  parseDecimal,
} from '../../common/domain/decimal';
import { isCurrencyCode } from '../../common/domain/currencies';
import { isRealIsoDate, todayInBogota } from '../../common/domain/date';
import type { ValidationIssue } from '../../common/domain/validation';
import type { TranslationKey } from '../../i18n/domain/translate';
import { calculateDollarTotal } from './calculate-dollar-total';
import { identificationIssue } from './identification-rules';
import { OPERATIONS, isDeclarationType, type InteractionType } from './interaction';

export interface FormFieldDefinition {
  /** Nombre técnico enviado al backend; no se traduce. */
  name: string;
  labelKey: TranslationKey;
  kind: 'text' | 'date' | 'number' | 'currency' | 'identification' | 'textarea';
  placeholderKey?: TranslationKey;
  required: boolean;
}

/** `value` se envía al backend tal cual; `labelKey` es solo la etiqueta visible. */
export const IDENTIFICATION_TYPES: ReadonlyArray<{ value: string; labelKey: TranslationKey }> = [
  { value: 'NIT', labelKey: 'interactions.identificationTypes.nit' },
  { value: 'Cédula de ciudadanía', labelKey: 'interactions.identificationTypes.citizenId' },
  { value: 'Cédula de extranjería', labelKey: 'interactions.identificationTypes.foreignId' },
  { value: 'Pasaporte', labelKey: 'interactions.identificationTypes.passport' },
];

const IMPORT_FIELDS: FormFieldDefinition[] = [
  {
    name: 'fechaTramite',
    labelKey: 'interactions.fields.import.fechaTramite',
    kind: 'date',
    required: true,
  },
  {
    name: 'tipoIdentificacion',
    labelKey: 'interactions.fields.import.tipoIdentificacion',
    kind: 'identification',
    required: true,
  },
  {
    name: 'identificacion',
    labelKey: 'interactions.fields.import.identificacion',
    kind: 'text',
    required: true,
  },
  {
    name: 'nombreImportador',
    labelKey: 'interactions.fields.import.nombreImportador',
    kind: 'text',
    required: true,
  },
  {
    name: 'monedaNegociacion',
    labelKey: 'interactions.fields.import.monedaNegociacion',
    kind: 'currency',
    placeholderKey: 'interactions.currencyPlaceholder',
    required: true,
  },
  {
    name: 'valorMonedaNegociacion',
    labelKey: 'interactions.fields.import.valorMonedaNegociacion',
    kind: 'number',
    required: true,
  },
  {
    name: 'tipoCambioDolar',
    labelKey: 'interactions.fields.import.tipoCambioDolar',
    kind: 'number',
    required: true,
  },
  {
    name: 'valorTotalDolares',
    labelKey: 'interactions.fields.import.valorTotalDolares',
    kind: 'number',
    required: true,
  },
  {
    name: 'numeroDeclaracionFactura',
    labelKey: 'interactions.fields.import.numeroDeclaracionFactura',
    kind: 'text',
    required: true,
  },
  {
    name: 'valorFob',
    labelKey: 'interactions.fields.import.valorFob',
    kind: 'number',
    required: true,
  },
  {
    name: 'beneficiarioExterior',
    labelKey: 'interactions.fields.import.beneficiarioExterior',
    kind: 'text',
    required: true,
  },
  {
    name: 'ciudadExterior',
    labelKey: 'interactions.fields.import.ciudadExterior',
    kind: 'text',
    required: true,
  },
  {
    name: 'paisExterior',
    labelKey: 'interactions.fields.import.paisExterior',
    kind: 'text',
    required: true,
  },
  {
    name: 'observaciones',
    labelKey: 'interactions.fields.import.observaciones',
    kind: 'textarea',
    required: false,
  },
  {
    name: 'nombreDeclarante',
    labelKey: 'interactions.fields.import.nombreDeclarante',
    kind: 'text',
    required: true,
  },
];

const EXPORT_FIELDS: FormFieldDefinition[] = [
  {
    name: 'fechaTramite',
    labelKey: 'interactions.fields.export.fechaTramite',
    kind: 'date',
    required: true,
  },
  {
    name: 'tipoIdentificacion',
    labelKey: 'interactions.fields.export.tipoIdentificacion',
    kind: 'identification',
    required: true,
  },
  {
    name: 'identificacion',
    labelKey: 'interactions.fields.export.identificacion',
    kind: 'text',
    required: true,
  },
  {
    name: 'nombreExportador',
    labelKey: 'interactions.fields.export.nombreExportador',
    kind: 'text',
    required: true,
  },
  {
    name: 'monedaNegociacion',
    labelKey: 'interactions.fields.export.monedaNegociacion',
    kind: 'currency',
    placeholderKey: 'interactions.currencyPlaceholder',
    required: true,
  },
  {
    name: 'valorMonedaNegociacion',
    labelKey: 'interactions.fields.export.valorMonedaNegociacion',
    kind: 'number',
    required: true,
  },
  {
    name: 'tasaCambioDolares',
    labelKey: 'interactions.fields.export.tasaCambioDolares',
    kind: 'number',
    required: true,
  },
  {
    name: 'valorTotalDolares',
    labelKey: 'interactions.fields.export.valorTotalDolares',
    kind: 'number',
    required: true,
  },
  {
    name: 'numeroDocumento',
    labelKey: 'interactions.fields.export.numeroDocumento',
    kind: 'text',
    required: true,
  },
  {
    name: 'valorReintegrado',
    labelKey: 'interactions.fields.export.valorReintegrado',
    kind: 'number',
    required: true,
  },
  {
    name: 'totalValorFob',
    labelKey: 'interactions.fields.export.totalValorFob',
    kind: 'number',
    required: true,
  },
  {
    name: 'totalGastosExportacion',
    labelKey: 'interactions.fields.export.totalGastosExportacion',
    kind: 'number',
    required: true,
  },
  {
    name: 'deducciones',
    labelKey: 'interactions.fields.export.deducciones',
    kind: 'number',
    required: true,
  },
  {
    name: 'observaciones',
    labelKey: 'interactions.fields.export.observaciones',
    kind: 'textarea',
    required: false,
  },
  {
    name: 'nombreDeclarante',
    labelKey: 'interactions.fields.export.nombreDeclarante',
    kind: 'text',
    required: true,
  },
];

/**
 * Núcleo común de servicios, inversiones y endeudamiento: el mismo que valida el backend
 * (`declarationDataSchema`). El anexo DCIP-83 no define campos por familia, así que no se agregan
 * más campos aquí; el numeral se elige en el selector.
 */
const DECLARATION_FIELDS: FormFieldDefinition[] = [
  {
    name: 'fechaTramite',
    labelKey: 'interactions.fields.declaration.fechaTramite',
    kind: 'date',
    required: true,
  },
  {
    name: 'tipoIdentificacion',
    labelKey: 'interactions.fields.declaration.tipoIdentificacion',
    kind: 'identification',
    required: true,
  },
  {
    name: 'identificacion',
    labelKey: 'interactions.fields.declaration.identificacion',
    kind: 'text',
    required: true,
  },
  {
    name: 'nombreTitular',
    labelKey: 'interactions.fields.declaration.nombreTitular',
    kind: 'text',
    required: true,
  },
  {
    name: 'monedaNegociacion',
    labelKey: 'interactions.fields.declaration.monedaNegociacion',
    kind: 'currency',
    placeholderKey: 'interactions.currencyPlaceholder',
    required: true,
  },
  {
    name: 'valorMonedaNegociacion',
    labelKey: 'interactions.fields.declaration.valorMonedaNegociacion',
    kind: 'number',
    required: true,
  },
  {
    name: 'tasaCambioDolares',
    labelKey: 'interactions.fields.declaration.tasaCambioDolares',
    kind: 'number',
    required: true,
  },
  {
    name: 'valorTotalDolares',
    labelKey: 'interactions.fields.declaration.valorTotalDolares',
    kind: 'number',
    required: true,
  },
  {
    name: 'observaciones',
    labelKey: 'interactions.fields.declaration.observaciones',
    kind: 'textarea',
    required: false,
  },
  {
    name: 'nombreDeclarante',
    labelKey: 'interactions.fields.declaration.nombreDeclarante',
    kind: 'text',
    required: true,
  },
];

export const FORM_FIELDS: Record<InteractionType, FormFieldDefinition[]> = {
  'formulario-importaciones': IMPORT_FIELDS,
  'formulario-exportaciones': EXPORT_FIELDS,
  'formulario-servicios': DECLARATION_FIELDS,
  'formulario-inversiones': DECLARATION_FIELDS,
  'formulario-endeudamiento': DECLARATION_FIELDS,
};

export type DocumentKey = Extract<TranslationKey, `interactions.documents.${string}`>;

const IMPORT_DOCUMENTS: Record<string, DocumentKey[]> = {
  '2015': ['interactions.documents.transportBill'],
  '2017': ['interactions.documents.invoiceOrProforma'],
  '2022': ['interactions.documents.invoice', 'interactions.documents.importDeclaration'],
  '2023': ['interactions.documents.invoice', 'interactions.documents.importDeclaration'],
  '2024': ['interactions.documents.invoice', 'interactions.documents.importDeclaration'],
  '2025': ['interactions.documents.invoice', 'interactions.documents.importDeclaration'],
};

const EXPORT_DOCUMENTS: Record<string, DocumentKey[]> = {
  '1045': ['interactions.documents.invoiceOrProforma'],
  '1050': ['interactions.documents.invoiceOrProforma'],
  '1510': [],
};

/** Exportaciones cuyos numerales no legalizan factura. */
export const NUMERALS_WITHOUT_INVOICE = ['1045', '1050', '1510'];

/**
 * Documentos sugeridos por numeral, o `null` si no hay regla: importaciones sin entrada en la tabla
 * y todas las declaraciones de servicios, inversiones y endeudamiento (el anexo no los define).
 */
export function suggestedDocuments(
  type: InteractionType,
  numeralCode: string,
): DocumentKey[] | null {
  if (isDeclarationType(type)) return null;
  if (type === 'formulario-importaciones') return IMPORT_DOCUMENTS[numeralCode] ?? null;
  return (
    EXPORT_DOCUMENTS[numeralCode] ?? [
      'interactions.documents.invoice',
      'interactions.documents.exportDeclaration',
    ]
  );
}

/** Reintegro neto en centavos = FOB + gastos - deducciones. Un valor vacío o inválido cuenta como 0. */
export function calculateNetCents(values: FormData): bigint {
  const cents = (name: string) => decimalToCents(String(values.get(name) ?? '')) ?? BigInt(0);
  return cents('totalValorFob') + cents('totalGastosExportacion') - cents('deducciones');
}

export function calculateNetReintegro(values: FormData): string {
  return formatCents(calculateNetCents(values));
}

/** Convierte el formulario en el `data` que espera el backend (todo texto; exportación suma el reintegro neto). */
export function readInteractionData(
  type: InteractionType,
  values: FormData,
): Record<string, string> {
  const numericFields = new Set(
    FORM_FIELDS[type].filter((field) => field.kind === 'number').map((field) => field.name),
  );
  const data: Record<string, string> = {};
  for (const [key, value] of values.entries()) {
    data[key] = numericFields.has(key)
      ? (canonicalDecimal(String(value)) ?? String(value).trim())
      : String(value);
  }
  if (type === 'formulario-exportaciones')
    data.reintegroNetoCalculado = calculateNetReintegro(values);
  return data;
}

/** Clave de la etiqueta visible de un dato guardado; `undefined` si el nombre no tiene definición. */
export function fieldLabelKey(type: InteractionType, name: string): TranslationKey | undefined {
  if (name === OPERATIONS[type].numeralField) return 'interactions.numeral';
  if (name === 'reintegroNetoCalculado') return 'interactions.netReintegroLabel';
  return FORM_FIELDS[type].find((field) => field.name === name)?.labelKey;
}

/** Datos de identidad que se conservan al guardar otra operación (el resto se limpia). */
export const RETAINED_FIELDS: readonly string[] = [
  'tipoIdentificacion',
  'identificacion',
  'nombreImportador',
  'nombreExportador',
  'nombreTitular',
  'nombreDeclarante',
];

/** Campo de tasa de cambio según la operación: la importación la llama `tipoCambioDolar`. */
export function exchangeFieldOf(type: InteractionType): string {
  return type === 'formulario-importaciones' ? 'tipoCambioDolar' : 'tasaCambioDolares';
}

/** Montos y tasas: deben ser mayores que cero. Los demás valores numéricos pueden ser cero. */
const POSITIVE_NUMBER_FIELDS: ReadonlySet<string> = new Set([
  'valorMonedaNegociacion',
  'valorTotalDolares',
  'tipoCambioDolar',
  'tasaCambioDolares',
]);
const RATE_FIELDS: ReadonlySet<string> = new Set(['tipoCambioDolar', 'tasaCambioDolares']);

/** Límites de dígitos: enteros hasta 15; montos con 2 decimales y tasas con 6. */
export const MAX_INTEGER_DIGITS = 15;
export const MAX_AMOUNT_DECIMALS = 2;
export const MAX_RATE_DECIMALS = 6;

/** El total en dólares se compara con valor × tasa con una tolerancia de un centavo. */
const TOTAL_TOLERANCE_CENTS = BigInt(1);

function readValue(values: FormData, name: string): string {
  return String(values.get(name) ?? '').trim();
}

function numberIssue(field: string, raw: string): ValidationIssue | null {
  const canonical = canonicalDecimal(raw);
  if (canonical === null) return { field, key: 'validation.numberInvalid' };
  const maxFraction = RATE_FIELDS.has(field) ? MAX_RATE_DECIMALS : MAX_AMOUNT_DECIMALS;
  if (!fitsDigits(canonical, MAX_INTEGER_DIGITS, maxFraction))
    return {
      field,
      key: 'validation.numberTooLong',
      params: { integer: MAX_INTEGER_DIGITS, fraction: maxFraction },
    };
  if (POSITIVE_NUMBER_FIELDS.has(field) && parseDecimal(canonical)?.digits === BigInt(0))
    return { field, key: 'validation.numberPositive' };
  return null;
}

/** Total en dólares igual a valor × tasa (con tolerancia de un centavo). */
function totalIssue(type: InteractionType, values: FormData): ValidationIssue | null {
  const expected = calculateDollarTotal(
    readValue(values, 'valorMonedaNegociacion'),
    readValue(values, exchangeFieldOf(type)),
  );
  const expectedCents = decimalToCents(expected);
  const totalCents = decimalToCents(readValue(values, 'valorTotalDolares'));
  if (expectedCents === null || totalCents === null) return null;
  const difference = totalCents - expectedCents;
  const absolute = difference < BigInt(0) ? -difference : difference;
  return absolute > TOTAL_TOLERANCE_CENTS
    ? { field: 'valorTotalDolares', key: 'validation.totalMismatch', params: { expected } }
    : null;
}

function dateIssue(field: string, value: string, today: string): ValidationIssue | null {
  if (!isRealIsoDate(value)) return { field, key: 'validation.dateInvalid' };
  if (value > today) return { field, key: 'validation.dateFuture' };
  return null;
}

/**
 * Problema de un solo campo, o `null`. Lo usan el envío completo y la validación al salir del campo.
 * `today` (fecha de Bogotá) es parámetro para poder probar las reglas de fecha.
 */
export function validateInteractionField(
  type: InteractionType,
  name: string,
  values: FormData,
  today: string = todayInBogota(),
): ValidationIssue | null {
  const definition = FORM_FIELDS[type].find((field) => field.name === name);
  if (!definition) return null;
  const value = readValue(values, name);
  if (!value) return definition.required ? { field: name, key: 'validation.required' } : null;

  if (name === 'identificacion') {
    const identificationType = readValue(values, 'tipoIdentificacion');
    const key = identificationType ? identificationIssue(identificationType, value) : null;
    return key ? { field: name, key } : null;
  }
  switch (definition.kind) {
    case 'number': {
      const issue = numberIssue(name, value);
      if (issue) return issue;
      return name === 'valorTotalDolares' ? totalIssue(type, values) : null;
    }
    case 'date':
      return dateIssue(name, value, today);
    case 'currency':
      return isCurrencyCode(value) ? null : { field: name, key: 'validation.currencyInvalid' };
    default:
      return null;
  }
}

/**
 * Valida el formulario completo: campos obligatorios y su formato, numeral seleccionado,
 * total = valor × tasa y reintegro neto no negativo.
 */
export function validateInteractionForm(
  type: InteractionType,
  values: FormData,
  today: string = todayInBogota(),
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const { name } of FORM_FIELDS[type]) {
    const issue = validateInteractionField(type, name, values, today);
    if (issue) issues.push(issue);
  }
  const numeralField = OPERATIONS[type].numeralField;
  if (!readValue(values, numeralField))
    issues.push({ field: numeralField, key: 'validation.required' });
  if (type === 'formulario-exportaciones' && calculateNetCents(values) < BigInt(0))
    issues.push({ field: 'deducciones', key: 'validation.netNegative' });
  return issues;
}
