"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none ring-offset-background";

const variants = {
  // Nút chính (ví dụ: Tạo mới, Cập nhật)
  default:
    "bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200",
  // Nút phụ/Hủy – nền trắng, chữ đen rất đậm
  outline:
    "border border-slate-300 bg-white text-black font-bold hover:bg-slate-100 hover:text-black hover:border-slate-500",
  ghost: "bg-transparent text-foreground hover:bg-muted/50",
} as const;

const sizes = {
  default: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  icon: "h-9 w-9",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Logic hiển thị Spinner khi loading */}
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
