"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { LoginRequest, LoginResponse, User } from "@/types/auth.types";
import { env, REFRESH_TOKEN_STORAGE_KEY } from "@/config/env";

const TOKEN_KEY = env.accessTokenKey;
const USER_KEY = "orchard_admin_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (
    payload: LoginRequest & { remember?: boolean }
  ) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

const readToken = () => {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
};

const readUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const persistSession = (
  token: string | null,
  user: User | null,
  remember = false
) => {
  if (typeof window === "undefined") return;

  if (token) {
    const cookieOptions: Cookies.CookieAttributes = {
      path: "/",
      sameSite: "Lax",
      secure: false,
    };

    if (remember) {
      cookieOptions.expires = 7;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    Cookies.set(TOKEN_KEY, token, cookieOptions);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove(TOKEN_KEY, { path: "/" });
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readUser(),
  isAuthenticated: Boolean(readToken()),
  isLoading: false,
  isInitialized: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(payload);

      if (data.refreshToken && typeof window !== "undefined") {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
      }

      persistSession(data.accessToken, data.user, payload.remember);

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      persistSession(null, null);
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      persistSession(null, null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      }
      set({ user: null, isAuthenticated: false, isInitialized: true });
      window.location.href = "/login";
    }
  },

  checkAuth: async () => {
    const token = readToken();

    if (!token) {
      set({ user: null, isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      persistSession(token, user, false);
      set({ user, isAuthenticated: true, isInitialized: true });
    } catch (error) {
      console.warn("Token validation failed", error);
      persistSession(null, null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      }
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  initialize: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    set({ isLoading: true });
    await get().checkAuth();
    set({ isLoading: false });
  },
}));

/**
 * Helper function để force logout (gọi từ axios interceptor)
 * Xóa session và redirect về trang login
 */
export const forceLogout = () => {
  const logout = useAuthStore.getState().logout;
  logout().catch(() => {
    // Nếu logout thất bại, vẫn redirect về login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  });
};
