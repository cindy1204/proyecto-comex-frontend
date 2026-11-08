/**
 * Reglas de acceso por ruta. Módulo puro (sin React ni DOM): lo comparten el proxy del servidor
 * y los guards del cliente para que ambas capas decidan lo mismo.
 */
const PRIVATE_PATTERNS: readonly RegExp[] = [
  /^\/mis-interacciones(\/|$)/,
  /^\/mis-solicitudes(\/|$)/,
  /^\/importaciones(\/|$)/,
  /^\/exportaciones(\/|$)/,
  /^\/servicios\/[^/]+\/formulario(\/|$)/,
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
