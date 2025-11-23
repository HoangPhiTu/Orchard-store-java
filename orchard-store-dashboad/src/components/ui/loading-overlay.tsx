"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingOverlay Component
 *
 * Hiển thị lớp phủ mờ khi form đang submit
 * Ngăn user sửa dữ liệu trong lúc đang gửi
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Đang xử lý...",
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}
