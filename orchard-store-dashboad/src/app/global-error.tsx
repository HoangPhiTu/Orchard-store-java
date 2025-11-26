"use client";

import { useEffect, useMemo } from "react";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { AxiosError } from "axios";

/**
 * Global Error Handler
 *
 * Bắt các lỗi nghiêm trọng nhất ở cấp Root Layout
 * Đảm bảo app LUÔN có giao diện phản hồi, không bao giờ màn hình trắng
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Extract user-friendly error message from error object
 */
function isAxiosErrorLike(
  error: unknown
): error is AxiosError<unknown> & { isAxiosError?: boolean } {
  if (error instanceof AxiosError) {
    return true;
  }
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  );
}

function getErrorMessage(error: Error | undefined): string {
  if (!error) return "";

  // Check if it's an AxiosError
  if (isAxiosErrorLike(error)) {
    const axiosError = error;
    const response = axiosError.response?.data;

    if (response && typeof response === "object") {
      const typedResponse = response as Record<string, unknown>;

      // Try to get message from backend response
      if (typedResponse.message && typeof typedResponse.message === "string") {
        return typedResponse.message;
      }

      if (typedResponse.error && typeof typedResponse.error === "string") {
        return typedResponse.error;
      }
    }

    // Fallback to status code message
    const status = axiosError.response?.status;
    if (status) {
      const statusMessages: Record<number, string> = {
        400: "Yêu cầu không hợp lệ",
        401: "Phiên đăng nhập hết hạn",
        403: "Không có quyền truy cập",
        404: "Không tìm thấy dữ liệu",
        409: "Dữ liệu đã tồn tại",
        422: "Dữ liệu không hợp lệ",
        500: "Lỗi hệ thống",
      };
      return statusMessages[status] || `Lỗi ${status}`;
    }

    // Network error
    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return "Kết nối quá hạn, vui lòng kiểm tra mạng";
      }
      return "Mất kết nối máy chủ";
    }
  }

  // Fallback to error message
  return error.message || "Đã có lỗi xảy ra";
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // Extract user-friendly error message
  const errorMessage = useMemo(() => getErrorMessage(error), [error]);

  useEffect(() => {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    console.error("Global error caught:", error);

    // You can send to error tracking service here
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorFallback
          error={error}
          reset={reset}
          title="Ứng dụng gặp sự cố"
          description={
            errorMessage ||
            "Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang hoặc liên hệ bộ phận kỹ thuật nếu lỗi tiếp diễn."
          }
          showHomeButton={true}
        />
      </body>
    </html>
  );
}
