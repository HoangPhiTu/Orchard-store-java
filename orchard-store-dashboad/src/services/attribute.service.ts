import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  ProductAttribute,
  AttributeValue,
  AttributeFormData,
  AttributeFilter,
} from "@/types/attribute.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Attribute data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Attribute data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<AttributeValue[]> to AttributeValue[]
 */
const unwrapList = (response: ApiResponse<AttributeValue[]>): AttributeValue[] => {
  return response.data ?? [];
};

export const attributeService = {
  /**
   * ===== ADMIN API =====
   * Lấy danh sách attributes với pagination và filters (admin)
   * GET /api/admin/attributes?page=0&size=10&keyword=...&status=...&sortBy=displayOrder&direction=ASC
   */
  getAttributes: (params?: AttributeFilter) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.direction) queryParams.direction = params.direction;
    // Add keyword and status filters
    if (params?.keyword && params.keyword.trim() !== "") {
      queryParams.keyword = params.keyword.trim();
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    if (params?.domain) {
      queryParams.domain = params.domain;
    }

    return http
      .get<ApiResponse<Page<ProductAttribute>>>(API_ROUTES.ATTRIBUTES, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy tất cả attributes (không phân trang - dành cho dropdown)
   * GET /api/admin/attributes/all
   */
  getAllAttributes: () =>
    http
      .get<ApiResponse<ProductAttribute[]>>(`${API_ROUTES.ATTRIBUTES}/all`)
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết attribute theo ID (admin)
   * GET /api/admin/attributes/{id}
   */
  getAttribute: (id: number): Promise<ProductAttribute> => {
    return http
      .get<ApiResponse<ProductAttribute>>(`${API_ROUTES.ATTRIBUTES}/${id}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Tạo attribute mới
   * POST /api/admin/attributes
   */
  createAttribute: (data: AttributeFormData): Promise<ProductAttribute> => {
    return http
      .post<ApiResponse<ProductAttribute>>(API_ROUTES.ATTRIBUTES, data)
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật attribute (với nested update cho values)
   * PUT /api/admin/attributes/{id}
   */
  updateAttribute: (
    id: number,
    data: AttributeFormData
  ): Promise<ProductAttribute> => {
    return http
      .put<ApiResponse<ProductAttribute>>(`${API_ROUTES.ATTRIBUTES}/${id}`, data)
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa attribute
   * DELETE /api/admin/attributes/{id}
   */
  deleteAttribute: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.ATTRIBUTES}/${id}`)
      .then(() => undefined);
  },

  /**
   * Lấy danh sách values của attribute
   * GET /api/admin/attributes/{id}/values
   */
  getAttributeValues: (attributeId: number): Promise<AttributeValue[]> => {
    return http
      .get<ApiResponse<AttributeValue[]>>(
        `${API_ROUTES.ATTRIBUTES}/${attributeId}/values`
      )
      .then((res) => unwrapList(res));
  },

  /**
   * Tạo attribute value mới
   * POST /api/admin/attributes/{id}/values
   */
  createAttributeValue: (
    attributeId: number,
    data: AttributeValue
  ): Promise<AttributeValue> => {
    return http
      .post<ApiResponse<AttributeValue>>(
        `${API_ROUTES.ATTRIBUTES}/${attributeId}/values`,
        data
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật attribute value
   * PUT /api/admin/attributes/{id}/values/{valueId}
   */
  updateAttributeValue: (
    attributeId: number,
    valueId: number,
    data: AttributeValue
  ): Promise<AttributeValue> => {
    return http
      .put<ApiResponse<AttributeValue>>(
        `${API_ROUTES.ATTRIBUTES}/${attributeId}/values/${valueId}`,
        data
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa attribute value
   * DELETE /api/admin/attributes/{id}/values/{valueId}
   */
  deleteAttributeValue: (attributeId: number, valueId: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(
        `${API_ROUTES.ATTRIBUTES}/${attributeId}/values/${valueId}`
      )
      .then(() => undefined);
  },
};

