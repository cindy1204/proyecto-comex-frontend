'use client';

import { useCallback } from 'react';
import { useAsyncData, type AsyncData } from '../../common/hooks/use-async-data';
import { listCatalog } from '../../catalog/services/catalog.service';
import { listContactRequests } from '../../contact/services/contact.service';
import { listInteractions } from '../../interactions/services/interaction.service';
import type { AdminTotals } from '../domain/admin';

const ONE_ITEM = { page: 1, limit: 1 };

/** Totales del panel: se leen de `pagination.total` de cada listado (sin endpoints extra). */
export function useAdminTotals(): AsyncData<AdminTotals> {
  const fetcher = useCallback(async (signal: AbortSignal): Promise<AdminTotals> => {
    const [catalog, interactions, requests] = await Promise.all([
      listCatalog({ state: 'ACTIVE' }, ONE_ITEM, signal),
      listInteractions({}, ONE_ITEM, signal),
      listContactRequests({}, ONE_ITEM, signal),
    ]);
    return {
      catalog: catalog.pagination.total,
      interactions: interactions.pagination.total,
      requests: requests.pagination.total,
    };
  }, []);
  return useAsyncData(fetcher);
}
