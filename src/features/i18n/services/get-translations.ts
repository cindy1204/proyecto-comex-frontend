import 'server-only';
import { DICTIONARIES } from '../dictionaries';
import {
  createFormatters,
  createTranslator,
  type Formatters,
  type TranslateFunction,
} from '../domain/translate';
import type { Locale } from '../domain/locale';
import { getLocale } from './get-locale';

export interface ServerTranslations {
  locale: Locale;
  t: TranslateFunction;
  format: Formatters;
}

/** Traductor para Server Components y `generateMetadata` (resuelve el idioma de la petición). */
export async function getTranslations(): Promise<ServerTranslations> {
  const locale = await getLocale();
  return {
    locale,
    t: createTranslator(DICTIONARIES[locale], locale),
    format: createFormatters(locale),
  };
}
