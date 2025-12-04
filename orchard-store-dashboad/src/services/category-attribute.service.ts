import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type { CategoryAttribute } from "@/types/catalog.types";
import type { ProductAttribute } from "@/types/attribute.types";
import type { ApiResponse } from "@/types/api.types";

/**
 * Unwrap ApiResponse<CategoryAttribute[]> to CategoryAttribute[]
 */
const unwrapList = (
  response: ApiResponse<CategoryAttribute[]>
): CategoryAttribute[] => {
  return response.data ?? [];
};

/**
 * Unwrap ApiResponse<CategoryAttribute> to CategoryAttribute
 */
const unwrapItem = (
  response: ApiResponse<CategoryAttribute>
): CategoryAttribute => {
  if (!response.data) {
    throw new Error(response.message || "Category attribute data not found");
  }
  return response.data;
};

export const categoryAttributeService = {
  /**
   * Lấy danh sách attributes của category
   * GET /api/admin/category-attributes/{categoryId}
   */
  getCategoryAttributes: (categoryId: number): Promise<CategoryAttribute[]> => {
    return http
      .get<ApiResponse<CategoryAttribute[]>>(
        `${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}`
      )
      .then((res) => unwrapList(res));
  },

  /**
   * Gán attribute vào category
   * POST /api/admin/category-attributes
   */
  assignAttribute: (
    data: Omit<CategoryAttribute, "id" | "attributeName" | "attributeKey">
  ): Promise<CategoryAttribute> => {
    return http
      .post<ApiResponse<CategoryAttribute>>(
        API_ROUTES.CATEGORY_ATTRIBUTES,
        data
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa binding attribute khỏi category
   * DELETE /api/admin/category-attributes/{categoryId}/{attributeId}
   */
  removeAttribute: (categoryId: number, attributeId: number): Promise<void> => {
    return http
      .delete(`${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}/${attributeId}`)
      .then(() => undefined);
  },

  /**
   * Cập nhật metadata (required, displayOrder, groupName) của attribute đã gán
   * PUT /api/admin/category-attributes/{categoryId}/{attributeId}
   */
  updateAttributeMetadata: (
    categoryId: number,
    attributeId: number,
    data: { required?: boolean; displayOrder?: number; groupName?: string }
  ): Promise<CategoryAttribute> => {
    return http
      .put<ApiResponse<CategoryAttribute>>(
        `${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}/${attributeId}`,
        data
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Lấy danh sách attributes cho Product Form
   * - Chỉ trả về Product Attributes (is_variant_specific = false)
   * - Group theo group_name (fallback to domain nếu NULL)
   * - Sort theo display_order trong mỗi group
   * - Include attribute values
   * GET /api/admin/category-attributes/{categoryId}/for-product
   */
  getAttributesForProduct: (
    categoryId: number
  ): Promise<Record<string, ProductAttribute[]>> => {
    return http
      .get<ApiResponse<Record<string, ProductAttribute[]>>>(
        `${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}/for-product`
      )
      .then((res) => res.data ?? {});
  },

  /**
   * Lấy danh sách Variant Attributes (is_variant_specific = true)
   * GET /api/admin/category-attributes/{categoryId}/for-variants
   */
  getVariantAttributes: (categoryId: number): Promise<ProductAttribute[]> => {
    return http
      .get<ApiResponse<ProductAttribute[]>>(
        `${API_ROUTES.CATEGORY_ATTRIBUTES}/${categoryId}/for-variants`
      )
      .then((res) => res.data ?? []);
  },
};
