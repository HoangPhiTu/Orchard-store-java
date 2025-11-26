"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border border-dashed border-slate-700 bg-slate-900 text-white",
  secondary:
    "border border-dashed border-slate-200 bg-slate-100 text-slate-600",
  success:
    "border border-dashed border-indigo-200 bg-indigo-50 text-indigo-600",
  warning:
    "border border-dashed border-amber-200 bg-amber-50 text-amber-600",
  danger: "border border-dashed border-red-200 bg-red-50 text-red-600",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
