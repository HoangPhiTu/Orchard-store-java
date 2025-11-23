"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";

/**
 * ToastProvider - Quản lý thông báo Toast chuyên nghiệp
 *
 * Features:
 * 1. Tự động xóa toast khi chuyển trang (Clear on Navigate)
 * 2. Cấu hình mặc định chuyên nghiệp:
 *    - Duration: 4000ms (4 giây)
 *    - Close Button: Luôn hiển thị
 *    - Rich Colors: Success xanh, Error đỏ rõ ràng
 */
export function ToastProvider() {
  const pathname = usePathname();

  // Tự động xóa toàn bộ toast khi chuyển trang
  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  return (
    <Toaster richColors closeButton duration={4000} position="top-right" />
  );
}
