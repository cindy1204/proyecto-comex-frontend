export const LOCALES = ['es', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/** Cookie que guarda el idioma elegido; la lee el servidor en cada petición. */
export const LOCALE_COOKIE = 'locale';

/** Un año, en segundos. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Locale de `Intl` (fechas, números, moneda) que corresponde a cada idioma. */
export const INTL_LOCALES: Record<Locale, string> = {
  es: 'es-CO',
  en: 'en-US',
};

/** Nombre de cada idioma en su propio idioma (no se traduce). */
export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Elige el primer idioma soportado de una cabecera `Accept-Language`
 * (`en-US,en;q=0.9,es;q=0.8`), respetando los pesos `q`.
 */
export function parseAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const candidates = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
      const quality = qParam ? Number(qParam.slice(2)) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((candidate) => candidate.tag && candidate.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of candidates) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return null;
}

/** Cookie `locale` -> `Accept-Language` -> idioma por defecto. */
export function resolveLocale(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(input.cookie)) return input.cookie;
  return parseAcceptLanguage(input.acceptLanguage) ?? DEFAULT_LOCALE;
}
