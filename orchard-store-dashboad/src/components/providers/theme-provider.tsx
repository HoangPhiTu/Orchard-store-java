"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Chỉ hỗ trợ hai theme: "light" và "dark".
   * Mặc định: "light", và disableSystem = true.
   */
  defaultTheme?: "light" | "dark";
  attribute?: "class" | "data-theme";
  disableTransitionOnChange?: boolean;
}

/**
 * ThemeProvider
 *
 * Wrapper cho NextThemesProvider từ thư viện next-themes.
 * - Sử dụng attribute="class" để phù hợp với Tailwind CSS dark mode.
 * - Hỗ trợ defaultTheme = "system" để tự động theo OS.
 *
 * Sử dụng:
 * <ThemeProvider>
 *   {children}
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange={disableTransitionOnChange}
      // ✅ Tối ưu: Sử dụng storageKey để persist theme preference
      storageKey="orchard-theme"
      // ✅ Tối ưu: Nonce để tránh FOUC (Flash of Unstyled Content)
      nonce="theme-provider"
    >
      {children}
    </NextThemesProvider>
  );
}
