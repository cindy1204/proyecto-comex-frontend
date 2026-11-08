'use client';

import { usePathname } from 'next/navigation';
import { useSession } from '../../auth/hooks/use-session';
import { MENU_ITEMS, type MenuItem } from '../domain/menu';

export interface NavigationItem extends MenuItem {
  isActive: boolean;
}

/** Opciones de menú visibles para el usuario actual (el enlace de administración solo para admin). */
export function useNavigation(): NavigationItem[] {
  const { isAuthenticated, isAdmin } = useSession();
  const pathname = usePathname();

  return MENU_ITEMS.filter(
    (item) =>
      item.audience === 'everyone' ||
      (item.audience === 'authenticated' && isAuthenticated) ||
      (item.audience === 'admin' && isAdmin),
  ).map((item) => ({
    ...item,
    isActive:
      item.href === '/'
        ? pathname === '/'
        : !item.href.includes('#') &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  }));
}
