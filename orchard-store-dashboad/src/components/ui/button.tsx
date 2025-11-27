"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none ring-offset-background";

const variants = {
  // Nút chính (ví dụ: Tạo mới, Cập nhật) - Rất nổi bật với shadow mạnh và border đậm
  default:
    "bg-primary text-primary-foreground font-bold hover:bg-primary/90 active:bg-primary/95 shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ring-2 ring-primary/30 border-2 border-primary/40 hover:ring-primary/40 hover:border-primary/50",
  // Nút phụ/Hủy – tối giản, border mỏng nhất
  outline:
    "border border-border/20 bg-card text-muted-foreground font-medium hover:bg-muted/40 hover:text-foreground hover:border-border/30 transition-all duration-200 shadow-sm",
  ghost: "bg-transparent text-foreground hover:bg-muted/50 transition-all duration-200",
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
