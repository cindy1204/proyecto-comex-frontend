function parseDecimal(value: string): { digits: bigint; scale: number } | null {
  const match = /^(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(value);
  if (!match || (!match[1] && !match[2]) || !Number.isFinite(Number(value))) return null;

  const digits = BigInt(`${match[1]}${match[2] ?? ''}`);
  const exponent = Number(match[3] ?? 0);
  if (digits === BigInt(0)) return { digits, scale: 0 };
  if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000) return null;
  return { digits, scale: (match[2]?.length ?? 0) - exponent };
}

export function calculateDollarTotal(amount: string, rate: string): string {
  const left = parseDecimal(amount);
  const right = parseDecimal(rate);
  if (!left || !right || !Number.isFinite(Number(amount) * Number(rate))) return '';

  const product = left.digits * right.digits;
  const scale = left.scale + right.scale - 2;
  let cents: bigint;
  if (scale <= 0) {
    cents = product * BigInt(10) ** BigInt(-scale);
  } else if (scale > product.toString().length) {
    cents = BigInt(0);
  } else {
    const divisor = BigInt(10) ** BigInt(scale);
    cents = (product + divisor / BigInt(2)) / divisor;
  }
  return `${cents / BigInt(100)}.${(cents % BigInt(100)).toString().padStart(2, '0')}`;
}
