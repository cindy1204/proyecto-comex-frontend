import type { TranslationKey } from '../../i18n/domain/translate';
import type { InteractionType } from './interaction';

export interface FormFieldDefinition {
  /** Nombre técnico enviado al backend; no se traduce. */
  name: string;
  labelKey: TranslationKey;
  kind: 'text' | 'date' | 'number' | 'identification' | 'textarea';
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
    kind: 'text',
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
    kind: 'text',
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

export const FORM_FIELDS: Record<InteractionType, FormFieldDefinition[]> = {
  'formulario-importaciones': IMPORT_FIELDS,
  'formulario-exportaciones': EXPORT_FIELDS,
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

/** Documentos sugeridos por numeral, o `null` si no hay regla para ese numeral de importación. */
export function suggestedDocuments(
  type: InteractionType,
  numeralCode: string,
): DocumentKey[] | null {
  if (type === 'formulario-importaciones') return IMPORT_DOCUMENTS[numeralCode] ?? null;
  return (
    EXPORT_DOCUMENTS[numeralCode] ?? [
      'interactions.documents.invoice',
      'interactions.documents.exportDeclaration',
    ]
  );
}

/** Reintegro neto = FOB + gastos - deducciones, calculado en centavos para evitar errores de coma flotante. */
export function calculateNetReintegro(values: FormData): string {
  const toCents = (name: string) => {
    const value = Number(values.get(name));
    return Number.isFinite(value) ? Math.round(value * 100) : 0;
  };
  const cents =
    toCents('totalValorFob') + toCents('totalGastosExportacion') - toCents('deducciones');
  return (cents / 100).toFixed(2);
}

/** Convierte el formulario en el `data` que espera el backend (todo texto; exportación suma el reintegro neto). */
export function readInteractionData(
  type: InteractionType,
  values: FormData,
): Record<string, string> {
  const data: Record<string, string> = {};
  for (const [key, value] of values.entries()) data[key] = String(value);
  if (type === 'formulario-exportaciones')
    data.reintegroNetoCalculado = calculateNetReintegro(values);
  return data;
}
