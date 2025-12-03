import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Concentration,
  ConcentrationFormData,
  ConcentrationFilter,
} from "@/types/concentration.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Concentration data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Concentration data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<Concentration[]> to Concentration[]
 */
const unwrapList = (
  response: ApiResponse<Concentration[]>
): Concentration[] => {
  return response.data ?? [];
};

export const concentrationService = {
  /**
   * ===== PUBLIC API (Store Frontend) =====
   * Lấy danh sách concentrations cho store frontend
   * GET /api/concentrations?activeOnly=true
   */
  getAll: (params?: { activeOnly?: boolean }) =>
    http
      .get<ApiResponse<Concentration[]>>(API_ROUTES.CONCENTRATIONS, { params })
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết concentration theo ID (public)
   * GET /api/concentrations/{id}
   */
  getById: (id: number) =>
    http
      .get<ApiResponse<Concentration>>(`${API_ROUTES.CONCENTRATIONS}/${id}`)
      .then((res) => unwrapItem(res)),

  /**
   * ===== ADMIN API =====
   * Lấy danh sách concentrations với pagination và filters (admin)
   * GET /api/admin/concentrations?page=0&size=10&keyword=...&status=...&sortBy=displayOrder&direction=ASC
   */
  getConcentrations: (params?: ConcentrationFilter) => {
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
      .get<ApiResponse<Page<Concentration>>>(API_ROUTES.ADMIN_CONCENTRATIONS, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy tất cả concentrations (không phân trang - dành cho dropdown)
   * GET /api/admin/concentrations/all?activeOnly=false
   */
  getAllConcentrations: (params?: { activeOnly?: boolean }) =>
    http
      .get<ApiResponse<Concentration[]>>(
        `${API_ROUTES.ADMIN_CONCENTRATIONS}/all`,
        {
          params,
        }
      )
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết concentration theo ID (admin)
   * GET /api/admin/concentrations/{id}
   */
  getConcentration: (id: number): Promise<Concentration> => {
    return http
      .get<ApiResponse<Concentration>>(
        `${API_ROUTES.ADMIN_CONCENTRATIONS}/${id}`
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Tạo concentration mới
   * POST /api/admin/concentrations
   */
  createConcentration: (
    data: ConcentrationFormData
  ): Promise<Concentration> => {
    const payload: Record<string, unknown> = {
      name: data.name,
    };
    if (data.slug) payload.slug = data.slug;
    if (data.description) payload.description = data.description;
    if (data.acronym) payload.acronym = data.acronym;
    if (data.minOilPercentage !== undefined)
      payload.minOilPercentage = data.minOilPercentage;
    if (data.maxOilPercentage !== undefined)
      payload.maxOilPercentage = data.maxOilPercentage;
    if (data.longevity) payload.longevity = data.longevity;
    if (data.intensityLevel !== undefined)
      payload.intensityLevel = data.intensityLevel;
    if (data.displayOrder !== undefined)
      payload.displayOrder = data.displayOrder;
    if (data.status) payload.status = data.status;

    return http
      .post<ApiResponse<Concentration>>(
        API_ROUTES.ADMIN_CONCENTRATIONS,
        payload
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật concentration
   * PUT /api/admin/concentrations/{id}
   */
  updateConcentration: (
    id: number,
    data: Partial<ConcentrationFormData>
  ): Promise<Concentration> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.description !== undefined) payload.description = data.description;
    if (data.acronym !== undefined) payload.acronym = data.acronym;
    if (data.minOilPercentage !== undefined)
      payload.minOilPercentage = data.minOilPercentage;
    if (data.maxOilPercentage !== undefined)
      payload.maxOilPercentage = data.maxOilPercentage;
    if (data.longevity !== undefined) payload.longevity = data.longevity;
    if (data.intensityLevel !== undefined)
      payload.intensityLevel = data.intensityLevel;
    if (data.displayOrder !== undefined)
      payload.displayOrder = data.displayOrder;
    if (data.status !== undefined) payload.status = data.status;

    return http
      .put<ApiResponse<Concentration>>(
        `${API_ROUTES.ADMIN_CONCENTRATIONS}/${id}`,
        payload
      )
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa concentration
   * DELETE /api/admin/concentrations/{id}
   */
  deleteConcentration: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.ADMIN_CONCENTRATIONS}/${id}`)
      .then(() => undefined);
  },
};
