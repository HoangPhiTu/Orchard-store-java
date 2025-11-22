import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type { Role } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

/**
 * Unwrap ApiResponse<T[]> to T[]
 */
const unwrapList = <T>(response: ApiResponse<T[]>): T[] => {
  if (!response.data) {
    throw new Error(response.message || "Role data not found");
  }
  return response.data;
};

export const roleService = {
  /**
   * Lấy danh sách tất cả roles (chỉ ACTIVE roles)
   * GET /api/admin/roles
   * 
   * Note: Backend cần tạo endpoint này nếu chưa có.
   * Expected response: ApiResponse<Role[]>
   */
  getAllRoles: (): Promise<Role[]> =>
    http
      .get<ApiResponse<Role[]>>(API_ROUTES.ROLES)
      .then((res) => unwrapList(res))
      .catch((error) => {
        // TODO: Backend chưa có endpoint này, có thể thêm mock data tạm thời
        // Hoặc tạo RoleController trong backend với endpoint GET /api/admin/roles
        console.warn(
          "Role API endpoint not available. Please create GET /api/admin/roles endpoint in backend.",
          error
        );
        throw error;
      }),
};

