"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { forceLogout } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { env, REFRESH_TOKEN_STORAGE_KEY } from "@/config/env";

const API_URL = env.apiUrl;
const TOKEN_KEY = env.accessTokenKey;
const REFRESH_TOKEN_KEY = REFRESH_TOKEN_STORAGE_KEY;

// Flag để tránh vòng lặp refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu là 401 và chưa retry
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

      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem(REFRESH_TOKEN_KEY)
          : null;

      if (!refreshToken) {
        // Không có refresh token, logout
        processQueue(error, null);
        isRefreshing = false;
        Cookies.remove(TOKEN_KEY, { path: "/" });
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          forceLogout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Thử refresh token
        const { data } = await authService.refreshToken(refreshToken);

        // Lưu token mới
        const cookieOptions: Cookies.CookieAttributes = {
          path: "/",
          sameSite: "Lax",
          secure: window.location.protocol === "https:",
        };
        Cookies.set(TOKEN_KEY, data.accessToken, cookieOptions);

        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }

        // Cập nhật header cho request gốc
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }

        // Xử lý queue
        processQueue(null, data.accessToken);
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
          forceLogout();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default http;
