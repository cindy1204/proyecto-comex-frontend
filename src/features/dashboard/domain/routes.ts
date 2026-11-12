/**
 * Reglas de acceso por ruta. Módulo puro (sin React ni DOM): lo comparten el proxy del servidor
 * y los guards del cliente para que ambas capas decidan lo mismo.
 */
import { ROUTES } from '../../common/config';
import type { UserRole } from '../../common/domain/session';

const PRIVATE_PATTERNS: readonly RegExp[] = [
  /^\/mis-interacciones(\/|$)/,
  /^\/mis-solicitudes(\/|$)/,
  /^\/importaciones(\/|$)/,
  /^\/exportaciones(\/|$)/,
  /^\/servicios\/[^/]+\/formulario(\/|$)/,
  /^\/servicios\/[^/]+\/declaracion(\/|$)/,
  /^\/admin(\/|$)/,
];

const ADMIN_PATTERN = /^\/admin(\/|$)/;
const GUEST_ONLY_PATTERN = /^\/(login|registro)(\/|$)/;

/** Requiere sesión iniciada. */
export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/** Requiere rol administrador. */
export function isAdminPath(pathname: string): boolean {
  return ADMIN_PATTERN.test(pathname);
}

/** Solo para visitantes sin sesión (login y registro). */
export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATTERN.test(pathname);
}

/**
 * Destino tras autenticarse. Un `returnTo` explícito gana si el rol puede abrirlo; si no existe, o
 * apunta a una zona vedada (p. ej. `/admin` para un usuario), cada rol aterriza en su espacio de
 * trabajo. Es una única redirección de entrada: después se navega libremente.
 */
export function resolvePostAuthPath(role: UserRole, returnTo: string | undefined): string {
  const allowed = returnTo !== undefined && (role === 'admin' || !isAdminPath(returnTo));
  if (allowed) return returnTo;
  return role === 'admin' ? ROUTES.admin : ROUTES.myInteractions;
}
