import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  Warehouse,
  WarehouseFormData,
  WarehouseFilter,
} from "@/types/warehouse.types";
import type { ApiResponse } from "@/types/api.types";
import type { Page } from "@/types/user.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "Warehouse data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "Warehouse data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<Warehouse[]> to Warehouse[]
 */
const unwrapList = (response: ApiResponse<Warehouse[]>): Warehouse[] => {
  return response.data ?? [];
};

export const warehouseService = {
  /**
   * ===== ADMIN API =====
   * Lấy danh sách warehouses với pagination và filters (admin)
   * GET /api/admin/warehouses?page=0&size=10&keyword=...&status=...&sortBy=name&direction=ASC
   */
  getWarehouses: (params?: WarehouseFilter) => {
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
      .get<ApiResponse<Page<Warehouse>>>(API_ROUTES.WAREHOUSES, {
        params: queryParams,
      })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy tất cả warehouses đang active (không phân trang - dành cho dropdown)
   * GET /api/admin/warehouses/active
   */
  getActiveWarehouses: () =>
    http
      .get<ApiResponse<Warehouse[]>>(`${API_ROUTES.WAREHOUSES}/active`)
      .then((res) => unwrapList(res)),

  /**
   * Lấy chi tiết warehouse theo ID (admin)
   * GET /api/admin/warehouses/{id}
   */
  getWarehouse: (id: number): Promise<Warehouse> => {
    return http
      .get<ApiResponse<Warehouse>>(`${API_ROUTES.WAREHOUSES}/${id}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Lấy chi tiết warehouse theo code (admin)
   * GET /api/admin/warehouses/code/{code}
   */
  getWarehouseByCode: (code: string): Promise<Warehouse> => {
    return http
      .get<ApiResponse<Warehouse>>(`${API_ROUTES.WAREHOUSES}/code/${code}`)
      .then((res) => unwrapItem(res));
  },

  /**
   * Tạo warehouse mới
   * POST /api/admin/warehouses
   */
  createWarehouse: (data: WarehouseFormData): Promise<Warehouse> => {
    const payload: Record<string, unknown> = {
      name: data.name,
    };
    if (data.code) payload.code = data.code;
    if (data.address) payload.address = data.address;
    if (data.contactPhone) payload.contactPhone = data.contactPhone;
    if (data.isDefault !== undefined) payload.isDefault = data.isDefault;
    if (data.status) payload.status = data.status;

    return http
      .post<ApiResponse<Warehouse>>(API_ROUTES.WAREHOUSES, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Cập nhật warehouse
   * PUT /api/admin/warehouses/{id}
   */
  updateWarehouse: (
    id: number,
    data: Partial<WarehouseFormData>
  ): Promise<Warehouse> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.code !== undefined) payload.code = data.code;
    if (data.address !== undefined) payload.address = data.address;
    if (data.contactPhone !== undefined) payload.contactPhone = data.contactPhone;
    if (data.isDefault !== undefined) payload.isDefault = data.isDefault;
    if (data.status !== undefined) payload.status = data.status;

    return http
      .put<ApiResponse<Warehouse>>(`${API_ROUTES.WAREHOUSES}/${id}`, payload)
      .then((res) => unwrapItem(res));
  },

  /**
   * Xóa warehouse
   * DELETE /api/admin/warehouses/{id}
   */
  deleteWarehouse: (id: number): Promise<void> => {
    return http
      .delete<ApiResponse<void>>(`${API_ROUTES.WAREHOUSES}/${id}`)
      .then(() => undefined);
  },

  /**
   * Đặt warehouse làm mặc định
   * PUT /api/admin/warehouses/{id}/set-default
   */
  setDefaultWarehouse: (id: number): Promise<Warehouse> => {
    return http
      .put<ApiResponse<Warehouse>>(`${API_ROUTES.WAREHOUSES}/${id}/set-default`)
      .then((res) => unwrapItem(res));
  },
};

