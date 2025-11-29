/**
 * Simple Validation Utilities
 */

/**
 * Sanitize input string by removing potentially dangerous content
 */
export const sanitizeInput = (input: string | number | undefined): string => {
  if (input === undefined || input === null) return "";

  const stringValue = String(input);

  // Basic sanitization
  return stringValue
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript protocols
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data URIs
    .replace(/vbscript:/gi, "") // Remove VBScript
    .replace(/file:/gi, ""); // Remove file protocols
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Safe string length check
 */
export const safeStringLength = (
  str: string | undefined,
  maxLength: number
): string => {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength) : str;
};

/**
 * Safe numeric conversion
 */
export const safeNumber = (
  value: unknown,
  defaultValue: number = 0
): number => {
  if (value === null || value === undefined) return defaultValue;

  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Safe boolean conversion
 */
export const safeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes";
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return Boolean(value);
};
