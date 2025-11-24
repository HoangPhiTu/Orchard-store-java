"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { FieldError } from "react-hook-form";

/**
 * FormField Component
 *
 * Wrapper component để hiển thị form field với error handling đẹp
 * - Highlight label khi có lỗi
 * - Hiển thị icon warning + message
 * - Auto focus vào field lỗi đầu tiên
 */
interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
  description?: string;
  labelExtra?: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className,
  description,
  labelExtra,
}: FormFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-medium transition-colors",
            hasError ? "text-red-600" : "text-slate-700"
          )}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {labelExtra}
      </div>

      {/* Input wrapper với error state */}
      <div className={cn("relative", hasError && "animate-pulse-error")}>
        {children}
      </div>

      {/* Error message với icon */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Description (không có lỗi) */}
      {!error && description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
