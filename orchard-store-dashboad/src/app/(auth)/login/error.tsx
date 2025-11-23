"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/shared/error-fallback";

/**
 * Error Boundary cho trang Login
 * 
 * Được Next.js tự động gọi khi có lỗi trong login page
 * Hiển thị UI fallback thay vì màn hình trắng
 */

interface LoginErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LoginError({ error, reset }: LoginErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry)
    console.error("Login page error:", error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Không thể tải trang đăng nhập"
      description="Đã xảy ra lỗi khi tải trang đăng nhập. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ."
      showHomeButton={false}
    />
  );
}

