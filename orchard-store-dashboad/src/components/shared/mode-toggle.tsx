"use client";

import { Lightbulb, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Chỉ render sau khi mounted để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = useCallback(() => {
    // Prevent multiple rapid clicks
    if (isAnimating) return;

    setIsAnimating(true);

    // Apply theme change with smooth transition
    const newTheme = isDark ? "light" : "dark";

    // Use requestAnimationFrame for smoother transition
    requestAnimationFrame(() => {
      setTheme(newTheme);
    });

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  }, [isDark, isAnimating, setTheme]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isAnimating}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        "transition-colors duration-200 ease-in-out",
        isDark ? "bg-primary/20 border-primary/40" : "bg-muted/40",
        isAnimating && "pointer-events-none"
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Toggle circle với animation mượt mà hơn */}
      <span
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-full shadow-md",
          "transition-transform duration-200 ease-in-out will-change-transform",
          isDark ? "translate-x-8 bg-black" : "translate-x-1 bg-white",
          isAnimating && "scale-105"
        )}
      >
        {/* Icon với animation tối ưu */}
        {isDark ? (
          <Moon
            className={cn(
              "h-4 w-4 text-white transition-transform duration-200 ease-in-out",
              isAnimating && "rotate-180 scale-110"
            )}
          />
        ) : (
          <Lightbulb
            className={cn(
              "h-4 w-4 text-gray-800 transition-transform duration-200 ease-in-out",
              isAnimating && "rotate-180 scale-110"
            )}
          />
        )}
      </span>

      {/* Background icons với animation fade mượt mà hơn */}
      <div className="absolute left-2 flex items-center justify-center">
        <Lightbulb
          className={cn(
            "h-4 w-4 transition-all duration-200 ease-in-out",
            isDark
              ? "scale-0 opacity-0 rotate-90"
              : "scale-100 opacity-100 rotate-0 text-foreground"
          )}
        />
      </div>
      <div className="absolute right-2 flex items-center justify-center">
        <Moon
          className={cn(
            "h-4 w-4 transition-all duration-200 ease-in-out",
            isDark
              ? "scale-100 opacity-100 rotate-0 text-foreground"
              : "scale-0 opacity-0 -rotate-90"
          )}
        />
      </div>
    </button>
  );
}
