"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background";

const variants: Record<string, string> = {
  default: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  outline:
    "border border-input bg-transparent text-foreground hover:bg-emerald-50",
};

type Variant = keyof typeof variants;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
