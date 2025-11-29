"use client";

import { useEffect, useMemo } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AxiosError } from "axios";
import { logger } from "@/lib/logger";

/**
 * Error Fallback Component
 *
 * Hiển thị UI đẹp khi có lỗi thay vì màn hình trắng
 * Dùng cho Error Boundaries
 */

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

/**
 * Extract user-friendly error message from error object
 */
function getErrorMessage(error: Error | undefined): string {
  if (!error) return "";

  // Check if it's an AxiosError
  const isAxiosError =
    error instanceof AxiosError ||
    (error &&
      typeof error === "object" &&
      "isAxiosError" in error &&
      (error as { isAxiosError?: boolean }).isAxiosError);

  if (isAxiosError) {
    const axiosError = error as AxiosError<unknown>;
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

export function ErrorFallback({
  error,
  reset,
  title = "Đã có lỗi xảy ra",
  description,
  showHomeButton = true,
}: ErrorFallbackProps) {
  // Extract user-friendly error message
  const errorMessage = useMemo(() => getErrorMessage(error), [error]);

  // Use error message as description if not provided
  const displayDescription =
    description ||
    errorMessage ||
    "Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.";

  // Log error (for debugging)
  useEffect(() => {
    if (error) {
      logger.error("Error caught by boundary:", error);
    }
  }, [error]);

  const handleReload = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {displayDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Thông tin lỗi (Development only):
              </p>
              <pre className="overflow-auto text-xs text-slate-600">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-500">
                    Stack trace
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-slate-500">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleReload}
            className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>

          {showHomeButton && (
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
