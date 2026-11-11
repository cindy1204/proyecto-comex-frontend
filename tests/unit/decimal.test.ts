import { describe, expect, it } from 'vitest';
import {
  decimalToCents,
  formatCents,
  normalizeDecimal,
  parseDecimal,
  toCents,
} from '@/features/common/domain/decimal';

describe('normalizeDecimal', () => {
  it.each([
    ['1,5', '1.5'],
    ['1.000,50', '1000.50'],
    ['1500.75', '1500.75'],
    ['1,000.50', '1,000.50'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeDecimal(input)).toBe(expected);
  });
});

describe('parseDecimal', () => {
  it('accepts comma and dot decimal separators', () => {
    expect(parseDecimal('1,5')).toEqual({ digits: BigInt(15), scale: 1 });
    expect(parseDecimal('1.5')).toEqual({ digits: BigInt(15), scale: 1 });
  });

  it.each(['', '-1', '+1', 'abc', '1e3', '.', ','])('rejects %j', (input) => {
    expect(parseDecimal(input)).toBeNull();
  });
});

describe('toCents', () => {
  it('rounds half up to cents', () => {
    expect(toCents(BigInt(1005), 3)).toBe(BigInt(101));
    expect(toCents(BigInt(1004), 3)).toBe(BigInt(100));
    expect(toCents(BigInt(5), 0)).toBe(BigInt(500));
  });
});

describe('decimalToCents', () => {
  it('returns cents for valid text and null otherwise', () => {
    expect(decimalToCents('10,005')).toBe(BigInt(1001));
    expect(decimalToCents('2.5')).toBe(BigInt(250));
    expect(decimalToCents('-2')).toBeNull();
  });
});

describe('formatCents', () => {
  it.each([
    [BigInt(0), '0.00'],
    [BigInt(5), '0.05'],
    [BigInt(123456), '1234.56'],
    [BigInt(-5), '-0.05'],
    [BigInt(-250), '-2.50'],
  ])('formats %s cents as %s', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });
});
