import http from "@/lib/axios-client";
import { API_ROUTES } from "@/lib/constants";
import { LoginRequest, LoginResponse } from "@/types/auth.types";

export const authService = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>(API_ROUTES.LOGIN, payload),
  logout: () => http.post(API_ROUTES.LOGOUT).catch(() => undefined),
};
