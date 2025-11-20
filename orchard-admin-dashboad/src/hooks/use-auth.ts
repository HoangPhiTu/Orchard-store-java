import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { isAuthenticated, checkAuth } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    checkAuth: state.checkAuth,
  }));

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated };
}
