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
      .post<ApiResponse<SendOtpResponse>>(API_ROUTES.SEND_OTP, payload)
      .then((res) => {
        if (res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to send OTP");
      }),
  verifyOtp: (payload: VerifyOtpRequest) =>
    http
      .post<ApiResponse<VerifyOtpResponse>>(API_ROUTES.VERIFY_OTP, payload)
      .then((res) => {
        if (res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to verify OTP");
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
