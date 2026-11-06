const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string; signal?: AbortSignal } = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  const body = options.body;
  const isFormData = isMultipartFormData(body);
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${apiHost}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal: options.signal,
    cache: 'no-store',
  });

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json();
  if (!response.ok) {
    const error = isRecord(payload) && isRecord(payload.error) ? payload.error : {};
    throw new ApiError(
      typeof error.message === 'string' ? error.message : `La solicitud falló (${response.status}).`,
      response.status,
      typeof error.code === 'string' ? error.code : undefined,
    );
  }

  return payload as T;
}

function isMultipartFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
