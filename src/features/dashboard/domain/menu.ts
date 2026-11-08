import { ROUTES } from '../../common/config';
import type { TranslationKey } from '../../i18n/domain/translate';

export type MenuAudience = 'everyone' | 'authenticated' | 'admin';

export interface MenuItem {
  labelKey: TranslationKey;
  href: string;
  audience: MenuAudience;
}

export const MENU_ITEMS: readonly MenuItem[] = [
  { labelKey: 'nav.home', href: ROUTES.home, audience: 'everyone' },
  { labelKey: 'nav.services', href: ROUTES.services, audience: 'everyone' },
  { labelKey: 'nav.catalog', href: ROUTES.catalog, audience: 'everyone' },
  { labelKey: 'nav.contact', href: ROUTES.contact, audience: 'everyone' },
  { labelKey: 'nav.myInteractions', href: ROUTES.myInteractions, audience: 'authenticated' },
  { labelKey: 'nav.myRequests', href: ROUTES.myRequests, audience: 'authenticated' },
  { labelKey: 'nav.admin', href: ROUTES.admin, audience: 'admin' },
];
