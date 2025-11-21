export interface ApiResponse<T> {
  status?: number;
  message: string;
  data: T | null;
  timestamp?: string;
}

export interface PagingInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
