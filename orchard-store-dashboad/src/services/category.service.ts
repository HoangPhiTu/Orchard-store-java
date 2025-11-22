import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Category,
  CategoryFormData,
  CategoryQueryParams,
} from "@/types/catalog.types";
import type { ApiResponse } from "@/types/api.types";

const unwrapList = (response: ApiResponse<Category[]>) => response.data ?? [];

const unwrapItem = (response: ApiResponse<Category>) => {
  if (!response.data) {
    throw new Error(response.message || "Category data not found");
  }
  return response.data;
};

export const categoryService = {
  getAll: (params?: CategoryQueryParams) =>
    http
      .get<ApiResponse<Category[]>>(API_ROUTES.CATEGORIES, { params })
      .then((res) => unwrapList(res)),

  getRoots: () =>
    http
      .get<ApiResponse<Category[]>>(`${API_ROUTES.CATEGORIES}/roots`)
      .then((res) => unwrapList(res)),

  getById: (id: number) =>
    http
      .get<ApiResponse<Category>>(`${API_ROUTES.CATEGORIES}/${id}`)
      .then((res) => unwrapItem(res)),

  create: (payload: CategoryFormData) =>
    http
      .post<ApiResponse<Category>>(API_ROUTES.CATEGORIES, payload)
      .then((res) => unwrapItem(res)),

  update: (id: number, payload: CategoryFormData) =>
    http
      .put<ApiResponse<Category>>(`${API_ROUTES.CATEGORIES}/${id}`, payload)
      .then((res) => unwrapItem(res)),

  delete: (id: number) =>
    http
      .delete<ApiResponse<null>>(`${API_ROUTES.CATEGORIES}/${id}`)
      .then((res) => res.data),
};
