import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "VND",
  locale = "vi-VN"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Thêm timestamp vào URL ảnh để tránh browser caching
 * 
 * @param url URL gốc của ảnh
 * @returns URL đã thêm query param ?t=...
 * 
 * @example
 * getImageUrlWithTimestamp("https://example.com/image.jpg")
 * // Returns: "https://example.com/image.jpg?t=1234567890"
 * 
 * getImageUrlWithTimestamp(null)
 * // Returns: null
 */
export function getImageUrlWithTimestamp(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return null;
  }

  // Nếu là data:image (base64) hoặc blob: thì không cần thêm timestamp
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  // Nếu URL đã có tham số query thì dùng &, ngược lại dùng ?
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${new Date().getTime()}`;
}