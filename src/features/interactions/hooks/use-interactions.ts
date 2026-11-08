'use client';

import { useCallback } from 'react';
import type { PageQuery, ResponseList } from '../../common/domain/pagination';
import { useAsyncData, type AsyncData } from '../../common/hooks/use-async-data';
import type { Interaction, InteractionFilters } from '../domain/interaction';
import { listInteractions, listMyInteractions } from '../services/interaction.service';

export type InteractionScope = 'mine' | 'all';

export function useInteractions(
  scope: InteractionScope,
  { type, userId, createdFrom, createdTo }: InteractionFilters,
  { page, limit }: PageQuery,
): AsyncData<ResponseList<Interaction>> {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      scope === 'all'
        ? listInteractions({ type, userId, createdFrom, createdTo }, { page, limit }, signal)
        : listMyInteractions({ type, createdFrom, createdTo }, { page, limit }, signal),
    [scope, type, userId, createdFrom, createdTo, page, limit],
  );
  return useAsyncData(fetcher);
}
