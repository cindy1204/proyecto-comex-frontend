import { describe, expect, it } from 'vitest';
import {
  FORM_FIELDS,
  fieldLabelKey,
  readInteractionData,
  suggestedDocuments,
  validateInteractionForm,
} from '@/features/interactions/domain/form-fields';
import {
  DECLARATION_TYPES,
  OPERATIONS,
  isDeclarationType,
  isInteractionType,
} from '@/features/interactions/domain/interaction';
import { DECLARATION_SERVICES } from '@/features/services/domain/services';

function formOf(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [name, value] of Object.entries(entries)) form.append(name, value);
  return form;
}

/** Valores válidos que enviaría el formulario de una declaración (todos los campos del contrato). */
const VALID_DECLARATION: Record<string, string> = {
  fechaTramite: '2026-10-01',
  tipoIdentificacion: 'NIT',
  identificacion: '900123456-8',
  nombreTitular: 'ACME S.A.S.',
  monedaNegociacion: 'USD',
  valorMonedaNegociacion: '1000,50',
  tasaCambioDolares: '1',
  valorTotalDolares: '1000.50',
  observaciones: '',
  nombreDeclarante: 'Ana Pérez',
  numeralCambiario: '1000',
};

/** Nombres que el backend acepta en `declarationDataSchema` (strict): cualquier otra clave se rechaza. */
const BACKEND_DECLARATION_KEYS = [
  'fechaTramite',
  'tipoIdentificacion',
  'identificacion',
  'nombreTitular',
  'monedaNegociacion',
  'valorMonedaNegociacion',
  'tasaCambioDolares',
  'valorTotalDolares',
  'observaciones',
  'nombreDeclarante',
  'numeralCambiario',
];

describe('declaration families', () => {
  it('son servicios, inversiones y endeudamiento, y cada una tiene categoría y numeral propios', () => {
    expect(DECLARATION_TYPES).toEqual([
      'formulario-servicios',
      'formulario-inversiones',
      'formulario-endeudamiento',
    ]);
    expect(OPERATIONS['formulario-servicios']).toEqual({
      category: 'servicios',
      numeralField: 'numeralCambiario',
    });
    expect(OPERATIONS['formulario-inversiones'].category).toBe('inversiones');
    expect(OPERATIONS['formulario-endeudamiento'].category).toBe('endeudamiento');
  });

  it('reconoce tipos de declaración y de formulario válidos, y rechaza el resto', () => {
    expect(isDeclarationType('formulario-servicios')).toBe(true);
    expect(isDeclarationType('formulario-importaciones')).toBe(false);
    expect(isInteractionType('formulario-inversiones')).toBe(true);
    expect(isInteractionType('formulario-otro')).toBe(false);
    expect(isInteractionType('')).toBe(false);
  });

  it('solo los servicios con declaración exponen la ruta /servicios/[slug]/declaracion', () => {
    const declared = DECLARATION_SERVICES.map((service) => service.declarationType);
    expect(declared).toEqual(DECLARATION_TYPES);
  });
});

describe('declaration fields', () => {
  it.each(DECLARATION_TYPES)(
    '%s define exactamente los campos del contrato del backend',
    (type) => {
      const names = FORM_FIELDS[type].map((field) => field.name);
      expect([...names, OPERATIONS[type].numeralField].sort()).toEqual(
        [...BACKEND_DECLARATION_KEYS].sort(),
      );
    },
  );

  it('no hereda campos de exportación ni importación', () => {
    for (const type of DECLARATION_TYPES) {
      const names = FORM_FIELDS[type].map((field) => field.name);
      expect(names).not.toContain('reintegroNetoCalculado');
      expect(names).not.toContain('nombreImportador');
      expect(names).not.toContain('nombreExportador');
    }
  });

  it('usa la etiqueta de numeral cambiario para el numeral', () => {
    expect(fieldLabelKey('formulario-servicios', 'numeralCambiario')).toBe('interactions.numeral');
  });
});

describe('validateInteractionForm (declarations)', () => {
  it.each(DECLARATION_TYPES)('%s acepta una declaración completa y válida', (type) => {
    expect(validateInteractionForm(type, formOf(VALID_DECLARATION))).toEqual([]);
  });

  it('exige el titular y el numeral cambiario', () => {
    const issues = validateInteractionForm(
      'formulario-inversiones',
      formOf({ ...VALID_DECLARATION, nombreTitular: '', numeralCambiario: '' }),
    );
    expect(issues).toEqual(
      expect.arrayContaining([
        { field: 'nombreTitular', key: 'validation.required' },
        { field: 'numeralCambiario', key: 'validation.required' },
      ]),
    );
  });

  it('valida montos y moneda', () => {
    const issues = validateInteractionForm(
      'formulario-endeudamiento',
      formOf({ ...VALID_DECLARATION, valorTotalDolares: 'mil', monedaNegociacion: 'DOLARES' }),
    );
    expect(issues).toEqual(
      expect.arrayContaining([
        { field: 'valorTotalDolares', key: 'validation.numberInvalid' },
        { field: 'monedaNegociacion', key: 'validation.currencyInvalid' },
      ]),
    );
  });

  it('no aplica la regla de reintegro neto negativo', () => {
    const issues = validateInteractionForm(
      'formulario-servicios',
      formOf({ ...VALID_DECLARATION, deducciones: '999' }),
    );
    expect(issues.map((issue) => issue.key)).not.toContain('validation.netNegative');
  });
});

describe('readInteractionData (declarations)', () => {
  it.each(DECLARATION_TYPES)('%s produce solo las claves que el backend acepta', (type) => {
    const data = readInteractionData(type, formOf(VALID_DECLARATION));
    expect(Object.keys(data).sort()).toEqual([...BACKEND_DECLARATION_KEYS].sort());
    expect(data).not.toHaveProperty('reintegroNetoCalculado');
  });

  it('normaliza los montos decimales', () => {
    const data = readInteractionData('formulario-servicios', formOf(VALID_DECLARATION));
    expect(data.valorMonedaNegociacion).toBe('1000.50');
    expect(data.nombreTitular).toBe('ACME S.A.S.');
  });
});

describe('suggestedDocuments (declarations)', () => {
  it.each(DECLARATION_TYPES)('%s no sugiere documentos del formulario oficial', (type) => {
    expect(suggestedDocuments(type, '1000')).toBeNull();
  });
});
