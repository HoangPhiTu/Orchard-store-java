import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Brand,
  BrandFormData,
  BrandQueryParams,
} from "@/types/catalog.types";
import type { ApiResponse } from "@/types/api.types";

const unwrapList = (response: ApiResponse<Brand[]>) => response.data ?? [];

const unwrapItem = (response: ApiResponse<Brand>) => {
  if (!response.data) {
    throw new Error(response.message || "Brand data not found");
  }
  return response.data;
};

export const brandService = {
  getAll: (params?: BrandQueryParams) =>
    http
      .get<ApiResponse<Brand[]>>(API_ROUTES.BRANDS, { params })
      .then((res) => unwrapList(res)),

  getById: (id: number) =>
    http
      .get<ApiResponse<Brand>>(`${API_ROUTES.BRANDS}/${id}`)
      .then((res) => unwrapItem(res)),

  create: (payload: BrandFormData) =>
    http
      .post<ApiResponse<Brand>>(API_ROUTES.BRANDS, payload)
      .then((res) => unwrapItem(res)),

  update: (id: number, payload: BrandFormData) =>
    http
      .put<ApiResponse<Brand>>(`${API_ROUTES.BRANDS}/${id}`, payload)
      .then((res) => unwrapItem(res)),

  delete: (id: number) =>
    http
      .delete<ApiResponse<null>>(`${API_ROUTES.BRANDS}/${id}`)
      .then((res) => res.data),
};
