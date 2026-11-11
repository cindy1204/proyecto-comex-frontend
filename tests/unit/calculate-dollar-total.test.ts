import { describe, expect, it } from 'vitest';
import { calculateDollarTotal } from '@/features/interactions/domain/calculate-dollar-total';

describe('calculateDollarTotal', () => {
  it.each([
    ['2000', '1', '2000.00'],
    ['250.25', '1.2345', '308.93'],
    ['1.005', '1', '1.01'],
    ['.5', '2', '1.00'],
    ['0', '3', '0.00'],
    ['2e3', '1.25', '2500.00'],
  ])('multiplies %s by %s to produce %s', (amount, rate, expected) => {
    expect(calculateDollarTotal(amount, rate)).toBe(expected);
  });

  it.each([
    ['', '1'],
    ['1', ''],
    ['-1', '2'],
    ['abc', '2'],
    ['1e309', '2'],
  ])('leaves the total empty for invalid values %j and %j', (amount, rate) => {
    expect(calculateDollarTotal(amount, rate)).toBe('');
  });
});
