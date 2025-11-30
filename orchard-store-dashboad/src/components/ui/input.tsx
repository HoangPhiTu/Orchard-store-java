"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 focus:text-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border",
          className
        )}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
