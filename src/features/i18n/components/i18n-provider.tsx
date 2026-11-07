'use client';

import { useMemo, type ReactNode } from 'react';
import { DICTIONARIES } from '../dictionaries';
import { I18nContext } from '../hooks/i18n-context';
import type { Locale } from '../domain/locale';
import { createFormatters, createTranslator } from '../domain/translate';

/** Recibe el idioma resuelto en el servidor, así el primer render del cliente coincide con el HTML. */
export function I18nProvider({
  locale,
  children,
}: Readonly<{ locale: Locale; children: ReactNode }>) {
  const value = useMemo(
    () => ({
      locale,
      t: createTranslator(DICTIONARIES[locale], locale),
      format: createFormatters(locale),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
