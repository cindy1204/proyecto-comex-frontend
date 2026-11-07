'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config';
import type { PageQuery } from '../domain/pagination';

export interface PaginationState extends PageQuery {
  setPage: (page: number) => void;
  /** Vuelve a la primera página (al cambiar un filtro). */
  resetPage: () => void;
  /** Cambia el tamaño de página y vuelve a la primera. */
  setLimit: (limit: number) => void;
}

export function usePagination(initialLimit: number = DEFAULT_PAGE_SIZE): PaginationState {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const setPage = useCallback((next: number) => setPageState(Math.max(1, next)), []);
  const resetPage = useCallback(() => setPageState(1), []);
  const setLimit = useCallback((next: number) => {
    setLimitState(Math.min(Math.max(1, next), MAX_PAGE_SIZE));
    setPageState(1);
  }, []);
  return { page, limit, setPage, resetPage, setLimit };
}

/** Tras eliminar el último registro de una página, vuelve a la última página que aún existe. */
export function useClampPage(
  page: number,
  totalPages: number | undefined,
  setPage: (page: number) => void,
) {
  useEffect(() => {
    if (totalPages !== undefined && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);
}
