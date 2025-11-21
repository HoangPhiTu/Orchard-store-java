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

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>(API_ROUTES.LOGIN, payload).then((res) => res.data),
  logout: () => http.post(API_ROUTES.LOGOUT).catch(() => undefined),
  getCurrentUser: () => http.get<User>(API_ROUTES.ME).then((res) => res.data),
  refreshToken: (refreshToken: string) =>
    http
      .post<LoginResponse>(API_ROUTES.REFRESH_TOKEN, { refreshToken })
      .then((res) => res.data),
  forgotPassword: (payload: ForgotPasswordRequest) =>
    http
      .post<ApiResponse<{ message: string }>>(
        API_ROUTES.FORGOT_PASSWORD,
        payload
      )
      .then((res) => res.data),
  sendOtp: (payload: SendOtpRequest) =>
    http
      .post<ApiResponse<SendOtpResponse>>(API_ROUTES.SEND_OTP, payload)
      .then((res) => {
        if (res.data.data) {
          return res.data.data;
        }
        throw new Error(res.data.message || "Failed to send OTP");
      }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    http
      .post<ApiResponse<VerifyOtpResponse>>(API_ROUTES.VERIFY_OTP, payload)
      .then((res) => {
        if (res.data.data) {
          return res.data.data;
        }
        throw new Error(res.data.message || "Failed to verify OTP");
      }),
  resetPassword: (payload: ResetPasswordRequest) =>
    http
      .post<ApiResponse<{ message: string }>>(
        API_ROUTES.RESET_PASSWORD,
        payload
      )
      .then((res) => {
        return {
          message: res.data.message || "Password reset successfully",
        };
      }),
};
