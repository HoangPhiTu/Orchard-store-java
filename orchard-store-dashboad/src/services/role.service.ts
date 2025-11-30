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
      .catch((error: unknown) => {
        // Handle 403 Forbidden gracefully - return empty array instead of throwing
        const axiosError = error as { response?: { status?: number } };
        const status = axiosError?.response?.status;

        if (status === 403) {
          // User doesn't have permission or endpoint doesn't exist
          // Return empty array to allow UI to render gracefully
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Role API endpoint returned 403. Returning empty array. Backend may need GET /api/admin/roles endpoint or user lacks permissions."
            );
          }
          return [] as Role[];
        }

        // For other errors, log and throw
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Role API endpoint error. Please create GET /api/admin/roles endpoint in backend.",
            error
          );
        }
        throw error;
      }),
};
