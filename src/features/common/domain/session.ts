export type UserRole = 'admin' | 'user';

/** Usuario público devuelto por la API (nunca incluye contraseña). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

/** Sesión persistida en el navegador. */
export interface StoredSession {
  token: string;
  /** Instante de expiración del token, en milisegundos desde epoch. */
  expiresAt: number;
  user: AuthUser;
}
