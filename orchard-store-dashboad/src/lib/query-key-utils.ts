/**
 * Utilities for normalizing query keys to ensure consistent caching and deduplication
 */

/**
 * Normalize filter object to ensure consistent query keys
 * Removes undefined values, trims strings, and ensures consistent ordering
 */
export function normalizeQueryKey<T extends Record<string, unknown>>(
  filters?: T
): T | undefined {
  if (!filters) return undefined;

  const normalized = {} as T;
  let hasValues = false;

  // Sort keys to ensure consistent ordering
  const sortedKeys = Object.keys(filters).sort();

  for (const key of sortedKeys) {
    const value = filters[key];

    // Skip undefined and null values
    if (value === undefined || value === null) continue;

    // Trim strings
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        normalized[key as keyof T] = trimmed as T[keyof T];
        hasValues = true;
      }
    } else {
      normalized[key as keyof T] = value;
      hasValues = true;
    }
  }

  return hasValues ? normalized : undefined;
}

/**
 * Create a consistent query key from base key and filters
 */
export function createQueryKey(
  baseKey: readonly unknown[],
  ...parts: (unknown | undefined)[]
): readonly unknown[] {
  const filteredParts = parts.filter((part) => part !== undefined);
  return [...baseKey, ...filteredParts] as const;
}

/**
 * Normalize pagination filters (page, size)
 * Ensures page is always 0-based and size is positive
 */
export function normalizePagination(
  page?: number,
  size?: number
): { page: number; size: number } | undefined {
  if (page === undefined && size === undefined) return undefined;

  const normalizedPage = page !== undefined ? Math.max(0, page) : 0;
  const normalizedSize = size !== undefined ? Math.max(1, size) : 15;

  return { page: normalizedPage, size: normalizedSize };
}

