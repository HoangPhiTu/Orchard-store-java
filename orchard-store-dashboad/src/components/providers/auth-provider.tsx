"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const pathname = usePathname();
  
  // Check if we're on an auth page (login, forgot-password, etc.)
  const isAuthPage = pathname?.startsWith("/login") || 
                    pathname?.startsWith("/forgot-password") ||
                    pathname?.startsWith("/verify-otp") ||
                    pathname?.startsWith("/reset-password");

  useEffect(() => {
    // Delay initialization on auth pages to avoid blocking render
    // This improves perceived performance on login page
    if (isAuthPage) {
      // Small delay to let page render first
      const timer = setTimeout(() => {
        initialize();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // On protected pages, initialize immediately
      initialize();
    }
  }, [initialize, isAuthPage]);

  return <>{children}</>;
}
