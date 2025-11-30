import http from "@/lib/axios-client";
import { API_ROUTES } from "@/config/api-routes";
import {
  LoginRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
} from "@/types/auth.types";
import { ApiResponse } from "@/types/api.types";
import { logger } from "@/lib/logger";

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>(API_ROUTES.LOGIN, payload).then((res) => res),
  logout: () => http.post(API_ROUTES.LOGOUT).catch(() => undefined),
  getCurrentUser: () => http.get<User>(API_ROUTES.ME).then((res) => res),
  refreshToken: (refreshToken: string) =>
    http
      .post<LoginResponse>(API_ROUTES.REFRESH_TOKEN, { refreshToken })
      .then((res) => res),
  forgotPassword: (payload: ForgotPasswordRequest) =>
    http
      .post<ApiResponse<{ message: string }>>(
        API_ROUTES.FORGOT_PASSWORD,
        payload
      )
      .then((res) => res),
  sendOtp: (payload: SendOtpRequest) =>
    http
      .post<ApiResponse<SendOtpResponse>>(API_ROUTES.SEND_OTP, payload, {
        timeout: 15000, // 15 seconds cho email service (có thể mất thời gian để gửi email)
      })
      .then((res) => {
        // Axios interceptor đã unwrap response.data, nên res là ApiResponse<SendOtpResponse>
        // Backend luôn trả về ApiResponse với structure: { status, message, data, timestamp }

        // Kiểm tra nếu res.data tồn tại và là object hợp lệ
        if (res.data && typeof res.data === "object" && res.data !== null) {
          // Data có thể là SendOtpResponse object
          return res.data as SendOtpResponse;
        }

        // Nếu không có data hoặc data null, nhưng có message từ ApiResponse
        // Tạo response object từ message (backend có thể trả về success với message nhưng data null)
        const response: SendOtpResponse = {
          message: res.message || "OTP code has been sent to your email",
          expiresIn: 300, // Default 5 minutes
        };
        return response;
      })
      .catch((error) => {
        // Log error để debug (chỉ trong development)
        logger.error("Send OTP error:", error);
        logger.error("Error response:", error?.response?.data);

        // Xử lý timeout error - có thể email đã được gửi nhưng response chậm
        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout")
        ) {
          // Nếu timeout, có thể email đã được gửi thành công nhưng response chậm
          // Trả về success response để user có thể tiếp tục
          return {
            message:
              "OTP code has been sent to your email. Please check your inbox.",
            expiresIn: 300,
          } as SendOtpResponse;
        }

        // Nếu error có response và status là 2xx, có thể là success nhưng format khác
        if (error?.response?.status >= 200 && error?.response?.status < 300) {
          const responseData = error.response.data;
          return {
            message:
              responseData?.message || "OTP code has been sent to your email",
            expiresIn: responseData?.data?.expiresIn || 300,
          } as SendOtpResponse;
        }

        // Throw error cho các trường hợp khác
        throw error;
      }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    http
      .post<ApiResponse<VerifyOtpResponse>>(API_ROUTES.VERIFY_OTP, payload)
      .then((res) => {
        // Backend có thể trả về data hoặc chỉ message
        if (res.data) {
          return res.data;
        }
        // Nếu không có data nhưng có message, có thể là success với resetToken trong message hoặc cần verify lại
        if (res.message) {
          // Check nếu có resetToken field hoặc chỉ trả về message
          return {
            message: res.message,
            resetToken: (res as any).resetToken || "", // Fallback nếu không có resetToken
          } as VerifyOtpResponse;
        }
        throw new Error("Failed to verify OTP");
      }),
  resetPassword: (payload: ResetPasswordRequest) =>
    http
      .post<ApiResponse<{ message: string }>>(
        API_ROUTES.RESET_PASSWORD,
        payload
      )
      .then((res) => {
        return {
          message: res.message || "Password reset successfully",
        };
      }),
};
