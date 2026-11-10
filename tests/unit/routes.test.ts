import { describe, expect, it } from 'vitest';
import {
  isAdminPath,
  isGuestOnlyPath,
  isPrivatePath,
  resolvePostAuthPath,
} from '@/features/dashboard/domain/routes';

describe('isPrivatePath', () => {
  it.each([
    '/mis-interacciones',
    '/mis-solicitudes/',
    '/importaciones',
    '/exportaciones/nuevo',
    '/servicios/inversiones/formulario',
    '/admin',
    '/admin/catalogo',
  ])('%s es privada', (path) => {
    expect(isPrivatePath(path)).toBe(true);
  });

  it.each([
    '/',
    '/servicios',
    '/servicios/inversiones',
    '/servicios/inversiones/formularios',
    '/servicios//formulario',
    '/catalogo',
    '/administrador',
    '/mis-interaccionesx',
    '/login',
  ])('%s es pública', (path) => {
    expect(isPrivatePath(path)).toBe(false);
  });
});

describe('isAdminPath', () => {
  it('reconoce /admin y sus subrutas', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/')).toBe(true);
    expect(isAdminPath('/admin/x')).toBe(true);
  });

  it('no confunde prefijos parecidos ni rutas privadas de usuario', () => {
    expect(isAdminPath('/administrador')).toBe(false);
    expect(isAdminPath('/mis-interacciones')).toBe(false);
    expect(isAdminPath('/servicios/x/formulario')).toBe(false);
    expect(isAdminPath('/x/admin')).toBe(false);
  });
});

describe('isGuestOnlyPath', () => {
  it('login y registro, con o sin barra final y subruta', () => {
    expect(isGuestOnlyPath('/login')).toBe(true);
    expect(isGuestOnlyPath('/login/')).toBe(true);
    expect(isGuestOnlyPath('/registro')).toBe(true);
    expect(isGuestOnlyPath('/registro/paso-2')).toBe(true);
  });

  it('el resto no es solo para visitantes', () => {
    expect(isGuestOnlyPath('/')).toBe(false);
    expect(isGuestOnlyPath('/loginx')).toBe(false);
    expect(isGuestOnlyPath('/registrado')).toBe(false);
    expect(isGuestOnlyPath('/admin')).toBe(false);
  });
});

describe('resolvePostAuthPath', () => {
  it('sin returnTo cada rol aterriza en su espacio', () => {
    expect(resolvePostAuthPath('admin', undefined)).toBe('/admin');
    expect(resolvePostAuthPath('user', undefined)).toBe('/mis-interacciones');
  });

  it('un returnTo permitido gana', () => {
    expect(resolvePostAuthPath('user', '/catalogo')).toBe('/catalogo');
    expect(resolvePostAuthPath('user', '/servicios/x/formulario')).toBe('/servicios/x/formulario');
  });

  it('un returnTo /admin para un usuario cae en su aterrizaje', () => {
    expect(resolvePostAuthPath('user', '/admin')).toBe('/mis-interacciones');
    expect(resolvePostAuthPath('user', '/admin/catalogo')).toBe('/mis-interacciones');
  });

  it('un administrador respeta cualquier returnTo', () => {
    expect(resolvePostAuthPath('admin', '/admin/catalogo')).toBe('/admin/catalogo');
    expect(resolvePostAuthPath('admin', '/catalogo')).toBe('/catalogo');
  });

  it('un prefijo parecido a /admin no se trata como zona vedada', () => {
    expect(resolvePostAuthPath('user', '/administrador')).toBe('/administrador');
  });
});
