import { NextResponse, type NextRequest } from 'next/server';
import {
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_COOKIE,
  FORBIDDEN_PARAM,
  ROUTES,
} from './features/common/config';
import { isCuid } from './features/common/domain/id';
import { isJwtExpired } from './features/common/utils/jwt';
import { isAdminPath, isGuestOnlyPath, isPrivatePath } from './features/dashboard/domain/routes';
import { findService } from './features/services/domain/services';

/**
 * El layout raíz lee la cookie de idioma, así que toda la ruta se renderiza por petición y Next
 * ya no puede cambiar a 404 el estado HTTP desde `notFound()`. Para que un slug de servicio
 * desconocido o un id de catálogo con formato inválido sigan devolviendo 404, se resuelven aquí
 * (la página 404 de la app, ya traducida, se sigue mostrando).
 */
const NOT_FOUND_PATH = '/_recurso-inexistente';

/** Destino cuando falta el permiso: el inicio muestra un aviso (`FORBIDDEN_PARAM`). */
const FORBIDDEN_HOME = `${ROUTES.home}?${FORBIDDEN_PARAM}=1`;

function isMissingResourcePath(pathname: string): boolean {
  const [section, id, ...rest] = pathname.split('/').filter(Boolean);
  if (section === 'servicios' && id !== undefined) return findService(id) === undefined;
  if (section === 'catalogo' && id !== undefined) return rest.length > 0 || !isCuid(id);
  return false;
}

/**
 * Primera capa de protección de rutas (solo UX): redirige en el servidor según las cookies
 * `auth_token` y `auth_role`. El JWT se decodifica sin verificar la firma; la autorización real
 * la hace el backend y, en el cliente, los guards `AuthGuard`/`RoleGuard`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isMissingResourcePath(pathname)) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const hasToken = Boolean(token);
  const isAuthenticated = hasToken && !isJwtExpired(token as string);

  if (isPrivatePath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set('returnTo', `${pathname}${search}`);
    if (hasToken) loginUrl.searchParams.set('expirada', '1');
    const response = NextResponse.redirect(loginUrl);
    if (hasToken) {
      response.cookies.delete(AUTH_TOKEN_COOKIE);
      response.cookies.delete(AUTH_ROLE_COOKIE);
    }
    return response;
  }

  if (isAdminPath(pathname) && role !== 'admin') {
    return NextResponse.redirect(new URL(FORBIDDEN_HOME, request.url));
  }

  if (isGuestOnlyPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye estáticos de Next, imágenes optimizadas y cualquier archivo con extensión (favicon, etc.).
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
