import type { AuthUser } from '../../common/domain/session';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

/** Respuesta de `POST /auth/login` y `POST /auth/register`. */
export interface AuthResult {
  user: AuthUser;
  token: string;
  /** Duración del token en segundos. */
  expiresIn: number;
}

/** Cómo terminó la última sesión: decide a dónde enviar al usuario desde una ruta privada. */
export type SessionEnd = 'logout' | 'expired';
