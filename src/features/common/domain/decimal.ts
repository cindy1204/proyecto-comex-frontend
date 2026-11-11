/**
 * Aritmética decimal exacta para montos. Trabaja con BigInt sobre dígitos y escala, así que
 * no hay errores de coma flotante y todo el redondeo es "mitad hacia arriba" a centavos.
 */

export interface ParsedDecimal {
  /** Todos los dígitos sin el punto decimal. */
  digits: bigint;
  /** Cantidad de dígitos después del punto. */
  scale: number;
}

const DECIMAL_PATTERN = /^(\d*)(?:\.(\d*))?$/;

/**
 * Acepta coma o punto como separador decimal. En estilo colombiano el punto agrupa miles
 * (`1.000,50`); en el estilo anglosajón la coma agrupa (`1,000.50`) y no se normaliza.
 */
export function normalizeDecimal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes(',')) return trimmed;
  const decimalSeparatorIsComma = trimmed.lastIndexOf(',') > trimmed.lastIndexOf('.');
  return decimalSeparatorIsComma ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
}

/** Devuelve `null` si el texto no es un número decimal no negativo (sin signo ni notación científica). */
export function parseDecimal(value: string): ParsedDecimal | null {
  const match = DECIMAL_PATTERN.exec(normalizeDecimal(value));
  if (!match || (!match[1] && !match[2])) return null;
  const fraction = match[2] ?? '';
  return { digits: BigInt(`${match[1] || '0'}${fraction}`), scale: fraction.length };
}

/** Convierte un número con escala en centavos, redondeando la mitad hacia arriba. */
export function toCents(digits: bigint, scale: number): bigint {
  if (scale <= 2) return digits * BigInt(10) ** BigInt(2 - scale);
  const divisor = BigInt(10) ** BigInt(scale - 2);
  return (digits + divisor / BigInt(2)) / divisor;
}

/** Centavos de un texto decimal, o `null` si no es válido. */
export function decimalToCents(value: string): bigint | null {
  const parsed = parseDecimal(value);
  return parsed ? toCents(parsed.digits, parsed.scale) : null;
}

/** Formatea centavos como `123.45`, con signo si son negativos. */
export function formatCents(cents: bigint): string {
  const sign = cents < BigInt(0) ? '-' : '';
  const absolute = cents < BigInt(0) ? -cents : cents;
  const whole = absolute / BigInt(100);
  const fraction = (absolute % BigInt(100)).toString().padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}
