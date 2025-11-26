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
          "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition-colors placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-700 disabled:border-slate-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
