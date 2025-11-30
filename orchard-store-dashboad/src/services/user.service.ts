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
   * GET /api/admin/users/{id}
   *
   * @param id - User ID
   * @returns User object
   * @throws Error nếu không tìm thấy user
   */
  getUser: (id: number): Promise<User> =>
    http
      .get<ApiResponse<User>>(`${API_ROUTES.USERS}/${id}`)
      .then((res) => unwrapItem(res)),

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
