import type { TranslationKey } from '../../i18n/domain/translate';

export type AdminTab = 'catalogo' | 'interacciones' | 'solicitudes' | 'administradores';

export interface AdminTotals {
  catalog: number;
  interactions: number;
  requests: number;
}

export const ADMIN_TABS: ReadonlyArray<{ id: AdminTab; labelKey: TranslationKey }> = [
  { id: 'catalogo', labelKey: 'admin.tabs.catalog' },
  { id: 'interacciones', labelKey: 'admin.tabs.interactions' },
  { id: 'solicitudes', labelKey: 'admin.tabs.requests' },
  { id: 'administradores', labelKey: 'admin.tabs.admins' },
];
