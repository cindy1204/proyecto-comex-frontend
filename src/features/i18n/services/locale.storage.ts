import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from '../domain/locale';

/** Guarda el idioma elegido en la cookie `locale` (la lee el servidor en la siguiente petición). */
export function writeLocaleCookie(locale: Locale): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}
