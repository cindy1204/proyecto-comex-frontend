export interface JwtPayload {
  exp?: number;
  [claim: string]: unknown;
}

/**
 * Decodifica el payload de un JWT SIN verificar la firma. Solo sirve para decisiones de UX
 * (por ejemplo, saber si ya venció); la verificación real la hace el backend.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const segment = token.split('.')[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof payload === 'object' && payload !== null ? (payload as JwtPayload) : null;
  } catch {
    return null;
  }
}

/** Un token ilegible o sin `exp` se considera vencido. */
export function isJwtExpired(token: string, nowMs: number = Date.now()): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp !== 'number' || exp * 1000 <= nowMs;
}
