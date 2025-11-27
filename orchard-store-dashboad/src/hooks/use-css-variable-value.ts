"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Trả về giá trị hiện tại của CSS variable (ví dụ: --primary) và tự động cập nhật khi theme thay đổi.
 */
export function useCssVariableValue(
  variableName: string,
  fallback: string
): string {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const computedValue = getComputedStyle(root)
      .getPropertyValue(variableName)
      .trim();

    setValue(computedValue || fallback);
  }, [resolvedTheme, variableName, fallback]);

  return value;
}

