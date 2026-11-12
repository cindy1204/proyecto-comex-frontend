import { describe, expect, it } from 'vitest';
import {
  validateInteractionField,
  validateInteractionForm,
} from '@/features/interactions/domain/form-fields';

const TODAY = '2026-11-12';

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) data.set(name, value);
  return data;
}

function keyOf(
  type: 'formulario-importaciones' | 'formulario-exportaciones',
  name: string,
  entries: Record<string, string>,
): string | undefined {
  return validateInteractionField(type, name, form(entries), TODAY)?.key;
}

describe('validateInteractionField: montos y tasas', () => {
  it('exige montos mayores que cero', () => {
    expect(
      keyOf('formulario-importaciones', 'valorMonedaNegociacion', { valorMonedaNegociacion: '0' }),
    ).toBe('validation.numberPositive');
    expect(keyOf('formulario-importaciones', 'tipoCambioDolar', { tipoCambioDolar: '0.00' })).toBe(
      'validation.numberPositive',
    );
  });

  it('rechaza números con punto final o formato no numérico', () => {
    expect(keyOf('formulario-importaciones', 'valorFob', { valorFob: '1.' })).toBe(
      'validation.numberInvalid',
    );
    expect(keyOf('formulario-importaciones', 'valorFob', { valorFob: 'abc' })).toBe(
      'validation.numberInvalid',
    );
  });

  it('limita cifras: 15 enteras, 2 decimales en montos y 6 en tasas', () => {
    expect(keyOf('formulario-importaciones', 'valorFob', { valorFob: '1234567890123456' })).toBe(
      'validation.numberTooLong',
    );
    expect(keyOf('formulario-importaciones', 'valorFob', { valorFob: '1.234' })).toBe(
      'validation.numberTooLong',
    );
    expect(
      keyOf('formulario-importaciones', 'tipoCambioDolar', { tipoCambioDolar: '4000.1234567' }),
    ).toBe('validation.numberTooLong');
    expect(
      keyOf('formulario-importaciones', 'tipoCambioDolar', { tipoCambioDolar: '4000.123456' }),
    ).toBeUndefined();
  });
});

describe('validateInteractionField: fechas y monedas', () => {
  it('rechaza fechas futuras (hora de Bogotá) y fechas inexistentes', () => {
    expect(keyOf('formulario-importaciones', 'fechaTramite', { fechaTramite: '2026-11-13' })).toBe(
      'validation.dateFuture',
    );
    expect(
      keyOf('formulario-importaciones', 'fechaTramite', { fechaTramite: TODAY }),
    ).toBeUndefined();
    expect(keyOf('formulario-importaciones', 'fechaTramite', { fechaTramite: '2026-02-30' })).toBe(
      'validation.dateInvalid',
    );
  });

  it('solo acepta códigos de la lista de monedas', () => {
    expect(
      keyOf('formulario-importaciones', 'monedaNegociacion', { monedaNegociacion: 'XYZ' }),
    ).toBe('validation.currencyInvalid');
    expect(
      keyOf('formulario-importaciones', 'monedaNegociacion', { monedaNegociacion: 'USD' }),
    ).toBeUndefined();
  });
});

describe('validateInteractionField: identificación', () => {
  it('valida el formato según el tipo elegido', () => {
    expect(
      keyOf('formulario-exportaciones', 'identificacion', {
        tipoIdentificacion: 'NIT',
        identificacion: '800197268-5',
      }),
    ).toBe('validation.nitCheckDigit');
    expect(
      keyOf('formulario-exportaciones', 'identificacion', {
        tipoIdentificacion: 'Pasaporte',
        identificacion: 'AB12',
      }),
    ).toBe('validation.identificationInvalid');
  });
});

describe('validateInteractionField: total = valor × tasa', () => {
  const exportValues = {
    valorMonedaNegociacion: '1000,50',
    tasaCambioDolares: '1',
  };

  it('acepta un total igual a valor × tasa', () => {
    expect(
      keyOf('formulario-exportaciones', 'valorTotalDolares', {
        ...exportValues,
        valorTotalDolares: '1000.50',
      }),
    ).toBeUndefined();
  });

  it('tolera una diferencia de un centavo', () => {
    expect(
      keyOf('formulario-exportaciones', 'valorTotalDolares', {
        valorMonedaNegociacion: '10',
        tasaCambioDolares: '1.001',
        valorTotalDolares: '10.00',
      }),
    ).toBeUndefined();
  });

  it('rechaza un total que no coincide con valor × tasa', () => {
    const issue = validateInteractionField(
      'formulario-exportaciones',
      'valorTotalDolares',
      form({ ...exportValues, valorTotalDolares: '1000' }),
      TODAY,
    );
    expect(issue?.key).toBe('validation.totalMismatch');
    expect(issue?.params).toEqual({ expected: '1000.50' });
  });
});

describe('validateInteractionForm', () => {
  it('no reporta nada para el resto de campos vacíos sin marcarlos como obligatorios', () => {
    const issues = validateInteractionForm('formulario-importaciones', form({}), TODAY);
    expect(issues.map((issue) => issue.field)).toContain('fechaTramite');
    expect(issues.map((issue) => issue.field)).not.toContain('observaciones');
  });
});
