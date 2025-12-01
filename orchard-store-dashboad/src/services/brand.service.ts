import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Brand,
  BrandFormData,
  BrandQueryParams,
  BrandFilter,
} from "@/types/catalog.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Brand data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Brand data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<Brand[]> to Brand[]
 */
const unwrapList = (response: ApiResponse<Brand[]>): Brand[] => {
  return response.data ?? [];
};

export const brandService = {
  /**
   * ===== PUBLIC API (Store Frontend) =====
   * Lấy danh sách brands cho store frontend
   * GET /api/brands?activeOnly=true
   */
  getAll: (params?: BrandQueryParams) =>
    http
      .get<ApiResponse<Brand[]>>(API_ROUTES.BRANDS, { params })
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết brand theo ID (public)
   * GET /api/brands/{id}
   */
  getById: (id: number) =>
    http
      .get<ApiResponse<Brand>>(`${API_ROUTES.BRANDS}/${id}`)
      .then((res) => unwrapItem(res)),

  /**
   * ===== ADMIN API =====
   * Lấy danh sách brands với pagination và filters (admin)
   * GET /api/admin/brands?page=0&size=10&keyword=...&status=...&sortBy=displayOrder&direction=ASC
   */
  getBrands: (params?: BrandFilter) => {
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
      .get<ApiResponse<Page<Brand>>>(API_ROUTES.ADMIN_BRANDS, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy chi tiết brand theo ID (admin)
   * GET /api/admin/brands/{id}
   */
  getBrand: (id: number): Promise<Brand> => {
    return http
      .get<ApiResponse<Brand>>(`${API_ROUTES.ADMIN_BRANDS}/${id}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Tạo brand mới
   * POST /api/admin/brands
   * Body: BrandCreateRequest (name required, slug optional)
   */
  createBrand: (data: BrandFormData): Promise<Brand> => {
    // Map BrandFormData sang BrandCreateRequest format
    const payload = {
      name: data.name,
      slug: data.slug || undefined, // Optional - backend sẽ tự tạo nếu không có
      description: data.description || undefined,
      logoUrl: data.logoUrl || undefined,
      country: data.country || undefined,
      website: data.website || undefined, // Backend nhận "website"
    };

    return http
      .post<ApiResponse<Brand>>(API_ROUTES.ADMIN_BRANDS, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật brand
   * PUT /api/admin/brands/{id}
   * Body: BrandUpdateRequest (tất cả fields optional)
   */
  updateBrand: (id: number, data: Partial<BrandFormData>): Promise<Brand> => {
    // Map BrandFormData sang BrandUpdateRequest format
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    // ✅ Xử lý logoUrl: null để xóa logo, undefined để không thay đổi, string để cập nhật
    if (data.logoUrl !== undefined) {
      // Nếu là null hoặc empty string, gửi null để backend xóa logo
      payload.logoUrl =
        data.logoUrl === null || data.logoUrl === "" ? null : data.logoUrl;
    }
    if (data.country !== undefined) payload.country = data.country;
    if (data.website !== undefined) payload.website = data.website;
    if (data.displayOrder !== undefined)
      payload.displayOrder = data.displayOrder;
    if (data.status !== undefined) payload.status = data.status;

    return http
      .put<ApiResponse<Brand>>(`${API_ROUTES.ADMIN_BRANDS}/${id}`, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa brand
   * DELETE /api/admin/brands/{id}
   */
  deleteBrand: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.ADMIN_BRANDS}/${id}`)
      .then(() => undefined);
  },

  /**
   * ===== LEGACY METHODS (Giữ lại cho tương thích) =====
   * Các methods này gọi public API, có thể deprecated sau
   */
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
