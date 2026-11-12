/** Zona horaria operativa de los trámites: la fecha "de hoy" se calcula en Bogotá, no en UTC. */
export const BUSINESS_TIME_ZONE = 'America/Bogota';

const businessDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha de hoy en Bogotá como `YYYY-MM-DD` (el formato del `<input type="date">`). */
export function todayInBogota(now: Date = new Date()): string {
  return businessDateFormatter.format(now);
}

/** `true` si `value` es una fecha ISO real (no `2026-02-30`). */
export function isRealIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
