/**
 * Helper functions for Attribute management
 */

/**
 * Generate slug from attribute name
 * Converts to lowercase, removes Vietnamese diacritics, replaces spaces with hyphens
 */
export function generateAttributeKey(name: string): string {
  if (!name || name.trim() === "") return "";

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

