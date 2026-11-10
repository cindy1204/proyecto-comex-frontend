import { describe, expect, it } from 'vitest';
import { MENU_ITEMS, type MenuAudience } from '@/features/dashboard/domain/menu';
import { DICTIONARIES } from '@/features/i18n/dictionaries';

const VISITOR_AUDIENCES: readonly MenuAudience[] = ['everyone'];
const USER_AUDIENCES: readonly MenuAudience[] = ['everyone', 'authenticated'];
const ADMIN_AUDIENCES: readonly MenuAudience[] = ['everyone', 'authenticated', 'admin'];

const hrefsFor = (audiences: readonly MenuAudience[]) =>
  MENU_ITEMS.filter((item) => audiences.includes(item.audience)).map((item) => item.href);

describe('menú por rol', () => {
  it('el visitante solo ve las páginas públicas', () => {
    expect(hrefsFor(VISITOR_AUDIENCES)).toEqual(['/', '/servicios', '/catalogo', '/contacto']);
  });

  it('el usuario suma sus espacios de trabajo, pero no la administración', () => {
    const hrefs = hrefsFor(USER_AUDIENCES);
    expect(hrefs).toContain('/mis-interacciones');
    expect(hrefs).toContain('/mis-solicitudes');
    expect(hrefs).not.toContain('/admin');
  });

  it('el administrador ve además /admin', () => {
    expect(hrefsFor(ADMIN_AUDIENCES)).toContain('/admin');
    expect(hrefsFor(ADMIN_AUDIENCES)).toHaveLength(MENU_ITEMS.length);
  });

  it('no hay rutas duplicadas y cada etiqueta existe en los diccionarios', () => {
    const hrefs = MENU_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const item of MENU_ITEMS) {
      const [group, key] = item.labelKey.split('.');
      for (const messages of Object.values(DICTIONARIES)) {
        const section = (messages as unknown as Record<string, Record<string, unknown>>)[group];
        expect(typeof section?.[key], item.labelKey).toBe('string');
      }
    }
  });
});
