/**
 * Generic Rate Limiting Utilities
 * 
 * Reusable rate limiting functions for various actions:
 * - Password reset
 * - Email change
 * - Form submissions
 * - API calls
 */

export interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  key: string;
}

export interface RateLimitState {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

/**
 * Check if rate limit is exceeded
 * @returns true if allowed, false if rate limit exceeded
 */
export function checkRateLimit(options: RateLimitOptions): boolean {
  if (typeof window === "undefined") return true;

  const { maxAttempts, windowMs, key } = options;
  const storageKey = `rate_limit_${key}`;

  try {
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      // First attempt - initialize
      const state: RateLimitState = {
        count: 1,
        resetAt: Date.now() + windowMs,
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    }

    const state: RateLimitState = JSON.parse(stored);

    // Check if window has expired
    if (Date.now() > state.resetAt) {
      // Reset window
      const newState: RateLimitState = {
        count: 1,
        resetAt: Date.now() + windowMs,
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      return true;
    }

    // Check if locked
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      return false; // Rate limit exceeded and locked
    }

    // Check if max attempts reached
    if (state.count >= maxAttempts) {
      // Lock for the remaining window time
      const newState: RateLimitState = {
        ...state,
        lockedUntil: state.resetAt,
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      return false; // Rate limit exceeded
    }

    // Increment count
    const newState: RateLimitState = {
      ...state,
      count: state.count + 1,
    };
    localStorage.setItem(storageKey, JSON.stringify(newState));
    return true;
  } catch (error) {
    // If parsing fails, allow the action (fail open)
    console.warn("Rate limit check failed:", error);
    return true;
  }
}

/**
 * Get remaining time until rate limit resets (in milliseconds)
 */
export function getRateLimitRemainingTime(options: RateLimitOptions): number {
  if (typeof window === "undefined") return 0;

  const { key } = options;
  const storageKey = `rate_limit_${key}`;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;

    const state: RateLimitState = JSON.parse(stored);
    const now = Date.now();

    // If locked, return lock remaining time
    if (state.lockedUntil && now < state.lockedUntil) {
      return state.lockedUntil - now;
    }

    // Otherwise return window remaining time
    if (now < state.resetAt) {
      return state.resetAt - now;
    }

    return 0;
  } catch {
    return 0;
  }
}

/**
 * Format remaining time to human-readable string
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} phút${seconds > 0 ? ` ${seconds} giây` : ""}`;
  }
  return `${seconds} giây`;
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`rate_limit_${key}`);
  } catch (error) {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn("Failed to reset rate limit:", error);
    }
  }
}

/**
 * React hook for rate limiting
 */
export function useRateLimit(options: RateLimitOptions) {
  const check = () => checkRateLimit(options);
  const getRemaining = () => getRateLimitRemainingTime(options);
  const reset = () => resetRateLimit(options.key);

  return {
    checkRateLimit: check,
    getRemainingTime: getRemaining,
    resetRateLimit: reset,
  };
}

