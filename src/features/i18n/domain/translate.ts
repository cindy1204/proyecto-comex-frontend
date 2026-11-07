import type { Messages } from '../dictionaries';
import { INTL_LOCALES, type Locale } from './locale';

type Join<
  Prefix extends string,
  Key extends string,
> = `${Prefix}${Prefix extends '' ? '' : '.'}${Key}`;

/** Rutas con punto de todas las hojas (`string`) de un diccionario. */
type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? Join<Prefix, K> : LeafPaths<T[K], Join<Prefix, K>>;
}[keyof T & string];

type DictionaryKey = LeafPaths<Messages>;

/** `foo.bar_other` también se puede pedir como `foo.bar` junto con `{ count }` (pluralización). */
type PluralBase<K extends string> = K extends `${infer Base}_other` ? Base : never;

export type TranslationKey = DictionaryKey | PluralBase<DictionaryKey>;

export type TranslationParams = Record<string, string | number>;

export type TranslateFunction = (key: TranslationKey, params?: TranslationParams) => string;

export interface Formatters {
  date: (iso: string) => string;
  dateTime: (iso: string) => string;
  number: (value: number) => string;
  currency: (amount: string | number, currency?: string) => string;
}

function lookup(messages: Messages, key: string): string | undefined {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params: TranslationParams | undefined): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Crea `t(clave, params)`. Con `params.count` numérico busca la variante plural
 * (`clave_one`, `clave_other`… según `Intl.PluralRules`); si la clave no existe devuelve la clave.
 */
export function createTranslator(messages: Messages, locale: Locale): TranslateFunction {
  const rules = new Intl.PluralRules(INTL_LOCALES[locale]);
  return (key, params) => {
    const count = params?.count;
    if (typeof count === 'number') {
      const plural =
        lookup(messages, `${key}_${rules.select(count)}`) ?? lookup(messages, `${key}_other`);
      if (plural !== undefined) return interpolate(plural, params);
    }
    return interpolate(lookup(messages, key) ?? key, params);
  };
}

export function createFormatters(locale: Locale): Formatters {
  const intlLocale = INTL_LOCALES[locale];
  const dateFormat = new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium' });
  const dateTimeFormat = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const numberFormat = new Intl.NumberFormat(intlLocale);
  return {
    date: (iso) => dateFormat.format(new Date(iso)),
    dateTime: (iso) => dateTimeFormat.format(new Date(iso)),
    number: (value) => numberFormat.format(value),
    currency: (amount, currency = 'USD') =>
      new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(Number(amount)),
  };
}
