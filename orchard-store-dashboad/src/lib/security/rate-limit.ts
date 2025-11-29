/**
 * Rate Limiting Utilities
 *
 * Chống brute-force attack bằng cách:
 * - Track số lần đăng nhập sai
 * - Hiển thị captcha sau 3 lần sai
 * - Khóa submit sau 5 lần sai trong 5 phút
 */

import { logger } from "@/lib/logger";

const RATE_LIMIT_KEY = "orchard_login_attempts";
const RATE_LIMIT_LOCK_KEY = "orchard_login_locked_until";

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  email?: string;
}

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 phút
const CAPTCHA_THRESHOLD = 3; // Sau 3 lần sai → hiện captcha
const LOCK_THRESHOLD = 5; // Sau 5 lần sai → khóa

/**
 * Lấy số lần đăng nhập sai
 */
export function getFailedAttempts(email?: string): LoginAttempt {
  if (typeof window === "undefined") {
    return { count: 0, lastAttempt: 0 };
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      return { count: 0, lastAttempt: 0 };
    }

    const attempts: LoginAttempt = JSON.parse(stored);

    // Reset nếu là email khác hoặc quá 1 giờ
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (
      attempts.email &&
      email &&
      attempts.email.toLowerCase() !== email.toLowerCase()
    ) {
      return { count: 0, lastAttempt: 0 };
    }

    if (attempts.lastAttempt < oneHourAgo) {
      return { count: 0, lastAttempt: 0 };
    }

    return attempts;
  } catch {
    return { count: 0, lastAttempt: 0 };
  }
}

/**
 * Tăng số lần đăng nhập sai
 */
export function incrementFailedAttempts(email?: string): LoginAttempt {
  if (typeof window === "undefined") {
    return { count: 0, lastAttempt: 0 };
  }

  const current = getFailedAttempts(email);
  const newAttempts: LoginAttempt = {
    count: current.count + 1,
    lastAttempt: Date.now(),
    email: email || current.email,
  };

  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newAttempts));

    // Nếu >= 5 lần sai → khóa trong 5 phút
    if (newAttempts.count >= LOCK_THRESHOLD) {
      const lockedUntil = Date.now() + LOCK_DURATION_MS;
      localStorage.setItem(RATE_LIMIT_LOCK_KEY, lockedUntil.toString());
    }
  } catch (error) {
    logger.warn("Failed to save rate limit", error);
  }

  return newAttempts;
}

/**
 * Reset số lần đăng nhập sai (khi đăng nhập thành công)
 */
export function resetFailedAttempts(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
    localStorage.removeItem(RATE_LIMIT_LOCK_KEY);
  } catch (error) {
    logger.warn("Failed to reset rate limit", error);
  }
}

/**
 * Kiểm tra xem có bị khóa không
 */
export function isLocked(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const lockedUntil = localStorage.getItem(RATE_LIMIT_LOCK_KEY);
    if (!lockedUntil) return false;

    const lockedUntilMs = parseInt(lockedUntil, 10);
    if (isNaN(lockedUntilMs)) return false;

    const now = Date.now();
    if (now >= lockedUntilMs) {
      // Hết hạn khóa → xóa
      localStorage.removeItem(RATE_LIMIT_LOCK_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy thời gian còn lại bị khóa (milliseconds)
 */
export function getLockRemainingTime(): number {
  if (typeof window === "undefined") return 0;

  try {
    const lockedUntil = localStorage.getItem(RATE_LIMIT_LOCK_KEY);
    if (!lockedUntil) return 0;

    const lockedUntilMs = parseInt(lockedUntil, 10);
    if (isNaN(lockedUntilMs)) return 0;

    const now = Date.now();
    const remaining = lockedUntilMs - now;
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

/**
 * Kiểm tra xem có cần hiển thị captcha không
 */
export function requiresCaptcha(email?: string): boolean {
  const attempts = getFailedAttempts(email);
  return attempts.count >= CAPTCHA_THRESHOLD;
}

/**
 * Format thời gian còn lại (ví dụ: "4 phút 30 giây")
 */
export function formatLockTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} phút${seconds > 0 ? ` ${seconds} giây` : ""}`;
  }
  return `${seconds} giây`;
}
