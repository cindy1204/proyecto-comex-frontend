import 'server-only';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, resolveLocale, type Locale } from '../domain/locale';

/** Idioma de la petición actual: cookie `locale` -> `Accept-Language` -> `es`. Solo servidor. */
export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get('accept-language'),
  });
}
