"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Auth Layout
 *
 * Layout riêng cho các trang authentication (login, forgot password, etc.)
 * - Force light mode mặc định, không bị ảnh hưởng bởi theme của admin dashboard
 * - Tắt dark mode cho auth pages và prevent theme changes
 * - Override theme provider để luôn dùng light mode với màu mặc định
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Force light mode cho auth pages ngay khi mount
    const html = document.documentElement;
    const body = document.body;

    // Set attribute để CSS có thể target và force light mode
    html.setAttribute("data-auth-pages", "true");

    // Remove dark class ngay lập tức
    html.classList.remove("dark");

    // Force light mode bằng cách remove dark class liên tục và prevent theme changes
    const preventDarkMode = () => {
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
      }
    };

    // Remove dark class ngay
    preventDarkMode();

    // Set up observer để prevent theme changes
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          preventDarkMode();
        }
      });
    });

    // Observe changes to classList
    observerRef.current.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also check periodically để đảm bảo
    const intervalId = setInterval(preventDarkMode, 100);

    // Force body background
    body.style.backgroundColor = "#ffffff";
    body.style.color = "#0f172a";

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(intervalId);
      html.removeAttribute("data-auth-pages");
      body.style.removeProperty("background-color");
      body.style.removeProperty("color");
    };
  }, []);

  return (
    <div className="auth-pages-light-mode" suppressHydrationWarning>
      {children}
    </div>
  );
}
