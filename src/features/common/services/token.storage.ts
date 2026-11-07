import {
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_COOKIE,
  SESSION_EXPIRED_EVENT,
  SESSION_STORAGE_KEY,
} from '../config';
import type { AuthUser, StoredSession } from '../domain/session';
import { decodeJwtPayload } from '../utils/jwt';

/** Si el token no trae `exp`, la sesión local se considera válida por este lapso. */
const FALLBACK_SESSION_MS = 24 * 60 * 60 * 1000;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSession: StoredSession | null = null;

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<StoredSession>;
  return (
    typeof candidate.token === 'string' &&
    typeof candidate.expiresAt === 'number' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.id === 'string' &&
    typeof candidate.user.role === 'string'
  );
}

function parseSession(raw: string | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function syncCookies(session: StoredSession | null): void {
  if (!session) {
    writeCookie(AUTH_TOKEN_COOKIE, '', 0);
    writeCookie(AUTH_ROLE_COOKIE, '', 0);
    return;
  }
  const maxAge = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
  writeCookie(AUTH_TOKEN_COOKIE, session.token, maxAge);
  writeCookie(AUTH_ROLE_COOKIE, session.user.role, maxAge);
}

function persist(session: StoredSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  syncCookies(session);
  notify();
}

/**
 * Única puerta de acceso a la sesión persistida (localStorage + cookies para el proxy).
 * Expone `subscribe`/`getSession` para `useSyncExternalStore`; `getSession` devuelve una
 * referencia estable mientras el almacenamiento no cambie.
 */
export const tokenStorage = {
  getSession(): StoredSession | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSession = parseSession(raw);
    }
    return cachedSession;
  },

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  },

  save(token: string, user: AuthUser): void {
    const exp = decodeJwtPayload(token)?.exp;
    const expiresAt = typeof exp === 'number' ? exp * 1000 : Date.now() + FALLBACK_SESSION_MS;
    persist({ token, expiresAt, user });
  },

  updateUser(user: AuthUser): void {
    const session = this.getSession();
    if (session) persist({ ...session, user });
  },

  clear(): void {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    syncCookies(null);
    notify();
  },

  /** Cierra la sesión por vencimiento (401 o token caducado) y avisa a la UI con un evento. */
  expire(): void {
    this.clear();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === null) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};
