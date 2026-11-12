import { describe, expect, it } from 'vitest';
import {
  canonicalDecimal,
  fitsDigits,
  formatDecimalForLocale,
} from '@/features/common/domain/decimal';

describe('canonicalDecimal', () => {
  it.each([
    ['1,5', '1.5'],
    ['42', '42'],
    ['.5', '0.5'],
    ['1000.50', '1000.50'],
  ])('acepta %s como %s', (input, expected) => {
    expect(canonicalDecimal(input)).toBe(expected);
  });

  it.each(['1.', '', '-1', '+1', '1e3', 'abc', '.', ',', '1,000.50'])('rechaza %s', (input) => {
    expect(canonicalDecimal(input)).toBeNull();
  });
});

describe('fitsDigits', () => {
  it('acepta hasta 15 cifras enteras y 2 decimales', () => {
    expect(fitsDigits('123456789012345', 15, 2)).toBe(true);
    expect(fitsDigits('1.99', 15, 2)).toBe(true);
  });

  it('rechaza más cifras de las permitidas', () => {
    expect(fitsDigits('1234567890123456', 15, 2)).toBe(false);
    expect(fitsDigits('1.999', 15, 2)).toBe(false);
  });

  it('ignora los ceros a la izquierda al contar cifras enteras', () => {
    expect(fitsDigits('0000000000000001', 15, 2)).toBe(true);
  });
});

describe('formatDecimalForLocale', () => {
  it('muestra el separador de miles y decimal del idioma', () => {
    expect(formatDecimalForLocale('1000.50', 'es-CO')).toBe('1.000,50');
    expect(formatDecimalForLocale('1000.50', 'en-US')).toBe('1,000.50');
  });

  it('no agrega decimales ni separadores a cifras cortas', () => {
    expect(formatDecimalForLocale('12', 'es-CO')).toBe('12');
    expect(formatDecimalForLocale('1000', 'es-CO')).toBe('1.000');
  });
});
