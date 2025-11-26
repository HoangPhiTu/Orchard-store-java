import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Category,
  CategoryFormData,
  CategoryQueryParams,
  CategoryFilter,
} from "@/types/catalog.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Category data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Category data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<Category[]> to Category[]
 */
const unwrapList = (response: ApiResponse<Category[]>): Category[] => {
  return response.data ?? [];
};

export const categoryService = {
  /**
   * ===== PUBLIC API (Store Frontend) =====
   * Lấy danh sách categories cho store frontend
   * GET /api/categories?activeOnly=true
   */
  getAll: (params?: CategoryQueryParams) =>
    http
      .get<ApiResponse<Category[]>>(API_ROUTES.CATEGORIES, { params })
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết category theo ID (public)
   * GET /api/categories/{id}
   */
  getById: (id: number) =>
    http
      .get<ApiResponse<Category>>(`${API_ROUTES.CATEGORIES}/${id}`)
      .then((res) => unwrapItem(res)),

  /**
   * ===== ADMIN API =====
   * Lấy danh sách categories với pagination và filters (admin)
   * GET /api/admin/categories?page=0&size=15&keyword=...&status=...&sortBy=level&direction=ASC
   */
  getCategories: (params?: CategoryFilter) => {
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

    return http
      .get<ApiResponse<Page<Category>>>(API_ROUTES.ADMIN_CATEGORIES, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy chi tiết category theo ID (admin)
   * GET /api/admin/categories/{id}
   */
  getCategory: (id: number): Promise<Category> => {
    return http
      .get<ApiResponse<Category>>(`${API_ROUTES.ADMIN_CATEGORIES}/${id}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Lấy cây danh mục (Tree structure)
   * GET /api/admin/categories/tree
   */
  getCategoriesTree: (): Promise<Category[]> => {
    return http
      .get<ApiResponse<Category[]>>(`${API_ROUTES.ADMIN_CATEGORIES}/tree`)
      .then((res) => unwrapList(res));
  },

  /**
   * Tạo category mới
   * POST /api/admin/categories
   * Body: CategoryCreateRequest (name required, slug optional, parentId optional)
   */
  createCategory: (data: CategoryFormData): Promise<Category> => {
    // Map CategoryFormData sang CategoryCreateRequest format
    const payload: Record<string, unknown> = {
      name: data.name,
    };

    // Slug là optional - backend sẽ tự tạo nếu không có
    if (data.slug) {
      payload.slug = data.slug;
    }

    if (data.description) {
      payload.description = data.description;
    }

    if (data.imageUrl) {
      payload.imageUrl = data.imageUrl;
    }

    // parentId có thể là null (root category)
    if (data.parentId !== undefined && data.parentId !== null) {
      payload.parentId = data.parentId;
    }

    if (data.displayOrder !== undefined) {
      payload.displayOrder = data.displayOrder;
    }

    return http
      .post<ApiResponse<Category>>(API_ROUTES.ADMIN_CATEGORIES, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật category
   * PUT /api/admin/categories/{id}
   * Body: CategoryUpdateRequest (tất cả fields optional)
   */
  updateCategory: (
    id: number,
    data: Partial<CategoryFormData>
  ): Promise<Category> => {
    // Map CategoryFormData sang CategoryUpdateRequest format
    const payload: Record<string, unknown> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;

    // parentId có thể là null (để set root category)
    if (data.parentId !== undefined) {
      payload.parentId = data.parentId;
    }

    if (data.displayOrder !== undefined)
      payload.displayOrder = data.displayOrder;
    if (data.status !== undefined) payload.status = data.status;

    return http
      .put<ApiResponse<Category>>(
        `${API_ROUTES.ADMIN_CATEGORIES}/${id}`,
        payload
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa category
   * DELETE /api/admin/categories/{id}
   */
  deleteCategory: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.ADMIN_CATEGORIES}/${id}`)
      .then(() => undefined);
  },
};
