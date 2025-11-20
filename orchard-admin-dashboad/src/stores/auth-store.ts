"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { LoginRequest, LoginResponse, User } from "@/types/auth.types";

// Lấy key từ biến môi trường hoặc fallback
const TOKEN_KEY =
  process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY ?? "orchard_admin_token";
const USER_KEY = "orchard_admin_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    payload: LoginRequest & { remember?: boolean }
  ) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

// Helper: Đọc token từ Cookie hoặc LocalStorage (ưu tiên Cookie)
const readToken = () => {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
};

// Helper: Đọc user info từ LocalStorage
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

// Helper: Lưu/Xóa session (Logic cốt lõi)
const persistSession = (
  token: string | null,
  user: User | null,
  remember = false
) => {
  if (typeof window === "undefined") return;

  if (token) {
    // 1. Cấu hình Cookie chuẩn
    const cookieOptions: Cookies.CookieAttributes = {
      path: "/", // BẮT BUỘC: Để Middleware đọc được ở mọi route
      sameSite: "Lax", // Tốt cho UX, không bị block khi redirect từ bên thứ 3
      secure: false,    };

    // 2. Xử lý Remember Me
    if (remember) {
      // Nếu chọn Remember: Cookie sống 7 ngày + Lưu backup vào LocalStorage
      cookieOptions.expires = 7; 
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // Không chọn: Cookie phiên (tắt browser là mất) + Xóa LocalStorage
      localStorage.removeItem(TOKEN_KEY);
    }

    // 3. Set Cookie
    Cookies.set(TOKEN_KEY, token, cookieOptions);
  } else {
    // Logout: Xóa sạch mọi nơi
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove(TOKEN_KEY, { path: "/" }); // ⚠️ Phải có path khi remove
  }

  // User info luôn lưu LocalStorage để UI load nhanh (không ảnh hưởng bảo mật bằng Token)
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: readUser(),
  isAuthenticated: Boolean(readToken()),
  isLoading: false,

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await authService.login(payload);
      
      // Lưu session
      persistSession(data.accessToken, data.user, payload.remember);
      
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      // Nếu lỗi, đảm bảo dọn sạch rác
      persistSession(null, null);
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Gọi API logout (nếu backend cần revoke token)
      await authService.logout(); 
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      // Luôn luôn xóa session ở client dù server lỗi hay không
      persistSession(null, null);
      set({ user: null, isAuthenticated: false });
      
      // Force reload trang để reset các state khác của app (React Query cache, etc.)
      window.location.href = "/login"; 
    }
  },

  checkAuth: () => {
    const token = readToken();
    const user = readUser();
    
    // Đồng bộ state với storage hiện tại
    if (!token) {
       set({ user: null, isAuthenticated: false });
    } else {
       set({ user, isAuthenticated: true });
    }
  },
}));

// Helper để gọi logout từ bên ngoài React Component (ví dụ: trong Axios interceptor)
export const forceLogout = () => {
  const logout = useAuthStore.getState().logout;
  logout().catch(() => undefined);
};