'use client';

import { useCallback } from 'react';
import type { PageQuery, ResponseList } from '../../common/domain/pagination';
import { useAsyncData, type AsyncData } from '../../common/hooks/use-async-data';
import type { ContactFilters, ContactRequest } from '../domain/contact';
import { listContactRequests, listMyContactRequests } from '../services/contact.service';

export type ContactScope = 'mine' | 'all';

export function useContactRequests(
  scope: ContactScope,
  { tipoProducto, search, createdFrom, createdTo }: ContactFilters,
  { page, limit }: PageQuery,
): AsyncData<ResponseList<ContactRequest>> {
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      const list = scope === 'all' ? listContactRequests : listMyContactRequests;
      return list({ tipoProducto, search, createdFrom, createdTo }, { page, limit }, signal);
    },
    [scope, tipoProducto, search, createdFrom, createdTo, page, limit],
  );
  return useAsyncData(fetcher);
}
