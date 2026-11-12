import { describe, expect, it } from 'vitest';
import { CURRENCY_CODES, isCurrencyCode } from '@/features/common/domain/currencies';
import { isRealIsoDate, todayInBogota } from '@/features/common/domain/date';
import {
  identificationIssue,
  nitCheckDigit,
} from '@/features/interactions/domain/identification-rules';

describe('nitCheckDigit', () => {
  it('calcula el dígito de verificación de la DIAN', () => {
    expect(nitCheckDigit('800197268')).toBe(4);
  });

  it('devuelve un dígito entre 0 y 9 para cualquier NIT', () => {
    for (const nit of ['900123456', '123456789', '830000000']) {
      const digit = nitCheckDigit(nit);
      expect(digit).toBeGreaterThanOrEqual(0);
      expect(digit).toBeLessThanOrEqual(9);
    }
  });
});

describe('identificationIssue', () => {
  it('exige el dígito de verificación en el NIT', () => {
    expect(identificationIssue('NIT', '900123456')).toBe('validation.nitCheckDigitMissing');
    expect(identificationIssue('NIT', '900123456-')).toBe('validation.identificationInvalid');
  });

  it('acepta NIT con el dígito correcto y rechaza uno incorrecto', () => {
    expect(identificationIssue('NIT', '800197268-4')).toBeNull();
    expect(identificationIssue('NIT', '900123456-8')).toBeNull();
    expect(identificationIssue('NIT', '800197268-5')).toBe('validation.nitCheckDigit');
  });

  it('rechaza NIT demasiado cortos o con letras', () => {
    expect(identificationIssue('NIT', '12345')).toBe('validation.identificationInvalid');
    expect(identificationIssue('NIT', 'ABC123456')).toBe('validation.identificationInvalid');
  });

  it('valida cédula de ciudadanía solo con dígitos', () => {
    expect(identificationIssue('Cédula de ciudadanía', '1234567890')).toBeNull();
    expect(identificationIssue('Cédula de ciudadanía', 'AB123456')).toBe(
      'validation.identificationInvalid',
    );
  });

  it('valida cédula de extranjería y pasaporte alfanuméricos por longitud', () => {
    expect(identificationIssue('Cédula de extranjería', 'AB12345')).toBeNull();
    expect(identificationIssue('Pasaporte', 'AB123')).toBeNull();
    expect(identificationIssue('Pasaporte', 'AB12')).toBe('validation.identificationInvalid');
  });

  it('rechaza un tipo desconocido', () => {
    expect(identificationIssue('Otro', '123456')).toBe('validation.identificationInvalid');
  });
});

describe('currencies', () => {
  it('incluye monedas de uso común y excluye fondos, metales y XXX', () => {
    expect(CURRENCY_CODES).toEqual(expect.arrayContaining(['COP', 'USD', 'EUR']));
    expect(CURRENCY_CODES).not.toContain('XXX');
    expect(CURRENCY_CODES).not.toContain('XAU');
    expect(CURRENCY_CODES).not.toContain('CUC');
  });

  it('valida códigos exactos, sensibles a mayúsculas', () => {
    expect(isCurrencyCode('USD')).toBe(true);
    expect(isCurrencyCode('usd')).toBe(false);
    expect(isCurrencyCode('XYZ')).toBe(false);
  });
});

describe('dates', () => {
  it('calcula "hoy" en Bogotá, no en UTC', () => {
    // 03:00 UTC del 12 es las 22:00 del 11 en Bogotá (UTC-5, sin horario de verano).
    expect(todayInBogota(new Date('2026-11-12T03:00:00Z'))).toBe('2026-11-11');
    expect(todayInBogota(new Date('2026-11-12T05:30:00Z'))).toBe('2026-11-12');
  });

  it('acepta solo fechas ISO reales', () => {
    expect(isRealIsoDate('2026-02-28')).toBe(true);
    expect(isRealIsoDate('2024-02-29')).toBe(true);
    expect(isRealIsoDate('2026-02-30')).toBe(false);
    expect(isRealIsoDate('2026-2-1')).toBe(false);
  });
});
