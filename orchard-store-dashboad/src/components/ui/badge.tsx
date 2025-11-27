"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "border border-dashed border-border bg-muted text-foreground",
  secondary:
    "border border-dashed border-border/70 bg-card text-muted-foreground",
  success:
    "border border-dashed border-success/60 bg-card text-success",
  warning:
    "border border-dashed border-warning/60 bg-card text-warning",
  danger:
    "border border-dashed border-destructive/60 bg-card text-destructive",
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
