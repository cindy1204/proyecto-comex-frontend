import { formatCents, parseDecimal, toCents } from '../../common/domain/decimal';

/** Valor en dólares = monto × tasa, redondeado a centavos con la misma regla que el reintegro neto. */
export function calculateDollarTotal(amount: string, rate: string): string {
  const left = parseDecimal(amount);
  const right = parseDecimal(rate);
  if (!left || !right) return '';
  return formatCents(toCents(left.digits * right.digits, left.scale + right.scale));
}
