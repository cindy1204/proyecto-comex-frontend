import type { AuthUser } from '../../common/domain/session';
import type { ResponseItem } from '../../common/domain/pagination';
import { apiRequest } from '../../common/services/http';
import type { AuthResult, LoginCredentials, RegisterPayload } from '../domain/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  const response = await apiRequest<ResponseItem<AuthResult>>('/auth/login', {
    method: 'POST',
    body: credentials,
    auth: false,
  });
  return response.data;
}

/** El backend devuelve el token al registrarse: no hace falta un login adicional. */
export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const response = await apiRequest<ResponseItem<AuthResult>>('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  return response.data;
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  const response = await apiRequest<ResponseItem<AuthUser>>('/auth/me', { signal });
  return response.data;
}

/** Solo administradores. */
export async function createAdmin(payload: RegisterPayload): Promise<AuthUser> {
  const response = await apiRequest<ResponseItem<AuthUser>>('/auth/admins', {
    method: 'POST',
    body: payload,
  });
  return response.data;
}
