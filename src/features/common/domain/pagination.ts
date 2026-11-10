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
