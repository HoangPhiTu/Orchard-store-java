"use client";

import { Sun, MoonStar, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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

  const handleToggle = () => {
    setIsAnimating(true);
    // Theme change ngay lập tức để transition chạy song song với animation (0.5s)
    setTheme(isDark ? "light" : "dark");
    // Reset animation state sau khi animation hoàn thành (0.5s)
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      style={{ transitionDuration: "500ms" }}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-card transition-all linear focus:outline-none",
        isDark ? "bg-primary/20 border-primary/40" : "bg-muted/40",
        isAnimating && "scale-105"
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Toggle circle với animation */}
      <span
        style={{ transitionDuration: "500ms" }}
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-all linear",
          isDark ? "translate-x-8 bg-black" : "translate-x-1 bg-white",
          isAnimating && "scale-110",
          "hover:scale-105"
        )}
      >
        {/* Icon với animation mượt hơn - Sparkles cho dark mode */}
        {isDark ? (
          <div className="relative">
            <MoonStar
              style={{ transitionDuration: "500ms" }}
              className={cn(
                "h-4 w-4 text-white transition-all linear",
                isAnimating && "rotate-180 scale-110"
              )}
            />
            <Sparkles
              style={{ transitionDuration: "500ms" }}
              className={cn(
                "absolute -top-1 -right-1 h-2 w-2 text-yellow-300 transition-all linear",
                isAnimating && "scale-150 rotate-180"
              )}
            />
          </div>
        ) : (
          <Sun
            style={{ transitionDuration: "500ms" }}
            className={cn(
              "h-4 w-4 text-gray-800 transition-all linear",
              isAnimating && "rotate-180 scale-110"
            )}
          />
        )}
      </span>

      {/* Background icons với animation fade mượt hơn */}
      <div className="absolute left-2 flex items-center justify-center">
        <Sun
          style={{ transitionDuration: "500ms" }}
          className={cn(
            "h-4 w-4 transition-all linear",
            isDark
              ? "scale-0 opacity-0 rotate-90"
              : "scale-100 opacity-100 rotate-0 text-foreground"
          )}
        />
      </div>
      <div className="absolute right-2 flex items-center justify-center">
        <MoonStar
          style={{ transitionDuration: "500ms" }}
          className={cn(
            "h-4 w-4 transition-all linear",
            isDark
              ? "scale-100 opacity-100 rotate-0 text-foreground"
              : "scale-0 opacity-0 -rotate-90"
          )}
        />
      </div>
    </button>
  );
}
