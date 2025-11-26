"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { LoginRequest, LoginResponse, User } from "@/types/auth.types";
import { env, REFRESH_TOKEN_STORAGE_KEY } from "@/config/env";

const TOKEN_KEY = env.accessTokenKey;
const STORAGE_KEY = "orchard-auth-storage";

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

const clearPersistedAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

const persistToken = (token: string | null, remember = false) => {
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
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      ...initialState,

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(payload);

          if (data.refreshToken && typeof window !== "undefined") {
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
          }

          persistToken(data.accessToken, payload.remember);

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });

          return data;
        } catch (error) {
          persistToken(null);
          set({ ...initialState, isInitialized: true });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout failed on server", error);
        } finally {
          persistToken(null);
          clearPersistedAuth();
          if (typeof window !== "undefined") {
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          }
          set({ ...initialState, isInitialized: true });
          window.location.href = "/login";
        }
      },

      checkAuth: async () => {
        const token = readToken();
        const storedUser = get().user;

        if (storedUser && token) {
          set({ isAuthenticated: true, isInitialized: true });
          return;
        }

        if (!token) {
          set({ ...initialState, isInitialized: true });
          return;
        }

        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isInitialized: true });
        } catch (error) {
          console.warn("Token validation failed", error);
          persistToken(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          }
          set({ ...initialState, isInitialized: true });
        }
      },

      initialize: async () => {
        const { isInitialized } = get();
        if (isInitialized) return;

        set({ isLoading: true });
        await get().checkAuth();
        set({ isLoading: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

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
