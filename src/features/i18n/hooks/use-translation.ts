'use client';

import { useContext } from 'react';
import { I18nContext, type I18nContextValue } from './i18n-context';

/** `t('clave', { param })`, el idioma activo y formateadores `Intl` (fecha, número, moneda). */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation debe usarse dentro de <I18nProvider>.');
  return context;
}
