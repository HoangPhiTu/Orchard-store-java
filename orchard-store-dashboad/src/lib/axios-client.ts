"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { forceLogout } from "@/stores/auth-store";
import { env, REFRESH_TOKEN_STORAGE_KEY } from "@/config/env";
import type { LoginResponse } from "@/types/auth.types";
import { getEncryptedToken } from "@/lib/security/token-encryption";

const API_URL = env.apiUrl;
const TOKEN_KEY = "orchard_admin_token"; // Hardcode theo yêu cầu
const REFRESH_TOKEN_KEY = REFRESH_TOKEN_STORAGE_KEY;

// Flag để tránh vòng lặp refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Extract error message from backend response
 * Backend có thể trả về 2 format:
 * 1. ApiResponse: { status, message, data, timestamp }
 * 2. GlobalExceptionHandler: { status, error, message, timestamp, path, errors? }
 */
const getErrorMessage = (error: AxiosError): string => {
  const response = error.response?.data;

  if (!response || typeof response !== "object") {
    return "";
  }

  // Format 1: ApiResponse
  if ("message" in response && typeof response.message === "string") {
    return response.message;
  }

  // Format 2: GlobalExceptionHandler
  if ("error" in response && typeof response.error === "string") {
    return response.error;
  }

  return "";
};

/**
 * Extract validation errors from 422 response
 */
const getValidationErrors = (
  error: AxiosError
): Record<string, string> | null => {
  const response = error.response?.data;

  if (!response || typeof response !== "object") {
    return null;
  }

  // Check for errors field (validation errors)
  if (
    "errors" in response &&
    typeof response.errors === "object" &&
    response.errors !== null
  ) {
    return response.errors as Record<string, string>;
  }

  return null;
};

// Tạo axios instance với config
const http = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds - prevent hanging requests
  withCredentials: true,
});

// Request Interceptor: Gán token vào header
http.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  // Lấy token từ cookie tên là "orchard_admin_token"
  // Prefer cookie (set by backend), fallback to encrypted localStorage
  let token = Cookies.get(TOKEN_KEY);
  if (!token && typeof window !== "undefined") {
    // Try to get from encrypted localStorage (async, but we'll handle it)
    getEncryptedToken(TOKEN_KEY)
      .then((encryptedToken) => {
        if (encryptedToken && config.headers) {
          config.headers.Authorization = `Bearer ${encryptedToken}`;
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor
http.interceptors.response.use(
  // Success: Unwrap data
  (response) => {
    return response.data;
  },
  // Error: Xử lý lỗi và hiển thị toast
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Xử lý 401: Refresh token logic
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Get refresh token from encrypted storage
      const refreshToken =
        typeof window !== "undefined"
          ? await getEncryptedToken(REFRESH_TOKEN_KEY)
          : null;

      if (!refreshToken) {
        // Không có refresh token, logout
        processQueue(error, null);
        isRefreshing = false;
        Cookies.remove(TOKEN_KEY, { path: "/" });
        if (typeof window !== "undefined") {
          const { removeEncryptedToken } = await import(
            "@/lib/security/token-encryption"
          );
          removeEncryptedToken(TOKEN_KEY);
          removeEncryptedToken(REFRESH_TOKEN_KEY);
        }
        toast.error("Phiên đăng nhập hết hạn");
        forceLogout();
        return Promise.reject(error);
      }

      try {
        // Thử refresh token - gọi trực tiếp để tránh circular dependency
        // Note: Phải dùng axios.create mới để tránh interceptor loop
        const refreshAxios = axios.create({
          baseURL: API_URL,
          withCredentials: true,
        });

        // Gọi refresh token endpoint trực tiếp
        const refreshResponse = await refreshAxios.post<LoginResponse>(
          "/api/auth/refresh",
          { refreshToken }
        );

        // Interceptor đã unwrap, nên refreshResponse là LoginResponse
        const loginResponse = refreshResponse.data;

        // Lưu token mới
        const cookieOptions: Cookies.CookieAttributes = {
          path: "/",
          sameSite: "Lax",
          secure: window.location.protocol === "https:",
        };
        Cookies.set(TOKEN_KEY, loginResponse.accessToken, cookieOptions);

        if (loginResponse.refreshToken) {
          // Store encrypted refresh token
          const { setEncryptedToken } = await import(
            "@/lib/security/token-encryption"
          );
          await setEncryptedToken(
            REFRESH_TOKEN_KEY,
            loginResponse.refreshToken
          );
        }

        // Cập nhật header cho request gốc
        const accessToken = loginResponse.accessToken;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Xử lý queue
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry request gốc
        return http(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, logout
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        Cookies.remove(TOKEN_KEY, { path: "/" });
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        toast.error("Phiên đăng nhập hết hạn");
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    // Centralized Error Handling với Toast tiếng Việt
    const status = error?.response?.status;
    const errorMessage = getErrorMessage(error);

    // Skip error handling cho auth endpoints để tránh duplicate toasts
    const isAuthEndpoint = originalRequest?.url?.includes("/api/auth/");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    switch (status) {
      case 401:
        // Unauthorized - đã xử lý ở trên, nếu đến đây nghĩa là refresh failed
        toast.error("Phiên đăng nhập hết hạn");
        forceLogout();
        break;

      case 403:
        // Forbidden
        toast.error("Không có quyền truy cập");
        break;

      case 404:
        // Not Found
        const notFoundMessage = errorMessage || "Không tìm thấy dữ liệu";
        toast.error(notFoundMessage);
        break;

      case 409:
        // Conflict - Form sẽ xử lý inline error, không toast ở đây
        // Toast sẽ được hiển thị bởi form component nếu cần
        break;

      case 400:
        // Bad Request - OperationNotPermittedException hoặc các lỗi khác
        // Hiển thị message cụ thể từ backend (ví dụ: role hierarchy, self-protection)
        const badRequestMessage = errorMessage || "Yêu cầu không hợp lệ";
        toast.error(badRequestMessage);
        break;

      case 422:
        // Validation Error
        const validationErrors = getValidationErrors(error);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          // Hiển thị lỗi đầu tiên
          const firstError = Object.values(validationErrors)[0];
          toast.error(firstError);
        } else {
          // Hiển thị message chung
          const validationMessage =
            errorMessage || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          toast.error(validationMessage);
        }
        break;

      case 500:
        // Server Error
        toast.error("Lỗi hệ thống");
        break;

      default:
        // Network Error hoặc các lỗi khác
        if (!error.response) {
          // Check for timeout (ECONNABORTED)
          if (
            error.code === "ECONNABORTED" ||
            error.message?.includes("timeout")
          ) {
            toast.error("Kết nối quá hạn, vui lòng kiểm tra mạng");
          } else {
            // Network Error (response undefined)
            toast.error("Mất kết nối máy chủ");
          }
        } else if (status) {
          // Other HTTP errors
          const defaultMessage = errorMessage || "Đã có lỗi xảy ra";
          toast.error(defaultMessage);
        }
        break;
    }

    return Promise.reject(error);
  }
);

export default http;
