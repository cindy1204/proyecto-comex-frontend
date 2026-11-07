const DEVELOPMENT_API_HOST = 'http://localhost:3001';

/**
 * Origen del backend, sin el sufijo `/api` (el cliente HTTP lo antepone).
 * Se lee de `NEXT_PUBLIC_API_HOST`. Solo en desarrollo hay un valor por defecto;
 * en producción, si la variable falta, se falla de forma explícita.
 */
export function getApiHost(): string {
  const host = process.env.NEXT_PUBLIC_API_HOST?.trim();
  if (host) return host.replace(/\/+$/, '');
  if (process.env.NODE_ENV !== 'production') return DEVELOPMENT_API_HOST;
  throw new Error('Falta la variable de entorno NEXT_PUBLIC_API_HOST.');
}

export const AUTH_TOKEN_COOKIE = 'auth_token';
export const AUTH_ROLE_COOKIE = 'auth_role';
export const THEME_STORAGE_KEY = 'colcomex-theme';

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/registro',
  services: '/servicios',
  catalog: '/catalogo',
  contact: '/contacto',
  myInteractions: '/mis-interacciones',
  myRequests: '/mis-solicitudes',
  admin: '/admin',
} as const;

export const SESSION_STORAGE_KEY = 'colcomex-session';
/** Evento de `window` que `apiRequest` emite cuando el backend rechaza el token con 401. */
export const SESSION_EXPIRED_EVENT = 'colcomex:session-expired';
