'use client';

import { createContext } from 'react';
import type { Locale } from '../domain/locale';
import type { Formatters, TranslateFunction } from '../domain/translate';

export interface I18nContextValue {
  locale: Locale;
  t: TranslateFunction;
  format: Formatters;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
