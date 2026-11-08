'use client';

import { useCallback } from 'react';
import { useAsyncData, type AsyncData } from '../../common/hooks/use-async-data';
import type { PageQuery, ResponseList } from '../../common/domain/pagination';
import type { CatalogCategory, CatalogFilters, CatalogItem } from '../domain/catalog';
import { listCatalog, listCatalogByCategory } from '../services/catalog.service';

interface CatalogQuery extends PageQuery, CatalogFilters {}

export function useCatalog({
  page,
  limit,
  category,
  direction,
  search,
  state,
  createdFrom,
  createdTo,
}: CatalogQuery): AsyncData<ResponseList<CatalogItem>> {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      listCatalog(
        { category, direction, search, state, createdFrom, createdTo },
        { page, limit },
        signal,
      ),
    [category, direction, search, state, createdFrom, createdTo, page, limit],
  );
  return useAsyncData(fetcher);
}

/** Todos los numerales de una categoría (para tabs y selectores de formularios). */
export function useCatalogByCategory(category: CatalogCategory): AsyncData<CatalogItem[]> {
  const fetcher = useCallback(
    (signal: AbortSignal) => listCatalogByCategory(category, signal),
    [category],
  );
  return useAsyncData(fetcher);
}
