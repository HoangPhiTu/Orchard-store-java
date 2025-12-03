"use client";

import { cn } from "@/lib/utils";
import type { Concentration } from "@/types/concentration.types";

interface ConcentrationDisplayProps {
  concentration: Concentration;
  /**
   * Variant hiển thị:
   * - "full": Hiển thị đầy đủ với style phân cấp (Eau de Toilette (EDT))
   * - "short": Chỉ hiển thị acronym (EDT) - dùng cho Product Card nhỏ
   * - "name-only": Chỉ hiển thị tên (Eau de Toilette)
   */
  variant?: "full" | "short" | "name-only";
  className?: string;
}

/**
 * Component hiển thị tên nồng độ với style đẹp
 *
 * @example
 * <ConcentrationDisplay
 *   concentration={concentration}
 *   variant="full"
 * />
 */
export function ConcentrationDisplay({
  concentration,
  variant = "full",
  className,
}: ConcentrationDisplayProps) {
  // Variant: short - chỉ hiển thị acronym (dùng cho Product Card)
  if (variant === "short") {
    return (
      <span
        className={cn("text-xs font-medium text-muted-foreground", className)}
      >
        {concentration.acronym || concentration.name}
      </span>
    );
  }

  // Variant: name-only - chỉ hiển thị tên
  if (variant === "name-only") {
    return (
      <span className={cn("font-medium text-foreground", className)}>
        {concentration.name}
      </span>
    );
  }

  // Variant: full - hiển thị đầy đủ với style phân cấp
  // Sử dụng displayName từ backend nếu có, nếu không thì tự tính toán
  const displayName =
    concentration.displayName ||
    (concentration.acronym &&
    concentration.acronym.trim() !== "" &&
    concentration.acronym.trim() !== concentration.name.trim()
      ? `${concentration.name} (${concentration.acronym})`
      : concentration.name);

  // Nếu có acronym và khác với name, hiển thị với style phân cấp
  if (
    concentration.acronym &&
    concentration.acronym.trim() !== "" &&
    concentration.acronym.trim() !== concentration.name.trim()
  ) {
    return (
      <span className={cn("font-medium text-foreground", className)}>
        {concentration.name}{" "}
        <span className="text-xs text-muted-foreground font-normal">
          ({concentration.acronym})
        </span>
      </span>
    );
  }

  // Nếu không có acronym hoặc acronym giống name, chỉ hiển thị name
  return (
    <span className={cn("font-medium text-foreground", className)}>
      {concentration.name}
    </span>
  );
}
