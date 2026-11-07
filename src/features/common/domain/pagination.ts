export interface Pagination {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface ResponseList<T> {
  data: T[];
  pagination: Pagination;
}

export interface ResponseItem<T> {
  data: T;
}

export interface PageQuery {
  page: number;
  limit: number;
}

export const EMPTY_PAGINATION: Pagination = {
  total: 0,
  currentPage: 1,
  limit: 10,
  totalPages: 0,
};
