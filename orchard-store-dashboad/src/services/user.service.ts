import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
  User,
  UserFilters,
  UserCreateRequestDTO,
  UserUpdateRequestDTO,
  Page,
  LoginHistory,
  PagingParams,
} from "@/types/user.types";
import type { ApiResponse } from "@/types/api.types";

/**
 * Unwrap ApiResponse<Page<T>> to Page<T>
 */
const unwrapPage = <T>(response: ApiResponse<Page<T>>): Page<T> => {
  if (!response.data) {
    throw new Error(response.message || "User data not found");
  }
  return response.data;
};

/**
 * Unwrap ApiResponse<T> to T
 */
const unwrapItem = <T>(response: ApiResponse<T>): T => {
  if (!response.data) {
    throw new Error(response.message || "User data not found");
  }
  return response.data;
};

export const userService = {
  /**
   * Lấy danh sách users với tìm kiếm và phân trang
   * GET /api/admin/users?keyword=...&page=0&size=20&status=ACTIVE
   */
  getUsers: (params?: UserFilters) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;
    if (params?.keyword && params.keyword.trim() !== "") {
      queryParams.keyword = params.keyword.trim();
    }
    if (params?.status && params.status !== "ALL") {
      queryParams.status = params.status;
    }

    return http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, { params: queryParams })
      .then((res) => unwrapPage(res));
  },

  /**
   * Lấy chi tiết một user theo ID
   *
   * ⚠️ WORKAROUND: Backend chưa có endpoint GET /api/admin/users/{id}
   * Tạm thời sử dụng workaround: fetch danh sách và filter theo ID
   *
   * TODO: Backend cần thêm endpoint GET /api/admin/users/{id} để:
   * - Tối ưu hiệu suất (không cần fetch toàn bộ danh sách)
   * - Đảm bảo tìm thấy user ngay cả khi không nằm trong page đầu tiên
   *
   * @param id - User ID
   * @returns User object
   * @throws Error nếu không tìm thấy user
   */
  getUser: (id: number): Promise<User> => {
    // Workaround: Fetch với size lớn để tăng khả năng tìm thấy user
    // Lưu ý: Nếu user không nằm trong 1000 users đầu tiên, sẽ không tìm thấy
    const MAX_FETCH_SIZE = 1000;

    return http
      .get<ApiResponse<Page<User>>>(API_ROUTES.USERS, {
        params: { size: MAX_FETCH_SIZE },
      })
      .then((res) => {
        try {
          const page = unwrapPage(res);
          const user = page.content.find((u) => u.id === id);

          if (!user) {
            // Provide helpful error message
            const totalElements = page.totalElements || 0;
            const errorMessage =
              totalElements > MAX_FETCH_SIZE
                ? `User with ID ${id} not found in first ${MAX_FETCH_SIZE} users. Backend needs GET /api/admin/users/{id} endpoint.`
                : `User with ID ${id} not found`;

            throw new Error(errorMessage);
          }

          return user;
        } catch (error) {
          // Re-throw with more context
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(`Failed to get user with ID ${id}: ${String(error)}`);
        }
      })
      .catch((error) => {
        // Improve error handling
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(
          `Failed to fetch user with ID ${id}. Backend should implement GET /api/admin/users/{id} endpoint. Original error: ${String(
            error
          )}`
        );
      });
  },

  /**
   * Tạo user mới
   * POST /api/admin/users
   */
  createUser: (data: UserCreateRequestDTO) =>
    http
      .post<ApiResponse<User>>(API_ROUTES.USERS, data)
      .then((res) => unwrapItem(res)),

  /**
   * Cập nhật user
   * PUT /api/admin/users/{id}
   * Note: Email và password không thể cập nhật qua endpoint này
   */
  updateUser: (id: number, data: UserUpdateRequestDTO) =>
    http
      .put<ApiResponse<User>>(`${API_ROUTES.USERS}/${id}`, data)
      .then((res) => unwrapItem(res)),

  /**
   * Khóa/Mở khóa user (toggle status)
   * PATCH /api/admin/users/{id}/status
   */
  toggleUserStatus: (id: number) =>
    http
      .patch<ApiResponse<User>>(`${API_ROUTES.USERS}/${id}/status`)
      .then((res) => unwrapItem(res)),

  /**
   * Admin reset password của user khác
   * PUT /api/admin/users/{id}/reset-password
   */
  resetPassword: (id: number, newPassword: string) =>
    http
      .put<ApiResponse<void>>(`${API_ROUTES.USERS}/${id}/reset-password`, {
        newPassword,
      })
      .then(() => undefined), // Return void on success

  /**
   * Xóa user
   * DELETE /api/admin/users/{id}
   */
  deleteUser: (id: number) =>
    http
      .delete<ApiResponse<void>>(`${API_ROUTES.USERS}/${id}`)
      .then(() => undefined), // Return void on success

  /**
   * Khởi tạo đổi email (gửi OTP)
   * POST /api/admin/users/{id}/email/init
   */
  initiateChangeEmail: (userId: number, newEmail: string) =>
    http
      .post<ApiResponse<void>>(`${API_ROUTES.USERS}/${userId}/email/init`, {
        userId,
        newEmail,
      })
      .then(() => undefined),

  /**
   * Xác thực đổi email bằng OTP
   * POST /api/admin/users/{id}/email/verify
   */
  verifyChangeEmail: (userId: number, newEmail: string, otp: string) =>
    http
      .post<ApiResponse<void>>(`${API_ROUTES.USERS}/${userId}/email/verify`, {
        userId,
        newEmail,
        otp,
      })
      .then(() => undefined),

  /**
   * Lấy lịch sử đăng nhập của user
   * GET /api/admin/users/{id}/history?page=0&size=20
   */
  getLoginHistory: (id: number, params?: PagingParams) =>
    http
      .get<ApiResponse<Page<LoginHistory>>>(
        `${API_ROUTES.USERS}/${id}/history`,
        {
          params,
        }
      )
      .then((res) => unwrapPage(res)),
};
