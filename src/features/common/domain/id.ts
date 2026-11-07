/** Identificador cuid que el backend exige en parámetros y filtros (`z.cuid`). */
export function isCuid(value: string): boolean {
  return /^c[a-z0-9]{20,31}$/.test(value);
}
