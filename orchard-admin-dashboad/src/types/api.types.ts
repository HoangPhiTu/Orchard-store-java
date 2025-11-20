export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PagingInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
