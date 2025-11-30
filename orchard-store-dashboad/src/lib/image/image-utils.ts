/**
 * Image Management Utilities
 * 
 * Reusable utilities for image management across all entities (Users, Brands, Categories, etc.)
 * Implements best practices from IMAGE_MANAGEMENT_STRATEGY.md
 */

/**
 * Entity types that support image upload
 */
export type ImageEntityType = "users" | "brands" | "categories" | "products" | "others";

/**
 * Generate folder path with date partitioning
 * Format: {entityType}/YYYY/MM/DD
 * 
 * @param entityType - Entity type (users, brands, categories, etc.)
 * @returns Folder path with date partitioning
 * 
 * @example
 * getImageFolder("users") // "users/2024/11/29"
 * getImageFolder("categories") // "categories/2024/11/29"
 */
export function getImageFolder(entityType: ImageEntityType): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${entityType}/${year}/${month}/${day}`;
}

/**
 * Extract entity type from image URL
 * 
 * @param imageUrl - Full image URL
 * @returns Entity type or null if cannot determine
 * 
 * @example
 * extractEntityTypeFromUrl("http://minio:9000/bucket/users/2024/11/29/uuid.jpg")
 * // Returns: "users"
 */
export function extractEntityTypeFromUrl(imageUrl: string): ImageEntityType | null {
  if (!imageUrl) return null;

  // Extract path from URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  // Find entity type (should be first part after bucket name)
  // Format: /bucket/{entityType}/YYYY/MM/DD/{uuid}.ext
  const entityTypes: ImageEntityType[] = ["users", "brands", "categories", "products", "others"];
  
  for (const type of entityTypes) {
    if (pathParts.includes(type)) {
      return type;
    }
  }

  return null;
}

/**
 * Extract object key from full image URL
 * 
 * @param imageUrl - Full image URL
 * @returns Object key (path in bucket)
 * 
 * @example
 * extractObjectKey("http://minio:9000/orchard-bucket/users/2024/11/29/uuid.jpg")
 * // Returns: "users/2024/11/29/uuid.jpg"
 */
export function extractObjectKey(imageUrl: string): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Remove bucket name (first part)
    // Format: /bucket/{entityType}/YYYY/MM/DD/{uuid}.ext
    if (pathParts.length < 2) return null;
    
    // Return everything after bucket name
    return pathParts.slice(1).join("/");
  } catch {
    // If URL parsing fails, try to extract from string
    const match = imageUrl.match(/\/[^\/]+\/(.+)$/);
    return match ? match[1] : null;
  }
}

/**
 * Generate unique filename with UUID
 * 
 * @param originalFileName - Original file name
 * @returns Unique filename with UUID
 * 
 * @example
 * generateImageFileName("avatar.jpg") // "550e8400-e29b-41d4-a716-446655440000.jpg"
 */
export function generateImageFileName(originalFileName: string): string {
  // Generate UUID v4
  const uuid = crypto.randomUUID();
  
  // Get extension from original file
  const extension = originalFileName.split(".").pop()?.toLowerCase() || "jpg";
  
  return `${uuid}.${extension}`;
}

/**
 * Validate image URL format
 * 
 * @param imageUrl - Image URL to validate
 * @returns true if URL is valid
 */
export function isValidImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  
  try {
    const url = new URL(imageUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

