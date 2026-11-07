'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { Locale } from '../domain/locale';
import { writeLocaleCookie } from '../services/locale.storage';
import { useTranslation } from './use-translation';

export interface LocaleState {
  locale: Locale;
  /** Guarda la cookie y vuelve a renderizar la página actual en el nuevo idioma. */
  setLocale: (locale: Locale) => void;
  isPending: boolean;
}

export function useLocale(): LocaleState {
  const { locale } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      writeLocaleCookie(next);
      startTransition(() => router.refresh());
    },
    [locale, router],
  );

  return { locale, setLocale, isPending };
}
