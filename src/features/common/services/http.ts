import { getApiHost } from '../config';
import { configError, isAbortError, networkError, parseApiError } from './api-error';
import { tokenStorage } from './token.storage';

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Objeto serializable (JSON) o `FormData` (multipart, sin forzar Content-Type). */
  body?: unknown;
  /** Parámetros de query; se omiten los vacíos (`undefined`, `null`, `''`). */
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** `false` para rutas públicas (login/registro): no envía el token ni trata el 401 como sesión vencida. */
  auth?: boolean;
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = new URL(`${getApiHost()}/api${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Único cliente HTTP de la aplicación (el único módulo que usa `fetch`).
 * `path` es relativo a `/api` (por ejemplo `/auth/login`).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, auth = true } = options;
  const token = auth ? tokenStorage.getToken() : null;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let payloadBody: BodyInit | undefined;
  if (body instanceof FormData) {
    payloadBody = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payloadBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payloadBody, signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    if (error instanceof Error && error.message.includes('NEXT_PUBLIC_API_HOST')) {
      throw configError(error.message);
    }
    throw networkError();
  }

  const payload = await readPayload(response);
  if (!response.ok) {
    if (response.status === 401 && token) tokenStorage.expire(); // único punto del 401: limpia la sesión y emite el evento
    throw parseApiError(response.status, payload);
  }
  return payload as T;
}
